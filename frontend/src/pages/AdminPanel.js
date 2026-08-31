import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function AdminPanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load admin stats"),
      );
  }, []);

  if (error)
    return (
      <div className="fn-page">
        <p className="fn-error">{error}</p>
      </div>
    );
  if (!data)
    return (
      <div className="fn-page">
        <p className="fn-muted">Loading platform stats...</p>
      </div>
    );

  const {
    totalOrganizations,
    totalCustomers,
    totalOwners,
    totalFeedback,
    totalActiveReviewers,
    platformSentiment,
    topCategories,
    organizations,
  } = data;
  const sentimentTotal = Math.max(
    1,
    platformSentiment.positive +
      platformSentiment.neutral +
      platformSentiment.negative,
  );
  const categoryMax = Math.max(1, ...topCategories.map((c) => c.count));

  return (
    <div className="fn-page">
      <p className="fn-eyebrow-plain">Admin panel</p>
      <h1>Platform overview</h1>
      <p className="fn-muted">
        Every organization, customer, and piece of feedback on Feedback Nepal,
        at a glance.
      </p>

      <section className="fn-stat-row">
        <div className="fn-stat-card">
          <span className="fn-stat-value">{totalOrganizations}</span>
          <span className="fn-stat-label">Total organizations</span>
        </div>
        <div className="fn-stat-card">
          <span className="fn-stat-value">{totalCustomers}</span>
          <span className="fn-stat-label">Registered customers</span>
        </div>
        <div className="fn-stat-card">
          <span className="fn-stat-value">{totalOwners}</span>
          <span className="fn-stat-label">Business owners</span>
        </div>
        <div className="fn-stat-card">
          <span className="fn-stat-value">{totalFeedback}</span>
          <span className="fn-stat-label">Total feedback submitted</span>
        </div>
        <div className="fn-stat-card">
          <span className="fn-stat-value">{totalActiveReviewers}</span>
          <span className="fn-stat-label">Customers who've left a review</span>
        </div>
      </section>

      <section className="fn-panel">
        <h2>Platform-wide sentiment</h2>
        <div className="fn-bar-group">
          {[
            { key: "positive", label: "Positive", color: "var(--fn-positive)" },
            { key: "neutral", label: "Neutral", color: "var(--fn-neutral)" },
            {
              key: "negative",
              label: "Needs attention",
              color: "var(--fn-negative)",
            },
          ].map((row) => (
            <div className="fn-bar-row" key={row.key}>
              <span className="fn-bar-label">{row.label}</span>
              <div className="fn-bar-track">
                <div
                  className="fn-bar-fill"
                  style={{
                    width: `${(platformSentiment[row.key] / sentimentTotal) * 100}%`,
                    background: row.color,
                  }}
                />
              </div>
              <span className="fn-bar-count">{platformSentiment[row.key]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="fn-panel">
        <h2>Organizations by category</h2>
        <div className="fn-bar-group">
          {topCategories.map((c) => (
            <div className="fn-bar-row" key={c.category}>
              <span className="fn-bar-label">{c.category}</span>
              <div className="fn-bar-track">
                <div
                  className="fn-bar-fill"
                  style={{
                    width: `${(c.count / categoryMax) * 100}%`,
                    background: "var(--fn-marigold)",
                  }}
                />
              </div>
              <span className="fn-bar-count">{c.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="fn-panel">
        <h2>All organizations ({organizations.length})</h2>
        <div className="fn-table-wrap">
          <table className="fn-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Category</th>
                <th>City</th>
                <th>Avg rating</th>
                <th>Feedback</th>
                <th>Customers</th>
                <th>Sentiment (+/•/-)</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((o) => (
                <tr key={o._id}>
                  <td>
                    <Link to={`/business/${o._id}`}>{o.name}</Link>
                  </td>
                  <td className="fn-muted">{o.category}</td>
                  <td className="fn-muted">{o.city}</td>
                  <td>{o.avgRating || "—"}</td>
                  <td>{o.reviewCount}</td>
                  <td>{o.uniqueCustomers}</td>
                  <td className="fn-muted">
                    {o.sentiment.positive} / {o.sentiment.neutral} /{" "}
                    {o.sentiment.negative}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
