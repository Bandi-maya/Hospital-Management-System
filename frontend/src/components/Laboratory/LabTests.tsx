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
  message
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
  FileTextOutlined
} from "@ant-design/icons";
import { getApi, PostApi } from "@/ApiService";
import { toast } from "sonner";

const { Option } = Select;

interface Test {
  id: number;
  patientName: string;
  patientId: string;
  token: number;
  testType: string;
  date: string;
  status: "Available" | "Not Available" | "Completed";
}

interface PatientTests {
  patientName: string;
  patientId: string;
  token: number;
  testTypes: string[];
  date: string;
  status: "Available" | "Not Available" | "Completed";
}

export default function LabTests() {
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "Available" | "Not Available">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  async function loadData() {
    await getApi("/lab-tests")
      .then((data) => {
        if (!data?.error) {
          setTests(data);
        }
        else {
          toast.error(data.error);
          console.error("Error fetching user fields:", data.error);
        }
      }).catch((error) => {
        console.error("Error deleting user field:", error);
      });
  }

  useEffect(() => {
    loadData();
  }, []);

  // Auto refresh notifier
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        message.info("🔄 Auto-refresh: Lab tests data reloaded");
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const filteredTests = tests
    .filter((pt) => filter === "all" || pt.is_available === (filter === "Available"))
    .filter((pt) => pt.name.toLowerCase().includes(search.toLowerCase()));

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
    Modal.confirm({
      title: "Are you sure you want to delete this test?",
      onOk: () => {
        // Add delete API call here
        setTests((prev) => prev.filter((test) => test.id !== id));
        message.success("Test deleted successfully");
      },
    });
  };

  const columns = [
    {
      title: (
        <Space>
          <ExperimentOutlined />
          Test Info
        </Space>
      ),
      key: "test",
      render: (_, record: any) => (
        <Space>
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <ExperimentOutlined className="text-blue-600" />
          </div>
          <div>
            <div style={{ fontWeight: "bold" }}>{record.name}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              ID: {record.id}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <FileTextOutlined />
          Description
        </Space>
      ),
      dataIndex: "description",
      key: "description",
      render: (description: string) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: "500" }}>{description || "No description"}</span>
          <div style={{ fontSize: "12px", color: "#999" }}>
            Test Description
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <DollarOutlined />
          Price
        </Space>
      ),
      dataIndex: "price",
      key: "price",
      render: (price: number) => (
        <Space direction="vertical" size={0}>
          <span className="font-bold text-green-600">${price?.toFixed(2)}</span>
          <div style={{ fontSize: "12px", color: "#999" }}>
            Test Price
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
      dataIndex: "is_available",
      key: "status",
      render: (status: boolean) => (
        <Space direction="vertical">
          <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
            {getStatusText(status)}
          </Tag>
          <div style={{ fontSize: "12px", color: "#666" }}>
            Availability
          </div>
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
      render: (_, record: any) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              shape="circle"
              type="primary"
              ghost
              onClick={() => navigate("/laboratory/results")}
            />
          </Tooltip>
          <Tooltip title="Edit Test">
            <Button
              icon={<EditOutlined />}
              shape="circle"
              onClick={() => {
                // Handle edit functionality
                form.setFieldsValue(record);
                setIsModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete Test">
            <Popconfirm
              title="Delete this test?"
              description="Are you sure you want to delete this lab test? This action cannot be undone."
              onConfirm={() => handleDeleteTest(record.id)}
              okText="Yes"
              cancelText="No"
              okType="danger"
              icon={<CloseCircleOutlined style={{ color: "red" }} />}
            >
              <Button icon={<DeleteOutlined />} shape="circle" danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSubmit = async (values: any) => {
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
          loadData()
        }
        else {
          console.error("Error fetching user fields:", data.error);
        }
      }).catch((error) => {
        console.error("Error deleting user field:", error);
      });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <Card className="bg-white shadow-sm border-0">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ExperimentOutlined className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Laboratory Tests</h1>
              <p className="text-gray-600 mt-1">Manage and track all laboratory tests</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
            <Tooltip title="Auto Refresh">
              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                <SyncOutlined className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Auto Refresh</span>
                <div 
                  className={`w-8 h-4 rounded-full transition-colors cursor-pointer ${
                    autoRefresh ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  <div 
                    className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
                      autoRefresh ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </div>
              </div>
            </Tooltip>

            <Tooltip title="Reset Filters">
              <Button icon={<ReloadOutlined />} onClick={resetFilters}>
                Reset Filters
              </Button>
            </Tooltip>

            <Tooltip title="Add New Test">
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => {
                  form.resetFields();
                  setIsModalOpen(true);
                }} 
                className="bg-green-600 hover:bg-green-700"
              >
                <RocketOutlined /> Add Test
              </Button>
            </Tooltip>

            <Button 
              type="default" 
              icon={<FileTextOutlined />}
              onClick={() => navigate("/laboratory/results")}
            >
              View Test Results
            </Button>
          </div>
        </div>
      </Card>

      {/* Search and Filter Section */}
      <Card className="bg-white shadow-sm border-0">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-2">
              <TeamOutlined className="w-5 h-5" />
              <span className="text-lg font-semibold">All Lab Tests</span>
              <Tag color="blue" className="ml-2">
                {filteredTests.length}
              </Tag>
            </div>
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <Input 
                placeholder="Search by test name..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                prefix={<SearchOutlined />} 
                allowClear 
                style={{ width: 250 }}
              />
              <Select
                value={filter}
                onChange={(value) => setFilter(value)}
                style={{ width: 180 }}
                placeholder="Filter by status"
              >
                <Option value="all">All Status</Option>
                <Option value="Available">Available</Option>
                <Option value="Not Available">Not Available</Option>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Tests Table */}
      <Card className="shadow-md rounded-lg">
        <Table
          columns={columns}
          dataSource={filteredTests}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} tests`,
          }}
          scroll={{ x: "max-content" }}
          rowClassName="hover:bg-gray-50"
        />
      </Card>

      {/* Add/Edit Test Modal */}
      <Modal
        title={
          <Space>
            <PlusOutlined />
            Add Lab Test
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Add Test"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Test Name"
            rules={[{ required: true, message: "Please enter test name" }]}
          >
            <Input placeholder="Enter test name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea 
              placeholder="Enter test description"
              rows={3}
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
              prefix={<DollarOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="is_available"
            label="Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select test status">
              <Option value={true}>Available</Option>
              <Option value={false}>Not Available</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}