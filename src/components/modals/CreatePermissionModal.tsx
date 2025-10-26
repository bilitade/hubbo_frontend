import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Lock, Plus } from 'lucide-react';

interface CreatePermissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => Promise<void>;
  creating: boolean;
}

export function CreatePermissionModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  creating 
}: CreatePermissionModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(name);
    setName('');
  };

  const handleClose = () => {
    onOpenChange(false);
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0">
        {/* Header with Icon */}
        <div className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Create New Permission</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Add a new permission to the system
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="permission-name" className="text-sm font-medium">Permission Name *</Label>
              <Input
                id="permission-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. users:create, projects:delete"
                required
                className="h-9 font-mono"
              />
              <p className="text-xs text-muted-foreground flex items-start gap-1.5 mt-2">
                <span className="text-primary">💡</span>
                <span>Use format: <code className="px-1.5 py-0.5 bg-muted rounded text-[11px] font-mono">resource:action</code> for consistency</span>
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/20">
            <Button type="button" variant="outline" size="sm" onClick={handleClose} className="h-9">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={creating} className="h-9">
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Create Permission
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}













