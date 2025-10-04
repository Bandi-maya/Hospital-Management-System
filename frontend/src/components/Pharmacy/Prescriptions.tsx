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
  Divider
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
  ExperimentOutlined
} from "@ant-design/icons";
import { toast } from "sonner";
import { DeleteApi, getApi, PostApi, PutApi } from "@/ApiService";

const { Option } = Select;

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
  const loginData = JSON.parse(localStorage.getItem('loginData') || '{}');

  // Load data on component mount
  useEffect(() => {
    Promise.all([
      getApi('/medicines'),
      getApi('/lab-tests'),
      getApi("/users?user_type_id=2"),
      getApi('/surgery-type'),
    ]).then(([data, data1, data2, data3]) => {
      if (!data.error) {
        setInventory(data)
      }
      else {
        toast.error(data.error)
      }
      if (!data1.error) {
        setTests(data1)
      }
      else {
        toast.error(data1.error)
      }
      if (!data2.error) {
        setPatients(data2)
      }
      else {
        toast.error(data2.error)
      }
      if (!data3.error) {
        setSurgeries(data3)
      }
      else {
        toast.error(data3.error)
      }
    }).catch((err) => {
      console.error("Error: ", err)
      toast.error("Error occurred while getting data.")
    })
    loadPrescriptions()
  }, []);

  // Auto refresh notifier
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        message.info("🔄 Auto-refresh: Prescriptions data reloaded");
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  function loadPrescriptions() {
    getApi("/prescriptions")
      .then((data) => {
        if (!data.error) {
          setPrescriptions(data)
        }
        else {
          toast.error(data.error)
        }
      }).catch((err) => {
        console.error("Error: ", err)
        toast.error("Error occurred while getting prescriptions.")
      })
  }

  const handleAddOrUpdate = (values: any) => {
    // values.doctor_id = loginData?.id || 1;
    console.log(values)

    if (!values.patient_id) {
      toast.error("Please fill all required fields");
      return;
    }

    // for (let med of values.medicines) {
    //   if (!med.medicine_id || med.quantity <= 0) {
    //     toast.error("Medicine name and quantity must be valid");
    //     return;
    //   }
    // }

    if (editingPrescription) {
      PutApi('/prescriptions', { ...editingPrescription, ...values })
        .then((data) => {
          if (!data.error) {
            loadPrescriptions()
            toast.success("Prescription updated successfully!");
            setIsModalOpen(false);
            form.resetFields();
            setEditingPrescription(null);
          }
          else {
            toast.error(data.error)
          }
        }).catch((err) => {
          console.error("Error: ", err)
          toast.error("Error occurred while updating prescription.")
        })
    } else {
      const newPrescription: Prescription | any = {
        patient_id: values.patient_id,
        medicines: values.medicines,
        tests: values.tests || [],
        surgeries: values.surgeries || [],
        notes: values.notes || "",
      };

      PostApi('/prescriptions', newPrescription)
        .then((data) => {
          if (!data.error) {
            loadPrescriptions()
            toast.success("Prescription added successfully!");
            setIsModalOpen(false);
            form.resetFields();
          }
          else {
            toast.error(data.error)
          }
        }).catch((err) => {
          console.error("Error: ", err)
          toast.error("Error occurred while adding prescription.")
        })
    }
  };

  const handleAddOrUpdateBilling = (values: any) => {
    // values.doctor_id = loginData?.id || 1;

    if (!values.patient_id || !values.medicines || values.medicines.length === 0) {
      toast.error("Please fill all required fields");
      return;
    }

    for (let med of values.medicines) {
      if (!med.medicine_id || med.quantity <= 0) {
        toast.error("Medicine name and quantity must be valid");
        return;
      }
    }

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
          loadPrescriptions()
          toast.success("Billing added successfully!");
          setIsBillingModalOpen(false);
          setSelectedPrescription(null);
        }
        else {
          toast.error(data.error)
        }
      }).catch((err) => {
        console.error("Error: ", err)
        toast.error("Error occurred while adding billing.")
      })
  };

  const handleEdit = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    form.setFieldsValue({
      ...prescription,
      patient_id: prescription.patient_id,
      medicines: prescription.medicines || [{ medicine_id: "", quantity: 1 }],
      tests: prescription.tests || [{ test_id: "" }],
      surgeries: prescription.surgeries ? prescription.surgeries.map((surgery: any) => { return { surgery_id: surgery.surgery.surgery_type_id, id: surgery.id, price: surgery.surgery.price } }) : [{ surgery_id: "" }],
      notes: prescription.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleView = (prescription: Prescription) => {
    setViewingPrescription(prescription);
    setIsViewModalOpen(true);
  };

  const handleDelete = (prescription: Prescription) => {
    Modal.confirm({
      title: "Delete Prescription?",
      content: "Are you sure you want to delete this prescription? This action cannot be undone.",
      okText: "Yes",
      cancelText: "No",
      okType: "danger",
      onOk() {
        DeleteApi("/prescriptions", { id: prescription.id })
          .then((data) => {
            if (!data.error) {
              loadPrescriptions()
              toast.success("Prescription deleted successfully!");
            }
            else {
              toast.error(data.error)
            }
          }).catch(err => {
            console.error("Error: ", err)
            toast.error("Error occurred while deleting prescription")
          })
      }
    });
  };

  const resetFilters = () => {
    setSearch("");
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patient?.username?.toLowerCase().includes(search.toLowerCase()) ||
    prescription.doctor?.username?.toLowerCase().includes(search.toLowerCase()) ||
    prescription.notes?.toLowerCase().includes(search.toLowerCase())
  );

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

  const columns: ColumnsType<Prescription> = [
    {
      title: (
        <Space>
          <UserOutlined />
          Patient Info
        </Space>
      ),
      key: "patient",
      render: (_, record: Prescription) => (
        <Space>
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <UserOutlined className="text-blue-600" />
          </div>
          <div>
            <div style={{ fontWeight: "bold" }}>{record.patient?.username || 'N/A'}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              Patient ID: {record.patient_id}
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
      render: (_, record: Prescription) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: "500" }}>{record.doctor?.username || 'N/A'}</span>
          <div style={{ fontSize: "12px", color: "#999" }}>
            Doctor ID: {record.doctor_id}
          </div>
        </Space>
      ),
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
          <span style={{ fontWeight: "500" }}>
            {(record.medicines || []).length} medicine(s)
          </span>
          <div style={{ fontSize: "12px", color: "#999" }}>
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
      render: (_, record: Prescription) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: "500" }}>
            {(record.tests || []).length} test(s)
          </span>
          <div style={{ fontSize: "12px", color: "#999" }}>
            Laboratory tests
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <FileTextOutlined />
          Notes
        </Space>
      ),
      dataIndex: "notes",
      key: "notes",
      render: (notes: string) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: "500" }}>
            {notes ? (notes.length > 50 ? `${notes.substring(0, 50)}...` : notes) : 'No notes'}
          </span>
          <div style={{ fontSize: "12px", color: "#999" }}>
            Doctor's notes
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
      render: (_, record: Prescription) => (
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
          <Tooltip title="Edit Prescription">
            <Button
              icon={<EditOutlined />}
              shape="circle"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Add Billing">
            <Button
              type="primary"
              onClick={() => {
                setSelectedPrescription({
                  ...record, surgeries: record.surgeries.map((surgery) => {
                    return {
                      surgery_id: surgery.surgery.id, id: surgery.id, price: surgery.surgery.price
                    }
                  })
                });
                setIsBillingModalOpen(true);
              }}
            >
              Add Billing
            </Button>
          </Tooltip>
          <Tooltip title="Delete Prescription">
            <Popconfirm
              title="Delete this prescription?"
              description="Are you sure you want to delete this prescription? This action cannot be undone."
              onConfirm={() => handleDelete(record)}
              okText="Yes"
              cancelText="No"
              okType="danger"
              icon={<CloseCircleOutlined style={{ color: "red" }} />}
            >
              <Button disabled={record?.['is_billed']} icon={<DeleteOutlined />} shape="circle" danger />
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
              <MedicineBoxOutlined className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
              <p className="text-gray-600 mt-1">Manage patient prescriptions and medications</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
            <Tooltip title="Auto Refresh">
              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                <SyncOutlined className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Auto Refresh</span>
                <div
                  className={`w-8 h-4 rounded-full transition-colors cursor-pointer ${autoRefresh ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  <div
                    className={`w-3 h-3 rounded-full bg-white transform transition-transform ${autoRefresh ? 'translate-x-4' : 'translate-x-1'
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

            <Tooltip title="Add New Prescription">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingPrescription(null);
                  form.resetFields();
                  setIsModalOpen(true);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <RocketOutlined /> Add Prescription
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
              <span className="text-lg font-semibold">All Prescriptions</span>
              <Tag color="blue" className="ml-2">
                {filteredPrescriptions.length}
              </Tag>
            </div>
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <Input
                placeholder="Search by patient, doctor, or notes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
                style={{ width: 300 }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Prescriptions Table */}
      <Card className="shadow-md rounded-lg">
        <Table
          columns={columns}
          dataSource={filteredPrescriptions}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} prescriptions`,
          }}
          scroll={{ x: "max-content" }}
          rowClassName="hover:bg-gray-50"
        />
      </Card>

      {/* Add/Edit Prescription Modal */}
      <Modal
        title={
          <Space>
            {editingPrescription ? <EditOutlined /> : <PlusOutlined />}
            {editingPrescription ? "Edit Prescription" : "Add Prescription"}
          </Space>
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
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrUpdate}>
          <Form.Item
            name="patient_id"
            label="Patient"
            rules={[{ required: true, message: "Please select patient" }]}
          >
            <Select placeholder="Select patient">
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
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
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
                      <Select placeholder="Select medicine" style={{ width: 200 }}>
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
                      <Input type="number" placeholder="Quantity" min={1} />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)} icon={<DeleteOutlined />} />
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
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    Add Test
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'test_id']}
                    >
                      <Select placeholder="Select test" style={{ width: 200 }}>
                        {tests.map(test => (
                          <Option key={test.id} value={test.id}>
                            {test.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Button danger onClick={() => remove(name)} icon={<DeleteOutlined />} />
                  </Space>
                ))}
              </>
            )}
          </Form.List>

          <Form.List name="surgeries">
            {(fields, { add, remove }) => (
              <>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium">Tests</label>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    Add Surgery
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'surgery_id']}
                    >
                      <Select placeholder="Select surgery" style={{ width: 200 }}>
                        {surgeries.map(surgery => (
                          <Option key={surgery.id} value={surgery.id}>
                            {surgery.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'price']}
                      rules={[{ required: true, message: 'Please enter quantity' }]}
                    >
                      <Input type="number" placeholder="Price" min={1} />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)} icon={<DeleteOutlined />} />
                  </Space>
                ))}
              </>
            )}
          </Form.List>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea placeholder="Additional notes for the prescription" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Billing Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            Add Billing
          </Space>
        }
        open={isBillingModalOpen}
        onCancel={() => {
          setIsBillingModalOpen(false);
          setSelectedPrescription(null);
        }}
        onOk={() => form.submit()}
        okText="Add Billing"
        width={700}
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
            <Select placeholder="Select patient" disabled>
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
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
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
                      <Select placeholder="Select medicine" style={{ width: 200 }}>
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
                      <Input type="number" placeholder="Quantity" min={1} />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)} icon={<DeleteOutlined />} />
                  </Space>
                ))}
              </>
            )}
          </Form.List>
          <Form.List name="surgeries">
            {(fields, { add, remove }) => (
              <>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium">Medicines</label>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    Add Surgery
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'surgery_id']}
                      rules={[{ required: true, message: 'Please select medicine' }]}
                    >
                      <Select placeholder="Select medicine" style={{ width: 200 }}>
                        {surgeries.map(medicine => (
                          <Option key={medicine.id} value={medicine.id}>
                            {medicine.name} - ₹{medicine.price}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    {/* <Form.Item
                      {...restField}
                      name={[name, 'price']}
                      rules={[{ required: true, message: 'Please enter quantity' }]}
                    >
                      <Input type="number" disabled placeholder="Price" min={1} />
                    </Form.Item> */}
                    <Button danger onClick={() => remove(name)} icon={<DeleteOutlined />} />
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
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    Add Test
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'test_id']}
                    >
                      <Select placeholder="Select test" style={{ width: 200 }}>
                        {tests.map(test => (
                          <Option key={test.id} value={test.id}>
                            {test.name} - ₹{test.price}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Button danger onClick={() => remove(name)} icon={<DeleteOutlined />} />
                  </Space>
                ))}
              </>
            )}
          </Form.List>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea placeholder="Additional notes for billing" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Prescription Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            Prescription Details
          </Space>
        }
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setViewingPrescription(null);
        }}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
            Print / Save PDF
          </Button>,
          <Button key="close" onClick={() => setIsViewModalOpen(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {viewingPrescription && (
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MedicineBoxOutlined className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Prescription #{viewingPrescription.id}</h3>
                <p className="text-gray-600">Medical prescription details</p>
              </div>
            </div>

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Patient">
                {viewingPrescription.patient?.username || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Doctor">
                {viewingPrescription.doctor?.username || 'N/A'}
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
                  { title: 'Medicine', dataIndex: ['medicine_details', 'name'], key: 'medicine' },
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
                  { title: 'Test', dataIndex: ['test_details', 'name'], key: 'test' },
                ]}
              />
            ) : (
              <p className="text-gray-500">No tests prescribed</p>
            )}

            {viewingPrescription.notes && (
              <>
                <Divider />
                <h4 className="font-semibold mb-2">Notes</h4>
                <p>{viewingPrescription.notes}</p>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}