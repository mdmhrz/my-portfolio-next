import { Readable } from "stream";
import type { drive_v3 } from "googleapis";
import { getDriveClient } from "@/modules/gmail/service/client";
import type { StorageProvider } from "./types";

// Every upload lands under one app-owned root folder instead of scattering
// files across the connected account's Drive root — see
// file-manager-plan.md Phase 9. No manual Drive setup required: the root
// and every subfolder are found-or-created automatically on first use.
const ROOT_FOLDER_NAME = process.env.DRIVE_ROOT_FOLDER_NAME || "Portfolio Dashboard";

function escapeDriveQueryValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

// Finds a folder named `name` directly under `parentId` (Drive's own root if
// omitted), creating it if it doesn't exist. The `drive.file` OAuth scope
// only lets `files.list` see folders this app itself created (or the user
// explicitly opened), which is exactly what we want here — we're always
// looking for a folder this same app created on a previous call.
async function findOrCreateFolder(drive: drive_v3.Drive, name: string, parentId?: string): Promise<string> {
  const parentClause = parentId ? `'${parentId}' in parents` : `'root' in parents`;
  const q = `name='${escapeDriveQueryValue(name)}' and mimeType='application/vnd.google-apps.folder' and trashed=false and ${parentClause}`;
  const existing = await drive.files.list({ q, fields: "files(id)", spaces: "drive", pageSize: 1 });
  const existingId = existing.data.files?.[0]?.id;
  if (existingId) return existingId;

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      ...(parentId ? { parents: [parentId] } : {}),
    },
    fields: "id",
  });
  if (!created.data.id) throw new Error("Failed to create Drive folder");
  return created.data.id;
}

// Resolves (creating as needed) a nested folder chain under the app's root
// Drive folder — e.g. ["Vault"] or ["File Manager", "Clients", "ABC Ltd"],
// mirroring a File Manager file's actual location in the app.
async function resolveDriveFolderPath(drive: drive_v3.Drive, segments: string[]): Promise<string> {
  let parentId = await findOrCreateFolder(drive, ROOT_FOLDER_NAME);
  for (const segment of segments) {
    parentId = await findOrCreateFolder(drive, segment, parentId);
  }
  return parentId;
}

export const driveProvider: StorageProvider = {
  // `folder` is a "/"-joined path relative to the app's root Drive folder
  // (e.g. "Vault" or "File Manager/Clients/ABC Ltd"), resolved/created here.
  async upload({ buffer, fileName, mimeType, folder }) {
    const { drive } = await getDriveClient();
    const parentId = await resolveDriveFolderPath(drive, folder.split("/").filter(Boolean));

    const res = await drive.files.create({
      requestBody: { name: fileName, parents: [parentId] },
      media: { mimeType, body: Readable.from(buffer) },
      fields: "id",
    });

    if (!res.data.id) throw new Error("Drive upload did not return a file id");
    return { providerFileId: res.data.id };
  },

  async delete(providerFileId) {
    const { drive } = await getDriveClient();
    await drive.files.delete({ fileId: providerFileId });
  },

  // No true presigning for Drive — hand back a same-origin proxy path
  // (see GET /api/admin/files/[id]/download) that streams the file
  // server-side, so the client never sees a raw Drive link or this
  // account's access token.
  async getSignedUrl({ id }) {
    return `/api/admin/files/${id}/download`;
  },
};
