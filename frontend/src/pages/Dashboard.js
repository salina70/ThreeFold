import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import StarRating from "../components/StarRating";
import SentimentBadge from "../components/SentimentBadge";

export default function Dashboard() {
  const { businessId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/analytics/${businessId}`).then((res) => setData(res.data));
  }, [businessId]);

  if (!data) return <div className="fn-page"><p className="fn-muted">Crunching the numbers...</p></div>;

  const { business, totalReviews, avgRating, sentimentSummary, topKeywords, ratingBreakdown, recentTrend, latestReviews } = data;
  const sentimentTotal = Math.max(1, sentimentSummary.positive + sentimentSummary.neutral + sentimentSummary.negative);
  const ratingMax = Math.max(1, ...Object.values(ratingBreakdown));

  return (
    <div className="fn-page">
      <Link to={`/business/${business._id}`} className="fn-link-quiet">&larr; Back to {business.name}</Link>
      <h1>AI insights for {business.name}</h1>
      <p className="fn-muted">Generated automatically from every review's rating, sentiment, and keywords.</p>

      <section className="fn-stat-row">
        <div className="fn-stat-card">
          <span className="fn-stat-value">{avgRating || "—"}</span>
          <span className="fn-stat-label">Average rating</span>
          <StarRating value={avgRating} size={16} />
        </div>
        <div className="fn-stat-card">
          <span className="fn-stat-value">{totalReviews}</span>
          <span className="fn-stat-label">Total reviews</span>
        </div>
        <div className="fn-stat-card">
          <span className="fn-stat-value">{Math.round((sentimentSummary.positive / sentimentTotal) * 100)}%</span>
          <span className="fn-stat-label">Positive sentiment</span>
        </div>
      </section>

      <section className="fn-panel">
        <h2>Sentiment breakdown</h2>
        <div className="fn-bar-group">
          {[
            { key: "positive", label: "Positive", color: "var(--fn-positive)" },
            { key: "neutral", label: "Neutral", color: "var(--fn-neutral)" },
            { key: "negative", label: "Needs attention", color: "var(--fn-negative)" },
          ].map((row) => (
            <div className="fn-bar-row" key={row.key}>
              <span className="fn-bar-label">{row.label}</span>
              <div className="fn-bar-track">
                <div
                  className="fn-bar-fill"
                  style={{ width: `${(sentimentSummary[row.key] / sentimentTotal) * 100}%`, background: row.color }}
                />
              </div>
              <span className="fn-bar-count">{sentimentSummary[row.key]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="fn-panel">
        <h2>Rating distribution</h2>
        <div className="fn-bar-group">
          {[5, 4, 3, 2, 1].map((star) => (
            <div className="fn-bar-row" key={star}>
              <span className="fn-bar-label">{star} star</span>
              <div className="fn-bar-track">
                <div
                  className="fn-bar-fill"
                  style={{ width: `${(ratingBreakdown[star] / ratingMax) * 100}%`, background: "var(--fn-marigold)" }}
                />
              </div>
              <span className="fn-bar-count">{ratingBreakdown[star]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="fn-panel">
        <h2>What customers keep mentioning</h2>
        {topKeywords.length === 0 && <p className="fn-muted">Not enough reviews yet to surface keywords.</p>}
        <div className="fn-keyword-row">
          {topKeywords.map((k) => <span className="fn-tag" key={k}>{k}</span>)}
        </div>
      </section>

      {recentTrend.length > 0 && (
        <section className="fn-panel">
          <h2>Recent sentiment trend</h2>
          <div className="fn-trend-row">
            {recentTrend.map((t, i) => (
              <div key={i} className={`fn-trend-dot fn-trend-${t.label}`} title={`${t.label} (rating ${t.rating})`} />
            ))}
          </div>
          <p className="fn-muted fn-fine-print">Oldest to newest, left to right</p>
        </section>
      )}

      <section className="fn-panel">
        <h2>Latest reviews</h2>
        {latestReviews.map((r) => (
          <article className="fn-review-card" key={r._id}>
            <div className="fn-review-top">
              <div>
                <strong>{r.user?.name || "Anonymous"}</strong>
                <StarRating value={r.rating} size={16} />
              </div>
              <SentimentBadge label={r.sentiment?.label} />
            </div>
            <p>{r.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
