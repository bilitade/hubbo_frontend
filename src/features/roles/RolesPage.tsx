import { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import type { RoleResponse, PermissionResponse } from '../../types/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert } from '../../components/ui/alert';
import { Trash2, Shield, Plus, Edit, AlertCircle, Search } from 'lucide-react';
import { PermissionGuard } from '../../components/guards/PermissionGuard';
import { CreateRoleModal, EditRoleModal } from '../../components/modals';

export function RolesPage() {
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleResponse | null>(null);

  // Form states
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiClient.listRoles();
      setRoles(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const data = await apiClient.listPermissions();
      setAllPermissions(data);
    } catch (err: any) {
      console.error('Failed to load permissions:', err);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  // Filter roles
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (role.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // ========== CRUD Operations ==========

  const handleCreateRole = async (data: { name: string; description: string; selectedPermissions: string[] }) => {
    setCreating(true);
    try {
      await apiClient.createRole({
        name: data.name,
        description: data.description || undefined,
        permission_names: data.selectedPermissions,
      });
      setCreateDialogOpen(false);
      fetchRoles();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create role');
    } finally {
      setCreating(false);
    }
  };

  const handleEditRole = async (data: { name: string; description: string; selectedPermissions: string[] }) => {
    if (!selectedRole) return;
    setUpdating(true);
    try {
      await apiClient.updateRole(selectedRole.id, {
        name: data.name,
        description: data.description || undefined,
        permission_names: data.selectedPermissions,
      });
      setEditDialogOpen(false);
      setSelectedRole(null);
      fetchRoles();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update role');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      await apiClient.deleteRole(selectedRole.id);
      setDeleteDialogOpen(false);
      setSelectedRole(null);
      fetchRoles();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete role');
    }
  };

  // ========== Dialog Handlers ==========

  const openEditDialog = (role: RoleResponse) => {
    setSelectedRole(role);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (role: RoleResponse) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Role Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage roles and assign permissions
          </p>
        </div>
        <PermissionGuard permission="roles:create">
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Role
          </Button>
        </PermissionGuard>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </Alert>
      )}

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              No roles found
            </CardContent>
          </Card>
        ) : (
          filteredRoles.map((role) => (
            <Card key={role.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-brand-gradient flex items-center justify-center shadow-brand">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      {role.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Statistics */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>{role.permissions.length} permissions</span>
                  </div>
                </div>

                {/* Permissions Preview */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Permissions:</Label>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto custom-scrollbar">
                    {role.permissions.slice(0, 10).map((perm) => (
                      <Badge key={perm.id} variant="outline" className="text-[10px] px-1.5 py-0.5">
                        {perm.name}
                      </Badge>
                    ))}
                    {role.permissions.length > 10 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                        +{role.permissions.length - 10} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <PermissionGuard permission="roles:edit">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(role)}
                      className="flex-1 gap-1.5"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard permission="roles:delete">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(role)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </PermissionGuard>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modals */}
      <CreateRoleModal
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateRole}
        permissions={allPermissions}
        creating={creating}
      />

      <EditRoleModal
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditRole}
        role={selectedRole}
        permissions={allPermissions}
        updating={updating}
      />

      {/* ========== DELETE CONFIRMATION MODAL ========== */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Role
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role "{selectedRole?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteRole}>
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
