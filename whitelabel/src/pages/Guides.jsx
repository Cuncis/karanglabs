import { useEffect, useState } from 'react';
import { Rocket, Globe, Link as LinkIcon, Server, X, ArrowRight } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import Modal from '@/components/Modal';
import TutorialButton from '@/components/TutorialButton';

const STEPS = [
    {
        n: '01', icon: Rocket, title: 'Paste prompt ke AI',
        body: 'Buka Claude, ChatGPT, atau Gemini. Paste prompt yang kamu generate di sini. AI akan menghasilkan kode website lengkap.',
        detail: [
            'Pilih engine sesuai jenis website kamu, isi brief singkat, lalu klik tombol **Copy** pada kotak prompt.',
            'Buka salah satu AI: Claude, ChatGPT, atau Gemini. *Versi gratisnya sudah cukup, tidak perlu berlangganan.*',
            'Paste prompt ke kolom chat, lalu tekan **Enter**.',
            'Tunggu AI selesai membuat kodenya. Kalau mau paling gampang di-deploy, tambahkan kalimat **"buat dalam satu file HTML"**.',
            '**Salin seluruh kode** hasil AI untuk dipakai di langkah berikutnya.',
        ],
    },
    {
        n: '02', icon: Server, title: 'Deploy gratis',
        body: 'Zip hasil AI-nya, login ke vercel.com/drop, lalu drag & drop. Website kamu langsung live.',
        detail: [
            'Simpan semua file dari AI ke satu folder, lalu kompres jadi satu file **.zip** *(kalau cuma satu file index.html, tidak perlu di-zip)*.',
            'Buka vercel.com/drop di browser, lalu **login dulu** *(bisa pakai akun GitHub, GitLab, atau email)*.',
            '**Drag & drop** file .zip (atau file index.html) kamu ke area upload.',
            'Tunggu beberapa detik, website kamu **langsung live** dengan alamat gratis, contoh: *namamu.vercel.app*.',
            '**Klik link** yang muncul untuk mengecek hasilnya di HP dan laptop.',
        ],
    },
    {
        n: '03', icon: Globe, title: 'Beli domain sendiri (opsional)',
        body: 'Mau alamat sendiri seperti tokokamu.com? Beli domain mulai ±15rb-150rb/tahun. Langkah ini opsional.',
        detail: [
            'Pikirkan nama domain yang kamu mau, contoh: *tokokamu.com* atau *namakamu.id*.',
            'Buka penyedia domain seperti Niagahoster, Domainesia, atau Cloudflare.',
            '**Cek ketersediaan nama**, lalu pilih ekstensi (.com, .id, .my.id) sesuai budget.',
            'Selesaikan pembayaran *(mulai ±15rb-150rb/tahun tergantung ekstensi)*.',
            'Domain kamu siap dihubungkan ke website di langkah berikutnya.',
        ],
    },
    {
        n: '04', icon: LinkIcon, title: 'Connect domain',
        body: 'Hubungkan domain yang kamu beli ke website di Vercel/Netlify lewat pengaturan DNS yang kami pandu.',
        detail: [
            'Buka dashboard Vercel/Netlify kamu, masuk ke menu **Domain settings**.',
            'Klik **"Add custom domain"**, lalu masukkan nama domain kamu.',
            '**Salin nilai DNS** yang ditampilkan *(biasanya berupa A record atau CNAME)*.',
            'Buka panel pengaturan domain kamu, **tambahkan record DNS** sesuai instruksi tadi.',
            'Tunggu beberapa menit *(kadang sampai 1 jam)* sampai domain kamu aktif. **Selesai!**',
        ],
    },
];

// Claude listed first: it's the priority AI for this prompt style.
const LINK_TERMS = [
    { text: 'Claude', url: 'https://claude.ai/new' },
    { text: 'ChatGPT', url: 'https://chatgpt.com/' },
    { text: 'Gemini', url: 'https://gemini.google.com/app' },
    { text: 'vercel.com/drop', url: 'https://vercel.com/drop' },
    { text: 'Vercel', url: 'https://vercel.com/dashboard' },
    { text: 'Netlify', url: 'https://app.netlify.com/' },
];

const LINK_TERM_PATTERN = LINK_TERMS.map((t) => t.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
const LINKIFY_URLS = Object.fromEntries(LINK_TERMS.map((t) => [t.text, t.url]));

// Parses **bold** (key action, pay attention) and *italic* (side note/example) markers
// in addition to auto-linking known AI/tool names, so step text can flag what matters.
const RICH_TEXT_PATTERN = new RegExp(`(\\*\\*[^*]+\\*\\*|\\*[^*]+\\*|${LINK_TERM_PATTERN})`, 'g');

function linkifyKnownTerms(text) {
    return text.split(RICH_TEXT_PATTERN).filter((part) => part !== '').map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={`b-${i}`} className="font-semibold text-brand-700 dark:text-brand-400">
                    {part.slice(2, -2)}
                </strong>
            );
        }

        if (part.startsWith('*') && part.endsWith('*')) {
            return (
                <em key={`i-${i}`} className="italic text-[#71717A] dark:text-[#888]">
                    {part.slice(1, -1)}
                </em>
            );
        }

        const url = LINKIFY_URLS[part];
        if (!url) {
            return part;
        }

        return (
            <a
                key={`l-${i}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-600 underline decoration-dotted underline-offset-2 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300"
                onClick={(e) => e.stopPropagation()}
            >
                {part}
            </a>
        );
    });
}

const ADDONS = [
    'Form kontak / SMTP', 'Tombol WhatsApp mengambang', 'Google Analytics',
    'Meta (Facebook) Pixel', 'SEO dasar', 'Google Maps embed',
];

export default function Guides() {
    const [active, setActive] = useState(null);

    useEffect(() => {
        document.title = 'Panduan Online';
    }, []);

    return (
        <AppLayout active="guides">
            <div className="mb-10 flex items-start justify-between gap-4">
                <div>
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Panduan Online</span>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#18181B] dark:text-white">Dari nol sampai website tayang.</h1>
                    <p className="mt-3 max-w-2xl text-[#52525B] dark:text-[#A1A1AA]">
                        Empat langkah, bahasa awam. Klik tiap kartu untuk lihat panduan lengkapnya.
                    </p>
                </div>
                <TutorialButton />
            </div>

            <div className="space-y-4">
                {STEPS.map((s) => (
                    <button
                        key={s.n}
                        type="button"
                        onClick={() => setActive(s)}
                        className="group flex w-full items-center gap-5 rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-6 text-left transition-all hover:border-[#C4C4C8] dark:hover:border-[#3a3a3a] hover:bg-[#EFEFF1] dark:hover:bg-[#161616]"
                    >
                        <div className="flex-shrink-0">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-400/10">
                                <s.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-brand-600/70 dark:text-brand-400/70">{s.n}</span>
                                <h2 className="text-lg font-semibold text-[#18181B] dark:text-white">{s.title}</h2>
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">{linkifyKnownTerms(s.body)}</p>
                        </div>
                        <span className="hidden flex-shrink-0 items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
                            Lihat panduan <ArrowRight className="h-4 w-4" />
                        </span>
                    </button>
                ))}
            </div>

            <div className="mt-8 rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-[#FAFAFA] dark:bg-[#0D0D0D] p-6">
                <h3 className="text-sm font-semibold text-[#18181B] dark:text-white">Add-on yang bisa kamu minta ke AI</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                    {ADDONS.map((a) => (
                        <span key={a} className="rounded-full border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] px-3 py-1.5 text-sm text-[#52525B] dark:text-[#A1A1AA]">{a}</span>
                    ))}
                </div>
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
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-400/10">
                                    <active.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                                </div>
                                <div>
                                    <span className="font-mono text-xs text-brand-600/70 dark:text-brand-400/70">Langkah {active.n}</span>
                                    <h2 className="text-xl font-bold text-[#18181B] dark:text-white">{active.title}</h2>
                                </div>
                            </div>

                            <p className="mt-4 text-sm leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">{linkifyKnownTerms(active.body)}</p>

                            <ol className="mt-6 space-y-3">
                                {active.detail.map((d, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-400 text-xs font-bold text-black">
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
        </AppLayout>
    );
}
