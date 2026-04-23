import { useEffect, useRef, useState } from "react";
import {
  FaClockRotateLeft,
  FaFileCircleCheck,
  FaFilePen,
  FaTrash,
} from "react-icons/fa6";
import {
  deleteAnalystReport,
  getAnalystReports,
  updateAnalystReport,
} from "../../api/analyst.api";
import FormPopup from "../../components/common/FormPopup";
import "../../styles/reports.css";

function formatDate(value) {
  if (!value) return "Draft";
  return new Date(value).toLocaleDateString();
}

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({ title: "", summary: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    variant: "danger",
  });
  const editorCardRef = useRef(null);
  const titleInputRef = useRef(null);
  const summaryTextareaRef = useRef(null);

  useEffect(() => {
    let isActive = true;

    async function loadReports() {
      try {
        if (isActive) {
          setLoading(true);
          setError("");
        }

        const res = await getAnalystReports();
        if (!isActive) return;

        setReports(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!isActive) return;

        const nextMessage =
          err?.response?.data?.error || "Unable to load your reports.";
        setReports([]);
        setError(nextMessage);
        showPopup(nextMessage, {
          title: "Reports unavailable",
        });
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadReports();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      return undefined;
    }

    editorCardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    const timerId = window.setTimeout(() => {
      summaryTextareaRef.current?.focus({ preventScroll: true });
    }, 180);

    return () => window.clearTimeout(timerId);
  }, [selectedId]);

  const selectedReport = reports.find((report) => report.id === selectedId) || null;
  const editableReports = reports.filter((report) => report.status !== "approved");
  const approvedCount = reports.filter((report) => report.status === "approved").length;
  const pendingCount = reports.filter((report) => report.status === "pending").length;

  function hidePopup() {
    setPopup((current) => ({ ...current, show: false }));
  }

  function showPopup(message, options = {}) {
    setPopup({
      show: true,
      title: options.title || "",
      message,
      variant: options.variant || "danger",
    });
  }

  function clearFieldError(field) {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function validateForm() {
    const nextErrors = {};
    const trimmedTitle = form.title.trim();
    const trimmedSummary = form.summary.trim();
    let firstInvalidInput = null;

    if (!trimmedTitle) {
      nextErrors.title = "Report title cannot be empty.";
      firstInvalidInput = titleInputRef.current;
    } else if (trimmedTitle.length < 5) {
      nextErrors.title = "Title should be at least 5 characters.";
      firstInvalidInput = titleInputRef.current;
    }

    if (!trimmedSummary) {
      nextErrors.summary = "Summary cannot be empty.";
      firstInvalidInput = firstInvalidInput || summaryTextareaRef.current;
    } else if (trimmedSummary.length < 30) {
      nextErrors.summary = "Summary should be at least 30 characters.";
      firstInvalidInput = firstInvalidInput || summaryTextareaRef.current;
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      const nextMessage = nextErrors.title || nextErrors.summary;
      showPopup(nextMessage, {
        title: "Draft validation",
        variant: "warning",
      });
      firstInvalidInput?.focus();
      return null;
    }

    return {
      title: trimmedTitle,
      summary: trimmedSummary,
    };
  }

  function beginEdit(report) {
    hidePopup();
    setFieldErrors({});
    setSelectedId(report.id);
    setForm({
      title: report.title || "",
      summary: report.summary || "",
    });
  }

  function cancelEdit() {
    setSelectedId(null);
    setFieldErrors({});
    setForm({ title: "", summary: "" });
  }

  async function handleUpdate() {
    if (!selectedReport) return;

    const payload = validateForm();
    if (!payload) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      hidePopup();

      const res = await updateAnalystReport(selectedReport.id, payload);
      setReports((current) =>
        current.map((report) => (report.id === selectedReport.id ? res.data : report))
      );
      showPopup("Draft saved successfully.", {
        title: "Changes saved",
        variant: "success",
      });
      cancelEdit();
    } catch (err) {
      const nextMessage = err?.response?.data?.error || "Unable to update this report.";
      showPopup(nextMessage, {
        title: "Update failed",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(report) {
    try {
      setError("");
      hidePopup();
      await deleteAnalystReport(report.id);
      setReports((current) => current.filter((item) => item.id !== report.id));
      if (selectedId === report.id) {
        cancelEdit();
      }
      showPopup("Draft deleted successfully.", {
        title: "Draft removed",
        variant: "success",
      });
    } catch (err) {
      const nextMessage = err?.response?.data?.error || "Unable to delete this report.";
      showPopup(nextMessage, {
        title: "Delete failed",
      });
    }
  }

  return (
    <div className="analyst-page analyst-reports-page">
      <FormPopup
        show={popup.show}
        onClose={hidePopup}
        title={popup.title}
        message={popup.message}
        variant={popup.variant}
      />

      <section className="analyst-hero">
        <div>
          <p className="analyst-kicker">Publishing Desk</p>
          <h2>My Reports</h2>
          <p className="analyst-subtitle">
            Review your report pipeline, revise pending drafts, and keep your
            strongest work moving toward approval.
          </p>
        </div>

        <div className="analyst-hero-badge">
          <span className="badge-label">Editable drafts</span>
          <strong>{editableReports.length}</strong>
          <small>Pending or rejected reports can still be refined</small>
        </div>
      </section>

      <section className="analyst-stat-grid analyst-report-summary">
        <article className="analyst-stat-card">
          <div className="analyst-stat-icon">
            <FaFilePen />
          </div>
          <span className="analyst-stat-title">Total Reports</span>
          <strong className="analyst-stat-value">{reports.length}</strong>
          <small>Everything you have submitted</small>
        </article>

        <article className="analyst-stat-card">
          <div className="analyst-stat-icon">
            <FaFileCircleCheck />
          </div>
          <span className="analyst-stat-title">Approved</span>
          <strong className="analyst-stat-value">{approvedCount}</strong>
          <small>Published into the client feed</small>
        </article>

        <article className="analyst-stat-card">
          <div className="analyst-stat-icon">
            <FaClockRotateLeft />
          </div>
          <span className="analyst-stat-title">Pending</span>
          <strong className="analyst-stat-value">{pendingCount}</strong>
          <small>Currently waiting on review</small>
        </article>
      </section>

      {error && <p className="analyst-message">{error}</p>}
      {loading && <p className="analyst-message">Loading your reports...</p>}

      {!loading && selectedReport && (
        <section ref={editorCardRef} className="analyst-card analyst-editor-card">
          <div className="analyst-card-head">
            <div>
              <p className="analyst-section-label">Draft Editor</p>
              <h3>{selectedReport.title}</h3>
            </div>
          </div>

          <div className="analyst-form-grid">
            <label className="analyst-field">
              <span>Title</span>
              <input
                ref={titleInputRef}
                className={fieldErrors.title ? "is-invalid" : ""}
                value={form.title}
                onChange={(event) => {
                  setForm((current) => ({ ...current, title: event.target.value }));
                  clearFieldError("title");
                }}
              />
              {fieldErrors.title && (
                <small className="analyst-field-error">{fieldErrors.title}</small>
              )}
            </label>

            <label className="analyst-field">
              <span>Summary</span>
              <textarea
                ref={summaryTextareaRef}
                className={fieldErrors.summary ? "is-invalid" : ""}
                rows="6"
                value={form.summary}
                onChange={(event) => {
                  setForm((current) => ({ ...current, summary: event.target.value }));
                  clearFieldError("summary");
                }}
              />
              {fieldErrors.summary && (
                <small className="analyst-field-error">{fieldErrors.summary}</small>
              )}
            </label>
          </div>

          <div className="analyst-action-row">
            <button
              type="button"
              className="analyst-btn analyst-btn-primary"
              onClick={handleUpdate}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="analyst-btn analyst-btn-secondary"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      {!loading && !reports.length && (
        <p className="analyst-message">You have not submitted any reports yet.</p>
      )}

      <section className="analyst-report-grid">
        {reports.map((report) => (
          <article key={report.id} className="report-card analyst-card">
            <div className="report-card-top">
              <div>
                <p className="analyst-section-label">
                  {report.sectors?.name || "General Market"}
                </p>
                <h3 className="report-title">{report.title}</h3>
              </div>
              <span className={`report-status status-${report.status || "pending"}`}>
                {report.status || "pending"}
              </span>
            </div>

            <p className="report-summary">{report.summary}</p>

            <div className="report-footer">
              <span>{formatDate(report.published_at)}</span>
              <span>Report #{report.id}</span>
            </div>

            {report.status !== "approved" && (
              <div className="analyst-action-row">
                <button
                  type="button"
                  className="analyst-btn analyst-btn-primary"
                  onClick={() => beginEdit(report)}
                >
                  Edit Draft
                </button>
                <button
                  type="button"
                  className="analyst-btn analyst-btn-danger"
                  onClick={() => handleDelete(report)}
                >
                  <FaTrash />
                  Delete
                </button>
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
