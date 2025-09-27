import React, { useState, useEffect } from "react";
import { Table, Button, Popconfirm } from "antd";
import { useNavigate } from "react-router-dom";
import { Patient } from "@/types/patient";
import { DeleteApi, getApi, PostApi } from "@/ApiService";

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const navigate = useNavigate();

  const loadPatients = async () => {
    await getApi(`/users?user_type_id=3`)
      .then((data) => {
        if (!data?.error) {
          setPatients(data);
        }
        else {
          console.error("Error fetching user fields:", data.error);
        }
      }).catch((error) => {
        console.error("Error deleting user field:", error);
      });
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const deletePatient = async (id: string) => {
    await DeleteApi(`/users`, { id: id })
      .then((data) => {
        if (!data?.error) {
          loadPatients();
        }
        else {
          console.error("Error fetching user fields:", data.error);
        }
      }).catch((error) => {
        console.error("Error deleting user field:", error);
      });
  };

  const addPatient = async (data: any) => {
    await PostApi(`/users`, data)
      .then((data) => {
        if (!data?.error) {
          loadPatients();
        }
        else {
          console.error("Error fetching user fields:", data.error);
        }
      }).catch((error) => {
        console.error("Error deleting user field:", error);
      });
  };

  const columns = [
    { title: "Patient ID", dataIndex: "id", key: "patientId" },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender"
    },
    {
      title: "Blood Type",
      dataIndex: "blood_type",
      key: "bloodType"
    },
    {
      title: "Phone",
      dataIndex: "phone_no",
      key: "phone"
    },
    {
      title: "Doctor",
      dataIndex: ["extra_fields", "fields_data", "assigned_doctor"],
      key: "assignedDoctor",
    },
    {
      title: "Ward",
      dataIndex: ["extra_fields", "fields_data", "wardNumber"],
      key: "wardNumber",
    },
    {
      title: "Bed",
      dataIndex: ["extra_fields", "fields_data", "bedNumber"],
      key: "bedNumber",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      render: (is_active: boolean) => (is_active ? "Active" : "Inactive"),
    },
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
