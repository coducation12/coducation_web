import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Coducation',
        short_name: 'Coducation',
        description: '코딩 교육의 새로운 시작, Coducation',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#38bdf8',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/logo.png',
                sizes: '192x192',
                type: 'image/png',
            },
        ],
    };
}
