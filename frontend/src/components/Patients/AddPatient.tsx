import React, { useEffect, useMemo, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Patient, BloodType } from "@/types/patient";
import { v4 as uuidv4 } from "uuid";
import { Form, Select as AntdSelect, Spin } from "antd";
import TextArea from "antd/es/input/TextArea";
import { getApi, PostApi } from "@/ApiService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AddPatientProps {
    onAddPatient?: (patient: Patient) => void;
}

const diseaseSuggestions = [
    "Diabetes",
    "Hypertension",
    "Asthma",
    "Heart Disease",
    "Cancer",
    "Allergies",
    "Arthritis",
];

const doctorList = [
    "Dr. John Doe",
    "Dr. Jane Smith",
    "Dr. Emily Johnson",
    "Dr. Michael Brown",
];
const wardList = ["Ward 1", "Ward 2", "Ward 3", "Ward 4", ""];
const bedList = ["Bed 1", "Bed 2", "Bed 3", "Bed 4", "Bed 5", ""];

// ✅ Full country list
export const countries = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Belarus",
    "Belgium",
    "Bhutan",
    "Bolivia",
    "Bosnia & Herzegovina",
    "Brazil",
    "Bulgaria",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Chile",
    "China",
    "Colombia",
    "Costa Rica",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Egypt",
    "Estonia",
    "Ethiopia",
    "Finland",
    "France",
    "Germany",
    "Greece",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kuwait",
    "Latvia",
    "Lebanon",
    "Lithuania",
    "Luxembourg",
    "Malaysia",
    "Maldives",
    "Mexico",
    "Monaco",
    "Mongolia",
    "Morocco",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nigeria",
    "Norway",
    "Oman",
    "Pakistan",
    "Panama",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Saudi Arabia",
    "Serbia",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "South Africa",
    "South Korea",
    "Spain",
    "Sri Lanka",
    "Sweden",
    "Switzerland",
    "Syria",
    "Taiwan",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uzbekistan",
    "Vatican City",
    "Venezuela",
    "Vietnam",
    "Yemen",
    "Zimbabwe",
];

/** 🔹 Blue Spinner Component **/
const BlueSpinner = ({ size = "default", className = "" }: { size?: "small" | "default" | "large", className?: string }) => {
    const sizeClasses = {
        small: "w-4 h-4",
        default: "w-6 h-6",
        large: "w-8 h-8"
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
        </div>
    );
};

/** 🔹 White Spinner Component **/
const WhiteSpinner = ({ size = "default", className = "" }: { size?: "small" | "default" | "large", className?: string }) => {
    const sizeClasses = {
        small: "w-4 h-4",
        default: "w-6 h-6",
        large: "w-8 h-8"
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <Loader2 className={`${sizeClasses[size]} animate-spin text-white`} />
        </div>
    );
};

/** 🔹 Required Field Label with Red Asterisk **/
const RequiredLabel = ({ label }: { label: string }) => (
    <span className="font-medium text-gray-700 flex items-center gap-1">
        {label}
        <span className="text-red-500">*</span>
    </span>
);

export default function AddPatient({ onAddPatient }: AddPatientProps) {
    const navigate = useNavigate();

    const [form] = Form.useForm();
    const [doctorList, setDoctorList] = useState<any[]>([])
    const [departmentList, setDepartmentList] = useState<any[]>([])
    const [extraFields, setExtraFields] = useState<any>([])
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStates, setLoadingStates] = useState({
        doctors: false,
        departments: false,
        extraFields: false
    });

    const userTypeId = useMemo(() => {
        return extraFields?.[0]?.user_type
    }, [extraFields])

    function getExtraFields() {
        setLoadingStates(prev => ({ ...prev, extraFields: true }));
        getApi("/user-fields")
            .then((data) => {
                if (!data?.error) {
                    setExtraFields(data.filter((field) => field.user_type_data.type.toUpperCase() === "PATIENT"));
                }
                else {
                    toast.error("Error fetching user fields: " + data.error);
                    console.error("Error fetching user fields:", data.error);
                }
            }).catch((error) => {
                toast.error("Error fetching user fields");
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
                }
                else {
                    toast.error("Error fetching doctors: " + data.error);
                    console.error("Error fetching doctors:", data.error);
                }
            }).catch((error) => {
                toast.error("Error fetching doctors");
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
                }
                else {
                    toast.error("Error fetching departments: " + data.error);
                    console.error("Error fetching departments:", data.error);
                }
            }).catch((error) => {
                toast.error("Error fetching departments");
                console.error("Error fetching departments:", error);
            })
            .finally(() => setLoadingStates(prev => ({ ...prev, departments: false })));
    }

    useEffect(() => {
        getDoctors()
        getExtraFields()
        getDepartments()
    }, [])

    const handleSubmit = async (values: any) => {
        setIsLoading(true);

        const date = new Date(values.dateOfBirth);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const dd = String(date.getDate()).padStart(2, '0');

        const formattedDate = `${yyyy}-${mm}-${dd}`;

        const newPatient: any = {
            extra_fields: values.extra_fields,
            department_id: values.department_id,
            user_type_id: userTypeId,
            username: values.email,
            name: `${values?.extra_fields?.first_name} ${values?.extra_fields?.last_name}`,
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
                    toast.success("Patient added successfully!");
                    navigate("/patients");
                }
                else {
                    toast.error(data.error)
                    console.error("Error adding patient:", data.error);
                }
            }).catch((error) => {
                toast.error("Error occurred while adding the user.")
                console.error("Error adding user:", error);
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <div className="p-4 md:p-6 bg-white rounded-lg shadow-sm space-y-6 flex justify-center">
            {/* Main Container with 90% width on desktop */}
            <div className="w-full lg:w-[90%] space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Patient Management</h1>
                        <p className="text-gray-600 mt-1">Add New Patient</p>
                    </div>
                    <Button
                        onClick={() => navigate("/patients")}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        Back to Patients
                    </Button>
                </div>

                {/* Loading Overlay */}
                {(loadingStates.doctors || loadingStates.departments || loadingStates.extraFields) && (
                    <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50 rounded-lg">
                        <div className="text-center space-y-4">
                            <BlueSpinner size="large" />
                            <div className="space-y-2">
                                <p className="text-gray-800 font-semibold text-lg">Loading Form Data</p>
                                <p className="text-gray-500 text-sm">Please wait while we prepare the form...</p>
                            </div>
                        </div>
                    </div>
                )}

                <Card className="w-full mx-auto medical-card border border-gray-200">
                    <CardHeader className="px-6 py-5 border-b border-gray-200 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <div>
                                <CardTitle className="text-xl font-semibold text-gray-900">
                                    Add New Patient
                                </CardTitle>
                                <CardDescription className="text-gray-600">
                                    Fill in patient details to add a new record
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                        <Form
                            layout="vertical"
                            onFinish={handleSubmit}
                            form={form}
                            className="space-y-6"
                        >
                            {/* Personal Information Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {extraFields.map((field: any) => {
                                        if (["assigned_to_doctor"].includes(field.field_name)) return null;
                                        return (
                                            <Form.Item
                                                key={field.id}
                                                label={<RequiredLabel label={field.field_name.replace(/_/g, ' ').toUpperCase()} />}
                                                name={["extra_fields", field.field_name]}
                                                rules={[{ required: field.is_mandatory, message: `Please enter ${field.field_name.replace(/_/g, ' ')}` }]}
                                            >
                                                <Input 
                                                    placeholder={`Enter ${field.field_name.replace(/_/g, ' ')}`}
                                                    className="w-full"
                                                    disabled={loadingStates.extraFields}
                                                />
                                            </Form.Item>
                                        );
                                    })}

                                    <Form.Item
                                        label={<RequiredLabel label="Date of Birth" />}
                                        name="dateOfBirth"
                                        rules={[
                                            { required: true, message: "Please select date of birth" },
                                        ]}
                                    >
                                        <Input 
                                            type="date" 
                                            className="w-full"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label={<RequiredLabel label="Gender" />}
                                        name="gender"
                                        rules={[{ required: true, message: "Please select gender" }]}
                                    >
                                        <AntdSelect
                                            placeholder="Select gender"
                                            className="w-full"
                                            options={[
                                                { value: "MALE", label: "Male" },
                                                { value: "FEMALE", label: "Female" },
                                                { value: "OTHER", label: "Other" },
                                            ]}
                                        />
                                    </Form.Item>
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Form.Item
                                        label={<RequiredLabel label="Phone" />}
                                        name="phone"
                                        rules={[{ required: true, message: "Please enter phone number" }]}
                                    >
                                        <Input 
                                            placeholder="Enter phone number"
                                            className="w-full"
                                        />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        label={<RequiredLabel label="Email" />}
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
                                        />
                                    </Form.Item>
                                </div>
                            </div>

                            {/* Address Information Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Address Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Form.Item
                                        label={<RequiredLabel label="Street" />}
                                        name="street"
                                        rules={[{ required: true, message: "Please enter street address" }]}
                                    >
                                        <Input 
                                            placeholder="Enter street address"
                                            className="w-full"
                                        />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        label={<RequiredLabel label="City" />}
                                        name="city"
                                        rules={[{ required: true, message: "Please enter city" }]}
                                    >
                                        <Input 
                                            placeholder="Enter city"
                                            className="w-full"
                                        />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        label={<RequiredLabel label="State" />}
                                        name="state"
                                        rules={[{ required: true, message: "Please enter state" }]}
                                    >
                                        <Input 
                                            placeholder="Enter state"
                                            className="w-full"
                                        />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        label={<RequiredLabel label="ZIP Code" />}
                                        name="zipCode"
                                        rules={[{ required: true, message: "Please enter ZIP code" }]}
                                    >
                                        <Input 
                                            placeholder="Enter ZIP code"
                                            className="w-full"
                                        />
                                    </Form.Item>
                                    
                                    <Form.Item
                                        label={<RequiredLabel label="Country" />}
                                        name="country"
                                        rules={[{ required: true, message: "Please select country" }]}
                                        className="md:col-span-2"
                                    >
                                        <AntdSelect
                                            placeholder="Select country"
                                            showSearch
                                            className="w-full"
                                            optionFilterProp="label"
                                            options={countries.map((c) => ({ value: c, label: c }))}
                                        />
                                    </Form.Item>
                                </div>
                            </div>

                            {/* Medical Information Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Medical Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Form.Item
                                        label={<span className="font-medium text-gray-700">Blood Type</span>}
                                        name="bloodType"
                                    >
                                        <AntdSelect
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

                                    <Form.Item
                                        label={<RequiredLabel label="Department" />}
                                        name="department_id"
                                        rules={[{ required: true, message: "Please select department" }]}
                                    >
                                        <AntdSelect
                                            placeholder="Select department"
                                            className="w-full"
                                            loading={loadingStates.departments}
                                            options={departmentList.map((d) => ({ value: d.id, label: d.name, key: d.id }))}
                                        />
                                    </Form.Item>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/patients")}
                                    className="flex-1 sm:flex-none"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <WhiteSpinner size="small" />
                                            Adding Patient...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add Patient
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}