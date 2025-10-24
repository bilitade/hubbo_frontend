import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Lightbulb, FolderKanban, CheckCircle2, User, Plus, X, Save, Archive, Trash2, Edit, Bot } from 'lucide-react';
import { apiClient } from '../../services/api';
import type { IdeaResponse, ProjectResponse, ProjectUpdate } from '../../types/api';

interface KanbanColumn {
  id: string;
  title: string;
  items: (IdeaResponse | ProjectResponse)[];
  icon: typeof Lightbulb;
  bgColor: string;
  iconColor: string;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ideas, setIdeas] = useState<IdeaResponse[]>([]);
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<ProjectUpdate>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddIdeaModal, setShowAddIdeaModal] = useState(false);
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ideasData, projectsData] = await Promise.all([
        apiClient.listIdeas(0, 100, undefined, false),
        apiClient.listProjects(0, 100, undefined, undefined, false),
      ]);
      setIdeas(ideasData.ideas || []);
      setProjects(projectsData.projects || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isIdea = (item: IdeaResponse | ProjectResponse): item is IdeaResponse => {
    return 'category' in item;
  };

  const handleCardClick = (item: IdeaResponse | ProjectResponse) => {
    if (!isIdea(item)) {
      setSelectedProject(item as ProjectResponse);
      setShowProjectModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowProjectModal(false);
    setSelectedProject(null);
    setIsEditMode(false);
    setEditFormData({});
  };

  const handleEditClick = () => {
    if (selectedProject) {
      setEditFormData({
        title: selectedProject.title,
        description: selectedProject.description,
        project_brief: selectedProject.project_brief,
        desired_outcomes: selectedProject.desired_outcomes,
        status: selectedProject.status,
        backlog: selectedProject.backlog,
        workflow_step: selectedProject.workflow_step,
      });
      setIsEditMode(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedProject) return;
    try {
      await apiClient.updateProject(selectedProject.id, editFormData);
      await loadData();
      setIsEditMode(false);
      setShowProjectModal(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Failed to update project:', error);
      alert('Failed to update project');
    }
  };

  const handleArchive = async () => {
    if (!selectedProject) return;
    try {
      await apiClient.archiveProject(selectedProject.id);
      await loadData();
      setShowProjectModal(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Failed to archive project:', error);
      alert('Failed to archive project');
    }
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    try {
      await apiClient.deleteProject(selectedProject.id);
      await loadData();
      setShowProjectModal(false);
      setSelectedProject(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    }
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
      await loadData();
      setShowAddIdeaModal(false);
      setIdeaFormData({
        title: '',
        description: '',
        departments: [],
        category: '',
        possible_outcome: '',
      });
      setUploadedFile(null);
      setAiEnhancedFields(new Set());
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

        const predefinedDepts = ['Marketing', 'Business Operations', 'Card Banking', 'Technology', 'Customer Service', 'Finance'];
        const matchedDepts = suggestedRaw.filter(suggested => 
          predefinedDepts.some(predefined => 
            predefined.toLowerCase().includes(suggested.toLowerCase()) || 
            suggested.toLowerCase().includes(predefined.toLowerCase())
          )
        ).map(suggested => {
          return predefinedDepts.find(predefined => 
            predefined.toLowerCase().includes(suggested.toLowerCase()) || 
            suggested.toLowerCase().includes(predefined.toLowerCase())
          ) || suggested;
        });

        const customDepts = suggestedRaw.filter(suggested => 
          !predefinedDepts.some(predefined => 
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

  const columns: KanbanColumn[] = [
    {
      id: 'inbox',
      title: 'Inbox',
      items: ideas,
      icon: Lightbulb,
      bgColor: 'bg-gray-50 dark:bg-gray-900',
      iconColor: 'text-gray-600',
    },
    {
      id: 'business_innovation',
      title: 'Business & Innovation',
      items: projects.filter(p => p.backlog === 'business_innovation' && p.status !== 'completed'),
      icon: FolderKanban,
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      iconColor: 'text-blue-600',
    },
    {
      id: 'engineering',
      title: 'Engineering',
      items: projects.filter(p => p.backlog === 'engineering' && p.status !== 'completed'),
      icon: FolderKanban,
      bgColor: 'bg-green-50 dark:bg-green-950',
      iconColor: 'text-green-600',
    },
    {
      id: 'output_adoption',
      title: 'Outcomes & Adoption',
      items: projects.filter(p => p.backlog === 'output_adoption' && p.status !== 'completed'),
      icon: FolderKanban,
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      iconColor: 'text-purple-600',
    },
    {
      id: 'completed',
      title: 'Completed Projects',
      items: projects.filter(p => p.status === 'completed'),
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
      iconColor: 'text-emerald-600',
    },
  ];

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-2xl font-bold">Workflow</h1>
        <p className="text-sm text-muted-foreground">Track your ideas and projects</p>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {columns.map((column) => {
          const Icon = column.icon;
          return (
            <div key={column.id} className={`flex-1 ${column.bgColor} rounded-lg p-4 flex flex-col min-w-0 border`}>
              {/* Column Header */}
              <div className="flex-shrink-0 mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${column.iconColor}`} />
                    <h2 className="font-semibold text-sm">{column.title}</h2>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {column.items.length}
                  </Badge>
                </div>
                
                {/* Add Idea Button - Only for Inbox */}
                {column.id === 'inbox' && (
                  <button 
                    onClick={() => setShowAddIdeaModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-dashed rounded-lg text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Lightbulb className="h-4 w-4" />
                    <span>Add Idea</span>
                  </button>
                )}
              </div>

              {/* Column Content */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent min-h-0">
                {column.items.length === 0 ? (
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <Icon className="h-6 w-6 mx-auto mb-1 text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground">No items</p>
                  </div>
                ) : (
                  column.items.map((item) => {
                    const isIdeaItem = isIdea(item);
                    return (
                      <Card
                        key={item.id}
                        onClick={() => handleCardClick(item)}
                        className="bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow cursor-pointer group border-l-2"
                        style={{
                          borderLeftColor: isIdeaItem ? '#eab308' : '#3b82f6'
                        }}
                      >
                        <CardHeader className="p-3 pb-2 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors flex-1">
                              {item.title}
                            </CardTitle>
                            {isIdeaItem ? (
                              <Lightbulb className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
                            ) : (
                              <FolderKanban className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 space-y-2">
                          {item.description && (
                            <CardDescription className="text-xs line-clamp-2 leading-snug">
                              {item.description}
                            </CardDescription>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <Badge className={`text-[10px] px-1.5 py-0 ${getStatusColor(item.status)}`}>
                              {item.status.replace('_', ' ')}
                            </Badge>
                            
                            {item.owner_id && (
                              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-2.5 w-2.5 text-primary" />
                              </div>
                            )}
                          </div>

                          {/* Project Progress */}
                          {!isIdeaItem && (item as ProjectResponse).workflow_step !== undefined && (
                            <div className="pt-2 border-t">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-muted rounded-full h-1 overflow-hidden">
                                  <div
                                    className="bg-primary h-1 rounded-full transition-all"
                                    style={{
                                      width: `${((item as ProjectResponse).workflow_step / 5) * 100}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                  {(item as ProjectResponse).workflow_step}/5
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Departments */}
                          {item.departments && item.departments.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.departments.slice(0, 2).map((dept, idx) => (
                                <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0">
                                  {dept}
                                </Badge>
                              ))}
                              {item.departments.length > 2 && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  +{item.departments.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <Dialog open={showProjectModal} onOpenChange={setShowProjectModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{selectedProject.title}</DialogTitle>
              <DialogDescription>
                {selectedProject.project_number && (
                  <Badge variant="outline" className="mt-2">
                    {selectedProject.project_number}
                  </Badge>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
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
                      <Badge className={`mt-1 ${getStatusColor(selectedProject.status)}`}>
                        {selectedProject.status.replace('_', ' ')}
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
                                width: `${(selectedProject.workflow_step / 5) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {selectedProject.workflow_step}/5
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground">Description</Label>
                    <p className="mt-2 text-sm">{selectedProject.description || 'No description'}</p>
                  </div>

                  {selectedProject.project_brief && (
                    <div>
                      <Label className="text-sm font-semibold text-muted-foreground">Project Brief</Label>
                      <p className="mt-2 text-sm">{selectedProject.project_brief}</p>
                    </div>
                  )}

                  {selectedProject.desired_outcomes && (
                    <div>
                      <Label className="text-sm font-semibold text-muted-foreground">Desired Outcomes</Label>
                      <p className="mt-2 text-sm">{selectedProject.desired_outcomes}</p>
                    </div>
                  )}
                </>
              )}

              <div>
                <Label className="text-sm font-semibold text-muted-foreground">Backlog</Label>
                <Badge variant="secondary" className="mt-2">
                  {selectedProject.backlog?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              {selectedProject.departments && selectedProject.departments.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">Departments</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedProject.departments.map((dept, idx) => (
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
                    {new Date(selectedProject.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">Last Updated</Label>
                  <p className="mt-2 text-sm">
                    {new Date(selectedProject.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-between">
              <div className="flex gap-2">
                {!isEditMode && (
                  <>
                    <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                    <Button variant="outline" onClick={handleArchive}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </Button>
                  </>
                )}
              </div>
              
              <div className="flex gap-2">
                {isEditMode ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditMode(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEdit}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleCloseModal}>
                      <X className="h-4 w-4 mr-2" />
                      Close
                    </Button>
                    <Button onClick={handleEditClick}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Project
                    </Button>
                  </>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Idea Modal */}
      <Dialog open={showAddIdeaModal} onOpenChange={setShowAddIdeaModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              Add New Idea
            </DialogTitle>
            <DialogDescription className="text-base">
              Capture your innovative ideas and add them to the workflow
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Title */}
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

            {/* Description */}
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
                className={`w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ${aiEnhancedFields.has('description') ? 'border-green-500 ring-2 ring-green-500/20' : ''}`}
              />
            </div>

            {/* Possible Outcome */}
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
                className={`w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ${aiEnhancedFields.has('possible_outcome') ? 'border-green-500 ring-2 ring-green-500/20' : ''}`}
              />
            </div>

            {/* Generate from Document */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <Label className="text-base font-semibold mb-3 block">Generate Idea from Document</Label>
              <Input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
              />
              {uploadedFile && (
                <Badge variant="secondary" className="flex items-center gap-1 w-fit mt-2">
                  {uploadedFile.name}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setUploadedFile(null)}
                  />
                </Badge>
              )}
            </div>

            {/* Departments */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">Departments Affected</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
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
              
              <div className={`flex flex-wrap gap-2 p-4 border rounded-lg bg-background min-h-[100px] ${aiEnhancedFields.has('departments') ? 'border-green-500 ring-2 ring-green-500/20' : ''}`}>
                {['Marketing', 'Business Operations', 'Card Banking', 'Technology', 'Customer Service', 'Finance'].map((dept) => (
                  <Badge
                    key={dept}
                    variant={ideaFormData.departments.includes(dept) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => toggleDepartment(dept)}
                  >
                    {dept}
                    {ideaFormData.departments.includes(dept) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
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

              {ideaFormData.departments.filter(d => !['Marketing', 'Business Operations', 'Card Banking', 'Technology', 'Customer Service', 'Finance'].includes(d)).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {ideaFormData.departments.filter(d => !['Marketing', 'Business Operations', 'Card Banking', 'Technology', 'Customer Service', 'Finance'].includes(d)).map((dept) => (
                    <Badge
                      key={dept}
                      variant="default"
                      className="cursor-pointer"
                      onClick={() => toggleDepartment(dept)}
                    >
                      {dept}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* AI Improvement */}
            <div className="border-t pt-6">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={handleAIEnhance}
                disabled={aiEnhancing || !ideaFormData.title.trim()}
              >
                {aiEnhancing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Enhancing with AI...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Improve with AI Assistant
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                AI will enhance your title, description, and suggest outcomes
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddIdeaModal(false);
                setIdeaFormData({
                  title: '',
                  description: '',
                  departments: [],
                  category: '',
                  possible_outcome: '',
                });
                setUploadedFile(null);
                setAiEnhancedFields(new Set());
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddIdea}>
              <Plus className="h-4 w-4 mr-2" />
              Add to Inbox
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
