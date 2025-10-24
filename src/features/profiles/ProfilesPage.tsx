import { useState, useEffect } from 'react';
import { Edit, Mail, Users, Briefcase, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { apiClient } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { ProfileResponse, ProfileUpdate } from '../../types/api';

export function ProfilesPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState<ProfileUpdate>({
    display_name: '',
    avatar_url: '',
    team: '',
    position: '',
    email: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // Get current user's profile
      const data = await apiClient.getMyProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!profile || !user) return;
    try {
      await apiClient.updateProfile(user.id, formData);
      setShowEditDialog(false);
      loadProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const openEditDialog = () => {
    if (!profile) return;
    setFormData({
      display_name: profile.display_name || '',
      avatar_url: profile.avatar_url || '',
      team: profile.team || '',
      position: profile.position || '',
      email: profile.email || '',
    });
    setShowEditDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>
            Profile not found. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information</p>
        </div>
        <Button onClick={openEditDialog}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Header Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || 'User'}
                  className="h-24 w-24 rounded-full object-cover border-4 border-primary/10"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                  <span className="text-3xl font-bold text-primary">
                    {(profile.display_name || profile.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">
                {profile.display_name || 'No Display Name'}
              </h2>
              {profile.position && (
                <p className="text-lg text-muted-foreground mb-3">{profile.position}</p>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.team && (
                  <Badge variant="secondary" className="text-sm">
                    <Users className="h-3 w-3 mr-1" />
                    {profile.team}
                  </Badge>
                )}
                {profile.disabled ? (
                  <Badge variant="destructive">Disabled</Badge>
                ) : profile.needs_password_change ? (
                  <Badge variant="outline" className="bg-yellow-500 text-white">
                    Password Reset Required
                  </Badge>
                ) : (
                  <Badge className="bg-green-500">Active</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Your contact details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{profile.email || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Position</p>
                <p className="text-base">{profile.position || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team</p>
                <p className="text-base">{profile.team || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                <p className="text-base">
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Status */}
      {profile.disabled && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Account Disabled</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.disabled_reason && (
              <Alert>
                <AlertDescription>
                  <span className="font-semibold">Reason:</span> {profile.disabled_reason}
                </AlertDescription>
              </Alert>
            )}
            {profile.disabled_at && (
              <p className="text-sm text-muted-foreground mt-2">
                Disabled on: {new Date(profile.disabled_at).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {profile.needs_password_change && (
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="text-yellow-700">Password Change Required</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                You need to change your password. Please update it from your account settings.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your profile information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={formData.display_name || ''}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position || ''}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="team">Team</Label>
              <Input
                id="team"
                value={formData.team || ''}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                placeholder="Engineering"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="avatar-url">Avatar URL</Label>
              <Input
                id="avatar-url"
                value={formData.avatar_url || ''}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
