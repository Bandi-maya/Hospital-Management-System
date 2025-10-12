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
import { Calendar, User, Stethoscope, Building, PlusCircle } from "lucide-react";

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

export default function CreateToken() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    department_id: "",
  });

  function getPatients() {
    getApi('/users?user_type=PATIENT')
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
    getApi('/users?user_type=DOCTOR')
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

  const handleCreateToken = () => {
    if (!form.patient_id || !form.appointment_date || !form.department_id) {
      toast.error("Please fill in all fields");
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
      .finally(() => {
        setLoading(false);
      })
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

      {/* Main Form Card */}
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
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t">
            <Button 
              onClick={handleCreateToken} 
              className="px-8 h-12 text-base font-medium"
              disabled={loading}
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

      {/* Quick Stats Card */}
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
    </div>
  );
}