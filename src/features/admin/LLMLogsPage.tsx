import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Brain,
  Search,
  Filter,
  CheckCircle2,
  Zap,
  DollarSign,
  Clock,
  Activity
} from 'lucide-react';
import { apiClient } from '../../services/api';

export function LLMLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProvider, setFilterProvider] = useState('');
  const [filterSuccess, setFilterSuccess] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    try {
      const [logsData, statsData] = await Promise.all([
        apiClient.listLLMLogs({ skip: 0, limit: 100 }),
        apiClient.getLLMStats(30),
      ]);
      
      setLogs(logsData.logs || []);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load LLM logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchQuery === '' || 
      (log.model || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.provider || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.feature || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProvider = filterProvider === '' || log.provider === filterProvider;
    const matchesSuccess = filterSuccess === undefined || log.success === filterSuccess;
    
    return matchesSearch && matchesProvider && matchesSuccess;
  });

  const uniqueProviders = [...new Set(logs.map(log => log.provider))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary"></div>
          <p className="text-muted-foreground">Loading LLM logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          LLM Usage Logs
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor AI model usage, token consumption, and costs
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_requests}</p>
                  <p className="text-xs text-muted-foreground">Total Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.success_rate}%</p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{(stats.total_tokens_used / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-muted-foreground">Total Tokens</p>
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
                  <p className="text-2xl font-bold">${stats.total_estimated_cost.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Est. Cost</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.average_latency_ms}ms</p>
                  <p className="text-xs text-muted-foreground">Avg Latency</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by model, provider, or feature..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All Providers</option>
                {uniqueProviders.map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
              </select>

              <select
                value={filterSuccess === undefined ? '' : filterSuccess.toString()}
                onChange={(e) => setFilterSuccess(e.target.value === '' ? undefined : e.target.value === 'true')}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All Status</option>
                <option value="true">Success</option>
                <option value="false">Failed</option>
              </select>

              <Button variant="outline" onClick={loadData}>
                <Filter className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LLM Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>LLM Request Log</CardTitle>
          <CardDescription>
            {filteredLogs.length} {filteredLogs.length === 1 ? 'request' : 'requests'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || filterProvider || filterSuccess !== undefined
                  ? 'No logs found matching your filters'
                  : 'No LLM logs available'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Provider</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Model</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Feature</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Tokens</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Latency</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Cost</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {log.provider}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium">{log.model}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {log.feature || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-mono">
                          {log.total_tokens?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm text-muted-foreground">
                          {log.latency_ms || 0}ms
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-mono">
                          ${(log.estimated_cost || 0).toFixed(4)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {log.success ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            ✓
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                            ✗
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


