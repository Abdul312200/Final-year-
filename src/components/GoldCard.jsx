import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://api.fintechiq.me";

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function GoldCard() {
  const [gold, setGold] = useState({ price: null, chp: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchGold = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/gold`);
      if (data.error) throw new Error(data.error);
      setGold({ price: data.price, chp: data.chp });
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGold();
    const id = setInterval(fetchGold, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const formatINR = (n) =>
    n != null ? "₹" + n.toLocaleString("en-IN") : "—";

  const priceDisplay = loading ? "…" : error ? "—" : formatINR(gold.price);

  const changeDisplay =
    !loading && !error && gold.chp != null
      ? gold.chp >= 0
        ? `▲ ${gold.chp.toFixed(2)}%`
        : `▼ ${Math.abs(gold.chp).toFixed(2)}%`
      : null;

  const changeClass =
    gold.chp != null ? (gold.chp >= 0 ? "up" : "down") : "";

  return (
    <div className="metric-card metric-card--gold">
      {/* Header */}
      <div className="metric-card-label">
        GOLD / 10g &nbsp;
        {loading && (
          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
            fetching…
          </span>
        )}
        {!loading && !error && (
          <span
            style={{ fontSize: "0.65rem", color: "var(--bull)", fontWeight: 600 }}
          >
            ● LIVE
          </span>
        )}
        {!loading && error && (
          <span
            style={{ fontSize: "0.65rem", color: "var(--bear)", fontWeight: 600 }}
          >
            ● offline
          </span>
        )}
      </div>

      {/* Price */}
      <div className="metric-card-val">{priceDisplay}</div>

      {/* Change */}
      {changeDisplay && (
        <div className={`metric-card-sub ${changeClass}`}>{changeDisplay}</div>
      )}
    </div>
  );
}
