import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import DonorDashboard from "./pages/donor/Dashboard";
import DonorProfile from "./pages/donor/Profile";
import EligibilityForm from "./pages/donor/EligibilityForm";
import DonateBlood from "./pages/donor/DonateBlood";
import Certificate from "./pages/donor/Certificate";

import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import HospitalRequests from "./pages/hospital/Requests";
import HospitalProfile from "./pages/hospital/Profile";
import StaffManagement from "./pages/hospital/StaffManagement";
import PatientRegistration from "./pages/hospital/PatientRegistration";
import LabTesting from "./pages/hospital/LabTesting";
import DoctorDashboard from "./pages/hospital/DoctorDashboard";
import HospitalInventory from "./pages/hospital/HospitalInventory";
import ManageCamps from "./pages/hospital/ManageCamps";

import Users from "./pages/admin/Users";
import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";

export default function App() {
  const { role } = useSelector((s) => s.auth);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= DONOR ================= */}
        <Route
          path="/donor"
          element={
            <ProtectedRoute role="donor">
              <DonorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/donor/profile"
          element={
            <ProtectedRoute role="donor">
              <DonorProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/donor/eligibility"
          element={
            <ProtectedRoute role="donor">
              <EligibilityForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/donor/donate"
          element={
            <ProtectedRoute role="donor">
              <DonateBlood />
            </ProtectedRoute>
          }
        />

        <Route
          path="/donor/certificate/:donationId"
          element={
            <ProtectedRoute role="donor">
              <Certificate />
            </ProtectedRoute>
          }
        />

        {/* ================= HOSPITAL ROLES ================= */}
        <Route
          path="/hospital"
          element={
            <ProtectedRoute role="hospital">
              <HospitalDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital/inventory"
          element={
            <ProtectedRoute role="hospital">
              <HospitalDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital/camps"
          element={
            <ProtectedRoute role="hospital">
              <HospitalDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital/profile"
          element={
            <ProtectedRoute role="hospital">
              <HospitalDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital/staff"
          element={
            <ProtectedRoute role="hospital">
              <HospitalDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Staff Specific Dashboards */}
        <Route
          path="/tester"
          element={
            <ProtectedRoute role="tester">
              <LabTesting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital/patients"
          element={
            <ProtectedRoute role={["hospital", "receptionist"]}>
              <PatientRegistration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receptionist"
          element={
            <ProtectedRoute role="receptionist">
              <PatientRegistration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute role="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nurse"
          element={
            <ProtectedRoute role="nurse">
              <HospitalRequests /> 
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />



        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <Users />
            </ProtectedRoute>
          }
        />
      </Routes>
      </main>
      <Footer />
    </div>
  );
}
