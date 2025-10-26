import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  Search,
  Trash2,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  FolderOpen,
  Filter,
} from 'lucide-react';
import api from '../../services/api';

interface KBDocument {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  content_type: string;
  category: string;
  description: string | null;
  tags: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_chunks: number;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
}

interface KBStats {
  total_documents: number;
  total_chunks: number;
  total_size_bytes: number;
  documents_by_category: Record<string, number>;
  documents_by_status: Record<string, number>;
  recent_uploads: KBDocument[];
}

interface SearchResult {
  chunk_id: string;
  document_id: string;
  content: string;
  similarity_score: number;
  chunk_index: number;
  filename: string;
  category: string;
  created_at: string;
}

const KnowledgeBase: React.FC = () => {
  const [documents, setDocuments] = useState<KBDocument[]>([]);
  const [stats, setStats] = useState<KBStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [view, setView] = useState<'documents' | 'search' | 'stats'>('documents');

  // Upload form
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('general');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadTags, setUploadTags] = useState('');

  useEffect(() => {
    loadDocuments();
    loadStats();
  }, [categoryFilter, statusFilter]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const params: any = { page: 1, page_size: 50 };
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await api.listKBDocuments(params);
      setDocuments(response.documents);
    } catch (error: any) {
      console.error('Error loading documents:', error);
      alert('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.getKBStats();
      setStats(response);
    } catch (error: any) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    try {
      await api.uploadKBDocument(
        selectedFile,
        uploadCategory,
        uploadDescription || undefined,
        uploadTags || undefined
      );

      alert('Document uploaded successfully! Processing in background.');
      
      // Reset form
      setSelectedFile(null);
      setUploadCategory('general');
      setUploadDescription('');
      setUploadTags('');
      
      // Reload documents
      loadDocuments();
      loadStats();
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.response?.data?.detail || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await api.deleteKBDocument(documentId);
      alert('Document deleted successfully');
      loadDocuments();
      loadStats();
    } catch (error: any) {
      console.error('Delete error:', error);
      alert('Failed to delete document');
    }
  };

  const handleReprocess = async (documentId: string) => {
    if (!confirm('Reprocess this document? This will re-extract and re-embed all content.')) {
      return;
    }

    try {
      await api.reprocessKBDocument(documentId);
      alert('Document queued for reprocessing');
      loadDocuments();
    } catch (error: any) {
      console.error('Reprocess error:', error);
      alert('Failed to reprocess document');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    setSearching(true);
    try {
      const response = await api.searchKB({
        query: searchQuery,
        k: 5,
        category: categoryFilter || undefined,
      });

      setSearchResults(response.results);
      setView('search');
    } catch (error: any) {
      console.error('Search error:', error);
      alert('Failed to search knowledge base');
    } finally {
      setSearching(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Upload and manage documents for AI-powered search and RAG
        </p>
      </div>

      {/* View Tabs */}
      <div className="mb-6 border-b border-border">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setView('documents')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              view === 'documents'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            <FolderOpen className="w-5 h-5 inline-block mr-2" />
            Documents
          </button>
          <button
            onClick={() => setView('search')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              view === 'search'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            <Search className="w-5 h-5 inline-block mr-2" />
            Search
          </button>
          <button
            onClick={() => setView('stats')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              view === 'stats'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline-block mr-2" />
            Statistics
          </button>
        </nav>
      </div>

      {/* Upload Section */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center text-card-foreground">
          <Upload className="w-5 h-5 mr-2" />
          Upload Document
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select File
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md,.csv,.json"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Supported: PDF, DOCX, TXT, MD, CSV, JSON
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="block w-full rounded-md border-border bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="general">General</option>
              <option value="documentation">Documentation</option>
              <option value="policy">Policy</option>
              <option value="technical">Technical</option>
              <option value="research">Research</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="Brief description"
              className="block w-full rounded-md border-border bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tags (Optional)
            </label>
            <input
              type="text"
              value={uploadTags}
              onChange={(e) => setUploadTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
              className="block w-full rounded-md border-border bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleFileUpload}
            disabled={!selectedFile || uploading}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </>
            )}
          </button>
        </div>
      </div>

      {/* Documents View */}
      {view === 'documents' && (
        <>
          {/* Filters */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-4 mb-6">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-muted-foreground" />
              
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-md border-border bg-background text-foreground shadow-sm text-sm focus:border-primary focus:ring-primary"
                >
                  <option value="">All Categories</option>
                  <option value="general">General</option>
                  <option value="documentation">Documentation</option>
                  <option value="policy">Policy</option>
                  <option value="technical">Technical</option>
                  <option value="research">Research</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-md border-border bg-background text-foreground shadow-sm text-sm focus:border-primary focus:ring-primary"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <button
                onClick={loadDocuments}
                className="ml-auto bg-muted text-muted-foreground px-4 py-2 rounded-md hover:bg-muted/80 flex items-center text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Documents List */}
          <div className="bg-card rounded-lg shadow-sm border border-border">
            {loading ? (
              <div className="p-12 text-center text-muted-foreground">
                <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
                Loading documents...
              </div>
            ) : documents.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium text-foreground">No documents found</p>
                <p className="text-sm">Upload your first document to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Document
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Chunks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Uploaded
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-muted-foreground mr-3" />
                            <div>
                              <div className="text-sm font-medium text-foreground">
                                {doc.original_filename}
                              </div>
                              {doc.description && (
                                <div className="text-xs text-muted-foreground">
                                  {doc.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/10 text-primary">
                            {doc.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(doc.status)}
                            <span className="ml-2 text-sm text-foreground">
                              {getStatusText(doc.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {doc.total_chunks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {formatBytes(doc.file_size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {doc.status === 'failed' && (
                              <button
                                onClick={() => handleReprocess(doc.id)}
                                className="text-primary hover:text-primary/80 transition-colors"
                                title="Reprocess"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="text-destructive hover:text-destructive/80 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Search View */}
      {view === 'search' && (
        <>
          <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-card-foreground">
              <Search className="w-5 h-5 mr-2" />
              Semantic Search
            </h2>
            
            <div className="flex space-x-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter your search query..."
                className="flex-1 rounded-md border-border bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary"
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center transition-colors"
              >
                {searching ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Search Results ({searchResults.length})
              </h3>
              
              {searchResults.map((result, index) => (
                <div
                  key={result.chunk_id}
                  className="bg-card rounded-lg shadow-sm border border-border p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-muted-foreground/30 mr-3">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-medium text-foreground">
                          {result.filename}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            Chunk {result.chunk_index + 1}
                          </span>
                          <span className="text-xs text-muted-foreground/50">•</span>
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/10 text-primary">
                            {result.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-primary">
                      {Math.round(result.similarity_score * 100)}% match
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-md p-4">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {result.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Statistics View */}
      {view === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Documents */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats.total_documents}
                </p>
              </div>
              <FileText className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Total Chunks */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Chunks</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stats.total_chunks}
                </p>
              </div>
              <BarChart3 className="w-12 h-12 text-success" />
            </div>
          </div>

          {/* Total Size */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Size</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {formatBytes(stats.total_size_bytes)}
                </p>
              </div>
              <Download className="w-12 h-12 text-accent" />
            </div>
          </div>

          {/* Documents by Category */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Documents by Category</h3>
            <div className="space-y-3">
              {Object.entries(stats.documents_by_category).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground capitalize">
                    {category}
                  </span>
                  <div className="flex items-center">
                    <div className="w-32 bg-muted rounded-full h-2 mr-3">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${(count / stats.total_documents) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents by Status */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Documents by Status</h3>
            <div className="space-y-3">
              {Object.entries(stats.documents_by_status).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(status)}
                    <span className="ml-2 text-sm font-medium text-foreground capitalize">
                      {status}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;

