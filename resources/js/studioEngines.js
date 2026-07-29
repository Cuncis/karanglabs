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
 * How each toggleable add-on translates into a prompt instruction. `val` is the
 * optional extra input the user typed (GA ID, Pixel ID, form endpoint, etc.).
 */
const ADDON_INSTRUCTIONS = {
    form: (val) => `Form kontak: sediakan form (nama, email, pesan) yang mengirim ke ${val || 'email pemilik'}, pakai layanan gratis seperti Formspree/Web3Forms (tanpa backend berbayar)`,
    wa_float: (val) => `Tombol WhatsApp mengambang di pojok kanan bawah${val ? `, arahkan ke nomor ${val}` : ', arahkan ke nomor WhatsApp yang ada di brief'}`,
    analytics: (val) => `Google Analytics: pasang GA4${val ? ` dengan Measurement ID ${val}` : ''} di semua halaman`,
    pixel: (val) => `Meta Pixel: pasang${val ? ` dengan Pixel ID ${val}` : ''} untuk tracking konversi`,
    seo: () => 'SEO dasar: meta title & description, Open Graph & Twitter card, struktur heading rapi, dan sitemap sederhana',
};

/**
 * Turn the selected add-ons (stored as a JSON string on the field) into
 * instruction lines for the prompt.
 */
function addonInstructions(value) {
    let state = {};
    try {
        state = value ? JSON.parse(value) : {};
    } catch {
        state = {};
    }

    return Object.entries(state)
        .filter(([, entry]) => entry && entry.on)
        .map(([key, entry]) => {
            const build = ADDON_INSTRUCTIONS[key];

            return build ? `- ${build((entry.val || '').trim())}` : null;
        })
        .filter(Boolean);
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
    const isMultiPage = pages.length > 0 || format === MULTI_FILE_OUTPUT;

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
        isMultiPage ? block('HALAMAN & NAVIGASI', [
            '- Website ini MULTI-HALAMAN (bukan satu halaman).',
            pages.length
                ? '- Buat halaman berikut, masing-masing sebagai file HTML terpisah yang saling terhubung:'
                : '- Pecah jadi beberapa halaman terpisah sesuai section pada STRUKTUR HALAMAN di atas (mis. Beranda, Tentang, Kontak, dst), masing-masing sebagai file HTML terpisah yang saling terhubung.',
            ...pages.map((p) => `   • ${p}`),
            '- Pakai navbar/menu yang sama di semua halaman, lengkap dengan penanda halaman yang sedang aktif.',
            '- Tiap item nav adalah link (href) ke file halaman lain yang sesuai, BUKAN anchor scroll dalam satu halaman.',
            '- Struktur section di atas diterapkan pada halaman yang relevan (umumnya halaman utama/Beranda).',
        ]) : block('NAVIGASI', [
            '- Website ini SATU HALAMAN (single-page). Buat navbar sticky di header berisi link ke tiap section utama.',
            '- Tiap item nav pakai anchor scroll ke id section terkait (contoh: #harga, #faq, #testimoni), sesuaikan nama anchor dengan section pada STRUKTUR HALAMAN di atas.',
            '- Saat item nav diklik, halaman scroll smooth ke section tersebut (bukan reload atau pindah halaman).',
        ]),
        block('DETAIL KONTEN', engine.details(v)),
        block('CTA & KONVERSI', engine.cta ? engine.cta(v) : []),
        block('ADD-ON', addonInstructions(v.addons)),
        block('GAMBAR', [
            `- Gambar hero/banner utama: pakai foto asli dari Unsplash yang temanya nyambung dengan "${brand}" (${engine.label}${v.style ? `, gaya ${v.style}` : ''}), format URL https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&w=1600&q=80 dengan ID foto yang benar-benar ada dan relevan.`,
            '- Tambahkan atribut onerror di tag <img> gambar hero, isi dengan fallback ke URL placeholder (lihat poin berikutnya) supaya kalau link Unsplash gagal dimuat, tidak muncul gambar rusak/broken.',
            '- Untuk semua gambar lain selain hero (galeri, produk, tim, testimoni, dsb), jangan cari foto asli satu-satu; cukup pakai placeholder dari https://placehold.co/{lebar}x{tinggi}/EEEEEE/999999?text={label singkat sesuai isi gambar}.',
            '- Setiap tag <img> wajib punya src yang pasti valid (Unsplash dengan fallback, atau placehold.co); jangan pernah biarkan src kosong atau menunjuk ke URL yang belum tentu ada.',
        ]),
        block('KONTRAS TEKS', [
            '- WAJIB kontras tinggi di setiap kombinasi teks-di-atas-latar (termasuk teks di atas gambar/hero, section gelap, tombol, badge, card, footer): rasio kontras minimal 4.5:1 untuk teks biasa dan 3:1 untuk judul besar (standar WCAG AA). Jangan pernah teks terang di atas latar terang, atau teks gelap di atas latar gelap.',
            '- Kalau pakai Tailwind CSS lewat CDN (<script src="https://cdn.tailwindcss.com">) dan mendefinisikan warna custom sendiri di tailwind.config (mis. warna "cream", "ink"), JANGAN PERNAH gabungkan warna custom itu dengan modifier opacity (contoh yang DILARANG: text-cream/60, bg-ink/10, border-ink/20) karena Tailwind Play CDN tidak selalu bisa me-render utility opacity untuk warna custom, sehingga teks jadi transparan, hilang, atau kontrasnya rendah.',
            '- Sebagai gantinya, definisikan tiap level warna sebagai kode hex solid terpisah di tailwind.config (mis. ink: "#1A1A1A", "ink-muted": "#6B6B6B", "ink-soft": "#9CA3AF"), lalu pakai nama warnanya langsung TANPA modifier opacity (mis. text-ink-muted, bukan text-ink/60). Kalau memang butuh transparansi, tulis nilai literal seperti text-[#6B6B6B] atau bg-[rgba(26,26,26,0.1)], jangan warna custom + "/opacity".',
            '- Sebelum output final, cek ulang seluruh halaman: pastikan tidak ada teks yang nyaris tak terlihat karena kontrasnya kurang, terutama di hero section, overlay di atas gambar, dan dark mode kalau ada.',
        ]),
        block('OUTPUT', [
            line('Format', format),
            '- Kode bersih & rapi, siap langsung deploy (Netlify / Vercel / GitHub Pages)',
            '- Beri komentar penanda di tiap section agar gampang diedit ulang',
        ]),
        block('ATURAN PENTING', [
            '- Jangan gunakan tanda em dash (garis pisah panjang) di manapun; pakai tanda hubung biasa (-), koma, atau kalimat terpisah, supaya hasilnya tidak terlihat seperti tulisan AI.',
            '- Untuk semua ikon (sosial media, fitur, checklist, dll), gunakan SVG inline (mis. Heroicons/Lucide/Feather) - jangan pakai emoji atau karakter ikon mentah.',
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

const addonsField = {
    name: 'addons', label: 'Add-on (opsional)', type: 'addons',
    hint: 'Centang fitur tambahan, otomatis ikut masuk ke prompt',
    options: [
        { key: 'form', label: 'Form kontak (kirim ke email)', input: { placeholder: 'Endpoint Formspree atau email tujuan' } },
        { key: 'wa_float', label: 'Tombol WhatsApp mengambang', input: { placeholder: 'Nomor WA (kosong = pakai nomor di brief)' } },
        { key: 'analytics', label: 'Google Analytics (GA4)', input: { placeholder: 'Measurement ID, mis. G-XXXXXXX' } },
        { key: 'pixel', label: 'Meta Pixel', input: { placeholder: 'Pixel ID, mis. 1234567890' } },
        { key: 'seo', label: 'SEO dasar (meta, Open Graph, sitemap)' },
    ],
};

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
        star: true,
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
            styleField, colorsField('Ungu + putih, modern & energik'), outputField, addonsField,
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
            { name: 'marketplace', label: 'Link Marketplace (opsional)', type: 'multitext', max: 5, placeholder: 'https://tokopedia.com/kopinusantara', hint: 'Bisa tambah beberapa (maks 5): Tokopedia, Shopee, TikTok Shop, dll.' },
            styleField, colorsField('Cokelat tua + krem, hangat & natural'), outputField, addonsField,
        ],
        details: (v) => [
            subList('Produk (Nama | Harga | Kategori)', v.products),
            subList('Kategori', v.categories),
        ],
        cta: (v) => [
            line('Metode order', v.orderMethod || 'Order via WhatsApp'),
            line('Nomor WhatsApp', v.whatsapp),
            subList('Link marketplace', v.marketplace),
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
        star: true,
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
            styleField, colorsField('Biru navy + putih, profesional & bersih'), outputField, addonsField,
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
            styleField, colorsField('Hitam + aksen kuning, bold & personal'), outputField, addonsField,
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
        tagline: 'Undangan pernikahan & acara lengkap fitur kekinian.',
        sections: [
            'Cover pembuka + nama tamu personal (via parameter ?to=nama)',
            'Profil mempelai / tuan rumah',
            'Countdown menuju hari-H',
            'Detail Akad: tanggal, waktu, lokasi + Google Maps',
            'Detail Resepsi: tanggal, waktu, lokasi + Google Maps (bisa beda waktu & tempat dari akad)',
            'RSVP langsung ke WhatsApp',
            'Amplop digital (rekening bank + QRIS)',
            'Galeri foto & love story / timeline',
            'Ucapan & doa',
        ],
        fields: [
            { name: 'hosts', label: 'Nama Mempelai / Tuan Rumah', type: 'text', placeholder: 'Rani & Doni', required: true },
            { name: 'akadDate', label: 'Tanggal & Waktu Akad', type: 'text', placeholder: 'Sabtu, 12 Desember 2026, pukul 08.00 WIB' },
            { name: 'akadVenue', label: 'Lokasi Akad', type: 'textarea', placeholder: 'Masjid Agung Al-Furqon\nJl. Diponegoro No. 1, Bandar Lampung' },
            { name: 'akadMaps', label: 'Link Google Maps Akad (opsional)', type: 'text', placeholder: 'https://maps.google.com/?q=Masjid+Agung+Al-Furqon' },
            { name: 'resepsiDate', label: 'Tanggal & Waktu Resepsi', type: 'text', placeholder: 'Sabtu, 12 Desember 2026, pukul 11.00 - 14.00 WIB' },
            { name: 'resepsiVenue', label: 'Lokasi Resepsi', type: 'textarea', placeholder: 'Gedung Graha Wangsa\nJl. Ahmad Yani No. 10, Bandar Lampung' },
            { name: 'resepsiMaps', label: 'Link Google Maps Resepsi (opsional)', type: 'text', placeholder: 'https://maps.google.com/?q=Gedung+Graha+Wangsa' },
            nuansaChoiceField,
            { name: 'rsvpWa', label: 'Nomor WhatsApp RSVP', type: 'text', placeholder: '628123456789' },
            { name: 'bank', label: 'Amplop Digital (rekening + e-wallet)', type: 'textarea', placeholder: 'BCA 1234567890 a.n. Doni Saputra\nGopay: 08123456789 a.n. Doni Saputra' },
            { name: 'features', label: 'Fitur Tambahan', type: 'tags', placeholder: 'Musik latar, Galeri foto, Buku tamu, Live streaming' },
            colorsField('Sage green + cream, elegan & lembut'), outputField, addonsField,
        ],
        details: (v) => [
            line('Mempelai / tuan rumah', v.hosts),
            line('Akad (tanggal & waktu)', v.akadDate),
            line('Akad (lokasi)', v.akadVenue),
            line('Akad (Google Maps)', v.akadMaps),
            line('Resepsi (tanggal & waktu)', v.resepsiDate),
            line('Resepsi (lokasi)', v.resepsiVenue),
            line('Resepsi (Google Maps)', v.resepsiMaps),
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
            styleField, colorsField('Cokelat susu + krem, cozy'), outputField, addonsField,
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
            { name: 'location', label: 'Lokasi', type: 'textarea', placeholder: 'Jl. Braga No. 88, Bandung' },
            { name: 'maps', label: 'Link Google Maps (opsional)', type: 'text', placeholder: 'https://maps.google.com/?q=Kedai+Kopi+Senja' },
            waField,
            styleField, colorsField('Cokelat hangat + krem, cozy & homey'), outputField, addonsField,
        ],
        details: (v) => [
            subList('Menu (Nama | Harga | Kategori)', v.menu),
            line('Jam buka', v.hours),
            line('Lokasi', v.location),
            line('Google Maps', v.maps),
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
            styleField, colorsField('Krem + cokelat muda, soft & romantis'), outputField, addonsField,
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
 * A lean, JSON-serializable description of an engine's fields (no React icon
 * components), sent to the backend so it can ask the AI for a random brief
 * that matches each field's shape.
 */
export function fieldSchema(engine) {
    return engine.fields.map((f) => ({
        name: f.name,
        type: f.type,
        label: f.label,
        hint: f.hint,
        placeholder: f.placeholder,
        options: f.options?.map((opt) => (typeof opt === 'string' ? opt : { value: opt.value, key: opt.key, label: opt.label })),
    }));
}

/**
 * A single restrained brand accent, reused for every engine (no neon rainbow).
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
