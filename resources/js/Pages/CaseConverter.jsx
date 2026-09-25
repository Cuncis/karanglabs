import { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import HelpModal from '@/Components/HelpModal';
import AboutModal from '@/Components/AboutModal';

/* ------------------------------------------------------------------ utils --- */

function toSentenceCase(text) {
    return text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase());
}

function toLower(text) {
    return text.toLowerCase();
}

function toUpper(text) {
    return text.toUpperCase();
}

function toCapitalizedCase(text) {
    return text.replace(/\S+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

/** Alternates upper/lower per letter, restarting at the start of each word. */
function alternateWithinWords(text, startUpper) {
    return text.replace(/\S+/g, (word) => {
        let out = '';
        for (let i = 0; i < word.length; i++) {
            const upper = startUpper ? i % 2 === 0 : i % 2 === 1;
            out += upper ? word[i].toUpperCase() : word[i].toLowerCase();
        }
        return out;
    });
}

const MINOR_WORDS = new Set([
    'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor',
    'of', 'off', 'on', 'or', 'per', 'so', 'the', 'to', 'up', 'via', 'yet',
]);

// Indonesian "kata tugas" (prepositions/conjunctions) that PUEBI/EYD keeps
// lowercase in a title, unless the word opens the title.
const KBBI_MINOR_WORDS = new Set([
    'di', 'ke', 'dari', 'dan', 'yang', 'untuk', 'pada', 'dengan', 'dalam', 'oleh',
    'atau', 'tetapi', 'namun', 'serta', 'karena', 'sebab', 'jika', 'kalau', 'agar', 'supaya',
    'bagi', 'kepada', 'terhadap', 'hingga', 'sampai', 'sejak', 'antara', 'seperti', 'akan', 'tanpa',
    'adalah', 'ialah', 'meskipun', 'walaupun', 'sehingga',
]);

/** Capitalizes every word except those in `minorWords`, which stay lowercase
 * unless they open the text (and, for English title case, also unless they
 * close it — PUEBI's Indonesian rule only exempts the opening word). */
function applyMinorWordCapitalization(text, minorWords, exemptLast) {
    const tokens = text.split(/(\s+)/);
    const wordTokenIndexes = tokens.reduce((acc, t, i) => (t.trim() !== '' ? [...acc, i] : acc), []);
    const firstIdx = wordTokenIndexes[0];
    const lastIdx = wordTokenIndexes[wordTokenIndexes.length - 1];

    return tokens
        .map((token, i) => {
            if (token.trim() === '') {
                return token;
            }
            const lower = token.toLowerCase();
            const bare = lower.replace(/[^a-z]/g, '');
            const isEdge = i === firstIdx || (exemptLast && i === lastIdx);
            if (!isEdge && minorWords.has(bare)) {
                return lower;
            }
            return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join('');
}

function toTitleCase(text) {
    return applyMinorWordCapitalization(text, MINOR_WORDS, true);
}

function toKbbiCase(text) {
    return applyMinorWordCapitalization(text, KBBI_MINOR_WORDS, false);
}

const CASE_OPTIONS = [
    { code: 'Sc', demo: 'Sentence case', transform: toSentenceCase, badge: 'bg-indigo-500/15 text-indigo-300' },
    { code: 'lc', demo: 'lower case', transform: toLower, badge: 'bg-cyan-500/15 text-cyan-300' },
    { code: 'UC', demo: 'UPPER CASE', transform: toUpper, badge: 'bg-rose-500/15 text-rose-300' },
    { code: 'CC', demo: 'Capitalized Case', transform: toCapitalizedCase, badge: 'bg-amber-500/15 text-amber-300' },
    { code: 'aC', demo: 'aLtErNaTiNg cAsE', transform: (t) => alternateWithinWords(t, false), badge: 'bg-emerald-500/15 text-emerald-300' },
    { code: 'TC', demo: 'Title Case', transform: toTitleCase, badge: 'bg-blue-500/15 text-blue-300' },
    { code: 'iC', demo: 'InVeRsE CaSe', transform: (t) => alternateWithinWords(t, true), badge: 'bg-fuchsia-500/15 text-fuchsia-300' },
    { code: 'KC', demo: 'Aturan dan Tata Cara', transform: toKbbiCase, badge: 'bg-sky-500/15 text-sky-300' },
];

const SAMPLE = 'the quick brown fox jumps over the lazy dog. it was a bright cold day in April.';

/* ----------------------------------------------------------------- page --- */

export default function CaseConverter() {
    const [input, setInput] = useState('');
    const [activeCode, setActiveCode] = useState('Sc');
    const [copied, setCopied] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

    const activeOption = CASE_OPTIONS.find((o) => o.code === activeCode);
    const output = useMemo(() => (input ? activeOption.transform(input) : ''), [input, activeOption]);

    const copyOutput = () => {
        if (!output) {
            return;
        }
        navigator.clipboard?.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-purple-500/30">
            <Head title="Case Converter" />

            <main className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
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
                                className="flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-400 transition-colors hover:bg-purple-500/20 hover:text-purple-300"
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
                            Case{' '}
                            <span className="bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent">
                                Converter
                            </span>
                        </h1>
                        <p className="mt-4 text-lg text-gray-400">
                            Paste your text, pick a case style, copy the result. Nothing leaves your browser.
                        </p>
                    </div>
                </div>

                <HelpModal
                    show={showHelp}
                    onClose={() => setShowHelp(false)}
                    title="Case Converter"
                    steps={[
                        { title: 'Paste or type your text', description: 'Drop in anything: a sentence, a paragraph, a title.' },
                        { title: 'Pick a case style', description: 'Sentence case, lower case, UPPER CASE, Capitalized Case, aLtErNaTiNg cAsE, Title Case, InVeRsE CaSe, or KBBI Case (Indonesian title rules).' },
                        { title: 'Copy the result', description: 'Hit the copy icon next to the output to grab it instantly.' },
                    ]}
                />

                <AboutModal
                    show={showAbout}
                    onClose={() => setShowAbout(false)}
                    title="Case Converter"
                    description="Converts text between eight case styles: Sentence case, lower case, UPPER CASE, Capitalized Case, aLtErNaTiNg cAsE, Title Case (English minor-word rules), InVeRsE CaSe, and KBBI Case (capitalizes per PUEBI/EYD's Indonesian title rules: kata tugas like di, ke, dari, dan, yang, untuk stay lowercase unless they open the sentence). Runs entirely in your browser, your text is never sent anywhere."
                    category="Daily Productivity"
                />

                {/* Input */}
                <div className="flex flex-col rounded-2xl border border-gray-800 bg-gray-900/40">
                    <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
                        <span className="text-sm font-semibold text-gray-300">Your text</span>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setInput(SAMPLE)} className="text-xs font-medium text-purple-400 hover:text-purple-300">
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
                        placeholder="Paste or type your text here…"
                        className="h-40 w-full resize-none rounded-b-2xl bg-transparent p-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none"
                    />
                </div>

                {/* Case options */}
                <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {CASE_OPTIONS.map((option) => (
                        <button
                            key={option.code}
                            type="button"
                            onClick={() => setActiveCode(option.code)}
                            className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left transition-colors ${
                                activeCode === option.code
                                    ? 'border-purple-500/50 bg-purple-500/10'
                                    : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
                            }`}
                        >
                            <span className={`flex h-7 w-9 flex-shrink-0 items-center justify-center rounded-md text-xs font-bold ${option.badge}`}>
                                {option.code}
                            </span>
                            <span className="text-sm font-medium text-white">{option.demo}</span>
                        </button>
                    ))}
                </div>

                {/* Output */}
                <div className="mt-5 flex flex-col rounded-2xl border border-gray-800 bg-gray-900/40">
                    <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
                        <span className="text-sm font-semibold text-gray-300">Result</span>
                        <button
                            onClick={copyOutput}
                            disabled={!output}
                            title="Copy"
                            className={`flex items-center justify-center rounded-lg p-1.5 transition-colors ${
                                output
                                    ? 'bg-purple-500/15 text-purple-300 hover:bg-purple-500/25'
                                    : 'cursor-not-allowed bg-gray-800 text-gray-600'
                            }`}
                        >
                            {copied ? (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            )}
                        </button>
                    </div>
                    <textarea
                        value={output}
                        readOnly
                        spellCheck={false}
                        placeholder="Your converted text will appear here…"
                        className="h-40 w-full resize-none rounded-b-2xl bg-transparent p-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none"
                    />
                </div>
            </main>
        </div>
    );
}
