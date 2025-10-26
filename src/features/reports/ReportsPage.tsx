import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
  FileDown,
  FileText,
  FolderKanban,
  Lightbulb,
  Activity,
  Brain,
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  Users,
  Zap,
  DollarSign
} from 'lucide-react';
import { apiClient } from '../../services/api';

export function ReportsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [reportDays, setReportDays] = useState(30);
  const [auditStats, setAuditStats] = useState<any>(null);
  const [llmStats, setLLMStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [reportDays]);

  const loadAnalytics = async () => {
    setLoadingStats(true);
    try {
      const [auditData, llmData] = await Promise.all([
        apiClient.getAuditStats(reportDays).catch(() => null),
        apiClient.getLLMStats(reportDays).catch(() => null),
      ]);
      setAuditStats(auditData);
      setLLMStats(llmData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleDownloadReport = async (reportType: string) => {
    setLoading(reportType);
    
    try {
      switch (reportType) {
        case 'tasks':
          await apiClient.downloadTasksReport({});
          break;
        case 'projects':
          await apiClient.downloadProjectsReport({});
          break;
        case 'ideas':
          await apiClient.downloadIdeasReport({});
          break;
        case 'user-activity':
          await apiClient.downloadUserActivityReport(reportDays);
          break;
        case 'llm-usage':
          await apiClient.downloadLLMUsageReport(reportDays);
          break;
        case 'summary':
          await apiClient.downloadSummaryReport(reportDays);
          break;
      }
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Failed to download report. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const reportCards = [
    {
      id: 'tasks',
      title: 'Tasks Report',
      description: 'Export all tasks with status, assignments, and dates',
      icon: FolderKanban,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      id: 'projects',
      title: 'Projects Report',
      description: 'Export projects with workflow steps and metrics',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      id: 'ideas',
      title: 'Ideas Report',
      description: 'Export ideas with categories and impact scores',
      icon: Lightbulb,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      id: 'user-activity',
      title: 'User Activity Report',
      description: 'Complete audit log of all user actions',
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      id: 'llm-usage',
      title: 'LLM Usage Report',
      description: 'AI usage statistics with token consumption and costs',
      icon: Brain,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100 dark:bg-pink-900/20',
    },
    {
      id: 'summary',
      title: 'Summary Report',
      description: 'Comprehensive overview of all platform activities',
      icon: FileText,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FileDown className="h-8 w-8 text-primary" />
          Reports
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate and download comprehensive reports in CSV format
        </p>
      </div>

      {/* Analytics Dashboard */}
      {!loadingStats && (auditStats || llmStats) && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {auditStats && (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{auditStats.total_actions}</p>
                      <p className="text-xs text-muted-foreground">Total Actions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{auditStats.unique_users}</p>
                      <p className="text-xs text-muted-foreground">Active Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {llmStats && (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{(llmStats.total_tokens_used / 1000).toFixed(1)}K</p>
                      <p className="text-xs text-muted-foreground">AI Tokens Used</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">${llmStats.total_estimated_cost.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">AI Cost (Est.)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Report Period Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Report Period</CardTitle>
          </div>
          <CardDescription>
            Select the time period for analytics and activity-based reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xs space-y-2">
              <Label htmlFor="days">Days to Include</Label>
              <Input
                id="days"
                type="number"
                min="1"
                max="365"
                value={reportDays}
                onChange={(e) => setReportDays(parseInt(e.target.value) || 30)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Last {reportDays} days of data will be included in analytics and time-based reports</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((report) => {
          const Icon = report.icon;
          const isLoading = loading === report.id;
          
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-lg ${report.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${report.color}`} />
                  </div>
                  <Badge variant="outline" className="text-xs">CSV</Badge>
                </div>
                <CardTitle className="text-lg mt-3">{report.title}</CardTitle>
                <CardDescription className="min-h-[40px]">
                  {report.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => handleDownloadReport(report.id)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium mb-2">About Reports</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <strong>CSV Format:</strong> All reports are exported in CSV (Comma-Separated Values) format, 
                  compatible with Excel, Google Sheets, and data analysis tools.
                </p>
                <p>
                  <strong>Data Included:</strong> Each report contains comprehensive data with all relevant fields 
                  for the selected resource type.
                </p>
                <p>
                  <strong>Time-Based Reports:</strong> User Activity, LLM Usage, and Summary reports use the 
                  selected time period above.
                </p>
                <p>
                  <strong>Real-Time Data:</strong> Reports are generated with the latest data from the database 
                  at the time of download.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
