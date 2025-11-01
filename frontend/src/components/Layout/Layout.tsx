import React, { useEffect, useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './Sidebar';
import { Header } from './Header';
import { getEmailFromToken } from '@/utils/utils';
import { useAuth } from '@/hooks/useAuth';
import { Grid } from 'antd';
import { toast } from 'sonner';
import { getApi } from '@/ApiService';

const { useBreakpoint } = Grid;

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [email, setEmail] = useState("");
  const { user, logout } = useAuth();
  const screens = useBreakpoint();

  const isMobile = !screens.md;

  console.log(user);
  const [accountInfo, setAccountInfo] = useState<any>({})

  useEffect(() => {
    getApi('/account-info')
      .then((data) => {
        if (data) {
          setAccountInfo(data)
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error occcurred while gteting account info")
      });
  }, []);

  useEffect(() => {
    if (localStorage.getItem("auth_token")) {
      setEmail(getEmailFromToken(localStorage.getItem("auth_token")));
    } else {
      if (user) {
        logout();
      }
    }
  }, [localStorage.getItem("auth_token")]);

  useEffect(() => {
    if (email && user.email && user.email !== email) {
      logout();
    }
  });

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileSidebarToggle = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Calculate main content margin based on device type
  const getMainContentStyle = () => {
    if (isMobile) {
      // On mobile, no margin since sidebar is in drawer
      return {
        marginLeft: '0',
        minHeight: 'calc(100vh - 64px)',
        width: '100%'
      };
    } else {
      // On desktop, margin based on sidebar collapse state
      return {
        marginLeft: sidebarCollapsed ? '80px' : '256px',
        minHeight: 'calc(100vh - 64px)',
        width: `calc(100% - ${sidebarCollapsed ? '80px' : '256px'})`
      };
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        {/* Sidebar - Only show on desktop */}
        {!isMobile && (
          <AppSidebar
            collapsed={sidebarCollapsed}
            onToggle={handleToggleSidebar}
          />
        )}

        {/* Mobile Sidebar handled by AppSidebar component */}
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={handleToggleSidebar}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main Layout */}
        <div className="flex-1 flex flex-col">
          {/* Header - Fixed at top */}
          <header className="sticky top-0 z-30 bg-background border-b">
            <Header
              onToggleSidebar={handleToggleSidebar}
              accountInfo={accountInfo}
              onMobileSidebarToggle={handleMobileSidebarToggle}
              sidebarCollapsed={sidebarCollapsed}
              isMobile={isMobile}
              mobileSidebarOpen={mobileSidebarOpen}
            />
          </header>

          {/* Main content - Adjust based on device */}
          <main
            className="flex-1 bg-background transition-all duration-300"
            style={getMainContentStyle()}
          >
            <div className="p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;