'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyCard } from '../../components/common/PropertyCard/PropertyCard';
import { Loader } from '../../components/common/Loader/Loader';
import { environment } from '../../environment';
import { authFetch, getUser } from '../../utils/apiClient';
import forOwnerImg from '../../assets/images/for_owner_img.png';

const API_ROUTES = [
  'properties',
  'residential-resale',
  'residential-pg',
  'commercial-rent',
  'commercial-sale',
  'land-plot'
];

export const OwnerDashboard: React.FC = () => {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser || !currentUser.id) {
      router.push('/');
      return;
    }

    const fetchAllProperties = async () => {
      try {
        const fetchPromises = API_ROUTES.map(route => 
          authFetch(`${environment.apiBaseUrl}/${route}/user/${currentUser.id}`).then(res => res.json()).catch(() => ({ success: false, data: [] }))
        );

        const [results, leadsRes] = await Promise.all([
          Promise.all(fetchPromises),
          authFetch(`${environment.apiBaseUrl}/leads`).then(res => res.json()).catch(() => ({ success: false, data: [] }))
        ]);
        
        let allProperties: any[] = [];
        results.forEach(result => {
          if (result.success && result.data && Array.isArray(result.data)) {
            allProperties = [...allProperties, ...result.data];
          }
        });

        // Count UNIQUE users/leads per property from the lead table by propertyId (same user counts as 1)
        const leadsUserSetMap: Record<string, Set<string>> = {};
        if (leadsRes && leadsRes.success && Array.isArray(leadsRes.data)) {
          leadsRes.data.forEach((lead: any) => {
            const propId = String(lead.propertyId || lead.propertyid || '');
            const userId = String(lead.userId || lead.userid || lead.user?.id || lead.id || '');
            if (propId && userId) {
              if (!leadsUserSetMap[propId]) {
                leadsUserSetMap[propId] = new Set();
              }
              leadsUserSetMap[propId].add(userId);
            }
          });
        }

        allProperties = allProperties.map(p => {
          const propId = String(p.id);
          const uniqueCount = leadsUserSetMap[propId] ? leadsUserSetMap[propId].size : 0;
          return {
            ...p,
            viewsCount: uniqueCount,
            leadsCount: uniqueCount
          };
        });

        // Sort by createdAt descending
        allProperties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // If no properties, redirect to create page
        if (allProperties.length === 0) {
          router.push('/for-owner/create');
        } else {
          setProperties(allProperties);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch properties", err);
        setLoading(false);
      }
    };

    fetchAllProperties();
  }, [router]);

  const handleEdit = (property: any) => {
    try {
      sessionStorage.setItem('pendingPropertyPost', JSON.stringify(property));
    } catch {}
    router.push(`/property-details?propertyCategory=${encodeURIComponent(property.propertyCategory || '')}&adType=${encodeURIComponent(property.adType || '')}&id=${encodeURIComponent(property.id || '')}`);
  };

  const getRouteForProperty = (prop: any) => {
    if (prop.propertyCategory === 'Commercial') return prop.adType === 'Rent' ? 'commercial-rent' : 'commercial-sale';
    if (prop.propertyCategory === 'Land / Plot') return 'land-plot';
    if (prop.propertyCategory === 'Residential') {
      if (prop.adType === 'Resale') return 'residential-resale';
      if (prop.adType === 'PG / Hostel') return 'residential-pg';
      return 'properties';
    }
    return 'properties';
  };

  const handleToggleStatus = async (prop: any) => {
    const route = getRouteForProperty(prop);
    const newStatus = prop.isActive === false ? true : false;
    try {
      const res = await authFetch(`${environment.apiBaseUrl}/${route}/${prop.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setProperties(prev => prev.map(p => p.id === prop.id ? { ...p, isActive: newStatus } : p));
      }
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const handleDelete = async (prop: any) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    const route = getRouteForProperty(prop);
    try {
      const res = await authFetch(`${environment.apiBaseUrl}/${route}/${prop.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setProperties(prev => prev.filter(p => p.id !== prop.id));
      }
    } catch (err) {
      console.error("Failed to delete property", err);
    }
  };

  const handleViewProperty = (property: any) => {
    try {
      sessionStorage.setItem('currentPropertyView_' + property.id, JSON.stringify(property));
    } catch {}
    router.push(`/property-view/${property.id}`);
  };

  const handleViewLeads = (property: any) => {
    try {
      sessionStorage.setItem('currentPropertyView_' + property.id, JSON.stringify(property));
    } catch {}
    router.push(`/property-leads/${property.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#f8fafc] flex flex-col items-center justify-center text-slate-500 font-['Inter',sans-serif]">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-[#006ce6] rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium">Loading your properties...</p>
      </div>
    );
  }

  const activeProperties = properties.filter(p => p.isActive !== false).length;
  const inactiveProperties = properties.length - activeProperties;

  let filtered = properties;
  if (filterTab === 'active') {
    filtered = properties.filter(p => p.isActive !== false);
  } else if (filterTab === 'inactive') {
    filtered = properties.filter(p => p.isActive === false);
  }

  const sortedProperties = [...filtered].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const paginatedProperties = sortedProperties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f8fafc] py-4 sm:py-8 px-3.5 sm:px-6 lg:px-8 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
        
        {/* Header Banner Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-3.5 sm:gap-4 relative z-10">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                My Properties
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
                Manage all your listed properties and ads in one place.
              </p>
            </div>

            <button
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-[#006ce6] hover:bg-blue-700 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer flex-shrink-0"
              onClick={() => router.push('/for-owner/create')}
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Add New Property</span>
            </button>
          </div>

          <div className="hidden lg:block absolute right-0 bottom-0 h-44 xl:h-48 w-auto pointer-events-none select-none z-0">
            <img 
              src={forOwnerImg.src || (forOwnerImg as any)} 
              alt="Properties overview" 
              className="h-full w-auto object-contain object-bottom" 
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 mt-5 sm:mt-6 relative z-10 w-full">
            
            <div className="flex flex-col justify-between bg-white/95 p-3.5 sm:p-4 lg:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-2.5 sm:gap-3.5">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"></path>
                  </svg>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{properties.length}</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-semibold mt-1">Total Listed</div>
                </div>
              </div>
              <div className="w-8 sm:w-12 h-1 bg-[#006ce6] rounded-full mt-2.5 sm:mt-3" />
            </div>

            <div className="flex flex-col justify-between bg-white/95 p-3.5 sm:p-4 lg:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-2.5 sm:gap-3.5">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{activeProperties}</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-semibold mt-1">Active Ads</div>
                </div>
              </div>
              <div className="w-8 sm:w-12 h-1 bg-emerald-500 rounded-full mt-2.5 sm:mt-3" />
            </div>

            <div className="col-span-2 sm:col-span-1 flex flex-col justify-between bg-white/95 p-3.5 sm:p-4 lg:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-2.5 sm:gap-3.5">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9"></circle>
                    <line x1="10" y1="15" x2="10" y2="9"></line>
                    <line x1="14" y1="15" x2="14" y2="9"></line>
                  </svg>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{inactiveProperties}</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-semibold mt-1">Inactive Ads</div>
                </div>
              </div>
              <div className="w-8 sm:w-12 h-1 bg-orange-500 rounded-full mt-2.5 sm:mt-3" />
            </div>

          </div>
        </div>

        {/* Toolbar: Filter Tabs */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar pb-1">
          <div className="flex items-center gap-2 flex-nowrap">
            <button
              type="button"
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 active:scale-95 ${
                filterTab === 'all'
                  ? 'bg-[#006ce6] text-white shadow-xs'
                  : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => { setFilterTab('all'); setCurrentPage(1); }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>All Properties</span>
            </button>

            <button
              type="button"
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 active:scale-95 ${
                filterTab === 'active'
                  ? 'bg-[#006ce6] text-white shadow-xs'
                  : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => { setFilterTab('active'); setCurrentPage(1); }}
            >
              <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Active</span>
            </button>

            <button
              type="button"
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 active:scale-95 ${
                filterTab === 'inactive'
                  ? 'bg-[#006ce6] text-white shadow-xs'
                  : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => { setFilterTab('inactive'); setCurrentPage(1); }}
            >
              <svg className="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="10" y1="15" x2="10" y2="9"></line>
                <line x1="14" y1="15" x2="14" y2="9"></line>
              </svg>
              <span>Inactive</span>
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <Loader variant="card" size="md" />
        ) : paginatedProperties.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
            <p className="text-slate-500 font-medium text-sm">No properties found in this tab.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {paginatedProperties.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                onClick={handleViewProperty}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
                onViewLeads={handleViewLeads}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {Math.ceil(sortedProperties.length / ITEMS_PER_PAGE) > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              type="button"
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-700 flex items-center justify-center font-bold text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </button>

            {Array.from({ length: Math.ceil(sortedProperties.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                type="button"
                className={`w-9 h-9 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  currentPage === page
                    ? 'bg-[#006ce6] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-700 flex items-center justify-center font-bold text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(sortedProperties.length / ITEMS_PER_PAGE)))}
              disabled={currentPage === Math.ceil(sortedProperties.length / ITEMS_PER_PAGE)}
            >
              &gt;
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default OwnerDashboard;
