import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Alert } from '../ui/alert';
import { UserPlus, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { validatePassword, validateEmail, validateName, getPasswordStrength } from '../../utils/validation';

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    email: string;
    password: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    role_title?: string | null;
  }) => Promise<void>;
  creating: boolean;
}

export function CreateUserModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  creating 
}: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    role_title: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time password strength indicator
  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

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

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      validationErrors.email = emailValidation.error!;
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      validationErrors.password = passwordValidation.error!;
    }

    // Show errors if any
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const errorMessages = Object.values(validationErrors).join('\n');
      alert(`Please fix the following errors:\n\n${errorMessages}`);
      return;
    }

    setErrors({});
    
    await onSubmit({
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      middle_name: formData.middle_name,
      last_name: formData.last_name,
      role_title: formData.role_title || undefined,
    });
    setFormData({
      email: '',
      password: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      role_title: '',
    });
    setShowPassword(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({
      email: '',
      password: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      role_title: '',
    });
    setShowPassword(false);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0">
        {/* Header with Icon */}
        <div className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Create New User</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Add a new user to the system
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name" className="text-sm font-medium">First Name *</Label>
                <Input
                  id="first-name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                  maxLength={100}
                  className={`h-9 ${errors.first_name ? 'border-red-500' : ''}`}
                />
                {errors.first_name && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {errors.first_name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name" className="text-sm font-medium">Last Name *</Label>
                <Input
                  id="last-name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                  maxLength={100}
                  className={`h-9 ${errors.last_name ? 'border-red-500' : ''}`}
                />
                {errors.last_name && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {errors.last_name}
                  </p>
                )}
              </div>
            </div>

            {/* Middle Name */}
            <div className="space-y-2">
              <Label htmlFor="middle-name" className="text-sm font-medium">Middle Name *</Label>
              <Input
                id="middle-name"
                value={formData.middle_name}
                onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                required
                maxLength={100}
                className={`h-9 ${errors.middle_name ? 'border-red-500' : ''}`}
              />
              {errors.middle_name && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.middle_name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className={`h-9 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className={`h-9 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-9 px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              {/* Password Requirements */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  {formData.password.length >= 8 ? (
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className={formData.password.length >= 8 ? 'text-emerald-600' : 'text-muted-foreground'}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {/\d/.test(formData.password) ? (
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className={/\d/.test(formData.password) ? 'text-emerald-600' : 'text-muted-foreground'}>
                    One digit
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {/[A-Z]/.test(formData.password) ? (
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className={/[A-Z]/.test(formData.password) ? 'text-emerald-600' : 'text-muted-foreground'}>
                    One uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {/[a-z]/.test(formData.password) ? (
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className={/[a-z]/.test(formData.password) ? 'text-emerald-600' : 'text-muted-foreground'}>
                    One lowercase letter
                  </span>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {passwordStrength && formData.password.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.strength === 'weak' ? 'w-1/3 bg-red-500' :
                        passwordStrength.strength === 'medium' ? 'w-2/3 bg-amber-500' :
                        'w-full bg-emerald-500'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${passwordStrength.color}`}>
                    {passwordStrength.message}
                  </span>
                </div>
              )}
            </div>

            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="role-title" className="text-sm font-medium">Job Title</Label>
              <Input
                id="role-title"
                value={formData.role_title}
                onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                placeholder="e.g. Project Manager, Developer"
                className="h-9"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/20">
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
                  <UserPlus className="h-4 w-4 mr-1" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

