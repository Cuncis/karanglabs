import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { KeyRound, Copy, Check, Download, Upload, Palette, Repeat, Clock, ShieldCheck } from 'lucide-react';
import StudioLayout from '@/Layouts/StudioLayout';

const STEPS = [
    { icon: Download, title: 'Download paket', body: 'Ambil file whitelabel lengkap (website + sistem login & dashboard member).' },
    { icon: Palette, title: 'Rebrand', body: 'Ganti nama, logo, warna, harga, dan link pembayaran jadi milikmu sendiri.' },
    { icon: Upload, title: 'Upload & jalankan', body: 'Upload ke hosting kamu, ikuti panduan setup (tanpa coding). Login pelanggan pakai Google Spreadsheet, tanpa biaya server.' },
    { icon: Repeat, title: 'Jual ulang', body: 'Jual dengan hargamu sendiri. 100% keuntungan milikmu, tanpa bagi hasil.' },
];

export default function License() {
    const { licenseKey, hasDownload, isAdmin } = usePage().props;
    const [copied, setCopied] = useState(false);

    const copyKey = () => {
        navigator.clipboard?.writeText(licenseKey || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    return (
        <StudioLayout>
            <Head title="Lisensi Reseller Studio" />

            <div className="mb-10">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                    <KeyRound className="h-3.5 w-3.5" /> Lisensi Reseller
                </span>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#18181B] dark:text-white">Whitelabel &amp; hak jual kembali.</h1>
                <p className="mt-3 max-w-2xl text-[#52525B] dark:text-[#A1A1AA]">
                    {isAdmin && !licenseKey
                        ? 'Kamu login sebagai admin. Kamu bisa mengelola dan mengunduh paket whitelabel di sini untuk keperluan testing atau distribusi.'
                        : 'Kamu punya lisensi reseller. Rebrand paket ini, jual dengan hargamu sendiri, dan simpan 100% keuntungannya.'}
                </p>
            </div>

            {/* License key */}
            {licenseKey ? (
                <div className="rounded-xl border border-[#E4E4E7] bg-white p-6 dark:border-[#222] dark:bg-[#111]">
                    <div className="text-sm font-semibold text-[#3F3F46] dark:text-[#D4D4D8]">License Key</div>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <code className="flex-1 rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] px-4 py-3 font-mono text-base tracking-wider text-[#18181B] dark:border-[#222] dark:bg-[#0D0D0D] dark:text-white">
                            {licenseKey}
                        </code>
                        <button
                            type="button"
                            onClick={copyKey}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-400 px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-emerald-300"
                        >
                            {copied ? <><Check className="h-4 w-4" /> Tersalin</> : <><Copy className="h-4 w-4" /> Copy</>}
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-[#8A8A93] dark:text-[#666]">Simpan baik-baik. Ini bukti kepemilikan lisensi kamu.</p>
                </div>
            ) : (
                <div className="rounded-xl border border-violet-400/30 bg-violet-400/5 p-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-violet-500 dark:text-violet-300">
                        <ShieldCheck className="h-4 w-4" /> Mode Admin
                    </div>
                    <p className="mt-2 text-sm text-[#52525B] dark:text-[#A1A1AA]">
                        Akun admin tidak punya license key pribadi. Gunakan halaman ini untuk mengunduh dan mengecek paket whitelabel yang diterima reseller.
                    </p>
                </div>
            )}

            {/* Download */}
            <div className="mt-6 rounded-xl border border-[#E4E4E7] bg-white p-6 dark:border-[#222] dark:bg-[#111]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="text-base font-semibold text-[#18181B] dark:text-white">Paket Whitelabel</div>
                        <div className="mt-1 text-sm text-[#52525B] dark:text-[#A1A1AA]">File website lengkap + sistem login &amp; dashboard member, siap upload.</div>
                        <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#8A8A93] dark:text-[#666]">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {isAdmin && !licenseKey
                                ? 'Download langsung sebagai admin.'
                                : 'Link download bersifat pribadi, terikat license key kamu & kedaluwarsa otomatis.'}
                        </div>
                    </div>
                    {hasDownload ? (
                        <a
                            href={route('studio.license.download')}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-emerald-300"
                        >
                            <Download className="h-4 w-4" /> Download paket
                        </a>
                    ) : (
                        <span className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#D4D4D8] px-5 py-3 text-sm font-medium text-[#8A8A93] dark:border-[#333] dark:text-[#666]">
                            <Clock className="h-4 w-4" /> Segera tersedia
                        </span>
                    )}
                </div>
            </div>

            {/* Setup guide */}
            <h2 className="mb-4 mt-10 text-sm font-semibold uppercase tracking-widest text-[#8A8A93] dark:text-[#666]">Cara pakai lisensi</h2>
            <div className="grid gap-4 sm:grid-cols-2">
                {STEPS.map((s, i) => (
                    <div key={s.title} className="rounded-xl border border-[#E4E4E7] bg-white p-6 dark:border-[#222] dark:bg-[#111]">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10">
                                <s.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="font-mono text-sm text-emerald-600/70 dark:text-emerald-400/70">0{i + 1}</span>
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-[#18181B] dark:text-white">{s.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">{s.body}</p>
                    </div>
                ))}
            </div>
        </StudioLayout>
    );
}
