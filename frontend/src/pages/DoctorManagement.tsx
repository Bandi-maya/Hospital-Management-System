import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { InputNumber, Select } from "antd";
import { countries } from "@/components/Patients/AddPatient";
import { getApi, PostApi, PutApi } from "@/ApiService";
import { DepartmentInterface } from "@/components/Departments/Departments";

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

// Key to store doctors in localStorage
const LOCAL_STORAGE_KEY = "doctors";

// Predefined specialization options
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
    extra_fields: {
      first_name: "",
      last_name: "",
      experience: 0,
      specialization: "",
    },
    email: "",
    phone_no: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

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
        console.error("Error fetching doctors:", error);
        toast.error("Failed to fetch doctors");
      })
  }

  function loadData() {
    setLoading(true)
    getApi('/users?user_type_id=1')
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

  // Load doctors from localStorage on mount
  useEffect(() => {
    loadData()
    loadDepartments()
  }, []);

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleOpenModal = (doctor = null) => {
    if (doctor) {
      const date = new Date(doctor.dateOfBirth);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const dd = String(date.getDate()).padStart(2, '0');

      const formattedDate = `${yyyy}-${mm}-${dd}`;

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
        date_of_birth: formattedDate,
        gender: doctor.gender,
        extra_fields: {
          first_name: doctor.extra_fields.fields_data.first_name,
          last_name: doctor.extra_fields.fields_data.last_name,
          experience: doctor.extra_fields?.experience || 0,
          specialization: doctor.extra_fields?.specialization || "",
        },
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
        extra_fields: {
          first_name: "",
          last_name: "",
          experience: 0,
          specialization: "",
        },
        email: "",
        phone_no: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    simulateLoading();

    if (!form.extra_fields.first_name || !form.extra_fields.last_name || !form.gender || !form.date_of_birth || !form.address.city || !form.address.state || !form.address.zip_code || !form.address.country || !form.extra_fields.specialization || !form.extra_fields.experience || !form.email || !form.phone_no) {
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
      PostApi(`/users`, { ...form, user_type_id: 1, name: form.extra_fields.first_name + " " + form.extra_fields.last_name, age: Math.floor((new Date().getTime() - new Date(form.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)), username: form.email })
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

  // Filter doctors by search
  const filteredDoctors = doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
    // d.specialization.toLowerCase().includes(search.toLowerCase()) ||
    // d.email.toLowerCase().includes(search.toLowerCase())
  );

  console.log(form);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Doctor Management</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search doctors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={() => handleOpenModal()}>Add Doctor</Button>
        </div>
      </div>

      {/* Doctors List */}
      <Card>
        <CardHeader>
          <CardTitle>Doctors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No doctors found.
              </div>
            ) : (
              filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{doctor.name}</h3>
                    <p className="text-sm text-gray-600">{doctor.extra_fields.specialization}</p>
                    <p className="text-sm text-gray-600">{doctor.email}</p>
                    <p className="text-sm text-gray-600">{doctor.phone_no}</p>
                  </div>
                  <div className="space-x-2">
                    <Button size="sm" onClick={() => handleOpenModal(doctor)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(doctor.id)}>Delete</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{selectedDoctor ? "Edit Doctor" : "Add Doctor"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">First Name *</Label>
                <Input
                  id="first_name"
                  value={form.extra_fields.first_name}
                  onChange={(e) => setForm({ ...form, extra_fields: { ...form.extra_fields, first_name: e.target.value } })}
                  placeholder="Doctor name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={form.extra_fields.last_name}
                  onChange={(e) => setForm({ ...form, extra_fields: { ...form.extra_fields, last_name: e.target.value } })}
                  placeholder="Doctor name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Department *</Label>
                <Select
                  id="department_id"
                  options={departments.map((d) => ({ value: d.id, label: d.name, key: d.id }))}
                  value={form.department_id}
                  onChange={(value) => setForm({ ...form, department_id: value })}
                  placeholder="Select department"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Date Of Birth *</Label>
                <Input
                  type="date"
                  id="date_of_birth"
                  value={form.date_of_birth}
                  onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                  placeholder="Doctor name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Gender *</Label>
                <Select
                  options={[
                    { value: "MALE", label: "Male" },
                    { value: "FEMALE", label: "Female" },
                    { value: "OTHER", label: "Other" },
                  ]}
                  id="date_of_birth"
                  value={form.gender}
                  onChange={(value) => setForm({ ...form, gender: value })}
                  placeholder="Doctor name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_no">Phone *</Label>
                <Input
                  id="phone_no"
                  value={form.phone_no}
                  onChange={(e) => setForm({ ...form, phone_no: e.target.value })}
                  placeholder="Phone number"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="specialization">Street *</Label>
                <Input
                  value={form.address.street || undefined}
                  onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">City *</Label>
                <Input
                  value={form.address.city || undefined}
                  onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">State *</Label>
                <Input
                  value={form.address.state || undefined}
                  onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">ZIP Code *</Label>
                <Input
                  value={form.address.zip_code || undefined}
                  onChange={(e) => setForm({ ...form, address: { ...form.address, zip_code: e.target.value } })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Country *</Label>
                <Select
                  placeholder="Select country"
                  value={form.address.country || undefined}
                  onChange={(value) => setForm({ ...form, address: { ...form.address, country: value } })}
                  showSearch
                  options={countries.map((c) => ({ value: c, label: c }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization *</Label>
                <Select
                  showSearch
                  placeholder="Select specialization"
                  optionFilterProp="children"
                  value={form.extra_fields.specialization || undefined}
                  onChange={(value) => setForm({ ...form, extra_fields: { ...form.extra_fields, specialization: value } })}
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  className="w-full"
                >
                  {SPECIALIZATIONS.map((s) => (
                    <Option key={s} value={s}>{s}</Option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Experience *</Label>
                <InputNumber
                  id="experience"
                  min={0}
                  value={(form as any).extra_fields.experience || 0}
                  onChange={(value) => setForm({ ...form, extra_fields: { ...form.extra_fields, experience: value || 0 } })}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit}>
                  {selectedDoctor ? "Update Doctor" : "Add Doctor"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
