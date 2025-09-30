import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        {/* Sidebar - Fixed */}
        <AppSidebar 
          collapsed={sidebarCollapsed}
          onToggle={handleToggleSidebar}
        />
        
        {/* Main Layout */}
        <div className="flex-1 flex flex-col">
          {/* Header - Fixed at top */}
          <header className="sticky top-0 z-50 bg-background border-b">
            <Header 
              onToggleSidebar={handleToggleSidebar}
              sidebarCollapsed={sidebarCollapsed}
            />
          </header>
          
          {/* Main content - Offset for sidebar */}
          <main 
            className="flex-1 bg-background transition-all duration-300"
            style={{
              marginLeft: sidebarCollapsed ? '80px' : '256px',
              minHeight: 'calc(100vh - 64px)'
            }}
          >
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;