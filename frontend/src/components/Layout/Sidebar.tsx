import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Layout,
  Menu,
  Button,
  theme,
  Typography,
  Avatar
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
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';

const { Sider } = Layout;
const { Title, Text } = Typography;

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  children?: MenuItem[];
  requiredPermission?: string;
}

interface AppSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
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
      icon: <UserOutlined />,
      requiredPermission: 'patients:read',
      children: [
        { key: '/patients', label: 'All Patients', icon: <UserOutlined /> },
        { key: '/patients/add', label: 'Add Patient', icon: <UserOutlined /> },
        { key: '/patients/records', label: 'Medical Records', icon: <UserOutlined /> },
      ],
    },
    {
      key: '/nurse',
      label: 'Nurse Management',
      icon: <UserOutlined />,
      requiredPermission: 'nurse:read',
      children: [
        { key: '/nurse', label: 'All nurse', icon: <UserOutlined /> },
        { key: '/nurse/add', label: 'Add Nurse', icon: <UserOutlined /> },
      ],
    },
    {
      key: '/receptionist',
      label: 'Reseptionist Management',
      icon: <UserOutlined />,
      requiredPermission: 'receptionist:read',
      children: [
        { key: '/receptionist', label: 'All reseptionist', icon: <UserOutlined /> },
        { key: '/receptionist/add', label: 'Add reseptionist', icon: <UserOutlined /> },
      ],
    },
    {
      key: '/lab-technician',
      label: 'Lab Technician Management',
      icon: <UserOutlined />,
      requiredPermission: 'lab-technician:read',
      children: [
        { key: '/lab-technician', label: 'All Lab Technician', icon: <UserOutlined /> },
        { key: '/lab-technician/add', label: 'Add Lab Technician', icon: <UserOutlined /> },
      ],
    },
    {
      key: '/pharmacist',
      label: 'Pharmacist Management',
      icon: <UserOutlined />,
      requiredPermission: 'pharmacist:read',
      children: [
        { key: '/pharmacist', label: 'All Pharmacist', icon: <UserOutlined /> },
        { key: '/pharmacist/add', label: 'Add Pharmacist', icon: <UserOutlined /> },
      ],
    },
    {
      key: '/doctors',
      label: 'Doctor Management',
      icon: <TeamOutlined />,
      requiredPermission: 'doctors:read',
      children: [
        { key: '/doctors', label: 'All Doctors', icon: <TeamOutlined /> },
        { key: '/doctors/schedules', label: 'Schedules', icon: <CalendarOutlined /> },
        // { key: '/doctors/specializations', label: 'Specializations', icon: <TeamOutlined /> },
      ],
    },
    {
      key: '/appointments',
      label: 'Appointments',
      icon: <CalendarOutlined />,
      requiredPermission: 'appointments:read',
      children: [
        { key: '/appointments', label: 'All Appointments', icon: <CalendarOutlined /> },
        { key: '/appointments/calendar', label: 'Calendar View', icon: <CalendarOutlined /> },
        { key: '/appointments/book', label: 'Book Appointment', icon: <CalendarOutlined /> },
      ],
    },
    {
      key: '/tokens',
      label: 'Tokens',
      icon: <CalendarOutlined />,
      requiredPermission: 'tokens:read',
      children: [
        { key: '/tokens', label: 'All Tokens', icon: <CalendarOutlined /> },
        { key: '/tokens/calendar', label: 'Calendar View', icon: <CalendarOutlined /> },
        { key: '/tokens/create', label: 'Create Token', icon: <CalendarOutlined /> },
      ],
    },
    {
      key: '/pharmacy',
      label: 'Pharmacy',
      icon: <MedicineBoxOutlined />,
      requiredPermission: 'medicines:read',
      children: [
        { key: '/pharmacy/medicines', label: 'Medicine Inventory', icon: <MedicineBoxOutlined /> },
        { key: '/pharmacy/prescriptions', label: 'Prescriptions', icon: <FileTextOutlined /> },
        { key: '/pharmacy/orders', label: 'Purchase Orders', icon: <FileTextOutlined /> },
      ],
    },
    {
      key: '/laboratory',
      label: 'Laboratory',
      icon: <ExperimentOutlined />,
      requiredPermission: 'lab_tests:read',
      children: [
        { key: '/laboratory/tests', label: 'Lab Tests', icon: <ExperimentOutlined /> },
        { key: '/laboratory/results', label: 'Test Results', icon: <ExperimentOutlined /> },
        { key: '/laboratory/reports', label: 'Lab Reports', icon: <FileTextOutlined /> },
      ],
    },
    {
      key: '/surgery',
      label: 'Surgery',
      icon: <ExperimentOutlined />,
      requiredPermission: 'surgery:read',
      children: [
        { key: '/surgery/list', label: 'Surgeries', icon: <ExperimentOutlined /> },
        { key: '/surgery/types', label: 'Surgery Types', icon: <ExperimentOutlined /> },
        { key: '/surgery/operation-theatres', label: 'Operation Theatres', icon: <FileTextOutlined /> },
      ],
    },
    {
      key: '/billing',
      label: 'Billing',
      icon: <FileTextOutlined />,
      requiredPermission: 'billing:read',
      children: [
        { key: '/billing', label: 'Billing', icon: <FileTextOutlined /> },
        { key: '/billing/payments', label: 'Payments', icon: <FileTextOutlined /> },
        { key: '/billing/insurance', label: 'Insurance Claims', icon: <FileTextOutlined /> },
      ],
    },
    {
      key: '/wards',
      label: 'Ward Management',
      icon: <BankOutlined />,
      requiredPermission: 'wards:read',
      children: [
        { key: '/wards', label: 'Ward Status', icon: <BankOutlined /> },
        { key: '/wards/beds', label: 'Bed Allocation', icon: <BankOutlined /> },
      ],
    },
    {
      key: '/departments',
      label: 'Department Management',
      icon: <BankOutlined />,
      requiredPermission: 'wards:read',
      children: [
        { key: '/departments', label: 'Departments', icon: <BankOutlined /> },
        { key: '/departments/users', label: 'Users', icon: <BankOutlined /> },
      ],
    },
    {
      key: '/emergency',
      label: 'Emergency',
      icon: <AlertOutlined />,
      requiredPermission: 'emergency:read',
      children: [
        { key: '/emergency/cases', label: 'Emergency Cases', icon: <AlertOutlined /> },
        { key: '/emergency/triage', label: 'Triage', icon: <AlertOutlined /> },
      ],
    },
  ];

  const adminItems: MenuItem[] = [
    {
      key: '/admin',
      label: 'System Administration',
      icon: <SettingOutlined />,
      requiredPermission: '*',
      children: [
        // { key: '/admin/users', label: 'User Management', icon: <UserOutlined /> },
        // { key: '/admin/roles', label: 'Role Permissions', icon: <SettingOutlined /> },
        // { key: '/admin/settings', label: 'System Settings', icon: <SettingOutlined /> },
        { key: '/admin/audit', label: 'Audit Logs', icon: <SettingOutlined /> },
        { key: '/admin/user-types', label: 'User Types', icon: <SettingOutlined /> },
        { key: '/admin/user-fields', label: 'User Fields', icon: <SettingOutlined /> },
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

export const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed = false, onToggle }) => {
  const [internalCollapsed, setInternalCollapsed] = useState(collapsed);
  const { hasPermission, hasRole, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { token: { colorBgContainer } } = theme.useToken();

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

  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      if (!item.requiredPermission) return true;
      // if (item.requiredPermission === '*') return hasRole('admin');
      return hasPermission(item.requiredPermission);
    }).map(item => ({
      ...item,
      children: item.children ? filterMenuItems(item.children) : undefined
    })).filter(item => {
      // Remove items that have children but all children were filtered out
      if (item.children && item.children.length === 0) {
        return false;
      }
      return true;
    });
  };

  const menuItems = filterMenuItems(createMenuItems());
  const antdMenuItems = convertToAntdMenuItems(menuItems);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  const selectedKeys = [location.pathname];
  const openKeys = menuItems
    .filter(item => item.children?.some(child => child.key === location.pathname))
    .map(item => item.key);

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
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
        top: 0, // Changed from top: 0 to remove gap
        bottom: 0,
        zIndex: 40,
      }}
    >
      {/* Header Section with Collapse Button */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        height: '64px' // Match header height
      }}>
        {/* Collapse Button */}
        <Button
          type="text"
          icon={internalCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={handleToggle}
          style={{
            fontSize: '16px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />

        {/* Logo and User Info - Hidden when collapsed */}
        {!internalCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <Avatar
              size="small"
              style={{ backgroundColor: '#1890ff' }}
              src={user?.avatar}
            >
              {user?.name ? getUserInitials(user.name) : 'U'}
            </Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text strong style={{ fontSize: '12px', display: 'block', color: '#000' }}>
                {user?.name || 'User'}
              </Text>
              <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>
                {user.user_type.type ? user.user_type.type.replace('_', ' ').toUpperCase() : 'USER'}
              </Text>
            </div>
          </div>
        )}
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        defaultOpenKeys={internalCollapsed ? [] : openKeys}
        items={antdMenuItems}
        onClick={handleMenuClick}
        style={{
          border: 'none',
          height: 'calc(100vh - 64px)', // Adjusted to account for header height
          overflowY: 'auto',
        }}
        inlineCollapsed={internalCollapsed}
      />
    </Sider>
  );
};

export default AppSidebar;