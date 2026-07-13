import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import HelpModal from '@/Components/HelpModal';
import AboutModal from '@/Components/AboutModal';

export default function MicroCopy() {
    const [componentName, setComponentName] = useState('');
    const [context, setContext] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [activeTone, setActiveTone] = useState('professional');
    const [copiedField, setCopiedField] = useState(null);
    const [showHelp, setShowHelp] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!componentName.trim()) return;

        setIsGenerating(true);
        setError(null);
        
        try {
            const response = await axios.post('/api/generate-micro-copy', {
                component_name: componentName,
                context: context
            });
            setResult(response.data);
            setActiveTone('professional');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong while generating the micro-copy.');
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

    const renderToneResult = (toneData, toneKey) => {
        if (!toneData) return null;
        
        const fields = [
            { key: 'title', label: 'Title / Heading' },
            { key: 'description', label: 'Description / Helper Text' },
            { key: 'primary_button', label: 'Primary Button' },
            { key: 'secondary_button', label: 'Secondary Button' },
            { key: 'success_message', label: 'Success Message' },
            { key: 'error_message', label: 'Error Message' },
            { key: 'placeholder', label: 'Input Placeholder' },
        ];

        return (
            <div className="space-y-4 animate-fade-in">
                {fields.map(({ key, label }) => {
                    const text = toneData[key];
                    if (!text) return null;
                    
                    const fieldId = `${toneKey}-${key}`;
                    const isCopied = copiedField === fieldId;

                    return (
                        <div key={key} className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex justify-between items-start group hover:border-[#00D8FF]/30 transition-colors">
                            <div className="flex-1 pr-4">
                                <span className="block text-xs font-semibold text-[#00D8FF] uppercase tracking-wider mb-2">
                                    {label}
                                </span>
                                <p className="text-gray-200 text-lg font-medium">{text}</p>
                            </div>
                            <button 
                                onClick={() => handleCopy(text, fieldId)}
                                className={`shrink-0 p-2 rounded-lg border transition-all ${
                                    isCopied 
                                        ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                                        : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white hover:border-[#00D8FF]/50'
                                }`}
                                title="Copy to clipboard"
                            >
                                {isCopied ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0B0A0F] text-white selection:bg-[#00D8FF]/30">
            <Head title="Micro-Copy Master" />

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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D8FF] to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            Micro-Copy <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D8FF] to-blue-400">Master</span>
                        </h1>
                    </div>
                    <p className="text-lg text-gray-400 max-w-2xl">
                        Stop agonizing over placeholder text and error messages. Enter a UI component, and instantly get perfect, high-converting UX copy in three different tones.
                    </p>
                </div>

                <HelpModal show={showHelp} onClose={() => setShowHelp(false)} title="Micro-Copy Master" />
                <AboutModal 
                    show={showAbout} 
                    onClose={() => setShowAbout(false)} 
                    title="Micro-Copy Master" 
                    description="Generate perfect, high-converting UX copy for any component in professional, playful, and direct tones. Forget struggling to find the right words for buttons, placeholders, or error messages." 
                    category="Frontend & UI/UX" 
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-5 space-y-6">
                        <form onSubmit={handleGenerate} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        UI Component / Screen Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={componentName}
                                        onChange={(e) => setComponentName(e.target.value)}
                                        placeholder="e.g. Empty Shopping Cart, Reset Password"
                                        className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00D8FF] focus:ring-1 focus:ring-[#00D8FF] transition-all"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Additional Context <span className="text-gray-500 text-xs font-normal">(Optional)</span>
                                    </label>
                                    <textarea
                                        value={context}
                                        onChange={(e) => setContext(e.target.value)}
                                        placeholder="e.g. The user needs to confirm deleting their account. Make sure it sounds serious but not scary."
                                        className="w-full h-28 bg-gray-950 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00D8FF] focus:ring-1 focus:ring-[#00D8FF] transition-all resize-none"
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!componentName.trim() || isGenerating}
                                    className="w-full py-3.5 bg-gradient-to-r from-[#00D8FF] to-blue-500 hover:from-[#00D8FF]/90 hover:to-blue-500/90 text-white rounded-xl font-bold shadow-lg shadow-[#00D8FF]/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                            Writing UX Copy...
                                        </>
                                    ) : (
                                        'Generate Micro-Copy'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Results */}
                    <div className="lg:col-span-7">
                        {result ? (
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl h-full flex flex-col animate-fade-in">
                                {/* Tone Tabs */}
                                <div className="flex border-b border-gray-800 bg-gray-950 overflow-x-auto">
                                    {['professional', 'playful', 'direct'].map((tone) => (
                                        <button
                                            key={tone}
                                            onClick={() => setActiveTone(tone)}
                                            className={`flex-1 py-4 px-4 text-sm font-semibold uppercase tracking-wide transition-colors ${
                                                activeTone === tone
                                                    ? 'text-[#00D8FF] border-b-2 border-[#00D8FF] bg-gray-900/50'
                                                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'
                                            }`}
                                        >
                                            {tone}
                                        </button>
                                    ))}
                                </div>

                                {/* Results Body */}
                                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                    {renderToneResult(result[activeTone], activeTone)}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[400px] bg-gray-900/30 border border-gray-800 border-dashed rounded-2xl flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                                <div className="w-16 h-16 mb-6 rounded-2xl bg-gray-800/50 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-xl text-gray-300 mb-2">No Copy Generated Yet</h3>
                                <p className="text-gray-500 max-w-sm leading-relaxed">
                                    Enter a component name on the left (like "404 Page" or "Checkout Success") and let the AI write the perfect copy for you.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
