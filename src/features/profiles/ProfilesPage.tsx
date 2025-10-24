import { useState, useEffect } from 'react';
import { Edit, UserX, UserCheck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { apiClient } from '../../services/api';
import type { ProfileResponse, ProfileUpdate } from '../../types/api';

export function ProfilesPage() {
  const [profiles, setProfiles] = useState<ProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileResponse | null>(null);
  const [disableReason, setDisableReason] = useState('');
  const [formData, setFormData] = useState<ProfileUpdate>({
    display_name: '',
    avatar_url: '',
    team: '',
    position: '',
    email: '',
  });

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await apiClient.listProfiles(0, 100);
      setProfiles(data);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedProfile) return;
    try {
      await apiClient.updateProfile(selectedProfile.id, formData);
      setShowEditDialog(false);
      setSelectedProfile(null);
      loadProfiles();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleDisable = async () => {
    if (!selectedProfile || !disableReason.trim()) return;
    try {
      await apiClient.disableProfile(selectedProfile.id, { disabled_reason: disableReason });
      setShowDisableDialog(false);
      setSelectedProfile(null);
      setDisableReason('');
      loadProfiles();
    } catch (error) {
      console.error('Failed to disable profile:', error);
    }
  };

  const handleEnable = async (profileId: string) => {
    try {
      await apiClient.enableProfile(profileId);
      loadProfiles();
    } catch (error) {
      console.error('Failed to enable profile:', error);
    }
  };

  const openEditDialog = (profile: ProfileResponse) => {
    setSelectedProfile(profile);
    setFormData({
      display_name: profile.display_name || '',
      avatar_url: profile.avatar_url || '',
      team: profile.team || '',
      position: profile.position || '',
      email: profile.email || '',
    });
    setShowEditDialog(true);
  };

  const openDisableDialog = (profile: ProfileResponse) => {
    setSelectedProfile(profile);
    setShowDisableDialog(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Profiles</h1>
          <p className="text-muted-foreground">Manage user profiles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <Card key={profile.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name || 'User'}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {(profile.display_name || profile.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">
                      {profile.display_name || 'No Name'}
                    </CardTitle>
                    {profile.position && (
                      <CardDescription className="text-xs">{profile.position}</CardDescription>
                    )}
                  </div>
                </div>
                {profile.disabled ? (
                  <Badge variant="destructive">Disabled</Badge>
                ) : profile.needs_password_change ? (
                  <Badge variant="outline" className="bg-yellow-500">Password Reset</Badge>
                ) : (
                  <Badge className="bg-green-500">Active</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {profile.email && (
                  <div>
                    <p className="text-xs font-semibold">Email:</p>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                )}
                {profile.team && (
                  <div>
                    <p className="text-xs font-semibold">Team:</p>
                    <p className="text-sm text-muted-foreground">{profile.team}</p>
                  </div>
                )}
              </div>

              {profile.disabled && profile.disabled_reason && (
                <Alert className="mb-4">
                  <AlertDescription className="text-xs">
                    <span className="font-semibold">Disabled Reason:</span> {profile.disabled_reason}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(profile)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                {!profile.disabled ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openDisableDialog(profile)}
                  >
                    <UserX className="h-3 w-3 mr-1" />
                    Disable
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleEnable(profile.id)}
                  >
                    <UserCheck className="h-3 w-3 mr-1" />
                    Enable
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update profile information</DialogDescription>
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

      {/* Disable Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Profile</DialogTitle>
            <DialogDescription>
              Please provide a reason for disabling this profile
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="disable-reason">Reason *</Label>
              <textarea
                id="disable-reason"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={disableReason}
                onChange={(e) => setDisableReason(e.target.value)}
                placeholder="Enter reason for disabling this profile"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDisableDialog(false);
              setDisableReason('');
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDisable}
              disabled={!disableReason.trim()}
            >
              Disable Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

