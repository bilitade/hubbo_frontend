import { useState, useEffect } from 'react';
import { Plus, Archive, ArchiveRestore } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { apiClient } from '../../services/api';
import type { IdeaResponse } from '../../types/api';
import { AddIdeaModal, EditIdeaModal, AddProjectModal, AddTaskModal } from '../../components/modals';

export function IdeasPage() {
  const [ideas, setIdeas] = useState<IdeaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<IdeaResponse | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [projectInitialData, setProjectInitialData] = useState<{
    title?: string;
    description?: string;
    desired_outcomes?: string;
  } | undefined>(undefined);
  const [taskContext, setTaskContext] = useState<{
    projectId: string;
    projectData: {
      title: string;
      description?: string;
      project_brief?: string;
      desired_outcomes?: string;
    };
  } | null>(null);

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

  const handleUnarchive = async (id: string) => {
    try {
      await apiClient.unarchiveIdea(id);
      loadIdeas();
    } catch (error) {
      console.error('Failed to unarchive idea:', error);
    }
  };

  const openEditModal = (idea: IdeaResponse) => {
    setSelectedIdea(idea);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedIdea(null);
  };

  const handleMoveToProject = (idea: IdeaResponse) => {
    setProjectInitialData({
      title: idea.title,
      description: idea.description || '',
      desired_outcomes: idea.possible_outcome || '',
    });
    setShowAddProjectModal(true);
  };

  const handleProjectCreated = (projectId: string, projectData: {
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'inbox': 'bg-gray-100 text-gray-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'under_review': 'bg-yellow-100 text-yellow-700',
      'completed': 'bg-green-100 text-green-700',
      'planning': 'bg-purple-100 text-purple-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ideas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ideas</h1>
          <p className="text-muted-foreground">
            Manage your innovative ideas
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
            Add Idea
          </Button>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ideas.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                {showArchived ? 'No archived ideas' : 'No ideas yet. Create your first idea!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          ideas.map((idea) => (
            <Card
              key={idea.id}
              className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-yellow-500"
              onClick={() => openEditModal(idea)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2">{idea.title}</CardTitle>
                  <Badge className={`${getStatusColor(idea.status)} text-xs whitespace-nowrap`}>
                    {idea.status.replace('_', ' ')}
                  </Badge>
                </div>
                {idea.description && (
                  <CardDescription className="line-clamp-3">
                    {idea.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                {idea.possible_outcome && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Possible Outcome</p>
                    <p className="text-sm line-clamp-2">{idea.possible_outcome}</p>
                  </div>
                )}

                {idea.departments && idea.departments.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Departments</p>
                    <div className="flex flex-wrap gap-1">
                      {idea.departments.slice(0, 3).map((dept, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {dept}
                        </Badge>
                      ))}
                      {idea.departments.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{idea.departments.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {idea.category && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Category</p>
                    <Badge variant="outline" className="text-xs">{idea.category}</Badge>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(idea.created_at).toLocaleDateString()}
                  </p>
                </div>

                {showArchived && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnarchive(idea.id);
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
      <AddIdeaModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={loadIdeas}
      />

      <EditIdeaModal
        idea={selectedIdea}
        open={showEditModal}
        onOpenChange={handleCloseEditModal}
        onSuccess={loadIdeas}
        onMoveToProject={handleMoveToProject}
      />

      <AddProjectModal
        open={showAddProjectModal}
        onOpenChange={setShowAddProjectModal}
        onSuccess={loadIdeas}
        onProjectCreated={handleProjectCreated}
        initialData={projectInitialData}
      />

      <AddTaskModal
        open={showAddTaskModal}
        onOpenChange={setShowAddTaskModal}
        onSuccess={loadIdeas}
        projectId={taskContext?.projectId}
        projectContext={taskContext?.projectData}
      />
    </div>
  );
}
