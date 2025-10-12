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
  Divider,
  Tag,
  Space,
  Row,
  Col,
  Typography,
  Descriptions,
  Tooltip
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined,
  UserOutlined,
  MedicineBoxOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { countries } from "@/components/Patients/AddPatient";
import { getApi, PostApi, PutApi } from "@/ApiService";
import { DepartmentInterface } from "@/components/Departments/Departments";
import { Patient } from "@/types/patient";
import { useNavigate } from "react-router-dom";
import FullscreenLoader from "@/components/Loader/FullscreenLoader";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

export default function PatientList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
  const [form] = Form.useForm();
  const [medicalRecordForm] = Form.useForm();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [extraFields, setExtraFields] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null);
  const [showFullscreenLoader, setShowFullscreenLoader] = useState(false); // Renamed state
  const [loadingStates, setLoadingStates] = useState({
    departments: false,
    extraFields: false,
    table: false
  });
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const userTypeId = useMemo(() => extraFields?.[0]?.user_type, [extraFields]);

  // Show loading spinner with progress - updated to use the imported loader
  const showLoader = () => {
    setShowFullscreenLoader(true);
  };

  const getExtraFields = () => {
    setLoadingStates(prev => ({ ...prev, extraFields: true }));
    getApi("/user-fields")
      .then((data) => {
        if (!data?.error) {
          setExtraFields(
            data.data.filter(
              (field: any) => field.user_type_data.type.toUpperCase() === "PATIENT"
            )
          );
        } else message.error("Error fetching user fields: " + data.error);
      })
      .catch(() => message.error("Error fetching user fields"))
      .finally(() => setLoadingStates(prev => ({ ...prev, extraFields: false })));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsLoading(true);

      if (selectedPatient) {
        const formData = {
          ...values,
          id: selectedPatient.id,
          user_type_id: selectedPatient.user_type_id,
          name: `${values.extra_fields?.first_name || ''} ${values.extra_fields?.last_name || ''}`.trim()
        };

        PutApi(`/users`, formData)
          .then((data) => {
            if (!data?.error) {
              message.success("Patient updated successfully!");
              loadPatients();
              setIsModalOpen(false);
              setSelectedPatient(null);
              form.resetFields();
            } else {
              message.error(data.error);
            }
          })
          .catch((error) => {
            console.error("Error updating patient:", error);
            message.error("Error updating patient");
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    } catch (error) {
      message.error("Please fill in all required fields");
    }
  };

  const loadDepartments = () => {
    setLoadingStates(prev => ({ ...prev, departments: true }));
    getApi("/departments")
      .then((data) => {
        if (!data.error) setDepartments(data.data);
        else message.error(data.error);
      })
      .catch(() => message.error("Failed to fetch departments"))
      .finally(() => setLoadingStates(prev => ({ ...prev, departments: false })));
  };

  const loadPatients = async (page = 1, limit = 10) => {
    setIsLoading(true);
    try {
      const data = await getApi(`/users?user_type=PATIENT&page=${page}&limit=${limit}`);
      if (!data?.error) {
        setPatients(data.data); // Use the paginated `data` field from API
        setPagination(prev => ({
          ...prev,
          current: page,
          pageSize: limit,
          total: data.total_records, // Set total from API
        }));
      } else {
        message.error(data.error);
      }
    } catch (error) {
      message.error("Error getting patients");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients(pagination.current, pagination.pageSize);
    loadDepartments();
    getExtraFields();
  }, []);

  const deletePatient = async (record: any) => {
    setLoadingActionId(record.id);
    await PutApi(`/users`, { ...record, is_active: false })
      .then((data) => {
        if (!data?.error) {
          message.success("Patient deactivated successfully");
          loadPatients();
        } else message.error(data.error);
      })
      .catch(() => message.error("Error deactivating patient"))
      .finally(() => setLoadingActionId(null));
  };

  const handleAddRecord = async () => {
    try {
      const values = await medicalRecordForm.validateFields();
      setLoadingActionId(values.user_id);

      PostApi("/medical-records", values)
        .then((data) => {
          if (!data?.error) {
            message.success("Medical record added successfully");
            setIsDialogOpen(false);
            medicalRecordForm.resetFields();
          } else {
            message.error("Error adding medical record: " + data.error);
          }
        })
        .catch((error) => {
          console.error("Error adding record:", error);
          message.error("Error adding medical record");
        })
        .finally(() => setLoadingActionId(null));
    } catch (error) {
      message.error("Please enter medical notes");
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

  const handleAddMedicalRecord = (record: any) => {
    medicalRecordForm.setFieldsValue({ user_id: record.id, notes: "" });
    setIsDialogOpen(true);
  };

  const ActionButton = ({
    icon,
    label,
    type = "default",
    danger = false,
    onClick,
    loading = false,
    confirm = false,
    confirmAction
  }: {
    icon: React.ReactNode;
    label: string;
    type?: "primary" | "default" | "dashed" | "link" | "text";
    danger?: boolean;
    onClick?: () => void;
    loading?: boolean;
    confirm?: boolean;
    confirmAction?: () => void;
  }) => {
    const button = (
      <motion.div
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 250 }}
      >
        <Tooltip title={label} placement="top">
          <Button
            type={type}
            danger={danger}
            icon={icon}
            loading={loading}
            onClick={onClick}
            className={`
              flex items-center justify-center 
              transition-all duration-300 ease-in-out
              ${!danger && !type.includes('primary') ?
                'text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-gray-300 hover:border-blue-300' : ''
              }
              ${danger ?
                'hover:text-red-600 hover:bg-red-50 border-gray-300 hover:border-red-300' : ''
              }
              w-10 h-10 rounded-full
            `}
            style={{
              minWidth: '40px',
              border: '1px solid #d9d9d9'
            }}
          />
        </Tooltip>
      </motion.div>
    );

    return confirm ? (
      <Popconfirm
        title="Are you sure?"
        onConfirm={confirmAction}
        okText="Yes"
        cancelText="No"
        placement="top"
      >
        {button}
      </Popconfirm>
    ) : (
      button
    );
  };

  const columns = [
    {
      title: "Patient ID",
      dataIndex: "id",
      key: "id",
      width: 90,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Blood Type",
      dataIndex: "blood_type",
      key: "bloodType",
    },
    {
      title: "Phone",
      dataIndex: "phone_no",
      key: "phone",
    },
    {
      title: "Doctor",
      dataIndex: ["extra_fields", "fields_data", "assigned_to_doctor"],
      key: "assignedDoctor",
      render: (doctor: any) => doctor || "Not assigned",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      render: (is_active: boolean) => (
        <Tag color={is_active ? "green" : "red"}>
          {is_active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: any, record: any) => (
        <Space size="small">
          <ActionButton
            icon={<EditOutlined />}
            label="Edit"
            type="default"
            loading={loadingActionId === record.id}
            onClick={() => handleEditPatient(record)}
          />

          <ActionButton
            icon={<DeleteOutlined />}
            label="Delete"
            danger
            loading={loadingActionId === record.id}
            confirm
            confirmAction={() => deletePatient(record)}
          />

          <ActionButton
            icon={<FileTextOutlined />}
            label="Add Record"
            type="default"
            loading={loadingActionId === record.id}
            onClick={() => handleAddMedicalRecord(record)}
          />
        </Space>
      ),
    },
  ];

  const handleTableChange = (newPagination: any) => {
    loadPatients(newPagination.current, newPagination.pageSize);
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-sm">
      {/* Fullscreen Loading Spinner */}
      <FullscreenLoader
        active={showFullscreenLoader}
        onComplete={() => setShowFullscreenLoader(false)}
        speed={100}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <Title level={2} className="m-0">Patient List</Title>
        <Space>
          <Button
            onClick={() => loadPatients()}
            icon={<ReloadOutlined />}
            loading={loadingStates.table}
            className="flex items-center"
          >
            Refresh
          </Button>
          <Button
            type="primary"
            onClick={() => navigate("/patients/add")}
            icon={<PlusOutlined />}
            loading={loadingStates.table}
            className="flex items-center"
          >
            Add Patient
          </Button>
        </Space>
      </div>

      {/* Patients Table */}
      <Card
        loading={loadingStates.table}
        bodyStyle={{ padding: 0 }}
        className="overflow-hidden"
      >
        <Table
          dataSource={patients}
          columns={columns}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Modal for adding medical record */}
      <Modal
        title="Add Medical Record"
        open={isDialogOpen}
        onCancel={() => {
          setIsDialogOpen(false);
          medicalRecordForm.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsDialogOpen(false);
              medicalRecordForm.resetFields();
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loadingActionId === medicalRecordForm.getFieldValue('user_id')}
            onClick={handleAddRecord}
            icon={<FileTextOutlined />}
          >
            Add Record
          </Button>,
        ]}
        width={500}
      >
        <Form
          form={medicalRecordForm}
          layout="vertical"
        >
          <Form.Item name="user_id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="notes"
            label="Medical Notes"
            rules={[{ required: true, message: 'Please enter medical notes' }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter medical notes, diagnosis, treatment details..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for editing patient */}
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
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsModalOpen(false);
              setSelectedPatient(null);
              form.resetFields();
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isLoading}
            onClick={handleSubmit}
          >
            Save Changes
          </Button>,
        ]}
        width={800}
        style={{ top: 20 }}
      >
        <Spin spinning={loadingStates.departments || loadingStates.extraFields}>
          <Form
            form={form}
            layout="vertical"
            className="mt-4"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Title level={4}>Personal Information</Title>

                <Form.Item
                  name={['extra_fields', 'first_name']}
                  label="First Name"
                >
                  <Input placeholder="Enter first name" />
                </Form.Item>

                <Form.Item
                  name={['extra_fields', 'last_name']}
                  label="Last Name"
                >
                  <Input placeholder="Enter last name" />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
                >
                  <Input placeholder="Enter email" />
                </Form.Item>

                <Form.Item
                  name="phone_no"
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please enter phone number' }]}
                >
                  <Input placeholder="Enter phone number" />
                </Form.Item>

                <Form.Item
                  name="gender"
                  label="Gender"
                  rules={[{ required: true, message: 'Please select gender' }]}
                >
                  <Select placeholder="Select gender">
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="date_of_birth"
                  label="Date of Birth"
                  rules={[{ required: true, message: 'Please select date of birth' }]}
                >
                  <Input type="date" />
                </Form.Item>

                <Form.Item
                  name="blood_type"
                  label="Blood Type"
                >
                  <Select placeholder="Select blood type">
                    <Option value="A+">A+</Option>
                    <Option value="A-">A-</Option>
                    <Option value="B+">B+</Option>
                    <Option value="B-">B-</Option>
                    <Option value="AB+">AB+</Option>
                    <Option value="AB-">AB-</Option>
                    <Option value="O+">O+</Option>
                    <Option value="O-">O-</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Title level={4}>Address Information</Title>

                <Form.Item
                  name={['address', 'city']}
                  label="City"
                  rules={[{ required: true, message: 'Please enter city' }]}
                >
                  <Input placeholder="Enter city" />
                </Form.Item>

                <Form.Item
                  name={['address', 'state']}
                  label="State"
                  rules={[{ required: true, message: 'Please enter state' }]}
                >
                  <Input placeholder="Enter state" />
                </Form.Item>

                <Form.Item
                  name={['address', 'zip_code']}
                  label="ZIP Code"
                  rules={[{ required: true, message: 'Please enter ZIP code' }]}
                >
                  <Input placeholder="Enter ZIP code" />
                </Form.Item>

                <Form.Item
                  name={['address', 'country']}
                  label="Country"
                  rules={[{ required: true, message: 'Please select country' }]}
                >
                  <Select placeholder="Select country">
                    {countries.map((country) => (
                      <Option key={country} value={country}>
                        {country}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="department_id"
                  label="Department"
                >
                  <Select
                    placeholder="Select department"
                    loading={loadingStates.departments}
                  >
                    {departments.map((dept) => (
                      <Option key={dept.id} value={dept.id}>
                        {dept.name}
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