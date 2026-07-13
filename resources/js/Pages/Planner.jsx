import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import StepWizard from '../Components/StepWizard';
import OutputView from '../Components/OutputView';

export default function Planner() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);

    // Initialize result from localStorage if it exists
    const [result, setResult] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('planner_latest_result');
                return saved ? JSON.parse(saved) : null;
            } catch (e) {
                return null;
            }
        }
        return null;
    });

    // Initialize history from localStorage
    const [history, setHistory] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('planner_history');
                return saved ? JSON.parse(saved) : [];
            } catch (e) {
                return [];
            }
        }
        return [];
    });

    // Keep localStorage in sync with result
    useEffect(() => {
        if (result) {
            localStorage.setItem('planner_latest_result', JSON.stringify(result));
        } else {
            localStorage.removeItem('planner_latest_result');
        }
    }, [result]);

    // Keep localStorage in sync with history
    useEffect(() => {
        localStorage.setItem('planner_history', JSON.stringify(history));
    }, [history]);

    const handleGenerate = async (data) => {
        setIsGenerating(true);
        setError(null);
        
        try {
            const response = await axios.post('/api/generate-plan', data);
            
            const newResult = {
                ...response.data,
                id: Date.now(),
                timestamp: new Date().toISOString(),
                title: data.idea ? (data.idea.length > 50 ? data.idea.substring(0, 50) + '...' : data.idea) : 'New Plan'
            };

            setResult(newResult);
            
            setHistory(prev => {
                const updatedHistory = [newResult, ...prev].slice(0, 10); // keep last 10 entries
                return updatedHistory;
            });
            
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong while generating the plan.');
        } finally {
            setIsGenerating(false);
        }
    };

    const loadFromHistory = (item) => {
        setResult(item);
    };

    const clearHistory = () => {
        setHistory([]);
        setResult(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString([], { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <div className="min-h-screen bg-[#0B0A0F] text-white selection:bg-[#7C3AED]/30">
            <Head title="AI Project Planner" />

            <main className="container mx-auto px-4 py-12 md:py-20">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                        Turn Ideas into <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-fuchsia-500">Working Apps</span>
                    </h1>
                    <p className="text-lg text-gray-400">
                        Describe your vision, and we'll generate a complete product plan and a prompt ready for AI coding tools like Claude Code or Cursor.
                    </p>
                </div>

                {error && (
                    <div className="max-w-2xl mx-auto mb-8 bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-center">
                        {error}
                    </div>
                )}

                {!result ? (
                    <div className="space-y-12 animate-fade-in">
                        <StepWizard onSubmit={handleGenerate} isGenerating={isGenerating} />
                        
                        {history.length > 0 && !isGenerating && (
                            <div className="max-w-2xl mx-auto bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-white">Previous Plans</h3>
                                    <button 
                                        onClick={clearHistory}
                                        className="text-xs text-red-400 hover:text-red-300 transition-colors py-1 px-2 rounded hover:bg-red-400/10"
                                    >
                                        Clear History
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                                    {history.map(item => (
                                        <button 
                                            key={item.id}
                                            onClick={() => loadFromHistory(item)}
                                            className="w-full text-left p-4 rounded-lg bg-gray-950 border border-gray-800 hover:border-[#7C3AED]/50 hover:bg-gray-900 transition-all flex justify-between items-center group"
                                        >
                                            <div className="truncate pr-4 flex-1">
                                                <p className="text-sm font-medium text-gray-200 truncate">{item.title}</p>
                                                <p className="text-xs text-gray-500 mt-1">{formatDate(item.timestamp)}</p>
                                            </div>
                                            <div className="text-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 duration-300">
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
                ) : (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex flex-wrap justify-between items-center max-w-4xl mx-auto px-4 gap-4">
                            <button
                                onClick={() => setResult(null)}
                                className="text-gray-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to planner
                            </button>
                            
                            {result.timestamp && (
                                <span className="text-xs text-gray-500 font-medium">
                                    Generated: {formatDate(result.timestamp)}
                                </span>
                            )}
                        </div>
                        <OutputView data={result} />
                    </div>
                )}
            </main>
        </div>
    );
}
