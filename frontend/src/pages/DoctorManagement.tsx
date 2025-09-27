import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select } from "antd";

const { Option } = Select;

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  email: string;
  phone: string;
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
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [form, setForm] = useState<Omit<Doctor, "id">>({
    name: "",
    specialization: "",
    email: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Load doctors from localStorage on mount
  useEffect(() => {
    const storedDoctors = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedDoctors) {
      setDoctors(JSON.parse(storedDoctors));
    }
  }, []);

  // Save doctors to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(doctors));
  }, [doctors]);

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleOpenModal = (doctor?: Doctor) => {
    if (doctor) {
      setSelectedDoctor(doctor);
      setForm({
        name: doctor.name,
        specialization: doctor.specialization,
        email: doctor.email,
        phone: doctor.phone,
      });
    } else {
      setSelectedDoctor(null);
      setForm({ name: "", specialization: "", email: "", phone: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    simulateLoading();

    if (!form.name || !form.specialization || !form.email || !form.phone) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      if (selectedDoctor) {
        // Update existing doctor
        setDoctors((prev) =>
          prev.map((d) =>
            d.id === selectedDoctor.id ? { ...d, ...form } : d
          )
        );
        toast.success("Doctor updated successfully!");
      } else {
        // Add new doctor
        const newDoctor: Doctor = {
          id: doctors.length > 0 ? Math.max(...doctors.map(d => d.id)) + 1 : 1,
          ...form,
        };
        setDoctors((prev) => [...prev, newDoctor]);
        toast.success("Doctor added successfully!");
      }

      setIsModalOpen(false);
      setSelectedDoctor(null);
      setForm({ name: "", specialization: "", email: "", phone: "" });
      setIsLoading(false);
    }, 500);
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
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase())
  );

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
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    <p className="text-sm text-gray-600">{doctor.email}</p>
                    <p className="text-sm text-gray-600">{doctor.phone}</p>
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
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Doctor name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization *</Label>
                <Select
                  showSearch
                  placeholder="Select specialization"
                  optionFilterProp="children"
                  value={form.specialization || undefined}
                  onChange={(value) => setForm({ ...form, specialization: value })}
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
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone number"
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
