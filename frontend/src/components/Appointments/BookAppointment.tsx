import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Appointment {
  id: string;
  patient: string;
  doctor: string;
  date: string;
  time: string;
  specialization: string;
  status: "Pending" | "Confirmed" | "Completed";
}

const LOCAL_STORAGE_KEY = "appointments";

const patients = ["John Doe", "Jane Smith", "Alice Brown"];
const doctors = ["Dr. Maya", "Dr. John", "Dr. Sarah"];
const specializations = ["Cardiology", "Neurology", "Pediatrics"];

export default function BookAppointment() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [form, setForm] = useState({
    patient: "",
    doctor: "",
    date: "",
    time: "",
    specialization: "",
  });

  // Load appointments from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) setAppointments(JSON.parse(stored));
  }, []);

  // Save appointments to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appointments));
  }, [appointments]);

  const handleBookAppointment = () => {
    if (!form.patient || !form.doctor || !form.date || !form.time || !form.specialization) {
      toast.error("Please fill in all fields");
      return;
    }

    const newAppointment: Appointment = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
      ...form,
      status: "Pending",
    };

    setAppointments([...appointments, newAppointment]);
    toast.success("Appointment booked successfully!");

    setForm({
      patient: "",
      doctor: "",
      date: "",
      time: "",
      specialization: "",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Appointment Management</h1>
        <p className="text-muted-foreground">Book Appointment</p>
      </div>

      {/* Appointment Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Patient</Label>
          <Select value={form.patient} onValueChange={(val) => setForm({ ...form, patient: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Doctor</Label>
          <Select value={form.doctor} onValueChange={(val) => setForm({ ...form, doctor: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Select doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Specialization</Label>
          <Select value={form.specialization} onValueChange={(val) => setForm({ ...form, specialization: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Select specialization" />
            </SelectTrigger>
            <SelectContent>
              {specializations.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Date</Label>
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>

        <div className="space-y-1">
          <Label>Time</Label>
          <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
        </div>
      </div>

      <Button onClick={handleBookAppointment} className="mt-4">
        Book Appointment
      </Button>

      {/* Appointment List */}
      {/* {appointments.length > 0 && (
        <div className="mt-6 space-y-2">
          <h2 className="text-lg font-semibold">Booked Appointments</h2>
          {appointments.map((app) => (
            <div key={app.id} className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <p><strong>Patient:</strong> {app.patient}</p>
                <p><strong>Doctor:</strong> {app.doctor}</p>
                <p><strong>Specialization:</strong> {app.specialization}</p>
                <p><strong>Date:</strong> {app.date}</p>
                <p><strong>Time:</strong> {app.time}</p>
              </div>
              <Badge
                variant={
                  app.status === "Completed"
                    ? "default"
                    : app.status === "Confirmed"
                    ? "secondary"
                    : "destructive"
                }
              >
                {app.status}
              </Badge>
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
}
