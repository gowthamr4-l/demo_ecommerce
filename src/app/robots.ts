import { MetadataRoute } from 'next';

/**
 * Next.js Robots.txt Generator
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://indiadits.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/for-owner/create',
          '/leads',
          '/*?*', // Disallow tracking parameters from indexation to prevent duplicate URLs
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
