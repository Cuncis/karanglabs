import { Head, Link, usePage } from '@inertiajs/react';
import { Eye, Users as UsersIcon, CalendarDays, Download } from 'lucide-react';
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

function DailyChart({ daily }) {
    const max = Math.max(1, ...daily.map((d) => d.views));

    return (
        <div className="rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-[#18181B] dark:text-white">14 hari terakhir</h2>
                <div className="flex items-center gap-4 text-xs text-[#71717A] dark:text-[#888]">
                    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Kunjungan</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-400/40" /> Pengunjung</span>
                </div>
            </div>

            <div className="flex h-44 items-end gap-1.5">
                {daily.map((d) => (
                    <div key={d.date} className="group relative flex flex-1 flex-col items-center justify-end gap-1">
                        {/* Tooltip */}
                        <div className="pointer-events-none absolute -top-1 z-10 -translate-y-full whitespace-nowrap rounded-md border border-[#E4E4E7] dark:border-[#333] bg-white dark:bg-[#1A1A1A] px-2 py-1 text-[11px] text-[#27272A] dark:text-[#EDEDED] opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                            <div className="font-medium">{d.label}</div>
                            <div>{num(d.views)} kunjungan</div>
                            <div className="text-[#71717A] dark:text-[#888]">{num(d.visitors)} pengunjung</div>
                        </div>

                        <div className="flex w-full items-end justify-center gap-[2px]">
                            <div
                                className="w-1/2 rounded-t-sm bg-emerald-500 transition-all"
                                style={{ height: `${Math.max(2, (d.views / max) * 150)}px` }}
                            />
                            <div
                                className="w-1/2 rounded-t-sm bg-emerald-400/40 transition-all"
                                style={{ height: `${Math.max(2, (d.visitors / max) * 150)}px` }}
                            />
                        </div>
                        <span className="mt-1 text-[9px] leading-none text-[#9CA3AF] dark:text-[#666]">{d.label.split(' ')[0]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Traffic() {
    const { stats, daily, topPages, hasPackage } = usePage().props;

    const cards = [
        { icon: Eye, label: 'Total kunjungan', value: num(stats.viewsTotal), sub: `${num(stats.visitorsTotal)} pengunjung unik` },
        { icon: CalendarDays, label: 'Hari ini', value: num(stats.viewsToday), sub: `${num(stats.visitorsToday)} pengunjung unik` },
        { icon: UsersIcon, label: '7 hari terakhir', value: num(stats.views7d), sub: `${num(stats.visitors7d)} pengunjung unik` },
    ];

    return (
        <StudioLayout>
            <Head title="Traffic — Admin" />

            <SubNav active="traffic" hasPackage={hasPackage} />

            <h1 className="text-2xl font-bold tracking-tight text-[#18181B] dark:text-white">Traffic</h1>
            <p className="mt-1 text-sm text-[#71717A] dark:text-[#888]">Jumlah kunjungan & pengunjung ke website Karanglabs.</p>

            {/* Stats */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {cards.map((s) => (
                    <div key={s.label} className="rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-5">
                        <s.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <div className="mt-3 text-2xl font-bold text-[#18181B] dark:text-white">{s.value}</div>
                        <div className="text-sm text-[#71717A] dark:text-[#888]">{s.label}</div>
                        <div className="mt-1 text-xs text-[#9CA3AF] dark:text-[#666]">{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* Daily chart */}
            <div className="mt-8">
                <DailyChart daily={daily} />
            </div>

            {/* Top pages */}
            <div className="mt-8 overflow-x-auto rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111]">
                <table className="w-full min-w-[480px] text-left text-sm">
                    <thead className="border-b border-[#E4E4E7] dark:border-[#222] text-xs uppercase tracking-wider text-[#9CA3AF] dark:text-[#666]">
                        <tr>
                            <th className="px-5 py-3 font-medium">Halaman (30 hari)</th>
                            <th className="px-5 py-3 text-right font-medium">Kunjungan</th>
                            <th className="px-5 py-3 text-right font-medium">Pengunjung</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBEBEE] dark:divide-[#1a1a1a]">
                        {topPages.length === 0 && (
                            <tr><td colSpan={3} className="px-5 py-10 text-center text-[#9CA3AF] dark:text-[#666]">Belum ada data kunjungan.</td></tr>
                        )}
                        {topPages.map((p) => (
                            <tr key={p.path} className="transition-colors hover:bg-[#EFEFF1] dark:hover:bg-[#161616]">
                                <td className="px-5 py-4 font-mono text-xs text-[#27272A] dark:text-[#EDEDED]">{p.path}</td>
                                <td className="px-5 py-4 text-right font-medium text-[#18181B] dark:text-white">{num(p.views)}</td>
                                <td className="px-5 py-4 text-right text-[#71717A] dark:text-[#888]">{num(p.visitors)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </StudioLayout>
    );
}
