import { Head } from '@inertiajs/react';
import { Mail, MessageCircle, BarChart3, Target, Search, MapPin } from 'lucide-react';
import StudioLayout from '@/Layouts/StudioLayout';
import VideoTutorialButton from '@/Components/VideoTutorialButton';

const ADDONS = [
    { icon: Mail, title: 'Form Kontak / SMTP', body: 'Terima pesan pengunjung langsung ke email kamu. Minta AI menambahkan form + integrasi layanan gratis (Formspree / Web3Forms).' },
    { icon: MessageCircle, title: 'Tombol WhatsApp Mengambang', body: 'Tombol chat WA yang selalu tampil di pojok layar. Tinggal sebutkan nomor WA-mu di brief.' },
    { icon: BarChart3, title: 'Google Analytics', body: 'Pantau berapa banyak yang mengunjungi website-mu. Tempel kode pengukuran GA4 yang kami pandu cara ambilnya.' },
    { icon: Target, title: 'Meta Pixel', body: 'Lacak konversi untuk iklan Facebook & Instagram kamu. Cocok kalau kamu jualan lewat ads.' },
    { icon: Search, title: 'SEO Dasar', body: 'Meta title, description, Open Graph, dan struktur heading yang benar biar gampang ditemukan di Google.' },
    { icon: MapPin, title: 'Google Maps', body: 'Tampilkan lokasi usahamu langsung di halaman. Cukup tempel link Google Maps di brief engine terkait.' },
];

export default function Addons() {
    return (
        <StudioLayout>
            <Head title="Add-ons Studio" />

            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Add-ons</span>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#18181B] dark:text-white">Fitur tambahan untuk website-mu.</h1>
                    <p className="mt-3 max-w-2xl text-[#52525B] dark:text-[#A1A1AA]">
                        Cukup centang add-on ini di bagian <span className="font-medium text-[#27272A] dark:text-white">Add-on (opsional)</span> pada form tiap engine, isi ID/endpoint kalau diminta, dan instruksinya otomatis ikut ke dalam prompt. Gratis, tanpa biaya bulanan.
                    </p>
                </div>
                <VideoTutorialButton />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {ADDONS.map((a) => (
                    <div key={a.title} className="rounded-xl border border-[#E4E4E7] dark:border-[#222] bg-white dark:bg-[#111] p-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10">
                            <a.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="mt-4 text-base font-semibold text-[#18181B] dark:text-white">{a.title}</h2>
                        <p className="mt-2 text-sm leading-relaxed text-[#71717A] dark:text-[#888]">{a.body}</p>
                    </div>
                ))}
            </div>
        </StudioLayout>
    );
}
