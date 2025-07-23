import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import LoadingScreen from "../hooks/LoadingScreen.jsx";

export default function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  if (loading || showLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
