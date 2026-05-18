import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { ArrowLeft, Brain, Sparkles, Edit2, Save, X, BookOpen, Activity, Mail, Briefcase, Clock, Plus } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const DEPTS = ['Development', 'Design', 'Marketing', 'HR', 'Finance', 'Operations', 'Sales', 'DevOps', 'QA'];

const EmployeeDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [editForm, setEditForm] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/api/employees/${id}`, config);
                setEmployee(data);
                setEditForm({ name: data.name, email: data.email, department: data.department, skills: [...data.skills], performanceScore: data.performanceScore, experience: data.experience });
            } catch { setError('Failed to load employee.'); }
            finally { setLoading(false); }
        };
        fetch();
    }, [id]);

    const handleSave = async () => {
        setSaving(true); setError('');
        try {
            const { data } = await axios.put(`${API_URL}/api/employees/${id}`, editForm, config);
            setEmployee(data.employee); setEditing(false);
            setSuccess('Updated data shown ✓'); setTimeout(() => setSuccess(''), 2500);
        } catch (err) { setError(err.response?.data?.message || 'Update failed.'); }
        finally { setSaving(false); }
    };

    const generateAI = async () => {
        setAiLoading(true); setError('');
        try {
            const { data } = await axios.post(`${API_URL}/api/ai/recommend`, { employeeId: id }, config);
            setEmployee(prev => ({ ...prev, aiRecommendation: data.recommendation }));
        } catch { setError('AI generation failed. Check API key.'); }
        finally { setAiLoading(false); }
    };

    const addSkill = () => {
        const s = skillInput.trim();
        if (!s || editForm.skills.includes(s)) return;
        setEditForm({ ...editForm, skills: [...editForm.skills, s] }); setSkillInput('');
    };

    const scoreColor = (s) => s >= 80 ? 'var(--secondary)' : s >= 60 ? 'var(--warning)' : 'var(--accent)';

    if (loading) return <><Navbar /><div className="full-loader"><div className="spinner" /></div></>;
    if (!employee) return <><Navbar /><div className="full-loader"><p>Not found. <Link to="/employees">Go back</Link></p></div></>;

    return (
        <>
            <Navbar />
            <div className="container animate-fade-in">
                <Link to="/employees" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                    <ArrowLeft size={15} /> Back to Employees
                </Link>

                {success && <div className="alert alert-success">{success}</div>}
                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
                    {/* LEFT */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="glass-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                                {editing
                                    ? <input className="form-input" style={{ fontWeight: 700 }} value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                    : <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{employee.name}</h2>}
                                <button className={`btn btn-sm ${editing ? 'btn-danger' : 'btn-secondary'}`} id="btn-edit-toggle"
                                    onClick={() => { setEditing(!editing); setError(''); }}>
                                    {editing ? <><X size={13} /> Cancel</> : <><Edit2 size={13} /> Edit</>}
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <Mail size={14} color="var(--primary)" />
                                    {editing ? <input className="form-input" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                                        : <span style={{ color: 'var(--text-muted)' }}>{employee.email}</span>}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <Briefcase size={14} color="var(--primary)" />
                                    {editing ? <select className="form-select" value={editForm.department} onChange={e => setEditForm({ ...editForm, department: e.target.value })}>
                                        {DEPTS.map(d => <option key={d}>{d}</option>)}</select>
                                        : <span className="badge badge-primary">{employee.department}</span>}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <Clock size={14} color="var(--primary)" />
                                    {editing ? <input type="number" className="form-input" value={editForm.experience} min="0"
                                        onChange={e => setEditForm({ ...editForm, experience: Number(e.target.value) })} />
                                        : <span style={{ color: 'var(--text-muted)' }}>{employee.experience} years exp</span>}
                                </div>
                            </div>

                            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <BookOpen size={12} /> Skills
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                    {(editing ? editForm.skills : employee.skills).map(sk => (
                                        <span key={sk} className="skill-tag">
                                            {sk}
                                            {editing && <button className="skill-tag-close" onClick={() => setEditForm({ ...editForm, skills: editForm.skills.filter(s => s !== sk) })}><X size={11} /></button>}
                                        </span>
                                    ))}
                                </div>
                                {editing && (
                                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
                                        <input className="form-input" placeholder="Add skill…" value={skillInput}
                                            onChange={e => setSkillInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                                        <button className="btn btn-secondary btn-sm" onClick={addSkill}><Plus size={14} /></button>
                                    </div>
                                )}
                            </div>

                            {editing && (
                                <button id="btn-save-employee" className="btn btn-success btn-full" style={{ marginTop: '1.25rem' }}
                                    onClick={handleSave} disabled={saving}>
                                    {saving ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving…</> : <><Save size={15} /> Save Changes</>}
                                </button>
                            )}
                        </div>

                        {/* Score Card */}
                        <div className="glass-card">
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Activity size={12} /> Performance Score
                            </p>
                            {editing ? (
                                <input id="edit-perf-score" type="number" className="form-input" value={editForm.performanceScore}
                                    min="0" max="100" onChange={e => setEditForm({ ...editForm, performanceScore: Number(e.target.value) })} />
                            ) : (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.75rem' }}>
                                        <span style={{ fontSize: '2.75rem', fontWeight: 800, color: scoreColor(employee.performanceScore) }}>
                                            {employee.performanceScore}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)' }}>/100</span>
                                    </div>
                                    <div className="score-bar-bg" style={{ height: '10px' }}>
                                        <div className="score-bar-fill" style={{ width: `${employee.performanceScore}%`, background: `linear-gradient(90deg, var(--primary), ${scoreColor(employee.performanceScore)})` }} />
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
                                        {employee.performanceScore >= 80 ? '🌟 High Performer' : employee.performanceScore >= 60 ? '📈 Average Performer' : '⚠️ Needs Improvement'}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: AI Panel */}
                    <div className="ai-panel">
                        <div className="ai-panel-header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.1rem', fontWeight: 700 }}>
                                <Brain size={20} color="var(--primary)" /> AI Recommendation
                            </h3>
                            <button id="btn-generate-ai" className="btn btn-primary btn-sm" onClick={generateAI} disabled={aiLoading}>
                                {aiLoading
                                    ? <><span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> Analyzing…</>
                                    : <><Sparkles size={14} /> {employee.aiRecommendation ? 'Regenerate' : 'Generate Insight'}</>}
                            </button>
                        </div>

                        {aiLoading && (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                <div className="spinner" style={{ margin: '0 auto 1rem' }} />
                                <p style={{ fontSize: '0.875rem' }}>Analyzing {employee.name}'s data…</p>
                            </div>
                        )}
                        {!aiLoading && employee.aiRecommendation && (
                            <div className="ai-content" id="ai-recommendation-output">
                                {employee.aiRecommendation}
                            </div>
                        )}
                        {!aiLoading && !employee.aiRecommendation && (
                            <div style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)' }}>
                                <Brain size={52} style={{ opacity: 0.15, marginBottom: '1rem' }} />
                                <p>No AI recommendation yet.</p>
                                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Click "Generate Insight" for promotion readiness, training suggestions &amp; feedback.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default EmployeeDetails;
