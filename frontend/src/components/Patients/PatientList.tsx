import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Popconfirm, Select, Spin, Table } from "antd";
import { countries } from "@/components/Patients/AddPatient";
import { getApi, PostApi, PutApi } from "@/ApiService";
import { DepartmentInterface } from "@/components/Departments/Departments";
import {
  Stethoscope,
  Edit,
  Trash2,
  NotebookPen,
  PlusCircle,
  Loader2,
} from "lucide-react";
import { Patient } from "@/types/patient";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

const { Option } = Select;

/** 🔹 Blue Spinner Component **/
const BlueSpinner = ({ size = "default", className = "" }: { size?: "small" | "default" | "large", className?: string }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-6 h-6",
    large: "w-8 h-8"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
    </div>
  );
};

/** 🔹 White Spinner Component **/
const WhiteSpinner = ({ size = "default", className = "" }: { size?: "small" | "default" | "large", className?: string }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-6 h-6",
    large: "w-8 h-8"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-white`} />
    </div>
  );
};

/** 🔹 Enhanced Animated Icon Button with Better Hover Labels **/
export const AnimatedActionButton = ({
  icon,
  label,
  color,
  onClick,
  confirm = false,
  confirmAction,
  loading = false,
}: {
  icon: React.ReactNode;
  label: string;
  color: "blue" | "red" | "green";
  onClick?: () => void;
  confirm?: boolean;
  confirmAction?: () => void;
  loading?: boolean;
}) => {
  const baseColor = {
    blue: "#1677ff",
    red: "#ff4d4f",
    green: "#52c41a",
  }[color];

  const button = (
    <motion.div
      className="relative inline-block"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 250 }}
    >
      <motion.button
        onClick={onClick}
        className="relative flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-white border border-gray-200 shadow-sm group"
        disabled={loading}
        style={{ borderColor: baseColor }}
      >
        {/* Icon or spinner */}
        <motion.span
          animate={{ color: loading ? baseColor : baseColor }}
          className="flex items-center justify-center w-4 h-4"
        >
          {loading ? (
            <BlueSpinner size="small" />
          ) : (
            icon
          )}
        </motion.span>

        {/* Label appears on hover - Improved positioning */}
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-gray-800 text-white text-xs font-medium rounded-md shadow-lg pointer-events-none z-50"
        >
          {label}
          {/* Tooltip arrow */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-800 rotate-45"></div>
        </motion.span>
      </motion.button>
    </motion.div>
  );

  return confirm ? (
    <Popconfirm
      title="Are you sure?"
      onConfirm={confirmAction}
      okText="Yes"
      cancelText="No"
    >
      {button}
    </Popconfirm>
  ) : (
    button
  );
};

export default function PatientList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
  const [form, setForm] = useState<any>({});
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [extraFields, setExtraFields] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [percent, setPercent] = useState(0);
  const [loadingStates, setLoadingStates] = useState({
    departments: false,
    extraFields: false,
    table: false
  });
  const navigate = useNavigate();

  const userTypeId = useMemo(() => extraFields?.[0]?.user_type, [extraFields]);

  // Show loading spinner with progress
  const showLoader = () => {
    setSpinning(true);
    let ptg = 0;

    const interval = setInterval(() => {
      ptg += 10;
      setPercent(ptg);

      if (ptg >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setSpinning(false);
          setPercent(0);
        }, 500);
      }
    }, 100);
  };

  const getExtraFields = () => {
    setLoadingStates(prev => ({ ...prev, extraFields: true }));
    getApi("/user-fields")
      .then((data) => {
        if (!data?.error) {
          setExtraFields(
            data.filter(
              (field: any) => field.user_type_data.type.toUpperCase() === "PATIENT"
            )
          );
        } else toast.error("Error fetching user fields: " + data.error);
      })
      .catch(() => toast.error("Error fetching extra fields"))
      .finally(() => setLoadingStates(prev => ({ ...prev, extraFields: false })));
  };

  const handleSubmit = () => {
    setIsLoading(true);

    if (
      !form.gender ||
      !form.date_of_birth ||
      !form.address?.city ||
      !form.address?.state ||
      !form.address?.zip_code ||
      !form.address?.country ||
      !form.email ||
      !form.phone_no
    ) {
      toast.error("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    // Update patient name from extra fields
    if (form?.extra_fields?.first_name || form?.extra_fields?.last_name) {
      form.name = `${form?.extra_fields?.first_name || ''} ${form?.extra_fields?.last_name || ''}`.trim();
    }

    if (selectedPatient) {
      PutApi(`/users`, {
        ...form,
        id: selectedPatient.id,
        user_type_id: selectedPatient.user_type_id,
      })
        .then((data) => {
          if (!data?.error) {
            toast.success("Patient updated successfully!");
            loadPatients();
            setIsModalOpen(false);
            setSelectedPatient(null);
            setForm({});
          } else {
            toast.error(data.error);
          }
        })
        .catch((error) => {
          console.error("Error updating patient:", error);
          toast.error("Error updating patient");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const loadDepartments = () => {
    setLoadingStates(prev => ({ ...prev, departments: true }));
    getApi("/departments")
      .then((data) => {
        if (!data.error) setDepartments(data);
        else toast.error(data.error);
      })
      .catch(() => toast.error("Failed to fetch departments"))
      .finally(() => setLoadingStates(prev => ({ ...prev, departments: false })));
  };

  const loadPatients = async () => {
    setIsLoading(true);
    setLoadingStates(prev => ({ ...prev, table: true }));
    showLoader(); // Show loading spinner

    try {
      const data = await getApi(`/users?user_type=PATIENT`);
      if (!data?.error) {
        setPatients(data);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error getting patients");
    } finally {
      setIsLoading(false);
      setLoadingStates(prev => ({ ...prev, table: false }));
    }
  };

  useEffect(() => {
    loadPatients();
    loadDepartments();
    getExtraFields();
  }, []);

  const deletePatient = async (record: any) => {
    setLoadingActionId(record.id);
    await PutApi(`/users`, { ...record, is_active: false })
      .then((data) => {
        if (!data?.error) {
          toast.success("Patient deactivated successfully");
          loadPatients();
        } else toast.error(data.error);
      })
      .catch(() => toast.error("Error deactivating patient"))
      .finally(() => setLoadingActionId(null));
  };

  const handleAddRecord = () => {
    if (!form.notes?.trim()) {
      toast.error("Please enter medical notes");
      return;
    }

    setLoadingActionId(form.user_id);
    PostApi("/medical-records", form)
      .then((data) => {
        if (!data?.error) {
          toast.success("Medical record added successfully");
          setIsDialogOpen(false);
          setForm({});
        } else {
          toast.error("Error adding medical record: " + data.error);
        }
      })
      .catch((error) => {
        console.error("Error adding record:", error);
        toast.error("Error adding medical record");
      })
      .finally(() => setLoadingActionId(null));
  };

  const handleFormChange = (field: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setForm((prev: any) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleExtraFieldChange = (field: string, value: string) => {
    setForm((prev: any) => ({
      ...prev,
      extra_fields: {
        ...prev.extra_fields,
        [field]: value
      }
    }));
  };

  const columns = [
    {
      title: "Patient ID",
      dataIndex: "id",
      key: "id",
      width: 90
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender"
    },
    {
      title: "Blood Type",
      dataIndex: "blood_type",
      key: "bloodType"
    },
    {
      title: "Phone",
      dataIndex: "phone_no",
      key: "phone"
    },
    {
      title: "Doctor",
      dataIndex: ["extra_fields", "fields_data", "assigned_to_doctor"],
      key: "assignedDoctor",
      render: (doctor: any) => doctor || "Not assigned"
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      render: (is_active: boolean) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${is_active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
            }`}
        >
          {is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 300,
      render: (_: any, record: any) => (
        <div className="flex flex-wrap gap-2">
          <AnimatedActionButton
            icon={<Edit className="w-4 h-4" />}
            label="Edit Patient"
            color="blue"
            loading={loadingActionId === record.id}
            onClick={() => {
              setSelectedPatient(record);
              setForm({
                address: record.address || {},
                department_id: record.department_id,
                date_of_birth: record.date_of_birth?.split("T")[0] || "",
                gender: record.gender,
                extra_fields: record.extra_fields?.fields_data || {},
                email: record.email,
                phone_no: record.phone_no,
                blood_type: record.blood_type,
              });
              setIsModalOpen(true);
            }}
          />

          <AnimatedActionButton
            icon={<Trash2 className="w-4 h-4" />}
            label="Delete Patient"
            color="red"
            loading={loadingActionId === record.id}
            confirm
            confirmAction={() => deletePatient(record)}
          />

          <AnimatedActionButton
            icon={<NotebookPen className="w-4 h-4" />}
            label="Add Medical Record"
            color="green"
            loading={loadingActionId === record.id}
            onClick={() => {
              setForm({ user_id: record.id, notes: "" });
              setIsDialogOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-sm">
      {/* Fullscreen Loading Spinner */}
      <Spin 
        spinning={spinning} 
        percent={percent} 
        fullscreen
        indicator={
          <div className="text-center">
            <WhiteSpinner size="large" />
          </div>
        }
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Patient List
        </h1>
        <div className="flex gap-2">
          <Button
            onClick={loadPatients}
            className="flex items-center gap-2"
            variant="outline"
            disabled={loadingStates.table}
          >
            {loadingStates.table ? (
              <BlueSpinner size="small" />
            ) : (
              <Loader2 className="w-4 h-4" />
            )}
            Refresh
          </Button>
          <Button
            onClick={() => navigate("/patients/add")}
            className="flex items-center gap-2"
            disabled={loadingStates.table}
          >
            <PlusCircle className="w-4 h-4" />
            Add Patient
          </Button>
        </div>
      </div>

      {/* Enhanced Loading overlay for table */}
      <div className="overflow-x-auto rounded-md border border-gray-200 relative min-h-[200px]">
        {loadingStates.table && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-10 rounded-lg border-2 border-dashed border-blue-100">
            <div className="text-center space-y-4">
              <BlueSpinner size="large" />
              <div className="space-y-2">
                <p className="text-gray-800 font-semibold text-lg">Loading Patients</p>
                <p className="text-gray-500 text-sm">Fetching patient data...</p>
              </div>
            </div>
          </div>
        )}
        
        <Table
          dataSource={patients}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          className="min-w-[800px]"
          loading={false} // Disable default Ant Design loading
        />
      </div>

      {/* Dialog for adding medical record */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Medical Record</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <Label htmlFor="notes">Medical Notes</Label>
            <Textarea
              id="notes"
              value={form.notes || ""}
              onChange={(e) => handleFormChange("notes", e.target.value)}
              placeholder="Enter medical notes, diagnosis, treatment details..."
              rows={4}
            />
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setForm({});
                setIsDialogOpen(false);
              }}
              disabled={loadingActionId === form.user_id}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddRecord}
              disabled={loadingActionId === form.user_id}
              className="flex items-center gap-2"
            >
              {loadingActionId === form.user_id ? (
                <WhiteSpinner size="small" />
              ) : null}
              Add Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal for editing patient */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50 overflow-y-auto">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="px-6 py-5 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Edit Patient
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Update patient information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <div className="flex-1 overflow-y-auto">
              <CardContent className="p-6">
                {/* Enhanced Loading overlay for form data */}
                {(loadingStates.departments || loadingStates.extraFields) && (
                  <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-lg border-2 border-dashed border-blue-100">
                    <div className="text-center space-y-4">
                      <BlueSpinner size="large" />
                      <div className="space-y-2">
                        <p className="text-gray-800 font-semibold">Loading Form Data</p>
                        <p className="text-gray-500 text-sm">Please wait...</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Personal Information</h3>

                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={form.extra_fields?.first_name || ""}
                        onChange={(e) => handleExtraFieldChange("first_name", e.target.value)}
                        placeholder="Enter first name"
                        disabled={loadingStates.extraFields}
                      />
                    </div>

                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={form.extra_fields?.last_name || ""}
                        onChange={(e) => handleExtraFieldChange("last_name", e.target.value)}
                        placeholder="Enter last name"
                        disabled={loadingStates.extraFields}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email || ""}
                        onChange={(e) => handleFormChange("email", e.target.value)}
                        placeholder="Enter email"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone_no">Phone Number</Label>
                      <Input
                        id="phone_no"
                        value={form.phone_no || ""}
                        onChange={(e) => handleFormChange("phone_no", e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        id="gender"
                        value={form.gender}
                        onChange={(value) => handleFormChange("gender", value)}
                        className="w-full"
                        placeholder="Select gender"
                        disabled={isLoading}
                      >
                        <Option value="Male">Male</Option>
                        <Option value="Female">Female</Option>
                        <Option value="Other">Other</Option>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={form.date_of_birth || ""}
                        onChange={(e) => handleFormChange("date_of_birth", e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="blood_type">Blood Type</Label>
                      <Select
                        id="blood_type"
                        value={form.blood_type}
                        onChange={(value) => handleFormChange("blood_type", value)}
                        className="w-full"
                        placeholder="Select blood type"
                        disabled={isLoading}
                      >
                        <Option value="A+">A+</Option>
                        <Option value="A-">A-</Option>
                        <Option value="B+">B+</Option>
                        <Option value="B-">B-</Option>
                        <Option value="AB+">AB+</Option>
                        <Option value="AB-">AB-</Option>
                        <Option value="O+">O+</Option>
                        <Option value="O-">O-</Option>
                      </Select>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Address Information</h3>

                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={form.address?.city || ""}
                        onChange={(e) => handleAddressChange("city", e.target.value)}
                        placeholder="Enter city"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={form.address?.state || ""}
                        onChange={(e) => handleAddressChange("state", e.target.value)}
                        placeholder="Enter state"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="zip_code">ZIP Code</Label>
                      <Input
                        id="zip_code"
                        value={form.address?.zip_code || ""}
                        onChange={(e) => handleAddressChange("zip_code", e.target.value)}
                        placeholder="Enter ZIP code"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select
                        id="country"
                        value={form.address?.country}
                        onChange={(value) => handleAddressChange("country", value)}
                        className="w-full"
                        placeholder="Select country"
                        disabled={isLoading}
                      >
                        {countries.map((country) => (
                          <Option key={country} value={country}>
                            {country}
                          </Option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Select
                        id="department"
                        value={form.department_id}
                        onChange={(value) => handleFormChange("department_id", value)}
                        className="w-full"
                        placeholder="Select department"
                        disabled={loadingStates.departments || isLoading}
                        loading={loadingStates.departments}
                      >
                        {departments.map((dept) => (
                          <Option key={dept.id} value={dept.id}>
                            {dept.name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 sticky bottom-0">
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedPatient(null);
                    setForm({});
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? <WhiteSpinner size="small" /> : null}
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}