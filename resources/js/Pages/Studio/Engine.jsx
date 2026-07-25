import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Copy, Check, Save, Trash2, Wand2 } from 'lucide-react';
import StudioLayout from '@/Layouts/StudioLayout';
import { findEngine, buildPrompt, ACCENT } from '@/studioEngines';

function Field({ field, value, onChange }) {
    const base = 'w-full rounded-lg border border-[#E4E4E7] dark:border-[#222] bg-[#FAFAFA] dark:bg-[#0D0D0D] px-3 py-2 text-sm text-[#27272A] dark:text-[#EDEDED] placeholder-[#9CA3AF] dark:placeholder-[#555] focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/30';

    return (
        <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[#3F3F46] dark:text-[#D4D4D8]">
                {field.label}
                {field.required && <span className="text-emerald-600 dark:text-emerald-400">*</span>}
            </span>

            {field.type === 'textarea' && (
                <textarea rows={3} className={base} placeholder={field.placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
            )}
            {field.type === 'lines' && (
                <textarea rows={4} className={`${base} font-mono text-xs`} placeholder={field.placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
            )}
            {field.type === 'select' && (
                <select className={base} value={value} onChange={(e) => onChange(e.target.value)}>
                    <option value="">Pilih salah satu</option>
                    {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            )}
            {(field.type === 'text' || field.type === 'tags') && (
                <input type="text" className={base} placeholder={field.placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
            )}

            {field.hint && <span className="mt-1 block text-xs text-[#8A8A93] dark:text-[#666]">{field.hint}</span>}
        </label>
    );
}

function timeAgo(dateString) {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return 'baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
}

export default function Engine() {
    const { engine: slug, recentProjects } = usePage().props;
    const engine = findEngine(slug);
    const accent = ACCENT[engine.accent];

    const initialValues = useMemo(
        () => Object.fromEntries(engine.fields.map((f) => [f.name, ''])),
        [engine],
    );

    const [values, setValues] = useState(initialValues);
    const [copied, setCopied] = useState(false);

    const prompt = useMemo(() => buildPrompt(engine, values), [engine, values]);
    const hasInput = Object.values(values).some((v) => String(v).trim() !== '');

    const setValue = (name, val) => setValues((prev) => ({ ...prev, [name]: val }));

    const copyPrompt = () => {
        navigator.clipboard?.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    const form = useForm({});

    const save = () => {
        const title = values.brand || values.name || values.hosts || engine.name;
        router.post(route('studio.projects.store'), {
            engine: engine.slug,
            title,
            brief: values,
            prompt,
        }, { preserveScroll: true });
    };

    const remove = (id) => {
        router.delete(route('studio.projects.destroy', { project: id }), { preserveScroll: true });
    };

    return (
        <StudioLayout>
            <Head title={`${engine.name} Studio`} />

            <div className="mb-8 flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent.bg}`}>
                    <engine.icon className={`h-6 w-6 ${accent.text}`} />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-[#18181B] dark:text-white">{engine.name}</h1>
                        <span className="font-mono text-xs text-[#9CA3AF] dark:text-[#555]">{engine.code}</span>
                        {engine.star && <span className="text-amber-400">★</span>}
                    </div>
                    <p className="text-sm text-[#71717A] dark:text-[#888]">{engine.tagline}</p>
                </div>
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
                                <Wand2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Prompt siap-pakai
                            </span>
                            <button
                                type="button"
                                onClick={copyPrompt}
                                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-emerald-300"
                            >
                                {copied ? <><Check className="h-3.5 w-3.5" /> Tersalin</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                            </button>
                        </div>
                        <pre className="max-h-[52vh] overflow-auto whitespace-pre-wrap p-5 font-mono text-[12px] leading-relaxed text-[#3F3F46] dark:text-[#C8C8C8]">
                            {prompt}
                        </pre>
                        <div className="flex items-center justify-between gap-3 border-t border-[#E4E4E7] dark:border-[#222] px-5 py-3">
                            <p className="text-xs text-[#8A8A93] dark:text-[#666]">Paste ke ChatGPT · Claude · Gemini · v0 · Lovable</p>
                            <button
                                type="button"
                                onClick={save}
                                disabled={!hasInput || form.processing}
                                className="inline-flex items-center gap-1.5 rounded-md border border-[#D4D4D8] dark:border-[#333] px-3 py-1.5 text-xs font-medium text-[#27272A] dark:text-[#EDEDED] transition-colors hover:border-[#A1A1AA] dark:hover:border-[#555] hover:bg-[#EFEFF1] dark:hover:bg-[#161616] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Save className="h-3.5 w-3.5" /> Simpan project
                            </button>
                        </div>
                    </div>

                    {/* Saved projects for this engine */}
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
                                                title="Copy prompt"
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
        </StudioLayout>
    );
}
