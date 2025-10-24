import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { FolderKanban, Plus, Lightbulb, Bot, Sparkles, Upload, FileText, X, Calendar, CheckSquare } from 'lucide-react';
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generateTasksAfter, setGenerateTasksAfter] = useState(false);
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [aiEnhancedFields, setAiEnhancedFields] = useState<Set<string>>(new Set());

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
    setUploadedFile(null);
    setAiEnhancedFields(new Set());
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setUploadedFile(file);
    }
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
      const createdProject = await apiClient.createProject(formData);

      if (generateTasksAfter && onProjectCreated) {
        // Pass project data to parent for task generation
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
        const enhancedFieldsSet = new Set<string>();
        
        setFormData(prev => {
          const updated = { ...prev };
          
          if (response.enhanced_data.title) {
            updated.title = response.enhanced_data.title;
            enhancedFieldsSet.add('title');
          }
          if (response.enhanced_data.description) {
            updated.description = response.enhanced_data.description;
            enhancedFieldsSet.add('description');
          }
          if (response.enhanced_data.brief_text) {
            updated.project_brief = response.enhanced_data.brief_text;
            enhancedFieldsSet.add('project_brief');
          }
          if (response.enhanced_data.desired_outcomes_text) {
            updated.desired_outcomes = response.enhanced_data.desired_outcomes_text;
            enhancedFieldsSet.add('desired_outcomes');
          }
          
          return updated;
        });

        // Also set the project tag if AI suggests one
        if (response.enhanced_data.tag) {
          setProjectTag(response.enhanced_data.tag);
          enhancedFieldsSet.add('tag');
        }

        setAiEnhancedFields(enhancedFieldsSet);
        
        setTimeout(() => {
          setAiEnhancedFields(new Set());
        }, 5000);
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
      <DialogContent className="w-[70vw] max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FolderKanban className="h-6 w-6 text-blue-500" />
              {initialData?.title ? `Convert to Project: ${initialData.title}` : 'Add New Project'}
            </DialogTitle>
            <DialogDescription className="text-base">
              {initialData?.title 
                ? 'Transform this idea into a tracked project with a unique project number' 
                : 'Create a new project with comprehensive details'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="project-title" className="text-base font-semibold">Title</Label>
              <div className="flex gap-2">
                {aiEnhancedFields.has('title') && (
                  <Badge variant="default" className="text-xs bg-green-500 animate-pulse">
                    <Bot className="h-3 w-3 mr-1" />
                    AI Enhanced
                  </Badge>
                )}
                {initialData?.title && (
                  <Badge variant="secondary" className="text-xs">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    From Idea
                  </Badge>
                )}
              </div>
            </div>
            <Input
              id="project-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter project title"
              className={`${aiEnhancedFields.has('title') ? 'border-green-500 ring-2 ring-green-500/20' : initialData?.title ? 'border-blue-300' : ''}`}
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="project-description" className="text-base font-semibold">Description</Label>
              <div className="flex gap-2">
                {aiEnhancedFields.has('description') && (
                  <Badge variant="default" className="text-xs bg-green-500 animate-pulse">
                    <Bot className="h-3 w-3 mr-1" />
                    AI Enhanced
                  </Badge>
                )}
                {initialData?.description && (
                  <Badge variant="secondary" className="text-xs">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    From Idea
                  </Badge>
                )}
              </div>
            </div>
            <textarea
              id="project-description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the project"
              className={`w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ${aiEnhancedFields.has('description') ? 'border-green-500 ring-2 ring-green-500/20' : initialData?.description ? 'border-blue-300' : ''}`}
            />
          </div>

          {/* Attach File for AI Context */}
          <div className="border rounded-lg p-5 bg-gradient-to-br from-muted/50 to-muted/30 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label className="text-base font-semibold">Attach File (Optional)</Label>
                <p className="text-xs text-muted-foreground">Attach a file to provide additional context for AI generation (max 5MB)</p>
              </div>
            </div>
            
            {!uploadedFile ? (
              <Input
                type="file"
                onChange={handleFileUpload}
                accept=".txt,.md"
                className="cursor-pointer"
              />
            ) : (
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm flex-1 truncate">{uploadedFile.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => setUploadedFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* AI Enhancement */}
          <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-green-500/10 rounded-lg p-4 border border-purple-200/50 dark:border-purple-800/50">
            <div className="flex items-start gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Generate Project Details with AI</h4>
                <p className="text-xs text-muted-foreground">
                  AI will enhance your project and generate comprehensive briefs and outcomes
                </p>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="default"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={handleAIEnhance}
              disabled={aiEnhancing || !formData.title.trim()}
            >
              {aiEnhancing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating with AI...
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  Generate Project Details with AI
                </>
              )}
            </Button>
          </div>

          {/* Project Tag */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="project-tag" className="text-base font-semibold">
                Project Tag <span className="text-red-500">*</span>
              </Label>
              {aiEnhancedFields.has('tag') && (
                <Badge variant="default" className="text-xs bg-green-500 animate-pulse">
                  <Bot className="h-3 w-3 mr-1" />
                  AI Suggested
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Format: TAG-DDMMYYYY-XXX (number auto-increments globally)
            </p>
            <Input
              id="project-tag"
              value={projectTag}
              onChange={(e) => setProjectTag(e.target.value.toUpperCase())}
              placeholder="e.g., LOAN, PAYMENT, RISK"
              className={aiEnhancedFields.has('tag') ? 'border-green-500 ring-2 ring-green-500/20' : ''}
            />
          </div>

          {/* Project Brief (Expected Features) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="project-brief" className="text-base font-semibold">
                Project Brief (Expected Features) <span className="text-red-500">*</span>
              </Label>
              {aiEnhancedFields.has('project_brief') && (
                <Badge variant="default" className="text-xs bg-green-500 animate-pulse">
                  <Bot className="h-3 w-3 mr-1" />
                  AI Enhanced
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              List expected features using bullet points (- or •)
            </p>
            <textarea
              id="project-brief"
              value={formData.project_brief}
              onChange={(e) => setFormData({ ...formData, project_brief: e.target.value })}
              placeholder="- Feature 1&#10;- Feature 2&#10;- Feature 3"
              className={`w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ${aiEnhancedFields.has('project_brief') ? 'border-green-500 ring-2 ring-green-500/20' : ''}`}
            />
          </div>

          {/* Desired Outcomes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="project-outcomes" className="text-base font-semibold">
                Desired Outcomes <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                {aiEnhancedFields.has('desired_outcomes') && (
                  <Badge variant="default" className="text-xs bg-green-500 animate-pulse">
                    <Bot className="h-3 w-3 mr-1" />
                    AI Enhanced
                  </Badge>
                )}
                {initialData?.desired_outcomes && (
                  <Badge variant="secondary" className="text-xs">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    From Idea
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              List desired outcomes using bullet points (- or •)
            </p>
            <textarea
              id="project-outcomes"
              value={formData.desired_outcomes}
              onChange={(e) => setFormData({ ...formData, desired_outcomes: e.target.value })}
              placeholder="- Outcome 1&#10;- Outcome 2&#10;- Outcome 3"
              className={`w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ${aiEnhancedFields.has('desired_outcomes') ? 'border-green-500 ring-2 ring-green-500/20' : initialData?.desired_outcomes ? 'border-blue-300' : ''}`}
            />
          </div>

          {/* Due Date */}
          <div>
            <Label htmlFor="project-due-date" className="text-base font-semibold">
              Due Date <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                id="project-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="flex-1"
              />
            </div>
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

          {/* Generate Tasks Option */}
          <div className="border-t pt-6">
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
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
                    AI will automatically create tasks and subtasks based on your project brief and outcomes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 border-t pt-4 space-y-3">
          {/* Primary Action */}
          <Button onClick={handleCreate} className="w-full" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            {generateTasksAfter ? 'Create Project & Generate Tasks' : 'Create Project'}
          </Button>
          
          {/* Cancel */}
          <Button variant="ghost" onClick={handleClose} className="w-full">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

