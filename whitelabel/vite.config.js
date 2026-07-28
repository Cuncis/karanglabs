import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Plain static build: no Laravel plugin, no manifest, just index.html + assets
// ready to zip and drag-and-drop onto Vercel/Netlify.
export default defineConfig({
    plugins: [react()],
    base: './',
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        outDir: 'dist',
    },
});
