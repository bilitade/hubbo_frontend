import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Shield, Plus } from 'lucide-react';
import type { PermissionResponse } from '../../types/api';

interface CreateRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; description: string; selectedPermissions: string[] }) => Promise<void>;
  permissions: PermissionResponse[];
  creating: boolean;
}

export function CreateRoleModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  permissions,
  creating 
}: CreateRoleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedPermissions: [] as string[],
  });

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const category = perm.name.includes(':') ? perm.name.split(':')[0] : 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(perm);
    return acc;
  }, {} as Record<string, PermissionResponse[]>);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({ name: '', description: '', selectedPermissions: [] });
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({ name: '', description: '', selectedPermissions: [] });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 max-h-[85vh] flex flex-col">
        {/* Header with Icon */}
        <div className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center shadow-brand">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Create New Role</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Create a new role and assign permissions
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Role Name */}
            <div className="space-y-2">
              <Label htmlFor="role-name" className="text-sm font-medium">Role Name *</Label>
              <Input
                id="role-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Project Manager"
                required
                className="h-9"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="role-description" className="text-sm font-medium">Description</Label>
              <Input
                id="role-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this role"
                className="h-9"
              />
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Permissions ({formData.selectedPermissions.length} selected)
              </Label>
              <div className="border border-border rounded-lg p-5 space-y-4 max-h-96 overflow-y-auto bg-gradient-to-br from-muted/30 to-muted/10">
                {Object.entries(groupedPermissions).sort().map(([category, perms]) => (
                  <div key={category} className="space-y-2">
                    <div className="font-semibold text-sm capitalize sticky top-0 bg-background pb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      {category}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {perms.map((perm) => (
                        <div 
                          key={perm.id} 
                          className="flex items-center gap-2.5 p-2.5 hover:bg-primary/5 rounded-md transition-colors border border-transparent hover:border-primary/20"
                        >
                          <Checkbox
                            id={`create-perm-${perm.id}`}
                            checked={formData.selectedPermissions.includes(perm.name)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  selectedPermissions: [...formData.selectedPermissions, perm.name],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  selectedPermissions: formData.selectedPermissions.filter(p => p !== perm.name),
                                });
                              }
                            }}
                          />
                          <Label 
                            htmlFor={`create-perm-${perm.id}`} 
                            className="text-sm cursor-pointer flex-1 font-mono"
                          >
                            {perm.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/20 flex-shrink-0">
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
                  Create Role
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}







