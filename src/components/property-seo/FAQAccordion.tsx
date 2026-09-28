'use client';

import React, { useState } from 'react';
import { SeoPropertyData, generateFaqs } from '../../lib/generateSeoDescription';

interface FAQAccordionProps {
  property: SeoPropertyData;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ property }) => {
  const faqs = generateFaqs(property);
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First open by default

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 lg:p-8 space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-[#006ce6] rounded-full"></span>
          Frequently Asked Questions (FAQs)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Everything you need to know about pricing, brokerage, possession, and locality advantages.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen ? 'bg-blue-50/40 border-blue-200 shadow-2xs' : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
                className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 cursor-pointer select-none"
              >
                <span className="leading-snug">{faq.question}</span>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-[#006ce6] text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-blue-100/60 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
