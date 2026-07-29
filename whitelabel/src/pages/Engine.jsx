import { useEffect, useMemo, useState } from 'react';
import { Copy, Check, Save, Trash2, Wand2, Star } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import TutorialButton from '@/components/TutorialButton';
import Field from '@/components/Field';
import { findEngine, buildPrompt, ACCENT, MULTI_FILE_OUTPUT } from '@/studioEngines';
import { listProjects, saveProject, deleteProject } from '@/lib/projects';

// Claude first: it's the priority AI for this prompt style.
const AI_TARGETS = [
    { name: 'Claude', url: 'https://claude.ai/new' },
    { name: 'ChatGPT', url: 'https://chatgpt.com/' },
    { name: 'Gemini', url: 'https://gemini.google.com/app' },
    { name: 'v0', url: 'https://v0.dev' },
    { name: 'Lovable', url: 'https://lovable.dev' },
];

function timeAgo(dateString) {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return 'baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
}

export default function Engine({ slug }) {
    const engine = findEngine(slug);
    const accent = ACCENT[engine.accent];

    const initialValues = useMemo(
        () => Object.fromEntries(engine.fields.map((f) => [f.name, ''])),
        [engine],
    );

    const [values, setValues] = useState(initialValues);
    const [copied, setCopied] = useState(false);
    const [recentProjects, setRecentProjects] = useState(() => listProjects(engine.slug));

    useEffect(() => {
        document.title = engine.name;
    }, [engine]);

    const prompt = useMemo(() => buildPrompt(engine, values), [engine, values]);
    const hasInput = Object.values(values).some((v) => String(v).trim() !== '');

    const setValue = (name, val) => setValues((prev) => ({ ...prev, [name]: val }));

    // Auto-switch the output format to multi-file when the user lists pages,
    // and revert to the default when they clear it again.
    useEffect(() => {
        const hasPages = (values.pages || '').split(/[\n,]/).some((s) => s.trim() !== '');
        setValues((prev) => {
            if (hasPages && prev.output !== MULTI_FILE_OUTPUT) {
                return { ...prev, output: MULTI_FILE_OUTPUT };
            }
            if (!hasPages && prev.output === MULTI_FILE_OUTPUT) {
                return { ...prev, output: '' };
            }
            return prev;
        });
    }, [values.pages]);

    const copyPrompt = () => {
        navigator.clipboard?.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    const save = () => {
        const title = values.brand || values.name || values.hosts || engine.name;
        saveProject({ engine: engine.slug, title, brief: values, prompt });
        setRecentProjects(listProjects(engine.slug));
    };

    const remove = (id) => {
        deleteProject(id);
        setRecentProjects(listProjects(engine.slug));
    };

    return (
        <AppLayout active={engine.slug}>
            <div className="mb-8 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent.bg}`}>
                        <engine.icon className={`h-6 w-6 ${accent.text}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-[#18181B] dark:text-white">{engine.name}</h1>
                            <span className="font-mono text-xs text-[#9CA3AF] dark:text-[#555]">{engine.code}</span>
                            {engine.star && <Star className="h-4 w-4 fill-amber-500 text-amber-500" />}
                        </div>
                        <p className="text-sm text-[#71717A] dark:text-[#888]">{engine.tagline}</p>
                    </div>
                </div>

                <TutorialButton />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Form */}
                <div className="space-y-4 rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-[#8A8A93] dark:text-[#666]">Brief</h2>
                    {engine.fields.map((field) => (
                        <Field key={field.name} field={field} value={values[field.name] || ''} onChange={(val) => setValue(field.name, val)} />
                    ))}
                </div>

                {/* Prompt output */}
                <div className="lg:sticky lg:top-6 lg:self-start">
                    <div className="rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-[#FAFAFA] dark:bg-[#0D0D0D]">
                        <div className="flex items-center justify-between border-b border-[#E4E4E7] dark:border-[#222] px-5 py-3">
                            <span className="flex items-center gap-2 text-sm font-medium text-[#18181B] dark:text-white">
                                <Wand2 className="h-4 w-4 text-brand-600 dark:text-brand-400" /> Prompt siap-pakai
                            </span>
                            <button
                                type="button"
                                onClick={copyPrompt}
                                className="inline-flex items-center gap-1.5 rounded-md bg-brand-400 px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-brand-300"
                            >
                                {copied ? <><Check className="h-3.5 w-3.5" /> Tersalin</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                            </button>
                        </div>
                        <pre className="max-h-[52vh] overflow-auto whitespace-pre-wrap p-5 font-mono text-[12px] leading-relaxed text-[#3F3F46] dark:text-[#C8C8C8]">
                            {prompt}
                        </pre>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E4E4E7] dark:border-[#222] px-5 py-3">
                            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-[#8A8A93] dark:text-[#666]">
                                <span>Paste ke</span>
                                {AI_TARGETS.map((ai, i) => (
                                    <span key={ai.name} className="flex items-center gap-1.5">
                                        <a
                                            href={ai.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-brand-600 underline decoration-dotted underline-offset-2 transition-colors hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300"
                                        >
                                            {ai.name}
                                        </a>
                                        {i < AI_TARGETS.length - 1 && <span>·</span>}
                                    </span>
                                ))}
                            </p>
                            <button
                                type="button"
                                onClick={save}
                                disabled={!hasInput}
                                className="inline-flex items-center gap-1.5 rounded-md border border-[#D4D4D8] dark:border-[#333] px-3 py-1.5 text-xs font-medium text-[#27272A] dark:text-[#EDEDED] transition-colors hover:border-[#A1A1AA] dark:hover:border-[#555] hover:bg-[#EFEFF1] dark:hover:bg-[#161616] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Save className="h-3.5 w-3.5" /> Simpan project
                            </button>
                        </div>
                    </div>

                    {/* Saved projects for this engine (stored in this browser only) */}
                    {recentProjects.length > 0 && (
                        <div className="mt-6">
                            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#8A8A93] dark:text-[#666]">Tersimpan</h2>
                            <div className="space-y-2">
                                {recentProjects.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] px-4 py-3">
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-medium text-[#18181B] dark:text-white">{p.title}</div>
                                            <div className="text-xs text-[#8A8A93] dark:text-[#666]">{timeAgo(p.created_at)}</div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => { navigator.clipboard?.writeText(p.prompt); }}
                                                className="rounded-md p-2 text-[#71717A] dark:text-[#888] transition-colors hover:bg-[#E8E8EB] dark:hover:bg-[#1A1A1A] hover:text-[#18181B] dark:hover:text-white"
                                                title="Salin prompt"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => remove(p.id)}
                                                className="rounded-md p-2 text-[#71717A] dark:text-[#888] transition-colors hover:bg-red-500/10 hover:text-red-400"
                                                title="Hapus"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
