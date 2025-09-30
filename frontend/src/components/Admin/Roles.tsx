import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Input,
  Table,
  Select,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Form,
  InputNumber,
  DatePicker,
  Space,
  Tooltip,
  Popconfirm,
  Descriptions,
  message,
  Progress,
  Avatar,
  Badge,
  Tabs,
  Timeline,
  Alert,
  Divider,
  Switch,
  Collapse,
  Typography,
  Flex,
  List
} from "antd";
import {
  UserSwitchOutlined,
  TeamOutlined,
  LockOutlined,
  NotificationOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  MedicineBoxOutlined,
  SettingOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  SaveOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SecurityScanOutlined,
  UserOutlined,
  CalendarOutlined,
  FileSearchOutlined,
  DollarOutlined,
  BarChartOutlined,
  BellOutlined,
  CloudSyncOutlined,
  ControlOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  ExportOutlined,
  PieChartOutlined,
  TableOutlined,
  ApartmentOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

// Sample roles data
const defaultRoles = [
  {
    id: 1,
    name: "Super Admin",
    description: "Full system access with all permissions",
    userCount: 2,
    permissions: {
      dashboard: true,
      patients: true,
      appointments: true,
      labTests: true,
      pharmacy: true,
      billing: true,
      staff: true,
      roles: true,
      settings: true,
      dataExport: true,
      dataImport: true,
      auditLogs: true,
      notifications: true,
      emergency: true,
      database: true,
      config: true,
      reports: true,
      monitoring: true,
    },
    color: "red",
    icon: "crown",
    status: "Active",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Doctor",
    description: "Medical staff with patient care permissions",
    userCount: 15,
    permissions: {
      dashboard: true,
      patients: true,
      appointments: true,
      labTests: true,
      pharmacy: false,
      billing: false,
      staff: false,
      roles: false,
      settings: false,
      dataExport: false,
      dataImport: false,
      auditLogs: false,
      notifications: true,
      emergency: true,
      database: false,
      config: false,
      reports: true,
      monitoring: false,
    },
    color: "blue",
    icon: "medicine",
    status: "Active",
    createdAt: "2024-01-02",
    updatedAt: "2024-01-10"
  },
  {
    id: 3,
    name: "Nurse",
    description: "Nursing staff with limited patient access",
    userCount: 25,
    permissions: {
      dashboard: true,
      patients: true,
      appointments: true,
      labTests: true,
      pharmacy: false,
      billing: false,
      staff: false,
      roles: false,
      settings: false,
      dataExport: false,
      dataImport: false,
      auditLogs: false,
      notifications: true,
      emergency: true,
      database: false,
      config: false,
      reports: false,
      monitoring: false,
    },
    color: "green",
    icon: "experiment",
    status: "Active",
    createdAt: "2024-01-03",
    updatedAt: "2024-01-12"
  },
  {
    id: 4,
    name: "Receptionist",
    description: "Front desk staff for appointments and basic tasks",
    userCount: 8,
    permissions: {
      dashboard: true,
      patients: true,
      appointments: true,
      labTests: false,
      pharmacy: false,
      billing: true,
      staff: false,
      roles: false,
      settings: false,
      dataExport: false,
      dataImport: false,
      auditLogs: false,
      notifications: true,
      emergency: false,
      database: false,
      config: false,
      reports: false,
      monitoring: false,
    },
    color: "orange",
    icon: "user-switch",
    status: "Active",
    createdAt: "2024-01-04",
    updatedAt: "2024-01-08"
  },
];

const permissionGroups = [
  {
    title: "Core Modules",
    permissions: [
      { key: "dashboard", label: "Dashboard Access", icon: <DashboardOutlined />, description: "Access to main dashboard" },
      { key: "patients", label: "Patient Records", icon: <UserOutlined />, description: "View and manage patient records" },
      { key: "appointments", label: "Appointments", icon: <CalendarOutlined />, description: "Schedule and manage appointments" },
      { key: "labTests", label: "Lab Tests", icon: <ExperimentOutlined />, description: "Order and view lab tests" },
      { key: "pharmacy", label: "Pharmacy", icon: <MedicineBoxOutlined />, description: "Access pharmacy module" },
      { key: "billing", label: "Billing & Invoices", icon: <DollarOutlined />, description: "Manage billing and invoices" },
    ]
  },
  {
    title: "Administration",
    permissions: [
      { key: "staff", label: "Staff Management", icon: <TeamOutlined />, description: "Manage staff accounts" },
      { key: "roles", label: "Role Management", icon: <LockOutlined />, description: "Manage roles and permissions" },
      { key: "settings", label: "System Settings", icon: <SettingOutlined />, description: "Access system configuration" },
      { key: "reports", label: "Reports Access", icon: <BarChartOutlined />, description: "View system reports" },
      { key: "monitoring", label: "System Monitoring", icon: <ControlOutlined />, description: "Monitor system performance" },
    ]
  },
  {
    title: "Advanced Features",
    permissions: [
      { key: "dataExport", label: "Data Export", icon: <CloudSyncOutlined />, description: "Export system data" },
      { key: "dataImport", label: "Data Import", icon: <CloudSyncOutlined />, description: "Import data into system" },
      { key: "auditLogs", label: "Audit Logs", icon: <FileSearchOutlined />, description: "View system audit logs" },
      { key: "notifications", label: "Notification Settings", icon: <BellOutlined />, description: "Configure notifications" },
      { key: "emergency", label: "Emergency Alerts", icon: <NotificationOutlined />, description: "Send emergency alerts" },
      { key: "database", label: "Database Management", icon: <DatabaseOutlined />, description: "Manage database operations" },
      { key: "config", label: "Configuration Settings", icon: <SettingOutlined />, description: "Advanced configuration" },
    ]
  }
];

// Icon mapping component
const RoleIcon = ({ icon }) => {
  const iconMap = {
    crown: <CrownOutlined />,
    medicine: <MedicineBoxOutlined />,
    experiment: <ExperimentOutlined />,
    'user-switch': <UserSwitchOutlined />,
    team: <TeamOutlined />,
    setting: <SettingOutlined />,
    eye: <EyeOutlined />,
  };
  return iconMap[icon] || <UserOutlined />;
};

interface RoleStats {
  total: number;
  active: number;
  inactive: number;
  totalUsers: number;
  avgPermissions: number;
  recentAdded: number;
}

export default function Roles() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("roles");
  const [permissionCount, setPermissionCount] = useState(0);
  const [formValues, setFormValues] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Load roles from localStorage on component mount
  useEffect(() => {
    loadRolesFromStorage();
  }, []);

  // Save roles to localStorage whenever they change
  useEffect(() => {
    saveRolesToStorage();
  }, [roles]);

  // Auto refresh notifier
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        message.info("🔄 Auto-refresh: Role data reloaded");
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Load roles from localStorage
  const loadRolesFromStorage = () => {
    try {
      const savedRoles = localStorage.getItem("hospitalRoles");
      if (savedRoles) {
        const parsedRoles = JSON.parse(savedRoles);
        setRoles(parsedRoles);
      } else {
        // Initialize with default roles if no data exists
        setRoles(defaultRoles);
        saveRolesToStorage();
      }
    } catch (error) {
      console.error("Error loading roles from localStorage:", error);
      message.error("Error loading roles data. Using default roles.");
      setRoles(defaultRoles);
    }
  };

  // Save roles to localStorage
  const saveRolesToStorage = () => {
    try {
      localStorage.setItem("hospitalRoles", JSON.stringify(roles));
      localStorage.setItem("hospitalRolesLastUpdated", new Date().toISOString());
    } catch (error) {
      console.error("Error saving roles to localStorage:", error);
      message.error("Error saving roles data.");
    }
  };

  // Export roles data
  const handleExportRoles = () => {
    try {
      const dataStr = JSON.stringify(roles, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hospital-roles-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success("Roles data exported successfully!");
    } catch (error) {
      console.error("Error exporting roles:", error);
      message.error("Failed to export roles data.");
    }
  };

  // Reset to default roles
  const handleResetToDefault = () => {
    Modal.confirm({
      title: 'Reset to Default Roles',
      content: 'Are you sure you want to reset all roles to default settings? This action cannot be undone.',
      okText: 'Yes, Reset',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk() {
        setRoles(defaultRoles);
        message.success("Roles reset to default successfully!");
      },
    });
  };

  // Update permission count when form values change
  useEffect(() => {
    const count = Object.values(formValues).filter(val => val === true).length;
    setPermissionCount(count);
  }, [formValues]);

  const handleSave = () => {
    setLoading(true);
    form
      .validateFields()
      .then((values) => {
        setTimeout(() => {
          const newRole = {
            id: selectedRole ? selectedRole.id : Date.now(),
            name: values.roleName,
            description: values.roleDescription,
            userCount: selectedRole ? selectedRole.userCount : 0,
            permissions: {
              dashboard: values.dashboard || false,
              patients: values.patients || false,
              appointments: values.appointments || false,
              labTests: values.labTests || false,
              pharmacy: values.pharmacy || false,
              billing: values.billing || false,
              staff: values.staff || false,
              roles: values.roles || false,
              settings: values.settings || false,
              dataExport: values.dataExport || false,
              dataImport: values.dataImport || false,
              auditLogs: values.auditLogs || false,
              notifications: values.notifications || false,
              emergency: values.emergency || false,
              database: values.database || false,
              config: values.config || false,
              reports: values.reports || false,
              monitoring: values.monitoring || false,
            },
            color: getRoleColor(values.roleName),
            icon: getRoleIcon(values.roleName),
            status: values.status || "Active",
            createdAt: selectedRole ? selectedRole.createdAt : dayjs().format("YYYY-MM-DD"),
            updatedAt: dayjs().format("YYYY-MM-DD")
          };

          if (selectedRole) {
            // Update existing role
            setRoles(roles.map(role => role.id === selectedRole.id ? newRole : role));
            message.success(`Role "${values.roleName}" updated successfully!`);
          } else {
            // Add new role
            setRoles([...roles, newRole]);
            message.success(`Role "${values.roleName}" created successfully!`);
          }

          setIsEditModalVisible(false);
          setSelectedRole(null);
          form.resetFields();
          setFormValues({});
          setLoading(false);
        }, 1000);
      })
      .catch((error) => {
        console.log("Validation Failed:", error);
        message.error("Please fix errors before saving.");
        setLoading(false);
      });
  };

  const handleView = (role) => {
    setSelectedRole(role);
    setIsViewModalVisible(true);
  };

  const handleEdit = (role) => {
    setSelectedRole(role);
    const formData = {
      roleName: role.name,
      roleDescription: role.description,
      status: role.status,
      ...role.permissions
    };
    form.setFieldsValue(formData);
    setFormValues(formData);
    setIsEditModalVisible(true);
  };

  const handleDelete = (roleId) => {
    const roleToDelete = roles.find(role => role.id === roleId);
    Modal.confirm({
      title: 'Delete Role',
      content: `Are you sure you want to delete the role "${roleToDelete?.name}"? This action will affect ${roleToDelete?.userCount} users and cannot be undone.`,
      okText: 'Yes, Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk() {
        setRoles(roles.filter(role => role.id !== roleId));
        message.success(`Role "${roleToDelete?.name}" deleted successfully!`);
      },
    });
  };

  const handleCreateNew = () => {
    setSelectedRole(null);
    form.resetFields();
    setFormValues({});
    setIsEditModalVisible(true);
  };

  const handleCancelView = () => {
    setIsViewModalVisible(false);
    setSelectedRole(null);
  };

  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    setSelectedRole(null);
    form.resetFields();
    setFormValues({});
  };

  const handleFormChange = (changedValues, allValues) => {
    setFormValues(allValues);
  };

  // Statistics
  const stats: RoleStats = {
    total: roles.length,
    active: roles.filter((r) => r.status === "Active").length,
    inactive: roles.filter((r) => r.status === "Inactive").length,
    totalUsers: roles.reduce((acc, role) => acc + role.userCount, 0),
    avgPermissions: Math.round(roles.reduce((acc, role) => {
      const enabled = Object.values(role.permissions).filter(val => val).length;
      return acc + enabled;
    }, 0) / roles.length) || 0,
    recentAdded: roles.filter((r) =>
      dayjs(r.createdAt).isAfter(dayjs().subtract(7, 'day'))
    ).length
  };

  // UI Helpers
  const getRoleColor = (roleName) => {
    const colors = {
      'Super Admin': 'red',
      'Admin': 'volcano',
      'Doctor': 'blue',
      'Nurse': 'green',
      'Receptionist': 'orange',
      'Staff': 'purple',
      'Viewer': 'cyan'
    };
    return colors[roleName] || 'default';
  };

  const getRoleIcon = (roleName) => {
    const icons = {
      'Super Admin': 'crown',
      'Admin': 'setting',
      'Doctor': 'medicine',
      'Nurse': 'experiment',
      'Receptionist': 'user-switch',
      'Staff': 'team',
      'Viewer': 'eye'
    };
    return icons[roleName] || 'user';
  };

  const getStatusColor = (status: string) => ({ 'Active': 'green', 'Inactive': 'red' }[status] || 'default');
  const getStatusIcon = (status: string) => ({ 'Active': <CheckCircleOutlined />, 'Inactive': <CloseCircleOutlined /> }[status]);

  const getAvatarColor = (color) => {
    const colorMap = {
      'red': '#f5222d',
      'blue': '#1890ff',
      'green': '#52c41a',
      'orange': '#fa8c16',
      'purple': '#722ed1',
      'cyan': '#13c2c2',
      'volcano': '#fa541c',
      'default': '#d9d9d9'
    };
    return colorMap[color] || colorMap.default;
  };

  const filteredRoles = roles.filter((role) => {
    const matchesSearch = searchText === "" ||
      role.name.toLowerCase().includes(searchText.toLowerCase()) ||
      role.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === "all" || role.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<any> = [
    {
      title: <Space><LockOutlined /> Role Information</Space>,
      key: 'role',
      render: (_, record) => (
        <Flex align="center" gap="middle">
          <Avatar
            size="large"
            icon={<RoleIcon icon={record.icon} />}
            style={{ backgroundColor: getAvatarColor(record.color) }}
          />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.description}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              <CalendarOutlined /> Created: {dayjs(record.createdAt).format('MMM D, YYYY')}
            </div>
          </div>
        </Flex>
      ),
    },
    {
      title: <Space><TeamOutlined /> Users & Status</Space>,
      key: 'users',
      render: (_, record) => (
        <Space direction="vertical">
          <Badge count={record.userCount} showZero style={{ backgroundColor: '#52c41a' }} />
          <Tag color={getStatusColor(record.status)} icon={getStatusIcon(record.status)}>
            {record.status}
          </Tag>
        </Space>
      ),
    },
    {
      title: <Space><SecurityScanOutlined /> Permissions</Space>,
      key: 'permissions',
      render: (_, record) => {
        const enabledCount = Object.values(record.permissions).filter(val => val).length;
        const totalCount = Object.keys(record.permissions).length;
        return (
          <Space direction="vertical" size="small">
            <Progress
              percent={Math.round((enabledCount / totalCount) * 100)}
              size="small"
              strokeColor={
                enabledCount === totalCount ? '#52c41a' :
                  enabledCount > totalCount / 2 ? '#1890ff' : '#fa8c16'
              }
            />
            <div style={{ fontSize: '12px', color: '#666' }}>
              {enabledCount} of {totalCount} permissions
            </div>
          </Space>
        );
      },
    },
    {
      title: <Space><ThunderboltOutlined /> Actions</Space>,
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button icon={<EyeOutlined />} shape="circle" type="primary" ghost onClick={() => handleView(record)} />
          </Tooltip>
          <Tooltip title="Edit Role">
            <Button icon={<EditOutlined />} shape="circle" onClick={() => handleEdit(record)} />
          </Tooltip>
          {record.name !== 'Super Admin' && (
            <Tooltip title="Delete Role">
              <Popconfirm
                title="Delete this role?"
                description="Are you sure you want to delete this role? This action cannot be undone."
                onConfirm={() => handleDelete(record.id)}
                okText="Yes"
                cancelText="No"
                okType="danger"
                icon={<CloseCircleOutlined style={{ color: 'red' }} />}
              >
                <Button icon={<DeleteOutlined />} shape="circle" danger />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  function getFieldValue(key: string) {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="p-6 space-y-6" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Flex justify="space-between" align="center">
          <div>
            <Space size="large">
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '10px' }}>
                <LockOutlined style={{ fontSize: '36px' }} />
              </div>
              <div>
                <Title level={2} style={{ color: 'white', margin: 0 }}>🔐 Role Management</Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}><DashboardOutlined /> Manage user roles and permissions</Text>
              </div>
            </Space>
          </div>
          <Space>
            <Tooltip title="Auto Refresh">
              <Switch
                checkedChildren={<ReloadOutlined />}
                unCheckedChildren={<CloseCircleOutlined />}
                checked={autoRefresh}
                onChange={setAutoRefresh}
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateNew}
              size="large"
              style={{ background: '#fff', color: '#667eea', border: 'none', fontWeight: 'bold' }}
            >
              <RocketOutlined /> Create New Role
            </Button>
          </Space>
        </Flex>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><LockOutlined /> Total Roles</Space>} value={stats.total} valueStyle={{ color: '#667eea' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><CheckCircleOutlined /> Active</Space>} value={stats.active} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><TeamOutlined /> Total Users</Space>} value={stats.totalUsers} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><SecurityScanOutlined /> Avg Permissions</Space>} value={stats.avgPermissions} valueStyle={{ color: '#722ed1' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><CheckCircleOutlined /> Recent Added</Space>} value={stats.recentAdded} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><DashboardOutlined /> Utilization</Space>} value={Math.round((stats.active / (stats.total || 1)) * 100)} suffix="%" valueStyle={{ color: '#36cfc9' }} /></Card></Col>
      </Row>

      {/* Data Management Alert */}
      <Alert
        message="Data Management"
        description="All role data is automatically saved to your browser's local storage. You can export backup files or reset to default settings."
        type="info"
        showIcon
        action={
          <Space>
            <Button size="small" icon={<ExportOutlined />} onClick={handleExportRoles}>
              Export Data
            </Button>
            <Button size="small" danger onClick={handleResetToDefault}>
              Reset to Default
            </Button>
          </Space>
        }
        style={{ marginBottom: '16px' }}
      />

      {/* Tabs for Different Views */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane
          key="roles"
          tab={
            <Space>
              <LockOutlined /> All Roles <Badge count={filteredRoles.length} overflowCount={99} />
            </Space>
          }
        >
          <div className="space-y-6">
            <Card>
              <Flex wrap="wrap" gap="middle" align="center" style={{ marginBottom: '16px' }}>
                <Input
                  placeholder="🔍 Search roles, descriptions..."
                  prefix={<UserOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                  size="large"
                />
                <Select value={statusFilter} onChange={setStatusFilter} placeholder="Filter by Status" style={{ width: 150 }} size="large">
                  <Option value="all">All Status</Option>
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">Inactive</Option>
                </Select>
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={() => { setSearchText(''); setStatusFilter('all'); }}>Reset</Button>
                  <Button icon={<ExportOutlined />}>Export</Button>
                </Space>
              </Flex>
              <Alert
                message="Roles Overview"
                description={`${stats.active} active and ${stats.inactive} inactive roles. ${stats.totalUsers} total users assigned across all roles.`}
                type={stats.inactive > 0 ? "warning" : "info"}
                showIcon
                closable
              />
            </Card>

            <Card
              title={
                <Space>
                  <TableOutlined /> Role List ({filteredRoles.length})
                </Space>
              }
              extra={
                <Space>
                  <Tag color="green">{stats.active} Active</Tag>
                  <Tag color="red">{stats.inactive} Inactive</Tag>
                  <Tag color="blue">{stats.totalUsers} Users</Tag>
                </Space>
              }
            >
              <Table
                columns={columns}
                dataSource={filteredRoles}
                rowKey="id"
                loading={loading}
                scroll={{ x: 1000 }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} roles`,
                }}
              />
            </Card>
          </div>
        </Tabs.TabPane>

        <Tabs.TabPane key="permissions" tab={<Space><SecurityScanOutlined /> Permissions Overview</Space>}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="Permission Distribution">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <PieChartOutlined style={{ fontSize: '48px', color: '#667eea' }} />
                  <div style={{ marginTop: '16px' }}>
                    <Progress
                      type="circle"
                      percent={Math.round((stats.avgPermissions / Object.keys(permissionGroups.flatMap(g => g.permissions)).length) * 100)}
                      strokeColor="#52c41a"
                    />
                    <div style={{ marginTop: '16px' }}>
                      <Tag color="blue">Avg: {stats.avgPermissions} permissions</Tag>
                      <Tag color="green">Active: {stats.active} roles</Tag>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Recent Role Activity">
                <Timeline>
                  {roles.slice(0, 5).map(role => (
                    <Timeline.Item
                      key={role.id}
                      color={getStatusColor(role.status)}
                      dot={getStatusIcon(role.status)}
                    >
                      <Space direction="vertical" size={0}>
                        <div style={{ fontWeight: 'bold' }}>{role.name}</div>
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          {role.description}
                        </div>
                        <div style={{ color: '#999', fontSize: '12px' }}>
                          <TeamOutlined /> {role.userCount} users •
                          <SecurityScanOutlined style={{ marginLeft: '8px' }} />
                          {Object.values(role.permissions).filter(val => val).length} permissions
                        </div>
                      </Space>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: '16px' }}>
            {permissionGroups.map((group, index) => (
              <Col span={24} key={index}>
                <Card title={group.title} size="small">
                  <List
                    dataSource={group.permissions}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={item.icon} style={{ backgroundColor: '#1890ff' }} />}
                          title={item.label}
                          description={item.description}
                        />
                        <div>
                          {roles.map(role => (
                            <Tag
                              key={role.id}
                              color={role.permissions[item.key] ? role.color : 'default'}
                              style={{ margin: '2px', opacity: role.permissions[item.key] ? 1 : 0.4 }}
                            >
                              {role.name}
                            </Tag>
                          ))}
                        </div>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Tabs.TabPane>
      </Tabs>

      {/* View Role Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined /> Role Details: {selectedRole?.name}
          </Space>
        }
        open={isViewModalVisible}
        onCancel={handleCancelView}
        footer={[
          <Button key="close" onClick={handleCancelView}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedRole && (
          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="Role Information" span={2}>
              <Space direction="vertical">
                <div><strong>Name:</strong> {selectedRole.name}</div>
                <div><strong>Description:</strong> {selectedRole.description}</div>
                <div><strong>Status:</strong> <Tag color={getStatusColor(selectedRole.status)} icon={getStatusIcon(selectedRole.status)}>{selectedRole.status}</Tag></div>
                <div><strong>Users:</strong> <Badge count={selectedRole.userCount} showZero style={{ backgroundColor: '#52c41a' }} /></div>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Permissions Summary" span={2}>
              <Space direction="vertical">
                <div>
                  <Progress
                    percent={Math.round((Object.values(selectedRole.permissions).filter(val => val).length / Object.keys(selectedRole.permissions).length) * 100)}
                    size="small"
                  />
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {Object.values(selectedRole.permissions).filter(val => val).length} of {Object.keys(selectedRole.permissions).length} permissions enabled
                </div>
              </Space>
            </Descriptions.Item>
            {permissionGroups.map((group, groupIndex) => (
              <Descriptions.Item key={groupIndex} label={group.title} span={2}>
                <Space wrap>
                  {group.permissions.map((permission) => (
                    <Tag
                      key={permission.key}
                      color={selectedRole.permissions[permission.key] ? 'green' : 'red'}
                      icon={selectedRole.permissions[permission.key] ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    >
                      {permission.label}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        title={
          <Space>
            {selectedRole ? <EditOutlined /> : <PlusOutlined />}
            {selectedRole ? "Edit Role" : "Create New Role"}
          </Space>
        }
        open={isEditModalVisible}
        onCancel={handleCancelEdit}
        onOk={handleSave}
        okText={selectedRole ? "Update Role" : "Create Role"}
        cancelText="Cancel"
        width={800}
        confirmLoading={loading}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleFormChange}
        >
          <Alert
            message={`${permissionCount} permissions selected`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Row gutter={[24, 16]}>
            <Col span={12}>
              <Form.Item
                label="Role Name"
                name="roleName"
                rules={[{ required: true, message: "Please enter role name" }]}
              >
                <Input
                  placeholder="e.g., Admin, Doctor, Nurse"
                  size="large"
                  prefix={<UserSwitchOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select status">
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Role Description" name="roleDescription">
            <TextArea
              placeholder="Brief description of role responsibilities"
              rows={3}
            />
          </Form.Item>

          <Divider orientation="left">Module Permissions</Divider>

          {permissionGroups.map((group, groupIndex) => (
            <div key={groupIndex} style={{ marginBottom: 24 }}>
              <h4 style={{ marginBottom: 16, color: '#1890ff' }}>{group.title}</h4>
              <Row gutter={[16, 16]}>
                {group.permissions.map((permission) => (
                  <Col xs={24} sm={12} md={8} key={permission.key}>
                    <Card
                      size="small"
                      style={{
                        border: formValues[permission.key] ? '2px solid #1890ff' : '1px solid #d9d9d9',
                        background: formValues[permission.key] ? '#f0f8ff' : 'white'
                      }}
                    >
                      <Form.Item
                        name={permission.key}
                        valuePropName="checked"
                        style={{ margin: 0 }}
                      >
                        <Space>
                          <Switch />
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                              <span style={{ marginRight: 8 }}>{permission.icon}</span>
                              {permission.label}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {permission.description}
                            </div>
                          </div>
                        </Space>
                      </Form.Item>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </Form>
      </Modal>
    </div>
  );
}