import React, { useState, useEffect } from "react";
import { Table, Popconfirm, Select, Checkbox } from "antd";
import { useNavigate } from "react-router-dom";
import { Patient } from "@/types/patient";
import { DeleteApi, getApi, PostApi, PutApi } from "@/ApiService";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const { Option } = Select;

export default function UserFieldsList() {
    const [userFields, setUserFields] = useState<Patient[]>([]);
    const navigate = useNavigate();
    const [userTypes, setUserTypes] = useState([])
    const [selectedField, setSelectedField] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState<any>({
        field_name: "", is_mandatory: false, user_type: ""
    });

    const simulateLoading = () => {
        setIsLoading(true);
    };

    const handleOpenModal = (doctor = null) => {
        if (doctor) {
            setSelectedField(doctor);
            setForm({
                id: doctor.id,
                field_name: doctor.field_name,
                is_mandatory: doctor.is_mandatory,
                field_type: doctor.field_type,
                user_type: doctor.user_type
            });
        } else {
            setSelectedField(null);
            setForm({ field_name: "", is_mandatory: false, user_type: "" });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        simulateLoading();

        if (!form.field_name || !form.user_type) {
            toast.error("Please fill in all fields");
            setIsLoading(false);
            return;
        }

        if (selectedField) {
            // Update existing doctor
            await PutApi(`/user-fields`, form)
                .then((data) => {
                    if (!data?.error) {
                        toast.success("User type updated successfully!");
                        loadData();
                    }
                    else {
                        toast.error(data.error);
                        console.error("Error fetching user fields:", data.error);
                    }
                }).catch((error) => {
                    toast.error("Error updating user type");
                    console.error("Error deleting user field:", error);
                }).finally(() => {
                    setIsLoading(false);
                })

        } else {
            // Add new doctor
            await PostApi(`/user-fields`, form)
                .then((data) => {
                    if (!data?.error) {
                        toast.success("User type added successfully!");
                        loadData();
                    }
                    else {
                        toast.error(data.error);
                        console.error("Error fetching user fields:", data.error);
                    }
                }).catch((error) => {
                    toast.error("Error adding user type");
                    console.error("Error deleting user field:", error);
                }).finally(() => {
                    setIsLoading(false);
                })
        }

        setIsModalOpen(false);
        setSelectedField(null);
        setForm({ field_name: "", is_mandatory: false, user_type: "" });
    };

    const loadData = async () => {
        simulateLoading()
        Promise.all([
            getApi(`/user-fields`),
            getApi(`/user-types`),
        ]).then(([data, usertypesData]) => {
            if (!data?.error) {
                setUserFields(data);
            }
            else {
                console.error("Error fetching user fields:", data.error);
            }
            if (!usertypesData?.error) {
                setUserTypes(usertypesData);
            }
            else {
                console.error("Error fetching user types:", usertypesData.error);
            }
        }).catch((error) => {
            console.error("Error deleting user field:", error);
        }).finally(() => {
            setIsLoading(false);
        })
    };

    useEffect(() => {
        loadData();
    }, []);

    const deleteUserField = async (id: string) => {
        simulateLoading()
        await DeleteApi(`/user-fields`, { id: id })
            .then((data) => {
                if (!data?.error) {
                    toast.success("Successfully deleted user type");
                    loadData();
                }
                else {
                    toast.error(data.error);
                    console.error("Error fetching user fields:", data.error);
                }
            }).catch((error) => {
                toast.error("Error deleting user type");
                console.error("Error deleting user field:", error);
            }).finally(() => {
                setIsLoading(false);
            })
    };


    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Field name", dataIndex: "field_name", key: "field_name" },
        { title: "User type", dataIndex: "user_type", key: "user_type" },
        {
            title: "Mandatory", dataIndex: "is_mandatory", key: "is_mandatory",
            render: (value) => value.toString()
        },
        // { title: "Description", dataIndex: "description", key: "description" },
        {
            title: "Action",
            key: "action",
            render: (_: any, record: Patient) => (
                <>
                    <Button size="sm" className="mr-2" onClick={() => handleOpenModal(record)}>Edit</Button>
                    {/* <Popconfirm
                        title="Are you sure you want to delete?"
                        onConfirm={() => deleteUserField(record.id)}
                    >
                        <Button size="sm" variant="destructive">Delete</Button>
                    </Popconfirm> */}
                </>
            ),
        },
    ];

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">User Fields List</h1>
                <Button onClick={() => handleOpenModal()}>
                    Add User Field
                </Button>
            </div>

            <Table
                dataSource={userFields}
                columns={columns}
                rowKey="id"
            />

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>{selectedField ? "Edit User type" : "Add User type"}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Field name *</Label>
                                <Input
                                    id="name"
                                    value={form.field_name}
                                    onChange={(e) => setForm({ ...form, field_name: e.target.value })}
                                    placeholder="Enter name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Field name *</Label>
                                <Select
                                    showSearch
                                    placeholder="Select doctor"
                                    value={form.user_type}
                                    optionFilterProp="children"
                                    onChange={(e) => setForm({ ...form, user_type: e })}
                                // onChange={(value) => {
                                //     const doctor = userTypes.find(d => d.name === value);

                                // }}
                                >
                                    {userTypes.map(d => <Option key={d.id} value={d.id}>{d.type}</Option>)}
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Field type *</Label>
                                <Select
                                    showSearch
                                    placeholder="Select doctor"
                                    optionFilterProp="children"
                                    value={form.field_type}
                                    onChange={(e) => setForm({ ...form, field_type: e })}
                                >
                                    {["STRING", "INTEGER", "JSON"].map(d => <Option key={d} value={d}>{d}</Option>)}
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Mandatory *</Label>
                                <Checkbox
                                    id="name"
                                    checked={form.is_mandatory}
                                    onChange={(e) => {
                                        setForm({ ...form, is_mandatory: e.target.checked })
                                    }}
                                />
                            </div>


                            <div className="flex justify-end space-x-2 pt-4">
                                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button onClick={handleSubmit}>
                                    {selectedField ? "Update User type" : "Add User type"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
