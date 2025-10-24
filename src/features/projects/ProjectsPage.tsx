import { useState, useEffect } from 'react';
import { Plus, Archive, ArchiveRestore, FolderKanban } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { apiClient } from '../../services/api';
import type { ProjectResponse } from '../../types/api';
import { AddProjectModal, EditProjectModal } from '../../components/modals';

export function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterBacklog, setFilterBacklog] = useState<string>('');

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'planning': 'bg-purple-100 text-purple-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'under_review': 'bg-yellow-100 text-yellow-700',
      'completed': 'bg-green-100 text-green-700',
      'on_hold': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects and track progress
          </p>
        </div>
        <div className="flex gap-2">
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

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="under_review">Under Review</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="flex-1">
          <select
            value={filterBacklog}
            onChange={(e) => setFilterBacklog(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Backlogs</option>
            <option value="business_innovation">Business & Innovation</option>
            <option value="engineering">Engineering</option>
            <option value="output_adoption">Outcomes & Adoption</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {showArchived ? 'No archived projects' : 'No projects yet. Create your first project!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => (
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

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground">Workflow Progress</p>
                    <p className="text-xs text-muted-foreground">{project.workflow_step}/5</p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${(project.workflow_step / 5) * 100}%`,
                      }}
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
          ))
        )}
      </div>

      {/* Modals */}
      <AddProjectModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={loadProjects}
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
      />
    </div>
  );
}
