import React, { useEffect, useState } from "react";
import {
    Card,
    Form,
    Input,
    Button,
    Select,
    DatePicker,
    Spin,
    message,
    Typography,
    Space,
    Row,
    Col,
    Divider,
    Tooltip,
    Popconfirm
} from "antd";
import {
    ArrowLeftOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    PlusOutlined,
    ReloadOutlined,
    LoadingOutlined,
    IdcardOutlined,
    HeartOutlined,
    TeamOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getApi, PostApi } from "@/ApiService";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import FullscreenLoader from "@/components/Loader/FullscreenLoader";

interface AddNurseProps {
    onAddNurse?: (nurse: any) => void;
}

const { Option } = Select;
const { Title, Text } = Typography;

// ✅ Full country list
export const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria",
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Belarus", "Belgium", "Bhutan", "Bolivia", "Bosnia & Herzegovina",
    "Brazil", "Bulgaria", "Cambodia", "Cameroon", "Canada", "Chile", "China", "Colombia", "Costa Rica", "Croatia",
    "Cuba", "Cyprus", "Czech Republic", "Denmark", "Egypt", "Estonia", "Ethiopia", "Finland", "France", "Germany",
    "Greece", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Japan",
    "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Latvia", "Lebanon", "Lithuania", "Luxembourg", "Malaysia", "Maldives",
    "Mexico", "Monaco", "Mongolia", "Morocco", "Nepal", "Netherlands", "New Zealand", "Nigeria", "Norway", "Oman",
    "Pakistan", "Panama", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia",
    "Serbia", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sweden",
    "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Tunisia", "Turkey", "Turkmenistan",
    "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uzbekistan", "Vatican City", "Venezuela",
    "Vietnam", "Yemen", "Zimbabwe",
];

// ✅ Reusable Action Button
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
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
            <Tooltip title={label} placement="top">
                <Button
                    type={type}
                    danger={danger}
                    icon={icon}
                    loading={loading}
                    onClick={onClick}
                    className={`
                        flex items-center justify-center 
                        transition-all duration-300 ease-in-out
                        ${!danger && !type.includes('primary') ?
                        'text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-gray-300 hover:border-blue-300' : ''
                        }
                        ${danger ?
                        'hover:text-red-600 hover:bg-red-50 border-gray-300 hover:border-red-300' : ''
                        }
                        w-10 h-10 rounded-full shadow-sm
                    `}
                    style={{
                        minWidth: '40px',
                        border: '1px solid #d9d9d9'
                    }}
                />
            </Tooltip>
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

export default function AddNurse({ onAddNurse }: AddNurseProps) {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [departmentList, setDepartmentList] = useState<any[]>([]);
    const [extraFields, setExtraFields] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showFullscreenLoader, setShowFullscreenLoader] = useState(false);
    const [loadingStates, setLoadingStates] = useState({
        departments: false,
        extraFields: false
    });

    // Show loading spinner with progress
    const showLoader = () => {
        setShowFullscreenLoader(true);
    };

    // Fetch Data
    const getExtraFields = async () => {
        setLoadingStates(prev => ({ ...prev, extraFields: true }));
        try {
            const data = await getApi("/user-fields");
            if (!data?.error) {
                setExtraFields(data.data.filter((field: any) => field.user_type_data.type.toUpperCase() === "NURSE"));
            } else {
                message.error("Error fetching user fields: " + data.error);
            }
        } catch {
            message.error("Error fetching user fields");
        } finally {
            setLoadingStates(prev => ({ ...prev, extraFields: false }));
        }
    };

    const getDepartments = async () => {
        setLoadingStates(prev => ({ ...prev, departments: true }));
        try {
            const data = await getApi(`/departments`);
            if (!data?.error) {
                setDepartmentList(data.data);
            } else {
                message.error("Error fetching departments: " + data.error);
            }
        } catch {
            message.error("Error fetching departments");
        } finally {
            setLoadingStates(prev => ({ ...prev, departments: false }));
        }
    };

    useEffect(() => {
        showLoader();
        const fetchData = async () => {
            await Promise.all([getExtraFields(), getDepartments()]);
            // Hide fullscreen loader after all data is loaded
            setTimeout(() => setShowFullscreenLoader(false), 500);
        };
        fetchData();
    }, []);

    const handleSubmit = async (values: any) => {
        setIsLoading(true);
        showLoader();

        try {
            const formattedDate = values.dateOfBirth ? dayjs(values.dateOfBirth).format('YYYY-MM-DD') : '';

            const newNurse = {
                extra_fields: values.extra_fields,
                department_id: values.department_id,
                user_type_id: 4,
                username: values.email,
                name: `${values?.extra_fields?.first_name || ''} ${values?.extra_fields?.last_name || ''}`.trim(),
                date_of_birth: formattedDate,
                blood_type: values.bloodType,
                age: values.age ?? '0',
                phone_no: values.phone,
                email: values.email,
                gender: values.gender,
                address: {
                    street: values.street,
                    city: values.city,
                    state: values.state,
                    zipCode: values.zipCode,
                    country: values.country,
                },
            };

            const data = await PostApi(`/users`, newNurse);
            if (!data?.error) {
                message.success("Nurse added successfully!");
                onAddNurse?.(newNurse);
                navigate("/nurse");
            } else {
                message.error(data.error);
            }
        } catch {
            message.error("Error occurred while adding the nurse.");
        } finally {
            setIsLoading(false);
            setShowFullscreenLoader(false);
        }
    };

    const handleReset = () => {
        form.resetFields();
        message.success("Form reset successfully");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-indigo-50/30 py-6 px-4 sm:px-6 lg:px-8">
            {/* Fullscreen Loading Spinner */}
            <FullscreenLoader 
                active={showFullscreenLoader} 
                onComplete={() => setShowFullscreenLoader(false)}
                speed={100}
            />

            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto mb-8"
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-2">
                        <Title level={1} className="m-0 text-3xl font-bold text-gray-900">
                            Nurse Management
                        </Title>
                        <Text className="text-lg text-gray-600">
                            Register a new nurse in the system
                        </Text>
                    </div>
                    <Space>
                        <Button
                            onClick={() => navigate("/nurse")}
                            icon={<ArrowLeftOutlined />}
                            size="large"
                            className="flex items-center gap-2 h-12 px-6 border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 font-medium rounded-lg transition-all duration-300"
                        >
                            Back to Nurses
                        </Button>
                    </Space>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-7xl mx-auto"
            >
                <Card
                    className="w-full mx-auto border-0 shadow-2xl rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm"
                    title={
                        <div className="flex items-center gap-4 p-2">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                                <TeamOutlined className="text-white text-2xl" />
                            </div>
                            <div>
                                <Title level={3} className="m-0 text-gray-900">Add New Nurse</Title>
                                <Text type="secondary" className="text-base">Fill in all required nurse details to create a new record</Text>
                            </div>
                        </div>
                    }
                    extra={
                        <Space size="middle" className="flex items-center">
                            <ActionButton
                                icon={<ReloadOutlined />}
                                label="Reset Form"
                                onClick={handleReset}
                                loading={isLoading}
                            />
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                loading={isLoading}
                                onClick={() => form.submit()}
                                size="large"
                                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
                            >
                                Add Nurse
                            </Button>
                        </Space>
                    }
                    styles={{
                        body: { padding: 0 }
                    }}
                >
                    <div className="p-8">
                        <Form 
                            layout="vertical" 
                            onFinish={handleSubmit} 
                            form={form} 
                            className="space-y-8"
                            size="large"
                            disabled={isLoading}
                        >
                            {/* --- Personal Information --- */}
                            <motion.section
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                                    <Title level={4} className="m-0 text-gray-900 flex items-center gap-2">
                                        <IdcardOutlined className="text-blue-500" />
                                        Personal Information
                                    </Title>
                                </div>
                                
                                <Row gutter={[24, 16]}>
                                    {extraFields.map((field: any) => {
                                        if (["assigned_to_doctor"].includes(field.field_name)) return null;
                                        return (
                                            <Col xs={24} md={12} lg={8} key={field.id}>
                                                <Form.Item
                                                    label={
                                                        <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                                                            {field.field_name.replace(/_/g, ' ')}
                                                            {field.is_mandatory && <span className="text-red-500 ml-1">*</span>}
                                                        </span>
                                                    }
                                                    name={["extra_fields", field.field_name]}
                                                    rules={[{ 
                                                        required: field.is_mandatory, 
                                                        message: `Please enter ${field.field_name.replace(/_/g, ' ')}` 
                                                    }]}
                                                >
                                                    <Input
                                                        placeholder={`Enter ${field.field_name.replace(/_/g, ' ').toLowerCase()}`}
                                                        className="w-full h-12 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors"
                                                        disabled={loadingStates.extraFields || isLoading}
                                                        prefix={<UserOutlined className="text-gray-400" />}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        );
                                    })}
                                    
                                    {/* Additional Personal Info Fields */}
                                    <Col xs={24} md={12} lg={8}>
                                        <Form.Item
                                            label={
                                                <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                                                    Date of Birth <span className="text-red-500">*</span>
                                                </span>
                                            }
                                            name="dateOfBirth"
                                            rules={[{ required: true, message: "Please select date of birth" }]}
                                        >
                                            <DatePicker
                                                className="w-full h-12 rounded-lg"
                                                format="YYYY-MM-DD"
                                                disabled={isLoading}
                                            />
                                        </Form.Item>
                                    </Col>
                                    
                                    <Col xs={24} md={12} lg={8}>
                                        <Form.Item
                                            label={
                                                <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                                                    Gender <span className="text-red-500">*</span>
                                                </span>
                                            }
                                            name="gender"
                                            rules={[{ required: true, message: "Please select gender" }]}
                                        >
                                            <Select
                                                placeholder="Select gender"
                                                className="w-full h-12 rounded-lg"
                                                options={[
                                                    { value: 'MALE', label: 'Male' },
                                                    { value: 'FEMALE', label: 'Female' },
                                                    { value: 'OTHER', label: 'Other' }
                                                ]}
                                                disabled={isLoading}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </motion.section>

                            <Divider className="my-8" />

                            {/* --- Contact Information --- */}
                            <motion.section
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1.5 h-8 bg-green-500 rounded-full"></div>
                                    <Title level={4} className="m-0 text-gray-900 flex items-center gap-2">
                                        <PhoneOutlined className="text-green-500" />
                                        Contact Information
                                    </Title>
                                </div>
                                
                                <Row gutter={[24, 16]}>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label={
                                                <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                                                    Phone Number <span className="text-red-500">*</span>
                                                </span>
                                            }
                                            name="phone"
                                            rules={[{ 
                                                required: true, 
                                                
                                                pattern: /^[0-9+\-\s()]+$/,
                                                message: "Please enter a valid phone number"
                                            }]}
                                        >
                                            <Input 
                                                placeholder="Enter phone number" 
                                                className="w-full h-12 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors"
                                                prefix={<PhoneOutlined className="text-gray-400" />}
                                                disabled={isLoading}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label={
                                                <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                                                    Email Address <span className="text-red-500">*</span>
                                                </span>
                                            }
                                            name="email"
                                            rules={[
                                                { required: true, message: "Please enter email" }, 
                                                { type: 'email', message: 'Please enter a valid email' }
                                            ]}
                                        >
                                            <Input 
                                                type="email" 
                                                placeholder="Enter email address" 
                                                className="w-full h-12 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors"
                                                prefix={<MailOutlined className="text-gray-400" />}
                                                disabled={isLoading}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </motion.section>

                            <Divider className="my-8" />

                            {/* --- Address Information --- */}
                            <motion.section
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1.5 h-8 bg-purple-500 rounded-full"></div>
                                    <Title level={4} className="m-0 text-gray-900 flex items-center gap-2">
                                        <EnvironmentOutlined className="text-purple-500" />
                                        Address Information
                                    </Title>
                                </div>
                                
                                <Row gutter={[24, 16]}>
                                    <Col xs={24} md={12}>
                                        <Form.Item 
                                            label={
                                                <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                                                    Street Address <span className="text-red-500">*</span>
                                                </span>
                                            }
                                            name="street" 
                                            rules={[{ required: true, message: "Please enter street address" }]}
                                        >
                                            <Input 
                                                placeholder="Enter street address" 
                                                className="w-full h-12 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors"
                                                prefix={<EnvironmentOutlined className="text-gray-400" />}
                                                disabled={isLoading}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item 
                                            label={
                                                <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                                                    City <span className="text-red-500">*</span>
                                                </span>
                                            }
                                            name="city" 
                                            rules={[{ required: true, message: "Please enter city" }]}
                                        >
                                            <Input 
                                                placeholder="Enter city" 
                                                className="w-full h-12 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors"
                                                prefix={<EnvironmentOutlined className="text-gray-400" />}
                                                disabled={isLoading}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item 
                                            label={
                                                <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                                                    State <span className="text-red-500">*</span>
                                                </span>
                                            }
                                            name="state" 
                                            rules={[{ required: true, message: "Please enter state" }]}
                                        >
                                            <Input 
                                                placeholder="Enter state" 
                                                className="w-full h-12 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors"
                                                prefix={<EnvironmentOutlined className="text-gray-400" />}
                                                disabled={isLoading}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item 
                                            label={
                                                <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                                                    ZIP Code <span className="text-red-500">*</span>
                                                </span>
                                            }
                                            name="zipCode" 
                                            rules={[{ required: true, message: "Please enter ZIP code" }]}
                                        >
                                            <Input 
                                                placeholder="Enter ZIP code" 
                                                className="w-full h-12 rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors"
                                                prefix={<EnvironmentOutlined className="text-gray-400" />}
                                                disabled={isLoading}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24}>
                                        <Form.Item 
                                            label={
                                                <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                                                    Country <span className="text-red-500">*</span>
                                                </span>
                                            }
                                            name="country" 
                                            rules={[{ required: true, message: "Please select country" }]}
                                        >
                                            <Select 
                                                placeholder="Select country" 
                                                showSearch 
                                                optionFilterProp="label"
                                                className="w-full h-12 rounded-lg"
                                                options={countries.map(c => ({ value: c, label: c }))}
                                                disabled={isLoading}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </motion.section>

                            <Divider className="my-8" />

                            {/* --- Professional Information --- */}
                            <motion.section
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1.5 h-8 bg-orange-500 rounded-full"></div>
                                    <Title level={4} className="m-0 text-gray-900 flex items-center gap-2">
                                        <TeamOutlined className="text-orange-500" />
                                        Professional Information
                                    </Title>
                                </div>
                                
                                <Row gutter={[24, 16]}>
                                    <Col xs={24} md={12}>
                                        <Form.Item 
                                            label={
                                                <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                                                    Blood Type
                                                </span>
                                            }
                                            name="bloodType"
                                        >
                                            <Select
                                                placeholder="Select blood type"
                                                className="w-full h-12 rounded-lg"
                                                options={[
                                                    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
                                                ].map(type => ({ value: type, label: type }))}
                                                disabled={isLoading}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item 
                                            label={
                                                <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                                                    Department <span className="text-red-500">*</span>
                                                </span>
                                            }
                                            name="department_id" 
                                            rules={[{ required: true, message: "Please select department" }]}
                                        >
                                            <Select
                                                placeholder="Select department"
                                                className="w-full h-12 rounded-lg"
                                                options={departmentList.map(dept => ({ 
                                                    value: dept.id, 
                                                    label: dept.name 
                                                }))}
                                                disabled={isLoading || loadingStates.departments}
                                                loading={loadingStates.departments}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </motion.section>

                            {/* --- Action Buttons --- */}
                            <motion.section
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="pt-8 border-t border-gray-200"
                            >
                                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                                    <Button
                                        type="default"
                                        onClick={() => navigate("/nurse")}
                                        disabled={isLoading}
                                        size="large"
                                        className="h-12 px-8 border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-800 font-semibold rounded-lg transition-all duration-300"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                                        disabled={isLoading}
                                        loading={isLoading}
                                        size="large"
                                    >
                                        {!isLoading && <PlusOutlined />}
                                        {isLoading ? "Adding Nurse..." : "Add Nurse"}
                                    </Button>
                                </div>
                            </motion.section>
                        </Form>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}