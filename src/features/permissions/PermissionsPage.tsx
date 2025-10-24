import { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import type { PermissionResponse } from '../../types/api';
import { Card, CardContent } from '../../components/ui/card';
import { Lock } from 'lucide-react';

export function PermissionsPage() {
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const data = await apiClient.listPermissions();
      setPermissions(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading permissions...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
          <p className="text-muted-foreground">
            System permissions available for role assignment
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {permissions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No permissions found
            </div>
          ) : (
            <div className="divide-y">
              {permissions.map((permission, index) => (
                <div
                  key={permission.id}
                  className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex-shrink-0">
                    <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base truncate">{permission.name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      ID: {permission.id}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium flex-shrink-0">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        Total: {permissions.length} permission{permissions.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
