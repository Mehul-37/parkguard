import React, { useState } from 'react';
import API_BASE_URL from '../config';

const MOCK_TAGS = ["TAG-1001", "TAG-1002", "TAG-1003", "TAG-1004"];

export default function DriverPortal({ selectedSite }) {
    const [entryMethod, setEntryMethod] = useState('FASTAG'); // FASTAG | PLATE
    const [plate, setPlate] = useState('DL-10-AB-1234');
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);
        setTicket(null);

        if (!selectedSite) {
            setError("Please select a valid site from the navigation bar.");
            setLoading(false);
            return;
        }

        let payload = {
            entry_gate_id: 'Gate_A',
            site_id: selectedSite.id
        };

        if (entryMethod === 'FASTAG') {
            setScanning(true);
            // Simulate scanning delay
            await new Promise(r => setTimeout(r, 1500));
            setScanning(false);

            const randomTag = MOCK_TAGS[Math.floor(Math.random() * MOCK_TAGS.length)];
            payload.fastag_id = randomTag;
        } else {
            payload.plate_number = plate;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/vehicle-entry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
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
                Driver Entry <span className="text-sm font-normal text-slate-400">@ {selectedSite?.name}</span>
            </h2>

            {/* Entry Method Toggle */}
            <div className="flex bg-slate-800/50 p-1 rounded-lg mb-8 w-fit border border-white/5">
                <button
                    onClick={() => setEntryMethod('FASTAG')}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${entryMethod === 'FASTAG' ? 'bg-accent-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    FASTag Scan
                </button>
                <button
                    onClick={() => setEntryMethod('PLATE')}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${entryMethod === 'PLATE' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    Manual Plate
                </button>
            </div>

            {!ticket ? (
                <div className="space-y-6">
                    {entryMethod === 'FASTAG' ? (
                        <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-white/10 rounded-2xl bg-slate-900/30">
                            {loading && scanning ? (
                                <div className="flex flex-col items-center">
                                    <div className="relative w-24 h-24 mb-4">
                                        <div className="absolute inset-0 border-4 border-accent-500/30 rounded-full animate-ping"></div>
                                        <div className="absolute inset-0 border-4 border-accent-500 rounded-full animate-spin border-t-transparent"></div>
                                        <svg className="absolute inset-0 w-10 h-10 m-auto text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                                    </div>
                                    <p className="text-accent-400 font-mono animate-pulse">Scanning RFID Tag...</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-accent-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent-500/20">
                                        <svg className="w-10 h-10 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.131A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.858.609-4.184 0 0 .587 1.409 1.493 2 1.411-1.319 2.062 1.411 2.062 3.636 0 2.8-.755 5.5-2 7.364" /></svg>
                                    </div>
                                    <p className="text-slate-400 mb-6">Drive near the reader to scan FASTag</p>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="btn-primary w-full max-w-xs"
                                    >
                                        Simulate Scan
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">License Plate Number</label>
                                <input
                                    type="text"
                                    value={plate}
                                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                                    className="input-field font-mono text-lg tracking-wider"
                                    placeholder="DL-XX-XX-XXXX"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                                {loading ? 'Processing...' : 'Verify & Enter'}
                            </button>
                        </form>
                    )}
                </div>
            ) : (
                <div className="mt-8 relative group cursor-default animate-fade-in-up">
                    <div className="absolute -inset-1 bg-gradient-to-r from-accent-500 to-blue-500 rounded-xl blur opacity-25"></div>
                    <div className="relative bg-slate-900 border border-white/10 rounded-xl p-6 shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Access Granted</h3>
                                    <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                        Live Active Session
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Entry Method</div>
                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-bold ${ticket.entry_method === 'FASTAG' ? 'bg-accent-500/20 border-accent-500/30 text-accent-400' : 'bg-slate-700/50 border-white/10 text-slate-300'}`}>
                                    {ticket.entry_method === 'FASTAG' ? (
                                        <>
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            FASTag
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                            PLATE
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Vehicle Plate</p>
                                <p className="text-xl font-mono font-bold text-white">{ticket.plate_number}</p>
                            </div>
                            <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Assigned Slot</p>
                                <p className={`text-xl font-bold ${ticket.assigned_slot === 'OVERFLOW' ? 'text-red-500 animate-pulse' : 'text-accent-400'}`}>{ticket.assigned_slot}</p>
                            </div>
                        </div>

                        <div className="bg-black/20 rounded-lg p-3 border border-white/5 flex flex-col gap-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Ticket ID</span>
                                <span className="font-mono text-slate-300">{ticket.ticket_id}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Hash</span>
                                <span className="font-mono text-slate-500 truncate w-32" title={ticket.blockchain_hash}>{ticket.blockchain_hash}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => { setTicket(null); setEntryMethod('FASTAG') }} // Reset and default back to FASTag
                            className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-sm rounded transition-colors"
                        >
                            Start New Entry
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm flex items-center gap-3 animate-fade-in">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {error}
                </div>
            )}
        </div>
    );
}
