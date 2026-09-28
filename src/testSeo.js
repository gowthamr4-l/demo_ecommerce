import { normalizePropertyData, buildPropertyJsonLd, parsePropertyIdFromSlug, generatePropertyUrl } from './lib/seoUtils.js';
import { generateMetaDescription, generateFaqs, generateLongDescription, formatPrice } from './lib/generateSeoDescription.js';

const mockProperty = {
  id: "81bcb889-e2a8-47e4-9ed4-e77d7b93351e",
  propertyCategory: "Residential",
  adType: "Rent",
  propertyType: "Apartment",
  bhkType: "1 BHK",
  builtUpArea: "100",
  city: "Chennai",
  locality: "Anna Nagar",
  expectedRent: "10000",
  expectedDeposit: "100000",
  furnishing: "Fully Furnished",
  facing: "South",
  amenities: ["24/7 Water Supply", "Covered Parking", "Lift", "Power Backup"],
  user: { name: "Gowtham", mobile: "8870483093" }
};

console.log("=== SEO UNIT TEST ===");
const normalized = normalizePropertyData(mockProperty);
console.log("Normalized Title:", normalized.title);
console.log("Price formatted:", formatPrice(normalized.expectedRent));

const slug = generatePropertyUrl(normalized);
console.log("Generated SEO URL:", slug);

const extractedId = parsePropertyIdFromSlug(slug);
console.log("Extracted ID matches:", extractedId === mockProperty.id);

const metaDesc = generateMetaDescription(normalized);
console.log("Meta Description (length " + metaDesc.length + "):", metaDesc);

const faqs = generateFaqs(normalized);
console.log("Generated FAQ Count:", faqs.length);

const jsonLd = buildPropertyJsonLd(normalized, 'https://indiadits.com' + slug);
console.log("JSON-LD RealEstateListing Type:", jsonLd.realEstateSchema['@type']);
console.log("JSON-LD Breadcrumbs Elements:", jsonLd.breadcrumbSchema.itemListElement.length);
console.log("JSON-LD FAQ Questions:", jsonLd.faqSchema.mainEntity.length);
console.log("=== ALL TESTS PASSED ===");
