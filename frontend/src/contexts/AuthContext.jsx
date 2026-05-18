import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * AuthProvider - Context for JWT authentication
 * CO-6: JWT Authentication, Signup & Login APIs
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('userInfo');
        if (stored) setUser(JSON.parse(stored));
        setLoading(false);
    }, []);

    /**
     * Login - POST /api/auth/login
     * Returns true on success, false on failure
     */
    const login = async (email, password) => {
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            return false;
        }
    };

    /**
     * Register - POST /api/auth/register
     * Returns true on success, false on failure
     */
    const register = async (name, email, password, role = 'HR') => {
        try {
            const { data } = await axios.post(`${API_URL}/api/auth/register`, { name, email, password, role });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Register error:', error.response?.data || error.message);
            return false;
        }
    };

    /**
     * Logout - clears token and user state
     */
    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
