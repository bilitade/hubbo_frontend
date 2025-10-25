import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface PermissionCheck {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (roleName: string) => boolean;
  hasAnyRole: (roleNames: string[]) => boolean;
  permissions: Set<string>;
  roles: Set<string>;
  isAdmin: boolean;
}

/**
 * Hook to check user permissions and roles
 * 
 * @example
 * const { hasPermission, hasRole, isAdmin } = usePermissions();
 * 
 * if (hasPermission('users:create')) {
 *   // Show create user button
 * }
 * 
 * if (hasRole('admin')) {
 *   // Show admin panel
 * }
 */
export function usePermissions(): PermissionCheck {
  const { user } = useAuth();

  const { permissions, roles } = useMemo(() => {
    const permissions = new Set<string>();
    const roles = new Set<string>();

    if (user?.roles) {
      user.roles.forEach(role => {
        roles.add(role.name);
        role.permissions.forEach(permission => {
          permissions.add(permission.name);
        });
      });
    }

    return { permissions, roles };
  }, [user]);

  const hasPermission = (permission: string): boolean => {
    return permissions.has(permission);
  };

  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some(p => permissions.has(p));
  };

  const hasAllPermissions = (permissionList: string[]): boolean => {
    return permissionList.every(p => permissions.has(p));
  };

  const hasRole = (roleName: string): boolean => {
    return roles.has(roleName);
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    return roleNames.some(r => roles.has(r));
  };

  const isAdmin = hasRole('admin');

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    permissions,
    roles,
    isAdmin,
  };
}

