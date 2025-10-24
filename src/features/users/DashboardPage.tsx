import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Lightbulb, FolderKanban, CheckCircle2, User } from 'lucide-react';
import { apiClient } from '../../services/api';
import type { IdeaResponse, ProjectResponse } from '../../types/api';
import { AddIdeaModal, EditProjectModal } from '../../components/modals';

interface KanbanColumn {
  id: string;
  title: string;
  items: (IdeaResponse | ProjectResponse)[];
  icon: typeof Lightbulb;
  bgColor: string;
  iconColor: string;
}

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [ideas, setIdeas] = useState<IdeaResponse[]>([]);
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showAddIdeaModal, setShowAddIdeaModal] = useState(false);

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

  const handleCloseProjectModal = () => {
    setShowProjectModal(false);
    setSelectedProject(null);
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

      {/* Modals */}
      <AddIdeaModal
        open={showAddIdeaModal}
        onOpenChange={setShowAddIdeaModal}
        onSuccess={loadData}
      />

      <EditProjectModal
        project={selectedProject}
        open={showProjectModal}
        onOpenChange={handleCloseProjectModal}
        onSuccess={loadData}
        onDelete={() => {
          loadData();
          handleCloseProjectModal();
        }}
      />
    </div>
  );
}
