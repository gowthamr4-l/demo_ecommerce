import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SeoPropertyData, formatPrice } from '../../lib/generateSeoDescription';
import { environment } from '../../environment';

interface PropertyHeroProps {
  property: SeoPropertyData;
}

export const PropertyHero: React.FC<PropertyHeroProps> = ({ property }) => {
  const price = formatPrice(property.expectedRent || property.expectedPrice);
  const isRent = !(property.adType === 'Sale' || property.adType === 'Resale');

  const photos = property.photos && property.photos.length > 0
    ? property.photos.map((p) => (p.startsWith('http') ? p : `${environment.imageBaseUrl}/${p}`))
    : ['/indiaditss.webp'];

  return (
    <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* 1. Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-slate-500 flex-wrap">
        <Link href="/" className="hover:text-[#006ce6] transition-colors">
          Home
        </Link>
        <span className="text-slate-300">/</span>
        <Link href={`/?city=${encodeURIComponent(property.city || '')}`} className="hover:text-[#006ce6] transition-colors">
          {property.city || 'Tamil Nadu'}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700">
          {property.locality || 'Prime Locality'}
        </span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-400 font-normal truncate max-w-[200px] sm:max-w-xs">
          {property.title}
        </span>
      </nav>

      {/* 2. Top Header & Title */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {property.bhk && (
            <span className="px-3 py-1 bg-blue-50 text-[#006ce6] border border-blue-200/70 text-xs font-black rounded-lg">
              {property.bhk} BHK
            </span>
          )}
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg uppercase tracking-wider">
            {property.propertyType || property.propertyCategory}
          </span>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-xs font-black rounded-lg">
            {property.adType || 'Rent'}
          </span>
          <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/70 text-xs font-extrabold rounded-lg inline-flex items-center gap-1">
            🛡️ 100% Direct Owner • Zero Brokerage
          </span>
        </div>

        {/* Semantic H1 */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight">
          {property.title}
        </h1>

        {/* Address and Locality */}
        <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#006ce6] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>{property.address || `${property.locality}, ${property.city}`}</span>
        </p>
      </div>

      {/* 3. Hero Visual Gallery (Core Web Vitals Optimized: Aspect Ratio & Priority LCP) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Main Hero Image (Priority Loaded for LCP < 2.5s) */}
        <div className="md:col-span-2 relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
          <Image
            src={photos[0]}
            alt={`${property.title} - Primary view in ${property.locality}, ${property.city}`}
            fill
            priority
            unoptimized={photos[0].startsWith('http')}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
            className="object-cover transition-transform duration-500 hover:scale-102"
          />
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl">
            📷 {photos.length} Verified Photos
          </div>
          <div className="absolute bottom-3 left-3 bg-gradient-to-r from-[#006ce6] to-[#2563eb] text-white text-sm sm:text-base font-black px-4 py-2 rounded-xl shadow-lg">
            {price} {isRent ? <span className="text-xs font-normal opacity-90">/ month</span> : ''}
          </div>
        </div>

        {/* Supporting Thumbnails */}
        <div className="hidden md:grid grid-rows-2 gap-3 sm:gap-4">
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80">
            <Image
              src={photos[1] || photos[0]}
              alt={`${property.title} - Interior view in ${property.locality}`}
              fill
              loading="lazy"
              unoptimized={(photos[1] || photos[0]).startsWith('http')}
              sizes="33vw"
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80">
            <Image
              src={photos[2] || photos[0]}
              alt={`${property.title} - Locality and surroundings`}
              fill
              loading="lazy"
              unoptimized={(photos[2] || photos[0]).startsWith('http')}
              sizes="33vw"
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>

    </section>
  );
};
