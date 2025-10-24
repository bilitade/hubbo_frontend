import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Lightbulb, X, Plus, Bot, Upload, FileText, Building2, Sparkles } from 'lucide-react';
import { apiClient } from '../../../services/api';

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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [aiSuggestingDepts, setAiSuggestingDepts] = useState(false);
  const [aiEnhancedFields, setAiEnhancedFields] = useState<Set<string>>(new Set());

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
    setUploadedFile(null);
    setAiEnhancedFields(new Set());
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
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
        const enhancedFieldsSet = new Set<string>();
        
        setIdeaFormData(prev => {
          const updated = { ...prev };
          
          if (response.enhanced_data.title) {
            updated.title = response.enhanced_data.title;
            enhancedFieldsSet.add('title');
          }
          if (response.enhanced_data.description) {
            updated.description = response.enhanced_data.description;
            enhancedFieldsSet.add('description');
          }
          if (response.enhanced_data.possible_outcome) {
            updated.possible_outcome = response.enhanced_data.possible_outcome;
            enhancedFieldsSet.add('possible_outcome');
          }
          
          return updated;
        });

        setAiEnhancedFields(enhancedFieldsSet);
        
        setTimeout(() => {
          setAiEnhancedFields(new Set());
        }, 3000);
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

        setAiEnhancedFields(new Set(['departments']));
        setTimeout(() => {
          setAiEnhancedFields(new Set());
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to suggest departments:', error);
      alert('Failed to suggest departments with AI.');
    } finally {
      setAiSuggestingDepts(false);
    }
  };

  const customDepartmentsList = ideaFormData.departments.filter(
    d => !predefinedDepartments.includes(d)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[60vw] max-h-[85vh] flex flex-col overflow-hidden">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              Add New Idea
            </DialogTitle>
            <DialogDescription className="text-base">
              Capture your innovative ideas and add them to the workflow
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Title - Full Width */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="idea-title" className="text-base font-semibold">Title</Label>
              {aiEnhancedFields.has('title') && (
                <Badge variant="default" className="text-xs bg-green-500 animate-pulse">
                  <Bot className="h-3 w-3 mr-1" />
                  AI Enhanced
                </Badge>
              )}
            </div>
            <Input
              id="idea-title"
              value={ideaFormData.title}
              onChange={(e) => setIdeaFormData({ ...ideaFormData, title: e.target.value })}
              placeholder="Enter your idea title"
              className={`${aiEnhancedFields.has('title') ? 'border-green-500 ring-2 ring-green-500/20' : ''}`}
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="idea-description" className="text-base font-semibold">Description</Label>
                {aiEnhancedFields.has('description') && (
                  <Badge variant="default" className="text-xs bg-green-500 animate-pulse">
                    <Bot className="h-3 w-3 mr-1" />
                    AI Enhanced
                  </Badge>
                )}
              </div>
              <textarea
                id="idea-description"
                value={ideaFormData.description}
                onChange={(e) => setIdeaFormData({ ...ideaFormData, description: e.target.value })}
                placeholder="Describe your idea"
                className={`w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ${aiEnhancedFields.has('description') ? 'border-green-500 ring-2 ring-green-500/20' : ''}`}
              />
            </div>

            {/* Right Column: Possible Outcome */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="idea-outcome" className="text-base font-semibold">Possible Outcome (Optional)</Label>
                {aiEnhancedFields.has('possible_outcome') && (
                  <Badge variant="default" className="text-xs bg-green-500 animate-pulse">
                    <Bot className="h-3 w-3 mr-1" />
                    AI Enhanced
                  </Badge>
                )}
              </div>
              <textarea
                id="idea-outcome"
                value={ideaFormData.possible_outcome}
                onChange={(e) => setIdeaFormData({ ...ideaFormData, possible_outcome: e.target.value })}
                placeholder="What could be the expected outcome?"
                className={`w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ${aiEnhancedFields.has('possible_outcome') ? 'border-green-500 ring-2 ring-green-500/20' : ''}`}
              />
            </div>
          </div>

          {/* Generate from Document */}
          <div className="border rounded-lg p-5 bg-gradient-to-br from-muted/50 to-muted/30 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label className="text-base font-semibold">Upload Document</Label>
                <p className="text-xs text-muted-foreground">Generate idea from PDF, DOC, or TXT file</p>
              </div>
            </div>
            
            {!uploadedFile ? (
              <div className="relative">
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt"
                  className="cursor-pointer"
                />
              </div>
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

          {/* Departments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <Label className="text-base font-semibold">Departments Affected</Label>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="lg"
                onClick={handleAISuggestDepartments}
                disabled={aiSuggestingDepts}
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
            
            {aiEnhancedFields.has('departments') && (
              <Badge variant="default" className="text-xs bg-green-500 animate-pulse mb-2">
                <Bot className="h-3 w-3 mr-1" />
                AI Suggested
              </Badge>
            )}
            
            <div className={`flex flex-wrap gap-2 p-3 border rounded-lg bg-background min-h-[80px] ${aiEnhancedFields.has('departments') ? 'border-green-500 ring-2 ring-green-500/20' : ''}`}>
              {predefinedDepartments.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => toggleDepartment(dept)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    ideaFormData.departments.includes(dept)
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-border'
                  }`}
                >
                  {dept}
                  {ideaFormData.departments.includes(dept) && (
                    <X className="h-3 w-3" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <Input
                value={customDepartment}
                onChange={(e) => setCustomDepartment(e.target.value)}
                placeholder="Add custom department..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomDepartment();
                  }
                }}
              />
              <Button 
                type="button" 
                variant="secondary" 
                onClick={addCustomDepartment}
                disabled={!customDepartment.trim()}
              >
                Add
              </Button>
            </div>

            {customDepartmentsList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {customDepartmentsList.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => toggleDepartment(dept)}
                    className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all whitespace-nowrap h-5"
                  >
                    {dept}
                    <X className="h-2.5 w-2.5" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AI Improvement */}
          <div className="border-t pt-6">
            <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-green-500/10 rounded-lg p-4 border border-purple-200/50 dark:border-purple-800/50">
              <div className="flex items-start gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">AI Enhancement</h4>
                  <p className="text-xs text-muted-foreground">
                    Let AI improve your title, description, and suggest possible outcomes
                  </p>
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="default"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={handleAIEnhance}
                disabled={aiEnhancing || !ideaFormData.title.trim()}
              >
                {aiEnhancing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enhancing with AI...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Improve with AI Assistant
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleAddIdea}>
              <Plus className="h-4 w-4 mr-2" />
              Add to Inbox
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

