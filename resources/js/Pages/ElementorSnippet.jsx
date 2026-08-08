import { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import HelpModal from '@/Components/HelpModal';
import AboutModal from '@/Components/AboutModal';

const WRAPPER_CLASS = 'kl-snippet';

/* ------------------------------------------------------------------ utils --- */

/**
 * Prefix a single comma-separated selector group with the scope selector so the
 * pasted CSS can't leak out and restyle the rest of the Elementor page.
 */
function prefixSelectors(selectorGroup, scope) {
    return selectorGroup
        .split(',')
        .map((raw) => {
            const s = raw.trim();
            if (!s) {
                return '';
            }
            // Root-level selectors become the scope container itself.
            if (/^(html|body|:root)$/i.test(s)) {
                return scope;
            }
            // Strip a leading html/body qualifier, then nest under the scope.
            const stripped = s.replace(/^\s*(html|body)\b\s*/i, '');
            if (stripped === '') {
                return scope;
            }
            return `${scope} ${stripped}`;
        })
        .filter(Boolean)
        .join(', ');
}

/**
 * Walk a CSS string and prefix ordinary rules with the scope selector while
 * leaving at-rules (@keyframes, @font-face, @media inner-rules, …) intact.
 */
function scopeCssString(css, scope) {
    let out = '';
    let i = 0;
    const n = css.length;

    while (i < n) {
        let head = '';

        while (i < n && css[i] !== '{' && css[i] !== '}') {
            if (css[i] === ';') {
                // Statement at-rule, e.g. @import / @charset.
                head += css[i];
                i += 1;
                out += head;
                head = null;
                break;
            }
            head += css[i];
            i += 1;
        }

        if (head === null) {
            continue;
        }

        if (i >= n) {
            out += head;
            break;
        }

        if (css[i] === '}') {
            out += head;
            i += 1;
            continue;
        }

        // css[i] === '{' — read the matching balanced body.
        i += 1;
        let depth = 1;
        let body = '';
        while (i < n && depth > 0) {
            if (css[i] === '{') {
                depth += 1;
            } else if (css[i] === '}') {
                depth -= 1;
                if (depth === 0) {
                    break;
                }
            }
            body += css[i];
            i += 1;
        }
        i += 1; // skip the closing brace

        const selector = head.trim();

        if (/^@(media|supports|container|layer|scope)/i.test(selector)) {
            out += `${selector}{${scopeCssString(body, scope)}}`;
        } else if (selector.startsWith('@')) {
            // @keyframes, @font-face, @page, @property, … — keep the body as-is.
            out += `${selector}{${body}}`;
        } else {
            out += `${prefixSelectors(selector, scope)}{${body}}`;
        }
    }

    return out;
}

function compactCss(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s*([{}:;,])\s*/g, '$1')
        .replace(/;}/g, '}')
        .trim();
}

/** Collapse HTML whitespace without touching script/pre/textarea contents. */
function minifyHtml(html) {
    const stash = [];
    const keep = (re) => {
        html = html.replace(re, (m) => {
            stash.push(m);
            return `@@KL${stash.length - 1}KL@@`;
        });
    };
    keep(/<script[\s\S]*?<\/script>/gi);
    keep(/<pre[\s\S]*?<\/pre>/gi);
    keep(/<textarea[\s\S]*?<\/textarea>/gi);

    html = html
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/>\s+</g, '><')
        .replace(/\s{2,}/g, ' ')
        .trim();

    return html.replace(/@@KL(\d+)KL@@/g, (_, idx) => stash[Number(idx)]);
}

/**
 * Turn a full HTML document into an Elementor-friendly snippet: strip the
 * <!DOCTYPE>/<html>/<head>/<body> wrappers, hoist head-level styles, links and
 * scripts (so Tailwind/CDN keeps working), optionally scope the CSS, and
 * optionally minify the result.
 *
 * @return {{ output: string, stats: object }}
 */
function convertHtml(raw, { scope, minify }) {
    const empty = { output: '', stats: { styles: 0, scripts: 0, links: 0, tailwind: false, wrappers: false } };
    if (!raw.trim()) {
        return empty;
    }

    const doc = new DOMParser().parseFromString(raw, 'text/html');
    const head = doc.head;
    const body = doc.body;

    const wrappers = /<\s*(html|body|head|!doctype)/i.test(raw);

    // 1. Gather every <style> (head + body), then drop them from the tree so the
    //    body markup we read back doesn't duplicate them.
    const styleEls = Array.from(doc.querySelectorAll('style'));
    let css = styleEls.map((el) => el.textContent || '').join('\n\n').trim();
    styleEls.forEach((el) => el.remove());

    // 2. Head-level stylesheet <link>s and <script>s need to be carried over —
    //    body-level scripts stay in place inside the body markup.
    const links = Array.from(head.querySelectorAll('link[rel="stylesheet"]')).map((el) => el.outerHTML);
    const headScripts = Array.from(head.querySelectorAll('script')).map((el) => el.outerHTML);
    const tailwind = /cdn\.tailwindcss\.com|tailwindcss/i.test(raw);

    // 3. What's left in <body> is the actual content (with its own scripts).
    let bodyHtml = (body.innerHTML || '').trim();

    if (scope && css) {
        css = scopeCssString(css, `.${WRAPPER_CLASS}`);
    }
    if (minify && css) {
        css = compactCss(css);
    }

    const parts = [];
    links.forEach((l) => parts.push(l));
    headScripts.forEach((s) => parts.push(s));
    if (css) {
        parts.push(minify ? `<style>${css}</style>` : `<style>\n${css}\n</style>`);
    }
    if (bodyHtml) {
        parts.push(bodyHtml);
    }

    let inner = parts.join('\n\n');

    let output = scope ? `<div class="${WRAPPER_CLASS}">\n${inner}\n</div>` : inner;

    if (minify) {
        output = minifyHtml(output);
    }

    return {
        output,
        stats: {
            styles: styleEls.length,
            scripts: headScripts.length,
            links: links.length,
            tailwind,
            wrappers,
        },
    };
}

/* ------------------------------------------------------------------- page --- */

const SAMPLE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Section</title>
    <style>
        body { background: #0f172a; font-family: sans-serif; }
        .card { padding: 24px; border-radius: 16px; background: #1e293b; color: #fff; }
        .card h2 { color: #38bdf8; }
    </style>
</head>
<body>
    <div class="card">
        <h2>Hello Elementor</h2>
        <p>This whole file becomes a paste-ready snippet.</p>
    </div>
</body>
</html>`;

export default function ElementorSnippet() {
    const [input, setInput] = useState('');
    const [scope, setScope] = useState(true);
    const [minify, setMinify] = useState(true);
    const [copied, setCopied] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

    const { output, stats } = useMemo(
        () => convertHtml(input, { scope, minify }),
        [input, scope, minify],
    );

    const copyOutput = () => {
        if (!output) {
            return;
        }
        navigator.clipboard?.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    const toggleClasses = (active) =>
        `flex-1 cursor-pointer rounded-lg border px-4 py-3 text-left transition-colors ${
            active
                ? 'border-teal-500/50 bg-teal-500/10'
                : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
        }`;

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-teal-500/30">
            <Head title="HTML Snippet Converter" />

            <main className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
                {/* Header */}
                <div className="mb-10">
                    <div className="mb-8 flex items-center justify-between border-b border-gray-800 pb-4">
                        <Link href="/ai-tools" className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Collection
                        </Link>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowAbout(true)}
                                className="flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-500/20 hover:text-blue-300"
                                title="What is this?"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                What is this?
                            </button>
                            <button
                                onClick={() => setShowHelp(true)}
                                className="flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-sm font-semibold text-teal-400 transition-colors hover:bg-teal-500/20 hover:text-teal-300"
                                title="How to use this tool"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                How to use
                            </button>
                        </div>
                    </div>

                    <div className="mx-auto max-w-3xl text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
                            HTML{' '}
                            <span className="bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
                                Snippet Converter
                            </span>
                        </h1>
                        <p className="mt-4 text-lg text-gray-400">
                            Paste any full HTML file and get a clean, self-contained snippet that drops into Elementor&apos;s HTML widget without errors. Nothing leaves your browser.
                        </p>
                    </div>
                </div>

                <HelpModal
                    show={showHelp}
                    onClose={() => setShowHelp(false)}
                    title="HTML Snippet Converter"
                    steps={[
                        { title: 'Paste your HTML', description: 'Drop in a full HTML file — <!DOCTYPE>, <html>, <head>, <body> and all. Fragments work too.' },
                        { title: 'Pick your options', description: 'Scope CSS keeps the pasted styles from leaking into your theme. Minify compresses everything into one compact block. Tailwind/CDN scripts are carried over automatically.' },
                        { title: 'Copy & paste into Elementor', description: 'Hit Copy, then paste straight into an Elementor HTML widget. The snippet is self-contained, so it renders without missing-file errors.' },
                    ]}
                />

                <AboutModal
                    show={showAbout}
                    onClose={() => setShowAbout(false)}
                    title="HTML Snippet Converter"
                    description="Turns a complete HTML document into a paste-ready snippet for Elementor's HTML widget (or any embed box). It strips the document wrappers, moves head styles/scripts inline, optionally scopes the CSS so it can't restyle your whole page, keeps Tailwind/CDN scripts working, and can minify the output into a single clean block. Runs entirely in your browser — your code is never uploaded."
                    category="Code & Data Lifesavers"
                />

                {/* Options */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={() => setScope((v) => !v)} className={toggleClasses(scope)}>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-white">Scope the CSS</span>
                            <span className={`text-xs font-bold ${scope ? 'text-teal-400' : 'text-gray-600'}`}>{scope ? 'ON' : 'OFF'}</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Wrap everything in a container so styles can&apos;t clash with your theme.</p>
                    </button>
                    <button type="button" onClick={() => setMinify((v) => !v)} className={toggleClasses(minify)}>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-white">Minify to one block</span>
                            <span className={`text-xs font-bold ${minify ? 'text-teal-400' : 'text-gray-600'}`}>{minify ? 'ON' : 'OFF'}</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Compress the output into a single compact, copy-friendly block.</p>
                    </button>
                </div>

                {/* Editor grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Input */}
                    <div className="flex flex-col rounded-2xl border border-gray-800 bg-gray-900/40">
                        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
                            <span className="text-sm font-semibold text-gray-300">Paste your HTML file</span>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setInput(SAMPLE)} className="text-xs font-medium text-teal-400 hover:text-teal-300">
                                    Load sample
                                </button>
                                {input && (
                                    <button onClick={() => setInput('')} className="text-xs font-medium text-gray-500 hover:text-gray-300">
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            spellCheck={false}
                            placeholder="<!DOCTYPE html>&#10;<html>&#10;  ...&#10;</html>"
                            className="h-[460px] w-full resize-none rounded-b-2xl bg-transparent p-4 font-mono text-sm text-gray-200 placeholder-gray-600 focus:outline-none"
                        />
                    </div>

                    {/* Output */}
                    <div className="flex flex-col rounded-2xl border border-gray-800 bg-gray-900/40">
                        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
                            <span className="text-sm font-semibold text-gray-300">Elementor-ready snippet</span>
                            <button
                                onClick={copyOutput}
                                disabled={!output}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                    output
                                        ? 'bg-teal-500/15 text-teal-300 hover:bg-teal-500/25'
                                        : 'cursor-not-allowed bg-gray-800 text-gray-600'
                                }`}
                            >
                                {copied ? (
                                    <>
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                        <textarea
                            value={output}
                            readOnly
                            spellCheck={false}
                            placeholder="Your converted snippet will appear here…"
                            className="h-[460px] w-full resize-none rounded-b-2xl bg-transparent p-4 font-mono text-sm text-gray-200 placeholder-gray-600 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Result summary */}
                {output && (
                    <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                        {stats.wrappers && (
                            <span className="rounded-full bg-gray-800 px-3 py-1 text-gray-300">Document wrappers stripped</span>
                        )}
                        <span className="rounded-full bg-gray-800 px-3 py-1 text-gray-300">
                            {stats.styles} style block{stats.styles === 1 ? '' : 's'} inlined
                        </span>
                        {stats.links > 0 && (
                            <span className="rounded-full bg-gray-800 px-3 py-1 text-gray-300">{stats.links} stylesheet link{stats.links === 1 ? '' : 's'} kept</span>
                        )}
                        {stats.scripts > 0 && (
                            <span className="rounded-full bg-gray-800 px-3 py-1 text-gray-300">{stats.scripts} head script{stats.scripts === 1 ? '' : 's'} carried over</span>
                        )}
                        {stats.tailwind && (
                            <span className="rounded-full bg-teal-500/15 px-3 py-1 font-semibold text-teal-300">Tailwind CDN detected &amp; preserved</span>
                        )}
                        {scope && (
                            <span className="rounded-full bg-teal-500/15 px-3 py-1 font-semibold text-teal-300">CSS scoped to .{WRAPPER_CLASS}</span>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
