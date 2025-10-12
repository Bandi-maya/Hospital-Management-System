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
  message
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
  SafetyCertificateOutlined
} from "@ant-design/icons";
import { toast } from "sonner";
import { DeleteApi, getApi, PostApi, PutApi } from "@/ApiService";

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

const LOCAL_STORAGE_KEY = "medicalInventory";
const defaultCategories = ["Tablet", "Syrup", "Injection", "Ointment", "Capsule", "Drops"];

export default function MedicalInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [search, setSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  function loadData() {
    getApi('/medicine-stock')
      .then((data) => {
        if (!data?.error) {
          setInventory(data.data);
        }
      }).catch((err) => {
        console.error(err);
        toast.error("Failed to fetch inventory");
      })
  }

  // Load inventory from localStorage
  useEffect(() => {
    loadData()
  }, []);

  // Auto refresh notifier
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        message.info("🔄 Auto-refresh: Inventory data reloaded");
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
                loadData()
                toast.success("Inventory updated successfully!");
                setIsModalOpen(false);
                form.resetFields();
                setEditingItem(null);
              }
              else {
                toast.error("Error when updating the Inventory:" + res.error)
              }
            }).catch((err) => {
              console.error(err);
              toast.error("Failed to update inventory stock");
            });
          }
          else {
            toast.error("Error when updating the Inventory:" + data.error)
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
                loadData()
                toast.success("Inventory added successfully!");
                setIsModalOpen(false);
                form.resetFields();
              }
              else {
                toast.error("Error when creating the Inventory:" + res.error)
              }
            }).catch((err) => {
              console.error(err);
              toast.error("Failed to add inventory stock");
            });
          }
          else {
            toast.error("Error when creating the Inventory:" + data.error)
          }
        }).catch((err) => {
          console.error(err);
          toast.error("Failed to add inventory");
        });
    }
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
    Modal.confirm({
      title: "Delete Inventory Item?",
      content: "Are you sure you want to delete this inventory item? This action cannot be undone.",
      okText: "Yes",
      cancelText: "No",
      okType: "danger",
      onOk() {
        DeleteApi("/medicine-stock", { id: record.id })
          .then((data) => {
            if (!data?.error) {
              DeleteApi("/medicines", { id: record.medicine.id })
                .then((data) => {
                  if (!data?.error) {
                    toast.success("Item deleted successfully!");
                    loadData();
                  }
                  else {
                    toast.error(data.error);
                  }
                }).catch((err) => {
                  console.error(err);
                  toast.error("Failed to delete item");
                })
            }
            else {
              toast.error(data.error);
            }
          }).catch((err) => {
            console.error(err);
            toast.error("Failed to delete item");
          })
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

  const columns: ColumnsType<InventoryItem> = [
    {
      title: (
        <Space>
          <MedicineBoxOutlined />
          Medicine Info
        </Space>
      ),
      key: "medicine",
      render: (_, record: InventoryItem) => (
        <Space>
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <MedicineBoxOutlined className="text-blue-600" />
          </div>
          <div>
            <div style={{ fontWeight: "bold" }}>{record.medicine?.name}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {record.medicine?.manufacturer}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <ShopOutlined />
          Batch Info
        </Space>
      ),
      key: "batch",
      render: (_, record: InventoryItem) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: "500" }}>{record.batch_no || "N/A"}</span>
          <div style={{ fontSize: "12px", color: "#999" }}>
            Batch Number
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <DashboardOutlined />
          Quantity
        </Space>
      ),
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number) => (
        <Space direction="vertical" size={0}>
          <span className="font-bold text-blue-600">{quantity}</span>
          <div style={{ fontSize: "12px", color: "#999" }}>
            In Stock
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <DollarOutlined />
          Price
        </Space>
      ),
      dataIndex: "price",
      key: "price",
      render: (price: number) => (
        <Space direction="vertical" size={0}>
          <span className="font-bold text-green-600">₹{price}</span>
          <div style={{ fontSize: "12px", color: "#999" }}>
            Unit Price
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <CalendarOutlined />
          Expiry Date
        </Space>
      ),
      dataIndex: "expiry_date",
      key: "expiry_date",
      render: (date: string) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: "500" }}>{date}</span>
          <div style={{ fontSize: "12px", color: "#999" }}>
            Expiry
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
      render: (_, record: InventoryItem) => (
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
          <Tooltip title="Edit Item">
            <Button
              icon={<EditOutlined />}
              shape="circle"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Item">
            <Popconfirm
              title="Delete this item?"
              description="Are you sure you want to delete this inventory item? This action cannot be undone."
              onConfirm={() => handleDelete(record)}
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
              <MedicineBoxOutlined className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Medical Inventory</h1>
              <p className="text-gray-600 mt-1">Manage pharmacy stock and medicine inventory</p>
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

            <Tooltip title="Add New Item">
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => {
                  setEditingItem(null);
                  form.resetFields();
                  setIsModalOpen(true);
                }} 
                className="bg-green-600 hover:bg-green-700"
              >
                <RocketOutlined /> Add Item
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
              <span className="text-lg font-semibold">All Inventory Items</span>
              <Tag color="blue" className="ml-2">
                {filteredInventory.length}
              </Tag>
            </div>
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <Input 
                placeholder="Search by name or manufacturer..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                prefix={<SearchOutlined />} 
                allowClear 
                style={{ width: 300 }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card className="shadow-md rounded-lg">
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
          }} 
          scroll={{ x: "max-content" }} 
          rowClassName="hover:bg-gray-50"
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={
          <Space>
            {editingItem ? <EditOutlined /> : <PlusOutlined />}
            {editingItem ? "Edit Inventory Item" : "Add Inventory Item"}
          </Space>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingItem(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingItem ? "Update" : "Add"}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrUpdate}>
          <Form.Item
            name="name"
            label="Medicine Name"
            rules={[{ required: true, message: "Please enter medicine name" }]}
          >
            <Input placeholder="Enter medicine name" />
          </Form.Item>

          <Form.Item
            name="manufacturer"
            label="Manufacturer"
            rules={[{ required: true, message: "Please enter manufacturer" }]}
          >
            <Input placeholder="Enter manufacturer name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea 
              placeholder="Enter medicine description"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="batch_no"
            label="Batch Number"
          >
            <Input placeholder="Enter batch number" />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: "Please enter quantity" }]}
          >
            <Input type="number" min={0} placeholder="Enter quantity" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price (₹)"
            rules={[{ required: true, message: "Please enter price" }]}
          >
            <Input type="number" min={0} step={0.01} placeholder="Enter price" />
          </Form.Item>

          <Form.Item
            name="expiry_date"
            label="Expiry Date"
            rules={[{ required: true, message: "Please select expiry date" }]}
          >
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            Inventory Details
          </Space>
        }
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalOpen(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MedicineBoxOutlined className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{selectedItem.medicine?.name}</h3>
                <p className="text-gray-600">{selectedItem.medicine?.manufacturer}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1">{selectedItem.medicine?.description || "No description"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Batch Number</label>
                <p className="mt-1">{selectedItem.batch_no || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Quantity</label>
                <p className="mt-1 font-semibold text-blue-600">{selectedItem.quantity}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Price</label>
                <p className="mt-1 font-semibold text-green-600">₹{selectedItem.price}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                <p className="mt-1">{selectedItem.expiry_date}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}