import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import API_BASE_URL from '../config';

const AnalyticsDashboard = ({ selectedSite }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showExportModal, setShowExportModal] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleExport = () => {
        if (!startDate || !endDate) return;

        // Convert to Unix timestamps
        const startTs = Math.floor(new Date(startDate).getTime() / 1000);
        const endTs = Math.floor(new Date(endDate).setHours(23, 59, 59) / 1000); // End of day

        let url = `${API_BASE_URL}/export-transactions?start_date=${startTs}&end_date=${endTs}`;
        if (selectedSite) url += `&site_id=${selectedSite.id}`;

        window.open(url, '_blank');
        setShowExportModal(false);
    };

    const MOCK_DATA = {
        daily_revenue: "₹24,500",
        avg_occupancy: 78,
        violation_count: 8,
        revenue_trend: [
            { "time": "08:00", "amount": 1200 }, { "time": "09:00", "amount": 2100 }, { "time": "10:00", "amount": 2800 },
            { "time": "11:00", "amount": 2400 }, { "time": "12:00", "amount": 2600 }, { "time": "13:00", "amount": 3100 },
            { "time": "14:00", "amount": 2800 }, { "time": "15:00", "amount": 2200 }, { "time": "16:00", "amount": 1800 },
            { "time": "17:00", "amount": 3400 }, { "time": "18:00", "amount": 3800 }, { "time": "19:00", "amount": 3200 },
            { "time": "20:00", "amount": 1500 }
        ],
        occupancy_trend: [
            { "hour": "08:00", "occupancy": 30 }, { "hour": "10:00", "occupancy": 65 }, { "hour": "12:00", "occupancy": 85 },
            { "hour": "14:00", "occupancy": 70 }, { "hour": "16:00", "occupancy": 60 }, { "hour": "18:00", "occupancy": 92 },
            { "hour": "20:00", "occupancy": 50 }
        ],
        violation_distribution: [
            { "name": "Ghost Booking", "value": 3 }, { "name": "Unauthorized", "value": 4 }, { "name": "Overtime", "value": 1 }
        ],
        ai_recommendations: [
            {
                "type": "revenue",
                "title": "Increase Peak Pricing",
                "message": "Occupancy consistently exceeds 85% between 17:00 and 19:00. Implementing a dynamic surge fee of +₹10/hr could optimize turnover and increase revenue by ~15%."
            },
            {
                "type": "security",
                "title": "Site 1 Security Patrol",
                "message": "Recurring 'Ghost Bookings' detected at Slot X7. Recommend physical audit of sensor calibration or deployment of a specific patrol at 12:00 PM."
            }
        ]
    };

    useEffect(() => {
        const fetchData = async () => {
            // Demo Fallback: Always start with Loading, then try fetch. 
            // If fetch fails (404/Network), use MOCK_DATA.
            try {
                if (!selectedSite) {
                    setData(MOCK_DATA);
                    setLoading(false);
                    return;
                }
                const res = await fetch(`${API_BASE_URL}/analytics/overview?site_id=${selectedSite.id}`);
                if (!res.ok) throw new Error("Endpoint missing");
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.warn("Analytics backend unavailable, using demo data:", err);
                setData(MOCK_DATA);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedSite]);

    if (loading) return <div className="text-center text-slate-500 mt-20 text-xl">Analysing Data Patterns...</div>;
    if (!data) return null;

    // Distinct Colors mapping for consistency with Alerts
    const getColor = (name) => {
        if (name.includes("Ghost")) return '#F59E0B'; // Amber
        if (name.includes("Unauthorized")) return '#EF4444'; // Red
        if (name.includes("Overtime")) return '#3B82F6'; // Blue
        return '#10B981'; // Default Emerald
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Executive Reports</h2>
                    <p className="text-lg text-slate-400">Smart City Performance Metrics & Predictive Insights</p>
                </div>
                <button
                    onClick={() => setShowExportModal(true)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Export CSV
                </button>
            </header>

            {/* Top Row: KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 transform hover:scale-105 transition-all duration-300">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Daily Revenue</p>
                    <h3 className="text-4xl font-extrabold text-emerald-400 mt-2">{data.daily_revenue}</h3>
                    <p className="text-sm text-emerald-500/80 mt-2 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        12% vs yesterday
                    </p>
                </div>
                <div className="glass-card p-6 transform hover:scale-105 transition-all duration-300">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Avg Occupancy</p>
                    <h3 className="text-4xl font-extrabold text-blue-400 mt-2">{data.avg_occupancy}%</h3>
                    <p className="text-sm text-blue-500/80 mt-2 font-medium">Peak: 18:00 (92%)</p>
                </div>
                <div className="glass-card p-6 transform hover:scale-105 transition-all duration-300">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Violations</p>
                    <h3 className="text-4xl font-extrabold text-red-400 mt-2">{data.violation_count}</h3>
                    <p className="text-sm text-red-500/80 mt-2 font-medium">2 Ghost Bookings</p>
                </div>
                <div className="glass-card p-6 transform hover:scale-105 transition-all duration-300">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">User Satisfaction</p>
                    <h3 className="text-4xl font-extrabold text-amber-400 mt-2">4.8/5.0</h3>
                    <p className="text-sm text-amber-500/80 mt-2 font-medium">Based on exit surveys</p>
                </div>
            </div>

            {/* Middle Row: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[450px]">
                {/* 1. Revenue Trend (Area) */}
                <div className="glass-card p-8 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-8">Revenue Trends (24h)</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.revenue_trend}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="time" stroke="#ffffff50" fontSize={10} tickLine={false} />
                                <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff' }}
                                    itemStyle={{ color: '#10B981' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Occupancy Heatmap (Bar) */}
                <div className="glass-card p-8 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-8">Occupancy Distribution</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.occupancy_trend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="hour" stroke="#ffffff50" fontSize={10} tickLine={false} />
                                <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} tickFormatter={(val) => `${val}%`} />
                                <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff' }} />
                                <Bar dataKey="occupancy" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Pie + Audit */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[350px]">
                {/* Violation Distribution */}
                <div className="glass-card p-8 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-4">Security Events</h3>
                    <div className="flex-1 w-full min-h-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.violation_distribution || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={75}
                                    outerRadius={95}
                                    paddingAngle={6}
                                    dataKey="value"
                                    cornerRadius={6} // Modern rounded edges
                                >
                                    {(data?.violation_distribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getColor(entry.name)} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff' }} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Metric */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                            <div className="text-center">
                                <span className="text-5xl font-extrabold text-white block tracking-tighter shadow-black drop-shadow-lg">{data.violation_count}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Text Summary */}
                <div className="glass-card p-8 md:col-span-2">
                    <h3 className="text-xl font-bold text-white mb-6">AI Recommendations</h3>
                    <div className="space-y-6">
                        {(data?.ai_recommendations || []).map((reco, i) => (
                            <div key={i} className="flex items-start gap-5">
                                <div className={`p-3 rounded-xl ${reco.type === 'revenue' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                    {reco.type === 'revenue' ? (
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    ) : (
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-200">{reco.title}</h4>
                                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                                        {reco.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Export Modal */}
            {
                showExportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-4">Export Transaction Data</h3>

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
};

export default AnalyticsDashboard;
