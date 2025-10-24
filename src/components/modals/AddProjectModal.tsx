import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { FolderKanban, Plus } from 'lucide-react';
import { apiClient } from '../../services/api';
import type { ProjectCreate } from '../../types/api';

interface AddProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddProjectModal({ open, onOpenChange, onSuccess }: AddProjectModalProps) {
  const [formData, setFormData] = useState<ProjectCreate>({
    title: '',
    description: '',
    project_brief: '',
    desired_outcomes: '',
    status: 'planning',
    backlog: 'business_innovation',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      project_brief: '',
      desired_outcomes: '',
      status: 'planning',
      backlog: 'business_innovation',
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      await apiClient.createProject(formData);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[70vw] max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FolderKanban className="h-6 w-6 text-blue-500" />
              Add New Project
            </DialogTitle>
            <DialogDescription className="text-base">
              Create a new project from scratch or converted from an idea
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="project-title" className="text-base font-semibold">Title</Label>
            <Input
              id="project-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter project title"
              className="mt-2"
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Description */}
            <div>
              <Label htmlFor="project-description" className="text-base font-semibold">Description</Label>
              <textarea
                id="project-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the project"
                className="mt-2 w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            {/* Right Column: Project Brief */}
            <div>
              <Label htmlFor="project-brief" className="text-base font-semibold">Project Brief (Optional)</Label>
              <textarea
                id="project-brief"
                value={formData.project_brief}
                onChange={(e) => setFormData({ ...formData, project_brief: e.target.value })}
                placeholder="Enter project brief"
                className="mt-2 w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Desired Outcomes */}
          <div>
            <Label htmlFor="project-outcomes" className="text-base font-semibold">Desired Outcomes (Optional)</Label>
            <textarea
              id="project-outcomes"
              value={formData.desired_outcomes}
              onChange={(e) => setFormData({ ...formData, desired_outcomes: e.target.value })}
              placeholder="What are the expected outcomes?"
              className="mt-2 w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {/* Status & Backlog */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="project-status" className="text-base font-semibold">Status</Label>
              <select
                id="project-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="under_review">Under Review</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <Label htmlFor="project-backlog" className="text-base font-semibold">Backlog</Label>
              <select
                id="project-backlog"
                value={formData.backlog}
                onChange={(e) => setFormData({ ...formData, backlog: e.target.value })}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="business_innovation">Business & Innovation</option>
                <option value="engineering">Engineering</option>
                <option value="output_adoption">Outcomes & Adoption</option>
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

