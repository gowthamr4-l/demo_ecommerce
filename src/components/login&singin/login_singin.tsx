'use client';

import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { environment } from '../../environment';
import { loginApi, registerApi } from '../../utils/apiClient';
import logoImg from '../../assets/images/indiaditss.webp';
import loginPageImg from '../../assets/images/login_page_img.jpg';

const COUNTRIES = [
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
];

interface LoginSigninProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (user: any) => void;
}

export const LoginSignin: React.FC<LoginSigninProps> = ({ isOpen, onClose, onLogin }) => {
  const [mounted, setMounted] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<'MOBILE_ENTRY' | 'REGISTRATION'>('MOBILE_ENTRY');
  const [mobileNumber, setMobileNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isRealEstateAgent, setIsRealEstateAgent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setStep('MOBILE_ENTRY');
      setMobileNumber('');
      setName('');
      setEmail('');
      setIsRealEstateAgent(false);
      setError('');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleContinue = async () => {
    if (step === 'MOBILE_ENTRY') {
      if (!/^\d{10}$/.test(mobileNumber)) {
        setError('Please enter a valid 10-digit mobile number');
        return;
      }
      setError('');
      setIsLoading(true);
      try {
        const data = await loginApi({ mobile: mobileNumber });
        if (data.success && data.user) {
          if (onLogin) onLogin(data.user);
          onClose();
        } else {
          setStep('REGISTRATION');
        }
      } catch (err: any) {
        // If user not found on login, prompt registration
        setStep('REGISTRATION');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!name.trim()) {
        setError('Name is required');
        return;
      }
      setError('');
      setIsLoading(true);
      try {
        const data = await registerApi({
          countryCode: selectedCountry.code,
          mobile: mobileNumber,
          name: name.trim(),
          email: email ? email.trim() : undefined,
          isRealEstateAgent,
        });

        if (data.success && data.user) {
          if (onLogin) onLogin(data.user);
          onClose();
        } else {
          setError(data.error || data.message || 'Registration failed');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Registration failed');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen || !mounted) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs transition-opacity font-['Inter',sans-serif] overflow-y-auto" 
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md md:max-w-[840px] bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-100 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button"
          className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs focus:outline-none"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Left Promo Pane (Hidden on Mobile, Visible on md+) */}
        <div className="hidden md:flex flex-col justify-between flex-1 bg-gradient-to-b from-[#f0f7ff] via-[#f8fbff] to-white p-6 lg:p-8 relative overflow-hidden select-none border-r border-slate-100">
          <div className="relative z-10">
            <img src={logoImg.src || (logoImg as any)} alt="India DITS" className="h-8 w-auto object-contain mb-4" />
            <h2 className="text-2xl lg:text-[28px] font-black text-slate-900 leading-tight tracking-tight mb-2">
              Find your <br />
              <span className="text-[#006ce6]">perfect property</span>
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[260px]">
              Explore thousands of verified listings with direct owner contact and zero brokerage.
            </p>
          </div>

          {/* Bottom Background Image with smooth opacity gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-[48%] z-0 overflow-hidden pointer-events-none">
            <img 
              src={loginPageImg.src || (loginPageImg as any)} 
              alt="Property" 
              className="w-full h-full object-cover object-bottom opacity-90 [mask-image:linear-gradient(to_top,rgba(0,0,0,1)_50%,rgba(0,0,0,0.4)_80%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,1)_50%,rgba(0,0,0,0.4)_80%,transparent_100%)]" 
            />
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#f8fbff] to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Right Form Pane */}
        <div className="flex-1 p-5 sm:p-6 md:p-8 flex flex-col justify-between bg-white overflow-y-auto w-full min-w-0">
          <div className="w-full">
            {/* Form Header */}
            <div className="mb-4 pr-6">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-0.5">Welcome back!</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#006ce6] inline-block flex-shrink-0"></span>
                <span>Login / Sign up to continue</span>
              </p>
            </div>

            {error && (
              <div className="p-2.5 mb-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span className="break-words">{error}</span>
              </div>
            )}

            <div className="space-y-3 sm:space-y-3.5 w-full">
              {step === 'MOBILE_ENTRY' ? (
                <div className="w-full">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Enter your mobile number
                  </label>
                  
                  {/* Phone Input with Country Selector */}
                  <div className="relative flex items-stretch border border-slate-200 rounded-xl focus-within:border-[#006ce6] focus-within:ring-2 focus-within:ring-blue-100 bg-white transition-all w-full overflow-hidden">
                    {/* Country Selector Button */}
                    <div className="relative flex-shrink-0" ref={countryDropdownRef}>
                      <button
                        type="button"
                        className="flex items-center gap-1 h-full px-2.5 sm:px-3 bg-slate-50 hover:bg-slate-100 border-r border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer transition-colors select-none"
                        onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      >
                        <span className="text-sm sm:text-base">{selectedCountry.flag}</span>
                        <span className="font-bold text-xs sm:text-sm">{selectedCountry.code}</span>
                        <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {isCountryDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1 w-52 sm:w-56 bg-white rounded-xl border border-slate-200 shadow-xl p-1 z-50 max-h-48 overflow-y-auto">
                          {COUNTRIES.map((c) => (
                            <div
                              key={c.code}
                              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                                selectedCountry.code === c.code 
                                  ? 'bg-blue-50 text-blue-700 font-bold' 
                                  : 'hover:bg-slate-100 text-slate-800'
                              }`}
                              onClick={() => {
                                setSelectedCountry(c);
                                setIsCountryDropdownOpen(false);
                              }}
                            >
                              <span className="text-sm">{c.flag}</span>
                              <span className="font-bold min-w-[32px]">{c.code}</span>
                              <span className="text-slate-500 truncate">{c.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <input
                      type="tel"
                      placeholder="Enter 10-digit mobile"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleContinue();
                      }}
                      className="min-w-0 flex-1 px-3 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
                      autoFocus
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 w-full">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleContinue();
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium outline-none focus:border-[#006ce6] focus:ring-2 focus:ring-blue-100 bg-slate-50 focus:bg-white transition-all text-slate-900"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleContinue();
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium outline-none focus:border-[#006ce6] focus:ring-2 focus:ring-blue-100 bg-slate-50 focus:bg-white transition-all text-slate-900"
                    />
                  </div>

                  <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isRealEstateAgent}
                      onChange={(e) => setIsRealEstateAgent(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 cursor-pointer accent-[#006ce6]"
                    />
                    <span className="text-xs text-slate-700 font-semibold">
                      Are you a Real Estate Agent?
                    </span>
                  </label>
                </div>
              )}

              {/* Submit CTA Button */}
              <button
                type="button"
                className="w-full py-2.5 sm:py-3 px-4 bg-[#006ce6] hover:bg-[#005bb5] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
                onClick={handleContinue}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{step === 'MOBILE_ENTRY' ? 'Continue' : 'Complete Registration'}</span>
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </>
                )}
              </button>

              {/* Trust Badge */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#f0f7ff] border border-blue-100/90 w-full">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-[#006ce6] flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <div className="text-[11px] text-slate-600 leading-tight">
                  <strong className="text-slate-900 block font-bold">Your information is safe with us.</strong>
                  We never share your personal contact details with third parties.
                </div>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <p className="text-[11px] text-center text-slate-400 pt-3 m-0 leading-normal">
            By continuing, you agree to our <span className="text-[#006ce6] font-semibold hover:underline cursor-pointer">Terms &amp; Conditions</span> and <span className="text-[#006ce6] font-semibold hover:underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LoginSignin;
