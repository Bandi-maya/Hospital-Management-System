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
  message
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
  ClockCircleOutlined
} from "@ant-design/icons";
import { toast } from "sonner";
import { getApi, PostApi, PutApi } from "@/ApiService";
import TextArea from "antd/es/input/TextArea";

const { Option } = Select;

interface Test {
  id: number;
  patientName: string;
  testType: string;
  date: string;
  status: "Available" | "Not Available" | "Completed";
}

interface PatientTests {
  patientName: string;
  testTypes: string[];
  dates: string[];
  statuses: string[];
  ids: number[];
}

export default function TestResults() {
  const [results, setResults] = useState<Test[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "Available" | "Not Available" | "Completed">("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddReportModalOpen, setIsAddReportModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const loginData = JSON.parse(localStorage.getItem("loginData") || "{}");

  async function loadPatients() {
    await getApi("/users?user_type_id=2")
      .then((data) => {
        if (!data?.error) {
          setPatients(data);
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
          setTests(data);
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
    await getApi("/lab-requests")
      .then((data) => {
        if (!data?.error) {
          setResults(data);
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
    loadPatients()
    loadTests()
    loadData();
  }, []);

  // Auto refresh notifier
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        message.info("🔄 Auto-refresh: Test results data reloaded");
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const filteredResults = results
    .filter((pt: any) => filter === "all" || pt.statuses.includes(filter));

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

  const resetFilters = () => {
    setSearch("");
    setFilter("all");
  };

  const columns = [
    {
      title: (
        <Space>
          <UserOutlined />
          Patient Info
        </Space>
      ),
      key: "patient",
      render: (_, record: any) => (
        <Space>
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <UserOutlined className="text-blue-600" />
          </div>
          <div>
            <div style={{ fontWeight: "bold" }}>{record.patient?.username}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Requested by: {record.requester?.username}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <ExperimentOutlined />
          Test Info
        </Space>
      ),
      dataIndex: ["test", "name"],
      key: "testTypes",
      render: (testName: string) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: "500" }}>{testName}</span>
          <div style={{ fontSize: "12px", color: "#999" }}>
            Laboratory Test
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <CalendarOutlined />
          Dates
        </Space>
      ),
      key: "dates",
      render: (_, record: any) => (
        <Space direction="vertical" size={0}>
          <div style={{ fontWeight: "500" }}>
            Created: {new Date(record.created_at).toLocaleDateString()}
          </div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            Updated: {new Date(record.updated_at).toLocaleDateString()}
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
        <Space direction="vertical">
          <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
            {status.replace('_', ' ')}
          </Tag>
          <div style={{ fontSize: "12px", color: "#666" }}>
            Current Status
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
          <Tooltip title="Start Test">
            <Button
              icon={<PlayCircleOutlined />}
              type="primary"
              disabled={record.status === "COMPLETED"}
              onClick={() => inProgressLabRequest(record)}
            >
              Start Test
            </Button>
          </Tooltip>
          <Tooltip title="View Report">
            <Button
              icon={<EyeOutlined />}
              type="default"
              onClick={() =>
                navigate("/laboratory/reports", {
                  state: {
                    patientName: record.patientName,
                    testIds: record.ids,
                  },
                })
              }
            >
              View Report
            </Button>
          </Tooltip>
          <Tooltip title="Add Report">
            <Button
              icon={<FileTextOutlined />}
              type="primary"
              disabled={record.status === "COMPLETED"}
              onClick={() => {
                setSelectedResult(record);
                setIsAddReportModalOpen(true);
              }}
            >
              Add Report
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSubmit = async (values: any) => {
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
          loadData()
        }
        else {
          console.error("Error fetching user fields:", data.error);
        }
      }).catch((error) => {
        console.error("Error deleting user field:", error);
      });
  };

  const inProgressLabRequest = async (values: any) => {
    Promise.all([
      PutApi(`/lab-requests`, { id: values.id, test_id: values.test_id, patient_id: values.patient_id, status: "IN_PROGRESS" })
    ]).then(([data]) => {
      if (!data?.error) {
        toast.success("Test started successfully!");
        loadData()
      }
      else {
        console.error("Error fetching user fields:", data.error);
      }
    }).catch((error) => {
      console.error("Error deleting user field:", error);
    })
  };

  const handleSubmit1 = async (values: any) => {
    const newPatient: any = {
      request_id: selectedResult.id,
      report_data: { data: values.report_data },
    };

    Promise.all([
      PostApi(`/lab-reports`, newPatient),
      PutApi(`/lab-requests`, { id: selectedResult.id, test_id: selectedResult.test_id, patient_id: selectedResult.patient_id, reported_by: selectedResult.reported_by, status: "COMPLETED" })
    ]).then(([data, data1]) => {
      if (!data?.error) {
        toast.success("Report added successfully!");
        setIsAddReportModalOpen(false);
        form1.resetFields();
        loadData()
      }
      else {
        console.error("Error fetching user fields:", data.error);
      }
      if (!data1?.error) {
        setIsAddReportModalOpen(false);
      }
      else {
        console.error("Error fetching user fields:", data1.error);
      }
    }).catch((error) => {
      console.error("Error deleting user field:", error);
    })
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
              <h1 className="text-2xl font-bold text-gray-900">Laboratory Results</h1>
              <p className="text-gray-600 mt-1">Manage and track all laboratory test results</p>
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

            <Tooltip title="Add New Test Request">
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
          </div>
        </div>
      </Card>

      {/* Search and Filter Section */}
      <Card className="bg-white shadow-sm border-0">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-2">
              <TeamOutlined className="w-5 h-5" />
              <span className="text-lg font-semibold">All Test Results</span>
              <Tag color="blue" className="ml-2">
                {filteredResults.length}
              </Tag>
            </div>
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <Input 
                placeholder="Search by patient..." 
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
                <Option value="Completed">Completed</Option>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Table */}
      <Card className="shadow-md rounded-lg">
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
          }}
          scroll={{ x: "max-content" }}
          rowClassName="hover:bg-gray-50"
        />
      </Card>

      {/* Add Test Request Modal */}
      <Modal
        title={
          <Space>
            <PlusOutlined />
            Add Lab Test Request
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Add Request"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="patient_id"
            label="Patient Name"
            rules={[{ required: true, message: "Please select patient" }]}
          >
            <Select
              showSearch
              placeholder="Select patient"
              filterOption={(input, option: any) =>
                (option?.label ?? "")?.toLowerCase()?.includes(input?.toLowerCase())
              }
              options={patients.map((t) => ({ value: t.id, label: t.username }))}
            />
          </Form.Item>

          <Form.Item
            name="test_id"
            label="Test"
            rules={[{ required: true, message: "Please select test" }]}
          >
            <Select
              mode="multiple"
              showSearch
              placeholder="Select test(s)"
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
            <FileTextOutlined />
            Add Lab Report
          </Space>
        }
        open={isAddReportModalOpen}
        onCancel={() => setIsAddReportModalOpen(false)}
        onOk={() => form1.submit()}
        okText="Add Report"
        width={600}
      >
        <Form form={form1} layout="vertical" onFinish={handleSubmit1}>
          <Form.Item
            name="report_data"
            label="Report Data"
            rules={[{ required: true, message: "Please enter report data" }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter test results, observations, and findings..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}