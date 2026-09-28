'use client';

import React, { useState } from 'react';
import { SeoPropertyData, formatPrice } from '../../lib/generateSeoDescription';
import { LoginSignin } from '../login&singin/login_singin';
import { getUser } from '../../utils/apiClient';

interface ContactCTAProps {
  property: SeoPropertyData;
}

export const ContactCTA: React.FC<ContactCTAProps> = ({ property }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'whatsapp' | 'call' | null>(null);

  const price = formatPrice(property.expectedRent || property.expectedPrice);
  const isRent = !(property.adType === 'Sale' || property.adType === 'Resale');
  const ownerName = property.user?.name || property.ownerName || 'Verified Owner';
  const ownerMobile = property.user?.mobile || '9876543210';

  const handleWhatsApp = () => {
    const user = getUser();
    if (!user) {
      setPendingAction('whatsapp');
      setIsAuthOpen(true);
      return;
    }

    const cleanMobile = ownerMobile.replace(/[^0-9]/g, '');
    const title = property.title || 'Property';
    const text = encodeURIComponent(`Hi, I am interested in your property "${title}" listed on India DITS.`);
    window.open(`https://wa.me/${cleanMobile}?text=${text}`, '_blank');
  };

  const handleCall = () => {
    const user = getUser();
    if (!user) {
      setPendingAction('call');
      setIsAuthOpen(true);
      return;
    }
    window.location.href = `tel:${ownerMobile}`;
  };

  const handleLoginSuccess = () => {
    setIsAuthOpen(false);
    if (pendingAction === 'whatsapp') {
      handleWhatsApp();
    } else if (pendingAction === 'call') {
      handleCall();
    }
    setPendingAction(null);
  };

  return (
    <>
      {/* 1. Desktop Sticky Sidebar Card */}
      <aside className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-5 sm:p-6 space-y-5 sticky top-20">
        
        {/* Price & Badge */}
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            {isRent ? 'Monthly Rent' : 'Selling Price'}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {price}
            </span>
            {isRent && <span className="text-xs font-semibold text-slate-500">/ month</span>}
          </div>
          <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-md">
            🛡️ Zero Brokerage • Direct Owner
          </span>
        </div>

        {/* Owner Details Profile */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#006ce6] to-[#2563eb] text-white font-black text-base flex items-center justify-center shadow-xs flex-shrink-0">
            {ownerName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-extrabold text-slate-900 truncate">
              {ownerName}
            </h4>
            <p className="text-xs text-slate-500 font-semibold truncate">
              Property Owner • Verified
            </p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="space-y-2.5">
          {/* WhatsApp Direct Connect */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="w-full py-3 px-4 bg-[#25d366] hover:bg-[#20bd5a] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
            </svg>
            <span>Chat on WhatsApp</span>
          </button>

          {/* Direct Phone Call */}
          <button
            type="button"
            onClick={handleCall}
            className="w-full py-3 px-4 bg-[#006ce6] hover:bg-[#005bb5] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>Call Owner</span>
          </button>
        </div>

        {/* Safety Note */}
        <p className="text-[11px] text-slate-400 text-center leading-normal">
          🔒 Verified owner listing. Direct contact with zero middleman commissions.
        </p>
      </aside>

      {/* 2. Mobile Sticky Bottom CTA Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 z-40 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
            {isRent ? 'Rent' : 'Price'}
          </span>
          <span className="text-base font-black text-[#006ce6]">
            {price}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="px-3.5 py-2.5 bg-[#25d366] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
            </svg>
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleCall}
            className="px-3.5 py-2.5 bg-[#006ce6] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>Call</span>
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      <LoginSignin
        isOpen={isAuthOpen}
        onClose={() => { setIsAuthOpen(false); setPendingAction(null); }}
        onLogin={handleLoginSuccess}
      />
    </>
  );
};
