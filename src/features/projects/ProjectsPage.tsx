import { useState, useEffect } from 'react';
import { Plus, Archive, ArchiveRestore, FolderKanban, LayoutGrid, List, User } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { apiClient } from '../../services/api';
import type { ProjectResponse, UserResponse } from '../../types/api';
import { AddProjectModal, EditProjectModal, AddTaskModal } from '../../components/modals';

interface TaskContext {
  projectId: string;
  projectData: {
    title: string;
    description?: string;
    project_brief?: string;
    desired_outcomes?: string;
  };
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterBacklog, setFilterBacklog] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [ownerMap, setOwnerMap] = useState<Record<string, UserResponse>>({});
  const [taskContext, setTaskContext] = useState<TaskContext | null>(null);

  useEffect(() => {
    loadProjects();
  }, [showArchived, filterStatus, filterBacklog]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await apiClient.listProjects(
        0,
        100,
        filterStatus || undefined,
        filterBacklog || undefined,
        showArchived
      );
      setProjects(response.projects);
      
      const ownerIds = [...new Set(response.projects.map(p => p.owner_id).filter(Boolean))] as string[];
      const owners: Record<string, UserResponse> = {};
      await Promise.all(
        ownerIds.map(async (ownerId) => {
          try {
            const owner = await apiClient.getUser(ownerId);
            owners[ownerId] = owner;
          } catch (err) {
            console.error('Failed to fetch owner:', ownerId, err);
          }
        })
      );
      setOwnerMap(owners);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      await apiClient.unarchiveProject(id);
      loadProjects();
    } catch (error) {
      console.error('Failed to unarchive project:', error);
    }
  };

  const openEditModal = (project: ProjectResponse) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedProject(null);
  };

  const handleProjectCreated = (projectId: string, projectData: TaskContext['projectData']) => {
    setTaskContext({ projectId, projectData });
    setShowAddTaskModal(true);
  };

  const handleGenerateTasksForProject = (projectId: string, projectData: TaskContext['projectData']) => {
    setTaskContext({ projectId, projectData });
    setShowAddTaskModal(true);
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'planning': 'bg-purple-100 text-purple-700',
      'not_started': 'bg-gray-100 text-gray-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'done': 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const renderTableView = () => (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Project ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Owner</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Due Date</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Total Tasks</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Completed</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Unassigned</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">In Progress</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Completion %</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {projects.map((project) => {
              const owner = project.owner_id && ownerMap[project.owner_id] ? ownerMap[project.owner_id] : null;
              const progressPct = Math.min(project.progress_percentage || 0, 100);
              
              return (
                <tr 
                  key={project.id} 
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => openEditModal(project)}
                >
                  <td className="px-4 py-3 text-sm font-mono">{project.project_number || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm font-medium">{project.title}</td>
                  <td className="px-4 py-3 text-sm">
                    {owner ? (
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span>{owner.first_name} {owner.last_name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {project.due_date ? new Date(project.due_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-medium">{project.tasks_count || 0}</td>
                  <td className="px-4 py-3 text-center text-sm font-medium text-green-600">{project.completed_tasks_count || 0}</td>
                  <td className="px-4 py-3 text-center text-sm font-medium text-gray-600">{project.unassigned_tasks_count || 0}</td>
                  <td className="px-4 py-3 text-center text-sm font-medium text-blue-600">{project.in_progress_tasks_count || 0}</td>
                  <td className="px-4 py-3 text-center text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="font-medium">{Math.round(progressPct)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={`${getStatusColor(project.status)} text-xs`}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => {
        const workflowPct = (project.workflow_step * 100) / 5;
        const progressPct = Math.min(project.progress_percentage || 0, 100);
        
        return (
          <Card
            key={project.id}
            className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500"
            onClick={() => openEditModal(project)}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                <Badge className={`${getStatusColor(project.status)} text-xs whitespace-nowrap`}>
                  {project.status.replace('_', ' ')}
                </Badge>
              </div>
              {project.project_number && (
                <Badge variant="outline" className="w-fit text-xs">
                  {project.project_number}
                </Badge>
              )}
              {project.description && (
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="space-y-3">
              {project.backlog && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Backlog</p>
                  <Badge variant="secondary" className="text-xs">
                    {project.backlog.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground">Workflow Progress</p>
                  <p className="text-xs text-muted-foreground">{project.workflow_step}{'/'}5</p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${workflowPct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground">Task Completion</p>
                  <p className="text-xs text-muted-foreground">
                    {project.status === 'planning' ? 'No tasks yet' : `${Math.round(progressPct)}%`}
                  </p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {project.departments && project.departments.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Departments</p>
                  <div className="flex flex-wrap gap-1">
                    {project.departments.slice(0, 3).map((dept, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {dept}
                      </Badge>
                    ))}
                    {project.departments.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.departments.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>

              {showArchived && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnarchive(project.id);
                  }}
                  className="w-full"
                >
                  <ArchiveRestore className="h-4 w-4 mr-2" />
                  Unarchive
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects and track progress
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-r-none"
            >
              <List className="h-4 w-4 mr-1" />
              Table
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="rounded-l-none"
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              Cards
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? <ArchiveRestore className="h-4 w-4 mr-2" /> : <Archive className="h-4 w-4 mr-2" />}
            {showArchived ? 'Show Active' : 'Show Archived'}
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div className="flex-1">
          <select
            value={filterBacklog}
            onChange={(e) => setFilterBacklog(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Backlogs</option>
            <option value="business_innovation">Business &amp; Innovation</option>
            <option value="engineering">Engineering</option>
            <option value="output_adoption">Outcomes &amp; Adoption</option>
          </select>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {showArchived ? 'No archived projects' : 'No projects yet. Create your first project!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'table' ? renderTableView() : renderCardsView()}
        </>
      )}

      <AddProjectModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={loadProjects}
        onProjectCreated={handleProjectCreated}
      />

      <EditProjectModal
        project={selectedProject}
        open={showEditModal}
        onOpenChange={handleCloseEditModal}
        onSuccess={loadProjects}
        onDelete={() => {
          loadProjects();
          handleCloseEditModal();
        }}
        onGenerateTasks={handleGenerateTasksForProject}
      />

      <AddTaskModal
        open={showAddTaskModal}
        onOpenChange={setShowAddTaskModal}
        onSuccess={loadProjects}
        projectId={taskContext?.projectId}
        projectContext={taskContext?.projectData}
      />
    </div>
  );
}
