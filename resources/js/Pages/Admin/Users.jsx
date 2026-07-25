import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Users as UsersIcon, ShieldCheck, KeyRound, UserRound, ArrowLeft, Check, Download } from 'lucide-react';

const LOGO = 'https://cdn.libradigital.id/logo-01%20(1)%20(1).png';

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

const ROLE_BADGE = {
    admin: 'bg-violet-400/10 text-violet-300 border-violet-400/30',
    reseller: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
    member: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
};

export default function Users() {
    const { users, roles, stats, auth, hasPackage } = usePage().props;
    const [savedId, setSavedId] = useState(null);
    const [savingId, setSavingId] = useState(null);

    const changeRole = (user, role) => {
        if (role === user.role) return;
        setSavingId(user.id);
        router.patch(route('admin.users.role', { user: user.id }), { role }, {
            preserveScroll: true,
            onSuccess: () => {
                setSavedId(user.id);
                setTimeout(() => setSavedId(null), 2500);
            },
            onFinish: () => setSavingId(null),
        });
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] font-sans text-[#EDEDED] antialiased">
            <Head title="Users — Admin" />

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
                {/* Sub-nav */}
                <div className="mb-8 flex flex-wrap items-center gap-2 text-sm">
                    <Link href={route('admin.orders')} className="rounded-lg border border-[#222] px-4 py-2 text-[#A1A1AA] transition-colors hover:bg-[#111] hover:text-white">Orders</Link>
                    <Link href={route('admin.users')} className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 font-medium text-emerald-300">Users</Link>
                    {hasPackage && (
                        <a href={route('admin.whitelabel.download')} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-[#222] px-4 py-2 text-[#A1A1AA] transition-colors hover:bg-[#111] hover:text-white">
                            <Download className="h-4 w-4" /> Download Whitelabel
                        </a>
                    )}
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white">Users</h1>
                <p className="mt-1 text-sm text-[#888]">Kelola login level tiap user.</p>

                <div className="mt-8 grid gap-4 sm:grid-cols-4">
                    {[
                        { icon: UsersIcon, label: 'Total user', value: stats.total },
                        { icon: ShieldCheck, label: 'Admin', value: stats.admin },
                        { icon: KeyRound, label: 'Reseller', value: stats.reseller },
                        { icon: UserRound, label: 'Member', value: stats.member },
                    ].map((s) => (
                        <div key={s.label} className="rounded-xl border border-[#222] bg-[#111] p-5">
                            <s.icon className="h-5 w-5 text-emerald-400" />
                            <div className="mt-3 text-2xl font-bold text-white">{s.value}</div>
                            <div className="text-sm text-[#888]">{s.label}</div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 overflow-x-auto rounded-xl border border-[#222] bg-[#111]">
                    <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="border-b border-[#222] text-xs uppercase tracking-wider text-[#666]">
                            <tr>
                                <th className="px-5 py-3 font-medium">User</th>
                                <th className="px-5 py-3 font-medium">Level</th>
                                <th className="px-5 py-3 font-medium">License</th>
                                <th className="px-5 py-3 font-medium">Bergabung</th>
                                <th className="px-5 py-3 font-medium">Ubah level</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a1a1a]">
                            {users.map((u) => {
                                const isSelf = u.id === auth?.user?.id;
                                return (
                                    <tr key={u.id} className="transition-colors hover:bg-[#161616]">
                                        <td className="px-5 py-4">
                                            <div className="font-medium text-white">{u.name}{isSelf && <span className="ml-2 text-xs text-[#666]">(kamu)</span>}</div>
                                            <div className="text-xs text-[#666]">{u.email}</div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[u.role] || 'border-[#333] text-[#888]'}`}>
                                                {u.role_label}
                                            </span>
                                            {u.is_email_admin && <div className="mt-1 text-[10px] text-[#555]">admin via env</div>}
                                        </td>
                                        <td className="px-5 py-4 font-mono text-xs text-[#A1A1AA]">{u.license_key || '-'}</td>
                                        <td className="px-5 py-4 text-xs text-[#888]">{formatDate(u.created_at)}</td>
                                        <td className="px-5 py-4">
                                            {isSelf ? (
                                                <span className="text-xs text-[#555]">-</span>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={u.role}
                                                        disabled={savingId === u.id}
                                                        onChange={(e) => changeRole(u, e.target.value)}
                                                        className="rounded-md border border-[#333] bg-[#0D0D0D] px-2.5 py-1.5 text-xs text-[#EDEDED] focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 disabled:opacity-50"
                                                    >
                                                        {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                                                    </select>
                                                    {savedId === u.id && <span className="inline-flex items-center gap-1 text-xs text-emerald-400"><Check className="h-3.5 w-3.5" /> Tersimpan</span>}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
