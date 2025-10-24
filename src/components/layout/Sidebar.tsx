import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Shield, 
  Key, 
  Bot, 
  FileText,
  X,
  Lightbulb,
  FolderKanban,
  CheckSquare,
  FlaskConical,
  UserCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Ideas', href: '/ideas', icon: Lightbulb },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Experiments', href: '/experiments', icon: FlaskConical },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'My Profile', href: '/profiles', icon: UserCircle },
  { name: 'Roles', href: '/roles', icon: Shield },
  { name: 'Permissions', href: '/permissions', icon: Key },
  { name: 'AI Assistant', href: '/ai', icon: Bot },
  { name: 'Files', href: '/files', icon: FileText },
];

export function Sidebar({ open = true, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] border-r bg-background transition-all duration-300 overflow-y-auto",
          "md:translate-x-0", // Always visible on desktop
          open ? "w-64" : "w-16", // Width changes on desktop
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0" // Hide on mobile when closed
        )}
      >
        <div className="flex h-full flex-col py-2">
          <div className="flex items-center justify-between px-4 py-2 md:hidden">
            <span className="font-semibold">Menu</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 px-2 py-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={(e) => {
                  // Only close on mobile (screen width < 768px)
                  if (window.innerWidth < 768) {
                    onClose?.();
                  }
                }}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg py-3 text-sm font-medium transition-colors",
                    open ? "px-4" : "px-0 justify-center",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                }
                title={!open ? item.name : undefined} // Show tooltip when collapsed
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className={cn(
                  "transition-all duration-300",
                  open ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
                )}>
                  {item.name}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
