import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, CheckCircle, Droplets, Lightbulb, Target, TrendingUp, Zap, Building2, Shield, Clock, BarChart3, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 glass border-b border-primary/20 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center shadow-brand">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-brand-gradient">
                  Hubbo
                </span>
                <span className="text-xs text-muted-foreground -mt-1 font-medium">From Source to Success</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/login')} className="border-primary/30 hover:border-primary hover:bg-primary/5">
                Sign In
              </Button>
              <Button onClick={() => navigate('/register')} className="bg-brand-gradient hover:bg-brand-gradient-hover shadow-brand">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary/30 shadow-sm">
                  <Brain className="w-4 h-4" />
                  <span>AI Foundry Team Management Platform</span>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                <span className="text-brand-gradient drop-shadow-sm">
                  Hubbo
                </span>
                <br />
                <span className="text-3xl md:text-4xl lg:text-5xl text-muted-foreground">
                  From Source to Success
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Like a jar collecting water from its source, <strong className="text-primary">Hubbo</strong> gathers your AI projects, 
                organizes foundry team workflows, and flows seamlessly toward breakthrough innovation. 
                Intelligent task management built for the AI Foundry Team at{' '}
                <strong className="text-foreground">Cooperative Bank of Oromia</strong>.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-brand-gradient hover:bg-brand-gradient-hover shadow-brand-lg group"
                  onClick={() => navigate('/register')}
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6 border-2 border-primary/30 hover:border-primary hover:bg-primary/5"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-primary/10">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">Bank-grade security</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-primary/10">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">AI Foundry focused</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-primary/10">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">CBO exclusive</span>
                </div>
              </div>
            </div>
            
            {/* Hero Image/Animation */}
            <div className="relative">
              <div className="relative w-full h-[500px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 rounded-3xl animate-pulse"></div>
                <div className="relative z-10 space-y-4 w-full max-w-md">
                  {/* Flowing Cards Animation */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-brand-lg p-6 transform hover:scale-105 transition-transform duration-300 animate-float border-l-4 border-primary">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Idea Generation</div>
                        <div className="text-xs text-muted-foreground">AI-powered insights</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-brand p-6 transform hover:scale-105 transition-transform duration-300 animate-float-delayed border-l-4 border-accent ml-8">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Project Execution</div>
                        <div className="text-xs text-muted-foreground">Track & deliver</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-brand-lg p-6 transform hover:scale-105 transition-transform duration-300 animate-float border-l-4 border-primary/60">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Success Metrics</div>
                        <div className="text-xs text-muted-foreground">Real-time analytics</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="text-brand-gradient">Powerful Features</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to manage AI Foundry projects
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Lightbulb,
                title: 'Idea Management',
                description: 'Capture and organize innovative ideas from your team',
                color: 'text-accent',
                bgColor: 'bg-accent/10',
              },
              {
                icon: Brain,
                title: 'AI-Powered',
                description: 'Leverage AI to enhance ideas and generate tasks',
                color: 'text-primary',
                bgColor: 'bg-primary/10',
              },
              {
                icon: Target,
                title: 'Project Tracking',
                description: 'Monitor progress with real-time dashboards and metrics',
                color: 'text-primary',
                bgColor: 'bg-primary/10',
              },
              {
                icon: Zap,
                title: 'Workflow Automation',
                description: 'Streamline processes with automated status updates',
                color: 'text-accent',
                bgColor: 'bg-accent/10',
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Bank-grade security with role-based access control',
                color: 'text-secondary-900',
                bgColor: 'bg-secondary-900/10',
              },
              {
                icon: BarChart3,
                title: 'Analytics & Insights',
                description: 'Data-driven decisions with comprehensive reporting',
                color: 'text-primary',
                bgColor: 'bg-primary/10',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-xl bg-white dark:bg-gray-800 border border-border hover:border-primary/50 hover:shadow-brand transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-hero-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-6 animate-pulse-brand" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join the AI Foundry Team and start managing projects with intelligence
          </p>
          <Button 
            size="lg"
            className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all hover:scale-105"
            onClick={() => navigate('/register')}
          >
            Get Started Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-secondary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Hubbo</span>
              </div>
              <p className="text-sm text-gray-400">
                AI Foundry Team Management Platform for Cooperative Bank of Oromia
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-primary cursor-pointer transition-colors">Features</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Pricing</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Documentation</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-primary cursor-pointer transition-colors">About CBO</li>
                <li className="hover:text-primary cursor-pointer transition-colors">AI Foundry Team</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Contact</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>© 2025 Cooperative Bank of Oromia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
