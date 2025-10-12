import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Select, Table, Space, Modal, Form } from "antd";
import { getApi, PostApi, PutApi, DeleteApi } from "@/ApiService";
import { Search, PlusCircle, Scissors, Building, Edit, Trash2, Eye, FileText, Download } from "lucide-react";
import TextArea from "antd/es/input/TextArea";

const { Option } = Select;
// const { TextArea } = Input;

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
        // Update surgery type
        PutApi(`/surgery-type/${selectedSurgeryType.id}`, formData)
          .then(data => {
            if (!data?.error) {
              toast.success("Surgery type updated successfully!");
              loadData();
              setIsModalOpen(false);
            } else {
              toast.error(data.error);
            }
          })
          .catch(error => {
            toast.error("Error updating surgery type");
            console.error("Error updating surgery type:", error);
          });
      } else {
        // Create new surgery type
        PostApi('/surgery-type', formData)
          .then(data => {
            if (!data?.error) {
              toast.success("Surgery type created successfully!");
              loadData();
              setIsModalOpen(false);
            } else {
              toast.error(data.error);
            }
          })
          .catch(error => {
            toast.error("Error creating surgery type");
            console.error("Error creating surgery type:", error);
          });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this surgery type? This action cannot be undone.")) {
      DeleteApi(`/surgery-types/${id}`)
        .then(data => {
          if (!data?.error) {
            toast.success("Surgery type deleted successfully!");
            loadData();
          } else {
            toast.error(data.error);
          }
        })
        .catch(error => {
          toast.error("Error deleting surgery type");
          console.error("Error deleting surgery type:", error);
        });
    }
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
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-blue-500" />
          <span className="font-medium">{text}</span>
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
          <Building className="w-4 h-4 text-gray-400" />
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {text}
          </Badge>
        </div>
      ),
    },
    {
      title: "Last Updated",
      dataIndex: "updated_At",
      key: "updated_At",
      render: (date: string) => (
        <div className="text-sm text-gray-500">
          {new Date(date).toLocaleDateString()}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: SurgeryType) => (
        <Space size="small">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleViewSurgeryType(record)}
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
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Surgery Type Management</h1>
            <p className="text-gray-600 mt-1 text-base">Manage surgical procedure types and categories</p>
          </div>
          <Button 
            onClick={() => handleOpenModal()}
            className="h-12 px-6 text-base font-medium bg-blue-600 hover:bg-blue-700 shrink-0"
            size="lg"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Surgery Type
          </Button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border-0 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Surgery Types</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Scissors className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {departments.slice(0, 3).map(dept => (
          <Card key={dept.id} className="bg-white border-0 shadow-sm rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{dept.name}</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.byDepartment[dept.name] || 0}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Card */}
      <Card className="bg-white border-0 shadow-sm rounded-xl mb-6">
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search surgery types by name, description, or department..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12 w-full text-base border-gray-300 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="w-full lg:w-56">
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

      {/* Surgery Types Table */}
      <Card className="bg-white border-0 shadow-sm rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">Surgery Types</CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                {filteredSurgeryTypes.length} type{filteredSurgeryTypes.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredSurgeryTypes.length === 0 ? (
            <div className="text-center py-12">
              <Scissors className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">No surgery types found</p>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">
                {search || departmentFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Get started by adding your first surgery type"
                }
              </p>
            </div>
          ) : (
            <Table
              dataSource={filteredSurgeryTypes}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Surgery Type Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <Scissors className="w-5 h-5 text-blue-600" />
            <span>{selectedSurgeryType ? "Edit Surgery Type" : "Add New Surgery Type"}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        width={600}
        okText={selectedSurgeryType ? "Update Surgery Type" : "Add Surgery Type"}
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" className="space-y-4">
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
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
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
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Surgery Type Modal */}
      <Modal
        title="Surgery Type Details"
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
              handleOpenModal(selectedSurgeryType);
            }}
          >
            Edit
          </Button>
        ]}
        width={500}
      >
        {selectedSurgeryType && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold text-gray-700">Name</Label>
                <p className="mt-1 text-gray-900">{selectedSurgeryType.name}</p>
              </div>
              <div>
                <Label className="font-semibold text-gray-700">Department</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {selectedSurgeryType.department?.name}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <Label className="font-semibold text-gray-700">Description</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                {selectedSurgeryType.description ? (
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedSurgeryType.description}</p>
                ) : (
                  <p className="text-gray-400 italic">No description provided</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold text-gray-700">Created</Label>
                <p className="mt-1 text-sm text-gray-600">
                  {new Date(selectedSurgeryType.created_At).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Label className="font-semibold text-gray-700">Last Updated</Label>
                <p className="mt-1 text-sm text-gray-600">
                  {new Date(selectedSurgeryType.updated_At).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}