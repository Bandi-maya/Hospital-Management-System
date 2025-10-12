import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { InputNumber, Popconfirm, Select, Table, Modal, Form, Tag, Space, Skeleton } from "antd";
import { countries } from "@/components/Patients/AddPatient";
import { getApi, PostApi, PutApi } from "@/ApiService";
import { DepartmentInterface } from "@/components/Departments/Departments";
import { Search, PlusCircle, User, Stethoscope, Mail, Phone, MapPin, Calendar, Edit, Trash2, Filter, Download, FileText, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const { Option } = Select;
import { Input as AntdInput } from "antd";
const { TextArea } = AntdInput;


export default function ReseptionistList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
  const [form] = Form.useForm();
  const [medicalRecordForm] = Form.useForm();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [extraFields, setExtraFields] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null);
  
  const userTypeId = useMemo(() => {
    return extraFields?.[0]?.user_type
  }, [extraFields]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  function getExtraFields() {
    getApi("/user-fields")
      .then((data) => {
        if (!data?.error) {
          setExtraFields(data.data.filter((field) => field.user_type_data.type.toUpperCase() === "RECEPTIONIST"));
        }
        else {
          toast.error("Error fetching user fields: " + data.error);
          console.error("Error fetching user fields:", data.error);
        }
      }).catch((error) => {
        toast.error("Error fetching user fields");
        console.error("Error fetching user fields:", error);
      });
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsLoading(true);

      if (selectedPatient) {
        const formData = {
          ...values,
          id: selectedPatient.id,
          user_type_id: selectedPatient.user_type_id,
          name: `${values.extra_fields?.first_name || ''} ${values.extra_fields?.last_name || ''}`.trim()
        };

        PutApi(`/users`, formData)
          .then((data) => {
            if (!data?.error) {
              toast.success("Receptionist updated successfully!");
              loadPatients();
              setIsModalOpen(false);
              setSelectedPatient(null);
              form.resetFields();
            } else {
              toast.error(data.error);
            }
          })
          .catch((error) => {
            console.error("Error updating receptionist:", error);
            toast.error("Error updating receptionist");
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    } catch (error) {
      toast.error("Please fill in all required fields");
    }
  };

  const handleAddRecord = async () => {
    try {
      const values = await medicalRecordForm.validateFields();
      setLoadingActionId(values.user_id);

      PostApi("/medical-records", values)
        .then((data) => {
          if (!data?.error) {
            toast.success("Medical record added successfully");
            setIsNotesModalOpen(false);
            medicalRecordForm.resetFields();
          } else {
            toast.error("Error adding medical record: " + data.error);
          }
        })
        .catch((error) => {
          console.error("Error adding record:", error);
          toast.error("Error adding medical record");
        })
        .finally(() => setLoadingActionId(null));
    } catch (error) {
      toast.error("Please enter medical notes");
    }
  };

  function loadDepartments() {
    getApi('/departments')
      .then((data) => {
        if (!data.error) {
          setDepartments(data.data);
        }
        else {
          toast.error(data.error);
        }
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
        toast.error("Failed to fetch departments");
      })
  }

  const navigate = useNavigate();

  const loadPatients = async (page = 1, limit = 10) => {
    setTableLoading(true);
    try {
      const data = await getApi(`/users?user_type=RECEPTIONIST&page=${page}&limit=${limit}`);
      if (!data?.error) {
        setPatients(data.data);
        setPagination(prev => ({
          ...prev,
          current: page,
          pageSize: limit,
          total: data.total_records,
        }));
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error getting receptionists");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadPatients(pagination.current, pagination.pageSize);
    loadDepartments();
    getExtraFields();
  }, []);

  const deletePatient = async (record: any) => {
    setLoadingActionId(record.id);
    await PutApi(`/users`, { ...record, is_active: false })
      .then((data) => {
        if (!data?.error) {
          toast.success("Receptionist deactivated successfully");
          loadPatients();
        } else {
          toast.error(data.error);
        }
      })
      .catch(() => toast.error("Error deactivating receptionist"))
      .finally(() => setLoadingActionId(null));
  };

  const handleEditPatient = (record: any) => {
    setSelectedPatient(record);
    form.setFieldsValue({
      address: record.address || {},
      department_id: record.department_id,
      date_of_birth: record.date_of_birth?.split("T")[0] || "",
      gender: record.gender,
      extra_fields: record.extra_fields?.fields_data || {},
      email: record.email,
      phone_no: record.phone_no,
    });
    setIsModalOpen(true);
  };

  const handleAddMedicalRecord = (record: any) => {
    medicalRecordForm.setFieldsValue({ user_id: record.id, notes: "" });
    setIsNotesModalOpen(true);
  };

  // Skeleton columns for loading state
  const skeletonColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: () => <Skeleton.Input active size="small" style={{ width: 60 }} />,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 150,
      render: () => <Skeleton.Input active size="small" style={{ width: 120 }} />,
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: 100,
      render: () => <Skeleton.Input active size="small" style={{ width: 80 }} />,
    },
    {
      title: "Phone",
      dataIndex: "phone_no",
      key: "phone",
      width: 140,
      render: () => <Skeleton.Input active size="small" style={{ width: 100 }} />,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      render: () => <Skeleton.Input active size="small" style={{ width: 150 }} />,
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
      width: 200,
      render: () => (
        <Space size="small">
          <Skeleton.Button active size="small" style={{ width: 40, height: 32 }} />
          <Skeleton.Button active size="small" style={{ width: 40, height: 32 }} />
          <Skeleton.Button active size="small" style={{ width: 40, height: 32 }} />
        </Space>
      ),
    },
  ];

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a: any, b: any) => a.id - b.id,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 150,
      sorter: (a: any, b: any) => a.name?.localeCompare(b.name),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: 100,
      filters: [
        { text: 'Male', value: 'Male' },
        { text: 'Female', value: 'Female' },
        { text: 'Other', value: 'Other' },
      ],
      onFilter: (value: any, record: any) => record.gender === value,
    },
    {
      title: "Phone",
      dataIndex: "phone_no",
      key: "phone",
      width: 140,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      width: 100,
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value: any, record: any) => record.is_active === value,
      render: (is_active: boolean) => (
        <Tag color={is_active ? "green" : "red"} className="m-0">
          {is_active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditPatient(record)}
            disabled={loadingActionId === record.id}
          >
            <Edit className="w-4 h-4" />
          </Button>
          
          <Popconfirm
            title="Are you sure to deactivate this receptionist?"
            onConfirm={() => deletePatient(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              size="sm"
              variant="outline"
              disabled={loadingActionId === record.id}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </Popconfirm>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAddMedicalRecord(record)}
            disabled={loadingActionId === record.id}
          >
            <FileText className="w-4 h-4" />
          </Button>
        </Space>
      ),
    },
  ];

  const handleTableChange = (newPagination: any) => {
    loadPatients(newPagination.current, newPagination.pageSize);
  };

  // Generate skeleton data for loading state
  const skeletonData = Array.from({ length: pagination.pageSize }, (_, index) => ({
    key: index,
    id: index,
    name: '',
    gender: '',
    phone_no: '',
    email: '',
    status: '',
  }));

  const tableWidth = columns.reduce((total, col) => total + (col.width as number), 0);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receptionist List</h1>
          <p className="text-gray-600 mt-1">Manage receptionist accounts and information</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => loadPatients()}
            disabled={tableLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${tableLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => navigate("/receptionist/add")}
            className="flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Add Receptionist
          </Button>
        </div>
      </div>

      {/* Patients Table with Skeleton Loading */}
      <Card>
        <CardContent className="p-0">
          <Table
            dataSource={tableLoading ? skeletonData : patients}
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
                pageSizeOptions: ['10', '20', '50'],
              }
            }
            onChange={handleTableChange}
            scroll={{ x: tableWidth }}
            size="middle"
            loading={false}
            tableLayout="fixed"
          />
        </CardContent>
      </Card>

      {/* Modal for adding medical record */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Add Medical Record</span>
          </div>
        }
        open={isNotesModalOpen}
        onCancel={() => {
          setIsNotesModalOpen(false);
          medicalRecordForm.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            variant="outline"
            onClick={() => {
              setIsNotesModalOpen(false);
              medicalRecordForm.resetFields();
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            onClick={handleAddRecord}
            disabled={loadingActionId === medicalRecordForm.getFieldValue('user_id')}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Add Record
          </Button>,
        ]}
        width={500}
      >
        <Form
          form={medicalRecordForm}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item name="user_id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="notes"
            label="Medical Notes"
            rules={[{ required: true, message: 'Please enter medical notes' }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter medical notes, observations, or treatment details..."
              className="resize-none"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for editing receptionist */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <span>Edit Receptionist</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedPatient(null);
          form.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            variant="outline"
            onClick={() => {
              setIsModalOpen(false);
              setSelectedPatient(null);
              form.resetFields();
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>,
        ]}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">Personal Information</h3>

              {extraFields.map((field: any) => (
                <Form.Item
                  key={field.field_name}
                  name={['extra_fields', field.field_name]}
                  label={field.field_name}
                  className="mb-4"
                >
                  <Input
                    placeholder={`Enter ${field.field_name}`}
                    className="h-10"
                  />
                </Form.Item>
              ))}

              <Form.Item
                name="date_of_birth"
                label="Date of Birth"
                rules={[{ required: true, message: 'Please select date of birth' }]}
              >
                <Input type="date" className="h-10" />
              </Form.Item>

              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: 'Please select gender' }]}
              >
                <Select
                  placeholder="Select gender"
                  className="h-10"
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
              </Form.Item>
            </div>

            {/* Contact & Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">Contact Information</h3>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Email address" className="h-10" />
              </Form.Item>

              <Form.Item
                name="phone_no"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input placeholder="Phone number" className="h-10" />
              </Form.Item>

              <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200 mt-6">Address Information</h3>

              <Form.Item
                name={['address', 'city']}
                label="City"
                rules={[{ required: true, message: 'Please enter city' }]}
              >
                <Input placeholder="City" className="h-10" />
              </Form.Item>

              <Form.Item
                name={['address', 'state']}
                label="State"
                rules={[{ required: true, message: 'Please enter state' }]}
              >
                <Input placeholder="State" className="h-10" />
              </Form.Item>

              <Form.Item
                name={['address', 'zip_code']}
                label="ZIP Code"
                rules={[{ required: true, message: 'Please enter ZIP code' }]}
              >
                <Input placeholder="ZIP code" className="h-10" />
              </Form.Item>

              <Form.Item
                name={['address', 'country']}
                label="Country"
                rules={[{ required: true, message: 'Please select country' }]}
              >
                <Select
                  placeholder="Select country"
                  className="h-10"
                  showSearch
                  options={countries.map(country => ({ value: country, label: country }))}
                />
              </Form.Item>

              <Form.Item
                name="department_id"
                label="Department"
              >
                <Select
                  placeholder="Select department"
                  className="h-10"
                  options={departments.map(dept => ({ value: dept.id, label: dept.name }))}
                />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
}