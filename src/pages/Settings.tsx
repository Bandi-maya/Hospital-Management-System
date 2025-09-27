// src/pages/Settings.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

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

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: api.getSettings,
  });

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
  if (!isLoading && settings && profile.name === "") {
    setProfile({ name: settings.name, email: settings.email, password: "" });
    setPreferences({
      darkMode: settings.darkMode,
      notifications: settings.notifications,
    });
  }

  if (isLoading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
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
          </Button>
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
