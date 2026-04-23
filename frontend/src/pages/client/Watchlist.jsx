import { useEffect, useState } from "react";
import { getCompanyHistory } from "../../api/market.api";
import { getWatchlist, removeFromWatchlist } from "../../api/watchlist.api";
import CandleChart from "../../components/charts/CandleChart";
import {
  FaChartLine,
  FaEye,
  FaLayerGroup,
  FaStar,
  FaTrash,
} from "react-icons/fa6";
import "../../styles/watchlist.css";

export default function Watchlist() {
  const [data, setData] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [history, setHistory] = useState([]);
  const [historyMeta, setHistoryMeta] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getWatchlist()
      .then((res) => {
        const nextData = Array.isArray(res.data) ? res.data : [];
        setData(nextData);
        setSelectedSymbol(nextData[0]?.symbol || "");
      })
      .catch(() => {
        setData([]);
        setError("Unable to load your watchlist.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadHistory() {
      if (!selectedSymbol) {
        if (isActive) {
          setHistory([]);
          setHistoryMeta(null);
          setHistoryLoading(false);
        }
        return;
      }

      if (isActive) {
        setHistoryLoading(true);
      }

      try {
        const res = await getCompanyHistory(selectedSymbol);
        if (!isActive) return;

        setHistory(Array.isArray(res.data?.candles) ? res.data.candles : []);
        setHistoryMeta(res.data?.company || null);
      } catch {
        if (!isActive) return;

        setHistory([]);
        setHistoryMeta(null);
      } finally {
        if (isActive) {
          setHistoryLoading(false);
        }
      }
    }

    void loadHistory();

    return () => {
      isActive = false;
    };
  }, [selectedSymbol]);

  async function handleRemove(company) {
    const res = await removeFromWatchlist(company.id);
    const nextData = Array.isArray(res.data) ? res.data : [];
    setData(nextData);

    if (selectedSymbol === company.symbol) {
      setSelectedSymbol(nextData[0]?.symbol || "");
    }
  }

  return (
    <div className="client-dashboard client-page watchlist-page">
      <section className="section-hero">
        <div>
          <p className="section-kicker">Saved Names</p>
          <h2>My Watchlist</h2>
          <p className="section-subtitle">
            Keep your high-priority companies together so you can return to them
            quickly during the trading week.
          </p>
        </div>

        <div className="section-hero-badge">
          <FaStar />
          <span>{data.length} tracked companies</span>
        </div>
      </section>

      {loading && <p>Loading your watchlist...</p>}
      {!loading && error && <p>{error}</p>}
      {!loading && !error && data.length === 0 && <p>Your watchlist is empty</p>}

      {!loading && !error && data.length > 0 && (
        <>
          <section className="section-summary-grid">
            <article className="section-summary-card">
              <div className="summary-icon summary-icon-amber">
                <FaStar />
              </div>
              <span className="summary-label">Saved Companies</span>
              <strong>{data.length}</strong>
              <small>Names you are actively following</small>
            </article>

            <article className="section-summary-card">
              <div className="summary-icon summary-icon-blue">
                <FaEye />
              </div>
              <span className="summary-label">First In View</span>
              <strong>{data[0]?.symbol || "N/A"}</strong>
              <small>Your first saved company</small>
            </article>

            <article className="section-summary-card">
              <div className="summary-icon summary-icon-cyan">
                <FaLayerGroup />
              </div>
              <span className="summary-label">Coverage Breadth</span>
              <strong>
                {new Set(data.map((company) => company.symbol[0])).size}
              </strong>
              <small>Distinct initial buckets in the list</small>
            </article>
          </section>

          <section className="watchlist-spotlight-card">
            <div className="watchlist-spotlight-header">
              <div>
                <p className="section-kicker">Selected Watchlist Name</p>
                <h3>{selectedSymbol || "N/A"}</h3>
                <p className="section-subtitle">
                  {historyMeta?.name ||
                    "Choose a saved company to inspect its recent price action."}
                </p>
              </div>

              <div className="section-hero-badge">
                <FaChartLine />
                <span>{historyMeta?.sector || "Chart View"}</span>
              </div>
            </div>

            {historyLoading ? (
              <p>Loading candlestick chart...</p>
            ) : (
              <CandleChart candles={history} />
            )}
          </section>

          <section className="watchlist-grid">
            {data.map((company) => (
              <article
                key={company.id}
                className={`watchlist-card ${
                  selectedSymbol === company.symbol ? "is-selected" : ""
                }`}
                onClick={() => setSelectedSymbol(company.symbol)}
              >
                <div className="watchlist-avatar">{company.symbol.slice(0, 2)}</div>
                <div className="watchlist-copy">
                  <strong>{company.symbol}</strong>
                  <span>{company.name}</span>
                </div>
                <button
                  type="button"
                  className="watchlist-remove-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemove(company);
                  }}
                >
                  <FaTrash />
                  Remove
                </button>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
