import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { UserPlus, X, Plus, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DEPARTMENTS = ['Development', 'Design', 'Marketing', 'HR', 'Finance', 'Operations', 'Sales', 'DevOps', 'QA'];

/**
 * Employee Registration Form
 * CO-3: useState & useEffect, Form Handling, API Integration
 * Stores: name, email, department, skills (Array), performanceScore, experience
 */
const RegisterEmployee = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        email: '',
        department: '',
        performanceScore: '',
        experience: ''
    });
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const addSkill = () => {
        const s = skillInput.trim();
        if (!s) return;
        if (skills.includes(s)) { setError(`Skill "${s}" already added`); return; }
        setSkills([...skills, s]);
        setSkillInput('');
        setError('');
    };

    const removeSkill = (s) => setSkills(skills.filter(sk => sk !== s));

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (skills.length === 0) { setError('Please add at least one skill.'); return; }
        const score = Number(form.performanceScore);
        if (score < 0 || score > 100) { setError('Performance score must be between 0 and 100.'); return; }

        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const payload = {
                name: form.name,
                email: form.email,
                department: form.department,
                skills,
                performanceScore: score,
                experience: Number(form.experience)
            };
            await axios.post(`${API_URL}/api/employees`, payload, config);
            setSuccess('Employee registered successfully! Data saved in MongoDB.');
            setForm({ name: '', email: '', department: '', performanceScore: '', experience: '' });
            setSkills([]);
            setTimeout(() => navigate('/employees'), 1800);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register employee.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container animate-fade-in">
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <UserPlus size={26} color="var(--primary)" /> Employee Registration
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>Add a new employee to the system with performance details.</p>
                    </div>

                    <div className="glass-card">
                        {/* Alerts */}
                        {error && <div className="alert alert-error" id="reg-error">⚠️ {error}</div>}
                        {success && (
                            <div className="alert alert-success" id="reg-success">
                                <CheckCircle size={16} /> {success}
                            </div>
                        )}

                        <form id="employee-registration-form" onSubmit={handleSubmit}>
                            {/* Name & Email */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="emp-name">Employee Name *</label>
                                    <input id="emp-name" name="name" type="text" className="form-input"
                                        placeholder="e.g. Aman Verma"
                                        value={form.name} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="emp-email">Email Address *</label>
                                    <input id="emp-email" name="email" type="email" className="form-input"
                                        placeholder="aman@gmail.com"
                                        value={form.email} onChange={handleChange} required />
                                </div>
                            </div>

                            {/* Department */}
                            <div className="form-group">
                                <label htmlFor="emp-department">Department *</label>
                                <select id="emp-department" name="department" className="form-select"
                                    value={form.department} onChange={handleChange} required>
                                    <option value="">— Select Department —</option>
                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            {/* Skills */}
                            <div className="form-group">
                                <label>Skills *</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                                    <input id="emp-skill-input" type="text" className="form-input"
                                        placeholder="Type a skill and press Enter or click +"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={handleSkillKeyDown} />
                                    <button type="button" id="btn-add-skill" onClick={addSkill}
                                        className="btn btn-secondary" style={{ flexShrink: 0 }}>
                                        <Plus size={16} />
                                    </button>
                                </div>
                                {/* Skill Tags */}
                                {skills.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {skills.map(sk => (
                                            <span key={sk} className="skill-tag">
                                                {sk}
                                                <button type="button" className="skill-tag-close" onClick={() => removeSkill(sk)}>
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {skills.length === 0 && (
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                        e.g. React, Node.js, MongoDB
                                    </p>
                                )}
                            </div>

                            {/* Score & Experience */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="emp-score">Performance Score * <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>(0–100)</span></label>
                                    <input id="emp-score" name="performanceScore" type="number"
                                        className="form-input" placeholder="e.g. 85"
                                        min="0" max="100"
                                        value={form.performanceScore} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="emp-exp">Years of Experience *</label>
                                    <input id="emp-exp" name="experience" type="number"
                                        className="form-input" placeholder="e.g. 3"
                                        min="0"
                                        value={form.experience} onChange={handleChange} required />
                                </div>
                            </div>

                            {/* Submit */}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button id="btn-register-employee" type="submit"
                                    className="btn btn-primary btn-lg" disabled={loading}
                                    style={{ flex: 1, justifyContent: 'center' }}>
                                    {loading ? (
                                        <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Saving…</>
                                    ) : (
                                        <><UserPlus size={18} /> Register Employee</>
                                    )}
                                </button>
                                <button type="button" className="btn btn-secondary btn-lg"
                                    onClick={() => navigate('/employees')}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Sample Payload */}
                    <div className="glass-card" style={{ marginTop: '1.5rem', fontSize: '0.8rem' }}>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Sample POST /api/employees body:</p>
                        <pre style={{ color: 'var(--secondary)', lineHeight: 1.6 }}>{JSON.stringify({
                            name: "Aman Verma",
                            email: "aman@gmail.com",
                            department: "Development",
                            skills: ["React", "Node.js", "MongoDB"],
                            performanceScore: 85,
                            experience: 3
                        }, null, 2)}</pre>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RegisterEmployee;
