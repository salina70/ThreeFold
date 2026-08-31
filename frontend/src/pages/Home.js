import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import StarRating from "../components/StarRating";

export default function Home() {
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/businesses/categories")
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;

    const timeout = setTimeout(() => {
      api
        .get("/businesses", { params })
        .then((res) => setBusinesses(res.data))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timeout);
  }, [search, category]);

  return (
    <div className="fn-page">
      <section className="fn-hero">
        <h1>
          Find a <span className="blue">business</span>
          <br />
          Tell them how it went.
        </h1>
        <p>
          Feedback Nepal reads every review the moment it's submitted &mdash;
          rating, tone, and the words customers actually used &mdash; so
          business owners see what's working and what needs fixing, in real
          time.
        </p>
        <div className="fn-search-row">
          <input
            type="text"
            placeholder="Search a business, category, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="fn-input fn-search-input"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="fn-input"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="fn-list">
        {loading && <p className="fn-muted">Loading businesses...</p>}
        {!loading && businesses.length === 0 && (
          <div className="fn-empty">
            <p>No businesses match yet.</p>
            <Link to="/add-business" className="fn-btn fn-btn-primary">
              List the first one
            </Link>
          </div>
        )}

        {businesses.map((b) => (
          <Link to={`/business/${b._id}`} key={b._id} className="fn-biz-row">
            <div className="fn-biz-row-main">
              <h3>{b.name}</h3>
              <p className="fn-muted">
                {b.category} &middot; {b.city || "Nepal"}
              </p>
            </div>
            <div className="fn-biz-row-meta">
              <StarRating value={b.avgRating} />
              <span className="fn-muted">
                {b.reviewCount} review{b.reviewCount === 1 ? "" : "s"}
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
