import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ShoppingBag, CheckCircle2, Wallet, ArrowLeft, Send, Check, Download } from 'lucide-react';

const LOGO = 'https://cdn.libradigital.id/logo-01%20(1)%20(1).png';

const rupiah = (n) => 'Rp ' + new Intl.NumberFormat('id-ID').format(n || 0);

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

const STATUS = {
    paid: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
    pending: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
    failed: 'bg-red-400/10 text-red-300 border-red-400/30',
};

export default function Orders() {
    const { orders, stats, auth, hasPackage } = usePage().props;
    const [resentId, setResentId] = useState(null);
    const [sendingId, setSendingId] = useState(null);

    const resend = (order) => {
        setSendingId(order.id);
        router.post(route('admin.orders.resend', { order: order.id }), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setResentId(order.id);
                setTimeout(() => setResentId(null), 3000);
            },
            onFinish: () => setSendingId(null),
        });
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] font-sans text-[#EDEDED] antialiased">
            <Head title="Orders — Admin" />

            <header className="border-b border-[#1a1a1a]">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
                    <div className="flex items-center gap-2.5">
                        <img src={LOGO} alt="Karanglabs" className="h-8 w-8 rounded-md object-contain" />
                        <div>
                            <div className="text-sm font-bold leading-tight text-white">Karanglabs</div>
                            <div className="text-[10px] uppercase tracking-widest text-emerald-400">Admin</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="hidden text-[#888] sm:inline">{auth?.user?.email}</span>
                        <Link href={route('studio.index')} className="inline-flex items-center gap-1.5 text-[#A1A1AA] transition-colors hover:text-white">
                            <ArrowLeft className="h-4 w-4" /> Studio
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-10">
                <div className="mb-8 flex flex-wrap items-center gap-2 text-sm">
                    <Link href={route('admin.orders')} className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 font-medium text-emerald-300">Orders</Link>
                    <Link href={route('admin.users')} className="rounded-lg border border-[#222] px-4 py-2 text-[#A1A1AA] transition-colors hover:bg-[#111] hover:text-white">Users</Link>
                    {hasPackage && (
                        <a href={route('admin.whitelabel.download')} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-[#222] px-4 py-2 text-[#A1A1AA] transition-colors hover:bg-[#111] hover:text-white">
                            <Download className="h-4 w-4" /> Download Whitelabel
                        </a>
                    )}
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white">Orders</h1>
                <p className="mt-1 text-sm text-[#888]">Semua transaksi yang masuk lewat Midtrans.</p>

                {/* Stats */}
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    {[
                        { icon: ShoppingBag, label: 'Total order', value: stats.total },
                        { icon: CheckCircle2, label: 'Lunas', value: stats.paid },
                        { icon: Wallet, label: 'Pendapatan', value: rupiah(stats.revenue) },
                    ].map((s) => (
                        <div key={s.label} className="rounded-xl border border-[#222] bg-[#111] p-5">
                            <s.icon className="h-5 w-5 text-emerald-400" />
                            <div className="mt-3 text-2xl font-bold text-white">{s.value}</div>
                            <div className="text-sm text-[#888]">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="mt-8 overflow-x-auto rounded-xl border border-[#222] bg-[#111]">
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead className="border-b border-[#222] text-xs uppercase tracking-wider text-[#666]">
                            <tr>
                                <th className="px-5 py-3 font-medium">Order</th>
                                <th className="px-5 py-3 font-medium">Pembeli</th>
                                <th className="px-5 py-3 font-medium">Plan</th>
                                <th className="px-5 py-3 font-medium">Jumlah</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium">Tanggal</th>
                                <th className="px-5 py-3 text-right font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a1a1a]">
                            {orders.length === 0 && (
                                <tr><td colSpan={7} className="px-5 py-10 text-center text-[#666]">Belum ada order.</td></tr>
                            )}
                            {orders.map((o) => (
                                <tr key={o.id} className="transition-colors hover:bg-[#161616]">
                                    <td className="px-5 py-4 font-mono text-xs text-[#A1A1AA]">{o.order_id}</td>
                                    <td className="px-5 py-4">
                                        <div className="font-medium text-white">{o.name || '-'}</div>
                                        <div className="text-xs text-[#666]">{o.email}</div>
                                    </td>
                                    <td className="px-5 py-4 text-[#A1A1AA]">{o.plan}</td>
                                    <td className="px-5 py-4 text-[#EDEDED]">{rupiah(o.amount)}</td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS[o.status] || 'border-[#333] text-[#888]'}`}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-xs text-[#888]">{formatDate(o.paid_at || o.created_at)}</td>
                                    <td className="px-5 py-4 text-right">
                                        {o.status === 'paid' ? (
                                            resentId === o.id ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-emerald-400"><Check className="h-3.5 w-3.5" /> Terkirim</span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => resend(o)}
                                                    disabled={sendingId === o.id}
                                                    className="inline-flex items-center gap-1.5 rounded-md border border-[#333] px-3 py-1.5 text-xs font-medium text-[#EDEDED] transition-colors hover:border-[#555] hover:bg-[#1A1A1A] disabled:opacity-50"
                                                    title="Kirim ulang email login (password baru)"
                                                >
                                                    <Send className="h-3.5 w-3.5" /> Kirim ulang
                                                </button>
                                            )
                                        ) : (
                                            <span className="text-xs text-[#555]">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
