import { useEffect, useMemo, useState } from "react";
import {
  FaCheck,
  FaClockRotateLeft,
  FaFilter,
  FaXmark,
} from "react-icons/fa6";
import {
  approveAdminReport,
  getAdminReports,
  rejectAdminReport,
} from "../../api/admin.api";

function formatDate(value) {
  if (!value) return "Draft";
  return new Date(value).toLocaleDateString();
}

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getAdminReports()
      .then((res) => {
        if (!cancelled) {
          setReports(Array.isArray(res.data) ? res.data : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setReports([]);
          setError("Unable to load report moderation queue.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleReports = useMemo(() => {
    if (filter === "all") return reports;
    return reports.filter((report) => report.status === filter);
  }, [filter, reports]);

  async function updateStatus(id, status) {
    try {
      setError("");
      const res =
        status === "approved"
          ? await approveAdminReport(id)
          : await rejectAdminReport(id);

      setReports((current) =>
        current.map((report) => (report.id === id ? res.data : report))
      );
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to update report status.");
    }
  }

  const pendingCount = reports.filter((report) => report.status === "pending").length;

  return (
    <div className="admin-page">
      <section className="admin-hero">
        <div>
          <p className="admin-kicker">Moderation Desk</p>
          <h2>Report Review</h2>
          <p className="admin-subtitle">
            Approve strong research quickly, reject weak drafts cleanly, and
            keep the client-facing feed trustworthy.
          </p>
        </div>

        <div className="admin-hero-badge">
          <span className="badge-label">Pending queue</span>
          <strong>{pendingCount}</strong>
          <small>Reports currently waiting for a decision</small>
        </div>
      </section>

      <section className="admin-toolbar">
        <div className="admin-filter-group">
          {["all", "pending", "approved", "rejected"].map((item) => (
            <button
              key={item}
              type="button"
              className={`admin-filter-btn ${filter === item ? "is-active" : ""}`}
              onClick={() => setFilter(item)}
            >
              <FaFilter />
              {item}
            </button>
          ))}
        </div>
      </section>

      {error && <p className="admin-message">{error}</p>}
      {loading && <p className="admin-message">Loading moderation queue...</p>}

      {!loading && !visibleReports.length && (
        <p className="admin-message">No reports match this filter.</p>
      )}

      <section className="admin-report-grid">
        {visibleReports.map((report) => (
          <article key={report.id} className="admin-card">
            <div className="admin-card-head">
              <div>
                <p className="admin-section-label">
                  {report.sectors?.name || "General Market"}
                </p>
                <h3>{report.title}</h3>
              </div>
              <span className={`admin-badge admin-badge-${report.status || "pending"}`}>
                {report.status || "pending"}
              </span>
            </div>

            <p className="admin-report-text">{report.summary}</p>

            <div className="admin-user-meta">
              <span>{report.users?.name || "Analyst Team"}</span>
              <span>{report.users?.email || "No analyst email"}</span>
              <span>{formatDate(report.published_at)}</span>
            </div>

            <div className="admin-action-row">
              <button
                type="button"
                className="admin-btn admin-btn-success"
                onClick={() => updateStatus(report.id, "approved")}
                disabled={report.status === "approved"}
              >
                <FaCheck />
                Approve
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={() => updateStatus(report.id, "rejected")}
                disabled={report.status === "rejected"}
              >
                <FaXmark />
                Reject
              </button>
              <span className="admin-inline-meta">
                <FaClockRotateLeft />
                {formatDate(report.published_at)}
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
