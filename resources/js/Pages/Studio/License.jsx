import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    KeyRound, Copy, Check, Download, Terminal, Palette, FileSpreadsheet, Rocket, Repeat,
    Clock, ShieldCheck, X, ArrowRight, Phone,
} from 'lucide-react';
import StudioLayout from '@/Layouts/StudioLayout';
import Modal from '@/Components/Modal';
import VideoTutorialButton from '@/Components/VideoTutorialButton';
import { buildLinkifier } from '@/Utils/richText';

const SUPPORT_WHATSAPP = '6283854775376';

const STEPS = [
    {
        n: '01', icon: Download, title: 'Download & extract',
        body: 'Download paket source code lengkap, lalu extract di komputer kamu.',
        detail: [
            'Klik tombol **Download paket** di halaman ini untuk mengunduh file .zip.',
            'Extract file .zip tadi ke folder di komputer kamu.',
            'Pastikan **Node.js** sudah terinstall *(kalau belum, download dulu di nodejs.org, gratis)*.',
        ],
    },
    {
        n: '02', icon: Palette, title: 'Rebrand jadi milikmu',
        body: 'Buka src/config.js, ganti nama, logo, warna, harga, dan link pembayaran jadi milikmu sendiri.',
        detail: [
            'Buka folder hasil extract pakai text editor apa saja *(VS Code, Sublime, Notepad juga bisa)*.',
            'Cari dan buka file **src/config.js**.',
            'Ganti `brandName`, `logoInitials`, dan `tagline` sesuai brand kamu.',
            'Ganti `accentColor` dengan satu kode warna hex — semua tombol dan aksen di website ikut berubah otomatis, *tidak perlu desain ulang*.',
            'Ganti `priceLabel`, `priceNote`, dan `paymentUrl` dengan harga dan link pembayaranmu sendiri *(Midtrans, Trakteer, QRIS, atau order via WhatsApp)*.',
            'Ganti `whatsapp` dengan nomor kontak support kamu sendiri.',
        ],
    },
    {
        n: '03', icon: FileSpreadsheet, title: 'Setup login pelanggan (Google Spreadsheet)',
        body: 'Login pelanggan dicek lewat Google Spreadsheet milikmu sendiri — gratis, tanpa server, tanpa database.',
        detail: [
            'Buka **Google Sheets**, buat spreadsheet baru, rename sheet pertama jadi "Customers".',
            'Isi baris pertama (header): `Email | Kode Akses | Status`.',
            'Buka menu **Extensions > Apps Script** di spreadsheet itu.',
            'Hapus kode default yang ada, lalu paste isi file `google-apps-script/Code.gs` dari paket yang kamu download.',
            'Klik **Deploy > New deployment**, pilih tipe **Web app**. Execute as: `Me`, Who has access: `Anyone`.',
            'Klik **Deploy**, izinkan permission yang diminta Google, lalu salin URL yang berakhiran `/exec`.',
            'Paste URL tadi ke `appsScriptUrl` di `src/config.js`.',
        ],
    },
    {
        n: '04', icon: Terminal, title: 'Build',
        body: 'Jalankan dua perintah di terminal untuk membangun website siap-upload dari source code.',
        detail: [
            'Buka **Terminal** (Mac/Linux) atau **Command Prompt** (Windows), lalu masuk ke folder hasil extract.',
            'Jalankan `npm install` *(sekali saja, untuk memasang dependensi)*.',
            'Jalankan `npm run build`.',
            'Akan muncul folder **dist/** — ini website statis kamu, sudah siap di-upload.',
        ],
    },
    {
        n: '05', icon: Rocket, title: 'Publish ke Vercel',
        body: 'Drag & drop folder dist/ ke vercel.com/drop, website kamu langsung live gratis.',
        detail: [
            'Buka **vercel.com/drop** di browser, lalu **login dulu** *(bisa pakai akun GitHub, GitLab, atau email)*.',
            '**Drag & drop** folder `dist/` (atau zip isinya) ke area upload.',
            'Tunggu beberapa detik, website kamu **langsung live** dengan alamat gratis, contoh: *namamu.vercel.app*.',
            '*(Opsional)* Hubungkan domain sendiri lewat menu **Domain settings** di dashboard Vercel.',
        ],
    },
    {
        n: '06', icon: Repeat, title: 'Jual & kelola pelanggan',
        body: 'Jual dengan hargamu sendiri. 100% keuntungan milikmu, tanpa bagi hasil ke kami.',
        detail: [
            'Bagikan link website kamu ke calon pembeli.',
            'Setelah pembeli bayar lewat `paymentUrl` kamu, tambahkan baris baru di sheet **Customers**: email, kode akses, dan status `active`.',
            'Kirim email + kode akses itu ke pembeli — mereka login di `websitekamu.com/#/login`.',
            'Untuk revoke akses, cukup ubah status jadi `inactive`, tidak perlu hapus barisnya.',
        ],
    },
];

const LINK_TERMS = [
    { text: 'Google Sheets', url: 'https://sheets.new' },
    { text: 'vercel.com/drop', url: 'https://vercel.com/drop' },
    { text: 'Node.js', url: 'https://nodejs.org' },
];

const linkifyKnownTerms = buildLinkifier(LINK_TERMS);

export default function License() {
    const { licenseKey, hasDownload, isAdmin } = usePage().props;
    const [copied, setCopied] = useState(false);
    const [active, setActive] = useState(null);

    const copyKey = () => {
        navigator.clipboard?.writeText(licenseKey || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    return (
        <StudioLayout>
            <Head title="Lisensi Reseller Studio" />

            <div className="mb-10 flex items-start justify-between gap-4">
                <div>
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
                <VideoTutorialButton />
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
            <p className="-mt-2 mb-4 text-sm text-[#52525B] dark:text-[#A1A1AA]">Enam langkah, dari download sampai website reseller kamu tayang. Klik tiap kartu untuk lihat panduan lengkapnya.</p>
            <div className="space-y-4">
                {STEPS.map((s) => (
                    <button
                        key={s.n}
                        type="button"
                        onClick={() => setActive(s)}
                        className="group flex w-full items-center gap-5 rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-6 text-left transition-all hover:border-[#C4C4C8] dark:hover:border-[#3a3a3a] hover:bg-[#EFEFF1] dark:hover:bg-[#161616]"
                    >
                        <div className="flex-shrink-0">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-400/10">
                                <s.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-emerald-600/70 dark:text-emerald-400/70">{s.n}</span>
                                <h2 className="text-lg font-semibold text-[#18181B] dark:text-white">{s.title}</h2>
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">{linkifyKnownTerms(s.body)}</p>
                        </div>
                        <span className="hidden flex-shrink-0 items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
                            Lihat panduan <ArrowRight className="h-4 w-4" />
                        </span>
                    </button>
                ))}
            </div>

            {/* Support contact */}
            <div className="mt-8 flex flex-col items-start gap-4 rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-[#FAFAFA] dark:bg-[#0D0D0D] p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#18181B] dark:text-white">
                        <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Butuh bantuan?
                    </div>
                    <p className="mt-1 text-sm text-[#52525B] dark:text-[#A1A1AA]">Kalau ada langkah yang macet atau error, langsung hubungi kami via WhatsApp.</p>
                </div>
                <a
                    href={`https://wa.me/${SUPPORT_WHATSAPP}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-shrink-0 items-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-emerald-300"
                >
                    <Phone className="h-4 w-4" /> Chat WhatsApp
                </a>
            </div>

            {/* Step detail popup */}
            <Modal show={active !== null} onClose={() => setActive(null)} maxWidth="2xl">
                {active && (
                    <div className="relative overflow-hidden rounded-2xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] text-[#27272A] dark:text-[#EDEDED]">
                        <button
                            type="button"
                            onClick={() => setActive(null)}
                            className="absolute right-4 top-4 z-10 rounded-full bg-black/40 p-1.5 text-[#52525B] dark:text-[#A1A1AA] transition-colors hover:bg-black/60 hover:text-[#18181B] dark:hover:text-white"
                            aria-label="Tutup"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="p-6 sm:p-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-400/10">
                                    <active.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <span className="font-mono text-xs text-emerald-600/70 dark:text-emerald-400/70">Langkah {active.n}</span>
                                    <h2 className="text-xl font-bold text-[#18181B] dark:text-white">{active.title}</h2>
                                </div>
                            </div>

                            <p className="mt-4 text-sm leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">{linkifyKnownTerms(active.body)}</p>

                            <ol className="mt-6 space-y-3">
                                {active.detail.map((d, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-black">
                                            {i + 1}
                                        </span>
                                        <span className="pt-0.5 text-sm leading-relaxed text-[#27272A] dark:text-[#EDEDED]">{linkifyKnownTerms(d)}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                )}
            </Modal>
        </StudioLayout>
    );
}
