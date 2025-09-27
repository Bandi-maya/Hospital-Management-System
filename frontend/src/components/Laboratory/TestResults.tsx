import React, { useEffect, useState } from "react";
import { Table, Input, Select, Tag, Button, Space, Form, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getApi, PostApi, PutApi } from "@/ApiService";
import { set } from "date-fns";
import TextArea from "antd/es/input/TextArea";

const { Option } = Select;

interface Test {
  id: number;
  patientName: string;
  testType: string;
  date: string;
  status: "Available" | "Not Available" | "Completed";
}

interface PatientTests {
  patientName: string;
  testTypes: string[];
  dates: string[];
  statuses: string[];
  ids: number[];
}

export default function TestResults() {
  const [results, setResults] = useState<Test[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "Available" | "Not Available" | "Completed">("all");
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddReportModalOpen, setIsAddReportModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const loginData = JSON.parse(localStorage.getItem("loginData") || "{}");

  async function loadPatients() {
    await getApi("/users?user_type_id=3")
      .then((data) => {
        if (!data?.error) {
          setPatients(data);
        }
        else {
          toast.error(data.error);
          console.error("Error fetching user patients:", data.error);
        }
      }).catch((error) => {
        toast.error("Error fetching user patients");
        console.error("Error deleting user patients:", error);
      });
  }

  async function loadTests() {
    await getApi("/lab-tests")
      .then((data) => {
        if (!data?.error) {
          setTests(data);
        }
        else {
          toast.error(data.error);
          console.error("Error fetching lab tests:", data.error);
        }
      }).catch((error) => {
        toast.error("Error fetching lab tests");
        console.error("Error deleting lab tests:", error);
      });
  }

  async function loadData() {
    await getApi("/lab-requests")
      .then((data) => {
        if (!data?.error) {
          setResults(data);
        }
        else {
          toast.error(data.error);
          console.error("Error fetching user fields:", data.error);
        }
      }).catch((error) => {
        console.error("Error deleting user field:", error);
      });
  }

  useEffect(() => {
    loadPatients()
    loadTests()
    loadData();
  }, []);

  const filteredResults = results
    .filter((pt: any) => filter === "all" || pt.statuses.includes(filter))
  // .filter((pt: any) => pt.id.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { title: "Patient Name", dataIndex: ["patient", "username"], key: "patientName" },
    { title: "Requestor Name", dataIndex: ["requester", "username"], key: "patientName" },
    {
      title: "Test Types",
      dataIndex: ["test", "name"],
      key: "testTypes",
    },
    {
      title: "Dates",
      dataIndex: "dates",
      key: "dates",
      render: (_, record) => {
        return <>
          created at: {new Date(record.created_at).toLocaleDateString()} <br />
          updated at: {new Date(record.updated_at).toLocaleDateString()}
        </>
      },
    },
    {
      title: "Statuses",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() =>
              navigate("/laboratory/reports", {
                state: {
                  patientName: record.patientName,
                  testIds: record.ids,
                },
              })
            }
          >
            View Report
          </Button>
          <Button
            type="primary"
            onClick={() => {
              setSelectedResult(record);
              setIsAddReportModalOpen(true);
            }}
          >
            Add Report
          </Button>
        </Space>
      ),
    },
  ];

  const handleSubmit = async (values: any) => {
    const newPatient: any = {
      patient_id: values.patient_id,
      test_id: values.test_id,
      requested_by: 8,
      status: "PENDING",
    };

    await PostApi(`/lab-requests`, newPatient)
      .then((data) => {
        if (!data?.error) {
          alert("Patient added successfully!");
          setIsModalOpen(false);
          form.resetFields();
          loadData()
        }
        else {
          console.error("Error fetching user fields:", data.error);
        }
      }).catch((error) => {
        console.error("Error deleting user field:", error);
      });

  };

  const handleSubmit1 = async (values: any) => {
    const newPatient: any = {
      request_id: selectedResult.id,
      report_data: { data: values.report_data },
      reported_by: 8,
    };

    Promise.all([
      PostApi(`/lab-reports`, newPatient),
      PutApi(`/lab-requests`, { id: selectedResult.id, test_id: selectedResult.test_id, patient_id: selectedResult.patient_id, reported_by: selectedResult.reported_by, status: "IN_PROGRESS" })
    ]).then(([data, data1]) => {
      if (!data?.error) {
        alert("Patient added successfully!");
        setIsAddReportModalOpen(false);
        form1.resetFields();
        loadData()
      }
      else {
        console.error("Error fetching user fields:", data.error);
      }
      if (!data1?.error) {
        setIsAddReportModalOpen(false);
      }
      else {
        console.error("Error fetching user fields:", data1.error);
      }
    }).catch((error) => {
      console.error("Error deleting user field:", error);
    })
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Laboratory</h1>
        <p className="text-muted-foreground">Lab Results</p>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          Add Test(s)
        </Button>
      </div>

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Space style={{ width: "100%", flexWrap: "wrap" }}>
          <Input
            placeholder="Search by patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
          />
          <Select value={filter} onChange={(value) => setFilter(value)} style={{ width: 180 }}>
            <Option value="all">All</Option>
            <Option value="Available">Available</Option>
            <Option value="Not Available">Not Available</Option>
            <Option value="Completed">Completed</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredResults}
          rowKey="patientName"
          pagination={{ pageSize: 5 }}
          scroll={{ x: "max-content" }}
        />
      </Space>

      <Modal
        title="Add Lab Test(s)"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Add"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="patient_id"
            label="Patient Name"
            rules={[{ required: true, message: "Please enter test name" }]}
          >
            <Select
              // mode="multiple"
              showSearch
              placeholder="Select patient"
              filterOption={(input, option: any) =>
                (option?.label ?? "")?.toLowerCase()?.includes(input?.toLowerCase())
              }
              options={patients.map((t) => ({ value: t.id, label: t.username }))}
            />
          </Form.Item>

          <Form.Item
            name="test_id"
            label="Test"
          >
            <Select
              mode="multiple"
              showSearch
              placeholder="Select test(s)"
              filterOption={(input, option: any) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={tests.map((t) => ({ value: t.id, label: t.name }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Lab Resport"
        open={isAddReportModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form1.submit()}
        okText="Add"
      >
        <Form form={form1} layout="vertical" onFinish={handleSubmit1}>
          <Form.Item
            name="report_data"
            label="Data"
            rules={[{ required: true, message: "Please enter test name" }]}
          >
            <TextArea
            />
          </Form.Item>


        </Form>
      </Modal>
    </div>
  );
}
