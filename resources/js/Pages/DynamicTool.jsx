import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import HelpModal from '@/Components/HelpModal';
import AboutModal from '@/Components/AboutModal';

export default function DynamicTool({ tool, slug, history = [] }) {
    const { auth } = usePage().props;
    const [formData, setFormData] = useState({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [copiedField, setCopiedField] = useState(null);
    const [showHelp, setShowHelp] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

    // Map basic color names to Tailwind hexes for dynamic styling without arbitrary class compilation issues
    const colorMap = {
        blue: { hex: '#3B82F6', hover: 'hover:border-blue-500/50 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.3)]' },
        red: { hex: '#EF4444', hover: 'hover:border-red-500/50 hover:shadow-[0_20px_40px_-15px_rgba(239,68,68,0.3)]' },
        emerald: { hex: '#10B981', hover: 'hover:border-emerald-500/50 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)]' },
        rose: { hex: '#F43F5E', hover: 'hover:border-rose-500/50 hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.3)]' },
        sky: { hex: '#0EA5E9', hover: 'hover:border-sky-500/50 hover:shadow-[0_20px_40px_-15px_rgba(14,165,233,0.3)]' },
        fuchsia: { hex: '#D946EF', hover: 'hover:border-fuchsia-500/50 hover:shadow-[0_20px_40px_-15px_rgba(217,70,239,0.3)]' },
        cyan: { hex: '#06B6D4', hover: 'hover:border-cyan-500/50 hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.3)]' },
        violet: { hex: '#8B5CF6', hover: 'hover:border-violet-500/50 hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.3)]' },
        orange: { hex: '#F97316', hover: 'hover:border-orange-500/50 hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.3)]' },
        lime: { hex: '#84CC16', hover: 'hover:border-lime-500/50 hover:shadow-[0_20px_40px_-15px_rgba(132,204,22,0.3)]' }
    };

    const theme = colorMap[tool.color] || colorMap.blue;

    const handleGenerate = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        setError(null);
        
        try {
            const response = await axios.post(`/api/tools/${slug}/generate`, formData);
            setResult(response.data);
            
            // Reload the page data seamlessly to fetch the updated history list
            router.reload({ only: ['history'] });
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

    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isSubmitDisabled = tool.inputs.some(input => !input.optional && !formData[input.name]?.trim());

    return (
        <div className="min-h-screen bg-[#0B0A0F] text-white" style={{ '--theme-color': theme.hex }}>
            <Head title={tool.title} />

            <main className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
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
                        <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shrink-0" 
                            style={{ backgroundColor: theme.hex, boxShadow: `0 10px 15px -3px ${theme.hex}40` }}
                            dangerouslySetInnerHTML={{ __html: tool.icon }}
                        />
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            {tool.title}
                        </h1>
                    </div>
                    <p className="text-lg text-gray-400 max-w-2xl">
                        {tool.description}
                    </p>
                </div>

                <HelpModal show={showHelp} onClose={() => setShowHelp(false)} title={tool.title} />
                <AboutModal 
                    show={showAbout} 
                    onClose={() => setShowAbout(false)} 
                    title={tool.title} 
                    description={tool.description} 
                    category={tool.category} 
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-5 space-y-6">
                        <form onSubmit={handleGenerate} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col min-h-[500px]">
                            <div className="space-y-6 flex-1 flex flex-col">
                                
                                {tool.inputs.map((input, idx) => (
                                    <div key={idx} className={input.type === 'textarea' ? 'flex-1 flex flex-col' : ''}>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            {input.label} {!input.optional && <span className="text-red-400">*</span>}
                                        </label>
                                        
                                        {input.type === 'textarea' ? (
                                            <textarea
                                                required={!input.optional}
                                                value={formData[input.name] || ''}
                                                onChange={(e) => handleInputChange(input.name, e.target.value)}
                                                placeholder={input.placeholder}
                                                className="w-full flex-1 min-h-[150px] bg-gray-950 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none transition-all resize-none font-mono text-sm"
                                                style={{ focusRing: theme.hex }}
                                            />
                                        ) : input.type === 'select' ? (
                                            <select
                                                required={!input.optional}
                                                value={formData[input.name] || ''}
                                                onChange={(e) => handleInputChange(input.name, e.target.value)}
                                                className="w-full bg-gray-950 border border-gray-700 rounded-xl p-4 text-white focus:outline-none transition-all"
                                            >
                                                <option value="" disabled>Select an option...</option>
                                                {input.options.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                required={!input.optional}
                                                value={formData[input.name] || ''}
                                                onChange={(e) => handleInputChange(input.name, e.target.value)}
                                                placeholder={input.placeholder}
                                                className="w-full bg-gray-950 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none transition-all"
                                            />
                                        )}
                                    </div>
                                ))}

                                {error && (
                                    <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm shrink-0">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitDisabled || isGenerating}
                                    style={{ backgroundColor: theme.hex }}
                                    className="w-full py-3.5 text-white rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2 shrink-0 mt-4"
                                >
                                    {isGenerating ? (
                                        <>
                                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Generate Output'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Results */}
                    <div className="lg:col-span-7">
                        {result ? (
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl h-full flex flex-col animate-fade-in">
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                                    {tool.outputs.map((out, idx) => {
                                        const text = result[out.key];
                                        if (!text) return null;
                                        
                                        return (
                                            <div key={idx}>
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="font-bold text-white text-lg flex items-center gap-2" style={{ color: theme.hex }}>
                                                        {out.label}
                                                    </h3>
                                                    <button 
                                                        onClick={() => handleCopy(text, out.key)}
                                                        className={`text-sm px-4 py-1.5 rounded-lg transition-colors flex items-center gap-2 font-medium border ${
                                                            copiedField === out.key
                                                            ? 'bg-white/10 text-white'
                                                            : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
                                                        }`}
                                                        style={copiedField === out.key ? { borderColor: theme.hex, color: theme.hex, backgroundColor: `${theme.hex}20` } : {}}
                                                    >
                                                        {copiedField === out.key ? 'Copied!' : 'Copy'}
                                                    </button>
                                                </div>
                                                
                                                {out.type === 'code' ? (
                                                    <div className="bg-black/50 border border-gray-800 rounded-xl p-5 overflow-x-auto">
                                                        <pre className="text-gray-300 font-mono text-sm">
                                                            {text}
                                                        </pre>
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-950 border border-gray-800 rounded-xl p-5 text-gray-300 text-sm whitespace-pre-wrap leading-relaxed font-mono">
                                                        {text}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[500px] bg-gray-900/30 border border-gray-800 border-dashed rounded-2xl flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                                <div className="w-16 h-16 mb-6 rounded-2xl bg-gray-800/50 flex items-center justify-center opacity-50" dangerouslySetInnerHTML={{ __html: tool.icon }} />
                                <h3 className="font-semibold text-xl text-gray-300 mb-2">Awaiting Input</h3>
                                <p className="text-gray-500 max-w-sm leading-relaxed">
                                    Fill out the form on the left to let the AI process your request and generate the exact output you need.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {auth?.user && (
                    <div className="mt-16 pt-16 border-t border-gray-800">
                        <div className="flex items-center gap-3 mb-8">
                            <h3 className="text-2xl font-bold text-white">Your Recent Generations</h3>
                            {history && history.length > 0 && (
                                <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-400">Past {history.length}</div>
                            )}
                        </div>
                        
                        {(!history || history.length === 0) ? (
                            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 mb-4 rounded-full bg-gray-800/50 flex items-center justify-center opacity-50">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-medium text-gray-300 mb-1">No history yet</h4>
                                <p className="text-gray-500 text-sm max-w-sm">Your generated results will be securely saved here so you can revisit them anytime.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {history.map((item) => (
                                    <button 
                                        key={item.id}
                                        onClick={() => {
                                            setFormData(item.inputs || {});
                                            setResult(item.outputs || null);
                                            setError(null);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="text-left bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-all group"
                                    >
                                        <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            {item.inputs && Object.keys(item.inputs).slice(0, 3).map(key => {
                                                const label = tool.inputs.find(i => i.name === key)?.label || key;
                                                return (
                                                    <div key={key} className="truncate text-sm">
                                                        <span className="text-gray-400">{label}:</span> <span className="text-gray-200 font-medium ml-1">{item.inputs[key]}</span>
                                                    </div>
                                                )
                                            })}
                                            {item.inputs && Object.keys(item.inputs).length > 3 && (
                                                <div className="text-xs text-gray-500 italic">...and more</div>
                                            )}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-800/50 text-sm font-medium transition-colors opacity-80 group-hover:opacity-100 flex items-center gap-1" style={{ color: theme.hex }}>
                                            Load this result 
                                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
            
            <style dangerouslySetInnerHTML={{__html: `
                textarea:focus, input:focus, select:focus {
                    border-color: var(--theme-color) !important;
                    box-shadow: 0 0 0 1px var(--theme-color) !important;
                }
            `}} />
        </div>
    );
}
