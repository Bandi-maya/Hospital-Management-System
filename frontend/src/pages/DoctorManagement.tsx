// src/pages/DoctorManagement.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  email: string;
  phone: string;
}

// Initial dummy data
const initialDoctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialization: "Cardiology",
    email: "sarah.johnson@hospital.com",
    phone: "+1-555-0101"
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialization: "Neurology",
    email: "michael.chen@hospital.com",
    phone: "+1-555-0102"
  },
  {
    id: 3,
    name: "Dr. Emily Davis",
    specialization: "Pediatrics",
    email: "emily.davis@hospital.com",
    phone: "+1-555-0103"
  }
];

export default function DoctorManagement() {
  // Local state for doctors data
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [form, setForm] = useState<Omit<Doctor, "id">>({
    name: "",
    specialization: "",
    email: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Simulate loading state
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

    // Basic validation
    if (!form.name || !form.specialization || !form.email || !form.phone) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      if (selectedDoctor) {
        // Update existing doctor
        setDoctors(prevDoctors =>
          prevDoctors.map(doctor =>
            doctor.id === selectedDoctor.id
              ? { ...selectedDoctor, ...form }
              : doctor
          )
        );
        toast.success("Doctor updated successfully!");
      } else {
        // Add new doctor
        const newDoctor: Doctor = {
          id: Math.max(0, ...doctors.map(d => d.id)) + 1,
          ...form,
        };
        setDoctors(prevDoctors => [...prevDoctors, newDoctor]);
        toast.success("Doctor added successfully!");
      }

      setIsModalOpen(false);
      setSelectedDoctor(null);
      setForm({ name: "", specialization: "", email: "", phone: "" });
    }, 500);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this doctor?")) {
      simulateLoading();
      
      setTimeout(() => {
        setDoctors(prevDoctors => prevDoctors.filter(doctor => doctor.id !== id));
        toast.success("Doctor deleted successfully!");
      }, 500);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Doctor Management</h1>
          <Button disabled>Add Doctor</Button>
        </div>
        <div className="p-6 text-center">Loading doctors...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Doctor Management</h1>
        <Button onClick={() => handleOpenModal()}>Add Doctor</Button>
      </div>

      {/* Doctors List */}
      <Card>
        <CardHeader>
          <CardTitle>Doctors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {doctors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No doctors found. Add your first doctor to get started.
              </div>
            ) : (
              doctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{doctor.name}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    <p className="text-sm text-gray-600">{doctor.email}</p>
                    <p className="text-sm text-gray-600">{doctor.phone}</p>
                  </div>
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleOpenModal(doctor)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(doctor.id)}
                    >
                      Delete
                    </Button>
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
                <Input
                  id="specialization"
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  placeholder="Specialization"
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
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : selectedDoctor ? "Update Doctor" : "Add Doctor"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}