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

/* ─── Helper: Record Section ──────────────────────────────── */
function RecordSection({ title, icon, children, badge }) {
    return (
        <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                {icon}
                {title}
                {badge !== undefined && (
                    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-brand-600/20 text-brand-400">
                        {badge}
                    </span>
                )}
            </h3>
            {children}
        </div>
    );
}

/* ─── Helper: Record Row ──────────────────────────────────── */
function RecordRow({ value, index, mono = true }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 border border-surface-700/30">
            {index !== undefined && (
                <span className="w-6 h-6 rounded-lg bg-brand-600/20 text-brand-400 text-xs font-bold flex items-center justify-center shrink-0">{index}</span>
            )}
            <span className={`text-sm text-surface-200 break-all ${mono ? 'font-mono' : ''}`}>{value}</span>
        </div>
    );
}

/* ─── SVG Icons ───────────────────────────────────────────── */
const icons = {
    shield: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
    lock: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>,
    key: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>,
    warning: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
    mail: <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
    document: <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
    server: <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" /></svg>,
    globe: <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
    link: <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>,
    calendar: <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
    database: <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>,
};

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
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-brand-600/15 border border-brand-500/20 text-brand-300 text-sm font-medium">
                        {icons.shield}
                        Email Security Scanner
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
                        <span className="text-white">Check Your Domain's</span>
                        <br />
                        <span className="text-gradient">Email Security</span>
                    </h1>
                    <p className="text-surface-400 text-lg sm:text-xl max-w-xl mx-auto mb-10">
                        Instantly analyze SPF, DMARC, DKIM, MX, TXT, A, AAAA, CNAME, NS records, blacklist status, and domain expiry.
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
                                        {icons.shield}
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
                <section className="max-w-6xl mx-auto px-4 pb-16 animate-fade-in">
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
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="glass-card p-6">
                                <div className="skeleton h-4 w-24 rounded mb-4" />
                                <div className="space-y-2">
                                    <div className="skeleton h-10 rounded-xl" />
                                    <div className="skeleton h-10 rounded-xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ──── Results ──────────────────────────────────── */}
            {results && !loading && (
                <section className="max-w-6xl mx-auto px-4 pb-20 animate-slide-up">
                    {/* Domain header */}
                    <div className="text-center mb-8">
                        <p className="text-surface-400 text-sm mb-1">Results for</p>
                        <h2 className="text-2xl font-bold text-white">{results.domain}</h2>
                    </div>

                    {/* ── Score + Security Checks ────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Score Card */}
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

                        {/* Security Checks Grid */}
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CheckCard label="SPF Record" passed={results.spf} icon={icons.shield} />
                            <CheckCard label="DMARC Record" passed={results.dmarc} icon={icons.lock} />
                            <CheckCard label="DKIM Record" passed={results.dkim} icon={icons.key} />
                            <CheckCard label="Blacklist Status" passed={!results.blacklisted} icon={icons.warning} />
                            <CheckCard label="SSL Certificate" passed={results.ssl?.valid} icon={icons.lock} />
                        </div>
                    </div>

                    {/* ── DNS Records Grid ───────────────────── */}
                    <h3 className="text-lg font-bold text-white mt-10 mb-4 flex items-center gap-2">
                        {icons.globe}
                        DNS Records
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* A Records */}
                        <RecordSection title="A Records" icon={icons.server} badge={results.aRecords?.length || 0}>
                            {results.aRecords && results.aRecords.length > 0 ? (
                                <div className="space-y-2">
                                    {results.aRecords.map((ip, i) => <RecordRow key={i} value={ip} index={i + 1} />)}
                                </div>
                            ) : <p className="text-surface-500 text-sm">No A records found</p>}
                        </RecordSection>

                        {/* AAAA Records */}
                        <RecordSection title="AAAA Records" icon={icons.globe} badge={results.aaaaRecords?.length || 0}>
                            {results.aaaaRecords && results.aaaaRecords.length > 0 ? (
                                <div className="space-y-2">
                                    {results.aaaaRecords.map((ip, i) => <RecordRow key={i} value={ip} index={i + 1} />)}
                                </div>
                            ) : <p className="text-surface-500 text-sm">No AAAA records found</p>}
                        </RecordSection>

                        {/* CNAME Records */}
                        <RecordSection title="CNAME Records" icon={icons.link} badge={results.cname?.length || 0}>
                            {results.cname && results.cname.length > 0 ? (
                                <div className="space-y-2">
                                    {results.cname.map((cn, i) => <RecordRow key={i} value={cn} index={i + 1} />)}
                                </div>
                            ) : <p className="text-surface-500 text-sm">No CNAME records found</p>}
                        </RecordSection>

                        {/* NS Records */}
                        <RecordSection title="NS Records" icon={icons.database} badge={results.ns?.length || 0}>
                            {results.ns && results.ns.length > 0 ? (
                                <div className="space-y-2">
                                    {results.ns.map((ns, i) => <RecordRow key={i} value={ns} index={i + 1} />)}
                                </div>
                            ) : <p className="text-surface-500 text-sm">No NS records found</p>}
                        </RecordSection>

                        {/* MX Records */}
                        <RecordSection title="MX Records" icon={icons.mail} badge={results.mx?.length || 0}>
                            {results.mx && results.mx.length > 0 ? (
                                <div className="space-y-2">
                                    {results.mx.map((r, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 border border-surface-700/30">
                                            <span className="w-6 h-6 rounded-lg bg-brand-600/20 text-brand-400 text-xs font-bold flex items-center justify-center shrink-0">{r.priority}</span>
                                            <code className="text-sm text-surface-200 font-mono break-all">{r.exchange}</code>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-surface-500 text-sm">No MX records found</p>}
                        </RecordSection>

                        {/* SOA Record */}
                        <RecordSection title="SOA Record" icon={icons.document} badge={results.soa ? 1 : 0}>
                            {results.soa ? (
                                <div className="space-y-2 text-sm">
                                    <div className="p-3 rounded-xl bg-surface-800/50 border border-surface-700/30 space-y-1.5">
                                        <div className="flex justify-between"><span className="text-surface-400">Primary NS</span><code className="text-surface-200 font-mono text-xs">{results.soa.nsname}</code></div>
                                        <div className="flex justify-between"><span className="text-surface-400">Admin</span><code className="text-surface-200 font-mono text-xs">{results.soa.hostmaster}</code></div>
                                        <div className="flex justify-between"><span className="text-surface-400">Serial</span><code className="text-surface-200 font-mono text-xs">{results.soa.serial}</code></div>
                                        <div className="flex justify-between"><span className="text-surface-400">Refresh</span><code className="text-surface-200 font-mono text-xs">{results.soa.refresh}s</code></div>
                                        <div className="flex justify-between"><span className="text-surface-400">Retry</span><code className="text-surface-200 font-mono text-xs">{results.soa.retry}s</code></div>
                                        <div className="flex justify-between"><span className="text-surface-400">Expire</span><code className="text-surface-200 font-mono text-xs">{results.soa.expire}s</code></div>
                                        <div className="flex justify-between"><span className="text-surface-400">TTL</span><code className="text-surface-200 font-mono text-xs">{results.soa.minttl}s</code></div>
                                    </div>
                                </div>
                            ) : <p className="text-surface-500 text-sm">No SOA record found</p>}
                        </RecordSection>
                    </div>

                    {/* ── TXT Records (full width) ──────────── */}
                    <div className="mt-6">
                        <RecordSection title="TXT Records" icon={icons.document} badge={results.txt?.length || 0}>
                            {results.txt && results.txt.length > 0 ? (
                                <div className="space-y-2">
                                    {results.txt.map((txt, i) => <RecordRow key={i} value={txt} index={i + 1} />)}
                                </div>
                            ) : <p className="text-surface-500 text-sm">No TXT records found</p>}
                        </RecordSection>
                    </div>

                    {/* ── Domain Expiry ──────────────────────── */}
                    <div className="mt-6">
                        <RecordSection title="Domain Expiry" icon={icons.calendar}>
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
                        </RecordSection>
                    </div>

                    {/* ── SSL Certificate ───────────────────── */}
                    <div className="mt-6">
                        <RecordSection title="SSL Certificate" icon={icons.lock}>
                            {results.ssl ? (
                                results.ssl.error ? (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <p className="text-red-400 text-sm font-medium">SSL Error</p>
                                        <p className="text-surface-400 text-sm mt-1">{results.ssl.error}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Status */}
                                        <div className={`p-4 rounded-xl border ${results.ssl.valid
                                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                                : 'bg-red-500/5 border-red-500/20'
                                            }`}>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`w-3 h-3 rounded-full ${results.ssl.valid ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50 animate-pulse'}`} />
                                                <span className={`text-sm font-semibold ${results.ssl.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {results.ssl.valid ? 'Valid Certificate' : (results.ssl.isExpired ? 'Expired Certificate' : 'Invalid Certificate')}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Details */}
                                        <div className="p-3 rounded-xl bg-surface-800/50 border border-surface-700/30 space-y-2 text-sm">
                                            <div className="flex justify-between gap-4"><span className="text-surface-400 shrink-0">Issuer</span><code className="text-surface-200 font-mono text-xs text-right">{results.ssl.issuer}</code></div>
                                            <div className="flex justify-between gap-4"><span className="text-surface-400 shrink-0">Subject</span><code className="text-surface-200 font-mono text-xs text-right">{results.ssl.subject}</code></div>
                                            {results.ssl.protocol && <div className="flex justify-between gap-4"><span className="text-surface-400 shrink-0">Protocol</span><code className="text-surface-200 font-mono text-xs">{results.ssl.protocol}</code></div>}
                                            <div className="flex justify-between gap-4"><span className="text-surface-400 shrink-0">Valid From</span><code className="text-surface-200 font-mono text-xs">{new Date(results.ssl.validFrom).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</code></div>
                                            <div className="flex justify-between gap-4"><span className="text-surface-400 shrink-0">Valid To</span><code className="text-surface-200 font-mono text-xs">{new Date(results.ssl.validTo).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</code></div>
                                            <div className="flex justify-between gap-4">
                                                <span className="text-surface-400 shrink-0">Expires In</span>
                                                <code className={`font-mono text-xs font-semibold ${results.ssl.daysUntilExpiry < 30 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                    {results.ssl.daysUntilExpiry > 0 ? `${results.ssl.daysUntilExpiry} days` : 'Expired'}
                                                </code>
                                            </div>
                                        </div>
                                        {results.ssl.daysUntilExpiry < 30 && results.ssl.daysUntilExpiry > 0 && (
                                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                                ⚠️ SSL certificate expires within 30 days
                                            </div>
                                        )}
                                    </div>
                                )
                            ) : (
                                <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
                                    <p className="text-surface-400 text-sm">SSL information not available</p>
                                </div>
                            )}
                        </RecordSection>
                    </div>

                    {/* ── Blacklist Details (if blacklisted) ── */}
                    {results.blacklisted && results.blacklistDetails && results.blacklistDetails.length > 0 && (
                        <div className="mt-6 glass-card p-6 border-red-500/30">
                            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                {icons.warning}
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

                    {/* ── Scan Again ─────────────────────────── */}
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

            {/* ──── Features (when no results) ───────────────── */}
            {!results && !loading && (
                <section className="max-w-5xl mx-auto px-4 pt-8 pb-20">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { title: 'Security Checks', desc: 'SPF, DMARC, DKIM', icon: '🛡️' },
                            { title: 'DNS Records', desc: 'A, AAAA, MX, CNAME, NS, TXT, SOA', icon: '📡' },
                            { title: 'Blacklist Scan', desc: 'Real-time blacklist check', icon: '🔍' },
                            { title: 'SSL & Expiry', desc: 'Certificate & domain expiry', icon: '🔒' },
                        ].map((f, i) => (
                            <div key={i} className="glass-card p-5 text-center group hover:border-brand-500/30 transition-all duration-300">
                                <div className="text-2xl mb-2">{f.icon}</div>
                                <h3 className="text-white font-semibold text-sm mb-0.5">{f.title}</h3>
                                <p className="text-surface-400 text-xs">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
