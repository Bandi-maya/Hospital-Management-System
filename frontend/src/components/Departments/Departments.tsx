import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { InputNumber, Select } from "antd";
import { countries } from "@/components/Patients/AddPatient";
import { getApi, PostApi, PutApi } from "@/ApiService";

const { Option } = Select;

export interface DepartmentInterface {
    id: number;
    name: string;
    description: string;
}

export default function Department() {
    const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<DepartmentInterface | null>(null);
    const [form, setForm] = useState({
        name: "",
        description: "",
    });
    const [loading, setLoading] = useState(false)
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");

    function loadData() {
        setLoading(true)
        getApi('/departments')
            .then((data) => {
                if (!data.error) {
                    setDepartments(data);
                }
                else {
                    toast.error(data.error);
                }
            })
            .catch((error) => {
                console.error("Error fetching departments:", error);
                toast.error("Failed to fetch departments");
            }).finally(() => setLoading(false));
    }

    useEffect(() => {
        loadData()
    }, []);

    const handleOpenModal = (department = null) => {
        if (department) {
            setSelectedDepartment(department);
            setForm({
                name: department.name,
                description: department.description,
            });
        } else {
            setSelectedDepartment(null);
            setForm({
                name: "",
                description: "",
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        setIsLoading(true);

        if (!form.name || !form.description) {
            toast.error("Please fill in all fields");
            setIsLoading(false);
            return;
        }

        if (selectedDepartment) {
            PutApi(`/departments`, { ...form, id: selectedDepartment.id })
                .then((data) => {
                    if (!data.error) {
                        toast.success("Department updated successfully!");
                        setIsModalOpen(false);
                        loadData()
                    }
                    else {
                        toast.error(data.error);
                    }
                })
                .catch((error) => {
                    console.error("Error updating department:", error);
                    toast.error("Failed to update department");
                }).finally(() => setIsLoading(false));
        } else {
            PostApi(`/departments`, { ...form })
                .then((data) => {
                    if (!data.error) {
                        toast.success("Department created successfully!");
                        setIsModalOpen(false);
                        loadData()
                    }
                    else {
                        toast.error(data.error);
                    }
                })
                .catch((error) => {
                    console.error("Error updating department:", error);
                    toast.error("Failed to update department");
                }).finally(() => setIsLoading(false));
        }

        setSelectedDepartment(null);
        setForm({
            name: "",
            description: ""
        });
    };

    const filteredDepartments = departments.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-2xl font-bold">Department Management</h1>
                <div className="flex gap-2">
                    <Input
                        placeholder="Search department..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button onClick={() => handleOpenModal()}>Add Department</Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Departments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredDepartments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No departments found.
                            </div>
                        ) : (
                            filteredDepartments.map((department) => (
                                <div key={department.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold">{department.name}</h3>
                                        <p className="text-sm text-gray-600">{department.description}</p>
                                    </div>
                                    <div className="space-x-2">
                                        <Button size="sm" onClick={() => handleOpenModal(department)}>Edit</Button>
                                        {/* <Button size="sm" variant="destructive" onClick={() => handleDelete(Department.id)}>Delete</Button> */}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>{selectedDepartment ? "Edit Department" : "Add Department"}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Department name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Description *</Label>
                                <Input
                                    id="description"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Description"
                                />
                            </div>


                            <div className="flex justify-end space-x-2 pt-4">
                                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button onClick={handleSubmit}>
                                    {selectedDepartment ? "Update Department" : "Add Department"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
