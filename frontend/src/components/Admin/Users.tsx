import React, { useState, useEffect } from "react";
import {
  UserOutlined,
  TeamOutlined,
  UserSwitchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  DashboardOutlined,
  PieChartOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  BellOutlined,
  MessageOutlined,
  PhoneOutlined,
  MailOutlined,
  SyncOutlined,
  ExportOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  SecurityScanOutlined,
  CalendarOutlined,
  TableOutlined,
  HomeOutlined,
  IdcardOutlined,
  EnvironmentOutlined,
  LockOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import {
  Table,
  Input,
  Button,
  Select,
  Modal,
  Form,
  Space,
  Tooltip,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Avatar,
  Badge,
  Progress,
  Alert,
  Tabs,
  Timeline,
  Switch,
  message,
  Descriptions,
  Divider,
  List,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Option } = Select;

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Admin" | "Doctor" | "Nurse" | "Staff" | "Receptionist";
  department: string;
  status: "Active" | "Inactive" | "Suspended";
  lastLogin: string;
  joinDate: string;
  avatar?: string;
  permissions: string[];
  specialization?: string;
  licenseNumber?: string;
  address?: string;
  notes?: string;
  loginAttempts: number;
  twoFactorEnabled: boolean;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [form] = Form.useForm();

  // Load from localStorage
  useEffect(() => {
    setLoading(true);
    const savedUsers = localStorage.getItem("hospitalUsers");
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Initialize with sample data
      const sampleUsers: User[] = [
        {
          id: "1",
          name: "Dr. Sarah Johnson",
          email: "sarah.johnson@hospital.com",
          phone: "+1 (555) 123-4567",
          role: "Doctor",
          department: "Cardiology",
          status: "Active",
          lastLogin: "2024-01-15 09:30:00",
          joinDate: "2020-03-15",
          specialization: "Cardiologist",
          licenseNumber: "MED-123456",
          address: "123 Medical Center, New York, NY",
          notes: "Senior Cardiologist with 10+ years experience",
          loginAttempts: 0,
          twoFactorEnabled: true,
          permissions: ["patient_read", "patient_write", "prescription_write"]
        },
        {
          id: "2",
          name: "Nurse Emily Davis",
          email: "emily.davis@hospital.com",
          phone: "+1 (555) 987-6543",
          role: "Nurse",
          department: "Emergency",
          status: "Active",
          lastLogin: "2024-01-15 08:15:00",
          joinDate: "2021-06-01",
          specialization: "Emergency Care",
          licenseNumber: "NUR-789012",
          address: "456 Health Ave, Boston, MA",
          notes: "Emergency department head nurse",
          loginAttempts: 0,
          twoFactorEnabled: false,
          permissions: ["patient_read", "medication_admin"]
        },
        {
          id: "3",
          name: "Admin Michael Brown",
          email: "michael.brown@hospital.com",
          phone: "+1 (555) 456-7890",
          role: "Admin",
          department: "Administration",
          status: "Active",
          lastLogin: "2024-01-14 17:45:00",
          joinDate: "2019-01-10",
          address: "789 Admin St, Chicago, IL",
          notes: "System administrator",
          loginAttempts: 0,
          twoFactorEnabled: true,
          permissions: ["all_access"]
        }
      ];
      setUsers(sampleUsers);
      localStorage.setItem("hospitalUsers", JSON.stringify(sampleUsers));
    }
    setLoading(false);
  }, []);

  // Auto refresh notifier
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        message.info("🔄 Auto-refresh: User data reloaded");
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem("hospitalUsers", JSON.stringify(updatedUsers));
  };

  const openAddModal = () => {
    setSelectedUser(null);
    form.resetFields();
    form.setFieldsValue({
      status: "Active",
      role: "Staff",
      department: "General",
      loginAttempts: 0,
      twoFactorEnabled: false,
      joinDate: dayjs(),
    });
    setIsEditModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    form.setFieldsValue({
      ...user,
      joinDate: dayjs(user.joinDate),
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedUser(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    form.resetFields();
  };

  const handleDelete = (id: string) => {
    const user = users.find((u) => u.id === id);
    const updatedUsers = users.filter((u) => u.id !== id);
    saveUsers(updatedUsers);
    message.success(`🗑️ User "${user?.name}" deleted successfully!`);
  };

  const handleFormSubmit = (values: any) => {
    const userData = {
      ...values,
      joinDate: values.joinDate.format("YYYY-MM-DD"),
      lastLogin: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    };

    if (selectedUser) {
      // Update existing user
      const updatedUsers = users.map((u) =>
        u.id === selectedUser.id ? { ...selectedUser, ...userData } : u
      );
      saveUsers(updatedUsers);
      message.success(`✅ User "${userData.name}" updated successfully!`);
    } else {
      // Add new user
      const newUser: User = {
        id: Date.now().toString(),
        ...userData,
        avatar: "",
        loginAttempts: 0,
        permissions: [],
      };
      saveUsers([...users, newUser]);
      message.success(`✅ User "${userData.name}" added successfully!`);
    }
    closeEditModal();
  };

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "Active").length,
    inactive: users.filter((u) => u.status === "Inactive").length,
    suspended: users.filter((u) => u.status === "Suspended").length,
    admins: users.filter((u) => u.role === "Admin").length,
    doctors: users.filter((u) => u.role === "Doctor").length,
    nurses: users.filter((u) => u.role === "Nurse").length,
  };

  const getStatusColor = (status: string) =>
    ({
      Active: "green",
      Inactive: "orange",
      Suspended: "red",
    }[status] || "default");

  const getStatusIcon = (status: string) => {
    const icons = {
      Active: <CheckCircleOutlined />,
      Inactive: <ClockCircleOutlined />,
      Suspended: <CloseCircleOutlined />,
    };
    return icons[status as keyof typeof icons];
  };

  const getRoleColor = (role: string) =>
    ({
      Admin: "red",
      Doctor: "blue",
      Nurse: "green",
      Staff: "orange",
      Receptionist: "purple",
    }[role] || "default");

  const getRoleIcon = (role: string) => {
    const icons = {
      Admin: <CrownOutlined />,
      Doctor: <MedicineBoxOutlined />,
      Nurse: <ExperimentOutlined />,
      Staff: <TeamOutlined />,
      Receptionist: <UserSwitchOutlined />,
    };
    return icons[role as keyof typeof icons];
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchText === "" ||
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const columns: ColumnsType<User> = [
    {
      title: (
        <Space>
          <UserOutlined />
          User Info
        </Space>
      ),
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar 
            size="large" 
            icon={<UserOutlined />} 
            style={{ 
              backgroundColor: getRoleColor(record.role) === 'blue' ? '#1890ff' : 
                            getRoleColor(record.role) === 'red' ? '#f5222d' :
                            getRoleColor(record.role) === 'green' ? '#52c41a' :
                            getRoleColor(record.role) === 'orange' ? '#fa8c16' : '#722ed1'
            }}
          />
          <div>
            <div style={{ fontWeight: "bold" }}>{record.name}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              <MailOutlined /> {record.email}
            </div>
            <div style={{ fontSize: "12px", color: "#999" }}>
              <PhoneOutlined /> {record.phone}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <SafetyCertificateOutlined />
          Role & Dept
        </Space>
      ),
      key: "role",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag color={getRoleColor(record.role)} icon={getRoleIcon(record.role)}>
            {record.role}
          </Tag>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.department}
          </div>
          {record.specialization && (
            <div style={{ fontSize: "12px", color: "#999" }}>
              {record.specialization}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <DashboardOutlined />
          Status
        </Space>
      ),
      key: "status",
      render: (_, record) => (
        <Space direction="vertical">
          <Tag
            color={getStatusColor(record.status)}
            icon={getStatusIcon(record.status)}
          >
            {record.status}
          </Tag>
          <div style={{ fontSize: "12px", color: "#666" }}>
            <ClockCircleOutlined /> Last: {dayjs(record.lastLogin).fromNow()}
          </div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            <SecurityScanOutlined /> 2FA: {record.twoFactorEnabled ? "Enabled" : "Disabled"}
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <ThunderboltOutlined />
          Actions
        </Space>
      ),
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              shape="circle"
              onClick={() => openViewModal(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              shape="circle"
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete this user?"
              description="Are you sure you want to delete this user? This action cannot be undone."
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
              okType="danger"
              icon={<CloseCircleOutlined style={{ color: "red" }} />}
            >
              <Button icon={<DeleteOutlined />} shape="circle" danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6" style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <Card
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              <TeamOutlined style={{ fontSize: "36px" }} />
              <div>
                <h1 style={{ color: "white", margin: 0 }}>User Management</h1>
                <p style={{ margin: 0, color: "#ddd" }}>
                  <DashboardOutlined /> Manage users and access control
                </p>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Tooltip title="Auto Refresh">
                <Switch
                  checkedChildren={<SyncOutlined />}
                  unCheckedChildren={<CloseCircleOutlined />}
                  checked={autoRefresh}
                  onChange={setAutoRefresh}
                />
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openAddModal}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
              >
                <RocketOutlined /> Add User
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.total}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Active"
              value={stats.active}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Doctors"
              value={stats.doctors}
              valueStyle={{ color: "#1890ff" }}
              prefix={<MedicineBoxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Nurses"
              value={stats.nurses}
              valueStyle={{ color: "#722ed1" }}
              prefix={<ExperimentOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Admins"
              value={stats.admins}
              valueStyle={{ color: "#f5222d" }}
              prefix={<CrownOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Inactive"
              value={stats.inactive}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "users",
            label: (
              <Space>
                <TeamOutlined /> All Users{" "}
                <Badge count={filteredUsers.length} style={{ backgroundColor: '#52c41a' }} />
              </Space>
            ),
            children: (
              <>
                <Card>
                  <Space style={{ marginBottom: "16px", flexWrap: "wrap" }}>
                    <Input
                      placeholder="Search users..."
                      prefix={<SearchOutlined />}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      style={{ width: 250 }}
                    />
                    <Select
                      value={roleFilter}
                      onChange={setRoleFilter}
                      style={{ width: 150 }}
                      placeholder="Filter by role"
                    >
                      <Option value="all">All Roles</Option>
                      <Option value="Admin">Admin</Option>
                      <Option value="Doctor">Doctor</Option>
                      <Option value="Nurse">Nurse</Option>
                      <Option value="Staff">Staff</Option>
                      <Option value="Receptionist">Receptionist</Option>
                    </Select>
                    <Select
                      value={statusFilter}
                      onChange={setStatusFilter}
                      style={{ width: 150 }}
                      placeholder="Filter by status"
                    >
                      <Option value="all">All Status</Option>
                      <Option value="Active">Active</Option>
                      <Option value="Inactive">Inactive</Option>
                      <Option value="Suspended">Suspended</Option>
                    </Select>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        setSearchText("");
                        setRoleFilter("all");
                        setStatusFilter("all");
                      }}
                    >
                      Reset
                    </Button>
                    <Button icon={<ExportOutlined />}>Export</Button>
                  </Space>
                  <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} of ${total} users`,
                    }}
                  />
                </Card>
              </>
            ),
          },
          {
            key: "activity",
            label: (
              <Space>
                <DashboardOutlined /> Recent Activity
              </Space>
            ),
            children: (
              <Card>
                <Timeline>
                  {users.slice(0, 5).map((u) => (
                    <Timeline.Item
                      key={u.id}
                      color={getStatusColor(u.status)}
                      dot={getStatusIcon(u.status)}
                    >
                      <strong>{u.name}</strong> ({u.role}) - Last login{" "}
                      {dayjs(u.lastLogin).fromNow()}
                      <br />
                      <small style={{ color: '#666' }}>
                        Department: {u.department} | Status: {u.status}
                      </small>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            ),
          },
        ]}
      />

      {/* View User Details Modal */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            User Details
          </Space>
        }
        open={isViewModalOpen}
        onCancel={closeViewModal}
        footer={[
          <Button key="close" onClick={closeViewModal}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedUser && (
          <div>
            {/* User Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar 
                size={80} 
                icon={<UserOutlined />}
                style={{ 
                  backgroundColor: getRoleColor(selectedUser.role) === 'blue' ? '#1890ff' : 
                                getRoleColor(selectedUser.role) === 'red' ? '#f5222d' :
                                getRoleColor(selectedUser.role) === 'green' ? '#52c41a' :
                                getRoleColor(selectedUser.role) === 'orange' ? '#fa8c16' : '#722ed1',
                  marginBottom: 16
                }}
              />
              <h2 style={{ margin: '8px 0' }}>{selectedUser.name}</h2>
              <Space>
                <Tag color={getRoleColor(selectedUser.role)} icon={getRoleIcon(selectedUser.role)}>
                  {selectedUser.role}
                </Tag>
                <Tag color={getStatusColor(selectedUser.status)} icon={getStatusIcon(selectedUser.status)}>
                  {selectedUser.status}
                </Tag>
              </Space>
            </div>

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Email">
                <MailOutlined /> {selectedUser.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                <PhoneOutlined /> {selectedUser.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                <TeamOutlined /> {selectedUser.department}
              </Descriptions.Item>
              {selectedUser.specialization && (
                <Descriptions.Item label="Specialization">
                  <MedicineBoxOutlined /> {selectedUser.specialization}
                </Descriptions.Item>
              )}
              {selectedUser.licenseNumber && (
                <Descriptions.Item label="License Number">
                  <IdcardOutlined /> {selectedUser.licenseNumber}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Join Date">
                <CalendarOutlined /> {dayjs(selectedUser.joinDate).format('MMM D, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Last Login">
                <ClockCircleOutlined /> {dayjs(selectedUser.lastLogin).format('MMM D, YYYY HH:mm')}
                <div style={{ fontSize: '12px', color: '#666' }}>
                  ({dayjs(selectedUser.lastLogin).fromNow()})
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Security">
                <Space>
                  <SecurityScanOutlined />
                  Two-Factor Auth: 
                  <Tag color={selectedUser.twoFactorEnabled ? 'green' : 'red'}>
                    {selectedUser.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </Tag>
                </Space>
              </Descriptions.Item>
              {selectedUser.address && (
                <Descriptions.Item label="Address">
                  <EnvironmentOutlined /> {selectedUser.address}
                </Descriptions.Item>
              )}
              {selectedUser.notes && (
                <Descriptions.Item label="Notes">
                  {selectedUser.notes}
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedUser.permissions && selectedUser.permissions.length > 0 && (
              <>
                <Divider orientation="left">Permissions</Divider>
                <div>
                  {selectedUser.permissions.map((permission, index) => (
                    <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                      <KeyOutlined /> {permission}
                    </Tag>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title={
          <Space>
            {selectedUser ? <EditOutlined /> : <PlusOutlined />}
            {selectedUser ? "Edit User" : "Add New User"}
          </Space>
        }
        open={isEditModalOpen}
        onCancel={closeEditModal}
        onOk={() => form.submit()}
        okText={selectedUser ? "Update" : "Add"}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: "Please enter full name" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter valid email" }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Enter email" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Phone">
                <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                <Select placeholder="Select role">
                  <Option value="Admin">Admin</Option>
                  <Option value="Doctor">Doctor</Option>
                  <Option value="Nurse">Nurse</Option>
                  <Option value="Staff">Staff</Option>
                  <Option value="Receptionist">Receptionist</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="department" label="Department">
                <Input placeholder="Enter department" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select placeholder="Select status">
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">Inactive</Option>
                  <Option value="Suspended">Suspended</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="specialization" label="Specialization">
                <Input placeholder="Enter specialization" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="licenseNumber" label="License Number">
                <Input placeholder="Enter license number" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Address">
            <Input.TextArea placeholder="Enter full address" rows={2} />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea placeholder="Enter any additional notes" rows={3} />
          </Form.Item>

          <Form.Item 
            name="twoFactorEnabled" 
            label="Two-Factor Authentication"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}