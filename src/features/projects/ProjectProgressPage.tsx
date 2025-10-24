import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, CheckSquare, Clock, User, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { apiClient } from '../../services/api';
import type { ProjectResponse, TaskResponse } from '../../types/api';
import { AddTaskModal, TaskDetailModal } from '../../components/modals';

interface KanbanColumn {
  id: string;
  title: string;
  tasks: TaskResponse[];
  icon: typeof CheckSquare;
  bgColor: string;
  iconColor: string;
}

export function ProjectProgressPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectResponse | null>(null);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const [projectResponse, tasksResponse] = await Promise.all([
        apiClient.getProject(projectId),
        apiClient.listTasks(0, 100, undefined, projectId),
      ]);
      setProject(projectResponse);
      setTasks(tasksResponse.tasks || []);
    } catch (error) {
      console.error('Failed to load project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: KanbanColumn[] = [
    {
      id: 'unassigned',
      title: 'Unassigned',
      tasks: tasks.filter(t => !t.assigned_to && t.status !== 'done' && t.status !== 'completed'),
      icon: AlertCircle,
      bgColor: 'bg-gray-50 dark:bg-gray-900',
      iconColor: 'text-gray-600',
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      tasks: tasks.filter(t => t.assigned_to && (t.status === 'in_progress' || t.status === 'todo')),
      icon: Clock,
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      iconColor: 'text-blue-600',
    },
    {
      id: 'done',
      title: 'Done',
      tasks: tasks.filter(t => t.status === 'done' || t.status === 'completed'),
      icon: CheckSquare,
      bgColor: 'bg-green-50 dark:bg-green-950',
      iconColor: 'text-green-600',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'todo': 'bg-gray-100 text-gray-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'under_review': 'bg-yellow-100 text-yellow-700',
      'completed': 'bg-green-100 text-green-700',
      'done': 'bg-green-100 text-green-700',
      'on_hold': 'bg-red-100 text-red-700',
      'blocked': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowTaskDetailModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project progress...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">Project not found</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center gap-4 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{project.title}</h1>
              {project.project_number && (
                <Badge variant="outline">{project.project_number}</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Track task progress and assignments</p>
          </div>
          <Button onClick={() => setShowAddTaskModal(true)} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unassigned</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-gray-600">
                {tasks.filter(t => !t.assigned_to && t.status !== 'done').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-blue-600">
                {tasks.filter(t => t.assigned_to && (t.status === 'in_progress' || t.status === 'todo')).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.status === 'done' || t.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {columns.map((column) => {
          const Icon = column.icon;
          return (
            <div key={column.id} className={`flex-1 ${column.bgColor} rounded-lg p-4 flex flex-col min-w-0 border`}>
              {/* Column Header */}
              <div className="flex-shrink-0 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${column.iconColor}`} />
                    <h2 className="font-semibold text-sm">{column.title}</h2>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {column.tasks.length}
                  </Badge>
                </div>
              </div>

              {/* Column Content */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
                {column.tasks.length === 0 ? (
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <Icon className="h-6 w-6 mx-auto mb-1 text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground">No tasks</p>
                  </div>
                ) : (
                  column.tasks.map((task) => (
                    <Card
                      key={task.id}
                      onClick={() => handleTaskClick(task.id)}
                      className="bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow cursor-pointer group border-l-4"
                      style={{
                        borderLeftColor: column.id === 'unassigned' ? '#6b7280' : column.id === 'in_progress' ? '#3b82f6' : '#10b981'
                      }}
                    >
                      <CardHeader className="p-3 pb-2 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors flex-1">
                            {task.title}
                          </CardTitle>
                          <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0 space-y-2">
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          {task.due_date && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(task.due_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          {task.assigned_to && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span className="text-xs">Assigned</span>
                            </div>
                          )}
                          {task.backlog && (
                            <Badge variant="secondary" className="text-xs">
                              {task.backlog.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        open={showAddTaskModal}
        onOpenChange={setShowAddTaskModal}
        onSuccess={loadData}
        projectId={projectId}
        projectContext={project ? {
          title: project.title,
          description: project.description || '',
          project_brief: project.project_brief || '',
          desired_outcomes: project.desired_outcomes || '',
        } : undefined}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        taskId={selectedTaskId}
        open={showTaskDetailModal}
        onOpenChange={setShowTaskDetailModal}
        onSuccess={loadData}
      />
    </div>
  );
}

