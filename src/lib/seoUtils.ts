import { environment } from '../environment';
import { SeoPropertyData, generateFaqs, generateLongDescription } from './generateSeoDescription';

export function slugify(text: string): string {
  if (!text) return 'property';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Generates canonical SEO URL: /property/[city]/[locality]/[bhk]-[type]-[title]-[id]
 */
export function generatePropertyUrl(property: SeoPropertyData): string {
  const city = slugify(property.city || 'chennai');
  const locality = slugify(property.locality || 'prime-location');
  
  const bhkPart = property.bhk ? `${property.bhk}bhk` : '';
  const typePart = slugify(property.propertyType || property.propertyCategory || 'property');
  const actionPart = property.adType ? slugify(property.adType) : 'rent';
  const idPart = property.id;

  const slug = [bhkPart, typePart, 'for', actionPart, idPart].filter(Boolean).join('-');
  return `/property/${city}/${locality}/${slug}`;
}

/**
 * Extracts property ID from trailing segment of the slug
 */
export function parsePropertyIdFromSlug(slug: string): string | number {
  if (!slug) return '';
  // Check for UUID format (8-4-4-4-12 hex chars) at the end of the slug
  const uuidMatch = slug.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
  if (uuidMatch) {
    return uuidMatch[1];
  }
  // Check for integer ID at the end
  const intMatch = slug.match(/-(\d+)$/);
  if (intMatch) {
    return intMatch[1];
  }
  // Fallback to last hyphenated segment
  const parts = slug.split('-');
  return parts[parts.length - 1] || slug;
}

/**
 * Server-side property fetching for ISR & SSR
 */
export async function fetchPropertyForSeo(id: string | number): Promise<SeoPropertyData | null> {
  if (!id) return null;

  const baseUrls = [
    environment.apiBaseUrl,
    'http://127.0.0.1:5000/api',
    'http://localhost:5000/api',
  ];

  const categories = [
    'residential-rent',
    'residential-resale',
    'residential-pg',
    'commercial-rent',
    'commercial-sale',
    'land-plot',
    'properties',
  ];

  for (const base of baseUrls) {
    for (const cat of categories) {
      try {
        const url = `${base}/${cat}/${id}`;
        const res = await fetch(url, {
          next: { revalidate: 21600 },
        });
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          if (data && (data.id || data._id)) {
            return normalizePropertyData(data);
          }
        }
      } catch (e) {
        // Continue to next endpoint
      }
    }

    // Try feed fallback
    try {
      const feedRes = await fetch(`${base}/feed?page=1&limit=200`, {
        next: { revalidate: 21600 },
      });
      if (feedRes.ok) {
        const feedJson = await feedRes.json();
        const items = feedJson.data || [];
        const match = items.find((p: any) => String(p.id) === String(id));
        if (match) return normalizePropertyData(match);
      }
    } catch (e) {}
  }

  return null;
}

/**
 * Normalizes property objects into consistent SeoPropertyData structure
 */
export function normalizePropertyData(raw: any): SeoPropertyData {
  const photos = Array.isArray(raw.photos)
    ? raw.photos.map((p: any) => (typeof p === 'string' ? p : p.url || p.path))
    : [];

  const amenities = Array.isArray(raw.amenities)
    ? raw.amenities
    : typeof raw.amenities === 'string'
    ? raw.amenities.split(',').map((a: string) => a.trim())
    : [];

  const bhkRaw = raw.bhk || (raw.bhkType ? raw.bhkType.replace(/[^0-9]/g, '') : '') || raw.bedrooms;

  const rentVal = raw.expectedRent || raw.rent ? Number(raw.expectedRent || raw.rent) : undefined;
  const priceVal = raw.expectedPrice || raw.price ? Number(raw.expectedPrice || raw.price) : undefined;
  const depositVal = raw.expectedDeposit || raw.deposit ? Number(raw.expectedDeposit || raw.deposit) : undefined;
  const areaVal = raw.builtUpArea || raw.superBuiltUpArea || raw.plotArea || raw.area
    ? Number(raw.builtUpArea || raw.superBuiltUpArea || raw.plotArea || raw.area)
    : undefined;

  const title = raw.title || raw.propertyTitle || `${bhkRaw ? `${bhkRaw} BHK ` : ''}${raw.propertyType || raw.propertyCategory || 'Property'} for ${raw.adType || 'Rent'} in ${raw.locality || raw.city || 'Chennai'}`;

  return {
    id: raw.id || raw._id,
    title,
    propertyType: raw.propertyType || raw.propertyCategory || 'Apartment',
    propertyCategory: raw.propertyCategory || 'Residential',
    adType: raw.adType || 'Rent',
    bhk: bhkRaw,
    expectedRent: rentVal,
    expectedDeposit: depositVal,
    expectedPrice: priceVal,
    monthlyMaintenance: raw.monthlyMaintenance || raw.maintenance,
    maintenanceType: raw.maintenanceType,
    builtUpArea: areaVal,
    carpetArea: raw.carpetArea ? Number(raw.carpetArea) : undefined,
    plotArea: raw.plotArea ? Number(raw.plotArea) : undefined,
    floorNo: raw.floorNo ?? raw.floor,
    totalFloors: raw.totalFloors ?? raw.totalFloor,
    furnishingStatus: raw.furnishingStatus || raw.furnishing || 'Unfurnished',
    facing: raw.facing || 'East',
    city: raw.city || 'Chennai',
    locality: raw.locality || raw.street || 'Prime Locality',
    address: raw.address || raw.completeAddress || `${raw.locality || ''}, ${raw.city || ''}`,
    latitude: raw.latitude ? Number(raw.latitude) : 13.0827,
    longitude: raw.longitude ? Number(raw.longitude) : 80.2707,
    amenities,
    photos,
    images: photos,
    description: raw.description,
    ownerName: raw.user?.name || raw.ownerName || 'Verified Property Owner',
    user: raw.user || {
      name: raw.ownerName || 'Verified Owner',
      mobile: raw.ownerMobile || raw.mobile || '9876543210',
    },
    createdAt: raw.createdAt || new Date().toISOString(),
    availableFrom: raw.availableFrom || 'Immediately',
  };
}

/**
 * Builds Schema.org JSON-LD structured data
 */
export function buildPropertyJsonLd(property: SeoPropertyData, canonicalUrl: string) {
  const price = property.expectedRent || property.expectedPrice || 0;
  const isRent = !(property.adType === 'Sale' || property.adType === 'Resale');
  const mainImage = property.photos && property.photos.length > 0 
    ? (property.photos[0].startsWith('http') ? property.photos[0] : `${environment.imageBaseUrl}/${property.photos[0]}`)
    : 'https://indiadits.com/indiaditss.webp';

  const faqs = generateFaqs(property);

  // 1. RealEstateListing + Product Schema
  const realEstateSchema = {
    '@context': 'https://schema.org',
    '@type': ['RealEstateListing', 'Product'],
    name: property.title,
    description: generateLongDescription(property),
    url: canonicalUrl,
    image: mainImage,
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      businessFunction: isRent ? 'https://schema.org/LeaseOut' : 'https://schema.org/Sell',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: price,
        priceCurrency: 'INR',
        unitText: isRent ? 'MONTH' : 'ONE_TIME',
      },
      seller: {
        '@type': 'Person',
        name: property.user?.name || property.ownerName || 'Verified Owner',
      },
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: property.latitude || 13.0827,
      longitude: property.longitude || 80.2707,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address || property.locality,
      addressLocality: property.locality,
      addressRegion: property.city,
      addressCountry: 'IN',
    },
  };

  // 2. BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://indiadits.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: property.city || 'Tamil Nadu',
        item: `https://indiadits.com/properties/${slugify(property.city || 'chennai')}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: property.locality || 'All Localities',
        item: `https://indiadits.com/properties/${slugify(property.city || 'chennai')}/${slugify(property.locality || 'all')}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: property.title,
        item: canonicalUrl,
      },
    ],
  };

  // 3. FAQPage Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return {
    realEstateSchema,
    breadcrumbSchema,
    faqSchema,
  };
}
