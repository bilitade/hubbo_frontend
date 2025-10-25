import { useState, useEffect } from 'react';
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
import { Lightbulb, FolderKanban, CheckCircle2, User, GripVertical, Sparkles } from 'lucide-react';
import { apiClient } from '../../services/api';
import type { IdeaResponse, ProjectResponse } from '../../types/api';
import { AddIdeaModal, EditProjectModal, AddTaskModal } from '../../components/modals';

interface DroppableColumnProps {
  id: string;
  children: React.ReactNode;
  bgColor: string;
}

function DroppableColumn({ id, children, bgColor }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  return (
    <div 
      ref={setNodeRef}
      className={`flex-1 ${bgColor} rounded-xl p-3 sm:p-4 flex flex-col min-w-[280px] lg:min-w-0 border shadow-sm transition-all duration-300 ${
        isOver ? 'ring-4 ring-blue-400/40 scale-[1.02] shadow-xl' : ''
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
      'planning': 'bg-purple-100 text-purple-700',
      'not_started': 'bg-gray-100 text-gray-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'done': 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const workflowPct = (project.workflow_step * 100) / 5;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={isDragging ? 'opacity-40 cursor-grabbing' : 'cursor-grab'}
    >
      <Card
        className="bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 cursor-pointer group border-l-4 hover:scale-[1.03] hover:-translate-y-1"
        style={{ borderLeftColor: '#3b82f6' }}
        onClick={(e) => {
          if (!isDragging) {
            e.stopPropagation();
            onClick();
          }
        }}
      >
        <CardHeader className="p-3 pb-2 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <GripVertical className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              <CardTitle className="text-sm font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                {project.title}
              </CardTitle>
            </div>
            <FolderKanban className="h-4 w-4 text-blue-500 flex-shrink-0" />
          </div>
          {project.project_number && (
            <Badge variant="outline" className="text-[10px] w-fit">
              {project.project_number}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          {project.description && (
            <CardDescription className="text-xs line-clamp-2 leading-snug">
              {project.description}
            </CardDescription>
          )}
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`text-[10px] px-2 py-0.5 ${getStatusColor(project.status)}`}>
              {project.status.replace('_', ' ')}
            </Badge>
            {project.owner_id && (
              <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                <User className="h-3 w-3 text-blue-600" />
              </div>
            )}
          </div>

          <div className="pt-2 border-t space-y-1">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Progress</span>
              <span className="font-medium">{project.workflow_step}{'/'}5</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${workflowPct}%` }}
              />
            </div>
          </div>

          {project.departments && project.departments.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.departments.slice(0, 2).map((dept, idx) => (
                <Badge key={idx} variant="secondary" className="text-[9px] px-1.5 py-0">
                  {dept}
                </Badge>
              ))}
              {project.departments.length > 2 && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

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

  const handleGenerateTasks = (projectId: string, projectData: {
    title: string;
    description?: string;
    project_brief?: string;
    desired_outcomes?: string;
  }) => {
    setTaskContext({
      projectId,
      projectData,
    });
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
      items: ideas,
      icon: Lightbulb,
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30',
      iconColor: 'text-yellow-600',
      accentColor: 'border-yellow-400',
    },
    {
      id: 'business_innovation',
      title: 'Business',
      subtitle: 'Innovation Focus',
      items: projects.filter(p => p.backlog === 'business_innovation' && p.status !== 'done'),
      icon: FolderKanban,
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
      iconColor: 'text-blue-600',
      accentColor: 'border-blue-400',
    },
    {
      id: 'engineering',
      title: 'Engineering',
      subtitle: 'Build & Develop',
      items: projects.filter(p => p.backlog === 'engineering' && p.status !== 'done'),
      icon: FolderKanban,
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
      iconColor: 'text-green-600',
      accentColor: 'border-green-400',
    },
    {
      id: 'output_adoption',
      title: 'Outcomes',
      subtitle: 'Deliver & Adopt',
      items: projects.filter(p => p.backlog === 'output_adoption' && p.status !== 'done'),
      icon: FolderKanban,
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30',
      iconColor: 'text-purple-600',
      accentColor: 'border-purple-400',
    },
    {
      id: 'completed',
      title: 'Completed',
      subtitle: 'Success Stories',
      items: projects.filter(p => p.status === 'done'),
      icon: CheckCircle2,
      bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
      iconColor: 'text-emerald-600',
      accentColor: 'border-emerald-400',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'inbox': 'bg-yellow-100 text-yellow-700',
      'planning': 'bg-purple-100 text-purple-700',
      'not_started': 'bg-gray-100 text-gray-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'done': 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-ping opacity-75"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            <div className="relative flex items-center justify-center h-full">
              <Sparkles className="h-8 w-8 text-white animate-spin" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Loading your workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col -mt-4 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Header with Gradient Background */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-4 sm:px-6 lg:px-8 py-6 sm:py-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 animate-pulse" />
                Workflow Dashboard
              </h1>
              <p className="text-sm sm:text-base text-blue-100 mt-1">
                From ideas to success - Drag projects between backlogs
              </p>
            </div>
            <div className="flex gap-4 text-xs sm:text-sm">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 sm:px-4 sm:py-2">
                <div className="font-bold text-lg sm:text-2xl">{ideas.length}</div>
                <div className="text-blue-100 text-[10px] sm:text-xs">Ideas</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 sm:px-4 sm:py-2">
                <div className="font-bold text-lg sm:text-2xl">{projects.filter(p => p.status !== 'done').length}</div>
                <div className="text-blue-100 text-[10px] sm:text-xs">Active</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 sm:px-4 sm:py-2">
                <div className="font-bold text-lg sm:text-2xl">{projects.filter(p => p.status === 'done').length}</div>
                <div className="text-blue-100 text-[10px] sm:text-xs">Done</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
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
                    <div className="flex-shrink-0 mb-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-sm ${column.accentColor} border-l-4`}>
                            <Icon className={`h-4 w-4 ${column.iconColor}`} />
                          </div>
                          <div>
                            <h2 className="font-bold text-xs sm:text-sm">{column.title}</h2>
                            <p className="text-[10px] text-muted-foreground">{column.subtitle}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs font-bold">
                          {column.items.length}
                        </Badge>
                      </div>
                      
                      {column.id === 'inbox' && (
                        <button 
                          onClick={() => setShowAddIdeaModal(true)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-yellow-50 dark:hover:bg-gray-700 border-2 border-dashed border-yellow-300 hover:border-yellow-400 rounded-lg text-xs sm:text-sm font-medium text-yellow-700 dark:text-yellow-500 hover:text-yellow-800 transition-all hover:scale-[1.02]"
                        >
                          <Lightbulb className="h-4 w-4" />
                          <span>Add Idea</span>
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0 custom-scrollbar">
                      {column.items.length === 0 ? (
                        <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center border-2 border-dashed border-gray-300 dark:border-gray-700">
                          <Icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                          <p className="text-xs text-muted-foreground font-medium">No items yet</p>
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
                                className="bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 cursor-pointer group border-l-4 hover:scale-[1.03] hover:-translate-y-1"
                                style={{ borderLeftColor: '#eab308' }}
                              >
                                <CardHeader className="p-3 pb-2 space-y-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-sm font-semibold line-clamp-2 group-hover:text-yellow-600 transition-colors flex-1">
                                      {item.title}
                                    </CardTitle>
                                    <Lightbulb className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                                  </div>
                                </CardHeader>
                                <CardContent className="p-3 pt-0 space-y-2">
                                  {item.description && (
                                    <CardDescription className="text-xs line-clamp-2 leading-snug">
                                      {item.description}
                                    </CardDescription>
                                  )}
                                  <Badge className={`text-[10px] px-2 py-0.5 ${getStatusColor(item.status)}`}>
                                    {item.status}
                                  </Badge>
                                  {item.departments && item.departments.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {item.departments.slice(0, 2).map((dept, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-[9px] px-1.5 py-0">
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
                    className="bg-white dark:bg-gray-800 border-l-4 shadow-2xl opacity-95"
                    style={{ borderLeftColor: '#3b82f6', width: '280px' }}
                  >
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-sm font-semibold line-clamp-2 flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        {activeProject.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <Badge className={`text-[10px] px-2 py-0.5 ${getStatusColor(activeProject.status)}`}>
                        {activeProject.status.replace('_', ' ')}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
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

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
