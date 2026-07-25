import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Rocket, Globe, Link as LinkIcon, Server, Play, X, ArrowRight } from 'lucide-react';
import StudioLayout from '@/Layouts/StudioLayout';
import Modal from '@/Components/Modal';

const STEPS = [
    {
        n: '01', icon: Rocket, title: 'Paste prompt ke AI',
        body: 'Buka ChatGPT, Claude, atau Gemini. Paste prompt yang kamu generate di Studio. AI akan menghasilkan kode website lengkap.',
        // Ganti null dengan URL embed video kamu (YouTube/Vimeo/MP4). Contoh: 'https://www.youtube.com/embed/xxxxxxx'
        video: null,
        detail: [
            'Di Studio, pilih engine sesuai jenis website kamu, isi brief singkat, lalu klik tombol Copy pada kotak prompt.',
            'Buka salah satu AI: ChatGPT (chat.openai.com), Claude (claude.ai), atau Gemini (gemini.google.com). Versi gratisnya sudah cukup.',
            'Paste prompt ke kolom chat, lalu tekan Enter.',
            'Tunggu AI selesai membuat kodenya. Kalau mau paling gampang di-deploy, tambahkan kalimat "buat dalam satu file HTML".',
            'Salin seluruh kode hasil AI untuk dipakai di langkah berikutnya.',
        ],
    },
    {
        n: '02', icon: Server, title: 'Deploy gratis',
        body: 'Simpan hasil AI sebagai file, lalu upload ke Netlify atau Vercel. Website kamu langsung online dengan alamat gratis.',
        video: null,
        detail: [
            'Simpan kode dari AI sebagai file bernama index.html (atau minta AI mengirim file lengkapnya).',
            'Buka app.netlify.com/drop atau vercel.com di browser.',
            'Drag & drop file atau folder website ke area upload.',
            'Tunggu beberapa detik. Website kamu langsung online dengan alamat gratis, contoh: namamu.netlify.app.',
            'Klik link yang muncul untuk mengecek hasilnya di HP dan laptop.',
        ],
    },
    {
        n: '03', icon: Globe, title: 'Beli domain sendiri (opsional)',
        body: 'Mau alamat sendiri seperti tokokamu.com? Beli domain mulai ±15rb-150rb/tahun. Langkah ini opsional.',
        video: null,
        detail: [
            'Pikirkan nama domain yang kamu mau, contoh: tokokamu.com atau namakamu.id.',
            'Buka penyedia domain seperti Niagahoster, Domainesia, atau Cloudflare.',
            'Cek ketersediaan nama, lalu pilih ekstensi (.com, .id, .my.id) sesuai budget.',
            'Selesaikan pembayaran (mulai ±15rb-150rb/tahun tergantung ekstensi).',
            'Domain kamu siap dihubungkan ke website di langkah berikutnya.',
        ],
    },
    {
        n: '04', icon: LinkIcon, title: 'Connect domain',
        body: 'Hubungkan domain yang kamu beli ke website di Netlify/Vercel lewat pengaturan DNS yang kami pandu.',
        video: null,
        detail: [
            'Buka dashboard Netlify/Vercel kamu, masuk ke menu Domain settings.',
            'Klik "Add custom domain", lalu masukkan nama domain kamu.',
            'Salin nilai DNS yang ditampilkan (biasanya berupa A record atau CNAME).',
            'Buka panel pengaturan domain kamu, tambahkan record DNS sesuai instruksi tadi.',
            'Tunggu beberapa menit (kadang sampai 1 jam) sampai domain kamu aktif. Selesai!',
        ],
    },
];

const ADDONS = [
    'Form kontak / SMTP', 'Tombol WhatsApp mengambang', 'Google Analytics',
    'Meta (Facebook) Pixel', 'SEO dasar', 'Google Maps embed',
];

function VideoPlaceholder({ step }) {
    // Kalau step.video diisi, tampilkan video embed. Kalau belum, tampilkan placeholder.
    if (step.video) {
        return (
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-[#222] bg-black">
                <iframe
                    src={step.video}
                    title={step.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }

    return (
        <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#333] bg-[#0D0D0D] text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10">
                <Play className="h-6 w-6 translate-x-0.5 text-emerald-400" fill="currentColor" />
            </div>
            <p className="mt-4 text-sm font-medium text-[#A1A1AA]">Video tutorial akan tampil di sini</p>
            <p className="mt-1 text-xs text-[#555]">Ganti placeholder ini dengan video kamu</p>
        </div>
    );
}

export default function Guides() {
    const [active, setActive] = useState(null);

    return (
        <StudioLayout>
            <Head title="Panduan Online Studio" />

            <div className="mb-10">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">Panduan Online</span>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Dari nol sampai website tayang.</h1>
                <p className="mt-3 max-w-2xl text-[#A1A1AA]">
                    Empat langkah, bahasa awam. Klik tiap kartu untuk lihat panduan lengkap plus video tutorialnya.
                </p>
            </div>

            <div className="space-y-4">
                {STEPS.map((s) => (
                    <button
                        key={s.n}
                        type="button"
                        onClick={() => setActive(s)}
                        className="group flex w-full items-center gap-5 rounded-xl border border-[#222] bg-[#111] p-6 text-left transition-all hover:border-[#3a3a3a] hover:bg-[#161616]"
                    >
                        <div className="flex-shrink-0">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-400/10">
                                <s.icon className="h-5 w-5 text-emerald-400" />
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-emerald-400/70">{s.n}</span>
                                <h2 className="text-lg font-semibold text-white">{s.title}</h2>
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-[#A1A1AA]">{s.body}</p>
                        </div>
                        <span className="hidden flex-shrink-0 items-center gap-1 text-sm font-medium text-emerald-400 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
                            Lihat panduan <ArrowRight className="h-4 w-4" />
                        </span>
                    </button>
                ))}
            </div>

            <div className="mt-8 rounded-xl border border-[#222] bg-[#0D0D0D] p-6">
                <h3 className="text-sm font-semibold text-white">Add-on yang bisa kamu minta ke AI</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                    {ADDONS.map((a) => (
                        <span key={a} className="rounded-full border border-[#222] bg-[#111] px-3 py-1.5 text-sm text-[#A1A1AA]">{a}</span>
                    ))}
                </div>
            </div>

            {/* Step detail popup */}
            <Modal show={active !== null} onClose={() => setActive(null)} maxWidth="2xl">
                {active && (
                    <div className="relative overflow-hidden rounded-2xl border border-[#222] bg-[#111] text-[#EDEDED]">
                        <button
                            type="button"
                            onClick={() => setActive(null)}
                            className="absolute right-4 top-4 z-10 rounded-full bg-black/40 p-1.5 text-[#A1A1AA] transition-colors hover:bg-black/60 hover:text-white"
                            aria-label="Tutup"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="p-6 sm:p-8">
                            {/* Video placeholder (ganti dengan video tutorial kamu) */}
                            <VideoPlaceholder step={active} />

                            <div className="mt-6 flex items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-400/10">
                                    <active.icon className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <span className="font-mono text-xs text-emerald-400/70">Langkah {active.n}</span>
                                    <h2 className="text-xl font-bold text-white">{active.title}</h2>
                                </div>
                            </div>

                            <p className="mt-4 text-sm leading-relaxed text-[#A1A1AA]">{active.body}</p>

                            <ol className="mt-6 space-y-3">
                                {active.detail.map((d, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-black">
                                            {i + 1}
                                        </span>
                                        <span className="pt-0.5 text-sm leading-relaxed text-[#EDEDED]">{d}</span>
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
