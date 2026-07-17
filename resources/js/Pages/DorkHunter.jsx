import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import HelpModal from '@/Components/HelpModal';
import AboutModal from '@/Components/AboutModal';
import { Play, Trash2, Plus, ExternalLink, Radar, Circle } from 'lucide-react';

function timeAgo(date) {
    if (!date) {
        return 'never';
    }
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function DorkHunter({ auth, dorks, results, activeCount, maxActive }) {
    const [showHelp, setShowHelp] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        label: '',
        query: '',
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('dork-hunter.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const toggleActive = (dork) => {
        router.patch(route('dork-hunter.update', dork.id), {
            label: dork.label ?? '',
            query: dork.query,
            is_active: !dork.is_active,
        }, { preserveScroll: true });
    };

    const runNow = (dork) => {
        router.post(route('dork-hunter.run', dork.id), {}, { preserveScroll: true });
    };

    const destroy = (dork) => {
        if (confirm('Delete this dork and all of its results?')) {
            router.delete(route('dork-hunter.destroy', dork.id), { preserveScroll: true });
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0A0F] text-white selection:bg-[#00D8FF]/30">
            <Head title="Dork Hunter" />

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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
                            <Radar className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            Dork <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">Hunter</span>
                        </h1>
                    </div>
                    <p className="text-lg text-gray-400 max-w-2xl">
                        Save Google-style search dorks and let them run automatically every 2 hours. New matches get pushed straight to your Telegram.
                    </p>
                </div>

                <HelpModal show={showHelp} onClose={() => setShowHelp(false)} title="Dork Hunter" />
                <AboutModal
                    show={showAbout}
                    onClose={() => setShowAbout(false)}
                    title="Dork Hunter"
                    description="Add up to 5 active search dorks (e.g. site:*.id inurl:admin). Every 2 hours the scheduler runs each one through the Brave Search API, filters out URLs you've already seen using an MD5 hash, and sends any brand-new hits to your Telegram bot. Use 'Run now' to fire a dork immediately instead of waiting for the next cycle."
                    category="Code & Data Lifesavers"
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Dork management */}
                    <div className="lg:col-span-7 space-y-6">
                        <form onSubmit={submit} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-semibold text-gray-200">Add a dork</h3>
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${activeCount >= maxActive ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
                                    {activeCount} / {maxActive} active
                                </span>
                            </div>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Label <span className="text-gray-500 text-xs font-normal">(Optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.label}
                                        onChange={(e) => setData('label', e.target.value)}
                                        placeholder="e.g. Indonesian admin panels"
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Search Dork <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        required
                                        value={data.query}
                                        onChange={(e) => setData('query', e.target.value)}
                                        placeholder='site:*.id inurl:admin intitle:"login"'
                                        className="w-full h-24 font-mono text-sm bg-gray-950 border border-gray-700 rounded-xl p-4 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all custom-scrollbar"
                                    />
                                    {errors.query && <p className="mt-1 text-sm text-red-500">{errors.query}</p>}
                                </div>

                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-600 bg-gray-950 text-rose-500 focus:ring-rose-500 focus:ring-offset-gray-900"
                                    />
                                    <span className="text-sm text-gray-300">Run this dork automatically every 2 hours</span>
                                </label>

                                <button
                                    type="submit"
                                    disabled={processing || !data.query.trim()}
                                    className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white rounded-xl font-bold shadow-lg shadow-rose-900/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Dork
                                </button>
                            </div>
                        </form>

                        {/* Dork list */}
                        <div className="space-y-3">
                            {dorks.length === 0 ? (
                                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl py-12 flex flex-col items-center justify-center text-center">
                                    <Radar className="w-8 h-8 text-gray-600 mb-3" />
                                    <p className="text-gray-500 text-sm">No dorks yet. Add one above to start hunting.</p>
                                </div>
                            ) : (
                                dorks.map((dork) => (
                                    <div key={dork.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 shadow-lg">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Circle className={`w-2.5 h-2.5 shrink-0 ${dork.is_active ? 'fill-emerald-400 text-emerald-400' : 'fill-gray-600 text-gray-600'}`} />
                                                    <span className="font-medium text-gray-200 truncate">
                                                        {dork.label || 'Untitled dork'}
                                                    </span>
                                                    <span className="text-xs text-gray-600 shrink-0">
                                                        {dork.results_count} hit{dork.results_count === 1 ? '' : 's'}
                                                    </span>
                                                </div>
                                                <code className="block text-xs font-mono text-rose-300/80 bg-gray-950 rounded-lg px-3 py-2 break-all">
                                                    {dork.query}
                                                </code>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Last run {timeAgo(dork.last_run_at)}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 shrink-0">
                                                <button
                                                    onClick={() => runNow(dork)}
                                                    title="Run now"
                                                    className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                                                >
                                                    <Play className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => toggleActive(dork)}
                                                    title={dork.is_active ? 'Pause' : 'Activate'}
                                                    className={`text-[10px] font-semibold px-2 py-1 rounded-md transition-colors ${dork.is_active ? 'text-amber-400 hover:bg-amber-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
                                                >
                                                    {dork.is_active ? 'PAUSE' : 'ON'}
                                                </button>
                                                <button
                                                    onClick={() => destroy(dork)}
                                                    title="Delete"
                                                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Column: Results feed */}
                    <div className="lg:col-span-5">
                        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 shadow-xl h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-200">Recent hits</h3>
                                <span className="text-xs text-gray-500">{results.length} shown</span>
                            </div>

                            {results.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                        <ExternalLink className="w-6 h-6 text-gray-500" />
                                    </div>
                                    <p className="text-gray-500 text-sm">No results yet. Hits will appear here after a dork runs.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 overflow-y-auto max-h-[640px] custom-scrollbar pr-2">
                                    {results.map((result) => (
                                        <a
                                            key={result.id}
                                            href={result.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex flex-col p-4 rounded-xl border border-gray-800 bg-gray-950 hover:bg-gray-800 hover:border-rose-500 transition-all duration-200"
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h4 className="font-medium text-gray-200 group-hover:text-white text-sm line-clamp-2">
                                                    {result.title || result.url}
                                                </h4>
                                                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-rose-400 shrink-0 mt-0.5" />
                                            </div>
                                            <p className="text-xs text-rose-300/70 truncate">{result.url}</p>
                                            {result.dork && (
                                                <p className="text-[11px] text-gray-600 mt-1.5 truncate">
                                                    via {result.dork.label || result.dork.query}
                                                    <span className="text-gray-700"> · {timeAgo(result.created_at)}</span>
                                                </p>
                                            )}
                                        </a>
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
