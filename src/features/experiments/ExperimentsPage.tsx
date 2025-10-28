import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { apiClient } from '../../services/api';
import type { ExperimentResponse } from '../../types/api';
import { CreateExperimentModal, EditExperimentModal } from '../../components/modals';

export function ExperimentsPage() {
  const [experiments, setExperiments] = useState<ExperimentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentResponse | null>(null);
  const [newUpdate, setNewUpdate] = useState('');

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.listExperiments(0, 100);
      setExperiments(response.experiments);
    } catch (error) {
      console.error('Failed to load experiments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: {
    title: string;
    hypothesis: string;
    method: string;
    success_criteria: string;
  }) => {
    try {
      await apiClient.createExperiment(data);
      setShowCreateDialog(false);
      loadExperiments();
    } catch (error) {
      console.error('Failed to create experiment:', error);
    }
  };

  const handleUpdate = async (data: {
    title: string;
    hypothesis: string;
    method: string;
    success_criteria: string;
  }) => {
    if (!selectedExperiment) return;
    try {
      await apiClient.updateExperiment(selectedExperiment.id, data);
      setShowEditDialog(false);
      setSelectedExperiment(null);
      loadExperiments();
    } catch (error) {
      console.error('Failed to update experiment:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experiment?')) return;
    try {
      await apiClient.deleteExperiment(id);
      loadExperiments();
    } catch (error) {
      console.error('Failed to delete experiment:', error);
    }
  };

  const handleAddUpdate = async () => {
    if (!selectedExperiment || !newUpdate.trim()) return;
    try {
      await apiClient.addExperimentUpdate(selectedExperiment.id, { update: newUpdate });
      setNewUpdate('');
      // Reload the experiment details
      const updated = await apiClient.getExperiment(selectedExperiment.id);
      setSelectedExperiment(updated);
      loadExperiments();
    } catch (error) {
      console.error('Failed to add update:', error);
    }
  };

  const openEditDialog = (experiment: ExperimentResponse) => {
    setSelectedExperiment(experiment);
    setShowEditDialog(true);
  };

  const openDetailDialog = async (experiment: ExperimentResponse) => {
    try {
      const details = await apiClient.getExperiment(experiment.id);
      setSelectedExperiment(details);
      setShowDetailDialog(true);
    } catch (error) {
      console.error('Failed to load experiment details:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Experiments</h1>
          <p className="text-muted-foreground">Track and manage your experiments</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Experiment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {experiments.map((experiment) => (
          <Card 
            key={experiment.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => openDetailDialog(experiment)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{experiment.title}</CardTitle>
              <CardDescription className="text-xs">
                {experiment.progress_updates.length} updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-xs font-semibold mb-1">Hypothesis:</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{experiment.hypothesis}</p>
              </div>
              <div className="mb-4">
                <p className="text-xs font-semibold mb-1">Success Criteria:</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{experiment.success_criteria}</p>
              </div>
              <div className="flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditDialog(experiment);
                  }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(experiment.id);
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modals */}
      <CreateExperimentModal
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreate}
      />

      <EditExperimentModal
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={handleUpdate}
        experiment={selectedExperiment}
      />

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedExperiment?.title}</DialogTitle>
            <DialogDescription>Experiment Details</DialogDescription>
          </DialogHeader>
          {selectedExperiment && (
            <div className="grid gap-6 py-4">
              {/* Hypothesis */}
              <div>
                <h3 className="font-semibold mb-2">Hypothesis</h3>
                <p className="text-sm text-muted-foreground">{selectedExperiment.hypothesis}</p>
              </div>

              {/* Method */}
              <div>
                <h3 className="font-semibold mb-2">Method</h3>
                <p className="text-sm text-muted-foreground">{selectedExperiment.method}</p>
              </div>

              {/* Success Criteria */}
              <div>
                <h3 className="font-semibold mb-2">Success Criteria</h3>
                <p className="text-sm text-muted-foreground">{selectedExperiment.success_criteria}</p>
              </div>

              {/* Progress Updates */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Progress Updates ({selectedExperiment.progress_updates?.length || 0})
                </h3>
                <div className="space-y-2 mb-4">
                  {selectedExperiment.progress_updates?.map((update, index) => (
                    <div key={index} className="p-3 bg-muted rounded">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs text-muted-foreground">Update #{index + 1}</span>
                      </div>
                      <p className="text-sm">{update}</p>
                    </div>
                  ))}
                  {(!selectedExperiment.progress_updates || selectedExperiment.progress_updates.length === 0) && (
                    <p className="text-sm text-muted-foreground">No updates yet</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <textarea
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Add a progress update..."
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                  />
                  <Button onClick={handleAddUpdate}>Add</Button>
                </div>
              </div>

              {/* Metadata */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Created:</span>
                    <p className="text-muted-foreground">
                      {new Date(selectedExperiment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold">Last Updated:</span>
                    <p className="text-muted-foreground">
                      {new Date(selectedExperiment.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

