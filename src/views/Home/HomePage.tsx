'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { environment } from '../../environment';
import { type PropertyData } from '../../components/common/PropertyCard';
import { ModernPropertyCard } from '../../components/common/ModernPropertyCard';
import { LoginSignin } from '../../components/login&singin/login_singin';
import { Loader } from '../../components/common/Loader/Loader';
import { generatePropertyUrl } from '../../lib/seoUtils';

const ENDPOINTS = [
  { name: 'properties', category: 'Residential', type: 'Rent' },
  { name: 'residential-resale', category: 'Residential', type: 'Resale' },
  { name: 'residential-pg', category: 'Residential', type: 'PG / Hostel' },
  { name: 'commercial-rent', category: 'Commercial', type: 'Rent' },
  { name: 'commercial-sale', category: 'Commercial', type: 'Resale' },
  { name: 'land-plot', category: 'Land / Plot', type: 'Resale' }
];

const CATEGORIES = [
  { id: 'ALL', label: 'All Categories', icon: '🏠' },
  { id: 'LAND', label: 'Plots & Lands', icon: '🗺️' },
  { id: 'RENT', label: 'Residential Rent', icon: '🔑' },
  { id: 'BUY', label: 'Buy / Resale', icon: '🏷️' },
  { id: 'PG', label: 'PG / Hostel', icon: '🛏️' },
  { id: 'COMMERCIAL', label: 'Commercial', icon: '🏢' }
];

const SECTIONS = [
  {
    id: 'LAND',
    filter: (p: PropertyData) => p.propertyCategory === 'Land / Plot'
  },
  {
    id: 'RENT',
    filter: (p: PropertyData) => p.propertyCategory === 'Residential' && p.adType === 'Rent'
  },
  {
    id: 'BUY',
    filter: (p: PropertyData) => p.propertyCategory === 'Residential' && p.adType === 'Resale'
  },
  {
    id: 'PG',
    filter: (p: PropertyData) => p.adType === 'PG / Hostel' || p.propertyCategory === 'PG / Hostel'
  },
  {
    id: 'COMMERCIAL',
    filter: (p: PropertyData) => p.propertyCategory === 'Commercial'
  }
];

const BUDGET_PRESETS = [
  { id: 'ALL', label: 'Any Budget', min: null, max: null },
  { id: 'U10K', label: 'Under ₹10,000', min: 0, max: 10000 },
  { id: '10K_25K', label: '₹10,000 - ₹25,000', min: 10000, max: 25000 },
  { id: '25K_50K', label: '₹25,000 - ₹50,000', min: 25000, max: 50000 },
  { id: '50K_1L', label: '₹50,000 - ₹1 Lakh', min: 50000, max: 100000 },
  { id: '1L_30L', label: '₹1 Lakh - ₹30 Lakhs', min: 100000, max: 3000000 },
  { id: '30L_75L', label: '₹30 Lakhs - ₹75 Lakhs', min: 3000000, max: 7500000 },
  { id: '75L_15CR', label: '₹75 Lakhs - ₹1.5 Cr', min: 7500000, max: 15000000 },
  { id: 'ABOVE_15CR', label: 'Above ₹1.5 Cr', min: 15000000, max: null }
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
];

export const HomePage: React.FC = () => {
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination State (10 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 10;
  const listingsRef = useRef<HTMLDivElement>(null);

  // Budget Filter State
  const [selectedPresetId, setSelectedPresetId] = useState('ALL');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Authentication Modal State for Guest Users
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'view' | 'contact';
    property: PropertyData;
  } | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);

  const fetchPaginatedProperties = async (pageToFetch = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', pageToFetch.toString());
      params.set('limit', ITEMS_PER_PAGE.toString());
      if (activeCategory && activeCategory !== 'ALL') params.set('category', activeCategory);
      if (selectedCity) params.set('city', selectedCity);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (sortBy) params.set('sortBy', sortBy);

      const res = await fetch(`${environment.apiBaseUrl}/feed?${params.toString()}`);
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setProperties(data.data);
          if (data.pagination) {
            setTotalPages(data.pagination.totalPages || 1);
            setTotalCount(data.pagination.totalCount || data.data.length);
            setCurrentPage(data.pagination.page || pageToFetch);
          }
          return;
        }
      }

      // Fallback
      const fetchPromises = ENDPOINTS.map((endpoint) =>
        fetch(`${environment.apiBaseUrl}/${endpoint.name}`)
          .then((r) => (r.ok ? r.json() : { success: false, data: [] }))
          .then((d) => (d.success && Array.isArray(d.data) ? d.data : []))
          .catch(() => [])
      );

      const results = await Promise.all(fetchPromises);
      let allItems: PropertyData[] = [];
      results.forEach((list) => {
        allItems = [...allItems, ...list];
      });

      let filtered = allItems.filter((p) => p.isActive !== false);

      if (activeCategory !== 'ALL') {
        const sec = SECTIONS.find((s) => s.id === activeCategory);
        if (sec) filtered = filtered.filter((p) => sec.filter(p));
      }

      if (selectedCity) {
        filtered = filtered.filter((p) => p.city?.toLowerCase() === selectedCity.toLowerCase());
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter((p) =>
          (p.locality || '').toLowerCase().includes(q) ||
          (p.city || '').toLowerCase().includes(q) ||
          (p.landmark || '').toLowerCase().includes(q) ||
          (p.bhkType || '').toLowerCase().includes(q) ||
          (p.propertyType || '').toLowerCase().includes(q)
        );
      }

      if (minPrice) filtered = filtered.filter((p) => Number(p.expectedPrice || p.expectedRent || 0) >= Number(minPrice));
      if (maxPrice) filtered = filtered.filter((p) => Number(p.expectedPrice || p.expectedRent || 0) <= Number(maxPrice));

      filtered.sort((a, b) => {
        const priceA = Number(a.expectedPrice || a.expectedRent || 0);
        const priceB = Number(b.expectedPrice || b.expectedRent || 0);
        if (sortBy === 'price-low') return priceA - priceB;
        if (sortBy === 'price-high') return priceB - priceA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      const total = filtered.length;
      const pages = Math.ceil(total / ITEMS_PER_PAGE) || 1;
      const sliced = filtered.slice((pageToFetch - 1) * ITEMS_PER_PAGE, pageToFetch * ITEMS_PER_PAGE);

      setProperties(sliced);
      setTotalCount(total);
      setTotalPages(pages);
      setCurrentPage(pageToFetch);
    } catch (err) {
      console.error('Failed to fetch paginated properties:', err);
      setProperties([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchPaginatedProperties(1);
  }, [activeCategory, selectedCity, searchQuery, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    fetchPaginatedProperties(newPage);
    if (listingsRef.current) {
      listingsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const cities = useMemo(() => {
    return [
      'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
      'Tiruppur', 'Erode', 'Vellore', 'Thanjavur', 'Dindigul',
      'Kancheepuram', 'Tirunelveli', 'Nagercoil', 'Hosur', 'Karur'
    ].sort();
  }, []);

  const handleSelectPreset = (preset: typeof BUDGET_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    if (preset.id === 'ALL') {
      setMinPrice('');
      setMaxPrice('');
    } else {
      setMinPrice(preset.min !== null ? preset.min.toString() : '');
      setMaxPrice(preset.max !== null ? preset.max.toString() : '');
    }
  };

  const handleResetFilters = () => {
    setSelectedPresetId('ALL');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setIsFilterOpen(false);
  };

  const displayedProperties = useMemo(() => {
    return properties.slice(0, ITEMS_PER_PAGE);
  }, [properties]);

  const recordLead = async (property: PropertyData, actionType: 'view' | 'contact') => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      const now = new Date();
      const viewedTimeStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      await fetch(`${environment.apiBaseUrl}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          propertyCategory: property.propertyCategory || 'Residential',
          adType: property.adType || 'Rent',
          userId: user?.id || null,
          viewerName: user?.name || 'Guest User',
          viewerMobile: user?.mobile || 'N/A',
          viewerEmail: user?.email || 'N/A',
          action: actionType,
          viewedTime: viewedTimeStr
        }),
      });
    } catch (e) {
      console.error('Failed to log lead:', e);
    }
  };

  const handlePropertyClick = (property: PropertyData) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setPendingAction({ type: 'view', property });
      setIsAuthModalOpen(true);
      return;
    }
    recordLead(property, 'view');
    try {
      sessionStorage.setItem('currentPropertyView_' + property.id, JSON.stringify(property));
    } catch {}
    const seoUrl = generatePropertyUrl(property as any);
    router.push(seoUrl);
  };

  const handleContactClick = (property: PropertyData) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setPendingAction({ type: 'contact', property });
      setIsAuthModalOpen(true);
      return;
    }

    recordLead(property, 'contact');
    if (property.user?.mobile) {
      const title = property.propertyType || property.propertyCategory || 'Property';
      window.open(
        `https://wa.me/${property.user.mobile.toString().replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
          `Hi, I am interested in your property "${title}" listed on India DITS.`
        )}`,
        '_blank'
      );
    } else {
      try {
        sessionStorage.setItem('currentPropertyView_' + property.id, JSON.stringify(property));
      } catch {}
      const seoUrl = generatePropertyUrl(property as any);
      router.push(seoUrl);
    }
  };

  const handleLoginSuccess = (user: any) => {
    if (!pendingAction) return;

    const property = pendingAction.property;
    if (pendingAction.type === 'view') {
      recordLead(property, 'view');
      try {
        sessionStorage.setItem('currentPropertyView_' + property.id, JSON.stringify(property));
      } catch {}
      const seoUrl = generatePropertyUrl(property as any);
      router.push(seoUrl);
    } else if (pendingAction.type === 'contact') {
      recordLead(property, 'contact');
      if (property.user?.mobile) {
        const title = property.propertyType || property.propertyCategory || 'Property';
        window.open(
          `https://wa.me/${property.user.mobile.toString().replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
            `Hi, I am interested in your property "${title}" listed on India DITS.`
          )}`,
          '_blank'
        );
      } else {
        try {
          sessionStorage.setItem('currentPropertyView_' + property.id, JSON.stringify(property));
        } catch {}
        const seoUrl = generatePropertyUrl(property as any);
        router.push(seoUrl);
      }
    }
    setPendingAction(null);
  };

  const isBudgetFiltered = selectedPresetId !== 'ALL' || Boolean(minPrice || maxPrice);
  const isFiltered = isBudgetFiltered || sortBy !== 'newest';
  const currentCategoryObj = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  return (
    <div className="font-['Inter',sans-serif] text-[#0f172a] bg-[#f8fafc] min-h-screen">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#3b82f6] text-white pt-8 pb-12 sm:pt-12 sm:pb-16 px-4 sm:px-6 text-center">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15)_0%,transparent_60%)]"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[38px] font-extrabold leading-tight mb-2 sm:mb-3 tracking-tight text-white">
            Find Your Dream Home &amp; Property in India
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#e0e7ff] max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed">
            Explore verified residential homes, apartments, PGs, commercial spaces, and plots with direct owner contact.
          </p>

          {/* Search Box Container */}
          <div className="bg-white rounded-2xl p-1.5 sm:p-2 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2 max-w-3xl mx-auto border border-white/40">
            <div className="flex-1 w-full relative flex items-center">
              <svg className="absolute left-3.5 text-[#94a3b8] w-4 h-4 pointer-events-none flex-shrink-0" style={{ width: 18, height: 18, minWidth: 18, minHeight: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search by locality, landmark, BHK, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 pl-10 sm:pl-11 pr-3 text-xs sm:text-sm outline-none text-[#0f172a] placeholder:text-[#94a3b8] bg-transparent font-medium"
              />
            </div>

            {/* City Selector */}
            {cities.length > 0 && (
              <div className="w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-slate-200 pl-0 sm:pl-2">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full sm:w-36 py-2 px-3 text-xs sm:text-sm font-semibold text-[#334155] bg-transparent outline-none cursor-pointer"
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Search Button */}
            <button 
              type="button"
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-98 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer"
              onClick={() => { }}
            >
              <span>Search</span>
            </button>
          </div>
        </div>
      </section>

      {/* Category Filter Tabs */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 -mt-5 sm:-mt-6 mb-6 sm:mb-8 relative z-20">
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap sm:justify-center no-scrollbar scroll-smooth">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-150 shadow-md cursor-pointer flex-shrink-0 active:scale-95 ${
                activeCategory === cat.id
                  ? 'bg-[#2563eb] text-white border border-[#2563eb] shadow-blue-500/30 scale-102'
                  : 'bg-white text-[#475569] border border-slate-200/90 hover:border-[#93c5fd] hover:text-[#2563eb] hover:shadow-lg'
              }`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="text-base leading-none">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main id="listings-section" ref={listingsRef} className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pb-16">

        {/* Toolbar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 sm:mb-6 py-3 px-4 sm:py-3.5 sm:px-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs gap-3">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="text-xl sm:text-2xl">{currentCategoryObj.icon}</span>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0f172a] m-0">
              {currentCategoryObj.id === 'ALL' ? 'All Properties' : currentCategoryObj.label}
            </h2>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="relative w-full sm:w-auto" ref={filterRef}>
              <button
                type="button"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 border py-2 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-all shadow-2xs ${
                  isFiltered
                    ? 'bg-[#eff6ff] border-[#2563eb] text-[#1d4ed8] shadow-md shadow-blue-500/10'
                    : 'bg-white border-slate-300 text-[#1e293b] hover:border-[#2563eb] hover:text-[#2563eb] hover:bg-[#f8fafc]'
                }`}
                onClick={() => setIsFilterOpen((prev) => !prev)}
                aria-label="Open filter options"
              >
                <svg className="w-4 h-4 text-[#2563eb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                <span>Filter &amp; Sort</span>
                {isFiltered && <span className="w-2 h-2 bg-[#2563eb] rounded-full inline-block"></span>}
                <svg className={`w-4 h-4 text-[#64748b] flex-shrink-0 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {isFilterOpen && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-full sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 sm:p-5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[82vh] overflow-y-auto">
                  
                  <div className="flex justify-between items-center mb-3.5 pb-2.5 border-b border-[#f1f5f9]">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#2563eb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                      </svg>
                      <h4 className="text-sm font-extrabold text-[#0f172a] m-0">Filters & Sorting</h4>
                    </div>
                    {isFiltered && (
                      <button 
                        type="button" 
                        className="bg-transparent border-0 text-[#ef4444] text-xs font-bold cursor-pointer py-0.5 px-1.5 hover:underline" 
                        onClick={handleResetFilters}
                      >
                        Reset All
                      </button>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#334155] mb-2 uppercase tracking-wider">
                      Select Budget
                    </span>

                    <div className="grid grid-cols-2 gap-1.5 mb-3">
                      {BUDGET_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all text-center border ${
                            selectedPresetId === preset.id
                              ? 'bg-[#eff6ff] border-[#2563eb] text-[#1d4ed8] font-bold shadow-2xs'
                              : 'bg-[#f8fafc] border border-[#e2e8f0] text-[#475569] hover:bg-[#eff6ff] hover:border-[#93c5fd] hover:text-[#2563eb]'
                          }`}
                          onClick={() => handleSelectPreset(preset)}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div className="bg-[#f8fafc] p-2.5 rounded-xl border border-[#e2e8f0]">
                      <span className="block text-[11px] font-bold text-[#64748b] mb-1.5">Custom Price Range (₹)</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="Min Price"
                            value={minPrice}
                            onChange={(e) => {
                              setMinPrice(e.target.value);
                              setSelectedPresetId('CUSTOM');
                            }}
                            className="w-full py-1.5 px-2 rounded-lg border border-[#cbd5e1] text-xs font-semibold text-[#0f172a] outline-none bg-white focus:border-[#2563eb]"
                          />
                        </div>
                        <span className="text-xs text-[#94a3b8] font-bold">-</span>
                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="Max Price"
                            value={maxPrice}
                            onChange={(e) => {
                              setMaxPrice(e.target.value);
                              setSelectedPresetId('CUSTOM');
                            }}
                            className="w-full py-1.5 px-2 rounded-lg border border-[#cbd5e1] text-xs font-semibold text-[#0f172a] outline-none bg-white focus:border-[#2563eb]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#334155] mb-2 uppercase tracking-wider">
                      Sort Properties By
                    </span>

                    <div className="flex flex-col gap-1.5">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          className={`py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all text-left flex items-center justify-between ${
                            sortBy === opt.id
                              ? 'bg-[#eff6ff] border border-[#2563eb] text-[#1d4ed8] font-bold'
                              : 'bg-[#f8fafc] border border-[#e2e8f0] text-[#475569] hover:bg-[#eff6ff] hover:border-[#93c5fd] hover:text-[#2563eb]'
                          }`}
                          onClick={() => setSortBy(opt.id)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2.5 border-t border-[#f1f5f9]">
                    <button 
                      type="button" 
                      className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white border-0 py-2.5 px-4 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md shadow-blue-500/25" 
                      onClick={() => setIsFilterOpen(false)}
                    >
                      Apply Filters
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <Loader variant="card" size="md" />
        ) : displayedProperties.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayedProperties.map((prop) => (
                <ModernPropertyCard
                  key={prop.id}
                  property={prop}
                  onClick={handlePropertyClick}
                  onContact={handleContactClick}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 sm:mt-12 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-3.5 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-5">
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                  <div className="w-10 h-10 rounded-xl bg-blue-50/90 text-[#006ce6] border border-blue-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                      <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                      <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                      <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Properties Feed</div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-600">
                      Showing <span className="font-extrabold text-slate-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                      <span className="font-extrabold text-slate-900">{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}</span> of{' '}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 text-[#006ce6] border border-blue-200/70 ml-1">
                        {totalCount} Properties
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-center w-full md:w-auto">
                  <button
                    type="button"
                    disabled={currentPage === 1 || loading}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 ${
                      currentPage === 1 || loading
                        ? 'bg-slate-50 text-slate-300 border border-slate-200/50 cursor-not-allowed'
                        : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-[#006ce6] hover:border-blue-300 border border-slate-200 shadow-2xs hover:shadow-sm cursor-pointer active:scale-95'
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
                    {getPageNumbers().map((p, idx) => {
                      if (p === '...') {
                        return (
                          <span key={`dots-${idx}`} className="w-7 text-center text-slate-400 text-xs font-black tracking-widest select-none">
                            •••
                          </span>
                        );
                      }
                      const isCurrent = p === currentPage;
                      return (
                        <button
                          key={`page-${p}`}
                          type="button"
                          onClick={() => handlePageChange(p as number)}
                          disabled={loading}
                          className={`min-w-[34px] h-8 px-2.5 rounded-lg text-xs sm:text-sm font-extrabold flex items-center justify-center transition-all duration-150 cursor-pointer ${
                            isCurrent
                              ? 'bg-[#006ce6] text-white shadow-md shadow-blue-500/30 scale-105'
                              : 'text-slate-600 hover:text-[#006ce6] hover:bg-white hover:shadow-2xs'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage === totalPages || loading}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 ${
                      currentPage === totalPages || loading
                        ? 'bg-slate-50 text-slate-300 border border-slate-200/50 cursor-not-allowed'
                        : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-[#006ce6] hover:border-blue-300 border border-slate-200 shadow-2xs hover:shadow-sm cursor-pointer active:scale-95'
                    }`}
                  >
                    <span>Next</span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 px-5 bg-white rounded-2xl border border-dashed border-[#cbd5e1] text-[#64748b]">
            <svg className="w-12 h-12 stroke-[1.5] mx-auto text-[#94a3b8] mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <h3 className="text-lg font-bold text-[#0f172a] my-2">No properties found</h3>
            <p className="text-xs text-[#64748b] max-w-md mx-auto leading-relaxed">
              {searchQuery || selectedCity || activeCategory !== 'ALL' || isFiltered
                ? 'Try adjusting your filters, budget range, search query, or selecting "All Categories".'
                : 'There are currently no active properties listed.'}
            </p>
            {isFiltered && (
              <button 
                className="mt-3.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white border-0 py-2 px-5 rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-blue-500/20" 
                onClick={handleResetFilters}
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}
      </main>

      <LoginSignin
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAction(null);
        }}
        onLogin={handleLoginSuccess}
      />

    </div>
  );
};

export default HomePage;
