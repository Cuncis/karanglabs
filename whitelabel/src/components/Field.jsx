import { useEffect, useRef, useState } from 'react';
import { X as XIcon, Palette, Plus } from 'lucide-react';

const INPUT_BASE = 'w-full rounded-lg border border-[#E4E4E7] dark:border-[#222] bg-[#FAFAFA] dark:bg-[#0D0D0D] px-3 py-2 text-sm text-[#27272A] dark:text-[#EDEDED] placeholder-[#9CA3AF] dark:placeholder-[#555] focus:border-brand-400/50 focus:outline-none focus:ring-1 focus:ring-brand-400/30';

const COLOR_PRESETS = [
    '#0F172A', '#334155', '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#22C55E', '#10B981',
    '#14B8A6', '#0EA5E9', '#6366F1', '#8B5CF6', '#EC4899', '#8B5E3C', '#F5F5DC', '#FFFFFF',
];

function FieldTitle({ field }) {
    return (
        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[#3F3F46] dark:text-[#D4D4D8]">
            {field.label}
            {field.required && <span className="text-brand-600 dark:text-brand-400">*</span>}
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
                        <button type="button" onClick={() => addColor(picked.toUpperCase())} className="ml-auto rounded-md bg-brand-400 px-2.5 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-brand-300">
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
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
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
                                    className="h-4 w-4 rounded border-[#C4C4C8] bg-white text-brand-500 focus:ring-brand-400/30 dark:border-[#333] dark:bg-[#111]"
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

export default function Field({ field, value, onChange }) {
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
                                        ? 'border-brand-400 bg-brand-400/10 text-brand-700 dark:text-brand-300'
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
