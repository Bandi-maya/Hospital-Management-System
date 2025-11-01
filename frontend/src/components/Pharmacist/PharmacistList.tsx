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
import { DownloadApi, getApi, PostApi, PutApi } from "@/ApiService";
import { Patient } from "@/types/patient";
import { useNavigate } from "react-router-dom";
import { Download, Filter, Search } from "lucide-react";
import { Button as UIButton } from "@/components/ui/button";
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { DepartmentInterface } from "../Departments/Departments";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { countries } from "../Patients/AddPatient";

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

interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

interface ExtraFieldsData {
  fields_data?: Record<string, any>;
}

interface Pharmacist {
  id?: number;
  department_id?: number;
  blood_type?: string;
  address?: Address;
  extra_fields?: ExtraFieldsData;
  user_type_id?: number;
  date_of_birth?: string;
  gender?: string;
  email?: string;
  phone_no?: string;
  is_active?: boolean;
  name?: string;
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

interface FormValues {
  extra_fields?: Record<string, any>;
  department_id?: number;
  date_of_birth?: string;
  gender?: string;
  email?: string;
  phone_no?: string;
  street?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

interface ApiResponse {
  error?: string;
  data?: any;
  total_records?: number;
  active_records?: number;
  inactive_records?: number;
  recently_added?: number;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  recentJoined: number;
}

export default function PharmacistList() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([]);
  const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
  const [form] = Form.useForm();
  const [selectedPharmacist, setSelectedPharmacist] = useState<Pharmacist | null>(null);
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    departments: false,
    extraFields: false,
    table: false
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
    const [stats, setStats] = useState<any>({});
    const [statsLoading, setStatsLoading] = useState<boolean>(true);
  
  // const [stats, setStats] = useState<Stats>({
  //   totalUsers: 0,
  //   activeUsers: 0,
  //   inactiveUsers: 0,
  //   recentJoined: 0,
  // });

  const userTypeId = useMemo(() => {
    return extraFields?.[0]?.user_type;
  }, [extraFields]);

  const navigate = useNavigate();

  // Fetch data functions
  const getExtraFields = async (): Promise<void> => {
    setLoadingStates(prev => ({ ...prev, extraFields: true }));
    try {
      const data: ApiResponse = await getApi("/user-fields");
      if (!data?.error) {
        const pharmacistFields = data.data.filter((field: ExtraField) => 
          field.user_type_data.type.toUpperCase() === "PHARMACIST"
        );
        setExtraFields(pharmacistFields);
      } else {
        toast.error("Error fetching pharmacist fields: " + data.error);
      }
    } catch (error) {
      toast.error("Error fetching pharmacist fields");
      console.error("Error fetching pharmacist fields:", error);
    } finally {
      setLoadingStates(prev => ({ ...prev, extraFields: false }));
    }
  };

  const loadPharmacists = async (
    page: number = 1, 
    limit: number = 10, 
    searchQuery: string = searchTerm, 
    status: string = statusFilter
  ): Promise<void> => {
    setTableLoading(true);
    try {
      const data: ApiResponse = await getApi(`/users?user_type=PHARMACIST&page=${page}&limit=${limit}&q=${searchQuery}`);
      if (!data?.error) {
        setPagination(prev => ({
          ...prev,
          current: page,
          pageSize: limit,
          total: data.total_records || 0,
        }));
        setPharmacists(data.data || []);
        
        // Update stats
        setStats({
          ...data
        });
        setStatsLoading(false);
      } else {
        toast.error(data.error || "Failed to load pharmacists");
      }
    } catch (error) {
      toast.error("Error getting pharmacists");
      console.error("Error getting pharmacist data:", error);
    } finally {
      setTableLoading(false);
    }
  };

  const loadDepartments = async (): Promise<void> => {
    setLoadingStates(prev => ({ ...prev, departments: true }));
    try {
      const data: ApiResponse = await getApi('/departments');
      if (!data.error) {
        setDepartments(data.data || []);
      } else {
        toast.error(data.error || "Failed to load departments");
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to fetch departments");
    } finally {
      setLoadingStates(prev => ({ ...prev, departments: false }));
    }
  };

  useEffect(() => {
    loadPharmacists(pagination.current, pagination.pageSize);
    loadDepartments();
    getExtraFields();
  }, []);

  // Form submission handler
  const handleSubmit = async (values: FormValues): Promise<void> => {
    setIsLoading(true);

    try {
      const formData = {
        ...values,
        name: `${values?.extra_fields?.first_name || ''} ${values?.extra_fields?.last_name || ''}`.trim(),
        user_type_id: selectedPharmacist ? selectedPharmacist.user_type_id : 4,
        id: selectedPharmacist?.id,
        address: {
          street: values.street || '',
          city: values.city || '',
          state: values.state || '',
          zip_code: values.zip_code || '',
          country: values.country || '',
        }
      };

      const data: ApiResponse = await PutApi(`/users`, formData);
      if (!data?.error) {
        toast.success(selectedPharmacist ? "Pharmacist updated successfully!" : "Pharmacist added successfully!");
        loadPharmacists(pagination.current, pagination.pageSize);
        setIsModalOpen(false);
        setSelectedPharmacist(null);
        form.resetFields();
      } else {
        toast.error(data.error || "Operation failed");
      }
    } catch (error) {
      toast.error(`Error ${selectedPharmacist ? 'updating' : 'adding'} pharmacist`);
      console.error(`Error ${selectedPharmacist ? 'updating' : 'adding'} pharmacist:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableChange = (newPagination: TablePaginationConfig): void => {
    if (newPagination.current && newPagination.pageSize) {
      loadPharmacists(newPagination.current, newPagination.pageSize);
    }
  };

  // Delete pharmacist handler
  const deletePharmacist = async (record: Pharmacist): Promise<void> => {
    if (!record.id) return;
    
    setLoadingActionId(record.id);
    try {
      const data: ApiResponse = await PutApi(`/users`, { ...record, is_active: false });
      if (!data?.error) {
        toast.success("Pharmacist deactivated successfully!");
        loadPharmacists(pagination.current, pagination.pageSize);
      } else {
        toast.error(data.error || "Failed to deactivate pharmacist");
      }
    } catch (error) {
      toast.error("Error deactivating pharmacist");
      console.error("Error deleting pharmacist:", error);
    } finally {
      setLoadingActionId(null);
    }
  };

  // Open modal for editing
  const handleEdit = (record: Pharmacist): void => {
    setSelectedPharmacist(record);
    const formValues: FormValues = {
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
  const handleCancel = (): void => {
    setIsModalOpen(false);
    setSelectedPharmacist(null);
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
  }: ActionButtonProps): React.ReactElement => {
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
              ${!danger && type !== 'primary' ?
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

  const exportPharmacists = async (format: string = 'csv'): Promise<void> => {
    try {
      await DownloadApi(`/export?type=users&user_type=pharmacist&format=${format}`, format, 'pharmacists');
      toast.success(`Pharmacists exported successfully as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Something went wrong while exporting.');
    }
  };

  // Handle search
  const handleSearch = (): void => {
    loadPharmacists(1, pagination.pageSize, searchTerm);
  };

  // Skeleton columns for loading state
  const skeletonColumns: ColumnsType<any> = [
    {
      title: "Pharmacist ID",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: () => <Skeleton.Input active size="small" style={{ width: 60 }} />,
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
  const columns: ColumnsType<Pharmacist> = [
    {
      title: "Pharmacist ID",
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
          <Text strong>{text || 'N/A'}</Text>
        </Space>
      ),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: 100,
      render: (gender: string) => gender || 'N/A',
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
          {phone || 'N/A'}
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
      render: (_: any, record: Pharmacist) => (
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
            confirmAction={() => deletePharmacist(record)}
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
        <Title level={2} className="m-0">Pharmacist Management</Title>
        <Space>
          <Button
            onClick={() => loadPharmacists()}
            icon={<ReloadOutlined />}
            loading={tableLoading}
            className="flex items-center"
          >
            Refresh
          </Button>
          <Button
            type="primary"
            onClick={() => navigate("/pharmacist/add")}
            icon={<PlusOutlined />}
            loading={tableLoading}
            className="flex items-center"
          >
            Add Pharmacist
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            {statsLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Space><TeamOutlined /> Total Technicians</Space>}
                value={stats.total_records || 0}
                valueStyle={{ color: '#667eea' }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            {statsLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Space><CheckCircleOutlined /> Active</Space>}
                value={stats.active_records || 0}
                valueStyle={{ color: '#52c41a' }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            {statsLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Space><ClockCircleOutlined /> Recent Joined</Space>}
                value={stats.recently_added || 0}
                valueStyle={{ color: '#fa8c16' }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            {statsLoading ? (
              <Skeleton active paragraph={{ rows: 1 }} />
            ) : (
              <Statistic
                title={<Space><DashboardOutlined /> Utilization</Space>}
                value={Math.round(((stats.active_records || 0) / (stats.total_records || 1)) * 100)}
                suffix="%"
                valueStyle={{ color: '#36cfc9' }}
              />
            )}
          </Card>
        </Col>
      </Row>

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
            <UIButton onClick={() => exportPharmacists()} variant="outline" className="h-12 px-6">
              <Download className="w-4 h-4 mr-2" />
              Export
            </UIButton>
          </div>
        </CardContent>
      </Card>

      {/* Pharmacists Table with Skeleton Loading */}
      <Card
        bodyStyle={{ padding: 0 }}
        className="overflow-hidden"
      >
        <Table
          dataSource={tableLoading ? skeletonData : pharmacists}
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
                `${range[0]}-${range[1]} of ${total} pharmacists`,
            }
          }
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          loading={false}
        />
      </Card>

      {/* Add/Edit Pharmacist Modal */}
      <Modal
        title={
          <Space>
            <TeamOutlined className="text-blue-600" />
            <span>{selectedPharmacist ? "Edit Pharmacist" : "Add New Pharmacist"}</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={800}
        style={{ top: 20 }}
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
                <Title level={4} className="!mb-4">Personal Information</Title>
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
                {selectedPharmacist ? "Update Pharmacist" : "Add Pharmacist"}
              </Button>
            </div>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
}