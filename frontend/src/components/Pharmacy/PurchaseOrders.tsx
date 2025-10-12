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
  Descriptions,
  Divider,
  Skeleton,
  Row,
  Col,
  Statistic,
  Badge
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
  ShoppingCartOutlined,
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  MedicineBoxOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import { toast } from "sonner";
import { getApi, PostApi, PutApi, DeleteApi } from "@/ApiService";
import { motion } from "framer-motion";

const { Option } = Select;

interface PurchaseOrder {
  id: number;
  user_id: number;
  received_date: string;
  taken_by: string;
  taken_by_phone_no: string;
  created_at?: string;
  updated_at?: string;
  items: {
    medicine_id: number;
    quantity: number;
    order_date: string;
  }[];
  user?: any;
  medicine_details?: any[];
}

interface Medicine {
  id: number;
  name: string;
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
        <Skeleton.Button active size="small" style={{ width: 140 }} />
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

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [search, setSearch] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const loginData = JSON.parse(localStorage.getItem("loginData") || '{"user_id":8}');

  useEffect(() => {
    fetchOrders();
    fetchPatients();
    fetchMedicines();
  }, []);

  // Auto refresh notifier
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        message.info("🔄 Auto-refresh: Purchase orders data reloaded");
        fetchOrders();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchOrders = () => {
    setLoading(true);
    getApi("/orders")
      .then((res) => {
        if (!res.error) {
          setOrders(res.data);
        } else {
          toast.error("Failed to load orders.");
        }
      })
      .catch(() => toast.error("Server error while fetching orders"))
      .finally(() => setLoading(false));
  };

  const fetchPatients = () => {
    getApi("/users?user_type=DOCTOR")
      .then((res) => {
        if (!res.error) {
          setPatients(res.data);
        } else {
          toast.error("Failed to load patients.");
        }
      })
      .catch(() => toast.error("Server error while fetching patients"));
  };

  const fetchMedicines = () => {
    getApi("/medicines")
      .then((res) => {
        if (!res.error) {
          setMedicines(res.data);
        } else {
          toast.error("Failed to load medicines.");
        }
      })
      .catch(() => toast.error("Server error while fetching medicines"));
  };

  const handleAddOrUpdate = (values: any) => {
    if (!values.user_id || !values.received_date || !values.taken_by || !values.taken_by_phone_no || !values.items || values.items.length === 0) {
      toast.error("Fill all required fields and add at least one item.");
      return;
    }

    setActionLoading(editingOrder ? 'update' : 'create');

    const orderData = {
      ...values,
      created_by: loginData.user_id
    };

    if (editingOrder) {
      PutApi("/orders", { ...editingOrder, ...orderData })
        .then((res) => {
          if (!res.error) {
            toast.success("Order updated successfully");
            setIsModalOpen(false);
            fetchOrders();
            form.resetFields();
            setEditingOrder(null);
          } else {
            toast.error(res.error || "Failed to update order");
          }
        })
        .catch(() => toast.error("Server error while updating order"))
        .finally(() => setActionLoading(null));
    } else {
      PostApi("/orders", orderData)
        .then((res) => {
          if (!res.error) {
            toast.success("Order added successfully");
            setIsModalOpen(false);
            fetchOrders();
            form.resetFields();
          } else {
            toast.error(res.error || "Failed to add order");
          }
        })
        .catch(() => toast.error("Server error while adding order"))
        .finally(() => setActionLoading(null));
    }
  };

  const handleDeleteOrder = (order: PurchaseOrder) => {
    setActionLoading(order.id.toString());
    Modal.confirm({
      title: "Delete Purchase Order?",
      content: "Are you sure you want to delete this purchase order? This action cannot be undone.",
      okText: "Yes, Delete",
      cancelText: "Cancel",
      okType: "danger",
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      onOk() {
        DeleteApi(`/orders?id=${order.id}`)
          .then((res) => {
            if (!res.error) {
              toast.success("Order deleted successfully");
              fetchOrders();
            } else {
              toast.error(res.error || "Failed to delete order");
            }
          })
          .catch(() => toast.error("Server error while deleting order"))
          .finally(() => setActionLoading(null));
      },
      onCancel() {
        setActionLoading(null);
      }
    });
  };

  const handleEdit = (order: PurchaseOrder) => {
    setEditingOrder(order);
    form.setFieldsValue({
      ...order,
      user_id: order.user_id,
      received_date: order.received_date,
      taken_by: order.taken_by,
      taken_by_phone_no: order.taken_by_phone_no,
      items: order.items || [],
    });
    setIsModalOpen(true);
  };

  const handleView = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const resetFilters = () => {
    setSearch("");
  };

  const filteredOrders = orders.filter(order =>
    order.user_id.toString().includes(search) ||
    order.received_date.includes(search) ||
    order.taken_by?.toLowerCase().includes(search.toLowerCase()) ||
    order.user?.username?.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate statistics
  const stats = {
    totalOrders: orders.length,
    todayOrders: orders.filter(order => order.received_date === new Date().toISOString().split('T')[0]).length,
    totalItems: orders.reduce((sum, order) => sum + (order.items?.length || 0), 0),
    pendingOrders: orders.filter(order => !order.received_date).length
  };

  const columns: ColumnsType<PurchaseOrder> = [
    {
      title: (
        <Space>
          <ShoppingCartOutlined className="text-blue-600" />
          Order Information
        </Space>
      ),
      key: "order",
      render: (_, record: PurchaseOrder) => (
        <Space>
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-200">
            <FileTextOutlined className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Order #{record.id}</div>
            <div className="text-sm text-gray-500">
              Patient: {record.user?.username || record.user_id}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Created: {record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <UserOutlined className="text-green-600" />
          Collection Details
        </Space>
      ),
      key: "taken_by",
      render: (_, record: PurchaseOrder) => (
        <Space direction="vertical" size={0}>
          <div className="font-semibold text-gray-900">{record.taken_by}</div>
          <div className="text-sm text-gray-500">
            <PhoneOutlined /> {record.taken_by_phone_no}
          </div>
          <Badge 
            color={record.received_date ? "green" : "orange"} 
            text={record.received_date ? "Received" : "Pending"} 
            className="text-xs mt-1"
          />
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <CalendarOutlined className="text-purple-600" />
          Dates
        </Space>
      ),
      key: "dates",
      render: (_, record: PurchaseOrder) => (
        <Space direction="vertical" size={0}>
          <div className="font-semibold text-gray-900">
            {record.received_date || "Not Received"}
          </div>
          <div className="text-xs text-gray-500">
            Received Date
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <MedicineBoxOutlined className="text-orange-600" />
          Items Summary
        </Space>
      ),
      key: "items",
      render: (_, record: PurchaseOrder) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue" className="font-bold text-lg">
            {record.items?.length || 0}
          </Tag>
          <div className="text-xs text-gray-500">
            Medicine Items
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Total Qty: {record.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <ThunderboltOutlined className="text-blue-600" />
          Actions
        </Space>
      ),
      key: "actions",
      render: (_, record: PurchaseOrder) => (
        <Space size="small">
          <ActionButton
            icon={<EyeOutlined />}
            label="View Details"
            onClick={() => handleView(record)}
            loading={actionLoading === record.id.toString()}
          />
          
          <ActionButton
            icon={<EditOutlined />}
            label="Edit Order"
            onClick={() => handleEdit(record)}
            loading={actionLoading === record.id.toString()}
          />
          
          <ActionButton
            icon={<DeleteOutlined />}
            label="Delete Order"
            onClick={() => handleDeleteOrder(record)}
            danger
            loading={actionLoading === record.id.toString()}
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
                <ShoppingCartOutlined className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
                <p className="text-gray-600 mt-1">Manage all medicine purchase orders and inventory</p>
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

              <Tooltip title="Create New Order">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => {
                      setEditingOrder(null);
                      form.resetFields();
                      setIsModalOpen(true);
                    }} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-md"
                    size="large"
                  >
                    <RocketOutlined /> New Purchase Order
                  </Button>
                </motion.div>
              </Tooltip>
            </div>
          </div>
        </Card>
      )}

      {/* Statistics Cards */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-sm border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <Statistic
                title="Total Orders"
                value={stats.totalOrders}
                prefix={<ShoppingCartOutlined className="text-blue-600" />}
                valueStyle={{ color: '#1d4ed8' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-sm border-0 bg-gradient-to-br from-green-50 to-green-100">
              <Statistic
                title="Today's Orders"
                value={stats.todayOrders}
                prefix={<CalendarOutlined className="text-green-600" />}
                valueStyle={{ color: '#16a34a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-sm border-0 bg-gradient-to-br from-orange-50 to-orange-100">
              <Statistic
                title="Total Items"
                value={stats.totalItems}
                prefix={<MedicineBoxOutlined className="text-orange-600" />}
                valueStyle={{ color: '#ea580c' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center shadow-sm border-0 bg-gradient-to-br from-red-50 to-red-100">
              <Statistic
                title="Pending Orders"
                value={stats.pendingOrders}
                prefix={<ExclamationCircleOutlined className="text-red-600" />}
                valueStyle={{ color: '#dc2626' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Search and Filter Section */}
      <Card className="bg-white shadow-sm border-0">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-3">
              <TeamOutlined className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">Purchase Orders</span>
              <Tag color="blue" className="ml-2 text-lg font-semibold px-3 py-1">
                {filteredOrders.length} orders
              </Tag>
            </div>
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <Input 
                placeholder="Search orders by patient, date, or collector..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
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

      {/* Orders Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <Card className="shadow-lg rounded-xl border-0 overflow-hidden">
          <Table 
            columns={columns} 
            dataSource={filteredOrders} 
            rowKey="id" 
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} orders`,
              className: "px-6 py-4"
            }} 
            scroll={{ x: "max-content" }} 
            rowClassName="hover:bg-blue-50 transition-colors duration-200"
            className="rounded-lg"
          />
        </Card>
      )}

      {/* Add/Edit Order Modal */}
      <Modal
        title={
          <Space>
            <div className={`p-2 rounded-lg ${editingOrder ? 'bg-orange-100' : 'bg-green-100'}`}>
              {editingOrder ? <EditOutlined className="text-orange-600" /> : <PlusOutlined className="text-green-600" />}
            </div>
            <span className="text-lg font-semibold">
              {editingOrder ? "Edit Purchase Order" : "New Purchase Order"}
            </span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingOrder(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingOrder ? "Update Order" : "Create Order"}
        confirmLoading={actionLoading === 'create' || actionLoading === 'update'}
        width={800}
        styles={{
          body: { padding: '24px' }
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrUpdate}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="user_id"
                label="Patient"
                rules={[{ required: true, message: "Please select patient" }]}
              >
                <Select 
                  placeholder="Select patient"
                  size="large"
                  showSearch
                  optionFilterProp="children"
                >
                  {patients.map((patient: any) => (
                    <Option key={patient.id} value={patient.id}>
                      {patient.username}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="received_date"
                label="Received Date"
                rules={[{ required: true, message: "Please select received date" }]}
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
                name="taken_by"
                label="Collected By"
                rules={[{ required: true, message: "Please enter collector name" }]}
              >
                <Input 
                  placeholder="Enter collector name" 
                  size="large"
                  prefix={<UserOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="taken_by_phone_no"
                label="Collector Phone"
                rules={[{ required: true, message: "Please enter collector phone" }]}
              >
                <Input 
                  placeholder="Enter collector phone number" 
                  size="large"
                  prefix={<PhoneOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Order Items</Divider>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium text-gray-700">Medicine Items</label>
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    icon={<PlusOutlined />}
                    size="large"
                    className="border-blue-300 text-blue-600"
                  >
                    Add Medicine Item
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} size="small" className="mb-4 border-l-4 border-l-blue-500">
                    <div className="grid grid-cols-3 gap-4">
                      <Form.Item
                        {...restField}
                        name={[name, 'medicine_id']}
                        label="Medicine"
                        rules={[{ required: true, message: 'Please select medicine' }]}
                      >
                        <Select 
                          placeholder="Select medicine"
                          size="large"
                          showSearch
                        >
                          {medicines.map(medicine => (
                            <Option key={medicine.id} value={medicine.id}>
                              {medicine.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'quantity']}
                        label="Quantity"
                        rules={[{ required: true, message: 'Please enter quantity' }]}
                      >
                        <Input 
                          type="number" 
                          placeholder="Quantity" 
                          min={1} 
                          size="large"
                          prefix={<DashboardOutlined className="text-gray-400" />}
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'order_date']}
                        label="Order Date"
                        rules={[{ required: true, message: 'Please select order date' }]}
                      >
                        <Input 
                          type="date" 
                          size="large"
                          prefix={<CalendarOutlined className="text-gray-400" />}
                        />
                      </Form.Item>
                    </div>
                    <div className="text-right mt-3">
                      <Button 
                        danger 
                        onClick={() => remove(name)} 
                        icon={<DeleteOutlined />}
                        size="middle"
                      >
                        Remove Item
                      </Button>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* View Order Modal */}
      <Modal
        title={
          <Space>
            <div className="p-2 bg-blue-100 rounded-lg">
              <EyeOutlined className="text-blue-600" />
            </div>
            <span className="text-lg font-semibold">Order Details</span>
          </Space>
        }
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setSelectedOrder(null);
        }}
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
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border border-blue-200">
                <FileTextOutlined className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Order #{selectedOrder.id}</h3>
                <p className="text-gray-600">Purchase order details and items</p>
              </div>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" className="border-l-4 border-l-blue-500">
                  <Statistic
                    title="Patient"
                    value={selectedOrder.user?.username || selectedOrder.user_id}
                    valueStyle={{ color: '#1d4ed8', fontSize: '16px' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" className="border-l-4 border-l-green-500">
                  <Statistic
                    title="Items Count"
                    value={selectedOrder.items?.length || 0}
                    valueStyle={{ color: '#16a34a' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" className="border-l-4 border-l-purple-500">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Collected By</div>
                    <div className="font-semibold text-lg">{selectedOrder.taken_by}</div>
                    <div className="text-sm text-gray-600">{selectedOrder.taken_by_phone_no}</div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" className="border-l-4 border-l-orange-500">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Received Date</div>
                    <div className="font-semibold text-lg">{selectedOrder.received_date || "Not Received"}</div>
                  </div>
                </Card>
              </Col>
            </Row>

            <Divider>Order Items</Divider>

            {selectedOrder.items && selectedOrder.items.length > 0 ? (
              <Table
                size="small"
                dataSource={selectedOrder.items}
                pagination={false}
                rowKey={(record, index) => `${record.medicine_id}-${index}`}
                columns={[
                  { 
                    title: 'Medicine', 
                    key: 'medicine',
                    render: (_, record) => {
                      const medicine = medicines.find(m => m.id === record.medicine_id);
                      return (
                        <div className="font-medium">
                          {medicine?.name || `Medicine ID: ${record.medicine_id}`}
                        </div>
                      );
                    }
                  },
                  { 
                    title: 'Quantity', 
                    dataIndex: 'quantity', 
                    key: 'quantity',
                    render: (quantity) => (
                      <Tag color="blue" className="font-bold">
                        {quantity}
                      </Tag>
                    )
                  },
                  { 
                    title: 'Order Date', 
                    dataIndex: 'order_date', 
                    key: 'order_date',
                    render: (date) => (
                      <div className="text-gray-600">{date}</div>
                    )
                  },
                ]}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MedicineBoxOutlined className="text-4xl mb-2 text-gray-300" />
                <div>No items in this order</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}