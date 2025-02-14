import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import store from "../../redux/store";

const ProtectedRoute = ({ element, requiredPermission }) => {
    const permissions = useSelector((state: any) => state?.user?.permissions);
    const token = store?.getState()?.user?.token ?? null;
    const isAuthenticated = !!token;

    const [module, action] = requiredPermission.split(".");

    const hasPermission = permissions?.[module]?.[action] ?? false;

    if (!isAuthenticated || !hasPermission) {
        return <Navigate to="/login" replace />;
    }

    return element;
};

export default ProtectedRoute;
