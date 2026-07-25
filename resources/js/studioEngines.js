import {
    Rocket, ShoppingBag, Building2, UserRound, HeartHandshake,
    Link2, UtensilsCrossed, Briefcase,
    MessageCircle, ClipboardList, CreditCard,
    Minimize2, Gem, PartyPopper, Flame, Leaf, MoonStar, Flower2, Moon,
    FileCode, Files, Component, Code,
    Store, Layers, Landmark, Sparkles, Square, Frame, Droplet, Pill,
} from 'lucide-react';

/* --------------------------------------------------------------- options --- */

export const MULTI_FILE_OUTPUT = 'HTML + Tailwind CSS (multi-halaman, file terpisah)';

const OUTPUT_OPTIONS = [
    'HTML + Tailwind CSS (satu file)',
    MULTI_FILE_OUTPUT,
    'React + Tailwind (komponen)',
    'HTML + CSS biasa (tanpa framework)',
];

const CTA_OPTIONS = ['Tombol WhatsApp', 'Form / Kumpulkan Lead', 'Link Pembayaran'];

/* --------------------------------------------------------------- helpers --- */

function items(value) {
    if (!value) {
        return [];
    }

    return String(value)
        .split(/\r?\n|,/)
        .map((s) => s.trim())
        .filter(Boolean);
}

function line(label, value) {
    return value ? `- ${label}: ${value}` : null;
}

function subList(label, value) {
    const list = items(value);

    if (!list.length) {
        return null;
    }

    return `- ${label}:\n${list.map((x) => `   • ${x}`).join('\n')}`;
}

function block(title, rows) {
    const clean = rows.filter(Boolean);

    if (!clean.length) {
        return null;
    }

    return `${title}\n${clean.join('\n')}`;
}

/**
 * Deterministically assemble a designer-grade prompt from an engine spec and
 * the values the user typed into the form. No AI call, pure templating.
 */
export function buildPrompt(engine, values) {
    const v = values || {};
    const brand = v.brand || v.name || v.hosts || 'brand ini';
    const pages = items(v.pages);
    const format = v.output || (pages.length ? MULTI_FILE_OUTPUT : OUTPUT_OPTIONS[0]);

    const parts = [
        `Kamu adalah web designer & front-end developer senior. Buatkan ${engine.label} untuk "${brand}".`,
        block('BRAND & GAYA', [
            line('Nama', v.brand || v.name || v.hosts),
            line('Gaya visual', v.style || v.nuansa),
            line('Palet warna', v.colors),
            '- Bahasa konten: Indonesia, ramah namun profesional',
            '- Mobile-first, responsive, aksesibel, dan loading cepat',
        ]),
        block('STRUKTUR HALAMAN', engine.sections.map((s, i) => `${i + 1}. ${s}`)),
        pages.length ? block('HALAMAN & NAVIGASI', [
            '- Website ini MULTI-HALAMAN (bukan satu halaman).',
            '- Buat halaman berikut, masing-masing sebagai file HTML terpisah yang saling terhubung:',
            ...pages.map((p) => `   • ${p}`),
            '- Pakai navbar/menu yang sama di semua halaman, lengkap dengan penanda halaman yang sedang aktif.',
            '- Struktur section di atas diterapkan pada halaman yang relevan (umumnya halaman utama/Beranda).',
        ]) : null,
        block('DETAIL KONTEN', engine.details(v)),
        block('CTA & KONVERSI', engine.cta ? engine.cta(v) : []),
        block('OUTPUT', [
            line('Format', format),
            '- Kode bersih & rapi, siap langsung deploy (Netlify / Vercel / GitHub Pages)',
            '- Tanpa dependency berbayar; pakai placeholder gambar bila belum ada aset',
            '- Beri komentar penanda di tiap section agar gampang diedit ulang',
        ]),
    ];

    // Strip em/en dashes from the final prompt so the output never looks AI-generated.
    return parts.filter(Boolean).join('\n\n').replace(/[—–]/g, '-');
}

/* --------------------------------------------------------------- engines --- */

const brandField = (placeholder) => ({ name: 'brand', label: 'Nama Brand / Usaha', type: 'text', placeholder, required: true });
const styleField = {
    name: 'style', label: 'Gaya Visual', type: 'choice', columns: 4, options: [
        { value: 'Minimalis Modern', label: 'Minimalis', icon: Minimize2 },
        { value: 'Elegan / Luxury', label: 'Elegan', icon: Gem },
        { value: 'Playful / Ceria', label: 'Playful', icon: PartyPopper },
        { value: 'Bold / Premium', label: 'Bold', icon: Flame },
        { value: 'Rustic / Earthy', label: 'Rustic', icon: Leaf },
        { value: 'Islami', label: 'Islami', icon: MoonStar },
        { value: 'Korean / Soft', label: 'Korean', icon: Flower2 },
        { value: 'Dark Mode', label: 'Dark', icon: Moon },
    ],
};
const colorsField = (placeholder = 'mis. cokelat hangat + krem') => ({ name: 'colors', label: 'Palet Warna', type: 'color', placeholder, hint: 'Tulis bebas, atau klik ikon palet untuk pilih kode warna sendiri' });
const outputField = {
    name: 'output', label: 'Format Output', type: 'choice', options: [
        { value: 'HTML + Tailwind CSS (satu file)', label: 'HTML 1 file', icon: FileCode },
        { value: MULTI_FILE_OUTPUT, label: 'Multi-halaman', icon: Files },
        { value: 'React + Tailwind (komponen)', label: 'React', icon: Component },
        { value: 'HTML + CSS biasa (tanpa framework)', label: 'HTML/CSS', icon: Code },
    ],
};
const waField = { name: 'whatsapp', label: 'Nomor WhatsApp', type: 'text', placeholder: '628123456789' };
const pagesField = (placeholder = 'Beranda, Tentang, Layanan, Kontak') => ({ name: 'pages', label: 'Halaman yang dibutuhkan', type: 'tags', placeholder, hint: 'kosongkan untuk satu halaman; isi (pisah koma) untuk website multi-halaman' });

/* Icon-tile pickers for the per-engine selects. */
const ctaChoiceField = {
    name: 'ctaType', label: 'Jenis CTA', type: 'choice', options: [
        { value: 'Tombol WhatsApp', label: 'WhatsApp', icon: MessageCircle },
        { value: 'Form / Kumpulkan Lead', label: 'Form / Lead', icon: ClipboardList },
        { value: 'Link Pembayaran', label: 'Link Bayar', icon: CreditCard },
    ],
};

const orderChoiceField = {
    name: 'orderMethod', label: 'Metode Order', type: 'choice', options: [
        { value: 'Order via WhatsApp', label: 'WhatsApp', icon: MessageCircle },
        { value: 'Order via Marketplace', label: 'Marketplace', icon: Store },
        { value: 'Keduanya', label: 'Keduanya', icon: Layers },
    ],
};

const nuansaChoiceField = {
    name: 'nuansa', label: 'Nuansa', type: 'choice', columns: 4, options: [
        { value: 'Islami', label: 'Islami', icon: MoonStar },
        { value: 'Adat / Tradisional', label: 'Adat', icon: Landmark },
        { value: 'Modern', label: 'Modern', icon: Sparkles },
        { value: 'Rustic', label: 'Rustic', icon: Leaf },
        { value: 'Elegan / Luxury', label: 'Elegan', icon: Gem },
    ],
};

const buttonStyleChoiceField = {
    name: 'buttonStyle', label: 'Gaya Tombol', type: 'choice', columns: 4, options: [
        { value: 'Rounded solid', label: 'Rounded', icon: Square },
        { value: 'Outline', label: 'Outline', icon: Frame },
        { value: 'Glass / blur', label: 'Glass', icon: Droplet },
        { value: 'Pill', label: 'Pill', icon: Pill },
    ],
};

export const ENGINES = [
    {
        slug: 'landing-page',
        code: 'M1',
        name: 'Landing Page',
        label: 'sebuah landing page',
        icon: Rocket,
        accent: 'emerald',
        tagline: 'Jualan produk, kumpulin leads, atau promo event, satu halaman yang fokus closing.',
        sections: [
            'Hero: headline persuasif + subheadline + CTA utama',
            'Keunggulan / benefit produk (grid)',
            'Cara kerja atau tentang penawaran',
            'Testimoni / social proof',
            'FAQ singkat',
            'CTA penutup + footer',
        ],
        fields: [
            brandField('Kelas Online Jago Jualan'),
            { name: 'offer', label: 'Produk / Penawaran Utama', type: 'textarea', placeholder: 'Kelas online 4 sesi: dari nol sampai laris jualan di marketplace & sosmed. Termasuk template konten + grup mentoring. Diskon 50% untuk 100 pendaftar pertama.', required: true },
            { name: 'audience', label: 'Target Audiens', type: 'text', placeholder: 'Pemula & pemilik UMKM yang mau mulai jualan online' },
            { name: 'benefits', label: 'Keunggulan Utama', type: 'tags', placeholder: 'Materi terstruktur, Mentor berpengalaman, Sertifikat, Akses grup selamanya', hint: 'pisahkan dengan koma' },
            ctaChoiceField,
            waField,
            styleField, colorsField('Ungu + putih, modern & energik'), outputField,
        ],
        details: (v) => [
            line('Produk / penawaran', v.offer),
            line('Target audiens', v.audience),
            subList('Keunggulan yang ditonjolkan', v.benefits),
        ],
        cta: (v) => [
            line('Jenis CTA', v.ctaType || CTA_OPTIONS[0]),
            line('Nomor WhatsApp', v.whatsapp),
            '- Tombol CTA harus menonjol dan diulang di beberapa titik strategis',
        ],
    },
    {
        slug: 'toko-online',
        code: 'M2',
        name: 'Toko Online / Katalog',
        label: 'sebuah toko online / katalog produk',
        icon: ShoppingBag,
        accent: 'sky',
        tagline: 'Katalog produk rapi + tombol order langsung.',
        sections: [
            'Hero + kolom pencarian',
            'Grid produk dengan filter kategori & badge (baru/terlaris/diskon)',
            'Kartu produk: foto, nama, harga, tombol order',
            'Cara order & info pengiriman',
            'Kontak + footer',
        ],
        fields: [
            brandField('Kopi Nusantara Store'),
            { name: 'products', label: 'Daftar Produk', type: 'lines', placeholder: 'Kopi Gayo 200g | 65.000 | Biji Kopi\nKopi Toraja 200g | 72.000 | Biji Kopi\nV60 Dripper | 95.000 | Alat Seduh', hint: 'satu produk per baris, format: Nama | Harga | Kategori', required: true },
            { name: 'categories', label: 'Kategori', type: 'tags', placeholder: 'Biji Kopi, Alat Seduh, Merchandise' },
            orderChoiceField,
            waField,
            { name: 'marketplace', label: 'Link Marketplace (opsional)', type: 'text', placeholder: 'https://tokopedia.com/kopinusantara' },
            styleField, colorsField('Cokelat tua + krem, hangat & natural'), outputField,
        ],
        details: (v) => [
            subList('Produk (Nama | Harga | Kategori)', v.products),
            subList('Kategori', v.categories),
        ],
        cta: (v) => [
            line('Metode order', v.orderMethod || 'Order via WhatsApp'),
            line('Nomor WhatsApp', v.whatsapp),
            line('Link marketplace', v.marketplace),
            '- Tiap kartu produk punya tombol "Pesan" yang menyusun pesan WA otomatis',
        ],
    },
    {
        slug: 'company-profile',
        code: 'M3',
        name: 'Company Profile',
        label: 'sebuah company profile',
        icon: Building2,
        accent: 'indigo',
        tagline: 'Bikin usaha kelihatan kredibel & profesional.',
        sections: [
            'Hero: nama perusahaan + tagline',
            'Tentang kami',
            'Visi & misi',
            'Layanan / produk',
            'Galeri + klien / partner',
            'Kontak + Google Maps + footer',
        ],
        fields: [
            brandField('Nusantara Digital Agency'),
            { name: 'about', label: 'Tentang Perusahaan', type: 'textarea', placeholder: 'Agensi digital yang bantu bisnis tumbuh lewat website, branding, dan pemasaran online sejak 2018. Sudah menangani 120+ klien dari berbagai industri.', required: true },
            { name: 'vision', label: 'Visi & Misi', type: 'textarea', placeholder: 'Visi: jadi partner digital terpercaya UMKM Indonesia.\nMisi: menghadirkan solusi digital berkualitas dengan harga terjangkau.' },
            { name: 'services', label: 'Layanan / Produk', type: 'tags', placeholder: 'Pembuatan Website, Branding & Logo, Digital Marketing, Fotografi Produk' },
            { name: 'clients', label: 'Klien / Partner', type: 'text', placeholder: 'Kopi Nusantara, Batik Sekar, Klinik Sehat Bersama' },
            { name: 'address', label: 'Alamat', type: 'text', placeholder: 'Jl. Diponegoro No. 45, Bandung' },
            { name: 'maps', label: 'Link / Embed Google Maps', type: 'text', placeholder: 'https://maps.google.com/?q=Jl.+Diponegoro+45+Bandung' },
            pagesField('Beranda, Tentang, Layanan, Portofolio, Kontak'),
            styleField, colorsField('Biru navy + putih, profesional & bersih'), outputField,
        ],
        details: (v) => [
            line('Tentang', v.about),
            line('Visi & misi', v.vision),
            subList('Layanan', v.services),
            line('Klien / partner', v.clients),
            line('Alamat', v.address),
            line('Google Maps', v.maps),
        ],
        cta: () => [
            '- Sertakan tombol "Hubungi Kami" dan form kontak sederhana',
        ],
    },
    {
        slug: 'portfolio',
        code: 'M4',
        name: 'Portfolio / CV Online',
        label: 'sebuah portfolio / CV online',
        icon: UserRound,
        accent: 'violet',
        tagline: 'Karya & pengalamanmu, online & gampang dibagikan.',
        sections: [
            'Hero: nama + peran/role + foto',
            'Tentang saya',
            'Skill & keahlian',
            'Pengalaman / riwayat',
            'Showcase karya (grid atau studi kasus)',
            'Kontak + tombol download CV',
        ],
        fields: [
            { name: 'name', label: 'Nama Lengkap', type: 'text', placeholder: 'Andi Pratama', required: true },
            { name: 'role', label: 'Peran / Profesi', type: 'text', placeholder: 'UI/UX Designer & Front-End Developer' },
            { name: 'skills', label: 'Skill & Keahlian', type: 'tags', placeholder: 'Figma, Tailwind CSS, React, Prototyping, Copywriting' },
            { name: 'experience', label: 'Pengalaman', type: 'textarea', placeholder: '3 tahun jadi product designer di startup fintech. Pernah menangani redesign aplikasi dengan 500rb+ pengguna aktif.' },
            { name: 'projects', label: 'Karya / Proyek', type: 'lines', placeholder: 'Redesign aplikasi mobile banking\nWebsite company profile untuk agensi\nDesign system untuk startup SaaS', hint: 'satu karya per baris' },
            { name: 'cvLink', label: 'Link Download CV', type: 'text', placeholder: 'https://drive.google.com/file/cv-andi-pratama' },
            pagesField('Beranda, Karya, Tentang, Kontak'),
            styleField, colorsField('Hitam + aksen kuning, bold & personal'), outputField,
        ],
        details: (v) => [
            line('Nama', v.name),
            line('Peran', v.role),
            subList('Skill', v.skills),
            line('Pengalaman', v.experience),
            subList('Karya / proyek', v.projects),
        ],
        cta: (v) => [
            line('Link download CV', v.cvLink),
            '- Sertakan tombol kontak (email / LinkedIn / WhatsApp)',
        ],
    },
    {
        slug: 'undangan',
        code: 'M5',
        name: 'Undangan Digital',
        label: 'sebuah undangan digital',
        icon: HeartHandshake,
        accent: 'rose',
        star: true,
        tagline: 'Undangan pernikahan & acara lengkap fitur kekinian.',
        sections: [
            'Cover pembuka + nama tamu personal (via parameter ?to=nama)',
            'Profil mempelai / tuan rumah',
            'Countdown menuju hari-H + tanggal acara',
            'Detail acara + lokasi + Google Maps',
            'RSVP langsung ke WhatsApp',
            'Amplop digital (rekening bank + QRIS)',
            'Galeri foto & love story / timeline',
            'Ucapan & doa',
        ],
        fields: [
            { name: 'hosts', label: 'Nama Mempelai / Tuan Rumah', type: 'text', placeholder: 'Rani & Doni', required: true },
            { name: 'eventDate', label: 'Tanggal & Waktu Acara', type: 'text', placeholder: 'Sabtu, 12 Desember 2026, pukul 10.00 WIB' },
            { name: 'venue', label: 'Lokasi / Venue', type: 'textarea', placeholder: 'Gedung Graha Wangsa\nJl. Ahmad Yani No. 10, Bandar Lampung' },
            nuansaChoiceField,
            { name: 'rsvpWa', label: 'Nomor WhatsApp RSVP', type: 'text', placeholder: '628123456789' },
            { name: 'bank', label: 'Amplop Digital (rekening + QRIS)', type: 'textarea', placeholder: 'BCA 1234567890 a.n. Doni Saputra\nQRIS: (upload gambar QR kamu)' },
            { name: 'features', label: 'Fitur Tambahan', type: 'tags', placeholder: 'Musik latar, Galeri foto, Buku tamu, Live streaming' },
            colorsField('Sage green + cream, elegan & lembut'), outputField,
        ],
        details: (v) => [
            line('Mempelai / tuan rumah', v.hosts),
            line('Tanggal & waktu', v.eventDate),
            line('Lokasi', v.venue),
            line('RSVP WhatsApp', v.rsvpWa),
            line('Amplop digital', v.bank),
            subList('Fitur tambahan', v.features),
        ],
        cta: () => [
            '- Nama tamu diambil dari parameter URL ?to= dan ditampilkan di cover',
            '- Tombol RSVP menyusun pesan WhatsApp konfirmasi kehadiran otomatis',
        ],
    },
    {
        slug: 'link-in-bio',
        code: 'M6',
        name: 'Link-in-Bio',
        label: 'sebuah halaman link-in-bio',
        icon: Link2,
        accent: 'fuchsia',
        tagline: 'Semua link kamu dalam satu halaman cantik.',
        sections: [
            'Avatar + nama + bio singkat',
            'Daftar tombol link (unlimited)',
            'Baris ikon sosial media',
            'Footer',
        ],
        fields: [
            { name: 'name', label: 'Nama / Handle', type: 'text', placeholder: '@kopisenja', required: true },
            { name: 'bio', label: 'Bio Singkat', type: 'textarea', placeholder: 'Kedai kopi & roastery di Bandung. Buka tiap hari 08.00-22.00.' },
            { name: 'links', label: 'Daftar Link', type: 'lines', placeholder: 'Menu & Order | https://gofood.co.id/kopisenja\nReservasi Tempat | https://wa.me/628123456789\nInstagram | https://instagram.com/kopisenja', hint: 'satu link per baris, format: Label | URL', required: true },
            { name: 'socials', label: 'Sosial Media', type: 'tags', placeholder: 'Instagram, TikTok, WhatsApp' },
            buttonStyleChoiceField,
            styleField, colorsField('Cokelat susu + krem, cozy'), outputField,
        ],
        details: (v) => [
            line('Nama / handle', v.name),
            line('Bio', v.bio),
            subList('Link (Label | URL)', v.links),
            subList('Sosial media', v.socials),
            line('Gaya tombol', v.buttonStyle),
        ],
        cta: () => [
            '- Tiap link jadi tombol besar mudah di-tap di HP',
        ],
    },
    {
        slug: 'menu-fb',
        code: 'M7',
        name: 'Menu F&B',
        label: 'sebuah menu digital untuk resto/kafe',
        icon: UtensilsCrossed,
        accent: 'amber',
        star: true,
        tagline: 'Menu resto/kafe digital + order via WA.',
        sections: [
            'Hero: nama tempat + jam buka + lokasi',
            'Navigasi kategori menu + badge (baru/rekomendasi/pedas)',
            'Kartu menu: foto, nama, deskripsi, harga',
            'Tombol order WhatsApp (pesan otomatis)',
            'Jam buka & lokasi + Google Maps',
        ],
        fields: [
            brandField('Kedai Kopi Senja'),
            { name: 'menu', label: 'Daftar Menu', type: 'lines', placeholder: 'Es Kopi Susu | 18.000 | Minuman\nAmericano | 20.000 | Minuman\nNasi Goreng Spesial | 25.000 | Makanan\nCroissant Cokelat | 22.000 | Snack', hint: 'satu menu per baris, format: Nama | Harga | Kategori', required: true },
            { name: 'hours', label: 'Jam Buka', type: 'text', placeholder: 'Setiap hari, 08.00 - 22.00' },
            { name: 'location', label: 'Lokasi', type: 'textarea', placeholder: 'Jl. Braga No. 88, Bandung\nhttps://maps.google.com/?q=Braga+88+Bandung' },
            waField,
            styleField, colorsField('Cokelat hangat + krem, cozy & homey'), outputField,
        ],
        details: (v) => [
            subList('Menu (Nama | Harga | Kategori)', v.menu),
            line('Jam buka', v.hours),
            line('Lokasi', v.location),
        ],
        cta: (v) => [
            line('Nomor WhatsApp', v.whatsapp),
            '- Tombol "Pesan via WhatsApp" menyusun pesan berisi item yang dipilih otomatis',
        ],
    },
    {
        slug: 'jasa',
        code: 'M8',
        name: 'Halaman Jasa',
        label: 'sebuah halaman jasa dengan paket harga',
        icon: Briefcase,
        accent: 'teal',
        tagline: 'Halaman jualan jasa dengan paket harga.',
        sections: [
            'Hero: value proposition jasa',
            'Tentang jasa & untuk siapa',
            'Paket harga (sampai 3 tier)',
            'Proses kerja / cara pesan',
            'Testimoni',
            'Booking via WhatsApp / form + footer',
        ],
        fields: [
            brandField('Atemoto Photography'),
            { name: 'service', label: 'Deskripsi Jasa', type: 'textarea', placeholder: 'Jasa foto prewedding & wedding dengan konsep candid natural. Sudah dipercaya 200+ pasangan sejak 2019.', required: true },
            { name: 'packages', label: 'Paket Harga (maks 3)', type: 'lines', placeholder: 'Basic | 2.500.000 | 3 jam, 100 foto edit, 1 fotografer\nPremium | 4.500.000 | 6 jam, 250 foto, 2 fotografer + album\nAll-in | 7.500.000 | Full day, unlimited foto, video sinematik', hint: 'satu paket per baris, format: Nama | Harga | Fitur' },
            { name: 'process', label: 'Proses Kerja', type: 'textarea', placeholder: '1. Konsultasi konsep\n2. Booking tanggal & DP\n3. Sesi pemotretan\n4. Editing 7-14 hari\n5. Serah terima hasil' },
            { name: 'testimonials', label: 'Testimoni', type: 'textarea', placeholder: 'Hasilnya natural banget, fotografernya sabar dan ramah! - Rani & Doni' },
            { name: 'bookingWa', label: 'Nomor WhatsApp Booking', type: 'text', placeholder: '628123456789' },
            pagesField('Beranda, Layanan, Paket Harga, Kontak'),
            styleField, colorsField('Krem + cokelat muda, soft & romantis'), outputField,
        ],
        details: (v) => [
            line('Deskripsi jasa', v.service),
            subList('Paket harga (Nama | Harga | Fitur)', v.packages),
            line('Proses kerja', v.process),
            line('Testimoni', v.testimonials),
        ],
        cta: (v) => [
            line('Nomor WhatsApp booking', v.bookingWa),
            '- Tiap paket punya tombol "Pesan Sekarang" ke WhatsApp',
        ],
    },
];

export function findEngine(slug) {
    return ENGINES.find((e) => e.slug === slug) || null;
}

/**
 * A single restrained brand accent, reused for every engine — no neon rainbow.
 * Icons stay calm; emerald is only a subtle tint on a muted surface.
 */
const ACCENT_STYLE = {
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-[#F1F1F2] dark:bg-[#161616]',
    dot: 'bg-emerald-500',
    ring: 'group-hover:bg-[#E8E8EB] dark:group-hover:bg-[#1c1c1c]',
};

export const ACCENT = {
    emerald: ACCENT_STYLE,
    sky: ACCENT_STYLE,
    indigo: ACCENT_STYLE,
    violet: ACCENT_STYLE,
    rose: ACCENT_STYLE,
    fuchsia: ACCENT_STYLE,
    amber: ACCENT_STYLE,
    teal: ACCENT_STYLE,
};
