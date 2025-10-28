import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Activity,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  User,
  Clock
} from 'lucide-react';
import { apiClient } from '../../services/api';

export function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterSuccess, setFilterSuccess] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    try {
      const [logsData, statsData] = await Promise.all([
        apiClient.listAuditLogs({ skip: 0, limit: 100 }),
        apiClient.getAuditStats(30),
      ]);
      
      setLogs(logsData.logs || []);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchQuery === '' || 
      (log.user_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = filterAction === '' || log.action === filterAction;
    const matchesSuccess = filterSuccess === undefined || log.success === filterSuccess;
    
    return matchesSearch && matchesAction && matchesSuccess;
  });

  const uniqueActions = [...new Set(logs.map(log => log.action))];

  const getActionBadge = (action: string) => {
    const actionColors: Record<string, string> = {
      'login': 'bg-green-100 text-green-700',
      'logout': 'bg-gray-100 text-gray-700',
      'create': 'bg-blue-100 text-blue-700',
      'update': 'bg-yellow-100 text-yellow-700',
      'delete': 'bg-red-100 text-red-700',
      'view': 'bg-purple-100 text-purple-700',
    };
    
    return actionColors[action] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary"></div>
          <p className="text-muted-foreground">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          Audit Logs
        </h1>
        <p className="text-muted-foreground mt-1">
          Track all user actions and system activities
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_actions}</p>
                  <p className="text-xs text-muted-foreground">Total Actions</p>
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
                  <p className="text-2xl font-bold">{stats.successful_actions}</p>
                  <p className="text-xs text-muted-foreground">Successful</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.failed_actions}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.unique_users}</p>
                  <p className="text-xs text-muted-foreground">Active Users</p>
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
                  placeholder="Search by user, action, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All Actions</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{action}</option>
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

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || filterAction || filterSuccess !== undefined
                  ? 'No logs found matching your filters'
                  : 'No audit logs available'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Action</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Resource</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Details</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {log.user_email || 'System'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getActionBadge(log.action)}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {log.resource_type && (
                            <span className="font-medium">{log.resource_type}</span>
                          )}
                          {log.resource_id && (
                            <span className="text-muted-foreground text-xs block truncate max-w-[150px]">
                              {log.resource_id}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-md">
                          <p className="text-sm text-muted-foreground truncate">
                            {log.description || log.endpoint || '-'}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {log.success ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Success
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
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


