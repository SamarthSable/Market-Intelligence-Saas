import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  FaBell,
  FaChartLine,
  FaCompass,
  FaFolderOpen,
  FaMoneyCheckAlt,
  FaSignOutAlt,
  FaStar,
  FaThLarge,
  FaWallet,
} from "react-icons/fa";
import ThemeToggle from "../components/common/ThemeToggle";
import { logout } from "../app/auth.slice";
import "./shell.css";
import "./client.css";

export default function ClientLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <div className="app-shell client-container">
      <aside className="app-sidebar client-sidebar">
        <h4 className="app-logo client-logo">MarketIntel</h4>

        <div className="app-nav">
          <NavLink to="/client" end className="app-nav-item client-nav-item">
            <FaThLarge className="app-nav-icon client-nav-icon" />
            Dashboard
          </NavLink>

          <NavLink to="/client/sectors" className="app-nav-item client-nav-item">
            <FaChartLine className="app-nav-icon client-nav-icon" />
            Sectors
          </NavLink>

          <NavLink to="/client/stocks" className="app-nav-item client-nav-item">
            <FaCompass className="app-nav-icon client-nav-icon" />
            Companies
          </NavLink>

          <NavLink to="/client/signals" className="app-nav-item client-nav-item">
            <FaBell className="app-nav-icon client-nav-icon" />
            Signals
          </NavLink>

          <NavLink to="/client/reports" className="app-nav-item client-nav-item">
            <FaFolderOpen className="app-nav-icon client-nav-icon" />
            Analyst Reports
          </NavLink>

          <NavLink to="/client/watchlist" className="app-nav-item client-nav-item">
            <FaStar className="app-nav-icon client-nav-icon" />
            Watchlist
          </NavLink>

          <NavLink to="/client/portfolio" className="app-nav-item client-nav-item">
            <FaWallet className="app-nav-icon client-nav-icon" />
            My Portfolio
          </NavLink>

          <NavLink to="/client/billing" className="app-nav-item client-nav-item">
            <FaMoneyCheckAlt className="app-nav-icon client-nav-icon" />
            Billing
          </NavLink>
        </div>

        <ThemeToggle className="theme-toggle-sidebar" />

        <button
          type="button"
          className="app-nav-item app-logout client-nav-item client-logout"
          onClick={() => {
            dispatch(logout());
            navigate("/", { replace: true });
          }}
        >
          <FaSignOutAlt className="app-nav-icon client-nav-icon" />
          Logout
        </button>
      </aside>

      <div className="app-main client-content">
        <Outlet />
      </div>
    </div>
  );
}
