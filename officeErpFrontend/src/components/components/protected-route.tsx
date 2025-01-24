import React from "react";
import { Navigate } from "react-router-dom";
import store from "../../redux/store";

const ProtectedRoute = ({ element, requiredPermission }) => {
    const token = store?.getState()?.user?.token ?? null;
    const isAuthenticated = token !== null;


    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return element;
};

export default ProtectedRoute;
