import { useState } from 'react';
import { KeyRound, LogIn } from 'lucide-react';
import { CONFIG } from '@/config';
import { login } from '@/lib/auth';

const REASON_MESSAGES = {
    not_found: 'Email atau kode akses tidak ditemukan. Cek kembali data yang kamu terima setelah pembayaran.',
    inactive: 'Akses kamu belum/tidak aktif. Hubungi kami lewat WhatsApp untuk bantuan.',
    network: 'Tidak bisa terhubung ke server pengecekan akses. Cek koneksi internet kamu dan coba lagi.',
};

export default function Login() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = await login(email, code);

        setLoading(false);

        if (result.ok) {
            window.location.hash = '#/app';
        } else {
            setError(REASON_MESSAGES[result.reason] || 'Gagal masuk. Coba lagi.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F4F4F5] px-6 dark:bg-[#0A0A0A]">
            <div className="w-full max-w-sm rounded-2xl border border-[#E4E4E7] bg-white p-8 dark:border-[#222] dark:bg-[#111]">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-400/15 text-xs font-bold text-brand-700 dark:text-brand-300">
                        {CONFIG.logoInitials}
                    </div>
                    <span className="text-sm font-bold text-[#18181B] dark:text-white">{CONFIG.brandName}</span>
                </div>

                <h1 className="mt-6 text-xl font-bold text-[#18181B] dark:text-white">Masuk</h1>
                <p className="mt-1 text-sm text-[#71717A] dark:text-[#888]">
                    Masukkan email dan kode akses yang kamu terima setelah pembayaran.
                </p>

                <form onSubmit={submit} className="mt-6 space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-[#3F3F46] dark:text-[#D4D4D8]">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nama@email.com"
                            className="w-full rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] px-3 py-2 text-sm text-[#27272A] placeholder-[#9CA3AF] focus:border-brand-400/50 focus:outline-none focus:ring-1 focus:ring-brand-400/30 dark:border-[#222] dark:bg-[#0D0D0D] dark:text-[#EDEDED]"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-[#3F3F46] dark:text-[#D4D4D8]">Kode Akses</label>
                        <div className="relative">
                            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                            <input
                                type="text"
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Kode dari kami"
                                className="w-full rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] py-2 pl-9 pr-3 text-sm text-[#27272A] placeholder-[#9CA3AF] focus:border-brand-400/50 focus:outline-none focus:ring-1 focus:ring-brand-400/30 dark:border-[#222] dark:bg-[#0D0D0D] dark:text-[#EDEDED]"
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-400 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? 'Memeriksa...' : <><LogIn className="h-4 w-4" /> Masuk</>}
                    </button>
                </form>

                <a href="#/" className="mt-6 block text-center text-sm text-[#8A8A93] dark:text-[#666]">
                    &larr; Kembali ke halaman utama
                </a>
            </div>
        </div>
    );
}
