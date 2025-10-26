import { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import type { FileInfo } from '../../types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { FileText, Upload, Trash2, Download, FileArchive, Image, FileVideo, FileAudio, File, Folder, Search } from 'lucide-react';
import { Badge } from '../../components/ui/badge';

type DocumentCategory = 'all' | 'general' | 'task_attachments' | 'kb_documents';

export function DocumentsPage() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [kbDocuments, setKbDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // Fetch regular files
      const filesData = await apiClient.listFiles();
      setFiles(filesData.files || []);
      
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      await apiClient.uploadFile(selectedFile);
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      fetchDocuments();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (relativePath: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await apiClient.deleteFile(relativePath);
      fetchDocuments();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete file');
    }
  };

  const handleDeleteKBDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this KB document?')) return;

    try {
      await apiClient.deleteKBDocument(documentId);
      fetchDocuments();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete KB document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
      case 'webp':
        return <Image className="h-5 w-5 text-blue-500" />;
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-5 w-5 text-green-600" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <FileArchive className="h-5 w-5 text-yellow-600" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <FileVideo className="h-5 w-5 text-purple-500" />;
      case 'mp3':
      case 'wav':
      case 'ogg':
        return <FileAudio className="h-5 w-5 text-pink-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryBadge = (filePath: string) => {
    if (filePath.includes('task_attachments')) {
      return <Badge variant="outline" className="text-xs">Task Attachment</Badge>;
    }
    if (filePath.includes('kb_documents') || filePath.includes('vectorstore')) {
      return <Badge variant="outline" className="text-xs">KB Document</Badge>;
    }
    return <Badge variant="outline" className="text-xs">General</Badge>;
  };

  // Filter documents based on category and search
  const filteredFiles = files.filter(file => {
    const matchesCategory = category === 'all' || 
      (category === 'task_attachments' && file.relative_path.includes('task_attachments')) ||
      (category === 'general' && !file.relative_path.includes('task_attachments') && !file.relative_path.includes('kb_documents')) ||
      (category === 'kb_documents' && file.relative_path.includes('kb_documents'));
    
    const matchesSearch = searchQuery === '' || 
      file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.relative_path.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const filteredKBDocs = kbDocuments.filter(doc => {
    const matchesCategory = category === 'all' || category === 'kb_documents';
    const matchesSearch = searchQuery === '' || 
      (doc.filename || doc.file_path || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const totalDocuments = filteredFiles.length + filteredKBDocs.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Folder className="h-8 w-8 text-primary" />
            Documents
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all your documents, attachments, and uploads in one place
          </p>
        </div>
        <Badge variant="secondary" className="text-base px-4 py-2">
          {totalDocuments} {totalDocuments === 1 ? 'Document' : 'Documents'}
        </Badge>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Document
          </CardTitle>
          <CardDescription>Upload a new document to storage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileSelect}
                disabled={uploading}
                className="cursor-pointer"
              />
            </div>

            {selectedFile && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                {getFileIcon(selectedFile.name)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
            )}
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || uploading}
            className="w-full md:w-auto"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
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
                All Documents
              </Button>
              <Button
                variant={category === 'general' ? 'default' : 'outline'}
                onClick={() => setCategory('general')}
                size="sm"
              >
                General
              </Button>
              <Button
                variant={category === 'task_attachments' ? 'default' : 'outline'}
                onClick={() => setCategory('task_attachments')}
                size="sm"
              >
                Attachments
              </Button>
              <Button
                variant={category === 'kb_documents' ? 'default' : 'outline'}
                onClick={() => setCategory('kb_documents')}
                size="sm"
              >
                KB Documents
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Loading documents...</p>
          </div>
        ) : totalDocuments === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || category !== 'all' 
                  ? 'No documents found matching your criteria'
                  : 'No documents uploaded yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Regular Files */}
            {filteredFiles.map((file) => (
              <Card key={file.relative_path} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(file.filename)}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{file.filename}</CardTitle>
                        <CardDescription className="flex items-center gap-2 flex-wrap">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{new Date(file.modified).toLocaleDateString()}</span>
                          <span>•</span>
                          {getCategoryBadge(file.relative_path)}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}/api/v1/files/download/${file.relative_path}`, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(file.relative_path)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* KB Documents */}
            {filteredKBDocs.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(doc.filename || doc.file_path || 'file.txt')}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{doc.filename || doc.file_path || 'Untitled'}</CardTitle>
                        <CardDescription className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">Knowledge Base</Badge>
                          {doc.category && (
                            <>
                              <span>•</span>
                              <Badge variant="secondary" className="text-xs">{doc.category}</Badge>
                            </>
                          )}
                          {doc.status && (
                            <>
                              <span>•</span>
                              <span className={doc.status === 'indexed' ? 'text-green-600' : 'text-yellow-600'}>
                                {doc.status}
                              </span>
                            </>
                          )}
                        </CardDescription>
                        {doc.description && (
                          <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteKBDocument(doc.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Document Management</h4>
              <p className="text-sm text-muted-foreground">
                This page provides a centralized location for all your documents. You can upload, download, and manage 
                general files, task attachments, and knowledge base documents. Use the search and filter options to 
                quickly find what you need.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


