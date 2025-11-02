import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        // Redireciona para a página de login se o usuário não estiver autenticado
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

export default ProtectedRoute;
