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
  Spin
} from "antd";
import { 
  SearchOutlined, 
  PlusOutlined, 
  ScissorOutlined, 
  BuildOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  DownloadOutlined,
  FileTextOutlined,
  CalendarOutlined,
  MoreOutlined,
  TeamOutlined,
  ReloadOutlined,
  FilterOutlined,
  MedicineBoxOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getApi, PostApi, PutApi, DeleteApi } from "@/ApiService";

const { Option } = Select;
const { TextArea } = Input;

interface SurgeryType {
  id: number;
  name: string;
  description: string;
  department_id: number;
  created_At: string;
  updated_At: string;
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

export default function SurgeryType() {
  const [surgeryTypes, setSurgeryTypes] = useState<SurgeryType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSurgeryType, setSelectedSurgeryType] = useState<SurgeryType | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [form] = Form.useForm();
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null);
  const [tableLoading, setTableLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department_id: ""
  });

  // Load all data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      getApi('/surgery-type'),
      getApi('/departments')
    ]).then(([surgeryTypesData, departmentsData]) => {
      if (!surgeryTypesData?.error) setSurgeryTypes(surgeryTypesData.data);
      if (!departmentsData?.error) setDepartments(departmentsData.data);
    }).catch(error => {
      toast.error("Failed to load data");
      console.error("Error loading data:", error);
    }).finally(() => setLoading(false));
  };

  const handleOpenModal = (surgeryType: SurgeryType | null = null) => {
    if (surgeryType) {
      setSelectedSurgeryType(surgeryType);
      setFormData({
        name: surgeryType.name,
        description: surgeryType.description || "",
        department_id: surgeryType.department_id.toString()
      });
    } else {
      setSelectedSurgeryType(null);
      setFormData({
        name: "",
        description: "",
        department_id: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleViewSurgeryType = (surgeryType: SurgeryType) => {
    setSelectedSurgeryType(surgeryType);
    setIsViewModalOpen(true);
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      if (selectedSurgeryType) {
        setLoadingActionId(selectedSurgeryType.id);
        PutApi(`/surgery-type/${selectedSurgeryType.id}`, formData)
          .then(data => {
            if (!data?.error) {
              message.success("Surgery type updated successfully!");
              loadData();
              setIsModalOpen(false);
            } else {
              message.error(data.error);
            }
          })
          .catch(error => {
            message.error("Error updating surgery type");
            console.error("Error updating surgery type:", error);
          })
          .finally(() => setLoadingActionId(null));
      } else {
        PostApi('/surgery-type', formData)
          .then(data => {
            if (!data?.error) {
              message.success("Surgery type created successfully!");
              loadData();
              setIsModalOpen(false);
            } else {
              message.error(data.error);
            }
          })
          .catch(error => {
            message.error("Error creating surgery type");
            console.error("Error creating surgery type:", error);
          });
      }
    });
  };

  const handleDelete = (id: number) => {
    setLoadingActionId(id);
    DeleteApi(`/surgery-types/${id}`)
      .then(data => {
        if (!data?.error) {
          message.success("Surgery type deleted successfully!");
          loadData();
        } else {
          message.error(data.error);
        }
      })
      .catch(error => {
        message.error("Error deleting surgery type");
        console.error("Error deleting surgery type:", error);
      })
      .finally(() => setLoadingActionId(null));
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
        title="Delete Surgery Type"
        description="Are you sure you want to delete this surgery type?"
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

  const filteredSurgeryTypes = surgeryTypes.filter(surgeryType => {
    const matchesSearch = 
      surgeryType.name.toLowerCase().includes(search.toLowerCase()) ||
      surgeryType.description?.toLowerCase().includes(search.toLowerCase()) ||
      surgeryType.department?.name.toLowerCase().includes(search.toLowerCase());
    
    const matchesDepartment = departmentFilter === "all" || 
      surgeryType.department_id.toString() === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const stats = {
    total: surgeryTypes.length,
    byDepartment: departments.reduce((acc, dept) => {
      acc[dept.name] = surgeryTypes.filter(st => st.department_id === dept.id).length;
      return acc;
    }, {} as Record<string, number>)
  };

  const columns = [
    {
      title: "Surgery Type",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: SurgeryType) => (
        <div className="flex items-center gap-3">
          <Avatar 
            icon={<ScissorOutlined />} 
            size="small" 
            style={{ 
              backgroundColor: '#1890ff',
              borderRadius: '8px'
            }} 
          />
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            <div className="text-xs text-gray-500">ID: {record.id}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description: string) => (
        <div className="max-w-md">
          <p className="text-sm text-gray-600 line-clamp-2">
            {description || "No description provided"}
          </p>
        </div>
      ),
    },
    {
      title: "Department",
      dataIndex: ["department", "name"],
      key: "department",
      render: (text: string, record: SurgeryType) => (
        <div className="flex items-center gap-2">
          <BuildOutlined className="text-gray-400" />
          <Tag color="blue" className="px-2 py-1 rounded-full">
            {text}
          </Tag>
        </div>
      ),
    },
    {
      title: "Last Updated",
      dataIndex: "updated_At",
      key: "updated_At",
      render: (date: string) => (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CalendarOutlined />
          <span>{new Date(date).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_: any, record: SurgeryType) => (
        <Space size="small">
          <ActionButton
            icon={<EyeOutlined />}
            label="View Details"
            type="default"
            onClick={() => handleViewSurgeryType(record)}
          />

          <ActionButton
            icon={<EditOutlined />}
            label="Edit Surgery Type"
            type="default"
            loading={loadingActionId === record.id}
            onClick={() => handleOpenModal(record)}
          />

          <ActionButton
            icon={<DeleteOutlined />}
            label="Delete Surgery Type"
            danger
            loading={loadingActionId === record.id}
            confirm
            confirmAction={() => handleDelete(record.id)}
          />

          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="1" icon={<FileTextOutlined />}>
                  View History
                </Menu.Item>
                <Menu.Item key="2" icon={<TeamOutlined />}>
                  Assign Staff
                </Menu.Item>
                <Menu.Item key="3" icon={<DownloadOutlined />}>
                  Export Data
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
              <Tooltip title="More actions" placement="top">
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
      {[1, 2, 3, 4].map((item) => (
        <Col xs={24} sm={12} lg={6} key={item}>
          <Card className="border-0 shadow-sm">
            <Skeleton active paragraph={{ rows: 1 }} />
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Surgery Type Management</h1>
            <p className="text-gray-600 mt-1 text-base">Manage surgical procedure types and categories</p>
          </div>
          <Space>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                icon={<ReloadOutlined />}
                onClick={loadData}
                loading={loading}
                className="h-12 px-4 border-gray-300"
              >
                Refresh
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal()}
                size="large"
                className="h-12 px-6 text-base font-medium bg-blue-600 hover:bg-blue-700"
              >
                Add Surgery Type
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
                title="Total Surgery Types"
                value={stats.total}
                prefix={<ScissorOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          {departments.slice(0, 3).map(dept => (
            <Col xs={24} sm={12} lg={6} key={dept.id}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                <Statistic
                  title={dept.name}
                  value={stats.byDepartment[dept.name] || 0}
                  prefix={<BuildOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Filters Card */}
      <Card className="bg-white border-0 shadow-sm rounded-xl mb-6">
        <div className="p-5">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Search surgery types by name, description, or department..."
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="large"
                className="hover:border-blue-400 focus:border-blue-500"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select 
                value={departmentFilter} 
                onChange={setDepartmentFilter}
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
            <Col xs={24} sm={12} md={6}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  icon={<FileTextOutlined />} 
                  size="large"
                  className="w-full border-gray-300 hover:border-blue-400"
                >
                  Generate Report
                </Button>
              </motion.div>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Surgery Types Table */}
      <Card 
        className="bg-white border-0 shadow-sm rounded-xl"
        title={
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Surgery Types</h2>
              <p className="text-gray-600 mt-1">
                {filteredSurgeryTypes.length} type{filteredSurgeryTypes.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        }
      >
        <div className="p-6">
          {loading ? (
            <SkeletonTable />
          ) : filteredSurgeryTypes.length === 0 ? (
            <div className="text-center py-12">
              <ScissorOutlined className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">No surgery types found</p>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">
                {search || departmentFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Get started by adding your first surgery type"
                }
              </p>
              {(search || departmentFilter !== "all") && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    type="primary" 
                    onClick={() => {
                      setSearch("");
                      setDepartmentFilter("all");
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
              dataSource={filteredSurgeryTypes}
              columns={columns}
              rowKey="id"
              pagination={{ 
                pageSize: 10,
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

      {/* Add/Edit Surgery Type Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <MedicineBoxOutlined className="text-blue-600 text-lg" />
            <span className="text-lg font-semibold">
              {selectedSurgeryType ? "Edit Surgery Type" : "Add New Surgery Type"}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        width={600}
        okText={selectedSurgeryType ? "Update Surgery Type" : "Add Surgery Type"}
        cancelText="Cancel"
        okButtonProps={{ 
          size: 'large',
          loading: loadingActionId !== null,
          icon: selectedSurgeryType ? <EditOutlined /> : <PlusOutlined />
        }}
        cancelButtonProps={{ size: 'large' }}
        confirmLoading={loadingActionId !== null}
      >
        <Spin spinning={loading}>
          <Form form={form} layout="vertical" className="space-y-4 mt-4">
            <Form.Item
              label="Surgery Type Name"
              name="name"
              rules={[
                { required: true, message: "Please enter surgery type name" },
                { min: 2, message: "Name must be at least 2 characters" }
              ]}
            >
              <Input
                placeholder="Enter surgery type name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Department"
              name="department_id"
              rules={[{ required: true, message: "Please select a department" }]}
            >
              <Select
                placeholder="Select department"
                value={formData.department_id}
                onChange={(value) => setFormData(prev => ({ ...prev, department_id: value }))}
                size="large"
              >
                {departments.map(dept => (
                  <Option key={dept.id} value={dept.id.toString()}>
                    <div className="flex items-center gap-2">
                      <BuildOutlined className="text-gray-400" />
                      <span>{dept.name}</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
            >
              <TextArea
                rows={4}
                placeholder="Enter description for this surgery type..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                size="large"
              />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      {/* View Surgery Type Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <MedicineBoxOutlined className="text-blue-600 text-lg" />
            <span className="text-lg font-semibold">Surgery Type Details</span>
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
                handleOpenModal(selectedSurgeryType);
              }}
              size="large"
            >
              Edit
            </Button>
          </motion.div>
        ]}
        width={600}
      >
        {selectedSurgeryType && (
          <Descriptions bordered column={1} size="default">
            <Descriptions.Item label="Name">
              <div className="flex items-center gap-2">
                <ScissorOutlined />
                <span className="font-medium">{selectedSurgeryType.name}</span>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Department">
              <div className="flex items-center gap-2">
                <BuildOutlined />
                <Tag color="blue">{selectedSurgeryType.department?.name}</Tag>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              <div className="p-3 bg-gray-50 rounded-lg">
                {selectedSurgeryType.description ? (
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedSurgeryType.description}</p>
                ) : (
                  <p className="text-gray-400 italic">No description provided</p>
                )}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Created Date">
              <div className="flex items-center gap-2">
                <CalendarOutlined />
                {new Date(selectedSurgeryType.created_At).toLocaleDateString()}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              <div className="flex items-center gap-2">
                <CalendarOutlined />
                {new Date(selectedSurgeryType.updated_At).toLocaleDateString()}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}