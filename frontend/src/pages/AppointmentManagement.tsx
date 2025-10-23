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
import { Label } from "@/components/ui/label";
import { Input as AntInput, Table as AntdTable } from "antd";
import { toast } from "sonner";
import { getApi, PutApi, DeleteApi } from "@/ApiService";
import {
  Search,
  PlusCircle,
  Calendar,
  User,
  Stethoscope,
  Clock,
  Filter,
  Download,
  Edit,
  Eye,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import FullscreenLoader from "@/components/Loader/FullscreenLoader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Appointment {
  id: string;
  patient: any;
  doctor: any;
  appointment_date: string;
  appointment_start_time: string;
  status: "CANCELED" | "CONFIRMED" | "SCHEDULED";
  patient_id: string;
  doctor_id: string;
}

// Skeleton Loader Components
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {[...Array(4)].map((_, index) => (
      <Card key={index} className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="w-20 h-6 bg-gray-200 rounded"></div>
        <div className="w-24 h-10 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
);

const FormSkeleton = () => (
  <Card className="w-full max-w-2xl shadow-md">
    <CardHeader>
      <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
);

// Enhanced Action Button Component matching Nurse Management theme
const ActionButton = ({
  icon,
  label,
  onClick,
  variant = "outline",
  size = "icon",
  className = "",
  disabled = false,
  loading = false
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 250 }}
        >
          <Button
            variant={variant}
            size={size}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
              flex items-center justify-center 
              transition-all duration-300 ease-in-out
              w-10 h-10 rounded-full
              border border-gray-300
              ${variant === "destructive"
                ? "text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300"
              }
              ${className}
            `}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              icon
            )}
          </Button>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default function AppointmentManagement() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [form, setForm] = useState({
    id: "",
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_start_time: "",
    status: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    loadData(pagination.current, pagination.pageSize, searchTerm, statusFilter)
  }, [statusFilter])

  const handleSubmit = () => {
    setIsSubmitting(true);
    PutApi(`/appointment`, form)
      .then((res) => {
        if (!res?.error) {
          toast.success("Appointment updated successfully!");
          setEditModalOpen(false);
          setSelectedAppointment(null);
          setForm({
            id: "",
            patient_id: "",
            doctor_id: "",
            appointment_date: "",
            appointment_start_time: "",
            status: ""
          });
          loadData();
        } else {
          toast.error(res?.error || "Update failed");
        }
      })
      .catch(() => toast.error("Error updating appointment"))
      .finally(() => setIsSubmitting(false));
  };

  const handleDelete = () => {
    if (!selectedAppointment) return;

    setLoadingActionId(selectedAppointment.id);
    DeleteApi(`/appointment/${selectedAppointment.id}`)
      .then((res) => {
        if (!res?.error) {
          toast.success("Appointment deleted successfully!");
          setDeleteModalOpen(false);
          setSelectedAppointment(null);
          loadData();
        } else {
          toast.error(res?.error || "Delete failed");
        }
      })
      .catch(() => toast.error("Error deleting appointment"))
      .finally(() => setLoadingActionId(null));
  };

  function loadData(page = 1, limit = 10, searchQuery = searchTerm, status = statusFilter) {
    setLoading(true);
    getApi(`/appointment?page=${page}&limit=${limit}&q=${searchQuery}&status=${statusFilter === 'all' ? "" : statusFilter}`)
      .then((data) => {
        if (!data.error) {
          setAppointments(data.data);
        } else {
          toast.error(data.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Error occurred while getting appointments");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = (id: string, status: Appointment["status"]) => {
    setLoadingActionId(id);
    PutApi(`/appointment`, { id, status })
      .then((res) => {
        if (!res?.error) {
          setAppointments(prev =>
            prev.map(app => (app.id === id ? { ...app, status } : app))
          );
          toast.success("Status updated successfully!");
        } else {
          toast.error(res?.error || "Status update failed");
        }
      })
      .catch(() => toast.error("Error updating status"))
      .finally(() => setLoadingActionId(null));
  };

  const handleView = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setViewModalOpen(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setForm({
      id: appointment.id,
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      appointment_date: appointment.appointment_date.split("T")[0],
      appointment_start_time: appointment.appointment_start_time,
      status: appointment.status,
    });
    setEditModalOpen(true);
  };

  const handleDeleteClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDeleteModalOpen(true);
  };

  const filteredAppointments = appointments.filter(app => {
    const matchesSearch =
      app.patient?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.doctor?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.appointment_date.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "SCHEDULED": return "default";
      case "CONFIRMED": return "secondary";
      case "CANCELED": return "destructive";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED": return "text-green-600 bg-green-50 border-green-200";
      case "CONFIRMED": return "text-blue-600 bg-blue-50 border-blue-200";
      case "CANCELED": return "text-orange-600 bg-orange-50 border-orange-200";
      default: return "";
    }
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter(app => app.status === "CANCELED").length,
    confirmed: appointments.filter(app => app.status === "CONFIRMED").length,
    completed: appointments.filter(app => app.status === "SCHEDULED").length,
  };

  const columns = [
    {
      title: "Patient",
      dataIndex: ['patient', 'username'],
      key: "",
      width: 100
    },
    {
      title: "Doctor",
      dataIndex: ['doctor', 'username'],
      key: "",
      width: 100
    },
    {
      title: "Date",
      dataIndex: "appointment_date",
      key: "",
      width: 100
    },
    {
      title: "Token",
      dataIndex: "token_number",
      key: "",
      width: 100
    },
    {
      title: "Time",
      dataIndex: "appointment_start_time",
      key: "",
      width: 100
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "",
      width: 100,
      render: (_: any, record: any) => (
        <Badge
          variant={getStatusVariant(record.status)}
          className={`font-medium ${getStatusColor(record.status)}`}
        >
          {record.status}
        </Badge>
      )
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: any) => (
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-2">
            {record.status !== "SCHEDULED" && (
              <Select
                value={record.status}
                onValueChange={(status: Appointment["status"]) =>
                  handleUpdateStatus(record.id, status)
                }
                disabled={loadingActionId === record.id}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CANCELED">CANCELED</SelectItem>
                  <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                  <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
                </SelectContent>
              </Select>
            )}

            <div className="flex gap-1 ml-2">
              <ActionButton
                icon={<Eye className="w-4 h-4" />}
                label="View Details"
                onClick={() => handleView(record)}
                loading={loadingActionId === record.id}
              />

              <ActionButton
                icon={<Edit className="w-4 h-4" />}
                label="Edit Appointment"
                onClick={() => handleEdit(record)}
                loading={loadingActionId === record.id}
              />

              <ActionButton
                icon={<Trash2 className="w-4 h-4 text-red-500" />} // 🔴 Red by default
                label="Delete Appointment"
                onClick={() => handleDeleteClick(record)}
                loading={loadingActionId === record.id}
              />

            </div>
          </div>
        </TableCell>
      ),
    },
  ];

  const handleTableChange = (newPagination: any) => {
    loadData(newPagination.current, newPagination.pageSize);
  };

  // if (loading && appointments.length === 0) {
  //   return <FullscreenLoader />;
  // }

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
                Manage and track all patient appointments
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/appointments/calendar")}
                className="h-12 px-6"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar View
              </Button>
              <Button
                onClick={() => navigate("/appointments/book")}
                className="h-12 px-6 text-base font-medium"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Appointments</p>
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
                  <p className="text-sm font-medium text-gray-600">CANCELED</p>
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
                  <p className="text-sm font-medium text-gray-600">CONFIRMED</p>
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
                  <p className="text-sm font-medium text-gray-600">SCHEDULED</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Stethoscope className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                <AntInput.Search
                  placeholder="Search patients, doctors, or dates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                  onSearch={() => { loadData(pagination.current, pagination.pageSize, searchTerm) }}
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
                  <SelectItem value="CANCELED">CANCELED</SelectItem>
                  <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                  <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
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
            Appointments ({filteredAppointments.length})
          </CardTitle>
          <CardDescription>
            Manage appointment status and view details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {loading ? (
              <div className="p-6">
                <TableSkeleton />
              </div>
            ) : (
              <AntdTable
                dataSource={filteredAppointments}
                columns={columns}
                rowKey={"id"}
                pagination={
                  {
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} RECEPTIONISTs`,
                  }
                }
                onChange={handleTableChange}
                scroll={{ x: 1000 }}
                loading={false} // We handle loading ourselves with skeleton
              />
              // <Table>
              //   <TableHeader>
              //     <TableRow className="bg-gray-50 hover:bg-gray-50">
              //       <TableHead className="font-semibold">Patient</TableHead>
              //       <TableHead className="font-semibold">Doctor</TableHead>
              //       <TableHead className="font-semibold">Date</TableHead>
              //       <TableHead className="font-semibold">Time</TableHead>
              //       <TableHead className="font-semibold">Status</TableHead>
              //       <TableHead className="font-semibold text-right">Actions</TableHead>
              //     </TableRow>
              //   </TableHeader>
              //   <TableBody>
              //     {filteredAppointments.length === 0 ? (
              //       <TableRow>
              //         <TableCell colSpan={6} className="text-center py-8">
              //           <div className="flex flex-col items-center justify-center">
              //             <Calendar className="w-12 h-12 text-gray-300 mb-2" />
              //             <p className="text-gray-500 text-lg">No appointments found</p>
              //             <p className="text-gray-400 text-sm">
              //               {searchTerm || statusFilter !== "all"
              //                 ? "Try adjusting your search or filters"
              //                 : "Create your first appointment"
              //               }
              //             </p>
              //           </div>
              //         </TableCell>
              //       </TableRow>
              //     ) : (
              //       filteredAppointments.map(app => (
              //         <TableRow key={app.id} className="hover:bg-gray-50">
              //           <TableCell className="font-medium">
              //             <div className="flex items-center gap-2">
              //               <User className="w-4 h-4 text-gray-400" />
              //               {app?.patient?.username || "N/A"}
              //             </div>
              //           </TableCell>
              //           <TableCell>
              //             <div className="flex items-center gap-2">
              //               <Stethoscope className="w-4 h-4 text-gray-400" />
              //               Dr. {app?.doctor?.username || "N/A"}
              //             </div>
              //           </TableCell>
              //           <TableCell>{app.appointment_date}</TableCell>
              //           <TableCell>{app.appointment_start_time}</TableCell>
              //           <TableCell>
              //             <Badge
              //               variant={getStatusVariant(app.status)}
              //               className={`font-medium ${getStatusColor(app.status)}`}
              //             >
              //               {app.status}
              //             </Badge>
              //           </TableCell>
              //           <TableCell className="text-right">
              //             <div className="flex items-center justify-end gap-2">
              //               {app.status !== "SCHEDULED" && (
              //                 <Select
              //                   value={app.status}
              //                   onValueChange={(status: Appointment["status"]) =>
              //                     handleUpdateStatus(app.id, status)
              //                   }
              //                   disabled={loadingActionId === app.id}
              //                 >
              //                   <SelectTrigger className="w-[140px]">
              //                     <SelectValue />
              //                   </SelectTrigger>
              //                   <SelectContent>
              //                     <SelectItem value="CANCELED">CANCELED</SelectItem>
              //                     <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
              //                     <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
              //                   </SelectContent>
              //                 </Select>
              //               )}

              //               <div className="flex gap-1 ml-2">
              //                 <ActionButton
              //                   icon={<Eye className="w-4 h-4" />}
              //                   label="View Details"
              //                   onClick={() => handleView(app)}
              //                   loading={loadingActionId === app.id}
              //                 />

              //                 <ActionButton
              //                   icon={<Edit className="w-4 h-4" />}
              //                   label="Edit Appointment"
              //                   onClick={() => handleEdit(app)}
              //                   loading={loadingActionId === app.id}
              //                 />

              //                 <ActionButton
              //                   icon={<Trash2 className="w-4 h-4 text-red-500" />} // 🔴 Red by default
              //                   label="Delete Appointment"
              //                   onClick={() => handleDeleteClick(app)}
              //                   loading={loadingActionId === app.id}
              //                 />

              //               </div>
              //             </div>
              //           </TableCell>
              //         </TableRow>
              //       ))
              //     )}
              //   </TableBody>
              // </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Appointment Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Appointment Details
            </DialogTitle>
            <DialogDescription>
              View appointment information and details
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Patient</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{selectedAppointment.patient?.username || "N/A"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Doctor</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Stethoscope className="w-4 h-4 text-gray-500" />
                    <span>Dr. {selectedAppointment.doctor?.username || "N/A"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Date</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{selectedAppointment.appointment_date}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Time</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{selectedAppointment.appointment_start_time}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Status</Label>
                <Badge
                  variant={getStatusVariant(selectedAppointment.status)}
                  className={`font-medium text-sm ${getStatusColor(selectedAppointment.status)}`}
                >
                  {selectedAppointment.status}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewModalOpen(false)}
            >
              Close
            </Button>
            {/* <Button
              onClick={() => {
                setViewModalOpen(false);
                handleEdit(selectedAppointment!);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Appointment
            </Button> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit Appointment
            </DialogTitle>
            <DialogDescription>
              Update appointment details and information
            </DialogDescription>
          </DialogHeader>

          {isSubmitting ? (
            <FormSkeleton />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    Date
                  </Label>
                  <Input
                    type="date"
                    value={form.appointment_date}
                    onChange={(e) => handleChange("appointment_date", e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    Start Time
                  </Label>
                  <Input
                    type="time"
                    value={form.appointment_start_time}
                    onChange={(e) => handleChange("appointment_start_time", e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CANCELED">CANCELED</SelectItem>
                    <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                    <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false);
                setSelectedAppointment(null);
                setForm({
                  id: "",
                  patient_id: "",
                  doctor_id: "",
                  appointment_date: "",
                  appointment_start_time: "",
                  status: ""
                });
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-32"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Appointment
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-3 p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="font-medium">{selectedAppointment.patient?.username || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-gray-600" />
                <span>Dr. {selectedAppointment.doctor?.username || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span>{selectedAppointment.appointment_date} at {selectedAppointment.appointment_start_time}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={loadingActionId === selectedAppointment?.id}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loadingActionId === selectedAppointment?.id}
              className="min-w-32"
            >
              {loadingActionId === selectedAppointment?.id ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}