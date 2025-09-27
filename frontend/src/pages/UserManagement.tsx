// src/pages/UserManagement.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Dummy API service (replace with real API calls)
const api = {
  async getUsers() {
    return [
      { id: 1, name: "Dr. Maya", email: "maya@example.com", role: "Admin" },
      { id: 2, name: "John Doe", email: "john@example.com", role: "Doctor" },
    ];
  },
  async addUser(user: { name: string; email: string; role: string }) {
    return { id: Math.random(), ...user };
  },
  async deleteUser(id: number) {
    return { success: true };
  },
};

export default function UserManagement() {
  const queryClient = useQueryClient();

  // Fetch Users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: api.getUsers,
  });

  // Add User Mutation
  const addUserMutation = useMutation({
    mutationFn: api.addUser,
    onSuccess: (newUser) => {
      queryClient.setQueryData(["users"], (old: any) =>
        old ? [...old, newUser] : [newUser]
      );
      toast.success("User added successfully!");
    },
  });

  // Delete User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: api.deleteUser,
    onSuccess: (_, id) => {
      queryClient.setQueryData(["users"], (old: any) =>
        old ? old.filter((u: any) => u.id !== id) : []
      );
      toast.success("User deleted successfully!");
    },
  });

  // Form State
  const [form, setForm] = useState({ name: "", email: "", role: "" });

  const handleAddUser = () => {
    if (!form.name || !form.email || !form.role) {
      toast.error("All fields are required");
      return;
    }
    addUserMutation.mutate(form);
    setForm({ name: "", email: "", role: "" });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                placeholder="Role (e.g., Admin, Doctor)"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleAddUser} disabled={addUserMutation.isPending}>
                {addUserMutation.isPending ? "Adding..." : "Add User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* User Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteUserMutation.mutate(user.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
