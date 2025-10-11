import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Select, DatePicker, TimePicker, Table, Space, Modal, Form } from "antd";
import { getApi, PostApi, PutApi, DeleteApi } from "@/ApiService";
import { Search, PlusCircle, User, Scissors, Calendar, Clock, MapPin, Edit, Trash2, Filter, Download, Eye } from "lucide-react";
import dayjs from "dayjs";
import TextArea from "antd/es/input/TextArea";

const { Option } = Select;
// const { TextArea } = Input;

interface Surgery {
    id: number;
    patient_id: number;
    surgery_type_id: number;
    operation_theatre_id: number;
    scheduled_start_time: string;
    scheduled_end_time: string;
    actual_start_time: string;
    actual_end_time: string;
    status: string;
    notes: string;
    created_at: string;
    updated_at: string;
    patient?: {
        name: string;
        user?: {
            name: string;
        };
    };
    surgery_type?: {
        name: string;
    };
    operation_theatre?: {
        name: string;
        location: string;
    };
    surgery_doctors?: Array<{
        doctor: {
            id: any;
            name: string;
        };
        role: string;
    }>;
}

interface SurgeryType {
    id: number;
    name: string;
    description: string;
    duration: number;
}

interface OperationTheatre {
    id: number;
    name: string;
    location: string;
    status: string;
}

interface Patient {
    id: number;
    name: string;
    user?: {
        name: string;
    };
}

interface Doctor {
    id: number;
    name: string;
}

const SURGERY_STATUS = {
    SCHEDULED: "Scheduled",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled"
};

const SURGEON_ROLES = [
    "Lead Surgeon",
    "Assistant Surgeon",
    "Anesthesiologist",
    "Nurse",
    "Technician"
];

export default function SurgeryList() {
    const [surgeries, setSurgeries] = useState<Surgery[]>([]);
    const [surgeryTypes, setSurgeryTypes] = useState<SurgeryType[]>([]);
    const [operationTheatres, setOperationTheatres] = useState<OperationTheatre[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [form] = Form.useForm();

    // Form state
    const [formData, setFormData] = useState({
        patient_id: "",
        surgery_type_id: "",
        operation_theatre_id: "",
        scheduled_start_time: null,
        scheduled_end_time: null,
        status: "SCHEDULED",
        notes: "",
        surgery_doctors: [] as Array<{ doctor_id: string; role: string }>
    });

    // Load all data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);
        Promise.all([
            getApi('/surgery'),
            getApi('/surgery-type'),
            getApi('/operation-theatre'),
            getApi('/users?user_type=PATIENT'),
            getApi('/users?user_type=DOCTOR') // Doctors
        ]).then(([surgeriesData, typesData, theatresData, patientsData, doctorsData]) => {
            if (!surgeriesData?.error) setSurgeries(surgeriesData);
            if (!typesData?.error) setSurgeryTypes(typesData);
            if (!theatresData?.error) setOperationTheatres(theatresData);
            if (!patientsData?.error) setPatients(patientsData);
            if (!doctorsData?.error) setDoctors(doctorsData);
        }).catch(error => {
            toast.error("Failed to load data");
            console.error("Error loading data:", error);
        }).finally(() => setLoading(false));
    };

    const handleOpenModal = (surgery: Surgery | null = null) => {
        if (surgery) {
            setSelectedSurgery(surgery);
            setFormData({
                patient_id: surgery.patient_id.toString(),
                surgery_type_id: surgery.surgery_type_id.toString(),
                operation_theatre_id: surgery.operation_theatre_id?.toString() || "",
                scheduled_start_time: dayjs(surgery.scheduled_start_time),
                scheduled_end_time: surgery.scheduled_end_time ? dayjs(surgery.scheduled_end_time) : null,
                status: surgery.status,
                notes: surgery.notes || "",
                surgery_doctors: surgery.surgery_doctors?.map(sd => ({
                    doctor_id: sd.doctor.id.toString(),
                    role: sd.role
                })) || []
            });
        } else {
            setSelectedSurgery(null);
            setFormData({
                patient_id: "",
                surgery_type_id: "",
                operation_theatre_id: "",
                scheduled_start_time: null,
                scheduled_end_time: null,
                status: "SCHEDULED",
                notes: "",
                surgery_doctors: []
            });
        }
        setIsModalOpen(true);
    };

    const handleViewSurgery = (surgery: Surgery) => {
        setSelectedSurgery(surgery);
        setIsViewModalOpen(true);
    };

    const handleSubmit = () => {
        form.validateFields().then(values => {
            const submitData = {
                ...formData,
                scheduled_start_time: formData.scheduled_start_time?.toISOString(),
                scheduled_end_time: formData.scheduled_end_time?.toISOString(),
            };

            if (selectedSurgery) {
                // Update surgery
                PutApi(`/surgery`, {...submitData, id: selectedSurgery.id})
                    .then(data => {
                        if (!data?.error) {
                            toast.success("Surgery updated successfully!");
                            loadData();
                            setSelectedSurgery(null)
                            setIsModalOpen(false);
                        } else {
                            toast.error(data.error);
                        }
                    })
                    .catch(error => {
                        toast.error("Error updating surgery");
                        console.error("Error updating surgery:", error);
                    });
            } else {
                // Create new surgery
                PostApi('/surgery', submitData)
                    .then(data => {
                        if (!data?.error) {
                            toast.success("Surgery created successfully!");
                            loadData();
                            setIsModalOpen(false);
                        } else {
                            toast.error(data.error);
                        }
                    })
                    .catch(error => {
                        toast.error("Error creating surgery");
                        console.error("Error creating surgery:", error);
                    });
            }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this surgery?")) {
            DeleteApi(`/surgeries/${id}`)
                .then(data => {
                    if (!data?.error) {
                        toast.success("Surgery deleted successfully!");
                        loadData();
                    } else {
                        toast.error(data.error);
                    }
                })
                .catch(error => {
                    toast.error("Error deleting surgery");
                    console.error("Error deleting surgery:", error);
                });
        }
    };

    const handleStatusChange = (surgeryId: number, newStatus: string) => {
        PutApi(`/surgeries/${surgeryId}`, { status: newStatus })
            .then(data => {
                if (!data?.error) {
                    toast.success(`Surgery status updated to ${newStatus}`);
                    loadData();
                } else {
                    toast.error(data.error);
                }
            })
            .catch(error => {
                toast.error("Error updating surgery status");
                console.error("Error updating surgery status:", error);
            });
    };

    const addSurgeon = () => {
        setFormData(prev => ({
            ...prev,
            surgery_doctors: [...prev.surgery_doctors, { doctor_id: "", role: "" }]
        }));
    };

    const updateSurgeon = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            surgery_doctors: prev.surgery_doctors.map((sd, i) =>
                i === index ? { ...sd, [field]: value } : sd
            )
        }));
    };

    const removeSurgeon = (index: number) => {
        setFormData(prev => ({
            ...prev,
            surgery_doctors: prev.surgery_doctors.filter((_, i) => i !== index)
        }));
    };

    const filteredSurgeries = surgeries.filter(surgery => {
        const matchesSearch = surgery
            // surgery.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
            // surgery.surgery_type?.name?.toLowerCase().includes(search.toLowerCase()) ||
            // surgery.operation_theatre?.name?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === "all" || surgery.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "SCHEDULED": return "blue";
            case "IN_PROGRESS": return "orange";
            case "COMPLETED": return "green";
            case "CANCELLED": return "red";
            default: return "gray";
        }
    };

    const columns = [
        {
            title: "Patient",
            dataIndex: ["patient", "name"],
            key: "patient",
            render: (text: string, record: Surgery) => (
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{text}</span>
                </div>
            ),
        },
        {
            title: "Surgery Type",
            dataIndex: ["surgery_type", "name"],
            key: "surgery_type",
        },
        {
            title: "Operation Theatre",
            dataIndex: ["operation_theatre", "name"],
            key: "operation_theatre",
            render: (text: string, record: Surgery) => (
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{text}</span>
                </div>
            ),
        },
        {
            title: "Scheduled Time",
            key: "scheduled_time",
            render: (record: Surgery) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{dayjs(record.scheduled_start_time).format("MMM D, YYYY")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{dayjs(record.scheduled_start_time).format("h:mm A")}</span>
                    </div>
                </div>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Badge
                    variant="outline"
                    className={`
            ${status === "SCHEDULED" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
            ${status === "IN_PROGRESS" ? "bg-orange-50 text-orange-700 border-orange-200" : ""}
            ${status === "COMPLETED" ? "bg-green-50 text-green-700 border-green-200" : ""}
            ${status === "CANCELLED" ? "bg-red-50 text-red-700 border-red-200" : ""}
          `}
                >
                    {SURGERY_STATUS[status as keyof typeof SURGERY_STATUS] || status}
                </Badge>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (record: Surgery) => (
                <Space size="small">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewSurgery(record)}
                        className="h-8 w-8 p-0"
                    >
                        <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenModal(record)}
                        className="h-8 w-8 p-0"
                    >
                        <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(record.id)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </Space>
            ),
        },
    ];

    console.log(formData)

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Surgery Management</h1>
                        <p className="text-gray-600 mt-1 text-base">Manage and track all surgical procedures</p>
                    </div>
                    <Button
                        onClick={() => handleOpenModal()}
                        className="h-12 px-6 text-base font-medium bg-blue-600 hover:bg-blue-700 shrink-0"
                        size="lg"
                    >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Schedule Surgery
                    </Button>
                </div>
            </div>

            {/* Filters Card */}
            <Card className="bg-white border-0 shadow-sm rounded-xl mb-6">
                <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                        <div className="flex-1 w-full">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search surgeries by patient, type, or theatre..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 h-12 w-full text-base border-gray-300 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="w-full lg:w-48">
                            <Select
                                value={statusFilter}
                                onChange={setStatusFilter}
                                className="w-full h-12 [&_.ant-select-selector]:h-12 [&_.ant-select-selection-item]:leading-10"
                                placeholder="All Status"
                            >
                                <Option value="all">All Status</Option>
                                <Option value="SCHEDULED">Scheduled</Option>
                                <Option value="IN_PROGRESS">In Progress</Option>
                                <Option value="COMPLETED">Completed</Option>
                                <Option value="CANCELLED">Cancelled</Option>
                            </Select>
                        </div>
                        <Button variant="outline" className="h-12 px-6 border-gray-300 hover:bg-gray-50 w-full lg:w-auto">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Surgeries Table */}
            <Card className="bg-white border-0 shadow-sm rounded-xl">
                <CardHeader className="px-6 py-5 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-xl font-semibold text-gray-900">Scheduled Surgeries</CardTitle>
                            <CardDescription className="text-gray-600 mt-1">
                                {filteredSurgeries.length} surgery{filteredSurgeries.length !== 1 ? 'ies' : ''} found
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <Table
                            dataSource={filteredSurgeries}
                            columns={columns}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Surgery Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-3">
                        <Scissors className="w-5 h-5 text-blue-600" />
                        <span>{selectedSurgery ? "Edit Surgery" : "Schedule New Surgery"}</span>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSubmit}
                width={800}
                okText={selectedSurgery ? "Update Surgery" : "Schedule Surgery"}
                cancelText="Cancel"
            >
                <Form form={form} layout="vertical" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            label="Patient"
                            // name="patient_id"
                            rules={[{ required: true, message: "Please select a patient" }]}
                        >
                            <Select
                                placeholder="Select patient"
                                value={formData.patient_id}
                                onChange={(value) => setFormData(prev => ({ ...prev, patient_id: value }))}
                            >
                                {patients.map(patient => (
                                    <Option key={patient.id} value={patient.id.toString()}>
                                        {patient.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Surgery Type"
                            // name="surgery_type_id"
                            rules={[{ required: true, message: "Please select surgery type" }]}
                        >
                            <Select
                                placeholder="Select surgery type"
                                value={formData.surgery_type_id}
                                onChange={(value) => setFormData(prev => ({ ...prev, surgery_type_id: value }))}
                            >
                                {surgeryTypes.map(type => (
                                    <Option key={type.id} value={type.id.toString()}>
                                        {type.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            label="Operation Theatre"
                            // name="operation_theatre_id"
                        >
                            <Select
                                placeholder="Select operation theatre"
                                value={formData.operation_theatre_id}
                                onChange={(value) => setFormData(prev => ({ ...prev, operation_theatre_id: value }))}
                            >
                                {operationTheatres.map(theatre => (
                                    <Option key={theatre.id} value={theatre.id.toString()}>
                                        {theatre.name} - {theatre.location}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Status"
                            // name="status"
                        >
                            <Select
                                value={formData.status}
                                onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                            >
                                <Option value="SCHEDULED">Scheduled</Option>
                                <Option value="IN_PROGRESS">In Progress</Option>
                                <Option value="COMPLETED">Completed</Option>
                                <Option value="CANCELLED">Cancelled</Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            label="Scheduled Start Time"
                            // name="scheduled_start_time"
                            rules={[{ required: true, message: "Please select start time" }]}
                        >
                            <DatePicker
                                showTime
                                value={formData.scheduled_start_time}
                                onChange={(value) => setFormData(prev => ({ ...prev, scheduled_start_time: value }))}
                                className="w-full"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Scheduled End Time"
                            // name="scheduled_end_time"
                        >
                            <DatePicker
                                showTime
                                value={formData.scheduled_end_time}
                                onChange={(value) => setFormData(prev => ({ ...prev, scheduled_end_time: value }))}
                                className="w-full"
                            />
                        </Form.Item>
                    </div>

                    <Form.Item label="Surgical Team">
                        <div className="space-y-3">
                            {formData.surgery_doctors.map((surgeon, index) => (
                                <div key={index} className="flex gap-2">
                                    <Select
                                        placeholder="Select doctor"
                                        value={surgeon.doctor_id}
                                        onChange={(value) => updateSurgeon(index, "doctor_id", value)}
                                        className="flex-1"
                                    >
                                        {doctors.map(doctor => (
                                            <Option key={doctor.id} value={doctor.id.toString()}>
                                                {doctor.name}
                                            </Option>
                                        ))}
                                    </Select>
                                    <Select
                                        placeholder="Role"
                                        value={surgeon.role}
                                        onChange={(value) => updateSurgeon(index, "role", value)}
                                        className="w-32"
                                    >
                                        {SURGEON_ROLES.map(role => (
                                            <Option key={role} value={role}>{role}</Option>
                                        ))}
                                    </Select>
                                    <Button
                                        // danger
                                        onClick={() => removeSurgeon(index)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button onClick={addSurgeon} className="w-full">
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Add Surgeon
                            </Button>
                        </div>
                    </Form.Item>

                    <Form.Item label="Notes">
                        <TextArea
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Additional notes about the surgery..."
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Surgery Modal */}
            <Modal
                title="Surgery Details"
                open={isViewModalOpen}
                onCancel={() => setIsViewModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalOpen(false)}>
                        Close
                    </Button>
                ]}
                width={600}
            >
                {selectedSurgery && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="font-semibold">Patient</Label>
                                <p>{selectedSurgery.patient?.name}</p>
                            </div>
                            <div>
                                <Label className="font-semibold">Surgery Type</Label>
                                <p>{selectedSurgery.surgery_type?.name}</p>
                            </div>
                            <div>
                                <Label className="font-semibold">Operation Theatre</Label>
                                <p>{selectedSurgery.operation_theatre?.name}</p>
                            </div>
                            <div>
                                <Label className="font-semibold">Status</Label>
                                <Badge color={getStatusColor(selectedSurgery.status)}>
                                    {SURGERY_STATUS[selectedSurgery.status as keyof typeof SURGERY_STATUS]}
                                </Badge>
                            </div>
                            <div>
                                <Label className="font-semibold">Scheduled Start</Label>
                                <p>{dayjs(selectedSurgery.scheduled_start_time).format("MMM D, YYYY h:mm A")}</p>
                            </div>
                            <div>
                                <Label className="font-semibold">Scheduled End</Label>
                                <p>{selectedSurgery.scheduled_end_time ? dayjs(selectedSurgery.scheduled_end_time).format("MMM D, YYYY h:mm A") : "Not set"}</p>
                            </div>
                        </div>

                        {selectedSurgery.surgery_doctors && selectedSurgery.surgery_doctors.length > 0 && (
                            <div>
                                <Label className="font-semibold">Surgical Team</Label>
                                <div className="space-y-2 mt-2">
                                    {selectedSurgery.surgery_doctors.map((sd, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                            <span>{sd.doctor.name}</span>
                                            <Badge variant="outline">{sd.role}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedSurgery.notes && (
                            <div>
                                <Label className="font-semibold">Notes</Label>
                                <p className="mt-1 p-2 bg-gray-50 rounded">{selectedSurgery.notes}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}