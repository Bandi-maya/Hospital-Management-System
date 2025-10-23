import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  Form,
  Modal,
  Select,
  Card,
  Tooltip,
  Popconfirm,
  message,
  Skeleton,
  Row,
  Col,
  Statistic,
  Badge
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  TeamOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { getApi, PostApi } from "@/ApiService";
import { toast } from "sonner";
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
        <Skeleton.Button active size="small" style={{ width: 160 }} />
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

export default function LabTests() {
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "Available" | "Not Available">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  async function loadData(page = 1, limit = 10, searchQuery = search, status: any = filter) {
    setLoading(true);
    await getApi(`/lab-tests?page=${page}&limit=${limit}&q=${searchQuery}&status=${status === 'all' ? '' : status === true ? true : false}`)
      .then((data) => {
        if (!data?.error) {
          setTests(data.data);
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
    loadData();
  }, []);

  // Auto refresh notifier
  // useEffect(() => {
  //   if (autoRefresh) {
  //     const interval = setInterval(() => {
  //       message.info("🔄 Auto-refresh: Lab tests data reloaded");
  //       loadData();
  //     }, 30000);
  //     return () => clearInterval(interval);
  //   }
  // }, [autoRefresh]);

  const handleTableChange = (newPagination: any) => {
    loadData(newPagination.current, newPagination.pageSize);
  };

  const filteredTests = tests
    // .filter((pt) => filter === "all" || pt.is_available === (filter === "Available"))
    // .filter((pt) => pt.name.toLowerCase().includes(search.toLowerCase()));

  const getStatusColor = (status: boolean) => {
    return status ? "green" : "red";
  };

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircleOutlined /> : <CloseCircleOutlined />;
  };

  const getStatusText = (status: boolean) => {
    return status ? "Available" : "Not Available";
  };

  const resetFilters = () => {
    setSearch("");
    setFilter("all");
  };

  const handleDeleteTest = (id: number) => {
    setActionLoading(id.toString());
    Modal.confirm({
      title: "Are you sure you want to delete this test?",
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      okText: "Yes, Delete",
      cancelText: "Cancel",
      okType: "danger",
      onOk: () => {
        // Add delete API call here
        setTests((prev) => prev.filter((test) => test.id !== id));
        message.success("Test deleted successfully");
        setActionLoading(null);
      },
      onCancel: () => {
        setActionLoading(null);
      }
    });
  };

  // Calculate statistics
  const stats = {
    totalTests: tests.length,
    availableTests: tests.filter(test => test.is_available).length,
    unavailableTests: tests.filter(test => !test.is_available).length,
    averagePrice: tests.length > 0 ? tests.reduce((sum, test) => sum + test.price, 0) / tests.length : 0
  };

  const columns = [
    {
      title: (
        <Space>
          <ExperimentOutlined className="text-blue-600" />
          Test Information
        </Space>
      ),
      key: "test",
      render: (_, record: any) => (
        <Space>
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-200">
            <ExperimentOutlined className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{record.name}</div>
            <div className="text-sm text-gray-500">
              ID: {record.id}
            </div>
            {record.description && (
              <div className="text-xs text-gray-400 mt-1">
                {record.description.length > 50
                  ? `${record.description.substring(0, 50)}...`
                  : record.description
                }
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <FileTextOutlined className="text-purple-600" />
          Description
        </Space>
      ),
      dataIndex: "description",
      key: "description",
      render: (description: string) => (
        <Space direction="vertical" size={0}>
          <span className="text-gray-700">{description || "No description available"}</span>
          <div className="text-xs text-gray-500">
            Test Description
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <DollarOutlined className="text-green-600" />
          Pricing
        </Space>
      ),
      dataIndex: "price",
      key: "price",
      render: (price: number) => (
        <Space direction="vertical" size={0}>
          <div className="font-bold text-green-600 text-lg">${price?.toFixed(2)}</div>
          <div className="text-xs text-gray-500">
            Test Price
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <DashboardOutlined className="text-orange-600" />
          Status
        </Space>
      ),
      dataIndex: "is_available",
      key: "status",
      render: (status: boolean) => (
        <Space direction="vertical" size={0}>
          <Tag
            color={getStatusColor(status)}
            icon={getStatusIcon(status)}
            className="font-semibold"
          >
            {getStatusText(status)}
          </Tag>
          <div className="text-xs text-gray-500">
            Availability Status
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
            icon={<EyeOutlined />}
            label="View Details"
            onClick={() => navigate("/laboratory/results")}
            loading={actionLoading === record.id.toString()}
          />

          <ActionButton
            icon={<EditOutlined />}
            label="Edit Test"
            onClick={() => {
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
            loading={actionLoading === record.id.toString()}
          />

          <ActionButton
            icon={<DeleteOutlined />}
            label="Delete Test"
            onClick={() => handleDeleteTest(record.id)}
            danger
            loading={actionLoading === record.id.toString()}
          />
        </Space>
      ),
    },
  ];

  const handleSubmit = async (values: any) => {
    setActionLoading('create');
    const newPatient: any = {
      name: values.name,
      description: values.description,
      price: parseFloat(values.price),
      is_available: values.is_available
    };

    await PostApi(`/lab-tests`, newPatient)
      .then((data) => {
        if (!data?.error) {
          toast.success("Test added successfully!");
          setIsModalOpen(false);
          form.resetFields();
          loadData();
        }
        else {
          console.error("Error fetching user fields:", data.error);
          toast.error("Failed to add test");
        }
      }).catch((error) => {
        console.error("Error deleting user field:", error);
        toast.error("Failed to add test");
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
                <h1 className="text-3xl font-bold text-gray-900">Laboratory Tests</h1>
                <p className="text-gray-600 mt-1">Manage and track all laboratory tests and diagnostics</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
              <Tooltip title="Auto Refresh">
                <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg border">
                  <SyncOutlined className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700 font-medium">Auto Refresh</span>
                  <div
                    className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${autoRefresh ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    onClick={() => setAutoRefresh(!autoRefresh)}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-white transform transition-transform mt-1 ${autoRefresh ? 'translate-x-6' : 'translate-x-1'
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

              <Tooltip title="Add New Test">
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
                    <RocketOutlined /> Add New Test
                  </Button>
                </motion.div>
              </Tooltip>

              <Button
                type="default"
                icon={<FileTextOutlined />}
                onClick={() => navigate("/laboratory/results")}
                size="large"
                className="border-blue-300 text-blue-600 hover:text-blue-700 hover:border-blue-400"
              >
                View Test Results
              </Button>
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
                value={stats.totalTests}
                prefix={<ExperimentOutlined className="text-blue-600" />}
                valueStyle={{ color: '#1d4ed8' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-sm border-0 bg-gradient-to-br from-green-50 to-green-100">
              <Statistic
                title="Available Tests"
                value={stats.availableTests}
                prefix={<CheckCircleOutlined className="text-green-600" />}
                valueStyle={{ color: '#16a34a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-sm border-0 bg-gradient-to-br from-orange-50 to-orange-100">
              <Statistic
                title="Unavailable Tests"
                value={stats.unavailableTests}
                prefix={<CloseCircleOutlined className="text-orange-600" />}
                valueStyle={{ color: '#ea580c' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-sm border-0 bg-gradient-to-br from-purple-50 to-purple-100">
              <Statistic
                title="Average Price"
                value={stats.averagePrice}
                prefix="$"
                precision={2}
                valueStyle={{ color: '#9333ea' }}
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
              <span className="text-xl font-semibold text-gray-900">Laboratory Tests</span>
              <Tag color="blue" className="ml-2 text-lg font-semibold px-3 py-1">
                {filteredTests.length} tests
              </Tag>
            </div>
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <Input.Search
                placeholder="Search tests by name or description..."
                value={search}
                onSearch={() => { loadData(pagination.current, pagination.pageSize, search) }}
                onChange={(e) => setSearch(e.target.value)}
                prefix={<SearchOutlined className="text-gray-400" />}
                allowClear
                size="large"
                style={{ width: 300 }}
                className="rounded-lg"
              />
              <Select
                value={filter}
                onChange={(value) => { setFilter(value); loadData(pagination.current, pagination.pageSize, search, value) }}
                style={{ width: 200 }}
                placeholder="Filter by status"
                size="large"
              >
                <Option value="all">All Status</Option>
                <Option value={true}>Available</Option>
                <Option value={false}>Not Available</Option>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Tests Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <Card className="shadow-lg rounded-xl border-0 overflow-hidden">
          <Table
            columns={columns}
            dataSource={filteredTests}
            rowKey="id"
            onChange={handleTableChange}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} tests`,
              className: "px-6 py-4"
            }}
            scroll={{ x: "max-content" }}
            rowClassName="hover:bg-blue-50 transition-colors duration-200"
            className="rounded-lg"
          />
        </Card>
      )}

      {/* Add/Edit Test Modal */}
      <Modal
        title={
          <Space>
            <div className="p-2 bg-green-100 rounded-lg">
              <PlusOutlined className="text-green-600" />
            </div>
            <span className="text-lg font-semibold">Add Laboratory Test</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Add Test"
        confirmLoading={actionLoading === 'create'}
        width={600}
        styles={{
          body: { padding: '24px' }
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Test Name"
            rules={[{ required: true, message: "Please enter test name" }]}
          >
            <Input
              placeholder="Enter test name"
              size="large"
              prefix={<ExperimentOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea
              placeholder="Enter test description, procedure, or instructions"
              rows={3}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: "Please enter price" }]}
          >
            <Input
              type="number"
              min={0}
              step={0.01}
              placeholder="Enter test price"
              prefix={<DollarOutlined className="text-gray-400" />}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="is_available"
            label="Availability Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select
              placeholder="Select test availability status"
              size="large"
            >
              <Option value={true}>
                <Space>
                  <CheckCircleOutlined className="text-green-600" />
                  Available
                </Space>
              </Option>
              <Option value={false}>
                <Space>
                  <CloseCircleOutlined className="text-red-600" />
                  Not Available
                </Space>
              </Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}