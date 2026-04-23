import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ role, children }) {
  const { isAuth, role: storeRole } = useSelector((s) => s.auth);
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role") || storeRole;
  const authenticated = Boolean(token) && isAuth;

  if (!authenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
