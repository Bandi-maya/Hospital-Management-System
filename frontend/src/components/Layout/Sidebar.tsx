import React, { useState } from 'react';
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
      key: '/doctors',
      label: 'Doctor Management',
      icon: <TeamOutlined />,
      requiredPermission: 'doctors:read',
      children: [
        { key: '/doctors', label: 'All Doctors', icon: <TeamOutlined /> },
        { key: '/doctors/schedules', label: 'Schedules', icon: <CalendarOutlined /> },
        { key: '/doctors/specializations', label: 'Specializations', icon: <TeamOutlined /> },
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
      key: '/billing',
      label: 'Billing & Invoices',
      icon: <FileTextOutlined />,
      requiredPermission: 'billing:read',
      children: [
        { key: '/billing/invoices', label: 'All Invoices', icon: <FileTextOutlined /> },
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
        { key: '/admin/users', label: 'User Management', icon: <UserOutlined /> },
        { key: '/admin/roles', label: 'Role Permissions', icon: <SettingOutlined /> },
        { key: '/admin/settings', label: 'System Settings', icon: <SettingOutlined /> },
        { key: '/admin/audit', label: 'Audit Logs', icon: <SettingOutlined /> },
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

export const AppSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { hasPermission, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { token: { colorBgContainer } } = theme.useToken();

  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      if (!item.requiredPermission) return true;
      if (item.requiredPermission === '*') return hasRole('admin');
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

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={256}
      style={{
        background: colorBgContainer,
        boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <Avatar 
          size={32} 
          icon={<HeartOutlined />} 
          style={{ 
            backgroundColor: '#1890ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} 
        />
        {!collapsed && (
          <div>
            <Title level={5} style={{ margin: 0, fontSize: '16px' }}>MediCare</Title>
            <Text type="secondary" style={{ fontSize: '12px' }}>Hospital System</Text>
          </div>
        )}
      </div>

      {/* Collapse Button */}
      <div style={{ padding: '8px', textAlign: 'center' }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: '16px',
            width: '100%',
            height: '40px'
          }}
        />
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        defaultOpenKeys={openKeys}
        items={antdMenuItems}
        onClick={handleMenuClick}
        style={{
          border: 'none',
          height: 'calc(100vh - 120px)',
          overflowY: 'auto'
        }}
      />
    </Sider>
  );
};

export default AppSidebar;