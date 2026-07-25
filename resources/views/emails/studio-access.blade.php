<x-mail::message>
# Halo {{ $name }} 👋

Terima kasih! Pembayaran kamu berhasil dan **akses Karanglabs Studio** sudah aktif.

Berikut detail login kamu:

@if ($password)
<x-mail::panel>
**Email:** {{ $email }}
**Password:** {{ $password }}
</x-mail::panel>

Demi keamanan, ganti password kamu setelah login pertama lewat halaman Profile.
@else
Kamu sudah punya akun dengan email **{{ $email }}**. Silakan login memakai password yang sudah kamu punya, dan akses Studio-nya sudah otomatis terbuka.
@endif

<x-mail::button :url="$loginUrl">
Login ke Studio
</x-mail::button>

Kalau butuh bantuan, cukup balas email ini.

Salam,<br>
Tim Karanglabs
</x-mail::message>
