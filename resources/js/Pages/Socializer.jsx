import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import HelpModal from '@/Components/HelpModal';
import AboutModal from '@/Components/AboutModal';

export default function Socializer() {
    const [content, setContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('socializer_latest_result');
                return saved ? JSON.parse(saved) : null;
            } catch (e) { return null; }
        }
        return null;
    });
    
    const [history, setHistory] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('socializer_history');
                return saved ? JSON.parse(saved) : [];
            } catch (e) { return []; }
        }
        return [];
    });

    const [activeTab, setActiveTab] = useState('instagram');
    const [isCopied, setIsCopied] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

    useEffect(() => {
        if (result) {
            localStorage.setItem('socializer_latest_result', JSON.stringify(result));
        } else {
            localStorage.removeItem('socializer_latest_result');
        }
    }, [result]);

    useEffect(() => {
        localStorage.setItem('socializer_history', JSON.stringify(history));
    }, [history]);

    const tabs = [
        { id: 'instagram', label: 'Instagram' },
        { id: 'twitter', label: 'Twitter/X' },
        { id: 'facebook', label: 'Facebook' },
        { id: 'youtube', label: 'YouTube' },
        { id: 'tiktok', label: 'TikTok' },
        { id: 'linkedin', label: 'LinkedIn' },
    ];

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsGenerating(true);
        setError(null);
        
        try {
            const response = await axios.post('/api/generate-socializer', {
                content: content
            });
            
            const newResult = {
                ...response.data,
                id: Date.now(),
                timestamp: new Date().toISOString(),
                original_prompt: content.length > 50 ? content.substring(0, 50) + '...' : content
            };

            setResult(newResult);
            setHistory(prev => {
                const updatedHistory = [newResult, ...prev].slice(0, 10);
                return updatedHistory;
            });
            setActiveTab('instagram');
            setContent('');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong while generating.');
        } finally {
            setIsGenerating(false);
        }
    };

    const loadFromHistory = (item) => {
        setResult(item);
        setActiveTab('instagram');
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
        <div className="min-h-screen bg-[#0B0A0F] text-white selection:bg-[#F43F5E]/30">
            <Head title="Social Media Repurposer" />

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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F43F5E] to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            Social Media <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F43F5E] to-pink-400">Repurposer</span>
                        </h1>
                    </div>
                    <p className="text-lg text-gray-400 max-w-2xl">
                        Type a raw thought or paragraph, and instantly get perfectly optimized, human-sounding posts for every major social platform.
                    </p>
                </div>

                <HelpModal show={showHelp} onClose={() => setShowHelp(false)} title="Social Media Repurposer" />
                <AboutModal 
                    show={showAbout} 
                    onClose={() => setShowAbout(false)} 
                    title="Social Media Repurposer" 
                    description="Write one paragraph and let AI rewrite it in 6 distinct styles tailored for Instagram, Twitter/X, Facebook, YouTube, TikTok, and LinkedIn. It writes like a real human, minimizes emojis, and provides relevant hashtags." 
                    category="Content Creation" 
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-5 space-y-6">
                        <form onSubmit={handleGenerate} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Your core idea or paragraph <span className="text-rose-400">*</span>
                                    </label>
                                    <textarea
                                        required
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="e.g. We just launched a new feature that lets users export their data to PDF in one click. It was hard to build but we finally did it. Check it out!"
                                        className="w-full h-48 bg-gray-950 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#F43F5E] focus:ring-1 focus:ring-[#F43F5E] transition-all resize-none leading-relaxed"
                                    />
                                    <p className="mt-2 text-xs text-gray-500">
                                        Type anything from a quick thought to a rough draft. We'll humanize it and format it for every network.
                                    </p>
                                </div>

                                {error && (
                                    <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!content.trim() || isGenerating}
                                    className="w-full py-3.5 bg-gradient-to-r from-[#F43F5E] to-rose-600 hover:from-[#F43F5E]/90 hover:to-rose-600/90 text-white rounded-xl font-bold shadow-lg shadow-[#F43F5E]/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                            Writing posts...
                                        </>
                                    ) : (
                                        'Convert to All Platforms'
                                    )}
                                </button>
                            </div>
                        </form>

                        {history.length > 0 && !isGenerating && (
                            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-white">History</h3>
                                    <button 
                                        onClick={clearHistory}
                                        className="text-xs text-rose-400 hover:text-rose-300 transition-colors py-1 px-2 rounded hover:bg-rose-400/10"
                                    >
                                        Clear
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                                    {history.map(item => (
                                        <button 
                                            key={item.id}
                                            onClick={() => loadFromHistory(item)}
                                            className="w-full text-left p-4 rounded-lg bg-gray-950 border border-gray-800 hover:border-[#F43F5E]/50 hover:bg-gray-900 transition-all flex justify-between items-center group"
                                        >
                                            <div className="truncate pr-4 flex-1">
                                                <p className="text-sm font-medium text-gray-200 truncate">{item.original_prompt}</p>
                                                <p className="text-xs text-gray-500 mt-1">{formatDate(item.timestamp)}</p>
                                            </div>
                                            <div className="text-[#F43F5E] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 duration-300">
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
                                                    ? 'border-[#F43F5E] text-[#F43F5E] bg-[#F43F5E]/5'
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
                                            {tabs.find(t => t.id === activeTab)?.label} Format
                                        </h3>
                                        <button 
                                            onClick={handleCopy}
                                            className={`text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium border ${
                                                isCopied 
                                                ? 'bg-[#F43F5E]/10 text-[#F43F5E] border-[#F43F5E]/30'
                                                : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
                                            }`}
                                        >
                                            {isCopied ? 'Copied to Clipboard!' : 'Copy Post'}
                                        </button>
                                    </div>
                                    
                                    <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 flex-1">
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-xl text-gray-300 mb-2">Awaiting Content</h3>
                                <p className="text-gray-500 max-w-sm leading-relaxed">
                                    Type your paragraph on the left. I'll perfectly format it into 6 different social media styles for you.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
