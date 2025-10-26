import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { CheckCircle, Droplets, ArrowLeft, Mail, Sun, Moon } from 'lucide-react';

export function ForgotPasswordPage() {
  const { toggleTheme, actualTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await apiClient.requestPasswordReset(email);
      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reset email. Please try again.');
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

      <div className="relative w-full max-w-md z-10">
        {/* Back Button & Theme Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            to="/login" 
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full hover:bg-primary/10 transition-all duration-300"
            aria-label="Toggle theme"
          >
            {actualTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-primary" />
            ) : (
              <Moon className="w-4 h-4 text-primary" />
            )}
          </Button>
        </div>

        <Card className="border-2 border-border shadow-brand-lg backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
          <CardHeader className="space-y-4 pb-6">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center shadow-brand-lg">
                <Droplets className="w-9 h-9 text-white" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold">
                <span className="text-brand-gradient">Forgot Password?</span>
              </CardTitle>
              <CardDescription className="text-base">
                No worries! We'll send you a reset link
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
              
              {success && (
                <Alert className="border-green-500/50 bg-green-50 dark:bg-green-900/20">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Password reset link has been sent to your email. Please check your inbox and spam folder.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@cbo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11 border-2 focus:border-primary focus:ring-primary pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                </div>
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
                    Sending reset link...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
              
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Remember your password? </span>
                <Link
                  to="/login"
                  className="font-semibold text-primary hover:text-primary-600 transition-colors"
                >
                  Back to Login
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
