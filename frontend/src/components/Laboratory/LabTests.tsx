import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Typography,
  Tag,
  Form,
  Modal,
  Select,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const { Title, Text } = Typography;
const { Option } = Select;

interface Test {
  id: number;
  patientName: string;
  patientId: string;
  token: number; // numeric token
  testType: string;
  date: string;
  status: "Available" | "Not Available" | "Completed";
}

interface PatientTests {
  patientName: string;
  patientId: string;
  token: number;
  testTypes: string[];
  date: string;
  status: "Available" | "Not Available" | "Completed";
}

export default function LabTests() {
  const testSuggestions = [
    "Complete Blood Count",
    "Liver Function Test",
    "Kidney Function Test",
    "Thyroid Test",
    "Blood Sugar",
    "Cholesterol",
  ];

  const [tests, setTests] = useState<Test[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "Available" | "Not Available" | "Completed">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Load tests and token info from localStorage
  useEffect(() => {
    const storedTests = localStorage.getItem("testResults");
    if (storedTests) setTests(JSON.parse(storedTests));
  }, []);

  useEffect(() => {
    localStorage.setItem("testResults", JSON.stringify(tests));
  }, [tests]);

  // Function to get next token for today
  const getNextToken = (): number => {
    const today = new Date().toISOString().split("T")[0];
    const storedInfo = localStorage.getItem("tokenInfo");
    let lastToken = 0;
    let lastDate = "";

    if (storedInfo) {
      const parsed = JSON.parse(storedInfo);
      lastToken = parsed.lastToken;
      lastDate = parsed.date;
    }

    let token = 1;
    if (lastDate === today) {
      token = lastToken + 1;
    }

    localStorage.setItem("tokenInfo", JSON.stringify({ lastToken: token, date: today }));
    return token;
  };

  const handleAddTest = (values: any) => {
    if (!values.testType || values.testType.length === 0) {
      alert("Please select at least one test type.");
      return;
    }

    // Check if patient already exists
    const existingPatient = tests.find((t) => t.patientName === values.patientName);
    const patientId = existingPatient ? existingPatient.patientId : uuidv4();
    const token = existingPatient ? existingPatient.token : getNextToken();

    const newTests: Test[] = values.testType.map((t: string, index: number) => ({
      id: tests.length ? tests[tests.length - 1].id + index + 1 : index + 1,
      patientName: values.patientName,
      patientId,
      token,
      testType: t,
      date: values.date,
      status: values.status,
    }));

    setTests((prev) => [...prev, ...newTests]);
    setIsModalOpen(false);
    form.resetFields();
  };

  // Group tests by patient
  const groupedTests: PatientTests[] = Object.values(
    tests.reduce((acc: any, test) => {
      if (!acc[test.patientName]) {
        acc[test.patientName] = {
          patientName: test.patientName,
          patientId: test.patientId,
          token: test.token,
          testTypes: [test.testType],
          date: test.date,
          status: test.status,
        };
      } else {
        acc[test.patientName].testTypes.push(test.testType);
      }
      return acc;
    }, {})
  );

  const filteredTests = groupedTests
    .filter((pt) => filter === "all" || pt.status === filter)
    .filter((pt) => pt.patientName.toLowerCase().includes(search.toLowerCase()));

  const columns: ColumnsType<PatientTests> = [
    { title: "Patient Name", dataIndex: "patientName", key: "patientName" },
    { title: "Patient ID", dataIndex: "patientId", key: "patientId" },
    { title: "Token", dataIndex: "token", key: "token" },
    {
      title: "Test Types",
      dataIndex: "testTypes",
      key: "testTypes",
      render: (tests: string[]) => tests.join(", "),
    },
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "Available" ? (
          <Tag color="green">{status}</Tag>
        ) : status === "Not Available" ? (
          <Tag color="red">{status}</Tag>
        ) : (
          <Tag color="blue">{status}</Tag>
        ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <Title level={2}>Laboratory</Title>
        <Text type="secondary">Lab Tests</Text>
      </div>

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Space style={{ width: "100%", flexWrap: "wrap" }}>
          <Input
            placeholder="Search by patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
          />
          <Select
            value={filter}
            onChange={(value) => setFilter(value)}
            style={{ width: 180 }}
          >
            <Option value="all">All</Option>
            <Option value="Available">Available</Option>
            <Option value="Not Available">Not Available</Option>
            <Option value="Completed">Completed</Option>
          </Select>
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            Add Test(s)
          </Button>
          <Button type="default" onClick={() => navigate("/laboratory/results")}>
            View Test Results
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredTests}
          rowKey="patientId"
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
        <Form form={form} layout="vertical" onFinish={handleAddTest}>
          <Form.Item
            name="patientName"
            label="Patient Name"
            rules={[{ required: true, message: "Please enter patient name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="testType"
            label="Test Type(s)"
            rules={[{ required: true, message: "Please select at least one test type" }]}
          >
            <Select
              mode="multiple"
              showSearch
              placeholder="Select test(s)"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={testSuggestions.map((t) => ({ value: t, label: t }))}
            />
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select>
              <Option value="Available">Available</Option>
              <Option value="Not Available">Not Available</Option>
              <Option value="Completed">Completed</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
