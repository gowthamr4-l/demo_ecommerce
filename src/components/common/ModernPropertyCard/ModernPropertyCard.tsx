'use client';

import React, { useState } from 'react';
import { environment } from '../../../environment';
import type { PropertyData } from '../PropertyCard';

export interface ModernPropertyCardProps {
  property: PropertyData;
  onClick?: (property: PropertyData) => void;
  onContact?: (property: PropertyData) => void;
}

export const ModernPropertyCard: React.FC<ModernPropertyCardProps> = ({
  property,
  onClick,
  onContact,
}) => {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [imageError, setImageError] = useState(false);

  const photos = property.photos || [];
  const price = property.expectedPrice || property.expectedRent || '0';
  const deposit = property.expectedDeposit || property.expectedAdvance || null;
  const area = property.builtUpArea || property.plotArea || property.superBuiltUpArea || property.carpetArea;

  const getTitle = () => {
    if (property.adType === 'PG / Hostel' || property.propertyCategory === 'PG / Hostel') {
      return `${property.pgRoomTypes?.[0] || 'PG / Hostel'} Room`;
    }
    if (property.propertyCategory === 'Land / Plot') {
      return property.propertyType || 'Residential Land / Plot';
    }
    let title = property.propertyType || 'Apartment';
    if (property.bhkType) title += ` (${property.bhkType})`;
    return title;
  };

  const formatFullDate = (val?: string) => {
    if (!val) return 'Ready to Move';
    const lower = val.trim().toLowerCase();
    if (lower === 'ready to move' || lower === 'immediate' || lower === 'available now') {
      return 'Ready to Move';
    }
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return val;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return val;
    }
  };

  const getFormattedPrice = (val: string | number) => {
    const num = Number(val);
    if (isNaN(num)) return `₹${val}`;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onContact) {
      onContact(property);
    } else if (property.user?.mobile) {
      window.open(
        `https://wa.me/${property.user.mobile.toString().replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
          `Hi, I am interested in your property "${getTitle()}" listed on India DITS.`
        )}`,
        '_blank'
      );
    } else {
      onClick?.(property);
    }
  };

  return (
    <div 
      className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden cursor-pointer group h-full"
      onClick={() => onClick?.(property)}
    >
      {/* Top Image Section */}
      <div className="w-full h-56 relative overflow-hidden bg-slate-900 flex-shrink-0">
        {photos.length > 0 && !imageError ? (
          <>
            <img
              src={
                photos[photoIdx]?.url?.startsWith('http')
                  ? photos[photoIdx].url
                  : `${environment.imageBaseUrl}/${photos[photoIdx]?.url}`
              }
              alt={getTitle()}
              className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
            />

            {/* Direct Owner Blue Badge */}
            <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-bold shadow-md">
              <svg className="w-4 h-4 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Direct Owner</span>
            </div>

            {/* Carousel Arrows */}
            {photos.length > 1 && (
              <>
                <button 
                  type="button" 
                  className="absolute top-1/2 -translate-y-1/2 left-2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10" 
                  onClick={handlePrev} 
                  aria-label="Previous image"
                >
                  <svg className="w-4 h-4 flex-shrink-0" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button 
                  type="button" 
                  className="absolute top-1/2 -translate-y-1/2 right-2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10" 
                  onClick={handleNext} 
                  aria-label="Next image"
                >
                  <svg className="w-4 h-4 flex-shrink-0" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </>
            )}

            {/* Thumbnail dots */}
            {photos.length > 1 && (
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                {photos.slice(0, 5).map((_: any, idx: number) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all ${photoIdx === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`}
                  ></div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border-b border-slate-100 select-none">
            <div className="w-11 h-11 rounded-2xl bg-blue-50/80 text-[#006ce6] border border-blue-100/70 flex items-center justify-center mb-1.5 shadow-2xs">
              <svg className="w-5 h-5 stroke-[1.8]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-500">No Photo Available</span>
          </div>
        )}
      </div>

      {/* Card Body Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        
        {/* Header & Price Row */}
        <div>
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              {/* Category & Ad Type Tag */}
              <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                <svg className="w-4 h-4 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>{property.propertyCategory || 'Residential'} • {property.adType || 'Rent'}</span>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {getTitle()} in {property.city || property.locality || 'India'}
              </h3>

              {/* Posted by */}
              <div className="text-xs text-slate-500 mt-0.5">
                Posted by: <span className="font-bold text-blue-600">{property.user?.name || 'Owner'}</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="text-right flex-shrink-0">
              <div className="text-xl font-extrabold text-blue-600">
                {getFormattedPrice(price)}
                {property.adType === 'Rent' || property.adType === 'PG / Hostel' ? (
                  <span className="text-xs font-medium text-slate-500"> / mo</span>
                ) : null}
              </div>

              {deposit ? (
                <div className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                  Deposit: {getFormattedPrice(deposit)}
                </div>
              ) : area && Number(price) > 0 ? (
                <div className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                  ₹{Math.round(Number(price) / Number(area)).toLocaleString('en-IN')} / sq.ft
                </div>
              ) : null}
            </div>
          </div>

          {/* Location Line */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-2">
            <svg className="w-4 h-4 text-blue-600 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span className="truncate">
              {property.landmark ? `${property.landmark}, ` : ''}
              {property.locality ? `${property.locality}, ` : ''}
              {property.city || 'Tamil Nadu'}
            </span>
          </div>
        </div>

        {/* 3-Column Key Specs Box (Single-Line Aligned) */}
        <div className="grid grid-cols-[1fr_1fr_1.25fr] gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 items-center">
          
          {/* Spec 1: Configuration */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 flex items-center justify-center text-blue-600 flex-shrink-0">
              <svg className="w-4 h-4 flex-shrink-0" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-tight whitespace-nowrap">CONFIGURATION</span>
              <span className="text-xs font-bold text-slate-900 whitespace-nowrap truncate">
                {property.bhkType || property.pgRoomTypes?.[0] || property.propertyType || 'Standard'}
              </span>
            </div>
          </div>

          {/* Spec 2: Built-Up Area */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 flex items-center justify-center text-blue-600 flex-shrink-0">
              <svg className="w-4 h-4 flex-shrink-0" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
            </div>
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-tight whitespace-nowrap">BUILT-UP AREA</span>
              <span className="text-xs font-bold text-slate-900 whitespace-nowrap truncate">
                {area ? `${area} sq.ft` : 'N/A'}
              </span>
            </div>
          </div>

          {/* Spec 3: Availability */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 flex items-center justify-center text-blue-600 flex-shrink-0">
              <svg className="w-4 h-4 flex-shrink-0" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="text-[8.5px] uppercase font-bold text-slate-400 tracking-tight whitespace-nowrap">AVAILABILITY</span>
              <span className="text-xs font-bold text-slate-900 whitespace-nowrap truncate">
                {formatFullDate(property.availableFrom)}
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Actions Row */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(property);
            }}
          >
            <svg className="w-4 h-4 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            <span>View Details</span>
          </button>

          <button
            type="button"
            className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
            onClick={handleContactClick}
          >
            <svg className="w-4 h-4 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>Contact Owner</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModernPropertyCard;
