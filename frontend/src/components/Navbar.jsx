import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LogOut, Users, Brain, UserPlus, Activity, BarChart2 } from 'lucide-react';

/**
 * Navbar - Sticky top navigation with protected links
 */
const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

    return (
        <nav className="navbar">
            {/* Brand */}
            <Link to="/" className="navbar-brand">
                <Brain size={22} />
                AI HR Analytics
            </Link>

            {/* Nav Links */}
            <div className="navbar-links">
                <Link to="/" className={isActive('/')} id="nav-dashboard">
                    <BarChart2 size={16} /> Dashboard
                </Link>
                <Link to="/employees" className={isActive('/employees')} id="nav-employees">
                    <Users size={16} /> Employees
                </Link>
                <Link to="/register-employee" className={isActive('/register-employee')} id="nav-add-employee">
                    <UserPlus size={16} /> Add Employee
                </Link>
                <Link to="/ai-recommendations" className={isActive('/ai-recommendations')} id="nav-ai">
                    <Activity size={16} /> AI Insights
                </Link>
            </div>

            {/* User Info + Logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {user.name} &nbsp;
                    <span className="badge badge-primary">{user.role}</span>
                </span>
                <button
                    id="btn-logout"
                    onClick={handleLogout}
                    className="btn btn-secondary btn-sm"
                >
                    <LogOut size={14} /> Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
