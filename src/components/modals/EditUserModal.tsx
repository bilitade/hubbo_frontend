import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { UserCog, Save, XCircle } from 'lucide-react';
import type { UserResponse } from '../../types/api';
import { validateEmail, validateName } from '../../utils/validation';

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    role_title?: string | null;
  }) => Promise<void>;
  user: UserResponse | null;
  updating: boolean;
}

export function EditUserModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  user,
  updating 
}: EditUserModalProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    role_title: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        email: user.email,
        role_title: user.role_title || '',
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

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      validationErrors.email = emailValidation.error!;
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
      first_name: formData.first_name,
      middle_name: formData.middle_name,
      last_name: formData.last_name,
      email: formData.email,
      role_title: formData.role_title || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0">
        {/* Header with Icon */}
        <div className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <UserCog className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Edit User</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Update user information
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
                <Label htmlFor="edit-first-name" className="text-sm font-medium">First Name *</Label>
                <Input
                  id="edit-first-name"
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
                <Label htmlFor="edit-last-name" className="text-sm font-medium">Last Name *</Label>
                <Input
                  id="edit-last-name"
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
              <Label htmlFor="edit-middle-name" className="text-sm font-medium">Middle Name *</Label>
              <Input
                id="edit-middle-name"
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
              <Label htmlFor="edit-email" className="text-sm font-medium">Email *</Label>
              <Input
                id="edit-email"
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

            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-role-title" className="text-sm font-medium">Job Title</Label>
              <Input
                id="edit-role-title"
                value={formData.role_title}
                onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                placeholder="e.g. Project Manager, Developer"
                className="h-9"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/20">
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
                  Update User
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

