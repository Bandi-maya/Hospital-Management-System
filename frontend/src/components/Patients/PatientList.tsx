import React, { useState, useEffect } from "react";
import { Table, Button, Popconfirm } from "antd";
import { useNavigate } from "react-router-dom";
import { Patient } from "@/types/patient";

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const navigate = useNavigate();

  // Load patients from localStorage
  const loadPatients = () => {
    const stored = JSON.parse(localStorage.getItem("patients") || "[]");
    setPatients(stored);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const deletePatient = (id: string) => {
    const updated = patients.filter((p) => p.id !== id);
    setPatients(updated);
    localStorage.setItem("patients", JSON.stringify(updated));
  };

  const columns = [
    { title: "Patient ID", dataIndex: "patientId", key: "patientId" },
    {
      title: "Name",
      render: (r: Patient) => `${r.firstName} ${r.lastName}`,
    },
    { title: "Gender", dataIndex: "gender", key: "gender" },
    { title: "Blood Type", dataIndex: "bloodType", key: "bloodType" },
    { title: "Phone", dataIndex: ["contact", "phone"], key: "phone" },
    { title: "Doctor", dataIndex: "assignedDoctor", key: "assignedDoctor" },
    { title: "Ward", dataIndex: "wardNumber", key: "wardNumber" },
    { title: "Bed", dataIndex: "bedNumber", key: "bedNumber" },
    { title: "Status", dataIndex: "status", key: "status" },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Patient) => (
        <Popconfirm
          title="Are you sure you want to delete?"
          onConfirm={() => deletePatient(record.id)}
        >
          <Button danger>Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Patient List</h1>
        <Button type="primary" onClick={() => navigate("/patients/add")}>
          Add Patient
        </Button>
      </div>

      <Table dataSource={patients} columns={columns} rowKey="id" />
    </div>
  );
}
