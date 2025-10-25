import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Shield, Save } from 'lucide-react';
import type { UserResponse, RoleResponse } from '../../types/api';

interface ManageUserRolesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (selectedRoles: string[]) => Promise<void>;
  user: UserResponse | null;
  roles: RoleResponse[];
  updating: boolean;
}

export function ManageUserRolesModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  user,
  roles,
  updating 
}: ManageUserRolesModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setSelectedRoles(user.roles.map(r => r.id));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(selectedRoles);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 max-h-[85vh] flex flex-col">
        {/* Header with Icon */}
        <div className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Manage User Roles</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Assign roles to {user?.first_name} {user?.last_name}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-3">
              {roles.map((role) => (
                <div 
                  key={role.id} 
                  className="flex items-start gap-3 p-4 border border-border rounded-lg hover:bg-primary/5 hover:border-primary/30 transition-all"
                >
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={selectedRoles.includes(role.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRoles([...selectedRoles, role.id]);
                      } else {
                        setSelectedRoles(selectedRoles.filter(id => id !== role.id));
                      }
                    }}
                  />
                  <div className="flex-1 pt-0.5">
                    <Label htmlFor={`role-${role.id}`} className="font-semibold cursor-pointer text-base">
                      {role.name}
                    </Label>
                    {role.description && (
                      <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {role.permissions.length} permissions
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/20 flex-shrink-0">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-9">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={updating} className="h-9">
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Update Roles
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

