import React, { useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    // We use a piece of state to "trigger" the check
    const [isAuth, setIsAuth] = useState(() => {
        const userString = localStorage.getItem('skillflow_user');
        try {
            const user = JSON.parse(userString);
            return !!(user && (user._id || user.id));
        } catch {
            return false;
        }
    });

    if (!isAuth) {
        return <Navigate to="/auth" replace />;
    }

    return children;
};

export default ProtectedRoute;