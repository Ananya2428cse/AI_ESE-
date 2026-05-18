import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Brain, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

/**
 * Login Page - JWT Authentication
 * CO-6: JWT Auth, Protected Routes
 */
const Login = () => {
    const [tab, setTab] = useState('login'); // 'login' | 'signup'
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'HR' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (tab === 'login') {
                const success = await login(formData.email, formData.password);
                if (success) { navigate('/'); }
                else { setError('Invalid email or password. Please try again.'); }
            } else {
                const success = await register(formData.name, formData.email, formData.password, formData.role);
                if (success) { navigate('/'); }
                else { setError('Registration failed. Email may already be in use.'); }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'radial-gradient(ellipse at 30% 40%, rgba(99,102,241,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(16,185,129,0.08) 0%, transparent 60%)'
        }}>
            <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '440px' }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex', padding: '1rem',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(16,185,129,0.1))',
                        borderRadius: '1rem', marginBottom: '1rem',
                        border: '1px solid rgba(99,102,241,0.25)'
                    }}>
                        <Brain size={36} color="var(--primary)" />
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.4rem' }}>AI HR Analytics</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>AI-Driven Employee Performance System</p>
                </div>

                {/* Tab Switcher */}
                <div style={{
                    display: 'flex', background: 'var(--surface-2)',
                    borderRadius: 'var(--radius)', padding: '4px', marginBottom: '1.75rem',
                    border: '1px solid var(--border)'
                }}>
                    {['login', 'signup'].map(t => (
                        <button
                            key={t}
                            id={`tab-${t}`}
                            onClick={() => { setTab(t); setError(''); }}
                            style={{
                                flex: 1, padding: '0.55rem', border: 'none', cursor: 'pointer',
                                borderRadius: 'calc(var(--radius) - 2px)', fontWeight: 600,
                                fontSize: '0.875rem', transition: 'all 0.2s',
                                background: tab === t ? 'var(--primary)' : 'transparent',
                                color: tab === t ? 'white' : 'var(--text-muted)'
                            }}
                        >
                            {t === 'login' ? 'Sign In' : 'Sign Up'}
                        </button>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="alert alert-error" id="auth-error">
                        ⚠️ {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} id="auth-form">
                    {tab === 'signup' && (
                        <div className="form-group">
                            <label htmlFor="input-name">Full Name</label>
                            <input id="input-name" name="name" type="text" className="form-input"
                                placeholder="e.g. Aman Verma" value={formData.name}
                                onChange={handleChange} required />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="input-email">Email Address</label>
                        <input id="input-email" name="email" type="email" className="form-input"
                            placeholder="you@example.com" value={formData.email}
                            onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="input-password">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input id="input-password" name="password"
                                type={showPassword ? 'text' : 'password'}
                                className="form-input" placeholder="••••••••"
                                value={formData.password} onChange={handleChange}
                                required style={{ paddingRight: '3rem' }} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {tab === 'signup' && (
                        <div className="form-group">
                            <label htmlFor="input-role">Role</label>
                            <select id="input-role" name="role" className="form-select"
                                value={formData.role} onChange={handleChange}>
                                <option value="HR">HR</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                    )}

                    <button id="btn-auth-submit" type="submit" className="btn btn-primary btn-full btn-lg"
                        disabled={loading} style={{ marginTop: '0.5rem' }}>
                        {loading ? (
                            <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing...</>
                        ) : tab === 'login' ? (
                            <><LogIn size={18} /> Sign In</>
                        ) : (
                            <><UserPlus size={18} /> Create Account</>
                        )}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    AI308B — MERN Full Stack Development
                </p>
            </div>
        </div>
    );
};

export default Login;
