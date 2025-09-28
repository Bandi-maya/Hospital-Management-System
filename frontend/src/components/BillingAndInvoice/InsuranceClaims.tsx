import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  DatePicker,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  Popconfirm,
  Typography,
  Tooltip,
  message,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;

interface InsuranceClaim {
  id: string;
  claimId: string;
  patientName: string;
  insuranceProvider: string;
  claimAmount: number;
  claimDate: string;
  status: "Pending" | "Approved" | "Rejected" | "Processing";
}

export default function InsuranceClaims() {
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<InsuranceClaim[]>([]);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  // Modals
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(
    null
  );
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const [form] = Form.useForm();

  // Load mock claims
  useEffect(() => {
    const mockData: InsuranceClaim[] = [
      {
        id: "1",
        claimId: "CLM-001",
        patientName: "John Doe",
        insuranceProvider: "MediCare Plus",
        claimAmount: 12000,
        claimDate: "2025-09-20",
        status: "Pending",
      },
      {
        id: "2",
        claimId: "CLM-002",
        patientName: "Jane Smith",
        insuranceProvider: "LifeSecure",
        claimAmount: 8500,
        claimDate: "2025-09-15",
        status: "Approved",
      },
      {
        id: "3",
        claimId: "CLM-003",
        patientName: "Michael Brown",
        insuranceProvider: "HealthFirst",
        claimAmount: 5000,
        claimDate: "2025-09-10",
        status: "Rejected",
      },
    ];
    setClaims(mockData);
    setFilteredClaims(mockData);
  }, []);

  // Search & filter
  useEffect(() => {
    let filtered = [...claims];

    if (searchText) {
      filtered = filtered.filter(
        (c) =>
          c.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
          c.claimId.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (dateRange) {
      filtered = filtered.filter((c) => {
        const date = dayjs(c.claimDate);
        return (
          date.isAfter(dateRange[0], "day") &&
          date.isBefore(dateRange[1], "day")
        );
      });
    }

    setFilteredClaims(filtered);
  }, [searchText, dateRange, claims]);

  const handleDelete = (id: string) => {
    const updated = claims.filter((c) => c.id !== id);
    setClaims(updated);
    setFilteredClaims(updated);
    message.success("Claim deleted successfully");
  };

  const handleView = (claim: InsuranceClaim) => {
    setSelectedClaim(claim);
    setIsViewModalVisible(true);
  };

  const handleEdit = (claim: InsuranceClaim) => {
    setSelectedClaim(claim);
    form.setFieldsValue({
      ...claim,
      claimDate: dayjs(claim.claimDate),
    });
    setIsEditModalVisible(true);
  };

  const handleUpdate = () => {
    form
      .validateFields()
      .then((values) => {
        const updated = claims.map((c) =>
          c.id === selectedClaim?.id
            ? {
                ...c,
                ...values,
                claimDate: values.claimDate.format("YYYY-MM-DD"),
              }
            : c
        );
        setClaims(updated);
        setFilteredClaims(updated);
        setIsEditModalVisible(false);
        message.success("Claim updated successfully");
      })
      .catch(() => {});
  };

  const handleAdd = () => {
    form
      .validateFields()
      .then((values) => {
        const newClaim: InsuranceClaim = {
          id: String(Date.now()),
          claimId: `CLM-${claims.length + 1}`,
          patientName: values.patientName,
          insuranceProvider: values.insuranceProvider,
          claimAmount: values.claimAmount,
          claimDate: values.claimDate.format("YYYY-MM-DD"),
          status: values.status,
        };
        const updated = [...claims, newClaim];
        setClaims(updated);
        setFilteredClaims(updated);
        setIsAddModalVisible(false);
        form.resetFields();
        message.success("New claim added successfully");
      })
      .catch(() => {});
  };

  const columns: ColumnsType<InsuranceClaim> = [
    { title: "Claim ID", dataIndex: "claimId", key: "claimId" },
    { title: "Patient", dataIndex: "patientName", key: "patientName" },
    {
      title: "Insurance Provider",
      dataIndex: "insuranceProvider",
      key: "insuranceProvider",
    },
    {
      title: "Amount",
      dataIndex: "claimAmount",
      key: "claimAmount",
      render: (v) => `₹${v.toLocaleString()}`,
    },
    { title: "Date", dataIndex: "claimDate", key: "claimDate" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "blue";
        if (status === "Approved") color = "green";
        if (status === "Rejected") color = "red";
        if (status === "Pending") color = "orange";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure?"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button shape="circle" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow space-y-6">
      <div className="flex justify-between items-center">
        <Title level={3}>Billing & Invoice</Title>
        <Text type="secondary">Insurance Claims</Text>
      </div>

      <div className="flex justify-between items-center">
        <Input.Search
          placeholder="Search by Patient or Claim ID"
          style={{ width: 300 }}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <RangePicker
          value={dateRange}
          onChange={(val) => setDateRange(val as [Dayjs, Dayjs] | null)}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setIsAddModalVisible(true);
          }}
        >
          Add Insurance for Patient
        </Button>
      </div>

      <Table
        dataSource={filteredClaims}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />

      {/* View Modal */}
      <Modal
        title="Claim Details"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={null}
      >
        {selectedClaim && (
          <div className="space-y-2">
            <p>
              <b>Claim ID:</b> {selectedClaim.claimId}
            </p>
            <p>
              <b>Patient:</b> {selectedClaim.patientName}
            </p>
            <p>
              <b>Insurance Provider:</b> {selectedClaim.insuranceProvider}
            </p>
            <p>
              <b>Claim Amount:</b> ₹{selectedClaim.claimAmount.toLocaleString()}
            </p>
            <p>
              <b>Claim Date:</b> {selectedClaim.claimDate}
            </p>
            <p>
              <b>Status:</b> {selectedClaim.status}
            </p>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Claim"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={handleUpdate}
        okText="Update"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="patientName" label="Patient Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="insuranceProvider" label="Insurance Provider" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="claimAmount" label="Claim Amount" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="claimDate" label="Claim Date" rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value="Pending">Pending</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
              <Option value="Processing">Processing</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Modal */}
      <Modal
        title="Add Insurance Claim"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onOk={handleAdd}
        okText="Add Claim"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="patientName" label="Patient Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="insuranceProvider" label="Insurance Provider" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="claimAmount" label="Claim Amount" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="claimDate" label="Claim Date" rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value="Pending">Pending</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
              <Option value="Processing">Processing</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
