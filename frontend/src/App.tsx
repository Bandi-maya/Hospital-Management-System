import React, { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AuthGuard from "@/components/Auth/AuthGuard";
import Layout from "@/components/Layout/Layout";
import Login from "@/components/Auth/Login";
import NotFound from "./pages/NotFound";
import AddPatient from "./components/Patients/AddPatient";
import MedicalRecords from "./components/Patients/MedicalRecords";
import Schedules from "./components/Doctor/Schedules";
import Specializations from "./components/Doctor/Specializations";
import CalenderView from "./components/Appointments/CalenderView";
import BookAppointment from "./components/Appointments/BookAppointment";
import MedicalInventory from "./components/Pharmacy/MedicalInventory";
import Prescriptions from "./components/Pharmacy/Prescriptions";
import PurchaseOrders from "./components/Pharmacy/PurchaseOrders";
import LabTests from "./components/Laboratory/LabTests";
import LabReports from "./components/Laboratory/LabReports";
import TestResults from "./components/Laboratory/TestResults";
import AllInvoices from "./components/BillingAndInvoice/AllInvoice";
import Payments from "./components/BillingAndInvoice/Payments";
import InsuranceClaims from "./components/BillingAndInvoice/InsuranceClaims";
import WardAllocations from "./components/Ward/WardAllocation";
import WardStatus from "./components/Ward/WardStatus";
import EmergencyCases from "./components/Emergency/EmergencyCases";
import Triage from "./components/Emergency/Triage";
import Users from "./components/Admin/Users";
import Roles from "./components/Admin/Roles";
import AdminSettings from "./components/Admin/Settings";
import AuditLogs from "./components/Admin/AuditLogs";

// ✅ Import PatientProvider to wrap entire app
import { PatientProvider } from "../src/components/Patients/PatientContext";
import UserTypesList from "./components/Admin/UserTypes";
import UserFieldsList from "./components/Admin/UserFields";
import Department from "./components/Departments/Departments";
import DepartmentUsers from "./components/Departments/DepartmentUsers";

// Lazy load pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PatientManagement = lazy(() => import("./pages/PatientManagement"));
const DoctorManagement = lazy(() => import("./pages/DoctorManagement"));
const AppointmentManagement = lazy(() => import("./pages/AppointmentManagement"));
const Billing = lazy(() => import("./pages/Billing"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const Index = lazy(() => import("./pages/Index"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <PatientProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/auth/login" element={<Login />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/patients"
                  element={
                    <AuthGuard requiredPermission="patients:read">
                      <Layout>
                        <PatientManagement />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/patients/add"
                  element={
                    <AuthGuard requiredPermission="patients:read">
                      <Layout>
                        {/* ✅ No more onAddPatient prop */}
                        <AddPatient />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/patients/records"
                  element={
                    <AuthGuard requiredPermission="patients:read">
                      <Layout>
                        <MedicalRecords />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/doctors"
                  element={
                    <AuthGuard requiredPermission="doctors:read">
                      <Layout>
                        <DoctorManagement />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/doctors/schedules"
                  element={
                    <AuthGuard requiredPermission="doctors:read">
                      <Layout>
                        <Schedules />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/doctors/specializations"
                  element={
                    <AuthGuard requiredPermission="doctors:read">
                      <Layout>
                        <Specializations />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/appointments"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <AppointmentManagement />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/appointments/calendar"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <CalenderView />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/appointments/book"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <BookAppointment />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/pharmacy/medicines"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <MedicalInventory />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/pharmacy/prescriptions"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <Prescriptions />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/pharmacy/orders"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <PurchaseOrders />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/laboratory/tests"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <LabTests />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/laboratory/results"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <TestResults />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/laboratory/reports"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <LabReports />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/billing/invoices"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <AllInvoices />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/billing/payments"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <Payments />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/billing/insurance"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <InsuranceClaims />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/wards/beds"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <WardAllocations />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/wards"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <WardStatus />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/departments"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <Department />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/departments/users"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <DepartmentUsers />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/emergency/cases"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <EmergencyCases />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/emergency/triage"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <Triage />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/admin/users"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <Users />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/admin/roles"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <Roles />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/admin/settings"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <AdminSettings />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/admin/audit"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <AuditLogs />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/admin/user-types"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <UserTypesList />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/admin/user-fields"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <UserFieldsList />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/system-settings"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <Settings />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/billing"
                  element={
                    <AuthGuard requiredPermission="billing:read">
                      <Layout>
                        <Billing />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/reports"
                  element={
                    <AuthGuard requiredPermission="reports:read">
                      <Layout>
                        <Reports />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/users"
                  element={
                    <AuthGuard requiredPermission="users:read">
                      <Layout>
                        <UserManagement />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Settings />
                      </Layout>
                    </AuthGuard>
                  }
                />

                {/* Root redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Unauthorized */}
                <Route
                  path="/unauthorized"
                  element={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-2xl font-bold text-destructive mb-2">
                          Access Denied
                        </h1>
                        <p className="text-muted-foreground">
                          You don't have permission to access this page.
                        </p>
                      </div>
                    </div>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PatientProvider>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
