import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://coducation.kr';

    const routes = [
        '',
        '/login',
        '/signup',
        '/student-signup',
        '/privacy-policy',
        '/terms-of-service',
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'monthly' as any,
        priority: route === '' ? 1 : 0.8,
    }));
}
