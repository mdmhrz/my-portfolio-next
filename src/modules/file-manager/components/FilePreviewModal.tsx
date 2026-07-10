'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Download, FileWarning } from 'lucide-react';
import { usePortfolioStore, FileManagerFileData } from '@/store/usePortfolioStore';
import { getFileIconCategory, FILE_ICON_MAP } from './file-manager-constants';

interface FilePreviewModalProps {
  file: FileManagerFileData | null;
  onOpenChange: (open: boolean) => void;
  onDownload: (file: FileManagerFileData) => void;
}

export function FilePreviewModal({ file, onOpenChange, onDownload }: FilePreviewModalProps) {
  return (
    <Dialog open={!!file} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {file && <FilePreviewBody key={file.id} file={file} onDownload={onDownload} />}
      </DialogContent>
    </Dialog>
  );
}

// Keyed by file.id from the parent, so switching files remounts this with
// fresh state instead of needing an effect to reset url/textContent/loading
// — every setState below lives inside a .then/.finally callback, never as a
// bare statement in the effect body.
function FilePreviewBody({ file, onDownload }: { file: FileManagerFileData; onDownload: (file: FileManagerFileData) => void }) {
  const { getFileUrl } = usePortfolioStore();
  const [url, setUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getFileUrl(file.id)
      .then(async ({ url: signedUrl }) => {
        if (cancelled) return;
        setUrl(signedUrl);
        if (file.mimeType.startsWith('text/')) {
          const res = await fetch(signedUrl);
          const text = await res.text();
          if (!cancelled) setTextContent(text.slice(0, 20000));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [file.id, file.mimeType, getFileUrl]);

  const Icon = FILE_ICON_MAP[getFileIconCategory(file.mimeType)];
  const isImage = file.mimeType.startsWith('image/');
  const isPdf = file.mimeType === 'application/pdf';
  const isText = file.mimeType.startsWith('text/');

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 truncate">
          <Icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{file.name}</span>
        </DialogTitle>
      </DialogHeader>

      <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-md border border-border bg-muted/20">
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : isImage && url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={file.name} className="max-h-[60vh] w-auto object-contain" />
        ) : isPdf && url ? (
          <iframe src={url} title={file.name} className="h-[60vh] w-full" />
        ) : isText && textContent !== null ? (
          <pre className="max-h-[60vh] w-full overflow-auto whitespace-pre-wrap p-4 text-xs text-foreground">{textContent}</pre>
        ) : (
          <div className="flex flex-col items-center gap-2 p-8 text-center text-muted-foreground">
            <FileWarning className="h-8 w-8" />
            <p className="text-sm">No preview available for this file type.</p>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onDownload(file)}>
          <Download className="mr-1.5 h-4 w-4" /> Download
        </Button>
      </DialogFooter>
    </>
  );
}
