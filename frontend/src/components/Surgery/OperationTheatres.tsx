import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Select, Table, Space, Modal, Form } from "antd";
import { getApi, PostApi, PutApi, DeleteApi } from "@/ApiService";
import { Search, PlusCircle, Building, MapPin, Edit, Trash2, Eye, Activity, Wrench, Download } from "lucide-react";
import TextArea from "antd/es/input/TextArea";

const { Option } = Select;
// const { TextArea } = Input;

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

const THEATRE_STATUS = {
  AVAILABLE: "AVAILABLE",
  IN_USE: "In Use",
  UNDER_MAINTENANCE: "Under Maintenance",
  CLEANING: "Cleaning",
  OUT_OF_SERVICE: "Out of Service"
};

const STATUS_COLORS = {
  AVAILABLE: "green",
  IN_USE: "blue",
  UNDER_MAINTENANCE: "orange",
  CLEANING: "purple",
  OUT_OF_SERVICE: "red"
};

const STATUS_ICONS = {
  AVAILABLE: Activity,
  IN_USE: Building,
  UNDER_MAINTENANCE: Wrench,
//   CLEANING: Cleaning,
  OUT_OF_SERVICE: Wrench
};

export default function OperationTheatreManagement() {
  const [operationTheatres, setOperationTheatres] = useState<OperationTheatre[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTheatre, setSelectedTheatre] = useState<OperationTheatre | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [form] = Form.useForm();

  // Form state
  const [formData, setFormData] = useState({
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

  // Load all data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      getApi('/operation-theatre'),
      getApi('/departments')
    ]).then(([theatresData, departmentsData]) => {
      if (!theatresData?.error) setOperationTheatres(theatresData);
      if (!departmentsData?.error) setDepartments(departmentsData);
    }).catch(error => {
      toast.error("Failed to load data");
      console.error("Error loading data:", error);
    }).finally(() => setLoading(false));
  };

  const handleOpenModal = (theatre: OperationTheatre | null = null) => {
    if (theatre) {
      setSelectedTheatre(theatre);
      setFormData({
        name: theatre.name,
        building: theatre.building || "",
        floor: theatre.floor || "",
        wing: theatre.wing || "",
        room_number: theatre.room_number || "",
        department_id: theatre.department_id.toString(),
        status: theatre.status,
        is_active: theatre.is_active,
        notes: theatre.notes || ""
      });
    } else {
      setSelectedTheatre(null);
      setFormData({
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

  const handleSubmit = () => {
    form.validateFields().then(values => {
      if (selectedTheatre) {
        // Update operation theatre
        PutApi(`/operation-theatre/${selectedTheatre.id}`, formData)
          .then(data => {
            if (!data?.error) {
              toast.success("Operation theatre updated successfully!");
              loadData();
              setIsModalOpen(false);
            } else {
              toast.error(data.error);
            }
          })
          .catch(error => {
            toast.error("Error updating operation theatre");
            console.error("Error updating operation theatre:", error);
          });
      } else {
        // Create new operation theatre
        PostApi('/operation-theatre', formData)
          .then(data => {
            if (!data?.error) {
              toast.success("Operation theatre created successfully!");
              loadData();
              setIsModalOpen(false);
            } else {
              toast.error(data.error);
            }
          })
          .catch(error => {
            toast.error("Error creating operation theatre");
            console.error("Error creating operation theatre:", error);
          });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this operation theatre? This action cannot be undone.")) {
      DeleteApi(`/operation-theatres/${id}`)
        .then(data => {
          if (!data?.error) {
            toast.success("Operation theatre deleted successfully!");
            loadData();
          } else {
            toast.error(data.error);
          }
        })
        .catch(error => {
          toast.error("Error deleting operation theatre");
          console.error("Error deleting operation theatre:", error);
        });
    }
  };

  const handleStatusChange = (theatreId: number, newStatus: string) => {
    PutApi(`/operation-theatre/${theatreId}`, { status: newStatus })
      .then(data => {
        if (!data?.error) {
          toast.success(`Operation theatre status updated to ${THEATRE_STATUS[newStatus as keyof typeof THEATRE_STATUS]}`);
          loadData();
        } else {
          toast.error(data.error);
        }
      })
      .catch(error => {
        toast.error("Error updating operation theatre status");
        console.error("Error updating operation theatre status:", error);
      });
  };

  const handleActiveToggle = (theatreId: number, isActive: boolean) => {
    PutApi(`/operation-theatres/${theatreId}`, { is_active: isActive })
      .then(data => {
        if (!data?.error) {
          toast.success(`Operation theatre ${isActive ? 'activated' : 'deactivated'} successfully!`);
          loadData();
        } else {
          toast.error(data.error);
        }
      })
      .catch(error => {
        toast.error("Error updating operation theatre status");
        console.error("Error updating operation theatre status:", error);
      });
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

  const stats = {
    total: operationTheatres.length,
    available: operationTheatres.filter(t => t.status === "AVAILABLE" && t.is_active).length,
    inUse: operationTheatres.filter(t => t.status === "IN_USE").length,
    underMaintenance: operationTheatres.filter(t => t.status === "UNDER_MAINTENANCE").length,
    active: operationTheatres.filter(t => t.is_active).length
  };

  const getStatusIcon = (status: string) => {
    const IconComponent = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Activity;
    return <IconComponent className="w-4 h-4" />;
  };

  const columns = [
    {
      title: "Operation Theatre",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: OperationTheatre) => (
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-500" />
          <div>
            <div className="font-medium">{text}</div>
            {record.room_number && (
              <div className="text-sm text-gray-500">Room {record.room_number}</div>
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
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>{record.building}</span>
            </div>
          )}
          {(record.floor || record.wing) && (
            <div className="text-sm text-gray-500">
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
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          {text}
        </Badge>
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
            variant="outline"
            className={`
              ${status === "AVAILABLE" ? "bg-green-50 text-green-700 border-green-200" : ""}
              ${status === "IN_USE" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
              ${status === "UNDER_MAINTENANCE" ? "bg-orange-50 text-orange-700 border-orange-200" : ""}
              ${status === "CLEANING" ? "bg-purple-50 text-purple-700 border-purple-200" : ""}
              ${status === "OUT_OF_SERVICE" ? "bg-red-50 text-red-700 border-red-200" : ""}
            `}
          >
            {THEATRE_STATUS[status as keyof typeof THEATRE_STATUS]}
          </Badge>
        </div>
      ),
    },
    {
      title: "Active",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean, record: OperationTheatre) => (
        <Switch
          checked={isActive}
          onCheckedChange={(checked) => handleActiveToggle(record.id, checked)}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: OperationTheatre) => (
        <Space size="small">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleViewTheatre(record)}
            className="h-8 w-8 p-0"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleOpenModal(record)}
            className="h-8 w-8 p-0"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleDelete(record.id)}
            className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Operation Theatre Management</h1>
            <p className="text-gray-600 mt-1 text-base">Manage operating rooms and their availability</p>
          </div>
          <Button 
            onClick={() => handleOpenModal()}
            className="h-12 px-6 text-base font-medium bg-blue-600 hover:bg-blue-700 shrink-0"
            size="lg"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Operation Theatre
          </Button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="bg-white border-0 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Theatres</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Available</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">In Use</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inUse}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Maintenance</p>
                <p className="text-2xl font-bold text-orange-600">{stats.underMaintenance}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Wrench className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="bg-white border-0 shadow-sm rounded-xl mb-6">
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search operation theatres by name, building, room number, or department..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12 w-full text-base border-gray-300 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="w-full lg:w-48">
              <Select 
                value={statusFilter} 
                onChange={setStatusFilter}
                className="w-full h-12 [&_.ant-select-selector]:h-12 [&_.ant-select-selection-item]:leading-10"
                placeholder="All Status"
              >
                <Option value="all">All Status</Option>
                <Option value="AVAILABLE">Available</Option>
                <Option value="IN_USE">In Use</Option>
                <Option value="UNDER_MAINTENANCE">Under Maintenance</Option>
                <Option value="CLEANING">Cleaning</Option>
                <Option value="OUT_OF_SERVICE">Out of Service</Option>
              </Select>
            </div>
            <div className="w-full lg:w-48">
              <Select 
                value={departmentFilter} 
                onChange={setDepartmentFilter}
                className="w-full h-12 [&_.ant-select-selector]:h-12 [&_.ant-select-selection-item]:leading-10"
                placeholder="All Departments"
              >
                <Option value="all">All Departments</Option>
                {departments.map(dept => (
                  <Option key={dept.id} value={dept.id.toString()}>{dept.name}</Option>
                ))}
              </Select>
            </div>
            <Button variant="outline" className="h-12 px-6 border-gray-300 hover:bg-gray-50 w-full lg:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Operation Theatres Table */}
      <Card className="bg-white border-0 shadow-sm rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">Operation Theatres</CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                {filteredTheatres.length} theatre{filteredTheatres.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTheatres.length === 0 ? (
            <div className="text-center py-12">
              <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">No operation theatres found</p>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">
                {search || statusFilter !== "all" || departmentFilter !== "all"
                  ? "Try adjusting your search or filters" 
                  : "Get started by adding your first operation theatre"
                }
              </p>
            </div>
          ) : (
            <Table
              dataSource={filteredTheatres}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Operation Theatre Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-blue-600" />
            <span>{selectedTheatre ? "Edit Operation Theatre" : "Add New Operation Theatre"}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        width={700}
        okText={selectedTheatre ? "Update Theatre" : "Add Theatre"}
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
              >
                {departments.map(dept => (
                  <Option key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Building"
              name="building"
              rules={[{ max: 100, message: "Building must be at most 100 characters" }]}
            >
              <Input
                placeholder="Enter building name"
                value={formData.building}
                onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
              />
            </Form.Item>

            <Form.Item
              label="Floor"
              name="floor"
              rules={[{ max: 20, message: "Floor must be at most 20 characters" }]}
            >
              <Input
                placeholder="Enter floor number"
                value={formData.floor}
                onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Wing"
              name="wing"
              rules={[{ max: 50, message: "Wing must be at most 50 characters" }]}
            >
              <Input
                placeholder="Enter wing/section"
                value={formData.wing}
                onChange={(e) => setFormData(prev => ({ ...prev, wing: e.target.value }))}
              />
            </Form.Item>

            <Form.Item
              label="Room Number"
              name="room_number"
              rules={[{ max: 20, message: "Room number must be at most 20 characters" }]}
            >
              <Input
                placeholder="Enter room number"
                value={formData.room_number}
                onChange={(e) => setFormData(prev => ({ ...prev, room_number: e.target.value }))}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Status"
              name="status"
            >
              <Select
                value={formData.status}
                onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <Option value="AVAILABLE">Available</Option>
                <Option value="IN_USE">In Use</Option>
                <Option value="UNDER_MAINTENANCE">Under Maintenance</Option>
                <Option value="CLEANING">Cleaning</Option>
                <Option value="OUT_OF_SERVICE">Out of Service</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Active"
              name="is_active"
            >
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>{formData.is_active ? "Active" : "Inactive"}</Label>
              </div>
            </Form.Item>
          </div>

          <Form.Item
            label="Notes"
            name="notes"
          >
            <TextArea
              rows={3}
              placeholder="Additional notes about this operation theatre..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Operation Theatre Modal */}
      <Modal
        title="Operation Theatre Details"
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalOpen(false)}>
            Close
          </Button>,
          <Button 
            key="edit" 
            // type="primary"
            onClick={() => {
              setIsViewModalOpen(false);
              handleOpenModal(selectedTheatre);
            }}
          >
            Edit
          </Button>
        ]}
        width={600}
      >
        {selectedTheatre && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold text-gray-700">Name</Label>
                <p className="mt-1 text-gray-900">{selectedTheatre.name}</p>
              </div>
              <div>
                <Label className="font-semibold text-gray-700">Department</Label>
                <p className="mt-1">
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                    {selectedTheatre.department?.name}
                  </Badge>
                </p>
              </div>
              <div>
                <Label className="font-semibold text-gray-700">Status</Label>
                <div className="mt-1 flex items-center gap-2">
                  {getStatusIcon(selectedTheatre.status)}
                  <Badge 
                    variant="outline"
                    className={`
                      ${selectedTheatre.status === "AVAILABLE" ? "bg-green-50 text-green-700 border-green-200" : ""}
                      ${selectedTheatre.status === "IN_USE" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
                      ${selectedTheatre.status === "UNDER_MAINTENANCE" ? "bg-orange-50 text-orange-700 border-orange-200" : ""}
                      ${selectedTheatre.status === "CLEANING" ? "bg-purple-50 text-purple-700 border-purple-200" : ""}
                      ${selectedTheatre.status === "OUT_OF_SERVICE" ? "bg-red-50 text-red-700 border-red-200" : ""}
                    `}
                  >
                    {THEATRE_STATUS[selectedTheatre.status as keyof typeof THEATRE_STATUS]}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="font-semibold text-gray-700">Active</Label>
                <p className="mt-1">
                  <Badge variant={selectedTheatre.is_active ? "default" : "secondary"}>
                    {selectedTheatre.is_active ? "Active" : "Inactive"}
                  </Badge>
                </p>
              </div>
            </div>

            {(selectedTheatre.building || selectedTheatre.floor || selectedTheatre.wing || selectedTheatre.room_number) && (
              <div>
                <Label className="font-semibold text-gray-700">Location Details</Label>
                <div className="mt-2 space-y-2">
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
              </div>
            )}

            {selectedTheatre.notes && (
              <div>
                <Label className="font-semibold text-gray-700">Notes</Label>
                <p className="mt-1 p-2 bg-gray-50 rounded text-gray-700 whitespace-pre-wrap">
                  {selectedTheatre.notes}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <Label className="font-semibold text-gray-700">Created</Label>
                <p className="mt-1 text-sm text-gray-600">
                  {new Date(selectedTheatre.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Label className="font-semibold text-gray-700">Last Updated</Label>
                <p className="mt-1 text-sm text-gray-600">
                  {new Date(selectedTheatre.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}