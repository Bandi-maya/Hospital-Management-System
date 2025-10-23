import React, { useState, useEffect } from "react";
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
  Row,
  Col,
  Statistic,
  Skeleton,
  Avatar,
  Badge,
  Switch,
  Dropdown,
  Menu,
  Typography,
  InputNumber,
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
  MedicineBoxOutlined,
  FileTextOutlined,
  UserOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  PrinterOutlined,
  ExperimentOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  MoreOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CopyOutlined,
  HistoryOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { DeleteApi, getApi, PostApi, PutApi } from "@/ApiService";
import { useAuth } from "@/hooks/useAuth";

const { Option } = Select;
const { Title, Text } = Typography;

interface MedicineItem {
  medicine_id: string;
  quantity: number;
}

interface TestItem {
  test_id: string;
}

interface Prescription {
  id?: string;
  patient_id: string;
  doctor_id: string;
  medicines: MedicineItem[];
  tests: TestItem[];
  surgeries: TestItem[] | any;
  notes: string;
  patient?: any;
  doctor?: any;
  medicine_details?: any[];
  test_details?: any[];
  created_at?: string;
  is_billed?: boolean;
}

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [surgeries, setSurgeries] = useState<any[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [viewingPrescription, setViewingPrescription] = useState<Prescription | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const loginData = JSON.parse(localStorage.getItem('loginData') || '{}');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const handleTableChange = (newPagination: any) => {
    loadPrescriptions(newPagination.current, newPagination.pageSize);
  };

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Auto refresh notifier
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        message.info("🔄 Auto-refresh: Prescriptions data reloaded");
        loadPrescriptions();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadAllData = () => {
    setLoading(true);
    Promise.all([
      getApi('/medicines'),
      getApi('/lab-tests'),
      getApi("/users?user_type=DOCTOR"),
      getApi('/surgery-type'),
    ]).then(([data, data1, data2, data3]) => {
      if (!data.error) setInventory(data.data);
      else toast.error(data.error);

      if (!data1.error) setTests(data1.data);
      else toast.error(data1.error);

      if (!data2.error) setPatients(data2.data);
      else toast.error(data2.error);

      if (!data3.error) setSurgeries(data3.data);
      else toast.error(data3.error);

    }).catch((err) => {
      console.error("Error: ", err);
      toast.error("Error occurred while getting data.");
    }).finally(() => {
      loadPrescriptions();
    });
  };

  function loadPrescriptions(page = 1, limit = 10, searchQuery = search) {
    getApi(`/orders?order_type=prescription&page=${page}&limit=${limit}&q=${searchQuery}`)
      .then((data) => {
        if (!data.error) {
          setPrescriptions(data.data);
        } else {
          toast.error(data.error);
        }
      }).catch((err) => {
        console.error("Error: ", err);
        toast.error("Error occurred while getting prescriptions.");
      }).finally(() => setLoading(false));
  }

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
        title="Delete Prescription"
        description="Are you sure you want to delete this prescription?"
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

  const { user } = useAuth()

  const handleAddOrUpdate = (values: any) => {
    if (!values.patient_id) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      ...values,
      doctor_id: user?.id,
      user_id: values.patient_id,
      medicines: values.medicines,
      lab_tests: values.lab_tests
    }

    setLoadingActionId(editingPrescription?.id || 'new');

    if (editingPrescription) {
      PutApi('/orders', payload)
        .then((data) => {
          if (!data.error) {
            loadPrescriptions();
            toast.success("Prescription updated successfully!");
            setIsModalOpen(false);
            form.resetFields();
            setEditingPrescription(null);
          } else {
            toast.error(data.error);
          }
        }).catch((err) => {
          console.error("Error: ", err);
          toast.error("Error occurred while updating prescription.");
        }).finally(() => setLoadingActionId(null));
    } else {
      PostApi('/orders', payload)
        .then((data) => {
          if (!data.error) {
            loadPrescriptions();
            toast.success("Prescription added successfully!");
            setIsModalOpen(false);
            form.resetFields();
          } else {
            toast.error(data.error);
          }
        }).catch((err) => {
          console.error("Error: ", err);
          toast.error("Error occurred while adding prescription.");
        }).finally(() => setLoadingActionId(null));
    }
  };

  const handleAddOrUpdateBilling = (values: any) => {
    if (!values.patient_id || !values.medicines || values.medicines.length === 0) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoadingActionId(selectedPrescription?.id || 'billing');

    const billingData = {
      prescription_id: selectedPrescription?.id,
      patient_id: values.patient_id,
      medicines: values.medicines,
      tests: values.tests || [],
      surgeries: values.surgeries || [],
      notes: values.notes || "",
    };

    PostApi('/billing', billingData)
      .then((data) => {
        if (!data.error) {
          loadPrescriptions();
          toast.success("Billing added successfully!");
          setIsBillingModalOpen(false);
          setSelectedPrescription(null);
        } else {
          toast.error(data.error);
        }
      }).catch((err) => {
        console.error("Error: ", err);
        toast.error("Error occurred while adding billing.");
      }).finally(() => setLoadingActionId(null));
  };

  const handleEdit = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    form.setFieldsValue({
      ...prescription,
      patient_id: prescription.patient_id,
      medicines: prescription.medicines || [{ medicine_id: "", quantity: 1 }],
      tests: prescription.tests || [{ test_id: "" }],
      surgeries: prescription.surgeries ? prescription.surgeries.map((surgery: any) => {
        return { surgery_id: surgery.surgery.surgery_type_id, id: surgery.id, price: surgery.surgery.price }
      }) : [{ surgery_id: "" }],
      notes: prescription.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleView = (prescription: Prescription) => {
    setViewingPrescription(prescription);
    setIsViewModalOpen(true);
  };

  const handleDelete = (prescription: Prescription) => {
    setLoadingActionId(prescription.id!);
    DeleteApi("/prescriptions", { id: prescription.id })
      .then((data) => {
        if (!data.error) {
          loadPrescriptions();
          toast.success("Prescription deleted successfully!");
        } else {
          toast.error(data.error);
        }
      }).catch(err => {
        console.error("Error: ", err);
        toast.error("Error occurred while deleting prescription");
      }).finally(() => setLoadingActionId(null));
  };

  const resetFilters = () => {
    setSearch("");
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    // prescription.patient?.username?.toLowerCase().includes(search.toLowerCase()) ||
    // prescription.doctor?.username?.toLowerCase().includes(search.toLowerCase()) ||
    // prescription.notes?.toLowerCase().includes(search.toLowerCase())
    true
  );

  const stats = {
    total: prescriptions.length,
    billed: prescriptions.filter(p => p.is_billed).length,
    pending: prescriptions.filter(p => !p.is_billed).length,
    today: prescriptions.filter(p => {
      const today = new Date().toDateString();
      const created = new Date(p.created_at || '').toDateString();
      return created === today;
    }).length
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (printWindow && viewingPrescription) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Prescription</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h2 { text-align: center; color: #1890ff; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              td, th { border: 1px solid #ccc; padding: 8px; text-align: left; }
              .signature { margin-top: 40px; text-align: right; font-weight: bold; }
              .signature-line { margin-top: 50px; border-top: 1px solid #000; width: 200px; float: right; text-align: center; }
              .header { text-align: center; margin-bottom: 30px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Medical Prescription</h2>
              <p>ClinicWise Healthcare System</p>
            </div>
            <p><strong>Patient:</strong> ${viewingPrescription.patient?.username || 'N/A'}</p>
            <p><strong>Doctor:</strong> ${viewingPrescription.doctor?.username || 'N/A'}</p>
            <h3>Medicines</h3>
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${(viewingPrescription.medicines || []).map((m: any) => `
                  <tr>
                    <td>${m.medicine_details?.name || m.medicine_id}</td>
                    <td>${m.quantity}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ${(viewingPrescription.tests || []).length > 0 ? `
              <h3>Tests</h3>
              <table>
                <thead>
                  <tr>
                    <th>Test Name</th>
                  </tr>
                </thead>
                <tbody>
                  ${(viewingPrescription.tests || []).map((t: any) => `
                    <tr>
                      <td>${t.test_details?.name || t.test_id}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
            ${viewingPrescription.notes ? `
              <p><strong>Notes:</strong> ${viewingPrescription.notes}</p>
            ` : ''}
            <div class="signature">
              <div class="signature-line">Doctor's Signature</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
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

  const columns: ColumnsType<Prescription> = [
    {
      title: (
        <Space>
          <UserOutlined />
          Patient Info
        </Space>
      ),
      key: "patient",
      render: (_, record: Prescription | any) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            size="small"
            style={{
              backgroundColor: '#1890ff',
              borderRadius: '8px'
            }}
          />
          <div>
            <div className="font-medium">{record.user?.username || 'N/A'}</div>
            <div className="text-xs text-gray-500">
              Patient ID: {record?.user?.id}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <UserOutlined />
          Doctor Info
        </Space>
      ),
      key: "doctor",
      render: (_, record: Prescription | any) => {
        console.log(record.prescription?.doctor.id)
        return <Space direction="vertical" size={0}>
          <span className="font-medium">{record.prescription?.doctor?.username || 'N/A'}</span>
          <div className="text-xs text-gray-500">
            Doctor ID: {record?.prescription?.doctor?.id}
          </div>
        </Space>
      }
    },
    {
      title: (
        <Space>
          <MedicineBoxOutlined />
          Medicines
        </Space>
      ),
      key: "medicines",
      render: (_, record: Prescription) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">
            {(record.medicines || []).length} medicine(s)
          </span>
          <div className="text-xs text-gray-500">
            Prescribed items
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <ExperimentOutlined />
          Tests
        </Space>
      ),
      key: "tests",
      render: (_, record: Prescription | any) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">
            {(record.lab_tests || []).length} test(s)
          </span>
          <div className="text-xs text-gray-500">
            Laboratory tests
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <ExperimentOutlined />
          Surgeries
        </Space>
      ),
      key: "tests",
      render: (_, record: Prescription | any) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium">
            {(record.surgeries || []).length} test(s)
          </span>
          <div className="text-xs text-gray-500">
            Laboratory tests
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <FileTextOutlined />
          Status
        </Space>
      ),
      key: "status",
      render: (_, record: Prescription) => (
        <Badge
          status={record.is_billed ? "success" : "processing"}
          text={record.is_billed ? "Billed" : "Pending"}
          className="px-2 py-1"
        />
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
      width: 200,
      render: (_, record: Prescription) => (
        <Space size="small">
          <ActionButton
            icon={<EyeOutlined />}
            label="View Details"
            type="default"
            onClick={() => handleView(record)}
          />

          <ActionButton
            icon={<EditOutlined />}
            label="Edit Prescription"
            type="default"
            loading={loadingActionId === record.id}
            onClick={() => handleEdit(record)}
          />

          <ActionButton
            icon={<DollarOutlined />}
            label="Add Billing"
            type="primary"
            loading={loadingActionId === record.id}
            onClick={() => {
              setSelectedPrescription({
                ...record,
                surgeries: record.surgeries?.map((surgery) => {
                  return {
                    surgery_id: surgery.surgery.id,
                    id: surgery.id,
                    price: surgery.surgery.price
                  }
                }) || []
              });
              setIsBillingModalOpen(true);
            }}
            disabled={record.is_billed}
          />

          <ActionButton
            icon={<DeleteOutlined />}
            label="Delete Prescription"
            danger
            loading={loadingActionId === record.id}
            confirm
            confirmAction={() => handleDelete(record)}
            disabled={record.is_billed}
          />

          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="print" icon={<PrinterOutlined />}>
                  Print Prescription
                </Menu.Item>
                <Menu.Item key="duplicate" icon={<CopyOutlined />}>
                  Duplicate Prescription
                </Menu.Item>
                <Menu.Item key="history" icon={<HistoryOutlined />}>
                  View History
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
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Prescriptions Management</h1>
            <p className="text-gray-600 mt-1 text-base">Manage patient prescriptions and medications</p>
          </div>
          <Space>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadAllData}
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
                onClick={() => {
                  setEditingPrescription(null);
                  form.resetFields();
                  setIsModalOpen(true);
                }}
                size="large"
                className="h-12 px-6 text-base font-medium bg-blue-600 hover:bg-blue-700"
              >
                Add Prescription
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
                title="Total Prescriptions"
                value={stats.total}
                prefix={<MedicineBoxOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <Statistic
                title="Billed"
                value={stats.billed}
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
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <Statistic
                title="Today"
                value={stats.today}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#722ed1' }}
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
              <SyncOutlined className="text-blue-600" />
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

      {/* Search and Filter Section */}
      <Card className="bg-white border-0 shadow-sm rounded-xl mb-6">
        <div className="p-5">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Input.Search
                placeholder="Search by patient, doctor, or notes..."
                prefix={<SearchOutlined />}
                value={search}
                onSearch={() => loadPrescriptions(pagination.current, pagination.pageSize, search)}
                onChange={e => setSearch(e.target.value)}
                size="large"
                className="hover:border-blue-400 focus:border-blue-500"
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={resetFilters}
                  size="large"
                  className="w-full border-gray-300 hover:border-blue-400"
                >
                  Reset
                </Button>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  icon={<FileTextOutlined />}
                  size="large"
                  className="w-full border-gray-300 hover:border-blue-400"
                >
                  Export
                </Button>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TeamOutlined />
                <span>{filteredPrescriptions.length} prescriptions found</span>
                <Tag color="blue" className="ml-2">
                  {filteredPrescriptions.length}
                </Tag>
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Prescriptions Table */}
      <Card
        className="bg-white border-0 shadow-sm rounded-xl"
        title={
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">All Prescriptions</h2>
              <p className="text-gray-600 mt-1">
                Manage and track all patient prescriptions
              </p>
            </div>
          </div>
        }
      >
        <div className="p-6">
          {loading ? (
            <SkeletonTable />
          ) : filteredPrescriptions.length === 0 ? (
            <div className="text-center py-12">
              <MedicineBoxOutlined className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">No prescriptions found</p>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">
                {search ? "Try adjusting your search" : "Get started by adding your first prescription"}
              </p>
              {search && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="primary"
                    onClick={() => setSearch("")}
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                </motion.div>
              )}
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredPrescriptions}
              rowKey="id"
              onChange={handleTableChange}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} prescriptions`,
              }}
              scroll={{ x: 'max-content' }}
            />
          )}
        </div>
      </Card>

      {/* Add/Edit Prescription Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <MedicineBoxOutlined className="text-blue-600 text-lg" />
            <span className="text-lg font-semibold">
              {editingPrescription ? "Edit Prescription" : "Add New Prescription"}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingPrescription(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingPrescription ? "Update" : "Add"}
        width={700}
        okButtonProps={{
          size: 'large',
          loading: loadingActionId !== null,
          icon: editingPrescription ? <EditOutlined /> : <PlusOutlined />
        }}
        cancelButtonProps={{ size: 'large' }}
        confirmLoading={loadingActionId !== null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrUpdate}>
          <Form.Item
            name="patient_id"
            label="Patient"
            rules={[{ required: true, message: "Please select patient" }]}
          >
            <Select placeholder="Select patient" size="large">
              {patients.map(patient => (
                <Option key={patient.id} value={patient.id}>
                  {patient.username}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.List name="medicines">
            {(fields, { add, remove }) => (
              <>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium">Medicines</label>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="large">
                    Add Medicine
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'medicine_id']}
                      rules={[{ required: true, message: 'Please select medicine' }]}
                    >
                      <Select placeholder="Select medicine" style={{ width: 200 }} size="large">
                        {inventory.map(medicine => (
                          <Option key={medicine.id} value={medicine.id}>
                            {medicine.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'Please enter quantity' }]}
                    >
                      <Input type="number" placeholder="Quantity" min={1} size="large" />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)} icon={<DeleteOutlined />} size="large" />
                  </Space>
                ))}
              </>
            )}
          </Form.List>

          <Form.List name="tests">
            {(fields, { add, remove }) => (
              <>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium">Tests</label>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="large">
                    Add Test
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'test_id']}
                    >
                      <Select placeholder="Select test" style={{ width: 200 }} size="large">
                        {tests.map(test => (
                          <Option key={test.id} value={test.id}>
                            {test.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'status']}
                    >
                      <Select
                        placeholder="Select status"
                        size="large"
                        showSearch
                      >
                        <Option value="PENDING">Pending</Option>
                        <Option value="IN_PROGRESS">In Progress</Option>
                        <Option value="COMPLETED">Completed</Option>
                      </Select>
                    </Form.Item>
                    <Button danger onClick={() => remove(name)} icon={<DeleteOutlined />} size="large" />
                  </Space>
                ))}
              </>
            )}
          </Form.List>

          <Form.List name="surgeries">
            {(fields, { add, remove }) => (
              <>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium">Surgeries</label>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="large">
                    Add Surgery
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Col span={12}>
                      <Form.Item
                        label="Surgery Type"
                        name={[name, "surgery_type_id"]}
                        rules={[{ required: true, message: "Please select surgery type" }]}
                      >
                        <Select
                          placeholder="Select surgery type"
                          size="large"
                        >
                          {surgeries.map(type => (
                            <Option key={type.id} value={type.id}>
                              {type.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Form.Item
                      label="Price"
                      name={[name, "price"]}
                      rules={[{ required: true, message: "Please enter price" }]}
                    >
                      <InputNumber
                        className="w-full"
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Status"
                      name={[name, "status"]}
                    >
                      <Select
                        size="large"
                      >
                        <Option value="SCHEDULED">Scheduled</Option>
                        <Option value="IN_PROGRESS">In Progress</Option>
                        <Option value="COMPLETED">Completed</Option>
                        <Option value="CANCELLED">Cancelled</Option>
                      </Select>
                    </Form.Item>

                    <Button danger onClick={() => remove(name)} icon={<DeleteOutlined />} size="large" />
                  </Space>
                ))}
              </>
            )}
          </Form.List>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea
              placeholder="Additional notes for the prescription"
              rows={3}
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Billing Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <DollarOutlined className="text-green-600 text-lg" />
            <span className="text-lg font-semibold">Add Billing</span>
          </div>
        }
        open={isBillingModalOpen}
        onCancel={() => {
          setIsBillingModalOpen(false);
          setSelectedPrescription(null);
        }}
        onOk={() => form.submit()}
        okText="Add Billing"
        width={700}
        okButtonProps={{
          size: 'large',
          loading: loadingActionId !== null,
          icon: <DollarOutlined />
        }}
        cancelButtonProps={{ size: 'large' }}
        confirmLoading={loadingActionId !== null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddOrUpdateBilling}
          initialValues={selectedPrescription || {}}
        >
          <Form.Item
            name="patient_id"
            label="Patient"
          >
            <Select placeholder="Select patient" disabled size="large">
              {patients.map(patient => (
                <Option key={patient.id} value={patient.id}>
                  {patient.username}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.List name="medicines">
            {(fields, { add, remove }) => (
              <>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium">Medicines</label>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="large">
                    Add Medicine
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'medicine_id']}
                      rules={[{ required: true, message: 'Please select medicine' }]}
                    >
                      <Select placeholder="Select medicine" style={{ width: 200 }} size="large">
                        {inventory.map(medicine => (
                          <Option key={medicine.id} value={medicine.id}>
                            {medicine.name} - ₹{medicine.price}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'Please enter quantity' }]}
                    >
                      <Input type="number" placeholder="Quantity" min={1} size="large" />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)} icon={<DeleteOutlined />} size="large" />
                  </Space>
                ))}
              </>
            )}
          </Form.List>

          <Form.List name="surgeries">
            {(fields, { add, remove }) => (
              <>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium">Surgeries</label>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="large">
                    Add Surgery
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'surgery_id']}
                      rules={[{ required: true, message: 'Please select surgery' }]}
                    >
                      <Select placeholder="Select surgery" style={{ width: 200 }} size="large">
                        {surgeries.map(surgery => (
                          <Option key={surgery.id} value={surgery.id}>
                            {surgery.name} - ₹{surgery.price}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Button danger onClick={() => remove(name)} icon={<DeleteOutlined />} size="large" />
                  </Space>
                ))}
              </>
            )}
          </Form.List>

          <Form.List name="tests">
            {(fields, { add, remove }) => (
              <>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium">Tests</label>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="large">
                    Add Test
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'test_id']}
                    >
                      <Select placeholder="Select test" style={{ width: 200 }} size="large">
                        {tests.map(test => (
                          <Option key={test.id} value={test.id}>
                            {test.name} - ₹{test.price}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Button danger onClick={() => remove(name)} icon={<DeleteOutlined />} size="large" />
                  </Space>
                ))}
              </>
            )}
          </Form.List>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea
              placeholder="Additional notes for billing"
              rows={3}
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Prescription Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <EyeOutlined className="text-blue-600 text-lg" />
            <span className="text-lg font-semibold">Prescription Details</span>
          </div>
        }
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setViewingPrescription(null);
        }}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint} size="large">
            Print / Save PDF
          </Button>,
          <Button key="close" onClick={() => setIsViewModalOpen(false)} size="large">
            Close
          </Button>
        ]}
        width={700}
      >
        {viewingPrescription && (
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <Avatar
                icon={<MedicineBoxOutlined />}
                size="large"
                style={{
                  backgroundColor: '#1890ff',
                  borderRadius: '8px'
                }}
              />
              <div>
                <h3 className="text-lg font-semibold">Prescription #{viewingPrescription.id}</h3>
                <p className="text-gray-600">Medical prescription details</p>
              </div>
            </div>

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Patient">
                <div className="flex items-center gap-2">
                  <UserOutlined />
                  {viewingPrescription.patient?.username || 'N/A'}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Doctor">
                <div className="flex items-center gap-2">
                  <UserOutlined />
                  {viewingPrescription.doctor?.username || 'N/A'}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Badge
                  status={viewingPrescription.is_billed ? "success" : "processing"}
                  text={viewingPrescription.is_billed ? "Billed" : "Pending"}
                />
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <h4 className="font-semibold mb-3">Medicines</h4>
            {viewingPrescription.medicines && viewingPrescription.medicines.length > 0 ? (
              <Table
                size="small"
                dataSource={viewingPrescription.medicines}
                pagination={false}
                columns={[
                  {
                    title: 'Medicine',
                    dataIndex: ['medicine_details', 'name'],
                    key: 'medicine',
                    render: (text) => (
                      <div className="flex items-center gap-2">
                        <MedicineBoxOutlined className="text-gray-400" />
                        {text}
                      </div>
                    )
                  },
                  { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
                ]}
              />
            ) : (
              <p className="text-gray-500">No medicines prescribed</p>
            )}

            <Divider />

            <h4 className="font-semibold mb-3">Tests</h4>
            {viewingPrescription.tests && viewingPrescription.tests.length > 0 ? (
              <Table
                size="small"
                dataSource={viewingPrescription.tests}
                pagination={false}
                columns={[
                  {
                    title: 'Test',
                    dataIndex: ['test_details', 'name'],
                    key: 'test',
                    render: (text) => (
                      <div className="flex items-center gap-2">
                        <ExperimentOutlined className="text-gray-400" />
                        {text}
                      </div>
                    )
                  },
                ]}
              />
            ) : (
              <p className="text-gray-500">No tests prescribed</p>
            )}

            {viewingPrescription.notes && (
              <>
                <Divider />
                <h4 className="font-semibold mb-2">Notes</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p>{viewingPrescription.notes}</p>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}