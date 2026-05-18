import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Brain, Sparkles, Users, Trophy, BookOpen, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * AI Recommendation Display Page
 * CO-5: Promotion Recommendation, Employee Ranking, Training Suggestions, AI Feedback
 */
const AIRecommendations = () => {
    const { user } = useContext(AuthContext);
    const [employees, setEmployees] = useState([]);
    const [selected, setSelected] = useState([]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [expandedEmp, setExpandedEmp] = useState(null);

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        axios.get(`${API_URL}/api/employees`, config)
            .then(({ data }) => setEmployees(data))
            .catch(() => setError('Failed to load employees.'))
            .finally(() => setFetching(false));
    }, []);

    const toggleSelect = (id) => {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        setResult(null);
    };
    const selectAll = () => { setSelected(employees.map(e => e._id)); setResult(null); };
    const clearAll = () => { setSelected([]); setResult(null); };

    const handleAnalyze = async () => {
        if (selected.length === 0) { setError('Select at least one employee.'); return; }
        setLoading(true); setError(''); setResult(null);
        try {
            const payload = selected.length === 1
                ? { employeeId: selected[0] }
                : { employeeIds: selected };
            const { data } = await axios.post(`${API_URL}/api/ai/recommend`, payload, config);
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.message || 'AI analysis failed.');
        } finally {
            setLoading(false);
        }
    };

    const scoreColor = (s) => s >= 80 ? 'var(--secondary)' : s >= 60 ? 'var(--warning)' : 'var(--accent)';

    const featureCards = [
        { icon: <Trophy size={20} color="#FCD34D" />, title: 'Promotion Recommendation', desc: 'AI evaluates readiness for promotion based on performance score and experience.' },
        { icon: <Users size={20} color="var(--primary)" />, title: 'Employee Ranking', desc: 'Ranks multiple employees from best to lowest performer with justification.' },
        { icon: <BookOpen size={20} color="var(--secondary)" />, title: 'Training Suggestions', desc: 'Identifies skill gaps and recommends targeted training programs.' },
        { icon: <MessageSquare size={20} color="var(--accent)" />, title: 'AI Feedback', desc: 'Generates structured professional feedback for performance reviews.' },
    ];

    return (
        <>
            <Navbar />
            <div className="container animate-fade-in">
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                        <Brain size={26} color="var(--primary)" /> AI Insights & Recommendations
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Select employees below and run AI analysis for promotion, ranking, training, and feedback.</p>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
                    {featureCards.map((f, i) => (
                        <div key={i} className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                            <div style={{ marginBottom: '0.6rem' }}>{f.icon}</div>
                            <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.3rem' }}>{f.title}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>

                {error && <div className="alert alert-error" id="ai-error">⚠️ {error}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
                    {/* Employee Selector */}
                    <div className="glass-card">
                        <div className="section-header" style={{ marginBottom: '1rem' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Select Employees</h3>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button className="btn btn-secondary btn-sm" onClick={selectAll}>All</button>
                                <button className="btn btn-secondary btn-sm" onClick={clearAll}>Clear</button>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                            {selected.length} of {employees.length} selected
                        </p>

                        {fetching ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                                {employees.map(emp => {
                                    const isSel = selected.includes(emp._id);
                                    return (
                                        <div key={emp._id}
                                            id={`ai-select-${emp._id}`}
                                            onClick={() => toggleSelect(emp._id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                padding: '0.7rem 0.9rem', borderRadius: 'var(--radius)',
                                                cursor: 'pointer', transition: 'all 0.2s',
                                                background: isSel ? 'rgba(99,102,241,0.1)' : 'var(--surface-2)',
                                                border: `1px solid ${isSel ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                                            }}>
                                            <div style={{
                                                width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                                                background: isSel ? 'var(--primary)' : 'transparent',
                                                border: `2px solid ${isSel ? 'var(--primary)' : 'var(--border)'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {isSel && <span style={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>✓</span>}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</p>
                                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{emp.department}</p>
                                            </div>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: scoreColor(emp.performanceScore), flexShrink: 0 }}>
                                                {emp.performanceScore}
                                            </span>
                                        </div>
                                    );
                                })}
                                {employees.length === 0 && (
                                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.875rem' }}>
                                        No employees found.
                                    </p>
                                )}
                            </div>
                        )}

                        <button id="btn-run-ai" className="btn btn-primary btn-full" style={{ marginTop: '1rem' }}
                            onClick={handleAnalyze} disabled={loading || selected.length === 0}>
                            {loading
                                ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Analyzing…</>
                                : <><Sparkles size={16} /> Analyze {selected.length > 0 ? `(${selected.length})` : ''}</>}
                        </button>
                    </div>

                    {/* AI Result Panel */}
                    <div className="ai-panel" style={{ minHeight: '300px' }}>
                        <div className="ai-panel-header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700 }}>
                                <Brain size={18} color="var(--primary)" /> AI Analysis Result
                            </h3>
                            {result && (
                                <span className="badge badge-success">
                                    {result.employeesAnalyzed?.length || 1} analyzed
                                </span>
                            )}
                        </div>

                        {loading && (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                                <div className="spinner" style={{ margin: '0 auto 1rem' }} />
                                <p>AI is processing… This may take a moment.</p>
                            </div>
                        )}

                        {!loading && result && (
                            <>
                                {/* Analyzed employees */}
                                {result.employeesAnalyzed && result.employeesAnalyzed.length > 1 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                                        {result.employeesAnalyzed.map(e => (
                                            <span key={e.id} className="badge badge-primary">{e.name} ({e.performanceScore})</span>
                                        ))}
                                    </div>
                                )}
                                <div className="ai-content" id="ai-analysis-output">
                                    {result.recommendation}
                                </div>
                            </>
                        )}

                        {!loading && !result && (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                                <Brain size={56} style={{ opacity: 0.12, marginBottom: '1rem' }} />
                                <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Ready to analyze</p>
                                <p style={{ fontSize: '0.8rem' }}>
                                    Select one or multiple employees on the left, then click "Analyze" to generate AI insights including promotion readiness, ranking, training suggestions, and feedback.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AIRecommendations;
