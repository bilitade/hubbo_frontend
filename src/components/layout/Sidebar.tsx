import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Lightbulb, 
  FolderKanban, 
  CheckSquare, 
  FlaskConical, 
  Users, 
  UserCircle, 
  Shield, 
  Key, 
  Brain, 
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { usePermissions } from '../../hooks/usePermissions';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  to: string;
  icon: any;
  label: string;
  exact: boolean;
  permission?: string;
  permissions?: string[];
}

const navItems: NavItem[] = [
  { 
    to: '/dashboard', 
    icon: LayoutDashboard, 
    label: 'Workflow', 
    exact: true,
    // Everyone can see workflow
  },
  { 
    to: '/dashboard/ideas', 
    icon: Lightbulb, 
    label: 'Ideas', 
    exact: false,
    permission: 'ideas:view',
  },
  { 
    to: '/dashboard/projects', 
    icon: FolderKanban, 
    label: 'Projects', 
    exact: false,
    permission: 'projects:view',
  },
  { 
    to: '/dashboard/tasks', 
    icon: CheckSquare, 
    label: 'Tasks', 
    exact: false,
    permission: 'tasks:view',
  },
  { 
    to: '/dashboard/experiments', 
    icon: FlaskConical, 
    label: 'Experiments', 
    exact: false,
    permission: 'experiments:view',
  },
  { 
    to: '/dashboard/users', 
    icon: Users, 
    label: 'Users', 
    exact: false,
    permission: 'users:view',
  },
  { 
    to: '/dashboard/profiles', 
    icon: UserCircle, 
    label: 'Profiles', 
    exact: false,
    permission: 'profiles:view',
  },
  { 
    to: '/dashboard/roles', 
    icon: Shield, 
    label: 'Roles', 
    exact: false,
    permission: 'roles:view',
  },
  { 
    to: '/dashboard/permissions', 
    icon: Key, 
    label: 'Permissions', 
    exact: false,
    permission: 'permissions:view',
  },
  { 
    to: '/dashboard/ai', 
    icon: Brain, 
    label: 'AI Assistant', 
    exact: false,
    permission: 'ai:use',
  },
  { 
    to: '/dashboard/files', 
    icon: FileText, 
    label: 'Files', 
    exact: false,
    permission: 'files:view',
  },
];

export function Sidebar({ open, onClose, collapsed = false, onToggleCollapse }: SidebarProps) {
  const { hasPermission, hasAnyPermission, isAdmin } = usePermissions();

  // Filter nav items based on permissions
  const visibleNavItems = navItems.filter(item => {
    // Admin can see everything
    if (isAdmin) return true;
    
    // No permission required - visible to all
    if (!item.permission && !item.permissions) return true;
    
    // Check single permission
    if (item.permission && !hasPermission(item.permission)) return false;
    
    // Check multiple permissions (any)
    if (item.permissions && !hasAnyPermission(item.permissions)) return false;
    
    return true;
  });
  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] bg-card border-r border-border z-40
          transition-all duration-300 ease-in-out shadow-lg
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${collapsed ? 'md:w-16' : 'md:w-64'}
          w-64
        `}
      >
        <div className="flex flex-col h-full">
          {/* Collapse Toggle Button (Desktop Only) */}
          <div className="hidden md:flex items-center justify-end p-2 border-b border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      onClose();
                    }
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all group relative
                    ${collapsed ? 'justify-center md:px-0' : ''}
                    ${
                      isActive
                        ? 'bg-brand-gradient text-white shadow-brand'
                        : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                    }`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                      <span className={`${collapsed ? 'md:hidden' : ''} text-sm whitespace-nowrap`}>
                        {item.label}
                      </span>
                      
                      {/* Tooltip for collapsed state */}
                      {collapsed && (
                        <div className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                          {item.label}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Collapsed Footer Icon */}
          {collapsed && (
            <div className="hidden md:block p-2 border-t border-border">
              <div className="w-10 h-10 mx-auto bg-brand-gradient rounded-lg flex items-center justify-center shadow-brand">
                <span className="text-white text-xs font-bold">H</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
