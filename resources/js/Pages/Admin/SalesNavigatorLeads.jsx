import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Users as UsersIcon, Clock, MessageSquare, CheckCircle2, Download, ExternalLink, Trash2, AlertTriangle, Check, Upload } from 'lucide-react';
import StudioLayout from '@/Layouts/StudioLayout';

const STATUS_LABELS = {
    not_contacted: 'Not Contacted',
    message_1_sent: 'Message 1 Sent',
    message_2_sent: 'Message 2 Sent',
    message_3_sent: 'Message 3 Sent',
    connected_no_response: 'Connected (No Response)',
    replied: 'Replied',
};

const STATUS_BADGE = {
    not_contacted: 'border-[#D4D4D8] dark:border-[#333] text-[#71717A] dark:text-[#888]',
    message_1_sent: 'border-sky-400/30 bg-sky-400/10 text-sky-700 dark:text-sky-300',
    message_2_sent: 'border-blue-400/30 bg-blue-400/10 text-blue-700 dark:text-blue-300',
    message_3_sent: 'border-indigo-400/30 bg-indigo-400/10 text-indigo-700 dark:text-indigo-300',
    connected_no_response: 'border-amber-400/30 bg-amber-400/10 text-amber-700 dark:text-amber-300',
    replied: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300',
};

function SubNav({ active, hasPackage }) {
    const base = 'rounded-lg border px-4 py-2 text-sm font-medium transition-colors';
    const on = 'border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300';
    const off = 'border-[#E4E4E7] dark:border-[#222] text-[#52525B] dark:text-[#A1A1AA] hover:bg-[#EFEFF1] dark:hover:bg-[#111] hover:text-[#18181B] dark:hover:text-white';

    return (
        <div className="mb-8 flex flex-wrap items-center gap-2">
            <Link href={route('admin.traffic')} className={`${base} ${active === 'traffic' ? on : off}`}>Traffic</Link>
            <Link href={route('admin.orders')} className={`${base} ${active === 'orders' ? on : off}`}>Orders</Link>
            <Link href={route('admin.users')} className={`${base} ${active === 'users' ? on : off}`}>Users</Link>
            <Link href={route('admin.engine-requests')} className={`${base} ${active === 'engine-requests' ? on : off}`}>Request Engine</Link>
            <Link href={route('admin.sales-navigator-leads')} className={`${base} ${active === 'sales-navigator-leads' ? on : off}`}>Sales Navigator</Link>
            {hasPackage && (
                <a href={route('admin.whitelabel.download')} className={`${base} ${off} ml-auto inline-flex items-center gap-1.5`}>
                    <Download className="h-4 w-4" /> Download Whitelabel
                </a>
            )}
        </div>
    );
}

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function initials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || '';
    const second = parts.length > 1 ? parts[1][0] : '';
    return (first + second).toUpperCase();
}

export default function SalesNavigatorLeads() {
    const { leads, stats, filters, perPageOptions, hasPackage, flash } = usePage().props;
    const [savingId, setSavingId] = useState(null);
    const [savedId, setSavedId] = useState(null);
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const [confirming, setConfirming] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [showImport, setShowImport] = useState(false);

    const importForm = useForm({ html: '' });
    const selectedLead = leads.data.find((l) => l.id === selectedLeadId) ?? null;

    const updateQuery = (changes) => {
        const next = { ...filters, ...changes };
        const params = {};
        if (next.status) params.status = next.status;
        if (next.per_page) params.per_page = next.per_page;

        router.get(route('admin.sales-navigator-leads'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const goToPage = (url) => {
        if (!url) return;
        router.get(url, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const submitImport = (e) => {
        e.preventDefault();
        importForm.post(route('admin.sales-navigator-leads.import'), {
            preserveScroll: true,
            onSuccess: () => {
                importForm.reset('html');
                setShowImport(false);
            },
        });
    };

    const changeStatus = (lead, status) => {
        if (status === lead.status) return;
        setSavingId(lead.id);
        router.patch(route('admin.sales-navigator-leads.update', { salesNavigatorLead: lead.id }), { status }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setSavedId(lead.id);
                setTimeout(() => setSavedId(null), 2000);
            },
            onFinish: () => setSavingId(null),
        });
    };

    const deleteLead = () => {
        if (!confirming) return;
        setDeleting(true);
        router.delete(route('admin.sales-navigator-leads.destroy', { salesNavigatorLead: confirming.id }), {
            preserveScroll: true,
            onSuccess: () => {
                setConfirming(null);
                setSelectedLeadId(null);
            },
            onFinish: () => setDeleting(false),
        });
    };

    const cards = [
        { icon: UsersIcon, label: 'Total leads', value: stats.total },
        { icon: Clock, label: 'Not contacted', value: stats.not_contacted },
        { icon: MessageSquare, label: 'In progress', value: stats.in_progress },
        { icon: CheckCircle2, label: 'Replied', value: stats.replied },
    ];

    return (
        <StudioLayout fullWidth>
            <Head title="Sales Navigator Leads | Admin" />

            <SubNav active="sales-navigator-leads" hasPackage={hasPackage} />

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#18181B] dark:text-white">Sales Navigator Leads</h1>
                    <p className="mt-1 text-sm text-[#71717A] dark:text-[#888]">
                        Leads imported from LinkedIn Sales Navigator, tracked here as you reach out one by one.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowImport((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-300"
                >
                    <Upload className="h-4 w-4" /> {showImport ? 'Close' : 'Import Leads'}
                </button>
            </div>

            {flash?.success && (
                <p className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-300">
                    {flash.success}
                </p>
            )}
            {flash?.error && (
                <p className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-sm text-red-700 dark:text-red-300">
                    {flash.error}
                </p>
            )}

            {Array.isArray(flash?.duplicateLeads) && flash.duplicateLeads.length > 0 && (
                <div className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                    <p className="font-medium">Already tracked, skipped so nothing was overwritten ({flash.duplicateLeads.length}):</p>
                    <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-xs">
                        {flash.duplicateLeads.map((d, i) => (
                            <li key={i}>{d.name}{d.company ? ` (${d.company})` : ''}</li>
                        ))}
                    </ul>
                </div>
            )}

            {showImport && (
                <form onSubmit={submitImport} className="mt-4 rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-5">
                    <label className="mb-1.5 block text-xs font-medium text-[#52525B] dark:text-[#A1A1AA]">
                        Paste the full HTML of a LinkedIn Sales Navigator search results page
                    </label>
                    <textarea
                        rows={6}
                        value={importForm.data.html}
                        onChange={(e) => importForm.setData('html', e.target.value)}
                        placeholder="Right-click the results list on Sales Navigator, Inspect, copy the outer HTML, and paste it here."
                        className="block w-full rounded-lg border border-[#D4D4D8] dark:border-[#333] bg-white dark:bg-[#0D0D0D] px-3 py-2 font-mono text-xs text-[#27272A] dark:text-[#EDEDED] focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/30"
                    />
                    {importForm.errors.html && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{importForm.errors.html}</p>}
                    <div className="mt-3 flex justify-end">
                        <button
                            type="submit"
                            disabled={importForm.processing || !importForm.data.html.trim()}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {importForm.processing ? 'Importing...' : 'Import'}
                        </button>
                    </div>
                </form>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-4">
                {cards.map((c) => (
                    <div key={c.label} className="rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-5">
                        <c.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <div className="mt-3 text-2xl font-bold text-[#18181B] dark:text-white">{c.value}</div>
                        <div className="text-sm text-[#71717A] dark:text-[#888]">{c.label}</div>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-[#52525B] dark:text-[#A1A1AA]">Filter:</label>
                    <select
                        value={filters.status || 'all'}
                        onChange={(e) => updateQuery({ status: e.target.value === 'all' ? undefined : e.target.value })}
                        className="rounded-md border border-[#D4D4D8] dark:border-[#333] bg-white dark:bg-[#0D0D0D] px-2.5 py-1.5 text-xs text-[#27272A] dark:text-[#EDEDED] focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/30"
                    >
                        <option value="all">All statuses</option>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-[#52525B] dark:text-[#A1A1AA]">Per page:</label>
                    <select
                        value={filters.per_page}
                        onChange={(e) => updateQuery({ per_page: Number(e.target.value) })}
                        className="rounded-md border border-[#D4D4D8] dark:border-[#333] bg-white dark:bg-[#0D0D0D] px-2.5 py-1.5 text-xs text-[#27272A] dark:text-[#EDEDED] focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/30"
                    >
                        {perPageOptions.map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </div>
            </div>

            {leads.data.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-12 text-center">
                    <UsersIcon className="mx-auto h-8 w-8 text-[#9CA3AF] dark:text-[#555]" />
                    <p className="mt-3 text-sm text-[#71717A] dark:text-[#888]">No leads match here, import a Sales Navigator search or change the filter.</p>
                </div>
            ) : (
                <div className="mt-4 overflow-hidden rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111]">
                    <div className="divide-y divide-[#EBEBEE] dark:divide-[#1a1a1a]">
                        {leads.data.map((lead, i) => (
                            <button
                                key={lead.id}
                                type="button"
                                onClick={() => setSelectedLeadId(lead.id)}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#EFEFF1] dark:hover:bg-[#161616]"
                            >
                                <span className="w-7 flex-shrink-0 text-right text-xs text-[#9CA3AF] dark:text-[#555]">{leads.from + i}</span>
                                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                    {initials(lead.name)}
                                </span>
                                <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#18181B] dark:text-white">{lead.name}</span>
                                <span className="flex-shrink-0 rounded-full border border-[#D4D4D8] px-2 py-0.5 text-[10px] font-medium text-[#71717A] dark:border-[#333] dark:text-[#888]">
                                    {lead.connection_degree || '-'}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E4E4E7] px-4 py-3 text-xs text-[#71717A] dark:border-[#222] dark:text-[#888]">
                        <span>Showing {leads.from}-{leads.to} of {leads.total}</span>
                        <div className="flex flex-wrap items-center gap-1">
                            {leads.links.map((link, i) =>
                                link.url === null ? (
                                    <span key={i} className="rounded-md px-2.5 py-1 text-[#D4D4D8] dark:text-[#444]" dangerouslySetInnerHTML={{ __html: link.label }} />
                                ) : (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => goToPage(link.url)}
                                        className={`rounded-md px-2.5 py-1 transition-colors ${
                                            link.active
                                                ? 'bg-emerald-400 font-semibold text-black'
                                                : 'border border-[#E4E4E7] text-[#52525B] hover:bg-[#EFEFF1] dark:border-[#333] dark:text-[#A1A1AA] dark:hover:bg-[#1A1A1A]'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}

            {selectedLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLeadId(null)} />
                    <div className="relative w-full max-w-xs rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-4 shadow-xl">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                {initials(selectedLead.name)}
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#18181B] dark:text-white">{selectedLead.name}</p>
                                <p className="truncate text-xs text-[#71717A] dark:text-[#888]">{selectedLead.title || '-'}</p>
                            </div>
                        </div>

                        <div className="mt-3 space-y-1 text-xs text-[#52525B] dark:text-[#A1A1AA]">
                            <p className="truncate">
                                {selectedLead.company_url ? (
                                    <a href={selectedLead.company_url} target="_blank" rel="noreferrer" className="hover:underline">{selectedLead.company}</a>
                                ) : (selectedLead.company || '-')}
                            </p>
                            <p className="truncate">{selectedLead.location || '-'}</p>
                            <p>Last contacted: {formatDate(selectedLead.last_contacted_at)}</p>
                        </div>

                        {selectedLead.about && (
                            <p className="mt-3 max-h-24 overflow-y-auto rounded-md bg-[#FAFAFA] p-2 text-[11px] leading-relaxed text-[#52525B] dark:bg-[#0D0D0D] dark:text-[#A1A1AA]">
                                {selectedLead.about}
                            </p>
                        )}

                        <div className="mt-3">
                            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF] dark:text-[#666]">Status</label>
                            <div className="flex items-center gap-2">
                                <select
                                    value={selectedLead.status}
                                    disabled={savingId === selectedLead.id}
                                    onChange={(e) => changeStatus(selectedLead, e.target.value)}
                                    className={`w-full rounded-md border px-2 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-400/30 disabled:opacity-50 ${STATUS_BADGE[selectedLead.status]}`}
                                >
                                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                                {savedId === selectedLead.id && <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />}
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-2">
                            <a
                                href={selectedLead.profile_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-md border border-[#D4D4D8] dark:border-[#333] px-2.5 py-1.5 text-xs font-medium text-[#27272A] dark:text-[#EDEDED] transition-colors hover:border-[#A1A1AA] dark:hover:border-[#555] hover:bg-[#EFEFF1] dark:hover:bg-[#1A1A1A]"
                            >
                                <ExternalLink className="h-3.5 w-3.5" /> Profile
                            </a>
                            <button
                                type="button"
                                onClick={() => setConfirming(selectedLead)}
                                className="inline-flex items-center gap-1.5 rounded-md border border-red-300/60 dark:border-red-500/30 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                            >
                                <Trash2 className="h-3.5 w-3.5" /> Remove
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setSelectedLeadId(null)}
                            className="mt-3 w-full rounded-md border border-[#E4E4E7] px-3 py-1.5 text-xs font-medium text-[#52525B] transition-colors hover:bg-[#EFEFF1] dark:border-[#333] dark:text-[#A1A1AA] dark:hover:bg-[#1A1A1A]"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {confirming && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !deleting && setConfirming(null)} />
                    <div className="relative w-full max-w-md rounded-2xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-6 shadow-xl">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/15">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-lg font-semibold text-[#18181B] dark:text-white">Remove this lead?</h3>
                                <p className="mt-1 text-sm text-[#52525B] dark:text-[#A1A1AA]">
                                    <span className="font-medium text-[#18181B] dark:text-white">{confirming.name}</span> will be removed from the tracker. This cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirming(null)}
                                disabled={deleting}
                                className="rounded-lg border border-[#E4E4E7] dark:border-[#333] px-4 py-2 text-sm font-medium text-[#52525B] dark:text-[#A1A1AA] transition-colors hover:bg-[#EFEFF1] dark:hover:bg-[#1A1A1A] disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={deleteLead}
                                disabled={deleting}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4" /> {deleting ? 'Removing...' : 'Remove'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </StudioLayout>
    );
}
