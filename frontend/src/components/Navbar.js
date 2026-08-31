import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navClass = ({ isActive }) =>
    `transition-all duration-200 ${
      isActive
        ? "font-semibold text-blue-600"
        : "text-gray-600 hover:text-blue-600"
    }`;

  return (
    <header className="fn-nav">

      <Link to="/" className="fn-nav-brand">
        <Logo />
      </Link>

      <nav className="fn-nav-links">

        <NavLink
          to="/"
          end
          className={navClass}
        >
          Browse businesses
        </NavLink>

        {user && user.role === "owner" && (
          <NavLink
            to="/owner-panel"
            className={navClass}
          >
            Owner panel
          </NavLink>
        )}

        {user && user.role === "admin" && (
          <NavLink
            to="/admin"
            className={navClass}
          >
            Admin panel
          </NavLink>
        )}

        {user && user.role === "owner" && (
          <NavLink
            to="/add-business"
            className={navClass}
          >
            List a business
          </NavLink>
        )}

        {user ? (
          <>
            <span className="fn-nav-user">
              Hi, {user.name.split(" ")[0]}
            </span>

            <button
              className="fn-btn fn-btn-ghost"
              onClick={handleLogout}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={navClass}
            >
              Log in
            </NavLink>

            <NavLink
              to="/register"
            className="signup"
            style={{color:"white"}}
            >
              Sign up
            </NavLink>
          </>
        )}

      </nav>
    </header>
  );
}