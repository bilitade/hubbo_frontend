import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { FlaskConical, Plus } from 'lucide-react';

interface CreateExperimentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    hypothesis: string;
    method: string;
    success_criteria: string;
  }) => Promise<void>;
}

export function CreateExperimentModal({ 
  open, 
  onOpenChange, 
  onSubmit 
}: CreateExperimentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    hypothesis: '',
    method: '',
    success_criteria: '',
  });

  const handleSubmit = async () => {
    await onSubmit(formData);
    setFormData({
      title: '',
      hypothesis: '',
      method: '',
      success_criteria: '',
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({
      title: '',
      hypothesis: '',
      method: '',
      success_criteria: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        {/* Header with Icon */}
        <div className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Create New Experiment</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Add a new experiment to track
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="exp-title" className="text-sm font-medium">Title *</Label>
            <Input
              id="exp-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter experiment title"
              className="h-9"
            />
          </div>

          {/* Hypothesis */}
          <div className="space-y-2">
            <Label htmlFor="exp-hypothesis" className="text-sm font-medium">Hypothesis *</Label>
            <textarea
              id="exp-hypothesis"
              value={formData.hypothesis}
              onChange={(e) => setFormData({ ...formData, hypothesis: e.target.value })}
              placeholder="What is your hypothesis?"
              className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          {/* Method */}
          <div className="space-y-2">
            <Label htmlFor="exp-method" className="text-sm font-medium">Method *</Label>
            <textarea
              id="exp-method"
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              placeholder="How will you test this?"
              className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          {/* Success Criteria */}
          <div className="space-y-2">
            <Label htmlFor="exp-criteria" className="text-sm font-medium">Success Criteria *</Label>
            <textarea
              id="exp-criteria"
              value={formData.success_criteria}
              onChange={(e) => setFormData({ ...formData, success_criteria: e.target.value })}
              placeholder="How will you measure success?"
              className="w-full h-16 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/20">
          <Button variant="outline" size="sm" onClick={handleClose} className="h-9">
            Cancel
          </Button>
          <Button onClick={handleSubmit} size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-1" />
            Create Experiment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

