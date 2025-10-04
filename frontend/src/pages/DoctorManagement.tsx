import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { InputNumber, Select } from "antd";
import { countries } from "@/components/Patients/AddPatient";
import { getApi, PostApi, PutApi } from "@/ApiService";
import { DepartmentInterface } from "@/components/Departments/Departments";
import { Search, PlusCircle, User, Stethoscope, Mail, Phone, MapPin, Calendar, Edit, Trash2, Filter, Download } from "lucide-react";

const { Option } = Select;

interface Doctor {
  id?: number,
  name?: string,
  address: {
    street: string,
    city: string,
    state: string,
    country: string,
    zip_code: string,
  },
  user_type_id?: number,
  department_id: string,
  date_of_birth: string,
  gender: string,
  email: string,
  phone_no: string,
  extra_fields: any;
}

const SPECIALIZATIONS = [
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "Oncology",
  "Radiology",
  "General Medicine",
];

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [form, setForm] = useState({
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zip_code: "",
    },
    department_id: "",
    date_of_birth: "",
    gender: "",
    extra_fields: {},
    email: "",
    phone_no: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [extraFields, setExtraFields] = useState<any>([])
  const userTypeId = useMemo(() => {
    return extraFields?.[0]?.user_type
  }, [extraFields])

  function getExtraFields() {
    getApi("/user-fields")
      .then((data) => {
        if (!data?.error) {
          setExtraFields(data.filter((field) => field.user_type_data.type.toUpperCase() === "DOCTOR"));
        }
        else {
          toast.error("Error fetching doctors: " + data.error);
          console.error("Error fetching doctors:", data.error);
        }
      }).catch((error) => {
        toast.error("Error fetching doctors");
        console.error("Error deleting doctors:", error);
      });
  }

  function loadDepartments() {
    getApi('/departments')
      .then((data) => {
        if (!data.error) {
          setDepartments(data);
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

  function loadData() {
    setLoading(true)
    getApi('/users?user_type=DOCTOR')
      .then((data) => {
        if (!data.error) {
          setDoctors(data);
        }
        else {
          toast.error(data.error);
        }
      })
      .catch((error) => {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to fetch doctors");
      }).finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData()
    loadDepartments()
    getExtraFields()
  }, []);

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleOpenModal = (doctor = null) => {
    if (doctor) {
      setSelectedDoctor(doctor);
      setForm({
        address: {
          street: doctor.address.street,
          city: doctor.address.city,
          state: doctor.address.state,
          country: doctor.address.country,
          zip_code: doctor.address.zip_code,
        },
        department_id: doctor.department_id,
        date_of_birth: doctor.date_of_birth.split("T")[0],
        gender: doctor.gender,
        extra_fields: doctor.extra_fields.fields_data,
        email: doctor.email,
        phone_no: doctor.phone_no,
      });
    } else {
      setSelectedDoctor(null);
      setForm({
        address: {
          street: "",
          city: "",
          state: "",
          country: "",
          zip_code: "",
        },
        date_of_birth: "",
        department_id: "",
        gender: "",
        extra_fields: {},
        email: "",
        phone_no: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    simulateLoading();

    if (!form.gender || !form.date_of_birth || !form.address.city || !form.address.state || !form.address.zip_code || !form.address.country || !form.email || !form.phone_no) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (selectedDoctor) {
      PutApi(`/users`, { ...form, id: selectedDoctor.id, user_type_id: selectedDoctor.user_type_id })
        .then((data) => {
          if (!data?.error) {
            toast.success("Doctor updated successfully!");
            loadData()
          }
          else {
            toast.error(data.error);
            console.error("Error updating doctor:", data.error);
          }
        }).catch((error) => {
          toast.error("Error updating doctor");
          console.error("Error updating doctor:", error);
        }).finally(() => {
          setIsLoading(false);
        })
    } else {
      PostApi(`/users`, { ...form, user_type_id: userTypeId, name: form.extra_fields?.['first_name'] + " " + form.extra_fields?.['last_name'], age: 10, username: form.email })
        .then((data) => {
          if (!data?.error) {
            toast.success("Doctor created successfully!");
            loadData()
          }
          else {
            toast.error(data.error);
            console.error("Error creating doctor:", data.error);
          }
        }).catch((error) => {
          toast.error("Error creating doctor");
          console.error("Error creating doctor:", error);
        }).finally(() => {
          setIsLoading(false);
        })
    }

    setIsModalOpen(false);
    setSelectedDoctor(null);
    setForm({
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        zip_code: "",
      },
      department_id: "",
      date_of_birth: "",
      gender: "",
      extra_fields: {
        first_name: "",
        last_name: "",
        experience: 0,
        specialization: "",
      },
      email: "",
      phone_no: "",
    });
    setIsLoading(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this doctor?")) {
      simulateLoading();
      setTimeout(() => {
        setDoctors((prev) => prev.filter((d) => d.id !== id));
        toast.success("Doctor deleted successfully!");
        setIsLoading(false);
      }, 500);
    }
  };

  const filteredDoctors = doctors.filter((d) => {
    const matchesSearch =
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.extra_fields?.specialization?.toLowerCase().includes(search.toLowerCase()) ||
      d.email?.toLowerCase().includes(search.toLowerCase());

    const matchesSpecialization = specializationFilter === "all" ||
      d.extra_fields?.specialization === specializationFilter;

    return matchesSearch && matchesSpecialization;
  });

  const stats = {
    total: doctors.length,
    cardiology: doctors.filter(d => d.extra_fields?.specialization === "Cardiology").length,
    pediatrics: doctors.filter(d => d.extra_fields?.specialization === "Pediatrics").length,
    neurology: doctors.filter(d => d.extra_fields?.specialization === "Neurology").length,
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Doctor Management</h1>
            <p className="text-gray-600 mt-1 text-base">Manage and track all healthcare professionals</p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="h-12 px-6 text-base font-medium bg-blue-600 hover:bg-blue-700 shrink-0"
            size="lg"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Doctor
          </Button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border-0 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Doctors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Cardiology</p>
                <p className="text-2xl font-bold text-blue-600">{stats.cardiology}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Stethoscope className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pediatrics</p>
                <p className="text-2xl font-bold text-green-600">{stats.pediatrics}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Neurology</p>
                <p className="text-2xl font-bold text-purple-600">{stats.neurology}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Stethoscope className="w-5 h-5 text-purple-600" />
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
                  placeholder="Search doctors by name, specialization, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12 w-full text-base border-gray-300 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="w-full lg:w-56">
              <Select
                value={specializationFilter}
                onChange={setSpecializationFilter}
                className="w-full h-12 [&_.ant-select-selector]:h-12 [&_.ant-select-selection-item]:leading-10"
                placeholder="All Specializations"
              >
                <Option value="all">All Specializations</Option>
                {SPECIALIZATIONS.map((s) => (
                  <Option key={s} value={s}>{s}</Option>
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

      {/* Doctors Grid */}
      <Card className="bg-white border-0 shadow-sm rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">Doctors</CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-12">
              <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">No doctors found</p>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">
                {search || specializationFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first doctor"
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {filteredDoctors.map((doctor) => (
                <Card key={doctor.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg overflow-hidden group">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-lg truncate flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-500 shrink-0" />
                            <span className="truncate">Dr. {doctor.name}</span>
                          </h3>
                          <Badge
                            variant="secondary"
                            className="mt-2 bg-blue-50 text-blue-700 border-blue-200 text-xs font-medium px-2 py-1"
                          >
                            {doctor.extra_fields?.specialization || "General Medicine"}
                          </Badge>
                        </div>
                        <div className="flex gap-1 ml-3 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenModal(doctor)}
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(doctor.id!)}
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-sm truncate">{doctor.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-sm">{doctor.phone_no}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-sm truncate">
                            {doctor.address?.city}, {doctor.address?.state}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-sm">
                            {doctor.extra_fields?.experience || 0} years experience
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="px-6 py-5 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {selectedDoctor ? "Edit Doctor" : "Add New Doctor"}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {selectedDoctor ? "Update doctor information" : "Fill in the details to add a new doctor"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <div className="flex-1 overflow-y-auto">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">Personal Information</h3>

                    {
                      extraFields.map((field) => {
                        return <div className="space-y-3">
                          <Label htmlFor={field.field_name} className="text-sm font-medium text-gray-700">{field.field_name} *</Label>
                          <Input
                            id={field.field_name}
                            value={form.extra_fields?.[field.field_name]}
                            onChange={(e) => setForm({ ...form, extra_fields: { ...form.extra_fields, [field.field_name]: e.target.value } })}
                            placeholder={`Enter ${field.field_name}`}
                            className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
                          />
                        </div>
                      })
                    }

                    <div className="space-y-3">
                      <Label htmlFor="date_of_birth" className="text-sm font-medium text-gray-700">Date Of Birth *</Label>
                      <Input
                        type="date"
                        id="date_of_birth"
                        value={form.date_of_birth}
                        onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                        className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="gender" className="text-sm font-medium text-gray-700">Gender *</Label>
                      <Select
                        options={[
                          { value: "MALE", label: "Male" },
                          { value: "FEMALE", label: "Female" },
                          { value: "OTHER", label: "Other" },
                        ]}
                        id="gender"
                        value={form.gender}
                        onChange={(value) => setForm({ ...form, gender: value })}
                        placeholder="Select gender"
                        className="w-full [&_.ant-select-selector]:h-11 [&_.ant-select-selection-item]:leading-9"
                        dropdownStyle={{ minWidth: '200px' }}
                        popupMatchSelectWidth={false}
                      />
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">Professional Information</h3>

                    <div className="space-y-3">
                      <Label htmlFor="department_id" className="text-sm font-medium text-gray-700">Department *</Label>
                      <Select
                        id="department_id"
                        options={departments.map((d) => ({ value: d.id, label: d.name, key: d.id }))}
                        value={form.department_id}
                        onChange={(value) => setForm({ ...form, department_id: value })}
                        placeholder="Select department"
                        className="w-full [&_.ant-select-selector]:h-11 [&_.ant-select-selection-item]:leading-9"
                        dropdownStyle={{ minWidth: '250px' }}
                        popupMatchSelectWidth={false}
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">Contact Information</h3>

                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="Email address"
                        className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="phone_no" className="text-sm font-medium text-gray-700">Phone *</Label>
                      <Input
                        id="phone_no"
                        value={form.phone_no}
                        onChange={(e) => setForm({ ...form, phone_no: e.target.value })}
                        placeholder="Phone number"
                        className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">Address Information</h3>

                    <div className="space-y-3">
                      <Label htmlFor="street" className="text-sm font-medium text-gray-700">Street *</Label>
                      <Input
                        value={form.address.street || undefined}
                        onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
                        placeholder="Street address"
                        className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="city" className="text-sm font-medium text-gray-700">City *</Label>
                        <Input
                          value={form.address.city || undefined}
                          onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                          placeholder="City"
                          className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="state" className="text-sm font-medium text-gray-700">State *</Label>
                        <Input
                          value={form.address.state || undefined}
                          onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })}
                          placeholder="State"
                          className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="zip_code" className="text-sm font-medium text-gray-700">ZIP Code *</Label>
                        <Input
                          value={form.address.zip_code || undefined}
                          onChange={(e) => setForm({ ...form, address: { ...form.address, zip_code: e.target.value } })}
                          placeholder="ZIP code"
                          className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="country" className="text-sm font-medium text-gray-700">Country *</Label>
                        <Select
                          placeholder="Select country"
                          value={form.address.country || undefined}
                          onChange={(value) => setForm({ ...form, address: { ...form.address, country: value } })}
                          showSearch
                          options={countries.map((c) => ({ value: c, label: c }))}
                          className="w-full [&_.ant-select-selector]:h-11 [&_.ant-select-selection-item]:leading-9"
                          dropdownStyle={{ minWidth: '250px' }}
                          popupMatchSelectWidth={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 sticky bottom-0">
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 px-6 text-base border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="h-11 px-8 text-base bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {selectedDoctor ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    selectedDoctor ? "Update Doctor" : "Add Doctor"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}