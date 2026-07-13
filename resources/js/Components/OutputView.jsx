import { useState } from 'react';

export default function OutputView({ data }) {
    const [activeTab, setActiveTab] = useState('ai_prompt');
    const [copiedTab, setCopiedTab] = useState(null);

    const handleCopy = (text, tab) => {
        navigator.clipboard.writeText(text);
        setCopiedTab(tab);
        setTimeout(() => setCopiedTab(null), 2000);
    };

    const tabs = [
        { id: 'ai_prompt', label: 'AI Prompt' },
        { id: 'summary', label: 'Summary' },
        { id: 'feature_map', label: 'Feature Map' },
        { id: 'prd', label: 'PRD' },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800">
            <div className="flex overflow-x-auto border-b border-gray-800 bg-gray-950">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-4 px-6 text-sm font-medium transition-colors whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'text-[#7C3AED] border-b-2 border-[#7C3AED] bg-gray-900/50'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-6 md:p-8">
                {activeTab === 'ai_prompt' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">Ready-to-paste AI Prompt</h3>
                            <button
                                onClick={() => handleCopy(data.ai_prompt, 'ai_prompt')}
                                className="px-6 py-2.5 bg-[#7C3AED] hover:bg-violet-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-violet-500/20"
                            >
                                {copiedTab === 'ai_prompt' ? 'Copied!' : 'Copy to Claude Code'}
                            </button>
                        </div>
                        <div className="bg-gray-950 rounded-lg p-6 border-2 border-[#7C3AED]/30 relative group">
                            <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                                {data.ai_prompt}
                            </pre>
                        </div>
                    </div>
                )}

                {activeTab === 'summary' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Project Summary</h3>
                            <button
                                onClick={() => handleCopy(data.summary, 'summary')}
                                className="text-sm px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
                            >
                                {copiedTab === 'summary' ? 'Copied!' : 'Copy Summary'}
                            </button>
                        </div>
                        <div className="bg-gray-950 rounded-lg p-6 border border-gray-800">
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{data.summary}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'feature_map' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Feature Map</h3>
                            <button
                                onClick={() => handleCopy(data.feature_map, 'feature_map')}
                                className="text-sm px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
                            >
                                {copiedTab === 'feature_map' ? 'Copied!' : 'Copy Features'}
                            </button>
                        </div>
                        <div className="bg-gray-950 rounded-lg p-6 border border-gray-800">
                            <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                                {data.feature_map}
                            </pre>
                        </div>
                    </div>
                )}

                {activeTab === 'prd' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Product Requirements Document (PRD)</h3>
                            <button
                                onClick={() => handleCopy(data.prd, 'prd')}
                                className="text-sm px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors"
                            >
                                {copiedTab === 'prd' ? 'Copied!' : 'Copy PRD'}
                            </button>
                        </div>
                        <div className="bg-gray-950 rounded-lg p-6 border border-gray-800">
                            <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                                {data.prd}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
