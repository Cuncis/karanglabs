import { useState, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import HelpModal from '@/Components/HelpModal';
import AboutModal from '@/Components/AboutModal';

export default function ContextBundler() {
    const [files, setFiles] = useState([]);
    const [bundledResult, setBundledResult] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    
    // Manual input state
    const [manualName, setManualName] = useState('');
    const [manualContent, setManualContent] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const uploadedFiles = Array.from(e.target.files);
        
        const newFiles = await Promise.all(uploadedFiles.map(async (file) => {
            const text = await file.text();
            return {
                id: Math.random().toString(36).substring(7),
                name: file.name,
                content: text,
                size: file.size
            };
        }));

        setFiles(prev => [...prev, ...newFiles]);
        if(fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleManualAdd = () => {
        if (!manualContent.trim()) return;
        
        const name = manualName.trim() || `snippet-${files.length + 1}.txt`;
        setFiles(prev => [...prev, {
            id: Math.random().toString(36).substring(7),
            name: name,
            content: manualContent,
            size: new Blob([manualContent]).size
        }]);
        
        setManualName('');
        setManualContent('');
        setShowManualInput(false);
    };

    const removeFile = (id) => {
        setFiles(files.filter(f => f.id !== id));
        if (files.length === 1) {
            setBundledResult('');
        }
    };

    const generateBundle = () => {
        if (files.length === 0) return;

        let result = `I have the following files that provide context for my task:\n\n`;
        
        files.forEach(file => {
            result += `<file name="${file.name}">\n${file.content}\n</file>\n\n`;
        });

        result += `Please review this context. I will follow up with my request.`;
        setBundledResult(result);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(bundledResult);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    return (
        <div className="min-h-screen bg-[#0B0A0F] text-white selection:bg-pink-500/30">
            <Head title="Codebase Context Bundler" />

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
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            Context <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">Bundler</span>
                        </h1>
                    </div>
                    <p className="text-lg text-gray-400 max-w-2xl">
                        Select multiple files or paste code snippets to instantly generate a single, perfectly formatted prompt to feed to ChatGPT or Claude.
                    </p>
                </div>

                <HelpModal 
                    show={showHelp} 
                    onClose={() => setShowHelp(false)} 
                    title="Context Bundler" 
                    steps={[
                        { title: "Add Your Code", description: "Select files from your computer or manually paste code snippets using the buttons on the left." },
                        { title: "Generate Bundle", description: "Once you've added all the files you need help with, click the 'Generate Bundle Prompt' button." },
                        { title: "Copy and Ask AI", description: "Copy the perfectly formatted bundle on the right, paste it into ChatGPT or Claude, and ask your question!" }
                    ]} 
                />

                <AboutModal 
                    show={showAbout} 
                    onClose={() => setShowAbout(false)} 
                    title="Context Bundler" 
                    description="Select or paste code files to instantly generate perfectly formatted context prompts for AI. This prevents hallucinations and saves you from manually copying and pasting dozens of files when you need to ask ChatGPT or Claude a complex codebase question." 
                    category="Daily Productivity" 
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Inputs */}
                    <div className="space-y-6">
                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-pink-500/50 text-white px-4 py-8 rounded-2xl transition-all flex flex-col items-center justify-center gap-3 group"
                            >
                                <div className="w-12 h-12 rounded-full bg-gray-800 group-hover:bg-pink-500/20 flex items-center justify-center transition-colors">
                                    <svg className="w-6 h-6 text-gray-400 group-hover:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <span className="font-medium">Select Files</span>
                                <input 
                                    type="file" 
                                    multiple 
                                    className="hidden" 
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                />
                            </button>

                            <button 
                                onClick={() => setShowManualInput(!showManualInput)}
                                className={`flex-1 border text-white px-4 py-8 rounded-2xl transition-all flex flex-col items-center justify-center gap-3 group ${
                                    showManualInput ? 'bg-pink-500/10 border-pink-500/50' : 'bg-gray-900 hover:bg-gray-800 border-gray-700 hover:border-orange-500/50'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                                    showManualInput ? 'bg-pink-500/20 text-pink-400' : 'bg-gray-800 group-hover:bg-orange-500/20 text-gray-400 group-hover:text-orange-400'
                                }`}>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <span className="font-medium">Paste Snippet</span>
                            </button>
                        </div>

                        {/* Manual Input Form */}
                        {showManualInput && (
                            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 animate-fade-in">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">File Name (Optional)</label>
                                        <input 
                                            type="text"
                                            value={manualName}
                                            onChange={e => setManualName(e.target.value)}
                                            placeholder="e.g. User.php"
                                            className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Code Snippet</label>
                                        <textarea 
                                            value={manualContent}
                                            onChange={e => setManualContent(e.target.value)}
                                            placeholder="Paste your code here..."
                                            className="w-full h-32 bg-gray-950 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500 font-mono text-sm resize-none"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleManualAdd}
                                        disabled={!manualContent.trim()}
                                        className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Add to Bundle
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* File List */}
                        {files.length > 0 && (
                            <div className="bg-gray-900/30 border border-gray-800 rounded-2xl overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                                    <h3 className="font-semibold">Added Files ({files.length})</h3>
                                    <button 
                                        onClick={() => setFiles([])}
                                        className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                                    {files.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between p-3 hover:bg-gray-800/50 rounded-lg group transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <svg className="w-5 h-5 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <div className="truncate">
                                                    <p className="text-sm font-medium text-gray-200 truncate">{file.name}</p>
                                                    <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => removeFile(file.id)}
                                                className="text-gray-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 bg-gray-900/80 border-t border-gray-800">
                                    <button 
                                        onClick={generateBundle}
                                        className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-bold shadow-lg shadow-pink-500/25 transition-all hover:-translate-y-0.5"
                                    >
                                        Generate Bundle Prompt
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Output */}
                    <div className="h-full">
                        {bundledResult ? (
                            <div className="flex flex-col h-full bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl animate-fade-in">
                                <div className="px-5 py-4 border-b border-gray-800 bg-gray-950 flex justify-between items-center">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        Ready to paste
                                    </h3>
                                    <button 
                                        onClick={copyToClipboard}
                                        className="text-sm px-4 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 rounded-lg transition-colors flex items-center gap-2 font-medium border border-pink-500/20"
                                    >
                                        {isCopied ? (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                Copy All
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="flex-1 p-5 relative group">
                                    <textarea 
                                        readOnly
                                        value={bundledResult}
                                        className="w-full h-[500px] lg:h-full min-h-[400px] bg-gray-950 border border-gray-800 rounded-xl p-4 text-gray-300 font-mono text-sm resize-none custom-scrollbar focus:outline-none"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[400px] bg-gray-900/30 border border-gray-800 border-dashed rounded-2xl flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                                <svg className="w-16 h-16 mb-4 opacity-50 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                                <p className="font-medium text-lg text-gray-400 mb-2">No context generated yet</p>
                                <p className="text-sm">Add some files on the left and click "Generate Bundle Prompt" to see the magic happen.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
