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
  patient?: any;
  department_id: string;
  patient_id: string;
  doctor_id: string;
  doctor?: any;
  duration: number;
  appointment_date: string;
  appointment_start_time: string;
  appointment_end_time?: string;
  status?: "Pending" | "Confirmed" | "Completed";
}

// Skeleton Loader Components
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[...Array(3)].map((_, index) => (
      <Card key={index} className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const FormSkeleton = () => (
  <Card className="border-0 shadow-sm">
    <CardHeader>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-64 animate-pulse mt-2"></div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
      
      {/* Time Summary Skeleton */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-40 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="space-y-1">
              <div className="h-3 bg-gray-300 rounded w-16 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="flex gap-3 mt-8 pt-6 border-t">
        <div className="h-12 bg-gray-200 rounded w-40 animate-pulse"></div>
        <div className="h-12 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
);

export default function BookAppointment() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState({
    patients: true,
    doctors: true,
    departments: true
  });
  
  const [form, setForm] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_start_time: "",
    duration: 30,
    department_id: "",
  });

  const getPatients = () => {
    setDataLoading(prev => ({ ...prev, patients: true }));
    getApi('/users?user_type=PATIENT')
      .then((data) => {
        if (!data.error) {
          setPatients(data.data || []);
        } else {
          toast.error(data.error);
        }
      })
      .catch((err) => {
        toast.error("Error occurred while getting patients");
        console.error("Error: ", err);
      })
      .finally(() => {
        setDataLoading(prev => ({ ...prev, patients: false }));
      });
  };

  const getDoctors = () => {
    setDataLoading(prev => ({ ...prev, doctors: true }));
    getApi('/users?user_type=DOCTOR')
      .then((data) => {
        if (!data.error) {
          setDoctors(data.data || []);
          setFilteredDoctors(data.data || []);
        } else {
          toast.error(data.error);
        }
      })
      .catch((err) => {
        toast.error("Error occurred while getting doctors");
        console.error("Error: ", err);
      })
      .finally(() => {
        setDataLoading(prev => ({ ...prev, doctors: false }));
      });
  };

  const getDepartments = () => {
    setDataLoading(prev => ({ ...prev, departments: true }));
    getApi('/departments')
      .then((data) => {
        if (!data.error) {
          setDepartments(data.data || []);
        } else {
          toast.error(data.error);
        }
      })
      .catch((err) => {
        toast.error("Error occurred while getting departments");
        console.error("Error: ", err);
      })
      .finally(() => {
        setDataLoading(prev => ({ ...prev, departments: false }));
      });
  };

  useEffect(() => {
    getPatients();
    getDepartments();
    getDoctors();
  }, []);

  // Filter doctors when department changes
  useEffect(() => {
    if (form.department_id) {
      const filtered = doctors.filter(doctor => 
        doctor.department_id === form.department_id
      );
      setFilteredDoctors(filtered);
      
      // Reset doctor selection if current doctor is not in filtered list
      if (form.doctor_id && !filtered.some(doctor => doctor.id === form.doctor_id)) {
        setForm(prev => ({ ...prev, doctor_id: "" }));
      }
    } else {
      setFilteredDoctors(doctors);
    }
  }, [form.department_id, doctors, form.doctor_id]);

  const calculateEndTime = (startTimeStr: string, durationMinutes: number) => {
    if (!startTimeStr) return "";
    
    try {
      const [hours, minutes] = startTimeStr.split(':').map(Number);
      const start = new Date();
      start.setHours(hours, minutes, 0, 0);

      const end = new Date(start.getTime() + durationMinutes * 60000);

      const endHours = String(end.getHours()).padStart(2, '0');
      const endMinutes = String(end.getMinutes()).padStart(2, '0');

      return `${endHours}:${endMinutes}`;
    } catch (error) {
      console.error("Error calculating end time:", error);
      return "";
    }
  };

  const handleBookAppointment = () => {
    // Validate all required fields
    if (!form.patient_id || !form.doctor_id || !form.appointment_date || !form.appointment_start_time || !form.department_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(form.appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error("Appointment date cannot be in the past");
      return;
    }

    setLoading(true);
    const newAppointment: Appointment = {
      ...form,
      appointment_end_time: calculateEndTime(form.appointment_start_time, form.duration),
      status: "Pending"
    };

    PostApi('/appointment', newAppointment) // Fixed endpoint - should be plural
      .then((data) => {
        if (!data.error) {
          toast.success("Appointment booked successfully!");
          navigate('/appointments');
        } else {
          toast.error(data.error || "Failed to book appointment");
          console.error("Error occurred", data.error);
        }
      }).catch((error) => {
        toast.error("Error occurred while creating appointment");
        console.error("Error occurred while creating appointment", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleFormChange = (key: string, value: string | number) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const stats = {
    totalPatients: patients.length,
    availableDoctors: doctors.length,
    departments: departments.length,
  };

  const isLoading = dataLoading.patients || dataLoading.doctors || dataLoading.departments;

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                Book Appointment
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
      {isLoading ? (
        <StatsSkeleton />
      ) : (
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
      )}

      {/* Main Form Card */}
      {isLoading ? (
        <FormSkeleton />
      ) : (
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
                  Patient *
                </Label>
                <Select 
                  value={form.patient_id} 
                  onValueChange={(val) => handleFormChange("patient_id", val)}
                  disabled={dataLoading.patients}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No patients available
                      </SelectItem>
                    ) : (
                      patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id} className="py-3">
                          <div className="flex flex-col">
                            <span className="font-medium">{patient.username}</span>
                            <span className="text-xs text-gray-500">{patient.email}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Department Selection */}
              <div className="space-y-3">
                <Label htmlFor="department" className="text-sm font-medium flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-600" />
                  Department *
                </Label>
                <Select 
                  value={form.department_id} 
                  onValueChange={(val) => handleFormChange("department_id", val)}
                  disabled={dataLoading.departments}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No departments available
                      </SelectItem>
                    ) : (
                      departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id} className="py-3">
                          {dept.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Doctor Selection */}
              <div className="space-y-3">
                <Label htmlFor="doctor" className="text-sm font-medium flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-gray-600" />
                  Doctor *
                </Label>
                <Select 
                  value={form.doctor_id} 
                  onValueChange={(val) => handleFormChange("doctor_id", val)}
                  disabled={dataLoading.doctors || !form.department_id}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue 
                      placeholder={
                        !form.department_id 
                          ? "Select department first" 
                          : filteredDoctors.length === 0 
                            ? "No doctors in this department"
                            : "Select doctor"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDoctors.length === 0 ? (
                      <SelectItem value="none" disabled>
                        {form.department_id ? "No doctors available in this department" : "Select a department first"}
                      </SelectItem>
                    ) : (
                      filteredDoctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id} className="py-3">
                          <div className="flex flex-col">
                            <span className="font-medium">Dr. {doctor.username}</span>
                            <span className="text-xs text-gray-500">
                              {doctor.specialization || "General Practitioner"}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div className="space-y-3">
                <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  Appointment Date *
                </Label>
                <Input 
                  type="date" 
                  value={form.appointment_date} 
                  onChange={(e) => handleFormChange("appointment_date", e.target.value)}
                  className="h-12"
                  min={getMinDate()}
                />
              </div>

              {/* Time Selection */}
              <div className="space-y-3">
                <Label htmlFor="time" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  Start Time *
                </Label>
                <Input 
                  type="time" 
                  value={form.appointment_start_time} 
                  onChange={(e) => handleFormChange("appointment_start_time", e.target.value)}
                  className="h-12"
                />
              </div>

              {/* Duration Selection */}
              <div className="space-y-3">
                <Label htmlFor="duration" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  Duration (minutes)
                </Label>
                <Select 
                  value={form.duration.toString()} 
                  onValueChange={(val) => handleFormChange("duration", Number(val))}
                >
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
                    <span className="font-medium ml-2">
                      {form.appointment_date ? new Date(form.appointment_date).toLocaleDateString() : "Not set"}
                    </span>
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
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}