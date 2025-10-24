import { useState, useEffect } from 'react';
import { Plus, Archive, Trash2, Edit, BarChart } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { apiClient } from '../../services/api';
import type { ProjectResponse, ProjectCreate, ProjectUpdate } from '../../types/api';

export function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterBacklog, setFilterBacklog] = useState<string>('');
  const [formData, setFormData] = useState<ProjectCreate>({
    title: '',
    description: '',
    project_brief: '',
    desired_outcomes: '',
    status: 'recent',
    backlog: 'business_innovation',
    departments: [],
    workflow_step: 1,
  });

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

  const handleCreate = async () => {
    try {
      await apiClient.createProject(formData);
      setShowCreateDialog(false);
      setFormData({
        title: '',
        description: '',
        project_brief: '',
        desired_outcomes: '',
        status: 'recent',
        backlog: 'business_innovation',
        departments: [],
        workflow_step: 1,
      });
      loadProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedProject) return;
    try {
      const updateData: ProjectUpdate = {
        title: formData.title,
        description: formData.description,
        project_brief: formData.project_brief,
        desired_outcomes: formData.desired_outcomes,
        status: formData.status,
        backlog: formData.backlog,
        workflow_step: formData.workflow_step,
      };
      await apiClient.updateProject(selectedProject.id, updateData);
      setShowEditDialog(false);
      setSelectedProject(null);
      loadProjects();
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await apiClient.deleteProject(id);
      loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await apiClient.archiveProject(id);
      loadProjects();
    } catch (error) {
      console.error('Failed to archive project:', error);
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

  const openEditDialog = (project: ProjectResponse) => {
    setSelectedProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      project_brief: project.project_brief,
      desired_outcomes: project.desired_outcomes,
      status: project.status,
      backlog: project.backlog,
      departments: project.departments || [],
      workflow_step: project.workflow_step,
    });
    setShowEditDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      recent: 'bg-blue-500',
      in_progress: 'bg-yellow-500',
      completed: 'bg-green-500',
      on_hold: 'bg-orange-500',
      cancelled: 'bg-red-500',
    };
    return <Badge className={colors[status] || 'bg-gray-500'}>{status.replace('_', ' ')}</Badge>;
  };

  const getBacklogBadge = (backlog: string) => {
    const colors: Record<string, string> = {
      business_innovation: 'bg-purple-500',
      operational_excellence: 'bg-cyan-500',
      customer_experience: 'bg-pink-500',
      technology: 'bg-indigo-500',
    };
    return (
      <Badge variant="outline" className={colors[backlog] || 'bg-gray-500'}>
        {backlog.replace('_', ' ')}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage and track your projects</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showArchived ? 'default' : 'outline'}
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? 'Show Active' : 'Show Archived'}
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div>
          <Label htmlFor="filter-status">Status</Label>
          <select
            id="filter-status"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="recent">Recent</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <Label htmlFor="filter-backlog">Backlog</Label>
          <select
            id="filter-backlog"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filterBacklog}
            onChange={(e) => setFilterBacklog(e.target.value)}
          >
            <option value="">All</option>
            <option value="business_innovation">Business Innovation</option>
            <option value="operational_excellence">Operational Excellence</option>
            <option value="customer_experience">Customer Experience</option>
            <option value="technology">Technology</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-lg">{project.title}</CardTitle>
                {getStatusBadge(project.status)}
              </div>
              <div className="flex gap-2 items-center">
                {getBacklogBadge(project.backlog)}
                {project.project_number && (
                  <CardDescription className="text-xs">#{project.project_number}</CardDescription>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-xs font-semibold mb-1">Brief:</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{project.project_brief}</p>
              </div>
              <div className="mb-4">
                <p className="text-xs font-semibold mb-1">Desired Outcomes:</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{project.desired_outcomes}</p>
              </div>
              <div className="mb-4 flex items-center gap-2">
                <BarChart className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Workflow Step: {project.workflow_step}</span>
              </div>
              {project.primary_metric !== null && project.primary_metric !== undefined && (
                <div className="mb-4">
                  <p className="text-xs font-semibold">Primary Metric: {project.primary_metric}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, project.primary_metric)}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(project)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                {!project.is_archived && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleArchive(project.id)}
                  >
                    <Archive className="h-3 w-3 mr-1" />
                    Archive
                  </Button>
                )}
                {project.is_archived && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUnarchive(project.id)}
                  >
                    <Archive className="h-3 w-3 mr-1" />
                    Unarchive
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(project.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Add a new project to your portfolio</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter project title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-brief">Project Brief *</Label>
              <textarea
                id="project-brief"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.project_brief}
                onChange={(e) => setFormData({ ...formData, project_brief: e.target.value })}
                placeholder="Detailed project brief"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desired-outcomes">Desired Outcomes *</Label>
              <textarea
                id="desired-outcomes"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.desired_outcomes}
                onChange={(e) => setFormData({ ...formData, desired_outcomes: e.target.value })}
                placeholder="What outcomes do you want to achieve?"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="recent">Recent</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="backlog">Backlog</Label>
                <select
                  id="backlog"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.backlog}
                  onChange={(e) => setFormData({ ...formData, backlog: e.target.value })}
                >
                  <option value="business_innovation">Business Innovation</option>
                  <option value="operational_excellence">Operational Excellence</option>
                  <option value="customer_experience">Customer Experience</option>
                  <option value="technology">Technology</option>
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="workflow-step">Workflow Step</Label>
              <Input
                id="workflow-step"
                type="number"
                min="1"
                value={formData.workflow_step}
                onChange={(e) => setFormData({ ...formData, workflow_step: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update your project details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <textarea
                id="edit-description"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-project-brief">Project Brief *</Label>
              <textarea
                id="edit-project-brief"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.project_brief}
                onChange={(e) => setFormData({ ...formData, project_brief: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-desired-outcomes">Desired Outcomes *</Label>
              <textarea
                id="edit-desired-outcomes"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.desired_outcomes}
                onChange={(e) => setFormData({ ...formData, desired_outcomes: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="recent">Recent</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-backlog">Backlog</Label>
                <select
                  id="edit-backlog"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.backlog}
                  onChange={(e) => setFormData({ ...formData, backlog: e.target.value })}
                >
                  <option value="business_innovation">Business Innovation</option>
                  <option value="operational_excellence">Operational Excellence</option>
                  <option value="customer_experience">Customer Experience</option>
                  <option value="technology">Technology</option>
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-workflow-step">Workflow Step</Label>
              <Input
                id="edit-workflow-step"
                type="number"
                min="1"
                value={formData.workflow_step}
                onChange={(e) => setFormData({ ...formData, workflow_step: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

