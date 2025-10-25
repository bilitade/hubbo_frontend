// API Types generated from OpenAPI spec

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface UserResponse {
  id: string;
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  role_title?: string | null;
  is_active: boolean;
  is_approved: boolean;
  roles?: RoleResponse[];
}

export interface UserRegister {
  email: string;
  password: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  role_title?: string | null;
}

export interface UserCreate extends UserRegister {
  role_names?: string[];
}

export interface UserProfileUpdate {
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  role_title?: string | null;
  email?: string | null;
  password?: string | null;
}

export interface UserAdminUpdate extends UserProfileUpdate {
  role_names?: string[] | null;
  is_active?: boolean | null;
  is_approved?: boolean | null;
}

export interface RoleResponse {
  id: number;
  name: string;
  permissions?: PermissionResponse[];
}

export interface RoleCreate {
  name: string;
  permission_names?: string[];
}

export interface RoleUpdate {
  name?: string | null;
  permission_names?: string[] | null;
}

export interface PermissionResponse {
  id: number;
  name: string;
}

export interface PermissionCreate {
  name: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  message: string;
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
}

export interface PasswordChangeResponse {
  message: string;
}

export interface ChatRequest {
  message: string;
  system_prompt?: string | null;
  context?: Record<string, any> | null;
}

export interface ChatResponse {
  response: string;
  model: string;
}

export interface AIResponse {
  result: string;
  model: string;
}

export interface IdeaGenerationRequest {
  topic: string;
  context?: string | null;
  style?: string;
}

export interface ContentEnhanceRequest {
  content: string;
  enhancement_type?: string;
  target_length?: string | null;
}

export interface AutoFillRequest {
  field_name: string;
  existing_data: Record<string, any>;
  field_description?: string | null;
}

export interface DocumentSearchRequest {
  query: string;
  max_results?: number;
}

export interface DocumentSearchResponse {
  results: Record<string, string>[];
  count: number;
}

export interface FileInfo {
  filename: string;
  filepath: string;
  relative_path: string;
  size: number;
  user_id?: string | null;
  category?: string;
  modified: string;
}

export interface FileListResponse {
  files: FileInfo[];
  count: number;
}

export interface FileUploadResponse {
  filename: string;
  stored_name: string;
  filepath: string;
  size: number;
  category: string;
  user_id: string;
  upload_date: string;
  indexed?: boolean;
}

export interface FileDeleteResponse {
  success: boolean;
  message: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

// Profile Types
export interface ProfileResponse {
  id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  team?: string | null;
  position?: string | null;
  email?: string | null;
  needs_password_change: boolean;
  disabled: boolean;
  disabled_reason?: string | null;
  disabled_at?: string | null;
  disabled_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  display_name?: string | null;
  avatar_url?: string | null;
  team?: string | null;
  position?: string | null;
  email?: string | null;
  needs_password_change?: boolean | null;
}

export interface ProfileDisable {
  disabled_reason: string;
}

// Idea Types
export interface IdeaResponse {
  id: string;
  user_id: string;
  idea_id?: string | null;
  title: string;
  description: string;
  possible_outcome: string;
  category?: string | null;
  status: string;
  departments: string[];
  owner?: string | null;
  owner_id?: string | null;
  responsible_id?: string | null;
  accountable_id?: string | null;
  consulted_ids: string[];
  informed_ids: string[];
  project_id?: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface IdeaCreate {
  title: string;
  description: string;
  possible_outcome: string;
  category?: string | null;
  status?: string;
  departments?: string[];
  owner_id?: string | null;
  responsible_id?: string | null;
  accountable_id?: string | null;
  consulted_ids?: string[];
  informed_ids?: string[];
}

export interface IdeaUpdate {
  title?: string | null;
  description?: string | null;
  possible_outcome?: string | null;
  category?: string | null;
  status?: string | null;
  owner_id?: string | null;
  responsible_id?: string | null;
  accountable_id?: string | null;
  consulted_ids?: string[] | null;
  informed_ids?: string[] | null;
  departments?: string[] | null;
  is_archived?: boolean | null;
}

export interface IdeaListResponse {
  ideas: IdeaResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface IdeaMoveToProject {
  project_title?: string | null;
  project_brief: string;
  desired_outcomes: string;
  due_date?: string | null;
  generate_tasks_with_ai?: boolean;
}

// Project Types
export interface ProjectResponse {
  id: string;
  project_number?: string | null;
  title: string;
  description?: string | null;
  project_brief: string;
  desired_outcomes: string;
  latest_update?: string | null;
  primary_metric?: number | null;
  secondary_metrics?: Record<string, any> | null;
  status: string;
  backlog: string;
  departments: string[];
  workflow_step: number;
  last_activity_date: string;
  due_date?: string | null;
  owner_id?: string | null;
  responsible_id?: string | null;
  accountable_id?: string | null;
  consulted_ids: string[];
  informed_ids: string[];
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  // Task statistics
  progress_percentage?: number | null;
  tasks_count?: number | null;
  completed_tasks_count?: number | null;
  unassigned_tasks_count?: number | null;
  in_progress_tasks_count?: number | null;
}

export interface ProjectCreate {
  title: string;
  description?: string | null;
  project_brief: string;
  desired_outcomes: string;
  status?: string;
  backlog?: string;
  departments?: string[];
  owner_id?: string | null;
  responsible_id?: string | null;
  accountable_id?: string | null;
  consulted_ids?: string[];
  informed_ids?: string[];
  due_date?: string | null;
  workflow_step?: number;
}

export interface ProjectUpdate {
  title?: string | null;
  description?: string | null;
  project_brief?: string | null;
  desired_outcomes?: string | null;
  latest_update?: string | null;
  primary_metric?: number | null;
  secondary_metrics?: Record<string, any> | null;
  status?: string | null;
  backlog?: string | null;
  workflow_step?: number | null;
  owner_id?: string | null;
  responsible_id?: string | null;
  accountable_id?: string | null;
  consulted_ids?: string[] | null;
  informed_ids?: string[] | null;
  due_date?: string | null;
  departments?: string[] | null;
  is_archived?: boolean | null;
}

export interface ProjectListResponse {
  projects: ProjectResponse[];
  total: number;
  page: number;
  page_size: number;
}

// Task Types
export interface TaskActivityResponse {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskActivityCreate {
  title: string;
  completed?: boolean;
}

export interface TaskCommentResponse {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface TaskCommentCreate {
  content: string;
}

export interface TaskAttachmentResponse {
  id: string;
  task_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: string;
}

export interface TaskResponse {
  id: string;
  idea_id?: string | null;
  project_id?: string | null;
  title: string;
  description?: string | null;
  status: string;
  backlog?: string | null;
  assigned_to?: string | null;
  owner_id?: string | null;
  accountable_id?: string | null;
  responsible_role?: string | null;
  accountable_role?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskDetailResponse extends TaskResponse {
  activities: TaskActivityResponse[];
  comments: TaskCommentResponse[];
  attachments: TaskAttachmentResponse[];
}

export interface TaskCreate {
  title: string;
  description?: string | null;
  status?: string;
  backlog?: string | null;
  idea_id?: string | null;
  project_id?: string | null;
  assigned_to?: string | null;
  owner_id?: string | null;
  accountable_id?: string | null;
  responsible_role?: string | null;
  accountable_role?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  activities?: TaskActivityCreate[];
}

export interface TaskUpdate {
  title?: string | null;
  description?: string | null;
  status?: string | null;
  backlog?: string | null;
  assigned_to?: string | null;
  owner_id?: string | null;
  accountable_id?: string | null;
  responsible_role?: string | null;
  accountable_role?: string | null;
  start_date?: string | null;
  due_date?: string | null;
}

export interface TaskListResponse {
  tasks: TaskResponse[];
  total: number;
  page: number;
  page_size: number;
}

// Experiment Types
export interface ExperimentResponse {
  id: string;
  project_id?: string | null;
  title: string;
  hypothesis: string;
  method: string;
  success_criteria: string;
  progress_updates: string[];
  created_at: string;
  updated_at: string;
}

export interface ExperimentCreate {
  title: string;
  hypothesis: string;
  method: string;
  success_criteria: string;
  project_id?: string | null;
  progress_updates?: string[];
}

export interface ExperimentUpdate {
  title?: string | null;
  hypothesis?: string | null;
  method?: string | null;
  success_criteria?: string | null;
  progress_updates?: string[] | null;
}

export interface ExperimentAddUpdate {
  update: string;
}

export interface ExperimentListResponse {
  experiments: ExperimentResponse[];
  total: number;
  page: number;
  page_size: number;
}
