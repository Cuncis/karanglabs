<x-mail::message>
# Halo {{ $name }} 👋

Terima kasih! Langganan **{{ $tier === 'bundle' ? 'AI Tools + Studio' : 'AI Tools' }}** kamu sudah aktif.

Berikut detail login kamu:

@if ($password)
<x-mail::panel>
**Email:** {{ $email }}
**Password:** {{ $password }}
</x-mail::panel>

Demi keamanan, ganti password kamu setelah login pertama lewat halaman Profile.
@else
Kamu sudah punya akun dengan email **{{ $email }}**. Silakan login memakai password yang sudah kamu punya, akses langganannya sudah otomatis terbuka.
@endif

@if ($tier === 'bundle')
Paket ini juga sudah membuka akses ke **Karanglabs Studio**.
@endif

<x-mail::button :url="$loginUrl">
Login ke AI Tools
</x-mail::button>

Langganan ini otomatis diperpanjang tiap bulan lewat Mayar, dan bisa dibatalkan kapan saja. Kalau butuh bantuan, cukup balas email ini.

Salam,<br>
Tim Karanglabs
</x-mail::message>
