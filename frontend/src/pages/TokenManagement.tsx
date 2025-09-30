import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getApi } from "@/ApiService";
import { Search, PlusCircle, Calendar, User, Stethoscope, Clock, Filter, Download } from "lucide-react";

interface Appointment {
  id: string;
  patient: any;
  doctor: any;
  token_number?: any;
  appointment_date: string;
  appointment_start_time: string;
  status: "Pending" | "Confirmed" | "Completed";
}

export default function TokenManagement() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  function loadData() {
    setLoading(true);
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
      .finally(() => {
        setLoading(false);
      })
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = (id: string, status: Appointment["status"]) => {
    setAppointments(prev =>
      prev.map(app => (app.id === id ? { ...app, status } : app))
    );
    toast.success("Status updated!");
  };

  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = 
      app.patient?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.doctor?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.token_number?.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  const stats = {
    total: appointments.length,
    pending: appointments.filter(app => app.status === "Pending").length,
    confirmed: appointments.filter(app => app.status === "Confirmed").length,
    completed: appointments.filter(app => app.status === "Completed").length,
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
                Token Management
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Manage and track all appointment tokens
              </CardDescription>
            </div>
            <Button 
              onClick={() => navigate("/tokens/create")}
              className="h-12 px-6 text-base font-medium"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Token
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tokens</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Stethoscope className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search patients, doctors, or token numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="h-12 px-6">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Appointment Tokens ({filteredAppointments.length})
          </CardTitle>
          <CardDescription>
            Manage token status and view appointment details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold">Patient</TableHead>
                  <TableHead className="font-semibold">Doctor</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Token No.</TableHead>
                  <TableHead className="font-semibold">Time</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                      <p className="text-gray-500 mt-2">Loading appointments...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Calendar className="w-12 h-12 text-gray-300 mb-2" />
                        <p className="text-gray-500 text-lg">No appointments found</p>
                        <p className="text-gray-400 text-sm">
                          {searchTerm || statusFilter !== "all" 
                            ? "Try adjusting your search or filters" 
                            : "Create your first appointment token"
                          }
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map(app => (
                    <TableRow key={app.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {app?.patient?.username || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-gray-400" />
                          Dr. {app?.doctor?.username || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>{app.appointment_date}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono font-bold">
                          #{app.token_number}
                        </Badge>
                      </TableCell>
                      <TableCell>{app.appointment_start_time}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusVariant(app.status)}
                          className={`font-medium ${getStatusColor(app.status)}`}
                        >
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {app.status !== "Completed" && (
                          <Select
                            onValueChange={(status: Appointment["status"]) =>
                              handleUpdateStatus(app.id, status)
                            }
                          >
                            <SelectTrigger className="w-[140px] ml-auto">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Mark as Pending</SelectItem>
                              <SelectItem value="Confirmed">Mark as Confirmed</SelectItem>
                              <SelectItem value="Completed">Mark as Completed</SelectItem>
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
        </CardContent>
      </Card>
    </div>
  );
}