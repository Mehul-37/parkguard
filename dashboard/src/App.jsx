import React, { useState, useEffect } from 'react';
import DriverPortal from './components/DriverPortal';
import AuditorView from './components/AuditorView';
import ExitPortal from './components/ExitPortal';
import SensorSimulator from './components/SensorSimulator';
import AdminDashboard from './components/AdminDashboard';
import MapEditor from './components/MapEditor';

function App() {
    const [activeTab, setActiveTab] = useState('admin');
    const [selectedSite, setSelectedSite] = useState(null);
    const [sites, setSites] = useState([]);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState("");

    const refreshSites = () => {
        fetch('http://localhost:8000/sites')
            .then(res => res.json())
            .then(data => {
                setSites(data);
                // Keep the current selection if possible
                if (selectedSite) {
                    const stillExists = data.find(s => s.id === selectedSite.id);
                    if (stillExists) setSelectedSite(stillExists);
                    else if (data.length > 0) setSelectedSite(data[0]);
                } else if (data.length > 0) {
                    setSelectedSite(data[0]);
                }
            })
            .catch(err => console.error("Failed to fetch sites:", err));
    };

    useEffect(() => {
        refreshSites();
    }, []);

    const handleSaveName = async () => {
        if (!selectedSite || !editNameValue.trim()) {
            setIsEditingName(false);
            return;
        }

        try {
            const res = await fetch(`http://localhost:8000/sites/${selectedSite.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editNameValue })
            });
            if (res.ok) {
                refreshSites();
            }
        } catch (err) {
            console.error(err);
        }
        setIsEditingName(false);
    };

    const startEditing = () => {
        setEditNameValue(selectedSite.name);
        setIsEditingName(true);
    };

    const DataProps = { selectedSite };

    return (
        <div className="min-h-screen text-slate-200 selection:bg-accent-500/30 font-sans">
            <div className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>

            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-brand-900/70 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-accent-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition-opacity"></div>
                                <div className="relative bg-gradient-to-tr from-brand-800 to-brand-700 w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 shadow-xl">
                                    <span className="text-accent-400 font-bold text-2xl font-mono">P</span>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
                                    ParkGuard
                                </h1>
                                <p className="text-xs text-accent-400 font-medium tracking-wider uppercase opacity-80">Secure Parking System</p>
                            </div>
                        </div>

                        {/* Site Selector & Editor */}
                        {sites.length > 0 && (
                            <div className="hidden md:flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-lg border border-white/5">
                                <span className="text-xs text-slate-400 font-bold px-2 uppercase tracking-wider">Location:</span>

                                {isEditingName ? (
                                    <div className="flex items-center gap-1">
                                        <input
                                            autoFocus
                                            className="bg-slate-900 border border-slate-600 text-white text-sm rounded px-2 py-1 outline-none focus:border-accent-500 w-32"
                                            value={editNameValue}
                                            onChange={e => setEditNameValue(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                                        />
                                        <button onClick={handleSaveName} className="text-emerald-400 hover:text-emerald-300 p-1">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        </button>
                                        <button onClick={() => setIsEditingName(false)} className="text-red-400 hover:text-red-300 p-1">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <select
                                            className="bg-slate-900 border border-slate-700 text-white text-sm rounded-l-md focus:ring-accent-500 focus:border-accent-500 block p-1.5"
                                            value={selectedSite?.id || ''}
                                            onChange={(e) => setSelectedSite(sites.find(s => s.id === e.target.value))}
                                        >
                                            {sites.map(site => (
                                                <option key={site.id} value={site.id}>
                                                    {site.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={startEditing}
                                            className="bg-slate-700 hover:bg-slate-600 border border-l-0 border-slate-700 text-slate-300 rounded-r-md p-1.5 transition-colors"
                                            title="Rename Site"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex p-1 bg-brand-900/50 backdrop-blur-sm rounded-xl border border-white/5 shadow-inner">
                            <button
                                onClick={() => setActiveTab('admin')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'admin'
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 scale-100'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Admin
                            </button>
                            <button
                                onClick={() => setActiveTab('driver')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'driver'
                                    ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/25 scale-100'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Driver
                            </button>
                            <button
                                onClick={() => setActiveTab('auditor')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'auditor'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-100'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Auditor
                            </button>
                            <button
                                onClick={() => setActiveTab('sensor-sim')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'sensor-sim'
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 scale-100'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Sensor
                            </button>
                            <button
                                onClick={() => setActiveTab('map-editor')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'map-editor'
                                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25 scale-100'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Map <span className="bg-white/20 px-1.5 rounded text-[10px] ml-1">NEW</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('exit')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'exit'
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/25 scale-100'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Exit
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 animate-fade-in">
                {!selectedSite ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-xl text-slate-500 animate-pulse">Loading Sites...</div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'driver' && (
                            <div className="max-w-2xl mx-auto">
                                <DriverPortal {...DataProps} />
                            </div>
                        )}
                        {activeTab === 'auditor' && (
                            <div className="h-[calc(100vh-12rem)]">
                                <AuditorView {...DataProps} />
                            </div>
                        )}
                        {activeTab === 'sensor-sim' && (
                            <div className="max-w-4xl mx-auto">
                                <SensorSimulator {...DataProps} />
                            </div>
                        )}
                        {activeTab === 'map-editor' && (
                            <div className="h-[calc(100vh-12rem)]">
                                <MapEditor {...DataProps} />
                            </div>
                        )}
                        {activeTab === 'exit' && (
                            <div className="max-w-2xl mx-auto">
                                <ExitPortal {...DataProps} />
                            </div>
                        )}
                        {activeTab === 'admin' && (
                            <div className="h-[calc(100vh-12rem)]">
                                <AdminDashboard {...DataProps} />
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default App;
