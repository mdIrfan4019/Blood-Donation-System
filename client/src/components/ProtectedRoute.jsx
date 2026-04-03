import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children, role }) {
  const { token, role: userRole, loading } = useSelector((s) => s.auth);

  // 🔄 Show loading spinner while auth state is resolving
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm">Checking access...</p>
        </div>
      </div>
    );
  }

  // 🔒 Not logged in
  if (!token) return <Navigate to="/" />;

  // 🚫 Role not allowed
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(userRole)) return <Navigate to="/" />;
  }

  return children;
}
