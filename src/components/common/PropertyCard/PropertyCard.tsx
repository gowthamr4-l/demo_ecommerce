'use client';

import React, { useState } from 'react';
import { environment } from '../../../environment';

export interface PropertyPhoto {
  id?: string;
  url: string;
  displayOrder?: number;
  [key: string]: any;
}

export interface PropertyData {
  id: string;
  propertyCategory?: string;
  adType?: string;
  propertyType?: string;
  bhkType?: string;
  pgRoomTypes?: string[];
  city?: string;
  locality?: string;
  landmark?: string;
  expectedPrice?: string | number;
  expectedRent?: string | number;
  builtUpArea?: string | number;
  plotArea?: string | number;
  superBuiltUpArea?: string | number;
  carpetArea?: string | number;
  isActive?: boolean;
  createdAt: string | Date;
  photos?: PropertyPhoto[];
  viewsCount?: number;
  leadsCount?: number;
  [key: string]: any;
}

export interface PropertyCardProps {
  property: PropertyData;
  onEdit?: (property: PropertyData) => void;
  onToggleStatus?: (property: PropertyData) => void;
  onDelete?: (property: PropertyData) => void;
  onClick?: (property: PropertyData) => void;
  onViewLeads?: (property: PropertyData) => void;
  onMenuClick?: (e: React.MouseEvent, property: PropertyData) => void;
  className?: string;
  showActions?: boolean;
  showStatus?: boolean;
  showViews?: boolean;
  imageServerUrl?: string;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onEdit,
  onToggleStatus,
  onDelete,
  onClick,
  onViewLeads,
  className = '',
  showActions = true,
  showStatus = showActions,
  imageServerUrl = environment.imageBaseUrl,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  if (!property) {
    return null;
  }

  const photos = property.photos || [];
  const hasPhotos = photos.length > 0;
  const currentPhoto = hasPhotos ? photos[currentImageIndex] : null;

  const getImageUrl = (photo: PropertyPhoto | null) => {
    if (!photo || !photo.url) return '';
    if (photo.url.startsWith('http://') || photo.url.startsWith('https://')) {
      return photo.url;
    }
    return `${imageServerUrl}/${photo.url}`;
  };

  const formatPrice = (val?: string | number) => {
    if (val === undefined || val === null || val === '') return '0';
    const clean = val.toString().replace(/[^0-9]/g, '');
    if (!clean) return '0';
    return Number(clean).toLocaleString('en-IN');
  };

  const getTitle = () => {
    if (property.adType === 'PG / Hostel' || property.propertyCategory === 'PG / Hostel') {
      return `${property.pgRoomTypes?.[0] || 'PG / Hostel'} Room`;
    }
    if (property.propertyCategory === 'Land / Plot') {
      return property.propertyType || 'Land / Plot Resale';
    }
    if (property.propertyCategory === 'Commercial') {
      return property.propertyType || `Commercial ${property.adType || 'Property'}`;
    }
    let title = property.propertyType || 'Apartment';
    if (property.bhkType) title += ` (${property.bhkType})`;
    return title;
  };

  const isActive = property.isActive !== false;
  const price = property.expectedPrice || property.expectedRent || '0';
  const area = property.builtUpArea || property.plotArea || property.superBuiltUpArea || property.carpetArea;
  const views = property.viewsCount !== undefined ? property.viewsCount : (property.leadsCount || 0);

  const formatDate = (dateVal?: string | Date) => {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageError(false);
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageError(false);
    setCurrentImageIndex((prev) => (prev + 1) % photos.length);
  };

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group font-['Inter',sans-serif] ${className}`}
      onClick={() => onClick?.(property)}
    >
      {/* Top Image Showcase */}
      <div>
        <div className="relative w-full h-48 sm:h-52 bg-slate-900 overflow-hidden select-none">
          {hasPhotos && !imageError ? (
            <img
              src={getImageUrl(currentPhoto)}
              alt={getTitle()}
              className="w-full h-full object-cover transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border-b border-slate-100 select-none">
              <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] border border-blue-100/70 flex items-center justify-center mb-1 shadow-2xs">
                <svg className="w-5 h-5 stroke-[1.8]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">No Photo Available</span>
            </div>
          )}

          {/* Top-Left Active / Inactive Interactive Button */}
          {showStatus && (
            <button
              type="button"
              className={`absolute top-3 left-3 z-20 px-3 py-1 rounded-md text-[11px] font-bold shadow-sm flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                isActive
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus?.(property);
              }}
              title={isActive ? "Click to Deactivate" : "Click to Activate"}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-red-200'}`} />
              <span>{isActive ? 'Active' : 'Inactive'}</span>
            </button>
          )}

          {/* Next / Prev Image Arrows */}
          {hasPhotos && photos.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center text-base shadow-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-20 hover:scale-110"
                onClick={handlePrevImage}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center text-base shadow-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-20 hover:scale-110"
                onClick={handleNextImage}
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}

          {/* Bottom-Left Photos Count Badge */}
          {hasPhotos && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-sm">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <span>{photos.length > 1 ? `${currentImageIndex + 1}/${photos.length} Photos` : `${photos.length} Photos`}</span>
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5">
          
          {/* Category Pill & Date */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#006ce6] text-[11px] font-bold border border-blue-100">
              {property.propertyCategory || 'Residential'} – {property.adType || 'Rent'}
            </span>
            {property.createdAt && (
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                </svg>
                <span>{formatDate(property.createdAt)}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-black text-slate-900 tracking-tight line-clamp-1 mb-1">
            {getTitle()}
          </h3>

          {/* Location */}
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1 truncate mb-3">
            <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span className="truncate">{property.locality ? `${property.locality}, ` : ''}{property.city || 'Tamil Nadu'}</span>
          </div>

          {/* Pricing & Area & Recent Views Badge */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              <div className="text-lg font-black text-emerald-600 leading-none">
                ₹{formatPrice(price)}
                {property.adType === 'Rent' || property.adType === 'PG / Hostel' ? (
                  <span className="text-xs text-slate-500 font-medium"> /mo</span>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Recent Views Badge with Eye Icon */}
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-[#006ce6] text-[#006ce6] hover:text-white text-xs font-bold transition-all border border-blue-100 cursor-pointer shadow-2xs group/btn hover:scale-105"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewLeads ? onViewLeads(property) : (onClick ? onClick(property) : null);
                }}
                title="Click to view visitor leads for this property"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>{views} {views === 1 ? 'View' : 'Views'}</span>
              </button>

              {area && (
                <div className="text-xs text-slate-400 font-semibold text-right">
                  {area} sq.ft
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Controls */}
      {showActions && (
        <div className="p-3 sm:px-4 sm:pb-4 bg-white border-t border-slate-100 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="flex-1 py-2 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            onClick={() => onClick?.(property)}
          >
            <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>View Details</span>
          </button>

          <button
            type="button"
            className="flex-1 py-2 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 hover:text-[#006ce6] text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            onClick={() => onEdit?.(property)}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>Edit</span>
          </button>

          <button
            type="button"
            className="py-2 px-2.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            onClick={() => onDelete?.(property)}
            title="Delete Property"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertyCard;
