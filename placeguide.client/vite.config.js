import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        // Expose Vite to devices on the same Wi-Fi network during local development.
        host: true,
        port: 5173,
        strictPort: true,
        proxy: {
            // The browser uses the same frontend origin; Vite forwards API calls locally.
            '/api': {
                target: 'http://127.0.0.1:5229',
                changeOrigin: true,
            },
            '/Uploads': {
                target: 'http://127.0.0.1:5229',
                changeOrigin: true,
            },
        },
    },
});
