import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { UserCog, Save, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { validatePassword, validateName, getPasswordStrength } from '../../utils/validation';
import type { UserResponse } from '../../types/api';

interface ProfileSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponse;
  onSubmit: (data: {
    first_name: string;
    middle_name: string;
    last_name: string;
    position?: string | null;
    team?: string | null;
    department?: string | null;
    current_password?: string | null;
    password?: string | null;
  }) => Promise<void>;
  updating: boolean;
}

export function ProfileSettingsModal({ 
  open, 
  onOpenChange, 
  user,
  onSubmit, 
  updating 
}: ProfileSettingsModalProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    position: '',
    team: '',
    department: '',
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time password strength indicator
  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        position: user.position || '',
        team: user.team || '',
        department: user.department || '',
        currentPassword: '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors: Record<string, string> = {};

    // Validate first name
    const firstNameValidation = validateName(formData.first_name, 'First name');
    if (!firstNameValidation.isValid) {
      validationErrors.first_name = firstNameValidation.error!;
    }

    // Validate middle name
    const middleNameValidation = validateName(formData.middle_name, 'Middle name');
    if (!middleNameValidation.isValid) {
      validationErrors.middle_name = middleNameValidation.error!;
    }

    // Validate last name
    const lastNameValidation = validateName(formData.last_name, 'Last name');
    if (!lastNameValidation.isValid) {
      validationErrors.last_name = lastNameValidation.error!;
    }

    // Validate password if provided
    if (formData.password || formData.currentPassword) {
      // If user wants to change password, current password is required
      if (formData.password && !formData.currentPassword) {
        validationErrors.currentPassword = 'Current password is required to change password';
      }

      if (formData.password) {
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
          validationErrors.password = passwordValidation.error!;
        }

        // Check password confirmation
        if (formData.password !== formData.confirmPassword) {
          validationErrors.confirmPassword = 'Passwords do not match';
        }
      }
    }

    // Show errors if any
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const errorMessages = Object.values(validationErrors).join('\n');
      alert(`Please fix the following errors:\n\n${errorMessages}`);
      return;
    }

    setErrors({});
    
    const updateData: any = {
      first_name: formData.first_name,
      middle_name: formData.middle_name,
      last_name: formData.last_name,
      position: formData.position || null,
      team: formData.team || null,
      department: formData.department || null,
    };

    // Only include passwords if user is changing password
    if (formData.password && formData.currentPassword) {
      updateData.current_password = formData.currentPassword;
      updateData.password = formData.password;
    }

    await onSubmit(updateData);
    
    // Clear password fields after successful update
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      password: '',
      confirmPassword: '',
    }));
    setShowCurrentPassword(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      position: user.position || '',
      team: user.team || '',
      department: user.department || '',
      currentPassword: '',
      password: '',
      confirmPassword: '',
    });
    setShowCurrentPassword(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        {/* Header with Icon */}
        <div className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <UserCog className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold">Profile Settings</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Update your personal information and preferences
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Content */}
          <div className="px-6 py-4 space-y-4">
            {/* Email (Read-only, faded) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                Email Address <span className="text-xs">(Cannot be changed)</span>
              </Label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="h-9 bg-muted/50 text-muted-foreground cursor-not-allowed"
              />
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-sm font-medium">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="John"
                  required
                  className="h-9"
                />
                {errors.first_name && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {errors.first_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="middle_name" className="text-sm font-medium">
                  Middle Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="middle_name"
                  value={formData.middle_name}
                  onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                  placeholder="Michael"
                  required
                  className="h-9"
                />
                {errors.middle_name && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {errors.middle_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-medium">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Doe"
                  required
                  className="h-9"
                />
                {errors.last_name && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {errors.last_name}
                  </p>
                )}
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold text-foreground">Professional Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-medium">Position / Title</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="e.g. Senior Developer, Project Manager"
                  className="h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="team" className="text-sm font-medium">Team</Label>
                  <Input
                    id="team"
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    placeholder="e.g. Engineering, Product"
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. IT, Marketing"
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            {/* Password Change Section */}
            <div className="space-y-4 pt-2 border-t">
              <h3 className="text-sm font-semibold text-foreground">Change Password (Optional)</h3>
              
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    placeholder="Enter your current password"
                    className="h-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Leave blank to keep current password"
                    className="h-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      <div className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength && passwordStrength.message.includes('Strong') ? 'bg-green-500' :
                        passwordStrength && passwordStrength.message.includes('Medium') ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      <div className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength && passwordStrength.message.includes('Strong') ? 'bg-green-500' :
                        passwordStrength && passwordStrength.message.includes('Medium') ? 'bg-yellow-500' :
                        'bg-gray-200'
                      }`} />
                      <div className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength && passwordStrength.message.includes('Strong') ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    </div>
                    <span className={`text-xs font-medium ${passwordStrength?.color}`}>
                      {passwordStrength?.message}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your new password"
                    className="h-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t">
            <Button type="button" variant="outline" size="sm" onClick={handleClose} className="h-9">
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
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

