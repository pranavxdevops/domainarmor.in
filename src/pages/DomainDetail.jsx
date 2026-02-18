import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api.js';
import ScoreMeter from '../components/ScoreMeter.jsx';
import ScoreBadge from '../components/ScoreBadge.jsx';
import ScanChart from '../components/ScanChart.jsx';

export default function DomainDetail() {
    const { id } = useParams();
    const [domain, setDomain] = useState(null);
    const [scanLogs, setScanLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [scanning, setScanning] = useState(false);

    const fetchDomain = async () => {
        try {
            const res = await api.get(`/domain/${id}`);
            setDomain(res.data.data.domain);
            setScanLogs(res.data.data.scanLogs);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load domain details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDomain();
    }, [id]);

    const handleScan = async () => {
        setScanning(true);
        try {
            await api.post('/domain/check', { domainId: id });
            await fetchDomain();
        } catch (err) {
            console.error('Scan failed:', err);
        } finally {
            setScanning(false);
        }
    };

    const latestScan = scanLogs[0] || null;

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="skeleton h-8 w-64" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="skeleton h-64 rounded-2xl" />
                        <div className="skeleton h-64 rounded-2xl lg:col-span-2" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <Link to="/dashboard" className="btn-secondary">Back to Dashboard</Link>
            </div>
        );
    }

    const CheckItem = ({ label, value, icon }) => (
        <div className="flex items-center justify-between py-3 border-b border-surface-800/50 last:border-0">
            <div className="flex items-center gap-3">
                <span className="text-lg">{icon}</span>
                <span className="text-surface-300 font-medium">{label}</span>
            </div>
            {typeof value === 'boolean' ? (
                value ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Configured
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 text-red-400 text-sm font-semibold">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Missing
                    </span>
                )
            ) : (
                <span className="text-surface-300 text-sm">{value}</span>
            )}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Breadcrumb + Header */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-surface-400 mb-2">
                        <Link to="/dashboard" className="hover:text-brand-400 transition-colors">Dashboard</Link>
                        <span>/</span>
                        <span className="text-surface-200">{domain?.domain}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-surface-100">{domain?.domain}</h1>
                </div>
                <button
                    onClick={handleScan}
                    disabled={scanning}
                    className="btn-primary flex items-center gap-2"
                >
                    {scanning ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Scanning...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                            Run Scan
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score Meter + Quick Status */}
                <div className="space-y-6">
                    {/* Score Card */}
                    <div className="glass-card p-8 flex flex-col items-center glow-brand">
                        <ScoreMeter score={domain?.lastScore} size={180} />
                        <p className="text-sm text-surface-400 mt-4">Security Score</p>
                    </div>

                    {/* Quick Status */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-surface-100 mb-3">Quick Status</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-surface-400">Status</span>
                                <ScoreBadge score={domain?.lastScore} size="sm" />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-surface-400">Total Scans</span>
                                <span className="text-surface-200 font-medium">{scanLogs.length}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-surface-400">Added</span>
                                <span className="text-surface-200 font-medium">
                                    {new Date(domain?.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-surface-400">Last Scan</span>
                                <span className="text-surface-200 font-medium">
                                    {latestScan
                                        ? new Date(latestScan.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })
                                        : 'Never'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Detailed Results */}
                    {latestScan ? (
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-surface-100 mb-4">Latest Scan Results</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                <div>
                                    <CheckItem label="SPF Record" value={latestScan.spf} icon="🔒" />
                                    <CheckItem label="DMARC Policy" value={latestScan.dmarc} icon="📋" />
                                    <CheckItem label="DKIM Signing" value={latestScan.dkim} icon="✍️" />
                                </div>
                                <div>
                                    <CheckItem label="Blacklisted" value={!latestScan.blacklisted} icon="🛡️" />
                                    <CheckItem
                                        label="MX Records"
                                        value={latestScan.mx?.length > 0 ? `${latestScan.mx.length} found` : 'None'}
                                        icon="📧"
                                    />
                                    <CheckItem
                                        label="Domain Expiry"
                                        value={
                                            latestScan.expiryDate
                                                ? new Date(latestScan.expiryDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })
                                                : 'Unknown'
                                        }
                                        icon="📅"
                                    />
                                </div>
                            </div>

                            {/* MX Records List */}
                            {latestScan.mx?.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-surface-800/50">
                                    <h4 className="text-sm font-semibold text-surface-300 mb-3">MX Records</h4>
                                    <div className="space-y-2">
                                        {latestScan.mx.map((mx, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-2 text-sm text-surface-400 bg-surface-800/30 px-3 py-2 rounded-lg"
                                            >
                                                <span className="text-brand-400 font-mono text-xs">{i + 1}</span>
                                                <span className="font-mono">{mx}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="glass-card p-12 text-center">
                            <svg className="w-16 h-16 text-surface-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                            <p className="text-surface-400 text-lg">No scan data yet</p>
                            <p className="text-surface-500 text-sm mt-1">Click "Run Scan" to analyze this domain</p>
                        </div>
                    )}

                    {/* Score History Chart */}
                    <ScanChart scanLogs={scanLogs} />

                    {/* Scan History Table */}
                    {scanLogs.length > 0 && (
                        <div className="glass-card overflow-hidden">
                            <div className="p-6 pb-3">
                                <h3 className="text-lg font-semibold text-surface-100">Scan History</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-t border-surface-700/50">
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider">Score</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-surface-400 uppercase tracking-wider">SPF</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-surface-400 uppercase tracking-wider">DMARC</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-surface-400 uppercase tracking-wider">DKIM</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-surface-400 uppercase tracking-wider">Blacklist</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-800/50">
                                        {scanLogs.map((log) => (
                                            <tr key={log._id} className="hover:bg-surface-800/30 transition-colors">
                                                <td className="px-6 py-3.5 text-sm text-surface-300">
                                                    {new Date(log.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <ScoreBadge score={log.score} size="sm" />
                                                </td>
                                                <td className="px-6 py-3.5 text-center">
                                                    {log.spf ? (
                                                        <span className="text-emerald-400">✓</span>
                                                    ) : (
                                                        <span className="text-red-400">✗</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3.5 text-center">
                                                    {log.dmarc ? (
                                                        <span className="text-emerald-400">✓</span>
                                                    ) : (
                                                        <span className="text-red-400">✗</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3.5 text-center">
                                                    {log.dkim ? (
                                                        <span className="text-emerald-400">✓</span>
                                                    ) : (
                                                        <span className="text-red-400">✗</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3.5 text-center">
                                                    {!log.blacklisted ? (
                                                        <span className="text-emerald-400">Clean</span>
                                                    ) : (
                                                        <span className="text-red-400">Listed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
