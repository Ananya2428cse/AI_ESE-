import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Search, Filter, Trash2, Eye, UserPlus, X, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const DEPARTMENTS = ['All', 'Development', 'Design', 'Marketing', 'HR', 'Finance', 'Operations', 'Sales', 'DevOps', 'QA'];

/**
 * Employee List Page with Search & Filter Section
 * CO-3: useState & useEffect, API Integration
 * CO-4: Fetch employee list, Delete employee
 */
const EmployeeList = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    const [error, setError] = useState('');

    // Filter state
    const [searchName, setSearchName] = useState('');
    const [filterDept, setFilterDept] = useState('All');
    const [minScore, setMinScore] = useState('');
    const [maxScore, setMaxScore] = useState('');
    const [isFiltered, setIsFiltered] = useState(false);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    // Initial fetch — GET /api/employees
    const fetchAll = async () => {
        setLoading(true);
        setIsFiltered(false);
        try {
            const { data } = await axios.get(`${API_URL}/api/employees`, config);
            setEmployees(data);
        } catch (err) {
            setError('Failed to load employees.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (user) fetchAll(); }, [user]);

    // Search & Filter — GET /api/employees/search?department=...
    const handleSearch = async () => {
        setLoading(true);
        setIsFiltered(true);
        try {
            const params = new URLSearchParams();
            if (searchName)                       params.append('name', searchName);
            if (filterDept && filterDept !== 'All') params.append('department', filterDept);
            if (minScore)                          params.append('minScore', minScore);
            if (maxScore)                          params.append('maxScore', maxScore);

            const { data } = await axios.get(`${API_URL}/api/employees/search?${params.toString()}`, config);
            setEmployees(data);
        } catch (err) {
            setError('Search failed.');
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchName('');
        setFilterDept('All');
        setMinScore('');
        setMaxScore('');
        fetchAll();
    };

    // DELETE /api/employees/:id
    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
        setDeleting(id);
        try {
            await axios.delete(`${API_URL}/api/employees/${id}`, config);
            setEmployees(prev => prev.filter(e => e._id !== id));
        } catch (err) {
            setError('Failed to delete employee.');
        } finally {
            setDeleting(null);
        }
    };

    const scoreColor = (score) => {
        if (score >= 80) return 'var(--secondary)';
        if (score >= 60) return 'var(--warning)';
        return 'var(--accent)';
    };

    const scoreBadgeClass = (score) => {
        if (score >= 80) return 'badge badge-success';
        if (score >= 60) return 'badge badge-warning';
        return 'badge badge-danger';
    };

    return (
        <>
            <Navbar />
            <div className="container animate-fade-in">
                {/* Header */}
                <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Employee Directory</h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            {employees.length} employee{employees.length !== 1 ? 's' : ''} {isFiltered ? 'found' : 'total'}
                        </p>
                    </div>
                    <Link to="/register-employee" className="btn btn-primary" id="btn-go-register">
                        <UserPlus size={16} /> Add Employee
                    </Link>
                </div>

                {/* ── Search & Filter Section ── */}
                <div className="filter-bar" id="filter-section">
                    {/* Name search */}
                    <div className="form-group" style={{ flex: 2 }}>
                        <label htmlFor="filter-name">Search by Name</label>
                        <div className="search-bar-wrapper">
                            <Search size={16} className="search-bar-icon" />
                            <input
                                id="filter-name"
                                type="text"
                                className="form-input"
                                placeholder="Employee name…"
                                value={searchName}
                                onChange={e => setSearchName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                    </div>

                    {/* Department filter */}
                    <div className="form-group">
                        <label htmlFor="filter-dept">Department</label>
                        <select id="filter-dept" className="form-select"
                            value={filterDept}
                            onChange={e => setFilterDept(e.target.value)}>
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    {/* Min Score */}
                    <div className="form-group" style={{ flex: 0.7 }}>
                        <label htmlFor="filter-min">Min Score</label>
                        <input id="filter-min" type="number" className="form-input"
                            placeholder="0" min="0" max="100"
                            value={minScore} onChange={e => setMinScore(e.target.value)} />
                    </div>

                    {/* Max Score */}
                    <div className="form-group" style={{ flex: 0.7 }}>
                        <label htmlFor="filter-max">Max Score</label>
                        <input id="filter-max" type="number" className="form-input"
                            placeholder="100" min="0" max="100"
                            value={maxScore} onChange={e => setMaxScore(e.target.value)} />
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', paddingBottom: '0' }}>
                        <button id="btn-search" onClick={handleSearch} className="btn btn-primary" style={{ height: '42px' }}>
                            <Filter size={15} /> Search
                        </button>
                        {isFiltered && (
                            <button id="btn-clear-filter" onClick={clearFilters}
                                className="btn btn-secondary" style={{ height: '42px' }}>
                                <X size={15} /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && <div className="alert alert-error">{error} <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><X size={14} /></button></div>}

                {/* Table */}
                <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                    {loading ? (
                        <div className="full-loader" style={{ minHeight: '300px' }}>
                            <div className="spinner" />
                            <span>Loading employees…</span>
                        </div>
                    ) : employees.length === 0 ? (
                        <div className="empty-state">
                            <Search size={52} />
                            <p style={{ marginBottom: '1rem' }}>No employees found.</p>
                            {isFiltered ? (
                                <button onClick={clearFilters} className="btn btn-secondary">
                                    <RefreshCw size={15} /> Show All
                                </button>
                            ) : (
                                <Link to="/register-employee" className="btn btn-primary">
                                    <UserPlus size={15} /> Add First Employee
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name / Email</th>
                                        <th>Department</th>
                                        <th>Skills</th>
                                        <th>Performance</th>
                                        <th>Exp</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((emp, idx) => (
                                        <tr key={emp._id} id={`emp-row-${emp._id}`}>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{idx + 1}</td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{emp.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                                            </td>
                                            <td>
                                                <span className="badge badge-primary">{emp.department}</span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', maxWidth: '200px' }}>
                                                    {emp.skills.slice(0, 3).map(sk => (
                                                        <span key={sk} className="skill-tag" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>{sk}</span>
                                                    ))}
                                                    {emp.skills.length > 3 && (
                                                        <span className="badge badge-default">+{emp.skills.length - 3}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                    <div className="score-bar-bg" style={{ width: '70px' }}>
                                                        <div className="score-bar-fill"
                                                            style={{ width: `${emp.performanceScore}%`, background: scoreColor(emp.performanceScore) }} />
                                                    </div>
                                                    <span className={scoreBadgeClass(emp.performanceScore)}>
                                                        {emp.performanceScore}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)' }}>{emp.experience} yr{emp.experience !== 1 ? 's' : ''}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                    <Link
                                                        to={`/employee/${emp._id}`}
                                                        className="btn btn-secondary btn-sm"
                                                        id={`btn-view-${emp._id}`}
                                                        title="View Details"
                                                    >
                                                        <Eye size={14} />
                                                    </Link>
                                                    <button
                                                        id={`btn-delete-${emp._id}`}
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDelete(emp._id, emp.name)}
                                                        disabled={deleting === emp._id}
                                                        title="Delete Employee"
                                                    >
                                                        {deleting === emp._id
                                                            ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                                                            : <Trash2 size={14} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default EmployeeList;
