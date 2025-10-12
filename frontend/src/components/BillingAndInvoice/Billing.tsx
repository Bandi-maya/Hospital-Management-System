import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Tag,
  Space,
  Button,
  Avatar,
  Badge,
  Tabs,
  Timeline,
  Descriptions,
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  Switch,
  Table,
  Tooltip,
  message,
  Statistic,
  Skeleton,
  Popconfirm,
  Dropdown,
  Menu,
  Divider,
  Typography,
  Progress
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  TableOutlined,
  DashboardOutlined,
  SearchOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DollarOutlined,
  DownloadOutlined,
  FilterOutlined,
  MoreOutlined,
  PrinterOutlined,
  HistoryOutlined,
  CopyOutlined,
  CreditCardOutlined,
  BankOutlined,
  QrcodeOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { getApi, PostApi, PutApi } from "@/ApiService";
import dayjs from "dayjs";
import { toast } from "sonner";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface MedicineItem {
  medicine_id: string;
  quantity: number;
}

interface TestItem {
  test_id: string;
}

interface SurgeryItem {
  surgery_id: string;
}

interface Billing {
  id?: string;
  patient_id: string;
  doctor_id: string;
  medicines: MedicineItem[];
  tests: TestItem[];
  surgeries: SurgeryItem[];
  notes: string;
  status?: "PENDING" | "PAID" | "CANCELLED";
  created_at?: string;
  total_amount?: number;
  patient?: any;
  doctor?: any;
}

export default function BillingPage() {
  const [billings, setBillings] = useState<Billing[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [surgeries, setSurgeries] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  const [form, setForm] = useState<Partial<Billing>>({
    patient_id: "",
    doctor_id: "",
    medicines: [{ medicine_id: "", quantity: 1 }],
    tests: [{ test_id: "" }],
    surgeries: [{ surgery_id: "" }],
    notes: "",
  });

  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState("billings");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: "",
    transaction_ref_id: "",
  });
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  const loginData = JSON.parse(localStorage.getItem("loginData") || "{}");

  useEffect(() => {
    loadInitialData();
    loadBilling();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const t = setInterval(() => {
        loadBilling();
        message.info("🔄 Billing data refreshed");
      }, 30000);
      return () => clearInterval(t);
    }
  }, [autoRefresh]);

  const loadInitialData = () => {
    setLoading(true);
    Promise.all([
      getApi("/medicines"),
      getApi("/surgery"),
      getApi("/lab-tests"),
      getApi("/users?user_type=PATIENT"),
      getApi("/users?user_type=DOCTOR"),
    ])
      .then(([meds, surgeriesRes, testsRes, pats, docs]) => {
        if (!meds.error) setInventory(meds.data);
        else toast.error(meds.error);

        if (!surgeriesRes.error) setSurgeries(surgeriesRes.data);
        else toast.error(surgeriesRes.error);

        if (!testsRes.error) setTests(testsRes.data);
        else toast.error(testsRes.error);

        if (!pats.error) setPatients(pats.data);
        else toast.error(pats.error);

        if (!docs.error) setDoctors(docs.data);
        else toast.error(docs.error);
      })
      .catch((err) => {
        console.error("Initial load error:", err);
        toast.error("Failed to load initial data");
      })
      .finally(() => setLoading(false));
  };

  const loadBilling = () => {
    setLoading(true);
    getApi("/billing")
      .then((data) => {
        if (!data.error) setBillings(data.data);
        else toast.error(data.error);
      })
      .catch((err) => {
        console.error("Billing load error:", err);
        toast.error("Failed to load billings");
      })
      .finally(() => setLoading(false));
  };

  const resetForm = () => {
    setForm({
      patient_id: "",
      doctor_id: "",
      medicines: [{ medicine_id: "", quantity: 1 }],
      tests: [{ test_id: "" }],
      notes: "",
    });
    setSelectedBilling(null);
  };

  // Enhanced Action Button Component
  const ActionButton = ({
    icon,
    label,
    type = "default",
    danger = false,
    onClick,
    loading = false,
    confirm = false,
    confirmAction,
    disabled = false
  }: {
    icon: React.ReactNode;
    label: string;
    type?: "primary" | "default" | "dashed" | "link" | "text";
    danger?: boolean;
    onClick?: () => void;
    loading?: boolean;
    confirm?: boolean;
    confirmAction?: () => void;
    disabled?: boolean;
  }) => {
    const button = (
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Tooltip title={label} placement="top">
          <Button
            type={type}
            danger={danger}
            icon={icon}
            loading={loading}
            onClick={onClick}
            disabled={disabled}
            className={`
              flex items-center justify-center 
              transition-all duration-300 ease-in-out
              ${!danger && !type.includes('primary') ?
                'text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-gray-300 hover:border-blue-300' : ''
              }
              ${danger ?
                'hover:text-red-600 hover:bg-red-50 border-gray-300 hover:border-red-300' : ''
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              w-10 h-10 rounded-full
            `}
            style={{
              minWidth: '40px',
              border: '1px solid #d9d9d9'
            }}
          />
        </Tooltip>
      </motion.div>
    );

    return confirm ? (
      <Popconfirm
        title={label}
        description="Are you sure you want to perform this action?"
        onConfirm={confirmAction}
        okText="Yes"
        cancelText="No"
        okType="danger"
        placement="top"
        disabled={disabled}
      >
        {button}
      </Popconfirm>
    ) : (
      button
    );
  };

  const handleAddOrUpdate = () => {
    form.doctor_id = loginData?.id || "";

    if (!form.patient_id || !form.medicines || form.medicines.length === 0) {
      toast.error("Please fill patient and medicines.");
      return;
    }
    for (let med of form.medicines) {
      if (!med.medicine_id || med.quantity <= 0) {
        toast.error("Medicine fields invalid.");
        return;
      }
    }

    setLoadingActionId(selectedBilling?.id || 'new');

    if (selectedBilling && selectedBilling.id) {
      const payload = { ...selectedBilling, ...form };
      PutApi("/billing", payload)
        .then((data) => {
          if (!data.error) {
            loadBilling();
            toast.success("Billing updated");
          } else toast.error(data.error);
        })
        .catch((err) => {
          console.error("Update error:", err);
          toast.error("Failed to update billing");
        })
        .finally(() => setLoadingActionId(null));
    } else {
      const payload: Billing = {
        patient_id: form.patient_id!,
        doctor_id: form.doctor_id!,
        medicines: form.medicines!,
        surgeries: form.surgeries!,
        tests: form.tests!,
        notes: form.notes || "",
        status: "PENDING",
      };
      PostApi("/billing", payload)
        .then((data) => {
          if (!data.error) {
            loadBilling();
            toast.success("Billing created");
          } else toast.error(data.error);
        })
        .catch((err) => {
          console.error("Create error:", err);
          toast.error("Failed to create billing");
        })
        .finally(() => setLoadingActionId(null));
    }

    resetForm();
    setIsModalOpen(false);
  };

  const openPaymentModal = (billing: Billing) => {
    setSelectedBilling(billing);
    setPaymentForm({
      amount: billing.total_amount || 0,
      method: "",
      transaction_ref_id: "",
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = () => {
    const { amount, method, transaction_ref_id } = paymentForm;

    if (!amount || !method) {
      toast.error("Amount and method are required");
      return;
    }

    if (["UPI", "CARD", "ONLINE"].includes(method.toUpperCase()) && !transaction_ref_id) {
      toast.error("Transaction Ref ID is required for online payments");
      return;
    }

    setLoadingActionId(selectedBilling?.id || 'payment');

    const payload = {
      amount,
      method,
      transaction_ref_id: transaction_ref_id || null,
    };

    PostApi(`/billing/${selectedBilling?.id}/payments`, payload)
      .then((res) => {
        if (!res.error) {
          toast.success("Payment successful");
          loadBilling();
          setIsPaymentModalOpen(false);
        } else {
          toast.error(res.error);
        }
      })
      .catch((err) => {
        console.error("Payment error:", err);
        toast.error("Payment failed");
      })
      .finally(() => setLoadingActionId(null));
  };

  const handleEdit = (b: Billing) => {
    setSelectedBilling(b);
    setForm({ ...b });
    setIsModalOpen(true);
  };

  const handleView = (b: Billing) => {
    setSelectedBilling(b);
    setIsViewModalOpen(true);
  };

  const handleStatusChange = (b: Billing, newStatus: string) => {
    setLoadingActionId(b.id!);
    const payload = { ...b, status: newStatus };
    PutApi("/billing", payload)
      .then((data) => {
        if (!data.error) {
          loadBilling();
          toast.success(`Marked ${newStatus}`);
        } else toast.error(data.error);
      })
      .catch((err) => {
        console.error("Status change error:", err);
        toast.error("Failed to change status");
      })
      .finally(() => setLoadingActionId(null));
  };

  const handleMedicineChange = (
    idx: number,
    field: "medicine_id" | "quantity",
    value: any
  ) => {
    const newMeds = [...(form.medicines || [])];
    newMeds[idx] = { ...newMeds[idx], [field]: value };
    setForm({ ...form, medicines: newMeds });
  };

  const handleSurgeryChange = (
    idx: number,
    field: "surgery_id",
    value: any
  ) => {
    const newMeds = [...(form.surgeries || [])];
    newMeds[idx] = { ...newMeds[idx], [field]: value };
    setForm({ ...form, surgeries: newMeds });
  };

  const handleTestChange = (
    idx: number,
    field: "test_id",
    value: any
  ) => {
    const newTests = [...(form.tests || [])];
    newTests[idx] = { ...newTests[idx], [field]: value };
    setForm({ ...form, tests: newTests });
  };

  const addMedicineField = () => {
    const newMeds = [...(form.medicines || []), { medicine_id: "", quantity: 1 }];
    setForm({ ...form, medicines: newMeds });
  };

  const removeMedicineField = (idx: number) => {
    const newMeds = (form.medicines || []).filter((_, i) => i !== idx);
    setForm({ ...form, medicines: newMeds });
  };

  const addTestField = () => {
    const newTests = [...(form.tests || []), { test_id: "" }];
    setForm({ ...form, tests: newTests });
  };

  const removeTestField = (idx: number) => {
    const newTests = (form.tests || []).filter((_, i) => i !== idx);
    setForm({ ...form, tests: newTests });
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "PAID":
        return "green";
      case "PENDING":
        return "orange";
      case "CANCELLED":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case "PAID":
        return <CheckCircleOutlined />;
      case "PENDING":
        return <ClockCircleOutlined />;
      case "CANCELLED":
        return <CloseCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const filtered = billings.filter((b) => {
    const matchesSearch =
      !searchText ||
      String(b.patient_id).includes(searchText) ||
      String(b.doctor_id).includes(searchText);
    const matchesStatus =
      statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: billings.length,
    paid: billings.filter(b => b.status === 'PAID').length,
    pending: billings.filter(b => b.status === 'PENDING').length,
    cancelled: billings.filter(b => b.status === 'CANCELLED').length,
    totalRevenue: billings.filter(b => b.status === 'PAID').reduce((sum, b) => sum + (b.total_amount || 0), 0)
  };

  const SkeletonTable = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((item) => (
        <Card key={item} className="p-4 border-0 shadow-sm">
          <Skeleton active paragraph={{ rows: 1 }} />
        </Card>
      ))}
    </div>
  );

  const SkeletonStats = () => (
    <Row gutter={[16, 16]}>
      {[1, 2, 3, 4].map((item) => (
        <Col xs={24} sm={12} lg={6} key={item}>
          <Card className="border-0 shadow-sm">
            <Skeleton active paragraph={{ rows: 1 }} />
          </Card>
        </Col>
      ))}
    </Row>
  );

  const columns = [
    {
      title: <Space><UserOutlined /> Billing Info</Space>,
      key: "info",
      render: (_: any, rec: Billing) => (
        <Space align="center">
          <Avatar 
            icon={<FileTextOutlined />} 
            size="small" 
            style={{ 
              backgroundColor: getStatusColor(rec.status),
              borderRadius: '8px'
            }} 
          />
          <div>
            <div className="font-medium">
              {patients.find(p => p.id === rec.patient_id)?.name || rec.patient_id}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              <FileTextOutlined /> {dayjs(rec.created_at).format("MMM D, YYYY")}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: <Space><MedicineBoxOutlined /> Items</Space>,
      key: "items",
      render: (_: any, rec: Billing) => (
        <Space direction="vertical">
          <div className="flex items-center gap-2">
            <MedicineBoxOutlined className="text-gray-400" />
            {rec.medicines.length} medicines
          </div>
          <div className="flex items-center gap-2">
            <ExperimentOutlined className="text-gray-400" />
            {rec.tests?.length || 0} tests
          </div>
          {rec.total_amount !== undefined && (
            <div className="font-medium text-green-600">
              Total: ${rec.total_amount}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: <Space><FileTextOutlined /> Status</Space>,
      key: "status",
      render: (_: any, rec: Billing) => (
        <Badge 
          status={rec.status === 'PAID' ? 'success' : rec.status === 'PENDING' ? 'processing' : 'error'}
          text={rec.status || "PENDING"}
          className="px-2 py-1"
        />
      ),
    },
    {
      title: <Space><ThunderboltOutlined /> Actions</Space>,
      key: "actions",
      width: 200,
      render: (_: any, rec: Billing) => (
        <Space size="small">
          <ActionButton
            icon={<EyeOutlined />}
            label="View Details"
            type="default"
            onClick={() => handleView(rec)}
          />

          <ActionButton
            icon={<EditOutlined />}
            label="Edit Billing"
            type="default"
            loading={loadingActionId === rec.id}
            onClick={() => handleEdit(rec)}
            disabled={rec.status === "PAID"}
          />

          <ActionButton
            icon={<DollarOutlined />}
            label="Make Payment"
            type="primary"
            loading={loadingActionId === rec.id}
            onClick={() => openPaymentModal(rec)}
            disabled={rec.status === "PAID"}
          />

          <Dropdown
            overlay={
              <Menu>
                <Menu.Item 
                  key="mark-paid" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleStatusChange(rec, "PAID")}
                  disabled={rec.status === "PAID"}
                >
                  Mark as Paid
                </Menu.Item>
                <Menu.Item 
                  key="mark-cancelled" 
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleStatusChange(rec, "CANCELLED")}
                >
                  Mark as Cancelled
                </Menu.Item>
                <Menu.Item key="print" icon={<PrinterOutlined />}>
                  Print Invoice
                </Menu.Item>
                <Menu.Item key="duplicate" icon={<CopyOutlined />}>
                  Duplicate Billing
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
            placement="bottomRight"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Tooltip title="More actions" placement="top">
                <Button 
                  type="text" 
                  icon={<MoreOutlined />}
                  className="w-10 h-10 rounded-full border border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                />
              </Tooltip>
            </motion.div>
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Billing Management</h1>
            <p className="text-gray-600 mt-1 text-base">Manage patient billing and payments</p>
          </div>
          <Space>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                icon={<ReloadOutlined />}
                onClick={loadBilling}
                loading={loading}
                className="h-12 px-4 border-gray-300"
              >
                Refresh
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                size="large"
                className="h-12 px-6 text-base font-medium bg-blue-600 hover:bg-blue-700"
              >
                Add Billing
              </Button>
            </motion.div>
          </Space>
        </div>
      </div>

      {/* Statistics Grid */}
      {loading ? (
        <SkeletonStats />
      ) : (
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <Statistic
                title="Total Billings"
                value={stats.total}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <Statistic
                title="Paid"
                value={stats.paid}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <Statistic
                title="Pending"
                value={stats.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <Statistic
                title="Total Revenue"
                value={stats.totalRevenue}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#52c41a' }}
                formatter={value => `$${value}`}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Auto Refresh Toggle */}
      <Card className="bg-white border-0 shadow-sm rounded-xl mb-6">
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ReloadOutlined className="text-blue-600" />
              <div>
                <div className="font-medium">Auto Refresh</div>
                <div className="text-sm text-gray-500">Automatically refresh data every 30 seconds</div>
              </div>
            </div>
            <Switch
              checked={autoRefresh}
              onChange={setAutoRefresh}
              checkedChildren="On"
              unCheckedChildren="Off"
            />
          </div>
        </div>
      </Card>

      {/* Main Content Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'billings',
            label: (
              <Space>
                <TableOutlined />
                All Billings
                <Badge count={filtered.length} />
              </Space>
            ),
            children: (
              <Card className="border-0 shadow-sm rounded-xl">
                {/* Search and Filters */}
                <div className="p-5 border-b">
                  <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                      <Input
                        placeholder="Search billings..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        size="large"
                        className="hover:border-blue-400 focus:border-blue-500"
                      />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                      <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        size="large"
                        className="w-full"
                        suffixIcon={<FilterOutlined />}
                      >
                        <Option value="all">All Status</Option>
                        <Option value="PAID">Paid</Option>
                        <Option value="PENDING">Pending</Option>
                        <Option value="CANCELLED">Cancelled</Option>
                      </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          icon={<DownloadOutlined />}
                          size="large"
                          className="w-full border-gray-300 hover:border-blue-400"
                        >
                          Export
                        </Button>
                      </motion.div>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileTextOutlined />
                        <span>{filtered.length} billings found</span>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Table */}
                <div className="p-6">
                  {loading ? (
                    <SkeletonTable />
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-12">
                      <FileTextOutlined className="text-4xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium mb-2">No billings found</p>
                      <p className="text-gray-400 text-sm max-w-sm mx-auto">
                        {searchText || statusFilter !== "all" 
                          ? "Try adjusting your search or filters" 
                          : "Get started by adding your first billing"
                        }
                      </p>
                      {(searchText || statusFilter !== "all") && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            type="primary" 
                            onClick={() => {
                              setSearchText("");
                              setStatusFilter("all");
                            }}
                            className="mt-4"
                          >
                            Clear Filters
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <Table
                      columns={columns}
                      dataSource={filtered}
                      rowKey="id"
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} of ${total} billings`,
                      }}
                      scroll={{ x: 'max-content' }}
                    />
                  )}
                </div>
              </Card>
            )
          },
          {
            key: 'activity',
            label: (
              <Space>
                <DashboardOutlined />
                Activity Timeline
              </Space>
            ),
            children: (
              <Card className="border-0 shadow-sm rounded-xl">
                <div className="p-6">
                  <Timeline>
                    {billings.slice(0, 10).map((b) => (
                      <Timeline.Item
                        key={b.id}
                        color={getStatusColor(b.status)}
                        dot={getStatusIcon(b.status)}
                      >
                        <div className="font-medium">
                          {patients.find(p => p.id === b.patient_id)?.name || b.patient_id}
                        </div>
                        <div className="text-gray-600">
                          {dayjs(b.created_at).fromNow()} — {b.medicines.length} meds, {b.tests?.length || 0} tests
                        </div>
                        {b.total_amount && (
                          <div className="text-green-600 font-medium">
                            ${b.total_amount}
                          </div>
                        )}
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </div>
              </Card>
            )
          }
        ]}
      />

      {/* Payment Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <DollarOutlined className="text-green-600 text-lg" />
            <span className="text-lg font-semibold">Make Payment</span>
          </div>
        }
        open={isPaymentModalOpen}
        onCancel={() => setIsPaymentModalOpen(false)}
        onOk={handlePaymentSubmit}
        okText="Confirm Payment"
        width={500}
        okButtonProps={{ 
          size: 'large',
          loading: loadingActionId !== null,
          icon: <DollarOutlined />
        }}
        cancelButtonProps={{ size: 'large' }}
        confirmLoading={loadingActionId !== null}
      >
        <Form layout="vertical">
          <Form.Item label="Amount" required>
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              value={paymentForm.amount}
              onChange={(val) =>
                setPaymentForm({ ...paymentForm, amount: val || 0 })
              }
              size="large"
              prefix="$"
            />
          </Form.Item>

          <Form.Item label="Payment Method" required>
            <Select
              value={paymentForm.method}
              onChange={(val) =>
                setPaymentForm({ ...paymentForm, method: val, transaction_ref_id: "" })
              }
              size="large"
            >
              <Option value="CASH">
                <Space>
                  <DollarOutlined />
                  Cash
                </Space>
              </Option>
              <Option value="CARD">
                <Space>
                  <CreditCardOutlined />
                  Card
                </Space>
              </Option>
              <Option value="UPI">
                <Space>
                  <QrcodeOutlined />
                  UPI
                </Space>
              </Option>
              <Option value="ONLINE">
                <Space>
                  <BankOutlined />
                  Online
                </Space>
              </Option>
            </Select>
          </Form.Item>

          {["CARD", "UPI", "ONLINE"].includes(paymentForm.method) && (
            <Form.Item label="Transaction Reference ID" required>
              <Input
                value={paymentForm.transaction_ref_id}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, transaction_ref_id: e.target.value })
                }
                size="large"
                placeholder="Enter transaction reference"
              />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Add/Edit Billing Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <FileTextOutlined className="text-blue-600 text-lg" />
            <span className="text-lg font-semibold">
              {selectedBilling ? "Edit Billing" : "Add New Billing"}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); resetForm(); }}
        onOk={handleAddOrUpdate}
        width={700}
        okButtonProps={{ 
          size: 'large',
          loading: loadingActionId !== null,
          icon: selectedBilling ? <EditOutlined /> : <PlusOutlined />
        }}
        cancelButtonProps={{ size: 'large' }}
        confirmLoading={loadingActionId !== null}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Patient" required>
                <Select
                  value={form.patient_id}
                  onChange={(val) => setForm({ ...form, patient_id: val })}
                  size="large"
                  placeholder="Select patient"
                >
                  {patients.map((p) => (
                    <Option key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <UserOutlined />
                        {p.name}
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Doctor">
                <Input
                  value={doctors.find(d => d.id === form.doctor_id)?.name || loginData.name}
                  disabled
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Medicines">
            {(form.medicines || []).map((med, idx) => (
              <Space key={idx} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                <Select
                  placeholder="Select medicine"
                  value={med.medicine_id}
                  onChange={(val) => handleMedicineChange(idx, "medicine_id", val)}
                  style={{ width: 200 }}
                  size="large"
                >
                  {inventory.map((m) => (
                    <Option key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <MedicineBoxOutlined />
                        {m.name}
                      </div>
                    </Option>
                  ))}
                </Select>
                <InputNumber
                  value={med.quantity}
                  onChange={(val) => handleMedicineChange(idx, "quantity", val || 1)}
                  min={1}
                  size="large"
                  placeholder="Qty"
                />
                <Button danger onClick={() => removeMedicineField(idx)} size="large">
                  Remove
                </Button>
              </Space>
            ))}
            <Button type="dashed" onClick={addMedicineField} icon={<PlusOutlined />} size="large">
              Add Medicine
            </Button>
          </Form.Item>

          <Form.Item label="Tests">
            {(form.tests || []).map((t, idx) => (
              <Space key={idx} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                <Select
                  placeholder="Select test"
                  value={t.test_id}
                  onChange={(val) => handleTestChange(idx, "test_id", val)}
                  style={{ width: 200 }}
                  size="large"
                >
                  {tests.map((tt) => (
                    <Option key={tt.id} value={tt.id}>
                      <div className="flex items-center gap-2">
                        <ExperimentOutlined />
                        {tt.name}
                      </div>
                    </Option>
                  ))}
                </Select>
                <Button danger onClick={() => removeTestField(idx)} size="large">
                  Remove
                </Button>
              </Space>
            ))}
            <Button type="dashed" onClick={addTestField} icon={<PlusOutlined />} size="large">
              Add Test
            </Button>
          </Form.Item>

          <Form.Item label="Notes">
            <TextArea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              size="large"
              placeholder="Additional notes for this billing..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Billing Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <EyeOutlined className="text-blue-600 text-lg" />
            <span className="text-lg font-semibold">Billing Details</span>
          </div>
        }
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => window.print()} size="large">
            Print Invoice
          </Button>,
          <Button key="close" onClick={() => setIsViewModalOpen(false)} size="large">
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedBilling && (
          <div id="billing-print-area">
            <Descriptions bordered column={1} size="default">
              <Descriptions.Item label="Patient">
                <div className="flex items-center gap-2">
                  <UserOutlined />
                  {patients.find(p => p.id === selectedBilling.patient_id)?.name || selectedBilling.patient_id}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Doctor">
                <div className="flex items-center gap-2">
                  <UserOutlined />
                  {doctors.find(d => d.id === selectedBilling.doctor_id)?.name || selectedBilling.doctor_id}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Badge 
                  status={selectedBilling.status === 'PAID' ? 'success' : selectedBilling.status === 'PENDING' ? 'processing' : 'error'}
                  text={selectedBilling.status}
                  className="px-2 py-1"
                />
              </Descriptions.Item>
              <Descriptions.Item label="Medicines">
                {selectedBilling.medicines.map((med, i) => (
                  <div key={i} className="flex items-center gap-2 py-1">
                    <MedicineBoxOutlined className="text-gray-400" />
                    {inventory.find(m => m.id === med.medicine_id)?.name || med.medicine_id} 
                    <Tag color="blue">Qty: {med.quantity}</Tag>
                  </div>
                ))}
              </Descriptions.Item>
              {selectedBilling.tests && selectedBilling.tests.length > 0 && (
                <Descriptions.Item label="Tests">
                  {selectedBilling.tests.map((tt, i) => (
                    <div key={i} className="flex items-center gap-2 py-1">
                      <ExperimentOutlined className="text-gray-400" />
                      {tests.find(t => t.id === tt.test_id)?.name || tt.test_id}
                    </div>
                  ))}
                </Descriptions.Item>
              )}
              {selectedBilling.notes && (
                <Descriptions.Item label="Notes">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {selectedBilling.notes}
                  </div>
                </Descriptions.Item>
              )}
              {selectedBilling.total_amount !== undefined && (
                <Descriptions.Item label="Total Amount">
                  <div className="text-2xl font-bold text-green-600">
                    ${selectedBilling.total_amount}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}