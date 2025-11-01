import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Layout,
  Menu,
  Button,
  theme,
  Typography,
  Avatar,
  Drawer,
  Grid
} from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  BankOutlined,
  AlertOutlined,
  SettingOutlined,
  HeartOutlined,
  SafetyCertificateOutlined,
  SolutionOutlined,
  ApartmentOutlined,
  ContainerOutlined,
  AuditOutlined,
  ToolOutlined,
  ShopOutlined,
  ClusterOutlined,
  RocketOutlined,
  InsuranceOutlined,
  HomeOutlined,
  BuildOutlined,
  PlusCircleOutlined,
  ScheduleOutlined,
  FormOutlined,
  BarChartOutlined,
  DollarOutlined,
  CreditCardOutlined,
  DesktopOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons';

const { Sider } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  children?: MenuItem[];
  requiredPermission?: string[] | string;
}

interface AppSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const createMenuItems = (): MenuItem[] => {
  const baseItems: MenuItem[] = [
    {
      key: '/dashboard',
      label: 'Dashboard',
      icon: <DashboardOutlined />
    },
    {
      key: '/patients',
      label: 'Patient Management',
      icon: <HeartOutlined />,
      requiredPermission: ['patients:read'],
      children: [
        { key: '/patients', label: 'All Patients', requiredPermission: "patients:read", icon: <UserOutlined /> },
        { key: '/patients/add', label: 'Add Patient', requiredPermission: "patients:add", icon: <PlusCircleOutlined /> },
        { key: '/patients/records', label: 'Medical Records', requiredPermission: "patients:read", icon: <FormOutlined /> },
      ],
    },
    {
      key: '/nurse',
      label: 'Nurse Management',
      icon: <SafetyCertificateOutlined />,
      requiredPermission: ['nurse:read'],
      children: [
        { key: '/nurse', label: 'All Nurses', requiredPermission: "nurse:read", icon: <TeamOutlined /> },
        { key: '/nurse/add', label: 'Add Nurse', requiredPermission: "nurse:add", icon: <UsergroupAddOutlined /> },
      ],
    },
    {
      key: '/receptionist',
      label: 'Receptionist Management',
      icon: <SolutionOutlined />,
      requiredPermission: ['receptionist:read'],
      children: [
        { key: '/receptionist', label: 'All Receptionists', requiredPermission: "receptionist:read", icon: <TeamOutlined /> },
        { key: '/receptionist/add', label: 'Add Receptionist', requiredPermission: "receptionist:add", icon: <UsergroupAddOutlined /> },
      ],
    },
    {
      key: '/lab-technician',
      label: 'Lab Technician Management',
      icon: <ExperimentOutlined />,
      requiredPermission: ['lab-technician:read'],
      children: [
        { key: '/lab-technician', label: 'All Lab Technicians', requiredPermission: "lab-technician:read", icon: <TeamOutlined /> },
        { key: '/lab-technician/add', label: 'Add Lab Technician', requiredPermission: "lab-technician:add", icon: <UsergroupAddOutlined /> },
      ],
    },
    {
      key: '/pharmacist',
      label: 'Pharmacist Management',
      icon: <MedicineBoxOutlined />,
      requiredPermission: ['pharmacist:read'],
      children: [
        { key: '/pharmacist', label: 'All Pharmacists', requiredPermission: "pharmacist:read", icon: <TeamOutlined /> },
        { key: '/pharmacist/add', label: 'Add Pharmacist', requiredPermission: "pharmacist:add", icon: <UsergroupAddOutlined /> },
      ],
    },
    {
      key: '/doctors',
      label: 'Doctor Management',
      icon: <UserOutlined />,
      requiredPermission: ['doctor:read'],
      children: [
        { key: '/doctors', label: 'All Doctors', requiredPermission: "doctor:read", icon: <TeamOutlined /> },
        { key: '/doctors/add', label: 'Add Doctor', requiredPermission: "doctor:add", icon: <UsergroupAddOutlined /> },
        // { key: '/doctors/schedules', label: 'Schedules', icon: <ScheduleOutlined /> },
      ],
    },
    {
      key: '/appointments',
      label: 'Appointments',
      icon: <CalendarOutlined />,
      requiredPermission: ['appointments:read'],
      children: [
        { key: '/appointments', label: 'All Appointments', requiredPermission: "appointments:read", icon: <BarChartOutlined /> },
        { key: '/appointments/calendar', label: 'Calendar View', requiredPermission: "appointments:read", icon: <CalendarOutlined /> },
        { key: '/appointments/book', label: 'Book Appointment', requiredPermission: "appointments:add", icon: <PlusCircleOutlined /> },
      ],
    },
    {
      key: '/tokens',
      label: 'Tokens',
      icon: <ContainerOutlined />,
      requiredPermission: ['tokens:read'],
      children: [
        { key: '/tokens', label: 'All Tokens', requiredPermission: "tokens:read", icon: <ContainerOutlined /> },
        { key: '/tokens/calendar', label: 'Calendar View', requiredPermission: "tokens:read", icon: <CalendarOutlined /> },
        { key: '/tokens/create', label: 'Create Token', requiredPermission: "tokens:add", icon: <PlusCircleOutlined /> },
      ],
    },
    {
      key: '/pharmacy',
      label: 'Pharmacy',
      icon: <ShopOutlined />,
      requiredPermission: ['medicines:read', 'medicine-orders:read'],
      children: [
        { key: '/pharmacy/medicines', label: 'Medicine Inventory', requiredPermission: "medicines:read", icon: <MedicineBoxOutlined /> },
        // { key: '/pharmacy/prescriptions', label: 'Prescriptions', requiredPermission: "medicines:read", icon: <FileTextOutlined /> },
        { key: '/pharmacy/orders', label: 'Purchase Orders', requiredPermission: "medicine-orders:read", icon: <ContainerOutlined /> },
      ],
    },
    {
      key: '/laboratory',
      label: 'Laboratory',
      icon: <ExperimentOutlined />,
      requiredPermission: ['labs:read', 'lab-orders:read'],
      children: [
        { key: '/laboratory/tests', label: 'Lab Tests', requiredPermission: "labs:read", icon: <ExperimentOutlined /> },
        // { key: '/laboratory/results', label: 'Test Results', requiredPermission: "lab_tests:read", icon: <FileTextOutlined /> },
        { key: '/laboratory/requests', label: 'Test Requests', requiredPermission: "lab-orders:read", icon: <FileTextOutlined /> },
        // { key: '/laboratory/reports', label: 'Lab Reports', requiredPermission: "lab_tests:read", icon: <BarChartOutlined /> },
      ],
    },
    {
      key: '/surgery',
      label: 'Surgery',
      icon: <RocketOutlined />,
      requiredPermission: ['surgery:read', 'surgery-types:read', 'operation-theatres:read'],
      children: [
        { key: '/surgery/list', label: 'Surgeries', requiredPermission: "surgery:read", icon: <RocketOutlined /> },
        { key: '/surgery/types', label: 'Surgery Types', requiredPermission: "surgery-types:read", icon: <ToolOutlined /> },
        { key: '/surgery/operation-theatres', label: 'Operation Theatres', requiredPermission: "operation-theatres:read", icon: <HomeOutlined /> },
      ],
    },
    {
      key: '/prescriptions',
      label: 'Prescription',
      icon: <RocketOutlined />,
      requiredPermission: ['prescriptions:read'],
      children: [
        { key: '/prescriptions', label: 'Prescriptions', requiredPermission: "prescriptions:read", icon: <FileTextOutlined /> },
      ],
    },
    {
      key: '/billing',
      label: 'Billing',
      icon: <DollarOutlined />,
      requiredPermission: ['billing:read', 'payments:read'],
      children: [
        { key: '/billing', label: 'Billing', requiredPermission: "billing:read", icon: <FileTextOutlined /> },
        { key: '/billing/payments', label: 'Payments', requiredPermission: "payments:read", icon: <CreditCardOutlined /> },
      ],
    },
    {
      key: '/wards',
      label: 'Ward Management',
      icon: <HomeOutlined />,
      requiredPermission: ['wards:read', 'ward-beds:read'],
      children: [
        { key: '/wards', label: 'Ward Status', requiredPermission: "wards:read", icon: <ClusterOutlined /> },
        { key: '/wards/beds', label: 'Bed Allocation', requiredPermission: "ward-beds:read", icon: <ApartmentOutlined /> },
      ],
    },
    {
      key: '/departments',
      label: 'Department Management',
      icon: <ApartmentOutlined />,
      requiredPermission: ['departments:read', 'department-users:read'],
      children: [
        { key: '/departments', label: 'Departments', requiredPermission: "departments:read", icon: <ClusterOutlined /> },
        { key: '/departments/users', label: 'Users', requiredPermission: "department-users:read", icon: <UsergroupAddOutlined /> },
      ],
    },
    // {
    //   key: '/emergency',
    //   label: 'Emergency',
    //   icon: <AlertOutlined />,
    //   requiredPermission: 'emergency:read',
    //   children: [
    //     { key: '/emergency/cases', label: 'Emergency Cases', icon: <AlertOutlined /> },
    //     { key: '/emergency/triage', label: 'Triage', icon: <InsuranceOutlined /> },
    //   ],
    // },
  ];

  const adminItems: MenuItem[] = [
    {
      key: '/admin',
      label: 'System Administration',
      icon: <SettingOutlined />,
      requiredPermission: 'admin:access',
      children: [
        // { key: '/admin/audit', label: 'Audit Logs', requiredPermission: 'audit-logs:read', icon: <AuditOutlined /> },
        { key: '/admin/user-fields', label: 'User Fields', requiredPermission: 'user-fields:read', icon: <BuildOutlined /> },
        { key: '/admin/settings', label: 'Settings', requiredPermission: 'admin-settings:read', icon: <ToolOutlined /> },
      ],
    },
  ];

  return [...baseItems, ...adminItems];
};

// Convert our MenuItem to Ant Design's MenuItemType
const convertToAntdMenuItems = (items: MenuItem[]): MenuProps['items'] => {
  return items.map(item => ({
    key: item.key,
    label: item.label,
    icon: item.icon,
    children: item.children ? convertToAntdMenuItems(item.children) : undefined,
  }));
};

export const AppSidebar: React.FC<AppSidebarProps> = ({
  collapsed = false,
  onToggle,
  mobileOpen = false,
  onMobileClose
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(collapsed);
  const { hasPermission, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { token: { colorBgContainer } } = theme.useToken();
  const screens = useBreakpoint();

  const isMobile = !screens.md;

  // Sync internal state with prop changes
  useEffect(() => {
    setInternalCollapsed(collapsed);
  }, [collapsed]);

  const handleToggle = () => {
    const newCollapsedState = !internalCollapsed;
    setInternalCollapsed(newCollapsedState);
    if (onToggle) {
      onToggle();
    }
  };

  const handleDrawerClose = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
    // Close mobile drawer when menu item is clicked
    if (isMobile) {
      handleDrawerClose();
    }
  };

  const filterMenuItems = (items: any): any => {
    return items.filter(item => {
      if (!item.requiredPermission) return true;
      if (item.children) {
        item.children = item.children.filter((child) =>
          !child.requiredPermission || hasPermission(Array.isArray(child.requiredPermission) ? [...child.requiredPermission] : [child.requiredPermission])
        );
      }

      return hasPermission(Array.isArray(item.requiredPermission) ? [...item.requiredPermission] : [item.requiredPermission]);
    }).filter(item => {
      // Remove items that have children but all children were filtered out
      if (item.children && item.children.length === 0) {
        return false;
      }
      return true;
    });
  };

  const menuItems = filterMenuItems(createMenuItems());
  const antdMenuItems = convertToAntdMenuItems(menuItems);

  const selectedKeys = [location.pathname];
  const openKeys = menuItems
    .filter(item => item.children?.some(child => child.key === location.pathname))
    .map(item => item.key);

  const getUserInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <Sider
      trigger={null}
      collapsible
      collapsed={internalCollapsed}
      width={256}
      style={{
        background: colorBgContainer,
        boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 64, // Start below header
        bottom: 0,
        zIndex: 30,
      }}
    >

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        defaultOpenKeys={internalCollapsed ? [] : openKeys}
        items={antdMenuItems}
        onClick={handleMenuClick}
        style={{
          border: 'none',
          height: 'calc(100vh - 128px)', // Adjust for header and sidebar header
          overflowY: 'auto',
        }}
        inlineCollapsed={internalCollapsed}
      />
    </Sider>
  );

  // Mobile Drawer
  const MobileDrawer = () => (
    <Drawer
      placement="left"
      onClose={handleDrawerClose}
      open={mobileOpen}
      width={280}
      bodyStyle={{
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
      style={{
        zIndex: 1001,
      }}
    >
      {/* Drawer Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        height: '64px'
      }}>
        <Avatar
          size="small"
          style={{ backgroundColor: '#1890ff' }}
          src={user?.avatar}
        >
          {getUserInitials(user?.name)}
        </Avatar>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong style={{ fontSize: '14px', display: 'block', color: '#000' }}>
            {user?.name || 'User'}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
            {user?.user_type?.type ? user.user_type.type.replace('_', ' ').toUpperCase() : 'USER'}
          </Text>
        </div>
      </div>

      {/* Drawer Menu */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          items={antdMenuItems}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            height: '100%',
          }}
        />
      </div>
    </Drawer>
  );

  return (
    <>
      {isMobile ? (
        <MobileDrawer />
      ) : (
        <DesktopSidebar />
      )}
    </>
  );
};

export default AppSidebar;