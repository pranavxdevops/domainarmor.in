import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import ScoreBadge from '../components/ScoreBadge.jsx';
import ScanChart from '../components/ScanChart.jsx';

export default function Dashboard() {
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newDomain, setNewDomain] = useState('');
    const [addingDomain, setAddingDomain] = useState(false);
    const [addError, setAddError] = useState('');
    const [scanningId, setScanningId] = useState(null);

    const fetchDomains = async () => {
        try {
            const res = await api.get('/domain/list');
            setDomains(res.data.data.domains);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load domains');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDomains();
    }, []);

    const handleAddDomain = async (e) => {
        e.preventDefault();
        setAddError('');
        setAddingDomain(true);

        try {
            await api.post('/domain/add', { domain: newDomain });
            setNewDomain('');
            await fetchDomains();
        } catch (err) {
            setAddError(err.response?.data?.error || 'Failed to add domain');
        } finally {
            setAddingDomain(false);
        }
    };

    const handleScan = async (domainId) => {
        setScanningId(domainId);
        try {
            await api.post('/domain/check', { domainId });
            await fetchDomains();
        } catch (err) {
            console.error('Scan failed:', err);
        } finally {
            setScanningId(null);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'healthy': return 'status-dot-healthy';
            case 'warning': return 'status-dot-warning';
            case 'critical': return 'status-dot-critical';
            default: return 'bg-surface-600';
        }
    };

    // Aggregate scores for overview chart
    const allScans = domains
        .filter((d) => d.latestScan)
        .map((d) => d.latestScan);

    // Stats
    const totalDomains = domains.length;
    const healthyCount = domains.filter((d) => d.lastScore > 80).length;
    const warningCount = domains.filter((d) => d.lastScore >= 60 && d.lastScore <= 80).length;
    const criticalCount = domains.filter((d) => d.lastScore !== null && d.lastScore < 60).length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-surface-100">Dashboard</h1>
                <p className="text-surface-400 mt-1">Monitor your email domain security posture</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-surface-400">Total Domains</p>
                            <p className="text-2xl font-bold text-surface-100 mt-1">{totalDomains}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-surface-400">Healthy</p>
                            <p className="text-2xl font-bold text-emerald-400 mt-1">{healthyCount}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-surface-400">Warning</p>
                            <p className="text-2xl font-bold text-amber-400 mt-1">{warningCount}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-600/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-surface-400">Critical</p>
                            <p className="text-2xl font-bold text-red-400 mt-1">{criticalCount}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Add Domain Form */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-surface-100 mb-4">Add Domain</h2>
                        <form onSubmit={handleAddDomain} className="flex gap-3">
                            <input
                                type="text"
                                value={newDomain}
                                onChange={(e) => setNewDomain(e.target.value)}
                                className="input-field flex-1"
                                placeholder="Enter domain (e.g., example.com)"
                                required
                            />
                            <button
                                type="submit"
                                disabled={addingDomain}
                                className="btn-primary whitespace-nowrap flex items-center gap-2"
                            >
                                {addingDomain ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        Add Domain
                                    </>
                                )}
                            </button>
                        </form>
                        {addError && (
                            <p className="mt-3 text-sm text-red-400 animate-slide-up">{addError}</p>
                        )}
                    </div>

                    {/* Domain List */}
                    <div className="glass-card overflow-hidden">
                        <div className="p-6 pb-3">
                            <h2 className="text-lg font-semibold text-surface-100">Your Domains</h2>
                        </div>

                        {loading ? (
                            <div className="p-6 space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="skeleton w-3 h-3 rounded-full" />
                                        <div className="skeleton h-5 flex-1 max-w-[200px]" />
                                        <div className="skeleton h-6 w-16 rounded-full" />
                                        <div className="skeleton h-8 w-24 rounded-lg" />
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="p-6 text-center text-red-400">{error}</div>
                        ) : domains.length === 0 ? (
                            <div className="p-12 text-center">
                                <svg className="w-12 h-12 text-surface-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                                </svg>
                                <p className="text-surface-400">No domains added yet.</p>
                                <p className="text-surface-500 text-sm mt-1">Add your first domain above to start monitoring.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-t border-surface-700/50">
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">Domain</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">Score</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">Last Scan</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-surface-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-800/50">
                                        {domains.map((domain) => (
                                            <tr
                                                key={domain._id}
                                                className="hover:bg-surface-800/30 transition-colors group"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className={`status-dot ${getStatusClass(domain.lastStatus)}`} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Link
                                                        to={`/domain/${domain._id}`}
                                                        className="text-surface-100 font-medium hover:text-brand-400 transition-colors"
                                                    >
                                                        {domain.domain}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <ScoreBadge score={domain.lastScore} size="sm" />
                                                </td>
                                                <td className="px-6 py-4 text-sm text-surface-400">
                                                    {domain.latestScan
                                                        ? new Date(domain.latestScan.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })
                                                        : 'Never'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleScan(domain._id)}
                                                            disabled={scanningId === domain._id}
                                                            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                                                        >
                                                            {scanningId === domain._id ? (
                                                                <>
                                                                    <div className="w-3 h-3 border-2 border-surface-300 border-t-transparent rounded-full animate-spin" />
                                                                    Scanning...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                                                    </svg>
                                                                    Scan Now
                                                                </>
                                                            )}
                                                        </button>
                                                        <Link
                                                            to={`/domain/${domain._id}`}
                                                            className="btn-secondary text-xs px-3 py-1.5"
                                                        >
                                                            Details
                                                        </Link>
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

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Overview Chart */}
                    <ScanChart scanLogs={allScans} />

                    {/* Quick Tips */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-surface-100 mb-4">Security Tips</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-lg bg-brand-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs text-brand-400">1</span>
                                </div>
                                <p className="text-sm text-surface-400">Set up SPF records to prevent email spoofing</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-lg bg-brand-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs text-brand-400">2</span>
                                </div>
                                <p className="text-sm text-surface-400">Configure DMARC policy for email authentication</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-lg bg-brand-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs text-brand-400">3</span>
                                </div>
                                <p className="text-sm text-surface-400">Enable DKIM signing for message integrity</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-lg bg-brand-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs text-brand-400">4</span>
                                </div>
                                <p className="text-sm text-surface-400">Monitor blacklists regularly to protect reputation</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
