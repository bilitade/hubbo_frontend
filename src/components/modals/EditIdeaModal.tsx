import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Lightbulb, X, Trash2, Archive, Rocket, Bot, Sparkles, User } from 'lucide-react';
import { apiClient } from '../../services/api';
import type { IdeaResponse, IdeaUpdate, UserResponse } from '../../types/api';

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
  const [departments, setDepartments] = useState<string[]>([]);
  const [customDepartment, setCustomDepartment] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [aiSuggestingDepts, setAiSuggestingDepts] = useState(false);
  const [creatorInfo, setCreatorInfo] = useState<UserResponse | null>(null);
  const [loadingCreator, setLoadingCreator] = useState(false);

  const predefinedDepartments = [
    'Marketing',
    'Business Operations',
    'Card Banking',
    'Technology',
    'Customer Service',
    'Finance'
  ];

  useEffect(() => {
    if (idea) {
      setFormData({
        title: idea.title,
        description: idea.description || '',
        possible_outcome: idea.possible_outcome || '',
        category: idea.category || '',
        status: idea.status,
      });
      setDepartments(idea.departments || []);
      
      // Fetch creator information
      const fetchCreator = async () => {
        setLoadingCreator(true);
        try {
          const user = await apiClient.getUser(idea.user_id);
          setCreatorInfo(user);
        } catch (error) {
          console.error('Failed to fetch creator info:', error);
          setCreatorInfo(null);
        } finally {
          setLoadingCreator(false);
        }
      };
      
      fetchCreator();
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

  const toggleDepartment = (dept: string) => {
    setDepartments(prev =>
      prev.includes(dept)
        ? prev.filter(d => d !== dept)
        : [...prev, dept]
    );
  };

  const addCustomDepartment = () => {
    if (customDepartment.trim() && !departments.includes(customDepartment.trim())) {
      setDepartments(prev => [...prev, customDepartment.trim()]);
      setCustomDepartment('');
    }
  };

  const handleAISuggestDepartments = async () => {
    if (!formData.title.trim() && !formData.description.trim()) {
      alert('Please enter a title or description first');
      return;
    }

    setAiSuggestingDepts(true);
    try {
      const response = await apiClient.autoFill({
        field_name: 'departments',
        existing_data: {
          title: formData.title,
          description: formData.description,
          category: formData.category,
        }
      });

      if (response.result) {
        const suggestedRaw = response.result
          .split(/[,\n]/)
          .map(d => d.trim())
          .filter(d => d.length > 0);

        const matchedDepts = suggestedRaw.filter(suggested => 
          predefinedDepartments.some(predefined => 
            predefined.toLowerCase().includes(suggested.toLowerCase()) || 
            suggested.toLowerCase().includes(predefined.toLowerCase())
          )
        ).map(suggested => {
          return predefinedDepartments.find(predefined => 
            predefined.toLowerCase().includes(suggested.toLowerCase()) || 
            suggested.toLowerCase().includes(predefined.toLowerCase())
          ) || suggested;
        });

        const customDepts = suggestedRaw.filter(suggested => 
          !predefinedDepartments.some(predefined => 
            predefined.toLowerCase().includes(suggested.toLowerCase()) || 
            suggested.toLowerCase().includes(predefined.toLowerCase())
          )
        ).slice(0, 3);

        setDepartments(prev => [...new Set([...prev, ...matchedDepts, ...customDepts])]);
      }
    } catch (error) {
      console.error('Failed to suggest departments:', error);
      alert('Failed to suggest departments with AI.');
    } finally {
      setAiSuggestingDepts(false);
    }
  };

  const handleAIEnhance = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title first');
      return;
    }

    setAiEnhancing(true);
    try {
      const response = await apiClient.enhanceIdea({
        title: formData.title,
        description: formData.description || undefined,
        possible_outcome: formData.possible_outcome || undefined,
        departments: departments.length > 0 ? departments : undefined,
        category: formData.category || undefined,
      });

      if (response.success && response.enhanced_data) {
        setFormData(prev => ({
          ...prev,
          title: response.enhanced_data.title || prev.title,
          description: response.enhanced_data.description || prev.description,
          possible_outcome: response.enhanced_data.possible_outcome || prev.possible_outcome,
        }));
      }
    } catch (error) {
      console.error('Failed to enhance idea:', error);
      alert('Failed to enhance idea with AI.');
    } finally {
      setAiEnhancing(false);
    }
  };

  if (showDeleteConfirm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="p-6">
            <DialogTitle className="text-xl font-bold mb-2">Delete Idea</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this idea? This action cannot be undone.
            </DialogDescription>
            <DialogFooter className="flex gap-2">
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
      <DialogContent className="max-w-2xl p-0">
        {/* Header with Icon and Move to Project Button */}
        <div className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Edit Idea</DialogTitle>
                {creatorInfo && (
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>Created by: {creatorInfo.first_name} {creatorInfo.middle_name} {creatorInfo.last_name}</span>
                  </div>
                )}
                {loadingCreator && (
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-muted-foreground"></div>
                    <span>Loading creator info...</span>
                  </div>
                )}
              </div>
            </div>
            {onMoveToProject && (
              <Button 
                onClick={handleMoveToProject} 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md"
                size="sm"
              >
                <Rocket className="h-4 w-4 mr-1" />
                Move to Project
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-idea-title" className="text-sm font-medium">Title</Label>
            <Input
              id="edit-idea-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter your idea title"
              className="h-9"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-idea-description" className="text-sm font-medium">Description</Label>
            <textarea
              id="edit-idea-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your idea"
              className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          {/* Possible Outcome */}
          <div className="space-y-2">
            <Label htmlFor="edit-idea-outcome" className="text-sm font-medium">Possible Outcome (Optional)</Label>
            <textarea
              id="edit-idea-outcome"
              value={formData.possible_outcome}
              onChange={(e) => setFormData({ ...formData, possible_outcome: e.target.value })}
              placeholder="What could be the expected outcome?"
              className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          {/* Departments Affected */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Departments Affected</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={handleAISuggestDepartments}
                disabled={aiSuggestingDepts}
                className="h-7 text-xs px-2"
              >
                {aiSuggestingDepts ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1"></div>
                    Suggesting...
                  </>
                ) : (
                  <>
                    <Bot className="h-3 w-3 mr-1" />
                    AI Suggest
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {predefinedDepartments.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => toggleDepartment(dept)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    departments.includes(dept)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={customDepartment}
                onChange={(e) => setCustomDepartment(e.target.value)}
                placeholder="Add custom department..."
                className="flex-1 h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomDepartment();
                  }
                }}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addCustomDepartment}
                disabled={!customDepartment.trim()}
                className="h-8 px-3"
              >
                Add
              </Button>
            </div>

            {/* Selected Departments */}
            {departments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {departments.map((dept) => (
                  <Badge
                    key={dept}
                    variant="secondary"
                    className="text-xs pr-1"
                  >
                    {dept}
                    <button
                      onClick={() => toggleDepartment(dept)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Improve with AI Assistant */}
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
                    <span className="animate-pulse">AI is enhancing your idea...</span>
                    <Sparkles className="h-4 w-4 animate-pulse" />
                  </div>
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  Improve with AI Assistant
                </>
              )}
            </Button>
            {aiEnhancing && (
              <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 opacity-30 blur-xl animate-pulse"></div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t bg-muted/20">
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
              Cancel
            </Button>
            <Button onClick={handleUpdate} size="sm" className="h-9">
              Update Idea
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
