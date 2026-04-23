import { useEffect, useState } from "react";
import {
  FaChartLine,
  FaClockRotateLeft,
  FaFileCircleCheck,
  FaLayerGroup,
  FaUserGear,
  FaUsers,
} from "react-icons/fa6";
import { getAdminStats } from "../../api/admin.api";

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString();
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res.data || {}))
      .catch(() => setError("Unable to load admin analytics right now."))
      .finally(() => setLoading(false));
  }, []);

  const recentUsers = Array.isArray(stats.recentUsers) ? stats.recentUsers : [];
  const recentReports = Array.isArray(stats.recentReports) ? stats.recentReports : [];

  return (
    <div className="admin-page">
      <section className="admin-hero">
        <div>
          <p className="admin-kicker">Control Center</p>
          <h2>Platform Analytics</h2>
          <p className="admin-subtitle">
            Monitor user growth, research moderation, and platform throughput
            from one admin workspace.
          </p>
        </div>

        <div className="admin-hero-badge">
          <span className="badge-label">Estimated MRR</span>
          <strong>{formatCurrency(stats.revenue)}</strong>
          <small>{stats.clients || 0} active client seats at Rs. 499</small>
        </div>
      </section>

      {loading && <p className="admin-message">Loading platform analytics...</p>}
      {!loading && error && <p className="admin-message">{error}</p>}

      {!loading && !error && (
        <>
          <section className="admin-stat-grid">
            <StatCard
              icon={<FaUsers />}
              title="Total Users"
              value={stats.users}
              meta={`${stats.admins || 0} admins, ${stats.analysts || 0} analysts`}
            />
            <StatCard
              icon={<FaUserGear />}
              title="Clients"
              value={stats.clients}
              meta="Revenue-driving accounts"
            />
            <StatCard
              icon={<FaLayerGroup />}
              title="Reports"
              value={stats.reports}
              meta={`${stats.pendingReports || 0} pending review`}
            />
            <StatCard
              icon={<FaFileCircleCheck />}
              title="Approval Rate"
              value={`${stats.approvalRate || 0}%`}
              meta={`${stats.approvedReports || 0} approved reports`}
            />
          </section>

          <section className="admin-grid">
            <article className="admin-card admin-card-feature">
              <div className="admin-card-head">
                <div>
                  <p className="admin-section-label">Moderation Health</p>
                  <h3>Report pipeline status</h3>
                </div>
                <FaChartLine className="admin-card-icon" />
              </div>

              <div className="admin-feature-grid">
                <div className="admin-feature-block">
                  <span>Approved</span>
                  <strong>{stats.approvedReports || 0}</strong>
                  <small>Visible to clients</small>
                </div>
                <div className="admin-feature-block">
                  <span>Pending</span>
                  <strong>{stats.pendingReports || 0}</strong>
                  <small>Waiting for moderation</small>
                </div>
                <div className="admin-feature-block">
                  <span>Rejected</span>
                  <strong>{stats.rejectedReports || 0}</strong>
                  <small>Sent back for revision</small>
                </div>
              </div>
            </article>

            <article className="admin-card">
              <div className="admin-card-head">
                <div>
                  <p className="admin-section-label">Recent Users</p>
                  <h3>Newest accounts</h3>
                </div>
                <FaUsers className="admin-card-icon" />
              </div>

              <div className="admin-list">
                {recentUsers.length ? (
                  recentUsers.map((user) => (
                    <div key={user.id} className="admin-list-row">
                      <div>
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                      <div className="admin-list-meta">
                        <b>{user.role}</b>
                        <small>{formatDate(user.created_at)}</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="admin-message">No recent users to display.</p>
                )}
              </div>
            </article>

            <article className="admin-card">
              <div className="admin-card-head">
                <div>
                  <p className="admin-section-label">Recent Reports</p>
                  <h3>Latest analyst submissions</h3>
                </div>
                <FaClockRotateLeft className="admin-card-icon" />
              </div>

              <div className="admin-list">
                {recentReports.length ? (
                  recentReports.map((report) => (
                    <div key={report.id} className="admin-list-row">
                      <div>
                        <strong>{report.title}</strong>
                        <span>
                          {report.users?.name || "Analyst Team"} - {report.sectors?.name || "General Market"}
                        </span>
                      </div>
                      <span className={`admin-badge admin-badge-${report.status || "pending"}`}>
                        {report.status || "pending"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="admin-message">No recent reports to display.</p>
                )}
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, meta }) {
  return (
    <article className="admin-stat-card">
      <div className="admin-stat-icon">{icon}</div>
      <span className="admin-stat-title">{title}</span>
      <strong className="admin-stat-value">{value || 0}</strong>
      <small>{meta}</small>
    </article>
  );
}
