import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Card,
  Statistic,
  Row,
  Col,
  Progress,
  message,
  Popconfirm,
  InputNumber,
  Alert,
  Descriptions,
  Tooltip,
  Badge,
  Avatar,
  List,
  Divider,
  Timeline,
  Tabs,
  Empty,
  Collapse,
  Switch,
  Rate,
  Upload,
  Image,
  Skeleton,
  Dropdown,
  Menu,
  Steps,
  Result,
  Spin,
  FloatButton,
  QRCode,
  Watermark,
  Segmented,
  notification,
  Drawer,
  ColorPicker,
  theme,
  App,
  Flex,
  Grid,
  Layout,
  Breadcrumb
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  TeamOutlined,
  ItalicOutlined,
  BellOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  StarOutlined,
  FileTextOutlined,
  DownloadOutlined,
  UploadOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  ExportOutlined,
  ImportOutlined,
  SettingOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  DashboardOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  AppstoreOutlined,
  MenuOutlined,
  CrownOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  FireOutlined,
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
  MessageOutlined,
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
  HomeOutlined,
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
  UserSwitchOutlined,
  UsergroupAddOutlined,
  UsergroupDeleteOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  TeamOutlined as TeamFilled
} from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import { DefaultOptionType } from "antd/es/select";
import { DeleteApi, getApi, PostApi, PutApi } from "@/ApiService";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { useToken } = theme;
const { Meta } = Card;
const { Countdown } = Statistic;

export interface Ward {
  id: string;
  name: string;
  type: string;
  capacity: number;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
  location?: string;
  is_active: boolean;
  phone?: string;
  email?: string;
  beds?: any;
  specialization?: string;
  notes?: string;
}

interface Activity {
  id: string;
  wardId: string;
  action: string;
  timestamp: string;
  user: string;
  details: string;
}

export default function WardStatus() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingWard, setEditingWard] = useState<Ward | null>(null);
  const [viewingWard, setViewingWard] = useState<Ward | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("name");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const { hasPermission } = useAuth()

  const handleTableChange = (newPagination: any) => {
    getWards(newPagination.current, newPagination.pageSize);
  };

  const [form] = Form.useForm();
  const { token } = useToken();
  const [departments, setDepartments] = useState([])

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

  function getWards(page = 1, limit = 10, searchQuery = searchText) {
    setLoading(true);
    setTableLoading(true);
    setStatsLoading(true);
    getApi(`/wards?page=${page}&limit=${limit}&q=${searchQuery}`)
      .then((data) => {
        if (!data.error) {
          setWards(data.data)
        }
        else {
          toast.error(data.error)
        }
      }).catch((err) => {
        console.error("Error: ", err)
        toast.error("Error occurred while getting the wards.")
      })
      .finally(() => {
        setLoading(false);
        setTableLoading(false);
        setStatsLoading(false);
      });
  }

  function getDepartments() {
    getApi("/departments")
      .then((data) => {
        if (!data.error) {
          setDepartments(data.data)
        }
        else {
          toast.error(data.error)
        }
      }).catch((err) => {
        console.error("Error: ", err)
        toast.error("Error occurred while getting the departments.")
      })
  }

  // Load data from localStorage
  useEffect(() => {
    getWards();
    getDepartments();
  }, []);

  const saveWards = (updatedWards: Ward[]) => {
    PutApi("/wards", updatedWards)
      .then((data) => {
        if (!data.error) {
          getWards()
        }
        else {
          toast.error(data.error)
        }
      })
      .catch((err) => {
        console.error("Error: ", err)
        toast.error("Error occurred while saving ward")
      })
  };

  const logActivity = (action: string, wardId: string, details: string) => {
    const newActivity: Activity = {
      id: uuidv4(),
      wardId,
      action,
      timestamp: new Date().toISOString(),
      user: "Admin User",
      details
    };
    const updatedActivities = [newActivity, ...activities.slice(0, 49)]; // Keep last 50 activities
    setActivities(updatedActivities);
    localStorage.setItem("wardActivities", JSON.stringify(updatedActivities));
  };

  const getWardIcon = (type: string) => {
    const icons: { [key: string]: JSX.Element } = {
      General: <ItalicOutlined />,
      ICU: <ExperimentOutlined />,
      Private: <CrownOutlined />,
      Pediatric: <HeartOutlined />,
      Maternity: <TeamOutlined />,
      Surgical: <MedicineBoxOutlined />
    };
    return icons[type] || <ItalicOutlined />;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      available: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      critical: <WarningOutlined style={{ color: '#faad14' }} />,
      full: <CloseCircleOutlined style={{ color: '#f5222d' }} />
    };
    return icons[status as keyof typeof icons];
  };

  const handleAddEditWard = (values: any) => {
    const wardData = { ...values };

    console.log(editingWard)
    delete wardData.occupied
    delete wardData.rating
    delete wardData.status

    if (editingWard) {
      PutApi("/wards", { ...wardData, id: editingWard.id })
        .then((data) => {
          if (!data.error) {
            getWards()
            setModalVisible(false);
            form.resetFields();
            setEditingWard(null);
            toast.success("Successfully updated ward.")
          }
          else {
            toast.error(data.error)
          }
        })
        .catch((err) => {
          console.error("Error: ", err)
          toast.error("Error occurred while saving ward")
        })
    } else {
      PostApi("/wards", wardData)
        .then((data) => {
          if (!data.error) {
            getWards()
            toast.success("Successfully added ward.")
            setModalVisible(false);
            form.resetFields();
            setEditingWard(null);
          }
          else {
            toast.error(data.error)
          }
        })
        .catch((err) => {
          console.error("Error: ", err)
          toast.error("Error occurred while saving ward")
        })
    }
  };

  const handleDelete = (wardId: string) => {
    DeleteApi("/wards", { id: wardId })
      .then((data) => {
        if (!data.error) {
          toast.success("Ward deleted successfully")
          getWards()
        }
        else {
          toast.error(data.error)
        }
      }).catch((err) => {
        toast.error("Error occurred while deleting the ward")
      })
  };

  const handleResetData = () => {
    getWards();
    logActivity("SYSTEM", "system", "Reset all ward data to initial state");
    message.info("🔄 Data reset to initial state");
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(wards, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wards-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    message.success("📤 Data exported successfully!");
  };

  // const filteredAndSortedWards = (wards ?? [])
  //   .filter(ward => {
  //     const matchesSearch = searchText === "" ||
  //       ward.name.toLowerCase().includes(searchText.toLowerCase()) ||
  //       ward.type.toLowerCase().includes(searchText.toLowerCase()) ||
  //       ward.specialization?.toLowerCase().includes(searchText.toLowerCase());
  //     const matchesType = filterType === "all" || ward.type === filterType;
  //     return matchesSearch && matchesType;
  //   })
  //   .sort((a, b) => {
  //     switch (sortOrder) {
  //       case "name": return a.name.localeCompare(b.name);
  //       case "capacity": return b.capacity - a.capacity;
  //       default: return 0;
  //     }
  //   });

  // Statistics calculations
  const stats = {
    totalWards: wards.length,
    totalCapacity: wards.reduce((sum, ward) => sum + ward.capacity, 0),
    totalOccupied: wards.reduce((sum, ward) => sum + ward.beds.filter((bed) => bed.status !== "ACTIVE").length, 0),
    availableBeds: wards.reduce((sum, ward) => sum + ward.beds.filter((bed) => bed.status === "ACTIVE").length, 0),
    occupancyRate: wards.reduce((sum, ward) => sum + ward.capacity, 0) > 0 ?
      (wards.reduce((sum, ward) => sum + (ward.beds ?? []).filter((bed) => bed.status === "OCCUPIED").length, 0) / wards.reduce((sum, ward) => sum + ward.capacity, 0)) * 100 : 0,
    fullWards: wards.filter(ward => ward.capacity === ward.beds.filter((bed) => bed.status === "ACTIVE").length).length
  };

  // More actions menu
  const moreActionsMenu = (
    <Menu
      items={[
        {
          key: 'import',
          icon: <ImportOutlined />,
          label: 'Import Wards',
        },
        // {
        //   key: 'export',
        //   icon: <ExportOutlined />,
        //   label: 'Export All Data',
        // },
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: 'Ward Settings',
        },
        {
          type: 'divider',
        },
        {
          key: 'help',
          icon: <QuestionCircleOutlined />,
          label: 'Help & Support',
        },
      ]}
    />
  );

  const columns = [
    {
      title: (
        <Space>
          <ItalicOutlined />
          Ward Name
        </Space>
      ),
      dataIndex: "name",
      key: "name",
      sorter: (a: Ward, b: Ward) => a.name.localeCompare(b.name),
      render: (name: string, record: Ward) => (
        <Space>
          <Avatar icon={getWardIcon(record.type)} style={{ backgroundColor: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <EnvironmentOutlined /> {record.location}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <AppstoreOutlined />
          Type
        </Space>
      ),
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag icon={getWardIcon(type)} color="blue">
          {type}
        </Tag>
      ),
    },
    {
      title: (
        <Space>
          <BarChartOutlined />
          Capacity
        </Space>
      ),
      dataIndex: "capacity",
      key: "capacity",
      sorter: (a: Ward, b: Ward) => a.capacity - b.capacity,
      render: (capacity: number, record: Ward) => (
        <Space direction="vertical" size={0}>
          <div>
            <BellOutlined /> {(record.beds ?? []).filter((bed) => bed.status === "OCCUPIED").length}/{capacity}
          </div>
          <Progress
            percent={Math.round((((record.beds ?? []).filter((bed) => bed.status === "OCCUPIED").length) / capacity) * 100)}
            size="small"
            showInfo={false}
          />
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <SafetyCertificateOutlined />
          Status
        </Space>
      ),
      key: "status",
      render: (record: Ward) => (
        <Space>
          {getStatusIcon(record.status)}
          <Tag color={
            record.status === "ACTIVE" ? "green" :
              record.status === "INACTIVE" ? "orange" : "red"
          }>
            {record.status}
          </Tag>
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
      render: (record: Ward) => (
        hasPermission(['wards:edit']) && <Space>
          {/* <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              shape="circle"
              type="primary"
              ghost
              onClick={() => {
                setViewingWard(record);
                setViewModalVisible(true);
              }}
            />
          </Tooltip> */}
          <Tooltip title="Edit Ward">
            <Button
              icon={<EditOutlined />}
              shape="circle"
              onClick={() => {
                record.status = record.is_active ? 'ACTIVE' : "INACTIVE"
                setEditingWard(record);
                form.setFieldsValue(record);
                setModalVisible(true);
              }}
            />
          </Tooltip>
          {/* <Tooltip title="Delete Ward">
            <Popconfirm
              title="Are you sure to delete this ward?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
              icon={<WarningOutlined style={{ color: 'red' }} />}
            >
              <Button icon={<DeleteOutlined />} shape="circle" danger />
            </Popconfirm>
          </Tooltip> */}
          {/* <Dropdown overlay={moreActionsMenu} trigger={['click']}>
            <Button icon={<MoreOutlined />} shape="circle" />
          </Dropdown> */}
        </Space>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    getWards(pagination.current, pagination.pageSize, value)
    setSearchText(value);
  };

  const handleTypeFilter = (value: string) => {
    setFilterType(value);
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
    <Watermark content="Hospital Management">
      <div className="p-6 space-y-6" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
        {/* Enhanced Header */}
        <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <div className="flex justify-between items-center">
            <div>
              <Space size="large">
                <Avatar size={64} icon={<ItalicOutlined />} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: 'white', margin: 0 }}>
                    🏥 Hospital Ward Management
                  </h1>
                  <p className="text-gray-200" style={{ margin: 0 }}>
                    <DashboardOutlined /> Comprehensive ward monitoring and management system
                  </p>
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
                <Button icon={<SettingOutlined />} size="large">
                  Settings
                </Button>
              </Dropdown>
              {
                hasPermission(['wards:add']) &&
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingWard(null);
                    form.resetFields();
                    setModalVisible(true);
                  }}
                  size="large"
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                >
                  <RocketOutlined /> Add New Ward
                </Button>
              }
            </Space>
          </div>
        </Card>

        {/* Enhanced Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              {statsLoading ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <Statistic
                  title={<Space><ItalicOutlined /> Total Wards</Space>}
                  value={stats.totalWards}
                  prefix={<InfoCircleOutlined style={{ color: '#1890ff' }} />}
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
                  title={<Space><BellOutlined /> Total Capacity</Space>}
                  value={stats.totalCapacity}
                  suffix="beds"
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
                  title={<Space><TeamOutlined /> Occupied Beds</Space>}
                  value={stats.totalOccupied}
                  suffix="beds"
                  valueStyle={{ color: '#faad14' }}
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
                  title={<Space><CheckCircleOutlined /> Available Beds</Space>}
                  value={stats.availableBeds}
                  suffix="beds"
                  valueStyle={{ color: stats.availableBeds > 0 ? '#52c41a' : '#f5222d' }}
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
                  title={<Space><CloseCircleOutlined /> Full Wards</Space>}
                  value={stats.fullWards}
                  valueStyle={{ color: '#f5222d' }}
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
                  title="Occupancy Rate"
                  value={stats.occupancyRate}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: stats.occupancyRate > 80 ? '#f5222d' : stats.occupancyRate > 60 ? '#faad14' : '#52c41a' }}
                />
              )}
            </Card>
          </Col>
        </Row>

        {/* Tabs for Different Views */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "overview",
              label: (
                <Space>
                  <DashboardOutlined />
                  Overview
                </Space>
              ),
              children: (
                <div className="space-y-6">
                  {/* Overall Progress */}
                  <Card
                    title={
                      <Space>
                        <LineChartOutlined />
                        Overall Hospital Occupancy
                      </Space>
                    }
                    extra={
                      <Tag color={stats.occupancyRate >= 80 ? "red" : stats.occupancyRate >= 60 ? "orange" : "green"}>
                        {Math.round(stats.occupancyRate)}% Occupied
                      </Tag>
                    }
                  >
                    <Progress
                      percent={Math.round(stats.occupancyRate)}
                      status={
                        stats.occupancyRate >= 90
                          ? "exception"
                          : stats.occupancyRate >= 80
                            ? "active"
                            : "normal"
                      }
                      strokeColor={{
                        '0%': '#108ee9',
                        '50%': '#87d068',
                        '100%': '#ff4d4f',
                      }}
                    />
                  </Card>

                  {/* Filters and Search */}
                  <Card>
                    <div className="flex flex-wrap gap-4 items-center mb-4">
                      <Input.Search
                        placeholder="🔍 Search wards by name, type, or specialization..."
                        allowClear
                        onSearch={handleSearch}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                        size="large"
                      />
                      {/* <Select
                        value={filterType}
                        style={{ width: 200 }}
                        onChange={handleTypeFilter}
                        placeholder={
                          <Space>
                            <FilterOutlined />
                            Filter by type
                          </Space>
                        }
                        size="large"
                      >
                        <Option value="all">
                          <Space>
                            <AppstoreOutlined />
                            All Types
                          </Space>
                        </Option>
                        {[...new Set(wards.map(w => w.type))].map(type => (
                          <Option key={type} value={type}>
                            <Space>
                              {getWardIcon(type)}
                              {type}
                            </Space>
                          </Option>
                        ))}
                      </Select>
                      <Select
                        value={sortOrder}
                        style={{ width: 200 }}
                        onChange={setSortOrder}
                        placeholder={
                          <Space>
                            <SortAscendingOutlined />
                            Sort by
                          </Space>
                        }
                        size="large"
                      >
                        <Option value="name">Name</Option>
                        <Option value="capacity">Capacity</Option>
                      </Select> */}
                      <Space>
                        <Button icon={<ReloadOutlined />} onClick={handleResetData}>
                          Reset Data
                        </Button>
                        {/* <Button icon={<ExportOutlined />} onClick={handleExportData}>
                          Export
                        </Button> */}
                        {/* <Button
                          icon={<CloudDownloadOutlined />}
                          type="primary"
                          ghost
                          onClick={() => setDrawerVisible(true)}
                        >
                          Quick Actions
                        </Button> */}
                      </Space>
                    </div>
                  </Card>

                  {/* Wards Table */}
                  <Card
                    title={
                      <Space>
                        <BellOutlined />
                        Ward Details ({wards.length} wards)
                      </Space>
                    }
                    extra={
                      <Badge count={wards.length} showZero color="#1890ff" />
                    }
                  >
                    {tableLoading ? (
                      <TableSkeleton />
                    ) : wards.length > 0 ? (
                      <Table
                        columns={columns}
                        dataSource={wards}
                        rowKey="id"
                        loading={tableLoading}
                        scroll={{ x: 1200 }}
                        onChange={handleTableChange}
                        pagination={{
                          pageSize: 10,
                          showSizeChanger: true,
                          showQuickJumper: true,
                          showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} wards`,
                        }}
                      />
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No wards found matching your criteria"
                      >
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => setModalVisible(true)}
                        >
                          Add New Ward
                        </Button>
                      </Empty>
                    )}
                  </Card>
                </div>
              ),
            },
            // {
            //   key: "activities",
            //   label: (
            //     <Space>
            //       <BellOutlined />
            //       Activities
            //       <Badge count={activities.length} overflowCount={99} />
            //     </Space>
            //   ),
            //   children: (
            //     <Card>
            //       {activities.length > 0 ? (
            //         <Timeline>
            //           {activities.map(activity => (
            //             <Timeline.Item
            //               key={activity.id}
            //               dot={getStatusIcon(activity.action === 'CREATE' ? 'available' : activity.action === 'DELETE' ? 'full' : 'critical')}
            //               color={
            //                 activity.action === 'CREATE' ? 'green' :
            //                   activity.action === 'DELETE' ? 'red' : 'blue'
            //               }
            //             >
            //               <Space direction="vertical" size={0}>
            //                 <div style={{ fontWeight: 'bold' }}>
            //                   {activity.action} - {activity.details}
            //                 </div>
            //                 <div style={{ color: '#666', fontSize: '12px' }}>
            //                   <ClockCircleOutlined /> {new Date(activity.timestamp).toLocaleString()} •
            //                   By: {activity.user}
            //                 </div>
            //               </Space>
            //             </Timeline.Item>
            //           ))}
            //         </Timeline>
            //       ) : (
            //         <Empty description="No activities recorded">
            //           <Button icon={<SyncOutlined />} onClick={() => getWards()}>
            //             Refresh Data
            //           </Button>
            //         </Empty>
            //       )}
            //     </Card>
            //   ),
            // },
          ]}
        />

        {/* Enhanced Add/Edit Ward Modal */}
        <Modal
          title={
            <Space>
              {editingWard ? <EditOutlined /> : <PlusOutlined />}
              {editingWard ? "Edit Ward" : "Add New Ward"}
            </Space>
          }
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingWard(null);
            form.resetFields();
          }}
          onOk={() => form.submit()}
          okText={editingWard ? "Update Ward" : "Add Ward"}
          width={700}
          destroyOnClose
          styles={{
            body: { padding: '24px' }
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddEditWard}
            initialValues={{ capacity: 10, occupied: 0, rating: 3 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label={
                    <Space>
                      <FileTextOutlined />
                      Ward Name
                    </Space>
                  }
                  rules={[{ required: true, message: "Please enter ward name" }]}
                >
                  <Input
                    placeholder="Enter ward name (e.g., General Ward A)"
                    prefix={<ItalicOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="ward_type"
                  label={
                    <Space>
                      <AppstoreOutlined />
                      Ward Type
                    </Space>
                  }
                  rules={[{ required: true, message: "Please select ward type" }]}
                >
                  <Select placeholder="Select ward type">
                    <Option value="General">
                      <Space>
                        <ItalicOutlined />
                        General Ward
                      </Space>
                    </Option>
                    <Option value="ICU">
                      <Space>
                        <ExperimentOutlined />
                        ICU
                      </Space>
                    </Option>
                    <Option value="Private">
                      <Space>
                        <CrownOutlined />
                        Private Room
                      </Space>
                    </Option>
                    <Option value="Pediatric">
                      <Space>
                        <HeartOutlined />
                        Pediatric Ward
                      </Space>
                    </Option>
                    <Option value="Maternity">
                      <Space>
                        <TeamOutlined />
                        Maternity Ward
                      </Space>
                    </Option>
                    <Option value="Surgical">
                      <Space>
                        <MedicineBoxOutlined />
                        Surgical Ward
                      </Space>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="department_id"
                  label={
                    <Space>
                      <AppstoreOutlined />
                      Department
                    </Space>
                  }
                  rules={[{ required: true, message: "Please select department" }]}
                >
                  <Select placeholder="Select department">
                    {departments.map((department) => (
                      <Option key={department.id} value={department.id}>
                        <Space>
                          <ItalicOutlined />
                          {department.name}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="capacity"
                  label={
                    <Space>
                      <BellOutlined />
                      Total Capacity
                    </Space>
                  }
                  rules={[{ required: true, message: "Please enter capacity" }]}
                >
                  <InputNumber
                    min={1}
                    max={1000}
                    placeholder="Total beds"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="location"
                  label={
                    <Space>
                      <EnvironmentOutlined />
                      Location
                    </Space>
                  }
                >
                  <Input placeholder="Building and floor location" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="phone_no"
                  label={
                    <Space>
                      <PhoneOutlined />
                      Phone
                    </Space>
                  }
                >
                  <Input placeholder="Ward phone number" prefix={<PhoneOutlined />} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label={
                    <Space>
                      <MailOutlined />
                      Email
                    </Space>
                  }
                >
                  <Input placeholder="Ward email" prefix={<MailOutlined />} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="rating"
                  label={
                    <Space>
                      <StarOutlined />
                      Rating
                    </Space>
                  }
                >
                  <Rate character={<StarOutlined />} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="specialization"
              label={
                <Space>
                  <SafetyCertificateOutlined />
                  Specialization
                </Space>
              }
            >
              <Input placeholder="Medical specialization" />
            </Form.Item>

            <Form.Item
              name="description"
              label={
                <Space>
                  <FileTextOutlined />
                  Description
                </Space>
              }
            >
              <Input.TextArea
                placeholder="Enter detailed ward description, facilities, and special features"
                rows={3}
              />
            </Form.Item>

            <Form.Item
              name="notes"
              label={
                <Space>
                  <InfoCircleOutlined />
                  Additional Notes
                </Space>
              }
            >
              <Input.TextArea
                placeholder="Any additional notes or important information"
                rows={2}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Enhanced View Ward Details Modal */}
        <Modal
          title={
            <Space>
              <EyeOutlined />
              Ward Details: {viewingWard?.name}
            </Space>
          }
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setViewModalVisible(false)}>
              Close
            </Button>,
          ]}
          width={600}
        >
          {viewingWard && (
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label={<Space><ItalicOutlined />Ward Name</Space>}>
                <Space>
                  {getWardIcon(viewingWard.type)}
                  {viewingWard.name}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label={<Space><AppstoreOutlined />Type & Specialization</Space>}>
                <Space direction="vertical" size={0}>
                  <Tag icon={getWardIcon(viewingWard.type)} color="blue">
                    {viewingWard.type}
                  </Tag>
                  {viewingWard.specialization && (
                    <div style={{ marginTop: '4px' }}>{viewingWard.specialization}</div>
                  )}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label={<Space><BellOutlined />Capacity & Occupancy</Space>}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <strong>{(viewingWard.beds ?? []).filter((bed) => bed.status === 'OCCUPIED').length}</strong> / <strong>{viewingWard.capacity}</strong> beds occupied
                  </div>
                  <Progress
                    percent={Math.round(((viewingWard.beds ?? []).filter((bed) => bed.status === 'OCCUPIED').length / viewingWard.capacity) * 100)}
                    status={
                      viewingWard.capacity === (viewingWard.beds ?? []).filter((bed) => bed.status === 'OCCUPIED').length
                        ? "exception"
                        : "normal"
                    }
                  />
                  <div>
                    <Tag color={viewingWard.status === "ACTIVE" ? "green" : "red"}>
                      {getStatusIcon(viewingWard.status)}
                      {viewingWard.status}
                    </Tag>
                  </div>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label={<Space><EnvironmentOutlined />Location</Space>}>
                {viewingWard.location || "Not specified"}
              </Descriptions.Item>

              {viewingWard.description && (
                <Descriptions.Item label={<Space><FileTextOutlined />Description</Space>}>
                  {viewingWard.description}
                </Descriptions.Item>
              )}

              {viewingWard.notes && (
                <Descriptions.Item label={<Space><InfoCircleOutlined />Notes</Space>}>
                  {viewingWard.notes}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
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
                <Button icon={<SyncOutlined />} block onClick={handleResetData}>
                  Refresh Data
                </Button>
              </Space>
            </Card>

            <Card size="small" title="Ward Operations">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  icon={<PlusOutlined />}
                  type="primary"
                  block
                  onClick={() => {
                    setDrawerVisible(false);
                    setModalVisible(true);
                  }}
                >
                  Add New Ward
                </Button>
                <Button icon={<TeamOutlined />} block>
                  Assign Staff
                </Button>
                <Button icon={<BarChartOutlined />} block>
                  View Analytics
                </Button>
              </Space>
            </Card>
          </Space>
        </Drawer>

        {/* Floating Action Button */}
        <FloatButton.Group
          shape="circle"
          style={{ right: 24 }}
          icon={<ThunderboltOutlined />}
        >
          <FloatButton
            icon={<PlusOutlined />}
            tooltip="Add Ward"
            onClick={() => setModalVisible(true)}
          />
          <FloatButton
            icon={<SyncOutlined />}
            tooltip="Refresh"
            onClick={() => getWards()}
          />
          <FloatButton
            icon={<SettingOutlined />}
            tooltip="Settings"
            onClick={() => setDrawerVisible(true)}
          />
          <FloatButton.BackTop visibilityHeight={0} />
        </FloatButton.Group>
      </div>
    </Watermark>
  );
}