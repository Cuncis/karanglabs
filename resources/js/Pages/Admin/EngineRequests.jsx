import { Head, Link, router, usePage } from '@inertiajs/react';
import { Lightbulb, Clock, CheckCircle2, Download, Check, RotateCcw, Trash2 } from 'lucide-react';
import StudioLayout from '@/Layouts/StudioLayout';

const num = (n) => new Intl.NumberFormat('id-ID').format(n || 0);

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
            {hasPackage && (
                <a href={route('admin.whitelabel.download')} className={`${base} ${off} ml-auto inline-flex items-center gap-1.5`}>
                    <Download className="h-4 w-4" /> Download Whitelabel
                </a>
            )}
        </div>
    );
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function EngineRequests() {
    const { requests, stats, hasPackage } = usePage().props;

    const cards = [
        { icon: Lightbulb, label: 'Total request', value: num(stats.total) },
        { icon: Clock, label: 'Belum dikerjakan', value: num(stats.pending) },
        { icon: CheckCircle2, label: 'Selesai', value: num(stats.done) },
    ];

    const toggleStatus = (req) => {
        const next = req.status === 'done' ? 'pending' : 'done';
        router.patch(route('admin.engine-requests.update', { engineRequest: req.id }), { status: next }, { preserveScroll: true });
    };

    const remove = (req) => {
        router.delete(route('admin.engine-requests.destroy', { engineRequest: req.id }), { preserveScroll: true });
    };

    return (
        <StudioLayout>
            <Head title="Request Engine" />

            <SubNav active="engine-requests" hasPackage={hasPackage} />

            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-[#18181B] dark:text-white">Request Engine</h1>
                <p className="mt-1 text-sm text-[#71717A] dark:text-[#888]">Permintaan engine & tool baru dari member dan reseller.</p>
            </div>

            <div className="mb-8 grid gap-4 sm:grid-cols-3">
                {cards.map((c) => (
                    <div key={c.label} className="rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-5">
                        <c.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <div className="mt-3 text-2xl font-bold text-[#18181B] dark:text-white">{c.value}</div>
                        <div className="text-sm text-[#71717A] dark:text-[#888]">{c.label}</div>
                    </div>
                ))}
            </div>

            {requests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-12 text-center">
                    <Lightbulb className="mx-auto h-8 w-8 text-[#9CA3AF] dark:text-[#555]" />
                    <p className="mt-3 text-sm text-[#71717A] dark:text-[#888]">Belum ada request masuk.</p>
                </div>
            ) : (
                <div className="divide-y divide-[#EBEBEE] dark:divide-[#1a1a1a] overflow-hidden rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111]">
                    {requests.map((req) => (
                        <div key={req.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-semibold text-[#18181B] dark:text-white">{req.user?.name || 'User dihapus'}</span>
                                    {req.user && <span className="text-xs text-[#8A8A93] dark:text-[#666]">{req.user.email} · {req.user.role}</span>}
                                    {req.status === 'done' ? (
                                        <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">Selesai</span>
                                    ) : (
                                        <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-300">Pending</span>
                                    )}
                                </div>
                                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#3F3F46] dark:text-[#D4D4D8]">{req.message}</p>
                                <p className="mt-2 text-xs text-[#9CA3AF] dark:text-[#555]">{formatDate(req.created_at)}</p>
                            </div>
                            <div className="flex flex-shrink-0 items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => toggleStatus(req)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4E4E7] dark:border-[#222] px-3 py-1.5 text-xs font-medium text-[#52525B] dark:text-[#A1A1AA] transition-colors hover:bg-[#EFEFF1] dark:hover:bg-[#161616]"
                                >
                                    {req.status === 'done'
                                        ? (<><RotateCcw className="h-3.5 w-3.5" /> Tandai pending</>)
                                        : (<><Check className="h-3.5 w-3.5" /> Tandai selesai</>)}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => remove(req)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 transition-colors hover:bg-rose-500/10"
                                >
                                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </StudioLayout>
    );
}
