import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Form, Select as AntdSelect } from "antd";
import TextArea from "antd/es/input/TextArea";
import { getApi, PostApi } from "@/ApiService";
import { toast } from "sonner";

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

export default function AddTechnician({ onAddPatient }: AddPatientProps) {
    const navigate = useNavigate();

    const [form] = Form.useForm();
    const [departmentList, setDepartmentList] = useState<any[]>([])
    const [extraFields, setExtraFields] = useState<any>([])

    function getExtraFields() {
        getApi("/user-fields")
            .then((data) => {
                if (!data?.error) {
                    setExtraFields(data.filter((field) => field.user_type_data.type.toUpperCase() === 'NURSE'));
                }
                else {
                    toast.error("Error fetching doctors: " + data.error);
                    console.error("Error fetching doctors:", data.error);
                }
            }).catch((error) => {
                toast.error("Error fetching doctors");
                console.error("Error deleting doctors:", error);
            });
    }

    function getDepartments() {
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
                console.error("Error deleting departments:", error);
            });
    }

    useEffect(() => {
        getExtraFields()
        getDepartments()
    }, [])

    const handleSubmit = async (values: any) => {
        const date = new Date(values.dateOfBirth);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const dd = String(date.getDate()).padStart(2, '0');

        const formattedDate = `${yyyy}-${mm}-${dd}`;

        const newPatient: any = {
            extra_fields: values.extra_fields,
            department_id: values.department_id,
            user_type_id: 6,
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
                    toast.success("Lab Technician added successfully!");
                    navigate("/lab-technician");
                }
                else {
                    toast.error(data.error)
                    console.error("Error fetching user fields:", data.error);
                }
            }).catch((error) => {
                toast.error("Error occurred while adding the user.")
                console.error("Error adding user:", error);
            });

    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Patient Management</h1>
                    <p className="text-muted-foreground">Add Patient</p>
                </div>
            </div>

            <Card className="medical-card">
                <CardHeader>
                    <CardTitle>Add New Patient</CardTitle>
                    <CardDescription>
                        Fill in patient details to add a new record
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form
                        layout="vertical"
                        onFinish={handleSubmit}
                        form={form}
                        className="space-y-6"
                    >
                        {/* Personal Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {
                                extraFields.map((field) => {
                                    if (["assigned_to_doctor"].includes(field.field_name)) return null
                                    return <Form.Item
                                        label={field.field_name}
                                        name={["extra_fields", field.field_name]}
                                        rules={[{ required: field.is_mandatory, message: `Please enter ${field.field_name}` }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                })
                            }

                            <Form.Item
                                label="Date of Birth"
                                name="dateOfBirth"
                                rules={[
                                    { required: true, message: "Please select date of birth" },
                                ]}
                            >
                                <Input type="date" />
                            </Form.Item>

                            <Form.Item
                                label="Gender"
                                name="gender"
                                rules={[{ required: true, message: "Please select gender" }]}
                            >
                                <AntdSelect
                                    options={[
                                        { value: "MALE", label: "Male" },
                                        { value: "FEMALE", label: "Female" },
                                        { value: "OTHER", label: "Other" },
                                    ]}
                                />
                            </Form.Item>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Form.Item
                                label="Phone"
                                name="phone"
                                rules={[{ required: true, message: "Please enter phone" }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[{ required: true, message: "Please enter email" }]}
                            >
                                <Input type="email" />
                            </Form.Item>
                        </div>

                        {/* Address */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Form.Item
                                label="Street"
                                name="street"
                                rules={[{ required: true, message: "Please enter street" }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="City"
                                name="city"
                                rules={[{ required: true, message: "Please enter city" }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="State"
                                name="state"
                                rules={[{ required: true, message: "Please enter state" }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="ZIP Code"
                                name="zipCode"
                                rules={[{ required: true, message: "Please enter ZIP code" }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Country"
                                name="country"
                                rules={[{ required: true, message: "Please select country" }]}
                            >
                                <AntdSelect
                                    placeholder="Select country"
                                    showSearch
                                    options={countries.map((c) => ({ value: c, label: c }))}
                                />
                            </Form.Item>
                        </div>

                        {/* Medical Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Form.Item
                                label="Blood Type"
                                name="bloodType"
                                // rules={[
                                //     { required: true, message: "Please select blood type" },
                                // ]}
                            >
                                <AntdSelect
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
                                label="Department"
                                name="department_id"
                                rules={[{ required: true, message: "Please select doctor" }]}
                            >
                                <AntdSelect
                                    placeholder="Select department"
                                    options={departmentList.map((d) => ({ value: d.id, label: d.name, key: d.id }))}
                                />
                            </Form.Item>
                        </div>

                        <div className="sm:col-span-2">
                            <Button
                                type="submit"
                                className="bg-primary hover:bg-primary-dark text-primary-foreground w-full"
                            >
                                Add Patient
                            </Button>
                        </div>
                    </Form>
                </CardContent>
            </Card>
        </div >
    );
}