import { useEffect, useState } from "react";
import "../../styles/clientReports.css";
import { getApprovedReports } from "../../api/reports.api";
import { FaBookOpen, FaBuilding, FaCalendarDay, FaFileLines } from "react-icons/fa6";

function formatDate(value) {
  if (!value) return "Recently published";
  return new Date(value).toLocaleDateString();
}

export default function ClientReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getApprovedReports()
      .then((res) => setReports(Array.isArray(res.data) ? res.data : []))
      .catch(() => {
        setReports([]);
        setError("Unable to load analyst reports.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="client-dashboard client-page client-reports-page">
      <section className="section-hero">
        <div>
          <p className="section-kicker">Research Desk</p>
          <h2>Analyst Reports</h2>
          <p className="section-subtitle">
            Read the latest approved market research, organized for quick
            scanning and deeper follow-up.
          </p>
        </div>

        <div className="section-hero-badge">
          <FaBookOpen />
          <span>{reports.length} published reports</span>
        </div>
      </section>

      {loading && <p>Loading approved reports...</p>}
      {!loading && error && <p>{error}</p>}
      {!loading && !error && reports.length === 0 && (
        <p>No approved reports are available yet.</p>
      )}

      {!loading && !error && reports.length > 0 && (
        <section className="section-summary-grid reports-summary-grid">
          <article className="section-summary-card">
            <div className="summary-icon summary-icon-blue">
              <FaFileLines />
            </div>
            <span className="summary-label">Reports Available</span>
            <strong>{reports.length}</strong>
            <small>Approved research notes ready to read</small>
          </article>

          <article className="section-summary-card">
            <div className="summary-icon summary-icon-cyan">
              <FaBuilding />
            </div>
            <span className="summary-label">Latest Sector</span>
            <strong>{reports[0]?.sectors?.name || "General Market"}</strong>
            <small>Lead report theme in the feed</small>
          </article>
        </section>
      )}

      {reports.map((report) => (
        <div key={report.id} className="report">
          <div className="report-head">
            <h5>{report.title}</h5>
            <small>{report.sectors?.name || "General Market"}</small>
          </div>
          <p>{report.summary}</p>
          <div className="report-footer">
            <span>
              <FaCalendarDay />
              {formatDate(report.published_at)}
            </span>
            <span>
              <FaBookOpen />
              {report.users?.name || "Analyst Team"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
