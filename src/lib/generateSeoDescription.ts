/**
 * SEO Description & FAQ Generation Engine
 * Generates unique, non-boilerplate meta descriptions and long-form content
 * to eliminate duplicate and thin content penalties.
 */

export interface SeoPropertyData {
  id: number | string;
  title?: string;
  propertyType?: string;
  propertyCategory?: string;
  adType?: string;
  bhk?: string | number;
  expectedRent?: number;
  expectedDeposit?: number;
  expectedPrice?: number;
  monthlyMaintenance?: number | string;
  maintenanceType?: string;
  builtUpArea?: number;
  carpetArea?: number;
  plotArea?: number;
  floorNo?: number;
  totalFloors?: number;
  furnishingStatus?: string;
  facing?: string;
  city?: string;
  locality?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  amenities?: string[];
  photos?: any[];
  images?: string[];
  description?: string;
  ownerName?: string;
  user?: {
    name?: string;
    mobile?: string;
    email?: string;
  };
  createdAt?: string;
  availableFrom?: string;
  nearbyLandmarks?: { name: string; distance?: string }[];
  similarProperties?: SeoPropertyData[];
}

/**
 * Format currency in Indian Rupees
 */
export function formatPrice(amount?: number): string {
  if (!amount || isNaN(amount)) return 'Price on Request';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2).replace(/\.00$/, '')} Lac`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Generates concise, high-CTR meta descriptions (150-160 characters target)
 */
export function generateMetaDescription(property: SeoPropertyData): string {
  const bhk = property.bhk ? `${property.bhk} BHK` : '';
  const type = property.propertyType || property.propertyCategory || 'Property';
  const action = property.adType === 'Sale' || property.adType === 'Resale' ? 'for Sale' : 'for Rent';
  const locality = property.locality || 'Prime Locality';
  const city = property.city || 'Tamil Nadu';
  
  const priceVal = property.expectedRent || property.expectedPrice;
  const price = formatPrice(priceVal);
  const furnishing = property.furnishingStatus ? `${property.furnishingStatus.toLowerCase()}` : '';
  
  // Pick a highlight amenity
  const keyAmenity = property.amenities && property.amenities.length > 0 
    ? `with ${property.amenities[0].toLowerCase()}`
    : 'with verified amenities';

  let desc = `Verified ${bhk} ${type} ${action} in ${locality}, ${city}. Available at ${price} ${furnishing} ${keyAmenity}. 100% Direct Owner, 0% Brokerage on India DITS.`;

  // Trim or adjust to fit 150-160 chars
  if (desc.length > 160) {
    desc = desc.substring(0, 157).trim() + '...';
  }
  return desc;
}

/**
 * Generates comprehensive long-form property description
 */
export function generateLongDescription(property: SeoPropertyData): string {
  if (property.description && property.description.trim().length > 50) {
    return property.description;
  }

  const bhk = property.bhk ? `${property.bhk} BHK` : '';
  const type = property.propertyType || property.propertyCategory || 'Residential Property';
  const action = property.adType === 'Sale' || property.adType === 'Resale' ? 'purchase/sale' : 'lease/rent';
  const locality = property.locality || 'top-rated residential pocket';
  const city = property.city || 'India';
  const area = property.builtUpArea || property.carpetArea || property.plotArea;
  const areaStr = area ? `${area} sq.ft.` : 'spacious dimensions';
  const floorStr = property.floorNo !== undefined ? `located on floor ${property.floorNo}${property.totalFloors ? ` of ${property.totalFloors} floors` : ''}` : '';
  const facingStr = property.facing ? `${property.facing}-facing orientation` : '';
  const furnishStr = property.furnishingStatus ? `${property.furnishingStatus} interior layout` : 'well-designed plan';
  const owner = property.user?.name || property.ownerName || 'Verified Property Owner';

  const amenitiesList = property.amenities && property.amenities.length > 0
    ? `Key amenities include ${property.amenities.slice(0, 5).join(', ')}.`
    : 'Equipped with essential utilities and 24/7 access.';

  return `This verified ${bhk} ${type} available for ${action} is strategically situated in ${locality}, ${city}. Featuring ${areaStr} ${floorStr}, it offers a ${furnishStr} with ${facingStr || 'excellent natural lighting and cross-ventilation'}. ${amenitiesList} Directly listed by ${owner} with Zero Brokerage for a seamless, transparent real estate transaction.`;
}

/**
 * Generates contextual FAQ items matching Schema.org FAQPage
 */
export function generateFaqs(property: SeoPropertyData): { question: string; answer: string }[] {
  const bhk = property.bhk ? `${property.bhk} BHK ` : '';
  const type = property.propertyType || property.propertyCategory || 'property';
  const locality = property.locality || 'this area';
  const city = property.city || 'the city';
  const price = formatPrice(property.expectedRent || property.expectedPrice);
  const isRent = !(property.adType === 'Sale' || property.adType === 'Resale');

  return [
    {
      question: `Is the price negotiable for this ${bhk}${type} in ${locality}?`,
      answer: `The listed ${isRent ? 'monthly rent' : 'selling price'} is ${price}. Direct negotiations can be conducted transparently with the property owner with 0% brokerage fees.`
    },
    {
      question: `Are there any brokerage or middleman charges for this property?`,
      answer: `No. India DITS is a 100% Direct Owner platform. You connect directly with the property owner via WhatsApp or Phone call with zero broker commissions.`
    },
    {
      question: `When is this property available for possession/move-in?`,
      answer: `This property is available for ${isRent ? 'immediate occupancy' : 'immediate registration and handover'}, or as specified by the owner (${property.availableFrom || 'Ready to Move'}).`
    },
    {
      question: `What amenities and parking facilities are available?`,
      answer: property.amenities && property.amenities.length > 0
        ? `This property offers verified amenities including: ${property.amenities.join(', ')}.`
        : `This property includes essential residential amenities, 24/7 water supply, and dedicated parking space.`
    },
    {
      question: `How well-connected is ${locality} in ${city}?`,
      answer: `${locality} is one of the key hubs in ${city}, providing convenient access to prominent schools, multi-specialty hospitals, shopping complexes, and major transit routes.`
    }
  ];
}
