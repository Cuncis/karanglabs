// ============================================================================
// KONFIGURASI REBRAND — ini SATU-SATUNYA file yang perlu kamu edit untuk
// menjadikan produk ini milikmu sendiri.
// Setelah mengubah apa pun di sini, jalankan `npm run build` lagi sebelum
// upload ulang ke hosting.
// ============================================================================
export const CONFIG = {
    // Tampil di sidebar, tab browser, dan halaman utama.
    brandName: 'Nama Brand Kamu',
    // Inisial singkat yang tampil di logo kecil (2-3 huruf).
    logoInitials: 'YB',
    // Kalimat pendek yang tampil di bagian hero halaman utama.
    tagline: 'Bikin website sendiri pakai AI, tanpa coding.',

    // Satu kode warna hex. Semua aksen "brand-*" di tampilan (tombol, menu
    // aktif, highlight) otomatis mengikuti warna ini — tidak perlu build ulang untuk reskin.
    accentColor: '#34d399',

    // Harga yang tampil di halaman utama. Hanya teks tampilan, tidak divalidasi di sini.
    priceLabel: 'Rp 149.000',
    priceNote: 'sekali bayar, akses selamanya',

    // Tujuan tombol "Beli sekarang" di halaman utama —
    // link pembayaran milikmu sendiri (Midtrans, Trakteer, QRIS, order via WhatsApp, dll).
    paymentUrl: 'https://your-payment-link.example.com',

    // Nomor WhatsApp yang bisa dihubungi pelanggan untuk bantuan (angka saja, pakai kode negara, tanpa +/spasi).
    whatsapp: '',

    // URL Web App Google Apps Script kamu (lihat google-apps-script/Code.gs dan
    // README.md untuk cara membuat & deploy ini pakai akun Google-mu sendiri).
    // Login pelanggan dicek lewat email + kode akses ke Google Sheet kamu lewat URL ini.
    appsScriptUrl: 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec',

    // Video tutorial yang tampil di balik tombol "Tutorial" pada tiap halaman.
    // Biarkan videoUrl kosong untuk menampilkan placeholder, bukan video.
    tutorialVideos: [
        { title: 'Cara Pakai', videoUrl: '' },
    ],
};
