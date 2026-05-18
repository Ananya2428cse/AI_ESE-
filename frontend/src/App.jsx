import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';

import Login            from './pages/Login';
import Dashboard        from './pages/Dashboard';
import EmployeeList     from './pages/EmployeeList';
import RegisterEmployee from './pages/RegisterEmployee';
import EmployeeDetails  from './pages/EmployeeDetails';
import AIRecommendations from './pages/AIRecommendations';

/**
 * PrivateRoute — redirects to /login if not authenticated
 * CO-6: Protected Routes
 */
const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <div className="spinner" />
        </div>
    );
    return user ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected */}
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/employees" element={<PrivateRoute><EmployeeList /></PrivateRoute>} />
            <Route path="/register-employee" element={<PrivateRoute><RegisterEmployee /></PrivateRoute>} />
            <Route path="/employee/:id" element={<PrivateRoute><EmployeeDetails /></PrivateRoute>} />
            <Route path="/ai-recommendations" element={<PrivateRoute><AIRecommendations /></PrivateRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
