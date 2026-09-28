'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from '../../components/common/Loader/Loader';
import forOwnerImg from '../../assets/images/for_owner_img.png';

const tnDistricts = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram',
  'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam',
  'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram',
  'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur',
  'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur',
  'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore',
  'Viluppuram', 'Virudhunagar'
];

export const ForOwnerPage: React.FC = () => {
  const router = useRouter();
  const [propertyCategory, setPropertyCategory] = useState('Residential');
  const [adType, setAdType] = useState('Rent');
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    try {
      const user = localStorage.getItem('user');
      if (!user) {
        router.push('/');
      }
    } catch {}
  }, [router]);

  const [citySearch, setCitySearch] = useState('');
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setIsCityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDistricts = tnDistricts.filter((d) =>
    d.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleDetectLocation = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return;
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            '';
          setCitySearch(city);
          setIsCityOpen(false);
        } catch {
          setCitySearch('Location not found');
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        console.warn('Location detection skipped or unavailable:', err?.message || err);
        setDetectingLocation(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  };

  // Ad types by category
  const adTypesByCategory: Record<
    string,
    { key: string; title: string; desc: string; icon: React.ReactNode; bgClass: string; textClass: string }[]
  > = {
    Residential: [
      {
        key: 'Rent',
        title: 'Rent',
        desc: 'Find verified tenants for your home',
        bgClass: 'bg-blue-50',
        textClass: 'text-[#006ce6]',
        icon: (
          <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        ),
      },
      {
        key: 'Resale',
        title: 'Resale',
        desc: 'Sell your residential property to buyers',
        bgClass: 'bg-purple-50',
        textClass: 'text-purple-600',
        icon: (
          <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
        ),
      },
      {
        key: 'PG / Hostel',
        title: 'PG / Hostel',
        desc: 'List your PG, hostel, or shared space',
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-600',
        icon: (
          <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 22h16"></path>
            <path d="M6 22V6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v16"></path>
            <path d="M10 10h4"></path>
            <path d="M10 14h4"></path>
          </svg>
        ),
      },
    ],
    Commercial: [
      {
        key: 'Rent',
        title: 'Rent',
        desc: 'Rent out your office, shop, or showroom',
        bgClass: 'bg-blue-50',
        textClass: 'text-[#006ce6]',
        icon: (
          <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        ),
      },
      {
        key: 'Sale',
        title: 'Sale',
        desc: 'Sell commercial buildings & workspaces',
        bgClass: 'bg-purple-50',
        textClass: 'text-purple-600',
        icon: (
          <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
        ),
      },
    ],
    'Land / Plot': [
      {
        key: 'Resale',
        title: 'Resale',
        desc: 'Sell plots, farmland, and layout lands',
        bgClass: 'bg-emerald-50',
        textClass: 'text-emerald-600',
        icon: (
          <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
            <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
          </svg>
        ),
      },
    ],
  };

  const currentAdTypes = adTypesByCategory[propertyCategory] || [];

  const handleCategoryChange = (category: string) => {
    setPropertyCategory(category);
    const types = adTypesByCategory[category] || [];
    setAdType(types[0]?.key || '');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#fafafa] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-['Inter',sans-serif] text-slate-900 relative">
      {/* Fullscreen Animated Navigation Loader */}
      {isNavigating && (
        <Loader fullScreen size="lg" />
      )}
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">

        {/* Top Header Banner */}
        <div className="bg-white rounded-[28px] p-6 sm:p-8 md:p-9 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex-1 min-w-0 z-10">
            <h1 className="text-2xl sm:text-3xl md:text-[34px] font-black text-slate-950 leading-tight mb-2 tracking-tight">
              Post your property for <span className="text-[#006ce6]">Free</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-[15px] text-slate-500 max-w-xl mb-5 leading-relaxed font-normal">
              Reach thousands of verified buyers and tenants directly with zero brokerage fee.
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#eef6ff] hover:bg-[#e0efff] text-[#006ce6] text-xs sm:text-sm font-bold transition-all cursor-pointer border border-[#d9ebff] shadow-2xs hover:scale-[1.01]"
              onClick={() => router.push('/')}
            >
              <span>Looking for a property? Browse Properties &rarr;</span>
            </button>
          </div>

          <div className="w-44 sm:w-56 md:w-64 flex-shrink-0 select-none pointer-events-none z-10">
            <img src={forOwnerImg.src || (forOwnerImg as any)} alt="City Illustration" className="w-full h-auto object-contain object-right mix-blend-multiply opacity-95" />
          </div>
        </div>

        {/* Main Selection Form Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/80 shadow-xs space-y-7">

          {/* Top Controls Row: City & WhatsApp updates */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">

            {/* City Selector */}
            <div className="relative flex-1 max-w-md" ref={cityRef}>
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#006ce6] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all cursor-pointer"
                onClick={() => setIsCityOpen(true)}
              >
                <svg className="w-4 h-4 text-[#006ce6] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <input
                  type="text"
                  placeholder="Enter city or district (e.g. Chennai, Coimbatore)"
                  value={citySearch}
                  onChange={(e) => { setCitySearch(e.target.value); setIsCityOpen(true); }}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold outline-none text-slate-900 placeholder:text-slate-400"
                />
                <svg className="w-4 h-4 text-slate-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {/* City Dropdown Menu */}
              {isCityOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-full bg-white rounded-xl border border-slate-200 shadow-xl p-2 z-50 max-h-60 overflow-y-auto">
                  <div
                    className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-blue-50 text-[#006ce6] text-xs font-bold cursor-pointer"
                    onClick={handleDetectLocation}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>{detectingLocation ? 'Detecting Location...' : 'Use Current Location'}</span>
                  </div>

                  <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 mt-1 border-t border-slate-100">
                    Tamil Nadu Districts
                  </div>

                  {filteredDistricts.map((d) => (
                    <div
                      key={d}
                      className={`p-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${citySearch.toLowerCase() === d.toLowerCase()
                          ? 'bg-blue-50 text-[#006ce6] font-bold'
                          : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      onClick={() => { setCitySearch(d); setIsCityOpen(false); }}
                    >
                      {d}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* WhatsApp Updates Toggle */}
            <div className="flex items-center justify-between gap-4 bg-[#f0fdf4] px-4 py-2.5 rounded-xl border border-emerald-200/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-950">
                <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <span>Get updates on WhatsApp</span>
              </div>
              <div
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${whatsappUpdates ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                onClick={() => setWhatsappUpdates(!whatsappUpdates)}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${whatsappUpdates ? 'translate-x-5' : 'translate-x-0'
                  }`}></div>
              </div>
            </div>

          </div>

          {/* Step 1: Property Category */}
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-[#006ce6] text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                1
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Choose Property Category</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4 pl-10">Select the category that best matches your property type</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  key: 'Residential',
                  title: 'Residential',
                  desc: 'Houses, Apartments, Villas & PGs',
                  bgClass: 'bg-blue-50',
                  textClass: 'text-[#006ce6]',
                  icon: (
                    <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  ),
                },
                {
                  key: 'Commercial',
                  title: 'Commercial',
                  desc: 'Offices, Shops, Showrooms & Godowns',
                  bgClass: 'bg-indigo-50',
                  textClass: 'text-indigo-600',
                  icon: (
                    <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                      <path d="M9 22v-4h6v4"></path>
                    </svg>
                  ),
                },
                {
                  key: 'Land / Plot',
                  title: 'Land / Plot',
                  desc: 'Residential Plots, Commercial Land & Farms',
                  bgClass: 'bg-emerald-50',
                  textClass: 'text-emerald-600',
                  icon: (
                    <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                      <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                    </svg>
                  ),
                },
              ].map((cat) => (
                <div
                  key={cat.key}
                  className={`p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-center relative flex flex-col items-center justify-center group ${propertyCategory === cat.key
                      ? 'border-[#006ce6] bg-[#f0f7ff] shadow-sm shadow-blue-500/10 scale-[1.01]'
                      : 'border-slate-200 hover:border-blue-300 bg-white hover:bg-slate-50'
                    }`}
                  onClick={() => handleCategoryChange(cat.key)}
                >
                  {propertyCategory === cat.key && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#006ce6] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                      ✓
                    </div>
                  )}

                  <div className={`w-14 h-14 rounded-2xl ${cat.bgClass} ${cat.textClass} flex items-center justify-center mb-3 transition-transform group-hover:scale-105`}>
                    {cat.icon}
                  </div>

                  <h3 className={`text-base font-bold mb-1 ${propertyCategory === cat.key ? 'text-[#006ce6]' : 'text-slate-900'}`}>{cat.title}</h3>
                  <p className="text-xs text-slate-500">{cat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Ad Type */}
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-[#006ce6] text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                2
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Select Ad Type</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4 pl-10">Choose the listing type for your {propertyCategory} property</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {currentAdTypes.map((item) => (
                <div
                  key={item.key}
                  className={`p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-center relative flex flex-col items-center justify-center group ${adType === item.key
                      ? 'border-[#006ce6] bg-[#f0f7ff] shadow-sm shadow-blue-500/10 scale-[1.01]'
                      : 'border-slate-200 hover:border-blue-300 bg-white hover:bg-slate-50'
                    }`}
                  onClick={() => setAdType(item.key)}
                >
                  {adType === item.key && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#006ce6] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                      ✓
                    </div>
                  )}

                  <div className={`w-14 h-14 rounded-2xl ${item.bgClass} ${item.textClass} flex items-center justify-center mb-3 transition-transform group-hover:scale-105`}>
                    {item.icon}
                  </div>

                  <h3 className={`text-base font-bold mb-1 ${adType === item.key ? 'text-[#006ce6]' : 'text-slate-900'}`}>{item.title}</h3>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#006ce6] via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-base flex items-center justify-between shadow-lg shadow-blue-500/25 transition-all cursor-pointer hover:scale-[1.005]"
              onClick={() => {
                setIsNavigating(true);
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                try {
                  sessionStorage.setItem('pendingPropertyPost', JSON.stringify({ propertyCategory, adType, city: citySearch }));
                } catch {}
                router.push(`/property-details?propertyCategory=${encodeURIComponent(propertyCategory)}&adType=${encodeURIComponent(adType)}&city=${encodeURIComponent(citySearch)}`);
              }}
            >
              <div className="flex items-center gap-3.5 text-left">
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center flex-shrink-0 text-white shadow-inner">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
                  </svg>
                </div>
                <div>
                  <div className="leading-tight text-sm sm:text-base font-extrabold">Start Posting Your Ad - It's Free!</div>
                  <div className="text-[11px] sm:text-xs font-normal text-blue-100 mt-0.5">Post in less than 2 minutes and connect directly with tenants & buyers</div>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-white text-[#006ce6] flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
              <span className="w-5 h-5 rounded-full bg-blue-50 text-[#006ce6] flex items-center justify-center text-xs font-bold">✓</span>
              <span>100% Free to Post</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
              <span className="w-5 h-5 rounded-full bg-blue-50 text-[#006ce6] flex items-center justify-center text-xs font-bold">✓</span>
              <span>Verified Leads Only</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
              <span className="w-5 h-5 rounded-full bg-blue-50 text-[#006ce6] flex items-center justify-center text-xs font-bold">✓</span>
              <span>Quick 2-Minute Process</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ForOwnerPage;
