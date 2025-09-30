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
import { getApi, PutApi } from "@/ApiService";
import { get } from "node:https";
import { toast } from "sonner";

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
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [form] = Form.useForm();
  const [notes, setNotes] = useState("")

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
      }
      );
  }

  // Load patients from localStorage
  useEffect(() => {
    loadPatients();
  }, []);

  // Search filter
  useEffect(() => {
    if (!search) {
      setFilteredPatients(patients);
    } else {
      const lower = search.toLowerCase();
      setFilteredPatients(
        patients
        // .filter(
        //   (p) =>
        //     p.firstName.toLowerCase().includes(lower) ||
        //     p.lastName.toLowerCase().includes(lower) ||
        //     p.assignedDoctor?.toLowerCase().includes(lower) ||
        //     p.status?.toLowerCase().includes(lower)
        // )
      );
    }
  }, [search, patients]);

  // Add medical record
  const handleAddRecord = () => {
    if (!selectedPatient) return;

    PutApi('/medical-records', {
      user_id: selectedPatient.user_id,
      id: selectedPatient.id,
      notes: notes,
    }).then((data) => {
      if (!data?.error) {
        loadPatients();
        setSelectedPatient({})
        setNotes("")
        setIsModalVisible(false);
        form.resetFields();
      } else {
        toast.error("Error updating record: " + data.error);
        console.error("Error updating record:", data.error);
      }
    }).catch((error) => {
      toast.error("Error updating record");
      console.error("Error updating record:", error);
    }
    )
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
          // icon={<PlusOutlined />}
          onClick={() => {
            setNotes(record?.["notes"])
            setSelectedPatient(record);
            setIsModalVisible(true);
          }}
        >
          update Record
        </Button>
      ),
    },
  ];

  console.log(notes)

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
            dataSource={filteredPatients}
            columns={[
              { title: "Patient ID", dataIndex: "id", key: "patientId" },
              {
                title: "Patient Name",
                dataIndex: "name",
                key: "patientName",
              },
              { title: "Condition", dataIndex: "condition", key: "condition" },
              { title: "Date", dataIndex: "date", key: "date" },
              { title: "Notes", dataIndex: "notes", key: "notes" },
            ]}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Prescriptions" key="3">
        </Tabs.TabPane>
        <Tabs.TabPane tab="Medicines" key="4">
        </Tabs.TabPane>
        <Tabs.TabPane tab="Lab Tests" key="5">
        </Tabs.TabPane>
        <Tabs.TabPane tab="Operations" key="6">
        </Tabs.TabPane>
        <Tabs.TabPane tab="Consultations" key="7">
        </Tabs.TabPane>
        <Tabs.TabPane tab="Payments" key="8">
        </Tabs.TabPane>
        <Tabs.TabPane tab="Invoice" key="8">
        </Tabs.TabPane>
      </Tabs>

      {/* Add Record Modal */}
      <Modal
        title={`Add Medical Record for ${selectedPatient ? selectedPatient.firstName : ""
          }`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        destroyOnHidden
        destroyOnClose
        onOk={handleAddRecord}
      >
        Notes
        <Input.TextArea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      </Modal>
    </div>
  );
}
