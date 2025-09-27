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
import { getApi, PostApi } from "@/ApiService";
import { toast } from "sonner";

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
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "Available" | "Not Available">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  async function loadData() {
    await getApi("/lab-tests")
      .then((data) => {
        if (!data?.error) {
          setTests(data);
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
    loadData();
  }, []);

  const filteredTests = tests
    .filter((pt) => filter === "all" || pt.is_available === (filter === "Available"))
    .filter((pt) => pt.name.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { title: "Id", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Price", dataIndex: "price", key: "price" },
    {
      title: "Status",
      dataIndex: "is_available",
      key: "status",
      render: (status) =>
        status ? (
          <Tag color="green">{status}</Tag>
        ) : (
          <Tag color="red">{status}</Tag>
        )
    },
  ];

  const handleSubmit = async (values: any) => {
    const newPatient: any = {
      name: values.name,
      description: values.description,
      price: parseFloat(values.price),
      is_available: values.is_available
    };

    await PostApi(`/lab-tests`, newPatient)
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <Title level={2}>Laboratory</Title>
        <Text type="secondary">Lab Tests</Text>
      </div>

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Space style={{ width: "100%", flexWrap: "wrap" }}>
          <Input
            placeholder="Search by name..."
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
            {/* <Option value="Completed">Completed</Option> */}
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
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Test Name"
            rules={[{ required: true, message: "Please enter test name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input
            // mode="multiple"
            // showSearch
            // placeholder="Select test(s)"
            // filterOption={(input, option) =>
            //   (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            // }
            // options={testSuggestions.map((t) => ({ value: t, label: t }))}
            />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: "Please enter price" }]}
          >
            <Input type="number" min={0} step={0.01} />
          </Form.Item>

          {/* <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <Input type="date" />
          </Form.Item> */}

          <Form.Item
            name="is_available"
            label="Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select>
              <Option value={true}>Available</Option>
              <Option value={false}>Not Available</Option>
              {/* <Option value="Completed">Completed</Option> */}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
