'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { environment } from '../../environment';
import { authFetch, getUser } from '../../utils/apiClient';
import { Loader } from '../common/Loader/Loader';
import './PropertyDetails.css';

const sidebarItems = [
  { key: 'property', label: 'Property Details', subtitle: 'Add basic details', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> },
  { key: 'locality', label: 'Locality Details', subtitle: 'Add location info', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> },
  { key: 'rental', label: 'Rental Details', subtitle: 'Add rent information', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><line x1="9" y1="8" x2="15" y2="8"></line><line x1="9" y1="12" x2="15" y2="12"></line></svg> },
  { key: 'amenities', label: 'Amenities', subtitle: 'Select amenities', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M9 22V12h6v10"></path></svg> },
  { key: 'gallery', label: 'Gallery', subtitle: 'Upload photos', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg> },
  { key: 'schedule', label: 'Schedule', subtitle: 'Schedule visit', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> },
];


const apartmentTypes = ['Apartment', 'Independent House/Villa', 'Gated Community Villa'];
const bhkTypes = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'];
const floorOptions = ['Ground', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '10+'];
const totalFloorOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '15', '20', '25', '30', '30+'];
const propertyAgeOptions = ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'];
const facingOptions = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];
interface CustomDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[] | string[];
  placeholder?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formattedOptions = options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const selectedOption = formattedOptions.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between text-left bg-transparent text-sm font-semibold outline-none cursor-pointer select-none py-0.5"
      >
        <span className={selectedOption ? 'text-slate-900' : 'text-slate-400 font-normal'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#006ce6]' : ''
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2.5 bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-300/40 p-1.5 z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          {formattedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50 text-[#006ce6]'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <svg className="w-4 h-4 text-[#006ce6] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const PropertyDetails: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const categoryParam = searchParams?.get('propertyCategory') || '';
  const adTypeParam = searchParams?.get('adType') || '';
  
  // Read state from sessionStorage or URL query params
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('pendingPropertyPost');
      if (stored) {
        setInitialData(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Form & Section States
  const [activeSection, setActiveSection] = useState('property');

  // Always scroll to top when page loads or when switching sections
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [activeSection]);

  const [formData, setFormData] = useState({
    propertyCategory: categoryParam || '',
    adType: adTypeParam || '',
    propertyType: '',
    bhkType: '',
    ownershipType: '',
    builtUpArea: '',
    carpetArea: '',
    propertyAge: '',
    facing: '',
    floorType: '',
    floor: '',
    totalFloor: '',
    city: '',
    locality: '',
    landmark: '',
    availableFor: 'Only rent',
    expectedRent: '',
    expectedDeposit: '',
    rentNegotiable: false,
    expectedPrice: '',
    priceNegotiable: false,
    currentlyUnderLoan: false,
    kitchenType: '',
    monthlyMaintenance: '',
    availableFrom: '',
    preferredTenants: [] as string[],
    pgRoomTypes: [] as string[],
    placeAvailableFor: '',
    preferredGuests: '',
    foodIncluded: '',
    pgRules: [] as string[],
    gateClosingTime: '',
    furnishing: '',
    parking: '',
    description: '',
    bathrooms: 0,
    balcony: 0,
    waterSupply: '',
    petAllowed: '',
    gym: '',
    nonVegAllowed: '',
    gatedSecurity: '',
    whoWillShow: '',
    propertyCondition: '',
    secondaryNumber: '',
    moreSimilarUnits: '',
    directionsTip: '',
    availability: '',
    startTime: '',
    endTime: '',
    availableAllDay: false,
    buildingType: '',
    superBuiltUpArea: '',
    otherFeatures: [] as string[],
    maintenanceExtra: false,
    depositNegotiable: false,
    leaseDuration: '',
    lockinPeriod: '',
    idealFor: [] as string[],
    plotArea: '',
    plotLength: '',
    plotWidth: '',
    boundaryWall: '',
    floorsAllowed: '',
    cornerPlot: '',
    gatedProject: '',
  });

  const [detectingLocation, setDetectingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

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
          const loc = data.address?.neighbourhood || data.address?.suburb || data.address?.village || data.address?.town || data.address?.city || '';
          if (loc) {
            setFormData(prev => ({ ...prev, locality: loc }));
          }
        } catch (err) {
          console.warn('Could not reverse geocode coordinates:', err);
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        // Gracefully ignore user denial or timeout without popping console.error overlay
        console.warn('Geolocation access not available or denied:', err?.message || err);
        setDetectingLocation(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    if (initialData) {
      if (initialData.propertyData) {
        const { photos, user, id, createdAt, updatedAt, ...rest } = initialData.propertyData;
        setFormData(prev => ({ ...prev, ...rest }));
        setPropertyId(initialData.propertyData.id);
        if (initialData.propertyData.photos) {
          setUploadedPhotos(initialData.propertyData.photos);
        }
      } else {
        setFormData(prev => ({
          ...prev,
          propertyCategory: initialData.propertyCategory || categoryParam || prev.propertyCategory,
          adType: initialData.adType || adTypeParam || prev.adType
        }));
      }
    } else if (categoryParam || adTypeParam) {
      setFormData(prev => ({
        ...prev,
        propertyCategory: categoryParam || prev.propertyCategory,
        adType: adTypeParam || prev.adType
      }));
    }
  }, [initialData, categoryParam, adTypeParam]);

  // Check authentication status on mount
  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push('/');
    }
  }, [router]);

  const handleCheckboxChange = (field: string, value: string) => {
    setFormData((prev: any) => {
      const currentValues = prev[field] as string[];
      if (currentValues.includes(value)) {
        return { ...prev, [field]: currentValues.filter((v: string) => v !== value) };
      } else {
        return { ...prev, [field]: [...currentValues, value] };
      }
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper to format number string to Indian comma format (e.g. 10000 -> 10,000)
  const formatIndianCurrency = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null || val === '') return '';
    const clean = val.toString().replace(/[^0-9]/g, '');
    if (!clean) return '';
    return Number(clean).toLocaleString('en-IN');
  };

  // Helper to handle currency input change
  const handleCurrencyChange = (fieldName: string, rawInput: string) => {
    const digitsOnly = rawInput.replace(/[^0-9]/g, '');
    handleChange(fieldName, digitsOnly);
  };

  // ==================== Gallery Photo Handlers ====================
  const getApiRoute = () => {
    const { propertyCategory, adType } = formData;
    let route = 'properties'; // Default legacy route

    if (propertyCategory === 'Residential') {
      if (adType === 'Resale') route = 'residential-resale';
      else if (adType === 'PG / Hostel') route = 'residential-pg';
    } else if (propertyCategory === 'Commercial') {
      if (adType === 'Rent') route = 'commercial-rent';
      else if (adType === 'Sale' || adType === 'Resale') route = 'commercial-sale';
    } else if (propertyCategory === 'Land / Plot') {
      route = 'land-plot';
    }

    return `${environment.apiBaseUrl}/${route}`;
  };
  // Create property if not yet created (needed before uploading photos)
  const ensurePropertyCreated = async (): Promise<string | null> => {
    if (propertyId) return propertyId;

    try {
      const currentUser = getUser();
      const { photos, user, id, createdAt, updatedAt, ...cleanFormData } = formData as any;
      const res = await authFetch(`${getApiRoute()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || 1,
          propertyType: formData.propertyType || (formData.propertyCategory === 'Commercial' ? 'Office Space' : formData.propertyCategory === 'Land / Plot' ? 'Residential Land / Plot' : 'Apartment'),
          ...(formData.propertyCategory === 'Residential' && formData.adType !== 'PG / Hostel' ? { bhkType: formData.bhkType || '2 BHK' } : {}),
          ...cleanFormData,
        }),
      });

      const data = await res.json().catch(() => ({ success: false, message: 'Invalid response from server' }));
      if (res.ok && data.success && data.data?.id) {
        setPropertyId(data.data.id);
        return data.data.id;
      } else {
        const errMsg = data.message?.message || data.message || data.error?.message || data.error || 'Failed to initialize property. Please check required fields.';
        setUploadError(errMsg);
        return null;
      }
    } catch (err: any) {
      console.error('ensurePropertyCreated error:', err);
      setUploadError(err?.message || 'Server error. Make sure the backend is running.');
      return null;
    }
  };

  // Handle file selection and upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);

    // Check max 9 photos total
    if (uploadedPhotos.length + files.length > 9) {
      setUploadError(`You can upload max 9 photos. Currently ${uploadedPhotos.length} uploaded.`);
      return;
    }

    setUploading(true);

    try {
      const pid = await ensurePropertyCreated();
      if (!pid) {
        setUploading(false);
        return;
      }

      const formDataUpload = new FormData();
      for (let i = 0; i < files.length; i++) {
        formDataUpload.append('photos', files[i]);
      }

      const res = await authFetch(`${getApiRoute()}/${pid}/photos`, {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await res.json().catch(() => ({ success: false, message: 'Failed to parse upload response' }));
      if (res.ok && data.success) {
        setUploadedPhotos(prev => [...prev, ...(data.data || [])]);
      } else {
        setUploadError(data.message || data.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error('handlePhotoUpload error:', err);
      setUploadError(err?.message || 'Upload failed. Check your connection.');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle deleting a photo
  const handleDeletePhoto = async (photoId: string) => {
    try {
      const res = await authFetch(`${getApiRoute()}/photos/${photoId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setUploadedPhotos(prev => prev.filter(p => p.id !== photoId));
      }
    } catch (err) {
      console.error('Failed to delete photo', err);
    }
  };

  // Load existing photos if propertyId exists
  useEffect(() => {
    if (propertyId) {
      fetch(`${getApiRoute()}/${propertyId}/photos`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUploadedPhotos(data.data);
          }
        })
        .catch(() => { });
    }
  }, [propertyId]);

  // ==================== Validation & Save Handlers ====================
  const validateCurrentSection = () => {
    const missingFields: string[] = [];
    if (activeSection === 'property') {
      if (!formData.propertyCategory) missingFields.push('Property Category');
      if (!formData.adType) missingFields.push('Ad Type');
      if (formData.propertyCategory !== 'Land / Plot' && formData.adType !== 'PG / Hostel') {
        if (!formData.propertyType) missingFields.push('Property Type');
      }

      if (formData.propertyCategory === 'Residential' && formData.adType !== 'PG / Hostel') {
        if (!formData.bhkType) missingFields.push('BHK Type');
        if (!formData.builtUpArea) missingFields.push('Built-up Area');
      } else if (formData.propertyCategory === 'Commercial') {
        if (!formData.superBuiltUpArea && !formData.builtUpArea && !formData.carpetArea) {
          missingFields.push('Super Built Up Area');
        }
      } else if (formData.propertyCategory === 'Land / Plot') {
        if (!formData.plotArea) missingFields.push('Plot Area');
      }

      if (formData.adType === 'PG / Hostel') {
        if (!formData.pgRoomTypes || formData.pgRoomTypes.length === 0) {
          missingFields.push('Room details');
        }
        if (!formData.expectedRent) missingFields.push('Expected Price');
        if (!formData.expectedDeposit) missingFields.push('Expected Advance');
      }
    } else if (activeSection === 'locality') {
      if (!formData.city) missingFields.push('City');
      if (!formData.locality) missingFields.push('Locality');
    } else if (activeSection === 'rental') {
      if (formData.adType === 'Rent' || formData.adType === 'Flatmates') {
        if (!formData.expectedRent) missingFields.push('Expected Rent');
        if (!formData.expectedDeposit) missingFields.push('Expected Deposit');
      } else if (formData.adType !== 'PG / Hostel') {
        if (!formData.expectedPrice) missingFields.push('Expected Price');
      }
    }

    if (missingFields.length > 0) {
      setSaveError(`Please fill required fields: ${missingFields.join(', ')}`);
      // Scroll to top to see error toast
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    setSaveError(null);
    return true;
  };

  const handleNext = async () => {
    if (!validateCurrentSection()) return;
    const visibleSections = sidebarItems
      .filter(item => !(item.key === 'amenities' && (formData.adType === 'PG / Hostel' || formData.propertyCategory === 'Land / Plot')))
      .map(item => item.key);
    const currentIndex = visibleSections.indexOf(activeSection);
    if (currentIndex < visibleSections.length - 1) {
      setActiveSection(visibleSections[currentIndex + 1]);
    }
  };

  const handleSaveAndContinue = async (isFinalSave = true) => {
    // If it's the final save, we can do one last validation of the schedule step if needed
    if (isFinalSave) {
      if (activeSection === 'schedule' && !formData.availability) {
        setSaveError('Please fill required fields: Availability');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setSaving(true);
    setSaveError(null);
    if (isFinalSave) setSaveSuccess(null);

    try {
      const currentUser = getUser();
      const { photos, user, id, createdAt, updatedAt, ...cleanFormData } = formData as any;

      if (propertyId) {
        // Update existing property
        const res = await authFetch(`${getApiRoute()}/${propertyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanFormData),
        });
        const data = await res.json().catch(() => ({ success: false, message: 'Invalid response from server' }));
        if (!data.success) {
          setSaveError(data.message?.message || data.message || data.error?.message || data.error || 'Failed to update property');
          setSaving(false);
          return;
        }
        if (isFinalSave) setSaveSuccess('Property saved successfully!');
      } else {
        // Create new property
        const res = await authFetch(`${getApiRoute()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser?.id || 1,
            propertyType: formData.propertyType || (formData.propertyCategory === 'Commercial' ? 'Office Space' : formData.propertyCategory === 'Land / Plot' ? 'Residential Land / Plot' : 'Apartment'),
            ...(formData.propertyCategory === 'Residential' && formData.adType !== 'PG / Hostel' ? { bhkType: formData.bhkType || '2 BHK' } : {}),
            ...cleanFormData,
          }),
        });
        const data = await res.json().catch(() => ({ success: false, message: 'Invalid response from server' }));
        if (data.success && data.data?.id) {
          setPropertyId(data.data.id);
          if (isFinalSave) setSaveSuccess('Property created successfully!');
        } else {
          setSaveError(data.message?.message || data.message || data.error?.message || data.error || 'Failed to create property');
          setSaving(false);
          return;
        }
      }

      if (!isFinalSave) {
        // Move to next section
        const visibleSections = sidebarItems
          .filter(item => !(item.key === 'amenities' && (formData.adType === 'PG / Hostel' || formData.propertyCategory === 'Land / Plot')))
          .map(item => item.key);
        const currentIndex = visibleSections.indexOf(activeSection);
        if (currentIndex < visibleSections.length - 1) {
          setActiveSection(visibleSections[currentIndex + 1]);
        }
      } else {
        setShowSummary(true);
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Server error. Make sure the backend is running.');
    } finally {
      setSaving(false);
    }
  };

  const handleSidebarClick = (targetKey: string) => {
    const visibleSections = sidebarItems
      .filter(item => !(item.key === 'amenities' && (formData.adType === 'PG / Hostel' || formData.propertyCategory === 'Land / Plot')))
      .map(item => item.key);

    const currentIndex = visibleSections.indexOf(activeSection);
    const targetIndex = visibleSections.indexOf(targetKey);

    // Allow going backwards anytime
    if (targetIndex < currentIndex) {
      setActiveSection(targetKey);
      return;
    }

    // Prevent going forward if skipping steps, or validate if going to the next step
    if (targetIndex > currentIndex) {
      if (targetIndex === currentIndex + 1) {
        if (validateCurrentSection()) {
          handleNext(); // validates, saves, and moves forward
        }
      } else {
        setSaveError('Please complete the current step before skipping ahead.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="pd-container" style={{ background: showSummary ? '#f8fafc' : undefined }}>
      {/* Fullscreen Animated Saving Overlay */}
      {saving && (
        <Loader fullScreen size="lg" />
      )}

      {/* Fullscreen Animated Photo Upload Overlay */}
      {uploading && (
        <Loader fullScreen size="lg" />
      )}

      {showSummary ? (
        <div style={{ width: '100%', maxWidth: '1000px', margin: '40px auto', background: 'white', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          {/* Header Section */}
          <div style={{ position: 'relative', padding: '60px 20px', background: 'linear-gradient(to bottom, #ffffff, #f0fdf4)', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>

            {/* Confetti Decor */}
            <div style={{ position: 'absolute', top: '30%', left: '20%', width: '10px', height: '10px', background: '#3b82f6', transform: 'rotate(45deg)', opacity: 0.5 }}></div>
            <div style={{ position: 'absolute', top: '20%', right: '25%', width: '12px', height: '12px', background: '#10b981', transform: 'rotate(15deg)', opacity: 0.5 }}></div>
            <div style={{ position: 'absolute', bottom: '30%', left: '25%', width: '10px', height: '10px', background: '#f59e0b', transform: 'rotate(-25deg)', opacity: 0.5 }}></div>
            <div style={{ position: 'absolute', top: '40%', right: '15%', width: '10px', height: '10px', background: '#8b5cf6', transform: 'rotate(60deg)', opacity: 0.5 }}></div>

            <div style={{ width: '70px', height: '70px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 0 12px #dcfce7' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              Property Listed <span style={{ color: '#2563eb' }}>Successfully!</span>
            </h1>
            <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
              Your property details have been saved.<br />Here's a quick summary of what you created.
            </p>

            {/* House Illustration */}
            <div style={{ position: 'absolute', bottom: 0, right: '5%', opacity: 0.9 }}>
              <svg width="250" height="100" viewBox="0 0 250 100" fill="none">
                <path d="M180 100v-50h40v50H180z" fill="#e2e8f0" />
                <path d="M175 50l25-20 25 20H175z" fill="#2563eb" />
                <path d="M100 100V30h80v70h-80z" fill="#f1f5f9" />
                <path d="M90 30l40-30 40 30H90z" fill="#1d4ed8" />
                <rect x="120" y="50" width="20" height="20" fill="#93c5fd" />
                <rect x="150" y="50" width="20" height="20" fill="#93c5fd" />
                <rect x="190" y="60" width="20" height="40" fill="#bfdbfe" />
                <circle cx="70" cy="80" r="20" fill="#10b981" />
                <circle cx="85" cy="90" r="15" fill="#34d399" />
                <circle cx="230" cy="75" r="25" fill="#059669" />
              </svg>
            </div>
          </div>

          <div style={{ padding: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', animation: 'fadeInUp 0.6s ease-out' }}>

              {/* Overview Card */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '10px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Overview</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>Category</span>
                    <span style={{ color: '#2563eb', fontSize: '14px', fontWeight: 600 }}>{formData.propertyCategory} - {formData.adType}</span>
                  </div>
                  {formData.propertyType && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>Type</span>
                    <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 500 }}>{formData.propertyType} {formData.bhkType ? `(${formData.bhkType})` : ''}</span>
                  </div>}
                  {formData.pgRoomTypes?.length > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>Rooms</span>
                    <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 500 }}>{formData.pgRoomTypes.join(', ')}</span>
                  </div>}
                  {(formData.builtUpArea || formData.plotArea) && <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>Area</span>
                    <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 500 }}>{formData.builtUpArea || formData.plotArea} sq.ft</span>
                  </div>}
                </div>
              </div>

              {/* Financials Card */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '10px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path></svg>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Financials</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>{(formData.adType === 'Sale' || formData.adType === 'Resale') ? 'Expected Price' : 'Expected Rent'}</span>
                    <span style={{ color: '#10b981', fontSize: '16px', fontWeight: 700 }}>₹{formatIndianCurrency(formData.expectedPrice || formData.expectedRent)}</span>
                  </div>
                  {formData.expectedDeposit && <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>Deposit</span>
                    <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 500 }}>₹{formatIndianCurrency(formData.expectedDeposit)}</span>
                  </div>}
                  {(formData.monthlyMaintenance || formData.maintenanceExtra) && <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>Maintenance</span>
                    <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 500 }}>{formData.maintenanceExtra ? 'Extra' : (formData.monthlyMaintenance || 'Included')}</span>
                  </div>}
                </div>
              </div>

              {/* Location Card */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ background: '#e0e7ff', padding: '10px', borderRadius: '10px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Location & Schedule</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>City</span>
                    <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 500 }}>{formData.city || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>Locality</span>
                    <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 500 }}>{formData.locality || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>Availability</span>
                    <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 600, background: '#dcfce7', padding: '4px 10px', borderRadius: '20px' }}>{formData.availability || 'Everyday'}</span>
                  </div>
                </div>
              </div>

              {/* Photos Card */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ background: '#fae8ff', padding: '10px', borderRadius: '10px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c026d3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Uploaded Photos ({uploadedPhotos.length})</h3>
                </div>
                {uploadedPhotos.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {uploadedPhotos.slice(0, 3).map((photo, index) => (
                      <div key={photo.id} style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e5e7eb', aspectRatio: '4/3', background: '#f9fafb' }}>
                        <img src={`${environment.imageBaseUrl}/${photo.url}`} alt={photo.originalName || `Photo ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                    {uploadedPhotos.length > 3 && (
                      <div style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
                        +{uploadedPhotos.length - 3} More
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', background: '#f8fafc', borderRadius: '12px', color: '#94a3b8', border: '1px dashed #cbd5e1' }}>
                    No photos uploaded
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setShowSummary(false);
                  setActiveSection('property');
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', color: '#2563eb', border: '1px solid #2563eb', borderRadius: '8px', padding: '12px 32px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#eff6ff'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'white'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                Edit Details
              </button>
              <button
                type="button"
                onClick={() => router.push('/for-owner')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#006ce6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 32px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 108, 230, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#005bb5'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#006ce6'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full">
          
          {/* Left Sidebar */}
          <div className="w-full lg:w-[280px] xl:w-[300px] flex-shrink-0 flex flex-col gap-5 lg:sticky lg:top-6">
            <div className="bg-white rounded-3xl p-3.5 sm:p-4.5 border border-slate-200/90 shadow-2xs flex flex-col gap-1 relative w-full">
              
              {/* Vertical dotted timeline line behind badges */}
              <div className="absolute left-[27px] top-7 bottom-7 w-[1.5px] border-l-2 border-dashed border-slate-200 pointer-events-none z-0"></div>

              {sidebarItems
                .filter(item => !(item.key === 'amenities' && (formData.adType === 'PG / Hostel' || formData.propertyCategory === 'Land / Plot')))
                .map((item, index) => {
                  let label = item.label;
                  let subtitle = item.subtitle;
                  const stepNumber = String(index + 1).padStart(2, '0');

                  if (item.key === 'rental' && (formData.adType === 'Resale' || formData.adType === 'Sale')) {
                    label = 'Resale Details';
                    subtitle = 'Add resale info';
                  }
                  if (formData.adType === 'PG / Hostel') {
                    if (item.key === 'property') { label = 'Room Details'; subtitle = 'Add room information'; }
                    if (item.key === 'rental') { label = 'PG Details'; subtitle = 'Add PG rules and info'; }
                  }

                  const isActive = activeSection === item.key;

                  return (
                    <div
                      key={item.key}
                      className={`relative z-10 flex items-center gap-3 p-2 sm:p-2.5 rounded-2xl cursor-pointer transition-all w-full border ${
                        isActive
                          ? 'bg-blue-50/80 border-blue-100/90 text-[#006ce6] shadow-2xs'
                          : 'border-transparent text-slate-600 hover:bg-slate-50/80'
                      }`}
                      onClick={() => handleSidebarClick(item.key)}
                    >
                      {/* Step Number Badge */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors font-mono flex-shrink-0 ${
                        isActive ? 'bg-[#006ce6] text-white shadow-sm' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {stepNumber}
                      </div>

                      {/* Icon */}
                      <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isActive ? 'bg-blue-100/80 text-[#006ce6]' : 'bg-slate-100/80 text-slate-400'
                      }`}>
                        {item.icon}
                      </div>

                      {/* Text */}
                      <div className="flex flex-col flex-1 min-w-0 text-left">
                        <span className={`text-[13px] font-bold leading-tight truncate ${isActive ? 'text-[#006ce6]' : 'text-slate-800'}`}>{label}</span>
                        <span className={`text-[11px] mt-0.5 font-medium truncate ${isActive ? 'text-blue-500/90' : 'text-slate-400'}`}>{subtitle}</span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Need Help Card */}
            <div className="flex flex-col bg-[#f8fbff] border border-blue-100/80 rounded-3xl p-5 text-left shadow-2xs w-full">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Need Help?</h4>
              </div>
              <p className="text-xs text-slate-500 mb-3.5 pl-8.5">Our support team is here to help you.</p>
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-white hover:bg-blue-50/50 border border-blue-200 text-[#006ce6] font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
                onClick={() => router.push('/contact-support')}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                </svg>
                Contact Support
              </button>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="flex-1 w-full min-w-0 bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/90 shadow-sm">
            {/* Save/Error Toast Notifications */}
            {saveSuccess && (
              <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 animate-in fade-in">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                {saveSuccess}
              </div>
            )}
            {saveError && (
              <div className="fixed top-5 right-5 z-50 bg-red-600 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 animate-in fade-in">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                {saveError}
              </div>
            )}

            {activeSection === 'property' && (
              <>
                <div className="flex items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {formData.adType === 'PG / Hostel' ? 'Room Details' : 'Property Details'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      {formData.adType === 'PG / Hostel'
                        ? 'Provide details about your place to find a tenant soon'
                        : 'Add the basic information about your property'}
                    </p>
                    <div className="w-12 h-1 bg-[#006ce6] rounded-full mt-2.5"></div>
                  </div>
                  <div className="hidden sm:block flex-shrink-0">
                    <svg width="140" height="70" viewBox="0 0 180 90" fill="none">
                      <path d="M125 35c0-12-10-22-22-22-3 0-6 .6-9 1.8C89.5 7 81 2 71 2c-15 0-27 12-27 27 0 2 .2 4 .6 6C36 36 29 43 29 52c0 10 8 18 18 18h90c10 0 18-8 18-18 0-9-7-16-16-17z" fill="#f0f7ff" />
                      <circle cx="48" cy="56" r="14" fill="#bfdbfe" opacity="0.6" />
                      <circle cx="36" cy="60" r="10" fill="#dbeafe" />
                      <path d="M72 42L95 24L118 42V70H72V42Z" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" />
                      <path d="M70 43L95 23L120 43" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                      <rect x="88" y="52" width="14" height="18" rx="2" fill="#2563eb" />
                      <line x1="15" y1="70" x2="165" y2="70" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Category and Ad Type */}
                {(!formData.propertyCategory || !formData.adType) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-5">
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-1 shadow-2xs">
                      <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                        Property Category <span className="text-red-500 font-bold">*</span>
                      </label>
                      <CustomDropdown
                        value={formData.propertyCategory}
                        onChange={(val) => handleChange('propertyCategory', val)}
                        options={['Residential', 'Commercial', 'Land / Plot']}
                        placeholder="Select Category"
                      />
                    </div>
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-1 shadow-2xs">
                      <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                        Ad Type <span className="text-red-500 font-bold">*</span>
                      </label>
                      <CustomDropdown
                        value={formData.adType}
                        onChange={(val) => handleChange('adType', val)}
                        options={['Rent', 'Resale', 'Sale', 'PG / Hostel', 'Flatmates']}
                        placeholder="Select Ad Type"
                      />
                    </div>
                  </div>
                )}

                {/* Content Based on Ad Type */}
                {formData.adType === 'PG / Hostel' ? (
                  // PG / HOSTEL LAYOUT
                  <div className="space-y-6">
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 block mb-3">
                        Select Available Room Types <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        {[
                          { key: 'Single', label: 'Single Room', subtitle: '1 Person / Room', icon: '👤' },
                          { key: 'Double', label: 'Double Sharing', subtitle: '2 Persons / Room', icon: '👥' },
                          { key: 'Three', label: 'Triple Sharing', subtitle: '3 Persons / Room', icon: '🧑‍🤝‍🧑' },
                          { key: 'Four', label: 'Four Sharing', subtitle: '4 Persons / Room', icon: '👨‍👨‍👦‍👦' },
                        ].map((room) => {
                          const isActive = formData.pgRoomTypes.includes(room.key);
                          return (
                            <div
                              key={room.key}
                              onClick={() => handleCheckboxChange('pgRoomTypes', room.key)}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-between text-center gap-2 group ${
                                isActive
                                  ? 'bg-blue-50/80 border-[#006ce6] text-[#006ce6] shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="text-2xl">{room.icon}</span>
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  isActive ? 'bg-[#006ce6] text-white' : 'border border-slate-300 text-transparent'
                                }`}>
                                  ✓
                                </div>
                              </div>
                              <div className="mt-1">
                                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">{room.label}</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">{room.subtitle}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Expected Rent & Advance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Expected Rent */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-lg">₹</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Expected Rent <span className="text-red-500 font-bold">*</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="e.g. 7,500"
                              value={formatIndianCurrency(formData.expectedRent)}
                              onChange={(e) => handleCurrencyChange('expectedRent', e.target.value)}
                              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                            />
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg flex-shrink-0">
                              / Month
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expected Deposit */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-lg">₹</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Expected Advance / Deposit <span className="text-red-500 font-bold">*</span>
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="e.g. 15,000"
                            value={formatIndianCurrency(formData.expectedDeposit)}
                            onChange={(e) => handleCurrencyChange('expectedDeposit', e.target.value)}
                            className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : formData.propertyCategory === 'Residential' && formData.adType === 'Rent' ? (
                  // RESIDENTIAL RENT LAYOUT
                  <div className="space-y-5">
                    {/* Row 1: Apartment Type & BHK Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Apartment Type */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 21h18"></path><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path><path d="M9 7h6"></path><path d="M9 11h6"></path><path d="M9 15h6"></path>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Apartment Type <span className="text-red-500 font-bold">*</span>
                          </label>
                          <CustomDropdown
                            value={formData.propertyType}
                            onChange={(val) => handleChange('propertyType', val)}
                            options={apartmentTypes}
                            placeholder="Select Apartment Type"
                          />
                        </div>
                      </div>

                      {/* BHK Type */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            BHK Type <span className="text-red-500 font-bold">*</span>
                          </label>
                          <CustomDropdown
                            value={formData.bhkType}
                            onChange={(val) => handleChange('bhkType', val)}
                            options={bhkTypes}
                            placeholder="Select BHK Type"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: No. of Floors (Full Width) */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="12 2 2 7 12 12 22 7 12 2"></polyline>
                          <polyline points="2 17 12 22 22 17"></polyline>
                          <polyline points="2 12 12 17 22 12"></polyline>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                          No. of Floors <span className="text-red-500 font-bold">*</span>
                        </label>
                        <CustomDropdown
                          value={formData.totalFloor}
                          onChange={(val) => handleChange('totalFloor', val)}
                          options={totalFloorOptions}
                          placeholder="Select No. of Floors"
                        />
                      </div>
                    </div>

                    {/* Row 3: Property Age & Facing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Property Age */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Property Age <span className="text-red-500 font-bold">*</span>
                          </label>
                          <CustomDropdown
                            value={formData.propertyAge}
                            onChange={(val) => handleChange('propertyAge', val)}
                            options={propertyAgeOptions}
                            placeholder="Select Property Age"
                          />
                        </div>
                      </div>

                      {/* Facing */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Facing
                          </label>
                          <CustomDropdown
                            value={formData.facing}
                            onChange={(val) => handleChange('facing', val)}
                            options={facingOptions}
                            placeholder="Select Facing"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 4: Built Up Area (Full Width) */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 21h18"></path><path d="M5 21l14-14"></path><path d="M5 7v14"></path>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                          Built Up Area <span className="text-red-500 font-bold">*</span>
                        </label>
                        <input
                          type="number"
                          placeholder="Enter Built Up Area"
                          value={formData.builtUpArea}
                          onChange={(e) => handleChange('builtUpArea', e.target.value)}
                          className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                        />
                      </div>
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg border border-slate-200/60 flex-shrink-0">
                        sq.ft
                      </span>
                    </div>

                    {/* Row 5: Carpet Area & Super Built Up Area */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Carpet Area */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3 3"></rect>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 mb-0.5 block">
                            Carpet Area
                          </label>
                          <input
                            type="number"
                            placeholder="Enter Carpet Area"
                            value={formData.carpetArea}
                            onChange={(e) => handleChange('carpetArea', e.target.value)}
                            className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                          />
                        </div>
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg border border-slate-200/60 flex-shrink-0">
                          sq.ft
                        </span>
                      </div>

                      {/* Super Built Up Area */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 mb-0.5 block">
                            Super Built Up Area
                          </label>
                          <input
                            type="number"
                            placeholder="Enter Super Built Up Area"
                            value={formData.superBuiltUpArea || ''}
                            onChange={(e) => handleChange('superBuiltUpArea', e.target.value)}
                            className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                          />
                        </div>
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg border border-slate-200/60 flex-shrink-0">
                          sq.ft
                        </span>
                      </div>
                    </div>

                    {/* Row 6: Total Units & Floor No. */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Total Units */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 mb-0.5 block">
                            Total Units
                          </label>
                          <input
                            type="number"
                            placeholder="Enter Total Units"
                            value={formData.moreSimilarUnits || ''}
                            onChange={(e) => handleChange('moreSimilarUnits', e.target.value)}
                            className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      {/* Floor No. */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 6 2 18 2"></polyline>
                            <path d="M18 22v-6h-6v-6"></path>
                            <path d="M6 22H2"></path>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 mb-0.5 block">
                            Floor No.
                          </label>
                          <input
                            type="text"
                            placeholder="Enter Floor No."
                            value={formData.floor || ''}
                            onChange={(e) => handleChange('floor', e.target.value)}
                            className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : formData.propertyCategory === 'Commercial' && (formData.adType === 'Rent' || formData.adType === 'Sale' || formData.adType === 'Resale') ? (
                  // COMMERCIAL RENT & SALE LAYOUT
                  <div className="space-y-5">
                    {/* Row 1: Property Type & Building Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Property Type */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Property Type <span className="text-red-500 font-bold">*</span>
                          </label>
                          <CustomDropdown
                            value={formData.propertyType}
                            onChange={(val) => handleChange('propertyType', val)}
                            options={['Office Space', 'Shop', 'Showroom', 'Co-working']}
                            placeholder="Select Commercial Type"
                          />
                        </div>
                      </div>

                      {/* Building Type */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="2"></line>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Building Type <span className="text-red-500 font-bold">*</span>
                          </label>
                          <CustomDropdown
                            value={formData.buildingType || ''}
                            onChange={(val) => handleChange('buildingType', val)}
                            options={['Independent', 'Business Park', 'Mall']}
                            placeholder="Select Building Type"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Property Age & Furnishing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Property Age */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Age of Property <span className="text-red-500 font-bold">*</span>
                          </label>
                          <CustomDropdown
                            value={formData.propertyAge}
                            onChange={(val) => handleChange('propertyAge', val)}
                            options={propertyAgeOptions}
                            placeholder="Select Property Age"
                          />
                        </div>
                      </div>

                      {/* Furnishing */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"></path><path d="M2 11v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"></path>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Furnishing <span className="text-red-500 font-bold">*</span>
                          </label>
                          <CustomDropdown
                            value={formData.furnishing || ''}
                            onChange={(val) => handleChange('furnishing', val)}
                            options={['Furnished', 'Semi-Furnished', 'Unfurnished']}
                            placeholder="Select Furnishing"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Super Built Up Area & Carpet Area */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Super Built Up Area */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Super Built Up Area <span className="text-red-500 font-bold">*</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="e.g. 2400"
                              value={formData.superBuiltUpArea || ''}
                              onChange={(e) => handleChange('superBuiltUpArea', e.target.value)}
                              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                            />
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg flex-shrink-0">
                              Sq.ft
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Carpet Area */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M9 9h6v6H9z"></path>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 block mb-0.5">
                            Carpet Area (Optional)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="e.g. 2000"
                              value={formData.carpetArea || ''}
                              onChange={(e) => handleChange('carpetArea', e.target.value)}
                              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                            />
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg flex-shrink-0">
                              Sq.ft
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 4: Floor & Total Floors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Floor */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 6 2 18 2"></polyline><path d="M18 22v-6h-6v-6"></path><path d="M6 22H2"></path>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Property on Floor <span className="text-red-500 font-bold">*</span>
                          </label>
                          <CustomDropdown
                            value={formData.floor || ''}
                            onChange={(val) => handleChange('floor', val)}
                            options={floorOptions}
                            placeholder="Select Floor"
                          />
                        </div>
                      </div>

                      {/* Total Floor */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="2"></line>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Total Floors <span className="text-red-500 font-bold">*</span>
                          </label>
                          <CustomDropdown
                            value={formData.totalFloor}
                            onChange={(val) => handleChange('totalFloor', val)}
                            options={totalFloorOptions}
                            placeholder="Select Total Floors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : formData.propertyCategory === 'Land / Plot' ? (
                  // LAND / PLOT LAYOUT
                  <div className="space-y-5">
                    {/* Row 1: Plot Area & Facing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Plot Area */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Plot Area <span className="text-red-500 font-bold">*</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="e.g. 1500"
                              value={formData.plotArea || ''}
                              onChange={(e) => handleChange('plotArea', e.target.value)}
                              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                            />
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg flex-shrink-0">
                              Sq.ft
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Facing */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 block mb-0.5">
                            Facing
                          </label>
                          <CustomDropdown
                            value={formData.facing || ''}
                            onChange={(val) => handleChange('facing', val)}
                            options={facingOptions}
                            placeholder="Select Facing"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Plot Dimensions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Plot Length */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <span className="font-black text-xs">L</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 block mb-0.5">
                            Plot Length (ft.)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 50"
                            value={formData.plotLength || ''}
                            onChange={(e) => handleChange('plotLength', e.target.value)}
                            className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      {/* Plot Width */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <span className="font-black text-xs">W</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 block mb-0.5">
                            Plot Width (ft.)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 30"
                            value={formData.plotWidth || ''}
                            onChange={(e) => handleChange('plotWidth', e.target.value)}
                            className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Boundary Wall & Gated Project Toggles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Boundary Wall */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-3">
                        <div className="text-xs sm:text-sm font-bold text-slate-800">Boundary Wall?</div>
                        <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleChange('boundaryWall', 'No')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              formData.boundaryWall === 'No' ? 'bg-white shadow-2xs text-[#006ce6]' : 'text-slate-600'
                            }`}
                          >
                            No
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChange('boundaryWall', 'Yes')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              formData.boundaryWall === 'Yes' ? 'bg-[#006ce6] text-white shadow-xs' : 'text-slate-600'
                            }`}
                          >
                            Yes
                          </button>
                        </div>
                      </div>

                      {/* Gated Project */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-3">
                        <div className="text-xs sm:text-sm font-bold text-slate-800">Inside Gated Project?</div>
                        <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleChange('gatedProject', 'No')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              formData.gatedProject === 'No' ? 'bg-white shadow-2xs text-[#006ce6]' : 'text-slate-600'
                            }`}
                          >
                            No
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChange('gatedProject', 'Yes')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              formData.gatedProject === 'Yes' ? 'bg-[#006ce6] text-white shadow-xs' : 'text-slate-600'
                            }`}
                          >
                            Yes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // RESALE LAYOUT (or default)
                  <div className="space-y-5">
                    {/* Row 1: Property Type & BHK Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Property Type */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Property Type <span className="text-red-500 font-bold">*</span>
                          </label>
                          <CustomDropdown
                            value={formData.propertyType}
                            onChange={(val) => handleChange('propertyType', val)}
                            options={['Apartment', 'Independent House/Villa', 'Gated Community Villa']}
                            placeholder="Select Property Type"
                          />
                        </div>
                      </div>

                      {/* BHK Type */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                            <path d="M2 7l10-5 10 5"></path>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            BHK Type <span className="text-red-500 font-bold">*</span>
                          </label>
                          <CustomDropdown
                            value={formData.bhkType}
                            onChange={(val) => handleChange('bhkType', val)}
                            options={bhkTypes}
                            placeholder="Select BHK Type"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Ownership Type & Built Up Area */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Ownership Type */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Ownership Type <span className="text-red-500 font-bold">*</span>
                          </label>
                          <CustomDropdown
                            value={formData.ownershipType}
                            onChange={(val) => handleChange('ownershipType', val)}
                            options={['Freehold', 'Leasehold', 'Power of Attorney', 'Co-operative Society']}
                            placeholder="Select Ownership"
                          />
                        </div>
                      </div>

                      {/* Built Up Area */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="3" y1="9" x2="21" y2="9"></line>
                            <line x1="9" y1="21" x2="9" y2="9"></line>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Built Up Area <span className="text-red-500 font-bold">*</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="e.g. 1250"
                              value={formData.builtUpArea}
                              onChange={(e) => handleChange('builtUpArea', e.target.value)}
                              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                            />
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg flex-shrink-0">
                              Sq.ft
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Carpet Area & Property Age */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Carpet Area */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                            <path d="M9 9h6v6H9z"></path>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 block mb-0.5">
                            Carpet Area (Optional)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="e.g. 1000"
                              value={formData.carpetArea}
                              onChange={(e) => handleChange('carpetArea', e.target.value)}
                              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                            />
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg flex-shrink-0">
                              Sq.ft
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Property Age */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Property Age <span className="text-red-500 font-bold">*</span>
                          </label>
                          <CustomDropdown
                            value={formData.propertyAge}
                            onChange={(val) => handleChange('propertyAge', val)}
                            options={propertyAgeOptions}
                            placeholder="Select Age"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 4: Facing & Floor Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Facing */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Facing <span className="text-red-500 font-bold">*</span>
                          </label>
                          <CustomDropdown
                            value={formData.facing}
                            onChange={(val) => handleChange('facing', val)}
                            options={facingOptions}
                            placeholder="Select Direction"
                          />
                        </div>
                      </div>

                      {/* Floor Type */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 block mb-0.5">
                            Floor Type
                          </label>
                          <CustomDropdown
                            value={formData.floorType}
                            onChange={(val) => handleChange('floorType', val)}
                            options={['Vitrified', 'Marble', 'Ceramic', 'Wooden', 'Granite']}
                            placeholder="Select Flooring"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 5: Floor & Total Floors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Floor */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 6 2 18 2"></polyline>
                            <path d="M18 22v-6h-6v-6"></path>
                            <path d="M6 22H2"></path>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Property on Floor <span className="text-red-500 font-bold">*</span>
                          </label>
                          <CustomDropdown
                            value={formData.floor}
                            onChange={(val) => handleChange('floor', val)}
                            options={floorOptions}
                            placeholder="Select Floor"
                          />
                        </div>
                      </div>

                      {/* Total Floor */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="2"></line>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Total Floors <span className="text-red-500 font-bold">*</span>
                          </label>
                          <CustomDropdown
                            value={formData.totalFloor}
                            onChange={(val) => handleChange('totalFloor', val)}
                            options={totalFloorOptions}
                            placeholder="Select Total Floors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="pd-actions">
                  <button className="pd-save-btn" onClick={handleNext} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Next'} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></button>
                </div>
              </>
            )}

            {activeSection === 'locality' && (
              <>
                <div className="flex items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Locality Details</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">Add location and address information for your property</p>
                    <div className="w-12 h-1 bg-[#006ce6] rounded-full mt-2.5"></div>
                  </div>
                  <div className="hidden sm:block flex-shrink-0">
                    <svg width="140" height="70" viewBox="0 0 180 90" fill="none">
                      <path d="M125 35c0-12-10-22-22-22-3 0-6 .6-9 1.8C89.5 7 81 2 71 2c-15 0-27 12-27 27 0 2 .2 4 .6 6C36 36 29 43 29 52c0 10 8 18 18 18h90c10 0 18-8 18-18 0-9-7-16-16-17z" fill="#f0f7ff" />
                      <circle cx="85" cy="40" r="16" fill="#3b82f6" opacity="0.15" />
                      <path d="M85 24c-7.7 0-14 6.3-14 14 0 10.5 14 26 14 26s14-15.5 14-26c0-7.7-6.3-14-14-14zm0 19c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" fill="#2563eb" />
                      <line x1="15" y1="70" x2="165" y2="70" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {/* City */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                          City <span className="text-red-500 font-bold">*</span>
                        </label>
                        <CustomDropdown
                          value={formData.city}
                          onChange={(val) => handleChange('city', val)}
                          options={['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Bangalore', 'Hyderabad', 'Mumbai', 'Delhi']}
                          placeholder="Select City"
                        />
                      </div>
                    </div>

                    {/* Locality */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1">
                            Locality / Society <span className="text-red-500 font-bold">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={handleDetectLocation}
                            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            {detectingLocation ? 'Detecting...' : 'Use GPS'}
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. Anna Nagar, Velachery"
                          value={formData.locality}
                          onChange={(e) => handleChange('locality', e.target.value)}
                          className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Landmark & Street */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                          Landmark / Street <span className="text-red-500 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Near Metro Station, 2nd Main Rd"
                          value={formData.landmark}
                          onChange={(e) => handleChange('landmark', e.target.value)}
                          className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-[13px] font-bold text-slate-700 mb-0.5 block">
                          Directions Tip (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Opposite to Apollo Pharmacy"
                          value={formData.directionsTip || ''}
                          onChange={(e) => handleChange('directionsTip', e.target.value)}
                          className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pd-actions">
                  <button className="pd-back-btn" onClick={() => setActiveSection('property')}>Back</button>
                  <button className="pd-save-btn" onClick={handleNext} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Saving...' : 'Save & Continue'}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                </div>
              </>
            )}
            {activeSection === 'rental' && (
              <>
                <div className="flex items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {formData.adType === 'Resale' || formData.adType === 'Sale'
                        ? 'Resale Details'
                        : formData.adType === 'PG / Hostel'
                          ? 'PG Details'
                          : 'Rental Details'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      {formData.adType === 'Resale' || formData.adType === 'Sale'
                        ? 'Provide pricing and ownership details about your property'
                        : formData.adType === 'PG / Hostel'
                          ? 'Provide details about your place and house rules'
                          : 'Add the pricing, deposit and rental terms for your property'}
                    </p>
                    <div className="w-12 h-1 bg-[#006ce6] rounded-full mt-2.5"></div>
                  </div>
                  <div className="hidden sm:block flex-shrink-0">
                    <svg width="140" height="70" viewBox="0 0 180 90" fill="none">
                      <path d="M125 35c0-12-10-22-22-22-3 0-6 .6-9 1.8C89.5 7 81 2 71 2c-15 0-27 12-27 27 0 2 .2 4 .6 6C36 36 29 43 29 52c0 10 8 18 18 18h90c10 0 18-8 18-18 0-9-7-16-16-17z" fill="#f0f7ff" />
                      <circle cx="85" cy="40" r="16" fill="#3b82f6" opacity="0.15" />
                      <rect x="70" y="32" width="40" height="34" rx="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                      <text x="90" y="55" textAnchor="middle" fill="#2563eb" fontSize="18" fontWeight="bold" fontFamily="sans-serif">₹</text>
                      <line x1="15" y1="70" x2="165" y2="70" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {formData.adType === 'Resale' || formData.adType === 'Sale' ? (
                  formData.propertyCategory === 'Commercial' ? (
                    // COMMERCIAL RESALE LAYOUT
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {/* Expected Price */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                            <span className="font-bold text-lg">₹</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1">
                                Expected Price <span className="text-red-500 font-bold">*</span>
                              </label>
                              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.priceNegotiable}
                                  onChange={(e) => handleChange('priceNegotiable', e.target.checked as any)}
                                  className="w-3.5 h-3.5 rounded text-[#006ce6] focus:ring-0 cursor-pointer"
                                />
                                <span>Negotiable</span>
                              </label>
                            </div>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="e.g. 1,50,00,000"
                              value={formatIndianCurrency(formData.expectedPrice)}
                              onChange={(e) => handleCurrencyChange('expectedPrice', e.target.value)}
                              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        {/* Ownership Type */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                              Ownership Type <span className="text-red-500 font-bold">*</span>
                            </label>
                            <CustomDropdown
                              value={formData.ownershipType || ''}
                              onChange={(val) => handleChange('ownershipType', val)}
                              options={['Freehold', 'Leasehold', 'Power of Attorney', 'Co-operative Society']}
                              placeholder="Select Ownership Type"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Available From */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                              Available From <span className="text-red-500 font-bold">*</span>
                            </label>
                            <input
                              type="date"
                              value={formData.availableFrom}
                              onChange={(e) => handleChange('availableFrom', e.target.value)}
                              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Ideal For Tags */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
                        <label className="text-[13px] font-bold text-slate-700 block mb-2.5">
                          Ideal For Businesses
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                          {['Bank', 'Service Center', 'Show Room', 'ATM', 'Retail', 'Office Space', 'Restaurant'].map(tag => {
                            const isSelected = formData.idealFor?.includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => handleCheckboxChange('idealFor', tag)}
                                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-50 border-[#006ce6] text-[#006ce6] shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : formData.propertyCategory === 'Land / Plot' ? (
                    // LAND / PLOT RESALE LAYOUT
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {/* Expected Price */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                            <span className="font-bold text-lg">₹</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1">
                                Expected Price <span className="text-red-500 font-bold">*</span>
                              </label>
                              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.priceNegotiable}
                                  onChange={(e) => handleChange('priceNegotiable', e.target.checked as any)}
                                  className="w-3.5 h-3.5 rounded text-[#006ce6] focus:ring-0 cursor-pointer"
                                />
                                <span>Negotiable</span>
                              </label>
                            </div>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="e.g. 50,00,000"
                              value={formatIndianCurrency(formData.expectedPrice)}
                              onChange={(e) => handleCurrencyChange('expectedPrice', e.target.value)}
                              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        {/* Available From */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                              Available From <span className="text-red-500 font-bold">*</span>
                            </label>
                            <input
                              type="date"
                              value={formData.availableFrom}
                              onChange={(e) => handleChange('availableFrom', e.target.value)}
                              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Currently Under Loan Card */}
                      <label className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs cursor-pointer select-none hover:bg-slate-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.currentlyUnderLoan}
                          onChange={(e) => handleChange('currentlyUnderLoan', e.target.checked as any)}
                          className="w-5 h-5 rounded text-[#006ce6] focus:ring-blue-500 cursor-pointer"
                        />
                        <div>
                          <div className="text-sm font-extrabold text-slate-800">Currently Under Loan</div>
                          <div className="text-xs text-slate-500">Property has an existing bank loan or mortgage</div>
                        </div>
                      </label>

                      {/* Description */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <label className="text-[13px] font-bold text-slate-700 block mb-2">
                          Property Description
                        </label>
                        <textarea
                          placeholder="Write a few lines about your plot/land that make it special..."
                          value={formData.description}
                          onChange={(e) => handleChange('description', e.target.value)}
                          rows={3}
                          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 resize-none"
                        ></textarea>
                      </div>
                    </div>
                  ) : (
                    // RESIDENTIAL RESALE LAYOUT
                    <div className="space-y-5">
                      {/* Expected Price & Loan */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {/* Expected Price */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                            <span className="font-bold text-lg">₹</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1">
                                Expected Price <span className="text-red-500 font-bold">*</span>
                              </label>
                              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.priceNegotiable}
                                  onChange={(e) => handleChange('priceNegotiable', e.target.checked as any)}
                                  className="w-3.5 h-3.5 rounded text-[#006ce6] focus:ring-0 cursor-pointer"
                                />
                                <span>Negotiable</span>
                              </label>
                            </div>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="e.g. 75,00,000"
                              value={formatIndianCurrency(formData.expectedPrice)}
                              onChange={(e) => handleCurrencyChange('expectedPrice', e.target.value)}
                              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        {/* Currently Under Loan Card */}
                        <label className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs cursor-pointer select-none hover:bg-slate-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.currentlyUnderLoan}
                            onChange={(e) => handleChange('currentlyUnderLoan', e.target.checked as any)}
                            className="w-5 h-5 rounded text-[#006ce6] focus:ring-blue-500 cursor-pointer"
                          />
                          <div>
                            <div className="text-sm font-extrabold text-slate-800">Currently Under Loan</div>
                            <div className="text-xs text-slate-500">Property has an existing bank loan or mortgage</div>
                          </div>
                        </label>
                      </div>

                      {/* Available From & Kitchen Type */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {/* Available From */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                              Available From <span className="text-red-500 font-bold">*</span>
                            </label>
                            <input
                              type="date"
                              value={formData.availableFrom}
                              onChange={(e) => handleChange('availableFrom', e.target.value)}
                              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                            />
                          </div>
                        </div>

                        {/* Kitchen Type */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2v20M2 12h20"></path>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="text-[13px] font-bold text-slate-700 block mb-0.5">
                              Kitchen Type
                            </label>
                            <CustomDropdown
                              value={formData.kitchenType}
                              onChange={(val) => handleChange('kitchenType', val)}
                              options={['Modular', 'Normal', 'None']}
                              placeholder="Select Kitchen Type"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Furnishing & Parking */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {/* Furnishing */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"></path><path d="M2 11v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"></path>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                              Furnishing <span className="text-red-500 font-bold">*</span>
                            </label>
                            <CustomDropdown
                              value={formData.furnishing}
                              onChange={(val) => handleChange('furnishing', val)}
                              options={['Fully Furnished', 'Semi Furnished', 'Unfurnished']}
                              placeholder="Select Furnishing"
                            />
                          </div>
                        </div>

                        {/* Parking */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle><path d="M9 16V8h4a2 2 0 0 1 0 4H9"></path>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                              Parking <span className="text-red-500 font-bold">*</span>
                            </label>
                            <CustomDropdown
                              value={formData.parking}
                              onChange={(val) => handleChange('parking', val)}
                              options={['Covered', 'Open', 'None']}
                              placeholder="Select Parking"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <label className="text-[13px] font-bold text-slate-700 block mb-2">
                          Property Description
                        </label>
                        <textarea
                          placeholder="Write a few lines about your property that make it special..."
                          value={formData.description}
                          onChange={(e) => handleChange('description', e.target.value)}
                          rows={3}
                          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 resize-none"
                        ></textarea>
                      </div>
                    </div>
                  )) : formData.adType === 'PG / Hostel' ? (
                    // PG DETAILS LAYOUT
                    <div className="space-y-6">
                      {/* Place is available for */}
                      <div>
                        <label className="text-[13px] font-bold text-slate-700 block mb-2.5">
                          Place is available for <span className="text-red-500 font-bold">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2.5 sm:gap-3">
                          {['Male', 'Female', 'Anyone'].map((option) => {
                            const isSelected = formData.placeAvailableFor === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => handleChange('placeAvailableFor', option)}
                                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                                  isSelected
                                    ? 'bg-blue-50 border-[#006ce6] text-[#006ce6] shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                {isSelected && (
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                )}
                                <span>{option}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Preferred Guests & Available From */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {/* Preferred Guests */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                              Preferred Guests <span className="text-red-500 font-bold">*</span>
                            </label>
                            <CustomDropdown
                              value={formData.preferredGuests}
                              onChange={(val) => handleChange('preferredGuests', val)}
                              options={['Student', 'Professional', 'Both (Student & Working Professional)']}
                              placeholder="Select Preferred Guests"
                            />
                          </div>
                        </div>

                        {/* Available From */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                              Available From <span className="text-red-500 font-bold">*</span>
                            </label>
                            <input
                              type="date"
                              value={formData.availableFrom}
                              onChange={(e) => handleChange('availableFrom', e.target.value)}
                              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Food Included & Gate Closing Time */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {/* Food Included */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-3">
                          <div>
                            <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1">
                              Food Included <span className="text-red-500 font-bold">*</span>
                            </label>
                            <span className="text-xs text-slate-400">Meals provided with rent</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleChange('foodIncluded', 'No')}
                              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                formData.foodIncluded === 'No' ? 'bg-white shadow-2xs text-[#006ce6]' : 'text-slate-600'
                              }`}
                            >
                              No
                            </button>
                            <button
                              type="button"
                              onClick={() => handleChange('foodIncluded', 'Yes')}
                              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                formData.foodIncluded === 'Yes' ? 'bg-[#006ce6] text-white shadow-xs' : 'text-slate-600'
                              }`}
                            >
                              Yes
                            </button>
                          </div>
                        </div>

                        {/* Gate Closing Time */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="text-[13px] font-bold text-slate-700 block mb-0.5">
                              Gate Closing Time
                            </label>
                            <CustomDropdown
                              value={formData.gateClosingTime || ''}
                              onChange={(val) => handleChange('gateClosingTime', val)}
                              options={[
                                'No Restriction (Open 24/7)',
                                '08:00 PM',
                                '08:30 PM',
                                '09:00 PM',
                                '09:30 PM',
                                '10:00 PM',
                                '10:30 PM',
                                '11:00 PM',
                                '11:30 PM',
                                '12:00 AM (Midnight)',
                              ]}
                              placeholder="Select Gate Closing Time"
                            />
                          </div>
                        </div>
                      </div>

                      {/* PG/Hostel Rules */}
                      <div>
                        <label className="text-[13px] font-bold text-slate-700 block mb-2.5">
                          PG / Hostel Rules
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                          {[
                            { label: 'No Smoking', icon: '🚭' },
                            { label: 'No Guardians Stay', icon: '👥' },
                            { label: "No Girl's Entry", icon: '🚫' },
                            { label: 'No Drinking', icon: '🍷' },
                            { label: 'No Non-Veg', icon: '🥦' },
                          ].map((rule) => {
                            const isSelected = formData.pgRules.includes(rule.label);
                            return (
                              <button
                                key={rule.label}
                                type="button"
                                onClick={() => handleCheckboxChange('pgRules', rule.label)}
                                className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-blue-50/80 border-[#006ce6] text-[#006ce6] shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <span className="text-xl">{rule.icon}</span>
                                <span className="text-xs font-bold">{rule.label}</span>
                                <span className={`text-[10px] font-bold mt-0.5 px-2 py-0.5 rounded-full ${
                                  isSelected ? 'bg-[#006ce6] text-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {isSelected ? 'Applied' : '+ Add'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <label className="text-[13px] font-bold text-slate-700 block mb-2">
                          Description
                        </label>
                        <textarea
                          placeholder="Write a few lines about your PG/Hostel that make it special..."
                          value={formData.description}
                          onChange={(e) => handleChange('description', e.target.value)}
                          rows={3}
                          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 resize-none"
                        ></textarea>
                      </div>
                    </div>
                  ) : formData.propertyCategory === 'Commercial' && formData.adType === 'Rent' ? (
                    // COMMERCIAL RENT LAYOUT
                    <div className="space-y-5">
                      {/* Rent & Deposit */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {/* Expected Rent */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                            <span className="font-bold text-lg">₹</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1">
                                Expected Rent <span className="text-red-500 font-bold">*</span>
                              </label>
                              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.rentNegotiable}
                                  onChange={(e) => handleChange('rentNegotiable', e.target.checked as any)}
                                  className="w-3.5 h-3.5 rounded text-[#006ce6] focus:ring-0 cursor-pointer"
                                />
                                <span>Negotiable</span>
                              </label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="e.g. 50,000"
                                value={formatIndianCurrency(formData.expectedRent)}
                                onChange={(e) => handleCurrencyChange('expectedRent', e.target.value)}
                                className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                              />
                              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg flex-shrink-0">
                                / Month
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Deposit */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                            <span className="font-bold text-lg">₹</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1">
                                Expected Deposit <span className="text-red-500 font-bold">*</span>
                              </label>
                              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.depositNegotiable}
                                  onChange={(e) => handleChange('depositNegotiable', e.target.checked as any)}
                                  className="w-3.5 h-3.5 rounded text-[#006ce6] focus:ring-0 cursor-pointer"
                                />
                                <span>Negotiable</span>
                              </label>
                            </div>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="e.g. 3,00,000"
                              value={formatIndianCurrency(formData.expectedDeposit)}
                              onChange={(e) => handleCurrencyChange('expectedDeposit', e.target.value)}
                              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Lease Duration & Lockin Period */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {/* Lease Duration */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="text-[13px] font-bold text-slate-700 block mb-0.5">
                              Lease Duration (Years)
                            </label>
                            <CustomDropdown
                              value={formData.leaseDuration || ''}
                              onChange={(val) => handleChange('leaseDuration', val)}
                              options={['1 Year', '2 Years', '3 Years', '4 Years', '5+ Years']}
                              placeholder="Select Lease Duration"
                            />
                          </div>
                        </div>

                        {/* Lockin Period */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="text-[13px] font-bold text-slate-700 block mb-0.5">
                              Lock-in Period (Years)
                            </label>
                            <CustomDropdown
                              value={formData.lockinPeriod || ''}
                              onChange={(val) => handleChange('lockinPeriod', val)}
                              options={['1 Year', '2 Years', '3 Years', '4 Years', '5+ Years']}
                              placeholder="Select Lock-in Period"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Available From & Maintenance Card */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {/* Available From */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                              Available From <span className="text-red-500 font-bold">*</span>
                            </label>
                            <input
                              type="date"
                              value={formData.availableFrom}
                              onChange={(e) => handleChange('availableFrom', e.target.value)}
                              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
                            />
                          </div>
                        </div>

                        {/* Maintenance Extra Checkbox Card */}
                        <label className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs cursor-pointer select-none hover:bg-slate-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.maintenanceExtra}
                            onChange={(e) => handleChange('maintenanceExtra', e.target.checked as any)}
                            className="w-5 h-5 rounded text-[#006ce6] focus:ring-blue-500 cursor-pointer"
                          />
                          <div>
                            <div className="text-sm font-extrabold text-slate-800">Maintenance Extra</div>
                            <div className="text-xs text-slate-500">Maintenance is excluded from base monthly rent</div>
                          </div>
                        </label>
                      </div>

                      {/* Ideal For Tags */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
                        <label className="text-[13px] font-bold text-slate-700 block mb-2.5">
                          Ideal For Businesses
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                          {['Bank', 'Service Center', 'Show Room', 'ATM', 'Retail', 'Office Space', 'Restaurant'].map(tag => {
                            const isSelected = formData.idealFor?.includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => handleCheckboxChange('idealFor', tag)}
                                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-50 border-[#006ce6] text-[#006ce6] shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                  // RENT LAYOUT
                  <div className="space-y-5">
                    {/* Property available for */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
                      <label className="text-[13px] font-bold text-slate-700 block mb-2.5">
                        Property Available For <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="flex gap-3">
                        {['Only rent', 'Only lease'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleChange('availableFor', opt)}
                            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                              formData.availableFor === opt
                                ? 'bg-blue-50 border-[#006ce6] text-[#006ce6] shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Expected Rent & Expected Deposit */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Expected Rent */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0 font-bold text-lg">
                          ₹
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Expected Rent <span className="text-red-500 font-bold">*</span>
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="e.g. 25,000"
                              value={formatIndianCurrency(formData.expectedRent)}
                              onChange={(e) => handleCurrencyChange('expectedRent', e.target.value)}
                              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none pr-16 placeholder:text-slate-400"
                            />
                            <span className="absolute right-0 text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md pointer-events-none">
                              / Month
                            </span>
                          </div>
                          <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={formData.rentNegotiable}
                              onChange={(e) => handleChange('rentNegotiable', e.target.checked as any)}
                              className="w-4 h-4 rounded text-[#006ce6] focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-xs font-semibold text-slate-600">Rent Negotiable</span>
                          </label>
                        </div>
                      </div>

                      {/* Expected Deposit */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Expected Deposit <span className="text-red-500 font-bold">*</span>
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="e.g. 1,00,000"
                            value={formatIndianCurrency(formData.expectedDeposit)}
                            onChange={(e) => handleCurrencyChange('expectedDeposit', e.target.value)}
                            className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Monthly Maintenance & Available From */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Monthly Maintenance */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 block mb-0.5">
                            Monthly Maintenance
                          </label>
                          <CustomDropdown
                            value={formData.monthlyMaintenance}
                            onChange={(val) => handleChange('monthlyMaintenance', val)}
                            options={['Included in Rent', 'Extra (Maintenance not included)']}
                            placeholder="Select Maintenance"
                          />
                        </div>
                      </div>

                      {/* Available From */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Available From <span className="text-red-500 font-bold">*</span>
                          </label>
                          <input
                            type="date"
                            value={formData.availableFrom}
                            onChange={(e) => handleChange('availableFrom', e.target.value)}
                            className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preferred Tenants */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
                      <label className="text-[13px] font-bold text-slate-700 block mb-2.5">
                        Preferred Tenants <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {['Anyone', 'Family', 'Bachelor Female', 'Bachelor Male', 'Company'].map(tenant => {
                          const isChecked = formData.preferredTenants.includes(tenant);
                          return (
                            <button
                              key={tenant}
                              type="button"
                              onClick={() => handleCheckboxChange('preferredTenants', tenant)}
                              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                                isChecked
                                  ? 'bg-blue-50 border-[#006ce6] text-[#006ce6] shadow-2xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {isChecked && (
                                <svg className="w-3.5 h-3.5 text-[#006ce6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                              <span>{tenant}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Furnishing & Parking */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Furnishing */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 14v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4"></path><path d="M5 14V9a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v5"></path><line x1="2" y1="14" x2="22" y2="14"></line>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Furnishing <span className="text-red-500 font-bold">*</span>
                          </label>
                          <CustomDropdown
                            value={formData.furnishing}
                            onChange={(val) => handleChange('furnishing', val)}
                            options={['Fully Furnished', 'Semi Furnished', 'Unfurnished']}
                            placeholder="Select Furnishing"
                          />
                        </div>
                      </div>

                      {/* Parking */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle><path d="M9 16V8h4a2 2 0 0 1 0 4H9"></path>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                            Parking <span className="text-red-500 font-bold">*</span>
                          </label>
                          <CustomDropdown
                            value={formData.parking}
                            onChange={(val) => handleChange('parking', val)}
                            options={['Covered', 'Open', 'Both Covered & Open', 'None']}
                            placeholder="Select Parking"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
                      <label className="text-[13px] font-bold text-slate-700 block mb-1.5">
                        Description (Optional)
                      </label>
                      <textarea
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 outline-none focus:bg-white focus:border-[#006ce6] focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                        placeholder="Write a few lines about your property something which is special and makes your property stand out. Please do not mention contact details here."
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        rows={4}
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pd-actions">
                  <button className="pd-back-btn" onClick={() => setActiveSection('locality')}>Back</button>
                  <button className="pd-save-btn" onClick={handleNext} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Saving...' : 'Save & Continue'}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                </div>
              </>
            )}
            {activeSection === 'amenities' && (
              <>
                <div className="flex items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Amenities & Features</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">Provide additional details about your property to get maximum visibility</p>
                    <div className="w-12 h-1 bg-[#006ce6] rounded-full mt-2.5"></div>
                  </div>
                  <div className="hidden sm:block flex-shrink-0">
                    <svg width="140" height="70" viewBox="0 0 180 90" fill="none">
                      <path d="M125 35c0-12-10-22-22-22-3 0-6 .6-9 1.8C89.5 7 81 2 71 2c-15 0-27 12-27 27 0 2 .2 4 .6 6C36 36 29 43 29 52c0 10 8 18 18 18h90c10 0 18-8 18-18 0-9-7-16-16-17z" fill="#f0f7ff" />
                      <circle cx="85" cy="40" r="16" fill="#3b82f6" opacity="0.15" />
                      <path d="M72 45h26v25H72z" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" />
                      <path d="M78 35l7-10 7 10" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="15" y1="70" x2="165" y2="70" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Bathrooms, Balcony, Water Supply */}
                  <div className={`grid grid-cols-1 ${formData.propertyCategory === 'Residential' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 sm:gap-5`}>
                    {/* Bathrooms */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-2xs">
                      <div>
                        <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                          Bathrooms <span className="text-red-500 font-bold">*</span>
                        </label>
                        <span className="text-xs text-slate-400">No. of baths</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => handleChange('bathrooms', Math.max(0, (Number(formData.bathrooms) || 0) - 1))}
                          className="w-8 h-8 rounded-lg bg-white shadow-2xs hover:bg-slate-100 flex items-center justify-center text-base font-bold text-slate-700 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-slate-900">{formData.bathrooms ?? 0}</span>
                        <button
                          type="button"
                          onClick={() => handleChange('bathrooms', (Number(formData.bathrooms) || 0) + 1)}
                          className="w-8 h-8 rounded-lg bg-[#006ce6] text-white shadow-xs hover:bg-blue-700 flex items-center justify-center text-base font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Balcony (Residential Only) */}
                    {formData.propertyCategory === 'Residential' && (
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-2xs">
                        <div>
                          <label className="text-[13px] font-bold text-slate-700 block mb-0.5">
                            Balcony
                          </label>
                          <span className="text-xs text-slate-400">No. of balconies</span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => handleChange('balcony', Math.max(0, (Number(formData.balcony) || 0) - 1))}
                            className="w-8 h-8 rounded-lg bg-white shadow-2xs hover:bg-slate-100 flex items-center justify-center text-base font-bold text-slate-700 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-slate-900">{formData.balcony ?? 0}</span>
                          <button
                            type="button"
                            onClick={() => handleChange('balcony', (Number(formData.balcony) || 0) + 1)}
                            className="w-8 h-8 rounded-lg bg-[#006ce6] text-white shadow-xs hover:bg-blue-700 flex items-center justify-center text-base font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Water Supply */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-[13px] font-bold text-slate-700 block mb-0.5">
                          Water Supply
                        </label>
                        <CustomDropdown
                          value={formData.waterSupply}
                          onChange={(val) => handleChange('waterSupply', val)}
                          options={['Corporation', 'Borewell', 'Both (Corporation & Borewell)', 'None']}
                          placeholder="Select Water Supply"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Toggle Features Grid */}
                  <div className={`grid grid-cols-1 ${formData.propertyCategory === 'Residential' ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-1 md:grid-cols-2'} gap-4 sm:gap-5`}>
                    {/* Residential-only toggles: Pet Allowed, Gym, Non-Veg Allowed */}
                    {formData.propertyCategory === 'Residential' && (
                      <>
                        {/* Pet Allowed */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2C8.69 2 6 4.69 6 8s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"></path>
                                <path d="M16.5 14h-9a2.5 2.5 0 0 0-2.5 2.5V22h14v-5.5a2.5 2.5 0 0 0-2.5-2.5z"></path>
                              </svg>
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-slate-800">Pet Allowed</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleChange('petAllowed', 'No')}
                              className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                formData.petAllowed === 'No' ? 'bg-white shadow-2xs text-[#006ce6]' : 'text-slate-600'
                              }`}
                            >
                              No
                            </button>
                            <button
                              type="button"
                              onClick={() => handleChange('petAllowed', 'Yes')}
                              className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                formData.petAllowed === 'Yes' ? 'bg-[#006ce6] text-white shadow-xs' : 'text-slate-600'
                              }`}
                            >
                              Yes
                            </button>
                          </div>
                        </div>

                        {/* Gym */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="18.5" cy="17.5" r="3.5"></circle><path d="M15 6a3 3 0 1 0-6 0v6h6V6z"></path>
                              </svg>
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-slate-800">Gym</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleChange('gym', 'No')}
                              className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                formData.gym === 'No' ? 'bg-white shadow-2xs text-[#006ce6]' : 'text-slate-600'
                              }`}
                            >
                              No
                            </button>
                            <button
                              type="button"
                              onClick={() => handleChange('gym', 'Yes')}
                              className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                formData.gym === 'Yes' ? 'bg-[#006ce6] text-white shadow-xs' : 'text-slate-600'
                              }`}
                            >
                              Yes
                            </button>
                          </div>
                        </div>

                        {/* Non-Veg Allowed */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M7.5 13a4.5 4.5 0 1 0 9 0 4.5 4.5 0 1 0-9 0z"></path><path d="M12 2v6"></path><path d="M12 18v4"></path>
                              </svg>
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-slate-800">Non-Veg Allowed</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleChange('nonVegAllowed', 'No')}
                              className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                formData.nonVegAllowed === 'No' ? 'bg-white shadow-2xs text-[#006ce6]' : 'text-slate-600'
                              }`}
                            >
                              No
                            </button>
                            <button
                              type="button"
                              onClick={() => handleChange('nonVegAllowed', 'Yes')}
                              className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                formData.nonVegAllowed === 'Yes' ? 'bg-[#006ce6] text-white shadow-xs' : 'text-slate-600'
                              }`}
                            >
                              Yes
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Gated Security */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                          </svg>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-800">Gated Security</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleChange('gatedSecurity', 'No')}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            formData.gatedSecurity === 'No' ? 'bg-white shadow-2xs text-[#006ce6]' : 'text-slate-600'
                          }`}
                        >
                          No
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChange('gatedSecurity', 'Yes')}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            formData.gatedSecurity === 'Yes' ? 'bg-[#006ce6] text-white shadow-xs' : 'text-slate-600'
                          }`}
                        >
                          Yes
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Who will show & Property Condition */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {/* Who will show */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                          Who will show the property? <span className="text-red-500 font-bold">*</span>
                        </label>
                        <CustomDropdown
                          value={formData.whoWillShow}
                          onChange={(val) => handleChange('whoWillShow', val)}
                          options={['Owner', 'Security', 'Tenant', 'Others']}
                          placeholder="Select Who Will Show"
                        />
                      </div>
                    </div>

                    {/* Property Condition */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-[13px] font-bold text-slate-700 block mb-0.5">
                          Property Condition
                        </label>
                        <CustomDropdown
                          value={formData.propertyCondition}
                          onChange={(val) => handleChange('propertyCondition', val)}
                          options={['Ready to move', 'Under construction']}
                          placeholder="Select Property Condition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Secondary Phone Number */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-[13px] font-bold text-slate-700 block mb-0.5">
                        Secondary Phone Number (Optional)
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                          +91
                        </span>
                        <input
                          type="tel"
                          placeholder="e.g. 9876543210"
                          value={formData.secondaryNumber}
                          onChange={(e) => handleChange('secondaryNumber', e.target.value)}
                          className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pd-actions">
                  <button className="pd-back-btn" onClick={() => setActiveSection('rental')}>Back</button>
                  <button className="pd-save-btn" onClick={handleNext} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Saving...' : 'Save & Continue'}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                </div>
              </>
            )}
            {activeSection === 'gallery' && (
              <>
                <div className="flex items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Property Gallery</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">Upload high-quality photos of your property to get 5X more responses</p>
                    <div className="w-12 h-1 bg-[#006ce6] rounded-full mt-2.5"></div>
                  </div>
                  <div className="hidden sm:block flex-shrink-0">
                    <svg width="140" height="70" viewBox="0 0 180 90" fill="none">
                      <path d="M125 35c0-12-10-22-22-22-3 0-6 .6-9 1.8C89.5 7 81 2 71 2c-15 0-27 12-27 27 0 2 .2 4 .6 6C36 36 29 43 29 52c0 10 8 18 18 18h90c10 0 18-8 18-18 0-9-7-16-16-17z" fill="#f0f7ff" />
                      <circle cx="85" cy="40" r="16" fill="#3b82f6" opacity="0.15" />
                      <rect x="65" y="32" width="45" height="32" rx="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                      <circle cx="76" cy="42" r="3" fill="#2563eb" />
                      <path d="M66 58l10-10 12 12 8-8 13 13" stroke="#2563eb" strokeWidth="2" />
                      <line x1="15" y1="70" x2="165" y2="70" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />

                {/* Error message */}
                {uploadError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-5 flex items-center gap-2.5 text-sm font-semibold animate-in fade-in">
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Upload Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-200 hover:border-[#006ce6] bg-blue-50/30 hover:bg-blue-50/60 rounded-3xl p-8 sm:p-10 text-center transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-100/80 text-[#006ce6] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-800 mb-1">
                    Click to browse or drag & drop photos here
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5">
                    90% of buyers & tenants contact properties with photos ({uploadedPhotos.length}/9 uploaded)
                  </p>
                  <button
                    type="button"
                    disabled={uploading || uploadedPhotos.length >= 9}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#006ce6] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-60"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>{uploading ? 'Uploading...' : uploadedPhotos.length >= 9 ? 'Max 9 Photos Reached' : 'Upload Photos'}</span>
                  </button>
                </div>

                {/* Uploaded Photos Grid */}
                {uploadedPhotos.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-800">
                        Uploaded Photos ({uploadedPhotos.length}/9)
                      </h3>
                      <span className="text-xs text-slate-400 font-semibold">First photo will be your cover image</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {uploadedPhotos.map((photo, index) => (
                        <div
                          key={photo.id}
                          className="group relative rounded-2xl overflow-hidden border border-slate-200 aspect-4/3 bg-slate-100 shadow-2xs"
                        >
                          <img
                            src={`${environment.imageBaseUrl}/${photo.url}`}
                            alt={photo.originalName || `Photo ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white rounded-lg px-2.5 py-1 text-[11px] font-bold">
                            {index === 0 ? 'Cover Photo' : `#${index + 1}`}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md hover:bg-red-700 transition-colors cursor-pointer"
                            title="Delete photo"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pd-actions">
                  <button className="pd-back-btn" onClick={() => setActiveSection('amenities')}>Back</button>
                  <button className="pd-save-btn" onClick={handleNext} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Saving...' : 'Save & Continue'}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                </div>
              </>
            )}
            {activeSection === 'schedule' && (
              <>
                <div className="flex items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Schedule & Availability</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">Set your available days and time for tenant or buyer visits</p>
                    <div className="w-12 h-1 bg-[#006ce6] rounded-full mt-2.5"></div>
                  </div>
                  <div className="hidden sm:block flex-shrink-0">
                    <svg width="140" height="70" viewBox="0 0 180 90" fill="none">
                      <path d="M125 35c0-12-10-22-22-22-3 0-6 .6-9 1.8C89.5 7 81 2 71 2c-15 0-27 12-27 27 0 2 .2 4 .6 6C36 36 29 43 29 52c0 10 8 18 18 18h90c10 0 18-8 18-18 0-9-7-16-16-17z" fill="#f0f7ff" />
                      <circle cx="85" cy="40" r="16" fill="#3b82f6" opacity="0.15" />
                      <rect x="70" y="32" width="40" height="34" rx="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                      <line x1="70" y1="42" x2="110" y2="42" stroke="#2563eb" strokeWidth="2" />
                      <circle cx="80" cy="50" r="2" fill="#2563eb" />
                      <circle cx="90" cy="50" r="2" fill="#2563eb" />
                      <circle cx="100" cy="50" r="2" fill="#2563eb" />
                      <line x1="15" y1="70" x2="165" y2="70" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Availability Days */}
                  <div>
                    <label className="text-[13px] font-bold text-slate-700 block mb-2.5">
                      Available Days <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { key: 'Everyday', title: 'Everyday', subtitle: 'Monday to Sunday', icon: '📅' },
                        { key: 'Weekday', title: 'Weekdays Only', subtitle: 'Monday to Friday', icon: '🏢' },
                        { key: 'Weekend', title: 'Weekends Only', subtitle: 'Saturday & Sunday', icon: '🏖️' },
                      ].map((item) => {
                        const isSelected = formData.availability === item.key;
                        return (
                          <div
                            key={item.key}
                            onClick={() => handleChange('availability', item.key)}
                            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                              isSelected
                                ? 'bg-blue-50 border-[#006ce6] shadow-sm shadow-blue-500/10'
                                : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-2xl">{item.icon}</span>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                isSelected ? 'bg-[#006ce6] text-white' : 'border border-slate-300 text-transparent'
                              }`}>
                                ✓
                              </div>
                            </div>
                            <div>
                              <h4 className={`text-sm sm:text-base font-extrabold ${isSelected ? 'text-[#006ce6]' : 'text-slate-900'}`}>
                                {item.title}
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Available Time Slots */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {/* Start Time */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-[13px] font-bold text-slate-700 block mb-0.5">
                          Start Time
                        </label>
                        <CustomDropdown
                          value={formData.startTime}
                          onChange={(val) => handleChange('startTime', val)}
                          options={['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM']}
                          placeholder="Select Start Time"
                        />
                      </div>
                    </div>

                    {/* End Time */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-[13px] font-bold text-slate-700 block mb-0.5">
                          End Time
                        </label>
                        <CustomDropdown
                          value={formData.endTime}
                          onChange={(val) => handleChange('endTime', val)}
                          options={['12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM']}
                          placeholder="Select End Time"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Available All Day Checkbox Card */}
                  <label className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs cursor-pointer select-none hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.availableAllDay}
                      onChange={(e) => handleChange('availableAllDay', e.target.checked as any)}
                      className="w-5 h-5 rounded text-[#006ce6] focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <div className="text-sm font-extrabold text-slate-800">Available All Day</div>
                      <div className="text-xs text-slate-500">I am available for prospective visits throughout the day</div>
                    </div>
                  </label>
                </div>

                {/* Actions */}
                <div className="pd-actions">
                  <button className="pd-back-btn" onClick={() => setActiveSection('gallery')}>Back</button>
                  <button
                    className="pd-save-btn"
                    onClick={() => handleSaveAndContinue(true)}
                    disabled={saving}
                    style={{ opacity: saving ? 0.7 : 1 }}
                  >
                    {saving ? 'Submitting Ad...' : 'Save & Publish Ad'}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;
