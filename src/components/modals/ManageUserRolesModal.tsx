import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Shield, Save, CheckCircle } from 'lucide-react';
import type { UserResponse, RoleResponse } from '../../types/api';

interface ManageUserRolesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (selectedRole: string) => Promise<void>;
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
  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => {
    if (user && user.roles.length > 0) {
      setSelectedRole(user.roles[0].id);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }
    await onSubmit(selectedRole);
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
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`w-full flex items-start gap-3 p-4 border-2 rounded-lg transition-all text-left ${
                    selectedRole === role.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedRole === role.id
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground'
                  }`}>
                    {selectedRole === role.id && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-base flex items-center gap-2">
                      {role.name}
                      {selectedRole === role.id && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    {role.description && (
                      <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {role.permissions.length} permissions
                    </p>
                  </div>
                </button>
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

