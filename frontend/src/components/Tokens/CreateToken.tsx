import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getApi, PostApi } from "@/ApiService";
import { useNavigate } from "react-router-dom";
import { Calendar, User, Stethoscope, Building, PlusCircle, AlertCircle } from "lucide-react";

export interface Token {
  id?: string;
  patient?: string;
  department_id: string;
  patient_id: string;
  doctor_id: string;
  doctor?: string;
  token_number?: string;
  appointment_date: string;
  status?: "Pending" | "Confirmed" | "Completed";
}

// Interface for form data
interface FormData {
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  department_id: string;
}

// Interface for API responses
interface User {
  id: string;
  username: string;
  email: string;
  specialization?: string;
  department_id?: string;
  user_type: string;
}

interface Department {
  id: string;
  name: string;
}

// Validation Types
interface FormErrors {
  patient_id?: string;
  department_id?: string;
  doctor_id?: string;
  appointment_date?: string;
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
        {[...Array(4)].map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
      
      {/* Action Buttons Skeleton */}
      <div className="flex gap-3 mt-8 pt-6 border-t">
        <div className="h-12 bg-gray-200 rounded w-40 animate-pulse"></div>
        <div className="h-12 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
);

const HeaderSkeleton = () => (
  <Card className="border-0 shadow-sm">
    <CardHeader className="pb-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </CardHeader>
  </Card>
);

// Validation function
const validateForm = (form: FormData): FormErrors => {
  const errors: FormErrors = {};

  if (!form.patient_id) {
    errors.patient_id = "Patient selection is required";
  }

  if (!form.department_id) {
    errors.department_id = "Department selection is required";
  }

  // if (!form.doctor_id) {
  //   errors.doctor_id = "Doctor selection is required";
  // }

  if (!form.appointment_date) {
    errors.appointment_date = "Appointment date is required";
  } else {
    const selectedDate = new Date(form.appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.appointment_date = "Appointment date cannot be in the past";
    }
  }

  return errors;
};

export default function CreateToken() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState({
    patients: true,
    doctors: true,
    departments: true
  });
  const [form, setForm] = useState<FormData>({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    department_id: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({
    patient_id: false,
    doctor_id: false,
    appointment_date: false,
    department_id: false,
  });

  // Fetch patients
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

  // Fetch doctors
  const getDoctors = () => {
    setDataLoading(prev => ({ ...prev, doctors: true }));
    getApi('/users?user_type=DOCTOR')
      .then((data) => {
        if (!data.error) {
          const doctorsData = data.data || [];
          setDoctors(doctorsData);
          setFilteredDoctors(doctorsData); // Initialize filtered doctors with all doctors
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

  // Fetch departments
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
    if (form.department_id && doctors.length > 0) {
      const departmentDoctors = doctors.filter(doctor => 
        doctor.department_id === form.department_id
      );
      setFilteredDoctors(departmentDoctors);
      
      // Reset doctor selection if current doctor is not in the filtered list
      if (form.doctor_id && !departmentDoctors.some(d => d.id === form.doctor_id)) {
        setForm(prev => ({ ...prev, doctor_id: "" }));
      }
    } else {
      setFilteredDoctors(doctors);
    }
  }, [form.department_id, doctors, form.doctor_id]);

  // Validate form on change
  useEffect(() => {
    if (Object.keys(touched).some(key => touched[key as keyof typeof touched])) {
      const newErrors = validateForm(form);
      setErrors(newErrors);
    }
  }, [form, touched]);

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const newErrors = validateForm(form);
    setErrors(newErrors);
  };

  const handleCreateToken = () => {
    // Mark all fields as touched to show all errors
    const allTouched = {
      patient_id: true,
      doctor_id: true,
      appointment_date: true,
      department_id: true,
    };
    setTouched(allTouched);

    const newErrors = validateForm(form);
    setErrors(newErrors);

    // Check if there are any errors
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setLoading(true);
    const newToken: Token = {
      ...form,
    };

    PostApi('/tokens', newToken)
      .then((data) => {
        if (!data.error) {
          toast.success("Token created successfully!");
          navigate('/tokens');
        } else {
          toast.error(data.error);
          console.error("Error occurred", data.error);
        }
      }).catch((error) => {
        toast.error("Error occurred while creating token");
        console.log("Error occurred while creating token", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const isFormValid = () => {
    const validationErrors = validateForm(form);
    return Object.keys(validationErrors).length === 0;
  };

  const isLoading = dataLoading.patients || dataLoading.doctors || dataLoading.departments;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Card */}
      {isLoading ? (
        <HeaderSkeleton />
      ) : (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <PlusCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  Create New Token
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Generate new appointment tokens for patients
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/tokens')}
                className="border-gray-300"
              >
                View All Tokens
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Main Form Card */}
      {isLoading ? (
        <FormSkeleton />
      ) : (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Token Information
            </CardTitle>
            <CardDescription>
              Fill in the required details to create a new appointment token
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
                  onValueChange={(val) => handleFieldChange("patient_id", val)}
                >
                  <SelectTrigger className={`h-12 ${errors.patient_id ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id} className="py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{patient.username}</span>
                          <span className="text-xs text-gray-500">{patient.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.patient_id && touched.patient_id && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.patient_id}
                  </div>
                )}
              </div>

              {/* Department Selection */}
              <div className="space-y-3">
                <Label htmlFor="department" className="text-sm font-medium flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-600" />
                  Department *
                </Label>
                <Select 
                  value={form.department_id} 
                  onValueChange={(val) => handleFieldChange("department_id", val)}
                >
                  <SelectTrigger className={`h-12 ${errors.department_id ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id} className="py-3">
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department_id && touched.department_id && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.department_id}
                  </div>
                )}
              </div>

              {/* Doctor Selection */}
              <div className="space-y-3">
                <Label htmlFor="doctor" className="text-sm font-medium flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-gray-600" />
                  Doctor 
                  {/* * */}
                </Label>
                <Select 
                  value={form.doctor_id} 
                  onValueChange={(val) => handleFieldChange("doctor_id", val)}
                  disabled={!form.department_id || filteredDoctors.length === 0}
                >
                  <SelectTrigger className={`h-12 ${errors.doctor_id ? 'border-red-500' : ''} ${!form.department_id ? 'bg-gray-100' : ''}`}>
                    <SelectValue 
                      placeholder={
                        !form.department_id 
                          ? "Select department first" 
                          : filteredDoctors.length === 0 
                            ? "No doctors available" 
                            : "Select doctor"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id} className="py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">Dr. {doctor.username}</span>
                          <span className="text-xs text-gray-500">
                            {doctor.specialization || "General Practitioner"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.doctor_id && touched.doctor_id && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.doctor_id}
                  </div>
                )}
                {form.department_id && filteredDoctors.length === 0 && (
                  <div className="flex items-center gap-1 text-amber-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    No doctors available in this department
                  </div>
                )}
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
                  onChange={(e) => handleFieldChange("appointment_date", e.target.value)}
                  onBlur={() => handleBlur("appointment_date")}
                  className={`h-12 ${errors.appointment_date ? 'border-red-500' : ''}`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.appointment_date && touched.appointment_date && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors.appointment_date}
                  </div>
                )}
              </div>
            </div>

            {/* Required Fields Note */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Fields marked with * are required</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t">
              <Button 
                onClick={handleCreateToken} 
                className="px-8 h-12 text-base font-medium"
                disabled={loading || !isFormValid()}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Token...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Token
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/tokens')}
                className="px-8 h-12 text-base font-medium"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Card */}
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
                  <p className="text-2xl font-bold text-blue-900">{patients.length}</p>
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
                  <p className="text-2xl font-bold text-green-900">{doctors.length}</p>
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
                  <p className="text-2xl font-bold text-purple-900">{departments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}