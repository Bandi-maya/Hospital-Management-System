import { useState, useEffect } from "react";
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
  Typography,
  Flex,
  List,
  Select,
  message,
  Skeleton,
  Dropdown,
  Menu,
  Switch,
  Tooltip,
  Empty,
  Drawer,
  FloatButton,
  Progress,
  Input
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
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
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  SettingOutlined,
  SearchOutlined,
  BarChartOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SyncOutlined,
  QuestionCircleOutlined,
  ImportOutlined,
  UserAddOutlined,
  UsergroupAddOutlined
} from "@ant-design/icons";
import { getApi } from "@/ApiService";
import { toast } from "sonner";
import dayjs from "dayjs";
import { DepartmentInterface } from "./Departments";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

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
  const [data, setData] = useState<any>({});
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  // const [pagination, setPagination] = useState({
  //   current: 1,
  //   pageSize: 10,
  //   total: 0,
  // });

  // const handleTableChange = (newPagination: any) => {
  //   getUsersByDepartment(selectedDepartment.id, newPagination.current, newPagination.pageSize);
  // };

  // Skeleton components
  const StatisticSkeleton = () => (
    <Card>
      <Skeleton active paragraph={{ rows: 1 }} />
    </Card>
  );

  const TableSkeleton = () => (
    <Card>
      <Skeleton active paragraph={{ rows: 6 }} />
    </Card>
  );

  const CardSkeleton = () => (
    <Card>
      <Skeleton active avatar paragraph={{ rows: 3 }} />
    </Card>
  );

  // function getUsersByDepartment(departmentId: number, page = 1, limit = 10, searchQuery = searchText, role = selectedRole) {
  function getUsersByDepartment(departmentId: number, searchQuery = searchText, role = selectedRole) {
    setTableLoading(true);
    // getApi(`/users?department_id=${departmentId}&page=${page}&limit=${limit}&q=${searchQuery}&user_type=${role === 'all' ? '' : role}`)
    getApi(`/users?department_id=${departmentId}&q=${searchQuery}&user_type=${role === 'all' ? '' : role}`)
      .then((data) => {
        if (!data.error) {
          setData(data)
          setUsers(data.data);
        } else {
          console.error(data.error);
          toast.error(data.error);
        }
      })
      .catch((error) => {
        toast.error("Failed to fetch users");
        console.error("Error fetching users:", error);
      })
      .finally(() => setTableLoading(false));
  }

  useEffect(() => {
    try {
      setLoading(true);
      setStatsLoading(true);
      getApi(`/departments`)
        .then((data) => {
          if (!data.error) {
            setDepartments(data.data || data);
            if ((data.data || data).length > 0) {
              setSelectedDepartment((data.data || data)[0]);
              getUsersByDepartment((data.data || data)[0].id);
            }
          } else {
            console.error(data.error);
            toast.error(data.error);
          }
        })
        .catch((error) => {
          toast.error("Failed to fetch departments");
          console.error("Error fetching departments:", error);
        })
        .finally(() => {
          setLoading(false);
          setStatsLoading(false);
        });
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to fetch departments");
      setLoading(false);
      setStatsLoading(false);
    }
  }, []);

  // Auto refresh functionality
  useEffect(() => {
    if (selectedDepartment) {
      getUsersByDepartment(selectedDepartment.id);
      message.info('🔄 Department users data refreshed');
    }
  }, [selectedDepartment]);

  // More actions menu
  const moreActionsMenu = (
    <Menu
      items={[
        {
          key: 'export',
          icon: <ExportOutlined />,
          label: 'Export Users',
        },
        {
          key: 'import',
          icon: <ImportOutlined />,
          label: 'Import Users',
        },
        {
          type: 'divider',
        },
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: 'User Settings',
        },
        {
          key: 'help',
          icon: <QuestionCircleOutlined />,
          label: 'Help & Support',
        },
      ]}
    />
  );

  // Statistics
  const stats: DepartmentStats = {
    totalUsers: data?.total_records,
    activeUsers: data?.active_records,
    inactiveUsers: data.inactive_records,
    doctors: data?.doctor_users_count,
    nurses: data?.nurse_users_count,
    patients: data?.patient_users_count,
    staff: data?.staff_users_count,
    recentJoined: data?.recently_added,
  };

  // Filtered users based on search
  const filteredUsers = users
  // .filter(user => 
  //   user.name.toLowerCase().includes(searchText.toLowerCase()) ||
  //   user.email.toLowerCase().includes(searchText.toLowerCase()) ||
  //   user.role.toLowerCase().includes(searchText.toLowerCase()) ||
  //   (user.specialization && user.specialization.toLowerCase().includes(searchText.toLowerCase()))
  // );

  // UI Helpers
  const getStatusColor = (status: string) => ({ 'ACTIVE': 'green', 'INACTIVE': 'red' }[status] || 'default');
  const getStatusIcon = (status: string) => ({ 'ACTIVE': <CheckCircleOutlined />, 'INACTIVE': <CloseCircleOutlined /> }[status]);
  const getRoleColor = (role: string) => ({ 'Doctor': 'blue', 'Nurse': 'green', 'Staff': 'orange', 'Admin': 'red', 'Patient': 'purple' }[role] || 'default');

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

  if (loading) {
    return (
      <div className="p-6 space-y-6" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
        {/* Header Skeleton */}
        <CardSkeleton />

        {/* Statistics Skeleton */}
        <Row gutter={[16, 16]}>
          {[...Array(6)].map((_, i) => (
            <Col key={i} xs={24} sm={12} md={8} lg={4}>
              <StatisticSkeleton />
            </Col>
          ))}
        </Row>

        {/* Table Skeleton */}
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" >
      {/* Header */}
      <Card style={{ color: 'black' }}>
        <Flex justify="space-between" align="center">
          <div>
            <Space size="large">
              <Avatar size={64} icon={<TeamOutlined />} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <div>
                <Title level={2} style={{ color: 'black', margin: 0 }}>👥 Department Users</Title>
                <Text style={{ color: 'rgba(0, 0, 0, 0.8)', margin: 0 }}>
                  <DashboardOutlined /> Manage and view users by department
                </Text>
              </div>
            </Space>
          </div>
          <Space>
            <Tooltip title="Auto Refresh">
              <Switch
                checkedChildren={<SyncOutlined />}
                unCheckedChildren={<CloseCircleOutlined />}
                checked={autoRefresh}
                onChange={setAutoRefresh}
              />
            </Tooltip>
            <Dropdown overlay={moreActionsMenu} placement="bottomRight">
              <Button icon={<SettingOutlined />} style={{ color: "black" }} size="large" ghost>
                Settings
              </Button>
            </Dropdown>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              size="large"
              style={{ background: '#fff', color: '#667eea', border: 'none', fontWeight: 'bold' }}
            >
              <RocketOutlined /> Refresh Data
            </Button>
          </Space>
        </Flex>
      </Card>

      {/* Department Selection */}
      <Card>
        <Flex wrap="wrap" gap="middle" align="center">
          <Text strong style={{ fontSize: '16px' }}>
            <ApartmentOutlined /> Select Department:
          </Text>
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
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              {statsLoading ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <Statistic
                  title={<Space><TeamOutlined /> Total Users</Space>}
                  value={stats.totalUsers}
                  valueStyle={{ color: '#667eea' }}
                />
              )}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              {statsLoading ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <Statistic
                  title={<Space><CheckCircleOutlined /> Active</Space>}
                  value={stats.activeUsers}
                  valueStyle={{ color: '#52c41a' }}
                />
              )}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              {statsLoading ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <Statistic
                  title={<Space><UserOutlined /> Doctors</Space>}
                  value={stats.doctors}
                  valueStyle={{ color: '#1890ff' }}
                />
              )}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              {statsLoading ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <Statistic
                  title={<Space><TeamOutlined /> Nurses</Space>}
                  value={stats.nurses}
                  valueStyle={{ color: '#722ed1' }}
                />
              )}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              {statsLoading ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <Statistic
                  title={<Space><ClockCircleOutlined /> Recent Joined</Space>}
                  value={stats.recentJoined}
                  valueStyle={{ color: '#fa8c16' }}
                />
              )}
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              {statsLoading ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <Statistic
                  title={<Space><DashboardOutlined /> Utilization</Space>}
                  value={Math.round((stats.activeUsers / (stats.totalUsers || 1)) * 100)}
                  suffix="%"
                  valueStyle={{ color: '#36cfc9' }}
                />
              )}
            </Card>
          </Col>
        </Row>
      )}

      {/* Search and Filter Section */}
      {selectedDepartment && (
        <Card>
          <Flex wrap="wrap" gap="middle" align="center">
            <Input.Search
              placeholder="🔍 Search users by name, email, or role..."
              prefix={<SearchOutlined />}
              value={searchText}
              // onSearch={() => getUsersByDepartment(selectedDepartment.id, pagination.current, pagination.pageSize, searchText)}
              onSearch={() => getUsersByDepartment(selectedDepartment.id, searchText)}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              size="large"
              allowClear
            />
            <Select
              placeholder="Filter by Role"
              style={{ width: 150 }}
              onChange={(val) => {
                setSelectedRole(val)
                getUsersByDepartment(selectedDepartment.id, searchText, val)
                // getUsersByDepartment(selectedDepartment.id, pagination.current, pagination.pageSize, searchText, val)
              }}
              value={selectedRole}
              size="large"
            >
              <Option value="all">All Roles</Option>
              <Option value="Doctor">Doctors</Option>
              <Option value="Nurse">Nurses</Option>
              <Option value="Patient">Patients</Option>
              <Option value="Staff">Staff</Option>
            </Select>
            {/* <Select
              placeholder="Filter by Status"
              style={{ width: 150 }}
              size="large"
            >
              <Option value="all">All Status</Option>
              <Option value="ACTIVE">Active</Option>
              <Option value="INACTIVE">Inactive</Option>
            </Select> */}
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => setSearchText('')}
              >
                Reset
              </Button>
              <Button
                icon={<ExportOutlined />}
                onClick={() => setDrawerVisible(true)}
              >
                Export
              </Button>
              <Button
                icon={<CloudDownloadOutlined />}
                type="primary"
                ghost
              >
                Quick Actions
              </Button>
            </Space>
          </Flex>
        </Card>
      )}

      {/* Tabs for Different Views */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane
          key="users"
          tab={
            <Space>
              <TeamOutlined /> Users List <Badge count={filteredUsers.length} overflowCount={99} />
            </Space>
          }
        >
          {tableLoading ? (
            <TableSkeleton />
          ) : selectedDepartment ? (
            <Card
              title={
                <Space>
                  <TableOutlined /> {selectedDepartment?.name} Users ({filteredUsers.length})
                </Space>
              }
              extra={
                <Space>
                  <Tag color="green">{stats.activeUsers} Active</Tag>
                  <Tag color="blue">{stats.doctors} Doctors</Tag>
                  <Tag color="purple">{stats.nurses} Nurses</Tag>
                  <Tag color="orange">{stats.patients} Patients</Tag>
                </Space>
              }
            >
              {filteredUsers.length > 0 ? (
                <List
                  dataSource={filteredUsers}
                  renderItem={(user) => (
                    <List.Item
                      actions={[
                        <Tooltip title="View Details">
                          <Button
                            icon={<EyeOutlined />}
                            type="primary"
                            ghost
                            shape="circle"
                          />
                        </Tooltip>,
                        <Tooltip title="Edit User">
                          <Button
                            icon={<EditOutlined />}
                            shape="circle"
                          />
                        </Tooltip>,
                        <Tooltip title="Delete User">
                          <Button
                            icon={<DeleteOutlined />}
                            danger
                            shape="circle"
                          />
                        </Tooltip>,
                        <Dropdown overlay={moreActionsMenu} trigger={['click']}>
                          <Button
                            icon={<MoreOutlined />}
                            shape="circle"
                          />
                        </Dropdown>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            size="large"
                            icon={<UserOutlined />}
                            style={{
                              backgroundColor: getRoleColor(user.role) === 'blue' ? '#1890ff' :
                                getRoleColor(user.role) === 'green' ? '#52c41a' :
                                  getRoleColor(user.role) === 'orange' ? '#fa8c16' :
                                    getRoleColor(user.role) === 'purple' ? '#722ed1' : '#666'
                            }}
                          />
                        }
                        title={
                          <Space>
                            <Text strong>{user.name}</Text>
                            <Tag color={getRoleColor(user.role)}>{user.user_type?.name || user.role}</Tag>
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
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No users found in this department"
                >
                  <Button type="primary" icon={<UserAddOutlined />}>
                    Add New User
                  </Button>
                </Empty>
              )}
            </Card>
          ) : (
            <Card>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Please select a department to view users"
              />
            </Card>
          )}
        </Tabs.TabPane>

        <Tabs.TabPane key="activity" tab={<Space><DashboardOutlined /> Department Analytics</Space>}>
          {selectedDepartment ? (
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="User Distribution">
                  {statsLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <Skeleton active paragraph={{ rows: 4 }} />
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <PieChartOutlined style={{ fontSize: '48px', color: '#667eea' }} />
                      <div style={{ marginTop: '16px' }}>
                        <Progress
                          type="circle"
                          percent={Math.round((stats.activeUsers / (stats.totalUsers || 1)) * 100)}
                          strokeColor="#52c41a"
                        />
                        <div style={{ marginTop: '16px' }}>
                          <Tag color="blue">Doctors: {stats.doctors}</Tag>
                          <Tag color="green">Nurses: {stats.nurses}</Tag>
                          <Tag color="orange">Staff: {stats.staff}</Tag>
                          <Tag color="purple">Patients: {stats.patients}</Tag>
                        </div>
                        <div style={{ marginTop: '8px' }}>
                          <Tag color="green">Active: {stats.activeUsers}</Tag>
                          <Tag color="red">Inactive: {stats.inactiveUsers}</Tag>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Recent User Activity">
                  {statsLoading ? (
                    <Skeleton active paragraph={{ rows: 5 }} />
                  ) : users.length > 0 ? (
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
                              <Tag color={getRoleColor(user.role)}>{user.user_type?.name || user.role}</Tag>
                              {user.specialization && ` • ${user.specialization}`}
                            </div>
                            <div style={{ color: '#999', fontSize: '12px' }}>
                              <MailOutlined /> {user.email}
                            </div>
                            <div style={{ color: '#999', fontSize: '12px' }}>
                              <CalendarOutlined /> Joined {dayjs(user.joinDate).format('MMM D, YYYY')}
                            </div>
                          </Space>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  ) : (
                    <Empty description="No user activity recorded" />
                  )}
                </Card>
              </Col>
            </Row>
          ) : (
            <Card>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Please select a department to view analytics"
              />
            </Card>
          )}
        </Tabs.TabPane>
      </Tabs>

      {/* Quick Actions Drawer */}
      <Drawer
        title="Quick Actions"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Card size="small" title="Data Management">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button icon={<CloudDownloadOutlined />} block>
                Download Report
              </Button>
              <Button icon={<CloudUploadOutlined />} block>
                Upload Data
              </Button>
              <Button icon={<SyncOutlined />} block onClick={handleRefresh}>
                Refresh Data
              </Button>
            </Space>
          </Card>

          <Card size="small" title="User Operations">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button icon={<UserAddOutlined />} type="primary" block>
                Add New User
              </Button>
              <Button icon={<UsergroupAddOutlined />} block>
                Bulk Import
              </Button>
              <Button icon={<BarChartOutlined />} block>
                View Analytics
              </Button>
            </Space>
          </Card>
        </Space>
      </Drawer>

      {/* Floating Action Button */}
      {/* <FloatButton.Group
        shape="circle"
        style={{ right: 24 }}
        icon={<ThunderboltOutlined />}
      >
        <FloatButton
          icon={<ReloadOutlined />}
          tooltip="Refresh"
          onClick={handleRefresh}
        />
        <FloatButton
          icon={<UserAddOutlined />}
          tooltip="Add User"
        />
        <FloatButton
          icon={<SettingOutlined />}
          tooltip="Settings"
          onClick={() => setDrawerVisible(true)}
        />
        <FloatButton.BackTop visibilityHeight={0} />
      </FloatButton.Group> */}
    </div>
  );
}