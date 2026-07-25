import {
    Rocket, ShoppingBag, Building2, UserRound, HeartHandshake,
    Link2, UtensilsCrossed, Briefcase,
} from 'lucide-react';

/* --------------------------------------------------------------- options --- */

const STYLE_OPTIONS = [
    'Minimalis Modern', 'Elegan / Luxury', 'Playful / Ceria', 'Bold / Premium',
    'Rustic / Earthy', 'Islami', 'Korean / Soft', 'Dark Mode',
];

const NUANSA_OPTIONS = ['Islami', 'Adat / Tradisional', 'Modern', 'Rustic', 'Elegan / Luxury'];

const OUTPUT_OPTIONS = [
    'HTML + Tailwind CSS (satu file)',
    'React + Tailwind (komponen)',
    'HTML + CSS biasa (tanpa framework)',
];

const CTA_OPTIONS = ['Tombol WhatsApp', 'Form / Kumpulkan Lead', 'Link Pembayaran'];

const BUTTON_STYLES = ['Rounded solid', 'Outline', 'Glass / blur', 'Pill'];

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
        block('DETAIL KONTEN', engine.details(v)),
        block('CTA & KONVERSI', engine.cta ? engine.cta(v) : []),
        block('OUTPUT', [
            line('Format', v.output || OUTPUT_OPTIONS[0]),
            '- Kode bersih & rapi, siap langsung deploy (Netlify / Vercel / GitHub Pages)',
            '- Tanpa dependency berbayar; pakai placeholder gambar bila belum ada aset',
            '- Beri komentar penanda di tiap section agar gampang diedit ulang',
        ]),
    ];

    return parts.filter(Boolean).join('\n\n');
}

/* --------------------------------------------------------------- engines --- */

const brandField = { name: 'brand', label: 'Nama Brand / Usaha', type: 'text', placeholder: 'Kopi Senja', required: true };
const styleField = { name: 'style', label: 'Gaya Visual', type: 'select', options: STYLE_OPTIONS };
const colorsField = { name: 'colors', label: 'Palet Warna', type: 'text', placeholder: 'Cokelat hangat + krem' };
const outputField = { name: 'output', label: 'Format Output', type: 'select', options: OUTPUT_OPTIONS };
const waField = { name: 'whatsapp', label: 'Nomor WhatsApp', type: 'text', placeholder: '628123456789' };

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
            brandField,
            { name: 'offer', label: 'Produk / Penawaran Utama', type: 'textarea', placeholder: 'Apa yang dijual? Apa promonya?', required: true },
            { name: 'audience', label: 'Target Audiens', type: 'text', placeholder: 'Pemilik UMKM, umur 25-40' },
            { name: 'benefits', label: 'Keunggulan Utama', type: 'tags', placeholder: 'Cepat, murah, garansi', hint: 'pisahkan dengan koma' },
            { name: 'ctaType', label: 'Jenis CTA', type: 'select', options: CTA_OPTIONS },
            waField,
            styleField, colorsField, outputField,
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
            brandField,
            { name: 'products', label: 'Daftar Produk', type: 'lines', placeholder: 'Kopi Latte | 25.000 | Minuman\nCroissant | 18.000 | Snack', hint: 'satu produk per baris, format: Nama | Harga | Kategori', required: true },
            { name: 'categories', label: 'Kategori', type: 'tags', placeholder: 'Minuman, Snack, Merchandise' },
            { name: 'orderMethod', label: 'Metode Order', type: 'select', options: ['Order via WhatsApp', 'Order via Marketplace', 'Keduanya'] },
            waField,
            { name: 'marketplace', label: 'Link Marketplace (opsional)', type: 'text', placeholder: 'https://tokopedia.com/...' },
            styleField, colorsField, outputField,
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
            brandField,
            { name: 'about', label: 'Tentang Perusahaan', type: 'textarea', placeholder: 'Ceritakan usaha kamu singkat', required: true },
            { name: 'vision', label: 'Visi & Misi', type: 'textarea', placeholder: 'Visi... Misi...' },
            { name: 'services', label: 'Layanan / Produk', type: 'tags', placeholder: 'Konsultasi, Instalasi, Maintenance' },
            { name: 'clients', label: 'Klien / Partner', type: 'text', placeholder: 'Nama klien atau partner terkenal' },
            { name: 'address', label: 'Alamat', type: 'text', placeholder: 'Jl. Merdeka No. 1, Jakarta' },
            { name: 'maps', label: 'Link / Embed Google Maps', type: 'text', placeholder: 'https://maps.google.com/...' },
            styleField, colorsField, outputField,
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
            { name: 'role', label: 'Peran / Profesi', type: 'text', placeholder: 'UI/UX Designer' },
            { name: 'skills', label: 'Skill & Keahlian', type: 'tags', placeholder: 'Figma, React, Copywriting' },
            { name: 'experience', label: 'Pengalaman', type: 'textarea', placeholder: 'Ringkas pengalaman & pencapaianmu' },
            { name: 'projects', label: 'Karya / Proyek', type: 'lines', placeholder: 'Redesign aplikasi X\nBranding kafe Y', hint: 'satu karya per baris' },
            { name: 'cvLink', label: 'Link Download CV', type: 'text', placeholder: 'https://.../cv.pdf' },
            styleField, colorsField, outputField,
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
            { name: 'eventDate', label: 'Tanggal & Waktu Acara', type: 'text', placeholder: 'Sabtu, 12 Desember 2026 · 10.00 WIB' },
            { name: 'venue', label: 'Lokasi / Venue', type: 'textarea', placeholder: 'Gedung Serbaguna, alamat lengkap' },
            { name: 'nuansa', label: 'Nuansa', type: 'select', options: NUANSA_OPTIONS },
            { name: 'rsvpWa', label: 'Nomor WhatsApp RSVP', type: 'text', placeholder: '628123456789' },
            { name: 'bank', label: 'Amplop Digital (rekening + QRIS)', type: 'textarea', placeholder: 'BCA 1234567890 a.n. ...\nQRIS: link/gambar' },
            { name: 'features', label: 'Fitur Tambahan', type: 'tags', placeholder: 'Musik latar, galeri, guest book' },
            colorsField, outputField,
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
            { name: 'bio', label: 'Bio Singkat', type: 'textarea', placeholder: 'Kedai kopi & roastery di Bandung' },
            { name: 'links', label: 'Daftar Link', type: 'lines', placeholder: 'Menu | https://...\nOrder GoFood | https://...', hint: 'satu link per baris, format: Label | URL', required: true },
            { name: 'socials', label: 'Sosial Media', type: 'tags', placeholder: 'Instagram, TikTok, YouTube' },
            { name: 'buttonStyle', label: 'Gaya Tombol', type: 'select', options: BUTTON_STYLES },
            styleField, colorsField, outputField,
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
            brandField,
            { name: 'menu', label: 'Daftar Menu', type: 'lines', placeholder: 'Nasi Goreng | 22.000 | Makanan\nEs Kopi Susu | 18.000 | Minuman', hint: 'satu menu per baris, format: Nama | Harga | Kategori', required: true },
            { name: 'hours', label: 'Jam Buka', type: 'text', placeholder: 'Setiap hari 08.00-22.00' },
            { name: 'location', label: 'Lokasi', type: 'textarea', placeholder: 'Alamat + link Google Maps' },
            waField,
            styleField, colorsField, outputField,
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
            brandField,
            { name: 'service', label: 'Deskripsi Jasa', type: 'textarea', placeholder: 'Jasa apa yang ditawarkan?', required: true },
            { name: 'packages', label: 'Paket Harga (maks 3)', type: 'lines', placeholder: 'Basic | 500.000 | 1 revisi, 3 hari\nPro | 1.000.000 | 3 revisi, 2 hari', hint: 'satu paket per baris, format: Nama | Harga | Fitur' },
            { name: 'process', label: 'Proses Kerja', type: 'textarea', placeholder: 'Langkah 1... 2... 3...' },
            { name: 'testimonials', label: 'Testimoni', type: 'textarea', placeholder: 'Kutipan singkat dari klien' },
            { name: 'bookingWa', label: 'Nomor WhatsApp Booking', type: 'text', placeholder: '628123456789' },
            styleField, colorsField, outputField,
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
 * Tailwind classes per accent, enumerated so the JIT compiler keeps them.
 */
export const ACCENT = {
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-400/10', dot: 'bg-emerald-400', ring: 'group-hover:bg-emerald-400/20' },
    sky: { text: 'text-sky-400', bg: 'bg-sky-400/10', dot: 'bg-sky-400', ring: 'group-hover:bg-sky-400/20' },
    indigo: { text: 'text-indigo-400', bg: 'bg-indigo-400/10', dot: 'bg-indigo-400', ring: 'group-hover:bg-indigo-400/20' },
    violet: { text: 'text-violet-400', bg: 'bg-violet-400/10', dot: 'bg-violet-400', ring: 'group-hover:bg-violet-400/20' },
    rose: { text: 'text-rose-400', bg: 'bg-rose-400/10', dot: 'bg-rose-400', ring: 'group-hover:bg-rose-400/20' },
    fuchsia: { text: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10', dot: 'bg-fuchsia-400', ring: 'group-hover:bg-fuchsia-400/20' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-400/10', dot: 'bg-amber-400', ring: 'group-hover:bg-amber-400/20' },
    teal: { text: 'text-teal-400', bg: 'bg-teal-400/10', dot: 'bg-teal-400', ring: 'group-hover:bg-teal-400/20' },
};
