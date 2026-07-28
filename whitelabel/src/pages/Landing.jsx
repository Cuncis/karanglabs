import { Check, MessageCircle, Sparkles } from 'lucide-react';
import { ENGINES } from '@/studioEngines';
import { CONFIG } from '@/config';

const FEATURES = [
    'Prompt siap-pakai untuk Claude, ChatGPT, dan Gemini, tinggal copy-paste',
    `${ENGINES.length} jenis website: landing page, toko online, company profile, undangan, dan lainnya`,
    'Panduan deploy gratis sampai website-mu tayang',
    'Update fitur baru, gratis selamanya',
];

export default function Landing() {
    const waLink = `https://wa.me/${CONFIG.whatsapp}`;

    return (
        <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#0A0A0A] font-sans text-[#27272A] dark:text-[#EDEDED] antialiased">
            <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-400/15 text-xs font-bold text-brand-700 dark:text-brand-300">
                        {CONFIG.logoInitials}
                    </div>
                    <span className="text-sm font-bold text-[#18181B] dark:text-white">{CONFIG.brandName}</span>
                </div>
                <a href="#/login" className="rounded-lg border border-[#D4D4D8] dark:border-[#333] px-4 py-2 text-sm font-medium text-[#27272A] dark:text-[#EDEDED] transition-colors hover:border-[#A1A1AA] dark:hover:border-[#555]">
                    Masuk
                </a>
            </header>

            <main className="mx-auto max-w-3xl px-6 py-16 text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-3 py-1 text-xs font-medium text-brand-700 dark:text-brand-300">
                    <Sparkles className="h-3.5 w-3.5" /> Bikin website pakai AI
                </span>
                <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#18181B] dark:text-white sm:text-5xl">
                    {CONFIG.tagline}
                </h1>
                <p className="mt-4 text-[#52525B] dark:text-[#A1A1AA]">
                    Isi brief singkat, dapatkan prompt siap-pakai, paste ke AI favoritmu, dan website-mu langsung jadi.
                </p>

                <div className="mt-10 space-y-3 text-left">
                    {FEATURES.map((f) => (
                        <div key={f} className="flex items-start gap-3 rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-4">
                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-600 dark:text-brand-400" />
                            <span className="text-sm text-[#27272A] dark:text-[#EDEDED]">{f}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-12 rounded-2xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-8">
                    <div className="text-3xl font-bold text-[#18181B] dark:text-white">{CONFIG.priceLabel}</div>
                    <div className="mt-1 text-sm text-[#71717A] dark:text-[#888]">{CONFIG.priceNote}</div>
                    <a
                        href={CONFIG.paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-400 px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-brand-300 sm:w-auto"
                    >
                        Beli Sekarang
                    </a>
                    <div className="mt-4 text-xs text-[#8A8A93] dark:text-[#666]">
                        Sudah beli? <a href="#/login" className="font-medium text-brand-600 underline decoration-dotted underline-offset-2 dark:text-brand-400">Masuk di sini</a>
                    </div>
                </div>

                <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#52525B] dark:text-[#A1A1AA] transition-colors hover:text-[#18181B] dark:hover:text-white"
                >
                    <MessageCircle className="h-4 w-4" /> Ada pertanyaan? Chat kami di WhatsApp
                </a>
            </main>
        </div>
    );
}
