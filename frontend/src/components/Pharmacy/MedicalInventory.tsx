import { useState, useEffect } from "react";
import { 
  Table, 
  Input, 
  Button, 
  Modal, 
  Form, 
  Select, 
  Card, 
  Space, 
  Tag, 
  Tooltip, 
  Popconfirm,
  message,
  Skeleton,
  Row,
  Col,
  Statistic
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  TeamOutlined,
  DashboardOutlined,
  MedicineBoxOutlined,
  DollarOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { toast } from "sonner";
import { DeleteApi, getApi, PostApi, PutApi } from "@/ApiService";
import { motion } from "framer-motion";

const { Option } = Select;

interface Medicine {
  id: string;
  name: string;
  manufacturer: string;
  description: string;
}

interface InventoryItem {
  id: string;
  medicine_id: string;
  quantity: number;
  expiry_date: string;
  price: number;
  batch_no: string;
  medicine: Medicine;
}

// Skeleton Loader Components
const HeaderSkeleton = () => (
  <Card className="bg-white shadow-sm border-0">
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6">
      <div className="flex items-center space-x-3">
        <Skeleton.Avatar active size="large" />
        <div>
          <Skeleton.Input active size="large" style={{ width: 200 }} />
          <div className="mt-1">
            <Skeleton.Input active size="small" style={{ width: 250 }} />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
        <Skeleton.Button active size="small" style={{ width: 120 }} />
        <Skeleton.Button active size="small" style={{ width: 100 }} />
        <Skeleton.Button active size="small" style={{ width: 100 }} />
      </div>
    </div>
  </Card>
);

const StatsSkeleton = () => (
  <Row gutter={[16, 16]}>
    {[...Array(4)].map((_, index) => (
      <Col key={index} xs={24} sm={12} lg={6}>
        <Card className="text-center shadow-sm">
          <Skeleton.Input active size="large" style={{ width: 60, height: 32, margin: '0 auto' }} />
          <div className="mt-2">
            <Skeleton.Input active size="small" style={{ width: 80, margin: '0 auto' }} />
          </div>
        </Card>
      </Col>
    ))}
  </Row>
);

const TableSkeleton = () => (
  <Card className="shadow-md rounded-lg">
    <div className="p-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border-b animate-pulse">
          <Skeleton.Avatar active size="default" />
          <div className="flex-1 space-y-2">
            <Skeleton.Input active size="small" style={{ width: '60%' }} />
            <Skeleton.Input active size="small" style={{ width: '40%' }} />
          </div>
          <div className="space-y-2">
            <Skeleton.Input active size="small" style={{ width: 80 }} />
            <Skeleton.Input active size="small" style={{ width: 60 }} />
          </div>
          <Skeleton.Button active size="small" style={{ width: 120 }} />
        </div>
      ))}
    </div>
  </Card>
);

// Enhanced Action Button Component
const ActionButton = ({ 
  icon, 
  label, 
  onClick, 
  type = "default",
  danger = false,
  loading = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void;
  type?: "primary" | "default" | "dashed" | "link";
  danger?: boolean;
  loading?: boolean;
}) => (
  <Tooltip title={label}>
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        type={type}
        danger={danger}
        icon={icon}
        loading={loading}
        onClick={onClick}
        className={`
          flex items-center justify-center 
          transition-all duration-200 ease-in-out
          w-10 h-10 rounded-full
          ${danger ? 'border-red-500 text-red-600 hover:bg-red-50' : ''}
          ${type === 'primary' ? '' : 'border-gray-300'}
        `}
        style={{
          minWidth: '40px'
        }}
      />
    </motion.div>
  </Tooltip>
);

export default function MedicalInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  function loadData() {
    setLoading(true);
    getApi('/medicine-stock')
      .then((data) => {
        if (!data?.error) {
          setInventory(data.data);
        } else {
          toast.error(data.error);
        }
      }).catch((err) => {
        console.error(err);
        toast.error("Failed to fetch inventory");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // Load inventory from API
  useEffect(() => {
    loadData();
  }, []);

  // Auto refresh notifier
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        message.info("🔄 Auto-refresh: Inventory data reloaded");
        loadData();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleAddOrUpdate = async (values: any) => {
    if (!values.name || !values.manufacturer || !values.quantity || !values.expiry_date || !values.price) {
      toast.error("All fields are required");
      return;
    }

    if (values.quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    if (values.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    const today = new Date();
    const expiry = new Date(values.expiry_date);
    if (expiry < today) {
      toast.error("Expiry date cannot be in the past");
      return;
    }

    setActionLoading(editingItem ? 'update' : 'create');

    if (editingItem) {
      // Update item
      const newItem = {
        name: values.name,
        manufacturer: values.manufacturer,
        description: values.description,
      };
      
      await PutApi('/medicines', { ...newItem, id: editingItem.medicine?.id })
        .then(async (data) => {
          if (!data?.error) {
            await PutApi('/medicine-stock', {
              id: editingItem.id,
              medicine_id: data.id,
              quantity: values.quantity,
              price: values.price,
              expiry_date: values.expiry_date,
              batch_no: values.batch_no
            }).then((res) => {
              if (!res?.error) {
                loadData();
                toast.success("Inventory updated successfully!");
                setIsModalOpen(false);
                form.resetFields();
                setEditingItem(null);
              } else {
                toast.error("Error when updating the Inventory:" + res.error);
              }
            }).catch((err) => {
              console.error(err);
              toast.error("Failed to update inventory stock");
            });
          } else {
            toast.error("Error when updating the Inventory:" + data.error);
          }
        }).catch((err) => {
          console.error(err);
          toast.error("Failed to update inventory");
        });
    } else {
      // Add new item
      const newItem = {
        name: values.name,
        manufacturer: values.manufacturer,
        description: values.description,
      };

      await PostApi('/medicines', newItem)
        .then(async (data) => {
          if (!data?.error) {
            await PostApi('/medicine-stock', {
              medicine_id: data.id,
              quantity: values.quantity,
              price: values.price,
              expiry_date: values.expiry_date,
              batch_no: values.batch_no
            }).then((res) => {
              if (!res?.error) {
                loadData();
                toast.success("Inventory added successfully!");
                setIsModalOpen(false);
                form.resetFields();
              } else {
                toast.error("Error when creating the Inventory:" + res.error);
              }
            }).catch((err) => {
              console.error(err);
              toast.error("Failed to add inventory stock");
            });
          } else {
            toast.error("Error when creating the Inventory:" + data.error);
          }
        }).catch((err) => {
          console.error(err);
          toast.error("Failed to add inventory");
        });
    }
    setActionLoading(null);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      ...item,
      name: item.medicine?.name,
      manufacturer: item.medicine?.manufacturer,
      description: item.medicine?.description,
      quantity: item.quantity,
      price: item.price,
      expiry_date: item.expiry_date,
      batch_no: item.batch_no
    });
    setIsModalOpen(true);
  };

  const handleView = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleDelete = (record: InventoryItem) => {
    setActionLoading(record.id);
    Modal.confirm({
      title: "Delete Inventory Item?",
      content: "Are you sure you want to delete this inventory item? This action cannot be undone.",
      okText: "Yes, Delete",
      cancelText: "Cancel",
      okType: "danger",
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      onOk() {
        DeleteApi("/medicine-stock", { id: record.id })
          .then((data) => {
            if (!data?.error) {
              DeleteApi("/medicines", { id: record.medicine.id })
                .then((data) => {
                  if (!data?.error) {
                    toast.success("Item deleted successfully!");
                    loadData();
                  } else {
                    toast.error(data.error);
                  }
                }).catch((err) => {
                  console.error(err);
                  toast.error("Failed to delete item");
                });
            } else {
              toast.error(data.error);
            }
          }).catch((err) => {
            console.error(err);
            toast.error("Failed to delete item");
          })
          .finally(() => {
            setActionLoading(null);
          });
      },
      onCancel() {
        setActionLoading(null);
      }
    });
  };

  const resetFilters = () => {
    setSearch("");
  };

  const filteredInventory = inventory.filter(item =>
    item.medicine?.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.medicine?.manufacturer?.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate statistics
  const stats = {
    totalItems: inventory.length,
    lowStock: inventory.filter(item => item.quantity < 10).length,
    totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0),
    expiringSoon: inventory.filter(item => {
      const expiry = new Date(item.expiry_date);
      const today = new Date();
      const daysDiff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return daysDiff <= 30 && daysDiff > 0;
    }).length
  };

  const columns: ColumnsType<InventoryItem> = [
    {
      title: (
        <Space>
          <MedicineBoxOutlined className="text-blue-600" />
          Medicine Information
        </Space>
      ),
      key: "medicine",
      render: (_, record: InventoryItem) => (
        <Space>
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-200">
            <MedicineBoxOutlined className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{record.medicine?.name}</div>
            <div className="text-sm text-gray-500">
              {record.medicine?.manufacturer}
            </div>
            {record.medicine?.description && (
              <div className="text-xs text-gray-400 mt-1">
                {record.medicine.description.length > 50 
                  ? `${record.medicine.description.substring(0, 50)}...`
                  : record.medicine.description
                }
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <ShopOutlined className="text-purple-600" />
          Batch Details
        </Space>
      ),
      key: "batch",
      render: (_, record: InventoryItem) => (
        <Space direction="vertical" size={0}>
          <Tag color="purple" className="font-mono font-semibold">
            {record.batch_no || "N/A"}
          </Tag>
          <div className="text-xs text-gray-500 mt-1">
            Batch Number
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <DashboardOutlined className="text-green-600" />
          Stock Status
        </Space>
      ),
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number) => (
        <Space direction="vertical" size={0}>
          <Tag 
            color={quantity < 10 ? "red" : quantity < 50 ? "orange" : "green"}
            className="font-bold text-lg"
          >
            {quantity}
          </Tag>
          <div className="text-xs text-gray-500">
            {quantity < 10 ? "Low Stock" : quantity < 50 ? "Medium Stock" : "In Stock"}
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <DollarOutlined className="text-green-600" />
          Pricing
        </Space>
      ),
      dataIndex: "price",
      key: "price",
      render: (price: number) => (
        <Space direction="vertical" size={0}>
          <div className="font-bold text-green-600 text-lg">₹{price}</div>
          <div className="text-xs text-gray-500">
            Unit Price
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <CalendarOutlined className="text-orange-600" />
          Expiry
        </Space>
      ),
      dataIndex: "expiry_date",
      key: "expiry_date",
      render: (date: string) => {
        const expiry = new Date(date);
        const today = new Date();
        const daysDiff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
        
        let status = "success";
        let statusText = "Valid";
        
        if (daysDiff <= 0) {
          status = "error";
          statusText = "Expired";
        } else if (daysDiff <= 30) {
          status = "warning";
          statusText = "Soon";
        }
        
        return (
          <Space direction="vertical" size={0}>
            <div className="font-semibold">{date}</div>
            <Tag color={status} className="text-xs">
              {statusText}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: (
        <Space>
          <ThunderboltOutlined className="text-blue-600" />
          Actions
        </Space>
      ),
      key: "actions",
      render: (_, record: InventoryItem) => (
        <Space size="small">
          <ActionButton
            icon={<EyeOutlined />}
            label="View Details"
            onClick={() => handleView(record)}
            loading={actionLoading === record.id}
          />
          
          <ActionButton
            icon={<EditOutlined />}
            label="Edit Item"
            onClick={() => handleEdit(record)}
            loading={actionLoading === record.id}
          />
          
          <ActionButton
            icon={<DeleteOutlined />}
            label="Delete Item"
            onClick={() => handleDelete(record)}
            danger
            loading={actionLoading === record.id}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      {loading ? (
        <HeaderSkeleton />
      ) : (
        <Card className="bg-white shadow-sm border-0">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <MedicineBoxOutlined className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Medical Inventory</h1>
                <p className="text-gray-600 mt-1">Manage pharmacy stock and medicine inventory efficiently</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
              <Tooltip title="Auto Refresh">
                <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg border">
                  <SyncOutlined className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700 font-medium">Auto Refresh</span>
                  <div 
                    className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${
                      autoRefresh ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    onClick={() => setAutoRefresh(!autoRefresh)}
                  >
                    <div 
                      className={`w-3 h-3 rounded-full bg-white transform transition-transform mt-1 ${
                        autoRefresh ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </div>
                </div>
              </Tooltip>

              <Tooltip title="Reset Filters">
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={resetFilters}
                  className="border-gray-300"
                >
                  Reset
                </Button>
              </Tooltip>

              <Tooltip title="Add New Medicine">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => {
                      setEditingItem(null);
                      form.resetFields();
                      setIsModalOpen(true);
                    }} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-md"
                    size="large"
                  >
                    <RocketOutlined /> Add New Medicine
                  </Button>
                </motion.div>
              </Tooltip>
            </div>
          </div>
        </Card>
      )}

      {/* Statistics Cards */}
      {/* {loading ? (
        <StatsSkeleton />
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-sm border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <Statistic
                title="Total Items"
                value={stats.totalItems}
                prefix={<MedicineBoxOutlined className="text-blue-600" />}
                valueStyle={{ color: '#1d4ed8' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-sm border-0 bg-gradient-to-br from-orange-50 to-orange-100">
              <Statistic
                title="Low Stock"
                value={stats.lowStock}
                prefix={<ExclamationCircleOutlined className="text-orange-600" />}
                valueStyle={{ color: '#ea580c' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-sm border-0 bg-gradient-to-br from-green-50 to-green-100">
              <Statistic
                title="Total Value"
                value={stats.totalValue}
                prefix="₹"
                precision={2}
                <DollarOutlined className="text-green-600" />}
                valueStyle={{ color: '#16a34a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-sm border-0 bg-gradient-to-br from-red-50 to-red-100">
              <Statistic
                title="Expiring Soon"
                value={stats.expiringSoon}
                prefix={<CalendarOutlined className="text-red-600" />}
                valueStyle={{ color: '#dc2626' }}
              />
            </Card>
          </Col>
        </Row>
      )} */}

      {/* Search and Filter Section */}
      <Card className="bg-white shadow-sm border-0">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3">
              <TeamOutlined className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">Inventory Items</span>
              <Tag color="blue" className="ml-2 text-lg font-semibold px-3 py-1">
                {filteredInventory.length} items
              </Tag>
            </div>
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <Input 
                placeholder="Search medicines by name or manufacturer..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                prefix={<SearchOutlined className="text-gray-400" />} 
                allowClear 
                size="large"
                style={{ width: 350 }}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <Card className="shadow-lg rounded-xl border-0 overflow-hidden">
          <Table 
            columns={columns} 
            dataSource={filteredInventory} 
            rowKey="id" 
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} items`,
              className: "px-6 py-4"
            }} 
            scroll={{ x: "max-content" }} 
            rowClassName="hover:bg-blue-50 transition-colors duration-200"
            className="rounded-lg"
          />
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        title={
          <Space>
            <div className={`p-2 rounded-lg ${editingItem ? 'bg-orange-100' : 'bg-green-100'}`}>
              {editingItem ? <EditOutlined className="text-orange-600" /> : <PlusOutlined className="text-green-600" />}
            </div>
            <span className="text-lg font-semibold">
              {editingItem ? "Edit Medicine Item" : "Add New Medicine"}
            </span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingItem(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingItem ? "Update Medicine" : "Add Medicine"}
        confirmLoading={actionLoading === 'create' || actionLoading === 'update'}
        width={700}
        styles={{
          body: { padding: '24px' }
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrUpdate}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Medicine Name"
                rules={[{ required: true, message: "Please enter medicine name" }]}
              >
                <Input 
                  placeholder="Enter medicine name" 
                  size="large"
                  prefix={<MedicineBoxOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="manufacturer"
                label="Manufacturer"
                rules={[{ required: true, message: "Please enter manufacturer" }]}
              >
                <Input 
                  placeholder="Enter manufacturer name" 
                  size="large"
                  prefix={<ShopOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea 
              placeholder="Enter medicine description, usage instructions, etc."
              rows={3}
              size="large"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="batch_no"
                label="Batch Number"
              >
                <Input 
                  placeholder="Enter batch number" 
                  size="large"
                  prefix={<SafetyCertificateOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: "Please enter quantity" }]}
              >
                <Input 
                  type="number" 
                  min={0} 
                  placeholder="Enter quantity" 
                  size="large"
                  prefix={<DashboardOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Price (₹)"
                rules={[{ required: true, message: "Please enter price" }]}
              >
                <Input 
                  type="number" 
                  min={0} 
                  step={0.01} 
                  placeholder="Enter price" 
                  size="large"
                  prefix={<DollarOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiry_date"
                label="Expiry Date"
                rules={[{ required: true, message: "Please select expiry date" }]}
              >
                <Input 
                  type="date" 
                  size="large"
                  prefix={<CalendarOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={
          <Space>
            <div className="p-2 bg-blue-100 rounded-lg">
              <EyeOutlined className="text-blue-600" />
            </div>
            <span className="text-lg font-semibold">Medicine Details</span>
          </Space>
        }
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button 
            key="close" 
            onClick={() => setIsViewModalOpen(false)}
            size="large"
          >
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border border-blue-200">
                <MedicineBoxOutlined className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedItem.medicine?.name}</h3>
                <p className="text-gray-600">{selectedItem.medicine?.manufacturer}</p>
              </div>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" className="border-l-4 border-l-blue-500">
                  <Statistic
                    title="Quantity in Stock"
                    value={selectedItem.quantity}
                    valueStyle={{ color: selectedItem.quantity < 10 ? '#ef4444' : selectedItem.quantity < 50 ? '#f59e0b' : '#10b981' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" className="border-l-4 border-l-green-500">
                  <Statistic
                    title="Unit Price"
                    value={selectedItem.price}
                    prefix="₹"
                    valueStyle={{ color: '#10b981' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" className="border-l-4 border-l-purple-500">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Batch Number</div>
                    <div className="font-semibold text-lg">{selectedItem.batch_no || "N/A"}</div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" className="border-l-4 border-l-orange-500">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Expiry Date</div>
                    <div className="font-semibold text-lg">{selectedItem.expiry_date}</div>
                  </div>
                </Card>
              </Col>
            </Row>

            {selectedItem.medicine?.description && (
              <Card title="Description" className="border-l-4 border-l-gray-500">
                <p className="text-gray-700">{selectedItem.medicine.description}</p>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}