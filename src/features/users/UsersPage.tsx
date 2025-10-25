import { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import type { UserResponse, RoleResponse } from '../../types/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Alert } from '../../components/ui/alert';
import { 
  Trash2, 
  UserCheck, 
  Plus, 
  Edit, 
  Search,
  Shield,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { PermissionGuard } from '../../components/guards/PermissionGuard';
import { CreateUserModal, EditUserModal, ManageUserRolesModal } from '../../components/modals';

export function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

  // Form states
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiClient.listUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await apiClient.listRoles();
      setRoles(data);
    } catch (err: any) {
      console.error('Failed to load roles:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      user.first_name.toLowerCase().includes(query) ||
      user.last_name.toLowerCase().includes(query) ||
      (user.middle_name?.toLowerCase().includes(query))
    );
  });

  // ========== CRUD Operations ==========

  const handleCreateUser = async (data: {
    email: string;
    password: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    role_title?: string | null;
  }) => {
    setCreating(true);
    try {
      const payload = {
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        role_title: data.role_title || null,
      };
      console.log('Creating user with payload:', payload);
      await apiClient.createUser(payload);
      setCreateDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      console.error('Create user error:', err.response?.data);
      console.error('Full error:', err);
      
      // Show detailed validation errors
      if (err.response?.data?.detail && Array.isArray(err.response.data.detail)) {
        const errors = err.response.data.detail.map((e: any) => 
          `${e.loc.join('.')}: ${e.msg}`
        ).join('\n');
        alert(`Validation errors:\n${errors}`);
      } else {
        alert(err.response?.data?.detail || 'Failed to create user');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleEditUser = async (data: {
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    role_title?: string | null;
  }) => {
    if (!selectedUser) return;
    setUpdating(true);
    try {
      await apiClient.updateUser(selectedUser.id, {
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        email: data.email,
        role_title: data.role_title,
      });
      setEditDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await apiClient.deleteUser(selectedUser.id);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await apiClient.approveUser(userId);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to approve user');
    }
  };

  const handleDisableUser = async (userId: string, currentStatus: boolean) => {
    try {
      await apiClient.updateUser(userId, { is_active: !currentStatus });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update user status');
    }
  };

  const handleManageRoles = async (selectedRoles: string[]) => {
    if (!selectedUser) return;
    setUpdating(true);
    try {
      await apiClient.updateUser(selectedUser.id, {
        role_ids: selectedRoles,
      });
      setRoleDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update roles');
    } finally {
      setUpdating(false);
    }
  };

  // ========== Dialog Handlers ==========

  const openEditDialog = (user: UserResponse) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const openRoleDialog = (user: UserResponse) => {
    setSelectedUser(user);
    setRoleDialogOpen(true);
  };

  const openDeleteDialog = (user: UserResponse) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // ========== UI Helpers ==========

  const getUserStatusBadge = (user: UserResponse) => {
    if (!user.is_active) {
      return <Badge variant="destructive">Disabled</Badge>;
    }
    if (!user.is_approved) {
      return <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>;
    }
    return <Badge className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
        <PermissionGuard permission="users:create">
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
          Add User
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
              placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Roles</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
          {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium">{user.first_name} {user.last_name}</div>
                    {user.role_title && (
                          <div className="text-xs text-muted-foreground">{user.role_title}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 flex-wrap">
                        {user.roles.map((role) => (
                          <Badge key={role.id} variant="outline" className="text-xs">
                            {role.name}
                          </Badge>
                        ))}
                      </div>
                      </td>
                      <td className="py-3 px-4">{getUserStatusBadge(user)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Approve Button */}
                          <PermissionGuard permission="users:approve">
                    {!user.is_approved && (
                      <Button
                                variant="ghost"
                        size="sm"
                                onClick={() => handleApproveUser(user.id)}
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                                title="Approve User"
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    )}
                          </PermissionGuard>

                          {/* Disable/Enable Button */}
                          <PermissionGuard permission="users:disable">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDisableUser(user.id, user.is_active)}
                              className={user.is_active 
                                ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950"
                                : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                              }
                              title={user.is_active ? 'Disable User' : 'Enable User'}
                            >
                              {user.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </PermissionGuard>

                          {/* Manage Roles Button */}
                          <PermissionGuard permission="users:manage_roles">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openRoleDialog(user)}
                              className="text-primary hover:text-primary/80 hover:bg-primary/10"
                              title="Manage Roles"
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>

                          {/* Edit Button */}
                          <PermissionGuard permission="users:edit">
                    <Button
                              variant="ghost"
                      size="sm"
                              onClick={() => openEditDialog(user)}
                              className="text-primary hover:text-primary/80 hover:bg-primary/10"
                              title="Edit User"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                          </PermissionGuard>

                          {/* Delete Button */}
                          <PermissionGuard permission="users:delete">
                    <Button
                              variant="ghost"
                      size="sm"
                              onClick={() => openDeleteDialog(user)}
                              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                              title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                          </PermissionGuard>
                  </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateUserModal
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateUser}
        creating={creating}
      />

      <EditUserModal
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditUser}
        user={selectedUser}
        updating={updating}
      />

      <ManageUserRolesModal
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        onSubmit={handleManageRoles}
        user={selectedUser}
        roles={roles}
        updating={updating}
      />

      {/* ========== DELETE CONFIRMATION MODAL ========== */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.first_name} {selectedUser?.last_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteUser}>
              Delete User
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
