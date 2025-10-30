import { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  Card,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
  message,
  Descriptions,
  Divider,
  Skeleton,
  Row,
  Col,
  Statistic,
  Badge,
  Switch,
  DatePicker
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  TeamOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  MedicineBoxOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { toast } from "sonner";
import { getApi, PostApi, PutApi, DeleteApi } from "@/ApiService";
import { motion } from "framer-motion";
import dayjs from "dayjs";

const { Option } = Select;

interface TestResult {
  id: number;
  user_id: number;
  test_id: number;
  result: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  test_date: string;
  result_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  user?: any;
  test?: any;
}

interface LabTest {
  id: number;
  name: string;
  description?: string;
  price?: number;
}

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
  loading = false
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  type?: "primary" | "default" | "dashed" | "link";
  danger?: boolean;
  loading?: boolean;
}) => (
  <Tooltip title={label}>
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        type={type}
        danger={danger}
        icon={icon}
        loading={loading}
        onClick={onClick}
        className={`
          flex items-center justify-center 
          transition-all duration-200 ease-in-out
          w-10 h-10 rounded-full
          ${danger ? 'border-red-500 text-red-600 hover:bg-red-50' : ''}
          ${type === 'primary' ? '' : 'border-gray-300'}
        `}
        style={{
          minWidth: '40px'
        }}
      />
    </motion.div>
  </Tooltip>
);

export default function TestResults() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [editingResult, setEditingResult] = useState<TestResult | null>(null);
  const [search, setSearch] = useState("");
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const loginData = JSON.parse(localStorage.getItem("loginData") || '{"user_id":8}');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchTestResults();
    fetchPatients();
    fetchLabTests();
  }, []);

  // Auto refresh notifier
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        message.info({
          content: "🔄 Auto-refresh: Test results data reloaded",
          duration: 2,
          key: 'auto-refresh'
        });
        fetchTestResults();
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh]);

  const fetchTestResults = async (page = 1, limit = 10, searchQuery = search) => {
    setLoading(true);
    try {
      const res = await getApi(`/test-results?page=${page}&limit=${limit}&q=${searchQuery}`);
      if (!res.error) {
        setTestResults(res.data || []);
        setPagination(prev => ({
          ...prev,
          current: page,
          pageSize: limit,
          total: res.total || res.data?.length || 0
        }));
      } else {
        toast.error(res.error || "Failed to load test results.");
      }
    } catch (error) {
      toast.error("Server error while fetching test results");
      console.error("Error fetching test results:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await getApi("/users?user_type=PATIENT");
      if (!res.error) {
        setPatients(res.data || []);
      } else {
        toast.error(res.error || "Failed to load patients.");
      }
    } catch (error) {
      toast.error("Server error while fetching patients");
      console.error("Error fetching patients:", error);
    }
  };

  const fetchLabTests = async () => {
    try {
      const res = await getApi("/lab-tests");
      if (!res.error) {
        setLabTests(res.data || []);
      } else {
        toast.error(res.error || "Failed to load lab tests.");
      }
    } catch (error) {
      toast.error("Server error while fetching lab tests");
      console.error("Error fetching lab tests:", error);
    }
  };

  const handleAddOrUpdate = async (values: any) => {
    if (!values.user_id || !values.test_id) {
      toast.error("Please fill all required fields.");
      return;
    }

    setActionLoading(editingResult ? 'update' : 'create');

    try {
      const testResultData = {
        ...values,
        created_by: loginData.user_id,
        test_date: values.test_date || dayjs().format('YYYY-MM-DD')
      };

      let res;
      if (editingResult) {
        res = await PutApi("/test-results", { ...editingResult, ...testResultData });
      } else {
        res = await PostApi("/test-results", testResultData);
      }

      if (!res.error) {
        toast.success(`Test result ${editingResult ? 'updated' : 'added'} successfully`);
        setIsModalOpen(false);
        fetchTestResults();
        form.resetFields();
        setEditingResult(null);
      } else {
        toast.error(res.error || `Failed to ${editingResult ? 'update' : 'add'} test result`);
      }
    } catch (error) {
      toast.error(`Server error while ${editingResult ? 'updating' : 'adding'} test result`);
      console.error(`Error ${editingResult ? 'updating' : 'adding'} test result:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteResult = (result: TestResult) => {
    setActionLoading(result.id.toString());
    Modal.confirm({
      title: "Delete Test Result?",
      content: "Are you sure you want to delete this test result? This action cannot be undone.",
      okText: "Yes, Delete",
      cancelText: "Cancel",
      okType: "danger",
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      async onOk() {
        try {
          const res = await DeleteApi(`/test-results?id=${result.id}`);
          if (!res.error) {
            toast.success("Test result deleted successfully");
            fetchTestResults();
          } else {
            toast.error(res.error || "Failed to delete test result");
          }
        } catch (error) {
          toast.error("Server error while deleting test result");
          console.error("Error deleting test result:", error);
        } finally {
          setActionLoading(null);
        }
      },
      onCancel() {
        setActionLoading(null);
      }
    });
  };

  const handleEdit = (result: TestResult) => {
    setEditingResult(result);
    form.setFieldsValue({
      ...result,
      user_id: result.user_id,
      test_id: result.test_id,
      test_date: result.test_date ? dayjs(result.test_date) : null,
      result_date: result.result_date ? dayjs(result.result_date) : null,
    });
    setIsModalOpen(true);
  };

  const handleView = (result: TestResult) => {
    setSelectedResult(result);
    setIsViewModalOpen(true);
  };

  const resetFilters = () => {
    setSearch("");
    fetchTestResults(1, pagination.pageSize, "");
  };

  const handleSearch = () => {
    fetchTestResults(1, pagination.pageSize, search);
  };

  const filteredResults = testResults.filter(result =>
    result.user_id.toString().includes(search) ||
    result.test?.name?.toLowerCase().includes(search.toLowerCase()) ||
    result.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
    result.result?.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate statistics
  const stats = {
    totalResults: testResults.length,
    todayResults: testResults.filter(result => result.test_date === dayjs().format('YYYY-MM-DD')).length,
    pendingResults: testResults.filter(result => result.status === "PENDING").length,
    completedResults: testResults.filter(result => result.status === "COMPLETED").length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "green";
      case "IN_PROGRESS": return "blue";
      case "PENDING": return "orange";
      default: return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED": return "Completed";
      case "IN_PROGRESS": return "In Progress";
      case "PENDING": return "Pending";
      default: return status;
    }
  };

  const columns: ColumnsType<TestResult> = [
    {
      title: (
        <Space>
          <ExperimentOutlined className="text-blue-600" />
          Test Information
        </Space>
      ),
      key: "test",
      render: (_, record: TestResult) => (
        <Space>
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-200">
            <ExperimentOutlined className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{record.test?.name || `Test #${record.test_id}`}</div>
            <div className="text-sm text-gray-500">
              Patient: {record.user?.username || `User ${record.user_id}`}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Test Date: {record.test_date ? dayjs(record.test_date).format('DD/MM/YYYY') : 'N/A'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <FileTextOutlined className="text-green-600" />
          Result
        </Space>
      ),
      key: "result",
      render: (_, record: TestResult) => (
        <Space direction="vertical" size={0}>
          <div className={`font-semibold ${record.result ? 'text-gray-900' : 'text-gray-400'}`}>
            {record.result || "No result yet"}
          </div>
          {record.result_date && (
            <div className="text-xs text-gray-500">
              Result Date: {dayjs(record.result_date).format('DD/MM/YYYY')}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <DashboardOutlined className="text-purple-600" />
          Status
        </Space>
      ),
      key: "status",
      render: (_, record: TestResult) => (
        <Badge
          color={getStatusColor(record.status)}
          text={getStatusText(record.status)}
          className="font-medium"
        />
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
      render: (_, record: TestResult) => (
        <Space size="small">
          <ActionButton
            icon={<EyeOutlined />}
            label="View Details"
            onClick={() => handleView(record)}
            loading={actionLoading === record.id.toString()}
          />

          <ActionButton
            icon={<EditOutlined />}
            label="Edit Result"
            onClick={() => handleEdit(record)}
            loading={actionLoading === record.id.toString()}
          />

          <ActionButton
            icon={<DeleteOutlined />}
            label="Delete Result"
            onClick={() => handleDeleteResult(record)}
            danger
            loading={actionLoading === record.id.toString()}
          />
        </Space>
      ),
    },
  ];

  const handleTableChange = (newPagination: any) => {
    fetchTestResults(newPagination.current, newPagination.pageSize, search);
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
                <h1 className="text-3xl font-bold text-gray-900">Test Results</h1>
                <p className="text-gray-600 mt-1">Manage laboratory test results and reports</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
              <Tooltip title={autoRefresh ? "Auto refresh enabled" : "Auto refresh disabled"}>
                <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg border">
                  <SyncOutlined className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700 font-medium">Auto Refresh</span>
                  <Switch
                    size="small"
                    checked={autoRefresh}
                    onChange={setAutoRefresh}
                    checkedChildren="ON"
                    unCheckedChildren="OFF"
                  />
                </div>
              </Tooltip>

              <Tooltip title="Reset Filters">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={resetFilters}
                  className="border-gray-300"
                  disabled={loading}
                >
                  Reset
                </Button>
              </Tooltip>

              <Tooltip title="Add New Test Result">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingResult(null);
                      form.resetFields();
                      setIsModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-md"
                    size="large"
                    disabled={loading}
                  >
                    <RocketOutlined /> New Test Result
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
                title="Total Tests"
                value={stats.totalResults}
                prefix={<ExperimentOutlined className="text-blue-600" />}
                valueStyle={{ color: '#1d4ed8' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-sm border-0 bg-gradient-to-br from-green-50 to-green-100">
              <Statistic
                title="Today's Tests"
                value={stats.todayResults}
                prefix={<CalendarOutlined className="text-green-600" />}
                valueStyle={{ color: '#16a34a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-sm border-0 bg-gradient-to-br from-orange-50 to-orange-100">
              <Statistic
                title="Pending Results"
                value={stats.pendingResults}
                prefix={<ExclamationCircleOutlined className="text-orange-600" />}
                valueStyle={{ color: '#ea580c' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-sm border-0 bg-gradient-to-br from-green-50 to-green-100">
              <Statistic
                title="Completed"
                value={stats.completedResults}
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
              <Input.Search
                placeholder="Search by patient name, test name, or result..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onSearch={handleSearch}
                onPressEnter={handleSearch}
                prefix={<SearchOutlined className="text-gray-400" />}
                allowClear
                size="large"
                style={{ width: 350 }}
                className="rounded-lg"
                loading={loading}
              />
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
            onChange={handleTableChange}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} results`,
              className: "px-6 py-4"
            }}
            scroll={{ x: "max-content" }}
            rowClassName="hover:bg-blue-50 transition-colors duration-200"
            className="rounded-lg"
            loading={loading}
          />
        </Card>
      )}

      {/* Add/Edit Test Result Modal */}
      <Modal
        title={
          <Space>
            <div className={`p-2 rounded-lg ${editingResult ? 'bg-orange-100' : 'bg-green-100'}`}>
              {editingResult ? <EditOutlined className="text-orange-600" /> : <PlusOutlined className="text-green-600" />}
            </div>
            <span className="text-lg font-semibold">
              {editingResult ? "Edit Test Result" : "New Test Result"}
            </span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingResult(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingResult ? "Update Result" : "Add Result"}
        confirmLoading={actionLoading === 'create' || actionLoading === 'update'}
        width={600}
        styles={{
          body: { padding: '24px' }
        }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrUpdate}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="user_id"
                label="Patient"
                rules={[{ required: true, message: "Please select patient" }]}
              >
                <Select
                  placeholder="Select patient"
                  size="large"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option: any) =>
                    (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {patients.map((patient: any) => (
                    <Option key={patient.id} value={patient.id}>
                      {patient.username}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="test_id"
                label="Lab Test"
                rules={[{ required: true, message: "Please select lab test" }]}
              >
                <Select
                  placeholder="Select lab test"
                  size="large"
                  showSearch
                  filterOption={(input, option: any) =>
                    (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {labTests.map(test => (
                    <Option key={test.id} value={test.id}>
                      {test.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="test_date"
                label="Test Date"
              >
                <DatePicker
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select
                  placeholder="Select status"
                  size="large"
                >
                  <Option value="PENDING">Pending</Option>
                  <Option value="IN_PROGRESS">In Progress</Option>
                  <Option value="COMPLETED">Completed</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="result"
                label="Test Result"
              >
                <Input.TextArea
                  placeholder="Enter test results..."
                  rows={4}
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="notes"
                label="Notes"
              >
                <Input.TextArea
                  placeholder="Additional notes..."
                  rows={3}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* View Test Result Modal */}
      <Modal
        title={
          <Space>
            <div className="p-2 bg-blue-100 rounded-lg">
              <EyeOutlined className="text-blue-600" />
            </div>
            <span className="text-lg font-semibold">Test Result Details</span>
          </Space>
        }
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setSelectedResult(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => setIsViewModalOpen(false)}
            size="large"
          >
            Close
          </Button>
        ]}
        width={700}
        destroyOnClose
      >
        {selectedResult && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border border-blue-200">
                <ExperimentOutlined className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedResult.test?.name || `Test #${selectedResult.test_id}`}
                </h3>
                <p className="text-gray-600">Laboratory test result details</p>
              </div>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" className="border-l-4 border-l-blue-500">
                  <Statistic
                    title="Patient"
                    value={selectedResult.user?.username || `User ${selectedResult.user_id}`}
                    valueStyle={{ color: '#1d4ed8', fontSize: '16px' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" className="border-l-4 border-l-green-500">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Status</div>
                    <Badge
                      color={getStatusColor(selectedResult.status)}
                      text={getStatusText(selectedResult.status)}
                      className="text-lg font-semibold"
                    />
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" className="border-l-4 border-l-purple-500">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Test Date</div>
                    <div className="font-semibold text-lg">
                      {selectedResult.test_date ? dayjs(selectedResult.test_date).format('DD/MM/YYYY') : 'N/A'}
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" className="border-l-4 border-l-orange-500">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Result Date</div>
                    <div className="font-semibold text-lg">
                      {selectedResult.result_date ? dayjs(selectedResult.result_date).format('DD/MM/YYYY') : 'Not Available'}
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            <Divider>Test Information</Divider>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Test Name">
                {selectedResult.test?.name || `Test #${selectedResult.test_id}`}
              </Descriptions.Item>
              <Descriptions.Item label="Test Result">
                <div className={`font-medium ${selectedResult.result ? 'text-gray-900' : 'text-gray-400'}`}>
                  {selectedResult.result || "No result available"}
                </div>
              </Descriptions.Item>
              {selectedResult.notes && (
                <Descriptions.Item label="Notes">
                  {selectedResult.notes}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Created">
                {selectedResult.created_at ? dayjs(selectedResult.created_at).format('DD/MM/YYYY HH:mm') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {selectedResult.updated_at ? dayjs(selectedResult.updated_at).format('DD/MM/YYYY HH:mm') : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}