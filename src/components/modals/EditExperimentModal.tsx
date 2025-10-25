import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { FlaskConical, Save } from 'lucide-react';
import type { ExperimentResponse } from '../../types/api';

interface EditExperimentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    hypothesis: string;
    method: string;
    success_criteria: string;
  }) => Promise<void>;
  experiment: ExperimentResponse | null;
}

export function EditExperimentModal({ 
  open, 
  onOpenChange, 
  onSubmit,
  experiment 
}: EditExperimentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    hypothesis: '',
    method: '',
    success_criteria: '',
  });

  useEffect(() => {
    if (experiment) {
      setFormData({
        title: experiment.title,
        hypothesis: experiment.hypothesis,
        method: experiment.method,
        success_criteria: experiment.success_criteria,
      });
    }
  }, [experiment]);

  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        {/* Header with Icon */}
        <div className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Edit Experiment</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Update experiment details
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-exp-title" className="text-sm font-medium">Title *</Label>
            <Input
              id="edit-exp-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="h-9"
            />
          </div>

          {/* Hypothesis */}
          <div className="space-y-2">
            <Label htmlFor="edit-exp-hypothesis" className="text-sm font-medium">Hypothesis *</Label>
            <textarea
              id="edit-exp-hypothesis"
              value={formData.hypothesis}
              onChange={(e) => setFormData({ ...formData, hypothesis: e.target.value })}
              className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          {/* Method */}
          <div className="space-y-2">
            <Label htmlFor="edit-exp-method" className="text-sm font-medium">Method *</Label>
            <textarea
              id="edit-exp-method"
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          {/* Success Criteria */}
          <div className="space-y-2">
            <Label htmlFor="edit-exp-criteria" className="text-sm font-medium">Success Criteria *</Label>
            <textarea
              id="edit-exp-criteria"
              value={formData.success_criteria}
              onChange={(e) => setFormData({ ...formData, success_criteria: e.target.value })}
              className="w-full h-16 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/20">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-9">
            Cancel
          </Button>
          <Button onClick={handleSubmit} size="sm" className="h-9">
            <Save className="h-4 w-4 mr-1" />
            Update Experiment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

