import React, { useState, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  Tag,
  Select,
  Table,
  Space,
  Modal,
  Form,
  Row,
  Col,
  Statistic,
  Skeleton,
  Avatar,
  Descriptions,
  Tooltip,
  Dropdown,
  Menu,
  Badge,
  Popconfirm,
  message,
  Spin,
  Switch
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  BuildOutlined,
  EnvironmentOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileTextOutlined,
  CalendarOutlined,
  MoreOutlined,
  ReloadOutlined,
  FilterOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ContactsOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getApi, PostApi, PutApi, DeleteApi } from "@/ApiService";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;
const { TextArea } = Input;

interface OperationTheatre {
  id: number;
  name: string;
  building: string;
  floor: string;
  wing: string;
  room_number: string;
  department_id: number;
  status: string;
  is_active: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
  department?: {
    id: number;
    name: string;
  };
}

interface Department {
  id: number;
  name: string;
  description: string;
}

interface FormData {
  name: string;
  building: string;
  floor: string;
  wing: string;
  room_number: string;
  department_id: string;
  status: string;
  is_active: boolean;
  notes: string;
}

interface ApiResponse {
  data: OperationTheatre[];
  total_records?: number;
  error?: string;
}

interface Stats {
  total: number;
  available: number;
  inUse: number;
  underMaintenance: number;
  active: number;
}

interface Pagination {
  current: number;
  pageSize: number;
  total: number;
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

const THEATRE_STATUS = {
  AVAILABLE: "Available",
  IN_USE: "In Use",
  UNDER_MAINTENANCE: "Under Maintenance",
  CLEANING: "Cleaning",
  OUT_OF_SERVICE: "Out of Service"
} as const;

const STATUS_COLORS = {
  AVAILABLE: "green",
  IN_USE: "blue",
  UNDER_MAINTENANCE: "orange",
  CLEANING: "purple",
  OUT_OF_SERVICE: "red"
} as const;

const STATUS_ICONS = {
  AVAILABLE: CheckCircleOutlined,
  IN_USE: PlayCircleOutlined,
  UNDER_MAINTENANCE: ToolOutlined,
  CLEANING: EnvironmentOutlined,
  OUT_OF_SERVICE: CloseCircleOutlined
} as const;

// Enhanced Action Button Component
const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  type = "default",
  danger = false,
  onClick,
  loading = false,
  confirm = false,
  confirmAction
}) => {
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
            transition-all duration-300 ease-in-out
            ${!danger && type === "default" ?
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
      title="Delete Operation Theatre"
      description="Are you sure you want to delete this operation theatre?"
      onConfirm={confirmAction}
      okText="Yes"
      cancelText="No"
      okType="danger"
      placement="top"
    >
      {button}
    </Popconfirm>
  ) : (
    button
  );
};

// Skeleton Components
const SkeletonTable = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((item) => (
      <Card key={item} className="p-4 border-0 shadow-sm">
        <Skeleton active paragraph={{ rows: 1 }} />
      </Card>
    ))}
  </div>
);

const SkeletonStats = () => (
  <Row gutter={[16, 16]}>
    {[1, 2, 3, 4, 5].map((item) => (
      <Col xs={24} sm={12} lg={6} key={item}>
        <Card className="border-0 shadow-sm">
          <Skeleton active paragraph={{ rows: 1 }} />
        </Card>
      </Col>
    ))}
  </Row>
);

export default function OperationTheatreManagement() {
  const [operationTheatres, setOperationTheatres] = useState<OperationTheatre[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [data, setData] = useState<any>({})
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTheatre, setSelectedTheatre] = useState<OperationTheatre | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [form] = Form.useForm();
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Load all data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (
    page = 1,
    limit = 10,
    searchQuery = search,
    status = statusFilter,
    department = departmentFilter
  ) => {
    setLoading(true);
    try {
      const [theatresData, departmentsData] = await Promise.all([
        getApi(`/operation-theatre?page=${page}&limit=${limit}&q=${searchQuery}&status=${status === 'all' ? '' : status}&department=${department === 'all' ? '' : department}`),
        getApi('/departments')
      ]);

      if (!theatresData?.error) {
        setData(theatresData)
        setOperationTheatres(theatresData.data || []);
        setPagination(prev => ({
          ...prev,
          current: page,
          total: theatresData.total_records || 0
        }));
      } else {
        toast.error(theatresData.error);
      }

      if (!departmentsData?.error) {
        setDepartments(departmentsData.data || []);
      } else {
        toast.error(departmentsData.error);
      }
    } catch (error) {
      toast.error("Failed to load data");
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    loadData(newPagination.current, newPagination.pageSize);
  };

  const handleOpenModal = (theatre: OperationTheatre | null = null) => {
    if (theatre) {
      setSelectedTheatre(theatre);
      form.setFieldsValue({
        name: theatre.name,
        building: theatre.building,
        floor: theatre.floor,
        wing: theatre.wing,
        room_number: theatre.room_number,
        department_id: theatre.department_id.toString(),
        status: theatre.status,
        is_active: theatre.is_active,
        notes: theatre.notes
      });
    } else {
      setSelectedTheatre(null);
      form.setFieldsValue({
        name: "",
        building: "",
        floor: "",
        wing: "",
        room_number: "",
        department_id: "",
        status: "AVAILABLE",
        is_active: true,
        notes: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleViewTheatre = (theatre: OperationTheatre) => {
    setSelectedTheatre(theatre);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (selectedTheatre) {
        setLoadingActionId(selectedTheatre.id);
        const response = await PutApi(`/operation-theatre`, {
          ...values,
          id: selectedTheatre.id,
          department_id: parseInt(values.department_id)
        });

        if (!response?.error) {
          message.success("Operation theatre updated successfully!");
          loadData(pagination.current, pagination.pageSize);
          setIsModalOpen(false);
        } else {
          message.error(response.error);
        }
      } else {
        const response = await PostApi('/operation-theatre', {
          ...values,
          department_id: parseInt(values.department_id)
        });

        if (!response?.error) {
          message.success("Operation theatre created successfully!");
          loadData(pagination.current, pagination.pageSize);
          setIsModalOpen(false);
        } else {
          message.error(response.error);
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Error processing request");
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleDelete = async (id: number) => {
    setLoadingActionId(id);
    try {
      const response = await DeleteApi(`/operation-theatre/${id}`);
      if (!response?.error) {
        message.success("Operation theatre deleted successfully!");
        loadData(pagination.current, pagination.pageSize);
      } else {
        message.error(response.error);
      }
    } catch (error) {
      message.error("Error deleting operation theatre");
      console.error("Error deleting operation theatre:", error);
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleStatusChange = async (theatreId: number, newStatus: string) => {
    setLoadingActionId(theatreId);
    try {
      const response = await PutApi(`/operation-theatre/${theatreId}`, { status: newStatus });
      if (!response?.error) {
        message.success(`Operation theatre status updated to ${THEATRE_STATUS[newStatus as keyof typeof THEATRE_STATUS]}`);
        loadData(pagination.current, pagination.pageSize);
      } else {
        message.error(response.error);
      }
    } catch (error) {
      message.error("Error updating operation theatre status");
      console.error("Error updating operation theatre status:", error);
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleActiveToggle = async (theatreId: number, isActive: boolean) => {
    setLoadingActionId(theatreId);
    try {
      const response = await PutApi(`/operation-theatre/${theatreId}`, { is_active: isActive });
      if (!response?.error) {
        message.success(`Operation theatre ${isActive ? 'activated' : 'deactivated'} successfully!`);
        loadData(pagination.current, pagination.pageSize);
      } else {
        message.error(response.error);
      }
    } catch (error) {
      message.error("Error updating operation theatre status");
      console.error("Error updating operation theatre status:", error);
    } finally {
      setLoadingActionId(null);
    }
  };

  const filteredTheatres = operationTheatres.filter(theatre => {
    const matchesSearch =
      theatre.name.toLowerCase().includes(search.toLowerCase()) ||
      theatre.building?.toLowerCase().includes(search.toLowerCase()) ||
      theatre.room_number?.toLowerCase().includes(search.toLowerCase()) ||
      theatre.department?.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || theatre.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" ||
      theatre.department_id.toString() === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const stats: Stats = {
    total: data?.total_records,
    available: data?.available_theatres,
    inUse: data?.in_use_theatres,
    underMaintenance: data?.under_maintenance_theatres,
    active: data?.active_theatres
  };

  const getStatusIcon = (status: string) => {
    const IconComponent = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || CheckCircleOutlined;
    return <IconComponent className="text-sm" />;
  };

  const columns: ColumnsType<OperationTheatre> = [
    {
      title: "Operation Theatre",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: OperationTheatre) => (
        <div className="flex items-center gap-3">
          <Avatar
            icon={<BuildOutlined />}
            size="small"
            style={{
              backgroundColor: '#1890ff',
              borderRadius: '8px'
            }}
          />
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            {record.room_number && (
              <div className="text-xs text-gray-500">Room {record.room_number}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Location",
      key: "location",
      render: (record: OperationTheatre) => (
        <div className="space-y-1">
          {record.building && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <EnvironmentOutlined className="text-gray-400" />
              <span>{record.building}</span>
            </div>
          )}
          {(record.floor || record.wing) && (
            <div className="text-sm text-gray-500 ml-6">
              {[record.floor, record.wing].filter(Boolean).join(' • ')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Department",
      dataIndex: ["department", "name"],
      key: "department",
      render: (text: string) => (
        <Tag color="blue" className="px-2 py-1 rounded-full">
          {text || "No department"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: OperationTheatre) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <Badge
            color={STATUS_COLORS[status as keyof typeof STATUS_COLORS]}
            text={THEATRE_STATUS[status as keyof typeof THEATRE_STATUS]}
            className="px-2 py-1"
          />
        </div>
      ),
    },
    {
      title: "Active",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean, record: OperationTheatre) => (
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Switch
            checked={isActive}
            onChange={(checked) => handleActiveToggle(record.id, checked)}
            loading={loadingActionId === record.id}
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<CloseCircleOutlined />}
          />
        </motion.div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: any, record: OperationTheatre) => (
        <Space size="small">
          <ActionButton
            icon={<EyeOutlined />}
            label="View Details"
            type="default"
            onClick={() => handleViewTheatre(record)}
          />

          <ActionButton
            icon={<EditOutlined />}
            label="Edit Theatre"
            type="default"
            loading={loadingActionId === record.id}
            onClick={() => handleOpenModal(record)}
          />

          <ActionButton
            icon={<DeleteOutlined />}
            label="Delete Theatre"
            danger
            loading={loadingActionId === record.id}
            confirm
            confirmAction={() => handleDelete(record.id)}
          />

          <Dropdown
            overlay={
              <Menu>
                <Menu.Item
                  key="available"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, "AVAILABLE")}
                >
                  Mark Available
                </Menu.Item>
                <Menu.Item
                  key="in_use"
                  icon={<PlayCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, "IN_USE")}
                >
                  Mark In Use
                </Menu.Item>
                <Menu.Item
                  key="maintenance"
                  icon={<ToolOutlined />}
                  onClick={() => handleStatusChange(record.id, "UNDER_MAINTENANCE")}
                >
                  Mark Under Maintenance
                </Menu.Item>
                <Menu.Item
                  key="out_of_service"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleStatusChange(record.id, "OUT_OF_SERVICE")}
                >
                  Mark Out of Service
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
            placement="bottomRight"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Tooltip title="Change Status" placement="top">
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  className="w-10 h-10 rounded-full border border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                />
              </Tooltip>
            </motion.div>
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Operation Theatre Management</h1>
            <p className="text-gray-600 mt-1 text-base">Manage operating rooms and their availability</p>
          </div>
          <Space>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => loadData()}
                loading={loading}
                className="h-12 px-4 border-gray-300"
              >
                Refresh
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal()}
                size="large"
                className="h-12 px-6 text-base font-medium bg-blue-600 hover:bg-blue-700"
              >
                Add Operation Theatre
              </Button>
            </motion.div>
          </Space>
        </div>
      </div>

      {/* Statistics Grid */}
      {loading ? (
        <SkeletonStats />
      ) : (
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <Statistic
                title="Total Theatres"
                value={stats.total}
                prefix={<BuildOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <Statistic
                title="Available"
                value={stats.available}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <Statistic
                title="In Use"
                value={stats.inUse}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <Statistic
                title="Active"
                value={stats.active}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters Card */}
      <Card className="bg-white border-0 shadow-sm rounded-xl mb-6">
        <div className="p-5">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Input.Search
                placeholder="Search operation theatres by name, building, room number, or department..."
                prefix={<SearchOutlined />}
                value={search}
                onSearch={() => loadData(pagination.current, pagination.pageSize, search)}
                onChange={(e) => setSearch(e.target.value)}
                size="large"
                className="hover:border-blue-400 focus:border-blue-500"
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  loadData(pagination.current, pagination.pageSize, search, value);
                }}
                placeholder="All Status"
                size="large"
                className="w-full"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">All Status</Option>
                <Option value="AVAILABLE">Available</Option>
                <Option value="IN_USE">In Use</Option>
                <Option value="UNDER_MAINTENANCE">Under Maintenance</Option>
                <Option value="CLEANING">Cleaning</Option>
                <Option value="OUT_OF_SERVICE">Out of Service</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                value={departmentFilter}
                onChange={(value) => {
                  setDepartmentFilter(value);
                  loadData(pagination.current, pagination.pageSize, search, statusFilter, value);
                }}
                placeholder="All Departments"
                size="large"
                className="w-full"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">All Departments</Option>
                {departments.map(dept => (
                  <Option key={dept.id} value={dept.id.toString()}>{dept.name}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  icon={<DownloadOutlined />}
                  size="large"
                  className="w-full border-gray-300 hover:border-blue-400"
                >
                  Export
                </Button>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  icon={<FileTextOutlined />}
                  size="large"
                  className="w-full border-gray-300 hover:border-blue-400"
                >
                  Report
                </Button>
              </motion.div>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Operation Theatres Table */}
      <Card
        className="bg-white border-0 shadow-sm rounded-xl"
        title={
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Operation Theatres</h2>
              <p className="text-gray-600 mt-1">
                {filteredTheatres.length} theatre{filteredTheatres.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        }
      >
        <div className="p-6">
          {loading ? (
            <SkeletonTable />
          ) : filteredTheatres.length === 0 ? (
            <div className="text-center py-12">
              <BuildOutlined className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">No operation theatres found</p>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">
                {search || statusFilter !== "all" || departmentFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first operation theatre"
                }
              </p>
              {(search || statusFilter !== "all" || departmentFilter !== "all") && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                      setDepartmentFilter("all");
                      loadData(1, pagination.pageSize, "", "all", "all");
                    }}
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                </motion.div>
              )}
            </div>
          ) : (
            <Table
              dataSource={filteredTheatres}
              columns={columns}
              rowKey="id"
              onChange={handleTableChange}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`
              }}
              scroll={{ x: 800 }}
            />
          )}
        </div>
      </Card>

      {/* Add/Edit Operation Theatre Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <BuildOutlined className="text-blue-600 text-lg" />
            <span className="text-lg font-semibold">
              {selectedTheatre ? "Edit Operation Theatre" : "Add New Operation Theatre"}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        width={700}
        okText={selectedTheatre ? "Update Theatre" : "Add Theatre"}
        cancelText="Cancel"
        okButtonProps={{
          size: 'large',
          loading: loadingActionId !== null,
          icon: selectedTheatre ? <EditOutlined /> : <PlusOutlined />
        }}
        cancelButtonProps={{ size: 'large' }}
        confirmLoading={loadingActionId !== null}
      >
        <Spin spinning={loading}>
          <Form form={form} layout="vertical" className="space-y-4 mt-4">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Theatre Name"
                  name="name"
                  rules={[
                    { required: true, message: "Please enter theatre name" },
                    { max: 50, message: "Name must be at most 50 characters" }
                  ]}
                >
                  <Input
                    placeholder="Enter theatre name"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Department"
                  name="department_id"
                  rules={[{ required: true, message: "Please select a department" }]}
                >
                  <Select
                    placeholder="Select department"
                    size="large"
                  >
                    {departments.map(dept => (
                      <Option key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Building"
                  name="building"
                  rules={[{ max: 100, message: "Building must be at most 100 characters" }]}
                >
                  <Input
                    placeholder="Enter building name"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Floor"
                  name="floor"
                  rules={[{ max: 20, message: "Floor must be at most 20 characters" }]}
                >
                  <Input
                    placeholder="Enter floor number"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Wing"
                  name="wing"
                  rules={[{ max: 50, message: "Wing must be at most 50 characters" }]}
                >
                  <Input
                    placeholder="Enter wing/section"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Room Number"
                  name="room_number"
                  rules={[{ max: 20, message: "Room number must be at most 20 characters" }]}
                >
                  <Input
                    placeholder="Enter room number"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Status"
                  name="status"
                >
                  <Select
                    size="large"
                  >
                    <Option value="AVAILABLE">Available</Option>
                    <Option value="IN_USE">In Use</Option>
                    <Option value="UNDER_MAINTENANCE">Under Maintenance</Option>
                    <Option value="CLEANING">Cleaning</Option>
                    <Option value="OUT_OF_SERVICE">Out of Service</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Active Status"
                  name="is_active"
                  valuePropName="checked"  // <-- important for Switch components
                >
                  {/* <div className="flex items-center space-x-3 pt-2"> */}
                  <Switch
                    checked={form.getFieldValue('is_active')}
                    onChange={(checked) => {
                      form.setFieldValue('is_active', checked);
                    }}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                  />
                  {/* <span className="text-gray-600">
                    {form.getFieldValue('is_active') ? "Active" : "Inactive"}
                  </span> */}
                  {/* </div> */}
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Notes"
              name="notes"
            >
              <TextArea
                rows={3}
                placeholder="Additional notes about this operation theatre..."
                size="large"
              />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      {/* View Operation Theatre Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <BuildOutlined className="text-blue-600 text-lg" />
            <span className="text-lg font-semibold">Operation Theatre Details</span>
          </div>
        }
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalOpen(false)} size="large">
            Close
          </Button>,
          <motion.div key="edit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setIsViewModalOpen(false);
                handleOpenModal(selectedTheatre);
              }}
              size="large"
            >
              Edit
            </Button>
          </motion.div>
        ]}
        width={600}
      >
        {selectedTheatre && (
          <Descriptions bordered column={1} size="default">
            <Descriptions.Item label="Name">
              <div className="flex items-center gap-2">
                <BuildOutlined />
                <span className="font-medium">{selectedTheatre.name}</span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Department">
              <div className="flex items-center gap-2">
                <EnvironmentOutlined />
                <Tag color="blue">{selectedTheatre.department?.name || "No department"}</Tag>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <div className="flex items-center gap-2">
                {getStatusIcon(selectedTheatre.status)}
                <Badge
                  color={STATUS_COLORS[selectedTheatre.status as keyof typeof STATUS_COLORS]}
                  text={THEATRE_STATUS[selectedTheatre.status as keyof typeof THEATRE_STATUS]}
                />
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Active Status">
              <Tag color={selectedTheatre.is_active ? "green" : "red"}>
                {selectedTheatre.is_active ? "Active" : "Inactive"}
              </Tag>
            </Descriptions.Item>

            {(selectedTheatre.building || selectedTheatre.floor || selectedTheatre.wing || selectedTheatre.room_number) && (
              <Descriptions.Item label="Location Details">
                <div className="space-y-2">
                  {selectedTheatre.building && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Building:</span>
                      <span className="text-gray-900">{selectedTheatre.building}</span>
                    </div>
                  )}
                  {selectedTheatre.floor && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Floor:</span>
                      <span className="text-gray-900">{selectedTheatre.floor}</span>
                    </div>
                  )}
                  {selectedTheatre.wing && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wing:</span>
                      <span className="text-gray-900">{selectedTheatre.wing}</span>
                    </div>
                  )}
                  {selectedTheatre.room_number && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Number:</span>
                      <span className="text-gray-900">{selectedTheatre.room_number}</span>
                    </div>
                  )}
                </div>
              </Descriptions.Item>
            )}

            {selectedTheatre.notes && (
              <Descriptions.Item label="Notes">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedTheatre.notes}</p>
                </div>
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Created Date">
              <div className="flex items-center gap-2">
                <CalendarOutlined />
                {new Date(selectedTheatre.created_at).toLocaleDateString()}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              <div className="flex items-center gap-2">
                <CalendarOutlined />
                {new Date(selectedTheatre.updated_at).toLocaleDateString()}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}