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
  Flex
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
  ClusterOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { toast } from "sonner";
import { DeleteApi, getApi, PostApi, PutApi } from "@/ApiService";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

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
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState("departments");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [form] = Form.useForm();

  const loadData = () => {
    setIsLoading(true);
    getApi('/departments')
      .then((data) => {
        if (!data.error) {
          setDepartments(data);
        } else {
          toast.error(data.error);
        }
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
        toast.error("Failed to fetch departments");
      }).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadData()
        message.info("🔄 Auto-refresh: Department data reloaded");
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

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
    // totalDoctors: departments.reduce((acc, d) => acc + (d.doctorCount || 0), 0),
    // totalPatients: departments.reduce((acc, d) => acc + (d.patientCount || 0), 0)
  };

  // UI Helpers
  const getStatusColor = (status: string) => ({ 'ACTIVE': 'green', 'INACTIVE': 'red' }[status] || 'default');
  const getStatusIcon = (status: string) => ({ 'Active': <CheckCircleOutlined />, 'Inactive': <CloseCircleOutlined /> }[status]);

  const filteredDepartments = departments.filter((department) => {
    const matchesSearch = searchText === "" ||
      department.name.toLowerCase().includes(searchText.toLowerCase()) ||
      department.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === "all" || department.is_active === (statusFilter === "ACTIVE");
    return matchesSearch && matchesStatus;
  });

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
              {/* <TeamOutlined /> {record.doctorCount || 0} doctors •
              <UserOutlined style={{ marginLeft: '8px' }} /> {record.patientCount || 0} patients */}
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
          <Tag color={getStatusColor(record.is_active ? "ACTIVE" : "INACTIVE")} icon={getStatusIcon(record.is_active ? "ACTIVE" : "INACTIVE")} style={{ fontWeight: 'bold' }}>
            {record.is_active ? "ACTIVE" : "INACTIVE"}
          </Tag>
          {record.created_at && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              <CalendarOutlined /> Created: {dayjs(record.created_at).format('MMM D, YYYY')}
            </div>
          )}
          {record.updated_at && (
            <div style={{ fontSize: '12px', color: '#999' }}>
              Updated: {dayjs(record.updated_at).fromNow()}
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
          <Tooltip title="Edit Department">
            <Button icon={<EditOutlined />} shape="circle" onClick={() => handleOpenModal(record)} />
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
              <Button disabled icon={<DeleteOutlined />} shape="circle" danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)', color: 'white' }}>
        <Flex justify="space-between" align="center">
          <div>
            <Space size="large">
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '10px' }}>
                <BuildOutlined style={{ fontSize: '36px' }} />
              </div>
              <div>
                <Title level={2} style={{ color: 'white', margin: 0 }}>🏥 Department Management</Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}><DashboardOutlined /> Manage hospital departments and specialties</Text>
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
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><BuildOutlined /> Total Departments</Space>} value={stats.total} valueStyle={{ color: '#ff6b6b' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><CheckCircleOutlined /> Active</Space>} value={stats.active} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><TeamOutlined /> Total Doctors</Space>} value={stats.totalDoctors} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><UserOutlined /> Total Patients</Space>} value={stats.totalPatients} valueStyle={{ color: '#722ed1' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><ClockCircleOutlined /> Recent Added</Space>} value={stats.recentAdded} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><DashboardOutlined /> Utilization</Space>} value={Math.round((stats.active / (stats.total || 1)) * 100)} suffix="%" valueStyle={{ color: '#36cfc9' }} /></Card></Col>
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
                <Input
                  placeholder="🔍 Search departments, descriptions..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                  size="large"
                />
                <Select value={statusFilter} onChange={setStatusFilter} placeholder="Filter by Status" style={{ width: 150 }} size="large">
                  <Option value="all">All Status</Option>
                  <Option value="ACTIVE">Active</Option>
                  <Option value="INACTIVE">Inactive</Option>
                </Select>
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={() => { setSearchText(''); setStatusFilter('all'); }}>Reset</Button>
                  <Button icon={<ExportOutlined />}>Export</Button>
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
              <Table
                columns={columns}
                dataSource={filteredDepartments}
                rowKey="id"
                loading={isLoading}
                scroll={{ x: 800 }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} departments`,
                }}
              />
            </Card>
          </div>
        </Tabs.TabPane>

        <Tabs.TabPane key="activity" tab={<Space><DashboardOutlined /> Department Analytics</Space>}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="Department Distribution">
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
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Recent Department Activity">
                <Timeline>
                  {departments.slice(0, 5).map(department => (
                    <Timeline.Item
                      key={department.id}
                      color={getStatusColor(department.is_active ? "ACTIVE" : "INACTIVE")}
                      dot={getStatusIcon(department.is_active ? "ACTIVE" : "INACTIVE")}
                    >
                      <Space direction="vertical" size={0}>
                        <div style={{ fontWeight: 'bold' }}>{department.name}</div>
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          {department.description}
                        </div>
                        <div style={{ color: '#999', fontSize: '12px' }}>
                          {/* <TeamOutlined /> {department.doctorCount || 0} doctors •
                          <UserOutlined style={{ marginLeft: '8px' }} /> {department.patientCount || 0} patients */}
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
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Department Name"
                rules={[{ required: true, message: "Please enter department name" }]}
              >
                <Input prefix={<BuildOutlined />} placeholder="Enter department name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select status">
                  <Option value="ACTIVE">Active</Option>
                  <Option value="INACTIVE">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter department description" }]}
          >
            <TextArea
              rows={3}
              placeholder="Enter detailed description of this department and its services"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}