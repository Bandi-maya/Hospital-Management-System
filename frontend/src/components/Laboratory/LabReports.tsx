import React, { useState, useEffect, useRef } from "react";
import { 
  Table, 
  Input, 
  Button, 
  Card, 
  Select, 
  Modal, 
  Space, 
  Tag, 
  Divider, 
  Form,
  Tooltip,
  Popconfirm,
  message
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
  UserOutlined,
  ExperimentOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  PrinterOutlined
} from "@ant-design/icons";
import { getApi, PutApi } from "@/ApiService";
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
  description?: string;
}

interface Report {
  patientName: string;
  patientId: string;
  token: number;
  testTypes: string[];
  dates: string[];
  statuses: string[];
  ids: number[];
  descriptions: string[];
}

export default function LabReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "Available" | "Not Available" | "Completed">("all");
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [editingReport, setEditingReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);
  const [form] = Form.useForm();

  async function loadTests() {
    await getApi("/lab-reports")
      .then((data) => {
        if (!data?.error) {
          setReports(data.data);
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

  useEffect(() => {
    loadTests()
  }, [])

  // Auto refresh notifier
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        message.info("🔄 Auto-refresh: Lab reports data reloaded");
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleDeleteReport = (patientId: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this report?",
      onOk: () => setReports((prev) => prev.filter((r) => r.patientId !== patientId)),
    });
  };

  const handleEditReport = (report) => {
    setEditingReport(report);
    setIsModalOpen(true);
    form.setFieldsValue({
      request_id: report.id,
      report_data: report.report_data,
      reported_by: 8,
    });
  };

  const handleSaveReport = () => {
    form.validateFields().then((values) => {
      const updatedReport = {
        id: editingReport.id,
        report_data: values.report_data,
      };
      
      PutApi('/lab-reports', updatedReport).then((data) => {
        if (!data?.error) {
          toast.success("Report saved successfully");
          loadTests()
        }
        else {
          toast.error(data.error);
          console.error("Error saving report:", data.error);
        }
      }).catch((error) => {
        toast.error("Error saving report");
        console.error("Error saving report:", error);
      });

      setIsModalOpen(false);
      setEditingReport(null);
      form.resetFields();
    });
  };

  const filteredReports = reports
    .filter((rep) => filter === "all" || rep.statuses.includes(filter));

  const handlePrint = () => {
    if (reportRef.current) {
      const printContents = reportRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "green";
      case "Available": return "blue";
      case "Not Available": return "red";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed": return <FileTextOutlined />;
      case "Available": return <ExperimentOutlined />;
      case "Not Available": return <CloseCircleOutlined />;
      default: return <DashboardOutlined />;
    }
  };

  const resetFilters = () => {
    setSearch("");
    setFilter("all");
  };

  const columns: ColumnsType<Report> = [
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
            <div style={{ fontWeight: "bold" }}>{record.lab_request?.patient?.username}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Patient ID: {record.lab_request?.patient?.id}
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
      key: "test",
      render: (_, record: any) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: "500" }}>{record.lab_request?.test?.name}</span>
          <div style={{ fontSize: "12px", color: "#999" }}>
            Laboratory Test
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <FileTextOutlined />
          Report Data
        </Space>
      ),
      dataIndex: "report_data",
      key: "report_data",
      render: (tests) => {
        if (typeof (tests?.data) === 'string') return tests.data;
        return Object.entries(tests?.data || {}).map(([key, value]: any, idx) => (
          <div key={idx}>
            <span style={{ fontWeight: "bold" }}>{key}:</span> {value}
          </div>
        ));
      },
    },
    {
      title: (
        <Space>
          <DashboardOutlined />
          Status
        </Space>
      ),
      dataIndex: ["lab_request", "status"],
      key: "status",
      render: (status: string) => (
        <Space direction="vertical">
          <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
            {status}
          </Tag>
          <div style={{ fontSize: "12px", color: "#666" }}>
            Last updated
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
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              shape="circle"
              type="primary"
              ghost
              onClick={() => setViewingReport(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Report">
            <Button
              icon={<EditOutlined />}
              shape="circle"
              onClick={() => handleEditReport(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Report">
            <Popconfirm
              title="Delete this report?"
              description="Are you sure you want to delete this lab report? This action cannot be undone."
              onConfirm={() => handleDeleteReport(record.patientId)}
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
              <h1 className="text-2xl font-bold text-gray-900">Laboratory Reports</h1>
              <p className="text-gray-600 mt-1">Manage and track all laboratory test reports</p>
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

            <Tooltip title="Add New Report">
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => {
                  setEditingReport(null);
                  form.resetFields();
                  setIsModalOpen(true);
                }} 
                className="bg-green-600 hover:bg-green-700"
              >
                <RocketOutlined /> Add Report
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
              <span className="text-lg font-semibold">All Lab Reports</span>
              <Tag color="blue" className="ml-2">
                {filteredReports.length}
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

      {/* Reports Table */}
      <Card className="shadow-md rounded-lg">
        <Table 
          columns={columns} 
          dataSource={filteredReports} 
          rowKey="patientId" 
          pagination={{ 
            pageSize: 10, 
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} reports`,
          }} 
          scroll={{ x: "max-content" }} 
          rowClassName="hover:bg-gray-50"
        />
      </Card>

      {/* Edit Report Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            Edit Lab Report
          </Space>
        }
        open={isModalOpen && !viewingReport}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingReport(null);
          form.resetFields();
        }}
        onOk={handleSaveReport}
        width={600}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name={["report_data", "data"]}
            label="Report Data"
            rules={[{ required: true, message: "Please enter report data" }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Enter lab report data, test results, observations..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Report Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            Lab Report Details
          </Space>
        }
        open={viewingReport !== null}
        onCancel={() => setViewingReport(null)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setViewingReport(null)}>
            Close
          </Button>,
          <Button 
            key="print" 
            type="primary" 
            icon={<PrinterOutlined />}
            onClick={handlePrint}
          >
            Print / Save as PDF
          </Button>,
        ]}
      >
        {viewingReport && (
          <div ref={reportRef} style={{ padding: "16px", fontFamily: "Arial, sans-serif" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <h2 style={{ color: '#1890ff', marginBottom: 8 }}>ClinicWise Laboratory</h2>
              <p style={{ color: '#666' }}>Comprehensive Lab Testing Report</p>
              <Divider />
            </div>

            <div style={{ marginBottom: 16 }}>
              <Space size={50}>
                <div>
                  <span style={{ fontWeight: "bold" }}>Patient Name:</span> {viewingReport.patientName}
                </div>
                <div>
                  <span style={{ fontWeight: "bold" }}>Token:</span> {viewingReport.token}
                </div>
              </Space>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h3>Test Results</h3>
              <Table
                size="small"
                dataSource={viewingReport.testTypes.map((t, idx) => ({
                  key: viewingReport.ids[idx],
                  test: t,
                  date: viewingReport.dates[idx],
                  status: viewingReport.statuses[idx],
                  description: viewingReport.descriptions[idx] || "No description",
                }))}
                pagination={false}
                columns={[
                  { title: "Test", dataIndex: "test", key: "test" },
                  { title: "Date", dataIndex: "date", key: "date" },
                  {
                    title: "Status",
                    dataIndex: "status",
                    key: "status",
                    render: (status: string) => (
                      <Tag color={getStatusColor(status)}>
                        {status}
                      </Tag>
                    ),
                  },
                  { title: "Description", dataIndex: "description", key: "description" },
                ]}
              />
            </div>

            <div style={{ marginTop: 24, textAlign: "right" }}>
              <span style={{ fontWeight: "bold" }}>Doctor Signature:</span>
              <div
                style={{ marginTop: 32, borderTop: "1px solid #000", width: 200, marginLeft: "auto" }}
              ></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}