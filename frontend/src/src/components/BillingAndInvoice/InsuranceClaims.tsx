import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  DatePicker,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  Popconfirm,
  Tooltip,
  message,
  Card,
  Descriptions,
  Divider
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  TeamOutlined,
  DashboardOutlined,
  UserOutlined,
  InsuranceOutlined,
  DollarOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  SafetyCertificateOutlined,
  IdcardOutlined,
  MailOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

interface InsuranceClaim {
  id: string;
  claimId: string;
  patientName: string;
  insuranceProvider: string;
  claimAmount: number;
  claimDate: string;
  status: "Pending" | "Approved" | "Rejected" | "Processing";
}

export default function InsuranceClaims() {
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<InsuranceClaim[]>([]);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Modals
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const [form] = Form.useForm();

  // Load mock claims
  useEffect(() => {
    const mockData: InsuranceClaim[] = [
      {
        id: "1",
        claimId: "CLM-001",
        patientName: "John Doe",
        insuranceProvider: "MediCare Plus",
        claimAmount: 12000,
        claimDate: "2025-09-20",
        status: "Pending",
      },
      {
        id: "2",
        claimId: "CLM-002",
        patientName: "Jane Smith",
        insuranceProvider: "LifeSecure",
        claimAmount: 8500,
        claimDate: "2025-09-15",
        status: "Approved",
      },
      {
        id: "3",
        claimId: "CLM-003",
        patientName: "Michael Brown",
        insuranceProvider: "HealthFirst",
        claimAmount: 5000,
        claimDate: "2025-09-10",
        status: "Rejected",
      },
    ];
    setClaims(mockData);
    setFilteredClaims(mockData);
  }, []);

  // Auto refresh notifier
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        message.info("🔄 Auto-refresh: Claims data reloaded");
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Search & filter
  useEffect(() => {
    let filtered = [...claims];

    if (searchText) {
      filtered = filtered.filter(
        (c) =>
          c.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
          c.claimId.toLowerCase().includes(searchText.toLowerCase()) ||
          c.insuranceProvider.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (dateRange) {
      filtered = filtered.filter((c) => {
        const date = dayjs(c.claimDate);
        return (
          date.isAfter(dateRange[0], "day") &&
          date.isBefore(dateRange[1], "day")
        );
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    setFilteredClaims(filtered);
  }, [searchText, dateRange, statusFilter, claims]);

  const handleDelete = (id: string) => {
    const updated = claims.filter((c) => c.id !== id);
    setClaims(updated);
    setFilteredClaims(updated);
    message.success("Claim deleted successfully");
  };

  const handleView = (claim: InsuranceClaim) => {
    setSelectedClaim(claim);
    setIsViewModalVisible(true);
  };

  const handleEdit = (claim: InsuranceClaim) => {
    setSelectedClaim(claim);
    form.setFieldsValue({
      ...claim,
      claimDate: dayjs(claim.claimDate),
    });
    setIsEditModalVisible(true);
  };

  const handleUpdate = () => {
    form
      .validateFields()
      .then((values) => {
        const updated = claims.map((c) =>
          c.id === selectedClaim?.id
            ? {
                ...c,
                ...values,
                claimDate: values.claimDate.format("YYYY-MM-DD"),
              }
            : c
        );
        setClaims(updated);
        setFilteredClaims(updated);
        setIsEditModalVisible(false);
        message.success("Claim updated successfully");
      })
      .catch(() => {});
  };

  const handleAdd = () => {
    form
      .validateFields()
      .then((values) => {
        const newClaim: InsuranceClaim = {
          id: String(Date.now()),
          claimId: `CLM-${claims.length + 1}`,
          patientName: values.patientName,
          insuranceProvider: values.insuranceProvider,
          claimAmount: values.claimAmount,
          claimDate: values.claimDate.format("YYYY-MM-DD"),
          status: values.status,
        };
        const updated = [...claims, newClaim];
        setClaims(updated);
        setFilteredClaims(updated);
        setIsAddModalVisible(false);
        form.resetFields();
        message.success("New claim added successfully");
      })
      .catch(() => {});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "green";
      case "Rejected": return "red";
      case "Pending": return "orange";
      case "Processing": return "blue";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved": return <SafetyCertificateOutlined />;
      case "Rejected": return <CloseCircleOutlined />;
      case "Pending": return <SyncOutlined />;
      case "Processing": return <DashboardOutlined />;
      default: return <DashboardOutlined />;
    }
  };

  const resetFilters = () => {
    setSearchText("");
    setDateRange(null);
    setStatusFilter("all");
  };

  const columns: ColumnsType<InsuranceClaim> = [
    {
      title: (
        <Space>
          <IdcardOutlined />
          Claim Info
        </Space>
      ),
      key: "claim",
      render: (_, record) => (
        <Space>
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <InsuranceOutlined className="text-blue-600" />
          </div>
          <div>
            <div style={{ fontWeight: "bold" }}>{record.claimId}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              <UserOutlined /> {record.patientName}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <InsuranceOutlined />
          Provider
        </Space>
      ),
      dataIndex: "insuranceProvider",
      key: "insuranceProvider",
      render: (provider) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: "500" }}>{provider}</span>
          <div style={{ fontSize: "12px", color: "#999" }}>Insurance Provider</div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <DollarOutlined />
          Amount
        </Space>
      ),
      dataIndex: "claimAmount",
      key: "claimAmount",
      render: (amount) => (
        <Space direction="vertical" size={0}>
          <span className="font-bold text-green-600">₹{amount.toLocaleString()}</span>
          <div style={{ fontSize: "12px", color: "#999" }}>Claim Amount</div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <CalendarOutlined />
          Date
        </Space>
      ),
      dataIndex: "claimDate",
      key: "claimDate",
      render: (date) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: "500" }}>{dayjs(date).format('MMM DD, YYYY')}</span>
          <div style={{ fontSize: "12px", color: "#999" }}>
            {dayjs(date).fromNow()}
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
      render: (status) => (
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
      key: "action",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              shape="circle"
              type="primary"
              ghost
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              shape="circle"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete this claim?"
              description="Are you sure you want to delete this insurance claim? This action cannot be undone."
              onConfirm={() => handleDelete(record.id)}
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
              <InsuranceOutlined className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Insurance Claims</h1>
              <p className="text-gray-600 mt-1">Manage and track all insurance claims</p>
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

            <Tooltip title="Add New Claim">
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => {
                  form.resetFields();
                  setIsAddModalVisible(true);
                }} 
                className="bg-green-600 hover:bg-green-700"
              >
                <RocketOutlined /> Add Claim
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
              <span className="text-lg font-semibold">All Claims</span>
              <Tag color="blue" className="ml-2">
                {filteredClaims.length}
              </Tag>
            </div>
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <Input 
                placeholder="Search by patient, claim ID, or provider..." 
                value={searchText} 
                onChange={(e) => setSearchText(e.target.value)} 
                prefix={<SearchOutlined />} 
                allowClear 
                style={{ width: 300 }}
              />
              <Select 
                value={statusFilter} 
                onChange={setStatusFilter} 
                style={{ width: 150 }} 
                placeholder="Filter by status"
              >
                <Option value="all">All Status</Option>
                <Option value="Pending">Pending</Option>
                <Option value="Approved">Approved</Option>
                <Option value="Rejected">Rejected</Option>
                <Option value="Processing">Processing</Option>
              </Select>
              <RangePicker 
                value={dateRange} 
                onChange={(val) => setDateRange(val as [Dayjs, Dayjs] | null)} 
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Claims Table */}
      <Card className="shadow-md rounded-lg">
        <Table 
          dataSource={filteredClaims} 
          columns={columns} 
          rowKey="id" 
          pagination={{ 
            pageSize: 10, 
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} claims`,
          }} 
          scroll={{ x: 900 }} 
          rowClassName="hover:bg-gray-50"
        />
      </Card>

      {/* View Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            Claim Details
          </Space>
        }
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedClaim && (
          <div>
            {/* Claim Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <InsuranceOutlined className="w-8 h-8 text-blue-600" />
              </div>
              <h2 style={{ margin: '8px 0', color: '#1890ff' }}>{selectedClaim.claimId}</h2>
              <Space>
                <Tag color={getStatusColor(selectedClaim.status)} icon={getStatusIcon(selectedClaim.status)}>
                  {selectedClaim.status}
                </Tag>
              </Space>
            </div>

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label={
                <Space>
                  <IdcardOutlined />
                  Claim ID
                </Space>
              }>
                {selectedClaim.claimId}
              </Descriptions.Item>
              <Descriptions.Item label={
                <Space>
                  <UserOutlined />
                  Patient Name
                </Space>
              }>
                {selectedClaim.patientName}
              </Descriptions.Item>
              <Descriptions.Item label={
                <Space>
                  <InsuranceOutlined />
                  Insurance Provider
                </Space>
              }>
                {selectedClaim.insuranceProvider}
              </Descriptions.Item>
              <Descriptions.Item label={
                <Space>
                  <DollarOutlined />
                  Claim Amount
                </Space>
              }>
                <span className="font-bold text-green-600 text-lg">
                  ₹{selectedClaim.claimAmount.toLocaleString()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label={
                <Space>
                  <CalendarOutlined />
                  Claim Date
                </Space>
              }>
                {dayjs(selectedClaim.claimDate).format('MMM DD, YYYY')}
                <div style={{ fontSize: '12px', color: '#666' }}>
                  ({dayjs(selectedClaim.claimDate).fromNow()})
                </div>
              </Descriptions.Item>
              <Descriptions.Item label={
                <Space>
                  <DashboardOutlined />
                  Status
                </Space>
              }>
                <Tag color={getStatusColor(selectedClaim.status)} icon={getStatusIcon(selectedClaim.status)}>
                  {selectedClaim.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Additional Information */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Claim Type:</span>
                <Tag color="blue">Medical Insurance</Tag>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Processing Time:</span>
                <span>3-5 business days</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Documentation:</span>
                <Tag color="green">Complete</Tag>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            Edit Claim
          </Space>
        }
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={handleUpdate}
        okText="Update"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="patientName" label="Patient Name" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item name="insuranceProvider" label="Insurance Provider" rules={[{ required: true }]}>
            <Input prefix={<InsuranceOutlined />} />
          </Form.Item>
          <Form.Item name="claimAmount" label="Claim Amount" rules={[{ required: true }]}>
            <Input type="number" prefix={<DollarOutlined />} />
          </Form.Item>
          <Form.Item name="claimDate" label="Claim Date" rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value="Pending">Pending</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
              <Option value="Processing">Processing</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Modal */}
      <Modal
        title={
          <Space>
            <PlusOutlined />
            Add Insurance Claim
          </Space>
        }
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onOk={handleAdd}
        okText="Add Claim"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="patientName" label="Patient Name" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item name="insuranceProvider" label="Insurance Provider" rules={[{ required: true }]}>
            <Input prefix={<InsuranceOutlined />} />
          </Form.Item>
          <Form.Item name="claimAmount" label="Claim Amount" rules={[{ required: true }]}>
            <Input type="number" prefix={<DollarOutlined />} />
          </Form.Item>
          <Form.Item name="claimDate" label="Claim Date" rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value="Pending">Pending</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
              <Option value="Processing">Processing</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}