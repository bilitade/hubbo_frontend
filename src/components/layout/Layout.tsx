import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Open by default on desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Not collapsed by default

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main 
        className={`pt-16 pb-14 transition-all duration-300 ${
          sidebarOpen && !sidebarCollapsed ? 'md:pl-64' : 'md:pl-16'
        }`}
      >
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet />
        </div>
      </main>
      
      {/* Fixed Footer */}
      <footer className={`fixed bottom-0 left-0 right-0 h-14 border-t border-border bg-card/95 backdrop-blur-md shadow-lg z-30 transition-all duration-300 ${
        sidebarOpen && !sidebarCollapsed ? 'md:pl-64' : 'md:pl-16'
      }`}>
        <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center shadow-brand">
              <span className="text-white text-xs font-bold">H</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-foreground">Hubbo Platform</p>
              <p className="text-[10px] text-muted-foreground -mt-0.5">Cooperative Bank of Oromia</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] sm:text-xs text-muted-foreground">
            <span className="font-medium">© 2025 CBO</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">AI Foundry Team</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
