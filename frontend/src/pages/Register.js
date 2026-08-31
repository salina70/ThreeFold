import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fn-page fn-page-narrow">
      <h1>Create your account</h1>
      <form onSubmit={handleSubmit} className="fn-form-card">
        <label>Full name</label>
        <input className="fn-input" name="name" value={form.name} onChange={handleChange} required />
        <label>Email</label>
        <input className="fn-input" type="email" name="email" value={form.email} onChange={handleChange} required />
        <label>Password</label>
        <input className="fn-input" type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />

        <label>I am a...</label>
        <div className="fn-radio-row">
          <label className="fn-radio">
            <input type="radio" name="role" value="customer" checked={form.role === "customer"} onChange={handleChange} />
            Customer, here to leave reviews
          </label>
          <label className="fn-radio">
            <input type="radio" name="role" value="owner" checked={form.role === "owner"} onChange={handleChange} />
            Business owner
          </label>
        </div>

        {error && <p className="fn-error">{error}</p>}
        <button className="fn-btn fn-btn-primary" disabled={submitting}>{submitting ? "Creating..." : "Sign up"}</button>
        <p className="fn-muted mt">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
