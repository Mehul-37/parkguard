import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

export default function AdminDashboard({ selectedSite }) {
    const [stats, setStats] = useState({
        total_revenue: 0,
        occupancy_rate: 0,
        active_cars: 0,
        alerts_count: 0,
        recent_alerts: []
    });
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [demoMode, setDemoMode] = useState(false); // Default to FALSE for Real view

    const fetchData = async () => {
        if (!selectedSite) return;
        try {
            const [statsRes, slotsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/admin-dashboard?site_id=${selectedSite.id}`),
                fetch(`${API_BASE_URL}/slots?site_id=${selectedSite.id}`)
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (slotsRes.ok) setSlots(await slotsRes.json());

            setLoading(false);
        } catch (err) {
            console.error("Dashboard sync failed:", err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 2000); // Live updates
        return () => clearInterval(interval);
    }, [selectedSite]); // Re-run when site changes

    // Helper for Map Rendering
    const getSlotColor = (slot) => {
        // ERROR STATE: Mismatch
        if ((slot.occupied && slot.sensor_status === 'EMPTY') || (!slot.occupied && slot.sensor_status === 'OCCUPIED')) {
            return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse border-red-400';
        }

        // VERIFIED OCCUPIED
        if (slot.occupied && slot.sensor_status === 'OCCUPIED') {
            return 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)] border-blue-500';
        }

        // VERIFIED FREE
        return 'bg-emerald-900/40 border-emerald-500/30 text-emerald-400';
    };

    // Calculate Active Alerts from Live Data
    const activeAnomalies = slots.filter(s =>
        (s.occupied && s.sensor_status === 'EMPTY') ||
        (!s.occupied && s.sensor_status === 'OCCUPIED')
    ).length;

    // Generate Mock Slots for Realistic Layout
    const getDisplaySlots = () => {
        if (!demoMode && slots.length > 0) return slots;

        // If no slots from backend (and demoMode is allow or forced fallback), show generic grid?
        // Let's just return slots. If empty, it's empty.
        // Or if the user hasn't mapped the site yet, maybe show a "No map configured" message.
        return slots;
    };

    const displaySlots = getDisplaySlots();
    // Split into columns for display logic (assuming 2 columns layout is desired)
    // If slots have coordinates, we should use them instead of arbitrary columns?
    // The previous implementation hardcoded columns.
    // Let's try to trust the standard layout if available, OR render them based on their X/Y if possible?
    // The previous implementation used `col1` and `col2` lists.
    // For now, let's keep the column logic simple: split in half.
    const mid = Math.ceil(displaySlots.length / 2);
    const col1 = displaySlots.slice(0, mid);
    const col2 = displaySlots.slice(mid);

    const handleVerifyChain = async () => {
        const btn = document.getElementById('verify-btn');
        if (btn) btn.innerText = "Verifying...";

        try {
            const res = await fetch(`${API_BASE_URL}/verify-chain`);
            const data = await res.json();
            alert(`BLOCKCHAIN AUDIT RESULT:\n\nStatus: ${data.status}\nMessage: ${data.message}`);
        } catch (e) {
            alert("Verification Error: Could not connect to auditor node.");
        } finally {
            if (btn) btn.innerHTML = `
                <svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Verify Chain Integrity
            `;
        }
    };

    if (!selectedSite) return <div>Please select a site.</div>;

    return (
        <div className="h-full flex flex-col gap-6 animate-fade-in pb-8">
            <div className="flex justify-end">
                <button
                    id="verify-btn"
                    onClick={handleVerifyChain}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg active:scale-95"
                >
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Verify Chain Integrity
                </button>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg className="w-32 h-32 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Revenue</p>
                        <h3 className="text-4xl font-bold text-white mt-2 font-mono tracking-tight">{stats.total_revenue || 0}</h3>
                        <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Live Updates
                        </p>
                    </div>
                </div>

                <div className="glass-card p-6 flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg className="w-32 h-32 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Occupancy Rate</p>
                        <h3 className="text-4xl font-bold text-white mt-2 font-mono tracking-tight">{(stats.occupancy_rate || 0).toFixed(1)}%</h3>
                        <div className="w-full bg-slate-700/50 h-1.5 mt-3 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${(stats.occupancy_rate || 0).toFixed(1)}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-blue-400 mt-2 font-mono">{stats.occupancy || '0/0 slots'}</p>
                    </div>
                </div>

                <div className={`glass-card p-6 flex items-center justify-between relative overflow-hidden group transition-all duration-300 ${activeAnomalies > 0 ? 'bg-red-500/10 border-red-500/50' : ''}`}>
                    <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg className={`w-32 h-32 ${activeAnomalies > 0 ? 'text-red-400' : 'text-emerald-400'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                        <p className={`text-xs font-bold uppercase tracking-widest ${activeAnomalies > 0 ? 'text-red-400' : 'text-slate-400'}`}>Active Alerts</p>
                        <h3 className={`text-4xl font-bold mt-2 font-mono tracking-tight ${activeAnomalies > 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                            {activeAnomalies}
                        </h3>
                        <p className="text-xs text-slate-500 mt-2">{activeAnomalies > 0 ? 'Immediate Attention Required' : 'All Zones Secure'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
                {/* Live Map */}
                <div className="lg:col-span-2 glass-card p-0 flex flex-col overflow-hidden relative min-h-[500px]">
                    <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-slate-900/80 to-transparent flex justify-between items-center pointer-events-none">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide drop-shadow-md">
                            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                            Live Lot Map ({selectedSite.name})
                        </h3>
                        <div className="flex gap-4 text-[10px] uppercase font-bold text-white drop-shadow-md bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Free</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Occupied</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Alert</span>
                        </div>
                    </div>

                    {/* Map Container */}
                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center overflow-hidden p-4">
                        {/* Wrapper to constrain overlay to image dimensions perfectly */}
                        <div className="relative inline-block h-full max-w-full shadow-2xl">
                            {/* Background Image */}
                            <img
                                src={selectedSite.image_url || "/parking-layout.png"}
                                alt="Site Layout"
                                className="max-h-full max-w-full w-auto h-auto rounded opacity-50 block mx-auto"
                            />

                            {/* Slots Overlay */}
                            <div className="absolute inset-0 w-full h-full">
                                {displaySlots.map((slot) => {
                                    // Default sizes if not set (fallback to roughly grid size if missing)
                                    const width = slot.width || '80px';
                                    const height = slot.height || '45px';
                                    const isVertical = parseFloat(height) > parseFloat(width); // Simple heuristic or explicit rotation prop

                                    return (
                                        <div
                                            key={slot.id}
                                            className={`absolute border-2 transition-all duration-500 shadow-xl rounded flex items-center justify-center
                                            ${getSlotColor(slot)}
                                            ${slot.occupied ? 'z-10' : 'z-0'}
                                        `}
                                            style={{
                                                left: slot.x || '50%',
                                                top: slot.y || '50%',
                                                width: slot.width || '5%',
                                                height: slot.height || '8%',
                                                transform: 'translate(-50%, -50%)',
                                            }}
                                            title={`Slot ${slot.id}`}
                                        >
                                            <div className="absolute -top-4 text-[10px] font-bold text-white bg-black/50 px-1 rounded backdrop-blur-sm border border-white/10">
                                                {slot.id}
                                            </div>

                                            {/* Car Visual */}
                                            {slot.occupied && (
                                                <div className="w-[80%] h-[60%] bg-white rounded shadow-sm relative">
                                                    <div className="absolute inset-x-1 top-1 h-[30%] bg-slate-800/20 rounded-sm"></div>
                                                </div>
                                            )}

                                            {!slot.occupied && (
                                                <span className="text-[10px] font-bold opacity-30 text-white">P</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alert Feed */}
                <div className="glass-card p-0 flex flex-col overflow-hidden h-full">
                    <div className="p-4 border-b border-white/5 bg-slate-800/50">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            Security Feed
                        </h3>
                    </div>
                    <div className="flex-1 overflow-auto p-4 custom-scrollbar space-y-2 bg-slate-900/40">
                        {stats.recent_alerts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                <svg className="w-12 h-12 opacity-20 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-xs">No historical anomalies.</p>
                            </div>
                        ) : (
                            stats.recent_alerts.map((alert, i) => (
                                <div key={i} className="p-3 rounded bg-slate-800/80 border-l-2 border-red-500 text-sm animate-slide-in-right">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-red-400 text-[10px] uppercase">{alert.type}</span>
                                        <span className="text-slate-600 text-[10px] font-mono">{new Date(alert.timestamp * 1000).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-slate-300 text-xs leading-relaxed">{alert.message}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Alerts List */}
            <div className="glass-card p-6 flex flex-col flex-1 min-h-[200px]">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-red-500 rounded-full"></span>
                    Recent Security Alerts
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="text-xs uppercase bg-slate-900/50 text-slate-500 font-semibold">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Time</th>
                                <th className="px-4 py-3">Message</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Severity</th>
                                <th className="px-4 py-3 rounded-r-lg text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {(stats.recent_alerts || []).slice(0, 5).map((alert, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs">{new Date((alert.timestamp || Date.now() / 1000) * 1000).toLocaleTimeString()}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-blue-400 truncate max-w-[100px]" title={alert.message}>{(alert.message || '').substring(0, 30)}...</td>
                                    <td className="px-4 py-3 text-slate-200">{alert.type || 'ALERT'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${alert.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {alert.severity || 'MEDIUM'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-emerald-400">-</td>
                                </tr>
                            ))}
                            {(!stats.recent_alerts || stats.recent_alerts.length === 0) && (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-slate-500 text-sm">
                                        No recent alerts
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
