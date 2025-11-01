import React, { useContext, useEffect, useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './Sidebar';
import { Header } from './Header';
import { getEmailFromToken } from '@/utils/utils';
import { useAuth } from '@/hooks/useAuth';
import { Grid } from 'antd';
import { toast } from 'sonner';
import { getApi } from '@/ApiService';
import { AccountInfoContext } from '@/hooks/AccountInfoContext';
import { useNavigate } from 'react-router-dom';

const { useBreakpoint } = Grid;

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [email, setEmail] = useState("");
  const { user, logout, hasPermission } = useAuth();
  const screens = useBreakpoint();
  const navigate = useNavigate()

  const isMobile = !screens.md;

  console.log(user);

  useEffect(() => {
    if (user?.user_type?.type === 'Patient' && (window.location.pathname.split('/').length !== 3 || window.location.pathname.split('/')?.[1] !== 'patients')) {
      navigate(`/patients/${user?.id}`)
    }
  }, [user])
  const [accountInfo, setAccountInfo] = useContext(AccountInfoContext)

  const checkIfNext = async () => {
    try {
      console.log(navigator.vibrate([500, 200, 500]))
      const res = await getApi("/tokens/next");
      if (res?.is_next) {
        toast.success("🎉 You're next!");
        if ("vibrate" in navigator) {
          navigator.vibrate([500, 200, 500]);
        }
        if ("Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification("You're next!", {
              body: "Please proceed to your appointment.",
              icon: "/favicon.ico", // optional icon
            });
          } else if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
              new Notification("You're next!", {
                body: "Please proceed to your appointment.",
                icon: "/favicon.ico",
              });
            }
          }
        }
      } else {
        console.log("Your position in queue:", res.position_in_queue);
      }
    } catch (err) {
      console.error("Error checking next token:", err);
    }
  };

  useEffect(() => {
    // Call immediately once on mount
    checkIfNext();

    // Then repeat every 30 seconds
    const interval = setInterval(() => {
      checkIfNext();
    }, 30000);

    // Cleanup when component unmounts
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    getApi('/account-info?id=7', {}, true)
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
          user?.user_type?.type !== 'Patient' &&
          <AppSidebar
            collapsed={sidebarCollapsed}
            onToggle={handleToggleSidebar}
          />
        )}

        {/* Mobile Sidebar handled by AppSidebar component */}
        {
          user?.user_type?.type !== 'Patient' &&
          <AppSidebar
            collapsed={sidebarCollapsed}
            onToggle={handleToggleSidebar}
            mobileOpen={mobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
          />
        }

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