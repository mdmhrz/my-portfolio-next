'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { FolderOpen, UploadCloud } from 'lucide-react';
import {
  usePortfolioStore,
  FileManagerFolderData,
  FileManagerFileData,
  FolderTreeItem,
} from '@/store/usePortfolioStore';
import { PageHeader } from '@/components/admin/PageHeader';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { EmptyState } from '@/components/admin/EmptyState';
import { FolderTreeSidebar } from './FolderTreeSidebar';
import { FileManagerStorageStat } from './FileManagerStorageStat';
import { FileManagerToolbar } from './FileManagerToolbar';
import { FileManagerBulkBar } from './FileManagerBulkBar';
import { FileManagerBreadcrumb } from './FileManagerBreadcrumb';
import { FileManagerGrid } from './FileManagerGrid';
import { RecentFiles } from './RecentFiles';
import { FileManagerSkeletonGrid } from './FileManagerSkeleton';
import { CreateFolderDialog } from './CreateFolderDialog';
import { RenameDialog } from './RenameDialog';
import { MoveDialog } from './MoveDialog';
import { FilePreviewModal } from './FilePreviewModal';
import { ShareDialog } from './ShareDialog';
import { FileManagerContextMenu, ContextMenuState } from './FileManagerContextMenu';
import {
  ContextMenuTarget,
  SortBy,
  ViewMode,
  collectDescendantIds,
  parseFolderDropId,
  parseItemId,
  fileItemId,
  folderItemId,
} from './file-manager-constants';

export function FileManagerPageContents() {
  const {
    fetchFolderTree,
    fetchFolderContents,
    createFolder,
    renameFolder,
    moveFolder,
    deleteFolder,
    uploadFileManagerFile,
    renameFile,
    moveFile,
    deleteFile,
    backupFileToDrive,
    getFileUrl,
  } = usePortfolioStore();

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<{ id: string; name: string }[]>([]);
  const [subfolders, setSubfolders] = useState<FileManagerFolderData[]>([]);
  const [files, setFiles] = useState<FileManagerFileData[]>([]);
  const [tree, setTree] = useState<FolderTreeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [isOsDragOver, setIsOsDragOver] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<ContextMenuTarget | null>(null);
  const [moveTarget, setMoveTarget] = useState<ContextMenuTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContextMenuTarget | null>(null);
  const [bulkMoveOpen, setBulkMoveOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileManagerFileData | null>(null);
  const [shareTarget, setShareTarget] = useState<FileManagerFileData | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [recentFilesVersion, setRecentFilesVersion] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(
    async (folderId: string | null) => {
      setLoading(true);
      try {
        const result = await fetchFolderContents(folderId);
        setSubfolders(result.subfolders);
        setFiles(result.files);
        setBreadcrumb(result.breadcrumb);
      } catch {
        toast.error('Failed to load this folder.');
      } finally {
        setLoading(false);
        setRecentFilesVersion((v) => v + 1);
      }
    },
    [fetchFolderContents]
  );

  const refreshTree = useCallback(async () => {
    const t = await fetchFolderTree();
    setTree(t);
  }, [fetchFolderTree]);

  // Inlined as a promise chain (not a call to the `refresh`/`refreshTree`
  // callbacks below) so every setState happens inside a .then/.catch/.finally
  // callback rather than synchronously in the effect body — `loading`'s
  // initial value covers the first mount, and `navigate()` (an event
  // handler, not an effect) sets it true again before subsequent switches.
  useEffect(() => {
    let cancelled = false;
    fetchFolderContents(currentFolderId)
      .then((result) => {
        if (cancelled) return;
        setSubfolders(result.subfolders);
        setFiles(result.files);
        setBreadcrumb(result.breadcrumb);
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load this folder.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentFolderId, fetchFolderContents]);

  useEffect(() => {
    let cancelled = false;
    fetchFolderTree().then((t) => {
      if (!cancelled) setTree(t);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchFolderTree]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, []);

  const navigate = (id: string | null) => {
    setLoading(true);
    setCurrentFolderId(id);
    clearSelection();
  };

  // Drive-mirror rows are never independently browsable — same convention as
  // Vault attachments. Their presence only flips a source row's badge.
  const mirroredSourceIds = useMemo(
    () => new Set(files.filter((f) => f.provider === 'drive' && f.mirrorOfId).map((f) => f.mirrorOfId!)),
    [files]
  );
  const visibleFiles = useMemo(() => files.filter((f) => f.provider === 'r2'), [files]);

  const filteredSubfolders = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q ? subfolders.filter((f) => f.name.toLowerCase().includes(q)) : subfolders;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [subfolders, search]);

  const filteredFiles = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q ? visibleFiles.filter((f) => f.name.toLowerCase().includes(q)) : visibleFiles;
    return [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'size') return (b.size ?? 0) - (a.size ?? 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [visibleFiles, search, sortBy]);

  const isEmpty = !loading && filteredSubfolders.length === 0 && filteredFiles.length === 0;
  // Uses visibleFiles (r2 rows only), not raw files — a folder can still
  // hold an orphaned Drive-mirror row with nothing visible in it, and that
  // should read as "empty", not surface a "no search matches" message.
  const isTrulyEmptyFolder = !loading && subfolders.length === 0 && visibleFiles.length === 0;

  // --- Selection (single click select, double click open — see
  // file-manager-plan.md Phase 7). Shift = range over the current sort
  // order, ctrl/cmd = toggle one, plain click = replace selection.
  const orderedItemIds = useMemo(
    () => [...filteredSubfolders.map((f) => folderItemId(f.id)), ...filteredFiles.map((f) => fileItemId(f.id))],
    [filteredSubfolders, filteredFiles]
  );

  const handleSelect = (itemId: string, e: React.MouseEvent) => {
    if (e.shiftKey && lastSelectedId) {
      const from = orderedItemIds.indexOf(lastSelectedId);
      const to = orderedItemIds.indexOf(itemId);
      if (from !== -1 && to !== -1) {
        const [lo, hi] = from < to ? [from, to] : [to, from];
        setSelectedIds(new Set(orderedItemIds.slice(lo, hi + 1)));
        return;
      }
    }
    if (e.metaKey || e.ctrlKey) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(itemId)) next.delete(itemId);
        else next.add(itemId);
        return next;
      });
      setLastSelectedId(itemId);
      return;
    }
    setSelectedIds(new Set([itemId]));
    setLastSelectedId(itemId);
  };

  const selectedFileIds = useMemo(
    () => [...selectedIds].map(parseItemId).filter((p) => p?.type === 'file').map((p) => p!.id),
    [selectedIds]
  );
  const selectedFolderIds = useMemo(
    () => [...selectedIds].map(parseItemId).filter((p) => p?.type === 'folder').map((p) => p!.id),
    [selectedIds]
  );
  const singleSelectedFile = useMemo(
    () => (selectedIds.size === 1 && selectedFileIds.length === 1 ? files.find((f) => f.id === selectedFileIds[0]) ?? null : null),
    [selectedIds, selectedFileIds, files]
  );

  // Keyboard shortcuts — skip while typing in an input or while any dialog
  // is open, so Escape/Delete/Enter don't fight with normal form use.
  useEffect(() => {
    const anyDialogOpen =
      createFolderOpen || renameTarget || moveTarget || deleteTarget || bulkMoveOpen || bulkDeleteOpen || previewFile || shareTarget || contextMenu;

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (anyDialogOpen) return;

      if (e.key === 'Escape' && selectedIds.size > 0) {
        clearSelection();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0) {
        e.preventDefault();
        setBulkDeleteOpen(true);
      } else if (e.key === 'Enter' && selectedIds.size === 1) {
        const item = parseItemId([...selectedIds][0]);
        if (!item) return;
        if (item.type === 'folder') navigate(item.id);
        else {
          const file = files.find((f) => f.id === item.id);
          if (file) setPreviewFile(file);
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, createFolderOpen, renameTarget, moveTarget, deleteTarget, bulkMoveOpen, bulkDeleteOpen, previewFile, shareTarget, contextMenu, files]);

  // --- Upload ---
  const uploadFiles = async (fileList: File[]) => {
    if (!fileList.length) return;
    setUploading(true);
    try {
      for (const file of fileList) {
        await uploadFileManagerFile(file, currentFolderId);
      }
      toast.success(`${fileList.length} file${fileList.length > 1 ? 's' : ''} uploaded.`);
      refresh(currentFolderId);
    } catch {
      toast.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    e.target.value = '';
    uploadFiles(list);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      setIsOsDragOver(true);
    }
  };
  const handleDragLeave = () => setIsOsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes('Files')) return;
    e.preventDefault();
    setIsOsDragOver(false);
    uploadFiles(Array.from(e.dataTransfer.files));
  };

  // --- In-app drag-to-move (dnd-kit) ---
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (!overId.startsWith('dropfolder:')) return;
    const targetFolderId = parseFolderDropId(overId);

    if (activeId.startsWith('file:')) {
      const fileId = activeId.slice('file:'.length);
      const file = files.find((f) => f.id === fileId);
      if (!file || file.folderId === targetFolderId) return;
      try {
        await moveFile(fileId, targetFolderId);
        toast.success('File moved.');
        refresh(currentFolderId);
      } catch {
        toast.error('Failed to move file.');
      }
      return;
    }

    if (activeId.startsWith('folder:')) {
      const folderId = activeId.slice('folder:'.length);
      if (folderId === targetFolderId) return;
      try {
        await moveFolder(folderId, targetFolderId);
        toast.success('Folder moved.');
        refreshTree();
        refresh(currentFolderId);
      } catch {
        toast.error('Failed to move folder — it may already contain the destination.');
      }
    }
  };

  // --- Context menu actions ---
  const openContextMenu = (x: number, y: number, target: ContextMenuTarget) => setContextMenu({ x, y, target });
  const closeContextMenu = () => setContextMenu(null);

  const handlePreview = (target: ContextMenuTarget) => {
    closeContextMenu();
    if (target.type !== 'file') return;
    setPreviewFile(target.file);
  };

  const handleDownload = async (target: ContextMenuTarget) => {
    closeContextMenu();
    if (target.type !== 'file') return;
    try {
      const { url } = await getFileUrl(target.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Failed to get a download link.');
    }
  };

  const handleShare = (target: ContextMenuTarget) => {
    closeContextMenu();
    if (target.type !== 'file') return;
    setShareTarget(target.file);
  };

  const handleCopyToDrive = async (target: ContextMenuTarget) => {
    closeContextMenu();
    if (target.type !== 'file') return;
    try {
      await backupFileToDrive(target.id);
      toast.success('Backed up to Drive.');
      refresh(currentFolderId);
    } catch {
      toast.error('Failed to back up to Drive.');
    }
  };

  const handleRenameStart = (target: ContextMenuTarget) => {
    closeContextMenu();
    setRenameTarget(target);
  };
  const handleMoveStart = (target: ContextMenuTarget) => {
    closeContextMenu();
    setMoveTarget(target);
  };
  const handleDeleteStart = (target: ContextMenuTarget) => {
    closeContextMenu();
    setDeleteTarget(target);
  };

  const submitRename = async (name: string) => {
    if (!renameTarget) return;
    try {
      if (renameTarget.type === 'folder') {
        await renameFolder(renameTarget.id, name);
        refreshTree();
      } else {
        await renameFile(renameTarget.id, name);
      }
      toast.success('Renamed.');
      refresh(currentFolderId);
    } catch {
      toast.error('Rename failed — that name may already be taken here.');
      throw new Error('rename failed');
    }
  };

  const moveDisabledIds = useMemo(() => {
    if (moveTarget?.type === 'folder') return collectDescendantIds(tree, moveTarget.id);
    return undefined;
  }, [moveTarget, tree]);

  const bulkMoveDisabledIds = useMemo(() => {
    const set = new Set<string>();
    selectedFolderIds.forEach((id) => collectDescendantIds(tree, id).forEach((d) => set.add(d)));
    return set;
  }, [selectedFolderIds, tree]);

  const submitMove = async (targetFolderId: string | null) => {
    if (!moveTarget) return;
    try {
      if (moveTarget.type === 'folder') {
        await moveFolder(moveTarget.id, targetFolderId);
        refreshTree();
      } else {
        await moveFile(moveTarget.id, targetFolderId);
      }
      toast.success('Moved.');
      refresh(currentFolderId);
    } catch {
      toast.error('Move failed.');
      throw new Error('move failed');
    }
  };

  const submitBulkMove = async (targetFolderId: string | null) => {
    try {
      for (const id of selectedFileIds) await moveFile(id, targetFolderId);
      for (const id of selectedFolderIds) await moveFolder(id, targetFolderId);
      if (selectedFolderIds.length) refreshTree();
      toast.success('Moved.');
      clearSelection();
      refresh(currentFolderId);
    } catch {
      toast.error('Move failed.');
      throw new Error('bulk move failed');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'folder') {
        await deleteFolder(deleteTarget.id);
        refreshTree();
      } else {
        await deleteFile(deleteTarget.id);
      }
      toast.success('Deleted.');
      setDeleteTarget(null);
      refresh(currentFolderId);
    } catch {
      toast.error('Failed to delete.');
    } finally {
      setDeleting(false);
    }
  };

  const confirmBulkDelete = async () => {
    setDeleting(true);
    try {
      for (const id of selectedFileIds) await deleteFile(id);
      for (const id of selectedFolderIds) await deleteFolder(id);
      if (selectedFolderIds.length) refreshTree();
      toast.success('Deleted.');
      setBulkDeleteOpen(false);
      clearSelection();
      refresh(currentFolderId);
    } catch {
      toast.error('Failed to delete selected items.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      await createFolder(name, currentFolderId);
      toast.success('Folder created.');
      refreshTree();
      refresh(currentFolderId);
    } catch {
      toast.error('Failed to create folder — that name may already be taken here.');
      throw new Error('create failed');
    }
  };

  const bulkCount = selectedIds.size;
  const bulkCanSingleFileAction = bulkCount === 1 && singleSelectedFile !== null;
  const bulkCanShare = bulkCanSingleFileAction;
  const bulkCanCopyToDrive = bulkCanSingleFileAction && !mirroredSourceIds.has(singleSelectedFile!.id);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        <PageHeader
          title="File Manager"
          description="Organize every document in folders — backed by the same R2/Drive storage as the rest of the dashboard."
        />

        <div className="grid min-w-0 gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="min-w-0 lg:sticky lg:top-4 lg:self-start">
            <div className="hidden lg:block">
              <div className="rounded-xl border border-border bg-muted/20 p-3">
                <FolderTreeSidebar tree={tree} currentFolderId={currentFolderId} onNavigate={navigate} />
              </div>
              <FileManagerStorageStat />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              <MobileFolderStrip tree={tree} currentFolderId={currentFolderId} onNavigate={navigate} />
            </div>
          </aside>

          <div
            className="relative min-w-0 space-y-4"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isOsDragOver && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-primary bg-primary/5">
                <div className="flex flex-col items-center gap-2 text-primary">
                  <UploadCloud className="h-8 w-8" />
                  <p className="text-sm font-medium">Drop to upload here</p>
                </div>
              </div>
            )}

            <FileManagerBreadcrumb crumbs={breadcrumb} onNavigate={navigate} />

            {bulkCount > 0 ? (
              <FileManagerBulkBar
                count={bulkCount}
                canDownload={bulkCanSingleFileAction}
                canShare={bulkCanShare}
                canCopyToDrive={bulkCanCopyToDrive}
                onMove={() => setBulkMoveOpen(true)}
                onDelete={() => setBulkDeleteOpen(true)}
                onDownload={() => singleSelectedFile && handleDownload({ type: 'file', id: singleSelectedFile.id, name: singleSelectedFile.name, file: singleSelectedFile, mirrored: mirroredSourceIds.has(singleSelectedFile.id) })}
                onShare={() => singleSelectedFile && handleShare({ type: 'file', id: singleSelectedFile.id, name: singleSelectedFile.name, file: singleSelectedFile, mirrored: mirroredSourceIds.has(singleSelectedFile.id) })}
                onCopyToDrive={() => singleSelectedFile && handleCopyToDrive({ type: 'file', id: singleSelectedFile.id, name: singleSelectedFile.name, file: singleSelectedFile, mirrored: mirroredSourceIds.has(singleSelectedFile.id) })}
                onDeselect={clearSelection}
              />
            ) : (
              <FileManagerToolbar
                search={search}
                onSearchChange={setSearch}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onNewFolder={() => setCreateFolderOpen(true)}
                onUploadClick={() => fileInputRef.current?.click()}
                uploading={uploading}
              />
            )}
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFileInputChange} />

            {loading ? (
              <FileManagerSkeletonGrid />
            ) : isTrulyEmptyFolder ? (
              <EmptyState
                icon={FolderOpen}
                title="This folder is empty"
                description="Drag files in, or use Upload / New Folder above to get started."
              />
            ) : isEmpty ? (
              <EmptyState icon={FolderOpen} title="No matches" description="Nothing here matches your search." />
            ) : (
              <FileManagerGrid
                subfolders={filteredSubfolders}
                files={filteredFiles}
                mirroredSourceIds={mirroredSourceIds}
                viewMode={viewMode}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onClearSelection={clearSelection}
                onNavigateFolder={navigate}
                onOpenFile={setPreviewFile}
                onContextMenu={openContextMenu}
              />
            )}

            {currentFolderId === null && !search.trim() && !loading && (
              <RecentFiles version={recentFilesVersion} onOpenFile={setPreviewFile} onContextMenu={openContextMenu} />
            )}
          </div>
        </div>

        <CreateFolderDialog open={createFolderOpen} onOpenChange={setCreateFolderOpen} onCreate={handleCreateFolder} />

        <RenameDialog
          key={renameTarget ? `${renameTarget.type}-${renameTarget.id}` : 'rename-closed'}
          open={renameTarget !== null}
          onOpenChange={(o) => !o && setRenameTarget(null)}
          initialName={renameTarget?.name ?? ''}
          label={renameTarget?.type === 'folder' ? 'Rename folder' : 'Rename file'}
          onSubmit={submitRename}
        />

        <MoveDialog
          open={moveTarget !== null}
          onOpenChange={(o) => !o && setMoveTarget(null)}
          title={moveTarget?.type === 'folder' ? 'Move folder' : 'Move file'}
          tree={tree}
          disabledIds={moveDisabledIds}
          onSubmit={submitMove}
        />

        <MoveDialog
          open={bulkMoveOpen}
          onOpenChange={setBulkMoveOpen}
          title={`Move ${bulkCount} item${bulkCount === 1 ? '' : 's'}`}
          tree={tree}
          disabledIds={bulkMoveDisabledIds}
          onSubmit={submitBulkMove}
        />

        <DeleteDialog
          open={deleteTarget !== null}
          onOpenChange={(o) => !o && setDeleteTarget(null)}
          onConfirm={confirmDelete}
          loading={deleting}
          title={deleteTarget?.type === 'folder' ? 'Delete folder' : 'Delete file'}
          description={
            deleteTarget?.type === 'folder'
              ? `This permanently deletes "${deleteTarget.name}" and everything inside it (${deleteTarget.subfolderCount} subfolder${deleteTarget.subfolderCount === 1 ? '' : 's'}, ${deleteTarget.fileCount} file${deleteTarget.fileCount === 1 ? '' : 's'} at this level, plus anything nested deeper). This action cannot be undone.`
              : 'This permanently removes the file. This action cannot be undone.'
          }
        />

        <DeleteDialog
          open={bulkDeleteOpen}
          onOpenChange={setBulkDeleteOpen}
          onConfirm={confirmBulkDelete}
          loading={deleting}
          title={`Delete ${bulkCount} item${bulkCount === 1 ? '' : 's'}`}
          description={`This permanently deletes the selected ${bulkCount} item${bulkCount === 1 ? '' : 's'}${selectedFolderIds.length ? ', including everything inside any selected folders' : ''}. This action cannot be undone.`}
        />

        <FilePreviewModal
          file={previewFile}
          onOpenChange={(o) => !o && setPreviewFile(null)}
          onDownload={(file) => handleDownload({ type: 'file', id: file.id, name: file.name, file, mirrored: mirroredSourceIds.has(file.id) })}
        />

        <ShareDialog
          key={shareTarget?.id ?? 'share-closed'}
          file={shareTarget}
          onOpenChange={(o) => !o && setShareTarget(null)}
          onChanged={() => refresh(currentFolderId)}
        />

        <FileManagerContextMenu
          state={contextMenu}
          onClose={closeContextMenu}
          onPreview={handlePreview}
          onDownload={handleDownload}
          onShare={handleShare}
          onCopyToDrive={handleCopyToDrive}
          onRename={handleRenameStart}
          onMove={handleMoveStart}
          onDelete={handleDeleteStart}
        />
      </div>
    </DndContext>
  );
}

// Small horizontal-scroll folder strip for narrow screens — the dashboard
// shell already owns mobile bottom navigation (MobileSidebar), so this page
// only needs its own folder-switcher, not a second nav bar.
function MobileFolderStrip({
  tree,
  currentFolderId,
  onNavigate,
}: {
  tree: FolderTreeItem[];
  currentFolderId: string | null;
  onNavigate: (id: string | null) => void;
}) {
  const topLevel = tree.filter((f) => !f.parentId);
  return (
    <>
      <button
        type="button"
        onClick={() => onNavigate(null)}
        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${currentFolderId === null ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'}`}
      >
        Files
      </button>
      {topLevel.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onNavigate(f.id)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${currentFolderId === f.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'}`}
        >
          {f.name}
        </button>
      ))}
    </>
  );
}
