import { useState, useEffect, useMemo } from "react";
import { 
  Card, 
  Button, 
  Input, 
  Select, 
  Table, 
  Popconfirm, 
  Modal,
  Tag,
  Space,
  Typography,
  Divider,
  Form,
  Row,
  Col,
  message
} from "antd";
import { 
  SearchOutlined, 
  PlusOutlined, 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined, 
  CalendarOutlined, 
  EditOutlined, 
  DeleteOutlined,
  TeamOutlined
} from "@ant-design/icons";
import { toast } from "sonner";
import { countries } from "@/components/Patients/AddPatient";
import { getApi, PostApi, PutApi } from "@/ApiService";
import { DepartmentInterface } from "@/components/Departments/Departments";
import { Patient } from "@/types/patient";
import { useNavigate } from "react-router-dom";

const { Option } = Select;
const { Title, Text } = Typography;

export default function NurseList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nurses, setNurses] = useState<Patient[]>([]);
  const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
  const [form] = Form.useForm();
  const [selectedNurse, setSelectedNurse] = useState<any>(null);
  const [extraFields, setExtraFields] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const userTypeId = useMemo(() => {
    return extraFields?.[0]?.user_type;
  }, [extraFields]);

  const navigate = useNavigate();

  // Fetch data functions
  const getExtraFields = () => {
    getApi("/user-fields")
      .then((data) => {
        if (!data?.error) {
          setExtraFields(data.data.filter((field: any) => field.user_type_data.type.toUpperCase() === "NURSE"));
        } else {
          toast.error("Error fetching nurse fields: " + data.error);
        }
      }).catch((error) => {
        toast.error("Error fetching nurse fields");
        console.error("Error fetching nurse fields:", error);
      });
  };

  const loadNurses = async () => {
    setLoading(true);
    try {
      const data = await getApi(`/users?user_type=NURSE`);
      if (!data?.error) {
        setNurses(data.data);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error getting nurses");
      console.error("Error getting nurse data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = () => {
    getApi('/departments')
      .then((data) => {
        if (!data.error) {
          setDepartments(data.data);
        } else {
          toast.error(data.error);
        }
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
        toast.error("Failed to fetch departments");
      });
  };

  useEffect(() => {
    getExtraFields();
    loadNurses();
    loadDepartments();
  }, []);

  // Form submission handler
  const handleSubmit = async (values: any) => {
    setIsLoading(true);

    try {
      const formData = {
        ...values,
        name: `${values?.extra_fields?.first_name || ''} ${values?.extra_fields?.last_name || ''}`.trim(),
        user_type_id: selectedNurse ? selectedNurse.user_type_id : 4,
        id: selectedNurse?.id,
        address: {
          street: values.street,
          city: values.city,
          state: values.state,
          zip_code: values.zip_code,
          country: values.country,
        }
      };

      const data = await PutApi(`/users`, formData);
      if (!data?.error) {
        toast.success(selectedNurse ? "Nurse updated successfully!" : "Nurse added successfully!");
        loadNurses();
        setIsModalOpen(false);
        setSelectedNurse(null);
        form.resetFields();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error(`Error ${selectedNurse ? 'updating' : 'adding'} nurse`);
      console.error(`Error ${selectedNurse ? 'updating' : 'adding'} nurse:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete nurse handler
  const deleteNurse = async (record: any) => {
    try {
      const data = await PutApi(`/users`, { ...record, is_active: false });
      if (!data?.error) {
        toast.success("Nurse deleted successfully!");
        loadNurses();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error deleting nurse");
      console.error("Error deleting nurse:", error);
    }
  };

  // Open modal for editing
  const handleEdit = (record: any) => {
    setSelectedNurse(record);
    form.setFieldsValue({
      ...record.extra_fields?.fields_data,
      department_id: record.department_id,
      date_of_birth: record.date_of_birth?.split("T")[0],
      gender: record.gender,
      email: record.email,
      phone_no: record.phone_no,
      street: record.address?.street,
      city: record.address?.city,
      state: record.address?.state,
      zip_code: record.address?.zip_code,
      country: record.address?.country,
    });
    setIsModalOpen(true);
  };

  // Close modal
  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedNurse(null);
    form.resetFields();
  };

  // Table columns
  const columns = [
    {
      title: "Nurse ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <Space>
          <UserOutlined className="text-blue-500" />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: 100,
    },
    {
      title: "Blood Type",
      dataIndex: "blood_type",
      key: "bloodType",
      width: 120,
      render: (bloodType: string) => (
        <Tag color={bloodType ? "red" : "default"}>
          {bloodType || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone_no",
      key: "phone",
      render: (phone: string) => (
        <Space>
          <PhoneOutlined className="text-green-500" />
          {phone}
        </Space>
      ),
    },
    {
      title: "Department",
      dataIndex: "department_id",
      key: "department",
      render: (departmentId: number) => {
        const department = departments.find(d => d.id === departmentId);
        return department?.name || "N/A";
      },
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      width: 100,
      render: (is_active: boolean) => (
        <Tag color={is_active ? "green" : "red"}>
          {is_active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this nurse?"
            onConfirm={() => deleteNurse(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="!mb-2">Nurse Management</Title>
          <Text type="secondary">Manage and view all nurses in the system</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          size="large"
          onClick={() => navigate("/nurse/add")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Nurse
        </Button>
      </div>

      {/* Nurses Table */}
      <Card 
        className="shadow-lg border-0"
        bodyStyle={{ padding: 0 }}
      >
        <Table
          dataSource={nurses}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} nurses`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Add/Edit Nurse Modal */}
      <Modal
        title={
          <Space>
            <TeamOutlined className="text-blue-500" />
            {selectedNurse ? "Edit Nurse" : "Add New Nurse"}
          </Space>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Row gutter={[16, 16]}>
            {/* Personal Information */}
            <Col span={24}>
              <Title level={4} className="!mb-4">Personal Information</Title>
            </Col>
            
            {extraFields.map((field: any) => (
              <Col span={12} key={field.field_name}>
                <Form.Item
                  label={field.field_name}
                  name={field.field_name}
                  rules={[
                    { 
                      required: field.is_mandatory, 
                      message: `Please enter ${field.field_name}` 
                    }
                  ]}
                >
                  <Input 
                    placeholder={`Enter ${field.field_name}`}
                    size="large"
                    prefix={<UserOutlined />}
                  />
                </Form.Item>
              </Col>
            ))}

            <Col span={12}>
              <Form.Item
                label="Date of Birth"
                name="date_of_birth"
                rules={[{ required: true, message: "Please select date of birth" }]}
              >
                <Input 
                  type="date"
                  size="large"
                  prefix={<CalendarOutlined />}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Gender"
                name="gender"
                rules={[{ required: true, message: "Please select gender" }]}
              >
                <Select
                  placeholder="Select gender"
                  size="large"
                  options={[
                    { value: "MALE", label: "Male" },
                    { value: "FEMALE", label: "Female" },
                    { value: "OTHER", label: "Other" },
                  ]}
                />
              </Form.Item>
            </Col>

            {/* Contact Information */}
            <Col span={24}>
              <Title level={4} className="!mb-4">Contact Information</Title>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input 
                  type="email"
                  placeholder="Email address"
                  size="large"
                  prefix={<MailOutlined />}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Phone"
                name="phone_no"
                rules={[{ required: true, message: "Please enter phone number" }]}
              >
                <Input 
                  placeholder="Phone number"
                  size="large"
                  prefix={<PhoneOutlined />}
                />
              </Form.Item>
            </Col>

            {/* Address Information */}
            <Col span={24}>
              <Title level={4} className="!mb-4">Address Information</Title>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Street"
                name="street"
                rules={[{ required: true, message: "Please enter street address" }]}
              >
                <Input 
                  placeholder="Street address"
                  size="large"
                  prefix={<EnvironmentOutlined />}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="City"
                name="city"
                rules={[{ required: true, message: "Please enter city" }]}
              >
                <Input 
                  placeholder="City"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="State"
                name="state"
                rules={[{ required: true, message: "Please enter state" }]}
              >
                <Input 
                  placeholder="State"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="ZIP Code"
                name="zip_code"
                rules={[{ required: true, message: "Please enter ZIP code" }]}
              >
                <Input 
                  placeholder="ZIP code"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Country"
                name="country"
                rules={[{ required: true, message: "Please select country" }]}
              >
                <Select
                  placeholder="Select country"
                  size="large"
                  showSearch
                  optionFilterProp="label"
                  options={countries.map((c) => ({ value: c, label: c }))}
                />
              </Form.Item>
            </Col>

            {/* Professional Information */}
            <Col span={24}>
              <Title level={4} className="!mb-4">Professional Information</Title>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Department"
                name="department_id"
                rules={[{ required: true, message: "Please select department" }]}
              >
                <Select
                  placeholder="Select department"
                  size="large"
                  options={departments.map((d) => ({ 
                    value: d.id, 
                    label: d.name 
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <Button 
              onClick={handleCancel}
              size="large"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoading}
              size="large"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {selectedNurse ? "Update Nurse" : "Add Nurse"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}