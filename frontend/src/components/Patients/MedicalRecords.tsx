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
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Patient } from "@/types/patient";

const { Option } = Select;

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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [form] = Form.useForm();

  // Load patients from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("patients") || "[]");
    setPatients(stored);
    setFilteredPatients(stored);
  }, []);

  // Search filter
  useEffect(() => {
    if (!search) {
      setFilteredPatients(patients);
    } else {
      const lower = search.toLowerCase();
      setFilteredPatients(
        patients.filter(
          (p) =>
            p.firstName.toLowerCase().includes(lower) ||
            p.lastName.toLowerCase().includes(lower) ||
            p.assignedDoctor?.toLowerCase().includes(lower) ||
            p.status?.toLowerCase().includes(lower)
        )
      );
    }
  }, [search, patients]);

  // Add medical record
  const handleAddRecord = (values: any) => {
    if (!selectedPatient) return;

    const newMedicalHistory = values.diseases.map((disease: string) => ({
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substr(2, 9),
      patientId: selectedPatient.patientId,
      condition: disease,
      diagnosisDate: new Date(),
      treatment: "",
      doctorId: selectedPatient.assignedDoctor || "",
      notes: values.notes,
      date: new Date().toLocaleDateString(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const updatedPatients = patients.map((p) =>
      p.id === selectedPatient.id
        ? {
            ...p,
            medicalHistory: [...(p.medicalHistory || []), ...newMedicalHistory],
          }
        : p
    );

    setPatients(updatedPatients);
    localStorage.setItem("patients", JSON.stringify(updatedPatients));
    setFilteredPatients(updatedPatients);
    setIsModalVisible(false);
    form.resetFields();
  };

  // Delete record
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

  const columns = [
    { title: "Patient ID", dataIndex: "patientId", key: "patientId" },
    {
      title: "Name",
      render: (r: Patient) => `${r.firstName} ${r.lastName}`,
    },
    { title: "Doctor", dataIndex: "assignedDoctor", key: "assignedDoctor" },
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
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedPatient(record);
            setIsModalVisible(true);
          }}
        >
          Add Record
        </Button>
      ),
    },
  ];

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

      {/* Tabs */}
      <Tabs defaultActiveKey="1">
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
        </Tabs.TabPane>

        <Tabs.TabPane tab="Medical Records" key="2">
          <Table
            dataSource={filteredPatients.flatMap((p) =>
              (p.medicalHistory || []).map((h, i) => ({
                ...h,
                patientName: `${p.firstName} ${p.lastName}`,
                patientId: p.patientId,
                key: `${p.id}-${i}`,
              }))
            )}
            columns={[
              { title: "Patient ID", dataIndex: "patientId", key: "patientId" },
              {
                title: "Patient Name",
                dataIndex: "patientName",
                key: "patientName",
              },
              { title: "Condition", dataIndex: "condition", key: "condition" },
              { title: "Date", dataIndex: "date", key: "date" },
              { title: "Notes", dataIndex: "notes", key: "notes" },
            ]}
          />
        </Tabs.TabPane>
      </Tabs>

      {/* Add Record Modal */}
      <Modal
        title={`Add Medical Record for ${
          selectedPatient ? selectedPatient.firstName : ""
        }`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddRecord}>
          {/* Diseases field with filtering */}
          <Form.Item
            label="Diseases"
            name="diseases"
            rules={[
              { required: true, message: "Please select at least one disease" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select disease(s)"
              options={diseaseSuggestions
                .filter(
                  (d) =>
                    !selectedPatient?.medicalHistory?.some(
                      (mh) => mh.condition === d
                    )
                )
                .map((d) => ({
                  value: d,
                  label: d,
                }))}
            />
          </Form.Item>

          <Form.Item
            label="Notes"
            name="notes"
            rules={[{ required: true, message: "Enter notes" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
