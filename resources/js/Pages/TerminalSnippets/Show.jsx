import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Trash2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function Show({ auth, snippet }) {
    const { delete: destroy, processing } = useForm();
    const [copied, setCopied] = useState(false);

    const handleDelete = () => {
        if (confirm('Are you sure you want to permanently delete this archive?')) {
            destroy(route('terminal-converter.destroy', snippet.slug));
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(snippet.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    let displayContent = snippet.content;
    
    // If the content is wrapped in a markdown code block, strip it so it renders as HTML
    displayContent = displayContent.replace(/^```[a-zA-Z]*\s*\n/i, '');
    displayContent = displayContent.replace(/\n```\s*$/i, '');

    return (
        <div className="min-h-screen bg-[#0B0A0F] text-white selection:bg-[#00D8FF]/30">
            <Head title={snippet.title || 'Terminal Output'} />

            <main className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <Link 
                        href={route('terminal-converter.index')} 
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg border border-gray-800 w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Converter
                    </Link>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleCopy}
                            className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white flex items-center gap-2 transition-colors text-sm font-medium"
                            title="Copy Raw Output"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied!' : 'Copy Markdown'}
                        </button>
                        
                        <button 
                            onClick={handleDelete}
                            disabled={processing}
                            className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors shadow-sm text-sm font-medium disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                </div>

                {/* Title */}
                <div className="mb-10">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center shadow-lg shadow-slate-500/20 shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                            {snippet.title || 'Untitled Terminal Archive'}
                        </h1>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-2 ml-14">
                        Saved on {new Date(snippet.created_at).toLocaleDateString(undefined, {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })}
                    </p>
                </div>

                {/* Content */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-8 md:p-12 overflow-x-auto">
                        <article className="prose prose-invert prose-slate prose-lg max-w-none 
                            prose-p:leading-relaxed prose-p:mb-6 
                            prose-headings:mt-12 prose-headings:mb-6 prose-headings:font-bold 
                            prose-h1:text-4xl prose-h1:text-white
                            prose-h2:text-3xl prose-h2:text-[#00D8FF] prose-h2:border-b prose-h2:border-gray-800 prose-h2:pb-4
                            prose-h3:text-2xl prose-h3:text-blue-400 
                            prose-a:text-[#00D8FF] prose-a:decoration-gray-700 hover:prose-a:decoration-[#00D8FF] hover:prose-a:text-white prose-a:transition-all
                            prose-strong:text-white prose-strong:font-semibold
                            prose-code:text-[#00D8FF] prose-code:bg-gray-800/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                            prose-pre:bg-[#0B0A0F] prose-pre:border prose-pre:border-gray-700 prose-pre:shadow-lg prose-pre:rounded-xl prose-pre:my-8 prose-pre:p-6
                            [&_pre_code]:bg-transparent [&_pre_code]:text-gray-300 [&_pre_code]:p-0 [&_pre_code]:font-mono [&_pre_code]:text-sm
                            prose-blockquote:border-l-[#00D8FF] prose-blockquote:bg-gray-800/30 prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-gray-300
                            prose-ul:my-6 prose-li:my-2
                            prose-table:border-collapse prose-th:border-b prose-th:border-gray-700 prose-th:p-4 prose-td:border-b prose-td:border-gray-800 prose-td:p-4
                            prose-hr:border-gray-800 prose-hr:my-10
                            prose-img:inline-block prose-img:my-0
                            [&_p[align=center]]:flex [&_p[align=center]]:flex-wrap [&_p[align=center]]:justify-center [&_p[align=center]]:gap-2"
                        >
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]} 
                                rehypePlugins={[rehypeRaw]}
                            >
                                {displayContent}
                            </ReactMarkdown>
                        </article>
                    </div>
                </div>
            </main>
        </div>
    );
}
