import React, { useState } from 'react';

function ExitPortal() {
    const [ticketId, setTicketId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleExit = async () => {
        if (!ticketId) {
            setError('Please enter a Ticket ID');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch('http://127.0.0.1:8000/vehicle-exit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticket_id: ticketId })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Exit failed');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Vehicle Exit & Billing</h2>
                        <p className="text-slate-400 text-sm mt-1">Enter your ticket ID to calculate fee and exit</p>
                    </div>
                    <div className="h-10 w-10 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                            Ticket ID
                        </label>
                        <input
                            type="text"
                            value={ticketId}
                            onChange={(e) => setTicketId(e.target.value)}
                            placeholder="e.g. TKT-173..."
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-mono"
                        />
                    </div>

                    <button
                        onClick={handleExit}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-medium py-3 rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Calculating...' : 'Calculate Fee & Exit'}
                    </button>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {result && (
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-white/10 shadow-2xl animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-8 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white">Payment Receipt</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-black/20 p-3 rounded-lg">
                                <span className="text-xs text-slate-500 block mb-1">Time Parked</span>
                                <span className="text-white font-mono">{result.duration_minutes} min</span>
                            </div>
                            <div className="bg-black/20 p-3 rounded-lg">
                                <span className="text-xs text-slate-500 block mb-1">Total Fee</span>
                                <span className="text-2xl font-bold text-green-400">{result.total_fee}</span>
                            </div>
                            <div className="bg-black/20 p-3 rounded-lg col-span-2">
                                <span className="text-xs text-slate-500 block mb-1">Entry Time</span>
                                <span className="text-slate-300 text-sm">{result.entry_time}</span>
                            </div>
                            <div className="bg-black/20 p-3 rounded-lg col-span-2">
                                <span className="text-xs text-slate-500 block mb-1">Exit Time</span>
                                <span className="text-slate-300 text-sm">{result.exit_time}</span>
                            </div>
                        </div>

                        <div className="border-t border-white/5 pt-4">
                            <div className="flex items-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                <div className="overflow-hidden">
                                    <p className="text-xs text-accent-400 font-medium mb-1">Blockchain Verification Hash</p>
                                    <p className="text-[10px] text-slate-500 break-all font-mono leading-relaxed bg-black/30 p-2 rounded border border-white/5">
                                        {result.blockchain_receipt}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExitPortal;
