// src/pages/Settings.tsx
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { InputNumber, Popconfirm, Select, Table } from "antd";
import { countries } from "@/components/Patients/AddPatient";
import { getApi, PostApi, PutApi } from "@/ApiService";
import { DepartmentInterface } from "@/components/Departments/Departments";
import { Search, PlusCircle, User, Stethoscope, Mail, Phone, MapPin, Calendar, Edit, Trash2, Filter, Download } from "lucide-react";
import { Patient } from "@/types/patient";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";

// Dummy API (replace with real backend later)
const api = {
  async getSettings() {
    return {
      name: "Dr. Maya",
      email: "maya@example.com",
      darkMode: false,
      notifications: true,
    };
  },
  async updateProfile(data: { name: string; email: string; password?: string }) {
    return { success: true, ...data };
  },
  async updatePreferences(data: { darkMode: boolean; notifications: boolean }) {
    return { success: true, ...data };
  },
};

export default function Settings() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
  const { user }: any = useAuth()
  const [form, setForm] = useState<any>({})
  useEffect(() => {
    setForm({
      address: {
        street: user?.address?.street,
        city: user?.address?.city,
        state: user?.address?.state,
        country: user?.address?.country,
        zip_code: user?.address?.zip_code,
      },
      department_id: user?.department_id,
      date_of_birth: user?.date_of_birth.split("T")[0],
      gender: user?.gender,
      extra_fields: user?.extra_fields?.fields_data,
      email: user?.email,
      phone_no: user?.phone_no,
    })
  }, []);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(user);
  const [extraFields, setExtraFields] = useState<any>([])
  const userTypeId = useMemo(() => {
    return extraFields?.[0]?.user_type
  }, [extraFields])
  const [isLoading, setIsLoading] = useState(false);

  function getExtraFields() {
    getApi("/user-fields")
      .then((data) => {
        if (!data?.error) {
          setExtraFields(data.filter((field) => field.user_type_data.type.toUpperCase() === "NURSE"));
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

  const handleSubmit = () => {
    setIsLoading(true)

    console.log(!form.gender, !form.date_of_birth, !form.address.city, !form.address.state, !form.address.zip_code, !form.address.country, !form.email, !form.phone_no)
    if (!form.gender || !form.date_of_birth || !form.address.city || !form.address.state || !form.address.zip_code || !form.address.country || !form.email || !form.phone_no) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    form.name = form?.extra_fields?.first_name + " " + form?.extra_fields?.last_name

    if (selectedDoctor) {
      PutApi(`/users`, { ...form, id: selectedDoctor.id, user_type_id: selectedDoctor.user_type_id })
        .then((data) => {
          if (!data?.error) {
            toast.success("Doctor updated successfully!");
            setSelectedDoctor({ ...data })
          }
          else {
            toast.error(data.error);
            console.error("Error updating doctor:", data.error);
          }
        }).catch((error) => {
          toast.error("Error updating doctor");
          console.error("Error updating doctor:", error);
        }).finally(() => {
          setIsLoading(false);
        })
    }
    setIsModalOpen(false);
    setSelectedDoctor(null);
    setIsLoading(false);
  };

  // Fetch settings
  // const { data: settings, isLoading } = useQuery({
  //   queryKey: ["settings"],
  //   queryFn: api.getSettings,
  // });
  // 
  // Local form states
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [preferences, setPreferences] = useState({
    darkMode: false,
    notifications: false,
  });

  // Mutations
  const updateProfile = useMutation({
    mutationFn: api.updateProfile,
    onSuccess: (data) => {
      toast.success("Profile updated!");
      queryClient.setQueryData(["settings"], (old: any) => ({
        ...old,
        ...data,
      }));
    },
  });

  const updatePreferences = useMutation({
    mutationFn: api.updatePreferences,
    onSuccess: (data) => {
      toast.success("Preferences updated!");
      queryClient.setQueryData(["settings"], (old: any) => ({
        ...old,
        ...data,
      }));
    },
  });

  // Initialize local state when settings load
  // if (!isLoading && settings && profile.name === "") {
  //   setProfile({ name: settings.name, email: settings.email, password: "" });
  //   setPreferences({
  //     darkMode: settings.darkMode,
  //     notifications: settings.notifications,
  //   });
  // }

  if (isLoading) {
    return <div className="p-6">Loading settings...</div>;
  }

  console.log(user)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50"> */}
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="px-6 py-5 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {selectedDoctor ? "Edit Doctor" : "Add New Doctor"}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {selectedDoctor ? "Update doctor information" : "Fill in the details to add a new doctor"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <div className="flex-1 overflow-y-auto">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">Personal Information</h3>

                    {
                      extraFields.map((field) => {
                        return <div className="space-y-3">
                          <Label htmlFor={field.field_name} className="text-sm font-medium text-gray-700">{field.field_name} *</Label>
                          <Input
                            id={field.field_name}
                            value={form.extra_fields?.[field.field_name]}
                            onChange={(e) => setForm({ ...form, extra_fields: { ...form.extra_fields, [field.field_name]: e.target.value } })}
                            placeholder={`Enter ${field.field_name}`}
                            className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
                          />
                        </div>
                      })
                    }

                    <div className="space-y-3">
                      <Label htmlFor="date_of_birth" className="text-sm font-medium text-gray-700">Date Of Birth *</Label>
                      <Input
                        type="date"
                        id="date_of_birth"
                        value={form.date_of_birth}
                        onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                        className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="gender" className="text-sm font-medium text-gray-700">Gender *</Label>
                      <Select
                        options={[
                          { value: "MALE", label: "Male" },
                          { value: "FEMALE", label: "Female" },
                          { value: "OTHER", label: "Other" },
                        ]}
                        id="gender"
                        value={form.gender}
                        onChange={(value) => setForm({ ...form, gender: value })}
                        placeholder="Select gender"
                        className="w-full [&_.ant-select-selector]:h-11 [&_.ant-select-selection-item]:leading-9"
                        dropdownStyle={{ minWidth: '200px' }}
                        popupMatchSelectWidth={false}
                      />
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">Professional Information</h3>

                    <div className="space-y-3">
                      <Label htmlFor="department_id" className="text-sm font-medium text-gray-700">Department *</Label>
                      <Select
                        disabled
                        id="department_id"
                        options={departments.map((d) => ({ value: d.id, label: d.name, key: d.id }))}
                        value={form.department_id}
                        onChange={(value) => setForm({ ...form, department_id: value })}
                        placeholder="Select department"
                        className="w-full [&_.ant-select-selector]:h-11 [&_.ant-select-selection-item]:leading-9"
                        dropdownStyle={{ minWidth: '250px' }}
                        popupMatchSelectWidth={false}
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">Contact Information</h3>

                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
                      <Input
                        id="email"
                        disabled
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="Email address"
                        className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="phone_no" className="text-sm font-medium text-gray-700">Phone *</Label>
                      <Input
                        id="phone_no"
                        value={form.phone_no}
                        onChange={(e) => setForm({ ...form, phone_no: e.target.value })}
                        placeholder="Phone number"
                        className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200">Address Information</h3>

                    <div className="space-y-3">
                      <Label htmlFor="street" className="text-sm font-medium text-gray-700">Street *</Label>
                      <Input
                        value={form.address?.street || undefined}
                        onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
                        placeholder="Street address"
                        className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="city" className="text-sm font-medium text-gray-700">City *</Label>
                        <Input
                          value={form.address?.city || undefined}
                          onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                          placeholder="City"
                          className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="state" className="text-sm font-medium text-gray-700">State *</Label>
                        <Input
                          value={form.address?.state || undefined}
                          onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })}
                          placeholder="State"
                          className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="zip_code" className="text-sm font-medium text-gray-700">ZIP Code *</Label>
                        <Input
                          value={form.address?.zip_code || undefined}
                          onChange={(e) => setForm({ ...form, address: { ...form.address, zip_code: e.target.value } })}
                          placeholder="ZIP code"
                          className="h-11 border-gray-300 focus:border-blue-500 text-base w-full"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="country" className="text-sm font-medium text-gray-700">Country *</Label>
                        <Select
                          placeholder="Select country"
                          value={form.address?.country || undefined}
                          onChange={(value) => setForm({ ...form, address: { ...form.address, country: value } })}
                          showSearch
                          options={countries.map((c) => ({ value: c, label: c }))}
                          className="w-full [&_.ant-select-selector]:h-11 [&_.ant-select-selection-item]:leading-9"
                          dropdownStyle={{ minWidth: '250px' }}
                          popupMatchSelectWidth={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 sticky bottom-0">
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 px-6 text-base border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="h-11 px-8 text-base bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {selectedDoctor ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    selectedDoctor ? "Update Doctor" : "Add Doctor"
                  )}
                </Button>
              </div>
            </div>
          </Card>
          {/* </div> */}
          {/* <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={profile.password}
              onChange={(e) =>
                setProfile({ ...profile, password: e.target.value })
              }
            />
          </div>
          <Button
            onClick={() => updateProfile.mutate(profile)}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? "Saving..." : "Save Profile"}
          </Button> */}
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Dark Mode</Label>
            <Switch
              checked={preferences.darkMode}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, darkMode: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Enable Notifications</Label>
            <Switch
              checked={preferences.notifications}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, notifications: checked })
              }
            />
          </div>
          <Button
            onClick={() => updatePreferences.mutate(preferences)}
            disabled={updatePreferences.isPending}
          >
            {updatePreferences.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
