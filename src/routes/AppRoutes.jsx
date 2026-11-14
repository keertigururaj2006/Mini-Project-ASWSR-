import { useEffect, useLayoutEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import LoginPage from "../pages/Public/LoginPage.jsx";
import HomePage from "../pages/Public/HomePage.jsx";
import Programmes from "../pages/Public/Programmes.jsx";
import AdmissionProcess from "../pages/Public/AdmissionProcess.jsx";
import RegisterPage from "../pages/Public/RegisterPage.jsx";
import ForgotPasswordPage from "../pages/Public/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../pages/Public/ResetPasswordPage.jsx";

import ApplicantDashboard from "../pages/Applicant/ApplicantDashboard.jsx";
import EditProfile from "../pages/Applicant/EditProfile.jsx";

import OfficerDashboard from "../pages/Officer/OfficerDashboard.jsx";
import AdmissionOfficerDashboard from "../pages/AdmissionOfficer/AdmissionOfficerDashboard.jsx";
import EvaluatorDashboard from "../pages/Evaluator/EvaluatorDashboard.jsx";
import AdminDashboard from "../pages/Admin/AdminDashboard.jsx";

import { apiRequest } from "../services/api.js";

function ProtectedRoute({ allowedRole, children }) {
  const [status, setStatus] = useState("checking");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      try {
        const result = await apiRequest("/auth/me");
        const currentUser = result?.data;

        if (!currentUser?.roleCode) {
          throw new Error("Invalid user session.");
        }

        localStorage.setItem("credifit_user", JSON.stringify(currentUser));

        if (isMounted) {
          setUser(currentUser);
          setStatus("authenticated");
        }
      } catch (err) {
        if (!localStorage.getItem("credifit_access_token")) {
          localStorage.removeItem("credifit_user");

          if (isMounted) {
            setStatus("unauthenticated");
          }
        } else if (isMounted) {
          setError(err.message || "Unable to verify your session.");
          setStatus("error");
        }
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking your session...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  const roleDashboards = {
    APPLICANT: "/applicant/dashboard",
    ADMISSION_OFFICER: "/admission-officer/dashboard",
    EVALUATOR: "/evaluator/dashboard",
    ADMIN: "/admin/dashboard",
  };

  if (allowedRole && user.roleCode !== allowedRole) {
    return <Navigate to={roleDashboards[user.roleCode] || "/login"} replace />;
  }

  return children;
}

function ScrollToTop() {
  const { pathname, key } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, key]);

  return null;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/programmes" element={<Programmes />} />
        <Route path="/admission-process" element={<AdmissionProcess />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Legacy URL redirect */}
        <Route
          path="/Programmes"
          element={<Navigate to="/programmes" replace />}
        />

        {/* Applicant */}
        <Route
          path="/applicant/dashboard"
          element={
            <ProtectedRoute allowedRole="APPLICANT">
              <ApplicantDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applicant/edit-profile"
          element={
            <ProtectedRoute allowedRole="APPLICANT">
              <EditProfile />
            </ProtectedRoute>
          }
        />

        {/* Admission staff */}
        <Route
          path="/officer/dashboard"
          element={<Navigate to="/admission-officer/dashboard" replace />}
        />

        <Route
          path="/admission-officer/dashboard"
          element={
            <ProtectedRoute allowedRole="ADMISSION_OFFICER">
              <AdmissionOfficerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Evaluation and administration */}
        <Route
          path="/evaluator/dashboard"
          element={
            <ProtectedRoute allowedRole="EVALUATOR">
              <EvaluatorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Unknown URLs */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
