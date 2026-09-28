import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SeoPropertyData, formatPrice } from '../../lib/generateSeoDescription';
import { generatePropertyUrl } from '../../lib/seoUtils';
import { environment } from '../../environment';

interface SimilarPropertiesProps {
  currentProperty: SeoPropertyData;
  similar?: SeoPropertyData[];
}

export const SimilarProperties: React.FC<SimilarPropertiesProps> = ({ currentProperty, similar = [] }) => {
  const locality = currentProperty.locality || 'this area';
  const city = currentProperty.city || 'Tamil Nadu';

  if (!similar || similar.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 lg:p-8 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-[#006ce6] rounded-full"></span>
          Similar Properties in {locality}, {city}
        </h2>
        <Link
          href={`/?city=${encodeURIComponent(city)}`}
          className="text-xs font-bold text-[#006ce6] hover:underline"
        >
          View All &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {similar.slice(0, 3).map((item) => {
          const seoUrl = generatePropertyUrl(item);
          const price = formatPrice(item.expectedRent || item.expectedPrice);
          const photoUrl = item.photos && item.photos.length > 0
            ? (item.photos[0].startsWith('http') ? item.photos[0] : `${environment.imageBaseUrl}/${item.photos[0]}`)
            : '/indiaditss.webp';

          return (
            <Link
              key={item.id}
              href={seoUrl}
              className="group rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                <Image
                  src={photoUrl}
                  alt={`${item.title} in ${item.locality}, ${item.city}`}
                  fill
                  unoptimized={photoUrl.startsWith('http')}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                  {item.adType || 'Rent'}
                </div>
              </div>

              <div className="p-3.5 space-y-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#006ce6] transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  📍 {item.locality}, {item.city}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs sm:text-sm font-black text-[#006ce6]">
                    {price}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {item.bhk ? `${item.bhk} BHK` : item.propertyType}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
