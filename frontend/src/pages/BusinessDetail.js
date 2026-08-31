import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import StarRating from "../components/StarRating";
import SentimentBadge from "../components/SentimentBadge";
import { useAuth } from "../context/AuthContext";

export default function BusinessDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isOwner =
    user &&
    business?.owner &&
    (user._id === business.owner || user._id === business.owner._id);

  const load = () => {
    api.get(`/businesses/${id}`).then((res) => setBusiness(res.data));
    api.get(`/reviews/business/${id}`).then((res) => setReviews(res.data));
  };

  useEffect(load, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!rating) return setError("Pick a star rating before submitting.");
    if (!text.trim())
      return setError("Write a few words about your experience.");

    setSubmitting(true);
    try {
      await api.post("/reviews", { business: id, rating, text });
      setRating(0);
      setText("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!business)
    return (
      <div className="fn-page">
        <p className="fn-muted">Loading...</p>
      </div>
    );

  return (
    <div className="fn-page">
      <section className="fn-biz-header">
        <div>
          <p className="fn-eyebrow-plain">
            {business.category} &middot; {business.city || "Nepal"}
          </p>
          <h1>{business.name}</h1>
          {business.description && (
            <p className="fn-muted">{business.description}</p>
          )}
          {business.address && <p className="fn-muted">{business.address}</p>}
        </div>
        <div className="fn-biz-header-score">
          <div className="fn-score-big">{business.avgRating || "—"}</div>
          <StarRating value={business.avgRating} />
          <span className="fn-muted">
            {business.reviewCount} review{business.reviewCount === 1 ? "" : "s"}
          </span>
          {user && (
            <Link className="fn-link-quiet" to={`/dashboard/${business._id}`}>
              View AI insights &rarr;
            </Link>
          )}
        </div>
      </section>

      {business.topKeywords?.length > 0 && (
        <section className="fn-keyword-row">
          {business.topKeywords.slice(0, 6).map((k) => (
            <span className="fn-tag" key={k}>
              {k}
            </span>
          ))}
        </section>
      )}

      <section className="fn-review-form-card">
        <h2>Share your experience</h2>

        {isOwner ? (
          <p className="fn-muted">
            You own this business, so you cannot leave a review for it.
          </p>
        ) : user ? (
          <form onSubmit={handleSubmit}>
            <StarRating value={rating} onChange={setRating} size={28} />

            <textarea
              className="fn-input"
              rows={4}
              placeholder="What stood out? What could be better?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            {error && <p className="fn-error">{error}</p>}

            <button className="fn-btn fn-btn-primary" disabled={submitting}>
              {submitting ? "Analyzing & submitting..." : "Submit review"}
            </button>
          </form>
        ) : (
          <p className="fn-muted">
            <Link to="/login">Log in</Link> to leave a review for this business.
          </p>
        )}
      </section>

      <section className="fn-reviews">
        <h2>Reviews ({reviews.length})</h2>
        {reviews.length === 0 && (
          <p className="fn-muted">No reviews yet &mdash; be the first.</p>
        )}
        {reviews.map((r) => (
          <article className="fn-review-card" key={r._id}>
            <div className="fn-review-top">
              <div>
                <strong>{r.user?.name || "Anonymous"}</strong>
                <StarRating value={r.rating} size={16} />
              </div>
              <SentimentBadge label={r.sentiment?.label} />
            </div>
            <p>{r.text}</p>
            {r.keywords?.length > 0 && (
              <div className="fn-keyword-row">
                {r.keywords.map((k) => (
                  <span className="fn-tag fn-tag-sm" key={k}>
                    {k}
                  </span>
                ))}
              </div>
            )}
            {r.ownerReply?.text && (
              <div className="fn-owner-reply">
                <strong>Reply from {business.name}</strong>
                <p>{r.ownerReply.text}</p>
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
