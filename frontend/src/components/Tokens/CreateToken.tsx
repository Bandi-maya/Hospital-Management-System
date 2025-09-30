import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getApi, PostApi } from "@/ApiService";
import { useNavigate } from "react-router-dom";

export interface Token {
  id?: string;
  patient?: string;
  department_id: string;
  patient_id: string;
  doctor_id: string;
  doctor?: string;
  token_number?: string;
  // duration?: number;
  appointment_date: string;
  status?: "Pending" | "Confirmed" | "Completed";
}

export default function CreateToken() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [doctors, setDcotors] = useState([])
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    // duration: 10,
    department_id: "",
  });

  function getPatients() {
    getApi('/users?user_type_id=2')
      .then((data) => {
        if (!data.error) {
          setPatients(data)
        }
        else {
          toast.error(data.error)
        }
      })
      .catch((err) => {
        toast.error("Error occurred while getting patients")
        console.error("Error: ", err)
      })
  }

  function getDoctors() {
    getApi('/users?user_type_id=1')
      .then((data) => {
        if (!data.error) {
          setDcotors(data)
        }
        else {
          toast.error(data.error)
        }
      })
      .catch((err) => {
        toast.error("Error occurred while getting doctors")
        console.error("Error: ", err)
      })
  }

  function getDepartments() {
    getApi('/departments')
      .then((data) => {
        if (!data.error) {
          setDepartments(data)
        }
        else {
          toast.error(data.error)
        }
      })
      .catch((err) => {
        toast.error("Error occurred while getting patients")
        console.error("Error: ", err)
      })
  }

  useEffect(() => {
    getPatients()
    getDepartments()
    getDoctors()
  }, [])

  const handleCreateToken = () => {
    if (!form.patient_id || !form.appointment_date || !form.department_id) {
      toast.error("Please fill in all fields");
      return;
    }

    const newToken: Token = {
      ...form,
    };

    PostApi('/tokens', newToken)
      .then((data) => {
        if (!data.error) {
          toast.success("Token created successfully!");
          navigate('/tokens')
        }
        else {
          toast.error(data.error)
          console.error("Error occurred", data.error)
        }
      }).catch((error) => {
        toast.error("Error occurred while creating token")
        console.log("Error occurred while creating token", error)
      })
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Token Management</h1>
        <p className="text-muted-foreground">Create Token</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Patient</Label>
          <Select value={form.patient_id} onValueChange={(val) => setForm({ ...form, patient_id: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.username}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Department</Label>
          <Select value={form.department_id} onValueChange={(val) => setForm({ ...form, department_id: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Select specialization" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Doctor</Label>
          <Select value={form.doctor_id} onValueChange={(val) => setForm({ ...form, doctor_id: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Select doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.username}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Date</Label>
          <Input type="date" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} />
        </div>
      </div>

      <Button onClick={handleCreateToken} className="mt-4">
        Create
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
