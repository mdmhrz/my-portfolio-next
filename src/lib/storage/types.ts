// Both providers return only a providerFileId from upload() — never a public
// URL — because the underlying bucket/folder is always private. Reads go
// through getSignedUrl(), never a stored public link.
//
// getSignedUrl takes the FileAsset's own `id` alongside `providerFileId`
// because R2 and Drive can't both return a real presigned URL: R2 does
// (providerFileId is all it needs), but Drive has no equivalent — reads
// there have to go through a proxy route on our own server, which needs the
// FileAsset's id to build /api/admin/files/[id]/download. Threading `id`
// through the interface keeps both providers interchangeable to callers.
export interface StorageProvider {
  upload(params: {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
    folder: string;
  }): Promise<{ providerFileId: string }>;
  delete(providerFileId: string): Promise<void>;
  getSignedUrl(params: { id: string; providerFileId: string }, expiresInSeconds?: number): Promise<string>;
}
