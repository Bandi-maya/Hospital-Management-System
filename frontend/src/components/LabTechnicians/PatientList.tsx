import React, { useState, useEffect } from "react";
import { Table, Button, Popconfirm, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { Patient } from "@/types/patient";
import { DeleteApi, getApi, PostApi, PutApi } from "@/ApiService";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";


export default function PatientList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState({});

  const navigate = useNavigate();

  const loadPatients = async () => {
    await getApi(`/users?DOCTOR=LABTECHNICIAN`)
      .then((data) => {
        if (!data?.error) {
          setPatients(data.data);
        }
        else {
          toast.error(data.error)
          console.error("Error fetching user fields:", data.error);
        }
      }).catch((error) => {
        toast.error("Error getting users")
        console.error("Error getting user data:", error);
      });
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const deletePatient = async (record: any) => {
    await PutApi(`/users`, { ...record, is_active: false })
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
      dataIndex: ["extra_fields", "fields_data", "assigned_to_doctor"],
      key: "assignedDoctor",
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
        <>
          <Popconfirm
            title="Are you sure you want to delete?"
            onConfirm={() => deletePatient(record)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
          <Button onClick={() => {
            setForm({ user_id: record.id, notes: "" });
            setIsDialogOpen(true);
          }}>Add Medical Record</Button>
        </>
      ),
    },
  ];

  function handleAddRecord() {
    PostApi("/medical-records", form)
      .then((data) => {
        if (!data?.error) {
          setIsDialogOpen(false);
          setForm({});
          toast.success("Record added successfully");
        }
        else {
          console.error("Error adding record:", data.error);
          toast.error("Error adding record");
        }
      }).catch((error) => {
        console.error("Error adding record:", error);
        toast.error("Error adding record");
      });
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Patient List</h1>
        <Button type="primary" onClick={() => navigate("/patients/add")}>
          Add Patient
        </Button>
      </div>

      <Table dataSource={patients} columns={columns} rowKey="id" />

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setForm({});
        }
      }}>
      </Dialog>
    </div>
  );
}
