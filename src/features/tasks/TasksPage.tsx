import { useState, useEffect, useMemo } from 'react';
import { Edit, Trash2, User } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { apiClient } from '../../services/api';
import type { TaskResponse, ProjectResponse, UserResponse } from '../../types/api';
import { useAuth } from '../../contexts/AuthContext';
import { TaskDetailModal } from '../../components/modals/TaskDetailModal';

export function TasksPage() {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [projects, setProjects] = useState<Record<string, ProjectResponse>>({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterBacklog, setFilterBacklog] = useState<string>('');
  const [assignedToFilter, setAssignedToFilter] = useState<string>('me');
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [projectOptions, setProjectOptions] = useState<ProjectResponse[]>([]);
  const { user, loading: authLoading } = useAuth();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const getUserDisplayName = (userData: UserResponse) => {
    if (!userData) return 'Unknown User';
    return (
      userData.preferred_name ||
      userData.full_name ||
      [userData.first_name, userData.last_name].filter(Boolean).join(' ') ||
      userData.email
    );
  };

  const statusOptions: { value: string; label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'unassigned', label: 'Unassigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' },
  ];

  const backlogOptions: { value: string; label: string }[] = [
    { value: '', label: 'All Backlogs' },
    { value: 'business_innovation', label: 'Business Innovation' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'output_adoption', label: 'Outcomes & Adoption' },
  ];

  const userOptions = useMemo(() => {
    const combined = user ? [user, ...users] : [...users];
    return combined
      .filter((option, index, self) => self.findIndex((item) => item.id === option.id) === index)
      .sort((a, b) => getUserDisplayName(a).localeCompare(getUserDisplayName(b), undefined, { sensitivity: 'base' }));
  }, [user, users]);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [usersData, projectsResponse] = await Promise.all([
          apiClient.listUsers(0, 100),
          apiClient.listProjects(0, 100, undefined, undefined, false),
        ]);

        setUsers(usersData ?? []);
        setProjectOptions((projectsResponse?.projects ?? []).filter((project) => !project.is_archived));
      } catch (error) {
        console.error('Failed to load filter data:', error);
      }
    };

    fetchFilterData();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id && assignedToFilter === 'me') {
      setAssignedToFilter('all');
    }
    if (user?.id && assignedToFilter === 'all') {
      // No automatic change when user is available and filter was explicitly cleared.
      return;
    }
  }, [authLoading, user?.id, assignedToFilter]);

  useEffect(() => {
    if (authLoading) return;
    loadTasks();
  }, [authLoading, filterStatus, filterBacklog, assignedToFilter, projectFilter]);

  const handleResetFilters = () => {
    setFilterStatus('');
    setFilterBacklog('');
    setProjectFilter('');
    setAssignedToFilter( 'all');
  };

  const handleOpenTaskDetails = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsDetailModalOpen(true);
  };

  const handleDetailModalChange = (open: boolean) => {
    setIsDetailModalOpen(open);
    if (!open) {
      setSelectedTaskId(null);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      
      // Fetch tasks with filters
      const response = await apiClient.listTasks(
        0, 
        100, 
        filterStatus || undefined,
        projectFilter || undefined,
        filterBacklog || undefined,
        assignedToFilter && assignedToFilter !== 'all' && assignedToFilter !== 'me'
          ? assignedToFilter
          : assignedToFilter === 'me' && user?.id
            ? user.id
            : undefined
      );
      
      const filteredTasks = response.tasks;

      // Apply backlog filter if specified
      const filteredTasksWithBacklog = filterBacklog
        ? filteredTasks.filter(task => {
            const taskBacklog = task.project_id 
              ? projects[task.project_id]?.backlog 
              : task.backlog;
            return taskBacklog === filterBacklog;
          })
        : filteredTasks;

      setTasks(filteredTasksWithBacklog);
      
      // Fetch project details for tasks that have project_id
      const uniqueProjectIds = [...new Set(
        response.tasks
          .filter(task => task.project_id)
          .map(task => task.project_id!)
      )];
      
      if (uniqueProjectIds.length > 0) {
        const projectPromises = uniqueProjectIds.map(id => 
          apiClient.getProject(id).catch(() => null)
        );
        const projectResults = await Promise.all(projectPromises);
        
        const projectsMap: Record<string, ProjectResponse> = {};
        projectResults.forEach((project, idx) => {
          if (project) {
            projectsMap[uniqueProjectIds[idx]] = project;
          }
        });
        
        setProjects(projectsMap);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await apiClient.deleteTask(taskId);
      loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'unassigned': 'bg-gray-100 text-gray-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'done': 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Unassigned</p>
          <p className="text-2xl font-bold text-gray-600">
            {tasks.filter(t => t.status === 'unassigned').length}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">
            {tasks.filter(t => t.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Done</p>
          <p className="text-2xl font-bold text-green-600">
            {tasks.filter(t => t.status === 'done').length}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-600">
            {tasks.length}
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track all tasks across projects
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Backlog</label>
          <select
            value={filterBacklog}
            onChange={(e) => setFilterBacklog(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {backlogOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assigned To</label>
          <select
            value={assignedToFilter}
            onChange={(e) => setAssignedToFilter(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={authLoading && assignedToFilter === 'me'}
          >
            <option value="me">{user ? `${getUserDisplayName(user)} (Me)` : 'My Tasks'}</option>
            <option value="all">All Users</option>
            {userOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {getUserDisplayName(option)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Project</label>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Projects</option>
            {projectOptions.map((project) => (
              <option key={project.id} value={project.id}>
                {project.project_number || project.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button variant="ghost" onClick={() => handleResetFilters()} className="text-xs">
        Reset Filters
      </Button>

      {/* Tasks Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Task Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Backlog</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Project ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Accountable</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Responsible</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Due Date</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    No tasks found. Create tasks from projects using AI.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const projectId = task.project_id ?? undefined;
                  const project = projectId ? projects[projectId] : null;
                  const backlog = project?.backlog || task.backlog;
                  
                  return (
                    <tr 
                      key={task.id} 
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-sm">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {backlog ? (
                          <Badge variant="secondary" className="text-xs">
                            {backlog.replace('_', ' ').toUpperCase()}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {project ? (
                          <div className="flex flex-col gap-1">
                            <code className="text-xs bg-muted px-2 py-1 rounded w-fit">
                              {project.project_number || (projectId ? `${projectId.slice(0, 8)}...` : '')}
                            </code>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {project.title}
                            </span>
                          </div>
                        ) : projectId ? (
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {projectId.slice(0, 8)}...
                          </code>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`${getStatusColor(task.status)} text-xs`}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {task.accountable_id ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-3 w-3 text-primary" />
                            </div>
                            <span className="text-xs">{task.accountable_role || 'Assigned'}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {task.assigned_to ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                              <User className="h-3 w-3 text-green-600" />
                            </div>
                            <span className="text-xs">{task.responsible_role || 'Assigned'}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {task.due_date ? (
                          <span className="text-xs">
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No due date</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenTaskDetails(task.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TaskDetailModal
        taskId={selectedTaskId}
        open={isDetailModalOpen}
        onOpenChange={handleDetailModalChange}
        onSuccess={() => {
          loadTasks();
        }}
      />
    </div>
  );
}
