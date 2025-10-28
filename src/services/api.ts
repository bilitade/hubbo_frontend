import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  Token,
  UserResponse,
  UserRegister,
  UserCreate,
  UserProfileUpdate,
  UserAdminUpdate,
  RoleResponse,
  RoleCreate,
  RoleUpdate,
  PermissionResponse,
  PermissionCreate,
  PasswordResetResponse,
  PasswordChangeResponse,
  ChatRequest,
  ChatResponse,
  AIResponse,
  IdeaGenerationRequest,
  ContentEnhanceRequest,
  AutoFillRequest,
  DocumentSearchRequest,
  DocumentSearchResponse,
  FileListResponse,
  FileUploadResponse,
  FileDeleteResponse,
  IdeaResponse,
  IdeaCreate,
  IdeaUpdate,
  IdeaListResponse,
  IdeaMoveToProject,
  ProjectResponse,
  ProjectCreate,
  ProjectUpdate,
  ProjectListResponse,
  TaskResponse,
  TaskCreate,
  TaskUpdate,
  TaskListResponse,
  TaskDetailResponse,
  TaskActivityCreate,
  TaskActivityResponse,
  TaskCommentCreate,
  TaskCommentResponse,
  ExperimentResponse,
  ExperimentCreate,
  ExperimentUpdate,
  ExperimentListResponse,
  ExperimentAddUpdate,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<Token> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh and session expiration
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Skip auto-refresh for login and register endpoints
          const url = originalRequest.url || '';
          if (url.includes('/auth/login') || url.includes('/users/register')) {
            return Promise.reject(error);
          }

          try {
            const newToken = await this.refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newToken.access_token}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Session has expired - clear tokens and redirect to login
            this.clearTokens();
            
            // Only redirect if we're not already on a public page
            const currentPath = window.location.pathname;
            const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/'];
            if (!publicPaths.includes(currentPath)) {
              // Store the current path to redirect back after login (optional)
              sessionStorage.setItem('redirectAfterLogin', currentPath);
              
              // Redirect to login with a message
              window.location.href = '/login?session_expired=true';
            }
            
            return Promise.reject(refreshError);
          }
        }

        // Handle other error statuses
        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private setTokens(token: Token): void {
    localStorage.setItem('access_token', token.access_token);
    localStorage.setItem('refresh_token', token.refresh_token);
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Authentication
  async login(email: string, password: string): Promise<Token> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await this.client.post<Token>('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    this.setTokens(response.data);
    return response.data;
  }

  async refreshToken(): Promise<Token> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshPromise = this.client
      .post<Token>('/api/v1/auth/refresh', { refresh_token: refreshToken })
      .then((response) => {
        this.setTokens(response.data);
        this.refreshPromise = null;
        return response.data;
      })
      .catch((error) => {
        this.refreshPromise = null;
        throw error;
      });

    return this.refreshPromise;
  }

  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      try {
        await this.client.post('/api/v1/auth/logout', { refresh_token: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    this.clearTokens();
  }

  // Password Management
  async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    const response = await this.client.post<PasswordResetResponse>(
      '/api/v1/password/request-reset',
      { email }
    );
    return response.data;
  }

  async resetPassword(token: string, new_password: string): Promise<PasswordChangeResponse> {
    const response = await this.client.post<PasswordChangeResponse>(
      '/api/v1/password/reset-password',
      { token, new_password }
    );
    return response.data;
  }

  async changePassword(current_password: string, new_password: string): Promise<PasswordChangeResponse> {
    const response = await this.client.post<PasswordChangeResponse>(
      '/api/v1/password/change-password',
      { current_password, new_password }
    );
    return response.data;
  }

  // Users
  async register(data: UserRegister): Promise<UserResponse> {
    const response = await this.client.post<UserResponse>('/api/v1/users/register', data);
    return response.data;
  }

  async createUser(data: UserCreate): Promise<UserResponse> {
    const response = await this.client.post<UserResponse>('/api/v1/users/', data);
    return response.data;
  }

  async listUsers(skip = 0, limit = 100): Promise<UserResponse[]> {
    const response = await this.client.get<UserResponse[]>('/api/v1/users/', {
      params: { skip, limit },
    });
    return response.data;
  }

  async getCurrentUser(): Promise<UserResponse> {
    const response = await this.client.get<UserResponse>('/api/v1/users/me');
    return response.data;
  }

  async updateCurrentUser(data: UserProfileUpdate): Promise<UserResponse> {
    const response = await this.client.patch<UserResponse>('/api/v1/users/me', data);
    return response.data;
  }

  async getUser(userId: string): Promise<UserResponse> {
    const response = await this.client.get<UserResponse>(`/api/v1/users/${userId}`);
    return response.data;
  }

  async updateUser(userId: string, data: UserAdminUpdate): Promise<UserResponse> {
    const response = await this.client.patch<UserResponse>(`/api/v1/users/${userId}`, data);
    return response.data;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.client.delete(`/api/v1/users/${userId}`);
  }

  async approveUser(userId: string): Promise<UserResponse> {
    const response = await this.client.patch<UserResponse>(`/api/v1/users/${userId}/approve`);
    return response.data;
  }

  // Roles
  async createRole(data: RoleCreate): Promise<RoleResponse> {
    const response = await this.client.post<RoleResponse>('/api/v1/roles/', data);
    return response.data;
  }

  async listRoles(skip = 0, limit = 100): Promise<RoleResponse[]> {
    const response = await this.client.get<RoleResponse[]>('/api/v1/roles/', {
      params: { skip, limit },
    });
    return response.data;
  }

  async getRole(roleId: number): Promise<RoleResponse> {
    const response = await this.client.get<RoleResponse>(`/api/v1/roles/${roleId}`);
    return response.data;
  }

  async updateRole(roleId: string | number, data: RoleUpdate): Promise<RoleResponse> {
    const response = await this.client.patch<RoleResponse>(`/api/v1/roles/${roleId}`, data);
    return response.data;
  }

  async deleteRole(roleId: string | number): Promise<void> {
    await this.client.delete(`/api/v1/roles/${roleId}`);
  }

  // Permissions
  async createPermission(data: PermissionCreate): Promise<PermissionResponse> {
    const response = await this.client.post<PermissionResponse>('/api/v1/permissions/', data);
    return response.data;
  }

  async listPermissions(skip = 0, limit = 100): Promise<PermissionResponse[]> {
    const response = await this.client.get<PermissionResponse[]>('/api/v1/permissions/', {
      params: { skip, limit },
    });
    return response.data;
  }

  async getPermission(permissionId: number): Promise<PermissionResponse> {
    const response = await this.client.get<PermissionResponse>(`/api/v1/permissions/${permissionId}`);
    return response.data;
  }

  async deletePermission(permissionId: string | number): Promise<void> {
    await this.client.delete(`/api/v1/permissions/${permissionId}`);
  }

  // AI Assistant
  async chat(data: ChatRequest): Promise<ChatResponse> {
    const response = await this.client.post<ChatResponse>('/api/v1/ai/chat', data);
    return response.data;
  }

  async generateIdea(data: IdeaGenerationRequest): Promise<AIResponse> {
    const response = await this.client.post<AIResponse>('/api/v1/ai/generate-idea', data);
    return response.data;
  }

  async enhanceContent(data: ContentEnhanceRequest): Promise<AIResponse> {
    const response = await this.client.post<AIResponse>('/api/v1/ai/enhance-content', data);
    return response.data;
  }

  async autoFill(data: AutoFillRequest): Promise<AIResponse> {
    const response = await this.client.post<AIResponse>('/api/v1/ai/auto-fill', data);
    return response.data;
  }

  async searchDocuments(data: DocumentSearchRequest): Promise<DocumentSearchResponse> {
    const response = await this.client.post<DocumentSearchResponse>('/api/v1/ai/search-documents', data);
    return response.data;
  }

  async listModels(): Promise<any> {
    const response = await this.client.get('/api/v1/ai/models');
    return response.data;
  }

  async enhanceIdea(data: {
    title: string;
    description?: string;
    possible_outcome?: string;
    departments?: string[];
    category?: string;
  }): Promise<{
    success: boolean;
    enhanced_data: {
      title?: string;
      description?: string;
      possible_outcome?: string;
    };
    raw_response: string;
  }> {
    const response = await this.client.post('/api/v1/ai/enhance/enhance-idea', data);
    return response.data;
  }

  async enhanceProject(data: {
    title: string;
    description?: string;
    desired_outcomes?: string;
  }): Promise<{
    success: boolean;
    enhanced_data: {
      title?: string;
      description?: string;
      tag?: string;
      brief?: string[];
      brief_text?: string;
      desired_outcomes?: string[];
      desired_outcomes_text?: string;
    };
    raw_response: string;
  }> {
    const response = await this.client.post('/api/v1/ai/enhance/enhance-project', data);
    return response.data;
  }

  async generateTasks(data: {
    project_title: string;
    project_description?: string;
    project_brief?: string;
    project_outcomes?: string;
    workflow_step?: number;
    num_tasks?: number;
  }): Promise<{
    success: boolean;
    tasks: Array<{
      title: string;
      description: string;
      priority: string;
      activities: string[];
    }>;
    raw_response: string;
  }> {
    const response = await this.client.post('/api/v1/ai/enhance/generate-tasks', data);
    return response.data;
  }

  // File Storage
  async uploadFile(file: File, category = 'general', index = true): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<FileUploadResponse>(
      '/api/v1/files/upload',
      formData,
      {
        params: { category, index },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async listFiles(category?: string): Promise<FileListResponse> {
    const response = await this.client.get<FileListResponse>('/api/v1/files/list', {
      params: category ? { category } : {},
    });
    return response.data;
  }

  async downloadFile(relativePath: string): Promise<Blob> {
    const response = await this.client.get(`/api/v1/files/download/${relativePath}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async deleteFile(relativePath: string): Promise<FileDeleteResponse> {
    const response = await this.client.delete<FileDeleteResponse>(`/api/v1/files/${relativePath}`);
    return response.data;
  }

  async adminListFiles(userId?: string, category?: string): Promise<FileListResponse> {
    const response = await this.client.get<FileListResponse>('/api/v1/files/admin/list', {
      params: { user_id: userId, category },
    });
    return response.data;
  }

  // Ideas
  async listIdeas(skip = 0, limit = 100, status?: string, archived?: boolean): Promise<IdeaListResponse> {
    const response = await this.client.get<IdeaListResponse>('/api/v1/ideas/', {
      params: { skip, limit, status, is_archived: archived },
    });
    return response.data;
  }

  async createIdea(data: IdeaCreate): Promise<IdeaResponse> {
    const response = await this.client.post<IdeaResponse>('/api/v1/ideas/', data);
    return response.data;
  }

  async getIdea(ideaId: string): Promise<IdeaResponse> {
    const response = await this.client.get<IdeaResponse>(`/api/v1/ideas/${ideaId}`);
    return response.data;
  }

  async updateIdea(ideaId: string, data: IdeaUpdate): Promise<IdeaResponse> {
    const response = await this.client.patch<IdeaResponse>(`/api/v1/ideas/${ideaId}`, data);
    return response.data;
  }

  async deleteIdea(ideaId: string): Promise<void> {
    await this.client.delete(`/api/v1/ideas/${ideaId}`);
  }

  async archiveIdea(ideaId: string): Promise<IdeaResponse> {
    const response = await this.client.post<IdeaResponse>(`/api/v1/ideas/${ideaId}/archive`, {
      is_archived: true
    });
    return response.data;
  }

  async unarchiveIdea(ideaId: string): Promise<IdeaResponse> {
    const response = await this.client.post<IdeaResponse>(`/api/v1/ideas/${ideaId}/archive`, {
      is_archived: false
    });
    return response.data;
  }

  async moveIdeaToProject(ideaId: string, data: IdeaMoveToProject): Promise<ProjectResponse> {
    const response = await this.client.post<ProjectResponse>(`/api/v1/ideas/${ideaId}/move-to-project`, data);
    return response.data;
  }

  // Projects
  async listProjects(skip = 0, limit = 100, status?: string, backlog?: string, archived?: boolean): Promise<ProjectListResponse> {
    const response = await this.client.get<ProjectListResponse>('/api/v1/projects/', {
      params: { skip, limit, status, backlog, is_archived: archived },
    });
    return response.data;
  }

  async createProject(data: ProjectCreate): Promise<ProjectResponse> {
    const response = await this.client.post<ProjectResponse>('/api/v1/projects/', data);
    return response.data;
  }

  async getProject(projectId: string): Promise<ProjectResponse> {
    const response = await this.client.get<ProjectResponse>(`/api/v1/projects/${projectId}`);
    return response.data;
  }

  async updateProject(projectId: string, data: ProjectUpdate): Promise<ProjectResponse> {
    const response = await this.client.patch<ProjectResponse>(`/api/v1/projects/${projectId}`, data);
    return response.data;
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.client.delete(`/api/v1/projects/${projectId}`);
  }

  async archiveProject(projectId: string): Promise<ProjectResponse> {
    const response = await this.client.post<ProjectResponse>(`/api/v1/projects/${projectId}/archive`, {
      is_archived: true
    });
    return response.data;
  }

  async unarchiveProject(projectId: string): Promise<ProjectResponse> {
    const response = await this.client.post<ProjectResponse>(`/api/v1/projects/${projectId}/archive`, {
      is_archived: false
    });
    return response.data;
  }

  // Tasks
  async listTasks(skip = 0, limit = 100, status?: string, project_id?: string, backlog?: string): Promise<TaskListResponse> {
    const response = await this.client.get<TaskListResponse>('/api/v1/tasks/', {
      params: { skip, limit, status, project_id, backlog },
    });
    return response.data;
  }

  async createTask(data: TaskCreate): Promise<TaskResponse> {
    const response = await this.client.post<TaskResponse>('/api/v1/tasks/', data);
    return response.data;
  }

  async getTask(taskId: string): Promise<TaskDetailResponse> {
    const response = await this.client.get<TaskDetailResponse>(`/api/v1/tasks/${taskId}`);
    return response.data;
  }

  async updateTask(taskId: string, data: TaskUpdate): Promise<TaskResponse> {
    const response = await this.client.patch<TaskResponse>(`/api/v1/tasks/${taskId}`, data);
    return response.data;
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.client.delete(`/api/v1/tasks/${taskId}`);
  }

  // Task Activities
  async createTaskActivity(taskId: string, data: TaskActivityCreate): Promise<TaskActivityResponse> {
    const response = await this.client.post<TaskActivityResponse>(`/api/v1/tasks/${taskId}/activities`, data);
    return response.data;
  }

  async updateTaskActivity(taskId: string, activityId: string, data: { completed?: boolean; title?: string } | boolean): Promise<TaskActivityResponse> {
    // Support both old signature (boolean) and new signature (object)
    const updateData = typeof data === 'boolean' ? { completed: data } : data;
    
    const response = await this.client.patch<TaskActivityResponse>(
      `/api/v1/tasks/${taskId}/activities/${activityId}`,
      updateData
    );
    return response.data;
  }

  async deleteTaskActivity(taskId: string, activityId: string): Promise<void> {
    await this.client.delete(`/api/v1/tasks/${taskId}/activities/${activityId}`);
  }

  // Task Comments
  async createTaskComment(taskId: string, data: TaskCommentCreate): Promise<TaskCommentResponse> {
    const response = await this.client.post<TaskCommentResponse>(`/api/v1/tasks/${taskId}/comments`, data);
    return response.data;
  }

  async deleteTaskComment(taskId: string, commentId: string): Promise<void> {
    await this.client.delete(`/api/v1/tasks/${taskId}/comments/${commentId}`);
  }

  // Task Attachments
  async listAllTaskAttachments(skip = 0, limit = 100): Promise<any[]> {
    const response = await this.client.get('/api/v1/tasks/attachments/all', {
      params: { skip, limit },
    });
    return response.data;
  }

  async uploadTaskAttachment(taskId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post(`/api/v1/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async downloadTaskAttachment(taskId: string, attachmentId: string, fileName: string): Promise<void> {
    const response = await this.client.get(
      `/api/v1/tasks/${taskId}/attachments/${attachmentId}/download`,
      { responseType: 'blob' }
    );
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async deleteTaskAttachment(taskId: string, attachmentId: string): Promise<void> {
    await this.client.delete(`/api/v1/tasks/${taskId}/attachments/${attachmentId}`);
  }

  // Task Activity Log
  async getTaskActivityLog(taskId: string): Promise<any[]> {
    const response = await this.client.get(`/api/v1/tasks/${taskId}/activity-log`);
    return response.data;
  }

  // Experiments
  async listExperiments(skip = 0, limit = 100, project_id?: string): Promise<ExperimentListResponse> {
    const response = await this.client.get<ExperimentListResponse>('/api/v1/experiments/', {
      params: { skip, limit, project_id },
    });
    return response.data;
  }

  async createExperiment(data: ExperimentCreate): Promise<ExperimentResponse> {
    const response = await this.client.post<ExperimentResponse>('/api/v1/experiments/', data);
    return response.data;
  }

  async getExperiment(experimentId: string): Promise<ExperimentResponse> {
    const response = await this.client.get<ExperimentResponse>(`/api/v1/experiments/${experimentId}`);
    return response.data;
  }

  async updateExperiment(experimentId: string, data: ExperimentUpdate): Promise<ExperimentResponse> {
    const response = await this.client.patch<ExperimentResponse>(`/api/v1/experiments/${experimentId}`, data);
    return response.data;
  }

  async deleteExperiment(experimentId: string): Promise<void> {
    await this.client.delete(`/api/v1/experiments/${experimentId}`);
  }

  async addExperimentUpdate(experimentId: string, data: ExperimentAddUpdate): Promise<ExperimentResponse> {
    const response = await this.client.post<ExperimentResponse>(
      `/api/v1/experiments/${experimentId}/updates`,
      data
    );
    return response.data;
  }

  // AI Chat (Guru) - Modular chat system
  async createChat(data: { title: string; description?: string }): Promise<any> {
    const response = await this.client.post('/api/v1/chat/chats', data);
    return response.data;
  }

  async listChats(includeArchived = false, limit = 50): Promise<any> {
    const response = await this.client.get('/api/v1/chat/chats', {
      params: { include_archived: includeArchived, limit },
    });
    return response.data;
  }

  async getChat(chatId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/chat/chats/${chatId}`);
    return response.data;
  }

  async updateChat(chatId: string, data: {
    title?: string;
    description?: string;
    is_archived?: boolean;
    is_pinned?: boolean;
  }): Promise<any> {
    const response = await this.client.patch(`/api/v1/chat/chats/${chatId}`, data);
    return response.data;
  }

  async deleteChat(chatId: string): Promise<void> {
    await this.client.delete(`/api/v1/chat/chats/${chatId}`);
  }

  async createChatThread(data: {
    chat_id: string;
    title?: string;
    context?: Record<string, any>;
    system_prompt?: string;
  }): Promise<any> {
    const response = await this.client.post('/api/v1/chat/threads', data);
    return response.data;
  }

  async listChatThreads(chatId: string, includeInactive = false): Promise<any> {
    const response = await this.client.get(`/api/v1/chat/chats/${chatId}/threads`, {
      params: { include_inactive: includeInactive },
    });
    return response.data;
  }

  async getChatThread(threadId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/chat/threads/${threadId}`);
    return response.data;
  }

  async updateChatThread(threadId: string, data: {
    title?: string;
    context?: Record<string, any>;
    system_prompt?: string;
    is_active?: boolean;
  }): Promise<any> {
    const response = await this.client.patch(`/api/v1/chat/threads/${threadId}`, data);
    return response.data;
  }

  async getChatMessages(threadId: string, limit = 100): Promise<any> {
    const response = await this.client.get(`/api/v1/chat/threads/${threadId}/messages`, {
      params: { limit },
    });
    return response.data;
  }

  async sendChatMessage(data: {
    thread_id: string;
    message: string;
    include_project_context?: boolean;
    include_task_context?: boolean;
    project_id?: string;
    task_id?: string;
  }): Promise<any> {
    const response = await this.client.post('/api/v1/chat/assistant/chat', data);
    return response.data;
  }

  async quickChat(data: {
    chat_id: string;
    message: string;
    context?: Record<string, any>;
    system_prompt?: string;
  }): Promise<any> {
    const response = await this.client.post('/api/v1/chat/assistant/quick-chat', data);
    return response.data;
  }

  // Streaming Chat (NEW)
  async streamChatMessage(
    threadId: string,
    message: string,
    onChunk: (chunk: string) => void,
    onComplete: (messageId: string) => void,
    onError: (error: string) => void,
    useAgent: boolean = true
  ): Promise<void> {
    const token = this.getAccessToken();
    const apiUrl = `${this.client.defaults.baseURL}/api/v1/chat/stream`;

    console.log('🚀 Starting stream...', { threadId, message });

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          thread_id: threadId,
          message: message,
          use_agent: useAgent,
        }),
      });

      console.log('✅ Stream response received:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let buffer = '';
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ Stream complete. Total chunks:', chunkCount);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim();
              if (!jsonStr) continue;
              
              const data = JSON.parse(jsonStr);
              console.log('📦 SSE event:', data.type, data);
              
              if (data.type === 'content') {
                chunkCount++;
                console.log(`📨 Chunk #${chunkCount}:`, data.chunk);
                onChunk(data.chunk);
              } else if (data.type === 'done') {
                console.log('✅ Stream done:', data.message_id);
                onComplete(data.message_id);
              } else if (data.type === 'error') {
                console.error('❌ Stream error:', data.message);
                onError(data.message);
              } else if (data.type === 'user_message') {
                console.log('👤 User message confirmed:', data.message_id);
              }
            } catch (e) {
              console.error('❌ Error parsing SSE data:', e, 'Line:', line);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('❌ Stream failed:', error);
      onError(error.message || 'Streaming failed');
    }
  }

  // Knowledge Base
  async uploadKBDocument(
    file: File,
    category = 'general',
    description?: string,
    tags?: string
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const params = new URLSearchParams();
    params.append('category', category);
    if (description) params.append('description', description);
    if (tags) params.append('tags', tags);

    const response = await this.client.post(
      `/api/v1/knowledge-base/upload?${params.toString()}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async listKBDocuments(params?: {
    category?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<any> {
    const response = await this.client.get('/api/v1/knowledge-base/documents', {
      params,
    });
    return response.data;
  }

  async getKBDocument(documentId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/knowledge-base/documents/${documentId}`);
    return response.data;
  }

  async updateKBDocument(
    documentId: string,
    data: { category?: string; description?: string; tags?: string }
  ): Promise<any> {
    const response = await this.client.patch(`/api/v1/knowledge-base/documents/${documentId}`, data);
    return response.data;
  }

  async deleteKBDocument(documentId: string): Promise<void> {
    await this.client.delete(`/api/v1/knowledge-base/documents/${documentId}`);
  }

  async searchKB(data: {
    query: string;
    k?: number;
    category?: string;
  }): Promise<any> {
    const response = await this.client.post('/api/v1/knowledge-base/search', data);
    return response.data;
  }

  async getKBStats(): Promise<any> {
    const response = await this.client.get('/api/v1/knowledge-base/stats');
    return response.data;
  }

  async reprocessKBDocument(documentId: string): Promise<any> {
    const response = await this.client.post(`/api/v1/knowledge-base/reprocess/${documentId}`);
    return response.data;
  }

  // System Settings
  async getSystemSettings(): Promise<any> {
    const response = await this.client.get('/api/v1/settings/');
    return response.data;
  }

  async getPublicSystemSettings(): Promise<any> {
    const response = await this.client.get('/api/v1/settings/public');
    return response.data;
  }

  async updateSystemSettings(data: any): Promise<any> {
    const response = await this.client.patch('/api/v1/settings/', data);
    return response.data;
  }

  async resetSystemSettings(): Promise<void> {
    await this.client.delete('/api/v1/settings/');
  }

  // Audit Logs
  async listAuditLogs(params?: {
    skip?: number;
    limit?: number;
    user_id?: string;
    action?: string;
    resource_type?: string;
    success?: boolean;
  }): Promise<any> {
    const response = await this.client.get('/api/v1/audit-logs/', { params });
    return response.data;
  }

  async getAuditStats(days = 30): Promise<any> {
    const response = await this.client.get('/api/v1/audit-logs/stats', { params: { days } });
    return response.data;
  }

  async getMyActivity(skip = 0, limit = 50): Promise<any> {
    const response = await this.client.get('/api/v1/audit-logs/my-activity', { params: { skip, limit } });
    return response.data;
  }

  // LLM Logs
  async listLLMLogs(params?: {
    skip?: number;
    limit?: number;
    user_id?: string;
    provider?: string;
    model?: string;
    success?: boolean;
  }): Promise<any> {
    const response = await this.client.get('/api/v1/llm-logs/', { params });
    return response.data;
  }

  async getLLMStats(days = 30): Promise<any> {
    const response = await this.client.get('/api/v1/llm-logs/stats', { params: { days } });
    return response.data;
  }

  async getMyLLMUsage(skip = 0, limit = 50): Promise<any> {
    const response = await this.client.get('/api/v1/llm-logs/my-usage', { params: { skip, limit } });
    return response.data;
  }

  // Reports (CSV Downloads)
  async downloadTasksReport(params?: {
    status?: string;
    project_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<void> {
    const response = await this.client.get('/api/v1/reports/tasks/csv', {
      params,
      responseType: 'blob',
    });
    this._downloadBlob(response.data, `tasks_${Date.now()}.csv`);
  }

  async downloadProjectsReport(params?: {
    status?: string;
    backlog?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<void> {
    const response = await this.client.get('/api/v1/reports/projects/csv', {
      params,
      responseType: 'blob',
    });
    this._downloadBlob(response.data, `projects_${Date.now()}.csv`);
  }

  async downloadIdeasReport(params?: {
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<void> {
    const response = await this.client.get('/api/v1/reports/ideas/csv', {
      params,
      responseType: 'blob',
    });
    this._downloadBlob(response.data, `ideas_${Date.now()}.csv`);
  }

  async downloadUserActivityReport(days = 30): Promise<void> {
    const response = await this.client.get('/api/v1/reports/user-activity/csv', {
      params: { days },
      responseType: 'blob',
    });
    this._downloadBlob(response.data, `user_activity_${Date.now()}.csv`);
  }

  async downloadLLMUsageReport(days = 30): Promise<void> {
    const response = await this.client.get('/api/v1/reports/llm-usage/csv', {
      params: { days },
      responseType: 'blob',
    });
    this._downloadBlob(response.data, `llm_usage_${Date.now()}.csv`);
  }

  async downloadSummaryReport(days = 30): Promise<void> {
    const response = await this.client.get('/api/v1/reports/summary/csv', {
      params: { days },
      responseType: 'blob',
    });
    this._downloadBlob(response.data, `summary_report_${Date.now()}.csv`);
  }

  private _downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  // Health Check
  async healthCheck(): Promise<any> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
