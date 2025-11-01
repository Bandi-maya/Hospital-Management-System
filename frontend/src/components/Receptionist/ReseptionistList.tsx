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
  Spin,
  Statistic
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
  TeamOutlined,
  ReloadOutlined,
  DashboardOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { countries } from "@/Components/Patients/AddPatient";
import { DownloadApi, getApi, PostApi, PutApi } from "@/ApiService";
import { DepartmentInterface } from "@/Components/Departments/Departments";
import { Patient, User } from "@/types/patient";
import { useNavigate } from "react-router-dom";
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select as UISelect } from "../ui/select";
import { Download, Filter, Search } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button as UIButton } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const { Option } = Select;
const { Title, Text } = Typography;

// Type definitions
interface ExtraField {
  field_name: string;
  is_mandatory: boolean;
  user_type: number;
  user_type_data: {
    type: string;
  };
}

interface Receptionist extends User {
  id?: number;
  user_type_id?: number;
  name?: string;
  email?: string;
  phone_no?: string;
  date_of_birth?: string
  department_id?: number;
  gender?: string;
  blood_type?: string;
  is_active?: boolean;
  address?: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  extra_fields?: {
    fields_data?: Record<string, any>;
  };
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  recentJoined: number;
}

interface Pagination {
  current: number;
  pageSize: number;
  total: number;
}

interface LoadingStates {
  departments: boolean;
  extraFields: boolean;
  table: boolean;
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  type?: "primary" | "default" | "dashed" | "link" | "text";
  danger?: boolean;
  onClick?: () => void;
  loading?: boolean;
  confirm?: boolean;
  confirmAction?: () => void;
}

export default function ReceptionistList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receptionists, setReceptionists] = useState<Receptionist[]>([]);
  const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
  const [form] = Form.useForm();
  const [selectedReceptionist, setSelectedReceptionist] = useState<Receptionist | null>(null);
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    departments: false,
    extraFields: false,
    table: false
  });
  const { hasPermission } = useAuth()
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    recentJoined: 0,
  });

  const [statsLoading, setStatsLoading] = useState(true);

  const userTypeId = useMemo(() => {
    return extraFields?.[0]?.user_type;
  }, [extraFields]);

  const navigate = useNavigate();

  // Export function
  const exportReceptionists = async (format = 'csv') => {
    try {
      await DownloadApi(`/export?type=users&user_type=receptionist&format=${format}`, format, 'receptionists');
      toast.success(`Receptionists exported successfully as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Something went wrong while exporting.');
    }
  };

  // Fetch data functions
  const getExtraFields = async () => {
    setLoadingStates(prev => ({ ...prev, extraFields: true }));
    try {
      const data = await getApi("/user-fields");
      if (!data?.error) {
        const receptionistFields = data.data.filter((field: ExtraField) =>
          field.user_type_data.type.toUpperCase() === "RECEPTIONIST"
        );
        setExtraFields(receptionistFields);
      } else {
        toast.error("Error fetching receptionist fields: " + data.error);
      }
    } catch (error) {
      toast.error("Error fetching receptionist fields");
      console.error("Error fetching receptionist fields:", error);
    } finally {
      setLoadingStates(prev => ({ ...prev, extraFields: false }));
    }
  };

  const loadReceptionists = async (
    page = pagination.current,
    limit = pagination.pageSize,
    searchQuery = searchTerm,
    status = statusFilter
  ) => {
    setTableLoading(true);
    try {
      const data = await getApi(
        `/users?user_type=RECEPTIONIST&page=${page}&limit=${limit}&q=${searchQuery}`
      );
      if (!data?.error) {
        setPagination(prev => ({
          ...prev,
          current: page,
          pageSize: limit,
          total: data.total_records,
        }));
        setReceptionists(data.data);

        // Update stats
        setStats({
          totalUsers: data.total_records || 0,
          activeUsers: data.active_records || 0,
          inactiveUsers: data.inactive_records || 0,
          recentJoined: data.recently_added || 0,
        });
        setStatsLoading(false);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error getting receptionists");
      console.error("Error getting receptionist data:", error);
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
    loadReceptionists();
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
        user_type_id: selectedReceptionist ? selectedReceptionist.user_type_id : 4,
        id: selectedReceptionist?.id,
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
        toast.success(
          selectedReceptionist ?
            "Receptionist updated successfully!" :
            "Receptionist added successfully!"
        );
        loadReceptionists(pagination.current, pagination.pageSize);
        setIsModalOpen(false);
        setSelectedReceptionist(null);
        form.resetFields();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error(`Error ${selectedReceptionist ? 'updating' : 'adding'} receptionist`);
      console.error(`Error ${selectedReceptionist ? 'updating' : 'adding'} receptionist:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    loadReceptionists(newPagination.current, newPagination.pageSize);
  };

  // Delete receptionist handler
  const deleteReceptionist = async (record: Receptionist) => {
    setLoadingActionId(record.id);
    try {
      const data = await PutApi(`/users`, { ...record, is_active: false });
      if (!data?.error) {
        toast.success("Receptionist deactivated successfully!");
        loadReceptionists(pagination.current, pagination.pageSize);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error deactivating receptionist");
      console.error("Error deleting receptionist:", error);
    } finally {
      setLoadingActionId(null);
    }
  };

  // Open modal for editing
  const handleEdit = (record: Receptionist) => {
    setSelectedReceptionist(record);
    const formValues = {
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
    };

    form.setFieldsValue(formValues);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedReceptionist(null);
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
  }: ActionButtonProps) => {
    const button = (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
              transition-all duration-200 ease-in-out
              ${!danger && type === "default" ?
                'text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-gray-300 hover:border-blue-300' : ''
              }
              ${danger ?
                'hover:text-red-600 hover:bg-red-50 border-gray-300 hover:border-red-300' : ''
              }
              w-9 h-9 rounded-lg
            `}
            style={{
              minWidth: '36px',
              border: '1px solid #d9d9d9'
            }}
          />
        </Tooltip>
      </motion.div>
    );

    if (confirm && confirmAction) {
      return (
        <Popconfirm
          title="Are you sure you want to deactivate this receptionist?"
          description="This action can be reversed by editing the receptionist."
          onConfirm={confirmAction}
          okText="Yes"
          cancelText="No"
          placement="top"
        >
          {button}
        </Popconfirm>
      );
    }

    return button;
  };

  // Search handler
  const handleSearch = () => {
    loadReceptionists(1, pagination.pageSize, searchTerm);
  };

  // Skeleton columns for loading state
  const skeletonColumns = [
    {
      title: "Receptionist ID",
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
      render: () => <Skeleton.Input active size="small" style={{ width: 60 }} />,
    },
    {
      title: "Blood Type",
      dataIndex: "blood_type",
      key: "bloodType",
      width: 100,
      render: () => <Skeleton.Input active size="small" style={{ width: 60 }} />,
    },
    {
      title: "Phone",
      dataIndex: "phone_no",
      key: "phone",
      render: () => (
        <Space>
          <Skeleton.Avatar active size="small" />
          <Skeleton.Input active size="small" style={{ width: 120 }} />
        </Space>
      ),
    },
    {
      title: "Department",
      dataIndex: "department_id",
      key: "department",
      render: () => <Skeleton.Input active size="small" style={{ width: 100 }} />,
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
      width: 120,
      render: () => (
        <Space size="small">
          <Skeleton.Button active size="small" style={{ width: 36, height: 36 }} />
          <Skeleton.Button active size="small" style={{ width: 36, height: 36 }} />
        </Space>
      ),
    },
  ];

  // Actual columns
  const columns = [
    {
      title: "Receptionist ID",
      dataIndex: "id",
      key: "id",
      width: 120,
      sorter: true,
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
      render: (gender: string) => gender || "N/A",
    },
    {
      title: "Blood Type",
      dataIndex: "blood_type",
      key: "bloodType",
      width: 100,
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
          {phone || "N/A"}
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
      width: 120,
      render: (_: any, record: Receptionist) => (
        hasPermission(['receptionist:edit']) && <Space size="small">
          <ActionButton
            icon={<EditOutlined />}
            label="Edit Receptionist"
            type="default"
            onClick={() => handleEdit(record)}
          />

          {record.is_active && (
            <ActionButton
              icon={<DeleteOutlined />}
              label="Deactivate Receptionist"
              danger
              loading={loadingActionId === record.id}
              confirm
              confirmAction={() => deleteReceptionist(record)}
            />
          )}
        </Space>
      ),
    },
  ];

  // Generate skeleton data for loading state
  const skeletonData: any = Array.from({ length: pagination.pageSize }, (_, index) => ({
    key: index,
    id: `loading-${index}`,
  }));

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Title level={2} className="m-0 text-gray-800">Receptionist Management</Title>
        <Space>
          <Button
            onClick={() => loadReceptionists()}
            icon={<ReloadOutlined />}
            loading={tableLoading}
            className="flex items-center"
          >
            Refresh
          </Button>
          {
            hasPermission(['receptionist:add']) &&
            <Button
              type="primary"
              onClick={() => navigate("/receptionist/add")}
              icon={<PlusOutlined />}
              className="flex items-center bg-blue-600 hover:bg-blue-700"
            >
              Add Receptionist
            </Button>
          }
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-sm">
            {statsLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Space><TeamOutlined className="text-blue-500" /> Total Receptionists</Space>}
                value={stats.totalUsers}
                valueStyle={{ color: '#667eea' }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-sm">
            {statsLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Space><CheckCircleOutlined className="text-green-500" /> Active</Space>}
                value={stats.activeUsers}
                valueStyle={{ color: '#52c41a' }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-sm">
            {statsLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Space><ClockCircleOutlined className="text-orange-500" /> Recent Joined</Space>}
                value={stats.recentJoined}
                valueStyle={{ color: '#fa8c16' }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-sm">
            {statsLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Space><DashboardOutlined className="text-cyan-500" /> Utilization</Space>}
                value={Math.round((stats.activeUsers / (stats.totalUsers || 1)) * 100)}
                suffix="%"
                valueStyle={{ color: '#36cfc9' }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Filters & Search Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
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
                <Input
                  placeholder="Search receptionists by name, email, or phone..."
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

            <UIButton
              onClick={() => exportReceptionists()}
              variant="outline"
              className="h-12 px-6 border-gray-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </UIButton>
          </div>
        </CardContent>
      </Card>

      {/* Receptionists Table */}
      <Card className="shadow-sm">
        <Table
          dataSource={tableLoading ? skeletonData : receptionists}
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
                `${range[0]}-${range[1]} of ${total} receptionists`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }
          }
          onChange={handleTableChange}
          loading={tableLoading}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Add/Edit Receptionist Modal */}
      <Modal
        title={
          <Space>
            <TeamOutlined className="text-blue-600" />
            <span className="text-lg font-semibold">
              {selectedReceptionist ? "Edit Receptionist" : "Add New Receptionist"}
            </span>
          </Space>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={800}
        destroyOnClose
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
                <Title level={4} className="!mb-4 text-gray-800">Personal Information</Title>
              </Col>

              {extraFields.map((field: ExtraField) => (
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
                      prefix={<UserOutlined className="text-gray-400" />}
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
                    prefix={<CalendarOutlined className="text-gray-400" />}
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
                <Title level={4} className="!mb-4 text-gray-800">Contact Information</Title>
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
                    prefix={<MailOutlined className="text-gray-400" />}
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
                    prefix={<PhoneOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>

              {/* Address Information */}
              <Col span={24}>
                <Title level={4} className="!mb-4 text-gray-800">Address Information</Title>
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
                    prefix={<EnvironmentOutlined className="text-gray-400" />}
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
                <Title level={4} className="!mb-4 text-gray-800">Professional Information</Title>
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
                    loading={loadingStates.departments}
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
                disabled={isLoading}
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
                {selectedReceptionist ? "Update Receptionist" : "Add Receptionist"}
              </Button>
            </div>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
}