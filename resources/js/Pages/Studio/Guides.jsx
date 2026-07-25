import { Head } from '@inertiajs/react';
import { Rocket, Globe, Link as LinkIcon, Server } from 'lucide-react';
import StudioLayout from '@/Layouts/StudioLayout';

const STEPS = [
    {
        n: '01', icon: Rocket, title: 'Paste prompt ke AI',
        body: 'Buka ChatGPT, Claude, atau Gemini. Paste prompt yang kamu generate di Studio. AI akan menghasilkan kode website lengkap. Minta dalam satu file HTML kalau mau paling gampang di-deploy.',
    },
    {
        n: '02', icon: Server, title: 'Deploy gratis',
        body: 'Simpan hasil AI sebagai file .html. Buka netlify.com/drop atau vercel.com, drag & drop file/folder-nya. Dalam hitungan detik website kamu online dengan alamat gratis (contoh: namamu.netlify.app).',
    },
    {
        n: '03', icon: Globe, title: 'Beli domain sendiri (opsional)',
        body: 'Mau alamat sendiri seperti tokokamu.com? Beli domain mulai ±15rb–150rb/tahun di Niagahoster, Domainesia, atau Cloudflare. Ini opsional — website tetap jalan dengan alamat gratis.',
    },
    {
        n: '04', icon: LinkIcon, title: 'Connect domain',
        body: 'Di dashboard Netlify/Vercel, tambahkan domain kamu lalu ikuti instruksi DNS (arahkan A record / CNAME sesuai yang ditampilkan). Tunggu beberapa menit dan domain kamu langsung aktif.',
    },
];

const ADDONS = [
    'Form kontak / SMTP', 'Tombol WhatsApp mengambang', 'Google Analytics',
    'Meta (Facebook) Pixel', 'SEO dasar', 'Google Maps embed',
];

export default function Guides() {
    return (
        <StudioLayout>
            <Head title="Studio — Panduan Online" />

            <div className="mb-10">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">Panduan Online</span>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Dari nol sampai website tayang.</h1>
                <p className="mt-3 max-w-2xl text-[#A1A1AA]">
                    Empat langkah, bahasa awam. Ikuti berurutan dan website-mu online hari ini juga — tanpa perlu skill coding.
                </p>
            </div>

            <div className="space-y-4">
                {STEPS.map((s) => (
                    <div key={s.n} className="flex gap-5 rounded-xl border border-[#222] bg-[#111] p-6">
                        <div className="flex-shrink-0">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-400/10">
                                <s.icon className="h-5 w-5 text-emerald-400" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-emerald-400/70">{s.n}</span>
                                <h2 className="text-lg font-semibold text-white">{s.title}</h2>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-[#A1A1AA]">{s.body}</p>
                        </div>
                    </div>
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
        </StudioLayout>
    );
}
