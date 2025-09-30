import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <-- import this
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getApi } from "@/ApiService";

interface Appointment {
  id: string;
  patient: any;
  doctor: any;
  token_number?: any;
  appointment_date: string;
  appointment_start_time: string;
  status: "Pending" | "Confirmed" | "Completed";
}

const LOCAL_STORAGE_KEY = "appointments";

export default function TokenManagement() {
  const navigate = useNavigate(); // <-- hook for navigation
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  function loadData() {
    getApi('/tokens')
      .then((data) => {
        if (!data.error) {
          setAppointments(data)
        }
        else {
          toast.error(data.error)
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        toast.error("Error occurred while getting appointments")
      })
  }
  // Load appointments from localStorage
  useEffect(() => {
    loadData()
  }, []);

  const handleUpdateStatus = (id: string, status: Appointment["status"]) => {
    setAppointments(prev =>
      prev.map(app => (app.id === id ? { ...app, status } : app))
    );
    toast.success("Status updated!");
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appointments));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Token Management</h1>

        {/* Navigate to BookAppointment page */}
        <Button onClick={() => navigate("/tokens/create")}>
          Create Token
        </Button>
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
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No appointments found.
                </TableCell>
              </TableRow>
            ) : (
              appointments.map(app => (
                <TableRow key={app.id}>
                  <TableCell>{app?.patient?.username}</TableCell>
                  <TableCell>{app?.doctor?.username}</TableCell>
                  <TableCell>{app.appointment_date}</TableCell>
                  <TableCell>{app.token_number}</TableCell>
                  <TableCell>{app.appointment_start_time}</TableCell>
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
                        onValueChange={(status: Appointment["status"]) =>
                          handleUpdateStatus(app.id, status)
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
