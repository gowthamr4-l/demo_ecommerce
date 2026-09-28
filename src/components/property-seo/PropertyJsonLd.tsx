import React from 'react';

interface PropertyJsonLdProps {
  realEstateSchema: any;
  breadcrumbSchema: any;
  faqSchema: any;
}

export const PropertyJsonLd: React.FC<PropertyJsonLdProps> = ({
  realEstateSchema,
  breadcrumbSchema,
  faqSchema,
}) => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
};
