import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import api from "../api/axios";

export default function FeedbackRoute({ children }) {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        // Not logged in
        if (!user) {
          setAllowed(false);
          return;
        }

        // Normal users can give feedback
        if (user.role !== "owner") {
          setAllowed(true);
          return;
        }

        // Owner → check business
        const res = await api.get(`/businesses/${id}`);

        const business = res.data.business;

        // Owner owns this business
        if (
          business.owner &&
          business.owner.toString() === user._id.toString()
        ) {
          setAllowed(false);
        } else {
          setAllowed(true);
        }
      } catch (error) {
        console.error("Could not check business ownership", error);

        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };

    checkOwnership();
  }, [id]);

  if (loading) {
    return (
      <div className="fn-page">
        <p>Checking permissions...</p>
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to={`/business/${id}`} replace />;
  }

  return children;
}
