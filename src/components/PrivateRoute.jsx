import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function PrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);

  if (!currentUser) {
    // Redirect to signin if the user is not logged in
    return <Navigate to="/signin" replace />;
  }

  if (currentUser.isAdmin) {
    // Redirect admins to the admin dashboard
    return <Navigate to="/admin-dashboard" replace />;
  }

  // Allow regular users to access their dashboard
  return <Outlet />;
}