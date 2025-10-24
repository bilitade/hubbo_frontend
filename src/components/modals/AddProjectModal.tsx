import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { FolderKanban, Plus, Lightbulb, Bot, Sparkles, Calendar, CheckSquare } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { apiClient } from '../../services/api';
import type { ProjectCreate } from '../../types/api';

interface AddProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onProjectCreated?: (projectId: string, projectData: {
    title: string;
    description?: string;
    project_brief?: string;
    desired_outcomes?: string;
  }) => void;
  initialData?: {
    title?: string;
    description?: string;
    desired_outcomes?: string;
  };
}

export function AddProjectModal({ open, onOpenChange, onSuccess, onProjectCreated, initialData }: AddProjectModalProps) {
  const [formData, setFormData] = useState<ProjectCreate>({
    title: '',
    description: '',
    project_brief: '',
    desired_outcomes: '',
    status: 'planning',
    backlog: 'business_innovation',
  });
  const [projectTag, setProjectTag] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [generateTasksAfter, setGenerateTasksAfter] = useState(false);
  const [aiEnhancing, setAiEnhancing] = useState(false);

  useEffect(() => {
    if (initialData && open) {
      setFormData(prev => ({
        ...prev,
        title: initialData.title || '',
        description: initialData.description || '',
        desired_outcomes: initialData.desired_outcomes || '',
      }));
    }
  }, [initialData, open]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      project_brief: '',
      desired_outcomes: '',
      status: 'planning',
      backlog: 'business_innovation',
    });
    setProjectTag('');
    setDueDate('');
    setGenerateTasksAfter(false);
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
    if (!projectTag.trim()) {
      alert('Please enter a project tag');
      return;
    }
    if (!formData.project_brief.trim()) {
      alert('Please enter project brief (expected features)');
      return;
    }
    if (!formData.desired_outcomes.trim()) {
      alert('Please enter desired outcomes');
      return;
    }
    if (!dueDate) {
      alert('Please select a due date');
      return;
    }

    try {
      // Add due_date to formData before creating
      const projectData = {
        ...formData,
        due_date: dueDate,
      };

      const createdProject = await apiClient.createProject(projectData);

      if (generateTasksAfter && onProjectCreated) {
        onProjectCreated(createdProject.id, {
          title: formData.title,
          description: formData.description || '',
          project_brief: formData.project_brief || '',
          desired_outcomes: formData.desired_outcomes || '',
        });
      }

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    }
  };

  const handleAIEnhance = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title first');
      return;
    }

    setAiEnhancing(true);
    try {
      const response = await apiClient.enhanceProject({
        title: formData.title,
        description: formData.description || undefined,
        desired_outcomes: formData.desired_outcomes || undefined,
      });

      if (response.success && response.enhanced_data) {
        setFormData(prev => ({
          ...prev,
          title: response.enhanced_data.title || prev.title,
          description: response.enhanced_data.description || prev.description,
          project_brief: response.enhanced_data.brief_text || prev.project_brief,
          desired_outcomes: response.enhanced_data.desired_outcomes_text || prev.desired_outcomes,
        }));

        if (response.enhanced_data.tag) {
          setProjectTag(response.enhanced_data.tag);
        }
      }
    } catch (error) {
      console.error('Failed to enhance project:', error);
      alert('Failed to enhance project with AI.');
    } finally {
      setAiEnhancing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[50vw] min-w-[800px] max-h-[90vh] overflow-hidden p-0 flex flex-col">
        {/* Header with Icon */}
        <div className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <FolderKanban className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold">
                {initialData?.title ? 'Convert to Project' : 'Add New Project'}
              </DialogTitle>
              {initialData?.title && (
                <Badge variant="secondary" className="text-xs mt-1">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  From Idea: {initialData.title}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-4 min-h-0">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="project-title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="project-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter project title"
              className="h-9"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="project-description" className="text-sm font-medium">Description</Label>
            <textarea
              id="project-description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the project"
              className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          {/* Project Tag */}
          <div className="space-y-2">
            <Label htmlFor="project-tag" className="text-sm font-medium">
              Project Tag <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Format: TAG-DDMMYYYY-XXX (e.g., LOAN, PAYMENT, RISK)
            </p>
            <Input
              id="project-tag"
              value={projectTag}
              onChange={(e) => setProjectTag(e.target.value.toUpperCase())}
              placeholder="e.g., LOAN, PAYMENT, RISK"
              className="h-9"
            />
          </div>

          {/* Project Brief */}
          <div className="space-y-2">
            <Label htmlFor="project-brief" className="text-sm font-medium">
              Project Brief (Expected Features) <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              List expected features using bullet points (- or •)
            </p>
            <textarea
              id="project-brief"
              value={formData.project_brief}
              onChange={(e) => setFormData({ ...formData, project_brief: e.target.value })}
              placeholder="- Feature 1&#10;- Feature 2&#10;- Feature 3"
              className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          {/* Desired Outcomes */}
          <div className="space-y-2">
            <Label htmlFor="project-outcomes" className="text-sm font-medium">
              Desired Outcomes <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              List desired outcomes using bullet points (- or •)
            </p>
            <textarea
              id="project-outcomes"
              value={formData.desired_outcomes}
              onChange={(e) => setFormData({ ...formData, desired_outcomes: e.target.value })}
              placeholder="- Outcome 1&#10;- Outcome 2&#10;- Outcome 3"
              className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="project-due-date" className="text-sm font-medium">
              Due Date <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                id="project-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="flex-1 h-9"
              />
            </div>
          </div>

          {/* Status & Backlog */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="project-status" className="text-sm font-medium">Status</Label>
              <select
                id="project-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="under_review">Under Review</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-backlog" className="text-sm font-medium">Backlog</Label>
              <select
                id="project-backlog"
                value={formData.backlog}
                onChange={(e) => setFormData({ ...formData, backlog: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="business_innovation">Business & Innovation</option>
                <option value="engineering">Engineering</option>
                <option value="output_adoption">Outcomes & Adoption</option>
              </select>
            </div>
          </div>

          {/* Generate Tasks Option */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="generate-tasks"
                checked={generateTasksAfter}
                onCheckedChange={(checked) => setGenerateTasksAfter(checked === true)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <label 
                  htmlFor="generate-tasks" 
                  className="text-sm font-semibold cursor-pointer flex items-center gap-2"
                >
                  <CheckSquare className="h-4 w-4 text-green-600" />
                  Generate Tasks with AI After Creating Project
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  AI will automatically create tasks and subtasks based on your project
                </p>
              </div>
            </div>
          </div>

          {/* AI Enhancement Button */}
          <div className="relative">
            <Button 
              type="button" 
              className={`w-full h-10 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white shadow-lg transition-all duration-300 ${
                aiEnhancing ? 'scale-105 shadow-xl' : ''
              }`}
              onClick={handleAIEnhance}
              disabled={aiEnhancing || !formData.title.trim()}
            >
              {aiEnhancing ? (
                <>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    <span className="animate-pulse">AI is generating project details...</span>
                    <Sparkles className="h-4 w-4 animate-pulse" />
                  </div>
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  Generate Project Details with AI
                </>
              )}
            </Button>
            {aiEnhancing && (
              <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 opacity-30 blur-xl animate-pulse"></div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/20 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={handleClose} className="h-9">
            Cancel
          </Button>
          <Button onClick={handleCreate} size="sm" className="h-9 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
            <Plus className="h-4 w-4 mr-1" />
            {generateTasksAfter ? 'Create & Generate Tasks' : 'Create Project'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
