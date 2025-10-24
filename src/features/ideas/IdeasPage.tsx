import { useState, useEffect } from 'react';
import { Plus, Archive, Trash2, Edit, FolderSymlink } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { apiClient } from '../../services/api';
import type { IdeaResponse, IdeaCreate, IdeaUpdate } from '../../types/api';

export function IdeasPage() {
  const [ideas, setIdeas] = useState<IdeaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<IdeaResponse | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [formData, setFormData] = useState<IdeaCreate>({
    title: '',
    description: '',
    possible_outcome: '',
    status: 'inbox',
    category: '',
    departments: [],
  });
  const [moveData, setMoveData] = useState({
    project_brief: '',
    desired_outcomes: '',
    generate_tasks_with_ai: false,
  });

  useEffect(() => {
    loadIdeas();
  }, [showArchived]);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      const response = await apiClient.listIdeas(0, 100, undefined, showArchived);
      setIdeas(response.ideas);
    } catch (error) {
      console.error('Failed to load ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await apiClient.createIdea(formData);
      setShowCreateDialog(false);
      setFormData({
        title: '',
        description: '',
        possible_outcome: '',
        status: 'inbox',
        category: '',
        departments: [],
      });
      loadIdeas();
    } catch (error) {
      console.error('Failed to create idea:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedIdea) return;
    try {
      const updateData: IdeaUpdate = {
        title: formData.title,
        description: formData.description,
        possible_outcome: formData.possible_outcome,
        category: formData.category,
        status: formData.status,
      };
      await apiClient.updateIdea(selectedIdea.id, updateData);
      setShowEditDialog(false);
      setSelectedIdea(null);
      loadIdeas();
    } catch (error) {
      console.error('Failed to update idea:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) return;
    try {
      await apiClient.deleteIdea(id);
      loadIdeas();
    } catch (error) {
      console.error('Failed to delete idea:', error);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await apiClient.archiveIdea(id);
      loadIdeas();
    } catch (error) {
      console.error('Failed to archive idea:', error);
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      await apiClient.unarchiveIdea(id);
      loadIdeas();
    } catch (error) {
      console.error('Failed to unarchive idea:', error);
    }
  };

  const handleMoveToProject = async () => {
    if (!selectedIdea) return;
    try {
      await apiClient.moveIdeaToProject(selectedIdea.id, moveData);
      setShowMoveDialog(false);
      setSelectedIdea(null);
      setMoveData({
        project_brief: '',
        desired_outcomes: '',
        generate_tasks_with_ai: false,
      });
      loadIdeas();
    } catch (error) {
      console.error('Failed to move idea to project:', error);
    }
  };

  const openEditDialog = (idea: IdeaResponse) => {
    setSelectedIdea(idea);
    setFormData({
      title: idea.title,
      description: idea.description,
      possible_outcome: idea.possible_outcome,
      status: idea.status,
      category: idea.category || '',
      departments: idea.departments || [],
    });
    setShowEditDialog(true);
  };

  const openMoveDialog = (idea: IdeaResponse) => {
    setSelectedIdea(idea);
    setMoveData({
      project_brief: idea.description,
      desired_outcomes: idea.possible_outcome,
      generate_tasks_with_ai: false,
    });
    setShowMoveDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      inbox: 'bg-gray-500',
      under_review: 'bg-blue-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
    };
    return <Badge className={colors[status] || 'bg-gray-500'}>{status.replace('_', ' ')}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Ideas</h1>
          <p className="text-muted-foreground">Manage and track your ideas</p>
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
            New Idea
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ideas.map((idea) => (
          <Card key={idea.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{idea.title}</CardTitle>
                {getStatusBadge(idea.status)}
              </div>
              {idea.category && (
                <CardDescription className="text-xs">Category: {idea.category}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{idea.description}</p>
              <div className="mb-4">
                <p className="text-xs font-semibold mb-1">Possible Outcome:</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{idea.possible_outcome}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(idea)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                {!idea.is_archived && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openMoveDialog(idea)}
                    >
                      <FolderSymlink className="h-3 w-3 mr-1" />
                      To Project
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleArchive(idea.id)}
                    >
                      <Archive className="h-3 w-3 mr-1" />
                      Archive
                    </Button>
                  </>
                )}
                {idea.is_archived && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUnarchive(idea.id)}
                  >
                    <Archive className="h-3 w-3 mr-1" />
                    Unarchive
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(idea.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Idea</DialogTitle>
            <DialogDescription>Add a new idea to your collection</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter idea title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your idea"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="outcome">Possible Outcome *</Label>
              <textarea
                id="outcome"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.possible_outcome}
                onChange={(e) => setFormData({ ...formData, possible_outcome: e.target.value })}
                placeholder="What could be the outcome?"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Innovation, Marketing"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="inbox">Inbox</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Idea</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Idea</DialogTitle>
            <DialogDescription>Update your idea details</DialogDescription>
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
              <Label htmlFor="edit-description">Description *</Label>
              <textarea
                id="edit-description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-outcome">Possible Outcome *</Label>
              <textarea
                id="edit-outcome"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.possible_outcome}
                onChange={(e) => setFormData({ ...formData, possible_outcome: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="inbox">Inbox</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Idea</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move to Project Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Move Idea to Project</DialogTitle>
            <DialogDescription>Convert this idea into a project</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-brief">Project Brief *</Label>
              <textarea
                id="project-brief"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={moveData.project_brief}
                onChange={(e) => setMoveData({ ...moveData, project_brief: e.target.value })}
                placeholder="Describe the project"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desired-outcomes">Desired Outcomes *</Label>
              <textarea
                id="desired-outcomes"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={moveData.desired_outcomes}
                onChange={(e) => setMoveData({ ...moveData, desired_outcomes: e.target.value })}
                placeholder="What outcomes do you want to achieve?"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="generate-tasks"
                checked={moveData.generate_tasks_with_ai}
                onChange={(e) => setMoveData({ ...moveData, generate_tasks_with_ai: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="generate-tasks">Generate tasks with AI</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMoveToProject}>Move to Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

