import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import HelpModal from '@/Components/HelpModal';
import AboutModal from '@/Components/AboutModal';
import { ArrowRight, Trash2 } from 'lucide-react';

export default function Index({ auth, snippets }) {
    const [showHelp, setShowHelp] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        content: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('terminal-converter.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <div className="min-h-screen bg-[#0B0A0F] text-white selection:bg-[#00D8FF]/30">
            <Head title="Terminal Converter" />

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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center shadow-lg shadow-slate-500/20 shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            Terminal <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-slate-500">Converter</span>
                        </h1>
                    </div>
                    <p className="text-lg text-gray-400 max-w-2xl">
                        Convert plain text and raw terminal outputs into beautiful, readable HTML markdown using AI.
                    </p>
                </div>

                <HelpModal show={showHelp} onClose={() => setShowHelp(false)} title="Terminal Converter" />
                <AboutModal 
                    show={showAbout} 
                    onClose={() => setShowAbout(false)} 
                    title="Terminal Converter" 
                    description="Whenever you run a complex command in your terminal and get a huge block of text, copy and paste it here. AI will convert it into a neat, beautifully structured markdown file with syntax highlighting, bullet points, and headers so you can easily read, search, and refer back to it later." 
                    category="Code & Data Lifesavers" 
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-8 space-y-6">
                        <form onSubmit={submit} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Title / Description <span className="text-gray-500 text-xs font-normal">(Optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="e.g. Docker Build Error Log"
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Terminal Output <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        required
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        placeholder="Paste your raw terminal output or code snippets here..."
                                        className="w-full h-[400px] font-mono text-sm bg-gray-950 border border-gray-700 rounded-xl p-4 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all custom-scrollbar"
                                    />
                                    {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing || !data.content.trim()}
                                    className="w-full py-3.5 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 text-white rounded-xl font-bold shadow-lg shadow-slate-900/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                            Analyzing & Formatting with AI...
                                        </>
                                    ) : (
                                        'Convert with AI'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Saved Snippets */}
                    <div className="lg:col-span-4">
                        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 shadow-xl h-full">
                            <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                                Saved Archives
                            </h3>
                            
                            {snippets.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 text-sm">No saved archives yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 overflow-y-auto max-h-[500px] custom-scrollbar pr-2">
                                    {snippets.map((snippet) => (
                                        <Link 
                                            key={snippet.id} 
                                            href={route('terminal-converter.show', snippet.slug)}
                                            className="group flex flex-col p-4 rounded-xl border border-gray-800 bg-gray-950 hover:bg-gray-800 hover:border-slate-500 transition-all duration-200"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-medium text-gray-200 group-hover:text-white truncate pr-2">
                                                    {snippet.title || 'Untitled Snippet'}
                                                </h4>
                                                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-slate-400 shrink-0" />
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {new Date(snippet.created_at).toLocaleDateString(undefined, {
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                })}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
