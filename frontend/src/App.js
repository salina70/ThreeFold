import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import RoleRoute from "./components/RoleRoute";
import Home from "./pages/Home";
import BusinessDetail from "./pages/BusinessDetail";
import AddBusiness from "./pages/AddBusiness";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import OwnerPanel from "./pages/OwnerPanel";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
  return (
    <div className="fn-app">
      <Navbar />
      <main>
        <Routes>
          
          <Route path="/" element={<Home />} />
          <Route path="/business/:id" element={<BusinessDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/add-business" element={<RoleRoute role="owner"><AddBusiness /></RoleRoute>} />
          <Route path="/owner-panel" element={<RoleRoute role="owner"><OwnerPanel /></RoleRoute>} />
          <Route path="/admin" element={<RoleRoute role="admin"><AdminPanel /></RoleRoute>} />
          <Route path="/dashboard/:businessId" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
         
        </Routes>
      </main>
      <footer className="fn-footer">
        <p>Feedback Nepal &mdash; built for customers and businesses across Nepal.</p>
      </footer>
    </div>
  );
}
