import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import AdminLayout from "../layouts/AdminLayout";
import AnalystLayout from "../layouts/AnalystLayout";
import ClientLayout from "../layouts/ClientLayout";

import AdminDashboard from "../pages/admin/Dashboard";
import Users from "../pages/admin/Users";
import Reports from "../pages/admin/Reports";

import AnalystDashboard from "../pages/analyst/Dashboard";
import AnalystReports from "../pages/analyst/Reports";
import AnalystIndicators from "../pages/analyst/Indicators";

import ClientDashboard from "../pages/client/Dashboard";
import ClientReports from "../pages/client/Reports";
import ClientSignals from "../pages/client/Signals";
import ClientOpportunities from "../pages/client/Opportunities";
import ClientWatchlist from "../pages/client/Watchlist";
import ClientPortfolio from "../pages/client/Portfolio";
import ClientBilling from "../pages/client/Billing";
import ClientSectors from "../pages/client/Sectors";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      <Route
        path="/analyst"
        element={
          <ProtectedRoute role="analyst">
            <AnalystLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AnalystDashboard />} />
        <Route path="reports" element={<AnalystReports />} />
        <Route path="indicators" element={<AnalystIndicators />} />
      </Route>

      <Route
        path="/client"
        element={
          <ProtectedRoute role="client">
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClientDashboard />} />
        <Route path="sectors" element={<ClientSectors />} />
        <Route path="stocks" element={<ClientOpportunities />} />
        <Route path="signals" element={<ClientSignals />} />
        <Route path="reports" element={<ClientReports />} />
        <Route path="watchlist" element={<ClientWatchlist />} />
        <Route path="portfolio" element={<ClientPortfolio />} />
        <Route path="billing" element={<ClientBilling />} />
      </Route>
    </Routes>
  );
}
