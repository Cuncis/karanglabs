import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Users as UsersIcon, ShieldCheck, KeyRound, UserRound, Check, Download, Trash2, AlertTriangle } from 'lucide-react';
import StudioLayout from '@/Layouts/StudioLayout';

function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

const ROLE_BADGE = {
    admin: 'bg-violet-400/10 text-violet-700 dark:text-violet-300 border-violet-400/30',
    reseller: 'bg-amber-400/10 text-amber-700 dark:text-amber-300 border-amber-400/30',
    member: 'bg-emerald-400/10 text-emerald-700 dark:text-emerald-300 border-emerald-400/30',
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
            {hasPackage && (
                <a href={route('admin.whitelabel.download')} className={`${base} ${off} ml-auto inline-flex items-center gap-1.5`}>
                    <Download className="h-4 w-4" /> Download Whitelabel
                </a>
            )}
        </div>
    );
}

export default function Users() {
    const { users, roles, stats, auth, hasPackage } = usePage().props;
    const [savedId, setSavedId] = useState(null);
    const [savingId, setSavingId] = useState(null);
    const [confirming, setConfirming] = useState(null);
    const [deleting, setDeleting] = useState(false);

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

    const deleteUser = () => {
        if (!confirming) return;
        setDeleting(true);
        router.delete(route('admin.users.destroy', { user: confirming.id }), {
            preserveScroll: true,
            onSuccess: () => setConfirming(null),
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <StudioLayout>
            <Head title="Users — Admin" />

            <SubNav active="users" hasPackage={hasPackage} />

            <h1 className="text-2xl font-bold tracking-tight text-[#18181B] dark:text-white">Users</h1>
            <p className="mt-1 text-sm text-[#71717A] dark:text-[#888]">Kelola login level tiap user.</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-4">
                {[
                    { icon: UsersIcon, label: 'Total user', value: stats.total },
                    { icon: ShieldCheck, label: 'Admin', value: stats.admin },
                    { icon: KeyRound, label: 'Reseller', value: stats.reseller },
                    { icon: UserRound, label: 'Member', value: stats.member },
                ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-5">
                        <s.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <div className="mt-3 text-2xl font-bold text-[#18181B] dark:text-white">{s.value}</div>
                        <div className="text-sm text-[#71717A] dark:text-[#888]">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="mt-8 overflow-x-auto rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111]">
                <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="border-b border-[#E4E4E7] dark:border-[#222] text-xs uppercase tracking-wider text-[#9CA3AF] dark:text-[#666]">
                        <tr>
                            <th className="px-5 py-3 font-medium">User</th>
                            <th className="px-5 py-3 font-medium">Level</th>
                            <th className="px-5 py-3 font-medium">License</th>
                            <th className="px-5 py-3 font-medium">Bergabung</th>
                            <th className="px-5 py-3 font-medium">Ubah level</th>
                            <th className="px-5 py-3 text-right font-medium">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBEBEE] dark:divide-[#1a1a1a]">
                        {users.map((u) => {
                            const isSelf = u.id === auth?.user?.id;
                            const isProtected = isSelf || u.is_email_admin;
                            return (
                                <tr key={u.id} className="transition-colors hover:bg-[#EFEFF1] dark:hover:bg-[#161616]">
                                    <td className="px-5 py-4">
                                        <div className="font-medium text-[#18181B] dark:text-white">{u.name}{isSelf && <span className="ml-2 text-xs text-[#9CA3AF] dark:text-[#666]">(kamu)</span>}</div>
                                        <div className="text-xs text-[#9CA3AF] dark:text-[#666]">{u.email}</div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[u.role] || 'border-[#D4D4D8] dark:border-[#333] text-[#71717A] dark:text-[#888]'}`}>
                                            {u.role_label}
                                        </span>
                                        {u.is_email_admin && <div className="mt-1 text-[10px] text-[#B4B4BB] dark:text-[#555]">admin via env</div>}
                                    </td>
                                    <td className="px-5 py-4 font-mono text-xs text-[#52525B] dark:text-[#A1A1AA]">{u.license_key || '-'}</td>
                                    <td className="px-5 py-4 text-xs text-[#71717A] dark:text-[#888]">{formatDate(u.created_at)}</td>
                                    <td className="px-5 py-4">
                                        {isSelf ? (
                                            <span className="text-xs text-[#B4B4BB] dark:text-[#555]">-</span>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={u.role}
                                                    disabled={savingId === u.id}
                                                    onChange={(e) => changeRole(u, e.target.value)}
                                                    className="rounded-md border border-[#D4D4D8] dark:border-[#333] bg-white dark:bg-[#0D0D0D] px-2.5 py-1.5 text-xs text-[#27272A] dark:text-[#EDEDED] focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 disabled:opacity-50"
                                                >
                                                    {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                                {savedId === u.id && <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"><Check className="h-3.5 w-3.5" /> Tersimpan</span>}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        {isProtected ? (
                                            <span className="text-xs text-[#B4B4BB] dark:text-[#555]">-</span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setConfirming(u)}
                                                className="inline-flex items-center gap-1.5 rounded-md border border-red-300/60 dark:border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                                                title="Hapus user"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" /> Hapus
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {confirming && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !deleting && setConfirming(null)} />
                    <div className="relative w-full max-w-md rounded-2xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-6 shadow-xl">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/15">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-lg font-semibold text-[#18181B] dark:text-white">Hapus user?</h3>
                                <p className="mt-1 text-sm text-[#52525B] dark:text-[#A1A1AA]">
                                    Akun <span className="font-medium text-[#18181B] dark:text-white">{confirming.name}</span> ({confirming.email}) akan dihapus permanen beserta akses Studio-nya. Tindakan ini tidak bisa dibatalkan.
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
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={deleteUser}
                                disabled={deleting}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4" /> {deleting ? 'Menghapus...' : 'Hapus permanen'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </StudioLayout>
    );
}
