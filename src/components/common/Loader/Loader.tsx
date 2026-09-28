'use client';

import React from 'react';
import Image from 'next/image';
import logoImg from '../../../assets/images/indiaditss.webp';

interface LoaderProps {
  /**
   * Whether to display as a full-screen fixed backdrop overlay
   * @default false
   */
  fullScreen?: boolean;
  /**
   * Size variant
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Visual theme variant
   * @default "branding"
   */
  variant?: 'branding' | 'spinner' | 'card' | 'inline';
}

export const Loader: React.FC<LoaderProps> = ({
  fullScreen = false,
  size = 'md',
  variant = 'branding',
}) => {
  // Inline miniature loader bar
  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center justify-center">
        <div className="relative overflow-hidden w-20 h-1 bg-sky-100 rounded-full">
          <div className="absolute inset-y-0 w-full bg-[#0090e3] rounded-full animate-loader-bar origin-left"></div>
        </div>
      </div>
    );
  }

  // Size configuration using pure Tailwind tokens
  const sizeMap = {
    sm: {
      logoWidth: 100,
      logoHeight: 40,
      barClasses: 'w-24 h-0.5',
      padding: 'p-3',
    },
    md: {
      logoWidth: 140,
      logoHeight: 56,
      barClasses: 'w-36 h-1',
      padding: 'p-6',
    },
    lg: {
      logoWidth: 180,
      logoHeight: 72,
      barClasses: 'w-44 h-1.5',
      padding: 'p-8',
    },
  };

  const current = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`flex flex-col items-center justify-center text-center ${current.padding} select-none`}>
      {/* Top Brand Logo Image with subtle floating pulse */}
      <div className="animate-logo-pulse mb-3 flex items-center justify-center">
        <Image
          src={logoImg}
          alt="India DITS Logo"
          width={current.logoWidth}
          height={current.logoHeight}
          className="object-contain"
          priority
        />
      </div>

      {/* Pure Tailwind Animated Linear Progress Bar */}
      <div className={`relative overflow-hidden ${current.barClasses} bg-sky-100 rounded-full my-2`}>
        <div className="absolute inset-y-0 w-full bg-[#0090e3] rounded-full animate-loader-bar origin-left"></div>
      </div>
    </div>
  );

  // Full Screen Backdrop Overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 max-w-xs w-full backdrop-blur-xl flex items-center justify-center">
          {content}
        </div>
      </div>
    );
  }

  // Card Variant
  if (variant === 'card') {
    return (
      <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-10 flex items-center justify-center">
        {content}
      </div>
    );
  }

  // Default Standard Container
  return (
    <div className="w-full py-10 px-4 flex items-center justify-center">
      {content}
    </div>
  );
};

export default Loader;
