import { Head } from '@inertiajs/react';
import { Mail, MessageCircle, BarChart3, Target, Search, MapPin } from 'lucide-react';
import StudioLayout from '@/Layouts/StudioLayout';

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

            <div className="mb-10">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">Add-ons</span>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Fitur tambahan untuk website-mu.</h1>
                <p className="mt-3 max-w-2xl text-[#A1A1AA]">
                    Semua add-on ini bisa kamu minta langsung ke AI saat generate, cukup sebutkan di brief atau tambahkan di chat lanjutan. Gratis, tanpa biaya bulanan.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {ADDONS.map((a) => (
                    <div key={a.title} className="rounded-xl border border-[#222] bg-[#111] p-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10">
                            <a.icon className="h-5 w-5 text-emerald-400" />
                        </div>
                        <h2 className="mt-4 text-base font-semibold text-white">{a.title}</h2>
                        <p className="mt-2 text-sm leading-relaxed text-[#888]">{a.body}</p>
                    </div>
                ))}
            </div>
        </StudioLayout>
    );
}
