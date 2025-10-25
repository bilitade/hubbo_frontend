import { Moon, Sun, Menu, Droplets } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 glass border-b border-border z-40 shadow-sm">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden hover:bg-primary/10"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-9 h-9 bg-brand-gradient rounded-xl flex items-center justify-center shadow-brand">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xl font-bold text-brand-gradient">Hubbo</span>
              <span className="text-[10px] text-muted-foreground -mt-1 font-medium">Workflow Platform</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {user && (
            <div className="hidden sm:flex items-center space-x-2 mr-2 px-3 py-1.5 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
              <div className="w-7 h-7 bg-brand-gradient rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-bold">
                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                </span>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-foreground">{user.first_name} {user.last_name}</div>
                <div className="text-[10px] text-muted-foreground">{user.email}</div>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-primary/10 hover:text-primary"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-primary/30 hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
