import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Tooltip,
  Tabs,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface InsuranceInfo {
  policyNumber: string;
  provider: string;
  coverageAmount: string;
  expiryDate: string;
}

interface WardAllocation {
  key: string;
  patientName: string;
  ward: string;
  bedNumber: string;
  admissionDate: string;
  status: string;
  insurance?: InsuranceInfo;
}

const STORAGE_KEY = "wardAllocations";

const WardAllocations: React.FC = () => {
  const [data, setData] = useState<WardAllocation[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WardAllocation | null>(
    null
  );
  const [form] = Form.useForm();

  const [searchText, setSearchText] = useState("");
  const [filterWard, setFilterWard] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  // Save data to localStorage on update
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const showEditModal = (record?: WardAllocation) => {
    if (record) {
      setEditingRecord(record);
      form.setFieldsValue(record);
    } else {
      setEditingRecord(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingRecord) {
        const updatedData = data.map((item) =>
          item.key === editingRecord.key ? { ...item, ...values } : item
        );
        setData(updatedData);
      } else {
        const newRecord = {
          key: String(Date.now()),
          ...values,
        };
        setData([...data, newRecord]);
      }
      handleCancel();
    });
  };

  const handleDelete = (key: string) => {
    setData(data.filter((item) => item.key !== key));
  };

  const columns = [
    {
      title: "Patient Name",
      dataIndex: "patientName",
      key: "patientName",
    },
    {
      title: "Ward",
      dataIndex: "ward",
      key: "ward",
    },
    {
      title: "Bed Number",
      dataIndex: "bedNumber",
      key: "bedNumber",
    },
    {
      title: "Admission Date",
      dataIndex: "admissionDate",
      key: "admissionDate",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Active" ? "green" : "volcano"}>{status}</Tag>
      ),
    },
    {
      title: "Insurance",
      key: "insurance",
      render: (_: any, record: WardAllocation) =>
        record.insurance ? (
          <Tag color="blue">{record.insurance.provider}</Tag>
        ) : (
          <Tag color="default">None</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: WardAllocation) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.key)}
            />
          </Tooltip>
          <Tooltip title="Insurance">
            <Button
              type="link"
              icon={<SafetyCertificateOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Filtering & Search
  const filteredData = data.filter((item) => {
    const matchesSearch = item.patientName
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesWard = filterWard ? item.ward === filterWard : true;
    return matchesSearch && matchesWard;
  });

  return (
    <div className="p-6 space-y-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <Title level={3}>Ward Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showEditModal()}
        >
          Add Ward Allocation
        </Button>
      </div>

      <Text type="secondary">Manage and track patient ward allocations</Text>

      {/* Search & Filter Controls */}
      <div className="flex gap-4 my-4">
        <Input
          placeholder="Search by patient name"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ width: 250 }}
        />

        <Select
          placeholder="Filter by ward"
          allowClear
          style={{ width: 200 }}
          value={filterWard || undefined}
          onChange={(val) => setFilterWard(val || null)}
        >
          <Option value="General Ward">General Ward</Option>
          <Option value="ICU">ICU</Option>
          <Option value="Private Room">Private Room</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 5 }}
        bordered
        rowKey="key"
      />

      {/* Add/Edit Modal with Tabs */}
      <Modal
        title={editingRecord ? "Edit Ward Allocation" : "Add Ward Allocation"}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSave}
        okText="Save"
        width={600}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="Ward Details" key="1">
            <Form form={form} layout="vertical">
              <Form.Item
                name="patientName"
                label="Patient Name"
                rules={[
                  { required: true, message: "Please enter patient name" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="ward"
                label="Ward"
                rules={[{ required: true, message: "Please select a ward" }]}
              >
                <Select>
                  <Option value="General Ward">General Ward</Option>
                  <Option value="ICU">ICU</Option>
                  <Option value="Private Room">Private Room</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="bedNumber"
                label="Bed Number"
                rules={[{ required: true, message: "Please enter bed number" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="admissionDate"
                label="Admission Date"
                rules={[
                  { required: true, message: "Please enter admission date" },
                ]}
              >
                <Input type="date" />
              </Form.Item>

              <Form.Item name="status" label="Status">
                <Select>
                  <Option value="Active">Active</Option>
                  <Option value="Discharged">Discharged</Option>
                </Select>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Insurance Details" key="2">
            <Form form={form} layout="vertical">
              <Form.Item name={["insurance", "policyNumber"]} label="Policy No.">
                <Input />
              </Form.Item>
              <Form.Item name={["insurance", "provider"]} label="Provider">
                <Input />
              </Form.Item>
              <Form.Item
                name={["insurance", "coverageAmount"]}
                label="Coverage Amount"
              >
                <Input prefix="₹" type="number" />
              </Form.Item>
              <Form.Item name={["insurance", "expiryDate"]} label="Expiry Date">
                <Input type="date" />
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Modal>
    </div>
  );
};

export default WardAllocations;
