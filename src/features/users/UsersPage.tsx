import { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import type { UserResponse, RoleResponse } from '../../types/api';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { CheckCircle, XCircle, Trash2, UserCheck, Plus, Edit, Search } from 'lucide-react';

export function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    role_title: '',
    selectedRoles: [] as string[],
  });

  const [editFormData, setEditFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    role_title: '',
    email: '',
    is_active: true,
    is_approved: true,
    selectedRoles: [] as string[],
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
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

  const handleApprove = async (userId: string) => {
    try {
      await apiClient.approveUser(userId);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to approve user');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await apiClient.deleteUser(userId);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      await apiClient.createUser({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        role_title: formData.role_title || undefined,
        role_names: formData.selectedRoles.length > 0 ? formData.selectedRoles : undefined,
      });
      setDialogOpen(false);
      setFormData({
        email: '',
        password: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        role_title: '',
        selectedRoles: [],
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (user: UserResponse) => {
    setSelectedUser(user);
    setEditFormData({
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      role_title: user.role_title || '',
      email: user.email,
      is_active: user.is_active,
      is_approved: user.is_approved,
      selectedRoles: user.roles?.map(r => r.name) || [],
    });
    setEditDialogOpen(true);
  };

  const handleEditRoleToggle = (roleName: string) => {
    setEditFormData(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(roleName)
        ? prev.selectedRoles.filter(r => r !== roleName)
        : [...prev.selectedRoles, roleName]
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setUpdating(true);

    try {
      await apiClient.updateUser(selectedUser.id, {
        first_name: editFormData.first_name,
        middle_name: editFormData.middle_name,
        last_name: editFormData.last_name,
        role_title: editFormData.role_title || null,
        email: editFormData.email,
        is_active: editFormData.is_active,
        is_approved: editFormData.is_approved,
        role_names: editFormData.selectedRoles,
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

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.first_name.toLowerCase().includes(query) ||
      user.middle_name.toLowerCase().includes(query) ||
      user.last_name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.role_title && user.role_title.toLowerCase().includes(query)) ||
      user.id.toString().includes(query)
    );
  });

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name, email, role, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {searchQuery ? 'No users match your search' : 'No users found'}
            </div>
          ) : (
            <div className="divide-y">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex-shrink-0">
                    <div className="text-xs sm:text-sm font-semibold text-primary">
                      {user.first_name[0]}{user.last_name[0]}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-sm sm:text-base">
                        {user.first_name} {user.middle_name} {user.last_name}
                      </h3>
                      <Badge variant="secondary" className="text-xs">ID: {user.id}</Badge>
                      {user.is_active ? (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                      {user.is_approved ? (
                        <Badge variant="default" className="text-xs">Approved</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">Pending</Badge>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground mb-1 break-all">{user.email}</div>
                    {user.role_title && (
                      <div className="text-xs sm:text-sm text-muted-foreground mb-2">
                        Role: {user.role_title}
                      </div>
                    )}
                    {user.roles && user.roles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {user.roles.map((role) => (
                          <Badge key={role.id} variant="outline" className="text-xs">
                            {role.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                    {!user.is_approved && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(user.id)}
                        className="h-9 w-9 sm:h-10 sm:w-10 p-0"
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(user)}
                      className="h-9 w-9 sm:h-10 sm:w-10 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(user.id)}
                      className="h-9 w-9 sm:h-10 sm:w-10 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        {searchQuery ? (
          <>Showing {filteredUsers.length} of {users.length} user{users.length !== 1 ? 's' : ''}</>
        ) : (
          <>Total: {users.length} user{users.length !== 1 ? 's' : ''}</>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  required
                  disabled={creating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middle_name">Middle Name *</Label>
                <Input
                  id="middle_name"
                  value={formData.middle_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, middle_name: e.target.value }))}
                  required
                  disabled={creating}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                required
                disabled={creating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_title">Role Title</Label>
              <Input
                id="role_title"
                placeholder="e.g., Software Engineer"
                value={formData.role_title}
                onChange={(e) => setFormData(prev => ({ ...prev, role_title: e.target.value }))}
                disabled={creating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled={creating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                disabled={creating}
              />
              <p className="text-xs text-muted-foreground">
                Min 8 chars, include uppercase, lowercase, and digit
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? 'Creating...' : 'Add User'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and manage roles
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_first_name">First Name *</Label>
                <Input
                  id="edit_first_name"
                  value={editFormData.first_name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  required
                  disabled={updating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_middle_name">Middle Name *</Label>
                <Input
                  id="edit_middle_name"
                  value={editFormData.middle_name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, middle_name: e.target.value }))}
                  required
                  disabled={updating}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_last_name">Last Name *</Label>
              <Input
                id="edit_last_name"
                value={editFormData.last_name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, last_name: e.target.value }))}
                required
                disabled={updating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_role_title">Role Title</Label>
              <Input
                id="edit_role_title"
                placeholder="e.g., Software Engineer"
                value={editFormData.role_title}
                onChange={(e) => setEditFormData(prev => ({ ...prev, role_title: e.target.value }))}
                disabled={updating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_email">Email *</Label>
              <Input
                id="edit_email"
                type="email"
                placeholder="user@example.com"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled={updating}
              />
            </div>

            <div className="space-y-3">
              <Label>User Status</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit_is_active"
                    checked={editFormData.is_active}
                    onClick={() => setEditFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                    disabled={updating}
                  />
                  <label
                    htmlFor="edit_is_active"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Active (User can login)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit_is_approved"
                    checked={editFormData.is_approved}
                    onClick={() => setEditFormData(prev => ({ ...prev, is_approved: !prev.is_approved }))}
                    disabled={updating}
                  />
                  <label
                    htmlFor="edit_is_approved"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Approved
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assign Roles</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-4 space-y-2">
                {roles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No roles available</p>
                ) : (
                  roles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-role-${role.id}`}
                        checked={editFormData.selectedRoles.includes(role.name)}
                        onClick={() => handleEditRoleToggle(role.name)}
                        disabled={updating}
                      />
                      <label
                        htmlFor={`edit-role-${role.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {role.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {editFormData.selectedRoles.length} role(s) selected
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updating}>
                {updating ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
