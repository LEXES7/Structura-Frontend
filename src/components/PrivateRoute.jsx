import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function PrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);

  if (!currentUser) {

    return <Navigate to="/signin" replace />;
  }

  if (currentUser.isAdmin) {

    return <Navigate to="/admin-dashboard" replace />;
  }


  return <Outlet />;
}