import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Space,
  Button,
  Avatar,
  Badge,
  Tabs,
  Timeline,
  Alert,
  Divider,
  Typography,
  Flex,
  List,
  Descriptions,
  Spin,
  Select,
  message
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  ExportOutlined,
  ReloadOutlined,
  PieChartOutlined,
  TableOutlined,
  ApartmentOutlined,
  IdcardOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import { getApi } from "@/ApiService";
import { toast } from "sonner";
import { DepartmentInterface } from "./Departments";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: "ACTIVE" | "INACTIVE";
  joinDate: string;
  lastLogin?: string;
  specialization?: string;
  avatar?: string;
  user_type: any;
  department: string;
}

interface DepartmentStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  doctors: number;
  patients: number;
  nurses: number;
  staff: number;
  recentJoined: number;
}

export default function DepartmentUsers() {
  const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentInterface | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Initial sample data for fallback
  const sampleDepartments: DepartmentInterface[] = [
    { id: 1, name: "Cardiology", description: "Heart and cardiovascular system care" },
    { id: 2, name: "Neurology", description: "Brain and nervous system disorders" },
    { id: 3, name: "Orthopedics", description: "Bones, joints, and musculoskeletal system" },
    { id: 4, name: "Pediatrics", description: "Medical care for infants, children, and adolescents" },
    { id: 5, name: "Emergency Medicine", description: "Urgent medical care and trauma" },
  ];

  function getUsersByDepartment(departmentId: number) {
    setLoading(true);
    getApi(`/users?department_id=${departmentId}`)
      .then((data) => {
        if (!data.error) {
          setUsers(data);
        } else {
          console.error(data.error);
          toast.error(data.error);
        }
      })
      .catch((error) => {
        toast.error("Failed to fetch users");
        console.error("Error fetching users:", error);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    try {
      setLoading(true);
      getApi(`/departments`)
        .then((data) => {
          if (!data.error) {
            setDepartments(data);
            if (data.length > 0) {
              setSelectedDepartment(data[0]);
              getUsersByDepartment(data[0].id);
            }
          } else {
            console.error(data.error);
            toast.error(data.error);
            // Fallback to sample data
            setDepartments(sampleDepartments);
            setSelectedDepartment(sampleDepartments[0]);
            getUsersByDepartment(sampleDepartments[0].id);
          }
        })
        .catch((error) => {
          toast.error("Failed to fetch departments");
          console.error("Error fetching departments:", error);
          // Fallback to sample data
          setDepartments(sampleDepartments);
          setSelectedDepartment(sampleDepartments[0]);
          getUsersByDepartment(sampleDepartments[0].id);
        })
        .finally(() => setLoading(false));
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to fetch departments");
      setLoading(false);
    }
  }, []);

  // Auto refresh functionality
  useEffect(() => {
    if (autoRefresh && selectedDepartment) {
      const interval = setInterval(() => {
        getUsersByDepartment(selectedDepartment.id);
        message.info('🔄 Department users data refreshed');
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedDepartment]);

  // Statistics
  const stats: DepartmentStats = {
    totalUsers: users.length,
    activeUsers: users.filter(user => user.status === "ACTIVE").length,
    inactiveUsers: users.filter(user => user.status === "INACTIVE").length,
    doctors: users.filter(user => user.user_type.id === 1).length,
    nurses: users.filter(user => user.user_type.id === 3).length,
    patients: users.filter(user => user.user_type.id === 2).length,
    staff: users.filter(user => user.user_type.id !== 1 && user.user_type.id !== 2 && user.user_type.id !== 3).length,
    recentJoined: users.filter(user =>
      dayjs(user.joinDate).isAfter(dayjs().subtract(30, 'day'))
    ).length
  };

  // UI Helpers
  const getStatusColor = (status: string) => ({ 'Active': 'green', 'Inactive': 'red' }[status] || 'default');
  const getStatusIcon = (status: string) => ({ 'Active': <CheckCircleOutlined />, 'Inactive': <CloseCircleOutlined /> }[status]);
  const getRoleColor = (role: string) => ({ 'Doctor': 'blue', 'Nurse': 'green', 'Staff': 'orange', 'Admin': 'red' }[role] || 'default');

  const handleDepartmentChange = (dept: DepartmentInterface) => {
    setSelectedDepartment(dept);
    getUsersByDepartment(dept.id);
  };

  const handleRefresh = () => {
    if (selectedDepartment) {
      getUsersByDepartment(selectedDepartment.id);
      toast.success('🔄 Users data refreshed');
    }
  };

  return (
    <div className="p-6 space-y-6" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Flex justify="space-between" align="center">
          <div>
            <Space size="large">
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '10px' }}>
                <TeamOutlined style={{ fontSize: '36px' }} />
              </div>
              <div>
                <Title level={2} style={{ color: 'white', margin: 0 }}>👥 Department Users</Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                  <DashboardOutlined /> Manage and view users by department
                </Text>
              </div>
            </Space>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              size="large"
              style={{ background: '#fff', color: '#667eea', border: 'none', fontWeight: 'bold' }}
            >
              <RocketOutlined /> Refresh
            </Button>
          </Space>
        </Flex>
      </Card>

      {/* Department Selection */}
      <Card>
        <Flex wrap="wrap" gap="middle" align="center">
          <Text strong style={{ fontSize: '16px' }}>Select Department:</Text>
          <Space wrap>
            {departments.map((dept) => (
              <Button
                key={dept.id}
                type={selectedDepartment?.id === dept.id ? "primary" : "default"}
                icon={<ApartmentOutlined />}
                onClick={() => handleDepartmentChange(dept)}
                size="large"
                style={{
                  background: selectedDepartment?.id === dept.id ? '#667eea' : undefined,
                  borderColor: selectedDepartment?.id === dept.id ? '#667eea' : undefined
                }}
              >
                {dept.name}
              </Button>
            ))}
          </Space>
        </Flex>
        {selectedDepartment && (
          <Alert
            message={`Currently viewing: ${selectedDepartment.name}`}
            description={selectedDepartment.description}
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Card>

      {/* Statistics Cards */}
      {selectedDepartment && (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><TeamOutlined /> Total Users</Space>} value={stats.totalUsers} valueStyle={{ color: '#667eea' }} /></Card></Col>
          <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><CheckCircleOutlined /> Active</Space>} value={stats.activeUsers} valueStyle={{ color: '#52c41a' }} /></Card></Col>
          <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><UserOutlined /> Doctors</Space>} value={stats.doctors} valueStyle={{ color: '#1890ff' }} /></Card></Col>
          <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><TeamOutlined /> Nurses</Space>} value={stats.nurses} valueStyle={{ color: '#722ed1' }} /></Card></Col>
          <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><ClockCircleOutlined /> Recent Joined</Space>} value={stats.recentJoined} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
          <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><DashboardOutlined /> Utilization</Space>} value={Math.round((stats.activeUsers / (stats.totalUsers || 1)) * 100)} suffix="%" valueStyle={{ color: '#36cfc9' }} /></Card></Col>
        </Row>
      )}

      {/* Tabs for Different Views */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane
          key="users"
          tab={
            <Space>
              <TeamOutlined /> Users List <Badge count={users.length} overflowCount={99} />
            </Space>
          }
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>Loading users...</div>
            </div>
          ) : (
            <Card
              title={
                <Space>
                  <TableOutlined /> {selectedDepartment?.name} Users ({users.length})
                </Space>
              }
              extra={
                <Space>
                  <Tag color="green">{stats.activeUsers} Active</Tag>
                  <Tag color="blue">{stats.doctors} Doctors</Tag>
                  <Tag color="purple">{stats.nurses} Nurses</Tag>
                </Space>
              }
            >
              <List
                dataSource={users}
                renderItem={(user) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size="large"
                          icon={<UserOutlined />}
                          style={{
                            backgroundColor: getRoleColor(user.role) === 'blue' ? '#1890ff' :
                              getRoleColor(user.role) === 'green' ? '#52c41a' :
                                getRoleColor(user.role) === 'orange' ? '#fa8c16' : '#722ed1'
                          }}
                        />
                      }
                      title={
                        <Space>
                          <Text strong>{user.name}</Text>
                          <Tag color={getRoleColor(user.role)}>{user.role}</Tag>
                          <Tag color={getStatusColor(user.status)} icon={getStatusIcon(user.status)}>
                            {user.status}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <div><MailOutlined /> {user.email}</div>
                          {user.phone && <div><PhoneOutlined /> {user.phone}</div>}
                          {user.specialization && <div><SafetyCertificateOutlined /> {user.specialization}</div>}
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            <CalendarOutlined /> Joined {dayjs(user.joinDate).format('MMM D, YYYY')}
                            {user.lastLogin && (
                              <>
                                {' • '}
                                <ClockCircleOutlined /> Last login {dayjs(user.lastLogin).fromNow()}
                              </>
                            )}
                          </div>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Tabs.TabPane>

        <Tabs.TabPane key="activity" tab={<Space><DashboardOutlined /> Department Activity</Space>}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="User Distribution">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <PieChartOutlined style={{ fontSize: '48px', color: '#667eea' }} />
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <Tag color="blue">Doctors: {stats.doctors}</Tag>
                      <Tag color="green">Nurses: {stats.nurses}</Tag>
                      <Tag color="orange">Staff: {stats.staff}</Tag>
                      <Tag color="orange">Patients: {stats.patients}</Tag>
                    </div>
                    <div>
                      <Tag color="green">Active: {stats.activeUsers}</Tag>
                      <Tag color="red">Inactive: {stats.inactiveUsers}</Tag>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Recent User Activity">
                <Timeline>
                  {users.slice(0, 5).map(user => (
                    <Timeline.Item
                      key={user.id}
                      color={getStatusColor(user.status)}
                      dot={getStatusIcon(user.status)}
                    >
                      <Space direction="vertical" size={0}>
                        <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          <Tag color={getRoleColor(user.role)}>{user.role}</Tag>
                          {user.specialization && ` • ${user.specialization}`}
                        </div>
                        <div style={{ color: '#999', fontSize: '12px' }}>
                          <MailOutlined /> {user.email}
                        </div>
                      </Space>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}