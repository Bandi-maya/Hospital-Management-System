// src/pages/AppointmentManagement.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Dummy API (replace with real backend later)
const api = {
  async getAppointments() {
    return [
      {
        id: 1,
        patient: "John Doe",
        doctor: "Dr. Maya",
        date: "2025-09-30",
        time: "10:30 AM",
        status: "Pending",
      },
      {
        id: 2,
        patient: "Jane Smith",
        doctor: "Dr. John",
        date: "2025-10-01",
        time: "02:00 PM",
        status: "Confirmed",
      },
    ];
  },
  async addAppointment(app: {
    patient: string;
    doctor: string;
    date: string;
    time: string;
  }) {
    return {
      id: Math.random(),
      ...app,
      status: "Pending",
    };
  },
  async updateStatus(id: number, status: string) {
    return { success: true, id, status };
  },
};

export default function AppointmentManagement() {
  const queryClient = useQueryClient();

  // Fetch appointments
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: api.getAppointments,
  });

  // Add appointment mutation
  const addAppointmentMutation = useMutation({
    mutationFn: api.addAppointment,
    onSuccess: (newApp) => {
      queryClient.setQueryData(["appointments"], (old: any) =>
        old ? [...old, newApp] : [newApp]
      );
      toast.success("Appointment created successfully!");
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.updateStatus(id, status),
    onSuccess: ({ id, status }) => {
      queryClient.setQueryData(["appointments"], (old: any) =>
        old.map((app: any) => (app.id === id ? { ...app, status } : app))
      );
      toast.success("Status updated!");
    },
  });

  // Form state
  const [form, setForm] = useState({
    patient: "",
    doctor: "",
    date: "",
    time: "",
  });

  const handleAddAppointment = () => {
    if (!form.patient || !form.doctor || !form.date || !form.time) {
      toast.error("All fields are required");
      return;
    }
    addAppointmentMutation.mutate(form);
    setForm({ patient: "", doctor: "", date: "", time: "" });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Appointment Management</h1>

        {/* Add Appointment */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>New Appointment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Patient Name"
                value={form.patient}
                onChange={(e) => setForm({ ...form, patient: e.target.value })}
              />
              <Input
                placeholder="Doctor Name"
                value={form.doctor}
                onChange={(e) => setForm({ ...form, doctor: e.target.value })}
              />
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button
                onClick={handleAddAppointment}
                disabled={addAppointmentMutation.isPending}
              >
                {addAppointmentMutation.isPending ? "Saving..." : "Add Appointment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Appointments Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading appointments...
                </TableCell>
              </TableRow>
            ) : appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No appointments found.
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((app: any) => (
                <TableRow key={app.id}>
                  <TableCell>{app.patient}</TableCell>
                  <TableCell>{app.doctor}</TableCell>
                  <TableCell>{app.date}</TableCell>
                  <TableCell>{app.time}</TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {app.status !== "Completed" && (
                      <Select
                        onValueChange={(status) =>
                          updateStatusMutation.mutate({ id: app.id, status })
                        }
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Update" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Confirmed">Confirmed</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
