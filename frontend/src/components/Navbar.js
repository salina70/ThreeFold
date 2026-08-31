import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="fn-nav">
      <Link to="/" className="fn-nav-brand">
        <Logo />
      </Link>
      <nav className="fn-nav-links">
        <Link to="/">Browse businesses</Link>
        {user && user.role === "owner" && <Link to="/owner-panel">Owner panel</Link>}
        {user && user.role === "admin" && <Link to="/admin">Admin panel</Link>}
        {user && user.role === "owner" && <Link to="/add-business">List a business</Link>}
        {user ? (
          <>
            <span className="fn-nav-user">Hi, {user.name.split(" ")[0]}</span>
            <button className="fn-btn fn-btn-ghost" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register" className="fn-btn fn-btn-primary">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
