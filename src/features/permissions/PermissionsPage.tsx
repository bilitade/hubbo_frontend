import { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import type { PermissionResponse } from '../../types/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Alert } from '../../components/ui/alert';
import { Lock, Plus, Trash2, Search, Shield, AlertCircle } from 'lucide-react';
import { PermissionGuard } from '../../components/guards/PermissionGuard';
import { CreatePermissionModal } from '../../components/modals';

export function PermissionsPage() {
  const [allPermissions, setAllPermissions] = useState<PermissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<PermissionResponse | null>(null);

  // Form states
  const [creating, setCreating] = useState(false);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiClient.listPermissions();
      setAllPermissions(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // Group permissions by category
  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    const category = perm.name.includes(':') ? perm.name.split(':')[0] : 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(perm);
    return acc;
  }, {} as Record<string, PermissionResponse[]>);

  // Filter permissions based on search
  const filteredGroups = Object.entries(groupedPermissions).reduce((acc, [category, perms]) => {
    const filtered = perms.filter(perm =>
      perm.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, PermissionResponse[]>);

  // ========== CRUD Operations ==========

  const handleCreatePermission = async (name: string) => {
    setCreating(true);
    try {
      await apiClient.createPermission({ name });
      setCreateDialogOpen(false);
      fetchPermissions();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create permission');
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePermission = async () => {
    if (!selectedPermission) return;

    try {
      await apiClient.deletePermission(selectedPermission.id);
      setDeleteDialogOpen(false);
      setSelectedPermission(null);
      fetchPermissions();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete permission');
    }
  };

  const openDeleteDialog = (permission: PermissionResponse) => {
    setSelectedPermission(permission);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Permission Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage system permissions
          </p>
        </div>
        <PermissionGuard permission="permissions:create">
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Permission
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

      {/* Search Bar and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-3">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search permissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-gradient flex items-center justify-center shadow-brand">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{allPermissions.length}</div>
                <div className="text-xs text-muted-foreground">Total Permissions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permissions by Category */}
      <div className="space-y-4">
        {Object.keys(filteredGroups).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No permissions found
            </CardContent>
          </Card>
        ) : (
          Object.entries(filteredGroups).sort().map(([category, perms]) => (
            <Card key={category}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg capitalize flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    {category}
                    <Badge variant="outline" className="ml-2">
                      {perms.length}
                    </Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {perms.map((perm) => (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all group"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-mono truncate" title={perm.name}>
                          {perm.name}
                        </span>
                      </div>
                      <PermissionGuard permission="permissions:delete">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(perm)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0 flex-shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </PermissionGuard>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">About Permissions</p>
              <p className="text-xs text-muted-foreground">
                Permissions define what actions users can perform. They are assigned to roles, which are then assigned to users.
                Use the format <code className="px-1 py-0.5 bg-muted rounded text-[10px]">resource:action</code> for consistency
                (e.g., <code className="px-1 py-0.5 bg-muted rounded text-[10px]">users:create</code>, 
                <code className="px-1 py-0.5 bg-muted rounded text-[10px]">projects:edit</code>).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CreatePermissionModal
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreatePermission}
        creating={creating}
      />

      {/* ========== DELETE CONFIRMATION MODAL ========== */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Permission
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the permission "{selectedPermission?.name}"? 
              This will remove it from all roles. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeletePermission}>
              Delete Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
