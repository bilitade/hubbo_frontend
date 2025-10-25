import type { ReactNode } from 'react';
import { usePermissions } from '../../hooks/usePermissions';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  role?: string;
  roles?: string[];
  fallback?: ReactNode;
}

/**
 * Component to conditionally render children based on permissions/roles
 * 
 * @example
 * // Single permission check
 * <PermissionGuard permission="users:create">
 *   <Button>Create User</Button>
 * </PermissionGuard>
 * 
 * // Multiple permissions (any)
 * <PermissionGuard permissions={['users:edit', 'users:delete']}>
 *   <Button>Manage User</Button>
 * </PermissionGuard>
 * 
 * // Multiple permissions (all required)
 * <PermissionGuard permissions={['users:edit', 'users:delete']} requireAll>
 *   <Button>Full Access</Button>
 * </PermissionGuard>
 * 
 * // Role check
 * <PermissionGuard role="admin">
 *   <AdminPanel />
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  fallback = null,
}: PermissionGuardProps) {
  const permissionCheck = usePermissions();

  // Check single permission
  if (permission && !permissionCheck.hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions) {
    const hasAccess = requireAll
      ? permissionCheck.hasAllPermissions(permissions)
      : permissionCheck.hasAnyPermission(permissions);
    
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  // Check single role
  if (role && !permissionCheck.hasRole(role)) {
    return <>{fallback}</>;
  }

  // Check multiple roles
  if (roles && !permissionCheck.hasAnyRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

