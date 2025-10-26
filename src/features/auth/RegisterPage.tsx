import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Droplets, ArrowLeft, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { validatePassword, validateEmail, validateName, getPasswordStrength } from '../../utils/validation';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    middle_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  // Real-time password strength indicator
  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear field error when user starts typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
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
      setFieldErrors(validationErrors);
      setError('Please fix the validation errors below');
      return;
    }

    setLoading(true);

    try {
      await apiClient.register(formData);
      navigate('/login', { 
        state: { message: 'Registration successful! Please login.' } 
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-lg z-10">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        <Card className="border-2 border-border shadow-brand-lg backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
          <CardHeader className="space-y-4 text-center pb-6">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center shadow-brand-lg">
                <Droplets className="w-9 h-9 text-white" />
              </div>
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold">
                <span className="text-brand-gradient">Join Hubbo</span>
              </CardTitle>
              <CardDescription className="text-base">
                Start your journey from source to success
              </CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-destructive/50">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-semibold">
                    First Name *
                  </Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    disabled={loading}
                    className={`h-11 border-2 focus:border-primary focus:ring-primary ${
                      fieldErrors.first_name ? 'border-destructive' : ''
                    }`}
                    placeholder="John"
                  />
                  {fieldErrors.first_name && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      {fieldErrors.first_name}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="middle_name" className="text-sm font-semibold">
                    Middle Name *
                  </Label>
                  <Input
                    id="middle_name"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    disabled={loading}
                    className={`h-11 border-2 focus:border-primary focus:ring-primary ${
                      fieldErrors.middle_name ? 'border-destructive' : ''
                    }`}
                    placeholder="Michael"
                  />
                  {fieldErrors.middle_name && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      {fieldErrors.middle_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-semibold">
                  Last Name *
                </Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  disabled={loading}
                  className={`h-11 border-2 focus:border-primary focus:ring-primary ${
                    fieldErrors.last_name ? 'border-destructive' : ''
                  }`}
                  placeholder="Doe"
                />
                {fieldErrors.last_name && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {fieldErrors.last_name}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@cbo.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className={`h-11 border-2 focus:border-primary focus:ring-primary ${
                    fieldErrors.email ? 'border-destructive' : ''
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">
                  Password *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className={`h-11 border-2 focus:border-primary focus:ring-primary pr-10 ${
                      fieldErrors.password ? 'border-destructive' : ''
                    }`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Requirements - Dynamic */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    {formData.password.length >= 8 ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-gray-400" />
                    )}
                    <span className={formData.password.length >= 8 ? 'text-emerald-600' : 'text-gray-600'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/\d/.test(formData.password) ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-gray-400" />
                    )}
                    <span className={/\d/.test(formData.password) ? 'text-emerald-600' : 'text-gray-600'}>
                      One digit
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/[A-Z]/.test(formData.password) ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-gray-400" />
                    )}
                    <span className={/[A-Z]/.test(formData.password) ? 'text-emerald-600' : 'text-gray-600'}>
                      One uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/[a-z]/.test(formData.password) ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-gray-400" />
                    )}
                    <span className={/[a-z]/.test(formData.password) ? 'text-emerald-600' : 'text-gray-600'}>
                      One lowercase letter
                    </span>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {passwordStrength && formData.password.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.strength === 'weak' ? 'w-1/3 bg-red-500' :
                          passwordStrength.strength === 'medium' ? 'w-2/3 bg-amber-500' :
                          'w-full bg-emerald-500'
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.strength === 'weak' ? 'text-red-600' :
                      passwordStrength.strength === 'medium' ? 'text-amber-600' :
                      'text-emerald-600'
                    }`}>
                      {passwordStrength.message}
                    </span>
                  </div>
                )}

                {fieldErrors.password && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-2">
                    <XCircle className="h-3 w-3" />
                    {fieldErrors.password}
                  </p>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full h-11 bg-brand-gradient hover:bg-brand-gradient-hover shadow-brand text-base font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Hubbo Account'
                )}
              </Button>
              
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link
                  to="/login"
                  className="font-semibold text-primary hover:text-primary-600 transition-colors"
                >
                  Sign in here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* CBO Branding */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by <span className="font-semibold text-foreground">Cooperative Bank of Oromia</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            AI Foundry Team Management Platform
          </p>
        </div>
      </div>
    </div>
  );
}
