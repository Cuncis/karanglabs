import forms from '@tailwindcss/forms';

// `brand-*` is the reseller's single rebrand color (set in src/config.js), applied
// at runtime as CSS variables (src/lib/theme.js) so a rebuild isn't needed to reskin.
export default {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.jsx'],
    theme: {
        extend: {
            colors: {
                brand: {
                    300: 'rgb(var(--brand-300) / <alpha-value>)',
                    400: 'rgb(var(--brand-400) / <alpha-value>)',
                    500: 'rgb(var(--brand-500) / <alpha-value>)',
                    600: 'rgb(var(--brand-600) / <alpha-value>)',
                    700: 'rgb(var(--brand-700) / <alpha-value>)',
                },
            },
        },
    },
    plugins: [forms],
};
