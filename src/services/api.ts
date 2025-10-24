import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  Token,
  RefreshRequest,
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
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordResetConfirm,
  PasswordChange,
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
  ProfileResponse,
  ProfileUpdate,
  ProfileDisable,
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

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newToken.access_token}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

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

  async updateRole(roleId: number, data: RoleUpdate): Promise<RoleResponse> {
    const response = await this.client.patch<RoleResponse>(`/api/v1/roles/${roleId}`, data);
    return response.data;
  }

  async deleteRole(roleId: number): Promise<void> {
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

  async deletePermission(permissionId: number): Promise<void> {
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

  // Profiles
  async listProfiles(skip = 0, limit = 100): Promise<ProfileResponse[]> {
    const response = await this.client.get<ProfileResponse[]>('/api/v1/profiles/', {
      params: { skip, limit },
    });
    return response.data;
  }

  async getProfile(profileId: string): Promise<ProfileResponse> {
    const response = await this.client.get<ProfileResponse>(`/api/v1/profiles/${profileId}`);
    return response.data;
  }

  async updateProfile(profileId: string, data: ProfileUpdate): Promise<ProfileResponse> {
    const response = await this.client.patch<ProfileResponse>(`/api/v1/profiles/${profileId}`, data);
    return response.data;
  }

  async disableProfile(profileId: string, data: ProfileDisable): Promise<ProfileResponse> {
    const response = await this.client.post<ProfileResponse>(`/api/v1/profiles/${profileId}/disable`, data);
    return response.data;
  }

  async enableProfile(profileId: string): Promise<ProfileResponse> {
    const response = await this.client.post<ProfileResponse>(`/api/v1/profiles/${profileId}/enable`);
    return response.data;
  }

  // Ideas
  async listIdeas(skip = 0, limit = 100, status?: string, archived?: boolean): Promise<IdeaListResponse> {
    const response = await this.client.get<IdeaListResponse>('/api/v1/ideas/', {
      params: { skip, limit, status, archived },
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
    const response = await this.client.post<IdeaResponse>(`/api/v1/ideas/${ideaId}/archive`);
    return response.data;
  }

  async unarchiveIdea(ideaId: string): Promise<IdeaResponse> {
    const response = await this.client.post<IdeaResponse>(`/api/v1/ideas/${ideaId}/unarchive`);
    return response.data;
  }

  async moveIdeaToProject(ideaId: string, data: IdeaMoveToProject): Promise<ProjectResponse> {
    const response = await this.client.post<ProjectResponse>(`/api/v1/ideas/${ideaId}/move-to-project`, data);
    return response.data;
  }

  // Projects
  async listProjects(skip = 0, limit = 100, status?: string, backlog?: string, archived?: boolean): Promise<ProjectListResponse> {
    const response = await this.client.get<ProjectListResponse>('/api/v1/projects/', {
      params: { skip, limit, status, backlog, archived },
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
    const response = await this.client.post<ProjectResponse>(`/api/v1/projects/${projectId}/archive`);
    return response.data;
  }

  async unarchiveProject(projectId: string): Promise<ProjectResponse> {
    const response = await this.client.post<ProjectResponse>(`/api/v1/projects/${projectId}/unarchive`);
    return response.data;
  }

  // Tasks
  async listTasks(skip = 0, limit = 100, status?: string, project_id?: string): Promise<TaskListResponse> {
    const response = await this.client.get<TaskListResponse>('/api/v1/tasks/', {
      params: { skip, limit, status, project_id },
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

  async updateTaskActivity(taskId: string, activityId: string, completed: boolean): Promise<TaskActivityResponse> {
    const response = await this.client.patch<TaskActivityResponse>(
      `/api/v1/tasks/${taskId}/activities/${activityId}`,
      { completed }
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
  async uploadTaskAttachment(taskId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post(`/api/v1/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deleteTaskAttachment(taskId: string, attachmentId: string): Promise<void> {
    await this.client.delete(`/api/v1/tasks/${taskId}/attachments/${attachmentId}`);
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

  // Health Check
  async healthCheck(): Promise<any> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
