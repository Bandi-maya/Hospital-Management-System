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
  Skeleton,
  Dropdown,
  Menu,
  Steps,
  Result,
  Spin,
  FloatButton,
  QRCode,
  Segmented,
  notification,
  Drawer,
  ColorPicker,
  theme,
  App,
  Grid,
  Layout,
  Breadcrumb,
  Empty,
  Image,
  Upload,
  Rate,
  List,
  Calendar
} from "antd";
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
  UserAddOutlined,
  ApartmentOutlined,
  FormOutlined,
  FieldBinaryOutlined,
  BuildOutlined,
  ClusterOutlined,
  MoreOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  BarcodeOutlined,
  QrcodeOutlined,
  ScanOutlined,
  TransactionOutlined,
  MoneyCollectOutlined,
  FundOutlined,
  AccountBookOutlined,
  AuditOutlined,
  ReconciliationOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  GiftOutlined,
  TrophyOutlined,
  LikeOutlined,
  DislikeOutlined,
  NotificationOutlined,
  ExclamationCircleOutlined,
  IssuesCloseOutlined,
  StopOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  StepForwardOutlined,
  StepBackwardOutlined,
  FastForwardOutlined,
  FastBackwardOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  CaretLeftOutlined,
  CaretRightOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined,
  ForwardOutlined,
  BackwardOutlined,
  RollbackOutlined,
  EnterOutlined,
  RetweetOutlined,
  SwapOutlined,
  SwapLeftOutlined,
  SwapRightOutlined,
  WifiOutlined,
  GlobalOutlined,
  DesktopOutlined,
  LaptopOutlined,
  MobileOutlined,
  TabletOutlined,
  CameraOutlined,
  PictureOutlined,
  SoundOutlined,
  CustomerServiceOutlined,
  VideoCameraOutlined,
  PlaySquareOutlined,
  PauseOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  FileAddOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FilePptOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileUnknownOutlined,
  FileMarkdownOutlined,
  FilePdfOutlined,
  InboxOutlined,
  PaperClipOutlined,
  TagOutlined,
  TagsOutlined,
  PushpinOutlined,
  PhoneFilled,
  MobileFilled,
  TabletFilled,
  AudioFilled,
  VideoCameraFilled,
  NotificationFilled,
  MessageFilled,
  HeartFilled,
  StarFilled,
  CrownFilled,
  TrophyFilled,
  FireFilled,
  LikeFilled,
  DislikeFilled,
  InfoCircleFilled,
  ExclamationCircleFilled,
  WarningFilled,
  QuestionCircleOutlined,
  QuestionCircleFilled,
  MinusCircleOutlined,
  MinusCircleFilled,
  PlusCircleOutlined,
  PlusCircleFilled,
  FrownOutlined,
  FrownFilled,
  MehOutlined,
  MehFilled,
  SmileOutlined,
  SmileFilled,
  PoweroffOutlined,
  LogoutOutlined,
  LoginOutlined,
  UsergroupAddOutlined,
  UsergroupDeleteOutlined,
  UserDeleteOutlined,
  TeamOutlined as TeamFilled,
  ImportOutlined,
  SettingOutlined,
  BarChartOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { toast } from "sonner";
import { DeleteApi, getApi, PostApi, PutApi } from "@/ApiService";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { useToken } = theme;
const { Step } = Steps;

export interface DepartmentInterface {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: any;
  updated_at: any;
}

interface DepartmentStats {
  total: number;
  active: number;
  inactive: number;
  recentAdded: number;
  totalDoctors: number;
  totalPatients: number;
}

export default function Department() {
  const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState("departments");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const handleTableChange = (newPagination: any) => {
    loadData(newPagination.current, newPagination.pageSize);
  };

  const [form] = Form.useForm();
  const { token } = useToken();

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

  const loadData = (page = 1, limit = 10, searchQuery = searchText, status = statusFilter) => {
    setIsLoading(true);
    setTableLoading(true);
    setStatsLoading(true);
    getApi(`/departments?page=${page}&limit=${limit}&q=${searchQuery}&status=${status === 'all' ? '' : 'ACTIVE'}`)
      .then((data) => {
        if (!data.error) {
          setDepartments(data.data);
        } else {
          toast.error(data.error);
        }
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
        toast.error("Failed to fetch departments");
      }).finally(() => {
        setIsLoading(false);
        setTableLoading(false);
        setStatsLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (department: DepartmentInterface | null = null) => {
    if (department) {
      setSelectedDepartment(department);
      form.setFieldsValue({
        id: department.id,
        name: department.name,
        description: department.description,
        status: department.is_active ? "ACTIVE" : "INACTIVE",
        is_active: department.is_active || true
      });
    } else {
      setSelectedDepartment(null);
      form.resetFields();
      form.setFieldsValue({
        status: "ACTIVE"
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    values.is_active = values.status === "ACTIVE";
    delete values.status;

    if (selectedDepartment) {
      PutApi(`/departments`, { ...values, id: selectedDepartment.id })
        .then((data) => {
          if (!data.error) {
            toast.success("Department updated successfully!");
            setIsModalOpen(false);
            loadData();
          } else {
            toast.error(data.error);
          }
        })
        .catch((error) => {
          console.error("Error updating department:", error);
          toast.error("Failed to update department");
        }).finally(() => setIsLoading(false));
    } else {
      PostApi(`/departments`, { ...values })
        .then((data) => {
          if (!data.error) {
            toast.success("Department created successfully!");
            setIsModalOpen(false);
            loadData();
          } else {
            toast.error(data.error);
          }
        })
        .catch((error) => {
          console.error("Error creating department:", error);
          toast.error("Failed to create department");
        }).finally(() => setIsLoading(false));
    }

    setSelectedDepartment(null);
  };

  const deleteDepartment = async (id: number) => {
    setIsLoading(true);
    DeleteApi("/department", { id: id })
      .then((data) => {
        if (!data.error) {
          loadData()
        }
        else {
          toast.error(data.error)
        }
      }).catch((err) => {
        toast.error("Error occurred while deleting the department")
      }).finally(() => {
        setIsLoading(false);
      })
  };

  const stats: DepartmentStats = {
    total: departments.length,
    active: departments.filter((d) => d.is_active).length,
    inactive: departments.filter((d) => !d.is_active).length,
    recentAdded: departments.filter((d) =>
      dayjs(d.created_at).isAfter(dayjs().subtract(7, 'day'))
    ).length,
    totalDoctors: 0,
    totalPatients: 0
  };

  // More actions menu
  const moreActionsMenu = (
    <Menu
      items={[
        {
          key: 'export',
          icon: <ExportOutlined />,
          label: 'Export Departments',
        },
        {
          key: 'import',
          icon: <ImportOutlined />,
          label: 'Import Data',
        },
        {
          type: 'divider',
        },
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: 'Department Settings',
        },
        {
          key: 'help',
          icon: <QuestionCircleOutlined />,
          label: 'Help & Support',
        },
      ]}
    />
  );

  // UI Helpers
  const getStatusColor = (status: string) => ({ 'ACTIVE': 'green', 'INACTIVE': 'red' }[status] || 'default');
  const getStatusIcon = (status: string) => ({ 'Active': <CheckCircleOutlined />, 'Inactive': <CloseCircleOutlined /> }[status]);

  const filteredDepartments = departments
  // .filter((department) => {
  //   const matchesSearch = searchText === "" ||
  //     department.name.toLowerCase().includes(searchText.toLowerCase()) ||
  //     department.description.toLowerCase().includes(searchText.toLowerCase());
  //   const matchesStatus = statusFilter === "all" || department.is_active === (statusFilter === "ACTIVE");
  //   return matchesSearch && matchesStatus;
  // });

  const columns: ColumnsType<DepartmentInterface> = [
    {
      title: <Space><BuildOutlined /> Department Information</Space>,
      key: 'department',
      render: (_, record) => (
        <Flex align="center" gap="middle">
          <Avatar
            size="large"
            icon={<ClusterOutlined />}
            style={{
              backgroundColor: record.is_active ? '#52c41a' : '#f5222d'
            }}
          />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.description}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              <CalendarOutlined /> Created: {dayjs(record.created_at).format('MMM D, YYYY')}
            </div>
          </div>
        </Flex>
      ),
    },
    {
      title: <Space><SafetyCertificateOutlined /> Status & Activity</Space>,
      key: 'status',
      render: (_, record) => (
        <Space direction="vertical">
          <Tag
            color={getStatusColor(record.is_active ? "ACTIVE" : "INACTIVE")}
            icon={record.is_active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            style={{ fontWeight: 'bold' }}
          >
            {record.is_active ? "ACTIVE" : "INACTIVE"}
          </Tag>
          {record.updated_at && (
            <div style={{ fontSize: '12px', color: '#999' }}>
              <SyncOutlined /> Updated: {dayjs(record.updated_at).fromNow()}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: <Space><ThunderboltOutlined /> Actions</Space>,
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              shape="circle"
              type="primary"
              ghost
            />
          </Tooltip>
          <Tooltip title="Edit Department">
            <Button
              icon={<EditOutlined />}
              shape="circle"
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Department">
            <Popconfirm
              title="Delete this department?"
              description="Are you sure you want to delete this department? This action cannot be undone."
              onConfirm={() => deleteDepartment(record.id)}
              okText="Yes"
              cancelText="No"
              okType="danger"
              icon={<CloseCircleOutlined style={{ color: 'red' }} />}
            >
              <Button icon={<DeleteOutlined />} shape="circle" danger />
            </Popconfirm>
          </Tooltip>
          <Dropdown overlay={moreActionsMenu} trigger={['click']}>
            <Button icon={<MoreOutlined />} shape="circle" />
          </Dropdown>
        </Space>
      ),
    },
  ];

  if (isLoading) {
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
    <div className="p-6 space-y-6" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ color: 'black' }}>
        <Flex justify="space-between" align="center">
          <div>
            <Space size="large">
              <Avatar size={64} icon={<BuildOutlined />} style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }} />
              <div>
                <Title level={2} style={{ color: 'black', margin: 0 }}>🏥 Department Management</Title>
                <Text style={{ color: 'rgba(0, 0, 0, 0.8)', margin: 0 }}>
                  <DashboardOutlined /> Manage hospital departments and specialties
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
              <Button icon={<SettingOutlined />} style={{ color: 'black' }} size="large" ghost>
                Settings
              </Button>
            </Dropdown>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
              size="large"
              style={{ background: '#fff', color: '#ff6b6b', border: 'none', fontWeight: 'bold' }}
            >
              <RocketOutlined /> Add Department
            </Button>
          </Space>
        </Flex>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            {statsLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Space><BuildOutlined /> Total Departments</Space>}
                value={stats.total}
                valueStyle={{ color: '#ff6b6b' }}
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
                value={stats.active}
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
                title={<Space><TeamOutlined /> Total Doctors</Space>}
                value={stats.totalDoctors}
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
                title={<Space><UserOutlined /> Total Patients</Space>}
                value={stats.totalPatients}
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
                title={<Space><ClockCircleOutlined /> Recent Added</Space>}
                value={stats.recentAdded}
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
                value={Math.round((stats.active / (stats.total || 1)) * 100)}
                suffix="%"
                valueStyle={{ color: '#36cfc9' }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Tabs for Different Views */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane
          key="departments"
          tab={
            <Space>
              <BuildOutlined /> All Departments <Badge count={filteredDepartments.length} overflowCount={99} />
            </Space>
          }
        >
          <div className="space-y-6">
            <Card>
              <Flex wrap="wrap" gap="middle" align="center" style={{ marginBottom: '16px' }}>
                <Input.Search
                  placeholder="🔍 Search departments, descriptions..."
                  prefix={<SearchOutlined />}
                  onSearch={() => loadData(pagination.current, pagination.pageSize, searchText)}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                  size="large"
                />
                <Select
                  value={statusFilter}
                  onChange={(val) => {
                    loadData(pagination.current, pagination.pageSize, searchText, val)
                    setStatusFilter(val)
                  }}
                  placeholder="Filter by Status"
                  style={{ width: 150 }}
                  size="large"
                >
                  <Option value="all">All Status</Option>
                  <Option value="ACTIVE">Active</Option>
                  <Option value="INACTIVE">Inactive</Option>
                </Select>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => { setSearchText(''); setStatusFilter('all'); }}
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
              <Alert
                message="Department Overview"
                description={`${stats.active} active and ${stats.inactive} inactive departments. Serving ${stats.totalDoctors} doctors and ${stats.totalPatients} patients across all departments.`}
                type={stats.inactive > 0 ? "warning" : "info"}
                showIcon
                closable
              />
            </Card>

            <Card
              title={
                <Space>
                  <TableOutlined /> Department List ({filteredDepartments.length})
                </Space>
              }
              extra={
                <Space>
                  <Tag color="green">{stats.active} Active</Tag>
                  <Tag color="red">{stats.inactive} Inactive</Tag>
                  <Tag color="blue">{stats.totalDoctors} Doctors</Tag>
                </Space>
              }
            >
              {tableLoading ? (
                <TableSkeleton />
              ) : filteredDepartments.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={filteredDepartments}
                  rowKey="id"
                  loading={tableLoading}
                  onChange={handleTableChange}
                  scroll={{ x: 800 }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} departments`,
                  }}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No departments found matching your criteria"
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleOpenModal()}
                  >
                    Add First Department
                  </Button>
                </Empty>
              )}
            </Card>
          </div>
        </Tabs.TabPane>

        <Tabs.TabPane key="activity" tab={<Space><DashboardOutlined /> Department Analytics</Space>}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="Department Distribution">
                {statsLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Skeleton active paragraph={{ rows: 4 }} />
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <PieChartOutlined style={{ fontSize: '48px', color: '#ff6b6b' }} />
                    <div style={{ marginTop: '16px' }}>
                      <Progress
                        type="circle"
                        percent={Math.round((stats.active / (stats.total || 1)) * 100)}
                        strokeColor="#52c41a"
                      />
                      <div style={{ marginTop: '16px' }}>
                        <Tag color="green">Active: {stats.active}</Tag>
                        <Tag color="red">Inactive: {stats.inactive}</Tag>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Recent Department Activity">
                {statsLoading ? (
                  <Skeleton active paragraph={{ rows: 5 }} />
                ) : departments.length > 0 ? (
                  <Timeline>
                    {departments.slice(0, 5).map(department => (
                      <Timeline.Item
                        key={department.id}
                        color={getStatusColor(department.is_active ? "ACTIVE" : "INACTIVE")}
                        dot={department.is_active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                      >
                        <Space direction="vertical" size={0}>
                          <div style={{ fontWeight: 'bold' }}>{department.name}</div>
                          <div style={{ color: '#666', fontSize: '12px' }}>
                            {department.description}
                          </div>
                          <div style={{ color: '#999', fontSize: '12px' }}>
                            <CalendarOutlined /> Created: {dayjs(department.created_at).format('MMM D, YYYY')}
                          </div>
                        </Space>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <Empty description="No department activity recorded" />
                )}
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>
      </Tabs>

      {/* Add/Edit Department Modal */}
      <Modal
        title={
          <Space>
            {selectedDepartment ? <EditOutlined /> : <PlusOutlined />}
            {selectedDepartment ? "Edit Department" : "Add Department"}
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={selectedDepartment ? "Update Department" : "Add Department"}
        width={600}
        destroyOnClose
        confirmLoading={isLoading}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label={
                  <Space>
                    <BuildOutlined />
                    Department Name
                  </Space>
                }
                rules={[{ required: true, message: "Please enter department name" }]}
              >
                <Input prefix={<BuildOutlined />} placeholder="Enter department name" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label={
                  <Space>
                    <SafetyCertificateOutlined />
                    Status
                  </Space>
                }
                rules={[{ required: true }]}
              >
                <Select placeholder="Select status" size="large">
                  <Option value="ACTIVE">
                    <Space>
                      <CheckCircleOutlined />
                      Active
                    </Space>
                  </Option>
                  <Option value="INACTIVE">
                    <Space>
                      <CloseCircleOutlined />
                      Inactive
                    </Space>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label={
              <Space>
                <FileTextOutlined />
                Description
              </Space>
            }
            rules={[{ required: true, message: "Please enter department description" }]}
          >
            <TextArea
              rows={3}
              placeholder="Enter detailed description of this department and its services"
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>

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
              <Button icon={<SyncOutlined />} block onClick={() => loadData()}>
                Refresh Data
              </Button>
            </Space>
          </Card>

          <Card size="small" title="Department Operations">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                icon={<PlusOutlined />}
                type="primary"
                block
                onClick={() => {
                  setDrawerVisible(false);
                  handleOpenModal();
                }}
              >
                New Department
              </Button>
              <Button icon={<TeamOutlined />} block>
                Manage Staff
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
            icon={<PlusOutlined />}
            tooltip="Add Department"
            onClick={() => handleOpenModal()}
          />
          <FloatButton
            icon={<SyncOutlined />}
            tooltip="Refresh"
            onClick={loadData}
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