import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../services/api';
import type { FileInfo, TaskAttachmentResponse } from '../../types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  FileText, 
  Download, 
  Trash2, 
  Image, 
  File, 
  Folder, 
  Search,
  Eye,
  Paperclip,
  Upload,
  Database
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { DocumentViewerModal } from '../../components/modals/DocumentViewerModal';

type DocumentCategory = 'all' | 'general' | 'task_attachments' | 'kb_documents';

interface CombinedDocument {
  id: string;
  name: string;
  size: number;
  type: 'general' | 'task_attachment' | 'kb_document';
  created: string;
  mimeType?: string;
  uploadedBy?: string;
  taskId?: string;
  category?: string;
  status?: string;
  description?: string;
  relativePath?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function DocumentsPage() {
  const [generalFiles, setGeneralFiles] = useState<FileInfo[]>([]);
  const [taskAttachments, setTaskAttachments] = useState<TaskAttachmentResponse[]>([]);
  const [kbDocuments, setKbDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState<DocumentCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Viewer modal state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<{
    name: string;
    url: string;
    mimeType: string;
    taskId?: string;
    attachmentId?: string;
    relativePath?: string;
  } | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // Fetch general files
      try {
        const filesData = await apiClient.listFiles();
        setGeneralFiles(filesData.files || []);
      } catch (err) {
        console.log('Failed to load general files:', err);
        setGeneralFiles([]);
      }
      
      // Fetch task attachments
      try {
        const attachments = await apiClient.listAllTaskAttachments(0, 500);
        setTaskAttachments(attachments || []);
      } catch (err) {
        console.log('Failed to load task attachments:', err);
        setTaskAttachments([]);
      }
      
      // Fetch KB documents
      try {
        const kbData = await apiClient.listKBDocuments();
        setKbDocuments(kbData.documents || kbData.items || []);
      } catch (err) {
        console.log('KB documents not available or no permission');
        setKbDocuments([]);
      }
    } catch (err: any) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    setUploading(true);

    try {
      await apiClient.uploadFile(file, 'general', false); // Don't index general files
      await fetchDocuments();
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Show success message
      alert(`✅ File "${file.name}" uploaded successfully!`);
    } catch (error: any) {
      console.error('Failed to upload file:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to upload file. Please check the file type and try again.';
      alert(`❌ Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (filename: string, mimeType?: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    if (mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    if (mimeType?.includes('pdf') || ext === 'pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (['doc', 'docx'].includes(ext || '')) {
      return <FileText className="h-5 w-5 text-blue-600" />;
    }
    if (['xls', 'xlsx'].includes(ext || '')) {
      return <FileText className="h-5 w-5 text-green-600" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const canPreview = (filename: string, mimeType?: string): boolean => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const isImage = mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext || '');
    const isText = mimeType?.includes('text') || ['txt', 'md', 'csv', 'json', 'xml', 'log', 'html', 'css', 'js', 'ts', 'py', 'java', 'c', 'cpp', 'h', 'sh', 'yaml', 'yml'].includes(ext || '');
    return isImage || isText;
  };

  const handleViewDocument = (doc: CombinedDocument) => {
    if (doc.type === 'task_attachment' && doc.taskId) {
      const url = `${API_BASE_URL}/api/v1/tasks/${doc.taskId}/attachments/${doc.id}/download`;
      setViewingDocument({
        name: doc.name,
        url,
        mimeType: doc.mimeType || '',
        taskId: doc.taskId,
        attachmentId: doc.id,
      });
      setViewerOpen(true);
    } else if (doc.type === 'general' && doc.relativePath) {
      const url = `${API_BASE_URL}/api/v1/files/download/${doc.relativePath}`;
      setViewingDocument({
        name: doc.name,
        url,
        mimeType: doc.mimeType || '',
        relativePath: doc.relativePath,
      });
      setViewerOpen(true);
    }
  };

  const handleDownloadDocument = async (doc: CombinedDocument) => {
    try {
      if (doc.type === 'task_attachment' && doc.taskId) {
        await apiClient.downloadTaskAttachment(doc.taskId, doc.id, doc.name);
      } else if (doc.type === 'general' && doc.relativePath) {
        const blob = await apiClient.downloadFile(doc.relativePath);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', doc.name);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download:', error);
      alert('Failed to download file');
    }
  };

  const handleDeleteDocument = async (doc: CombinedDocument) => {
    if (!confirm(`Delete "${doc.name}"?`)) return;

    try {
      if (doc.type === 'task_attachment' && doc.taskId) {
        await apiClient.deleteTaskAttachment(doc.taskId, doc.id);
      } else if (doc.type === 'kb_document') {
        await apiClient.deleteKBDocument(doc.id);
      } else if (doc.type === 'general' && doc.relativePath) {
        await apiClient.deleteFile(doc.relativePath);
      }
      await fetchDocuments();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete document');
    }
  };

  const getMimeTypeFromFilename = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'txt': 'text/plain',
      'md': 'text/markdown',
      'csv': 'text/csv',
      'json': 'application/json',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  };

  // Combine all documents
  const combinedDocuments: CombinedDocument[] = [
    // General files
    ...generalFiles.map(file => ({
      id: file.relative_path,
      name: file.filename,
      size: file.size,
      type: 'general' as const,
      created: file.modified,
      mimeType: getMimeTypeFromFilename(file.filename),
      relativePath: file.relative_path,
    })),
    // Task attachments
    ...taskAttachments.map(att => ({
      id: att.id,
      name: att.file_name,
      size: att.file_size,
      type: 'task_attachment' as const,
      created: att.created_at,
      mimeType: att.mime_type,
      uploadedBy: att.uploaded_by,
      taskId: att.task_id,
    })),
    // KB documents
    ...kbDocuments.map(doc => ({
      id: doc.id,
      name: doc.filename || doc.file_path || 'Untitled',
      size: doc.file_size || 0,
      type: 'kb_document' as const,
      created: doc.created_at || doc.upload_date,
      category: doc.category,
      status: doc.status,
      description: doc.description,
    })),
  ];

  // Filter documents
  const filteredDocuments = combinedDocuments.filter(doc => {
    const matchesCategory = category === 'all' || 
      (category === 'general' && doc.type === 'general') ||
      (category === 'task_attachments' && doc.type === 'task_attachment') ||
      (category === 'kb_documents' && doc.type === 'kb_document');
    
    const matchesSearch = searchQuery === '' || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Sort by created date (newest first)
  filteredDocuments.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

  const stats = {
    total: combinedDocuments.length,
    general: generalFiles.length,
    taskAttachments: taskAttachments.length,
    kbDocuments: kbDocuments.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Folder className="h-8 w-8 text-primary" />
            Documents
          </h1>
          <p className="text-muted-foreground mt-1">
            Unified document management - upload, view, and manage all your files
          </p>
        </div>
        <Badge variant="secondary" className="text-base px-4 py-2">
          {filteredDocuments.length} {filteredDocuments.length === 1 ? 'Document' : 'Documents'}
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Folder className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.general}</p>
                <p className="text-xs text-muted-foreground">General Files</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Paperclip className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.taskAttachments}</p>
                <p className="text-xs text-muted-foreground">Task Attachments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.kbDocuments}</p>
                <p className="text-xs text-muted-foreground">KB Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload General Document
          </CardTitle>
          <CardDescription>
            Upload any standard document for general storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-shrink-0"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Select & Upload File
                </>
              )}
            </Button>
            <div className="text-sm text-muted-foreground flex items-center">
              <p className="hidden md:block">
                Upload any document type - PDFs, Office files, images, text files, archives, and more
              </p>
              <p className="md:hidden">
                Upload any standard file type
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={category === 'all' ? 'default' : 'outline'}
                onClick={() => setCategory('all')}
                size="sm"
              >
                <Folder className="h-4 w-4 mr-1" />
                All ({stats.total})
              </Button>
              <Button
                variant={category === 'general' ? 'default' : 'outline'}
                onClick={() => setCategory('general')}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-1" />
                General ({stats.general})
              </Button>
              <Button
                variant={category === 'task_attachments' ? 'default' : 'outline'}
                onClick={() => setCategory('task_attachments')}
                size="sm"
              >
                <Paperclip className="h-4 w-4 mr-1" />
                Attachments ({stats.taskAttachments})
              </Button>
              <Button
                variant={category === 'kb_documents' ? 'default' : 'outline'}
                onClick={() => setCategory('kb_documents')}
                size="sm"
              >
                <Database className="h-4 w-4 mr-1" />
                KB Docs ({stats.kbDocuments})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <p className="mt-4 text-muted-foreground">Loading documents...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="py-12 text-center">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || category !== 'all' 
                  ? 'No documents found matching your criteria'
                  : 'No documents available yet. Upload your first document above!'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Size</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Source</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr 
                      key={`${doc.type}-${doc.id}`} 
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {getFileIcon(doc.name, doc.mimeType)}
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate max-w-md" title={doc.name}>
                              {doc.name}
                            </p>
                            {doc.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-md">
                                {doc.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {doc.name.split('.').pop()?.toUpperCase() || 'FILE'}
                        </span>
                      </td>

                      {/* Size */}
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {formatFileSize(doc.size)}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(doc.created).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Source */}
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          {doc.type === 'general' && (
                            <Badge variant="default" className="text-xs">
                              <Upload className="h-3 w-3 mr-1" />
                              General
                            </Badge>
                          )}
                          {doc.type === 'task_attachment' && (
                            <Badge variant="secondary" className="text-xs">
                              <Paperclip className="h-3 w-3 mr-1" />
                              Task
                            </Badge>
                          )}
                          {doc.type === 'kb_document' && (
                            <Badge variant="outline" className="text-xs">
                              <Database className="h-3 w-3 mr-1" />
                              KB
                            </Badge>
                          )}
                          {doc.status && (
                            <Badge 
                              variant={doc.status === 'indexed' ? 'default' : 'secondary'} 
                              className="text-xs"
                            >
                              {doc.status}
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex gap-1 justify-end">
                          {canPreview(doc.name, doc.mimeType) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDocument(doc)}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadDocument(doc)}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteDocument(doc)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium mb-2">Unified Document Management</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>General Documents:</strong> Upload any file type (documents, images, archives, etc.) for general storage</p>
                <p><strong>Task Attachments:</strong> Files automatically included from all task attachments across projects</p>
                <p><strong>KB Documents:</strong> Files uploaded to Knowledge Base for AI embedding and semantic search</p>
                <p className="pt-2"><strong>Preview:</strong> Images and text files (TXT, MD, JSON, CSV, etc.) can be viewed directly. Heavy files (PDF, Office docs) can be downloaded.</p>
                <p><strong>Security:</strong> Executable files (.exe, .bat, .sh, etc.) are blocked for security reasons</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <DocumentViewerModal
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          fileName={viewingDocument.name}
          fileUrl={viewingDocument.url}
          mimeType={viewingDocument.mimeType}
          onDownload={() => {
            if (viewingDocument.taskId && viewingDocument.attachmentId) {
              apiClient.downloadTaskAttachment(
                viewingDocument.taskId,
                viewingDocument.attachmentId,
                viewingDocument.name
              );
            } else if (viewingDocument.relativePath) {
              apiClient.downloadFile(viewingDocument.relativePath).then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', viewingDocument.name);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
              });
            }
          }}
        />
      )}
    </div>
  );
}
