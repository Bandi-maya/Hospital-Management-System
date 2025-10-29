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
  Tooltip,
  Skeleton,
  Spin
} from "antd";
import {
  PlusOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  ReloadOutlined,
  ExperimentOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { countries } from "@/Components/Patients/AddPatient";
import { DownloadApi, getApi, PostApi, PutApi } from "@/ApiService";
import { DepartmentInterface } from "@/Components/Departments/Departments";
import { Patient } from "@/types/patient";
import { useNavigate } from "react-router-dom";
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select as UISelect } from "../ui/select";
import { Download, Filter, Search } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button as UIButton } from "@/components/ui/button";

const { Option } = Select;
const { Title, Text } = Typography;

export default function TechnicianList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [technicians, setTechnicians] = useState<Patient[]>([]);
  const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
  const [form] = Form.useForm();
  const [selectedTechnician, setSelectedTechnician] = useState<any>(null);
  const [extraFields, setExtraFields] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    departments: false,
    extraFields: false,
    table: false
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const userTypeId = useMemo(() => {
    return extraFields?.[0]?.user_type;
  }, [extraFields]);

  
   async function exportTechnicians(format = 'csv') {
    try {
      await DownloadApi(`/export?type=users&user_type=labtechnician&format=${format}`, format);
    } catch (err) {
      console.error('Export error:', err);
      alert('Something went wrong while exporting.');
    }
  }

  const navigate = useNavigate();

  // Fetch data functions
  const getExtraFields = async () => {
    setLoadingStates(prev => ({ ...prev, extraFields: true }));
    try {
      const data = await getApi("/user-fields");
      if (!data?.error) {
        setExtraFields(data.data.filter((field: any) => field.user_type_data.type.toUpperCase() === "LABTECHNICIAN"));
      } else {
        toast.error("Error fetching technician fields: " + data.error);
      }
    } catch (error) {
      toast.error("Error fetching technician fields");
      console.error("Error fetching technician fields:", error);
    } finally {
      setLoadingStates(prev => ({ ...prev, extraFields: false }));
    }
  };

  const loadTechnicians = async (page = 1, limit = 10, searchQuery = searchTerm, status = statusFilter) => {
    setTableLoading(true);
    try {
      const data = await getApi(`/users?user_type=LABTECHNICIAN&page=${page}&limit=${limit}&q=${searchQuery}`);
      if (!data?.error) {
        setPagination(prev => ({
          ...prev,
          current: page,
          pageSize: limit,
          total: data.total_records,
        }));
        setTechnicians(data.data);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error getting technicians");
      console.error("Error getting technician data:", error);
    } finally {
      setTableLoading(false);
    }
  };

  const loadDepartments = async () => {
    setLoadingStates(prev => ({ ...prev, departments: true }));
    try {
      const data = await getApi('/departments');
      if (!data.error) {
        setDepartments(data.data);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to fetch departments");
    } finally {
      setLoadingStates(prev => ({ ...prev, departments: false }));
    }
  };

  useEffect(() => {
    loadTechnicians(pagination.current, pagination.pageSize);
    loadDepartments();
    getExtraFields();
  }, []);

  // Form submission handler
  const handleSubmit = async (values: any) => {
    setIsLoading(true);

    try {
      const formData = {
        ...values,
        name: `${values?.extra_fields?.first_name || ''} ${values?.extra_fields?.last_name || ''}`.trim(),
        user_type_id: selectedTechnician ? selectedTechnician.user_type_id : 5, // Assuming 5 is LABTECHNICIAN type
        id: selectedTechnician?.id,
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
        toast.success(selectedTechnician ? "Technician updated successfully!" : "Technician added successfully!");
        loadTechnicians(pagination.current, pagination.pageSize);
        setIsModalOpen(false);
        setSelectedTechnician(null);
        form.resetFields();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error(`Error ${selectedTechnician ? 'updating' : 'adding'} technician`);
      console.error(`Error ${selectedTechnician ? 'updating' : 'adding'} technician:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    loadTechnicians(newPagination.current, newPagination.pageSize);
  };

  // Delete technician handler
  const deleteTechnician = async (record: any) => {
    setLoadingActionId(record.id);
    try {
      const data = await PutApi(`/users`, { ...record, is_active: false });
      if (!data?.error) {
        toast.success("Technician deactivated successfully!");
        loadTechnicians(pagination.current, pagination.pageSize);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error deactivating technician");
      console.error("Error deleting technician:", error);
    } finally {
      setLoadingActionId(null);
    }
  };

  // Open modal for editing
  const handleEdit = (record: any) => {
    setSelectedTechnician(record);
    form.setFieldsValue({
      extra_fields: { ...record.extra_fields?.fields_data ?? {} },
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
    setSelectedTechnician(null);
    form.resetFields();
  };

  // Enhanced Action Button Component
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

  // Skeleton columns for loading state
  const skeletonColumns = [
    {
      title: "Technician ID",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: () => <Skeleton.Input active size="small" style={{ width: 80 }} />,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: () => (
        <Space>
          <Skeleton.Avatar active size="small" />
          <Skeleton.Input active size="small" style={{ width: 120 }} />
        </Space>
      ),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: 100,
      render: () => <Skeleton.Input active size="small" style={{ width: 80 }} />,
    },
    {
      title: "Blood Type",
      dataIndex: "blood_type",
      key: "bloodType",
      width: 120,
      render: () => <Skeleton.Input active size="small" style={{ width: 70 }} />,
    },
    {
      title: "Phone",
      dataIndex: "phone_no",
      key: "phone",
      render: () => (
        <Space>
          <Skeleton.Avatar active size="small" />
          <Skeleton.Input active size="small" style={{ width: 100 }} />
        </Space>
      ),
    },
    {
      title: "Department",
      dataIndex: "department_id",
      key: "department",
      render: () => <Skeleton.Input active size="small" style={{ width: 110 }} />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: () => <Skeleton.Input active size="small" style={{ width: 70 }} />,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: () => (
        <Space size="small">
          <Skeleton.Button active size="small" style={{ width: 40, height: 40 }} />
          <Skeleton.Button active size="small" style={{ width: 40, height: 40 }} />
        </Space>
      ),
    },
  ];

  // Actual columns
  const columns = [
    {
      title: "Technician ID",
      dataIndex: "id",
      key: "id",
      width: 120,
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
          <ActionButton
            icon={<EditOutlined />}
            label="Edit"
            type="default"
            loading={loadingActionId === record.id}
            onClick={() => handleEdit(record)}
          />

          <ActionButton
            icon={<DeleteOutlined />}
            label="Delete"
            danger
            loading={loadingActionId === record.id}
            confirm
            confirmAction={() => deleteTechnician(record)}
          />
        </Space>
      ),
    },
  ];

  // Generate skeleton data for loading state
  const skeletonData = Array.from({ length: pagination.pageSize }, (_, index) => ({
    key: index,
    id: index,
    name: '',
    gender: '',
    blood_type: '',
    phone_no: '',
    department: '',
    status: '',
    actions: '',
  }));

  return (
    <div className="p-6 space-y-6 rounded-lg" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <Title level={2} className="m-0">Lab Technician Management</Title>
        <Space>
          <Button
            onClick={() => loadTechnicians()}
            icon={<ReloadOutlined />}
            loading={tableLoading}
            className="flex items-center"
          >
            Refresh
          </Button>
          <Button
            type="primary"
            onClick={() => navigate("/technicians/add")}
            icon={<PlusOutlined />}
            loading={tableLoading}
            className="flex items-center"
          >
            Add Technician
          </Button>
        </Space>
      </div>


      <Card className="border-0 shadow-sm mb-15">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input.Search
                  placeholder="Search patients, doctors, or dates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                  onSearch={() => { loadTechnicians(pagination.current, pagination.pageSize, searchTerm) }}
                />
              </div>
            </div>
            {/* <div className="w-full md:w-48">
              <UISelect value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </UISelect>
            </div> */}
            <UIButton onClick={() => exportTechnicians()} variant="outline" className="h-12 px-6">
              <Download className="w-4 h-4 mr-2" />
              Export
            </UIButton>
          </div>
        </CardContent>
      </Card>

      {/* Technicians Table with Skeleton Loading */}
      <Card
        bodyStyle={{ padding: 0 }}
        className="overflow-hidden"
      >
        <Table
          dataSource={tableLoading ? skeletonData : technicians}
          columns={tableLoading ? skeletonColumns : columns}
          rowKey={tableLoading ? "key" : "id"}
          pagination={
            tableLoading ? false : {
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} technicians`,
            }
          }
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          loading={false} // We handle loading ourselves with skeleton
        />
      </Card>

      {/* Add/Edit Technician Modal */}
      <Modal
        title={
          <Space>
            <ExperimentOutlined className="text-blue-600" />
            <span>{selectedTechnician ? "Edit Lab Technician" : "Add New Lab Technician"}</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        <Spin spinning={loadingStates.departments || loadingStates.extraFields}>
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
                    name={['extra_fields', field.field_name]}
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
                {selectedTechnician ? "Update Technician" : "Add Technician"}
              </Button>
            </div>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
}