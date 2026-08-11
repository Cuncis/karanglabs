import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownOutput({ content, color = '#8B5CF6' }) {
    const [mode, setMode] = useState('rendered');

    if (!content) {
        return null;
    }

    return (
        <div>
            <div className="flex items-center gap-1 mb-3 bg-gray-950 border border-gray-800 rounded-lg p-1 w-fit">
                <button
                    type="button"
                    onClick={() => setMode('rendered')}
                    className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                        mode === 'rendered' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                    style={mode === 'rendered' ? { backgroundColor: color } : {}}
                >
                    Rendered
                </button>
                <button
                    type="button"
                    onClick={() => setMode('raw')}
                    className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                        mode === 'raw' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                    style={mode === 'raw' ? { backgroundColor: color } : {}}
                >
                    Raw
                </button>
            </div>

            {mode === 'rendered' ? (
                <div className="bg-gray-950 border border-gray-800 rounded-xl p-5">
                    <article
                        className="prose prose-invert prose-sm md:prose-base max-w-none
                            prose-headings:text-white prose-a:text-current prose-strong:text-white
                            prose-code:text-inherit prose-code:bg-gray-800/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                            prose-pre:bg-black/50 prose-pre:border prose-pre:border-gray-800
                            prose-blockquote:border-gray-700 prose-blockquote:text-gray-400
                            prose-hr:border-gray-800 prose-li:marker:text-gray-500
                            prose-table:text-sm prose-th:border-b prose-th:border-gray-700 prose-td:border-b prose-td:border-gray-800"
                    >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                    </article>
                </div>
            ) : (
                <div className="bg-black/50 border border-gray-800 rounded-xl p-5 overflow-x-auto">
                    <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">{content}</pre>
                </div>
            )}
        </div>
    );
}
