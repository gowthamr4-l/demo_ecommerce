import { MetadataRoute } from 'next';
import { environment } from '../environment';
import { generatePropertyUrl, normalizePropertyData } from '../lib/seoUtils';

/**
 * Dynamic XML Sitemap Generator
 * Submits high-priority property landing pages to search engine crawlers.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://indiadits.com';

  // 1. Static Core Hub Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/contact-support`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/for-owner`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // 2. Dynamic Property URLs from Feed API
  let dynamicProperties: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${environment.apiBaseUrl}/feed?page=1&limit=500`, {
      next: { revalidate: 21600 },
    });

    if (res.ok) {
      const json = await res.json();
      const items = json.data || [];

      dynamicProperties = items.map((raw: any) => {
        const property = normalizePropertyData(raw);
        const path = generatePropertyUrl(property);
        return {
          url: `${baseUrl}${path}`,
          lastModified: property.createdAt ? new Date(property.createdAt) : new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.8,
        };
      });
    }
  } catch (error) {
    console.error('Error generating sitemap property entries:', error);
  }

  return [...staticPages, ...dynamicProperties];
}
