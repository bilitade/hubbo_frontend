import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Save, X, Edit, Archive, Trash2, FolderKanban, CheckSquare, Clock, User, Calendar, BarChart3 } from 'lucide-react';
import { apiClient } from '../../services/api';
import type { ProjectResponse, ProjectUpdate, TaskResponse, UserResponse } from '../../types/api';

interface EditProjectModalProps {
  project: ProjectResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onDelete: () => void;
  onGenerateTasks?: (projectId: string, projectData: {
    title: string;
    description?: string;
    project_brief?: string;
    desired_outcomes?: string;
  }) => void;
}

export function EditProjectModal({ project, open, onOpenChange, onSuccess, onDelete, onGenerateTasks }: EditProjectModalProps) {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<ProjectUpdate>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'tasks'>('info');
  const [ownerInfo, setOwnerInfo] = useState<UserResponse | null>(null);
  const [loadingOwner, setLoadingOwner] = useState(false);

  useEffect(() => {
    if (project && open) {
      loadProjectTasks();
      
      // Fetch owner information
      if (project.owner_id) {
        const fetchOwner = async () => {
          setLoadingOwner(true);
          try {
            const user = await apiClient.getUser(project.owner_id!);
            setOwnerInfo(user);
          } catch (error) {
            console.error('Failed to fetch owner info:', error);
            setOwnerInfo(null);
          } finally {
            setLoadingOwner(false);
          }
        };
        
        fetchOwner();
      } else {
        setOwnerInfo(null);
      }
    }
  }, [project, open]);

  const loadProjectTasks = async () => {
    if (!project) return;
    
    setLoadingTasks(true);
    try {
      const response = await apiClient.listTasks(0, 100, undefined, project.id);
      setTasks(response.tasks || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  if (!project) return null;

  const handleClose = () => {
    onOpenChange(false);
    setIsEditMode(false);
    setEditFormData({});
    setShowDeleteConfirm(false);
    setActiveTab('info');
    setTasks([]);
  };

  const handleEditClick = () => {
    setEditFormData({
      title: project.title,
      description: project.description,
      project_brief: project.project_brief,
      desired_outcomes: project.desired_outcomes,
      status: project.status,
      backlog: project.backlog,
      workflow_step: project.workflow_step,
    });
    setIsEditMode(true);
  };

  const handleSaveEdit = async () => {
    try {
      await apiClient.updateProject(project.id, editFormData);
      onSuccess();
      setIsEditMode(false);
      handleClose();
    } catch (error) {
      console.error('Failed to update project:', error);
      alert('Failed to update project');
    }
  };

  const handleArchive = async () => {
    try {
      await apiClient.archiveProject(project.id);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to archive project:', error);
      alert('Failed to archive project');
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.deleteProject(project.id);
      onDelete();
      handleClose();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    }
  };

  const handleGenerateTasks = () => {
    if (onGenerateTasks) {
      onGenerateTasks(project.id, {
        title: project.title,
        description: project.description || '',
        project_brief: project.project_brief || '',
        desired_outcomes: project.desired_outcomes || '',
      });
      handleClose();
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'planning': 'bg-purple-100 text-purple-700',
      'not_started': 'bg-gray-100 text-gray-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'done': 'bg-green-100 text-green-700',
      'unassigned': 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (showDeleteConfirm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="p-6">
            <DialogTitle className="text-xl font-bold mb-2">Delete Project</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[60vw] min-w-[900px] max-h-[90vh] overflow-hidden p-0 flex flex-col">
        {/* Header with Icon */}
        <div className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <FolderKanban className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  {isEditMode ? 'Edit Project' : project.title}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  {project.project_number && (
                    <Badge variant="outline" className="text-xs">
                      {project.project_number}
                    </Badge>
                  )}
                  {ownerInfo && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Owner: {ownerInfo.first_name} {ownerInfo.middle_name} {ownerInfo.last_name}</span>
                    </div>
                  )}
                  {loadingOwner && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-muted-foreground"></div>
                      <span>Loading owner info...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {!isEditMode && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    navigate(`/dashboard/projects/${project.id}/progress`);
                    handleClose();
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md"
                  size="sm"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Project Progress
                </Button>
                {onGenerateTasks && (
                  <Button 
                    onClick={handleGenerateTasks} 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md"
                    size="sm"
                  >
                    <CheckSquare className="h-4 w-4 mr-1" />
                    Generate Tasks
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Tabs */}
          {!isEditMode && (
            <div className="flex gap-2 mt-4">
              <Button
                variant={activeTab === 'info' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('info')}
                className="h-8"
              >
                <FolderKanban className="h-3 w-3 mr-1" />
                Project Info
              </Button>
              <Button
                variant={activeTab === 'tasks' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('tasks')}
                className="h-8"
              >
                <CheckSquare className="h-3 w-3 mr-1" />
                Tasks ({tasks.length})
              </Button>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-4 min-h-0">
          {isEditMode ? (
            <>
              {/* Edit Mode Content - Same as before */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                <Input
                  id="title"
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <textarea
                  id="description"
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_brief" className="text-sm font-medium">Project Brief</Label>
                <textarea
                  id="project_brief"
                  value={editFormData.project_brief || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, project_brief: e.target.value })}
                  className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desired_outcomes" className="text-sm font-medium">Desired Outcomes</Label>
                <textarea
                  id="desired_outcomes"
                  value={editFormData.desired_outcomes || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, desired_outcomes: e.target.value })}
                  className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                  <select
                    id="status"
                    value={editFormData.status || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="planning">Planning</option>
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workflow_step" className="text-sm font-medium">Workflow Step (0-5)</Label>
                  <Input
                    id="workflow_step"
                    type="number"
                    min="0"
                    max="5"
                    value={editFormData.workflow_step || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, workflow_step: parseInt(e.target.value) })}
                    className="h-9"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {activeTab === 'info' ? (
                <>
                  {/* Project Info Tab */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-muted-foreground">Status</Label>
                      <Badge className={`${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-muted-foreground">Workflow Progress</Label>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${(project.workflow_step / 5) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {project.workflow_step}/5
                        </span>
                      </div>
                    </div>
                  </div>

                  {project.description && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-muted-foreground">Description</Label>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{project.description}</p>
                    </div>
                  )}

                  {project.project_brief && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-muted-foreground">Project Brief</Label>
                      <div className="text-sm text-gray-700 dark:text-gray-300 bg-muted/30 p-3 rounded-md font-mono whitespace-pre-wrap">
                        {project.project_brief}
                      </div>
                    </div>
                  )}

                  {project.desired_outcomes && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-muted-foreground">Desired Outcomes</Label>
                      <div className="text-sm text-gray-700 dark:text-gray-300 bg-muted/30 p-3 rounded-md font-mono whitespace-pre-wrap">
                        {project.desired_outcomes}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Backlog</Label>
                    <Badge variant="secondary">
                      {project.backlog?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  {project.departments && project.departments.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-muted-foreground">Departments</Label>
                      <div className="flex flex-wrap gap-2">
                        {project.departments.map((dept, idx) => (
                          <Badge key={idx} variant="secondary">
                            {dept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground">Created</Label>
                      <p className="text-sm">
                        {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-muted-foreground">Last Updated</Label>
                      <p className="text-sm">
                        {new Date(project.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Tasks Tab */}
                  {loadingTasks ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center py-8 bg-muted/30 rounded-lg border-2 border-dashed">
                      <CheckSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground mb-2">No tasks yet</p>
                      {onGenerateTasks && (
                        <Button 
                          onClick={handleGenerateTasks}
                          size="sm"
                          variant="outline"
                          className="mt-2"
                        >
                          Generate Tasks with AI
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div 
                          key={task.id} 
                          className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-1">{task.title}</h4>
                              {task.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                              )}
                            </div>
                            <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                              {task.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {task.due_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(task.due_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            {task.assigned_to && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>Assigned</span>
                              </div>
                            )}
                            {task.updated_at && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>Updated {new Date(task.updated_at).toLocaleDateString()}</span>
                              </div>
                            )}
                            {task.backlog && (
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  {task.backlog.replace('_', ' ')}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t bg-muted/20 flex-shrink-0">
          {isEditMode ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditMode(false)} className="h-9">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} size="sm" className="h-9">
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleArchive} className="h-9">
                  <Archive className="h-4 w-4 mr-1" />
                  Archive
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(true)} className="h-9 text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleClose} className="h-9">
                  Close
                </Button>
                <Button onClick={handleEditClick} size="sm" className="h-9">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Project
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
