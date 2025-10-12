import React, { useEffect, useMemo, useState } from "react";
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
    MedicineBoxOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    FileTextOutlined,
    ReloadOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Patient, BloodType } from "@/types/patient";
import { getApi, PostApi, PutApi } from "@/ApiService";
import dayjs from "dayjs";
import { motion } from "framer-motion";

interface AddPatientProps {
    onAddPatient?: (patient: Patient) => void;
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

// Reusable Action Button Component (same as PatientList)
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
            whileHover={{ scale: 1.1 }} 
            transition={{ type: "spring", stiffness: 250 }}
        >
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
                        w-10 h-10 rounded-full
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

export default function AddPatient({ onAddPatient }: AddPatientProps) {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [doctorList, setDoctorList] = useState<any[]>([]);
    const [departmentList, setDepartmentList] = useState<any[]>([]);
    const [extraFields, setExtraFields] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStates, setLoadingStates] = useState({
        doctors: false,
        departments: false,
        extraFields: false
    });

    const userTypeId = useMemo(() => {
        return extraFields?.[0]?.user_type;
    }, [extraFields]);

    function getExtraFields() {
        setLoadingStates(prev => ({ ...prev, extraFields: true }));
        getApi("/user-fields")
            .then((data) => {
                if (!data?.error) {
                    setExtraFields(data.filter((field) => field.user_type_data.type.toUpperCase() === "PATIENT"));
                } else {
                    message.error("Error fetching user fields: " + data.error);
                    console.error("Error fetching user fields:", data.error);
                }
            }).catch((error) => {
                message.error("Error fetching user fields");
                console.error("Error fetching user fields:", error);
            })
            .finally(() => setLoadingStates(prev => ({ ...prev, extraFields: false })));
    }

    function getDoctors() {
        setLoadingStates(prev => ({ ...prev, doctors: true }));
        getApi(`/users?user_type=DOCTOR`)
            .then((data) => {
                if (!data?.error) {
                    setDoctorList(data);
                } else {
                    message.error("Error fetching doctors: " + data.error);
                    console.error("Error fetching doctors:", data.error);
                }
            }).catch((error) => {
                message.error("Error fetching doctors");
                console.error("Error fetching doctors:", error);
            })
            .finally(() => setLoadingStates(prev => ({ ...prev, doctors: false })));
    }

    function getDepartments() {
        setLoadingStates(prev => ({ ...prev, departments: true }));
        getApi(`/departments`)
            .then((data) => {
                if (!data?.error) {
                    setDepartmentList(data);
                } else {
                    message.error("Error fetching departments: " + data.error);
                    console.error("Error fetching departments:", data.error);
                }
            }).catch((error) => {
                message.error("Error fetching departments");
                console.error("Error fetching departments:", error);
            })
            .finally(() => setLoadingStates(prev => ({ ...prev, departments: false })));
    }

    useEffect(() => {
        getDoctors();
        getExtraFields();
        getDepartments();
    }, []);

    const handleSubmit = async (values: any) => {
        setIsLoading(true);

        const formattedDate = values.dateOfBirth ? dayjs(values.dateOfBirth).format('YYYY-MM-DD') : '';

        const newPatient: any = {
            extra_fields: values.extra_fields,
            department_id: values.department_id,
            user_type_id: userTypeId,
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

        await PostApi(`/users`, newPatient)
            .then((data) => {
                if (!data?.error) {
                    message.success("Patient added successfully!");
                    navigate("/patients");
                } else {
                    message.error(data.error);
                    console.error("Error adding patient:", data.error);
                }
            }).catch((error) => {
                message.error("Error occurred while adding the user.");
                console.error("Error adding user:", error);
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <div className="p-4 md:p-6 bg-white rounded-lg shadow-sm">
            {/* Header with same styling as PatientList */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <Title level={2} className="m-0">Patient Management</Title>
                <Space>
                    <Button
                        onClick={() => navigate("/patients")}
                        icon={<ArrowLeftOutlined />}
                        className="flex items-center gap-2"
                    >
                        Back to Patients
                    </Button>
                </Space>
            </div>

            {/* Loading Overlay */}
            <Spin 
                spinning={loadingStates.doctors || loadingStates.departments || loadingStates.extraFields}
                tip="Loading Form Data..."
                size="large"
                className="w-full"
            >
                <Card 
                    className="w-full mx-auto medical-card border border-gray-200"
                    title={
                        <Space>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <UserOutlined className="text-blue-600 text-lg" />
                            </div>
                            <div>
                                <Title level={4} className="m-0">Add New Patient</Title>
                                <Text type="secondary">Fill in patient details to add a new record</Text>
                            </div>
                        </Space>
                    }
                    extra={
                        <Space>
                            <Button
                                onClick={() => form.resetFields()}
                                icon={<ReloadOutlined />}
                                className="flex items-center gap-2"
                            >
                                Reset
                            </Button>
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />}
                                loading={isLoading}
                                onClick={() => form.submit()}
                                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                            >
                                Add Patient
                            </Button>
                        </Space>
                    }
                >
                    <Form
                        layout="vertical"
                        onFinish={handleSubmit}
                        form={form}
                        className="space-y-6"
                    >
                        {/* Personal Information Section */}
                        <div className="space-y-4">
                            <Title level={4} className="text-gray-900 border-b pb-2">
                                Personal Information
                            </Title>
                            <Row gutter={16}>
                                {extraFields.map((field: any) => {
                                    if (["assigned_to_doctor"].includes(field.field_name)) return null;
                                    return (
                                        <Col span={12} key={field.id}>
                                            <Form.Item
                                                label={
                                                    <span className="font-medium text-gray-700">
                                                        {field.field_name.replace(/_/g, ' ').toUpperCase()}
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
                                                    placeholder={`Enter ${field.field_name.replace(/_/g, ' ')}`}
                                                    className="w-full"
                                                    disabled={loadingStates.extraFields}
                                                    prefix={<UserOutlined />}
                                                />
                                            </Form.Item>
                                        </Col>
                                    );
                                })}

                                <Col span={12}>
                                    <Form.Item
                                        label={
                                            <span className="font-medium text-gray-700">
                                                Date of Birth
                                                <span className="text-red-500 ml-1">*</span>
                                            </span>
                                        }
                                        name="dateOfBirth"
                                        rules={[
                                            { required: true, message: "Please select date of birth" },
                                        ]}
                                    >
                                        <DatePicker 
                                            className="w-full"
                                            format="YYYY-MM-DD"
                                            placeholder="Select date of birth"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item
                                        label={
                                            <span className="font-medium text-gray-700">
                                                Gender
                                                <span className="text-red-500 ml-1">*</span>
                                            </span>
                                        }
                                        name="gender"
                                        rules={[{ required: true, message: "Please select gender" }]}
                                    >
                                        <Select
                                            placeholder="Select gender"
                                            className="w-full"
                                            options={[
                                                { value: "MALE", label: "Male" },
                                                { value: "FEMALE", label: "Female" },
                                                { value: "OTHER", label: "Other" },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        <Divider />

                        {/* Contact Information Section */}
                        <div className="space-y-4">
                            <Title level={4} className="text-gray-900 border-b pb-2">
                                Contact Information
                            </Title>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label={
                                            <span className="font-medium text-gray-700">
                                                Phone
                                                <span className="text-red-500 ml-1">*</span>
                                            </span>
                                        }
                                        name="phone"
                                        rules={[{ required: true, message: "Please enter phone number" }]}
                                    >
                                        <Input 
                                            placeholder="Enter phone number"
                                            className="w-full"
                                            prefix={<PhoneOutlined />}
                                        />
                                    </Form.Item>
                                </Col>
                                
                                <Col span={12}>
                                    <Form.Item
                                        label={
                                            <span className="font-medium text-gray-700">
                                                Email
                                                <span className="text-red-500 ml-1">*</span>
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
                                            className="w-full"
                                            prefix={<MailOutlined />}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        <Divider />

                        {/* Address Information Section */}
                        <div className="space-y-4">
                            <Title level={4} className="text-gray-900 border-b pb-2">
                                Address Information
                            </Title>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label={
                                            <span className="font-medium text-gray-700">
                                                Street
                                                <span className="text-red-500 ml-1">*</span>
                                            </span>
                                        }
                                        name="street"
                                        rules={[{ required: true, message: "Please enter street address" }]}
                                    >
                                        <Input 
                                            placeholder="Enter street address"
                                            className="w-full"
                                            prefix={<EnvironmentOutlined />}
                                        />
                                    </Form.Item>
                                </Col>
                                
                                <Col span={12}>
                                    <Form.Item
                                        label={
                                            <span className="font-medium text-gray-700">
                                                City
                                                <span className="text-red-500 ml-1">*</span>
                                            </span>
                                        }
                                        name="city"
                                        rules={[{ required: true, message: "Please enter city" }]}
                                    >
                                        <Input 
                                            placeholder="Enter city"
                                            className="w-full"
                                            prefix={<EnvironmentOutlined />}
                                        />
                                    </Form.Item>
                                </Col>
                                
                                <Col span={12}>
                                    <Form.Item
                                        label={
                                            <span className="font-medium text-gray-700">
                                                State
                                                <span className="text-red-500 ml-1">*</span>
                                            </span>
                                        }
                                        name="state"
                                        rules={[{ required: true, message: "Please enter state" }]}
                                    >
                                        <Input 
                                            placeholder="Enter state"
                                            className="w-full"
                                            prefix={<EnvironmentOutlined />}
                                        />
                                    </Form.Item>
                                </Col>
                                
                                <Col span={12}>
                                    <Form.Item
                                        label={
                                            <span className="font-medium text-gray-700">
                                                ZIP Code
                                                <span className="text-red-500 ml-1">*</span>
                                            </span>
                                        }
                                        name="zipCode"
                                        rules={[{ required: true, message: "Please enter ZIP code" }]}
                                    >
                                        <Input 
                                            placeholder="Enter ZIP code"
                                            className="w-full"
                                            prefix={<EnvironmentOutlined />}
                                        />
                                    </Form.Item>
                                </Col>
                                
                                <Col span={24}>
                                    <Form.Item
                                        label={
                                            <span className="font-medium text-gray-700">
                                                Country
                                                <span className="text-red-500 ml-1">*</span>
                                            </span>
                                        }
                                        name="country"
                                        rules={[{ required: true, message: "Please select country" }]}
                                    >
                                        <Select
                                            placeholder="Select country"
                                            showSearch
                                            className="w-full"
                                            optionFilterProp="label"
                                            options={countries.map((c) => ({ value: c, label: c }))}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        <Divider />

                        {/* Medical Information Section */}
                        <div className="space-y-4">
                            <Title level={4} className="text-gray-900 border-b pb-2">
                                Medical Information
                            </Title>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label={<span className="font-medium text-gray-700">Blood Type</span>}
                                        name="bloodType"
                                    >
                                        <Select
                                            placeholder="Select blood type"
                                            className="w-full"
                                            options={[
                                                { value: "A+", label: "A+" },
                                                { value: "A-", label: "A-" },
                                                { value: "B+", label: "B+" },
                                                { value: "B-", label: "B-" },
                                                { value: "AB+", label: "AB+" },
                                                { value: "AB-", label: "AB-" },
                                                { value: "O+", label: "O+" },
                                                { value: "O-", label: "O-" },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item
                                        label={
                                            <span className="font-medium text-gray-700">
                                                Department
                                                <span className="text-red-500 ml-1">*</span>
                                            </span>
                                        }
                                        name="department_id"
                                        rules={[{ required: true, message: "Please select department" }]}
                                    >
                                        <Select
                                            placeholder="Select department"
                                            className="w-full"
                                            loading={loadingStates.departments}
                                            options={departmentList.map((d) => ({ value: d.id, label: d.name, key: d.id }))}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                            <Button
                                type="default"
                                onClick={() => navigate("/patients")}
                                className="flex-1 sm:flex-none"
                                disabled={isLoading}
                                size="large"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                                disabled={isLoading}
                                loading={isLoading}
                                size="large"
                                icon={<PlusOutlined />}
                            >
                                Add Patient
                            </Button>
                        </div>
                    </Form>
                </Card>
            </Spin>
        </div>
    );
}