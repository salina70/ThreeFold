import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import StarRating from "../components/StarRating";
import SentimentBadge from "../components/SentimentBadge";

export default function OwnerPanel() {
  const [businesses, setBusinesses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const load = () => {
    api.get("/businesses/mine").then((res) => setBusinesses(res.data));
    api.get("/reviews/owner").then((res) => setReviews(res.data));
  };

  useEffect(load, []);

  const stats = {
    totalBusinesses: businesses.length,
    totalReviews: reviews.length,
    avgRating: businesses.length
      ? (businesses.reduce((s, b) => s + (b.avgRating || 0), 0) / businesses.length).toFixed(2)
      : "—",
  };

  const handleReplyChange = (id, value) => setReplyDrafts({ ...replyDrafts, [id]: value });

  const submitReply = async (reviewId) => {
    const text = (replyDrafts[reviewId] || "").trim();
    if (!text) return;
    setBusyId(reviewId);
    setError("");
    try {
      await api.post(`/reviews/${reviewId}/reply`, { text });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save reply");
    } finally {
      setBusyId(null);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Remove this review? This can't be undone.")) return;
    setBusyId(reviewId);
    try {
      await api.delete(`/reviews/${reviewId}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete review");
    } finally {
      setBusyId(null);
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await api.get("/reviews/owner/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "feedback-nepal-reviews.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Could not export report");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fn-page">
      <p className="fn-eyebrow-plain">Owner panel</p>
      <h1>Your businesses</h1>
      <p className="fn-muted">View every review across your businesses, reply publicly, and export a full report.</p>

      <section className="fn-stat-row">
        <div className="fn-stat-card">
          <span className="fn-stat-value">{stats.totalBusinesses}</span>
          <span className="fn-stat-label">Businesses you run</span>
        </div>
        <div className="fn-stat-card">
          <span className="fn-stat-value">{stats.totalReviews}</span>
          <span className="fn-stat-label">Total reviews received</span>
        </div>
        <div className="fn-stat-card">
          <span className="fn-stat-value">{stats.avgRating}</span>
          <span className="fn-stat-label">Average rating across all</span>
        </div>
      </section>

      {error && <p className="fn-error">{error}</p>}

      <section className="fn-panel">
        <div className="fn-panel-header-row">
          <h2>Your listings</h2>
          <Link to="/add-business" className="fn-btn fn-btn-ghost">List another business</Link>
        </div>
        {businesses.length === 0 && <p className="fn-muted">You haven't listed a business yet.</p>}
        <div className="fn-list">
          {businesses.map((b) => (
            <div className="fn-biz-row" key={b._id}>
              <div className="fn-biz-row-main">
                <h3>{b.name}</h3>
                <p className="fn-muted">{b.category} &middot; {b.city || "Nepal"}</p>
              </div>
              <div className="fn-biz-row-meta">
                <StarRating value={b.avgRating} />
                <Link to={`/dashboard/${b._id}`} className="fn-link-quiet">Full AI insights &rarr;</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="fn-panel">
        <div className="fn-panel-header-row">
          <h2>All reviews ({reviews.length})</h2>
          <button className="fn-btn fn-btn-ghost" onClick={exportCsv} disabled={exporting || reviews.length === 0}>
            {exporting ? "Preparing..." : "Export CSV report"}
          </button>
        </div>

        {reviews.length === 0 && <p className="fn-muted">No reviews yet across your businesses.</p>}

        {reviews.map((r) => (
          <article className="fn-review-card" key={r._id}>
            <div className="fn-review-top">
              <div>
                <strong>{r.businessName}</strong> &middot; <span className="fn-muted">{r.user?.name || "Anonymous"}</span>
                <StarRating value={r.rating} size={16} />
              </div>
              <SentimentBadge label={r.sentiment?.label} />
            </div>
            <p>{r.text}</p>
            {r.keywords?.length > 0 && (
              <div className="fn-keyword-row">
                {r.keywords.map((k) => <span className="fn-tag fn-tag-sm" key={k}>{k}</span>)}
              </div>
            )}

            {r.ownerReply?.text ? (
              <div className="fn-owner-reply">
                <strong>Your reply</strong>
                <p>{r.ownerReply.text}</p>
              </div>
            ) : (
              <div className="fn-reply-form">
                <textarea
                  className="fn-input"
                  rows={2}
                  placeholder="Write a public reply to this customer..."
                  value={replyDrafts[r._id] || ""}
                  onChange={(e) => handleReplyChange(r._id, e.target.value)}
                />
                <button className="fn-btn fn-btn-ghost" onClick={() => submitReply(r._id)} disabled={busyId === r._id}>
                  {busyId === r._id ? "Saving..." : "Post reply"}
                </button>
              </div>
            )}

            <button className="fn-link-danger" onClick={() => deleteReview(r._id)} disabled={busyId === r._id}>
              Remove review
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
