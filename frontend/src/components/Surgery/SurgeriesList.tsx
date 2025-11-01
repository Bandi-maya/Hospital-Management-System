import React, { useState, useEffect } from "react";
import {
    Card,
    Input,
    Button,
    Tag,
    Select,
    DatePicker,
    TimePicker,
    Table,
    Space,
    Modal,
    Form,
    Row,
    Col,
    Divider,
    Skeleton,
    Avatar,
    List,
    Descriptions,
    Statistic,
    Progress,
    Badge as AntBadge,
    Tooltip,
    Dropdown,
    Menu,
    InputNumber
} from "antd";
import {
    SearchOutlined,
    PlusOutlined,
    UserOutlined,
    ScissorOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    EditOutlined,
    DeleteOutlined,
    FilterOutlined,
    DownloadOutlined,
    EyeOutlined,
    MoreOutlined,
    TeamOutlined,
    MedicineBoxOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    PlayCircleOutlined,
    ScheduleOutlined
} from "@ant-design/icons";
import { toast } from "sonner";
import { getApi, PostApi, PutApi, DeleteApi } from "@/ApiService";
import dayjs, { Dayjs } from "dayjs";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useAuth } from "@/hooks/useAuth";

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface User {
    name: string;
}

interface Patient {
    id: number;
    name: string;
    user?: User;
}

interface Doctor {
    id: number;
    name: string;
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

interface SurgeryDoctor {
    doctor: Doctor;
    role: string;
}

interface Surgery {
    id: number;
    patient_id: number;
    surgery_type_id: number;
    operation_theatre_id: number;
    price: number;
    scheduled_start_time: string;
    scheduled_end_time: string;
    actual_start_time: string;
    actual_end_time: string;
    status: string;
    notes: string;
    created_at: string;
    updated_at: string;
    patient?: Patient;
    surgery_type?: SurgeryType;
    operation_theatre?: OperationTheatre;
    surgery_doctors?: SurgeryDoctor[];
}

interface OrderSurgery {
    id: number;
    user_id: number;
    surgeries: Surgery[];
    surgery_doctors?: SurgeryDoctor[];
    user?: User;
}

interface FormData {
    patient_id: string;
    surgery_type_id: string;
    price: string | null;
    operation_theatre_id: string;
    scheduled_start_time: Dayjs | null;
    scheduled_end_time: Dayjs | null;
    status: string;
    notes: string;
    surgery_doctors: Array<{ doctor_id: string; role: string }>;
}

interface ApiResponse {
    error?: string;
    data?: any;
    total_records?: number;
}

interface Pagination {
    current: number;
    pageSize: number;
    total: number;
}

const SURGERY_STATUS: Record<string, string> = {
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
    const [surgeries, setSurgeries] = useState<OrderSurgery[]>([]);
    const [surgeryTypes, setSurgeryTypes] = useState<SurgeryType[]>([]);
    const [data, setData] = useState<any>({});
    const [operationTheatres, setOperationTheatres] = useState<OperationTheatre[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
    const [selectedSurgery, setSelectedSurgery] = useState<OrderSurgery | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [search, setSearch] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [form] = Form.useForm();
    const [pagination, setPagination] = useState<Pagination>({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const { hasPermission } = useAuth()

    // Form state
    const [formData, setFormData] = useState<FormData>({
        patient_id: "",
        surgery_type_id: "",
        price: null,
        operation_theatre_id: "",
        scheduled_start_time: null,
        scheduled_end_time: null,
        status: "SCHEDULED",
        notes: "",
        surgery_doctors: [] as Array<{ doctor_id: string; role: string }>
    });

    // Load all data
    useEffect(() => {
        fetchOrders();
        loadData();
    }, []);

    const fetchOrders = async (page: number = 1, limit: number = 10, searchQuery: string = search, status: string = statusFilter): Promise<void> => {
        setLoading(true);
        getApi(`/orders?order_type=surgery&page=${page}&limit=${limit}&q=${searchQuery}&status=${status === 'all' ? '' : status}`)
            .then((res: ApiResponse) => {
                if (!res.error) {
                    setData(res)
                    setSurgeries(res.data || []);
                    setPagination(prev => ({
                        ...prev,
                        current: page,
                        pageSize: limit,
                        total: res.total_records || 0,
                    }));
                } else {
                    toast.error("Failed to load orders.");
                }
            })
            .catch(() => toast.error("Server error while fetching orders"))
            .finally(() => setLoading(false));
    };

    const loadData = (): void => {
        setLoading(true);
        Promise.all([
            getApi('/surgery-type'),
            getApi('/operation-theatre'),
            getApi('/users?user_type=PATIENT'),
            getApi('/users?user_type=DOCTOR')
        ]).then(([typesData, theatresData, patientsData, doctorsData]: ApiResponse[]) => {
            if (!typesData?.error) setSurgeryTypes(typesData.data || []);
            if (!theatresData?.error) setOperationTheatres(theatresData.data || []);
            if (!patientsData?.error) setPatients(patientsData.data || []);
            if (!doctorsData?.error) setDoctors(doctorsData.data || []);
        }).catch((error: Error) => {
            toast.error("Failed to load data");
            console.error("Error loading data:", error);
        }).finally(() => setLoading(false));
    };

    const handleOpenModal = (surgery: OrderSurgery | null = null): void => {
        if (surgery) {
            form.setFieldValue("patient_id", surgery.user_id);
            form.setFieldValue('surgery_type_id', surgery.surgeries[0]?.surgery_type_id);
            form.setFieldValue('price', surgery.surgeries[0]?.price);
            form.setFieldValue('operation_theatre_id', surgery.surgeries[0]?.operation_theatre_id || "");
            form.setFieldValue('scheduled_start_time', surgery.surgeries[0]?.scheduled_start_time ? dayjs(surgery.surgeries[0].scheduled_start_time) : null);
            form.setFieldValue('scheduled_end_time', surgery.surgeries[0]?.scheduled_end_time ? dayjs(surgery.surgeries[0].scheduled_end_time) : null);
            form.setFieldValue('status', surgery.surgeries[0]?.status);
            form.setFieldValue('notes', surgery.surgeries[0]?.notes || "");
            setSelectedSurgery(surgery);

            setFormData({
                patient_id: surgery.user_id.toString(),
                surgery_type_id: surgery.surgeries[0]?.surgery_type_id?.toString() || "",
                price: surgery.surgeries[0]?.surgery_type_id?.toString() || null,
                operation_theatre_id: surgery.surgeries[0]?.operation_theatre_id?.toString() || "",
                scheduled_start_time: surgery.surgeries[0]?.scheduled_start_time ? dayjs(surgery.surgeries[0].scheduled_start_time) : null,
                scheduled_end_time: surgery.surgeries[0]?.scheduled_end_time ? dayjs(surgery.surgeries[0].scheduled_end_time) : null,
                status: surgery.surgeries[0]?.status || "SCHEDULED",
                notes: surgery.surgeries[0]?.notes || "",
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
                price: null,
                status: "SCHEDULED",
                notes: "",
                surgery_doctors: []
            });
        }
        setIsModalOpen(true);
    };

    const handleViewSurgery = (surgery: OrderSurgery): void => {
        setSelectedSurgery(surgery);
        setIsViewModalOpen(true);
    };

    const handleSubmit = (): void => {
        form.validateFields().then(values => {
            const submitData = {
                ...formData,
                scheduled_start_time: formData.scheduled_start_time?.toISOString(),
                scheduled_end_time: formData.scheduled_end_time?.toISOString(),
            };

            const payload = {
                user_id: formData.patient_id,
                surgeries: [
                    {
                        ...submitData
                    }
                ]
            };

            if (selectedSurgery) {
                PutApi(`/orders`, { ...payload, id: selectedSurgery.id })
                    .then((data: ApiResponse) => {
                        if (!data?.error) {
                            toast.success("Surgery updated successfully!");
                            fetchOrders();
                            setSelectedSurgery(null);
                            setIsModalOpen(false);
                        } else {
                            toast.error(data.error);
                        }
                    })
                    .catch((error: Error) => {
                        toast.error("Error updating surgery");
                        console.error("Error updating surgery:", error);
                    });
            } else {
                PostApi('/orders', payload)
                    .then((data: ApiResponse) => {
                        if (!data?.error) {
                            toast.success("Surgery created successfully!");
                            fetchOrders();
                            setIsModalOpen(false);
                        } else {
                            toast.error(data.error);
                        }
                    })
                    .catch((error: Error) => {
                        toast.error("Error creating surgery");
                        console.error("Error creating surgery:", error);
                    });
            }
        });
    };

    const handleDelete = (id: number): void => {
        Modal.confirm({
            title: 'Are you sure you want to delete this surgery?',
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk() {
                DeleteApi(`/surgeries/${id}`)
                    .then((data: ApiResponse) => {
                        if (!data?.error) {
                            toast.success("Surgery deleted successfully!");
                            loadData();
                        } else {
                            toast.error(data.error);
                        }
                    })
                    .catch((error: Error) => {
                        toast.error("Error deleting surgery");
                        console.error("Error deleting surgery:", error);
                    });
            }
        });
    };

    const handleStatusChange = (surgeryId: number, newStatus: string): void => {
        PutApi(`/surgeries/${surgeryId}`, { status: newStatus })
            .then((data: ApiResponse) => {
                if (!data?.error) {
                    toast.success(`Surgery status updated to ${newStatus}`);
                    loadData();
                } else {
                    toast.error(data.error);
                }
            })
            .catch((error: Error) => {
                toast.error("Error updating surgery status");
                console.error("Error updating surgery status:", error);
            });
    };

    const addSurgeon = (): void => {
        setFormData(prev => ({
            ...prev,
            surgery_doctors: [...prev.surgery_doctors, { doctor_id: "", role: "" }]
        }));
    };

    const updateSurgeon = (index: number, field: string, value: string): void => {
        setFormData(prev => ({
            ...prev,
            surgery_doctors: prev.surgery_doctors.map((sd, i) =>
                i === index ? { ...sd, [field]: value } : sd
            )
        }));
    };

    const removeSurgeon = (index: number): void => {
        setFormData(prev => ({
            ...prev,
            surgery_doctors: prev.surgery_doctors.filter((_, i) => i !== index)
        }));
    };

    const filteredSurgeries = surgeries.filter(surgery => {
        return surgery;
    });

    const getStatusColor = (status: string): string => {
        switch (status) {
            case "SCHEDULED": return "blue";
            case "IN_PROGRESS": return "orange";
            case "COMPLETED": return "green";
            case "CANCELLED": return "red";
            default: return "gray";
        }
    };

    const getStatusIcon = (status: string): React.ReactNode => {
        switch (status) {
            case "SCHEDULED": return <ScheduleOutlined />;
            case "IN_PROGRESS": return <PlayCircleOutlined />;
            case "COMPLETED": return <CheckCircleOutlined />;
            case "CANCELLED": return <CloseCircleOutlined />;
            default: return <ScheduleOutlined />;
        }
    };

    const columns: ColumnsType<OrderSurgery> = [
        {
            title: "Patient",
            dataIndex: ["user", "name"],
            key: "patient",
            render: (text: string) => (
                <div className="flex items-center gap-3">
                    <Avatar icon={<UserOutlined />} size="small" />
                    <span className="font-medium">{text}</span>
                </div>
            ),
        },
        {
            title: "Surgery Type",
            dataIndex: ['surgeries', 0, "surgery_type", "name"],
            key: "surgery_type",
            render: (text: string) => (
                <div className="flex items-center gap-2">
                    <ScissorOutlined className="text-gray-400" />
                    <span>{text}</span>
                </div>
            ),
        },
        {
            title: "Operation Theatre",
            dataIndex: ['surgeries', 0, "operation_theatre", "name"],
            key: "operation_theatre",
            render: (text: string, record: OrderSurgery) => (
                <div className="flex items-center gap-2">
                    <EnvironmentOutlined className="text-gray-400" />
                    <div>
                        <div>{text}</div>
                        <div className="text-xs text-gray-500">{record.surgeries[0]?.operation_theatre?.location}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Scheduled Time",
            key: "scheduled_time",
            render: (record: OrderSurgery) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <CalendarOutlined className="text-gray-400" />
                        <span>{record.surgeries[0]?.scheduled_start_time ? dayjs(record.surgeries[0].scheduled_start_time).format("MMM D, YYYY") : "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ClockCircleOutlined className="text-gray-400" />
                        <span>{record.surgeries[0]?.scheduled_start_time ? dayjs(record.surgeries[0].scheduled_start_time).format("h:mm A") : "N/A"}</span>
                    </div>
                </div>
            ),
        },
        {
            title: "Status",
            dataIndex: ['surgeries', 0, "status"],
            key: "status",
            render: (status: string) => (
                <AntBadge
                    count={SURGERY_STATUS[status] || status}
                    style={{
                        backgroundColor: getStatusColor(status),
                        color: 'white'
                    }}
                    className="px-2 py-1 rounded-full text-xs"
                />
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (record: OrderSurgery) => (
                hasPermission(['surgery:edit']) && <Space size="small">
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewSurgery(record)}
                            className="text-blue-600 hover:text-blue-800"
                        />
                    </Tooltip>
                    <Tooltip title="Edit Surgery">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleOpenModal(record)}
                            className="text-green-600 hover:text-green-800"
                        />
                    </Tooltip>
                    <Tooltip title="Delete Surgery">
                        <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-800"
                        />
                    </Tooltip>
                    <Dropdown
                        overlay={
                            <Menu>
                                <Menu.Item key="start" icon={<PlayCircleOutlined />}>
                                    Mark In Progress
                                </Menu.Item>
                                <Menu.Item key="complete" icon={<CheckCircleOutlined />}>
                                    Mark Completed
                                </Menu.Item>
                                <Menu.Item key="cancel" icon={<CloseCircleOutlined />}>
                                    Cancel Surgery
                                </Menu.Item>
                            </Menu>
                        }
                        trigger={['click']}
                    >
                        <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                </Space>
            ),
        },
    ];

    const SkeletonTable = () => (
        <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
                <Card key={item} className="p-4">
                    <Skeleton active paragraph={{ rows: 1 }} />
                </Card>
            ))}
        </div>
    );

    const handleTableChange = (newPagination: TablePaginationConfig): void => {
        if (newPagination.current && newPagination.pageSize) {
            fetchOrders(newPagination.current, newPagination.pageSize);
        }
    };

    const handleSearch = (): void => {
        fetchOrders(1, pagination.pageSize, search);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Surgery Management</h1>
                        <p className="text-gray-600 mt-1 text-base">Manage and track all surgical procedures</p>
                    </div>
                    {
                        hasPermission(['surgery:add']) &&
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleOpenModal()}
                            size="large"
                            className="h-12 px-6 text-base font-medium bg-blue-600 hover:bg-blue-700 shrink-0"
                        >
                            Schedule Surgery
                        </Button>
                    }
                </div>
            </div>

            {/* Filters Card */}
            <Card className="bg-white border-0 shadow-sm rounded-xl mb-6">
                <div className="p-5">
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={12} md={8}>
                            <Input.Search
                                placeholder="Search surgeries by patient, type, or theatre..."
                                prefix={<SearchOutlined />}
                                onSearch={handleSearch}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                size="large"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                value={statusFilter}
                                onChange={(value: string) => {
                                    setStatusFilter(value);
                                    fetchOrders(pagination.current, pagination.pageSize, search, value);
                                }}
                                placeholder="All Status"
                                size="large"
                                className="w-full"
                            >
                                <Option value="all">All Status</Option>
                                <Option value="SCHEDULED">Scheduled</Option>
                                <Option value="IN_PROGRESS">In Progress</Option>
                                <Option value="COMPLETED">Completed</Option>
                                <Option value="CANCELLED">Cancelled</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Button
                                icon={<DownloadOutlined />}
                                size="large"
                                className="w-full"
                            >
                                Export
                            </Button>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Button
                                icon={<FilterOutlined />}
                                size="large"
                                className="w-full"
                            >
                                More Filters
                            </Button>
                        </Col>
                    </Row>
                </div>
            </Card>

            {/* Statistics Row */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Total Surgeries"
                            value={data?.total_records || 0}
                            prefix={<ScissorOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Scheduled"
                            value={data?.total_pending_surgeries || 0}
                            prefix={<ScheduleOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="In Progress"
                            value={data?.total_in_progress_surgeries || 0}
                            prefix={<PlayCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Completed"
                            value={data?.total_completed_surgeries || 0}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Surgeries Table */}
            <Card
                className="bg-white border-0 shadow-sm rounded-xl"
                title={
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Scheduled Surgeries</h2>
                            <p className="text-gray-600 mt-1">
                                {filteredSurgeries.length} surgery{filteredSurgeries.length !== 1 ? 'ies' : ''} found
                            </p>
                        </div>
                    </div>
                }
            >
                <div className="p-6">
                    {loading ? (
                        <SkeletonTable />
                    ) : (
                        <Table
                            dataSource={filteredSurgeries}
                            columns={columns}
                            rowKey="id"
                            onChange={handleTableChange}
                            pagination={{
                                pageSize: pagination.pageSize,
                                current: pagination.current,
                                total: pagination.total,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} of ${total} items`
                            }}
                        />
                    )}
                </div>
            </Card>

            {/* Add/Edit Surgery Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-3">
                        <ScissorOutlined className="text-blue-600 text-lg" />
                        <span className="text-lg font-semibold">
                            {selectedSurgery ? "Edit Surgery" : "Schedule New Surgery"}
                        </span>
                    </div>
                }
                destroyOnClose
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSubmit}
                width={800}
                okText={selectedSurgery ? "Update Surgery" : "Schedule Surgery"}
                cancelText="Cancel"
                okButtonProps={{ size: 'large' }}
                cancelButtonProps={{ size: 'large' }}
            >
                <Form form={form} layout="vertical" className="space-y-4">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Patient"
                                name="patient_id"
                                rules={[{ required: true, message: "Please select a patient" }]}
                            >
                                <Select
                                    placeholder="Select patient"
                                    value={formData.patient_id}
                                    onChange={(value: string) => setFormData(prev => ({ ...prev, patient_id: value }))}
                                    size="large"
                                >
                                    {patients.map(patient => (
                                        <Option key={patient.id} value={patient.id}>
                                            {patient.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Surgery Type"
                                name="surgery_type_id"
                                rules={[{ required: true, message: "Please select surgery type" }]}
                            >
                                <Select
                                    placeholder="Select surgery type"
                                    value={formData.surgery_type_id}
                                    onChange={(value: string) => setFormData(prev => ({ ...prev, surgery_type_id: value }))}
                                    size="large"
                                >
                                    {surgeryTypes.map(type => (
                                        <Option key={type.id} value={type.id}>
                                            {type.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Price"
                                name="price"
                                rules={[{ required: true, message: "Please enter price" }]}
                            >
                                <InputNumber
                                    value={formData.price ? Number(formData.price) : undefined}
                                    onChange={(value: number | null) => setFormData(prev => ({ ...prev, price: value?.toString() || null }))}
                                    className="w-full"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Operation Theatre"
                                name="operation_theatre_id"
                            >
                                <Select
                                    placeholder="Select operation theatre"
                                    value={formData.operation_theatre_id}
                                    onChange={(value: string) => setFormData(prev => ({ ...prev, operation_theatre_id: value }))}
                                    size="large"
                                >
                                    {operationTheatres.map(theatre => (
                                        <Option key={theatre.id} value={theatre.id}>
                                            {theatre.name} - {theatre.location}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Status"
                                name="status"
                            >
                                <Select
                                    value={formData.status}
                                    onChange={(value: string) => setFormData(prev => ({ ...prev, status: value }))}
                                    size="large"
                                >
                                    <Option value="SCHEDULED">Scheduled</Option>
                                    <Option value="IN_PROGRESS">In Progress</Option>
                                    <Option value="COMPLETED">Completed</Option>
                                    <Option value="CANCELLED">Cancelled</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Scheduled Start Time"
                                name="scheduled_start_time"
                                rules={[{ required: true, message: "Please select start time" }]}
                            >
                                <DatePicker
                                    showTime
                                    value={formData.scheduled_start_time}
                                    onChange={(value: Dayjs | null) => setFormData(prev => ({ ...prev, scheduled_start_time: value }))}
                                    className="w-full"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Scheduled End Time"
                                name="scheduled_end_time"
                            >
                                <DatePicker
                                    showTime
                                    value={formData.scheduled_end_time}
                                    onChange={(value: Dayjs | null) => setFormData(prev => ({ ...prev, scheduled_end_time: value }))}
                                    className="w-full"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* <Form.Item label="Surgical Team">
                        <div className="space-y-3">
                            {formData.surgery_doctors.map((surgeon, index) => (
                                <div key={index} className="flex gap-2">
                                    <Select
                                        placeholder="Select doctor"
                                        value={surgeon.doctor_id}
                                        onChange={(value: string) => updateSurgeon(index, "doctor_id", value)}
                                        className="flex-1"
                                        size="large"
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
                                        onChange={(value: string) => updateSurgeon(index, "role", value)}
                                        className="w-32"
                                        size="large"
                                    >
                                        {SURGEON_ROLES.map(role => (
                                            <Option key={role} value={role}>{role}</Option>
                                        ))}
                                    </Select>
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => removeSurgeon(index)}
                                        size="large"
                                    />
                                </div>
                            ))}
                            <Button
                                onClick={addSurgeon}
                                icon={<PlusOutlined />}
                                className="w-full"
                                size="large"
                            >
                                Add Surgeon
                            </Button>
                        </div>
                    </Form.Item> */}

                    <Form.Item label="Notes">
                        <TextArea
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Additional notes about the surgery..."
                            size="large"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Surgery Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-3">
                        <ScissorOutlined className="text-blue-600 text-lg" />
                        <span className="text-lg font-semibold">Surgery Details</span>
                    </div>
                }
                open={isViewModalOpen}
                onCancel={() => setIsViewModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalOpen(false)} size="large">
                        Close
                    </Button>
                ]}
                width={700}
            >
                {selectedSurgery && selectedSurgery.surgeries[0] && (
                    <Descriptions bordered column={2} size="default">
                        <Descriptions.Item label="Patient" span={2}>
                            <div className="flex items-center gap-2">
                                <UserOutlined />
                                {selectedSurgery.user?.name}
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Surgery Type">
                            <div className="flex items-center gap-2">
                                <MedicineBoxOutlined />
                                {selectedSurgery.surgeries[0].surgery_type?.name}
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag
                                color={getStatusColor(selectedSurgery.surgeries[0].status)}
                                icon={getStatusIcon(selectedSurgery.surgeries[0].status)}
                            >
                                {SURGERY_STATUS[selectedSurgery.surgeries[0].status]}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Operation Theatre">
                            <div className="flex items-center gap-2">
                                <EnvironmentOutlined />
                                {selectedSurgery.surgeries[0].operation_theatre?.name}
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Location">
                            {selectedSurgery.surgeries[0].operation_theatre?.location}
                        </Descriptions.Item>
                        <Descriptions.Item label="Scheduled Start">
                            {selectedSurgery.surgeries[0].scheduled_start_time ?
                                dayjs(selectedSurgery.surgeries[0].scheduled_start_time).format("MMM D, YYYY h:mm A") :
                                "Not set"
                            }
                        </Descriptions.Item>
                        <Descriptions.Item label="Scheduled End">
                            {selectedSurgery.surgeries[0].scheduled_end_time ?
                                dayjs(selectedSurgery.surgeries[0].scheduled_end_time).format("MMM D, YYYY h:mm A") :
                                "Not set"
                            }
                        </Descriptions.Item>

                        {selectedSurgery.surgery_doctors && selectedSurgery.surgery_doctors.length > 0 && (
                            <Descriptions.Item label="Surgical Team" span={2}>
                                <List
                                    size="small"
                                    dataSource={selectedSurgery.surgery_doctors}
                                    renderItem={(sd: SurgeryDoctor, index: number) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<Avatar icon={<UserOutlined />} size="small" />}
                                                title={sd.doctor.name}
                                                description={
                                                    <Tag color="blue">{sd.role}</Tag>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Descriptions.Item>
                        )}

                        {selectedSurgery.surgeries[0].notes && (
                            <Descriptions.Item label="Notes" span={2}>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    {selectedSurgery.surgeries[0].notes}
                                </div>
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
}