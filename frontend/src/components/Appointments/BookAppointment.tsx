import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getApi, PostApi } from "@/ApiService";
import { useNavigate } from "react-router-dom";
import { Calendar, User, Stethoscope, Building, Clock, PlusCircle, ArrowLeft } from "lucide-react";

export interface Appointment {
  id?: string;
  patient?: string;
  department_id: string;
  patient_id: string;
  doctor_id: string;
  doctor?: string;
  duration: number;
  appointment_date: string;
  appointment_start_time: string;
  appointment_end_time?: string;
  status?: "Pending" | "Confirmed" | "Completed";
}

export default function BookAppointment() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_start_time: "",
    duration: 30,
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
          setDoctors(data)
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
        toast.error("Error occurred while getting departments")
        console.error("Error: ", err)
      })
  }

  useEffect(() => {
    getPatients()
    getDepartments()
    getDoctors()
  }, [])

  function calculateEndTime(startTimeStr: string, durationMinutes: number) {
    const [hours, minutes] = startTimeStr.split(':').map(Number);
    const start = new Date();
    start.setHours(hours, minutes, 0, 0);

    const end = new Date(start.getTime() + durationMinutes * 60000);

    const endHours = String(end.getHours()).padStart(2, '0');
    const endMinutes = String(end.getMinutes()).padStart(2, '0');

    return `${endHours}:${endMinutes}`;
  }

  const handleBookAppointment = () => {
    if (!form.patient_id || !form.doctor_id || !form.appointment_date || !form.appointment_start_time || !form.department_id) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    const newAppointment: Appointment = {
      ...form,
      appointment_end_time: calculateEndTime(form.appointment_start_time, form.duration)
    };

    PostApi('/appointment', newAppointment)
      .then((data) => {
        if (!data.error) {
          toast.success("Appointment booked successfully!");
          navigate('/appointments')
        }
        else {
          toast.error(data.error)
          console.error("Error occurred", data.error)
        }
      }).catch((error) => {
        toast.error("Error occurred while creating appointment")
        console.log("Error occurred while creating appointment", error)
      })
      .finally(() => {
        setLoading(false);
      })
  };

  const stats = {
    totalPatients: patients.length,
    availableDoctors: doctors.length,
    departments: departments.length,
  };

  return (
    <div className="p-6 space-y-6" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                Appointment Management
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Schedule new patient appointments
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/appointments')}
              className="border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              View Appointments
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Total Patients</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalPatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Stethoscope className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Available Doctors</p>
                <p className="text-2xl font-bold text-green-900">{stats.availableDoctors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Departments</p>
                <p className="text-2xl font-bold text-purple-900">{stats.departments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Form Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            Appointment Details
          </CardTitle>
          <CardDescription>
            Fill in the appointment information to schedule a new booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Selection */}
            <div className="space-y-3">
              <Label htmlFor="patient" className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-gray-600" />
                Patient
              </Label>
              <Select value={form.patient_id} onValueChange={(val) => setForm({ ...form, patient_id: val })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{p.username}</span>
                        <span className="text-xs text-gray-500">{p.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department Selection */}
            <div className="space-y-3">
              <Label htmlFor="department" className="text-sm font-medium flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-600" />
                Department
              </Label>
              <Select value={form.department_id} onValueChange={(val) => setForm({ ...form, department_id: val })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="py-3">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Doctor Selection */}
            <div className="space-y-3">
              <Label htmlFor="doctor" className="text-sm font-medium flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-gray-600" />
                Doctor
              </Label>
              <Select value={form.doctor_id} onValueChange={(val) => setForm({ ...form, doctor_id: val })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id} className="py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">Dr. {d.username}</span>
                        <span className="text-xs text-gray-500">{d.specialization || "General Practitioner"}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-3">
              <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                Appointment Date
              </Label>
              <Input 
                type="date" 
                value={form.appointment_date} 
                onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                className="h-12"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Time Selection */}
            <div className="space-y-3">
              <Label htmlFor="time" className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                Start Time
              </Label>
              <Input 
                type="time" 
                value={form.appointment_start_time} 
                onChange={(e) => setForm({ ...form, appointment_start_time: e.target.value })}
                className="h-12"
              />
            </div>

            {/* Duration Selection */}
            <div className="space-y-3">
              <Label htmlFor="duration" className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                Duration (minutes)
              </Label>
              <Select value={form.duration.toString()} onValueChange={(val) => setForm({ ...form, duration: Number(val) })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time Summary */}
          {form.appointment_start_time && form.duration && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 font-medium">
                <Clock className="w-4 h-4" />
                Appointment Time Summary
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                <div>
                  <span className="text-gray-600">Start Time:</span>
                  <span className="font-medium ml-2">{form.appointment_start_time}</span>
                </div>
                <div>
                  <span className="text-gray-600">End Time:</span>
                  <span className="font-medium ml-2">
                    {calculateEndTime(form.appointment_start_time, form.duration)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium ml-2">{form.duration} minutes</span>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium ml-2">{form.appointment_date}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t">
            <Button 
              onClick={handleBookAppointment} 
              className="px-8 h-12 text-base font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Booking Appointment...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Book Appointment
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/appointments')}
              className="px-8 h-12 text-base font-medium"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}