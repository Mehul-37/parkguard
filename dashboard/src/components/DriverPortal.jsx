import React, { useState } from 'react';
import API_BASE_URL from '../config';

export default function DriverPortal({ selectedSite }) {
    const [plate, setPlate] = useState('DL-10-AB-1234');
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setTicket(null);

        // Optional: Ensure a site is selected
        if (!selectedSite) {
            setError("Please select a valid site from the navigation bar.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/vehicle-entry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plate_number: plate,
                    entry_gate_id: 'Gate_A',
                    site_id: selectedSite.id
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || 'Entry failed');
            }
            const data = await res.json();
            setTicket(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                <span className="w-2 h-8 bg-accent-500 rounded-full inline-block"></span>
                Driver Entry {selectedSite && <span className="text-sm font-normal text-slate-400">@ {selectedSite.name}</span>}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-semibold text-accent-400 uppercase tracking-wider mb-2">License Plate Number</label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={plate}
                            onChange={(e) => setPlate(e.target.value.toUpperCase())}
                            className="input-field pl-12 font-mono text-lg tracking-wider group-hover:bg-slate-900/70 transition-colors"
                            placeholder="DL-XX-XX-XXXX"
                        />
                        <div className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-accent-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center justify-center gap-2 group"
                >
                    {loading ? (
                        <>
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Processing...
                        </>
                    ) : (
                        <>
                            Generate Secure Ticket
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </>
                    )}
                </button>
            </form>

            {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm flex items-center gap-3 animate-fade-in">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {error}
                </div>
            )}

            {ticket && (
                <div className="mt-8 relative group cursor-default">
                    <div className="absolute -inset-1 bg-gradient-to-r from-accent-500 to-blue-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition-all duration-500"></div>
                    <div className="relative bg-slate-900 border border-white/10 rounded-xl p-6 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl border-l border-b border-emerald-500/20">
                            Paid & Verified
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-slate-800 rounded-lg border border-white/5">
                                <svg className="w-8 h-8 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Entry Approved</h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-xl font-mono text-white tracking-widest bg-black/20 px-3 py-1 rounded-lg border border-white/5">
                                        {ticket.ticket_id}
                                    </p>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(ticket.ticket_id)}
                                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                        title="Copy Ticket ID"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Assigned Slot</p>
                                <p className="text-2xl font-bold text-accent-400">{ticket.assigned_slot || 'N/A'}</p>
                            </div>
                            <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Gate Entry ({selectedSite?.name})</p>
                                <p className="text-lg font-bold text-white">Gate A</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Blockchain Receipt (Hash)</p>
                            <div className="p-2.5 bg-black/30 rounded-lg border border-white/5 font-mono text-[10px] text-slate-400 break-all leading-relaxed hover:text-white transition-colors select-all">
                                {ticket.blockchain_hash}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
