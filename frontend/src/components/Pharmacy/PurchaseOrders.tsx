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
  Divider
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
  MedicineBoxOutlined
} from "@ant-design/icons";
import { toast } from "sonner";
import { getApi, PostApi, PutApi, DeleteApi } from "@/ApiService";

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

const defaultOrder: PurchaseOrder = {
  id: 0,
  user_id: 0,
  taken_by: "",
  taken_by_phone_no: "",
  received_date: "",
  items: [],
};

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
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchOrders = () => {
    getApi("/orders")
      .then((res) => {
        if (!res.error) {
          setOrders(res.data);
        } else {
          toast.error("Failed to load orders.");
        }
      })
      .catch(() => toast.error("Server error while fetching orders"));
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
        .catch(() => toast.error("Server error while updating order"));
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
        .catch(() => toast.error("Server error while adding order"));
    }
  };

  const handleDeleteOrder = (order: PurchaseOrder) => {
    Modal.confirm({
      title: "Delete Purchase Order?",
      content: "Are you sure you want to delete this purchase order? This action cannot be undone.",
      okText: "Yes",
      cancelText: "No",
      okType: "danger",
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
          .catch(() => toast.error("Server error while deleting order"));
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

  const columns: ColumnsType<PurchaseOrder> = [
    {
      title: (
        <Space>
          <ShoppingCartOutlined />
          Order Info
        </Space>
      ),
      key: "order",
      render: (_, record: PurchaseOrder) => (
        <Space>
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <ShoppingCartOutlined className="text-blue-600" />
          </div>
          <div>
            <div style={{ fontWeight: "bold" }}>Order #{record.id}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              User: {record.user?.username || record.user_id}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <UserOutlined />
          Collected By
        </Space>
      ),
      key: "taken_by",
      render: (_, record: PurchaseOrder) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: "500" }}>{record.taken_by}</span>
          <div style={{ fontSize: "12px", color: "#999" }}>
            <PhoneOutlined /> {record.taken_by_phone_no}
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <CalendarOutlined />
          Dates
        </Space>
      ),
      key: "dates",
      render: (_, record: PurchaseOrder) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: "500" }}>Received: {record.received_date}</span>
          <div style={{ fontSize: "12px", color: "#999" }}>
            Created: {record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'}
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <MedicineBoxOutlined />
          Items
        </Space>
      ),
      key: "items",
      render: (_, record: PurchaseOrder) => (
        <Space direction="vertical" size={0}>
          <span className="font-bold text-blue-600">{record.items?.length || 0}</span>
          <div style={{ fontSize: "12px", color: "#999" }}>
            Medicine Items
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <ThunderboltOutlined />
          Actions
        </Space>
      ),
      key: "actions",
      render: (_, record: PurchaseOrder) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              shape="circle"
              type="primary"
              ghost
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Order">
            <Button
              icon={<EditOutlined />}
              shape="circle"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Order">
            <Popconfirm
              title="Delete this order?"
              description="Are you sure you want to delete this purchase order? This action cannot be undone."
              onConfirm={() => handleDeleteOrder(record)}
              okText="Yes"
              cancelText="No"
              okType="danger"
              icon={<CloseCircleOutlined style={{ color: "red" }} />}
            >
              <Button icon={<DeleteOutlined />} shape="circle" danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <Card className="bg-white shadow-sm border-0">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCartOutlined className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
              <p className="text-gray-600 mt-1">Manage all medicine purchase orders</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
            <Tooltip title="Auto Refresh">
              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                <SyncOutlined className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Auto Refresh</span>
                <div 
                  className={`w-8 h-4 rounded-full transition-colors cursor-pointer ${
                    autoRefresh ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  <div 
                    className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
                      autoRefresh ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </div>
              </div>
            </Tooltip>

            <Tooltip title="Reset Filters">
              <Button icon={<ReloadOutlined />} onClick={resetFilters}>
                Reset Filters
              </Button>
            </Tooltip>

            <Tooltip title="Add New Order">
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => {
                  setEditingOrder(null);
                  form.resetFields();
                  setIsModalOpen(true);
                }} 
                className="bg-green-600 hover:bg-green-700"
              >
                <RocketOutlined /> New Order
              </Button>
            </Tooltip>
          </div>
        </div>
      </Card>

      {/* Search and Filter Section */}
      <Card className="bg-white shadow-sm border-0">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-2">
              <TeamOutlined className="w-5 h-5" />
              <span className="text-lg font-semibold">All Purchase Orders</span>
              <Tag color="blue" className="ml-2">
                {filteredOrders.length}
              </Tag>
            </div>
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <Input 
                placeholder="Search by user, date, or collector..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                prefix={<SearchOutlined />} 
                allowClear 
                style={{ width: 300 }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="shadow-md rounded-lg">
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
          }} 
          scroll={{ x: "max-content" }} 
          rowClassName="hover:bg-gray-50"
        />
      </Card>

      {/* Add/Edit Order Modal */}
      <Modal
        title={
          <Space>
            {editingOrder ? <EditOutlined /> : <PlusOutlined />}
            {editingOrder ? "Edit Purchase Order" : "New Purchase Order"}
          </Space>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingOrder(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingOrder ? "Update" : "Add"}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrUpdate}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="user_id"
              label="Patient"
              rules={[{ required: true, message: "Please select patient" }]}
            >
              <Select placeholder="Select patient">
                {patients.map((patient: any) => (
                  <Option key={patient.id} value={patient.id}>
                    {patient.username}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="received_date"
              label="Received Date"
              rules={[{ required: true, message: "Please select received date" }]}
            >
              <Input type="date" />
            </Form.Item>

            <Form.Item
              name="taken_by"
              label="Collected By"
              rules={[{ required: true, message: "Please enter collector name" }]}
            >
              <Input placeholder="Enter collector name" />
            </Form.Item>

            <Form.Item
              name="taken_by_phone_no"
              label="Collector Phone"
              rules={[{ required: true, message: "Please enter collector phone" }]}
            >
              <Input placeholder="Enter collector phone number" />
            </Form.Item>
          </div>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium">Order Items</label>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    Add Item
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="border p-4 rounded-lg mb-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Form.Item
                        {...restField}
                        name={[name, 'medicine_id']}
                        label="Medicine"
                        rules={[{ required: true, message: 'Please select medicine' }]}
                      >
                        <Select placeholder="Select medicine">
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
                        <Input type="number" placeholder="Quantity" min={1} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'order_date']}
                        label="Order Date"
                        rules={[{ required: true, message: 'Please select order date' }]}
                      >
                        <Input type="date" />
                      </Form.Item>
                    </div>
                    <div className="text-right">
                      <Button danger onClick={() => remove(name)} icon={<DeleteOutlined />}>
                        Remove Item
                      </Button>
                    </div>
                  </div>
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
            <EyeOutlined />
            Order Details
          </Space>
        }
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setSelectedOrder(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsViewModalOpen(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedOrder && (
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCartOutlined className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Order #{selectedOrder.id}</h3>
                <p className="text-gray-600">Purchase order details</p>
              </div>
            </div>

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Patient">
                {selectedOrder.user?.username || selectedOrder.user_id}
              </Descriptions.Item>
              <Descriptions.Item label="Collected By">
                {selectedOrder.taken_by}
              </Descriptions.Item>
              <Descriptions.Item label="Collector Phone">
                {selectedOrder.taken_by_phone_no}
              </Descriptions.Item>
              <Descriptions.Item label="Received Date">
                {selectedOrder.received_date}
              </Descriptions.Item>
              <Descriptions.Item label="Created Date">
                {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString() : 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <h4 className="font-semibold mb-3">Order Items</h4>
            {selectedOrder.items && selectedOrder.items.length > 0 ? (
              <Table
                size="small"
                dataSource={selectedOrder.items}
                pagination={false}
                columns={[
                  { 
                    title: 'Medicine', 
                    key: 'medicine',
                    render: (_, record) => {
                      const medicine = medicines.find(m => m.id === record.medicine_id);
                      return medicine?.name || `Medicine ID: ${record.medicine_id}`;
                    }
                  },
                  { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
                  { title: 'Order Date', dataIndex: 'order_date', key: 'order_date' },
                ]}
              />
            ) : (
              <p className="text-gray-500">No items in this order</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}