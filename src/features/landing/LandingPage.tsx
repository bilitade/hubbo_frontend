import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, CheckCircle, Droplets, GitBranch, Lightbulb, Target, TrendingUp, Users, Zap, Building2, Shield, Clock, BarChart3 } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Hubbo
                </span>
                <span className="text-xs text-gray-500 -mt-1 font-medium">From Source to Success</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/register')}>
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
                <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  <Brain className="w-4 h-4" />
                  <span>AI Foundry Team Management Platform</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Hubbo
                </span>
                {' '}— From Source to Success
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Like a jar collecting water from its source, <strong>Hubbo</strong> gathers your AI projects, 
                organizes foundry team workflows, and flows seamlessly toward breakthrough innovation. 
                Intelligent task management built for the AI Foundry Team at <strong>Cooperative Bank of Oromia</strong>.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6"
                  onClick={() => navigate('/register')}
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </div>
              <div className="flex items-center space-x-8 pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Bank-grade security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">AI Foundry focused</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">CBO exclusive</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative w-full h-[500px] flex items-center justify-center">
                {/* Animated Water Jar Illustration */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-3xl animate-pulse"></div>
                <div className="relative z-10 space-y-4 w-full max-w-md">
                  {/* Flowing Cards Animation */}
                  <div className="bg-white rounded-xl shadow-xl p-6 transform hover:scale-105 transition-transform duration-300 animate-float">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">AI Projects</h3>
                        <p className="text-sm text-gray-500">From idea to deployment</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-xl p-6 transform hover:scale-105 transition-transform duration-300 animate-float-delayed">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Brain className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Foundry Workflows</h3>
                        <p className="text-sm text-gray-500">Streamlined collaboration</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-xl p-6 transform hover:scale-105 transition-transform duration-300 animate-float">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Innovation Success</h3>
                        <p className="text-sm text-gray-500">Measurable impact</p>
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              AI Foundry Task Management, Simplified
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Like water flowing from source to destination, Hubbo makes your AI Foundry workflows seamless and efficient
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="w-6 h-6" />}
              title="AI-Powered Intelligence"
              description="Let AI enhance your foundry projects, automate routine tasks, and optimize AI development workflows."
              color="blue"
            />
            <FeatureCard
              icon={<Lightbulb className="w-6 h-6" />}
              title="Idea to Production Pipeline"
              description="Capture and organize AI ideas, experiments, and models with intelligent assistance from ideation to deployment."
              color="yellow"
            />
            <FeatureCard
              icon={<GitBranch className="w-6 h-6" />}
              title="Smart Project Organization"
              description="Organize complex AI/ML projects with ease. AI helps break down tasks and suggests optimal development paths."
              color="purple"
            />
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title="Task & Sprint Management"
              description="Track AI Foundry team progress, manage sprints, set priorities, and achieve innovation goals intelligently."
              color="green"
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Experiment Tracking"
              description="Monitor AI experiments, track model performance, and maintain a comprehensive history of your foundry work."
              color="orange"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Foundry Team Collaboration"
              description="Enable seamless collaboration across AI team members with role-based access and secure knowledge sharing."
              color="indigo"
            />
          </div>
        </div>
      </section>

      {/* The Journey Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              From Source to Success
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The Hubbo journey for AI Foundry teams — every innovation matters
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <JourneyStep
              number="1"
              title="Source"
              description="Capture AI ideas and requirements"
              icon={<Lightbulb className="w-8 h-8" />}
            />
            <JourneyStep
              number="2"
              title="Enhance"
              description="AI optimizes and structures workflows"
              icon={<Brain className="w-8 h-8" />}
            />
            <JourneyStep
              number="3"
              title="Execute"
              description="Manage sprints and deliverables"
              icon={<Target className="w-8 h-8" />}
            />
            <JourneyStep
              number="4"
              title="Success"
              description="Deploy and measure impact"
              icon={<TrendingUp className="w-8 h-8" />}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your AI Foundry Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join Cooperative Bank of Oromia's AI Foundry Team using Hubbo's intelligent task management platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6"
              onClick={() => navigate('/register')}
            >
              Start Free Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-white border-white hover:bg-white/10 text-lg px-8 py-6"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Hubbo</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 Hubbo by Cooperative Bank of Oromia — AI Foundry Team. From source to success.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    orange: 'from-orange-500 to-orange-600',
    indigo: 'from-indigo-500 to-indigo-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

interface JourneyStepProps {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function JourneyStep({ number, title, description, icon }: JourneyStepProps) {
  return (
    <div className="relative">
      <div className="text-center">
        <div className="relative inline-block mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white mb-4 mx-auto">
            {icon}
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-blue-600 shadow-lg">
            {number}
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}

