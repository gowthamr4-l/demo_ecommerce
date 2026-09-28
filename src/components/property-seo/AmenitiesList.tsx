import React from 'react';
import { SeoPropertyData } from '../../lib/generateSeoDescription';

interface AmenitiesListProps {
  property: SeoPropertyData;
}

export const AmenitiesList: React.FC<AmenitiesListProps> = ({ property }) => {
  const specs = [
    { label: 'Bedrooms (BHK)', val: property.bhk ? `${property.bhk} BHK` : null, icon: '🛏️' },
    { label: 'Furnishing', val: property.furnishingStatus || 'Unfurnished', icon: '🛋️' },
    { label: 'Facing Orientation', val: property.facing ? `${property.facing} Facing` : null, icon: '🧭' },
    { label: 'Floor', val: property.floorNo !== undefined ? `Floor ${property.floorNo}${property.totalFloors ? ` of ${property.totalFloors}` : ''}` : null, icon: '🏢' },
    { label: 'Availability', val: property.availableFrom || 'Ready to Move', icon: '📅' },
    { label: 'Property Type', val: property.propertyType || property.propertyCategory, icon: '🏠' },
  ].filter((s) => s.val);

  const amenities = property.amenities && property.amenities.length > 0
    ? property.amenities
    : ['24/7 Water Supply', 'Covered Car Parking', 'Power Backup', 'Security Guard', 'Elevator / Lift', 'CCTV Surveillance'];

  return (
    <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* 1. Property Specifications Overview */}
      <div>
        <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <span className="w-2 h-5 bg-[#006ce6] rounded-full"></span>
          Overview &amp; Specifications
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {specs.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-3">
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                  {item.label}
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 block truncate mt-0.5">
                  {item.val}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Verified Amenities Grid */}
      <div>
        <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <span className="w-2 h-5 bg-[#006ce6] rounded-full"></span>
          Amenities &amp; Lifestyle Features
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
          {amenities.map((amenity, idx) => (
            <div
              key={idx}
              className="px-3.5 py-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-slate-800 text-xs sm:text-sm font-semibold flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#006ce6] flex-shrink-0"></span>
              <span className="truncate">{amenity}</span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};
