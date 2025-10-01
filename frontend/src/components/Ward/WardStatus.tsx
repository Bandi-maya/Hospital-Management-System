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
} from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import { DefaultOptionType } from "antd/es/select";
import { getApi, PostApi, PutApi } from "@/ApiService";
import { toast } from "sonner";

const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;

interface Ward {
  id: string;
  name: string;
  type: string;
  capacity: number;
  occupied: number;
  description?: string;
  status: "available" | "full" | "critical";
  location?: string;
  phone?: string;
  email?: string;
  headNurse?: string;
  specialization?: string;
  equipment?: string[];
  rating?: number;
  lastCleaned?: string;
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
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("name");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [form] = Form.useForm();
  const [data, setData] = useState()
  const [departments, setDepartments] = useState([])

  // Enhanced initial data with more details
  const initialWards: Ward[] = [
    {
      id: uuidv4(),
      name: "General Ward A",
      type: "General",
      capacity: 20,
      occupied: 15,
      description: "General purpose ward for stable patients with basic medical care facilities",
      status: "available",
      location: "Building A, Floor 2",
      phone: "+1-555-0101",
      email: "ward-a@hospital.com",
      headNurse: "Sarah Johnson",
      specialization: "General Medicine",
      equipment: ["Patient Monitors", "IV Stands", "Emergency Cart"],
      rating: 4,
      lastCleaned: "2024-01-15 08:30",
      notes: "Regular maintenance scheduled weekly"
    },
    {
      id: uuidv4(),
      name: "ICU Unit 1",
      type: "ICU",
      capacity: 10,
      occupied: 10,
      description: "Intensive Care Unit equipped with advanced life support systems",
      status: "full",
      location: "Emergency Wing, Floor 1",
      phone: "+1-555-0102",
      email: "icu-1@hospital.com",
      headNurse: "Dr. Michael Chen",
      specialization: "Critical Care",
      equipment: ["Ventilators", "Defibrillators", "Vital Monitors", "Infusion Pumps"],
      rating: 5,
      lastCleaned: "2024-01-15 06:00",
      notes: "High priority unit - strict hygiene protocols"
    },
    {
      id: uuidv4(),
      name: "Private Suite 101",
      type: "Private",
      capacity: 1,
      occupied: 0,
      description: "Luxury private suite with premium amenities and personalized care",
      status: "available",
      location: "VIP Wing, Floor 3",
      phone: "+1-555-0103",
      email: "suite-101@hospital.com",
      headNurse: "Emma Wilson",
      specialization: "Executive Healthcare",
      equipment: ["Smart TV", "Private Bathroom", "Visitor Lounge"],
      rating: 5,
      lastCleaned: "2024-01-15 10:00",
      notes: "Available for immediate admission"
    },
    {
      id: uuidv4(),
      name: "Pediatric Ward B",
      type: "Pediatric",
      capacity: 15,
      occupied: 12,
      description: "Child-friendly ward with specialized pediatric care",
      status: "critical",
      location: "Children's Wing, Floor 2",
      phone: "+1-555-0104",
      email: "pediatric-b@hospital.com",
      headNurse: "Lisa Rodriguez",
      specialization: "Pediatrics",
      equipment: ["Child Monitors", "Play Area", "Parent Accommodation"],
      rating: 4,
      lastCleaned: "2024-01-14 16:00",
      notes: "Colorful decor to comfort children"
    },
    {
      id: uuidv4(),
      name: "Maternity Suite",
      type: "Maternity",
      capacity: 8,
      occupied: 6,
      description: "Specialized care for expecting mothers and newborns",
      status: "available",
      location: "Maternity Wing, Floor 4",
      phone: "+1-555-0105",
      email: "maternity@hospital.com",
      headNurse: "Dr. Amanda Smith",
      specialization: "Obstetrics & Gynecology",
      equipment: ["Baby Incubators", "Delivery Beds", "Neonatal Monitors"],
      rating: 5,
      lastCleaned: "2024-01-15 07:30",
      notes: "24/7 neonatal specialist available"
    }
  ];

  function getWards() {
    setLoading(true);
    getApi("/wards")
      .then((data) => {
        if (!data.error) {
          setData(data)
        }
        else {
          toast.error(data.error)
        }
      }).catch((err) => {
        console.error("Error: ", err)
        toast.error("Error occurred while getting the wards.")
      })
      .finally(() => setLoading(false));
  }
  function getDepartments() {
    setLoading(true);
    getApi("/departments")
      .then((data) => {
        if (!data.error) {
          setDepartments(data)
        }
        else {
          toast.error(data.error)
        }
      }).catch((err) => {
        console.error("Error: ", err)
        toast.error("Error occurred while getting the departments.")
      })
      .finally(() => setLoading(false));
  }

  // Load data from localStorage
  useEffect(() => {
    getWards()
    getDepartments()
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        getWards();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

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
      PutApi("/wards", wardData)
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
    const ward = wards.find(w => w.id === wardId);
    const updatedWards = wards.filter((w) => w.id !== wardId);
    saveWards(updatedWards);
    if (ward) {
      logActivity("DELETE", wardId, `Deleted ward: ${ward.name}`);
    }
    message.success("🗑️ Ward deleted successfully!");
  };

  const handleResetData = () => {
    saveWards(initialWards);
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

  const filteredAndSortedWards = (data ?? [])
    .filter(ward => {
      const matchesSearch = searchText === "" ||
        ward.name.toLowerCase().includes(searchText.toLowerCase()) ||
        ward.type.toLowerCase().includes(searchText.toLowerCase()) ||
        ward.specialization?.toLowerCase().includes(searchText.toLowerCase());
      const matchesType = filterType === "all" || ward.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "name": return a.name.localeCompare(b.name);
        case "capacity": return b.capacity - a.capacity;
        // case "occupied": return b.occupied - a.occupied;
        // case "rating": return (b.rating || 0) - (a.rating || 0);
        default: return 0;
      }
    });

  // Statistics calculations
  const stats = {
    totalWards: wards.length,
    totalCapacity: wards.reduce((sum, ward) => sum + ward.capacity, 0),
    totalOccupied: wards.reduce((sum, ward) => sum + ward.occupied, 0),
    availableBeds: wards.reduce((sum, ward) => sum + (ward.capacity - ward.occupied), 0),
    occupancyRate: wards.reduce((sum, ward) => sum + ward.capacity, 0) > 0 ?
      (wards.reduce((sum, ward) => sum + ward.occupied, 0) / wards.reduce((sum, ward) => sum + ward.capacity, 0)) * 100 : 0,
    criticalWards: wards.filter(ward => ward.status === 'critical').length,
    fullWards: wards.filter(ward => ward.status === 'full').length
  };

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
            <BellOutlined /> {record.occupied}/{capacity}
          </div>
          <Progress
            percent={Math.round((record.occupied / capacity) * 100)}
            size="small"
            showInfo={false}
          />
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <TeamOutlined />
          Head Nurse
        </Space>
      ),
      key: "nurse",
      render: (record: Ward) => (
        <Space>
          <UserOutlined />
          {record.headNurse || "Not assigned"}
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <StarOutlined />
          Rating
        </Space>
      ),
      key: "rating",
      render: (record: Ward) => (
        <Rate
          disabled
          value={record.rating}
          character={<StarOutlined />}
          style={{ fontSize: '14px' }}
        />
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
            record.status === "available" ? "green" :
              record.status === "critical" ? "orange" : "red"
          }>
            {/* {record.status.toUpperCase()} */}
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
        <Space>
          <Tooltip title="View Details">
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
          </Tooltip>
          <Tooltip title="Edit Ward">
            <Button
              icon={<EditOutlined />}
              shape="circle"
              onClick={() => {
                setEditingWard(record);
                form.setFieldsValue(record);
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete Ward">
            <Popconfirm
              title="Are you sure to delete this ward?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
              icon={<WarningOutlined style={{ color: 'red' }} />}
            >
              <Button icon={<DeleteOutlined />} shape="circle" danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  function handleSearch(
    value: string,
    event?: React.MouseEvent<HTMLElement> | React.ChangeEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>,
    info?: { source?: "input" | "clear" }
  ): void {
    throw new Error("Function not implemented.");
  }

  function handleTypeFilter(value: string, option?: DefaultOptionType | DefaultOptionType[]): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="p-6 space-y-6" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Enhanced Header */}
      <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <div className="flex justify-between items-center">
          <div>
            <Space size="large">
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>
                <ItalicOutlined style={{ fontSize: '32px' }} />
              </div>
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
          </Space>
        </div>
      </Card>

      {/* Enhanced Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title={<Space><ItalicOutlined /> Total Wards</Space>}
              value={stats.totalWards}
              prefix={<InfoCircleOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title={<Space><BellOutlined /> Total Capacity</Space>}
              value={stats.totalCapacity}
              suffix="beds"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title={<Space><TeamOutlined /> Occupied Beds</Space>}
              value={stats.totalOccupied}
              suffix="beds"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title={<Space><CheckCircleOutlined /> Available Beds</Space>}
              value={stats.availableBeds}
              suffix="beds"
              valueStyle={{ color: stats.availableBeds > 0 ? '#52c41a' : '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title={<Space><WarningOutlined /> Critical Wards</Space>}
              value={stats.criticalWards}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title={<Space><CloseCircleOutlined /> Full Wards</Space>}
              value={stats.fullWards}
              valueStyle={{ color: '#f5222d' }}
            />
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
                    <Search
                      placeholder="🔍 Search wards by name, type, or specialization..."
                      allowClear
                      onSearch={handleSearch}
                      onChange={(e) => setSearchText(e.target.value)}
                      style={{ width: 300 }}
                      size="large"
                    />
                    <Select
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
                      <Option value="occupied">Occupied</Option>
                      <Option value="rating">Rating</Option>
                    </Select>
                    <Space>
                      <Button icon={<ReloadOutlined />} onClick={handleResetData}>
                        Reset Data
                      </Button>
                      <Button icon={<ExportOutlined />} onClick={handleExportData}>
                        Export
                      </Button>
                    </Space>
                  </div>
                </Card>

                {/* Wards Table */}
                <Card
                  title={
                    <Space>
                      <BellOutlined />
                      Ward Details ({filteredAndSortedWards.length} wards)
                    </Space>
                  }
                  extra={
                    <Badge count={filteredAndSortedWards.length} showZero color="#1890ff" />
                  }
                >
                  <Table
                    columns={columns}
                    dataSource={filteredAndSortedWards}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 1200 }}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} wards`,
                    }}
                  />
                </Card>
              </div>
            ),
          },
          {
            key: "activities",
            label: (
              <Space>
                <BellOutlined />
                Activities
                <Badge count={activities.length} overflowCount={99} />
              </Space>
            ),
            children: (
              <Card>
                <Timeline>
                  {activities.length > 0 ? activities.map(activity => (
                    <Timeline.Item
                      key={activity.id}
                      dot={getStatusIcon(activity.action === 'CREATE' ? 'available' : activity.action === 'DELETE' ? 'full' : 'critical')}
                      color={
                        activity.action === 'CREATE' ? 'green' :
                          activity.action === 'DELETE' ? 'red' : 'blue'
                      }
                    >
                      <Space direction="vertical" size={0}>
                        <div style={{ fontWeight: 'bold' }}>
                          {activity.action} - {activity.details}
                        </div>
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          <ClockCircleOutlined /> {new Date(activity.timestamp).toLocaleString()} •
                          By: {activity.user}
                        </div>
                      </Space>
                    </Timeline.Item>
                  )) : (
                    <Empty description="No activities recorded" />
                  )}
                </Timeline>
              </Card>
            ),
          },
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
            <Col span={12}>
              <Form.Item
                name="department_id"
                label={
                  <Space>
                    <AppstoreOutlined />
                    Department
                  </Space>
                }
                rules={[{ required: true, message: "Please select ward type" }]}
              >
                <Select placeholder="Select ward type">
                  {
                    departments.map((department) => {
                      return <Option value={department.id}>
                        <Space>
                          <ItalicOutlined />
                          {department.name}
                        </Space>
                      </Option>
                    })
                  }
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
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
            <Col span={8}>
              <Form.Item
                name="occupied"
                label={
                  <Space>
                    <TeamOutlined />
                    Occupied Beds
                  </Space>
                }
                dependencies={['capacity']}
                rules={[
                  { required: true, message: "Please enter occupied beds" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const capacity = getFieldValue('capacity');
                      if (value == null || (capacity && value <= capacity)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Occupied beds cannot exceed capacity'));
                    },
                  }),
                ]}
              >
                <InputNumber
                  min={0}
                  placeholder="Occupied beds"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
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
                name="headNurse"
                label={
                  <Space>
                    <UserOutlined />
                    Head Nurse
                  </Space>
                }
              >
                <Input placeholder="Head nurse name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
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
          //   <Button
          //     key="edit"
          //     type="primary"
          //     onClick={() => {
          //       setViewModalVisible(false);
          //       if (viewingWard) {
          //         setEditingWard(viewingWard);
          //         form.setFieldsValue(viewingWard);
          //         setModalVisible(true);
          //       }
          //     }}
          //   >
          //     <EditOutlined /> Edit This Ward
          //   </Button>,
        ]}
        width={600}
      >
        {viewingWard && (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label={
              <Space>
                <ItalicOutlined />
                Ward Name
              </Space>
            }>
              <Space>
                {getWardIcon(viewingWard.type)}
                {viewingWard.name}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label={
              <Space>
                <AppstoreOutlined />
                Type & Specialization
              </Space>
            }>
              <Space direction="vertical" size={0}>
                <Tag icon={getWardIcon(viewingWard.type)} color="blue">
                  {viewingWard.type}
                </Tag>
                {viewingWard.specialization && (
                  <div style={{ marginTop: '4px' }}>{viewingWard.specialization}</div>
                )}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label={
              <Space>
                <BellOutlined />
                Capacity & Occupancy
              </Space>
            }>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <strong>{viewingWard.occupied}</strong> / <strong>{viewingWard.capacity}</strong> beds occupied
                </div>
                <Progress
                  percent={Math.round((viewingWard.occupied / viewingWard.capacity) * 100)}
                  status={
                    viewingWard.status === "full"
                      ? "exception"
                      : viewingWard.status === "critical"
                        ? "active"
                        : "normal"
                  }
                />
                <div>
                  <Tag color={viewingWard.status === "available" ? "green" : viewingWard.status === "critical" ? "orange" : "red"}>
                    {getStatusIcon(viewingWard.status)}
                    {viewingWard.status.toUpperCase()}
                  </Tag>
                </div>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label={
              <Space>
                <UserOutlined />
                Staff Information
              </Space>
            }>
              <div>
                <div><strong>Head Nurse:</strong> {viewingWard.headNurse || "Not assigned"}</div>
                {viewingWard.phone && (
                  <div>
                    <PhoneOutlined /> <strong>Phone:</strong> {viewingWard.phone}
                  </div>
                )}
                {viewingWard.email && (
                  <div>
                    <MailOutlined /> <strong>Email:</strong> {viewingWard.email}
                  </div>
                )}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label={
              <Space>
                <EnvironmentOutlined />
                Location
              </Space>
            }>
              {viewingWard.location || "Not specified"}
            </Descriptions.Item>

            <Descriptions.Item label={
              <Space>
                <StarOutlined />
                Rating
              </Space>
            }>
              <Rate disabled value={viewingWard.rating} character={<StarOutlined />} />
            </Descriptions.Item>

            {viewingWard.description && (
              <Descriptions.Item label={
                <Space>
                  <FileTextOutlined />
                  Description
                </Space>
              }>
                {viewingWard.description}
              </Descriptions.Item>
            )}

            {viewingWard.notes && (
              <Descriptions.Item label={
                <Space>
                  <InfoCircleOutlined />
                  Notes
                </Space>
              }>
                {viewingWard.notes}
              </Descriptions.Item>
            )}

            {viewingWard.lastCleaned && (
              <Descriptions.Item label={
                <Space>
                  <CalendarOutlined />
                  Last Cleaned
                </Space>
              }>
                {new Date(viewingWard.lastCleaned).toLocaleString()}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}