import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';

export default function Whisperer() {
    const [prompt, setPrompt] = useState('');
    const [type, setType] = useState('regex');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setError(null);
        
        try {
            const response = await axios.post('/api/generate-whisper', {
                prompt: prompt,
                type: type
            });
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong while generating.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        if (!result?.code_snippet) return;
        navigator.clipboard.writeText(result.code_snippet);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#0B0A0F] text-white selection:bg-[#10B981]/30">
            <Head title="Regex & Schema Whisperer" />

            <main className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
                {/* Header */}
                <div className="mb-12">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium mb-8 bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg border border-gray-800 w-fit">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Collection
                    </Link>
                    
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10B981] to-emerald-600 flex items-center justify-center shadow-lg shadow-[#10B981]/20">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            Regex & Schema <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-teal-400">Whisperer</span>
                        </h1>
                    </div>
                    <p className="text-lg text-gray-400 max-w-2xl">
                        Describe what you need in plain English. Get back the exact Regex, SQL, or Eloquent query you need, fully explained and tested.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-5 space-y-6">
                        <form onSubmit={handleGenerate} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <div className="space-y-6">
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-3">
                                        What are you trying to write?
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'regex', label: 'Regex' },
                                            { id: 'query', label: 'DB Query' },
                                            { id: 'schema', label: 'Schema' }
                                        ].map(option => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => setType(option.id)}
                                                className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                                                    type === option.id 
                                                    ? 'bg-[#10B981]/10 border-[#10B981] text-[#10B981]' 
                                                    : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700 hover:bg-gray-900'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Describe what you need <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        required
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder={
                                            type === 'regex' ? "e.g. A regex that matches phone numbers but only if they have a + country code..." :
                                            type === 'query' ? "e.g. Write an Eloquent query to get all users who haven't logged in for 30 days..." :
                                            "e.g. A JSON schema for a product with variants..."
                                        }
                                        className="w-full h-32 bg-gray-950 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all resize-none"
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!prompt.trim() || isGenerating}
                                    className="w-full py-3.5 bg-gradient-to-r from-[#10B981] to-emerald-500 hover:from-[#10B981]/90 hover:to-emerald-500/90 text-white rounded-xl font-bold shadow-lg shadow-[#10B981]/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                            Thinking...
                                        </>
                                    ) : (
                                        'Generate'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Results */}
                    <div className="lg:col-span-7">
                        {result ? (
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl h-full flex flex-col animate-fade-in">
                                
                                <div className="p-6 border-b border-gray-800 bg-gray-950 relative group">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
                                            Code Snippet
                                            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded ml-2 uppercase font-mono">{result.language}</span>
                                        </h3>
                                        <button 
                                            onClick={handleCopy}
                                            className={`text-sm px-4 py-1.5 rounded-lg transition-colors flex items-center gap-2 font-medium border ${
                                                isCopied 
                                                ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                                                : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
                                            }`}
                                        >
                                            {isCopied ? 'Copied!' : 'Copy Code'}
                                        </button>
                                    </div>
                                    <div className="bg-black/50 border border-gray-800 rounded-lg p-4 overflow-x-auto">
                                        <pre className="text-gray-300 font-mono text-sm">
                                            {result.code_snippet}
                                        </pre>
                                    </div>
                                </div>

                                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                                    
                                    <div>
                                        <h4 className="text-sm font-semibold text-[#10B981] uppercase tracking-wider mb-3">Explanation</h4>
                                        <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                            {result.explanation}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-800">
                                        <h4 className="text-sm font-semibold text-[#10B981] uppercase tracking-wider mb-3">Test Cases / Examples</h4>
                                        <div className="bg-gray-950 rounded-lg p-4 border border-gray-800 text-gray-300 text-sm font-mono whitespace-pre-wrap">
                                            {result.test_cases}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[400px] bg-gray-900/30 border border-gray-800 border-dashed rounded-2xl flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                                <div className="w-16 h-16 mb-6 rounded-2xl bg-gray-800/50 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-xl text-gray-300 mb-2">Awaiting Instructions</h3>
                                <p className="text-gray-500 max-w-sm leading-relaxed">
                                    Tell me what you're trying to extract or query. I'll translate your plain English into working code instantly.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
