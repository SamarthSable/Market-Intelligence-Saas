import { useEffect, useMemo, useState } from "react";
import {
  FaArrowsRotate,
  FaClockRotateLeft,
  FaUserShield,
  FaUsers,
} from "react-icons/fa6";
import {
  getAdminActivity,
  getAdminUsers,
  updateAdminUserRole,
} from "../../api/admin.api";

function formatDate(value) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) return "Unknown time";
  return new Date(value).toLocaleString();
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPageData() {
    setLoading(true);
    setError("");

    try {
      const [usersRes, activityRes] = await Promise.all([
        getAdminUsers(),
        getAdminActivity(),
      ]);

      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setActivity(Array.isArray(activityRes.data) ? activityRes.data : []);
    } catch (err) {
      setUsers([]);
      setActivity([]);
      setError(err?.response?.data?.error || "Unable to load admin activity right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPageData();
  }, []);

  const filteredUsers = useMemo(() => {
    if (filter === "all") return users;
    return users.filter((user) => user.role === filter);
  }, [filter, users]);

  async function handleRoleUpdate(id, role) {
    const previous = users;
    setUsers((current) =>
      current.map((user) => (user.id === id ? { ...user, role } : user))
    );

    try {
      await updateAdminUserRole(id, role);
      await loadPageData();
    } catch (err) {
      setUsers(previous);
      setError(err?.response?.data?.error || "Unable to update this user's role.");
    }
  }

  return (
    <div className="admin-page">
      <section className="admin-hero">
        <div>
          <p className="admin-kicker">Access Control</p>
          <h2>User Management</h2>
          <p className="admin-subtitle">
            Review team composition, inspect account activity, and adjust roles
            without leaving the admin workspace.
          </p>
        </div>

        <div className="admin-hero-badge">
          <span className="badge-label">Visible accounts</span>
          <strong>{filteredUsers.length}</strong>
          <small>{users.length} total users on the platform</small>
        </div>
      </section>

      <section className="admin-toolbar">
        <div className="admin-filter-group">
          {["all", "admin", "analyst", "client"].map((item) => (
            <button
              key={item}
              type="button"
              className={`admin-filter-btn ${filter === item ? "is-active" : ""}`}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={loadPageData}
        >
          <FaArrowsRotate />
          Refresh
        </button>
      </section>

      {error && <p className="admin-message">{error}</p>}
      {loading && <p className="admin-message">Loading users and activity...</p>}

      {!loading && !error && (
        <section className="admin-card admin-activity-card">
          <div className="admin-card-head">
            <div>
              <p className="admin-section-label">MongoDB Activity Feed</p>
              <h3>Recent platform actions</h3>
            </div>
            <div className="admin-stat-icon">
              <FaClockRotateLeft />
            </div>
          </div>

          {activity.length === 0 ? (
            <p className="admin-message">No recent activity has been recorded yet.</p>
          ) : (
            <div className="admin-list admin-activity-feed">
              {activity.map((entry) => (
                <div key={entry.id} className="admin-list-row admin-activity-row">
                  <div className="admin-activity-copy">
                    <strong>{entry.message}</strong>
                    <div className="admin-user-meta">
                      <span>
                        Actor: {entry.actor?.name || "System"}
                        {entry.actor?.role ? ` (${entry.actor.role})` : ""}
                      </span>
                      {entry.subject && entry.subject?.id !== entry.actor?.id && (
                        <span>Target: {entry.subject?.name || `User #${entry.subject.id}`}</span>
                      )}
                    </div>
                  </div>

                  <div className="admin-list-meta">
                    <span>{entry.action}</span>
                    <span>{formatDateTime(entry.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {!loading && (
        <section className="admin-user-grid">
          {filteredUsers.map((user) => (
            <article key={user.id} className="admin-card">
              <div className="admin-card-head">
                <div>
                  <p className="admin-section-label">User Profile</p>
                  <h3>{user.name}</h3>
                </div>
                <div className="admin-stat-icon">
                  {user.role === "admin" ? <FaUserShield /> : <FaUsers />}
                </div>
              </div>

              <div className="admin-user-meta">
                <span>{user.email}</span>
                <span>Joined {formatDate(user.created_at)}</span>
                <span>{user._count?.reports || 0} reports authored</span>
              </div>

              <label className="admin-field">
                <span>Role</span>
                <select
                  value={user.role}
                  onChange={(event) => handleRoleUpdate(user.id, event.target.value)}
                >
                  <option value="admin">admin</option>
                  <option value="analyst">analyst</option>
                  <option value="client">client</option>
                </select>
              </label>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
