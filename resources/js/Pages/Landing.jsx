import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

const LOGO = 'https://cdn.libradigital.id/logo-01%20(1)%20(1).png';

/* ---------------------------------------------------------------- data --- */

const NAV_LINKS = [
    { label: 'Fitur', href: '#fitur' },
    { label: 'Cara Kerja', href: '#cara-kerja' },
    { label: 'Showcase', href: '#showcase' },
    { label: 'Harga', href: '#harga' },
    { label: 'FAQ', href: '#faq' },
];

const CATEGORIES = [
    'UMKM', 'Kafe & Resto', 'Toko Online', 'Fotografer', 'Wedding & MUA', 'Skincare',
    'Fashion', 'Jasa Servis', 'Les Privat', 'Fitness', 'Properti', 'Agency',
    'Freelancer', 'Mahasiswa & CV', 'Undangan', 'Komunitas', 'Event', 'Travel',
    'Klinik', 'Bengkel',
];

const PAIN_POINTS = [
    {
        n: '01/04',
        title: 'Jasa developer mahal.',
        body: 'Company profile sederhana aja dihargai 2-5 juta. Revisi? Bayar lagi.',
    },
    {
        n: '02/04',
        title: 'Website builder nagih tiap bulan.',
        body: 'Wix, hosting WordPress, domain premium, belum cuan udah keluar ratusan ribu per bulan.',
    },
    {
        n: '03/04',
        title: 'Nyoba AI, hasilnya berantakan.',
        body: '"Buatkan website toko kue" doang → layout aneh, warna tabrakan, gak ada strukturnya. Masalahnya bukan AI-nya, tapi brief-nya.',
    },
    {
        n: '04/04',
        title: 'Istilah teknis bikin mundur.',
        body: 'Hosting? DNS? Deploy? Kamu cuma mau website yang jadi, bagus, dan online.',
    },
];

const ENGINES = [
    {
        code: 'M1', name: 'Landing Page', star: false,
        desc: 'Jualan produk, kumpulin leads, atau promo event, satu halaman yang fokus closing.',
        bullets: ['Section lengkap hero→CTA', 'Copywriting persuasif', 'CTA WA / form / link bayar'],
    },
    {
        code: 'M2', name: 'Toko Online / Katalog', star: false,
        desc: 'Katalog produk rapi + tombol order langsung.',
        bullets: ['Input produk & harga', 'Filter kategori & badge', 'Order via WA / marketplace'],
    },
    {
        code: 'M3', name: 'Company Profile', star: false,
        desc: 'Bikin usaha kelihatan kredibel & profesional.',
        bullets: ['Visi-misi & layanan', 'Galeri + klien/partner', 'Kontak + Google Maps'],
    },
    {
        code: 'M4', name: 'Portfolio / CV Online', star: false,
        desc: 'Karya & pengalamanmu, online & gampang dibagikan.',
        bullets: ['Showcase grid/studi kasus', 'Skill & pengalaman', 'Tombol download CV'],
    },
    {
        code: 'M5', name: 'Undangan Digital', star: true,
        desc: 'Undangan pernikahan & acara lengkap fitur kekinian.',
        bullets: ['Countdown + RSVP WA', 'Amplop digital QRIS', 'Nama tamu via ?to='],
    },
    {
        code: 'M6', name: 'Link-in-Bio', star: false,
        desc: 'Semua link kamu dalam satu halaman cantik.',
        bullets: ['Unlimited link', 'Gaya tombol custom', 'Ikon sosmed lengkap'],
    },
    {
        code: 'M7', name: 'Menu F&B', star: true,
        desc: 'Menu resto/kafe digital + order via WA.',
        bullets: ['Kategori & badge menu', 'Template pesan WA otomatis', 'Jam buka & lokasi'],
    },
    {
        code: 'M8', name: 'Halaman Jasa', star: false,
        desc: 'Halaman jualan jasa dengan paket harga.',
        bullets: ['Sampai 3 tier paket', 'Proses kerja & testimoni', 'Booking via WA/form'],
    },
];

const SHOWCASE = [
    {
        label: '/01 · landing page & toko online',
        items: ['from-emerald-500/30 to-teal-500/10', 'from-indigo-500/30 to-purple-500/10', 'from-rose-500/30 to-orange-500/10', 'from-sky-500/30 to-cyan-500/10', 'from-amber-500/30 to-yellow-500/10', 'from-fuchsia-500/30 to-pink-500/10'],
    },
    {
        label: '/02 · undangan digital & link-in-bio',
        items: ['from-rose-500/30 to-pink-500/10', 'from-amber-500/30 to-orange-500/10', 'from-emerald-500/30 to-lime-500/10', 'from-violet-500/30 to-indigo-500/10', 'from-cyan-500/30 to-sky-500/10', 'from-fuchsia-500/30 to-rose-500/10'],
    },
    {
        label: '/03 · company profile · portfolio · menu F&B',
        items: ['from-slate-500/30 to-gray-500/10', 'from-teal-500/30 to-emerald-500/10', 'from-orange-500/30 to-red-500/10', 'from-blue-500/30 to-indigo-500/10', 'from-lime-500/30 to-green-500/10', 'from-purple-500/30 to-violet-500/10'],
    },
];

const STEPS = [
    {
        n: '01', title: 'Isi brief 1 menit.',
        body: 'Pilih jenis website, isi nama brand, gaya, warna. Ada tombol "Isi Contoh" kalau bingung.',
    },
    {
        n: '02', title: 'Copy prompt, paste ke AI.',
        body: 'ChatGPT, Claude, Gemini, bebas. Prompt-nya udah lengkap, AI tinggal eksekusi.',
    },
    {
        n: '03', title: 'Website jadi, online hari ini.',
        body: 'Deploy gratis ikutin panduan. Selesai. Punya website tanpa keluar biaya bulanan.',
    },
];

const DIFFERENTIATORS = [
    { title: 'Prompt presisi', body: 'Tiap jawaban form dipetakan ke instruksi desain & struktur yang detail.' },
    { title: '8 jenis website', body: 'Dari landing page sampai undangan, semua ada engine-nya.' },
    { title: 'Kompatibel semua AI', body: 'Gak kekunci di satu platform.' },
    { title: 'Sekali bayar', body: 'Tanpa langganan, tanpa kredit, akses penuh selamanya.' },
    { title: 'Unlimited generate', body: 'Sebanyak apapun, gak ada limit harian.' },
    { title: 'Update selamanya', body: 'Engine baru, panduan baru, add-on baru, otomatis masuk akunmu.' },
];

const PERSONAS = [
    { tag: 'PALING COCOK', title: 'UMKM & Pemilik Usaha', body: 'Punya website profesional tanpa nyisihin budget jutaan.' },
    { tag: null, title: 'Freelancer & Penyedia Jasa', body: 'Halaman jasa + paket harga, kelihatan lebih serius dari sekadar IG.' },
    { tag: null, title: 'Reseller & Dropshipper', body: 'Katalog produk rapi tanpa biaya bulanan marketplace premium.' },
    { tag: null, title: 'Wedding Organizer & MUA', body: 'Bikinin undangan digital klien, tarif kamu yang atur.' },
    { tag: null, title: 'Mahasiswa & Job Seeker', body: 'CV online yang bikin HRD inget kamu.' },
    { tag: null, title: 'Yang Mau Jualan Jasa Website', body: 'Modal 99rb, jasa bikin website-mu bisa dihargai ratusan ribu per proyek.' },
];

const COMPARE = [
    { label: 'Waktu jadi', dev: '1-4 minggu', ok: 'Di bawah 1 jam' },
    { label: 'Biaya', dev: 'Rp 2-5 juta', ok: 'Sekali Rp 99rb' },
    { label: 'Revisi', dev: 'Antri & bayar lagi', ok: 'Re-generate instan' },
    { label: 'Skill', dev: 'HTML/CSS/hosting', ok: 'Cuma isi form' },
    { label: 'Biaya bulanan', dev: 'Hosting + maintenance', ok: 'Rp 0' },
    { label: 'Skala', dev: '1 proyek = 1 antrian', ok: 'Unlimited website' },
];

const TESTIMONIALS = [
    { quote: 'Undangan nikah adikku jadi dalam semalam, keluarga ngiranya bayar jasa ratusan ribu.', name: 'Dini', role: 'ibu rumah tangga' },
    { quote: 'Sekarang tiap klien foto dapet bonus mini-web galeri. Nilai jualku naik.', name: 'Fajar', role: 'fotografer' },
    { quote: 'Company profile usahaku jadi kelihatan jauh lebih kredibel di mata calon klien.', name: 'Rangga', role: 'pemilik jasa servis' },
    { quote: 'Modal 99rb, proyek pertama bikinin undangan udah balik modal 3x lipat.', name: 'Sasha', role: 'wedding organizer' },
    { quote: 'CV online-ku bikin HRD nge-chat duluan. Beda banget sama PDF biasa.', name: 'Bima', role: 'fresh graduate' },
    { quote: 'Katalog tokoku online tanpa bayar bulanan marketplace. Order langsung ke WA.', name: 'Nadia', role: 'reseller skincare' },
];

const FAQS = [
    { q: 'Bedanya sama Wix / website builder?', a: 'Builder nyewain tools-nya tiap bulan. Karanglabs sekali bayar, website-nya milikmu penuh, hosting-nya gratis.' },
    { q: 'Aku gak bisa coding sama sekali, bisa?', a: 'Justru buat kamu. Isi form → copy → paste. Sisanya AI + panduan kami.' },
    { q: 'AI apa aja yang bisa dipakai?', a: 'ChatGPT, Claude, Gemini, v0, Lovable, termasuk versi gratisnya.' },
    { q: 'Hosting-nya beneran gratis?', a: 'Ya, pakai Netlify/Vercel/GitHub Pages. Panduannya ada di dashboard. Domain sendiri opsional (±15rb-150rb/tahun).' },
    { q: 'Ada biaya bulanan?', a: 'Tidak. Rp 99.000 sekali, akses seumur hidup, tanpa limit.' },
    { q: 'Dapat update fitur baru?', a: 'Ya, engine & panduan baru otomatis masuk akunmu, selamanya.' },
    { q: 'Cara akses setelah bayar?', a: 'Login pakai email yang kamu daftarkan, langsung masuk dashboard.' },
    { q: 'Boleh dipakai bikinin website klien?', a: 'Boleh banget. Banyak user justru balik modal dari 1 proyek pertama.' },
    { q: 'Berapa banyak website yang bisa dibuat?', a: 'Unlimited. Generate sepuasnya.' },
    { q: 'Lisensi whitelabel itu gimana?', a: 'Kamu dapat seluruh file website ini, ganti jadi brand-mu, jual dengan hargamu, untung 100% milikmu.' },
];

const PROMPT_TEXT = `Buat landing page untuk "Kopi Senja", kedai kopi minimalis modern.
Struktur: hero (tagline hangat + foto latte), menu unggulan (6 item + harga),
tentang kami, galeri suasana, lokasi + Google Maps, dan CTA order via WhatsApp.
Palet: cokelat hangat + krem, font clean, layout rapi & mobile-first.
Output: satu file HTML + Tailwind, siap deploy.`;

/* -------------------------------------------------------------- helpers --- */

function Check() {
    return (
        <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
    );
}

function SectionLabel({ children }) {
    return (
        <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
            {children}
        </span>
    );
}

function useTypewriter(text, speed = 28) {
    const [output, setOutput] = useState('');

    useEffect(() => {
        let i = 0;
        let timer;
        const tick = () => {
            setOutput(text.slice(0, i));
            if (i <= text.length) {
                i += 1;
                timer = setTimeout(tick, speed);
            }
        };
        tick();

        return () => clearTimeout(timer);
    }, [text, speed]);

    return output;
}

function useCountdown(days = 5) {
    const target = useMemo(() => Date.now() + days * 24 * 60 * 60 * 1000, [days]);
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);

        return () => clearInterval(id);
    }, []);

    const diff = Math.max(0, target - now);
    const pad = (n) => String(n).padStart(2, '0');

    return {
        d: pad(Math.floor(diff / 86400000)),
        h: pad(Math.floor((diff / 3600000) % 24)),
        m: pad(Math.floor((diff / 60000) % 60)),
        s: pad(Math.floor((diff / 1000) % 60)),
    };
}

/* ----------------------------------------------------------------- page --- */

export default function Landing() {
    const { auth } = usePage().props;
    const [menuOpen, setMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState(0);
    const typed = useTypewriter(PROMPT_TEXT);
    const [copied, setCopied] = useState(false);
    const countdown = useCountdown(5);

    const copyPrompt = () => {
        navigator.clipboard?.writeText(PROMPT_TEXT);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    return (
        <>
            <Head title="Karanglabs, Website Profesional Tanpa Coding" />

            <style>{`
                html { scroll-behavior: smooth; }
                @keyframes kl-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                .kl-marquee { animation: kl-marquee 40s linear infinite; }
                @keyframes kl-blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
                .kl-cursor { animation: kl-blink 1s step-end infinite; }
                @keyframes kl-pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
                .kl-live { animation: kl-pulse-dot 1.4s ease-in-out infinite; }
            `}</style>

            <div className="min-h-screen bg-[#0A0A0A] font-sans text-[#EDEDED] antialiased selection:bg-emerald-400 selection:text-black">

                {/* ============================================= 1 · NAVBAR === */}
                <header className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-[#0A0A0A]/85 backdrop-blur-md">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <a href="#top" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white">
                            <img src={LOGO} alt="Karanglabs" className="h-8 w-8 rounded-md object-contain" />
                            Karanglabs
                        </a>

                        <nav className="hidden items-center gap-8 md:flex">
                            {NAV_LINKS.map((link) => (
                                <a key={link.href} href={link.href} className="text-sm text-[#A1A1AA] transition-colors hover:text-white">
                                    {link.label}
                                </a>
                            ))}
                        </nav>

                        <div className="hidden items-center gap-3 md:flex">
                            {auth?.user ? (
                                <Link href={route('studio.index')} className="rounded-md px-4 py-2 text-sm font-medium text-[#A1A1AA] transition-colors hover:text-white">
                                    Buka Studio
                                </Link>
                            ) : (
                                <Link href={route('login')} className="rounded-md px-4 py-2 text-sm font-medium text-[#A1A1AA] transition-colors hover:text-white">
                                    Log in
                                </Link>
                            )}
                            <a href="#harga" className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-300">
                                Klaim Early Access
                            </a>
                        </div>

                        <button type="button" onClick={() => setMenuOpen((v) => !v)} className="md:hidden" aria-label="Menu">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                            </svg>
                        </button>
                    </div>

                    {menuOpen && (
                        <div className="border-t border-[#1a1a1a] bg-[#0A0A0A] px-6 py-4 md:hidden">
                            <nav className="flex flex-col gap-1">
                                {NAV_LINKS.map((link) => (
                                    <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-md px-2 py-2.5 text-sm text-[#A1A1AA] hover:bg-[#111] hover:text-white">
                                        {link.label}
                                    </a>
                                ))}
                                <a href="#harga" onClick={() => setMenuOpen(false)} className="mt-2 rounded-md bg-emerald-400 px-4 py-2.5 text-center text-sm font-semibold text-black">
                                    Klaim Early Access
                                </a>
                            </nav>
                        </div>
                    )}
                </header>

                <main id="top">

                    {/* ========================================== 2 · HERO === */}
                    <section className="relative overflow-hidden border-b border-[#141414]">
                        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
                        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
                            <div>
                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium tracking-wide text-emerald-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 kl-live" />
                                    EARLY ACCESS · BATCH PERTAMA
                                </span>

                                <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
                                    Tanpa Coding, Tanpa Developer, Semua Orang Bisa Buat Website Profesional
                                </h1>

                                <p className="mt-6 text-lg leading-relaxed text-[#A1A1AA]">
                                    Semua orang bisa buat website simpel dan gratis, cuma 99rb. Isi form, copy prompt-nya,
                                    paste ke ChatGPT / Claude / Gemini, website kamu jadi dan online hari ini juga.
                                    Tanpa langganan, tanpa biaya hosting.
                                </p>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <a href="#harga" className="rounded-lg bg-emerald-400 px-6 py-3 text-center text-sm font-semibold text-black transition-colors hover:bg-emerald-300">
                                        Ambil Early Access, Rp 99.000
                                    </a>
                                    <a href="#cara-kerja" className="rounded-lg border border-[#333] px-6 py-3 text-center text-sm font-medium text-[#EDEDED] transition-colors hover:border-[#555] hover:bg-[#111]">
                                        Lihat Cara Kerjanya
                                    </a>
                                </div>

                                <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#888]">
                                    <span className="flex items-center gap-2"><Check /> Sekali bayar, seumur hidup</span>
                                    <span className="flex items-center gap-2"><Check /> 8 engine generator website</span>
                                    <span className="flex items-center gap-2"><Check /> Unlimited generate</span>
                                </div>
                            </div>

                            {/* Interactive mockup */}
                            <div className="rounded-xl border border-[#222] bg-[#0D0D0D] shadow-2xl">
                                <div className="flex items-center gap-2 border-b border-[#222] px-4 py-3">
                                    <span className="h-3 w-3 rounded-full bg-[#333]" />
                                    <span className="h-3 w-3 rounded-full bg-[#333]" />
                                    <span className="h-3 w-3 rounded-full bg-[#333]" />
                                    <div className="ml-3 flex flex-1 items-center gap-2 rounded-md bg-[#161616] px-3 py-1.5 text-xs text-[#888]">
                                        <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        app.karanglabs.cloud/studio
                                    </div>
                                    <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 kl-live" /> LIVE
                                    </span>
                                </div>

                                <div className="space-y-4 p-5">
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <label className="flex flex-col gap-1.5">
                                            <span className="text-[#666]">BRAND</span>
                                            <span className="rounded-md border border-[#222] bg-[#111] px-3 py-2 text-[#EDEDED]">Kopi Senja</span>
                                        </label>
                                        <label className="flex flex-col gap-1.5">
                                            <span className="text-[#666]">JENIS</span>
                                            <span className="flex items-center justify-between rounded-md border border-[#222] bg-[#111] px-3 py-2 text-[#EDEDED]">Landing Page <span className="text-[#555]">▾</span></span>
                                        </label>
                                        <label className="flex flex-col gap-1.5">
                                            <span className="text-[#666]">STYLE</span>
                                            <span className="flex items-center justify-between rounded-md border border-[#222] bg-[#111] px-3 py-2 text-[#EDEDED]">Minimalis Modern <span className="text-[#555]">▾</span></span>
                                        </label>
                                        <label className="flex flex-col gap-1.5">
                                            <span className="text-[#666]">WARNA</span>
                                            <span className="flex items-center gap-1.5 rounded-md border border-[#222] bg-[#111] px-3 py-2">
                                                <span className="h-4 w-4 rounded-full bg-amber-700" />
                                                <span className="h-4 w-4 rounded-full bg-amber-200" />
                                                <span className="h-4 w-4 rounded-full bg-stone-400" />
                                            </span>
                                        </label>
                                    </div>

                                    <button type="button" className="w-full rounded-md bg-emerald-400 py-2 text-xs font-semibold text-black">
                                        Generate ▸
                                    </button>

                                    <div className="rounded-md border border-[#222] bg-[#0A0A0A] p-3">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-[10px] uppercase tracking-wider text-[#666]">Prompt</span>
                                            <button type="button" onClick={copyPrompt} className="rounded border border-[#333] px-2 py-0.5 text-[10px] text-[#A1A1AA] hover:bg-[#161616]">
                                                {copied ? 'Copied ✓' : 'Copy'}
                                            </button>
                                        </div>
                                        <pre className="min-h-[110px] whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-emerald-200/90">
                                            {typed}<span className="kl-cursor">▋</span>
                                        </pre>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#222] pt-3 text-[10px] text-[#555]">
                                        <span>karanglabs · v1.0</span>
                                        <span>Rata-rata &lt; 60 detik brief → prompt</span>
                                        <span>Output: HTML / React · semua AI</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ==================================== 3 · MARQUEE === */}
                    <section className="border-b border-[#141414] py-8">
                        <p className="mb-5 text-center text-xs uppercase tracking-[0.2em] text-[#666]">bisa untuk semua jenis usaha &amp; kebutuhan</p>
                        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                            <div className="flex w-max kl-marquee">
                                {[...CATEGORIES, ...CATEGORIES].map((cat, i) => (
                                    <span key={i} className="mx-3 whitespace-nowrap rounded-full border border-[#222] bg-[#111] px-4 py-1.5 text-sm text-[#A1A1AA]">
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ================================= 4 · PAIN POINTS === */}
                    <section className="mx-auto max-w-6xl px-6 py-24">
                        <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Mau punya website aja, drama-nya banyak.
                        </h2>
                        <p className="mt-4 max-w-2xl text-lg text-[#A1A1AA]">
                            Padahal zaman sekarang, gak punya website = kelihatan kurang profesional. Tapi jalur yang ada semuanya bikin mikir dua kali:
                        </p>
                        <div className="mt-12 grid gap-4 sm:grid-cols-2">
                            {PAIN_POINTS.map((p) => (
                                <div key={p.n} className="rounded-xl border border-[#222] bg-[#111] p-6">
                                    <span className="font-mono text-xs text-emerald-400">{p.n}</span>
                                    <h3 className="mt-3 text-lg font-semibold text-white">{p.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-[#888]">{p.body}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ==================================== 5 · SOLUSI === */}
                    <section id="fitur" className="border-y border-[#141414] bg-[#0D0D0D]">
                        <div className="mx-auto max-w-6xl px-6 py-24">
                            <SectionLabel>Jawabannya satu</SectionLabel>
                            <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                Karanglabs bukan website builder. Ini engine brief profesional.
                            </h2>
                            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#A1A1AA]">
                                Setiap prompt yang dihasilkan Karanglabs setara brief web designer senior, struktur section,
                                copywriting, arahan visual, sampai instruksi teknis, semua sudah diracik. Kamu tinggal paste ke
                                AI favoritmu, dan AI-nya yang kerja. Hasilnya konsisten, rapi, dan layak tayang.
                            </p>
                            <div className="mt-10 grid gap-3 sm:grid-cols-2">
                                {[
                                    '8 engine generator, tiap jenis website punya logic form sendiri',
                                    'Kompatibel semua AI: ChatGPT · Claude · Gemini · v0 · Lovable',
                                    'Website-nya di-host gratis (Netlify / Vercel / GitHub Pages), dipandu sampai online',
                                    'Tanpa coding · tanpa langganan · tanpa developer',
                                ].map((b) => (
                                    <div key={b} className="flex items-start gap-3 rounded-lg border border-[#222] bg-[#111] p-4 text-sm text-[#EDEDED]">
                                        <Check /> {b}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ================================== 6 · SHOWCASE === */}
                    <section id="showcase" className="mx-auto max-w-6xl px-6 py-24">
                        <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Hasil real dari prompt Karanglabs, digenerate AI dalam hitungan menit.
                        </h2>
                        <div className="mt-12 space-y-8">
                            {SHOWCASE.map((row) => (
                                <div key={row.label}>
                                    <p className="mb-3 font-mono text-xs text-[#666]">{row.label}</p>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                                        {row.items.map((grad, i) => (
                                            <div key={i} className={`aspect-[4/3] rounded-lg border border-[#222] bg-gradient-to-br ${grad}`} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ================================== 7 · ENGINES === */}
                    <section className="border-y border-[#141414] bg-[#0D0D0D]">
                        <div className="mx-auto max-w-6xl px-6 py-24">
                            <SectionLabel>8 Engine · 1 Studio</SectionLabel>
                            <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                Delapan engine yang dirancang beda untuk tiap jenis website.
                            </h2>
                            <p className="mt-4 max-w-3xl text-lg text-[#A1A1AA]">
                                Bukan satu form dipakai buat semua. Tiap engine punya pertanyaan sendiri, biar prompt-nya presisi sesuai jenis website-nya.
                            </p>
                            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {ENGINES.map((e) => (
                                    <div key={e.code} className="flex flex-col rounded-xl border border-[#222] bg-[#111] p-5 transition-colors hover:border-[#3a3a3a]">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-xs text-emerald-400">{e.code}</span>
                                            {e.star && <span className="text-xs text-amber-400">★ laris</span>}
                                        </div>
                                        <h3 className="mt-2 text-base font-semibold text-white">{e.name}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-[#888]">{e.desc}</p>
                                        <ul className="mt-4 space-y-1.5 border-t border-[#222] pt-4 text-xs text-[#A1A1AA]">
                                            {e.bullets.map((b) => (
                                                <li key={b} className="flex items-start gap-2"><span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-400" />{b}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ============================ 8 · UNDANGAN HIGHLIGHT === */}
                    <section className="mx-auto max-w-6xl px-6 py-24">
                        <div className="grid items-center gap-10 rounded-2xl border border-[#222] bg-gradient-to-br from-rose-500/10 via-[#111] to-[#0D0D0D] p-8 lg:grid-cols-2 lg:p-12">
                            <div>
                                <span className="inline-block rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">★ engine paling laris</span>
                                <h2 className="mt-5 text-3xl font-bold tracking-tight text-white">
                                    Undangan digital yang biasa dijual 150-500rb? Sekarang kamu bisa bikin sendiri.
                                </h2>
                                <p className="mt-6 rounded-lg border border-[#222] bg-[#0A0A0A]/50 p-4 text-sm text-[#A1A1AA]">
                                    Bahkan bisa jadi ladang cuan, bikinin undangan orang, tarif kamu yang tentuin.
                                </p>
                                <a href="#harga" className="mt-6 inline-block rounded-lg bg-emerald-400 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-emerald-300">
                                    Lihat Harga
                                </a>
                            </div>
                            <ul className="grid gap-3 sm:grid-cols-2">
                                {[
                                    'Countdown acara otomatis', 'RSVP langsung ke WA', 'Amplop digital (rekening + QRIS)',
                                    'Galeri & love story timeline', 'Nama tamu personal via ?to=nama', 'Nuansa: islami, adat, modern, rustic, elegan',
                                ].map((b) => (
                                    <li key={b} className="flex items-start gap-2.5 rounded-lg border border-[#222] bg-[#111] p-4 text-sm text-[#EDEDED]"><Check /> {b}</li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* ============================ 9 · GUIDED ONLINE === */}
                    <section className="border-y border-[#141414] bg-[#0D0D0D]">
                        <div className="mx-auto max-w-6xl px-6 py-24">
                            <SectionLabel>bukan cuma prompt</SectionLabel>
                            <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                Dari nol sampai website-mu punya domain sendiri, dipandu step-by-step.
                            </h2>
                            <p className="mt-4 max-w-3xl text-lg text-[#A1A1AA]">
                                Di dashboard member, kamu gak cuma dapat generator. Ada panduan lengkap yang nuntun kamu sampai website beneran tayang:
                            </p>
                            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {[
                                    { n: '01', t: 'Paste prompt ke AI', d: 'ChatGPT / Claude / Gemini, bebas pilih.' },
                                    { n: '02', t: 'Deploy gratis', d: 'Netlify / Vercel, drag & drop.' },
                                    { n: '03', t: 'Beli domain sendiri', d: 'Mulai ±15rb/tahun.' },
                                    { n: '04', t: 'Connect domain', d: 'Setting DNS dijelasin bahasa awam.' },
                                ].map((s) => (
                                    <div key={s.n} className="rounded-xl border border-[#222] bg-[#111] p-5">
                                        <span className="font-mono text-2xl font-bold text-emerald-400/70">{s.n}</span>
                                        <h3 className="mt-3 text-base font-semibold text-white">{s.t}</h3>
                                        <p className="mt-1.5 text-sm text-[#888]">{s.d}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-8 rounded-lg border border-[#222] bg-[#111] p-4 text-sm text-[#A1A1AA]">
                                <span className="font-semibold text-emerald-400">+ Add-on:</span> Form kontak/SMTP · Tombol WA · Google Analytics · Meta Pixel · SEO dasar · Google Maps
                            </p>
                        </div>
                    </section>

                    {/* ================================ 10 · CARA KERJA === */}
                    <section id="cara-kerja" className="mx-auto max-w-6xl px-6 py-24">
                        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Tiga langkah. Tanpa skill coding.
                        </h2>
                        <div className="mt-14 grid gap-6 md:grid-cols-3">
                            {STEPS.map((s, i) => (
                                <div key={s.n} className="relative rounded-2xl border border-[#222] bg-[#111] p-8">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400 font-mono text-lg font-bold text-black">{s.n}</div>
                                    <h3 className="mt-5 text-xl font-semibold text-white">{s.title}</h3>
                                    <p className="mt-3 text-sm leading-relaxed text-[#888]">{s.body}</p>
                                    {i < STEPS.length - 1 && (
                                        <span className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-2xl text-[#333] md:block">→</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ============================= 11 · DIFFERENTIATORS === */}
                    <section className="border-y border-[#141414] bg-[#0D0D0D]">
                        <div className="mx-auto max-w-6xl px-6 py-24">
                            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                Bukan sekadar kumpulan template prompt.
                            </h2>
                            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {DIFFERENTIATORS.map((d) => (
                                    <div key={d.title} className="rounded-xl border border-[#222] bg-[#111] p-6">
                                        <h3 className="text-base font-semibold text-emerald-400">{d.title}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-[#888]">{d.body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ================================= 12 · PERSONAS === */}
                    <section className="mx-auto max-w-6xl px-6 py-24">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Karanglabs dibuat untuk enam tipe orang ini.
                        </h2>
                        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {PERSONAS.map((p) => (
                                <div key={p.title} className="rounded-xl border border-[#222] bg-[#111] p-6">
                                    {p.tag && <span className="mb-3 inline-block rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">{p.tag}</span>}
                                    <h3 className="text-lg font-semibold text-white">{p.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-[#888]">{p.body}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* =============================== 13 · BEFORE/AFTER === */}
                    <section className="border-y border-[#141414] bg-[#0D0D0D]">
                        <div className="mx-auto max-w-4xl px-6 py-24">
                            <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                Jasa developer vs Karanglabs.
                            </h2>
                            <div className="mt-12 overflow-hidden rounded-2xl border border-[#222]">
                                <div className="grid grid-cols-3 border-b border-[#222] bg-[#111] text-sm font-semibold">
                                    <div className="p-4 text-[#666]"></div>
                                    <div className="p-4 text-center text-[#A1A1AA]">/01 Pakai Developer <span className="block text-xs font-normal text-rose-400">LAMBAT</span></div>
                                    <div className="p-4 text-center text-white">/02 Karanglabs <span className="block text-xs font-normal text-emerald-400">INSTAN</span></div>
                                </div>
                                {COMPARE.map((row, i) => (
                                    <div key={row.label} className={`grid grid-cols-3 text-sm ${i % 2 ? 'bg-[#0D0D0D]' : 'bg-[#0A0A0A]'}`}>
                                        <div className="p-4 font-medium text-[#A1A1AA]">{row.label}</div>
                                        <div className="p-4 text-center text-[#777]">{row.dev}</div>
                                        <div className="p-4 text-center font-medium text-emerald-300">{row.ok}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* =============================== 14 · TESTIMONI === */}
                    <section className="mx-auto max-w-6xl px-6 py-24">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Yang udah nyoba, gak balik lagi ke cara lama.
                        </h2>
                        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {TESTIMONIALS.map((t) => (
                                <figure key={t.name} className="flex flex-col rounded-xl border border-[#222] bg-[#111] p-6">
                                    <div className="mb-3 text-amber-400">★★★★★</div>
                                    <blockquote className="flex-1 text-sm leading-relaxed text-[#EDEDED]">"{t.quote}"</blockquote>
                                    <figcaption className="mt-4 border-t border-[#222] pt-4 text-sm">
                                        <span className="font-semibold text-white">{t.name}</span>
                                        <span className="text-[#666]"> · {t.role}</span>
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    </section>

                    {/* ================================= 15 · PRICING === */}
                    <section id="harga" className="border-y border-[#141414] bg-[#0D0D0D]">
                        <div className="mx-auto max-w-6xl px-6 py-24">
                            <div className="text-center">
                                <SectionLabel>early access · batch 1</SectionLabel>
                                <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                    Akses penuh, satu kali bayar. Selamanya.
                                </h2>
                                <p className="mx-auto mt-4 max-w-2xl text-lg text-[#A1A1AA]">
                                    Harga naik tiap batch. Begitu kuota batch ini penuh, harga naik ke Rp 499.000 dan tidak turun lagi.
                                </p>
                                <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#222] bg-[#111] px-4 py-2 font-mono text-sm text-[#EDEDED]">
                                    <span className="text-amber-400">⚡ Harga naik dalam</span>
                                    {[['HARI', countdown.d], ['JAM', countdown.h], ['MIN', countdown.m], ['DET', countdown.s]].map(([label, val]) => (
                                        <span key={label} className="flex flex-col items-center">
                                            <span className="text-base font-bold text-white">{val}</span>
                                            <span className="text-[9px] tracking-widest text-[#666]">{label}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-14 grid items-start gap-6 lg:grid-cols-2">
                                {/* CARD 1 */}
                                <div className="relative rounded-2xl border border-emerald-400/40 bg-[#111] p-8 shadow-[0_0_50px_-12px_rgba(52,211,153,0.25)]">
                                    <span className="absolute -top-3 left-8 rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-black">HEMAT 80%</span>
                                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-400">Karanglabs · Early Access</div>
                                    <div className="mt-4 flex items-end gap-3">
                                        <span className="text-4xl font-bold text-white">Rp 99.000</span>
                                        <span className="mb-1 text-lg text-[#666] line-through">Rp 499.000</span>
                                    </div>
                                    <p className="mt-1 text-sm text-[#888]">Sekali Bayar · Selamanya · tanpa langganan · tanpa biaya tersembunyi</p>
                                    <p className="mt-5 rounded-lg border border-[#222] bg-[#0D0D0D] p-4 text-sm italic text-[#A1A1AA]">
                                        "Satu studio, semua jenis website." Karanglabs meracik prompt setara brief designer profesional (minimalis, luxury, playful, premium) untuk 8 jenis website berbeda.
                                    </p>
                                    <ul className="mt-6 space-y-3 text-sm text-[#EDEDED]">
                                        {[
                                            '8 engine generator (Landing Page / Toko Online / Company Profile / Portfolio / Undangan ★ / Link-in-Bio / Menu F&B ★ / Jasa)',
                                            'Panduan lengkap: deploy gratis → beli domain → connect domain',
                                            'Add-on: SMTP/form kontak · WA float · Analytics · Pixel · SEO · Maps',
                                            'Kompatibel semua AI (ChatGPT · Claude · Gemini · v0 · Lovable)',
                                            'Unlimited generate, tanpa kuota harian',
                                            'Update engine & panduan baru, selamanya',
                                            'Akses dashboard via email kamu',
                                        ].map((f) => (
                                            <li key={f} className="flex items-start gap-2.5"><Check /> {f}</li>
                                        ))}
                                    </ul>
                                    <a href="#harga" className="mt-7 block rounded-lg bg-emerald-400 py-3 text-center text-sm font-semibold text-black transition-colors hover:bg-emerald-300">
                                        Klaim Early Access Sekarang
                                    </a>
                                    <p className="mt-3 text-center text-xs text-[#666]">Transfer · QRIS · OVO · Gopay · Dana</p>
                                    <div className="mt-6 border-t border-[#222] pt-5">
                                        <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
                                            <span>kuota batch 1</span>
                                            <span className="font-semibold text-white">73/100 terisi</span>
                                        </div>
                                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#222]">
                                            <div className="h-full rounded-full bg-emerald-400" style={{ width: '73%' }} />
                                        </div>
                                        <p className="mt-2 text-xs text-amber-400">⚡ Sisa 27 slot · harga naik begitu penuh</p>
                                    </div>
                                </div>

                                {/* CARD 2 */}
                                <div className="rounded-2xl border border-[#222] bg-[#111] p-8">
                                    <span className="inline-block rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">PROFIT 100% · Lisensi Whitelabel · Hak Jual Kembali</span>
                                    <h3 className="mt-4 text-2xl font-bold text-white">Jual Ulang, Untung Penuh</h3>
                                    <div className="mt-4 flex items-end gap-3">
                                        <span className="text-4xl font-bold text-white">Rp 390.000</span>
                                        <span className="mb-1 text-lg text-[#666] line-through">Rp 1.500.000</span>
                                    </div>
                                    <p className="mt-1 text-sm text-[#888]">Sekali bayar · file + panduan lengkap · keuntungan 100% milikmu</p>
                                    <ul className="mt-6 space-y-3 text-sm text-[#EDEDED]">
                                        {[
                                            'File website lengkap + sistem login & dashboard member, siap upload (tanpa coding)',
                                            'Rebrand bebas: nama, logo, warna, harga, link pembayaran sendiri',
                                            'Jual ulang sepuasnya, 100% keuntungan milikmu, tanpa bagi hasil',
                                            'Login pelanggan pakai Google Spreadsheet, tanpa biaya bulanan / server / API',
                                            'Panduan setup lengkap + tool ganti password (tanpa coding)',
                                            'Semua 8 engine + panduan + add-on + update fitur ke depan ikut',
                                        ].map((f) => (
                                            <li key={f} className="flex items-start gap-2.5"><Check /> {f}</li>
                                        ))}
                                    </ul>
                                    <a href="#harga" className="mt-7 block rounded-lg border border-[#333] py-3 text-center text-sm font-semibold text-white transition-colors hover:border-[#555] hover:bg-[#161616]">
                                        Ambil Lisensi Reseller
                                    </a>
                                    <p className="mt-3 text-center text-xs text-[#666]">Cocok untuk yang mau punya produk digital sendiri</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ==================================== 16 · FAQ === */}
                    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
                        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Pertanyaan yang sering ditanya.
                        </h2>
                        <div className="mt-12 space-y-3">
                            {FAQS.map((faq, i) => (
                                <div key={i} className="rounded-xl border border-[#222] bg-[#111]">
                                    <button
                                        type="button"
                                        onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                                    >
                                        <span className="text-sm font-medium text-white">{faq.q}</span>
                                        <span className={`text-lg text-emerald-400 transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                                    </button>
                                    {openFaq === i && (
                                        <p className="px-5 pb-4 text-sm leading-relaxed text-[#A1A1AA]">{faq.a}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* =============================== 17 · CTA PENUTUP === */}
                    <section className="border-t border-[#141414] bg-[#0D0D0D]">
                        <div className="relative mx-auto max-w-4xl overflow-hidden px-6 py-28 text-center">
                            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
                            <h2 className="relative text-4xl font-bold tracking-tight text-white sm:text-5xl">
                                Berhenti bayar mahal. Website-mu bisa online hari ini.
                            </h2>
                            <p className="relative mx-auto mt-5 max-w-2xl text-lg text-[#A1A1AA]">
                                Ambil early access sebelum kuota batch 1 habis, begitu penuh, harga naik dan gak turun lagi.
                            </p>
                            <a href="#harga" className="relative mt-9 inline-block rounded-lg bg-emerald-400 px-8 py-4 text-base font-semibold text-black transition-colors hover:bg-emerald-300">
                                Bayar Rp 99.000, Akses Selamanya
                            </a>
                            <p className="relative mt-4 text-xs text-[#666]">Akses instan setelah pembayaran</p>
                        </div>
                    </section>

                    {/* ================================= 18 · FOOTER === */}
                    <footer className="border-t border-[#141414]">
                        <div className="mx-auto max-w-6xl px-6 py-16">
                            <div className="grid gap-10 md:grid-cols-[2fr,1fr,1fr]">
                                <div>
                                    <div className="flex items-center gap-2.5 text-lg font-bold text-white">
                                        <img src={LOGO} alt="Karanglabs" className="h-8 w-8 rounded-md object-contain" />
                                        Karanglabs
                                    </div>
                                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#888]">
                                        Engine brief profesional untuk membuat website apapun lewat AI. Dibangun di Indonesia untuk siapapun yang mau online tanpa ribet.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-white">Studio</h4>
                                    <ul className="mt-4 space-y-2 text-sm text-[#888]">
                                        {NAV_LINKS.map((l) => (
                                            <li key={l.href}><a href={l.href} className="transition-colors hover:text-white">{l.label}</a></li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-white">Social</h4>
                                    <ul className="mt-4 space-y-2 text-sm text-[#888]">
                                        <li><a href="#" className="transition-colors hover:text-white">Instagram</a></li>
                                        <li><a href="#" className="transition-colors hover:text-white">TikTok</a></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-12 flex flex-col gap-2 border-t border-[#222] pt-6 text-xs text-[#555] sm:flex-row sm:justify-between">
                                <span>© 2026 Karanglabs · karanglabs.cloud · v1.0 · early access build</span>
                                <Link href={route('home')} className="transition-colors hover:text-white">AI Tools Directory →</Link>
                            </div>
                        </div>
                    </footer>
                </main>
            </div>
        </>
    );
}
