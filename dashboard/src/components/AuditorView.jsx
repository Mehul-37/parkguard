import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

export default function AuditorView() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleExport = () => {
        if (!startDate || !endDate) return;

        // Convert to Unix timestamps
        const startTs = Math.floor(new Date(startDate).getTime() / 1000);
        const endTs = Math.floor(new Date(endDate).setHours(23, 59, 59) / 1000);

        let url = `${API_BASE_URL}/export-transactions?start_date=${startTs}&end_date=${endTs}`;
        window.open(url, '_blank');
        setShowExportModal(false);
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/transactions`);
            if (!res.ok) throw new Error("Failed to fetch ledger");
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error(err);
            setError("Connection to Auditor Node failed. Retrying...");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const verifyChain = (tx, index, allTx) => {
        if (index === 0) return true; // First block is genesis-like
        const prevTx = allTx[index - 1];
        return tx.prev_hash === prevTx.hash;
    };

    const handleReset = async () => {
        if (!confirm("Are you sure you want to reset the entire system? All data will be lost.")) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/reset`, { method: 'POST' });
            if (!res.ok) throw new Error("Reset failed");
            await fetchData(); // Refresh data after reset
        } catch (err) {
            console.error(err);
            setError("System Reset Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-6 h-full flex flex-col animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span className="w-2 h-8 bg-blue-500 rounded-full inline-block"></span>
                        MCD Auditor View
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Live immutable transaction ledger</p>
                </div>
                <div className="flex items-center gap-3">
                    {error && (
                        <span className="text-red-400 text-xs font-mono bg-red-500/10 px-2 py-1 rounded border border-red-500/20 animate-pulse">
                            {error}
                        </span>
                    )}
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded-lg transition-all text-xs font-bold uppercase tracking-wider border border-emerald-500/20 flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export Ledger
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all text-xs font-bold uppercase tracking-wider border border-red-500/20"
                    >
                        Reset System
                    </button>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all text-sm font-medium border border-white/5 flex items-center gap-2"
                    >
                        {loading ? (
                            <span className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        )}
                        {loading ? 'Syncing...' : 'Refresh Chain'}
                    </button>
                </div>
            </div>

            <div className="overflow-auto custom-scrollbar flex-1 rounded-xl border border-white/5 bg-slate-900/30">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/80 backdrop-blur sticky top-0 z-10 text-xs text-slate-400 font-semibold uppercase tracking-wider border-b border-white/5">
                        <tr>
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4">Plate</th>
                            <th className="px-6 py-4">Slot</th>
                            <th className="px-6 py-4">Chain Integrity</th>
                            <th className="px-6 py-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {(() => {
                            // Group transactions by Ticket ID
                            const sessions = {};
                            data.forEach((tx, idx) => {
                                if (!sessions[tx.ticket_id]) {
                                    sessions[tx.ticket_id] = {
                                        entry: null,
                                        exit: null,
                                        isValid: true,
                                        originalIdx: idx
                                    };
                                }

                                // Verify chain integrity for this tx
                                const isChainValid = verifyChain(tx, idx, data);
                                if (!isChainValid) sessions[tx.ticket_id].isValid = false;

                                // Backend uses SINGLE record for both entry/exit
                                // If status is COMPLETED, it contains both info
                                sessions[tx.ticket_id].entry = tx;

                                if (tx.status === 'COMPLETED' || tx.type === 'EXIT') {
                                    // Synthesize exit object for UI
                                    sessions[tx.ticket_id].exit = {
                                        ...tx,
                                        timestamp: tx.exit_time || tx.timestamp, // Use exit_time if available
                                        type: 'EXIT'
                                    };
                                }
                            });

                            // Convert to array and sort by most recent activity
                            const sessionList = Object.values(sessions).sort((a, b) => {
                                const timeA = a.exit ? a.exit.timestamp : (a.entry ? a.entry.timestamp : 0);
                                const timeB = b.exit ? b.exit.timestamp : (b.entry ? b.entry.timestamp : 0);
                                return timeB - timeA;
                            });

                            if (sessionList.length === 0) {
                                return (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <svg className="w-12 h-12 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                <p>{error ? "Waiting for connection..." : "No parking sessions yet."}</p>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }

                            return sessionList.map((session) => {
                                const tx = session.entry || session.exit; // Use available record for common data
                                if (!tx) return null;

                                const isExit = !!session.exit;
                                const rowClass = session.isValid
                                    ? "hover:bg-white/5 transition-colors group"
                                    : "bg-red-500/10 hover:bg-red-500/20 border-l-2 border-red-500";

                                return (
                                    <tr key={tx.ticket_id} className={rowClass}>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-400">
                                            <div>
                                                <span className="text-slate-500 mr-2">IN:</span>
                                                {session.entry ? new Date(session.entry.timestamp * 1000).toLocaleTimeString() : 'N/A'}
                                            </div>
                                            {isExit && (
                                                <div className="mt-1 text-accent-400">
                                                    <span className="text-slate-500 mr-1">OUT:</span>
                                                    {new Date(session.exit.timestamp * 1000).toLocaleTimeString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white group-hover:text-accent-400 transition-colors">
                                            <div className="flex items-center gap-2">
                                                {tx.plate_number}
                                                {session.entry?.entry_method === 'FASTAG' && (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-accent-500/20 text-accent-400 border border-accent-500/30">
                                                        FASTag
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-slate-500 font-mono tracking-wider">{tx.ticket_id}</span>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(tx.ticket_id)}
                                                    className="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-white transition-colors"
                                                    title="Copy Ticket ID"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center justify-center h-8 px-3 rounded-lg border font-bold text-xs ${isExit
                                                    ? 'bg-slate-800 border-white/5 text-slate-500'
                                                    : session.entry?.assigned_slot === 'OVERFLOW'
                                                        ? 'bg-red-500/20 border-red-500/30 text-red-500 animate-pulse'
                                                        : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                                    }`}>
                                                    {session.entry ? session.entry.assigned_slot : '?'}
                                                </span>
                                                {isExit && (
                                                    <span className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-red-500/30 bg-red-500/20 text-red-500 text-xs font-bold">
                                                        EXITED
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 font-mono text-[10px] leading-tight opacity-70">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-500 w-8">ENT:</span>
                                                    <span className="text-slate-400 truncate w-24" title={session.entry?.ticket_id || ''}>
                                                        {session.entry?.ticket_id ? session.entry.ticket_id.substring(0, 12) + '...' : '-'}
                                                    </span>
                                                </div>
                                                {isExit && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-500 w-8">EXT:</span>
                                                        <span className="text-blue-400 truncate w-24" title={session.exit?.ticket_id || ''}>
                                                            {session.exit?.ticket_id ? session.exit.ticket_id.substring(0, 12) + '...' : '-'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {session.isValid ? (
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                        VERIFIED
                                                    </span>
                                                    {isExit && session.exit.fee && (
                                                        <span className="text-xs font-mono text-slate-400">{session.exit.fee}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                                                    TAMPERED
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            });
                        })()
                        }
                    </tbody>
                </table>
            </div>

            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Export Ledger</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">End Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={!startDate || !endDate}
                                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Download CSV
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
}
