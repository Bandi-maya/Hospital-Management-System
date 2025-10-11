import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Select,
  Popconfirm,
  Tabs,
  Tag,
  Card,
  List,
  Typography,
  Divider,
  DatePicker,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { Patient } from "@/types/patient";
import { getApi, PutApi, PostApi, DeleteApi } from "@/ApiService";
import { toast } from "sonner";
import dayjs from "dayjs";
import Prescriptions from "../Pharmacy/Prescriptions";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

// Predefined disease list
const diseaseSuggestions = [
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Tuberculosis",
  "Covid-19",
  "Cancer",
  "Heart Disease",
  "Arthritis",
];

export default function MedicalRecords() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("1");
  const [medicines, setMedicines] = useState([])
  const [labTests, setlabTests] = useState([])
  const [medicalRecords, setMedicalRecords] = useState([])
  const [surgeries, setSurgeries] = useState([])
  const [consultations, setConsultations] = useState([])
  const [payments, setPayments] = useState([])
  const [bills, setBills] = useState([])
  const [prescriptions, setPrescriptions] = useState([])

  // State for different modals
  const [medicineModalVisible, setMedicineModalVisible] = useState(false);
  const [labTestModalVisible, setLabTestModalVisible] = useState(false);
  const [operationModalVisible, setOperationModalVisible] = useState(false);
  const [consultationModalVisible, setConsultationModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);

  // Form states
  const [medicineForm] = Form.useForm();
  const [labTestForm] = Form.useForm();
  const [operationForm] = Form.useForm();
  const [consultationForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [invoiceForm] = Form.useForm();

  useEffect(() => {
    loadData()
  }, [activeTab])

  function loadData() {
    const api = activeTab === '1' ? getApi("/medical-records")
      : activeTab === '2' ? getApi("/prescriptions")
        : activeTab === '3' ? getApi("/medicines")
          : activeTab === '4' ? getApi("/lab-requests")
            : activeTab === '5' ? getApi("/surgery")
              : activeTab === '6' ? getApi("/appointment")
                : activeTab === '7' ? getApi("/payment")
                  : getApi("/billing")
    api.then((data) => {
      if (!data.error) {
        activeTab === '1' ? setMedicalRecords(data)
          : activeTab === '2' ? setPrescriptions(data)
            : activeTab === '3' ? setMedicines(data)
              : activeTab === '4' ? setlabTests(data)
                : activeTab === '5' ? setSurgeries(data)
                  : activeTab === '6' ? setConsultations(data)
                    : activeTab === '7' ? setPayments(data)
                      : setBills(data)
      } else {
        toast.error(data.error)
      }
    }).catch((err) => {
      toast.error("Error occurred while getting data")
      console.error("Error: ", err)
    })
  }

  function loadPatients() {
    getApi("/medical-records")
      .then((data) => {
        if (!data?.error) {
          setPatients(data);
        } else {
          console.error("Error fetching patients:", data.error);
        }
      })
      .catch((error) => {
        console.error("Error fetching patients:", error);
      });
  }

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (!search) {
      setFilteredPatients(patients);
    } else {
      const lower = search.toLowerCase();
      setFilteredPatients(patients);
    }
  }, [search, patients]);

  const handleAddRecord = () => {
    if (!selectedPatient) return;

    PutApi('/medical-records', {
      user_id: selectedPatient.user_id,
      id: selectedPatient.id,
      notes: notes,
    }).then((data) => {
      if (!data?.error) {
        loadPatients();
        setSelectedPatient({});
        setNotes("");
        setIsModalVisible(false);
      } else {
        toast.error("Error updating record: " + data.error);
      }
    }).catch((error) => {
      toast.error("Error updating record");
    });
  };

  const deleteRecord = (patientId: string, index: number) => {
    const updatedPatients = patients.map((p) =>
      p.id === patientId
        ? {
          ...p,
          medicalHistory: p.medicalHistory.filter((_, i) => i !== index),
        }
        : p
    );
    setPatients(updatedPatients);
    localStorage.setItem("patients", JSON.stringify(updatedPatients));
    setFilteredPatients(updatedPatients);
  };

  // Common handler for adding new items
  const handleAddItem = (type, form, apiEndpoint) => {
    form.validateFields().then(values => {
      PostApi(apiEndpoint, {
        ...values,
        patient_id: selectedPatient?.id
      }).then((data) => {
        if (!data?.error) {
          toast.success(`${type} added successfully`);
          form.resetFields();
          switch (type) {
            case 'Medicine': setMedicineModalVisible(false); break;
            case 'Lab Test': setLabTestModalVisible(false); break;
            case 'Operation': setOperationModalVisible(false); break;
            case 'Consultation': setConsultationModalVisible(false); break;
            case 'Payment': setPaymentModalVisible(false); break;
            case 'Invoice': setInvoiceModalVisible(false); break;
          }
        } else {
          toast.error(`Error adding ${type}: ${data.error}`);
        }
      });
    });
  };

  const columns = [
    { title: "Patient ID", dataIndex: "id", key: "patientId" },
    {
      title: "Name",
      dataIndex: ["user", "name"]
    },
    { title: "Doctor", dataIndex: ["user", "extra_fields", "fields_data", "assigned_to_doctor"], key: "assignedDoctor" },
    { title: "Ward", dataIndex: "wardNumber", key: "wardNumber" },
    { title: "Bed", dataIndex: "bedNumber", key: "bedNumber" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "Admitted"
            ? "green"
            : status === "Discharged"
              ? "red"
              : "blue";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Patient) => (
        <Button
          type="link"
          onClick={() => {
            setNotes(record?.["notes"]);
            setSelectedPatient(record);
            setIsModalVisible(true);
          }}
        >
          Update Record
        </Button>
      ),
    },
  ];

  // Tab content components
  const MedicalRecordsTab = () => (
    <Table
      dataSource={filteredPatients}
      columns={[
        { title: "Patient ID", dataIndex: "id", key: "patientId" },
        { title: "Patient Name", dataIndex: ["user", "name"], key: "patientName" },
        { title: "Condition", dataIndex: "diagnosis", key: "condition" },
        { title: "Date", dataIndex: "created_at", key: "date" },
        { title: "Notes", dataIndex: "notes", key: "notes" },
      ]}
      rowKey="id"
    />
  );

  const PrescriptionsTab = () => (
    <Card
      title="Prescriptions"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setMedicineModalVisible(true)}>
          Add Prescription
        </Button>
      }
    >
      <List
        dataSource={prescriptions}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button type="link" icon={<EditOutlined />}>Edit</Button>,
              <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
            ]}
          >
            <List.Item.Meta
              title={item.name}
              description={`Dosage: ${item.dosage} | Frequency: ${item.frequency} | Duration: ${item.duration}`}
            />
          </List.Item>
        )}
      />
    </Card>
  );

  const MedicinesTab = () => (
    <Card
      title="Medicines"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setMedicineModalVisible(true)}>
          Add Medicine
        </Button>
      }
    >
      <Table
        dataSource={medicines}
        columns={[
          { title: "Medicine Name", dataIndex: "name", key: "name" },
          { title: "Dosage", dataIndex: "dosage", key: "dosage" },
          { title: "Frequency", dataIndex: "frequency", key: "frequency" },
          { title: "Duration", dataIndex: "duration", key: "duration" },
          {
            title: "Actions",
            key: "actions",
            render: () => (
              <Space>
                <Button type="link" icon={<EditOutlined />}>Edit</Button>
                <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );

  const LabTestsTab = () => (
    <Card
      title="Lab Tests"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setLabTestModalVisible(true)}>
          Add Lab Test
        </Button>
      }
    >
      <Table
        dataSource={labTests}
        columns={[
          { title: "Test Name", dataIndex: "name", key: "name" },
          { title: "Date", dataIndex: "date", key: "date" },
          { title: "Result", dataIndex: "result", key: "result" },
          {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
              <Tag color={status === "Completed" ? "green" : "blue"}>{status}</Tag>
            ),
          },
          {
            title: "Actions",
            key: "actions",
            render: () => (
              <Space>
                <Button type="link" icon={<EyeOutlined />}>View</Button>
                <Button type="link" icon={<EditOutlined />}>Edit</Button>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );

  const OperationsTab = () => (
    <Card
      title="Operations"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOperationModalVisible(true)}>
          Add Operation
        </Button>
      }
    >
      <Table
        dataSource={surgeries}
        columns={[
          { title: "Operation Name", dataIndex: "name", key: "name" },
          { title: "Date", dataIndex: "date", key: "date" },
          { title: "Surgeon", dataIndex: "surgeon", key: "surgeon" },
          {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
              <Tag color={status === "Successful" ? "green" : status === "Scheduled" ? "orange" : "red"}>
                {status}
              </Tag>
            ),
          },
          {
            title: "Actions",
            key: "actions",
            render: () => (
              <Space>
                <Button type="link" icon={<EyeOutlined />}>View</Button>
                <Button type="link" icon={<EditOutlined />}>Edit</Button>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );

  const ConsultationsTab = () => (
    <Card
      title="Consultations"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setConsultationModalVisible(true)}>
          Add Consultation
        </Button>
      }
    >
      <Table
        dataSource={consultations}
        columns={[
          { title: "Doctor", dataIndex: "doctor", key: "doctor" },
          { title: "Date", dataIndex: "date", key: "date" },
          { title: "Diagnosis", dataIndex: "diagnosis", key: "diagnosis" },
          { title: "Notes", dataIndex: "notes", key: "notes" },
          {
            title: "Actions",
            key: "actions",
            render: () => (
              <Space>
                <Button type="link" icon={<EyeOutlined />}>View</Button>
                <Button type="link" icon={<EditOutlined />}>Edit</Button>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );

  const PaymentsTab = () => (
    <Card
      title="Payments"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setPaymentModalVisible(true)}>
          Add Payment
        </Button>
      }
    >
      <Table
        dataSource={payments}
        columns={[
          { title: "Date", dataIndex: "date", key: "date" },
          { title: "Amount", dataIndex: "amount", key: "amount", render: (amount) => `$${amount}` },
          { title: "Method", dataIndex: "method", key: "method" },
          {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
              <Tag color={status === "Paid" ? "green" : "orange"}>{status}</Tag>
            ),
          },
          {
            title: "Actions",
            key: "actions",
            render: () => (
              <Space>
                <Button type="link" icon={<EyeOutlined />}>View</Button>
                <Button type="link" icon={<EditOutlined />}>Edit</Button>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );

  const InvoiceTab = () => (
    <Card
      title="Invoices"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setInvoiceModalVisible(true)}>
          Create Invoice
        </Button>
      }
    >
      <Table
        dataSource={bills}
        columns={[
          { title: "Date", dataIndex: "date", key: "date" },
          { title: "Amount", dataIndex: "amount", key: "amount", render: (amount) => `$${amount}` },
          {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
              <Tag color={status === "Paid" ? "green" : "orange"}>{status}</Tag>
            ),
          },
          {
            title: "Items",
            dataIndex: "items",
            key: "items",
            // render: (items) => items.join(", ")
          },
          {
            title: "Actions",
            key: "actions",
            render: () => (
              <Space>
                <Button type="link" icon={<EyeOutlined />}>View</Button>
                <Button type="link" icon={<EditOutlined />}>Edit</Button>
                <Button type="link" icon={<DeleteOutlined />}>Delete</Button>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Patient Management</h1>
          <p className="text-muted-foreground">Medical Records</p>
        </div>
        <Input.Search
          placeholder="Search patients..."
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 300 }}
        />
      </div>

      <Tabs defaultActiveKey="1" onChange={setActiveTab}>
        {/* <Tabs defaultActiveKey="1" onChange={setActiveTab}>
        <Tabs.TabPane tab="Overview" key="1">
          <Table
            dataSource={filteredPatients}
            columns={columns}
            rowKey="id"
            expandable={{
              expandedRowRender: (record: Patient) => (
                <div>
                  <h4 className="font-semibold mb-2">Medical History</h4>
                  {record.medicalHistory && record.medicalHistory.length > 0 ? (
                    <ul className="list-disc pl-6">
                      {record.medicalHistory.map((h, i) => (
                        <li key={i} className="flex justify-between">
                          <span>
                            <strong>{h.condition}</strong> ({h.date}) – {h.notes}
                          </span>
                          <Popconfirm
                            title="Delete this record?"
                            onConfirm={() => deleteRecord(record.id, i)}
                          >
                            <Button type="link" danger size="small">
                              Delete
                            </Button>
                          </Popconfirm>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No medical history</p>
                  )}
                </div>
              ),
            }}
          />
        </Tabs.TabPane> */}

        <Tabs.TabPane tab="Medical Records" key="1">
          <MedicalRecordsTab />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Prescriptions" key="2">
          <PrescriptionsTab />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Medicines" key="3">
          <MedicinesTab />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Lab Tests" key="4">
          <LabTestsTab />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Operations" key="5">
          <OperationsTab />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Consultations" key="6">
          <ConsultationsTab />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Payments" key="7">
          <PaymentsTab />
        </Tabs.TabPane>

        <Tabs.TabPane tab="Invoice" key="8">
          <InvoiceTab />
        </Tabs.TabPane>
      </Tabs>

      {/* Medical Record Modal */}
      <Modal
        title={`Add Medical Record for ${selectedPatient ? selectedPatient.firstName : ""}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleAddRecord}
      >
        Notes
        <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      </Modal>

      {/* Medicine Modal */}
      <Modal
        title="Add Medicine"
        open={medicineModalVisible}
        onCancel={() => setMedicineModalVisible(false)}
        onOk={() => handleAddItem('Medicine', medicineForm, '/medicines')}
      >
        <Form form={medicineForm} layout="vertical">
          <Form.Item name="name" label="Medicine Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="dosage" label="Dosage" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="frequency" label="Frequency" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="duration" label="Duration" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Lab Test Modal */}
      <Modal
        title="Add Lab Test"
        open={labTestModalVisible}
        onCancel={() => setLabTestModalVisible(false)}
        onOk={() => handleAddItem('Lab Test', labTestForm, '/lab-tests')}
      >
        <Form form={labTestForm} layout="vertical">
          <Form.Item name="name" label="Test Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Operation Modal */}
      <Modal
        title="Add Operation"
        open={operationModalVisible}
        onCancel={() => setOperationModalVisible(false)}
        onOk={() => handleAddItem('Operation', operationForm, '/operations')}
      >
        <Form form={operationForm} layout="vertical">
          <Form.Item name="name" label="Operation Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="surgeon" label="Surgeon" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add similar modals for Consultation, Payment, Invoice */}
      {/* Consultation Modal */}
      <Modal
        title="Add Consultation"
        open={consultationModalVisible}
        onCancel={() => setConsultationModalVisible(false)}
        onOk={() => handleAddItem('Consultation', consultationForm, '/consultations')}
      >
        <Form form={consultationForm} layout="vertical">
          <Form.Item name="doctor" label="Doctor" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="diagnosis" label="Diagnosis" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Payment Modal */}
      <Modal
        title="Add Payment"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        onOk={() => handleAddItem('Payment', paymentForm, '/payments')}
      >
        <Form form={paymentForm} layout="vertical">
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="method" label="Payment Method" rules={[{ required: true }]}>
            <Select>
              <Option value="cash">Cash</Option>
              <Option value="credit_card">Credit Card</Option>
              <Option value="bank_transfer">Bank Transfer</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Invoice Modal */}
      <Modal
        title="Create Invoice"
        open={invoiceModalVisible}
        onCancel={() => setInvoiceModalVisible(false)}
        onOk={() => handleAddItem('Invoice', invoiceForm, '/invoices')}
      >
        <Form form={invoiceForm} layout="vertical">
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="items" label="Items" rules={[{ required: true }]}>
            <Select mode="tags" placeholder="Add items">
              <Option value="Consultation">Consultation</Option>
              <Option value="Medicines">Medicines</Option>
              <Option value="Lab Tests">Lab Tests</Option>
              <Option value="Operation">Operation</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}