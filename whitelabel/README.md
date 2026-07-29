# Whitelabel Website Builder — Panduan Setup

Ini adalah salinan produk website-builder milikmu sendiri: website statis (tanpa server, tanpa biaya hosting bulanan) dengan brand-mu sendiri, harga-mu sendiri, dan sistem login pelanggan lewat Google Sheet milikmu sendiri. File ini ditulis step-by-step supaya bisa kamu ikuti sambil merekam video tutorial untuk pembelimu sendiri.

## Apa yang termasuk / tidak termasuk

- Semua halaman engine (Landing Page, Toko Online, Company Profile, Undangan, dll) dengan logika prompt-builder yang sama.
- Panduan Online (panduan deploy) dan halaman Add-ons.
- Login pelanggan dicek lewat Google Sheet yang kamu kontrol sendiri (tanpa server).
- "Simpan project" disimpan di browser pelanggan sendiri (localStorage) — tidak sinkron antar-perangkat, karena tidak ada database di sini.
- **Tidak termasuk:** tombol "Isi Acak (AI)". Fitur itu memanggil API AI berbayar dari server, yang bertentangan dengan model "tanpa biaya server" paket ini. Kalau kamu mau fitur ini, kamu perlu jalankan backend kecil sendiri + API key — hubungi kami dulu.

## Langkah 1 — Rebrand

Buka `src/config.js` dan edit:

- `brandName`, `logoInitials`, `tagline` — nama/logo/pitch kamu.
- `accentColor` — satu kode warna hex; semua tombol/highlight di aplikasi otomatis ikut berubah warna, tidak perlu kerja desain.
- `priceLabel`, `priceNote`, `paymentUrl` — harga dan link pembayaranmu sendiri (Midtrans, Trakteer, QRIS, order via WhatsApp, dll).
- `whatsapp` — nomor support kamu.
- `appsScriptUrl` — diisi di Langkah 2 di bawah.

## Langkah 2 — Setup login pelanggan (Google Sheet)

1. Buka https://sheets.new untuk membuat spreadsheet baru.
2. Klik **File > Import > Upload**, lalu pilih file `google-apps-script/Customers-template.csv` dari paket ini. Pilih opsi **Sisipkan sheet baru** (Insert new sheet) saat diminta lokasi import.
3. Sheet baru akan otomatis terisi header `Email | Kode Akses | Status` plus 2 baris contoh. Klik kanan tab sheet itu, **Ganti nama** (Rename) jadi persis `Customers` (huruf besar-kecil harus sama).
4. **Hapus 2 baris contoh** (`budi@email.com` dan `siti@email.com`) — itu hanya contoh format, bukan data asli. Kode akses `ABC123` ada di paket publik ini, jadi kalau tidak dihapus, siapa pun yang punya paket ini bisa memakainya untuk login ke sitemu.
5. Buka menu **Extensions > Apps Script** di spreadsheet ini, hapus kode default, lalu paste isi file `google-apps-script/Code.gs` dari paket ini.
6. Klik **Deploy > New deployment**. Type: **Web app**. Execute as: **Me**. Who has access: **Anyone**.
7. Klik **Deploy**, izinkan permission yang diminta Google, lalu salin URL yang berakhiran `/exec`.
8. Paste URL itu ke `appsScriptUrl` di `src/config.js`.

Setiap ada yang bayar, tambahkan baris baru di sheet `Customers`: email mereka, kode akses singkat yang kamu kirim, dan `active` di kolom Status. Untuk mencabut akses nanti, ubah Status jadi `inactive` — tidak perlu menghapus barisnya.

## Langkah 3 — Build

```
npm install
npm run build
```

Ini menghasilkan folder `dist/` — website statis polos, siap deploy.

## Langkah 4 — Deploy gratis (alur yang sama seperti panduan di dalam app)

1. Zip isi `dist/` jadi satu file `.zip` (atau langsung folder-nya kalau hosting kamu menerima folder).
2. Buka https://vercel.com/drop, login dulu (GitHub, GitLab, atau email).
3. Drag & drop folder `dist/` yang sudah di-zip ke area upload.
4. Website kamu langsung live dengan alamat gratis `namamu.vercel.app`.

(Netlify di https://app.netlify.com/drop juga bisa dipakai dengan cara yang sama kalau kamu lebih suka.)

## Langkah 5 — Jual

Kirim pembeli ke URL website-mu yang sudah live. Setelah mereka bayar lewat `paymentUrl` kamu, tambahkan baris mereka di Google Sheet, lalu kirim email + kode akses supaya mereka bisa login di `websitekamu.com/#/login`.

## Deploy ulang setelah ganti rebrand

Setiap kali kamu edit `src/config.js`, ulangi Langkah 3 (build) dan Langkah 4 (drop folder `dist/` yang baru) — website statis butuh build ulang untuk memakai perubahan config, tidak ada server yang bisa di-restart.

## Butuh bantuan?

Ada langkah yang macet atau error? Hubungi kami langsung lewat WhatsApp: **wa.me/6283854775376**.
