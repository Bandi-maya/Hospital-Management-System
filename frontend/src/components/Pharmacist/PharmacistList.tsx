// import { useState, useEffect, useMemo } from "react";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { toast } from "sonner";
// import { InputNumber, Popconfirm, Select, Table } from "antd";
// import { countries } from "@/components/Patients/AddPatient";
// import { getApi, PostApi, PutApi } from "@/ApiService";
// import { DepartmentInterface } from "@/components/Departments/Departments";
// import { Search, PlusCircle, User, Stethoscope, Mail, Phone, MapPin, Calendar, Edit, Trash2, Filter, Download } from "lucide-react";
// import { Patient } from "@/types/patient";
// import { useNavigate } from "react-router-dom";

// const { Option } = Select;

// export default function PharmacistList() {
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [patients, setPatients] = useState<Patient[]>([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
//   const [form, setForm] = useState<any>({});
//   const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
//   const [extraFields, setExtraFields] = useState<any>([])
//   const userTypeId = useMemo(() => {
//     return extraFields?.[0]?.user_type
//   }, [extraFields])
//   const [isLoading, setIsLoading] = useState(false);

//   function getExtraFields() {
//     getApi("/user-fields")
//       .then((data) => {
//         if (!data?.error) {
//           setExtraFields(data.data.filter((field) => field.user_type_data.type.toUpperCase() === "NURSE"));
//         }
//         else {
//           toast.error("Error fetching doctors: " + data.error);
//           console.error("Error fetching doctors:", data.error);
//         }
//       }).catch((error) => {
//         toast.error("Error fetching doctors");
//         console.error("Error deleting doctors:", error);
//       });
//   }

//   const handleSubmit = () => {
//     setIsLoading(true)

//     console.log(!form.gender, !form.date_of_birth, !form.address.city, !form.address.state, !form.address.zip_code, !form.address.country, !form.email, !form.phone_no)
//     if (!form.gender || !form.date_of_birth || !form.address.city || !form.address.state || !form.address.zip_code || !form.address.country || !form.email || !form.phone_no) {
//       toast.error("Please fill in all fields");
//       setIsLoading(false);
//       return;
//     }

//     form.name = form?.extra_fields?.first_name + " " + form?.extra_fields?.last_name

//     if (selectedDoctor) {
//       PutApi(`/users`, { ...form, id: selectedDoctor.id, user_type_id: selectedDoctor.user_type_id })
//         .then((data) => {
//           if (!data?.error) {
//             toast.success("Doctor updated successfully!");
//             loadPatients()
//           }
//           else {
//             toast.error(data.error);
//             console.error("Error updating doctor:", data.error);
//           }
//         }).catch((error) => {
//           toast.error("Error updating doctor");
//           console.error("Error updating doctor:", error);
//         }).finally(() => {
//           setIsLoading(false);
//         })
//     }
//     setIsModalOpen(false);
//     setSelectedDoctor(null);
//     setIsLoading(false);
//   };

//   function loadDepartments() {
//     getApi('/departments')
//       .then((data) => {
//         if (!data.error) {
//           setDepartments(data.data);
//         }
//         else {
//           toast.error(data.error);
//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching departments:", error);
//         toast.error("Failed to fetch departments");
//       })
//   }


//   const navigate = useNavigate();

//   const loadPatients = async () => {
//     await getApi(`/users?user_type=PHARMACIST`)
//       .then((data) => {
//         if (!data?.error) {
//           setPatients(data.data);
//         }
//         else {
//           toast.error(data.error)
//           console.error("Error fetching user fields:", data.error);
//         }
//       }).catch((error) => {
//         toast.error("Error getting users")
//         console.error("Error getting user data:", error);
//       });
//   };

//   useEffect(() => {
//     loadPatients();
//     loadDepartments()
//     getExtraFields()
//   }, []);

//   const deletePatient = async (record: any) => {
//     await PutApi(`/users`, { ...record, is_active: false })
//       .then((data) => {
//         if (!data?.error) {
//           loadPatients();
//         }
//         else {
//           console.error("Error fetching user fields:", data.error);
//         }
//       }).catch((error) => {
//         console.error("Error deleting user field:", error);
//       });
//   };

//   const columns = [
//     { title: "Patient ID", dataIndex: "id", key: "patientId" },
//     {
//       title: "Name",
//       dataIndex: "name",
//       key: "name",
//     },
//     {
//       title: "Gender",
//       dataIndex: "gender",
//       key: "gender"
//     },
//     {
//       title: "Blood Type",
//       dataIndex: "blood_type",
//       key: "bloodType"
//     },
//     {
//       title: "Phone",
//       dataIndex: "phone_no",
//       key: "phone"
//     },
//     {
//       title: "Doctor",
//       dataIndex: ["extra_fields", "fields_data", "assigned_to_doctor"],
//       key: "assignedDoctor",
//     },
//     {
//       title: "Status",
//       dataIndex: "is_active",
//       key: "status",
//       render: (is_active: boolean) => (is_active ? "Active" : "Inactive"),
//     },
//     {
//       title: "Action",
//       key: "action",
//       render: (_: any, record: any) => (
//         <>
//         <Button onClick={() => {
//             setSelectedDoctor(record);
//             setForm({
//               address: {
//                 street: record.address.street,
//                 city: record.address.city,
//                 state: record.address.state,
//                 country: record.address.country,
//                 zip_code: record.address.zip_code,
//               },
//               department_id: record.department_id,
//               date_of_birth: record.date_of_birth.split("T")[0],
//               gender: record.gender,
//               extra_fields: record.extra_fields.fields_data,
//               email: record.email,
//               phone_no: record.phone_no,
//             });
//             setIsModalOpen(true)
//           }}>Edit</Button>
//           <Popconfirm
//             title="Are you sure you want to delete?"
//             onConfirm={() => deletePatient(record)}
//           >
//             <Button >Delete</Button>
//           </Popconfirm>
//         </>
//       ),
//     },
//   ];

//   return (
//     <div className="p-6 bg-white rounded-lg shadow">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-2xl font-bold">Patient List</h1>
//         <Button onClick={() => navigate("/nurse/add")}>
//           Add Pharmacist
//         </Button>
//       </div>

//       <Table dataSource={patients} columns={columns} rowKey="id" />

//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
//           <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
//             <CardHeader className="px-6 py-5 border-b border-gray-200 bg-white sticky top-0 z-10">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                   <Stethoscope className="w-5 h-5 text-blue-600" />
//                 </div>
//                 <div>
//                   <CardTitle className="text-xl font-semibold text-gray-900">
//                     {selectedDoctor ? "Edit Doctor" : "Add New Doctor"}
//                   </CardTitle>
//                   <CardDescription className="text-gray-600">
//                     {selectedDoctor ? "Update doctor information" : "Fill in the details to add a new doctor"}
//                   </CardDescription>
//                 </div>
//               </div>
//             </CardHeader>

//             <div className="flex-1 overflow-y-auto">
//               <CardContent className="p-6">
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//                   {/* Personal Information */}
//                   <div className="space-y-4">
//                     <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">Personal Information</h3>

//                     {
//                       extraFields.map((field) => {
//                         return <div className="space-y-3">
//                           <Label htmlFor={field.field_name} className="text-sm font-medium text-gray-700">{field.field_name} *</Label>
//                           <Input
//                             id={field.field_name}
//                             value={form.extra_fields?.[field.field_name]}
//                             onChange={(e) => setForm({ ...form, extra_fields: { ...form.extra_fields, [field.field_name]: e.target.value } })}
//                             placeholder={`Enter ${field.field_name}`}
//                             className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
//                           />
//                         </div>
//                       })
//                     }

//                     <div className="space-y-3">
//                       <Label htmlFor="date_of_birth" className="text-sm font-medium text-gray-700">Date Of Birth *</Label>
//                       <Input
//                         type="date"
//                         id="date_of_birth"
//                         value={form.date_of_birth}
//                         onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
//                         className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
//                       />
//                     </div>

//                     <div className="space-y-3">
//                       <Label htmlFor="gender" className="text-sm font-medium text-gray-700">Gender *</Label>
//                       <Select
//                         options={[
//                           { value: "MALE", label: "Male" },
//                           { value: "FEMALE", label: "Female" },
//                           { value: "OTHER", label: "Other" },
//                         ]}
//                         id="gender"
//                         value={form.gender}
//                         onChange={(value) => setForm({ ...form, gender: value })}
//                         placeholder="Select gender"
//                         className="w-full [&_.ant-select-selector]:h-11 [&_.ant-select-selection-item]:leading-9"
//                         dropdownStyle={{ minWidth: '200px' }}
//                         popupMatchSelectWidth={false}
//                       />
//                     </div>
//                   </div>

//                   {/* Professional Information */}
//                   <div className="space-y-4">
//                     <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">Professional Information</h3>

//                     <div className="space-y-3">
//                       <Label htmlFor="department_id" className="text-sm font-medium text-gray-700">Department *</Label>
//                       <Select
//                         id="department_id"
//                         options={departments.map((d) => ({ value: d.id, label: d.name, key: d.id }))}
//                         value={form.department_id}
//                         onChange={(value) => setForm({ ...form, department_id: value })}
//                         placeholder="Select department"
//                         className="w-full [&_.ant-select-selector]:h-11 [&_.ant-select-selection-item]:leading-9"
//                         dropdownStyle={{ minWidth: '250px' }}
//                         popupMatchSelectWidth={false}
//                       />
//                     </div>
//                   </div>

//                   {/* Contact Information */}
//                   <div className="space-y-4">
//                     <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">Contact Information</h3>

//                     <div className="space-y-3">
//                       <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
//                       <Input
//                         id="email"
//                         type="email"
//                         value={form.email}
//                         onChange={(e) => setForm({ ...form, email: e.target.value })}
//                         placeholder="Email address"
//                         className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
//                       />
//                     </div>

//                     <div className="space-y-3">
//                       <Label htmlFor="phone_no" className="text-sm font-medium text-gray-700">Phone *</Label>
//                       <Input
//                         id="phone_no"
//                         value={form.phone_no}
//                         onChange={(e) => setForm({ ...form, phone_no: e.target.value })}
//                         placeholder="Phone number"
//                         className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
//                       />
//                     </div>
//                   </div>

//                   {/* Address Information */}
//                   <div className="space-y-4">
//                     <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">Address Information</h3>

//                     <div className="space-y-3">
//                       <Label htmlFor="street" className="text-sm font-medium text-gray-700">Street *</Label>
//                       <Input
//                         value={form.address.street || undefined}
//                         onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
//                         placeholder="Street address"
//                         className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
//                       />
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="space-y-3">
//                         <Label htmlFor="city" className="text-sm font-medium text-gray-700">City *</Label>
//                         <Input
//                           value={form.address.city || undefined}
//                           onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
//                           placeholder="City"
//                           className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
//                         />
//                       </div>

//                       <div className="space-y-3">
//                         <Label htmlFor="state" className="text-sm font-medium text-gray-700">State *</Label>
//                         <Input
//                           value={form.address.state || undefined}
//                           onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })}
//                           placeholder="State"
//                           className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
//                         />
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="space-y-3">
//                         <Label htmlFor="zip_code" className="text-sm font-medium text-gray-700">ZIP Code *</Label>
//                         <Input
//                           value={form.address.zip_code || undefined}
//                           onChange={(e) => setForm({ ...form, address: { ...form.address, zip_code: e.target.value } })}
//                           placeholder="ZIP code"
//                           className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
//                         />
//                       </div>

//                       <div className="space-y-3">
//                         <Label htmlFor="country" className="text-sm font-medium text-gray-700">Country *</Label>
//                         <Select
//                           placeholder="Select country"
//                           value={form.address.country || undefined}
//                           onChange={(value) => setForm({ ...form, address: { ...form.address, country: value } })}
//                           showSearch
//                           options={countries.map((c) => ({ value: c, label: c }))}
//                           className="w-full [&_.ant-select-selector]:h-11 [&_.ant-select-selection-item]:leading-9"
//                           dropdownStyle={{ minWidth: '250px' }}
//                           popupMatchSelectWidth={false}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </div>

//             {/* Footer Actions */}
//             <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 sticky bottom-0">
//               <div className="flex justify-end gap-3">
//                 <Button
//                   variant="outline"
//                   onClick={() => setIsModalOpen(false)}
//                   className="h-11 px-6 text-base border-gray-300 hover:bg-gray-50"
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleSubmit}
//                   disabled={isLoading}
//                   className="h-11 px-8 text-base bg-blue-600 hover:bg-blue-700"
//                 >
//                   {isLoading ? (
//                     <>
//                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                       {selectedDoctor ? "Updating..." : "Adding..."}
//                     </>
//                   ) : (
//                     selectedDoctor ? "Update Doctor" : "Add Doctor"
//                   )}
//                 </Button>
//               </div>
//             </div>
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// }
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
  Spin
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
  ReloadOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { countries } from "@/Components/Patients/AddPatient";
import { DownloadApi, getApi, PostApi, PutApi } from "@/ApiService";
import { DepartmentInterface } from "@/Components/Departments/Departments";
import { Patient } from "@/types/patient";
import { useNavigate } from "react-router-dom";
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select as UISelect } from "../ui/select";
import { Download, Filter, Search } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button as UIButton } from "@/components/ui/button";

const { Title, Text } = Typography;

export default function PharmacistList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nurses, setNurses] = useState<Patient[]>([]);
  const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
  const [form] = Form.useForm();
  const [selectedNurse, setSelectedNurse] = useState<any>(null);
  const [extraFields, setExtraFields] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    departments: false,
    extraFields: false,
    table: false
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const userTypeId = useMemo(() => {
    return extraFields?.[0]?.user_type;
  }, [extraFields]);

  const navigate = useNavigate();

  // Fetch data functions
  const getExtraFields = async () => {
    setLoadingStates(prev => ({ ...prev, extraFields: true }));
    try {
      const data = await getApi("/user-fields");
      if (!data?.error) {
        setExtraFields(data.data.filter((field: any) => field.user_type_data.type.toUpperCase() === "PHARMACIST"));
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

  const loadNurses = async (page = 1, limit = 10, searchQuery = searchTerm, status = statusFilter) => {
    setTableLoading(true);
    try {
      const data = await getApi(`/users?user_type=PHARMACIST&page=${page}&limit=${limit}&q=${searchQuery}`);
      if (!data?.error) {
        setPagination(prev => ({
          ...prev,
          current: page,
          pageSize: limit,
          total: data.total_records,
        }));
        setNurses(data.data);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error getting pharmacists");
      console.error("Error getting pharmacist data:", error);
    } finally {
      setTableLoading(false);
    }
  };

  const loadDepartments = async () => {
    setLoadingStates(prev => ({ ...prev, departments: true }));
    try {
      const data = await getApi('/departments');
      if (!data.error) {
        setDepartments(data.data);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to fetch departments");
    } finally {
      setLoadingStates(prev => ({ ...prev, departments: false }));
    }
  };

  useEffect(() => {
    loadNurses(pagination.current, pagination.pageSize);
    loadDepartments();
    getExtraFields();
  }, []);

  // Form submission handler
  const handleSubmit = async (values: any) => {
    setIsLoading(true);

    try {
      const formData = {
        ...values,
        name: `${values?.extra_fields?.first_name || ''} ${values?.extra_fields?.last_name || ''}`.trim(),
        user_type_id: selectedNurse ? selectedNurse.user_type_id : 4,
        id: selectedNurse?.id,
        address: {
          street: values.street,
          city: values.city,
          state: values.state,
          zip_code: values.zip_code,
          country: values.country,
        }
      };

      const data = await PutApi(`/users`, formData);
      if (!data?.error) {
        toast.success(selectedNurse ? "Pharmacist updated successfully!" : "Pharmacist added successfully!");
        loadNurses(pagination.current, pagination.pageSize);
        setIsModalOpen(false);
        setSelectedNurse(null);
        form.resetFields();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error(`Error ${selectedNurse ? 'updating' : 'adding'} pharmacist`);
      console.error(`Error ${selectedNurse ? 'updating' : 'adding'} pharmacist:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    loadNurses(newPagination.current, newPagination.pageSize);
  };

  // Delete nurse handler
  const deleteNurse = async (record: any) => {
    setLoadingActionId(record.id);
    try {
      const data = await PutApi(`/users`, { ...record, is_active: false });
      if (!data?.error) {
        toast.success("Pharmacist deactivated successfully!");
        loadNurses(pagination.current, pagination.pageSize);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error deactivating pharmacist");
      console.error("Error deleting pharmacist:", error);
    } finally {
      setLoadingActionId(null);
    }
  };

  // Open modal for editing
  const handleEdit = (record: any) => {
    setSelectedNurse(record);
    form.setFieldsValue({
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
    });
    setIsModalOpen(true);
  };

  // Close modal
  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedNurse(null);
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

   async function exportPharmacists(format = 'csv') {
    try {
      await DownloadApi(`/export?type=users&user_type=pharmacist&format=${format}`, format);
    } catch (err) {
      console.error('Export error:', err);
      alert('Something went wrong while exporting.');
    }
  }


  // Skeleton columns for loading state
  const skeletonColumns = [
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
  const columns = [
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
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: 100,
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
          {phone}
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
      render: (_: any, record: any) => (
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
            confirmAction={() => deleteNurse(record)}
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

  console.log(form, selectedNurse)

  return (
    <div className="p-6 space-y-6 rounded-lg" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <Title level={2} className="m-0">Pharmacist Management</Title>
        <Space>
          <Button
            onClick={() => loadNurses()}
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
                <Input.Search
                  placeholder="Search patients, doctors, or dates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                  onSearch={() => { loadNurses(pagination.current, pagination.pageSize, searchTerm) }}
                />
              </div>
            </div>
            {/* <div className="w-full md:w-48">
              <UISelect value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </UISelect>
            </div> */}
            <UIButton onClick={() => exportPharmacists()} variant="outline" className="h-12 px-6">
              <Download className="w-4 h-4 mr-2" />
              Export
            </UIButton>
          </div>
        </CardContent>
      </Card>

      {/* Nurses Table with Skeleton Loading */}
      <Card
        bodyStyle={{ padding: 0 }}
        className="overflow-hidden"
      >
        <Table
          dataSource={tableLoading ? skeletonData : nurses}
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
          loading={false} // We handle loading ourselves with skeleton
        />
      </Card>

      {/* Add/Edit Nurse Modal */}
      <Modal
        title={
          <Space>
            <TeamOutlined className="text-blue-600" />
            <span>{selectedNurse ? "Edit Pharmacist" : "Add New Pharmacist"}</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={800}
        style={{ top: 20 }}
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

              {extraFields.map((field: any) => (
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
                {selectedNurse ? "Update Pharmacist" : "Add Pharmacist"}
              </Button>
            </div>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
}