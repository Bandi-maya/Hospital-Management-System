import React, { useState, useEffect } from "react";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import {
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Tooltip,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Popconfirm,
  InputNumber,
  Alert,
  Descriptions,
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
  Breadcrumb,
  DatePicker,
  TimePicker,
  Calendar
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  UserOutlined,
  TeamOutlined,
  ItalicOutlined,
  BellOutlined,
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
import { getApi, PostApi, PutApi, DeleteApi } from "@/ApiService";
import { Ward } from "./WardStatus";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { useToken } = theme;
const { Step } = Steps;

// TypeScript Interfaces
interface Bed {
  id: number;
  bed_no: number;
  status: string;
}

interface Insurance {
  policyNumber: string;
  provider: string;
  coverageAmount: string;
  expiryDate: string;
}

interface Patient {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

interface WardAllocation {
  id: number;
  patient_name: string;
  ward_id: number;
  ward: Ward;
  bed_no: number;
  admission_date: string;
  status: "ACTIVE" | "DISCHARGED";
  price?: number;
  insurance?: Insurance;
  patient?: Patient;
  bed_id?: number;
}

interface ModalInfo {
  type: "add" | "edit" | "insurance" | null;
  record: WardAllocation | null;
}

interface Stats {
  totalAllocations: number;
  activeAllocations: number;
  dischargedAllocations: number;
  occupancyRate: number;
  totalWards: number;
  averageStay: string;
}

interface Pagination {
  current: number;
  pageSize: number;
  total: number;
}

dayjs.extend(utc);
dayjs.extend(timezone);

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

export default function WardAllocations() {
  const [data, setData] = useState<WardAllocation[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [modalInfo, setModalInfo] = useState<ModalInfo>({
    type: null,
    record: null,
  });
  const [form] = Form.useForm();
  const { token } = useToken();

  const [searchText, setSearchText] = useState("");
  const [filterWard, setFilterWard] = useState<string>('all');
  const [status, setStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedBeds, setSelectedBeds] = useState<Bed[]>([]);
  const [activeTab, setActiveTab] = useState("allocations");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const handleTableChange = (newPagination: any) => {
    loadAllocations(newPagination.current, newPagination.pageSize);
  };

  const handleWardChange = (wardId: number) => {
    const selectedWard = wards.find((w) => w.id === wardId);
    setSelectedBeds((selectedWard?.beds || []).filter((bed) => bed.status === 'AVAILABLE'));
  };

  useEffect(() => {
    loadInitialData();
    loadPatients();
    loadAllocations();
  }, []);

  const loadInitialData = async () => {
    try {
      const wardRes = await getApi("/wards");
      if (!wardRes.error) {
        setWards(wardRes.data || []);
      } else {
        message.error(wardRes.error);
      }
    } catch (e) {
      console.error("Error loading wards:", e);
      message.error("Could not load wards");
    }
  };

  const loadPatients = async () => {
    try {
      const patientRes = await getApi("/users?user_type=PATIENT");
      if (!patientRes.error) {
        setPatients(patientRes.data || []);
      } else {
        message.error(patientRes.error);
      }
    } catch (e) {
      console.error("Error loading patients:", e);
      message.error("Could not load patients");
    }
  };

  const loadAllocations = async (
    page = 1,
    limit = 10,
    searchQuery = searchText,
    filterStatus = status,
    ward_id = filterWard
  ) => {
    setLoading(true);
    setTableLoading(true);
    setStatsLoading(true);
    try {
      const res = await getApi(
        `/ward-beds?page=${page}&limit=${limit}&q=${searchQuery}&status=${filterStatus === 'ALL' ? '' : filterStatus}&ward_id=${ward_id === 'all' ? '' : ward_id}`
      );
      if (!res.error) {
        setData(res.data?.filter((ward: WardAllocation) => ward.status !== "AVAILABLE") || []);
        setPagination(prev => ({
          ...prev,
          current: page,
          total: res.total_records || 0
        }));
      } else {
        message.error(res.error);
      }
    } catch (e) {
      console.error("Error loading allocations:", e);
      message.error("Could not load allocations");
    } finally {
      setLoading(false);
      setTableLoading(false);
      setStatsLoading(false);
    }
  };

  const showAddModal = () => {
    form.resetFields();
    setModalInfo({ type: "add", record: null });
  };

  const showEditModal = (record: WardAllocation) => {
    form.setFieldsValue({
      ...record,
      admission_date: dayjs(record.admission_date),
      patient_id: record.patient?.id,
      bed_id: record.id,
      ward_id: record.ward_id
    });
    setModalInfo({ type: "edit", record });
  };

  const showInsuranceModal = (record: WardAllocation) => {
    form.setFieldsValue({
      insurance: record.insurance || {},
    });
    setModalInfo({ type: "insurance", record });
  };

  const handleCancel = () => {
    setModalInfo({ type: null, record: null });
    form.resetFields();
  };

  const handleAdd = async (values: any) => {
    try {
      const payload = {
        ward_id: values.ward_id,
        bed_id: values.bed_id,
        patient_id: values.patient_id,
        admission_date: values.admission_date,
        bed_no: values.bed_no,
        price: values.price,
        status: "ACTIVE",
      };
      const res = await PostApi("/ward-beds", payload);
      if (!res.error) {
        message.success("Bed allocated successfully");
        loadAllocations();
        handleCancel();
      } else {
        message.error(res.error);
      }
    } catch (error) {
      console.error("Add error:", error);
      message.error("Failed to allocate bed");
    }
  };

  const handleUpdate = async () => {
    // try {
    const values = await form.validateFields();

    // if (modalInfo.type === "add") {
    //   await handleAdd(values);
    // } else if (modalInfo.type === "edit") {
    const payload = {
      id: values.bed_id,
      bed_no: values.bed_no,
      ward_id: values.ward_id,
      patient_id: values.patient_id,
      admission_date: dayjs.utc(values.admission_date).local().format('YYYY-MM-DD'),
      price: values.price,
      status: values.status,
    };
    const res = await PutApi("/ward-beds", payload);
    if (!res.error) {
      message.success("Allocation updated successfully");
      loadAllocations();
      handleCancel();
    } else {
      message.error(res.error);
    }
    //   // } 
    //   else if (modalInfo.type === "insurance") {
    //     const rec = modalInfo.record!;
    //     const payload: any = {
    //       id: rec.id,
    //     };
    //     if (values.insurance) {
    //       payload.insurance = values.insurance;
    //     }
    //     const res = await PutApi("/ward-beds", payload);
    //     if (!res.error) {
    //       message.success("Insurance updated successfully");
    //       loadAllocations();
    //       handleCancel();
    //     } else {
    //       message.error(res.error);
    //     }
    //   }
    // } catch (errorInfo) {
    //   console.log("Validation Failed:", errorInfo);
    // }
  };

  const handleDelete = async (record: WardAllocation) => {
    try {
      const res = await DeleteApi(`/ward-beds?id=${record.id}`);
      if (!res.error) {
        message.success("Allocation deleted successfully");
        loadAllocations();
      } else {
        message.error(res.error);
      }
    } catch (e) {
      console.error("Delete error:", e);
      message.error("Failed to delete allocation");
    }
  };

  // Statistics calculations
  const stats: Stats = {
    totalAllocations: data.length,
    activeAllocations: data.filter(item => item.status === "ACTIVE").length,
    dischargedAllocations: data.filter(item => item.status === "DISCHARGED").length,
    occupancyRate: data.length > 0 ? (data.filter(item => item.status === "ACTIVE").length / data.length) * 100 : 0,
    totalWards: [...new Set(data.map(item => item.ward_id))].length,
    averageStay: "7.2" // This would need actual calculation based on dates
  };

  // More actions menu
  const moreActionsMenu = (
    <Menu
      items={[
        {
          key: 'export',
          icon: <ExportOutlined />,
          label: 'Export Allocations',
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
          label: 'Allocation Settings',
        },
        {
          key: 'help',
          icon: <QuestionCircleOutlined />,
          label: 'Help & Support',
        },
      ]}
    />
  );

  const columns: ColumnsType<WardAllocation> = [
    {
      title: (
        <Space>
          <UserOutlined />
          Patient Information
        </Space>
      ),
      key: "patient",
      render: (record: WardAllocation) => (
        <Space>
          <Avatar size="large" icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
          <div>
            <div style={{ fontWeight: "bold" }}>{record.patient?.name || "N/A"}</div>
            {record.patient?.email && (
              <div style={{ fontSize: "12px", color: "#666" }}>
                <MailOutlined /> {record.patient.email}
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <ItalicOutlined />
          Ward & Bed
        </Space>
      ),
      key: "ward_bed",
      render: (record: WardAllocation) => (
        <Space direction="vertical" size={0}>
          <div style={{ fontWeight: "500" }}>
            <EnvironmentOutlined /> {record.ward?.name}
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            Bed #{record.bed_no}
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <CalendarOutlined />
          Admission Date
        </Space>
      ),
      dataIndex: "admission_date",
      key: "admission_date",
      render: (date: string) => (
        <Space direction="vertical" size={0}>
          <div style={{ fontWeight: "500" }}>
            {dayjs(date).format('MMM D, YYYY')}
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {dayjs(date).format('h:mm A')}
          </div>
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
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={status === "ACTIVE" ? "green" : "volcano"}
          icon={status === "ACTIVE" ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {status}
        </Tag>
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
      render: (_: any, rec: WardAllocation) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              shape="circle"
              type="primary"
              ghost
            />
          </Tooltip>
          <Tooltip title="Edit Allocation">
            <Button
              icon={<EditOutlined />}
              shape="circle"
              onClick={() => showEditModal(rec)}
            />
          </Tooltip>
          <Tooltip title="Delete Allocation">
            <Popconfirm
              title="Delete this allocation?"
              description="Are you sure you want to delete this bed allocation? This action cannot be undone."
              onConfirm={() => handleDelete(rec)}
              okText="Yes"
              cancelText="No"
              okType="danger"
              icon={<WarningOutlined style={{ color: "red" }} />}
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

  const filteredData = data.filter((item) => {
    const matchesSearch = item.patient?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.ward?.name?.toLowerCase().includes(searchText.toLowerCase());
    const matchesWard = filterWard === 'all' || item.ward_id.toString() === filterWard;
    const matchesStatus = status === 'ALL' || item.status === status;
    return matchesSearch && matchesWard && matchesStatus;
  });

  const getModalTitle = () => {
    switch (modalInfo.type) {
      case "add":
        return "Allocate New Bed";
      case "edit":
        return `Edit Allocation - ${modalInfo.record?.patient?.name}`;
      case "insurance":
        return `Insurance Details - ${modalInfo.record?.patient?.name}`;
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
        {/* Header Skeleton */}
        <CardSkeleton />

        {/* Statistics Skeleton */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => (
            <Col key={i} xs={24} sm={12} md={6}>
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
    <div style={{ padding: 24, minHeight: "100vh" }}>
      {/* Enhanced Header */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <Space size="large">
              <Avatar size={64} icon={<TeamOutlined />} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <div>
                <Title level={2} style={{ color: 'black', margin: 0 }}>
                  🏥 Ward Allocations Management
                </Title>
                <Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>
                  <DashboardOutlined /> Manage patient bed allocations and insurance details
                </Text>
              </div>
            </Space>
          </div>
          <Space>
            <Dropdown overlay={moreActionsMenu} placement="bottomRight">
              <Button icon={<SettingOutlined />} style={{ color: "black" }} size="large" ghost>
                Settings
              </Button>
            </Dropdown>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showAddModal}
              size="large"
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              <RocketOutlined /> Allocate Bed
            </Button>
          </Space>
        </div>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            {statsLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title="Total Allocations"
                value={stats.totalAllocations}
                prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            {statsLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title="Active Allocations"
                value={stats.activeAllocations}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            {statsLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title="Occupancy Rate"
                value={stats.occupancyRate}
                precision={1}
                suffix="%"
                prefix={<BarChartOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            {statsLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title="Wards Used"
                value={stats.totalWards}
                prefix={<ItalicOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1' }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Search and Filter Section */}
      <Card style={{ marginBottom: 24 }}>
        <div className="flex flex-wrap gap-4 items-center">
          <Input.Search
            placeholder="🔍 Search patients or wards..."
            prefix={<SearchOutlined />}
            value={searchText}
            onSearch={() => loadAllocations(pagination.current, pagination.pageSize, searchText)}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            size="large"
            allowClear
          />
          <Select
            placeholder={
              <Space>
                <FilterOutlined />
                Filter by Ward
              </Space>
            }
            style={{ width: 200 }}
            value={filterWard}
            allowClear
            onChange={(val) => {
              loadAllocations(pagination.current, pagination.pageSize, searchText, status, val)
              setFilterWard(val)
            }}
            size="large"
          >
            <Option key={'all'} value={'all'}>
              All
            </Option>
            {wards.map((w) => (
              <Option key={w.id} value={w.id.toString()}>
                <Space>
                  <ItalicOutlined />
                  {w.name}
                </Space>
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Status Filter"
            style={{ width: 150 }}
            value={status}
            allowClear
            onChange={(val) => {
              loadAllocations(pagination.current, pagination.pageSize, searchText, val, filterWard)
              setStatus(val)
            }}
            size="large"
          >
            <Option value="ALL">All</Option>
            <Option value="ACTIVE">Active</Option>
            <Option value="DISCHARGED">Discharged</Option>
          </Select>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => loadAllocations()}
              loading={tableLoading}
            >
              Refresh
            </Button>
            <Button
              icon={<CloudDownloadOutlined />}
              type="primary"
              ghost
              onClick={() => setDrawerVisible(true)}
            >
              Quick Actions
            </Button>
          </Space>
        </div>
      </Card>

      {/* Allocations Table */}
      <Card
        title={
          <Space>
            <BellOutlined />
            Bed Allocations
            <Badge count={filteredData.length} showZero color="#1890ff" />
          </Space>
        }
        extra={
          <Tag color={stats.occupancyRate > 80 ? "red" : stats.occupancyRate > 60 ? "orange" : "green"}>
            {Math.round(stats.occupancyRate)}% Occupied
          </Tag>
        }
      >
        {tableLoading ? (
          <TableSkeleton />
        ) : filteredData.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={tableLoading}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} allocations`,
            }}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No bed allocations found"
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showAddModal}
            >
              Allocate First Bed
            </Button>
          </Empty>
        )}
      </Card>

      {/* Allocation Modal */}
      <Modal
        title={getModalTitle()}
        open={!!modalInfo.type}
        onCancel={handleCancel}
        onOk={handleUpdate}
        width={700}
        destroyOnClose
        styles={{
          body: { padding: '24px' }
        }}
      >
        <Form form={form} layout="vertical" name="ward_alloc_form">
          {(modalInfo.type === "add" || modalInfo.type === "edit") && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="patient_id"
                    label={
                      <Space>
                        <UserOutlined />
                        Patient
                      </Space>
                    }
                    rules={[{ required: true, message: "Please select a patient" }]}
                  >
                    <Select
                      placeholder="Select patient"
                      size="large"
                      showSearch
                      optionFilterProp="children"
                    >
                      {patients
                        .filter(patient => !data.find(record => record?.patient?.id === patient.id && record.status === "ACTIVE"))
                        .map((patient) => (
                          <Option key={patient.id} value={patient.id}>
                            <Space>
                              <UserOutlined />
                              {patient.name}
                            </Space>
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="ward_id"
                    label={
                      <Space>
                        <ItalicOutlined />
                        Ward
                      </Space>
                    }
                    rules={[{ required: true, message: "Please select a ward" }]}
                  >
                    <Select
                      placeholder="Select ward"
                      size="large"
                      onChange={handleWardChange}
                    >
                      {wards.map((ward) => (
                        <Option key={ward.id} value={ward.id}>
                          <Space>
                            <ItalicOutlined />
                            {ward.name}
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="bed_id"
                    label={
                      <Space>
                        <BellOutlined />
                        Bed Number
                      </Space>
                    }
                    rules={[{ required: true, message: "Please select a bed" }]}
                  >
                    <Select placeholder="Select a bed" size="large">
                      {selectedBeds.map((bed) => (
                        <Option key={bed.id} value={bed.id}>
                          Bed #{bed.bed_no}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="price"
                    label={
                      <Space>
                        <MoneyCollectOutlined />
                        Price
                      </Space>
                    }
                    rules={[{ required: true, message: "Please enter price" }]}
                  >
                    <InputNumber
                      placeholder="Enter price"
                      style={{ width: '100%' }}
                      prefix="₹"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="admission_date"
                    label={
                      <Space>
                        <CalendarOutlined />
                        Admission Date
                      </Space>
                    }
                    rules={[{ required: true, message: "Please select admission date" }]}
                  >
                    <DatePicker style={{ width: '100%' }} size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    label={
                      <Space>
                        <DashboardOutlined />
                        Status
                      </Space>
                    }
                    initialValue="ACTIVE"
                  >
                    <Select size="large">
                      <Option value="ACTIVE">
                        <Space>
                          <CheckCircleOutlined />
                          Active
                        </Space>
                      </Option>
                      <Option value="DISCHARGED">
                        <Space>
                          <CloseCircleOutlined />
                          Discharged
                        </Space>
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          {modalInfo.type === "insurance" && (
            <>
              <Alert
                message="Insurance Information"
                description="Update the patient's insurance details"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={["insurance", "policyNumber"]}
                    label="Policy Number"
                  >
                    <Input prefix={<FileTextOutlined />} placeholder="Policy number" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={["insurance", "provider"]}
                    label="Provider"
                  >
                    <Input prefix={<SafetyCertificateOutlined />} placeholder="Insurance provider" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={["insurance", "coverageAmount"]}
                    label="Coverage Amount"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      prefix="₹"
                      placeholder="Coverage amount"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={["insurance", "expiryDate"]}
                    label="Expiry Date"
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
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
              <Button icon={<SyncOutlined />} block onClick={() => loadAllocations()}>
                Refresh Data
              </Button>
            </Space>
          </Card>

          <Card size="small" title="Allocation Operations">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                icon={<PlusOutlined />}
                type="primary"
                block
                onClick={() => {
                  setDrawerVisible(false);
                  showAddModal();
                }}
              >
                New Allocation
              </Button>
              <Button icon={<TeamOutlined />} block>
                Patient Management
              </Button>
              <Button icon={<BarChartOutlined />} block>
                View Analytics
              </Button>
            </Space>
          </Card>
        </Space>
      </Drawer>
    </div>
  );
}