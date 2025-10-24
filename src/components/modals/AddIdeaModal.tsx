import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X, Plus, Bot, Lightbulb, Sparkles } from 'lucide-react';
import { apiClient } from '../../services/api';

interface AddIdeaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddIdeaModal({ open, onOpenChange, onSuccess }: AddIdeaModalProps) {
  const [ideaFormData, setIdeaFormData] = useState({
    title: '',
    description: '',
    departments: [] as string[],
    category: '',
    possible_outcome: '',
  });
  const [customDepartment, setCustomDepartment] = useState('');
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [aiSuggestingDepts, setAiSuggestingDepts] = useState(false);

  const predefinedDepartments = [
    'Marketing',
    'Business Operations',
    'Card Banking',
    'Technology',
    'Customer Service',
    'Finance'
  ];

  const resetForm = () => {
    setIdeaFormData({
      title: '',
      description: '',
      departments: [],
      category: '',
      possible_outcome: '',
    });
    setCustomDepartment('');
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const handleAddIdea = async () => {
    if (!ideaFormData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      await apiClient.createIdea({
        title: ideaFormData.title,
        description: ideaFormData.description,
        departments: ideaFormData.departments,
        category: ideaFormData.category || undefined,
        possible_outcome: ideaFormData.possible_outcome || 'To be determined',
        status: 'inbox',
      });
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to create idea:', error);
      alert('Failed to create idea');
    }
  };

  const toggleDepartment = (dept: string) => {
    setIdeaFormData(prev => ({
      ...prev,
      departments: prev.departments.includes(dept)
        ? prev.departments.filter(d => d !== dept)
        : [...prev.departments, dept]
    }));
  };

  const addCustomDepartment = () => {
    if (customDepartment.trim() && !ideaFormData.departments.includes(customDepartment.trim())) {
      setIdeaFormData(prev => ({
        ...prev,
        departments: [...prev.departments, customDepartment.trim()]
      }));
      setCustomDepartment('');
    }
  };

  const handleAIEnhance = async () => {
    if (!ideaFormData.title.trim()) {
      alert('Please enter a title first');
      return;
    }

    setAiEnhancing(true);
    try {
      const response = await apiClient.enhanceIdea({
        title: ideaFormData.title,
        description: ideaFormData.description || undefined,
        possible_outcome: ideaFormData.possible_outcome || undefined,
        departments: ideaFormData.departments.length > 0 ? ideaFormData.departments : undefined,
        category: ideaFormData.category || undefined,
      });

      if (response.success && response.enhanced_data) {
        setIdeaFormData(prev => ({
          ...prev,
          title: response.enhanced_data.title || prev.title,
          description: response.enhanced_data.description || prev.description,
          possible_outcome: response.enhanced_data.possible_outcome || prev.possible_outcome,
        }));
      }
    } catch (error) {
      console.error('Failed to enhance idea:', error);
      alert('Failed to enhance idea with AI. Please check if AI is configured in backend.');
    } finally {
      setAiEnhancing(false);
    }
  };

  const handleAISuggestDepartments = async () => {
    if (!ideaFormData.title.trim() && !ideaFormData.description.trim()) {
      alert('Please enter a title or description first');
      return;
    }

    setAiSuggestingDepts(true);
    try {
      const response = await apiClient.autoFill({
        field_name: 'departments',
        existing_data: {
          title: ideaFormData.title,
          description: ideaFormData.description,
          category: ideaFormData.category,
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

        setIdeaFormData(prev => ({
          ...prev,
          departments: [...new Set([...prev.departments, ...matchedDepts, ...customDepts])]
        }));
      }
    } catch (error) {
      console.error('Failed to suggest departments:', error);
      alert('Failed to suggest departments with AI.');
    } finally {
      setAiSuggestingDepts(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        {/* Header with Icon */}
        <div className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold">Add New Idea</DialogTitle>
          </div>
        </div>

        {/* Content - No Scroll */}
        <div className="px-6 py-4 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="idea-title" className="text-sm font-medium">Title</Label>
            <Input
              id="idea-title"
              value={ideaFormData.title}
              onChange={(e) => setIdeaFormData({ ...ideaFormData, title: e.target.value })}
              placeholder="Enter your idea title"
              className="h-9"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="idea-description" className="text-sm font-medium">Description</Label>
            <textarea
              id="idea-description"
              value={ideaFormData.description}
              onChange={(e) => setIdeaFormData({ ...ideaFormData, description: e.target.value })}
              placeholder="Describe your idea"
              className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          {/* Possible Outcome (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="idea-outcome" className="text-sm font-medium">Possible Outcome (Optional)</Label>
            <textarea
              id="idea-outcome"
              value={ideaFormData.possible_outcome}
              onChange={(e) => setIdeaFormData({ ...ideaFormData, possible_outcome: e.target.value })}
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
                    ideaFormData.departments.includes(dept)
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
            {ideaFormData.departments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {ideaFormData.departments.map((dept) => (
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
              disabled={aiEnhancing || !ideaFormData.title.trim()}
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
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/20">
          <Button variant="outline" size="sm" onClick={handleClose} className="h-9">
            Cancel
          </Button>
          <Button onClick={handleAddIdea} size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-1" />
            Add Idea
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
