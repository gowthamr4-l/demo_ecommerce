import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  fetchPropertyForSeo,
  parsePropertyIdFromSlug,
  generatePropertyUrl,
  buildPropertyJsonLd,
} from '../../../../../lib/seoUtils';
import {
  generateMetaDescription,
  formatPrice,
} from '../../../../../lib/generateSeoDescription';
import { PropertyHero } from '../../../../../components/property-seo/PropertyHero';
import { PriceBreakdown } from '../../../../../components/property-seo/PriceBreakdown';
import { AmenitiesList } from '../../../../../components/property-seo/AmenitiesList';
import { LocalityInsights } from '../../../../../components/property-seo/LocalityInsights';
import { FAQAccordion } from '../../../../../components/property-seo/FAQAccordion';
import { SimilarProperties } from '../../../../../components/property-seo/SimilarProperties';
import { ContactCTA } from '../../../../../components/property-seo/ContactCTA';
import { PropertyJsonLd } from '../../../../../components/property-seo/PropertyJsonLd';
import { environment } from '../../../../../environment';

/**
 * 6-hour ISR Revalidation (21,600 seconds)
 * Ensures ultra-fast CDN edge delivery with automated background refresh.
 */
export const revalidate = 21600;

interface PropertyPageProps {
  params: Promise<{
    city: string;
    locality: string;
    slug: string;
  }>;
}

/**
 * Dynamic Next.js Metadata Generator for Search Engines & Social Media
 */
export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams || {};
  const propertyId = parsePropertyIdFromSlug(slug || '');
  const property = await fetchPropertyForSeo(propertyId);

  if (!property) {
    return {
      title: 'Property Not Found | India DITS',
      description: 'Explore verified residential homes and commercial spaces on India DITS.',
    };
  }

  const bhk = property.bhk ? `${property.bhk} BHK ` : '';
  const type = property.propertyType || property.propertyCategory || 'Property';
  const action = property.adType === 'Sale' || property.adType === 'Resale' ? 'for Sale' : 'for Rent';
  const locality = property.locality || 'Prime Locality';
  const city = property.city || 'Tamil Nadu';
  const price = formatPrice(property.expectedRent || property.expectedPrice);

  // 1. <title> tag format: "{BHK} {Property Type} for {Sale/Rent} in {Locality}, {City} | {Price} | India DITS"
  const title = `${bhk}${type} ${action} in ${locality}, ${city} | ${price} | India DITS`;

  // 2. <meta name="description"> (150-160 chars, unique)
  const description = generateMetaDescription(property);

  // 3. Clean Canonical URL
  const canonicalPath = generatePropertyUrl(property);
  const canonicalUrl = `https://indiadits.com${canonicalPath}`;

  // 4. Primary Image for OG & Twitter Card
  const ogImage = property.photos && property.photos.length > 0
    ? (property.photos[0].startsWith('http') ? property.photos[0] : `${environment.imageBaseUrl}/${property.photos[0]}`)
    : 'https://indiadits.com/indiaditss.webp';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en-IN': canonicalUrl,
        'hi-IN': `${canonicalUrl}?lang=hi`,
        'ta-IN': `${canonicalUrl}?lang=ta`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'India DITS Real Estate',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${property.title} in ${locality}, ${city}`,
        },
      ],
      type: 'article',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Server-Rendered Property Page
 */
export default async function PropertyPage({ params }: PropertyPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams || {};
  const propertyId = parsePropertyIdFromSlug(slug || '');
  const property = await fetchPropertyForSeo(propertyId);

  if (!property) {
    notFound();
  }

  const canonicalPath = generatePropertyUrl(property);
  const canonicalUrl = `https://indiadits.com${canonicalPath}`;

  // Build JSON-LD Schema (RealEstateListing, BreadcrumbList, FAQPage)
  const { realEstateSchema, breadcrumbSchema, faqSchema } = buildPropertyJsonLd(property, canonicalUrl);

  return (
    <>
      {/* 1. Structured Data Injection (Schema.org) */}
      <PropertyJsonLd
        realEstateSchema={realEstateSchema}
        breadcrumbSchema={breadcrumbSchema}
        faqSchema={faqSchema}
      />

      {/* 2. Main Semantic Content */}
      <main className="min-h-screen bg-[#f8fafc] py-6 sm:py-8 font-['Inter',sans-serif] text-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            
            {/* Left Column: Primary Content (2 cols on lg) */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Hero Section & Gallery */}
              <PropertyHero property={property} />

              {/* Price Breakdown */}
              <PriceBreakdown property={property} />

              {/* Overview & Amenities */}
              <AmenitiesList property={property} />

              {/* Locality Insights & Internal Linking */}
              <LocalityInsights property={property} />

              {/* FAQ Accordion */}
              <FAQAccordion property={property} />

              {/* Similar Properties */}
              <SimilarProperties currentProperty={property} similar={property.similarProperties} />
            </div>

            {/* Right Column: Sticky Contact Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <ContactCTA property={property} />
            </div>

          </div>

          {/* Mobile Sticky Bottom CTA */}
          <div className="lg:hidden">
            <ContactCTA property={property} />
          </div>

        </div>
      </main>
    </>
  );
}
