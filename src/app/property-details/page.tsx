import React, { Suspense } from 'react';
import PropertyDetails from '@/components/property_details/Property_detils';

export default function PropertyDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-5 h-5 border-2 border-[#006ce6] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-bold text-slate-700">Loading Property Form...</span>
          </div>
        </div>
      }
    >
      <PropertyDetails />
    </Suspense>
  );
}
