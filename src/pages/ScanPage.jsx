import { useState } from 'react';
import api from '../api.js';

/* ─── Helper: Score Ring SVG ──────────────────────────────── */
function ScoreRing({ score, status }) {
    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const colorMap = {
        healthy: { stroke: '#10b981', glow: 'rgba(16,185,129,0.35)' },
        warning: { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.35)' },
        critical: { stroke: '#ef4444', glow: 'rgba(239,68,68,0.35)' },
    };
    const c = colorMap[status] || colorMap.critical;

    return (
        <div className="relative w-40 h-40 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r={radius} fill="none" stroke="#1e293b" strokeWidth="10" />
                <circle
                    cx="65" cy="65" r={radius} fill="none"
                    stroke={c.stroke} strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1s ease-out', filter: `drop-shadow(0 0 8px ${c.glow})` }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{score}</span>
                <span className="text-xs font-medium text-surface-400 uppercase tracking-wider">{status}</span>
            </div>
        </div>
    );
}

/* ─── Helper: Check Card ──────────────────────────────────── */
function CheckCard({ label, passed, icon }) {
    return (
        <div className={`glass-card p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] ${passed ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${passed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-300">{label}</p>
                <p className={`text-sm font-semibold ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
                    {passed ? 'Configured' : 'Not Found'}
                </p>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${passed ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                {passed ? (
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : (
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                )}
            </div>
        </div>
    );
}

/* ─── Main Page ───────────────────────────────────────────── */
export default function ScanPage() {
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    const handleScan = async (e) => {
        e.preventDefault();
        if (!domain.trim()) return;

        setLoading(true);
        setError('');
        setResults(null);

        try {
            const res = await api.post('/scan', { domain: domain.trim() });
            setResults(res.data.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)]">
            {/* ──── Hero Section ──────────────────────────────── */}
            <section className="relative px-4 pt-16 pb-12 sm:pt-24 sm:pb-16">
                {/* Decorative glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-brand-600/15 border border-brand-500/20 text-brand-300 text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                        Email Security Scanner
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
                        <span className="text-white">Check Your Domain's</span>
                        <br />
                        <span className="text-gradient">Email Security</span>
                    </h1>
                    <p className="text-surface-400 text-lg sm:text-xl max-w-xl mx-auto mb-10">
                        Instantly analyze SPF, DMARC, DKIM, MX records, blacklist status, and domain expiry — all in one scan.
                    </p>

                    {/* ──── Search Bar ─────────────────────────── */}
                    <form onSubmit={handleScan} className="max-w-2xl mx-auto">
                        <div className="relative flex items-center gap-2 p-2 rounded-2xl bg-surface-900/80 border border-surface-700/60 backdrop-blur-xl shadow-2xl shadow-brand-500/5 focus-within:border-brand-500/50 focus-within:shadow-brand-500/15 transition-all duration-300">
                            <div className="pl-4 text-surface-500">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                placeholder="Enter domain (e.g., example.com)"
                                className="flex-1 bg-transparent text-white text-lg placeholder-surface-500 focus:outline-none py-3 px-2"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !domain.trim()}
                                className="btn-primary flex items-center gap-2 px-8 py-3 text-base whitespace-nowrap"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Scanning...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                        </svg>
                                        Scan Domain
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="mt-6 max-w-xl mx-auto p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
                            {error}
                        </div>
                    )}
                </div>
            </section>

            {/* ──── Loading Skeleton ─────────────────────────── */}
            {loading && (
                <section className="max-w-5xl mx-auto px-4 pb-16 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <div className="glass-card p-8">
                                <div className="skeleton w-40 h-40 rounded-full mx-auto mb-4" />
                                <div className="skeleton h-5 w-32 mx-auto rounded" />
                            </div>
                        </div>
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="glass-card p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="skeleton w-11 h-11 rounded-xl" />
                                        <div className="flex-1 space-y-2">
                                            <div className="skeleton h-4 w-20 rounded" />
                                            <div className="skeleton h-4 w-16 rounded" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ──── Results ──────────────────────────────────── */}
            {results && !loading && (
                <section className="max-w-5xl mx-auto px-4 pb-20 animate-slide-up">
                    {/* Domain name header */}
                    <div className="text-center mb-8">
                        <p className="text-surface-400 text-sm mb-1">Results for</p>
                        <h2 className="text-2xl font-bold text-white">{results.domain}</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* ── Score Card ─────────────────────── */}
                        <div className="lg:col-span-1">
                            <div className="glass-card p-8 text-center">
                                <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-6">Security Score</h3>
                                <ScoreRing score={results.score} status={results.status} />
                                <div className="mt-6">
                                    <span className={`badge-${results.status}`}>
                                        <span className={`status-dot status-dot-${results.status}`} />
                                        {results.status.charAt(0).toUpperCase() + results.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── Security Checks Grid ──────────── */}
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CheckCard
                                label="SPF Record"
                                passed={results.spf}
                                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>}
                            />
                            <CheckCard
                                label="DMARC Record"
                                passed={results.dmarc}
                                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>}
                            />
                            <CheckCard
                                label="DKIM Record"
                                passed={results.dkim}
                                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>}
                            />
                            <CheckCard
                                label="Blacklist Status"
                                passed={!results.blacklisted}
                                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}
                            />
                        </div>
                    </div>

                    {/* ── MX Records ────────────────────────── */}
                    <div className="mt-6 glass-card p-6">
                        <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                            MX Records
                        </h3>
                        {results.mx && results.mx.length > 0 ? (
                            <div className="space-y-2">
                                {results.mx.map((record, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 border border-surface-700/30">
                                        <span className="w-6 h-6 rounded-lg bg-brand-600/20 text-brand-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                                        <code className="text-sm text-surface-200 font-mono">{record}</code>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-surface-500 text-sm">No MX records found</p>
                        )}
                    </div>

                    {/* ── Additional Details Row ────────────── */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* IP Addresses */}
                        <div className="glass-card p-6">
                            <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
                                </svg>
                                IP Addresses
                            </h3>
                            {results.ipAddresses && results.ipAddresses.length > 0 ? (
                                <div className="space-y-2">
                                    {results.ipAddresses.map((ip, i) => (
                                        <div key={i} className="p-3 rounded-xl bg-surface-800/50 border border-surface-700/30">
                                            <code className="text-sm text-surface-200 font-mono">{ip}</code>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-surface-500 text-sm">No IP addresses resolved</p>
                            )}
                        </div>

                        {/* Domain Expiry */}
                        <div className="glass-card p-6">
                            <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                                Domain Expiry
                            </h3>
                            {results.expiryDate ? (
                                (() => {
                                    const expiry = new Date(results.expiryDate);
                                    const daysLeft = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
                                    const isExpiringSoon = daysLeft < 30;
                                    return (
                                        <div className="space-y-3">
                                            <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
                                                <p className="text-lg font-semibold text-white">
                                                    {expiry.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                                <p className={`text-sm mt-1 font-medium ${isExpiringSoon ? 'text-red-400' : 'text-emerald-400'}`}>
                                                    {daysLeft > 0 ? `${daysLeft} days remaining` : 'Expired'}
                                                </p>
                                            </div>
                                            {isExpiringSoon && (
                                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                                    ⚠️ Domain expires within 30 days
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
                                    <p className="text-surface-400 text-sm">Expiry information not available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Blacklist Details (if blacklisted) ── */}
                    {results.blacklisted && results.blacklistDetails && results.blacklistDetails.length > 0 && (
                        <div className="mt-6 glass-card p-6 border-red-500/30">
                            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                                Blacklist Detections
                            </h3>
                            <div className="space-y-2">
                                {results.blacklistDetails.map((d, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                                        <span className="w-2 h-2 rounded-full bg-red-400 shadow-lg shadow-red-400/50 animate-pulse" />
                                        <span className="text-sm text-surface-300">
                                            <code className="text-red-300">{d.ip}</code> listed on <code className="text-red-300">{d.server}</code>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Scan Again Button ─────────────────── */}
                    <div className="mt-10 text-center">
                        <button
                            onClick={() => { setResults(null); setDomain(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="btn-secondary inline-flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                            </svg>
                            Scan Another Domain
                        </button>
                    </div>
                </section>
            )}

            {/* ──── Features (shown when no results) ─────── */}
            {!results && !loading && (
                <section className="max-w-5xl mx-auto px-4 pt-8 pb-20">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            { title: 'DNS Records', desc: 'Check SPF, DMARC, DKIM, and MX records', icon: '🛡️' },
                            { title: 'Blacklist Check', desc: 'Scan against major real-time blacklists', icon: '🔍' },
                            { title: 'Domain Expiry', desc: 'WHOIS lookup for domain expiration date', icon: '📅' },
                        ].map((f, i) => (
                            <div key={i} className="glass-card p-6 text-center group hover:border-brand-500/30 transition-all duration-300">
                                <div className="text-3xl mb-3">{f.icon}</div>
                                <h3 className="text-white font-semibold mb-1">{f.title}</h3>
                                <p className="text-surface-400 text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
