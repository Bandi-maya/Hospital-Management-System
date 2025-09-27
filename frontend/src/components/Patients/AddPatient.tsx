import React, { useState } from "react";
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
import { PostApi } from "@/ApiService";

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
const countries = [
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

export default function AddPatient({ onAddPatient }: AddPatientProps) {
    const navigate = useNavigate();

    const [form] = Form.useForm();

    const handleSubmit = async (values: any) => {
        const date = new Date(values.dateOfBirth);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const dd = String(date.getDate()).padStart(2, '0');

        const formattedDate = `${yyyy}-${mm}-${dd}`;

        const newPatient: any = {
            extra_fields: {
                first_name: values.firstName,
                last_name: values.lastName,
                disease: (values.diseases ?? []).join(", "),
                previous_diseases: values.previousDiseases || "",
                assigned_to_doctor: values.assignedDoctor || "",
            },
            user_type_id: 3,
            username: values.email,
            name: `${values.firstName} ${values.lastName}`,
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
            // status: values.status,
            // medicalHistory: values.diseases.map((disease: string) => ({
            //     id: uuidv4(),
            //     patientId: "",
            //     doctorId: "",
            //     condition: disease,
            //     diagnosisDate: new Date(),
            //     treatment: "",
            //     notes: "",
            //     doctor: values.assignedDoctor,
            //     status: "active",
            //     isActive: true,
            //     createdAt: new Date(),
            //     updatedAt: new Date(),
            // })),
            // allergies: [],
            // currentMedications: [],
            // createdAt: new Date(),
            // updatedAt: new Date(),
            // assignedDoctor: values.assignedDoctor,
        };

        await PostApi(`/users`, newPatient)
            .then((data) => {
                if (!data?.error) {
                    alert("Patient added successfully!");
                    navigate("/patients");
                }
                else {
                    console.error("Error fetching user fields:", data.error);
                }
            }).catch((error) => {
                console.error("Error deleting user field:", error);
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
                            <Form.Item
                                label="First Name"
                                name="firstName"
                                rules={[{ required: true, message: "Please enter first name" }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Last Name"
                                name="lastName"
                                rules={[{ required: true, message: "Please enter last name" }]}
                            >
                                <Input />
                            </Form.Item>
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
                                rules={[
                                    { required: true, message: "Please select blood type" },
                                ]}
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
                                label="Assigned Doctor"
                                name="assignedDoctor"
                                rules={[{ required: true, message: "Please select doctor" }]}
                            >
                                <AntdSelect
                                    placeholder="Select doctor"
                                    options={doctorList.map((d) => ({ value: d, label: d }))}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Ward Number"
                                name="wardNumber"
                            // rules={[{ required: true, message: "Please select ward" }]}
                            >
                                <AntdSelect
                                    options={wardList.map((w) => ({ value: w, label: w }))}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Bed Number"
                                name="bedNumber"
                            // rules={[{ required: true, message: "Please select bed" }]}
                            >
                                <AntdSelect
                                    options={bedList.map((b) => ({ value: b, label: b }))}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Diseases"
                                name="diseases"
                                rules={[
                                    { required: true, message: "Please select at least one disease" },
                                ]}
                            >
                                <AntdSelect
                                    mode="multiple"
                                    placeholder="Select disease(s)"
                                    options={diseaseSuggestions.map((d) => ({
                                        value: d,
                                        label: d,
                                    }))}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Previous Diseases"
                                name="previous_diseases"
                            >
                                <TextArea
                                    placeholder="Select disease(s)"
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
        </div>
    );
}