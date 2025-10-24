import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Droplets, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';

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
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
                    First Name
                  </Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    placeholder="John"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="middle_name" className="text-sm font-medium text-gray-700">
                    Middle Name
                  </Label>
                  <Input
                    id="middle_name"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={handleChange}
                    disabled={loading}
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    placeholder="Michael"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  placeholder="Doe"
                />
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
                  Email Address
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
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
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
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
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
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>At least 8 characters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Include uppercase and lowercase letters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Include at least one number</span>
                  </div>
                </div>
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
