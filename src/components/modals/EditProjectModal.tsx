import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Save, X, Edit, Archive, Trash2, FolderKanban, CheckSquare } from 'lucide-react';
import { apiClient } from '../../services/api';
import type { ProjectResponse, ProjectUpdate } from '../../types/api';

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<ProjectUpdate>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!project) return null;

  const handleClose = () => {
    onOpenChange(false);
    setIsEditMode(false);
    setEditFormData({});
    setShowDeleteConfirm(false);
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
      'inbox': 'bg-gray-100 text-gray-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'under_review': 'bg-yellow-100 text-yellow-700',
      'completed': 'bg-green-100 text-green-700',
      'on_hold': 'bg-red-100 text-red-700',
      'planning': 'bg-purple-100 text-purple-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (showDeleteConfirm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[40vw]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>Delete Project</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this project? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6">
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
      <DialogContent className="w-[70vw] max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FolderKanban className="h-6 w-6 text-blue-500" />
              {isEditMode ? 'Edit Project' : project.title}
            </DialogTitle>
            <DialogDescription>
              {project.project_number && (
                <Badge variant="outline" className="mt-2">
                  {project.project_number}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {isEditMode ? (
            <>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="mt-1 w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="project_brief">Project Brief</Label>
                <textarea
                  id="project_brief"
                  value={editFormData.project_brief || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, project_brief: e.target.value })}
                  className="mt-1 w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="desired_outcomes">Desired Outcomes</Label>
                <textarea
                  id="desired_outcomes"
                  value={editFormData.desired_outcomes || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, desired_outcomes: e.target.value })}
                  className="mt-1 w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={editFormData.status || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="under_review">Under Review</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="workflow_step">Workflow Step</Label>
                  <Input
                    id="workflow_step"
                    type="number"
                    min="0"
                    max="5"
                    value={editFormData.workflow_step || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, workflow_step: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">Status</Label>
                  <Badge className={`mt-1 ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">Workflow Step</Label>
                  <div className="mt-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
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
              </div>

              <div>
                <Label className="text-sm font-semibold text-muted-foreground">Description</Label>
                <p className="mt-2 text-sm">{project.description || 'No description'}</p>
              </div>

              {project.project_brief && (
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">Project Brief</Label>
                  <p className="mt-2 text-sm">{project.project_brief}</p>
                </div>
              )}

              {project.desired_outcomes && (
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">Desired Outcomes</Label>
                  <p className="mt-2 text-sm">{project.desired_outcomes}</p>
                </div>
              )}
            </>
          )}

          <div>
            <Label className="text-sm font-semibold text-muted-foreground">Backlog</Label>
            <Badge variant="secondary" className="mt-2">
              {project.backlog?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {project.departments && project.departments.length > 0 && (
            <div>
              <Label className="text-sm font-semibold text-muted-foreground">Departments</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {project.departments.map((dept, idx) => (
                  <Badge key={idx} variant="secondary">
                    {dept}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-muted-foreground">Created</Label>
              <p className="mt-2 text-sm">
                {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-muted-foreground">Last Updated</Label>
              <p className="mt-2 text-sm">
                {new Date(project.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 border-t pt-4">
          {isEditMode ? (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditMode(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {onGenerateTasks && (
                <Button 
                  variant="default"
                  onClick={handleGenerateTasks} 
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Generate Tasks with AI
                </Button>
              )}
              
              <div className="flex gap-2">
                <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </Button>
                <Button variant="outline" onClick={handleArchive} className="flex-1">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                <Button onClick={handleEditClick} className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
              <Button variant="outline" onClick={handleClose} className="w-full">
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

