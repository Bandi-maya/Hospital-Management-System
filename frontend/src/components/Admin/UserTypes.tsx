import React, { useState, useEffect } from "react";
import { Table, Popconfirm, Button as AntdButton } from "antd";
import { useNavigate } from "react-router-dom";
import { Patient } from "@/types/patient";
import { DeleteApi, getApi, PostApi, PutApi } from "@/ApiService";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function UserTypesList() {
    const [userTypes, setUserTypes] = useState<Patient[]>([]);
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState<any>({
        type: "",
        description: "",
    });

    const loadData = async () => {
        simulateLoading()
        await getApi(`/user-types`)
            .then((data) => {
                if (!data?.error) {
                    setUserTypes(data);
                }
                else {
                    console.error("Error fetching user fields:", data.error);
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

    const deleteUserType = async (id: string) => {
        simulateLoading()
        await DeleteApi(`/user-types`, { id: id })
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
        { title: "User Type", dataIndex: "type", key: "type" },
        { title: "Description", dataIndex: "description", key: "description" },
        {
            title: "Action",
            key: "action",
            render: (_: any, record: Patient) => (
                <>
                    <Button size="sm" onClick={() => handleOpenModal(record)}>Edit</Button>
                    <Popconfirm
                        title="Are you sure you want to delete?"
                        onConfirm={() => deleteUserType(record.id)}
                    >
                        <Button size="sm" variant="destructive">Delete</Button>
                    </Popconfirm>
                </>
            ),
        },
    ];

    const simulateLoading = () => {
        setIsLoading(true);
    };

    const handleOpenModal = (doctor = null) => {
        if (doctor) {
            setSelectedType(doctor);
            setForm({
                id: doctor.id,
                type: doctor.type,
                description: doctor.description,
            });
        } else {
            setSelectedType(null);
            setForm({ type: "", description: "" });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        simulateLoading();

        if (!form.type || !form.description) {
            toast.error("Please fill in all fields");
            setIsLoading(false);
            return;
        }

        if (selectedType) {
            // Update existing doctor
            await PutApi(`/user-types`, form)
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
            await PostApi(`/user-types`, form)
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
        setSelectedType(null);
        setForm({ type: "", description: "" });
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">User Types List</h1>
                <Button onClick={() => handleOpenModal()}>
                    Add User Type
                </Button>
            </div>

            <Table
                dataSource={userTypes}
                columns={columns}
                rowKey="id"
            />

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>{selectedType ? "Edit User type" : "Add User type"}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">User type *</Label>
                                <Input
                                    id="name"
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    placeholder="Enter name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Description *</Label>
                                <Input
                                    id="name"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Enter description"
                                />
                            </div>


                            <div className="flex justify-end space-x-2 pt-4">
                                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button onClick={handleSubmit}>
                                    {selectedType ? "Update User type" : "Add User type"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
