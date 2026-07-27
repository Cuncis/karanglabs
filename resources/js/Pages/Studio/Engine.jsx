import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Copy, Check, Save, Trash2, Wand2, Palette, X as XIcon, Star, Plus, Shuffle, Clock } from 'lucide-react';
import StudioLayout from '@/Layouts/StudioLayout';
import { findEngine, buildPrompt, fieldSchema, ACCENT, MULTI_FILE_OUTPUT } from '@/studioEngines';

// Matches the `studio-random-brief` rate limiter in AppServiceProvider (1 per 2 min/user).
const RANDOM_BRIEF_COOLDOWN_SECONDS = 120;

const INPUT_BASE = 'w-full rounded-lg border border-[#E4E4E7] dark:border-[#222] bg-[#FAFAFA] dark:bg-[#0D0D0D] px-3 py-2 text-sm text-[#27272A] dark:text-[#EDEDED] placeholder-[#9CA3AF] dark:placeholder-[#555] focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/30';

const COLOR_PRESETS = [
    '#0F172A', '#334155', '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#22C55E', '#10B981',
    '#14B8A6', '#0EA5E9', '#6366F1', '#8B5CF6', '#EC4899', '#8B5E3C', '#F5F5DC', '#FFFFFF',
];

function FieldTitle({ field }) {
    return (
        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[#3F3F46] dark:text-[#D4D4D8]">
            {field.label}
            {field.required && <span className="text-emerald-600 dark:text-emerald-400">*</span>}
        </span>
    );
}

function FieldHint({ field }) {
    if (!field.hint) {
        return null;
    }

    return <span className="mt-1 block text-xs text-[#8A8A93] dark:text-[#666]">{field.hint}</span>;
}

function ColorPaletteField({ field, value, onChange }) {
    const [open, setOpen] = useState(false);
    const [picked, setPicked] = useState('#10B981');
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);

        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const addColor = (hex) => {
        const current = (value || '').trim();
        const existing = current.split(/[,\n]/).map((s) => s.trim().toLowerCase());
        if (!existing.includes(hex.toLowerCase())) {
            onChange(current ? `${current}, ${hex}` : hex);
        }
        setOpen(false);
    };

    const swatches = (value || '').match(/#[0-9a-fA-F]{3,8}/g) || [];

    return (
        <div ref={ref} className="relative">
            <FieldTitle field={field} />

            <div className="flex gap-2">
                <input type="text" className={INPUT_BASE} placeholder={field.placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    title="Pilih kode warna"
                    className="flex flex-shrink-0 items-center justify-center rounded-lg border border-[#E4E4E7] dark:border-[#222] bg-[#FAFAFA] dark:bg-[#0D0D0D] px-3 text-[#52525B] dark:text-[#A1A1AA] transition-colors hover:border-[#C4C4C8] dark:hover:border-[#3a3a3a] hover:text-[#18181B] dark:hover:text-white"
                >
                    <Palette className="h-4 w-4" />
                </button>
            </div>

            {swatches.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {swatches.map((hex, i) => (
                        <span key={`${hex}-${i}`} className="h-5 w-5 rounded-full border border-black/10 dark:border-white/15" style={{ backgroundColor: hex }} title={hex} />
                    ))}
                </div>
            )}

            {open && (
                <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-3 shadow-xl">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#3F3F46] dark:text-[#D4D4D8]">Pilih kode warna</span>
                        <button type="button" onClick={() => setOpen(false)} className="text-[#8A8A93] hover:text-[#18181B] dark:hover:text-white" aria-label="Tutup">
                            <XIcon className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="color" value={picked} onChange={(e) => setPicked(e.target.value)} className="h-9 w-9 cursor-pointer rounded border border-[#E4E4E7] dark:border-[#222] bg-transparent p-0.5" />
                        <code className="text-xs text-[#52525B] dark:text-[#A1A1AA]">{picked.toUpperCase()}</code>
                        <button type="button" onClick={() => addColor(picked.toUpperCase())} className="ml-auto rounded-md bg-emerald-400 px-2.5 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-emerald-300">
                            Tambah
                        </button>
                    </div>

                    <p className="mb-1.5 mt-3 text-[11px] font-medium uppercase tracking-wider text-[#8A8A93] dark:text-[#666]">Palet cepat</p>
                    <div className="grid grid-cols-8 gap-1.5">
                        {COLOR_PRESETS.map((hex) => (
                            <button
                                key={hex}
                                type="button"
                                onClick={() => addColor(hex)}
                                style={{ backgroundColor: hex }}
                                className="h-6 w-6 rounded-md border border-black/10 dark:border-white/15 transition-transform hover:scale-110"
                                title={hex}
                            />
                        ))}
                    </div>
                </div>
            )}

            <FieldHint field={field} />
        </div>
    );
}

function MultiTextField({ field, value, onChange }) {
    const max = field.max || 5;
    const rows = (value || '').split('\n');

    const update = (i, val) => {
        const next = [...rows];
        next[i] = val;
        onChange(next.join('\n'));
    };

    const add = () => {
        if (rows.length < max) {
            onChange([...rows, ''].join('\n'));
        }
    };

    const remove = (i) => {
        const next = rows.filter((_, idx) => idx !== i);
        onChange((next.length ? next : ['']).join('\n'));
    };

    return (
        <div>
            <FieldTitle field={field} />

            <div className="space-y-2">
                {rows.map((row, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <input
                            type="text"
                            className={INPUT_BASE}
                            placeholder={field.placeholder}
                            value={row}
                            onChange={(e) => update(i, e.target.value)}
                        />
                        {rows.length > 1 && (
                            <button
                                type="button"
                                onClick={() => remove(i)}
                                title="Hapus link"
                                className="flex flex-shrink-0 items-center justify-center rounded-lg border border-[#E4E4E7] px-2.5 py-2 text-[#8A8A93] transition-colors hover:border-red-400/40 hover:text-red-500 dark:border-[#222]"
                            >
                                <XIcon className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {rows.length < max && (
                <button
                    type="button"
                    onClick={add}
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                    <Plus className="h-4 w-4" /> Tambah link
                </button>
            )}

            <FieldHint field={field} />
        </div>
    );
}

function AddonsField({ field, value, onChange }) {
    let state = {};
    try {
        state = value ? JSON.parse(value) : {};
    } catch {
        state = {};
    }

    const commit = (next) => {
        const anyOn = Object.values(next).some((entry) => entry && entry.on);
        onChange(anyOn ? JSON.stringify(next) : '');
    };

    const toggle = (key) => {
        commit({ ...state, [key]: { ...(state[key] || {}), on: !(state[key]?.on) } });
    };

    const setVal = (key, val) => {
        commit({ ...state, [key]: { ...(state[key] || {}), on: true, val } });
    };

    return (
        <div>
            <FieldTitle field={field} />
            <div className="space-y-2">
                {field.options.map((opt) => {
                    const on = !!state[opt.key]?.on;

                    return (
                        <div key={opt.key} className="rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] p-3 dark:border-[#222] dark:bg-[#0D0D0D]">
                            <label className="flex cursor-pointer items-center gap-2.5">
                                <input
                                    type="checkbox"
                                    checked={on}
                                    onChange={() => toggle(opt.key)}
                                    className="h-4 w-4 rounded border-[#C4C4C8] bg-white text-emerald-500 focus:ring-emerald-400/30 dark:border-[#333] dark:bg-[#111]"
                                />
                                <span className="text-sm font-medium text-[#27272A] dark:text-[#EDEDED]">{opt.label}</span>
                            </label>
                            {on && opt.input && (
                                <input
                                    type="text"
                                    value={state[opt.key]?.val || ''}
                                    onChange={(e) => setVal(opt.key, e.target.value)}
                                    placeholder={opt.input.placeholder}
                                    className={`${INPUT_BASE} mt-2`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            <FieldHint field={field} />
        </div>
    );
}

function Field({ field, value, onChange }) {
    const base = INPUT_BASE;

    if (field.type === 'color') {
        return <ColorPaletteField field={field} value={value} onChange={onChange} />;
    }

    if (field.type === 'multitext') {
        return <MultiTextField field={field} value={value} onChange={onChange} />;
    }

    if (field.type === 'addons') {
        return <AddonsField field={field} value={value} onChange={onChange} />;
    }

    // Icon-tile picker: a grid of clickable SVG options instead of a dropdown.
    if (field.type === 'choice') {
        const cols = field.columns || (field.options.length >= 4 ? 4 : 3);
        const colClass = { 3: 'grid-cols-3', 4: 'grid-cols-2 sm:grid-cols-4' }[cols] || 'grid-cols-3';

        return (
            <div>
                <FieldTitle field={field} />
                <div className={`grid gap-2 ${colClass}`}>
                    {field.options.map((opt) => {
                        const selected = value === opt.value;
                        const Icon = opt.icon;

                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => onChange(selected ? '' : opt.value)}
                                title={opt.value}
                                className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border px-2 py-3 text-center transition-colors ${
                                    selected
                                        ? 'border-emerald-400 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300'
                                        : 'border-[#E4E4E7] dark:border-[#222] bg-[#FAFAFA] dark:bg-[#0D0D0D] text-[#52525B] dark:text-[#A1A1AA] hover:border-[#C4C4C8] dark:hover:border-[#3a3a3a] hover:bg-[#EFEFF1] dark:hover:bg-[#161616]'
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-[11px] font-medium leading-tight">{opt.label}</span>
                            </button>
                        );
                    })}
                </div>
                <FieldHint field={field} />
            </div>
        );
    }

    return (
        <label className="block">
            <FieldTitle field={field} />

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

            <FieldHint field={field} />
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

    const form = useForm({});

    // Random brief (AI-filled demo brief), rate-limited server-side to one
    // generation per user every 2 minutes so it doesn't burn the Claude budget.
    const [randomLoading, setRandomLoading] = useState(false);
    const [randomError, setRandomError] = useState(null);
    const [cooldownUntil, setCooldownUntil] = useState(0);
    const [cooldownLeft, setCooldownLeft] = useState(0);

    useEffect(() => {
        if (!cooldownUntil) {
            setCooldownLeft(0);
            return;
        }

        const tick = () => {
            const left = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
            setCooldownLeft(left);
            if (left <= 0) {
                setCooldownUntil(0);
            }
        };

        tick();
        const id = setInterval(tick, 1000);

        return () => clearInterval(id);
    }, [cooldownUntil]);

    const generateRandomBrief = async () => {
        if (randomLoading || cooldownLeft > 0) {
            return;
        }

        setRandomLoading(true);
        setRandomError(null);

        try {
            const { data } = await axios.post(route('studio.random-brief', { engine: engine.slug }), {
                fields: fieldSchema(engine),
            });

            setValues((prev) => {
                const next = { ...prev };
                engine.fields.forEach((field) => {
                    if (field.type !== 'addons' && data[field.name] !== undefined) {
                        next[field.name] = String(data[field.name]);
                    }
                });

                return next;
            });
            setCooldownUntil(Date.now() + RANDOM_BRIEF_COOLDOWN_SECONDS * 1000);
        } catch (err) {
            if (err.response?.status === 429) {
                const retryAfter = Number(err.response.headers?.['retry-after']) || RANDOM_BRIEF_COOLDOWN_SECONDS;
                setCooldownUntil(Date.now() + retryAfter * 1000);
                setRandomError('Tunggu sebentar sebelum generate lagi.');
            } else {
                setRandomError(err.response?.data?.error || 'Gagal generate brief acak.');
            }
        } finally {
            setRandomLoading(false);
        }
    };

    const cooldownLabel = cooldownLeft > 0 ? `${Math.floor(cooldownLeft / 60)}:${String(cooldownLeft % 60).padStart(2, '0')}` : null;

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

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <button
                        type="button"
                        onClick={generateRandomBrief}
                        disabled={randomLoading || cooldownLeft > 0}
                        title="Isi form dengan brief acak hasil AI"
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#D4D4D8] dark:border-[#333] px-3 py-1.5 text-xs font-medium text-[#27272A] dark:text-[#EDEDED] transition-colors hover:border-[#A1A1AA] dark:hover:border-[#555] hover:bg-[#EFEFF1] dark:hover:bg-[#161616] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {randomLoading ? (
                            <>
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> Generating...
                            </>
                        ) : cooldownLabel ? (
                            <><Clock className="h-3.5 w-3.5" /> Tunggu {cooldownLabel}</>
                        ) : (
                            <><Shuffle className="h-3.5 w-3.5" /> Isi Acak (AI)</>
                        )}
                    </button>
                    {randomError && <span className="max-w-[220px] text-right text-xs text-red-500">{randomError}</span>}
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
