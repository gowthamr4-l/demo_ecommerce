'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import logoImg from '../../../assets/images/indiaditss.webp';
import { LoginSignin } from '../../login&singin/login_singin';
import { getUser, logoutApi } from '../../../utils/apiClient';

export const Header: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [user, setUser] = useState<{ id?: number; name?: string; mobile?: string; email?: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const pathname = usePathname() || '';

  useEffect(() => {
    setIsMounted(true);
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser as any);
    }
  }, []);

  // Close mobile drawer on route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const isHomeRoute = pathname === '/';
  const isOwnerRoute = pathname.startsWith('/for-owner');
  const isContactRoute = pathname.startsWith('/contact');

  const openAuthModal = () => {
    setIsMobileMenuOpen(false);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    if (pendingAction === 'for-owner') {
      router.push('/for-owner');
      setPendingAction(null);
    } else if (pendingAction === 'for-owner-create') {
      router.push('/for-owner/create');
      setPendingAction(null);
    }
  };

  const handleLogout = async () => {
    await logoutApi();
    setUser(null);
    setIsMobileMenuOpen(false);
    if (pathname.startsWith('/for-owner')) {
      router.push('/');
    }
  };

  const navigateTo = (path: string, requiresAuth = false, authAction?: string) => {
    setIsMobileMenuOpen(false);
    if (requiresAuth && !user) {
      setPendingAction(authAction || 'auth');
      setIsAuthModalOpen(true);
      return;
    }
    router.push(path);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs font-['Inter',sans-serif] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer flex-shrink-0 transition-transform active:scale-98 hover:opacity-95"
            onClick={() => router.push('/')}
          >
            <Image
              src={logoImg}
              alt="India DITS IT Solutions"
              width={140}
              height={38}
              className="h-8 sm:h-9 md:h-10 w-auto object-contain"
              priority
            />
          </div>

          {/* Right-aligned Navigation & Action Items */}
          <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
            
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 mr-1">
              <button 
                type="button"
                className={`px-3.5 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all cursor-pointer ${
                  isContactRoute
                    ? 'text-[#006ce6] bg-blue-50/80'
                    : 'text-slate-600 hover:text-[#006ce6] hover:bg-slate-100/80'
                }`}
                onClick={() => router.push('/contact-support')}
              >
                Contact Support
              </button>

              <button 
                type="button"
                className={`px-3.5 py-2 rounded-xl text-xs lg:text-sm font-bold transition-all cursor-pointer ${
                  isOwnerRoute
                    ? 'text-[#006ce6] bg-blue-50/80'
                    : 'text-slate-600 hover:text-[#006ce6] hover:bg-slate-100/80'
                }`}
                onClick={() => navigateTo('/for-owner', true, 'for-owner')}
              >
                For Owner
              </button>
            </nav>

            {/* Desktop Post Property Button */}
            <button
              type="button"
              onClick={() => navigateTo('/for-owner/create', true, 'for-owner-create')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-extrabold bg-blue-50 text-[#006ce6] hover:bg-blue-100/80 border border-blue-200/80 transition-all cursor-pointer active:scale-95 shadow-2xs"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Post Property</span>
              <span className="hidden lg:inline text-[10px] px-1.5 py-0.2 bg-[#006ce6] text-white rounded-md uppercase tracking-wider font-black ml-0.5">Free</span>
            </button>

            {/* User Logged In State (Desktop / Tablet) */}
            {isMounted && user ? (
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#006ce6] to-[#2563eb] text-white flex items-center justify-center font-black text-xs shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs lg:text-sm font-bold text-slate-800 max-w-[100px] lg:max-w-[140px] truncate">
                    {user.name || 'My Account'}
                  </span>
                </div>

                <button
                  type="button"
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-600 transition-all cursor-pointer shadow-2xs"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </button>
              </div>
            ) : isMounted ? (
              <button
                type="button"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#006ce6] hover:bg-[#005bb5] text-white text-xs lg:text-sm font-bold rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                onClick={openAuthModal}
              >
                <span>Login / Register</span>
              </button>
            ) : (
              <div className="hidden sm:block w-28 h-9"></div>
            )}

            {/* Mobile / Tablet Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#006ce6] transition-all cursor-pointer shadow-2xs focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                /* Close Icon */
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                /* Hamburger Icon */
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="7" x2="20" y2="7"></line>
                  <line x1="4" y1="12" x2="20" y2="12"></line>
                  <line x1="4" y1="17" x2="20" y2="17"></line>
                </svg>
              )}
            </button>

          </div>
        </div>

        {/* Mobile & Tablet Slide-out Drawer Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <div 
              className="fixed inset-0 top-16 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden animate-fade-in"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer Container */}
            <div className="fixed inset-x-0 top-16 bg-white border-b border-slate-200 shadow-2xl z-50 md:hidden animate-in slide-in-from-top duration-200 max-h-[calc(100vh-4rem)] overflow-y-auto font-['Inter',sans-serif]">
              <div className="p-4 sm:p-6 space-y-4">
                
                {/* User Status Card inside Drawer */}
                {isMounted && user ? (
                  <div className="bg-gradient-to-r from-blue-50/90 via-white to-blue-50/50 p-3.5 rounded-2xl border border-blue-100 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006ce6] to-[#2563eb] text-white flex items-center justify-center font-black text-sm shadow-xs flex-shrink-0">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-slate-900 truncate">
                          {user.name || 'Verified User'}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">
                          {user.mobile || user.email || 'Direct Owner Portal'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
                    >
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2.5">
                    <p className="text-xs text-slate-600 font-medium">Log in to view leads, save favorites &amp; manage properties.</p>
                    <button
                      type="button"
                      onClick={openAuthModal}
                      className="w-full py-2.5 bg-[#006ce6] hover:bg-[#005bb5] text-white text-sm font-extrabold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                    >
                      Login / Register
                    </button>
                  </div>
                )}

                {/* Primary Navigation Links */}
                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => navigateTo('/')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${
                      isHomeRoute
                        ? 'bg-blue-50 text-[#006ce6] border border-blue-200/60 shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <svg className="w-5 h-5 text-[#006ce6] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span>Browse Properties</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo('/for-owner', true, 'for-owner')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${
                      isOwnerRoute && pathname === '/for-owner'
                        ? 'bg-blue-50 text-[#006ce6] border border-blue-200/60 shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <svg className="w-5 h-5 text-[#006ce6] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                      <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                      <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                      <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                    </svg>
                    <span>Owner Dashboard &amp; Leads</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo('/contact-support')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${
                      isContactRoute
                        ? 'bg-blue-50 text-[#006ce6] border border-blue-200/60 shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <svg className="w-5 h-5 text-[#006ce6] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>Contact &amp; Support Desk</span>
                  </button>
                </div>

                {/* Mobile Post Property Callout */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => navigateTo('/for-owner/create', true, 'for-owner-create')}
                    className="w-full py-2.5 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-[#006ce6] to-[#2563eb] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98 whitespace-nowrap flex-nowrap"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span className="whitespace-nowrap">Post Free Property</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-white/20 text-white rounded-md font-black flex-shrink-0 whitespace-nowrap">100% FREE</span>
                  </button>
                </div>

              </div>
            </div>
          </>
        )}
      </header>

      {/* Auth Modal */}
      <LoginSignin
        isOpen={isAuthModalOpen}
        onClose={() => { setIsAuthModalOpen(false); setPendingAction(null); }}
        onLogin={handleLoginSuccess}
      />
    </>
  );
};

export default Header;
