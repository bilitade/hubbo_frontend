import { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { BarChart3, FileText, TrendingUp, Users, FolderKanban, CheckSquare, Lightbulb, FlaskConical } from 'lucide-react';

interface Stats {
  ideas: number;
  projects: number;
  tasks: number;
  experiments: number;
  users: number;
}

export function ReportsPage() {
  const [stats, setStats] = useState<Stats>({
    ideas: 0,
    projects: 0,
    tasks: 0,
    experiments: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch all data to get stats
        const [ideas, projects, tasks, experiments, users] = await Promise.all([
          apiClient.listIdeas(0, 1000),
          apiClient.listProjects(0, 1000),
          apiClient.listTasks(0, 1000),
          apiClient.listExperiments(0, 1000),
          apiClient.listUsers(0, 1000).catch(() => []), // May not have permission
        ]);

        setStats({
          ideas: ideas.total || ideas.items?.length || 0,
          projects: projects.total || projects.items?.length || 0,
          tasks: tasks.total || tasks.items?.length || 0,
          experiments: experiments.total || experiments.items?.length || 0,
          users: users.length || 0,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const reportCards = [
    {
      title: 'Total Ideas',
      value: stats.ideas,
      icon: Lightbulb,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Ideas in the system',
    },
    {
      title: 'Total Projects',
      value: stats.projects,
      icon: FolderKanban,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Active and archived projects',
    },
    {
      title: 'Total Tasks',
      value: stats.tasks,
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'All tasks across projects',
    },
    {
      title: 'Total Experiments',
      value: stats.experiments,
      icon: FlaskConical,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Experiments conducted',
    },
    {
      title: 'Total Users',
      value: stats.users,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Registered users',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          View system statistics and performance metrics
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading reports...</p>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {reportCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {card.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                      <Icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Reports Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle>Performance Overview</CardTitle>
                </div>
                <CardDescription>Summary of system activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ideas to Projects</span>
                    <span className="text-sm font-medium">
                      {stats.ideas > 0 ? ((stats.projects / stats.ideas) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                      style={{ width: stats.ideas > 0 ? `${Math.min((stats.projects / stats.ideas) * 100, 100)}%` : '0%' }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tasks per Project</span>
                    <span className="text-sm font-medium">
                      {stats.projects > 0 ? (stats.tasks / stats.projects).toFixed(1) : 0}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-600"
                      style={{ width: '75%' }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Experiments Coverage</span>
                    <span className="text-sm font-medium">
                      {stats.projects > 0 ? ((stats.experiments / stats.projects) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                      style={{ width: stats.projects > 0 ? `${Math.min((stats.experiments / stats.projects) * 100, 100)}%` : '0%' }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>Available Reports</CardTitle>
                </div>
                <CardDescription>Generate and download reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => alert('Ideas Report - Coming soon!')}
                >
                  <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
                  Ideas Report
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => alert('Projects Report - Coming soon!')}
                >
                  <FolderKanban className="h-4 w-4 mr-2 text-blue-600" />
                  Projects Report
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => alert('Tasks Report - Coming soon!')}
                >
                  <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
                  Tasks Report
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => alert('Experiments Report - Coming soon!')}
                >
                  <FlaskConical className="h-4 w-4 mr-2 text-purple-600" />
                  Experiments Report
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Message */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Analytics Dashboard</h4>
                  <p className="text-sm text-muted-foreground">
                    This page provides an overview of your system's performance. More detailed reports and analytics features are coming soon. 
                    You can track ideas, projects, tasks, experiments, and user activity all in one place.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

