import { getApi } from "@/ApiService";
import { Button } from "antd";
import { set } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DepartmentInterface } from "./Departments";

export default function DepartmentUsers() {
    const [departments, setDepartments] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<DepartmentInterface | null>(null);
    const [loading, setLoading] = useState(false);

    function getUsersByDepartment(departmentId: number) {
        getApi(`/users?department_id=${departmentId}`)
            .then((data) => {
                if (!data.error) {
                    setUsers(data);
                    console.log(data);
                }
                else {
                    console.error(data.error);
                    toast.error(data.error);
                }
            })
            .catch((error) => {
                toast.error("Failed to fetch users");
                console.error("Error fetching users:", error);
            })
    }

    useEffect(() => {
        try {
            setLoading(true)
            getApi(`/departments`)
                .then((data) => {
                    if (!data.error) {
                        setDepartments(data);
                        if (data.length > 0) {
                            setSelectedDepartment(data[0]);
                            getUsersByDepartment(data[0].id);
                        }
                        console.log(data);
                    }
                    else {
                        console.error(data.error);
                        toast.error(data.error);
                    }
                })
                .catch((error) => {
                    toast.error("Failed to fetch users");
                    console.error("Error fetching users:", error);
                })
        }
        catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to fetch users");
        }
        finally { setLoading(false) };
    }, [])

    return (
        <>
            <div>Department Users</div>
            {
                departments.map((dept) => (
                    <Button key={dept.id} onClick={() => {
                        setSelectedDepartment(dept);
                        getUsersByDepartment(dept.id);
                    }}>
                        {dept.name}
                    </Button>
                ))
            }
            <div className="pt-20">
                {
                    users.map((user) => (
                        <div key={user.id} className="p-4 border mb-2">
                            <div>Name: {user.name}</div>
                            <div>Email: {user.email}</div>
                        </div>
                    ))
                }
            </div>
        </>
    )
}