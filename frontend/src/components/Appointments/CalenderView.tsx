import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getApi } from "@/ApiService";
import { toast } from "sonner";
import { Calendar as CalendarIcon, User, Clock, Stethoscope, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// Define interfaces
interface Patient {
  name?: string;
  username?: string;
}

interface Doctor {
  id: string;
  username: string;
  name?: string;
  specialization?: string;
}

interface Appointment {
  id: string;
  patient: Patient;
  doctor: Doctor;
  appointment_date: string;
  appointment_start_time: string;
  appointment_end_time?: string;
  status?: string;
  patient_id: string;
  doctor_id: string;
}

interface ApiResponse {
  error?: string;
  data?: any;
}

// Skeleton Loader Components
const CalendarSkeleton = () => (
  <Card className="border-0 shadow-sm lg:col-span-1">
    <CardHeader>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Loading calendar...</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AppointmentsSkeleton = () => (
  <Card className="border-0 shadow-sm lg:col-span-2">
    <CardHeader>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Doctor Filter Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Appointments List Skeleton */}
      <div className="space-y-3">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </CardContent>
  </Card>
);

const AppointmentCardSkeleton = () => (
  <Card className="border border-gray-200 shadow-sm">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>
        <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
);

export default function CalendarView() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [doctorsLoading, setDoctorsLoading] = useState<boolean>(false);

  const getDoctors = (): void => {
    setDoctorsLoading(true);
    getApi('/users?user_type=DOCTOR')
      .then((data: ApiResponse) => {
        if (!data.error) {
          setDoctors(data.data || []);
        } else {
          toast.error(data.error);
        }
      }).catch((err: Error) => {
        toast.error("Error occurred while getting doctors");
        console.error("Error: ", err);
      })
      .finally(() => {
        setDoctorsLoading(false);
      });
  };

  const loadData = (doctorId: string, date: Date): void => {
    setLoading(true);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const dateString = `${year}-${month}-${day}`;
    getApi(`/appointment?doctor_id=${doctorId}&date=${dateString}`)
      .then((data: ApiResponse) => {
        if (!data.error) {
          setAppointments(data.data || []);
        } else {
          toast.error(data.error);
        }
      }).catch((err: Error) => {
        toast.error("Error occurred while getting appointments");
        console.error("Error: ", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getDoctors();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedDoctor) {
      loadData(selectedDoctor, selectedDate);
    }
  }, [selectedDate, selectedDoctor]);

  // Get appointments for the selected date
  const dailyAppointments = appointments;

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Completed": return "default";
      case "Confirmed": return "secondary";
      case "Pending": return "destructive";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Completed": return "text-green-600 bg-green-50 border-green-200";
      case "Confirmed": return "text-blue-600 bg-blue-50 border-blue-200";
      case "Pending": return "text-orange-600 bg-orange-50 border-orange-200";
      default: return "";
    }
  };

  const handleCalendarChange = (value: any): void => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      setSelectedDate(value[0]);
    }
  };

  const isLoading = doctorsLoading;

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
        {isLoading ? (
          <CalendarSkeleton />
        ) : (
          <Card className="border-0 shadow-sm lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                onChange={handleCalendarChange}
                value={selectedDate}
                className="border-0 rounded-lg w-full"
              />
            </CardContent>
          </Card>
        )}

        {/* Appointments Card */}
        {isLoading ? (
          <AppointmentsSkeleton />
        ) : (
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
                <Select value={selectedDoctor} onValueChange={(val: string) => setSelectedDoctor(val)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select doctor to view appointments" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor: Doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id} className="py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">Dr. {doctor.username}</span>
                          <span className="text-xs text-gray-500">{doctor.specialization || "General Practitioner"}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Appointments List */}
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, index) => (
                    <AppointmentCardSkeleton key={index} />
                  ))}
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
                  {dailyAppointments.map((app: Appointment) => (
                    <Card key={app.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{app.patient?.name || app.patient?.username || "Unknown Patient"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Stethoscope className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">Dr. {app.doctor?.name || app.doctor?.username || "Unknown Doctor"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {app.appointment_start_time} {app.appointment_end_time ? `- ${app.appointment_end_time}` : ''}
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
        )}
      </div>
    </div>
  );
}