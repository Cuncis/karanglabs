import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import HelpModal from '@/Components/HelpModal';
import AboutModal from '@/Components/AboutModal';

export default function ChangelogGenerator() {
    const [commits, setCommits] = useState('');
    const [audience, setAudience] = useState('users');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [copiedField, setCopiedField] = useState(null);
    const [showHelp, setShowHelp] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!commits.trim()) return;

        setIsGenerating(true);
        setError(null);
        
        try {
            const response = await axios.post('/api/generate-changelog', {
                commits: commits,
                audience: audience
            });
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong while generating.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = (text, fieldName) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="min-h-screen bg-[#0B0A0F] text-white selection:bg-[#F59E0B]/30">
            <Head title="Changelog & Tweet Generator" />

            <main className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
                        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg border border-gray-800 w-fit">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Collection
                        </Link>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setShowAbout(true)}
                                className="px-4 py-2 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors shadow-sm text-sm font-semibold"
                                title="What is this?"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                What is this?
                            </button>
                            <button 
                                onClick={() => setShowHelp(true)}
                                className="px-4 py-2 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 flex items-center gap-2 transition-colors shadow-sm text-sm font-semibold"
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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F59E0B] to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20 shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            Changelog <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] to-yellow-400">Generator</span>
                        </h1>
                    </div>
                    <p className="text-lg text-gray-400 max-w-2xl">
                        Turn messy commit messages and quick notes into polished, engaging changelogs and social media posts instantly.
                    </p>
                </div>

                <HelpModal show={showHelp} onClose={() => setShowHelp(false)} title="Changelog Generator" />
                <AboutModal 
                    show={showAbout} 
                    onClose={() => setShowAbout(false)} 
                    title="Changelog Generator" 
                    description="Turn messy commit messages and quick notes into polished, engaging changelogs and social media posts instantly. Build excitement for your product updates without having to stare at a blank page." 
                    category="Marketing & SEO" 
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-5 space-y-6">
                        <form onSubmit={handleGenerate} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col h-[600px]">
                            <div className="space-y-6 flex-1 flex flex-col">
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-3">
                                        Target Audience
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'technical', label: 'Technical' },
                                            { id: 'users', label: 'End Users' },
                                            { id: 'mixed', label: 'Mixed' }
                                        ].map(option => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => setAudience(option.id)}
                                                className={`py-2 px-2 text-sm font-medium rounded-lg border transition-all ${
                                                    audience === option.id 
                                                    ? 'bg-[#F59E0B]/10 border-[#F59E0B] text-[#F59E0B]' 
                                                    : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700 hover:bg-gray-900'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Raw Notes or Git Commits <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        required
                                        value={commits}
                                        onChange={(e) => setCommits(e.target.value)}
                                        placeholder="e.g.&#10;- fixed the nasty auth bug&#10;- added stripe payments&#10;- updated tailwind config&#10;- refactored the navbar"
                                        className="w-full flex-1 bg-gray-950 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all resize-none font-mono text-sm"
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm shrink-0">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!commits.trim() || isGenerating}
                                    className="w-full py-3.5 bg-gradient-to-r from-[#F59E0B] to-orange-500 hover:from-[#F59E0B]/90 hover:to-orange-500/90 text-white rounded-xl font-bold shadow-lg shadow-[#F59E0B]/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2 shrink-0"
                                >
                                    {isGenerating ? (
                                        <>
                                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                            Writing Changelog...
                                        </>
                                    ) : (
                                        'Generate Release Notes'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Results */}
                    <div className="lg:col-span-7 h-[600px]">
                        {result ? (
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl h-full flex flex-col animate-fade-in">
                                
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    {/* Changelog Section */}
                                    <div className="p-6 border-b border-gray-800">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                                <svg className="w-5 h-5 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Markdown Changelog
                                            </h3>
                                            <button 
                                                onClick={() => handleCopy(result.changelog, 'changelog')}
                                                className={`text-sm px-4 py-1.5 rounded-lg transition-colors flex items-center gap-2 font-medium border ${
                                                    copiedField === 'changelog'
                                                    ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                                                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
                                                }`}
                                            >
                                                {copiedField === 'changelog' ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                        <div className="bg-gray-950 border border-gray-800 rounded-xl p-5">
                                            <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                                                {result.changelog}
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Tweet Section */}
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                                <svg className="w-5 h-5 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                                </svg>
                                                Social Post / Tweet
                                            </h3>
                                            <button 
                                                onClick={() => handleCopy(result.tweet, 'tweet')}
                                                className={`text-sm px-4 py-1.5 rounded-lg transition-colors flex items-center gap-2 font-medium border ${
                                                    copiedField === 'tweet'
                                                    ? 'bg-[#1DA1F2]/10 text-[#1DA1F2] border-[#1DA1F2]/30'
                                                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
                                                }`}
                                            >
                                                {copiedField === 'tweet' ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                        <div className="bg-gray-950 border border-gray-800 rounded-xl p-5 text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">
                                            {result.tweet}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full bg-gray-900/30 border border-gray-800 border-dashed rounded-2xl flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                                <div className="w-16 h-16 mb-6 rounded-2xl bg-gray-800/50 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-xl text-gray-300 mb-2">Ready to Release?</h3>
                                <p className="text-gray-500 max-w-sm leading-relaxed">
                                    Paste your raw notes or git commits on the left, choose your audience, and I'll write your release notes and social media post.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
