import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  FaChartPie,
  FaFileSignature,
  FaSignOutAlt,
  FaUsers,
} from "react-icons/fa";
import ThemeToggle from "../components/common/ThemeToggle";
import { logout } from "../app/auth.slice";
import "./shell.css";
import "./admin.css";

export default function AdminLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <div className="app-shell admin-wrapper">
      <aside className="app-sidebar admin-sidebar">
        <h4 className="app-logo admin-logo">MarketIntel</h4>
        <p className="app-sidebar-copy admin-sidebar-copy">
          Admin workspace for platform health, user access, and report moderation.
        </p>

        <nav className="app-nav admin-nav">
          <NavLink to="/admin" end className="app-nav-item admin-nav-item">
            <FaChartPie className="app-nav-icon admin-nav-icon" />
            Dashboard
          </NavLink>

          <NavLink to="/admin/users" className="app-nav-item admin-nav-item">
            <FaUsers className="app-nav-icon admin-nav-icon" />
            Users
          </NavLink>

          <NavLink to="/admin/reports" className="app-nav-item admin-nav-item">
            <FaFileSignature className="app-nav-icon admin-nav-icon" />
            Reports
          </NavLink>
        </nav>

        <ThemeToggle className="theme-toggle-sidebar" />

        <button
          type="button"
          className="app-nav-item app-logout admin-nav-item admin-logout"
          onClick={() => {
            dispatch(logout());
            navigate("/", { replace: true });
          }}
        >
          <FaSignOutAlt className="app-nav-icon admin-nav-icon" />
          Logout
        </button>
      </aside>

      <main className="app-main admin-main">
        <Outlet />
      </main>
    </div>
  );
}
