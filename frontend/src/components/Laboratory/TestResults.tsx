import React, { useEffect, useState } from "react";
import { 
  Table, 
  Input, 
  Select, 
  Tag, 
  Button, 
  Space, 
  Form, 
  Modal, 
  Card,
  Tooltip,
  Popconfirm,
  message,
  Skeleton,
  Row,
  Col,
  Statistic,
  Badge,
  Descriptions,
  Divider
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { 
  SearchOutlined, 
  PlusOutlined, 
  EyeOutlined,
  ReloadOutlined,
  TeamOutlined,
  DashboardOutlined,
  UserOutlined,
  ExperimentOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  SyncOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileDoneOutlined
} from "@ant-design/icons";
import { toast } from "sonner";
import { getApi, PostApi, PutApi } from "@/ApiService";
import TextArea from "antd/es/input/TextArea";
import { motion } from "framer-motion";

const { Option } = Select;

// Skeleton Loader Components
const HeaderSkeleton = () => (
  <Card className="bg-white shadow-sm border-0">
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6">
      <div className="flex items-center space-x-3">
        <Skeleton.Avatar active size="large" />
        <div>
          <Skeleton.Input active size="large" style={{ width: 200 }} />
          <div className="mt-1">
            <Skeleton.Input active size="small" style={{ width: 250 }} />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
        <Skeleton.Button active size="small" style={{ width: 120 }} />
        <Skeleton.Button active size="small" style={{ width: 100 }} />
        <Skeleton.Button active size="small" style={{ width: 140 }} />
      </div>
    </div>
  </Card>
);

const StatsSkeleton = () => (
  <Row gutter={[16, 16]}>
    {[...Array(4)].map((_, index) => (
      <Col key={index} xs={24} sm={12} lg={6}>
        <Card className="text-center shadow-sm">
          <Skeleton.Input active size="large" style={{ width: 60, height: 32, margin: '0 auto' }} />
          <div className="mt-2">
            <Skeleton.Input active size="small" style={{ width: 80, margin: '0 auto' }} />
          </div>
        </Card>
      </Col>
    ))}
  </Row>
);

const TableSkeleton = () => (
  <Card className="shadow-md rounded-lg">
    <div className="p-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border-b animate-pulse">
          <Skeleton.Avatar active size="default" />
          <div className="flex-1 space-y-2">
            <Skeleton.Input active size="small" style={{ width: '60%' }} />
            <Skeleton.Input active size="small" style={{ width: '40%' }} />
          </div>
          <div className="space-y-2">
            <Skeleton.Input active size="small" style={{ width: 80 }} />
            <Skeleton.Input active size="small" style={{ width: 60 }} />
          </div>
          <Skeleton.Button active size="small" style={{ width: 120 }} />
        </div>
      ))}
    </div>
  </Card>
);

// Enhanced Action Button Component
const ActionButton = ({ 
  icon, 
  label, 
  onClick, 
  type = "default",
  danger = false,
  loading = false,
  disabled = false
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void;
  type?: "primary" | "default" | "dashed" | "link";
  danger?: boolean;
  loading?: boolean;
  disabled?: boolean;
}) => (
  <Tooltip title={label}>
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        type={type}
        danger={danger}
        icon={icon}
        loading={loading}
        onClick={onClick}
        disabled={disabled}
        className={`
          flex items-center justify-center 
          transition-all duration-200 ease-in-out
          w-10 h-10 rounded-full
          ${danger ? 'border-red-500 text-red-600 hover:bg-red-50' : ''}
          ${type === 'primary' ? '' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{
          minWidth: '40px'
        }}
      />
    </motion.div>
  </Tooltip>
);

export default function TestResults() {
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "PENDING" | "IN_PROGRESS" | "COMPLETED">("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddReportModalOpen, setIsAddReportModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const loginData = JSON.parse(localStorage.getItem("loginData") || "{}");

  async function loadPatients() {
    await getApi("/users?user_type=PATIENT")
      .then((data) => {
        if (!data?.error) {
          setPatients(data.data);
        }
        else {
          toast.error(data.error);
          console.error("Error fetching user patients:", data.error);
        }
      }).catch((error) => {
        toast.error("Error fetching user patients");
        console.error("Error deleting user patients:", error);
      });
  }

  async function loadTests() {
    await getApi("/lab-tests")
      .then((data) => {
        if (!data?.error) {
          setTests(data.data);
        }
        else {
          toast.error(data.error);
          console.error("Error fetching lab tests:", data.error);
        }
      }).catch((error) => {
        toast.error("Error fetching lab tests");
        console.error("Error deleting lab tests:", error);
      });
  }

  async function loadData() {
    setLoading(true);
    await getApi("/lab-requests")
      .then((data) => {
        if (!data?.error) {
          setResults(data.data);
        }
        else {
          toast.error(data.error);
          console.error("Error fetching user fields:", data.error);
        }
      }).catch((error) => {
        console.error("Error deleting user field:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    loadPatients()
    loadTests()
    loadData();
  }, []);

  // Auto refresh notifier
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        message.info("🔄 Auto-refresh: Test results data reloaded");
        loadData();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const filteredResults = results.filter((result: any) => 
    filter === "all" || result.status === filter
  ).filter((result: any) =>
    result.patient?.username?.toLowerCase().includes(search.toLowerCase()) ||
    result.test?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "green";
      case "IN_PROGRESS": return "blue";
      case "PENDING": return "orange";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircleOutlined />;
      case "IN_PROGRESS": return <SyncOutlined />;
      case "PENDING": return <ClockCircleOutlined />;
      default: return <DashboardOutlined />;
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ');
  };

  const resetFilters = () => {
    setSearch("");
    setFilter("all");
  };

  // Calculate statistics
  const stats = {
    totalRequests: results.length,
    pendingRequests: results.filter((r: any) => r.status === "PENDING").length,
    inProgressRequests: results.filter((r: any) => r.status === "IN_PROGRESS").length,
    completedRequests: results.filter((r: any) => r.status === "COMPLETED").length
  };

  const columns = [
    {
      title: (
        <Space>
          <UserOutlined className="text-blue-600" />
          Patient Information
        </Space>
      ),
      key: "patient",
      render: (_, record: any) => (
        <Space>
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-200">
            <UserOutlined className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{record.patient?.username}</div>
            <div className="text-sm text-gray-500">
              Requested by: {record.requester?.username}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Patient ID: {record.patient_id}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <ExperimentOutlined className="text-purple-600" />
          Test Information
        </Space>
      ),
      dataIndex: ["test", "name"],
      key: "testTypes",
      render: (testName: string, record: any) => (
        <Space direction="vertical" size={0}>
          <div className="font-semibold text-gray-900">{testName}</div>
          <div className="text-sm text-gray-500">
            Laboratory Test
          </div>
          {record.test?.description && (
            <div className="text-xs text-gray-400 mt-1">
              {record.test.description.length > 50 
                ? `${record.test.description.substring(0, 50)}...`
                : record.test.description
              }
            </div>
          )}
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <CalendarOutlined className="text-orange-600" />
          Timeline
        </Space>
      ),
      key: "dates",
      render: (_, record: any) => (
        <Space direction="vertical" size={0}>
          <div className="font-semibold text-gray-900">
            {new Date(record.created_at).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500">
            Created Date
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Updated: {new Date(record.updated_at).toLocaleDateString()}
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <DashboardOutlined className="text-green-600" />
          Status
        </Space>
      ),
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Space direction="vertical" size={0}>
          <Tag 
            color={getStatusColor(status)} 
            icon={getStatusIcon(status)}
            className="font-semibold"
          >
            {getStatusText(status)}
          </Tag>
          <div className="text-xs text-gray-500">
            Current Status
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <ThunderboltOutlined className="text-blue-600" />
          Actions
        </Space>
      ),
      key: "actions",
      render: (_, record: any) => (
        <Space size="small">
          <ActionButton
            icon={<PlayCircleOutlined />}
            label={record.status === "COMPLETED" ? "Test Completed" : "Start Test"}
            type="primary"
            danger={false}
            loading={actionLoading === `start-${record.id}`}
            onClick={() => inProgressLabRequest(record)}
            disabled={record.status === "COMPLETED"}
          />
          
          <ActionButton
            icon={<EyeOutlined />}
            label="View Report"
            type="default"
            onClick={() =>
              navigate("/laboratory/reports", {
                state: {
                  patientName: record.patient?.username,
                  testIds: [record.test_id],
                },
              })
            }
          />
          
          <ActionButton
            icon={<FileTextOutlined />}
            label={record.status === "COMPLETED" ? "Report Already Added" : "Add Report"}
            type="primary"
            loading={actionLoading === `report-${record.id}`}
            onClick={() => {
              setSelectedResult(record);
              setIsAddReportModalOpen(true);
            }}
            disabled={record.status === "COMPLETED"}
          />
        </Space>
      ),
    },
  ];

  const handleSubmit = async (values: any) => {
    setActionLoading('create');
    const newPatient: any = {
      patient_id: values.patient_id,
      test_id: values.test_id,
      status: "PENDING",
    };

    await PostApi(`/lab-requests`, newPatient)
      .then((data) => {
        if (!data?.error) {
          toast.success("Test request added successfully!");
          setIsModalOpen(false);
          form.resetFields();
          loadData();
        }
        else {
          console.error("Error fetching user fields:", data.error);
          toast.error("Failed to add test request");
        }
      }).catch((error) => {
        console.error("Error deleting user field:", error);
        toast.error("Failed to add test request");
      })
      .finally(() => {
        setActionLoading(null);
      });
  };

  const inProgressLabRequest = async (values: any) => {
    setActionLoading(`start-${values.id}`);
    await PutApi(`/lab-requests`, { 
      id: values.id, 
      test_id: values.test_id, 
      patient_id: values.patient_id, 
      status: "IN_PROGRESS" 
    })
    .then((data) => {
      if (!data?.error) {
        toast.success("Test started successfully!");
        loadData();
      }
      else {
        console.error("Error updating lab request:", data.error);
        toast.error("Failed to start test");
      }
    }).catch((error) => {
      console.error("Error updating lab request:", error);
      toast.error("Failed to start test");
    })
    .finally(() => {
      setActionLoading(null);
    });
  };

  const handleSubmit1 = async (values: any) => {
    setActionLoading(`report-${selectedResult.id}`);
    const newPatient: any = {
      request_id: selectedResult.id,
      report_data: { data: values.report_data },
    };

    Promise.all([
      PostApi(`/lab-reports`, newPatient),
      PutApi(`/lab-requests`, { 
        id: selectedResult.id, 
        test_id: selectedResult.test_id, 
        patient_id: selectedResult.patient_id, 
        reported_by: loginData.user_id, 
        status: "COMPLETED" 
      })
    ]).then(([data, data1]) => {
      if (!data?.error) {
        toast.success("Report added successfully!");
        setIsAddReportModalOpen(false);
        form1.resetFields();
        loadData();
      }
      else {
        console.error("Error adding lab report:", data.error);
        toast.error("Failed to add report");
      }
      if (!data1?.error) {
        setIsAddReportModalOpen(false);
      }
      else {
        console.error("Error updating lab request:", data1.error);
      }
    }).catch((error) => {
      console.error("Error in report submission:", error);
      toast.error("Failed to add report");
    })
    .finally(() => {
      setActionLoading(null);
    });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      {loading ? (
        <HeaderSkeleton />
      ) : (
        <Card className="bg-white shadow-sm border-0">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <ExperimentOutlined className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Laboratory Results</h1>
                <p className="text-gray-600 mt-1">Manage and track all laboratory test results and reports</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
              <Tooltip title="Auto Refresh">
                <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg border">
                  <SyncOutlined className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700 font-medium">Auto Refresh</span>
                  <div 
                    className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${
                      autoRefresh ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    onClick={() => setAutoRefresh(!autoRefresh)}
                  >
                    <div 
                      className={`w-3 h-3 rounded-full bg-white transform transition-transform mt-1 ${
                        autoRefresh ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </div>
                </div>
              </Tooltip>

              <Tooltip title="Reset Filters">
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={resetFilters}
                  className="border-gray-300"
                >
                  Reset
                </Button>
              </Tooltip>

              <Tooltip title="Add New Test Request">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => {
                      form.resetFields();
                      setIsModalOpen(true);
                    }} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-md"
                    size="large"
                  >
                    <RocketOutlined /> New Test Request
                  </Button>
                </motion.div>
              </Tooltip>
            </div>
          </div>
        </Card>
      )}

      {/* Statistics Cards */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-sm border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <Statistic
                title="Total Requests"
                value={stats.totalRequests}
                prefix={<FileDoneOutlined className="text-blue-600" />}
                valueStyle={{ color: '#1d4ed8' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-sm border-0 bg-gradient-to-br from-orange-50 to-orange-100">
              <Statistic
                title="Pending"
                value={stats.pendingRequests}
                prefix={<ClockCircleOutlined className="text-orange-600" />}
                valueStyle={{ color: '#ea580c' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-sm border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <Statistic
                title="In Progress"
                value={stats.inProgressRequests}
                prefix={<SyncOutlined className="text-blue-600" />}
                valueStyle={{ color: '#2563eb' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-sm border-0 bg-gradient-to-br from-green-50 to-green-100">
              <Statistic
                title="Completed"
                value={stats.completedRequests}
                prefix={<CheckCircleOutlined className="text-green-600" />}
                valueStyle={{ color: '#16a34a' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Search and Filter Section */}
      <Card className="bg-white shadow-sm border-0">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3">
              <TeamOutlined className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">Test Results</span>
              <Tag color="blue" className="ml-2 text-lg font-semibold px-3 py-1">
                {filteredResults.length} results
              </Tag>
            </div>
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <Input 
                placeholder="Search by patient name or test type..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                prefix={<SearchOutlined className="text-gray-400" />} 
                allowClear 
                size="large"
                style={{ width: 300 }}
                className="rounded-lg"
              />
              <Select 
                value={filter} 
                onChange={(value) => setFilter(value)} 
                style={{ width: 200 }} 
                placeholder="Filter by status"
                size="large"
              >
                <Option value="all">All Status</Option>
                <Option value="PENDING">Pending</Option>
                <Option value="IN_PROGRESS">In Progress</Option>
                <Option value="COMPLETED">Completed</Option>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <Card className="shadow-lg rounded-xl border-0 overflow-hidden">
          <Table
            columns={columns}
            dataSource={filteredResults}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} results`,
              className: "px-6 py-4"
            }}
            scroll={{ x: "max-content" }}
            rowClassName="hover:bg-blue-50 transition-colors duration-200"
            className="rounded-lg"
          />
        </Card>
      )}

      {/* Add Test Request Modal */}
      <Modal
        title={
          <Space>
            <div className="p-2 bg-green-100 rounded-lg">
              <PlusOutlined className="text-green-600" />
            </div>
            <span className="text-lg font-semibold">New Lab Test Request</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Create Request"
        confirmLoading={actionLoading === 'create'}
        width={600}
        styles={{
          body: { padding: '24px' }
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="patient_id"
            label="Patient"
            rules={[{ required: true, message: "Please select patient" }]}
          >
            <Select
              showSearch
              placeholder="Select patient"
              size="large"
              filterOption={(input, option: any) =>
                (option?.label ?? "")?.toLowerCase()?.includes(input?.toLowerCase())
              }
              options={patients.map((t) => ({ value: t.id, label: t.username }))}
            />
          </Form.Item>

          <Form.Item
            name="test_id"
            label="Test Type"
            rules={[{ required: true, message: "Please select test" }]}
          >
            <Select
              showSearch
              placeholder="Select test"
              size="large"
              filterOption={(input, option: any) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={tests.map((t) => ({ value: t.id, label: t.name }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Report Modal */}
      <Modal
        title={
          <Space>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileTextOutlined className="text-blue-600" />
            </div>
            <span className="text-lg font-semibold">Add Laboratory Report</span>
          </Space>
        }
        open={isAddReportModalOpen}
        onCancel={() => setIsAddReportModalOpen(false)}
        onOk={() => form1.submit()}
        okText="Submit Report"
        confirmLoading={actionLoading?.startsWith('report-')}
        width={700}
        styles={{
          body: { padding: '24px' }
        }}
      >
        {selectedResult && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Patient:</span>
                <span className="ml-2">{selectedResult.patient?.username}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Test:</span>
                <span className="ml-2">{selectedResult.test?.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Request ID:</span>
                <span className="ml-2">{selectedResult.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <Tag color={getStatusColor(selectedResult.status)} className="ml-2">
                  {getStatusText(selectedResult.status)}
                </Tag>
              </div>
            </div>
          </div>
        )}
        
        <Form form={form1} layout="vertical" onFinish={handleSubmit1}>
          <Form.Item
            name="report_data"
            label="Test Results & Findings"
            rules={[{ required: true, message: "Please enter test results and findings" }]}
          >
            <TextArea
              rows={6}
              placeholder="Enter detailed test results, observations, findings, and recommendations..."
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}