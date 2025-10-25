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
    role_title: '',
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-lg">
        {/* Back to landing page */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hubbo
          </Link>
        </div>

        <Card className="w-full shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center pb-8">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Droplets className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Join Hubbo
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Start your journey from source to success
              </CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">
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
                    className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${
                      fieldErrors.first_name ? 'border-red-500' : ''
                    }`}
                    placeholder="John"
                  />
                  {fieldErrors.first_name && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      {fieldErrors.first_name}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="middle_name" className="text-sm font-medium text-gray-700">
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
                    className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${
                      fieldErrors.middle_name ? 'border-red-500' : ''
                    }`}
                    placeholder="Michael"
                  />
                  {fieldErrors.middle_name && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      {fieldErrors.middle_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">
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
                  className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${
                    fieldErrors.last_name ? 'border-red-500' : ''
                  }`}
                  placeholder="Doe"
                />
                {fieldErrors.last_name && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {fieldErrors.last_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role_title" className="text-sm font-medium text-gray-700">
                  Role Title <span className="text-gray-400">(Optional)</span>
                </Label>
                <Input
                  id="role_title"
                  name="role_title"
                  placeholder="e.g., Software Engineer, Product Manager"
                  value={formData.role_title}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 ${
                    fieldErrors.email ? 'border-red-500' : ''
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
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
                    className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 pr-10 ${
                      fieldErrors.password ? 'border-red-500' : ''
                    }`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-2">
                    <XCircle className="h-3 w-3" />
                    {fieldErrors.password}
                  </p>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-6 pt-6">
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Hubbo Account'
                )}
              </Button>
              
              <div className="text-center">
                <span className="text-gray-600">Already have an account? </span>
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                >
                  Sign in here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
