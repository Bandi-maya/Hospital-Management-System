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
  Alert,
  Divider,
  Typography,
  Flex,
  List,
  Descriptions,
  Spin,
  Select,
  Input,
  Table,
  Modal,
  Form,
  InputNumber,
  Popconfirm,
  Tooltip,
  Switch,
  message
} from "antd";
import {
  ShoppingCartOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  ExportOutlined,
  ReloadOutlined,
  PieChartOutlined,
  TableOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PrinterOutlined,
  DollarOutlined,
  CalendarOutlined,
  SearchOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { toast } from "sonner";
import { getApi, PostApi, PutApi } from "@/ApiService";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Billing {
  id?: string;
  patient_id: string;
  doctor_id: string;
  medicines: { medicine_id: string; quantity: number }[];
  tests: { test_id: string; }[];
  notes: string;
  status?: "PENDING" | "PAID" | "CANCELLED";
  created_at?: string;
  total_amount?: number;
}

export default function Billing() {
  const [billings, setBilling] = useState<Billing[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [form, setForm] = useState<Partial<Billing>>({
    patient_id: "",
    doctor_id: "",
    medicines: [{ medicine_id: "", quantity: 1 }],
    tests: [{ test_id: "" }],
    notes: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState("billings");

  const loginData = JSON.parse(localStorage.getItem('loginData') || '{}');

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
    loadBilling();
  }, []);

  // Auto refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadBilling();
        message.info('🔄 Billing data refreshed');
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadInitialData = () => {
    Promise.all([
      getApi('/medicines'),
      getApi('/lab-tests'),
      getApi("/users?user_type_id=2"), // Patients
      getApi("/users?user_type_id=3")  // Doctors
    ]).then(([medicinesData, testsData, patientsData, doctorsData]) => {
      if (!medicinesData.error) setInventory(medicinesData);
      else toast.error(medicinesData.error);

      if (!testsData.error) setTests(testsData);
      else toast.error(testsData.error);

      if (!patientsData.error) setPatients(patientsData);
      else toast.error(patientsData.error);

      if (!doctorsData.error) setDoctors(doctorsData);
      else toast.error(doctorsData.error);
    }).catch((err) => {
      console.error("Error: ", err);
      toast.error("Error occurred while getting data.");
    });
  };

  const loadBilling = () => {
    setLoading(true);
    getApi("/billing")
      .then((data) => {
        if (!data.error) {
          setBilling(data);
        } else {
          toast.error(data.error);
        }
      }).catch((err) => {
        console.error("Error: ", err);
        toast.error("Error occurred while getting billings.");
      })
      .finally(() => setLoading(false));
  };

  const handleAddOrUpdate = (isStatusUpdate = false) => {
    form.doctor_id = loginData?.id || "1";
    
    if (!isStatusUpdate) {
      if (!form.patient_id || !form.medicines || form.medicines.length === 0) {
        toast.error("Please fill all required fields");
        return;
      }

      for (let med of form.medicines) {
        if (!med.medicine_id || med.quantity <= 0) {
          toast.error("Medicine name and quantity must be valid");
          return;
        }
      }

      for (let test of form.tests) {
        if (!test.test_id) {
          toast.error("Test name must be valid");
          return;
        }
      }
    }

    if (selectedBilling?.id) {
      const payload = !isStatusUpdate ? { ...selectedBilling, ...form } : { ...selectedBilling };
      PutApi('/billing', { ...payload })
        .then((data) => {
          if (!data.error) {
            loadBilling();
            toast.success("Billing updated successfully!");
          } else {
            toast.error(data.error);
          }
        }).catch((err) => {
          console.error("Error: ", err);
          toast.error("Error occurred while updating billing.");
        });
    } else {
      const newBilling: Billing = {
        patient_id: form.patient_id!,
        doctor_id: form.doctor_id!,
        medicines: form.medicines!,
        tests: form.tests!,
        notes: form.notes || "",
        status: "PENDING"
      };
      PostApi('/billing', { ...newBilling })
        .then((data) => {
          if (!data.error) {
            loadBilling();
            toast.success("Billing created successfully!");
          } else {
            toast.error(data.error);
          }
        }).catch((err) => {
          console.error("Error: ", err);
          toast.error("Error occurred while creating billing.");
        });
    }

    resetForm();
    setIsModalOpen(false);
  };

  const handleEdit = (billing: Billing) => {
    setForm({ ...billing });
    setSelectedBilling(billing);
    setIsModalOpen(true);
  };

  const handleView = (billing: Billing) => {
    setSelectedBilling(billing);
    setIsViewModalOpen(true);
  };

  const handleStatusChange = (billing: Billing, status: string) => {
    const updatedBilling = { ...billing, status };
    PutApi('/billing', { ...updatedBilling })
      .then((data) => {
        if (!data.error) {
          loadBilling();
          toast.success(`Billing marked as ${status.toLowerCase()}!`);
        } else {
          toast.error(data.error);
        }
      }).catch((err) => {
        console.error("Error: ", err);
        toast.error("Error occurred while updating billing status.");
      });
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

  const handleMedicineChange = (index: number, field: "medicine_id" | "quantity", value: string | number) => {
    const newMedicines = [...form.medicines!];
    newMedicines[index] = { ...newMedicines[index], [field]: value };
    setForm({ ...form, medicines: newMedicines });
  };

  const handleTestChange = (index: number, field: string, value: string | number) => {
    const newTests = [...form.tests!];
    newTests[index] = { ...newTests[index], [field]: value };
    setForm({ ...form, tests: newTests });
  };

  const addTestField = () => {
    setForm({ ...form, tests: [...form.tests!, { test_id: "" }] });
  };

  const removeTestField = (index: number) => {
    const newTests = form.tests!.filter((_, i) => i !== index);
    setForm({ ...form, tests: newTests });
  };

  const addMedicineField = () => {
    setForm({ ...form, medicines: [...form.medicines!, { medicine_id: "", quantity: 1 }] });
  };

  const removeMedicineField = (index: number) => {
    const newMedicines = form.medicines!.filter((_, i) => i !== index);
    setForm({ ...form, medicines: newMedicines });
  };

  const handlePrint = () => {
    const printContent = document.getElementById("billing-print-area");
    if (!printContent) return;
    
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Billing Receipt</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h2 { text-align: center; color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              td, th { border: 1px solid #ccc; padding: 8px; text-align: left; }
              .signature { margin-top: 40px; text-align: right; }
              .signature-line { border-top: 1px solid #000; width: 200px; margin-top: 50px; }
              .header { text-align: center; margin-bottom: 30px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Hospital Billing Receipt</h2>
              <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>
            ${printContent.innerHTML}
            <div class="signature">
              <div class="signature-line"></div>
              <p>Authorized Signature</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // UI Helpers
  const getStatusColor = (status: string) => ({ 'PAID': 'green', 'PENDING': 'orange', 'CANCELLED': 'red' }[status] || 'default');
  const getStatusIcon = (status: string) => ({ 'PAID': <CheckCircleOutlined />, 'PENDING': <ClockCircleOutlined />, 'CANCELLED': <CloseCircleOutlined /> }[status]);

  const filteredBillings = billings.filter((billing) => {
    const matchesSearch = searchText === "" || 
      billing.patient_id.toLowerCase().includes(searchText.toLowerCase()) ||
      billing.doctor_id.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === "all" || billing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<Billing> = [
    {
      title: <Space><UserOutlined /> Billing Information</Space>,
      key: 'billing',
      render: (_, record) => (
        <Flex align="center" gap="middle">
          <Avatar 
            size="large" 
            icon={<ShoppingCartOutlined />} 
            style={{ 
              backgroundColor: getStatusColor(record.status || 'PENDING')
            }}
          />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
              Patient: {patients.find(p => p.id === record.patient_id)?.name || record.patient_id}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Doctor: {doctors.find(d => d.id === record.doctor_id)?.name || record.doctor_id}
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              <CalendarOutlined /> {record.created_at ? dayjs(record.created_at).format('MMM D, YYYY') : 'Recent'}
            </div>
          </div>
        </Flex>
      ),
    },
    {
      title: <Space><MedicineBoxOutlined /> Items</Space>,
      key: 'items',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <div style={{ fontSize: '12px' }}>
            <MedicineBoxOutlined /> {record.medicines.length} medicines
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <ExperimentOutlined /> {record.tests.length} tests
          </div>
          {record.total_amount && (
            <div style={{ fontSize: '12px', color: '#999', fontWeight: 'bold' }}>
              <DollarOutlined /> ${record.total_amount}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: <Space><FileTextOutlined /> Status</Space>,
      key: 'status',
      render: (_, record) => (
        <Tag color={getStatusColor(record.status || 'PENDING')} icon={getStatusIcon(record.status || 'PENDING')}>
          {record.status || 'PENDING'}
        </Tag>
      ),
    },
    {
      title: <Space><ThunderboltOutlined /> Actions</Space>,
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button icon={<EyeOutlined />} shape="circle" type="primary" ghost onClick={() => handleView(record)} />
          </Tooltip>
          {record.status !== 'PAID' && (
            <Tooltip title="Edit Billing">
              <Button icon={<EditOutlined />} shape="circle" onClick={() => handleEdit(record)} />
            </Tooltip>
          )}
          {record.status !== 'PAID' && (
            <Tooltip title="Mark as Paid">
              <Button 
                type="primary" 
                size="small" 
                onClick={() => handleStatusChange(record, "PAID")}
              >
                Mark Paid
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Quick Actions */}
      <Card>
        <Flex justify="space-between" align="center">
          <Space>
            <Text strong>Quick Actions:</Text>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
            >
              Add New Billing
            </Button>
            <Button icon={<ReloadOutlined />} onClick={loadBilling}>
              Refresh
            </Button>
            <Tooltip title="Auto Refresh">
              <Switch 
                checkedChildren="On" 
                unCheckedChildren="Off" 
                checked={autoRefresh} 
                onChange={setAutoRefresh} 
              />
            </Tooltip>
          </Space>
          <Text type="secondary">
            {filteredBillings.length} bills found
          </Text>
        </Flex>
      </Card>

      {/* Tabs for Different Views */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane 
          key="billings" 
          tab={
            <Space>
              <TableOutlined /> All Billings <Badge count={filteredBillings.length} overflowCount={99} />
            </Space>
          }
        >
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <Flex wrap="wrap" gap="middle" align="center">
                <Input 
                  placeholder="🔍 Search patients, doctors..." 
                  prefix={<SearchOutlined />} 
                  value={searchText} 
                  onChange={(e) => setSearchText(e.target.value)} 
                  style={{ width: 300 }} 
                  size="large" 
                />
                <Select value={statusFilter} onChange={setStatusFilter} placeholder="Filter by Status" style={{ width: 150 }} size="large">
                  <Option value="all">All Status</Option>
                  <Option value="PAID">Paid</Option>
                  <Option value="PENDING">Pending</Option>
                  <Option value="CANCELLED">Cancelled</Option>
                </Select>
                <Button icon={<ReloadOutlined />} onClick={() => { setSearchText(''); setStatusFilter('all'); }}>
                  Reset
                </Button>
              </Flex>
            </Card>

            {/* Main Table */}
            <Card 
              title={
                <Space>
                  <ShoppingCartOutlined /> Billing Records ({filteredBillings.length})
                </Space>
              } 
              extra={
                <Space>
                  <Tag color="green">{billings.filter(b => b.status === 'PAID').length} Paid</Tag>
                  <Tag color="orange">{billings.filter(b => b.status === 'PENDING').length} Pending</Tag>
                  <Tag color="red">{billings.filter(b => b.status === 'CANCELLED').length} Cancelled</Tag>
                </Space>
              }
            >
              <Table 
                columns={columns} 
                dataSource={filteredBillings} 
                rowKey="id" 
                loading={loading} 
                scroll={{ x: 800 }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} billings`,
                }}
              />
            </Card>
          </div>
        </Tabs.TabPane>
        
        <Tabs.TabPane key="activity" tab={<Space><DashboardOutlined /> Billing Analytics</Space>}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="Recent Billing Activity">
                <Timeline>
                  {billings.slice(0, 10).map(billing => (
                    <Timeline.Item 
                      key={billing.id} 
                      color={getStatusColor(billing.status || 'PENDING')} 
                      dot={getStatusIcon(billing.status || 'PENDING')}
                    >
                      <Space direction="vertical" size={0}>
                        <div style={{ fontWeight: 'bold' }}>
                          {patients.find(p => p.id === billing.patient_id)?.name || billing.patient_id}
                        </div>
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          <MedicineBoxOutlined /> {billing.medicines.length} medicines • 
                          <ExperimentOutlined style={{ marginLeft: '8px' }} /> {billing.tests.length} tests
                        </div>
                        <div style={{ color: '#999', fontSize: '12px' }}>
                          {billing.created_at ? dayjs(billing.created_at).fromNow() : 'Recently'} • 
                          <Tag color={getStatusColor(billing.status || 'PENDING')} style={{ marginLeft: '8px' }}>
                            {billing.status || 'PENDING'}
                          </Tag>
                        </div>
                      </Space>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>
      </Tabs>

      {/* Add/Edit Billing Modal */}
      <Modal 
        title={
          <Space>
            {selectedBilling ? <EditOutlined /> : <PlusOutlined />}
            {selectedBilling ? "Edit Billing" : "Add New Billing"}
          </Space>
        } 
        open={isModalOpen} 
        onCancel={() => {
          setIsModalOpen(false);
          resetForm();
        }} 
        onOk={() => handleAddOrUpdate()} 
        okText={selectedBilling ? "Update Billing" : "Add Billing"} 
        width={700} 
        destroyOnClose
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Patient" required>
                <Select
                  placeholder="Select Patient"
                  value={form.patient_id}
                  onChange={(value) => setForm({ ...form, patient_id: value })}
                >
                  {patients.map(patient => (
                    <Option key={patient.id} value={patient.id}>
                      {patient.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Doctor">
                <Input 
                  value={doctors.find(d => d.id === form.doctor_id)?.name || "Current User"} 
                  disabled 
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Medicines" required>
            {form.medicines!.map((med, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <Select
                  placeholder="Select Medicine"
                  value={med.medicine_id}
                  onChange={(value) => handleMedicineChange(index, "medicine_id", value)}
                  style={{ flex: 2 }}
                >
                  {inventory.map(medicine => (
                    <Option key={medicine.id} value={medicine.id}>
                      {medicine.name}
                    </Option>
                  ))}
                </Select>
                <InputNumber
                  placeholder="Quantity"
                  value={med.quantity}
                  onChange={(value) => handleMedicineChange(index, "quantity", value || 1)}
                  min={1}
                  style={{ flex: 1 }}
                />
                <Button 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => removeMedicineField(index)}
                  disabled={form.medicines!.length === 1}
                />
              </div>
            ))}
            <Button type="dashed" icon={<PlusOutlined />} onClick={addMedicineField}>
              Add Medicine
            </Button>
          </Form.Item>

          <Form.Item label="Tests">
            {form.tests!.map((test, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <Select
                  placeholder="Select Test"
                  value={test.test_id}
                  onChange={(value) => handleTestChange(index, "test_id", value)}
                  style={{ flex: 1 }}
                >
                  {tests.map(testItem => (
                    <Option key={testItem.id} value={testItem.id}>
                      {testItem.name}
                    </Option>
                  ))}
                </Select>
                <Button 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => removeTestField(index)}
                  disabled={form.tests!.length === 1}
                />
              </div>
            ))}
            <Button type="dashed" icon={<PlusOutlined />} onClick={addTestField}>
              Add Test
            </Button>
          </Form.Item>

          <Form.Item label="Notes">
            <TextArea
              placeholder="Additional notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Billing Modal */}
      <Modal 
        title={
          <Space>
            <EyeOutlined /> Billing Details
          </Space>
        } 
        open={isViewModalOpen} 
        onCancel={() => setIsViewModalOpen(false)} 
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={handlePrint}>
            Print Receipt
          </Button>,
          <Button key="close" onClick={() => setIsViewModalOpen(false)}>
            Close
          </Button>,
        ]} 
        width={700}
      >
        {selectedBilling && (
          <div>
            <div id="billing-print-area">
              <Descriptions bordered column={2} size="middle">
                <Descriptions.Item label="Patient Information" span={2}>
                  <Space direction="vertical">
                    <div><strong>Name:</strong> {patients.find(p => p.id === selectedBilling.patient_id)?.name || selectedBilling.patient_id}</div>
                    <div><strong>Doctor:</strong> {doctors.find(d => d.id === selectedBilling.doctor_id)?.name || selectedBilling.doctor_id}</div>
                    <div><strong>Status:</strong> <Tag color={getStatusColor(selectedBilling.status || 'PENDING')}>{selectedBilling.status || 'PENDING'}</Tag></div>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Medicines" span={2}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {selectedBilling.medicines.map((med, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{inventory.find(m => m.id === med.medicine_id)?.name || med.medicine_id}</span>
                        <span>Qty: {med.quantity}</span>
                      </div>
                    ))}
                  </Space>
                </Descriptions.Item>
                {selectedBilling.tests.length > 0 && (
                  <Descriptions.Item label="Tests" span={2}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {selectedBilling.tests.map((test, index) => (
                        <div key={index}>
                          {tests.find(t => t.id === test.test_id)?.name || test.test_id}
                        </div>
                      ))}
                    </Space>
                  </Descriptions.Item>
                )}
                {selectedBilling.notes && (
                  <Descriptions.Item label="Notes" span={2}>
                    {selectedBilling.notes}
                  </Descriptions.Item>
                )}
                {selectedBilling.total_amount && (
                  <Descriptions.Item label="Total Amount" span={2}>
                    <Text strong style={{ fontSize: '16px' }}>${selectedBilling.total_amount}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}