import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FaChartLine, FaFileAlt, FaPlusCircle, FaSignOutAlt } from "react-icons/fa";
import ThemeToggle from "../components/common/ThemeToggle";
import { logout } from "../app/auth.slice";
import "./shell.css";
import "./analyst.css";

export default function AnalystLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <div className="app-shell analyst-wrapper">
      <aside className="app-sidebar analyst-sidebar">
        <div className="app-logo analyst-logo">Analyst</div>

        <div className="app-nav analyst-nav">
          <NavLink to="/analyst" end className="app-nav-item analyst-item">
            <FaChartLine className="app-nav-icon" /> Dashboard
          </NavLink>

          <NavLink to="/analyst/reports" className="app-nav-item analyst-item">
            <FaFileAlt className="app-nav-icon" /> My Reports
          </NavLink>

          <NavLink to="/analyst/indicators" className="app-nav-item analyst-item">
            <FaPlusCircle className="app-nav-icon" /> Create Report
          </NavLink>
        </div>

        <ThemeToggle className="theme-toggle-sidebar" />

        <button
          type="button"
          className="app-nav-item app-logout analyst-logout"
          onClick={() => {
            dispatch(logout());
            navigate("/", { replace: true });
          }}
        >
          <FaSignOutAlt className="app-nav-icon" />
          Logout
        </button>
      </aside>

      <main className="app-main analyst-main">
        <Outlet />
      </main>
    </div>
  );
}
