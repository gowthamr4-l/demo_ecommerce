import React from 'react';
import Link from 'next/link';
import { SeoPropertyData, generateLongDescription } from '../../lib/generateSeoDescription';

interface LocalityInsightsProps {
  property: SeoPropertyData;
}

export const LocalityInsights: React.FC<LocalityInsightsProps> = ({ property }) => {
  const city = property.city || 'Chennai';
  const locality = property.locality || 'Prime Locality';
  const longDesc = generateLongDescription(property);

  const landmarks = property.nearbyLandmarks && property.nearbyLandmarks.length > 0
    ? property.nearbyLandmarks
    : [
        { name: 'Metro / Rapid Transit Station', distance: '0.8 km' },
        { name: 'Reputed International School', distance: '1.2 km' },
        { name: 'Multi-Specialty Hospital', distance: '1.5 km' },
        { name: 'Tech Park & Commercial Hub', distance: '2.5 km' },
        { name: 'Shopping Mall & Supermarket', distance: '0.5 km' },
      ];

  return (
    <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* 1. Dynamic Unique Long Description */}
      <div>
        <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
          <span className="w-2 h-5 bg-[#006ce6] rounded-full"></span>
          Detailed Property Description
        </h2>
        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 font-normal">
          <p>{longDesc}</p>
        </div>
      </div>

      {/* 2. Neighborhood Connectivity & Landmarks */}
      <div>
        <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
          <span className="w-2 h-5 bg-[#006ce6] rounded-full"></span>
          Locality &amp; Neighborhood Connectivity
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {landmarks.map((lm, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">{lm.name}</span>
              </div>
              {lm.distance && (
                <span className="text-xs font-black text-[#006ce6] bg-blue-50 px-2 py-0.5 rounded-md flex-shrink-0">
                  {lm.distance}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Internal Hub Links for SEO & Crawling */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200/80 space-y-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
          Explore More Real Estate Hubs in {city}
        </h3>
        <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-bold">
          <Link
            href={`/?category=RENT&city=${encodeURIComponent(city)}`}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#006ce6] hover:border-blue-300 transition-colors"
          >
            Properties for Rent in {city} &rarr;
          </Link>
          <Link
            href={`/?category=BUY&city=${encodeURIComponent(city)}`}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#006ce6] hover:border-blue-300 transition-colors"
          >
            Properties for Sale in {city} &rarr;
          </Link>
          <Link
            href={`/?city=${encodeURIComponent(city)}`}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#006ce6] hover:border-blue-300 transition-colors"
          >
            All Listings in {locality} &rarr;
          </Link>
        </div>
      </div>

    </section>
  );
};
