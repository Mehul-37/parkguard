import React, { useState, useEffect } from 'react';

const SensorSimulator = ({ selectedSite }) => {
    const [slots, setSlots] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSlots = async () => {
        if (!selectedSite) return;
        try {
            const response = await fetch(`http://127.0.0.1:8000/slots?site_id=${selectedSite.id}`);
            const data = await response.json();
            setSlots(data);
        } catch (error) {
            console.error('Failed to fetch slots:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots();
        const interval = setInterval(fetchSlots, 2000); // Polling for updates
        return () => clearInterval(interval);
    }, [selectedSite]);

    const toggleSensor = async (slotId, currentStatus) => {
        if (!selectedSite) return;
        const newStatus = currentStatus === 'OCCUPIED' ? 'EMPTY' : 'OCCUPIED';

        try {
            const response = await fetch('http://127.0.0.1:8000/simulate-sensor', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slot_id: slotId,
                    sensor_status: newStatus,
                    site_id: selectedSite.id
                }),
            });
            const result = await response.json();

            // Optimistic update locally or wait for poll
            fetchSlots();

            if (result.alert) {
                // Add temporary alert to UI if needed
                setAlerts((prev) => [result.alert, ...prev].slice(0, 5));
            }
        } catch (error) {
            console.error('Failed to toggle sensor:', error);
        }
    };

    // Derived alerts from current slot state for persistent display
    const activeAlerts = slots.map(slot => {
        if (!slot.occupied && slot.sensor_status === 'OCCUPIED') {
            return { id: slot.id, type: 'UNAUTHORIZED_PARKING', message: `Unauthorized vehicle in ${slot.id}`, severity: 'high' };
        }
        if (slot.occupied && slot.sensor_status === 'EMPTY') {
            return { id: slot.id, type: 'GHOST_BOOKING', message: `Vehicle missing from paid slot ${slot.id}`, severity: 'medium' };
        }
        return null;
    }).filter(Boolean);

    if (!selectedSite) return <div>Please select a site.</div>;

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Sensor Simulation Grid</h2>
                    <p className="text-slate-400">Manually toggle hardware sensors to test security protocols @ {selectedSite.name}</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-sm text-slate-400">System Occupied</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-slate-400">Sensor Detected</span>
                    </div>
                </div>
            </header>

            {/* Active Alerts Banner */}
            {activeAlerts.length > 0 && (
                <div className="mb-6 space-y-2">
                    {activeAlerts.map((alert, idx) => (
                        <div key={`${alert.id}-${idx}`} className={`p-4 rounded-xl border flex items-center gap-4 ${alert.severity === 'high'
                            ? 'bg-red-500/10 border-red-500/50 text-red-200'
                            : 'bg-amber-500/10 border-amber-500/50 text-amber-200'
                            }`}>
                            <div className="p-2 bg-white/10 rounded-lg">
                                <span className="text-xl">⚠️</span>
                            </div>
                            <div>
                                <h3 className="font-bold">{alert.type.replace('_', ' ')}</h3>
                                <p className="text-sm opacity-90">{alert.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Grid Map */}
            {slots.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    No slots configured for this site.
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
                    {slots.map((slot) => {
                        const isSystemOccupied = slot.occupied;
                        const isSensorOccupied = slot.sensor_status === 'OCCUPIED';
                        const hasMismatch = (isSystemOccupied && !isSensorOccupied) || (!isSystemOccupied && isSensorOccupied);

                        return (
                            <div
                                key={slot.id}
                                className={`relative group p-6 rounded-2xl border-2 transition-all duration-300 ${hasMismatch
                                    ? 'bg-red-500/5 border-red-500/50 shadow-lg shadow-red-500/10'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-4xl font-black text-white/10">{slot.id}</h3>
                                    <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${isSystemOccupied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                                        }`}>
                                        {isSystemOccupied ? 'Ticket Active' : 'Slot Free'}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-400">Hardware Sensor</span>
                                        <button
                                            onClick={() => toggleSensor(slot.id, slot.sensor_status)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500/50 ${isSensorOccupied ? 'bg-blue-600' : 'bg-slate-700'
                                                }`}
                                        >
                                            <span
                                                className={`${isSensorOccupied ? 'translate-x-6' : 'translate-x-1'
                                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                            />
                                        </button>
                                    </div>

                                    <div className={`text-xs text-center py-2 rounded-lg font-mono ${isSensorOccupied ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-500'
                                        }`}>
                                        {isSensorOccupied ? 'METAL DETECTED' : 'NO SIGNAL'}
                                    </div>
                                </div>

                                {/* Mismatch Warning Indicator */}
                                {hasMismatch && (
                                    <div className="absolute -top-3 -right-3">
                                        <span className="relative flex h-6 w-6">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 items-center justify-center text-xs font-bold text-white">!</span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SensorSimulator;
