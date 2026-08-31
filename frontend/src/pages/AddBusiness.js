import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function AddBusiness() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", category: "", description: "", address: "", city: "", phone: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.category) return setError("Name and category are required.");

    setSubmitting(true);
    try {
      const { data } = await api.post("/businesses", form);
      navigate(`/business/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create business.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fn-page fn-page-narrow">
      <h1>List your business</h1>
      <p className="fn-muted">Get discovered, and start collecting AI-analyzed customer feedback.</p>

      <form onSubmit={handleSubmit} className="fn-form-card">
        <label>Business name</label>
        <input className="fn-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Himalayan Java Coffee" />

        <label>Category</label>
        <input className="fn-input" name="category" value={form.category} onChange={handleChange} placeholder="e.g. Cafe, Restaurant, Retail" />

        <label>City</label>
        <input className="fn-input" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Kathmandu" />

        <label>Address</label>
        <input className="fn-input" name="address" value={form.address} onChange={handleChange} placeholder="Street, area" />

        <label>Phone</label>
        <input className="fn-input" name="phone" value={form.phone} onChange={handleChange} placeholder="98XXXXXXXX" />

        <label>Description</label>
        <textarea className="fn-input" rows={4} name="description" value={form.description} onChange={handleChange} placeholder="What makes this business worth visiting?" />

        {error && <p className="fn-error">{error}</p>}
        <button className="fn-btn fn-btn-primary" disabled={submitting}>
          {submitting ? "Creating..." : "Create business"}
        </button>
      </form>
    </div>
  );
}
