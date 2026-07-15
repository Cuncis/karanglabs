import { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import HelpModal from '@/Components/HelpModal';
import AboutModal from '@/Components/AboutModal';

export default function JobSeeker() {
    const { auth } = usePage().props;
    const user = auth.user;

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [background, setBackground] = useState(user?.job_background || '');
    
    const [jobContext, setJobContext] = useState('');

    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [saveProfileMessage, setSaveProfileMessage] = useState('');

    const [result, setResult] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('jobseeker_latest_result');
                return saved ? JSON.parse(saved) : null;
            } catch (e) { return null; }
        }
        return null;
    });
    
    const [history, setHistory] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('jobseeker_history');
                return saved ? JSON.parse(saved) : [];
            } catch (e) { return []; }
        }
        return [];
    });

    const [activeTab, setActiveTab] = useState('resume');
    const [isCopied, setIsCopied] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

    useEffect(() => {
        if (result) {
            localStorage.setItem('jobseeker_latest_result', JSON.stringify(result));
        } else {
            localStorage.removeItem('jobseeker_latest_result');
        }
    }, [result]);

    useEffect(() => {
        localStorage.setItem('jobseeker_history', JSON.stringify(history));
    }, [history]);

    const tabs = [
        { id: 'resume', label: 'Resume Content' },
        { id: 'message', label: 'HR Message' },
    ];

    const handleSaveProfile = async () => {
        if (!name.trim() || !email.trim() || !background.trim()) return;
        
        setIsSavingProfile(true);
        setSaveProfileMessage('');
        
        try {
            await axios.post('/api/save-job-profile', {
                name, email, background
            });
            setSaveProfileMessage('Profile saved successfully!');
            setTimeout(() => setSaveProfileMessage(''), 3000);
        } catch (err) {
            setSaveProfileMessage(err.response?.data?.error || 'Failed to save profile.');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!background.trim() || !name.trim() || !email.trim()) return;

        setIsGenerating(true);
        setError(null);
        
        try {
            const response = await axios.post('/api/generate-job-seeker', {
                name: name,
                email: email,
                background: background,
                job_context: jobContext
            });
            
            const newResult = {
                ...response.data,
                id: Date.now(),
                timestamp: new Date().toISOString(),
                original_prompt: background.length > 50 ? background.substring(0, 50) + '...' : background
            };

            setResult(newResult);
            setHistory(prev => {
                const updatedHistory = [newResult, ...prev].slice(0, 10);
                return updatedHistory;
            });
            setActiveTab('resume');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong while generating.');
        } finally {
            setIsGenerating(false);
        }
    };

    const loadFromHistory = (item) => {
        setResult(item);
        setActiveTab('resume');
    };

    const clearHistory = () => {
        setHistory([]);
        setResult(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString([], { 
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        });
    };

    const handleCopy = () => {
        if (!result || !result[activeTab]) return;
        navigator.clipboard.writeText(result[activeTab]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#0B0A0F] text-white selection:bg-[#6366F1]/30">
            <Head title="Job Finder Pro" />

            <main className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-gray-800 pb-4">
                        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg border border-gray-800 w-fit">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Collection
                        </Link>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <button 
                                onClick={() => setShowAbout(true)}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors shadow-sm text-xs sm:text-sm font-semibold whitespace-nowrap"
                                title="What is this?"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                What is this?
                            </button>
                            <button 
                                onClick={() => setShowHelp(true)}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 flex items-center gap-2 transition-colors shadow-sm text-xs sm:text-sm font-semibold whitespace-nowrap"
                                title="How to use this tool"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                How to use
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366F1] to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            Job Finder <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-blue-400">Pro</span>
                        </h1>
                    </div>
                    <p className="text-lg text-gray-400 max-w-2xl">
                        Turn your messy background details into a perfect, human-sounding resume and a compelling email for HR to help you land your dream job.
                    </p>
                </div>

                <HelpModal show={showHelp} onClose={() => setShowHelp(false)} title="Job Finder Pro" />
                <AboutModal 
                    show={showAbout} 
                    onClose={() => setShowAbout(false)} 
                    title="Job Finder Pro" 
                    description="Paste your background, skills, and work experience. This tool will write a powerful resume summary, bullet points, and a highly personalized, human-sounding email to send to HR." 
                    category="Career & Professional" 
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-5 space-y-6">
                        <form onSubmit={handleGenerate} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
                            
                            {/* Static Profile Section */}
                            <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-4">
                                <h3 className="font-semibold text-gray-300">Your Profile</h3>
                                <p className="text-xs text-gray-500 mb-2">These fields save automatically to your account so they are filled next time you visit.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Name <span className="text-indigo-400">*</span></label>
                                        <input 
                                            type="text" 
                                            required
                                            value={name} 
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Email <span className="text-indigo-400">*</span></label>
                                        <input 
                                            type="email" 
                                            required
                                            value={email} 
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Background & Experience <span className="text-indigo-400">*</span>
                                    </label>
                                    <textarea
                                        required
                                        value={background}
                                        onChange={(e) => setBackground(e.target.value)}
                                        placeholder="e.g. I worked at TechCorp for 3 years as a frontend dev using React. Increased page speed by 40%..."
                                        className="w-full h-32 bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all resize-none"
                                    />
                                </div>
                                
                                <div className="flex items-center justify-end">
                                    <button
                                        type="button"
                                        onClick={handleSaveProfile}
                                        disabled={isSavingProfile || !name.trim() || !email.trim() || !background.trim()}
                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors border border-gray-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isSavingProfile ? (
                                            <>
                                                <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Save Profile
                                            </>
                                        )}
                                    </button>
                                </div>
                                {saveProfileMessage && (
                                    <p className={`text-xs text-right mt-1 ${saveProfileMessage.includes('error') || saveProfileMessage.includes('use') ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {saveProfileMessage}
                                    </p>
                                )}
                            </div>

                            {/* Dynamic Target Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    <h3 className="font-semibold text-white">Target Job Context</h3>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Paste details from the job posting (Optional)</label>
                                    <textarea
                                        value={jobContext}
                                        onChange={(e) => setJobContext(e.target.value)}
                                        placeholder="Company About: We're a B2B SaaS company...&#10;Role Overview: We're looking for a Senior Frontend Developer...&#10;Key Responsibilities: Build React components...&#10;Requirements: 3+ years React, strong TypeScript..."
                                        className="w-full h-40 bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all resize-none leading-relaxed"
                                    />
                                    <p className="mt-1.5 text-xs text-gray-500">
                                        Fill only what you have. This ensures answers perfectly match the role.
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={!background.trim() || !name.trim() || !email.trim() || isGenerating}
                                className="w-full py-3.5 bg-gradient-to-r from-[#6366F1] to-indigo-600 hover:from-[#6366F1]/90 hover:to-indigo-600/90 text-white rounded-xl font-bold shadow-lg shadow-[#6366F1]/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                        Crafting your profile...
                                    </>
                                ) : (
                                    'Generate Resume & Message'
                                )}
                            </button>
                        </form>

                        {history.length > 0 && !isGenerating && (
                            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-white">History</h3>
                                    <button 
                                        onClick={clearHistory}
                                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors py-1 px-2 rounded hover:bg-indigo-400/10"
                                    >
                                        Clear
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                                    {history.map(item => (
                                        <button 
                                            key={item.id}
                                            onClick={() => loadFromHistory(item)}
                                            className="w-full text-left p-4 rounded-lg bg-gray-950 border border-gray-800 hover:border-[#6366F1]/50 hover:bg-gray-900 transition-all flex justify-between items-center group"
                                        >
                                            <div className="truncate pr-4 flex-1">
                                                <p className="text-sm font-medium text-gray-200 truncate">{item.original_prompt}</p>
                                                <p className="text-xs text-gray-500 mt-1">{formatDate(item.timestamp)}</p>
                                            </div>
                                            <div className="text-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 duration-300">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Results */}
                    <div className="lg:col-span-7">
                        {result ? (
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl h-full flex flex-col animate-fade-in">
                                
                                {/* Tabs */}
                                <div className="flex overflow-x-auto border-b border-gray-800 bg-gray-950 custom-scrollbar">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                                                activeTab === tab.id
                                                    ? 'border-[#6366F1] text-[#6366F1] bg-[#6366F1]/5'
                                                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-900'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Content */}
                                <div className="p-6 md:p-8 flex-1 flex flex-col relative group">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-semibold text-white text-lg flex items-center gap-2 capitalize">
                                            {tabs.find(t => t.id === activeTab)?.label}
                                        </h3>
                                        <button 
                                            onClick={handleCopy}
                                            className={`text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium border ${
                                                isCopied 
                                                ? 'bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/30'
                                                : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
                                            }`}
                                        >
                                            {isCopied ? 'Copied to Clipboard!' : 'Copy Text'}
                                        </button>
                                    </div>
                                    
                                    <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 flex-1 overflow-y-auto">
                                        <p className="text-gray-200 text-base md:text-lg leading-relaxed whitespace-pre-wrap font-sans">
                                            {result[activeTab]}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[400px] bg-gray-900/30 border border-gray-800 border-dashed rounded-2xl flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                                <div className="w-16 h-16 mb-6 rounded-2xl bg-gray-800/50 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-xl text-gray-300 mb-2">Awaiting Background Info</h3>
                                <p className="text-gray-500 max-w-sm leading-relaxed">
                                    Drop your work history on the left. I'll translate it into a killer resume and HR message.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
