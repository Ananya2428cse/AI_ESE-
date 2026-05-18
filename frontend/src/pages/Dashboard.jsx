import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Users, TrendingUp, Award, Star, BarChart2, Brain } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Dashboard Page
 * CO-3, CO-4: Statistics overview, dynamic data rendering, API integration
 */
const Dashboard = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${API_URL}/api/employees`, config);
                setEmployees(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchEmployees();
    }, [user]);

    if (loading) {
        return (
            <><Navbar />
                <div className="full-loader">
                    <div className="spinner" />
                    <span>Loading dashboard…</span>
                </div>
            </>
        );
    }

    // Stats
    const totalEmployees = employees.length;
    const avgScore = totalEmployees > 0
        ? (employees.reduce((s, e) => s + e.performanceScore, 0) / totalEmployees).toFixed(1)
        : 0;
    const topPerformer = totalEmployees > 0
        ? [...employees].sort((a, b) => b.performanceScore - a.performanceScore)[0]
        : null;
    const avgExp = totalEmployees > 0
        ? (employees.reduce((s, e) => s + e.experience, 0) / totalEmployees).toFixed(1)
        : 0;

    // Department breakdown
    const deptMap = employees.reduce((acc, e) => {
        acc[e.department] = (acc[e.department] || 0) + 1;
        return acc;
    }, {});

    const scoreColor = (score) => {
        if (score >= 80) return 'var(--secondary)';
        if (score >= 60) return 'var(--warning)';
        return 'var(--accent)';
    };

    return (
        <>
            <Navbar />
            <div className="container animate-fade-in">
                {/* Page Hero */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                        Welcome back, {user.name} 👋
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Here's your workforce overview powered by AI analytics.</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.1)' }}>
                            <Users size={22} color="var(--primary)" />
                        </div>
                        <div>
                            <p className="stat-label">Total Employees</p>
                            <p className="stat-value">{totalEmployees}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
                            <TrendingUp size={22} color="var(--secondary)" />
                        </div>
                        <div>
                            <p className="stat-label">Avg Performance</p>
                            <p className="stat-value">{avgScore}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/100</span></p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(244,63,94,0.1)' }}>
                            <Award size={22} color="var(--accent)" />
                        </div>
                        <div>
                            <p className="stat-label">Top Performer</p>
                            <p className="stat-value" style={{ fontSize: '1rem' }}>{topPerformer?.name || '—'}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
                            <Star size={22} color="var(--warning)" />
                        </div>
                        <div>
                            <p className="stat-label">Avg Experience</p>
                            <p className="stat-value">{avgExp}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}> yrs</span></p>
                        </div>
                    </div>
                </div>

                <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                    {/* Recent Employees */}
                    <div className="glass-card">
                        <div className="section-header">
                            <div>
                                <h2 className="section-title" style={{ fontSize: '1.15rem' }}>Recent Employees</h2>
                                <p className="section-subtitle">Latest additions to the team</p>
                            </div>
                            <Link to="/employees" className="btn btn-secondary btn-sm">View All</Link>
                        </div>
                        {employees.length === 0 ? (
                            <div className="empty-state">
                                <Users size={48} />
                                <p>No employees yet. <Link to="/register-employee" style={{ color: 'var(--primary)' }}>Add one!</Link></p>
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Department</th>
                                            <th>Performance</th>
                                            <th>Exp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employees.slice(0, 6).map(emp => (
                                            <tr key={emp._id}>
                                                <td>
                                                    <Link to={`/employee/${emp._id}`} style={{ fontWeight: 500, color: 'var(--text)' }}>
                                                        {emp.name}
                                                    </Link>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                                                </td>
                                                <td><span className="badge badge-primary">{emp.department}</span></td>
                                                <td>
                                                    <div className="score-bar-wrapper">
                                                        <div className="score-bar-bg">
                                                            <div className="score-bar-fill" style={{ width: `${emp.performanceScore}%`, background: scoreColor(emp.performanceScore) }} />
                                                        </div>
                                                        <span style={{ fontSize: '0.8rem', minWidth: '36px', color: scoreColor(emp.performanceScore), fontWeight: 600 }}>
                                                            {emp.performanceScore}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ color: 'var(--text-muted)' }}>{emp.experience}y</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Department Breakdown */}
                    <div className="glass-card">
                        <h2 className="section-title" style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>
                            <BarChart2 size={18} style={{ verticalAlign: 'middle', marginRight: '0.4rem', color: 'var(--primary)' }} />
                            By Department
                        </h2>
                        {Object.keys(deptMap).length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No data yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                {Object.entries(deptMap).sort((a, b) => b[1] - a[1]).map(([dept, count]) => (
                                    <div key={dept}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                                            <span style={{ fontWeight: 500 }}>{dept}</span>
                                            <span style={{ color: 'var(--text-muted)' }}>{count} emp</span>
                                        </div>
                                        <div className="score-bar-bg">
                                            <div className="score-bar-fill" style={{
                                                width: `${(count / totalEmployees) * 100}%`,
                                                background: 'linear-gradient(90deg, var(--primary), var(--secondary))'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Quick AI Link */}
                        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                            <Link to="/ai-recommendations" className="btn btn-primary btn-full">
                                <Brain size={16} /> AI Insights
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
