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
} from "@ant-design/icons";
import { getApi, PostApi, PutApi } from "@/ApiService";
import dayjs from "dayjs";
import { toast } from "sonner";

const { Option } = Select;
const { TextArea } = Input;

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

    const payload = {
      // ...selectedBilling,
      // status: "PAID",
      // payment: {
      amount,
      method,
      transaction_ref_id: transaction_ref_id || null,
      // },
    };

    PostApi(`/billing/${selectedBilling.id}/payments`, payload)
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
      });
  };


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
      });
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

  const handleAddOrUpdate = () => {
    // Ensure doctor_id is current user
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
    for (let t of form.tests || []) {
      if (!t.test_id) {
        toast.error("Test fields invalid.");
        return;
      }
    }

    if (selectedBilling && selectedBilling.id) {
      // update
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
        });
    } else {
      // create
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
        });
    }

    resetForm();
    setIsModalOpen(false);
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
      });
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

  const columns = [
    {
      title: <Space><UserOutlined /> Billing Info</Space>,
      key: "info",
      render: (_: any, rec: Billing) => (
        <Space align="center">
          <Avatar icon={<FileTextOutlined />} style={{ backgroundColor: getStatusColor(rec.status) }} />
          <div>
            <div><strong>Patient:</strong> {patients.find(p => p.id === rec.patient_id)?.name || rec.patient_id}</div>
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
          <div>{rec.medicines.length} medicines</div>
          <div>{rec.tests?.length} tests</div>
          {rec.total_amount !== undefined && <div><strong>Total:</strong> ${rec.total_amount}</div>}
        </Space>
      ),
    },
    {
      title: <Space><FileTextOutlined /> Status</Space>,
      key: "status",
      render: (_: any, rec: Billing) => (
        <Tag color={getStatusColor(rec.status)} icon={getStatusIcon(rec.status)}>
          {rec.status || "PENDING"}
        </Tag>
      ),
    },
    {
      title: <Space><ThunderboltOutlined /> Actions</Space>,
      key: "actions",
      render: (_: any, rec: Billing) => (
        <Space>
          <Tooltip title="View">
            <Button icon={<EyeOutlined />} onClick={() => handleView(rec)} />
          </Tooltip>
          {/* {rec.status !== "PAID" && ( */}
          <Tooltip title="Edit">
            <Button icon={<EditOutlined />} onClick={() => handleEdit(rec)} />
          </Tooltip>
          {/* )} */}
          {/* {rec.status !== "PAID" && ( */}
          {/* <Button onClick={() => handleStatusChange(rec, "PAID")}>Mark Paid</Button> */}
          {/* )} */}
          {/* {rec.status !== "PAID" && ( */}
          <Tooltip title="Pay">
            <Button type="primary" onClick={() => openPaymentModal(rec)}>
              Pay
            </Button>
          </Tooltip>
          {/* )} */}

        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      <Card>
        <Space>
          <Button icon={<PlusOutlined />} onClick={() => { resetForm(); setIsModalOpen(true); }}>
            Add Billing
          </Button>
          <Button icon={<ReloadOutlined />} onClick={loadBilling}>
            Refresh
          </Button>
          <Switch checked={autoRefresh} onChange={setAutoRefresh} />
        </Space>
        <span style={{ float: "right" }}>{filtered.length} bills</span>
      </Card>

      <Modal
        title="Make Payment"
        open={isPaymentModalOpen}
        onCancel={() => setIsPaymentModalOpen(false)}
        onOk={handlePaymentSubmit}
        okText="Confirm Payment"
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
            />
          </Form.Item>

          <Form.Item label="Payment Method" required>
            <Select
              value={paymentForm.method}
              onChange={(val) =>
                setPaymentForm({ ...paymentForm, method: val, transaction_ref_id: "" })
              }
            >
              <Option value="CASH">Cash</Option>
              <Option value="CARD">Card</Option>
              <Option value="UPI">UPI</Option>
              <Option value="ONLINE">Online</Option>
            </Select>
          </Form.Item>

          {["CARD", "UPI", "ONLINE"].includes(paymentForm.method) && (
            <Form.Item label="Transaction Reference ID" required>
              <Input
                value={paymentForm.transaction_ref_id}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, transaction_ref_id: e.target.value })
                }
              />
            </Form.Item>
          )}
        </Form>
      </Modal>


      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane
          key="billings"
          tab={<Space><TableOutlined /> All Billings <Badge count={filtered.length} /></Space>}
        >
          <Card style={{ marginTop: 16 }}>
            <Space style={{ marginBottom: 16 }}>
              <Input
                placeholder="Search"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200 }}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
              >
                <Option value="all">All</Option>
                <Option value="PAID">Paid</Option>
                <Option value="PENDING">Pending</Option>
                <Option value="CANCELLED">Cancelled</Option>
              </Select>
              <Button onClick={() => { setSearchText(""); setStatusFilter("all"); }}>Reset</Button>
            </Space>
            <Table
              columns={columns}
              dataSource={filtered}
              rowKey="id"
              loading={loading}
            />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane key="activity" tab={<Space><DashboardOutlined /> Activity</Space>}>
          <Card style={{ marginTop: 16 }}>
            <Timeline>
              {billings.slice(0, 10).map((b) => (
                <Timeline.Item
                  key={b.id}
                  color={getStatusColor(b.status)}
                  dot={getStatusIcon(b.status)}
                >
                  <div>{patients.find(p => p.id === b.patient_id)?.name || b.patient_id}</div>
                  <div>
                    {dayjs(b.created_at).fromNow()} — {b.medicines.length} meds, {b.tests.length} tests
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Tabs.TabPane>
      </Tabs>

      <Modal
        title={selectedBilling ? "Edit Billing" : "Add Billing"}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); resetForm(); }}
        onOk={handleAddOrUpdate}
        width={600}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Patient" required>
                <Select
                  value={form.patient_id}
                  onChange={(val) => setForm({ ...form, patient_id: val })}
                >
                  {patients.map((p) => (
                    <Option key={p.id} value={p.id}>{p.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Doctor">
                <Input
                  value={doctors.find(d => d.id === form.doctor_id)?.name || loginData.name}
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Medicines">
            {(form.medicines || []).map((med, idx) => (
              <Space key={idx} style={{ display: "flex" }}>
                <Select
                  placeholder="Medicine"
                  value={med.medicine_id}
                  onChange={(val) => handleMedicineChange(idx, "medicine_id", val)}
                >
                  {inventory.map((m) => (
                    <Option key={m.id} value={m.id}>{m.name}</Option>
                  ))}
                </Select>
                <InputNumber
                  value={med.quantity}
                  onChange={(val) => handleMedicineChange(idx, "quantity", val || 1)}
                  min={1}
                />
                <Button danger onClick={() => removeMedicineField(idx)}>Remove</Button>
              </Space>
            ))}
            <Button type="dashed" onClick={addMedicineField}>Add Medicine</Button>
          </Form.Item>

          <Form.Item label="Surgeries">
            {(form.surgeries || []).map((surgery, idx) => (
              <Space key={idx} style={{ display: "flex" }}>
                <Select
                  placeholder="Surgery"
                  value={surgery.surgery_id}
                  onChange={(val) => handleSurgeryChange(idx, "surgery_id", val)}
                >
                  {surgeries.map((m) => (
                    <Option key={m.id} value={m.id}>{m.name}</Option>
                  ))}
                </Select>
                <Button danger onClick={() => removeMedicineField(idx)}>Remove</Button>
              </Space>
            ))}
            <Button type="dashed" onClick={addMedicineField}>Add Surgery</Button>
          </Form.Item>

          <Form.Item label="Tests">
            {(form.tests || []).map((t, idx) => (
              <Space key={idx} style={{ display: "flex" }}>
                <Select
                  placeholder="Test"
                  value={t.test_id}
                  onChange={(val) => handleTestChange(idx, "test_id", val)}
                >
                  {tests.map((tt) => (
                    <Option key={tt.id} value={tt.id}>{tt.name}</Option>
                  ))}
                </Select>
                <Button danger onClick={() => removeTestField(idx)}>Remove</Button>
              </Space>
            ))}
            <Button type="dashed" onClick={addTestField}>Add Test</Button>
          </Form.Item>

          <Form.Item label="Notes">
            <TextArea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Billing Details"
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedBilling && (
          <div id="billing-print-area">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Patient">
                {patients.find(p => p.id === selectedBilling.patient_id)?.name || selectedBilling.patient_id}
              </Descriptions.Item>
              <Descriptions.Item label="Doctor">
                {doctors.find(d => d.id === selectedBilling.doctor_id)?.name || selectedBilling.doctor_id}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedBilling.status)}>{selectedBilling.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Medicines">
                {selectedBilling.medicines.map((med, i) => (
                  <div key={i}>
                    {inventory.find(m => m.id === med.medicine_id)?.name || med.medicine_id} — Qty: {med.quantity}
                  </div>
                ))}
              </Descriptions.Item>
              {selectedBilling.tests.length > 0 && (
                <Descriptions.Item label="Tests">
                  {selectedBilling.tests.map((tt, i) => (
                    <div key={i}>
                      {tests.find(t => t.id === tt.test_id)?.name || tt.test_id}
                    </div>
                  ))}
                </Descriptions.Item>
              )}
              {selectedBilling.notes && (
                <Descriptions.Item label="Notes">
                  {selectedBilling.notes}
                </Descriptions.Item>
              )}
              {selectedBilling.total_amount !== undefined && (
                <Descriptions.Item label="Total">
                  <strong>${selectedBilling.total_amount}</strong>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}
