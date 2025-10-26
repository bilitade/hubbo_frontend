import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface DocumentViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  onDownload: () => void;
}

export function DocumentViewerModal({
  open,
  onOpenChange,
  fileName,
  fileUrl,
  mimeType,
  onDownload,
}: DocumentViewerModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(100);
  
  const isImage = mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(fileName);
  const isText = mimeType?.includes('text') || /\.(txt|md|csv|json|xml|log|html|css|js|ts|py|java|c|cpp|h|sh|yaml|yml)$/i.test(fileName);
  const canPreview = isImage || isText;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  useEffect(() => {
    if (open && canPreview && fileUrl) {
      fetchAuthenticatedFile();
    }
    
    return () => {
      // Cleanup blob URL when modal closes or dependencies change
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fileUrl, canPreview]);

  const fetchAuthenticatedFile = async () => {
    setLoading(true);
    setError(false);
    setBlobUrl(null);
    setTextContent(null);
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(fileUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load file');
      }

      const blob = await response.blob();
      
      // For text files, read the content
      if (isText) {
        const text = await blob.text();
        setTextContent(text);
      } else {
        // For images and PDFs, create blob URL
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      }
    } catch (err) {
      console.error('Error loading file:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/30 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold truncate flex-1 pr-4">
            {fileName}
          </DialogTitle>
          <div className="flex gap-2 items-center">
            {/* Zoom controls for images */}
            {isImage && blobUrl && !loading && !error && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  title="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                  {zoom}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  title="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
              </>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {loading ? (
            <div className="flex items-center justify-center min-h-full py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary"></div>
                <p className="text-muted-foreground">Loading {isImage ? 'image' : 'file'}...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-full py-12">
              <div className="flex flex-col items-center gap-4 text-center px-4">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold mb-2">Failed to Load File</h3>
                <p className="text-muted-foreground mb-4">
                  Unable to display this file. Try downloading it instead.
                </p>
                <Button onClick={onDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              </div>
            </div>
          ) : isImage && blobUrl ? (
            <div className="flex items-center justify-center min-h-full p-4">
              <img
                src={blobUrl}
                alt={fileName}
                className="rounded-lg shadow-lg transition-all duration-200"
                style={{ 
                  maxWidth: `${zoom}%`,
                  height: 'auto',
                  objectFit: 'contain'
                }}
              />
            </div>
          ) : isText && textContent !== null ? (
            <div className="w-full h-full p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-h-[600px] overflow-auto border border-border">
                <pre className="text-sm font-mono whitespace-pre-wrap break-words leading-relaxed">
                  {textContent}
                </pre>
              </div>
              <div className="mt-2 p-2 bg-muted/50 rounded text-center">
                <p className="text-xs text-muted-foreground">
                  {fileName.endsWith('.md') ? '📝 Markdown' : 
                   fileName.endsWith('.json') ? '📋 JSON' :
                   fileName.endsWith('.csv') ? '📊 CSV' :
                   fileName.endsWith('.xml') ? '📄 XML' :
                   '📄 Text file'} • {textContent.split('\n').length} lines • {new Blob([textContent]).size} bytes
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4 py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-semibold mb-2">Preview Not Available</h3>
              <p className="text-muted-foreground mb-2">
                This file type cannot be previewed in the browser.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supported previews: Images (PNG, JPG, JPEG, GIF, WEBP, SVG), Text files (TXT, MD, JSON, CSV, XML, etc.)
              </p>
              <Button onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download to View
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
