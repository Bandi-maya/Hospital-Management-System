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
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

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
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Form state
    const [formData, setFormData] = useState({
        patient_id: "",
        surgery_type_id: "",
        price: "",
        operation_theatre_id: "",
        scheduled_start_time: null,
        scheduled_end_time: null,
        status: "SCHEDULED",
        notes: "",
        surgery_doctors: [] as Array<{ doctor_id: string; role: string }>
    });

    // Load all data
    useEffect(() => {
        fetchOrders()
        loadData();
    }, []);

    const fetchOrders = async (page = 1, limit = 10, searchQuery = search, status = statusFilter) => {
        setLoading(true);
        getApi(`/orders?order_type=surgery&page=${page}&limit=${limit}&q=${searchQuery}&status=${status === 'all' ? '' : status}`)
            .then((res) => {
                if (!res.error) {
                    setSurgeries(res.data);
                } else {
                    toast.error("Failed to load orders.");
                }
            })
            .catch(() => toast.error("Server error while fetching orders"))
            .finally(() => setLoading(false));
    };

    const loadData = () => {
        setLoading(true);
        Promise.all([
            getApi('/surgery-type'),
            getApi('/operation-theatre'),
            getApi('/users?user_type=PATIENT'),
            getApi('/users?user_type=DOCTOR')
        ]).then(([typesData, theatresData, patientsData, doctorsData]) => {
            if (!typesData?.error) setSurgeryTypes(typesData.data);
            if (!theatresData?.error) setOperationTheatres(theatresData.data);
            if (!patientsData?.error) setPatients(patientsData.data);
            if (!doctorsData?.error) setDoctors(doctorsData.data);
        }).catch(error => {
            toast.error("Failed to load data");
            console.error("Error loading data:", error);
        }).finally(() => setLoading(false));
    };

    const handleOpenModal = (surgery: Surgery | any | null = null) => {
        if (surgery) {
            form.setFieldValue("patient_id", surgery.user_id)
            form.setFieldValue('surgery_type_id', surgery.surgeries[0].surgery_type_id)
            form.setFieldValue('price', surgery.surgeries[0].surgery_type_id)
            form.setFieldValue('operation_theatre_id', surgery.surgeries[0].operation_theatre_id || "")
            form.setFieldValue('scheduled_start_time', dayjs(surgery.surgeries[0].scheduled_start_time))
            form.setFieldValue('scheduled_end_time', surgery.surgeries[0].scheduled_end_time ? dayjs(surgery.surgeries[0].scheduled_end_time) : null)
            form.setFieldValue('status', surgery.surgeries[0].status)
            form.setFieldValue('notes', surgery.surgeries[0].notes || "")
            setSelectedSurgery(surgery);

            setFormData({
                patient_id: surgery.user_id,
                surgery_type_id: surgery.surgeries[0].surgery_type_id,
                price: surgery.surgeries[0].surgery_type_id,
                operation_theatre_id: surgery.surgeries[0].operation_theatre_id || "",
                scheduled_start_time: dayjs(surgery.surgeries[0].scheduled_start_time),
                scheduled_end_time: surgery.surgeries[0].scheduled_end_time ? dayjs(surgery.surgeries[0].scheduled_end_time) : null,
                status: surgery.surgeries[0].status,
                notes: surgery.surgeries[0].notes || "",
                surgery_doctors: surgery.surgery_doctors?.map(sd => ({
                    doctor_id: sd.doctor.id,
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

    console.log(formData)

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

            const payload = {
                user_id: formData.patient_id,
                surgeries: [
                    {
                        ...submitData
                    }
                ]
            }

            if (selectedSurgery) {
                // PutApi(`/surgery`, {...submitData, id: selectedSurgery.id})
                PutApi(`/orders`, { ...payload, id: selectedSurgery.id })
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
                // PostApi('/surgery', submitData)
                PostApi('/orders', payload)
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
        Modal.confirm({
            title: 'Are you sure you want to delete this surgery?',
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk() {
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
        });
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
        // const matchesSearch = surgery.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
        //     surgery.surgery_type?.name?.toLowerCase().includes(search.toLowerCase()) ||
        //     surgery.operation_theatre?.name?.toLowerCase().includes(search.toLowerCase());

        // const matchesStatus = statusFilter === "all" || surgery.status === statusFilter;

        return surgery;
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "SCHEDULED": return <ScheduleOutlined />;
            case "IN_PROGRESS": return <PlayCircleOutlined />;
            case "COMPLETED": return <CheckCircleOutlined />;
            case "CANCELLED": return <CloseCircleOutlined />;
            default: return <ScheduleOutlined />;
        }
    };

    const columns: any = [
        {
            title: "Patient",
            dataIndex: ["user", "name"],
            key: "patient",
            render: (text: string, record: Surgery) => (
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
            render: (text: string, record: Surgery) => (
                <div className="flex items-center gap-2">
                    <EnvironmentOutlined className="text-gray-400" />
                    <div>
                        <div>{text}</div>
                        <div className="text-xs text-gray-500">{record.operation_theatre?.location}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Scheduled Time",
            key: ['surgeries', 0, "scheduled_time"],
            render: (record: Surgery) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <CalendarOutlined className="text-gray-400" />
                        <span>{dayjs(record.scheduled_start_time).format("MMM D, YYYY")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ClockCircleOutlined className="text-gray-400" />
                        <span>{dayjs(record.scheduled_start_time).format("h:mm A")}</span>
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
                    count={SURGERY_STATUS[status as keyof typeof SURGERY_STATUS] || status}
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
            render: (record: Surgery) => (
                <Space size="small">
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

    console.log(formData.patient_id)

    const handleTableChange = (newPagination: any) => {
        fetchOrders(newPagination.current, newPagination.pageSize);
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
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleOpenModal()}
                        size="large"
                        className="h-12 px-6 text-base font-medium bg-blue-600 hover:bg-blue-700 shrink-0"
                    >
                        Schedule Surgery
                    </Button>
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
                                onSearch={() => { fetchOrders(pagination.current, pagination.pageSize, search) }}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                size="large"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                value={statusFilter}
                                onChange={(value) => {
                                    setStatusFilter(value)
                                    fetchOrders(pagination.current, pagination.pageSize, search, value)
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
                            value={surgeries.length}
                            prefix={<ScissorOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Scheduled"
                            value={surgeries.filter(s => s.status === 'SCHEDULED').length}
                            prefix={<ScheduleOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="In Progress"
                            value={surgeries.filter(s => s.status === 'IN_PROGRESS').length}
                            prefix={<PlayCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <Statistic
                            title="Completed"
                            value={surgeries.filter(s => s.status === 'COMPLETED').length}
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
                                pageSize: 10,
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
                destroyOnHidden
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
                                    onChange={(value) => setFormData(prev => ({ ...prev, patient_id: value }))}
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
                                    onChange={(value) => setFormData(prev => ({ ...prev, surgery_type_id: value }))}
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
                                    value={formData.price}
                                    onChange={(value) => setFormData(prev => ({ ...prev, price: value }))}
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
                                    onChange={(value) => setFormData(prev => ({ ...prev, operation_theatre_id: value }))}
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
                                    onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
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
                                    onChange={(value) => setFormData(prev => ({ ...prev, scheduled_start_time: value }))}
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
                                    onChange={(value) => setFormData(prev => ({ ...prev, scheduled_end_time: value }))}
                                    className="w-full"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Surgical Team">
                        <div className="space-y-3">
                            {formData.surgery_doctors.map((surgeon, index) => (
                                <div key={index} className="flex gap-2">
                                    <Select
                                        placeholder="Select doctor"
                                        value={surgeon.doctor_id}
                                        onChange={(value) => updateSurgeon(index, "doctor_id", value)}
                                        className="flex-1"
                                        size="large"
                                    >
                                        {doctors.map(doctor => (
                                            <Option key={doctor.id} value={doctor.id}>
                                                {doctor.name}
                                            </Option>
                                        ))}
                                    </Select>
                                    <Select
                                        placeholder="Role"
                                        value={surgeon.role}
                                        onChange={(value) => updateSurgeon(index, "role", value)}
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
                    </Form.Item>

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
                {selectedSurgery && (
                    <Descriptions bordered column={2} size="default">
                        <Descriptions.Item label="Patient" span={2}>
                            <div className="flex items-center gap-2">
                                <UserOutlined />
                                {selectedSurgery.patient?.name}
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Surgery Type">
                            <div className="flex items-center gap-2">
                                <MedicineBoxOutlined />
                                {selectedSurgery.surgery_type?.name}
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag
                                color={getStatusColor(selectedSurgery.status)}
                                icon={getStatusIcon(selectedSurgery.status)}
                            >
                                {SURGERY_STATUS[selectedSurgery.status as keyof typeof SURGERY_STATUS]}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Operation Theatre">
                            <div className="flex items-center gap-2">
                                <EnvironmentOutlined />
                                {selectedSurgery.operation_theatre?.name}
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Location">
                            {selectedSurgery.operation_theatre?.location}
                        </Descriptions.Item>
                        <Descriptions.Item label="Scheduled Start">
                            {dayjs(selectedSurgery.scheduled_start_time).format("MMM D, YYYY h:mm A")}
                        </Descriptions.Item>
                        <Descriptions.Item label="Scheduled End">
                            {selectedSurgery.scheduled_end_time ?
                                dayjs(selectedSurgery.scheduled_end_time).format("MMM D, YYYY h:mm A") :
                                "Not set"
                            }
                        </Descriptions.Item>

                        {selectedSurgery.surgery_doctors && selectedSurgery.surgery_doctors.length > 0 && (
                            <Descriptions.Item label="Surgical Team" span={2}>
                                <List
                                    size="small"
                                    dataSource={selectedSurgery.surgery_doctors}
                                    renderItem={(sd, index) => (
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

                        {selectedSurgery.notes && (
                            <Descriptions.Item label="Notes" span={2}>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    {selectedSurgery.notes}
                                </div>
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
}