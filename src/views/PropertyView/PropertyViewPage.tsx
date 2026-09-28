'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { environment } from '../../environment';
import { Loader } from '../../components/common/Loader/Loader';

const API_ROUTES = [
  'properties',
  'residential-resale',
  'residential-pg',
  'commercial-rent',
  'commercial-sale',
  'land-plot'
];

export const PropertyViewPage: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [property, setProperty] = useState<any>(() => {
    if (typeof window !== 'undefined' && id) {
      try {
        const cached = sessionStorage.getItem('currentPropertyView_' + id);
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });
  const [loading, setLoading] = useState(!property);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Slideshow for photos
  const photos = property?.photos || [];
  useEffect(() => {
    if (photos.length <= 1 || isGalleryModalOpen) return;

    const interval = setInterval(() => {
      setActivePhotoIdx((prev) => (prev + 1) % photos.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [photos, isGalleryModalOpen]);

  // Fetch property details if not available in state
  useEffect(() => {
    if (property || !id) {
      setLoading(false);
      return;
    }

    const fetchPropertyDetails = async () => {
      setLoading(true);
      try {
        for (const route of API_ROUTES) {
          try {
            const res = await fetch(`${environment.apiBaseUrl}/${route}/${id}`);
            const data = await res.json();
            if (data.success && data.data) {
              setProperty(data.data);
              setLoading(false);
              return;
            }
          } catch {
            // continue checking next route
          }
        }
      } catch (err) {
        console.error("Failed to load property", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id, property]);

  // Record visitor lead in database
  useEffect(() => {
    const fromOwner = typeof window !== 'undefined' && (Boolean((window.history.state as any)?.fromOwner) || sessionStorage.getItem('view_fromOwner') === 'true');
    if (property?.id && !fromOwner) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          const uid = u.id || u._id;
          if (uid) {
            const d = new Date();
            const day = String(d.getDate()).padStart(2, '0');
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const month = monthNames[d.getMonth()];
            const year = d.getFullYear();
            let hours = d.getHours();
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const strHours = String(hours).padStart(2, '0');
            const exactTime = `${day} ${month} ${year}, ${strHours}:${minutes} ${ampm}`;

            fetch(`${environment.apiBaseUrl}/leads`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: uid,
                propertyId: property.id,
                propertyType: property.propertyType || property.propertyCategory || 'Property',
                status: 'Interested',
                viewedTime: exactTime
              })
            }).catch(() => {});
          }
        } catch (e) {}
      }
    }
  }, [property?.id]);

  const getRouteForProperty = (prop: any) => {
    if (!prop) return 'properties';
    if (prop.propertyCategory === 'Commercial') return prop.adType === 'Rent' ? 'commercial-rent' : 'commercial-sale';
    if (prop.propertyCategory === 'Land / Plot') return 'land-plot';
    if (prop.propertyCategory === 'Residential') {
      if (prop.adType === 'Resale') return 'residential-resale';
      if (prop.adType === 'PG / Hostel') return 'residential-pg';
      return 'properties';
    }
    return 'properties';
  };

  const handleEdit = () => {
    if (!property) return;
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('editPropertyData', JSON.stringify({
          propertyCategory: property.propertyCategory,
          adType: property.adType,
          propertyData: property
        }));
      } catch {}
    }
    router.push('/property-details');
  };

  const handleDelete = async () => {
    if (!property || !window.confirm("Are you sure you want to delete this property listing?")) return;
    const route = getRouteForProperty(property);
    setActionLoading(true);
    try {
      const res = await fetch(`${environment.apiBaseUrl}/${route}/${property.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        router.push('/for-owner');
      }
    } catch (err) {
      console.error("Failed to delete property", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: getTitle(),
        text: `Check out this property on India DITS: ${getTitle()}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#f8fafc] py-12 px-4 sm:px-8 flex items-center justify-center font-['Inter',sans-serif]">
        <Loader size="lg" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#f8fafc] py-8 px-4 sm:px-8 font-['Inter',sans-serif] text-slate-900">
        <div className="max-w-4xl mx-auto text-center py-16 px-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <h2 className="text-2xl font-bold text-slate-900">Property Not Found</h2>
          <p className="text-slate-500 my-3 mb-6 text-sm">The property you are looking for does not exist or has been removed.</p>
          <button 
            type="button" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white py-2.5 px-5 rounded-xl text-xs font-semibold cursor-pointer shadow-sm hover:bg-blue-700 transition-all"
            onClick={() => router.push('/')}
          >
            Browse Properties
          </button>
        </div>
      </div>
    );
  }

  const formatIndianCurrency = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null || val === '') return '0';
    const clean = val.toString().replace(/[^0-9]/g, '');
    if (!clean) return '0';
    return Number(clean).toLocaleString('en-IN');
  };

  const isOwner = typeof window !== 'undefined' && Boolean(
    (window.history.state as any)?.fromOwner || sessionStorage.getItem('view_fromOwner') === 'true'
  );
  const isActive = property.isActive !== false;
  const price = property.expectedPrice || property.expectedRent || property.price || '0';
  const deposit = property.expectedDeposit || property.expectedAdvance || property.deposit || null;
  const area = property.builtUpArea || property.plotArea || property.superBuiltUpArea || property.carpetArea;

  const isPG = property.adType === 'PG / Hostel' || property.propertyCategory === 'PG / Hostel';

  const getTitle = () => {
    const loc = property.locality || property.city || '';
    if (isPG) {
      const room = property.pgRoomTypes?.[0] || 'PG';
      return `${room} Room${loc ? ` in ${loc}` : ''}`;
    }
    if (property.propertyCategory === 'Land / Plot') {
      return `${property.propertyType || 'Residential Plot'}${loc ? ` in ${loc}` : ''}`;
    }
    let title = property.propertyType || 'Property';
    if (property.bhkType) title = `${property.bhkType} ${title}`;
    return `${title}${loc ? ` in ${loc}` : ''}`;
  };

  const locationText = [property.locality, property.city, property.state || 'Tamil Nadu'].filter(Boolean).join(', ');

  const ownerName = property.user?.name || property.whoWillShow || 'Property Owner';
  const rawMobile = property.user?.mobile || property.secondaryNumber || '';
  const cleanMobile = rawMobile.toString().replace(/\D/g, '');

  // Extract amenities dynamically from actual database fields
  const rawAmenities = property.amenities || property.otherFeatures || [];
  const amenitiesList: { label: string; icon: React.ReactNode }[] = [];

  const getAmenityIcon = (name: string): React.ReactNode => {
    const n = name.toLowerCase();
    if (n.includes('bed')) {
      return <svg className="w-4 h-4 text-blue-600 flex-shrink-0" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/></svg>;
    }
    if (n.includes('cupboard') || n.includes('wardrobe')) {
      return <svg className="w-4 h-4 text-purple-600 flex-shrink-0" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="9" y1="12" x2="9.01" y2="12"/><line x1="15" y1="12" x2="15.01" y2="12"/></svg>;
    }
    if (n.includes('fan')) {
      return <svg className="w-4 h-4 text-cyan-600 flex-shrink-0" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 9c-3 0-5-2-5-4s2-3 4-3 4 2 4 4c0 3-3 3-3 3z"/><path d="M12 15c3 0 5 2 5 4s-2 3-4 3-4-2-4-4c0-3 3-3 3-3z"/><path d="M9 12c0 3-2 5-4 5s-3-2-3-4 2-4 4-4c3 0 3 3 3 3z"/><path d="M15 12c0-3 2-5 4-5s3 2 3 4-2 4-4 4c-3 0-3-3-3-3z"/></svg>;
    }
    if (n.includes('wifi') || n.includes('wi-fi') || n.includes('internet')) {
      return <svg className="w-4 h-4 text-blue-600 flex-shrink-0" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>;
    }
    if (n.includes('clean') || n.includes('housekeeping')) {
      return <svg className="w-4 h-4 text-amber-600 flex-shrink-0" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-7 7a2 2 0 0 0 0 2.83l.17.17a2 2 0 0 0 2.83 0L15 12"/><path d="m14 10 3-3a2 2 0 0 1 2.83 0l.17.17a2 2 0 0 1 0 2.83l-3 3"/></svg>;
    }
    if (n.includes('water')) {
      return <svg className="w-4 h-4 text-cyan-600 flex-shrink-0" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>;
    }
    if (n.includes('cctv') || n.includes('security')) {
      return <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    }
    if (n.includes('gym')) {
      return <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12"/></svg>;
    }
    if (n.includes('parking')) {
      return <svg className="w-4 h-4 text-teal-600 flex-shrink-0" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="8" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
    }
    return <svg className="w-4 h-4 text-blue-600 flex-shrink-0" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  };

  if (Array.isArray(rawAmenities)) {
    rawAmenities.forEach((item: any) => {
      if (typeof item === 'string' && item.trim()) {
        amenitiesList.push({ label: item.trim(), icon: getAmenityIcon(item.trim()) });
      }
    });
  } else if (typeof rawAmenities === 'string' && rawAmenities.trim()) {
    rawAmenities.split(',').forEach((s: string) => {
      if (s.trim()) {
        amenitiesList.push({ label: s.trim(), icon: getAmenityIcon(s.trim()) });
      }
    });
  }

  if (property.waterSupply && !amenitiesList.some(a => a.label.toLowerCase().includes('water'))) {
    amenitiesList.push({ label: `Water Supply (${property.waterSupply})`, icon: getAmenityIcon('water') });
  }
  if (property.gatedSecurity === 'Yes' || property.gatedSecurity === 'true') {
    amenitiesList.push({ label: 'Gated Security', icon: getAmenityIcon('security') });
  }
  if (property.gym === 'Yes' || property.gym === 'true') {
    amenitiesList.push({ label: 'Gym', icon: getAmenityIcon('gym') });
  }

  const rawRules = property.pgRules || property.rules || [];
  const rulesList: string[] = Array.isArray(rawRules)
    ? rawRules.filter(Boolean)
    : typeof rawRules === 'string'
    ? rawRules.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const formatGateTime = (time: string | undefined): string => {
    if (!time) return '';
    if (time === '10.00' || time === '10:00') return '10:00 PM';
    if (time === '09.00' || time === '09:00') return '09:00 PM';
    if (time === '08.00' || time === '08:00') return '08:00 PM';
    if (time === '11.00' || time === '11:00') return '11:00 PM';
    return time;
  };

  const specsList: { label: string; value: string; icon: React.ReactNode; iconColor: string }[] = [];

  if (isPG) {
    if (property.pgRoomTypes && property.pgRoomTypes.length > 0) {
      specsList.push({
        label: 'ROOM TYPE',
        value: property.pgRoomTypes.join(', '),
        iconColor: 'bg-blue-50 text-blue-600',
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4v16"></path><path d="M2 8h18a2 2 0 0 1 2 2v10"></path><path d="M2 17h20"></path><path d="M6 8v9"></path>
          </svg>
        )
      });
    }
    if (property.preferredGuests || (property.preferredTenants && property.preferredTenants.length > 0)) {
      specsList.push({
        label: 'PREFERRED GUESTS',
        value: property.preferredGuests || property.preferredTenants.join(', '),
        iconColor: 'bg-indigo-50 text-indigo-600',
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        )
      });
    }
    if (property.foodIncluded) {
      specsList.push({
        label: 'FOOD INCLUDED',
        value: property.foodIncluded,
        iconColor: 'bg-emerald-50 text-emerald-600',
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line>
          </svg>
        )
      });
    }
    if (property.monthlyMaintenance || property.maintenanceExtra !== undefined) {
      specsList.push({
        label: 'MAINTENANCE',
        value: property.monthlyMaintenance || (property.maintenanceExtra ? 'Extra' : 'Included in Rent'),
        iconColor: 'bg-purple-50 text-purple-600',
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        )
      });
    }
    if (property.gateClosingTime) {
      specsList.push({
        label: 'GATE CLOSING TIME',
        value: formatGateTime(property.gateClosingTime),
        iconColor: 'bg-amber-50 text-amber-600',
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        )
      });
    }
    if (property.bathroomCount || property.bathrooms) {
      specsList.push({
        label: 'BATHROOMS',
        value: `${property.bathroomCount || property.bathrooms} (Attached)`,
        iconColor: 'bg-cyan-50 text-cyan-600',
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><path d="M6 12V7a6 6 0 0 1 12 0v5"></path>
          </svg>
        )
      });
    }
    if (property.furnishing) {
      specsList.push({
        label: 'FURNISHING',
        value: property.furnishing,
        iconColor: 'bg-blue-50 text-blue-600',
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"></path><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"></path><path d="M4 18v2"></path><path d="M20 18v2"></path>
          </svg>
        )
      });
    }
    if (property.parking) {
      specsList.push({
        label: 'PARKING',
        value: property.parking,
        iconColor: 'bg-teal-50 text-teal-600',
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="8" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        )
      });
    }
  } else {
    if (property.propertyType) {
      specsList.push({
        label: 'PROPERTY TYPE',
        value: property.propertyType,
        iconColor: 'bg-blue-50 text-blue-600',
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18"></path><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
          </svg>
        )
      });
    }
    if (property.bhkType) {
      specsList.push({
        label: 'BHK CONFIG',
        value: property.bhkType,
        iconColor: 'bg-blue-50 text-blue-600',
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
        )
      });
    }
    if (area) {
      specsList.push({
        label: 'AREA',
        value: `${area} sq.ft`,
        iconColor: 'bg-indigo-50 text-indigo-600',
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.3 8.7L8.7 21.3c-.4.4-1 .4-1.4 0l-4.6-4.6c-.4-.4-.4-1 0-1.4L15.3 2.7c.4-.4 1-.4 1.4 0l4.6 4.6c.4.4.4 1 0 1.4z"></path>
          </svg>
        )
      });
    }
    if (property.furnishing) {
      specsList.push({
        label: 'FURNISHING',
        value: property.furnishing,
        iconColor: 'bg-blue-50 text-blue-600',
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"></path><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"></path><path d="M4 18v2"></path><path d="M20 18v2"></path>
          </svg>
        )
      });
    }
    if (property.floor !== undefined && property.floor !== '') {
      specsList.push({
        label: 'FLOOR',
        value: property.totalFloor ? `${property.floor} of ${property.totalFloor}` : `${property.floor}`,
        iconColor: 'bg-blue-50 text-blue-600',
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>
          </svg>
        )
      });
    }
    if (property.propertyAge) {
      specsList.push({
        label: 'AGE OF PROPERTY',
        value: property.propertyAge,
        iconColor: 'bg-amber-50 text-amber-600',
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        )
      });
    }
    if (property.facing) {
      specsList.push({
        label: 'FACING',
        value: property.facing,
        iconColor: 'bg-indigo-50 text-indigo-600',
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
          </svg>
        )
      });
    }
    if (property.parking) {
      specsList.push({
        label: 'PARKING',
        value: property.parking,
        iconColor: 'bg-teal-50 text-teal-600',
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="8" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        )
      });
    }
    if (property.waterSupply) {
      specsList.push({
        label: 'WATER SUPPLY',
        value: property.waterSupply,
        iconColor: 'bg-cyan-50 text-cyan-600',
        icon: (
          <svg className="w-4 h-4 flex-shrink-0" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
          </svg>
        )
      });
    }
  }

  const hasVisitingSchedule = Boolean(
    property.availability || property.availableAllDay || (property.startTime && property.endTime) || property.whoWillShow
  );

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f8fafc] py-3 px-3 sm:px-6 pb-6 font-['Inter',sans-serif] text-slate-900">
      <div className="max-w-7xl mx-auto space-y-3">
        
        {/* Top Action Bar */}
        <div className="flex justify-between items-center flex-wrap gap-2">
          <button 
            type="button"
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200/90 py-1.5 px-3.5 rounded-xl text-slate-700 text-xs sm:text-sm font-semibold cursor-pointer transition-all shadow-xs hover:bg-slate-100 hover:text-slate-900"
            onClick={() => router.push(isOwner ? '/for-owner' : '/')}
          >
            <svg className="w-4 h-4 flex-shrink-0" style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Properties</span>
          </button>

          <div className="flex items-center gap-1.5">
            {copiedNotification && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Link Copied!
              </span>
            )}
            
            <button 
              type="button"
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white border border-slate-200/90 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
              onClick={handleShare}
            >
              <svg className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              <span>Share</span>
            </button>

            <button 
              type="button"
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white border border-slate-200/90 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
              onClick={() => alert("Thank you. Our moderation team has been notified.")}
            >
              <svg className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                <line x1="4" y1="22" x2="4" y2="15"></line>
              </svg>
              <span>Report</span>
            </button>

            <button 
              type="button"
              className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border transition-all cursor-pointer shadow-xs ${
                isSaved 
                  ? 'bg-red-50 text-red-600 border-red-200 font-bold'
                  : 'bg-white border-slate-200/90 text-slate-700 text-xs font-semibold hover:bg-slate-100'
              }`}
              onClick={() => setIsSaved(!isSaved)}
            >
              <svg className={`w-3.5 h-3.5 flex-shrink-0 ${isSaved ? 'fill-red-600 text-red-600' : 'text-slate-600'}`} style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            {isOwner && (
              <>
                <button 
                  type="button" 
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer shadow-xs"
                  onClick={handleEdit}
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                  <span>Edit</span>
                </button>

                <button 
                  type="button" 
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all cursor-pointer shadow-xs"
                  onClick={handleDelete} 
                  disabled={actionLoading}
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 2-Column Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
          
          {/* ================= LEFT COLUMN ================= */}
          <div className="flex flex-col gap-3">
            
            {/* 1. Compact Photo Showcase Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 p-2.5 relative group">
              {photos.length > 0 && !imageError ? (
                <>
                  <div className="relative w-full h-[240px] sm:h-[280px] rounded-xl overflow-hidden bg-slate-900">
                    <img
                      key={activePhotoIdx}
                      src={photos[activePhotoIdx]?.url?.startsWith('http') ? photos[activePhotoIdx].url : `${environment.imageBaseUrl}/${photos[activePhotoIdx]?.url}`}
                      alt={getTitle()}
                      className="w-full h-full object-cover block transition-all duration-300"
                      onError={() => setImageError(true)}
                    />

                    <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white py-1 px-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 shadow-sm">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ width: 13, height: 13 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <span>{activePhotoIdx + 1}/{photos.length || 1} Photos</span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <button
                        type="button"
                        className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center cursor-pointer shadow-md transition-all hover:scale-105"
                        onClick={() => setIsGalleryModalOpen(true)}
                        title="View Fullscreen"
                      >
                        <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ width: 13, height: 13 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <polyline points="9 21 3 21 3 15"></polyline>
                          <line x1="21" y1="3" x2="14" y2="10"></line>
                          <line x1="3" y1="21" x2="10" y2="14"></line>
                        </svg>
                      </button>

                      <button
                        type="button"
                        className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center cursor-pointer shadow-md transition-all hover:scale-105"
                        onClick={() => setIsSaved(!isSaved)}
                        title="Save to Favorites"
                      >
                        <svg className={`w-3.5 h-3.5 flex-shrink-0 ${isSaved ? 'fill-red-600 text-red-600' : 'text-slate-800'}`} style={{ width: 13, height: 13 }} viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </button>
                    </div>

                    {photos.length > 1 && (
                      <>
                        <button
                          type="button"
                          className="absolute top-1/2 -translate-y-1/2 left-2 w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center cursor-pointer shadow-lg text-slate-800 transition-all hover:scale-110 z-10"
                          onClick={() => setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length)}
                          aria-label="Previous image"
                        >
                          <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <button
                          type="button"
                          className="absolute top-1/2 -translate-y-1/2 right-2 w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center cursor-pointer shadow-lg text-slate-800 transition-all hover:scale-110 z-10"
                          onClick={() => setActivePhotoIdx((prev) => (prev + 1) % photos.length)}
                          aria-label="Next image"
                        >
                          <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      className="absolute bottom-2.5 right-2.5 bg-black/75 hover:bg-black/90 backdrop-blur-md text-white py-1 px-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                      onClick={() => setIsGalleryModalOpen(true)}
                    >
                      <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                      <span>View All Photos</span>
                    </button>
                  </div>

                  {photos.length > 1 && (
                    <div className="flex gap-1.5 mt-2 overflow-x-auto pb-0.5 no-scrollbar">
                      {photos.map((photo: any, index: number) => (
                        <div
                          key={photo.id || index}
                          className={`w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-all ${
                            activePhotoIdx === index
                              ? 'border-blue-600 scale-105 shadow-xs'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                          onClick={() => setActivePhotoIdx(index)}
                        >
                          <img
                            src={photo.url?.startsWith('http') ? photo.url : `${environment.imageBaseUrl}/${photo.url}`}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-52 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-2xl flex flex-col items-center justify-center text-slate-400 border border-slate-200 shadow-2xs select-none">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#006ce6] border border-blue-100 flex items-center justify-center mb-2 shadow-2xs">
                    <svg className="w-6 h-6 stroke-[1.8]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-slate-500">No photos uploaded for this property</p>
                </div>
              )}
            </div>

            {specsList.length > 0 && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80">
                <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 flex-shrink-0" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 m-0">
                        {isPG ? 'Room Details & Capacities' : 'Property Specifications'}
                      </h3>
                      <p className="text-[11px] text-slate-400 m-0">
                        {isPG ? 'Everything you need to know about this PG / Hostel' : 'Features and specifications for this property'}
                      </p>
                    </div>
                  </div>

                  {isPG && property.pgRoomTypes?.[0] && (
                    <div className="bg-blue-50 text-blue-600 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-blue-200">
                      <svg className="w-3 h-3 flex-shrink-0" style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      <span>{property.pgRoomTypes[0]}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {specsList.map((spec) => (
                    <div key={spec.label} className="bg-slate-50/90 hover:bg-blue-50/40 border border-slate-200/80 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 transition-colors shadow-2xs">
                      <div className={`w-8 h-8 rounded-lg ${spec.iconColor} flex items-center justify-center flex-shrink-0 shadow-2xs`}>
                        {spec.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{spec.label}</div>
                        <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate mt-0.5">{spec.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {amenitiesList.length > 0 && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80">
                <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 flex-shrink-0" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 m-0">Amenities</h3>
                    <p className="text-[11px] text-slate-400 m-0">Facilities available at this {property.propertyCategory || 'property'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {amenitiesList.map((amenity) => (
                    <div
                      key={amenity.label}
                      className="flex items-center gap-1.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                    >
                      <span>{amenity.icon}</span>
                      <span>{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {property.description && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5">About Property</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line m-0">
                  {property.description}
                </p>
              </div>
            )}

          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="flex flex-col gap-3">
            
            {/* 1. Header Overview, Pricing & Owner Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80">
              
              <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {property.propertyCategory && (
                    <span className="bg-blue-50 text-blue-600 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-blue-100">
                      {property.propertyCategory} {property.adType ? `- ${property.adType}` : ''}
                    </span>
                  )}
                  {property.availableFrom && (
                    <span className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3 text-slate-500 flex-shrink-0" style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      <span>Available: {property.availableFrom}</span>
                    </span>
                  )}
                </div>

                <div className="bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                  <svg className="w-3 h-3 text-emerald-600 flex-shrink-0" style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <polyline points="9 12 11 14 15 10"></polyline>
                  </svg>
                  <span>Verified</span>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0 mb-1 leading-tight tracking-tight">
                {getTitle()}
              </h1>

              {locationText && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-3">
                  <svg className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{locationText}</span>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3 mb-3">
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    {property.adType === 'Rent' || isPG ? 'Monthly Rent' : 'Expected Price'}
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-600">
                    ₹{formatIndianCurrency(price)}
                    {(property.adType === 'Rent' || isPG) && (
                      <span className="text-xs font-medium text-slate-400"> / mo</span>
                    )}
                  </div>
                </div>

                {deposit && (
                  <div className="border-l border-slate-200 pl-4 sm:pl-6 flex-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Deposit / Advance
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">
                      ₹{formatIndianCurrency(deposit)}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between bg-slate-50/80 border border-slate-200/70 rounded-xl p-2.5 sm:p-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 text-sm font-black flex items-center justify-center flex-shrink-0">
                    {ownerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="m-0 text-xs sm:text-sm font-bold text-slate-900 capitalize">{ownerName}</h4>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        Owner
                      </span>
                    </div>
                    {cleanMobile && (
                      <a
                        href={`tel:${cleanMobile}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 transition-colors mt-0.5"
                      >
                        <svg className="w-3 h-3 text-blue-600 flex-shrink-0" style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <span>+91 {cleanMobile.slice(-10)}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {cleanMobile ? (
                  <>
                    <button
                      type="button"
                      className="w-full py-2.5 sm:py-3 px-3 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:scale-[1.01]"
                      onClick={() => window.open(`tel:${cleanMobile}`)}
                    >
                      <svg className="w-4 h-4 flex-shrink-0" style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      <span>Contact Owner</span>
                    </button>

                    <button
                      type="button"
                      className="w-full py-2.5 sm:py-3 px-3 rounded-xl bg-[#00a859] hover:bg-[#00924c] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer hover:scale-[1.01]"
                      onClick={() => {
                        window.open(
                          `https://wa.me/${cleanMobile.slice(-10)}?text=${encodeURIComponent(
                            `Hi ${ownerName}, I am interested in your property "${getTitle()}" listed on India DITS.`
                          )}`,
                          '_blank'
                        );
                      }}
                    >
                      <svg className="w-4 h-4 flex-shrink-0" style={{ width: 17, height: 17 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                      </svg>
                      <span>Chat on WhatsApp</span>
                    </button>
                  </>
                ) : (
                  <div className="col-span-2 text-center text-xs text-slate-400 py-1">
                    Contact details available upon inquiry
                  </div>
                )}
              </div>

            </div>

            {/* 2. Property Address Card */}
            {(property.locality || property.city) && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 m-0">Property Address</h3>
                </div>

                <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <div>
                    {property.locality && (
                      <div className="text-sm font-bold text-slate-900 capitalize">
                        {property.locality}
                      </div>
                    )}
                    {property.city && (
                      <div className="text-xs text-slate-500 font-medium mt-0.5 capitalize">
                        {property.city}, {property.state || 'Tamil Nadu'}
                      </div>
                    )}
                    {property.landmark && (
                      <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                        Landmark: {property.landmark}
                      </div>
                    )}
                  </div>

                  <div 
                    className="w-24 h-12 rounded-lg bg-blue-100/60 border border-blue-200 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-all flex-shrink-0 text-center relative overflow-hidden"
                    onClick={() => {
                      const query = encodeURIComponent(`${property.locality || ''} ${property.city || ''} Tamil Nadu`);
                      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                    }}
                  >
                    <svg className="w-4 h-4 text-blue-600 mb-0.5" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span className="text-[9px] font-extrabold text-blue-700 bg-white/80 px-1.5 py-0.5 rounded">
                      View on Map
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Visiting Schedule & Contact */}
            {hasVisitingSchedule && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 m-0">Visiting Schedule & Contact</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {property.availability && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100/80 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9px] text-slate-400 font-bold uppercase truncate">Available Days</div>
                        <div className="text-xs font-extrabold text-slate-800 truncate">{property.availability}</div>
                      </div>
                    </div>
                  )}

                  {(property.availableAllDay || (property.startTime && property.endTime)) && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100/80 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9px] text-slate-400 font-bold uppercase truncate">Timings</div>
                        <div className="text-xs font-extrabold text-slate-800 truncate">
                          {property.availableAllDay ? '24/7 All Day' : `${property.startTime} - ${property.endTime}`}
                        </div>
                      </div>
                    </div>
                  )}

                  {(property.whoWillShow || property.user?.name) && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100/80 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9px] text-slate-400 font-bold uppercase truncate">Who Will Show</div>
                        <div className="text-xs font-extrabold text-slate-800 truncate">{property.whoWillShow || property.user?.name}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. PG Rules & Guidelines */}
            {rulesList.length > 0 && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 m-0">
                    {isPG ? 'PG Rules & Guidelines' : 'Property Guidelines'}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {rulesList.map((rule: string) => (
                    <div
                      key={rule}
                      className="flex items-center gap-1 bg-emerald-50/80 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-full text-xs font-bold"
                    >
                      <span>✓</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Fullscreen Lightbox Modal */}
      {isGalleryModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 backdrop-blur-md font-['Inter',sans-serif]"
          onClick={() => setIsGalleryModalOpen(false)}
        >
          <div className="flex justify-between items-center text-white py-2 px-4" onClick={(e) => e.stopPropagation()}>
            <span className="text-sm font-bold">{activePhotoIdx + 1} / {photos.length || 1} Photos</span>
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xl cursor-pointer"
              onClick={() => setIsGalleryModalOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center max-h-[75vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[activePhotoIdx]?.url?.startsWith('http') ? photos[activePhotoIdx].url : `${environment.imageBaseUrl}/${photos[activePhotoIdx]?.url}`}
              alt={getTitle()}
              className="max-h-full max-w-full object-contain rounded-xl"
            />

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center text-2xl cursor-pointer"
                  onClick={() => setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center text-2xl cursor-pointer"
                  onClick={() => setActivePhotoIdx((prev) => (prev + 1) % photos.length)}
                >
                  ›
                </button>
              </>
            )}
          </div>

          <div className="flex gap-2 justify-center overflow-x-auto py-2" onClick={(e) => e.stopPropagation()}>
            {photos.map((p: any, idx: number) => (
              <div
                key={idx}
                className={`w-16 h-12 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                  activePhotoIdx === idx ? 'border-blue-500 scale-110' : 'border-transparent opacity-50'
                }`}
                onClick={() => setActivePhotoIdx(idx)}
              >
                <img
                  src={p.url?.startsWith('http') ? p.url : `${environment.imageBaseUrl}/${p.url}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default PropertyViewPage;
