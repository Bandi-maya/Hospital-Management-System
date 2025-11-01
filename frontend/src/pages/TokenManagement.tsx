import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DeleteApi, DownloadApi, getApi, PutApi } from "@/ApiService";
import { Search, PlusCircle, Calendar, User, Stethoscope, Clock, Filter, Download, Edit, Eye, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Label } from "@/components/ui/label";
import { Input as AntInput, Popconfirm, Button as AntdButton, Tooltip as AntdTooltip, Space, Typography, Table as AntdTable } from "antd";
import { motion } from "framer-motion";
import { SearchOutlined } from "@ant-design/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { message, Modal } from "antd";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Appointment {
  id: string;
  patient: any;
  doctor: any;
  token_number?: any;
  appointment_date: string;
  appointment_start_time: string;
  status: "Pending" | "Confirmed" | "Completed" | "Alloted";
  patient_id?: string;
  doctor_id?: string;
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
        {[...Array(2)].map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
);

const ActionButton = ({
  icon,
  label,
  type = "default",
  danger = false,
  onClick,
  loading = false,
  confirm = false,
  confirmAction
}: {
  icon: React.ReactNode;
  label: string;
  type?: "primary" | "default" | "dashed" | "link" | "text";
  danger?: boolean;
  onClick?: () => void;
  loading?: boolean;
  confirm?: boolean;
  confirmAction?: () => void;
}) => {
  const button = (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 250 }}
    >
      <AntdTooltip title={label} placement="top">
        <AntdButton
          type={type}
          danger={danger}
          icon={icon}
          loading={loading}
          onClick={onClick}
          className={`
            flex items-center justify-center 
            transition-all duration-300 ease-in-out
            ${!danger && type !== 'primary' ?
              'text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-gray-300 hover:border-blue-300' : ''
            }
            ${danger ?
              'hover:text-red-600 hover:bg-red-50 border-gray-300 hover:border-red-300' : ''
            }
            w-10 h-10 rounded-full
          `}
          style={{
            minWidth: '40px',
            border: '1px solid #d9d9d9'
          }}
        />
      </AntdTooltip>
    </motion.div>
  );

  return confirm ? (
    <Popconfirm
      title="Are you sure?"
      onConfirm={confirmAction}
      okText="Yes"
      cancelText="No"
      placement="top"
    >
      {button}
    </Popconfirm>
  ) : (
    button
  );
};

export default function TokenManagement() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<any>(null);
  const [form, setForm] = useState({
    id: "",
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    status: "",
  });
  const { hasPermission } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [data, setData] = useState<any>({});

  // Export function
  const exportTokens = async (format: string = 'csv'): Promise<void> => {
    try {
      await DownloadApi(`/export?type=tokens&format=${format}`, format, 'tokens');
      toast.success(`Tokens exported successfully as ${format.toUpperCase()}`);
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Something went wrong while exporting.');
    }
  };

  const handleDeleteClick = (app: any) => {
    Modal.confirm({
      title: "Are you sure you want to delete this token?",
      content: `Token ID: ${app.id}`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteToken(app.id);
          message.success("Token deleted successfully!");
        } catch (error) {
          console.error("Delete error:", error);
          message.error("Failed to delete token.");
        }
      },
    });
  };

  const deleteToken = async (id: string) => {
    setLoadingActionId(id);
    try {
      const data = await DeleteApi(`/tokens`, { id });
      if (!data?.error) {
        toast.success("Token deleted successfully!");
        loadData(pagination.current, pagination.pageSize);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error deleting token");
      console.error("Error deleting token:", error);
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    PutApi(`/tokens`, form)
      .then((res) => {
        if (!res?.error) {
          toast.success("Token updated successfully!");
          setEditModalOpen(false);
          setAppointment(null);
          setForm({
            id: "",
            patient_id: "",
            doctor_id: "",
            appointment_date: "",
            status: ""
          });
          loadData();
        } else {
          toast.error(res?.error || "Update failed");
        }
      })
      .catch(() => toast.error("Error updating token"))
      .finally(() => setIsSubmitting(false));
  };

  const loadData = (page = 1, limit = 10, searchQuery = searchTerm, status = statusFilter) => {
    setLoading(true);
    getApi(`/tokens?page=${page}&limit=${limit}&q=${searchQuery}&status=${status === 'all' ? "" : status}`)
      .then((data) => {
        if (!data.error) {
          setData(data)
          setAppointments(data.data);
          setPagination(prev => ({
            ...prev,
            current: page,
            pageSize: limit,
            total: data.total || data.data.length
          }));
        } else {
          toast.error(data.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Error occurred while getting tokens");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadData(1, pagination.pageSize, searchTerm, statusFilter);
  }, [statusFilter]);

  const assignToDoctor = (record: any) => {
    setLoadingActionId(record.id);
    const date = new Date(record.appointment_date);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    const updatedRecord = { ...record };
    delete updatedRecord.updated_at;
    delete updatedRecord.created_at;
    delete updatedRecord.patient;
    delete updatedRecord.doctor;

    const formattedDate = `${yyyy}-${mm}-${dd}`;
    PutApi("/tokens", { ...updatedRecord, doctor_id: user?.id, appointment_date: formattedDate })
      .then((data) => {
        if (!data.error) {
          toast.success("Token assigned to you successfully!");
          loadData();
        } else {
          toast.error(data.error);
        }
      }).catch(() => {
        toast.error("Error occurred while assigning to doctor");
      })
      .finally(() => {
        setLoadingActionId(null);
      });
  };

  const handleUpdateStatus = (id: string, status: Appointment["status"]) => {
    setLoadingActionId(id);
    PutApi(`/tokens`, { id, status })
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
    setAppointment(appointment);
    setViewModalOpen(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setAppointment(appointment);
    setForm({
      id: appointment.id,
      patient_id: appointment.patient_id || "",
      doctor_id: appointment.doctor_id || "",
      appointment_date: appointment.appointment_date.split("T")[0],
      status: appointment.status,
    });
    setEditModalOpen(true);
  };

  const filteredAppointments = appointments
  // .filter(app => {
  //   const matchesSearch =
  //     app.patient?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     app.doctor?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     app.token_number?.toString().includes(searchTerm);

  //   const matchesStatus = statusFilter === "all" || app.status === statusFilter;

  //   return matchesSearch && matchesStatus;
  // });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Completed": return "default";
      case "Alloted": return "secondary";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "text-green-600 bg-green-50 border-green-200";
      case "Alloted": return "text-blue-600 bg-blue-50 border-blue-200";
      case "Pending": return "text-orange-600 bg-orange-50 border-orange-200";
      case "Confirmed": return "text-purple-600 bg-purple-50 border-purple-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  console.log(user)

  const handleTableChange = (newPagination: any) => {
    loadData(newPagination.current, newPagination.pageSize);
  };

  const handleSearch = () => {
    loadData(1, pagination.pageSize, searchTerm);
  };

  const stats = {
    total: data?.total_records,
    pending: data?.pending_records,
    confirmed: data?.confirmed_records,
    completed: data?.completed_records,
    alloted: data?.alloted_records,
  };

  const columns = [
    {
      title: "Patient",
      dataIndex: ['patient', 'username'],
      key: "patient",
      width: 100,
      render: (username: string) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          {username || "N/A"}
        </div>
      )
    },
    {
      title: "Doctor",
      dataIndex: ['doctor', 'username'],
      key: "doctor",
      width: 100,
      render: (username: string) => (
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-gray-400" />
          {username ? `Dr. ${username}` : "Not Assigned"}
        </div>
      )
    },
    {
      title: "Date",
      dataIndex: "appointment_date",
      key: "appointment_date",
      width: 100,
      render: (date: string) => date.split("T")[0]
    },
    {
      title: "Token",
      dataIndex: "token_number",
      key: "token_number",
      width: 100,
      render: (token: number) => (
        <Badge variant="outline" className="font-mono font-bold">
          #{token}
        </Badge>
      )
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Badge
          variant={getStatusVariant(status)}
          className={`font-medium ${getStatusColor(status)}`}
        >
          {status}
        </Badge>
      )
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: any, record: Appointment) => (
        hasPermission(['tokens:edit']) && <div className="flex items-center justify-end gap-2">
          {!record?.doctor_id && record?.['department_id'] == user?.['department_id'] && (
            <Button
              onClick={() => assignToDoctor(record)}
              disabled={loadingActionId === record.id}
              size="sm"
            >
              {loadingActionId === record.id ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                  Assigning...
                </>
              ) : (
                "Assign to me"
              )}
            </Button>
          )}

          <div className="flex gap-1 ml-2">
            <ActionButton
              icon={<Eye className="w-4 h-4" />}
              label="View Details"
              onClick={() => handleView(record)}
            />

            <ActionButton
              icon={<Edit className="w-4 h-4" />}
              label="Edit Token"
              onClick={() => handleEdit(record)}
            />

            <ActionButton
              icon={<Trash2 className="w-4 h-4" />}
              label="Delete Token"
              danger
              onClick={() => handleDeleteClick(record)}
              loading={loadingActionId === record.id}
            />

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
                <SelectItem value="Alloted">Alloted</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
  ];

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

            {
              hasPermission(['tokens:add']) &&
              <Button
                onClick={() => navigate("/tokens/create")}
                className="h-12 px-6 text-base font-medium"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Token
              </Button>
            }
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                  <p className="text-sm font-medium text-gray-600">Alloted</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.alloted}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Stethoscope className="w-4 h-4 text-purple-600" />
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
                <AntInput
                  placeholder="Search by patient, doctor, or token number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onPressEnter={handleSearch}
                  className="pl-10 h-12"
                  suffix={
                    <AntdButton
                      type="text"
                      icon={<SearchOutlined />}
                      onClick={handleSearch}
                    />
                  }
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
                  <SelectItem value="Alloted">Alloted</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => exportTokens()} variant="outline" className="h-12 px-6">
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
            {loading ? (
              <div className="p-6">
                <TableSkeleton />
              </div>
            ) : (
              <AntdTable
                dataSource={filteredAppointments}
                columns={columns}
                rowKey="id"
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} tokens`,
                }}
                onChange={handleTableChange}
                scroll={{ x: 1000 }}
                loading={loading}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Token Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Token Details
            </DialogTitle>
            <DialogDescription>
              View token information and details
            </DialogDescription>
          </DialogHeader>

          {appointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Patient</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{appointment.patient?.username || "N/A"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Doctor</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Stethoscope className="w-4 h-4 text-gray-500" />
                    <span>{appointment.doctor ? `Dr. ${appointment.doctor.username}` : "Not Assigned"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Date</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{appointment.appointment_date.split("T")[0]}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Token Number</Label>
                  <div className="p-2 bg-gray-50 rounded">
                    <Badge variant="outline" className="font-mono font-bold text-lg">
                      #{appointment.token_number}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Time</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{appointment.appointment_start_time}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Status</Label>
                <Badge
                  variant={getStatusVariant(appointment.status)}
                  className={`font-medium text-sm ${getStatusColor(appointment.status)}`}
                >
                  {appointment.status}
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
            <Button
              onClick={() => {
                setViewModalOpen(false);
                handleEdit(appointment);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Token Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit Token
            </DialogTitle>
            <DialogDescription>
              Update token details and information
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
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Alloted">Alloted</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
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
                setAppointment(null);
                setForm({
                  id: "",
                  patient_id: "",
                  doctor_id: "",
                  appointment_date: "",
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
    </div>
  );
}