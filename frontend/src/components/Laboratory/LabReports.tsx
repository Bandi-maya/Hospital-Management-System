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
  message,
  Skeleton,
  Row,
  Col,
  Statistic
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
  PrinterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { getApi, PutApi } from "@/ApiService";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  async function loadTests(page = 1, limit = 10, searchQuery = search) {
    setLoading(true);
    await getApi(`/lab-reports?page=${page}&limit=${limit}&q=${searchQuery}`)
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
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    loadTests()
  }, [])

  // Auto refresh notifier
  // useEffect(() => {
  //   if (autoRefresh) {
  //     const interval = setInterval(() => {
  //       message.info("🔄 Auto-refresh: Lab reports data reloaded");
  //       loadTests();
  //     }, 30000);
  //     return () => clearInterval(interval);
  //   }
  // }, [autoRefresh]);

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
    setActionLoading('save');
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
      })
        .finally(() => {
          setActionLoading(null);
        });

      setIsModalOpen(false);
      setEditingReport(null);
      form.resetFields();
    });
  };

  const filteredReports = reports
    // .filter((rep) => filter === "all" || rep.statuses.includes(filter));

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
      case "COMPLETED": return "green";
      case "IN_PROGRESS": return "blue";
      case "PENDING": return "orange";
      case "Available": return "blue";
      case "Not Available": return "red";
      case "Completed": return "green";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "Completed":
        return <CheckCircleOutlined />;
      case "IN_PROGRESS":
      case "Available":
        return <SyncOutlined />;
      case "PENDING":
      case "Not Available":
        return <ClockCircleOutlined />;
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
    totalReports: reports.length,
    completedReports: reports.filter((r: any) => r.lab_request?.status === "COMPLETED").length,
    inProgressReports: reports.filter((r: any) => r.lab_request?.status === "IN_PROGRESS").length,
    pendingReports: reports.filter((r: any) => r.lab_request?.status === "PENDING").length
  };

  const handleTableChange = (newPagination: any) => {
    loadTests(newPagination.current, newPagination.pageSize);
  };

  const columns: ColumnsType<Report> = [
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
            <div className="font-semibold text-gray-900">{record.lab_request?.patient?.username}</div>
            <div className="text-sm text-gray-500">
              Patient ID: {record.lab_request?.patient?.id}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Requested by: {record.lab_request?.requester?.username}
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
      key: "test",
      render: (_, record: any) => (
        <Space direction="vertical" size={0}>
          <div className="font-semibold text-gray-900">{record.lab_request?.test?.name}</div>
          <div className="text-sm text-gray-500">
            Laboratory Test
          </div>
          {record.lab_request?.test?.description && (
            <div className="text-xs text-gray-400 mt-1">
              {record.lab_request.test.description.length > 50
                ? `${record.lab_request.test.description.substring(0, 50)}...`
                : record.lab_request.test.description
              }
            </div>
          )}
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <FileTextOutlined className="text-green-600" />
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
      dataIndex: ["lab_request", "status"],
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
            icon={<EyeOutlined />}
            label="View Report Details"
            type="default"
            onClick={() => setViewingReport(record)}
          />

          <ActionButton
            icon={<EditOutlined />}
            label="Edit Report"
            type="primary"
            onClick={() => handleEditReport(record)}
          />

          <ActionButton
            icon={<DeleteOutlined />}
            label="Delete Report"
            type="default"
            danger={true}
            onClick={() => handleDeleteReport(record.patientId)}
          />
        </Space>
      ),
    },
  ];

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
                <h1 className="text-3xl font-bold text-gray-900">Laboratory Reports</h1>
                <p className="text-gray-600 mt-1">Manage and track all laboratory test reports and results</p>
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

              <Tooltip title="Add New Report">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingReport(null);
                      form.resetFields();
                      setIsModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-md"
                    size="large"
                  >
                    <RocketOutlined /> New Report
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
                title="Total Reports"
                value={stats.totalReports}
                prefix={<FileTextOutlined className="text-blue-600" />}
                valueStyle={{ color: '#1d4ed8' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-sm border-0 bg-gradient-to-br from-orange-50 to-orange-100">
              <Statistic
                title="Pending"
                value={stats.pendingReports}
                prefix={<ClockCircleOutlined className="text-orange-600" />}
                valueStyle={{ color: '#ea580c' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-sm border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <Statistic
                title="In Progress"
                value={stats.inProgressReports}
                prefix={<SyncOutlined className="text-blue-600" />}
                valueStyle={{ color: '#2563eb' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-sm border-0 bg-gradient-to-br from-green-50 to-green-100">
              <Statistic
                title="Completed"
                value={stats.completedReports}
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
              <span className="text-xl font-semibold text-gray-900">Laboratory Reports</span>
              <Tag color="blue" className="ml-2 text-lg font-semibold px-3 py-1">
                {filteredReports.length} reports
              </Tag>
            </div>
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <Input.Search
                placeholder="Search by patient name or test type..."
                value={search}
                onSearch={() => { loadTests(pagination.current, pagination.pageSize, search) }}
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

      {/* Reports Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <Card className="shadow-lg rounded-xl border-0 overflow-hidden">
          <Table
            columns={columns}
            dataSource={filteredReports}
            rowKey="id"
            onChange={handleTableChange}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} reports`,
              className: "px-6 py-4"
            }}
            scroll={{ x: "max-content" }}
            rowClassName="hover:bg-blue-50 transition-colors duration-200"
            className="rounded-lg"
          />
        </Card>
      )}

      {/* Edit Report Modal */}
      <Modal
        title={
          <Space>
            <div className="p-2 bg-blue-100 rounded-lg">
              <EditOutlined className="text-blue-600" />
            </div>
            <span className="text-lg font-semibold">Edit Laboratory Report</span>
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
        okText="Save Report"
        confirmLoading={actionLoading === 'save'}
        styles={{
          body: { padding: '24px' }
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name={["report_data", "data"]}
            label="Test Results & Findings"
            rules={[{ required: true, message: "Please enter report data" }]}
          >
            <Input.TextArea
              rows={6}
              placeholder="Enter detailed test results, observations, findings, and recommendations..."
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Report Modal */}
      <Modal
        title={
          <Space>
            <div className="p-2 bg-green-100 rounded-lg">
              <EyeOutlined className="text-green-600" />
            </div>
            <span className="text-lg font-semibold">Laboratory Report Details</span>
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
        styles={{
          body: { padding: '24px' }
        }}
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