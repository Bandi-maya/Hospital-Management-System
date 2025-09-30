import React, { useState, useEffect } from "react";
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
} from "@ant-design/icons";
import {
  Card,
  Form,
  Input,
  Switch,
  Button,
  Select,
  Row,
  Col,
  Divider,
  Space,
  message,
  Tag,
  Table,
  Modal,
  Popconfirm,
  Tooltip,
  Statistic,
  Avatar,
  Badge,
  Tabs,
  List,
  Descriptions,
  Alert,
  Progress,
} from "antd";

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

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

export default function Roles() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [permissionCount, setPermissionCount] = useState(0);
  const [formValues, setFormValues] = useState({});

  // Load roles from localStorage on component mount
  useEffect(() => {
    loadRolesFromStorage();
  }, []);

  // Save roles to localStorage whenever they change
  useEffect(() => {
    saveRolesToStorage();
  }, [roles]);

  // Load roles from localStorage
  const loadRolesFromStorage = () => {
    try {
      const savedRoles = localStorage.getItem("hospitalRoles");
      if (savedRoles) {
        const parsedRoles = JSON.parse(savedRoles);
        setRoles(parsedRoles);
        console.log("Roles loaded from localStorage:", parsedRoles);
      } else {
        // Initialize with default roles if no data exists
        setRoles(defaultRoles);
        saveRolesToStorage();
        console.log("Initialized with default roles");
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
      console.log("Roles saved to localStorage:", roles);
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

  // Import roles data
  const handleImportRoles = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (e.target && typeof e.target.result === 'string') {
          const importedRoles = JSON.parse(e.target.result);
          
          // Validate imported data structure
          if (Array.isArray(importedRoles) && importedRoles.every(role => 
            role.id && role.name && role.permissions
          )) {
            setRoles(importedRoles);
            message.success("Roles data imported successfully!");
          } else {
            throw new Error("Invalid roles data format");
          }
        }
      } catch (error) {
        console.error("Error importing roles:", error);
        message.error("Invalid roles file format. Please check the file.");
      }
    };
    reader.onerror = () => {
      message.error("Failed to read the file.");
    };
    reader.readAsText(file);
    
    // Prevent default upload behavior
    return false;
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

  const handleReset = () => {
    form.resetFields();
    setSelectedRole(null);
    setFormValues({});
    message.info("Form has been reset.");
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

  const getPermissionStatusIcon = (hasPermission) => {
    return hasPermission ? 
      <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
  };

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

  const getFieldValue = (fieldName) => {
    return formValues[fieldName] || false;
  };

  const getLastUpdated = () => {
    const lastUpdated = localStorage.getItem("hospitalRolesLastUpdated");
    return lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never';
  };

  const columns = [
    {
      title: 'Role',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar 
            size="large" 
            icon={<RoleIcon icon={record.icon} />} 
            style={{ backgroundColor: getAvatarColor(record.color) }} 
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.description}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Users',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count) => (
        <Badge count={count} showZero style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (_, record) => {
        const enabledCount = Object.values(record.permissions).filter(val => val).length;
        const totalCount = Object.keys(record.permissions).length;
        return (
          <Space direction="vertical" size="small">
            <div>
              <Progress 
                percent={Math.round((enabledCount / totalCount) * 100)} 
                size="small" 
                strokeColor={
                  enabledCount === totalCount ? '#52c41a' : 
                  enabledCount > totalCount / 2 ? '#1890ff' : '#fa8c16'
                }
              />
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {enabledCount} of {totalCount} permissions
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              icon={<EyeOutlined />} 
              shape="circle" 
              type="primary" 
              ghost
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Role">
            <Button 
              icon={<EditOutlined />} 
              shape="circle" 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {record.name !== 'Super Admin' && (
            <Tooltip title="Delete Role">
              <Button 
                icon={<DeleteOutlined />} 
                shape="circle" 
                danger 
                onClick={() => handleDelete(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#262626', margin: 0 }}>Role Management</h1>
          <p style={{ color: '#8c8c8c', margin: '4px 0 0 0' }}>Manage roles and permissions for HMS modules</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreateNew}
            size="large"
          >
            Create New Role
          </Button>
        </div>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Roles" value={roles.length} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Active Users" 
              value={roles.reduce((acc, role) => acc + role.userCount, 0)} 
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Avg Permissions" 
              value={Math.round(roles.reduce((acc, role) => {
                const enabled = Object.values(role.permissions).filter(val => val).length;
                return acc + enabled;
              }, 0) / roles.length) || 0} 
              prefix={<SecurityScanOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#8c8c8c', fontSize: '14px', marginBottom: '4px' }}>Last Updated</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{getLastUpdated()}</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Data Management Alert */}
      <Alert
        message="Data Management"
        description="All role data is automatically saved to your browser's local storage. You can export backup files or reset to default settings."
        type="info"
        showIcon
        action={
          <Space>
            <Button size="small" onClick={handleExportRoles}>
              Export Data
            </Button>
            <Button size="small" danger onClick={handleResetToDefault}>
              Reset to Default
            </Button>
          </Space>
        }
        style={{ marginBottom: '16px' }}
      />

      {/* Main Content */}
      <Card style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 1px 6px rgba(0,0,0,0.03), 0 0 1px rgba(0,0,0,0.03)', border: 'none' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={<span><TeamOutlined /> All Roles</span>} key="list">
            <Table 
              columns={columns} 
              dataSource={roles} 
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={<span><BarChartOutlined /> Permissions Overview</span>} key="overview">
            <Row gutter={[24, 24]}>
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
          </TabPane>
        </Tabs>
      </Card>

      {/* View Role Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            Role Details - {selectedRole?.name}
          </Space>
        }
        open={isViewModalVisible}
        onCancel={handleCancelView}
        footer={[
        //   <Button key="edit" type="primary" onClick={() => {
        //     handleCancelView();
        //     handleEdit(selectedRole);
        //   }}>
        //     <EditOutlined /> Edit Role
        //   </Button>,
          <Button key="close" onClick={handleCancelView}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedRole && (
          <div>
            {/* Role Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar 
                size={80} 
                icon={<RoleIcon icon={selectedRole.icon} />}
                style={{ 
                  backgroundColor: getAvatarColor(selectedRole.color),
                  marginBottom: 16
                }}
              />
              <h2 style={{ margin: '8px 0' }}>{selectedRole.name}</h2>
              <p style={{ color: '#666', margin: 0 }}>{selectedRole.description}</p>
              <Space style={{ marginTop: 8 }}>
                <Tag color={selectedRole.color} icon={<UserOutlined />}>
                  {selectedRole.userCount} Users
                </Tag>
                <Tag color="blue">
                  {Object.values(selectedRole.permissions).filter(val => val).length} Permissions
                </Tag>
              </Space>
            </div>

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Role Name">
                {selectedRole.name}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedRole.description}
              </Descriptions.Item>
              <Descriptions.Item label="User Count">
                <Badge count={selectedRole.userCount} showZero style={{ backgroundColor: '#52c41a' }} />
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Permissions</Divider>
            
            {permissionGroups.map((group, groupIndex) => (
              <div key={groupIndex} style={{ marginBottom: 20 }}>
                <h4 style={{ color: '#1890ff', marginBottom: 12 }}>{group.title}</h4>
                <Row gutter={[16, 8]}>
                  {group.permissions.map((permission) => (
                    <Col span={24} key={permission.key}>
                      <Card size="small" style={{ 
                        border: selectedRole.permissions[permission.key] ? '1px solid #52c41a' : '1px solid #d9d9d9',
                        background: selectedRole.permissions[permission.key] ? '#f6ffed' : '#fafafa'
                      }}>
                        <Space>
                          {getPermissionStatusIcon(selectedRole.permissions[permission.key])}
                          <span style={{ fontWeight: 'bold' }}>{permission.label}</span>
                          <span style={{ color: '#666', fontSize: '12px' }}>{permission.description}</span>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        title={
          <Space>
            {selectedRole ? <EditOutlined /> : <PlusOutlined />}
            {selectedRole ? `Edit ${selectedRole.name}` : 'Create New Role'}
          </Space>
        }
        open={isEditModalVisible}
        onCancel={handleCancelEdit}
        onOk={handleSave}
        okText={selectedRole ? "Update Role" : "Create Role"}
        cancelText="Cancel"
        width={800}
        style={{ top: 20 }}
        confirmLoading={loading}
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
              <Form.Item label="Role Description" name="roleDescription">
                <TextArea 
                  placeholder="Brief description of role responsibilities" 
                  rows={2} 
                />
              </Form.Item>
            </Col>
          </Row>

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
                        border: getFieldValue(permission.key) ? '2px solid #1890ff' : '1px solid #d9d9d9',
                        background: getFieldValue(permission.key) ? '#f0f8ff' : 'white'
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
                              {permission.icon} {permission.label}
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