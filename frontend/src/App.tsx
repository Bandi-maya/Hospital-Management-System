import React, { Suspense, lazy } from "react";
import { Toaster as Sonner } from "./Components/UI/sonner";
import { TooltipProvider } from "./Components/UI/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import AuthGuard from "./Components/Auth/AuthGuard";
import Layout from "@/Components/Layout/Layout";
import NotFound from "./pages/NotFound";
import AddPatient from "./Components/Patients/AddPatient";
import MedicalRecords from "./Components/Patients/MedicalRecords";
import Schedules from "./Components/Doctor/Schedules";
import Specializations from "./Components/Doctor/Specializations";
import CalenderView from "./Components/Appointments/CalenderView";
import MedicalInventory from "./Components/Pharmacy/MedicalInventory";
import Prescriptions from "./Components/Prescription/Prescriptions";
import PurchaseOrders from "./Components/Pharmacy/PurchaseOrders";
import LabTests from "./Components/Laboratory/LabTests";
import LabReports from "./Components/Laboratory/LabReports";
import TestResults from "./Components/Laboratory/TestResults";
import Payments from "./Components/BillingAndInvoice/Payments";
import InsuranceClaims from "./Components/BillingAndInvoice/InsuranceClaims";
import WardAllocations from "./Components/Ward/WardAllocation";
import EmergencyCases from "./Components/Emergency/EmergencyCases";
import Triage from "./Components/Emergency/Triage";
import Users from "./Components/Admin/Users";
import Roles from "./Components/Admin/Roles";
import AdminSettings from "./Components/Admin/Settings";
import AuditLogs from "./Components/Admin/AuditLogs";

// ✅ Import PatientProvider to wrap entire app
import { PatientProvider } from "../src/Components/Patients/PatientContext";
import UserTypesList from "./Components/Admin/UserTypes";
import UserFieldsList from "./Components/Admin/UserFields";
import Department from "./Components/Departments/Departments";
import DepartmentUsers from "./Components/Departments/DepartmentUsers";
import TokenCalendarView from "./Components/Tokens/CalenderView";
import CreateToken from "./Components/Tokens/CreateToken";
import TokenManagement from "./pages/TokenManagement";
import Billing from "./Components/BillingAndInvoice/Billing";
import SurgeryList from "./Components/Surgery/SurgeriesList";
import SurgeryType from "./Components/Surgery/SurgeryTypes";
import OperationTheatres from "./Components/Surgery/OperationTheatres";
import AddReseptionist from "./Components/Receptionist/AddReseptionist";
import ReseptionistList from "./Components/Receptionist/ReseptionistList";
import NurseList from "./Components/Nurse/NurseList";
import AddNurse from "./Components/Nurse/AddNurse";
import TechnicianList from "./Components/LabTechnicians/TechnicianList";
import AddTechnician from "./Components/LabTechnicians/AddLabTechnician";
import PharmacistList from "./Components/Pharmacist/PharmacistList";
import AddPharmacist from "./Components/Pharmacist/AddPharmacist";
import LogoUploader from "./Components/Patients/LogoUploader";
import Login from "./Components/Auth/Login";
import DoctorList from "./Components/Doctor/DoctorsList";
import AddDoctor from "./Components/Doctor/AddDoctor";
import BookAppointment from "./components/Appointments/BookAppointment";
import WardStatus from "./components/Ward/WardStatus";

// Lazy load pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PatientManagement = lazy(() => import("./pages/PatientManagement"));
const DoctorManagement = lazy(() => import("./pages/DoctorManagement"));
const AppointmentManagement = lazy(() => import("./pages/AppointmentManagement"));
// const Billing = lazy(() => import("./pages/Billing"));
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
                  path="/admin/settings"
                  element={
                    <AuthGuard>
                      <Layout>
                        <LogoUploader />
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
                        <DoctorList />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/doctors/add"
                  element={
                    <AuthGuard requiredPermission="doctors:write">
                      <Layout>
                        <AddDoctor />
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
                  path="/nurse"
                  element={
                    <AuthGuard requiredPermission="nurse:read">
                      <Layout>
                        <NurseList />
                      </Layout>
                    </AuthGuard>
                  }
                />

                  <Route
                  path="/nurse/add"
                  element={
                    <AuthGuard requiredPermission="nurse:read">
                      <Layout>
                        <AddNurse />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/receptionist"
                  element={
                    <AuthGuard requiredPermission="receptionist:read">
                      <Layout>
                        <ReseptionistList />
                      </Layout>
                    </AuthGuard>
                  }
                />

                  <Route
                  path="/receptionist/add"
                  element={
                    <AuthGuard requiredPermission="receptionist:read">
                      <Layout>
                        {/* ✅ No more onAddPatient prop */}
                        <AddReseptionist />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/lab-technician"
                  element={
                    <AuthGuard requiredPermission="lab-technician:read">
                      <Layout>
                        <TechnicianList />
                      </Layout>
                    </AuthGuard>
                  }
                />

                  <Route
                  path="/lab-technician/add"
                  element={
                    <AuthGuard requiredPermission="lab-technician:read">
                      <Layout>
                        {/* ✅ No more onAddPatient prop */}
                        <AddTechnician />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/pharmacist"
                  element={
                    <AuthGuard requiredPermission="pharmacist:read">
                      <Layout>
                        <PharmacistList />
                      </Layout>
                    </AuthGuard>
                  }
                />

                  <Route
                  path="/pharmacist/add"
                  element={
                    <AuthGuard requiredPermission="pharmacist:read">
                      <Layout>
                        {/* ✅ No more onAddPatient prop */}
                        <AddPharmacist />
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
                  path="/tokens"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <TokenManagement />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/tokens/calendar"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <TokenCalendarView />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/tokens/create"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <CreateToken />
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
                  path="/prescriptions"
                  element={
                    <AuthGuard requiredPermission="prescriptions:read">
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
                  path="/surgery/list"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <SurgeryList />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/surgery/types"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <SurgeryType />
                      </Layout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/surgery/operation-theatres"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <OperationTheatres />
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

                {/* <Route
                  path="/admin/settings"
                  element={
                    <AuthGuard requiredPermission="appointments:read">
                      <Layout>
                        <AdminSettings />
                      </Layout>
                    </AuthGuard>
                  }
                /> */}

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
                        {/* <Billing /> */}
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
