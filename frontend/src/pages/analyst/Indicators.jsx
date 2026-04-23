import { useEffect, useRef, useState } from "react";
import {
  FaArrowTrendUp,
  FaBolt,
  FaLightbulb,
  FaRegPenToSquare,
} from "react-icons/fa6";
import { createAnalystReport, getAnalystInsights } from "../../api/analyst.api";
import { getSectors } from "../../api/sector.api";
import FormPopup from "../../components/common/FormPopup";
import "../../styles/reports.css";

function buildStarterSummary({ sectorName, prompt, signal }) {
  const lines = [
    `Investment Theme: ${sectorName || "Sector"} setup review.`,
    "",
    "Market Context:",
    prompt?.snippet || "Describe the broader setup, leadership, and catalysts shaping this idea.",
    "",
    "Technical View:",
    signal
      ? `${signal.symbol} is showing a ${signal.signal} setup with ${signal.confidence}% confidence and a recent ${signal.change}% move. Explain key triggers, support zones, and what would invalidate the trade.`
      : "Explain price structure, momentum, and the most relevant risk levels.",
    "",
    "Analyst Conclusion:",
    "Summarize the thesis, timeframe, and major risks for clients.",
  ];

  return lines.join("\n");
}

export default function CreateReport() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [sectors, setSectors] = useState([]);
  const [insights, setInsights] = useState({
    marketSummary: {},
    sectorLeaders: [],
    signalBoard: [],
    draftPrompts: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    variant: "danger",
  });
  const titleInputRef = useRef(null);
  const sectorSelectRef = useRef(null);
  const summaryTextareaRef = useRef(null);

  useEffect(() => {
    Promise.all([getSectors(), getAnalystInsights()])
      .then(([sectorsRes, insightsRes]) => {
        setSectors(Array.isArray(sectorsRes.data) ? sectorsRes.data : []);
        setInsights(
          insightsRes.data || {
            marketSummary: {},
            sectorLeaders: [],
            signalBoard: [],
            draftPrompts: [],
          }
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedSector = sectors.find((sector) => Number(sector.id) === Number(sectorId));

  function hidePopup() {
    setPopup((current) => ({ ...current, show: false }));
  }

  function showPopup(nextMessage, options = {}) {
    setPopup({
      show: true,
      title: options.title || "",
      message: nextMessage,
      variant: options.variant || "danger",
    });
  }

  function clearFieldError(field) {
    if (message) {
      setMessage("");
    }

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
    const trimmedTitle = title.trim();
    const trimmedSummary = summary.trim();
    let firstInvalidInput = null;

    if (!trimmedTitle) {
      nextErrors.title = "Add a report title.";
      firstInvalidInput = titleInputRef.current;
    } else if (trimmedTitle.length < 5) {
      nextErrors.title = "Title should be at least 5 characters.";
      firstInvalidInput = titleInputRef.current;
    }

    if (!sectorId) {
      nextErrors.sectorId = "Choose a sector before submitting.";
      firstInvalidInput = firstInvalidInput || sectorSelectRef.current;
    }

    if (!trimmedSummary) {
      nextErrors.summary = "Add an investment note summary.";
      firstInvalidInput = firstInvalidInput || summaryTextareaRef.current;
    } else if (trimmedSummary.length < 30) {
      nextErrors.summary = "Summary should be at least 30 characters.";
      firstInvalidInput = firstInvalidInput || summaryTextareaRef.current;
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      const nextMessage =
        nextErrors.title || nextErrors.sectorId || nextErrors.summary;
      setMessage(nextMessage);
      showPopup(nextMessage, {
        title: "Report validation",
        variant: "warning",
      });
      firstInvalidInput?.focus();
      return null;
    }

    return {
      title: trimmedTitle,
      summary: trimmedSummary,
      sector_id: Number(sectorId),
    };
  }

  async function submit() {
    const payload = validateForm();
    if (!payload) {
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      hidePopup();

      await createAnalystReport(payload);

      setMessage("Report submitted for approval.");
      showPopup("Report submitted for approval.", {
        title: "Submission saved",
        variant: "success",
      });
      setTitle("");
      setSummary("");
      setSectorId("");
      setFieldErrors({});
      titleInputRef.current?.focus();
    } catch (err) {
      const nextMessage = err?.response?.data?.error || "Unable to submit the report.";
      setMessage(nextMessage);
      showPopup(nextMessage, {
        title: "Submission failed",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function applyPrompt(prompt) {
    setSummary((current) => `${current ? `${current}\n\n` : ""}${prompt.snippet}`);
    clearFieldError("summary");
  }

  function applySignal(signal) {
    const nextTitle =
      title || `${signal.symbol} setup: ${signal.signal} signal in ${signal.sector}`;
    setTitle(nextTitle);
    clearFieldError("title");
    setSummary((current) =>
      current ||
      buildStarterSummary({
        sectorName: signal.sector,
        signal,
      })
    );
    clearFieldError("summary");
  }

  function buildTemplate() {
    const prompt = insights.draftPrompts?.[0];
    const signal = insights.signalBoard?.[0];

    setTitle((current) => current || `${selectedSector?.name || "Market"} outlook note`);
    clearFieldError("title");
    setSummary(
      buildStarterSummary({
        sectorName: selectedSector?.name,
        prompt,
        signal,
      })
    );
    clearFieldError("summary");
  }

  return (
    <div className="analyst-page analyst-compose-page">
      <FormPopup
        show={popup.show}
        onClose={hidePopup}
        title={popup.title}
        message={popup.message}
        variant={popup.variant}
      />

      <section className="analyst-hero">
        <div>
          <p className="analyst-kicker">Research Studio</p>
          <h2>Create Report</h2>
          <p className="analyst-subtitle">
            Build faster from live market leadership, conviction signals, and
            reusable draft prompts pulled from your current market snapshot.
          </p>
        </div>

        <div className="analyst-hero-badge">
          <span className="badge-label">Live prompt bank</span>
          <strong>{insights.draftPrompts?.length || 0}</strong>
          <small>Idea starters generated from current data</small>
        </div>
      </section>

      {message && <p className="analyst-message">{message}</p>}
      {loading && <p className="analyst-message">Loading sectors and market context...</p>}

      <div className="analyst-compose-grid">
        <section className="analyst-card analyst-editor-card">
          <div className="analyst-card-head">
            <div>
              <p className="analyst-section-label">Report Draft</p>
              <h3>Write with structure</h3>
            </div>
            <FaRegPenToSquare className="analyst-card-icon" />
          </div>

          <div className="analyst-form-grid">
            <label className="analyst-field">
              <span>Report Title</span>
              <input
                ref={titleInputRef}
                className={fieldErrors.title ? "is-invalid" : ""}
                placeholder="Example: Banking momentum remains resilient into earnings"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  clearFieldError("title");
                }}
              />
              {fieldErrors.title && (
                <small className="analyst-field-error">{fieldErrors.title}</small>
              )}
            </label>

            <label className="analyst-field">
              <span>Sector</span>
              <select
                ref={sectorSelectRef}
                className={fieldErrors.sectorId ? "is-invalid" : ""}
                value={sectorId}
                onChange={(event) => {
                  setSectorId(event.target.value);
                  clearFieldError("sectorId");
                }}
              >
                <option value="">Select Sector</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
              {fieldErrors.sectorId && (
                <small className="analyst-field-error">{fieldErrors.sectorId}</small>
              )}
            </label>

            <label className="analyst-field">
              <span>Summary / Investment Note</span>
              <textarea
                ref={summaryTextareaRef}
                className={fieldErrors.summary ? "is-invalid" : ""}
                rows="12"
                placeholder="Summarize the thesis, catalysts, technical setup, and risks."
                value={summary}
                onChange={(event) => {
                  setSummary(event.target.value);
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
              className="analyst-btn analyst-btn-secondary"
              onClick={buildTemplate}
            >
              Build Starter Template
            </button>
            <button
              type="button"
              className="analyst-btn analyst-btn-primary"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit For Approval"}
            </button>
          </div>
        </section>

        <aside className="analyst-sidebar-stack">
          <section className="analyst-card">
            <div className="analyst-card-head">
              <div>
                <p className="analyst-section-label">Sector Momentum</p>
                <h3>Where strength is clustering</h3>
              </div>
              <FaArrowTrendUp className="analyst-card-icon" />
            </div>

            <div className="analyst-list">
              {insights.sectorLeaders?.map((sector) => (
                <button
                  key={sector.sector}
                  type="button"
                  className="analyst-chip-card"
                  onClick={() => {
                    const nextSector = sectors.find((item) => item.name === sector.sector);
                    if (nextSector) {
                      setSectorId(String(nextSector.id));
                      clearFieldError("sectorId");
                    }
                    setTitle((current) => current || `${sector.sector} momentum update`);
                    clearFieldError("title");
                  }}
                >
                  <strong>{sector.sector}</strong>
                  <span>{sector.return_5d}% over the last 5 sessions</span>
                </button>
              ))}
            </div>
          </section>

          <section className="analyst-card">
            <div className="analyst-card-head">
              <div>
                <p className="analyst-section-label">Signal Hooks</p>
                <h3>Quick market-backed angles</h3>
              </div>
              <FaBolt className="analyst-card-icon" />
            </div>

            <div className="analyst-list">
              {insights.signalBoard?.map((signal) => (
                <button
                  key={signal.id}
                  type="button"
                  className="analyst-chip-card"
                  onClick={() => applySignal(signal)}
                >
                  <strong>{`${signal.symbol} - ${signal.signal}`}</strong>
                  <span>
                    {signal.confidence}% confidence in {signal.sector}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="analyst-card">
            <div className="analyst-card-head">
              <div>
                <p className="analyst-section-label">Prompt Bank</p>
                <h3>Reusable research starters</h3>
              </div>
              <FaLightbulb className="analyst-card-icon" />
            </div>

            <div className="analyst-list">
              {insights.draftPrompts?.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  className="analyst-chip-card analyst-chip-card-prompt"
                  onClick={() => applyPrompt(prompt)}
                >
                  <strong>{prompt.label}</strong>
                  <span>{prompt.snippet}</span>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
