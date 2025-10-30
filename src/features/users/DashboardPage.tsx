import { useState, useEffect, useCallback } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCenter, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  useDroppable, 
  useDraggable 
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Lightbulb, FolderKanban, CheckCircle2, User, GripVertical, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/api';
import type { IdeaResponse, ProjectResponse } from '../../types/api';
import { AddIdeaModal, EditProjectModal, AddTaskModal } from '../../components/modals';
import { useAuth } from '../../contexts/AuthContext';

interface DroppableColumnProps {
  id: string;
  children: React.ReactNode;
  bgColor: string;
  isOver?: boolean;
}

function DroppableColumn({ id, children, bgColor }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  return (
    <div 
      ref={setNodeRef}
      className={`flex-1 ${bgColor} rounded-2xl p-3 sm:p-4 flex flex-col min-w-[280px] lg:min-w-0 border-2 shadow-lg transition-all duration-300 ${
        isOver ? 'ring-4 ring-primary/40 scale-[1.02] shadow-brand-lg border-primary' : 'border-transparent'
      }`}
    >
      {children}
    </div>
  );
}

interface DraggableProjectCardProps {
  project: ProjectResponse;
  onClick: () => void;
}

function DraggableProjectCard({ project, onClick }: DraggableProjectCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'planning': 'bg-accent/10 text-accent-700 border-accent/30',
      'not_started': 'bg-secondary-100 text-secondary-700 border-secondary-300',
      'in_progress': 'bg-primary/10 text-primary-700 border-primary/30',
      'done': 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700',
    };
    return colors[status] || 'bg-secondary-100 text-secondary-700';
  };

  const workflowPct = (project.workflow_step * 100) / 5;
  const taskPct = project.progress_percentage || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={isDragging ? 'opacity-40 cursor-grabbing' : 'cursor-grab'}
    >
      <Card
        className="bg-white dark:bg-gray-800 hover:shadow-brand-lg transition-all duration-300 cursor-pointer group border-l-4 border-primary hover:scale-[1.03] hover:-translate-y-1"
        onClick={(e) => {
          if (!isDragging) {
            e.stopPropagation();
            onClick();
          }
        }}
      >
        <CardHeader className="p-4 pb-2 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <GripVertical className="h-4 w-4 text-primary/30 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              <CardTitle className="text-sm font-bold line-clamp-2 group-hover:text-primary transition-colors">
                {project.title}
              </CardTitle>
            </div>
            <FolderKanban className="h-4 w-4 text-primary flex-shrink-0" />
          </div>
          {project.project_number && (
            <Badge variant="outline" className="text-[10px] w-fit border-primary/30 text-primary">
              {project.project_number}
            </Badge>
          )}
        </CardHeader>
        
        <CardContent className="p-4 pt-0 space-y-3">
          {project.description && (
            <CardDescription className="text-xs line-clamp-2 leading-snug">
              {project.description}
            </CardDescription>
          )}
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`text-[10px] px-2 py-0.5 border ${getStatusColor(project.status)}`}>
              {project.status.replace('_', ' ')}
            </Badge>
            {project.owner_id && (
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                <User className="h-3 w-3 text-primary" />
              </div>
            )}
          </div>

          {/* Dual Progress Bars */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="font-medium">Workflow</span>
                <span className="font-bold">{project.workflow_step}/5</span>
              </div>
              <div className="w-full bg-secondary-100 dark:bg-secondary-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-brand-gradient h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${workflowPct}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="font-medium">Tasks</span>
                <span className="font-bold">{Math.round(taskPct)}%</span>
              </div>
              <div className="w-full bg-secondary-100 dark:bg-secondary-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-accent-gradient h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${taskPct}%` }}
                />
              </div>
            </div>
          </div>

          {project.departments && project.departments.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.departments.slice(0, 2).map((dept, idx) => (
                <Badge key={idx} variant="secondary" className="text-[9px] px-1.5 py-0.5 bg-secondary-100 dark:bg-secondary-800">
                  {dept}
                </Badge>
              ))}
              {project.departments.length > 2 && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5 bg-secondary-100 dark:bg-secondary-800">
                  +{project.departments.length - 2}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ideas, setIdeas] = useState<IdeaResponse[]>([]);
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showAddIdeaModal, setShowAddIdeaModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [activeProject, setActiveProject] = useState<ProjectResponse | null>(null);
  const [taskContext, setTaskContext] = useState<{
    projectId: string;
    projectData: {
      title: string;
      description?: string;
      project_brief?: string;
      desired_outcomes?: string;
    };
  } | null>(null);
  const [myAssignedTaskCount, setMyAssignedTaskCount] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [ideasData, projectsData] = await Promise.all([
        apiClient.listIdeas(0, 100, undefined, false),
        apiClient.listProjects(0, 100, undefined, undefined, false),
      ]);
      setIdeas(ideasData.ideas || []);
      setProjects(projectsData.projects || []);

      if (user?.id) {
        try {
          const myTasksResponse = await apiClient.listTasks(0, 1, undefined, undefined, undefined, user.id);
          setMyAssignedTaskCount(myTasksResponse.total || 0);
        } catch (taskCountError) {
          console.error('Failed to load assigned task count:', taskCountError);
          setMyAssignedTaskCount(0);
        }
      } else {
        setMyAssignedTaskCount(0);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, loadData]);

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

  const handleGenerateTasks = (projectId: string, projectData: {
    title: string;
    description?: string;
    project_brief?: string;
    desired_outcomes?: string;
  }) => {
    setTaskContext({ projectId, projectData });
    setShowAddTaskModal(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const project = projects.find(p => p.id === event.active.id);
    if (project) {
      setActiveProject(project);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);

    if (!over) return;

    const projectId = active.id as string;
    const newBacklog = over.id as string;

    const validBacklogs = ['business_innovation', 'engineering', 'output_adoption'];
    if (!validBacklogs.includes(newBacklog)) return;

    const project = projects.find(p => p.id === projectId);
    if (!project || project.backlog === newBacklog) return;

    setProjects(prev => 
      prev.map(p => 
        p.id === projectId ? { ...p, backlog: newBacklog } : p
      )
    );

    try {
      await apiClient.updateProject(projectId, { backlog: newBacklog });
    } catch (error) {
      console.error('Failed to update project backlog:', error);
      loadData();
    }
  };

  const columns = [
    {
      id: 'inbox',
      title: 'Ideas',
      subtitle: 'Capture & Explore',
      items: ideas.filter(i => !i.is_archived),
      icon: Lightbulb,
      bgColor: 'bg-gradient-to-br from-accent/5 to-accent/10 dark:from-accent-900/20 dark:to-accent-800/10',
      iconColor: 'text-accent',
      borderColor: 'border-accent',
    },
    {
      id: 'business_innovation',
      title: 'Business',
      subtitle: 'Innovation Focus',
      items: projects.filter(p => !p.is_archived && p.backlog === 'business_innovation' && p.status !== 'done'),
      icon: Zap,
      bgColor: 'bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary-900/20 dark:to-primary-800/10',
      iconColor: 'text-brand-primary',
      borderColor: 'border-primary',
    },
    {
      id: 'engineering',
      title: 'Engineering',
      subtitle: 'Build & Develop',
      items: projects.filter(p => !p.is_archived && p.backlog === 'engineering' && p.status !== 'done'),
      icon: FolderKanban,
      bgColor: 'bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary-800/20 dark:to-primary-900/10',
      iconColor: 'text-primary-700',
      borderColor: 'border-primary-600',
    },
    {
      id: 'output_adoption',
      title: 'Outcomes',
      subtitle: 'Deliver & Adopt',
      items: projects.filter(p => !p.is_archived && p.backlog === 'output_adoption' && p.status !== 'done'),
      icon: TrendingUp,
      bgColor: 'bg-gradient-to-br from-accent/10 to-primary/10 dark:from-accent-900/10 dark:to-primary-900/10',
      iconColor: 'text-accent-600',
      borderColor: 'border-accent',
    },
    {
      id: 'completed',
      title: 'Completed',
      subtitle: 'Success Stories',
      items: projects.filter(p => !p.is_archived && p.status === 'done'),
      icon: CheckCircle2,
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20',
      iconColor: 'text-green-600',
      borderColor: 'border-green-400',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'inbox': 'bg-accent/10 text-accent-700 border-accent/30',
      'planning': 'bg-accent/10 text-accent-700 border-accent/30',
      'not_started': 'bg-secondary-100 text-secondary-700 border-secondary-300',
      'in_progress': 'bg-primary/10 text-primary-700 border-primary/30',
      'done': 'bg-green-100 text-green-700 border-green-300',
    };
    return colors[status] || 'bg-secondary-100 text-secondary-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-brand-gradient rounded-full animate-ping opacity-40"></div>
            <div className="absolute inset-0 bg-brand-gradient rounded-full animate-pulse opacity-60"></div>
            <div className="relative flex items-center justify-center h-full">
              <Sparkles className="h-10 w-10 text-white animate-spin" />
            </div>
          </div>
          <p className="text-base text-muted-foreground font-semibold">Loading your workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-gradient rounded-xl flex items-center justify-center shadow-brand">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Workflow Board
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                From ideas to success - Drag projects between backlogs
              </p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="flex gap-3 flex-wrap">
            <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 hover:scale-105 transition-transform">
              <div className="font-bold text-lg sm:text-xl text-primary">{ideas.filter(i => !i.is_archived).length}</div>
              <div className="text-muted-foreground text-[10px] sm:text-xs font-medium">Ideas</div>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 hover:scale-105 transition-transform">
              <div className="font-bold text-lg sm:text-xl text-primary">{projects.filter(p => !p.is_archived && p.status !== 'done').length}</div>
              <div className="text-muted-foreground text-[10px] sm:text-xs font-medium">Active</div>
            </div>
            <div className="bg-accent/10 border border-accent/20 rounded-lg px-4 py-2 hover:scale-105 transition-transform">
              <div className="font-bold text-lg sm:text-xl text-accent">{projects.filter(p => !p.is_archived && p.status === 'done').length}</div>
              <div className="text-muted-foreground text-[10px] sm:text-xs font-medium">Done</div>
            </div>
            {user?.id && (
              <button
                type="button"
                onClick={() => navigate('/dashboard/tasks')}
                className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-2 hover:scale-105 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <div className="font-bold text-lg sm:text-xl text-emerald-600 dark:text-emerald-300">{myAssignedTaskCount}</div>
                <div className="text-muted-foreground text-[10px] sm:text-xs font-medium">Assigned to Me</div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="h-full flex gap-3 sm:gap-4 overflow-x-auto overflow-y-hidden pb-4">
              {columns.map((column) => {
                const Icon = column.icon;
                const isDraggableColumn = ['business_innovation', 'engineering', 'output_adoption'].includes(column.id);
                
                return (
                  <DroppableColumn key={column.id} id={column.id} bgColor={column.bgColor}>
                    <div className="flex-shrink-0 mb-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-xl glass backdrop-blur-sm shadow-sm border-2 ${column.borderColor}`}>
                            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${column.iconColor}`} />
                          </div>
                          <div>
                            <h2 className="font-bold text-sm sm:text-base text-foreground">{column.title}</h2>
                            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{column.subtitle}</p>
                          </div>
                        </div>
                        <Badge className={`text-xs font-bold px-3 py-1 border-2 ${column.borderColor} ${column.iconColor.replace('text', 'bg').replace('600', '100')} ${column.iconColor}`}>
                          {column.items.length}
                        </Badge>
                      </div>
                      
                      {column.id === 'inbox' && (
                        <button 
                          onClick={() => setShowAddIdeaModal(true)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-800 hover:bg-accent/5 dark:hover:bg-accent/10 border-2 border-dashed border-accent/40 hover:border-accent rounded-xl text-xs sm:text-sm font-semibold text-accent hover:text-accent-600 transition-all hover:scale-[1.02] shadow-sm hover:shadow-accent"
                        >
                          <Lightbulb className="h-4 w-4" />
                          <span>Add Idea</span>
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-0 custom-scrollbar">
                      {column.items.length === 0 ? (
                        <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 text-center border-2 border-dashed border-border">
                          <Icon className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                          <p className="text-xs text-muted-foreground font-semibold">No items yet</p>
                          {isDraggableColumn && (
                            <p className="text-[10px] text-muted-foreground mt-1">Drop projects here</p>
                          )}
                        </div>
                      ) : (
                        column.items.map((item) => {
                          const isIdeaItem = isIdea(item);
                          
                          if (isIdeaItem) {
                            return (
                              <Card
                                key={item.id}
                                onClick={() => handleCardClick(item)}
                                className="bg-white dark:bg-gray-800 hover:shadow-accent-lg transition-all duration-300 cursor-pointer group border-l-4 border-accent hover:scale-[1.03] hover:-translate-y-1"
                              >
                                <CardHeader className="p-4 pb-2 space-y-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-sm font-bold line-clamp-2 group-hover:text-accent transition-colors flex-1">
                                      {item.title}
                                    </CardTitle>
                                    <Lightbulb className="h-4 w-4 text-accent flex-shrink-0" />
                                  </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 space-y-2">
                                  {item.description && (
                                    <CardDescription className="text-xs line-clamp-2 leading-snug">
                                      {item.description}
                                    </CardDescription>
                                  )}
                                  <Badge className={`text-[10px] px-2 py-0.5 border ${getStatusColor(item.status)}`}>
                                    {item.status}
                                  </Badge>
                                  {item.departments && item.departments.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {item.departments.slice(0, 2).map((dept, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-[9px] px-1.5 py-0.5">
                                          {dept}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          }

                          return (
                            <DraggableProjectCard
                              key={item.id}
                              project={item as ProjectResponse}
                              onClick={() => handleCardClick(item)}
                            />
                          );
                        })
                      )}
                    </div>
                  </DroppableColumn>
                );
              })}
            </div>

            <DragOverlay>
              {activeProject && (
                <div className="rotate-6 scale-110">
                  <Card
                    className="bg-white dark:bg-gray-800 border-l-4 border-primary shadow-brand-lg opacity-95"
                    style={{ width: '280px' }}
                  >
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-sm font-bold line-clamp-2 flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-primary" />
                        {activeProject.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <Badge className={`text-[10px] px-2 py-0.5 border ${getStatusColor(activeProject.status)}`}>
                        {activeProject.status.replace('_', ' ')}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              )}
            </DragOverlay>
        </DndContext>
      </div>

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
        onGenerateTasks={handleGenerateTasks}
      />

      <AddTaskModal
        open={showAddTaskModal}
        onOpenChange={setShowAddTaskModal}
        onSuccess={loadData}
        projectId={taskContext?.projectId}
        projectContext={taskContext?.projectData}
      />
    </div>
  );
}
