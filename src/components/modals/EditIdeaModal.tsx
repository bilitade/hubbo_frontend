import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Lightbulb, X, Save, Trash2, Archive, FolderSymlink } from 'lucide-react';
import { apiClient } from '../../services/api';
import type { IdeaResponse, IdeaUpdate } from '../../types/api';

interface EditIdeaModalProps {
  idea: IdeaResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onMoveToProject?: (idea: IdeaResponse) => void;
}

export function EditIdeaModal({ idea, open, onOpenChange, onSuccess, onMoveToProject }: EditIdeaModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    possible_outcome: '',
    category: '',
    status: 'inbox',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (idea) {
      setFormData({
        title: idea.title,
        description: idea.description || '',
        possible_outcome: idea.possible_outcome || '',
        category: idea.category || '',
        status: idea.status,
      });
    }
  }, [idea]);

  if (!idea) return null;

  const handleClose = () => {
    onOpenChange(false);
    setShowDeleteConfirm(false);
  };

  const handleUpdate = async () => {
    try {
      const updateData: IdeaUpdate = {
        title: formData.title,
        description: formData.description,
        possible_outcome: formData.possible_outcome,
        category: formData.category,
        status: formData.status,
      };
      await apiClient.updateIdea(idea.id, updateData);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to update idea:', error);
      alert('Failed to update idea');
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.deleteIdea(idea.id);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to delete idea:', error);
      alert('Failed to delete idea');
    }
  };

  const handleArchive = async () => {
    try {
      await apiClient.archiveIdea(idea.id);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to archive idea:', error);
      alert('Failed to archive idea');
    }
  };

  const handleMoveToProject = () => {
    if (idea && onMoveToProject) {
      onMoveToProject(idea);
      handleClose();
    }
  };

  if (showDeleteConfirm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[40vw]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>Delete Idea</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this idea? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Idea
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
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              Edit Idea
            </DialogTitle>
            <DialogDescription className="text-base">
              Update your idea details
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="edit-idea-title" className="text-base font-semibold">Title</Label>
            <Input
              id="edit-idea-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter your idea title"
              className="mt-2"
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Description */}
            <div>
              <Label htmlFor="edit-idea-description" className="text-base font-semibold">Description</Label>
              <textarea
                id="edit-idea-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your idea"
                className="mt-2 w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            {/* Right Column: Possible Outcome */}
            <div>
              <Label htmlFor="edit-idea-outcome" className="text-base font-semibold">Possible Outcome (Optional)</Label>
              <textarea
                id="edit-idea-outcome"
                value={formData.possible_outcome}
                onChange={(e) => setFormData({ ...formData, possible_outcome: e.target.value })}
                placeholder="What could be the expected outcome?"
                className="mt-2 w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Status & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-idea-status" className="text-base font-semibold">Status</Label>
              <select
                id="edit-idea-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="inbox">Inbox</option>
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="under_review">Under Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <Label htmlFor="edit-idea-category" className="text-base font-semibold">Category (Optional)</Label>
              <Input
                id="edit-idea-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Product, Marketing"
                className="mt-2"
              />
            </div>
          </div>

          {/* Departments (Read-only) */}
          {idea.departments && idea.departments.length > 0 && (
            <div>
              <Label className="text-base font-semibold">Departments</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {idea.departments.map((dept, idx) => (
                  <Badge key={idx} variant="secondary">
                    {dept}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label className="text-sm font-semibold text-muted-foreground">Created</Label>
              <p className="mt-2 text-sm">
                {new Date(idea.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-muted-foreground">Last Updated</Label>
              <p className="mt-2 text-sm">
                {new Date(idea.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 border-t pt-4">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} className="flex-1">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Idea
              </Button>
              <Button variant="outline" onClick={handleArchive} className="flex-1">
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
              <Button onClick={handleUpdate} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
            
            {onMoveToProject && (
              <Button 
                variant="default" 
                onClick={handleMoveToProject} 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <FolderSymlink className="h-4 w-4 mr-2" />
                Move to Project
              </Button>
            )}
            
            <Button variant="outline" onClick={handleClose} className="w-full">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

