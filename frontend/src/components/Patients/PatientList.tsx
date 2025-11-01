import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Table,
  Modal,
  Spin,
  Popconfirm,
  message,
  Space,
  Row,
  Col,
  Typography,
  Skeleton,
  Statistic,
  Tag,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  MedicineBoxOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { DeleteApi, DownloadApi, getApi, PostApi, PutApi } from "@/ApiService";
import { useNavigate } from "react-router-dom";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button as UIButton } from "@/components/ui/button";
import { Download, Filter, Search } from "lucide-react";
import { countries } from "./AddPatient";
import type { DepartmentInterface } from "../Departments/Departments";
import type { Patient } from "@/types/patient";

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

export default function PatientList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [extraFields, setExtraFields] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();
  const [medicalRecordForm] = Form.useForm();
  const [data, setData] = useState<any>({});
  const [statsLoading, setStatsLoading] = useState(true);

  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const stats = {
    totalUsers: data?.total_records || 0,
    activeUsers: data?.active_records || 0,
    inactiveUsers: data?.inactive_records || 0,
    recentJoined: data?.recently_added || 0,
  };

  const userTypeId = useMemo(() => extraFields?.[0]?.user_type, [extraFields]);

  /** ======================== FETCHERS ======================== */
  const getExtraFields = async () => {
    try {
      const res = await getApi("/user-fields");
      if (!res?.error) {
        setExtraFields(
          res.data.filter(
            (f: any) => f.user_type_data.type.toUpperCase() === "PATIENT"
          )
        );
      } else {
        message.error("Error fetching extra fields: " + res.error);
      }
    } catch {
      message.error("Error fetching user fields");
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await getApi("/departments");
      if (!res.error) setDepartments(res.data);
      else message.error(res.error);
    } catch {
      message.error("Failed to fetch departments");
    }
  };

  const loadPatients = async (
    page = 1,
    limit = 10,
    searchQuery = searchTerm
  ) => {
    setTableLoading(true);
    setStatsLoading(true);
    try {
      const res = await getApi(
        `/users?user_type=PATIENT&page=${page}&limit=${limit}&q=${searchQuery}`
      );
      if (!res?.error) {
        setData(res);
        setPatients(res.data);
        setPagination({
          current: page,
          pageSize: limit,
          total: res.total_records,
        });
      } else {
        message.error(res.error);
      }
    } catch {
      message.error("Error loading patients");
    } finally {
      setTableLoading(false);
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
    loadDepartments();
    getExtraFields();
  }, []);

  /** ======================== ACTIONS ======================== */
  const exportPatients = async (format = "csv") => {
    try {
      await DownloadApi(
        `/export?type=users&user_type=patient&format=${format}`,
        format,
        'patientss'
      );
    } catch {
      message.error("Something went wrong while exporting.");
    }
  };

  const handleEditPatient = (record: any) => {
    setSelectedPatient(record);
    form.setFieldsValue({
      address: record.address || {},
      department_id: record.department_id,
      date_of_birth: record.date_of_birth?.split("T")[0] || "",
      gender: record.gender,
      extra_fields: record.extra_fields?.fields_data || {},
      email: record.email,
      phone_no: record.phone_no,
      blood_type: record.blood_type,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsLoading(true);
      const formData = {
        ...values,
        id: selectedPatient.id,
        user_type_id: selectedPatient.user_type_id,
        name: `${values.extra_fields?.first_name || ""} ${values.extra_fields?.last_name || ""
          }`.trim(),
      };
      const res = await PutApi(`/users`, formData);
      if (!res?.error) {
        message.success("Patient updated successfully!");
        loadPatients();
        setIsModalOpen(false);
        setSelectedPatient(null);
        form.resetFields();
      } else {
        message.error(res.error);
      }
    } catch {
      message.error("Please fill in all required fields");
    } finally {
      setIsLoading(false);
    }
  };

  const deletePatient = async (record: any) => {
    setLoadingActionId(record.id);
    try {
      const res = await DeleteApi(`/users`, { id: record.id });
      if (!res?.error) {
        message.success("Patient deleted successfully");
        loadPatients();
      } else message.error(res.error);
    } catch {
      message.error("Error deleting patient");
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleAddMedicalRecord = (record: any) => {
    medicalRecordForm.setFieldsValue({ user_id: record.id, notes: "" });
    setIsDialogOpen(true);
  };

  const handleAddRecord = async () => {
    try {
      const values = await medicalRecordForm.validateFields();
      setLoadingActionId(values.user_id);
      const res = await PostApi("/medical-records", values);
      if (!res?.error) {
        message.success("Medical record added successfully");
        setIsDialogOpen(false);
        medicalRecordForm.resetFields();
      } else message.error(res.error);
    } catch {
      message.error("Please enter medical notes");
    } finally {
      setLoadingActionId(null);
    }
  };

  /** ======================== TABLE COLUMNS ======================== */
  const columns = [
    { title: "Patient ID", dataIndex: "id", key: "id", width: 90 },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Gender", dataIndex: "gender", key: "gender" },
    { title: "Blood Type", dataIndex: "blood_type", key: "bloodType" },
    { title: "Phone", dataIndex: "phone_no", key: "phone" },
    {
      title: "Doctor",
      dataIndex: ["extra_fields", "fields_data", "assigned_to_doctor"],
      key: "assignedDoctor",
      render: (doctor: string) => doctor || "Not assigned",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <ActionButton
            icon={<EditOutlined />}
            label="Edit"
            onClick={() => handleEditPatient(record)}
          />
          <ActionButton
            icon={<DeleteOutlined />}
            label="Delete"
            danger
            confirm
            confirmAction={() => deletePatient(record)}
          />
          <ActionButton
            icon={<FileTextOutlined />}
            label="Add Record"
            onClick={() => handleAddMedicalRecord(record)}
          />
        </Space>
      ),
    },
  ];

  const handleTableChange = (p: any) => {
    loadPatients(p.current, p.pageSize);
  };

  /** ======================== ACTION BUTTON COMPONENT ======================== */
  const ActionButton = ({
    icon,
    label,
    danger,
    confirm,
    confirmAction,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    danger?: boolean;
    confirm?: boolean;
    confirmAction?: () => void;
    onClick?: () => void;
  }) => {
    const btn = (
      <motion.div whileHover={{ scale: 1.1 }}>
        <Tooltip title={label}>
          <Button
            danger={danger}
            icon={icon}
            onClick={onClick}
            shape="circle"
          />
        </Tooltip>
      </motion.div>
    );

    return confirm ? (
      <Popconfirm title="Are you sure?" onConfirm={confirmAction}>
        {btn}
      </Popconfirm>
    ) : (
      btn
    );
  };

  const handleSearch = () => {
    loadPatients(1, pagination.pageSize, searchTerm);
  };

  /** ======================== RENDER ======================== */
  return (
    <div className="p-6 space-y-6 rounded-lg" style={{ background: "#f5f5f5" }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>Patient List</Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadPatients()}
            loading={tableLoading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/patients/add")}
          >
            Add Patient
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]}>
        {[
          { title: "Total Users", icon: <TeamOutlined />, value: stats.totalUsers, color: "#667eea" },
          { title: "Active", icon: <CheckCircleOutlined />, value: stats.activeUsers, color: "#52c41a" },
          { title: "Recent Joined", icon: <ClockCircleOutlined />, value: stats.recentJoined, color: "#fa8c16" },
          {
            title: "Utilization",
            icon: <DashboardOutlined />,
            value: Math.round((stats.activeUsers / (stats.totalUsers || 1)) * 100),
            color: "#36cfc9",
            suffix: "%",
          },
        ].map((stat, i) => (
          <Col xs={24} sm={12} md={8} lg={6} key={i}>
            <Card>
              {statsLoading ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <Statistic
                  title={
                    <Space>
                      {stat.icon} {stat.title}
                    </Space>
                  }
                  value={stat.value}
                  valueStyle={{ color: stat.color }}
                  suffix={stat.suffix}
                />
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" /> Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search nurses by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onPressEnter={handleSearch}
                  className="pl-10 h-12"
                  suffix={
                    <Button
                      type="text"
                      icon={<SearchOutlined />}
                      onClick={handleSearch}
                      loading={tableLoading}
                    />
                  }
                />
              </div>
            </div>
            <UIButton onClick={() => exportPatients()} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </UIButton>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table
          dataSource={patients}
          columns={columns}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          onChange={handleTableChange}
          loading={tableLoading}
        />
      </Card>

      {/* Add Medical Record Modal */}
      <Modal
        title="Add Medical Record"
        open={isDialogOpen}
        onCancel={() => {
          setIsDialogOpen(false);
          medicalRecordForm.resetFields();
        }}
        onOk={handleAddRecord}
        okText="Add Record"
        confirmLoading={loadingActionId === medicalRecordForm.getFieldValue("user_id")}
      >
        <Form form={medicalRecordForm} layout="vertical">
          <Form.Item name="user_id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="notes"
            label="Medical Notes"
            rules={[{ required: true, message: "Please enter medical notes" }]}
          >
            <TextArea rows={4} placeholder="Enter diagnosis, treatment..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Patient Modal */}
      <Modal
        title={
          <Space>
            <MedicineBoxOutlined className="text-blue-600" />
            <span>Edit Patient</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedPatient(null);
          form.resetFields();
        }}
        onOk={handleSubmit}
        confirmLoading={isLoading}
        width={800}
      >
        <Spin spinning={false}>
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Title level={4}>Personal Info</Title>
                <Form.Item name={["extra_fields", "first_name"]} label="First Name">
                  <Input />
                </Form.Item>
                <Form.Item name={["extra_fields", "last_name"]} label="Last Name">
                  <Input />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[{ required: true, type: "email" }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item name="phone_no" label="Phone Number" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
                  <Select>
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="date_of_birth"
                  label="Date of Birth"
                  rules={[{ required: true }]}
                >
                  <Input type="date" />
                </Form.Item>
                <Form.Item name="blood_type" label="Blood Type">
                  <Select>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                      <Option key={b} value={b}>
                        {b}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Title level={4}>Address</Title>
                <Form.Item
                  name={["address", "city"]}
                  label="City"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name={["address", "state"]}
                  label="State"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name={["address", "zip_code"]}
                  label="ZIP Code"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name={["address", "country"]}
                  label="Country"
                  rules={[{ required: true }]}
                >
                  <Select>
                    {countries.map((c) => (
                      <Option key={c} value={c}>
                        {c}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="department_id" label="Department">
                  <Select loading={false}>
                    {departments.map((d) => (
                      <Option key={d.id} value={d.id}>
                        {d.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
}
