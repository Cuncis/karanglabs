<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Apply the saved Studio theme before paint to avoid a flash (defaults to dark). --}}
        <script>
            (function () {
                try {
                    var t = localStorage.getItem('studioTheme');
                    if (t === 'light') { document.documentElement.classList.remove('dark'); }
                    else { document.documentElement.classList.add('dark'); }
                } catch (e) { document.documentElement.classList.add('dark'); }
            })();
        </script>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>
        <link rel="icon" href="https://cdn.libradigital.id/logo-01%20(1)%20(1).png" type="image/png">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
