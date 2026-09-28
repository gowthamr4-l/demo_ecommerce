'use client';

import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-[#f0f7ff] via-[#ffffff] to-[#eff6ff] text-slate-600 border-t border-blue-100/90 font-['Inter',sans-serif] relative overflow-hidden py-4 sm:py-4.5">
      {/* Subtle top logo-color accent gradient line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#006ce6] to-transparent opacity-80"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center text-center">
        {/* Copyright Notice */}
        <p className="text-xs sm:text-[13px] font-medium text-slate-600 tracking-normal m-0">
          &copy; {currentYear} <strong className="text-[#006ce6] font-extrabold">India DITS</strong> (Digital Information &amp; Technology Services). All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};
