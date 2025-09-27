import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  Pill,
  FlaskConical,
  Receipt,
  Building2,
  Siren,
  Settings,
  Heart,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  requiredPermission?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Patient Management',
    url: '/patients',
    icon: Users,
    requiredPermission: 'patients:read',
    children: [
      { title: 'All Patients', url: '/patients', icon: Users },
      { title: 'Add Patient', url: '/patients/add', icon: Users },
      { title: 'Medical Records', url: '/patients/records', icon: Users },
    ],
  },
  {
    title: 'Doctor Management',
    url: '/doctors',
    icon: UserCheck,
    requiredPermission: 'doctors:read',
    children: [
      { title: 'All Doctors', url: '/doctors', icon: UserCheck },
      { title: 'Schedules', url: '/doctors/schedules', icon: Calendar },
      { title: 'Specializations', url: '/doctors/specializations', icon: UserCheck },
    ],
  },
  {
    title: 'Appointments',
    url: '/appointments',
    icon: Calendar,
    requiredPermission: 'appointments:read',
    children: [
      { title: 'All Appointments', url: '/appointments', icon: Calendar },
      { title: 'Calendar View', url: '/appointments/calendar', icon: Calendar },
      { title: 'Book Appointment', url: '/appointments/book', icon: Calendar },
    ],
  },
  {
    title: 'Pharmacy',
    url: '/pharmacy',
    icon: Pill,
    requiredPermission: 'medicines:read',
    children: [
      { title: 'Medicine Inventory', url: '/pharmacy/medicines', icon: Pill },
      { title: 'Prescriptions', url: '/pharmacy/prescriptions', icon: Receipt },
      { title: 'Purchase Orders', url: '/pharmacy/orders', icon: Receipt },
    ],
  },
  {
    title: 'Laboratory',
    url: '/laboratory',
    icon: FlaskConical,
    requiredPermission: 'lab_tests:read',
    children: [
      { title: 'Lab Tests', url: '/laboratory/tests', icon: FlaskConical },
      { title: 'Test Results', url: '/laboratory/results', icon: FlaskConical },
      { title: 'Lab Reports', url: '/laboratory/reports', icon: Receipt },
    ],
  },
  {
    title: 'Billing & Invoices',
    url: '/billing',
    icon: Receipt,
    requiredPermission: 'billing:read',
    children: [
      { title: 'All Invoices', url: '/billing/invoices', icon: Receipt },
      { title: 'Payments', url: '/billing/payments', icon: Receipt },
      { title: 'Insurance Claims', url: '/billing/insurance', icon: Receipt },
    ],
  },
  {
    title: 'Ward Management',
    url: '/wards',
    icon: Building2,
    requiredPermission: 'wards:read',
    children: [
      { title: 'Ward Status', url: '/wards', icon: Building2 },
      { title: 'Bed Allocation', url: '/wards/beds', icon: Building2 },
    ],
  },
  {
    title: 'Emergency',
    url: '/emergency',
    icon: Siren,
    requiredPermission: 'emergency:read',
    children: [
      { title: 'Emergency Cases', url: '/emergency/cases', icon: Siren },
      { title: 'Triage', url: '/emergency/triage', icon: Siren },
    ],
  },
];

const adminMenuItems: MenuItem[] = [
  {
    title: 'System Administration',
    url: '/admin',
    icon: Settings,
    requiredPermission: '*',
    children: [
      { title: 'User Management', url: '/admin/users', icon: Users },
      { title: 'Role Permissions', url: '/admin/roles', icon: Settings },
      { title: 'System Settings', url: '/admin/settings', icon: Settings },
      { title: 'Audit Logs', url: '/admin/audit', icon: Settings },
    ],
  },
];

export const AppSidebar: React.FC = () => {
  const { state } = useSidebar();
  const { hasPermission, hasRole } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Dashboard']);
  
  const isCollapsed = state === 'collapsed';

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const getNavClassName = (isActive: boolean) => {
    return isActive 
      ? "bg-primary text-primary-foreground font-medium"
      : "hover:bg-accent hover:text-accent-foreground text-sidebar-foreground";
  };

  const filterMenuItems = (items: MenuItem[]) => {
    return items.filter(item => {
      if (!item.requiredPermission) return true;
      return hasPermission(item.requiredPermission);
    });
  };

  const allMenuItems = [
    ...filterMenuItems(menuItems),
    ...(hasRole('admin') ? filterMenuItems(adminMenuItems) : [])
  ];

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
          <Heart className="h-5 w-5" />
        </div>
        {!isCollapsed && (
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">MediCare</h2>
            <p className="text-xs text-sidebar-foreground/60">Hospital System</p>
          </div>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {allMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.children ? (
                    <div>
                      <SidebarMenuButton
                        onClick={() => !isCollapsed && toggleGroup(item.title)}
                        className={`${getNavClassName(isActive(item.url))} justify-between`}
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-2 h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </div>
                        {!isCollapsed && (
                          expandedGroups.includes(item.title) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )
                        )}
                      </SidebarMenuButton>
                      
                      {!isCollapsed && expandedGroups.includes(item.title) && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <SidebarMenuButton key={child.title} asChild>
                              <NavLink
                                to={child.url}
                                className={({ isActive }) => 
                                  `text-sm ${getNavClassName(isActive)} pl-2`
                                }
                              >
                                <span>{child.title}</span>
                              </NavLink>
                            </SidebarMenuButton>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) => getNavClassName(isActive)}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;