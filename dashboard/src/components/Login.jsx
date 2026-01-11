import React, { useState } from 'react';
import logo from '../assets/logo.png';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        onLogin(username, password);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>

            <div className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <img src={logo} alt="ParkGuard" className="w-24 h-24 object-contain filter drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-slate-400">Enter your credentials to access the portal</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all"
                            placeholder="Enter username"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all"
                            placeholder="Enter password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-accent-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5">
                    <button
                        onClick={() => onLogin('demo', 'demo', true)}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2 group"
                    >
                        <span>Launch Demo Mode</span>
                        <svg className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                    <p className="text-xs text-center text-slate-500 mt-4">
                        Demo mode unlocks all features for presentation purposes
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
