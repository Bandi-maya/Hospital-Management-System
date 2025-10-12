import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getApi } from "@/ApiService";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Appointment } from "./BookAppointment";
import { Calendar as CalendarIcon, User, Clock, Stethoscope, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
// Add the missing Button import
import { Button } from "@/components/ui/button";

export default function CalendarView() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)

  function getDoctors() {
    getApi('/users?user_type=DOCTOR')
      .then((data) => {
        if (!data.error) {
          setDoctors(data.data)
        }
        else {
          toast.error(data.error)
        }
      }).catch((err) => {
        toast.error("Error occurred while getting doctors")
        console.error("Error: ", err)
      })
  }

  function loadData(doctorId: string, date: Date) {
    setLoading(true);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Add 1 and pad
    const day = String(date.getDate()).padStart(2, '0');

    const dateString = `${year}-${month}-${day}`;
    getApi(`/appointment?doctor_id=${doctorId}&date=${dateString}`)
      .then((data) => {
        if (!data.error) {
          setAppointments(data.data)
        }
        else {
          toast.error(data.error)
        }
      }).catch((err) => {
        toast.error("Error occurred while getting appointments")
        console.error("Error: ", err)
      })
      .finally(() => {
        setLoading(false);
      })
  }

  useEffect(() => {
    getDoctors()
  }, [])

  useEffect(() => {
    if (selectedDate && selectedDoctor) {
      loadData(selectedDoctor, selectedDate);
    }
  }, [selectedDate, selectedDoctor]);

  // Get appointments for the selected date
  const dailyAppointments = appointments.filter(
    app => app.appointment_date.split("T")[0] === selectedDate.toISOString().split("T")[0]
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Completed": return "default";
      case "Confirmed": return "secondary";
      case "Pending": return "destructive";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "text-green-600 bg-green-50 border-green-200";
      case "Confirmed": return "text-blue-600 bg-blue-50 border-blue-200";
      case "Pending": return "text-orange-600 bg-orange-50 border-orange-200";
      default: return "";
    }
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
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                </div>
                Calendar View
              </CardTitle>
              <CardDescription className="text-base mt-2">
                View and manage appointments by date
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/appointments')}
              className="border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Appointments
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Card */}
        <Card className="border-0 shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              onChange={(value) => {
                if (value instanceof Date) {
                  setSelectedDate(value);
                } else if (Array.isArray(value) && value[0] instanceof Date) {
                  setSelectedDate(value[0]);
                }
              }}
              value={selectedDate}
              className="border-0 rounded-lg w-full"
            />
          </CardContent>
        </Card>

        {/* Appointments Card */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Appointments for {selectedDate.toDateString()}
            </CardTitle>
            <CardDescription>
              {dailyAppointments.length} appointment(s) scheduled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Doctor Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-gray-600" />
                Filter by Doctor
              </Label>
              <Select value={selectedDoctor} onValueChange={(val) => setSelectedDoctor(val)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select doctor to view appointments" />
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

            {/* Appointments List */}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : !selectedDoctor ? (
              <div className="text-center py-8">
                <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-lg">Select a doctor to view appointments</p>
                <p className="text-gray-400 text-sm">Choose a doctor from the dropdown above</p>
              </div>
            ) : dailyAppointments.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-lg">No appointments scheduled</p>
                <p className="text-gray-400 text-sm">No appointments found for the selected date and doctor</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dailyAppointments.map(app => (
                  <Card key={app.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{app.patient.name || "Unknown Patient"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Dr. {app.doctor.name || "Unknown Doctor"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {app.appointment_start_time} - {app.appointment_end_time}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={getStatusVariant(app.status || "Pending")}
                          className={`font-medium ${getStatusColor(app.status || "Pending")}`}
                        >
                          {app.status || "Pending"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

