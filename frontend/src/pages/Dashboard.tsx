import React, { useState, useEffect } from 'react';
import {
  Card,
  Statistic,
  Tag,
  Button,
  Progress,
  Skeleton,
  List,
  Avatar,
  Row,
  Col,
  Divider,
  Space,
  Badge,
  Grid,
  Timeline,
  Calendar,
  Alert,
  Select,
  DatePicker,
  Typography
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  BankOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  CarOutlined,
  BellOutlined,
  SettingOutlined,
  FileTextOutlined,
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  RightOutlined,
  LineChartOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  DashboardOutlined,
  MedicineBoxFilled,
  StarOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/common';
import { getApi } from '@/ApiService';
import { useNavigate } from 'react-router-dom';

const { useBreakpoint } = Grid;
const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  description?: string;
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  description,
  loading = false
}) => (
  <Card
    className="medical-card"
    style={{ height: '100%', borderRadius: '12px' }}
    bodyStyle={{ padding: '16px' }}
  >
    {loading ? (
      <Skeleton active paragraph={{ rows: 2 }} />
    ) : (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>{title}</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff', marginBottom: '4px' }}>
            {value}
          </div>
          {change && (
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#666' }}>
              {changeType === 'increase' ? (
                <span style={{ color: '#52c41a', marginRight: '4px' }}>↗</span>
              ) : (
                <span style={{ color: '#ff4d4f', marginRight: '4px' }}>↘</span>
              )}
              <span style={{ color: changeType === 'increase' ? '#52c41a' : '#ff4d4f' }}>
                {change}
              </span>
              <span style={{ marginLeft: '4px' }}>from last month</span>
            </div>
          )}
          {description && (
            <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>{description}</div>
          )}
        </div>
        <div style={{
          color: '#1890ff',
          fontSize: '24px',
          background: 'linear-gradient(135deg, #f0f8ff, #e6f7ff)',
          padding: '12px',
          borderRadius: '8px'
        }}>
          {icon}
        </div>
      </div>
    )}
  </Card>
);

interface RecentActivity {
  id: string;
  type: 'appointment' | 'admission' | 'discharge' | 'emergency' | 'lab' | 'prescription';
  title: string;
  description: string;
  time: string;
  patient: string;
  status?: 'pending' | 'completed' | 'in_progress' | 'cancelled';
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: any;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  role?: UserRole[];
}

export const Dashboard: React.FC = () => {
  const { user, hasRole } = useAuth();
  const screens = useBreakpoint();
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [stats, setStats] = useState<any>([]);
  const navigation = useNavigate()

  useEffect(() => {
    setLoading(false);
    setActivitiesLoading(false);
    getStats()
  }, []);

  function getStats() {
    getApi('/stats')
      .then((data) => {
        if (!data.error) {
          setStats(data.data)
        }
      })
  }

  // Get current date and time information
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // const stats = [
  //   {
  //     title: 'Total Patients',
  //     value: '2,847',
  //     change: '+12.5%',
  //     changeType: 'increase' as const,
  //     icon: < />,
  //     description: 'Active registered patients'
  //   },
  //   {
  //     title: 'Today\'s Appointments',
  //     value: '58',
  //     change: '+5.2%',
  //     changeType: 'increase' as const,
  //     icon: < />,
  //     description: '12 pending, 46 scheduled'
  //   },
  //   {
  //     title: 'Available Doctors',
  //     value: '24',
  //     change: '-2.1%',
  //     changeType: 'decrease' as const,
  //     icon: < />,
  //     description: '3 on leave, 5 in surgery'
  //   },
  //   {
  //     title: 'Bed Occupancy',
  //     value: '87%',
  //     change: '+3.8%',
  //     changeType: 'increase' as const,
  //     icon: < />,
  //     description: '174 of 200 beds occupied'
  //   },
  //   {
  //     title: 'Emergency Cases',
  //     value: '12',
  //     change: '-8.3%',
  //     changeType: 'decrease' as const,
  //     icon: < />,
  //     description: '3 critical, 9 moderate'
  //   },
  //   {
  //     title: 'Monthly Revenue',
  //     value: '$124,750',
  //     change: '+15.3%',
  //     changeType: 'increase' as const,
  //     icon: < />,
  //     description: 'Current month earnings'
  //   }
  // ];

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'appointment',
      title: 'New Appointment Scheduled',
      description: 'Cardiology consultation',
      time: '5 minutes ago',
      patient: 'John Smith',
      status: 'pending'
    },
    {
      id: '2',
      type: 'admission',
      title: 'Patient Admitted',
      description: 'Emergency admission to ICU',
      time: '12 minutes ago',
      patient: 'Sarah Johnson',
      status: 'completed'
    },
    {
      id: '3',
      type: 'lab',
      title: 'Lab Results Ready',
      description: 'Blood test results available',
      time: '28 minutes ago',
      patient: 'Michael Davis',
      status: 'completed'
    },
    {
      id: '4',
      type: 'discharge',
      title: 'Patient Discharged',
      description: 'Recovery completed successfully',
      time: '1 hour ago',
      patient: 'Emily Wilson',
      status: 'completed'
    },
    {
      id: '5',
      type: 'prescription',
      title: 'Prescription Generated',
      description: 'Antibiotics prescribed',
      time: '2 hours ago',
      patient: 'Robert Brown',
      status: 'completed'
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Register New Patient',
      onClick: () => { navigation('/patients/add') },
      description: 'Add patient to system',
      icon: <UserOutlined />,
      type: 'primary'
    },
    {
      id: '2',
      title: 'Schedule Appointment',
      onClick: () => { navigation('/appointments/book') },
      description: 'Book patient consultation',
      icon: <CalendarOutlined />,
      type: 'default'
    },
    {
      id: '3',
      onClick: () => { navigation('/laboratory/results') },
      title: 'Lab Test Request',
      description: 'Order diagnostic tests',
      icon: <LineChartOutlined />,
      type: 'default'
    },
    // {
    //   id: '4',
    //   title: 'Emergency Admission',
    //   description: 'Urgent patient admission',
    //   icon: <CarOutlined />,
    //   onClick: () => {navigation('')},
    //   type: 'primary',
    //   role: ['doctor', 'admin']
    // },
    {
      id: '5',
      title: 'Ward Management',
      description: 'Manage bed allocation',
      icon: <BellOutlined />,
      onClick: () => { navigation('/wards/beds') },
      type: 'default'
    },
    {
      id: '6',
      title: 'Pharmacy Orders',
      onClick: () => { navigation('/pharmacy/orders') },
      description: 'Manage medications',
      icon: <MedicineBoxOutlined />,
      type: 'default'
    },
    {
      id: '7',
      title: 'Medical Records',
      description: 'Access patient history',
      icon: <FileTextOutlined />,
      onClick: () => { navigation('/pharmacy/medicines') },
      type: 'default'
    },
    {
      id: '8',
      title: 'System Settings',
      description: 'Configure hospital settings',
      icon: <SettingOutlined />,
      onClick: () => { navigation('/admin/settings') },
      type: 'default',
      role: ['admin']
    }
  ];

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'appointment': return <CalendarOutlined style={{ color: '#1890ff' }} />;
      case 'admission': return <BankOutlined style={{ color: '#1890ff' }} />;
      case 'discharge': return <UserOutlined style={{ color: '#1890ff' }} />;
      case 'emergency': return <WarningOutlined style={{ color: '#1890ff' }} />;
      case 'lab': return <LineChartOutlined style={{ color: '#1890ff' }} />;
      case 'prescription': return <HeartOutlined style={{ color: '#1890ff' }} />;
      default: return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getStatusColor = (status?: RecentActivity['status']) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'cancelled': return 'red';
      default: return 'green';
    }
  };

  const getStatusText = (status?: RecentActivity['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'cancelled': return 'Cancelled';
      default: return 'Completed';
    }
  };

  const filteredQuickActions = quickActions.filter(action =>
    !action.role || action.role.some(role => hasRole(role))
  );

  const capacityData = [
    { label: 'ICU Capacity', value: 80, current: '12/15 beds', color: '#ff4d4f' },
    { label: 'General Ward', value: 75, current: '45/60 beds', color: '#1890ff' },
    { label: 'Emergency Room', value: 37.5, current: '3/8 beds', color: '#faad14' },
    { label: 'Operating Rooms', value: 60, current: '3/5 rooms', color: '#722ed1' },
  ];

  // Timeline data for today's events
  const timelineData = (stats?.schedule?.items ?? []).map((item, index) => ({
    color: index % 2 === 0 ? 'green' : 'blue', // just alternate colors
    children: (
      <div>
        <Text strong>{item.title || 'Task'}</Text>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {item.start_time} - {item.end_time} {item.location ? `- ${item.location}` : ''}
        </div>
      </div>
    ),
  }));

  console.log(timelineData, stats?.schedule?.items, stats)

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Section with Date and Time */}
      <Card
        style={{
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px'
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ color: 'white', margin: 0 }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Doctor'}! 👋
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
              {formattedDate} • {formattedTime}
            </Text>
          </Col>
          <Col>
            <Space>
              <Select
                defaultValue="today"
                style={{ width: 120 }}
                onChange={setSelectedDate}
              >
                <Option value="today">Today</Option>
                <Option value="week">This Week</Option>
                <Option value="month">This Month</Option>
              </Select>
              <DatePicker />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Alert Banner */}
      <Alert
        message="System Maintenance Notice"
        description="Scheduled maintenance will occur this Saturday from 2:00 AM to 4:00 AM. Some services may be temporarily unavailable."
        type="info"
        showIcon
        closable
        style={{ marginBottom: '24px', borderRadius: '8px' }}
      />

      {/* Stats Grid */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {(stats?.stats ?? []).map((stat, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <StatsCard {...stat} icon={
              stat.icon === "TeamOutlined" ? <TeamOutlined /> :
                stat.icon === "CalendarOutlined" ? <CalendarOutlined /> :
                  stat.icon === "CheckCircleOutlined" ? <CheckCircleOutlined /> :
                    stat.icon === "BankOutlined" ? <BankOutlined /> :
                      stat.icon === "WarningOutlined" ? <WarningOutlined /> :
                        stat.icon === "DollarOutlined" ? <DollarOutlined /> : <></>
            } loading={loading} />
          </Col>
        ))}
      </Row>

      {/* Main Content Grid */}
      <Row gutter={[16, 16]}>
        {/* Recent Activities */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <LineChartOutlined style={{ color: '#1890ff' }} />
                Recent Activities
              </Space>
            }
            extra={
              <Space>
                <Button icon={<FilterOutlined />}>Filter</Button>
                <Button icon={<SearchOutlined />}>Search</Button>
                <RangePicker />
              </Space>
            }
            style={{ height: '100%', borderRadius: '12px' }}
          >
            {activitiesLoading ? (
              <List
                dataSource={[1, 2, 3, 4, 5]}
                renderItem={() => (
                  <List.Item>
                    <Skeleton active avatar paragraph={{ rows: 1 }} />
                  </List.Item>
                )}
              />
            ) : (
              <>
                <List
                  dataSource={recentActivities}
                  renderItem={(activity) => (
                    <List.Item
                      style={{
                        padding: '12px 0',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f0f0f0'
                      }}
                      className="activity-item"
                      actions={[<RightOutlined key="arrow" style={{ color: '#ccc' }} />]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            icon={getActivityIcon(activity.type)}
                            style={{
                              backgroundColor: '#f0f8ff',
                              borderRadius: '8px'
                            }}
                            size="large"
                          />
                        }
                        title={
                          <Space>
                            <span>{activity.title}</span>
                            {activity.status && (
                              <Tag color={getStatusColor(activity.status)}>
                                {getStatusText(activity.status)}
                              </Tag>
                            )}
                          </Space>
                        }
                        description={
                          <div>
                            <div>{activity.description}</div>
                            <div style={{ marginTop: '4px', fontSize: '12px', color: '#999' }}>
                              <UserOutlined /> Patient: {activity.patient} • <ClockCircleOutlined /> {activity.time}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Button onClick={() => { }} type="primary" icon={<RightOutlined />}>
                    View All Activities
                  </Button>
                </div>
              </>
            )}
          </Card>
        </Col>

        {/* Quick Actions & Status */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* Quick Actions */}
            <Card
              title={
                <Space>
                  <MedicineBoxOutlined style={{ color: '#1890ff' }} />
                  Quick Actions
                </Space>
              }
              style={{ borderRadius: '12px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                {filteredQuickActions.map((action) => (
                  <Button
                    key={action.id}
                    type={action.type}
                    icon={action.icon}
                    onClick={action.onClick}
                    style={{
                      width: '100%',
                      height: 'auto',
                      padding: '12px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontWeight: '500' }}>{action.title}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{action.description}</div>
                    </div>
                    <PlusOutlined style={{ opacity: 0.7 }} />
                  </Button>
                ))}
              </Space>
            </Card>

            {/* Today's Timeline */}
            <Card
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#1890ff' }} />
                  Today's Schedule
                </Space>
              }
              style={{ borderRadius: '12px' }}
            >
              <Timeline items={timelineData} />
            </Card>

            {/* Hospital Status */}
            <Card
              title={
                <Space>
                  <BankOutlined style={{ color: '#1890ff' }} />
                  Hospital Status
                </Space>
              }
              style={{ borderRadius: '12px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {capacityData.map((item, index) => (
                  <div key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
                      <span style={{ fontSize: '14px', color: '#666' }}>{item.current}</span>
                    </div>
                    <Progress
                      percent={item.value}
                      strokeColor={item.color}
                      size="small"
                      showInfo={false}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999', marginTop: '4px' }}>
                      <span>0%</span>
                      <span>{item.value}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                ))}
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Additional Features Row */}
      {/* <Row gutter={[16, 16]} style={{ marginTop: '24px' }}> */}
        {/* Hospital Metrics */}
        {/* <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <DashboardOutlined style={{ color: '#1890ff' }} />
                Hospital Metrics
              </Space>
            }
            style={{ borderRadius: '12px' }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Average Wait Time"
                  value={18}
                  suffix="minutes"
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Patient Satisfaction"
                  value={94.5}
                  suffix="%"
                  prefix={<StarOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Cleanliness Score"
                  value={98}
                  suffix="%"
                  prefix={<SafetyCertificateOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Staff On Duty"
                  value={47}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
            </Row>
          </Card>
        </Col> */}

        {/* Emergency Contacts */}
        {/* <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <PhoneOutlined style={{ color: '#ff4d4f' }} />
                Emergency Contacts
              </Space>
            }
            style={{ borderRadius: '12px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#ff4d4f' }} />
                  <div>
                    <Text strong>Dr. Sarah Wilson</Text>
                    <div style={{ fontSize: '12px', color: '#666' }}>Chief Medical Officer</div>
                  </div>
                </Space>
                <Button type="link" icon={<PhoneOutlined />} style={{ color: '#52c41a' }}>
                  Call
                </Button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                  <div>
                    <Text strong>Emergency Dept.</Text>
                    <div style={{ fontSize: '12px', color: '#666' }}>24/7 Emergency Line</div>
                  </div>
                </Space>
                <Button type="link" icon={<PhoneOutlined />} style={{ color: '#52c41a' }}>
                  Call
                </Button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#faad14' }} />
                  <div>
                    <Text strong>Security</Text>
                    <div style={{ fontSize: '12px', color: '#666' }}>Hospital Security</div>
                  </div>
                </Space>
                <Button type="link" icon={<PhoneOutlined />} style={{ color: '#52c41a' }}>
                  Call
                </Button>
              </div>
            </Space>
          </Card>
        </Col>
      </Row> */}

      {/* Role-specific sections */}
      {/* {hasRole('doctor') && (
        <Card
          style={{ marginTop: '24px', borderRadius: '12px' }}
          title={
            <Space>
              <CalendarOutlined style={{ color: '#1890ff' }} />
              My Schedule Today
            </Space>
          }
          extra={
            <Button type="primary" icon={<CalendarOutlined />}>
              View Full Schedule
            </Button>
          }
        >
          {loading ? (
            <List
              dataSource={[1, 2]}
              renderItem={() => (
                <List.Item>
                  <Skeleton active avatar paragraph={{ rows: 1 }} />
                </List.Item>
              )}
            />
          ) : (
            <List
              dataSource={[
                {
                  time: '10:30 AM',
                  title: 'Surgery - Room 3',
                  description: 'Appendectomy procedure • Dr. Smith',
                  icon: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
                  status: 'upcoming'
                },
                {
                  time: '2:00 PM',
                  title: 'Patient Consultation',
                  description: 'Follow-up checkup • Sarah Johnson',
                  icon: <CalendarOutlined style={{ color: '#52c41a' }} />,
                  status: 'scheduled'
                },
                {
                  time: '4:30 PM',
                  title: 'Chart Review',
                  description: 'Patient records assessment',
                  icon: <FileTextOutlined style={{ color: '#faad14' }} />,
                  status: 'scheduled'
                }
              ]}
              renderItem={(item) => (
                <List.Item
                  style={{
                    padding: '16px',
                    border: item.status === 'upcoming' ? '1px solid #1890ff' : '1px solid #f0f0f0',
                    backgroundColor: item.status === 'upcoming' ? '#f0f8ff' : 'transparent',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}
                  className="schedule-item"
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={item.icon} style={{ backgroundColor: '#f0f8ff' }} size="large" />}
                    title={<Text strong>{item.title}</Text>}
                    description={item.description}
                  />
                  <Badge
                    count={item.time}
                    style={{
                      backgroundColor: item.status === 'upcoming' ? '#faad14' : '#d9d9d9',
                      fontSize: '12px'
                    }}
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      )} */}
    </div>
  );
};

export default Dashboard;