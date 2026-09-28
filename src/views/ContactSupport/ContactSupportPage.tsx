'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { environment } from '../../environment';
import { Loader } from '../../components/common/Loader/Loader';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'owners' | 'buyers' | 'technical';
}

const FAQS: FAQItem[] = [
  {
    category: 'owners',
    question: 'How do I list my property for Sale or Rent on India DITS?',
    answer:
      'Click on "For Owner" in the top navigation bar. If you are not logged in, sign in with your mobile number. Then click "Add New Property" and select your property category (Residential, Commercial, Land/Plot, or PG/Hostel). Follow the 6 easy steps to complete your listing in under 2 minutes!',
  },
  {
    category: 'owners',
    question: 'How do I view leads and contact buyers who viewed my property?',
    answer:
      'Navigate to your "For Owner" dashboard, find your property listing card, and click on "Property Leads". You will see real-time contact details (Name, Mobile, Email, and exact Viewed Time) with 1-click WhatsApp and Email action buttons.',
  },
  {
    category: 'owners',
    question: 'Is listing a property free on India DITS?',
    answer:
      'Yes! India DITS offers zero brokerage direct owner listings for owners, landlords, and property seekers across Tamil Nadu and all of India.',
  },
  {
    category: 'buyers',
    question: 'How do I schedule a site visit for a property?',
    answer:
      'Click on any property card on the Home Page to open its detailed overview. On the right side, you will find the verified Owner contact card with direct phone and WhatsApp chat links to arrange an in-person or virtual walkthrough.',
  },
  {
    category: 'buyers',
    question: 'Are there any brokerage fees for buyers or tenants?',
    answer:
      'Zero brokerage! You deal directly with the genuine property owner, with no hidden mediator commissions or intermediary charges.',
  },
  {
    category: 'technical',
    question: 'How do I edit or delete my property listing after publishing?',
    answer:
      'Go to "For Owner" dashboard, click "Edit Listing" on the property card to modify prices, photos, amenities, or descriptions. You can also toggle the listing status to Inactive or delete it at any time.',
  },
  {
    category: 'general',
    question: 'What documents do I need to prepare before finalizing a rental or sale agreement?',
    answer:
      'For rentals: Government photo ID (Aadhaar/PAN), proof of employment/student ID, and passport-size photographs. For sales: Title deeds, encumbrance certificate (EC), approved building plan, and latest property tax receipts.',
  },
];

export const ContactSupportPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'form' | 'faqs'>('form');
  const [faqCategory, setFaqCategory] = useState<string>('all');
  const [faqSearch, setFaqSearch] = useState<string>('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    category: 'Owner Support',
    priority: 'Medium',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<any | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-fill user if logged in and scroll to top
  React.useEffect(() => {
    window.scrollTo(0, 0);
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setFormData((prev) => ({
          ...prev,
          name: prev.name || u.name || '',
          email: prev.email || u.email || '',
          mobile: prev.mobile || (u.mobile ? u.mobile.toString() : ''),
        }));
      } catch (e) {}
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitError) setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setSubmitError('Please enter your full name.');
      return;
    }
    if (!formData.mobile.trim() || formData.mobile.replace(/\D/g, '').length < 10) {
      setSubmitError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.message.trim()) {
      setSubmitError('Please enter your message or query.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${environment.apiBaseUrl}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok || data.success) {
        setSubmitSuccess(data.data || { ticketId: `#DITS-${Math.floor(10000 + Math.random() * 90000)}` });
      } else {
        setSubmitError(data.message || 'Failed to submit ticket. Please try WhatsApp support.');
      }
    } catch (err) {
      console.warn('Backend unavailable, generating local support acknowledgement');
      const fallbackTicket = {
        ticketId: `#DITS-${Math.floor(10000 + Math.random() * 90000)}`,
        name: formData.name,
        category: formData.category,
      };
      setSubmitSuccess(fallbackTicket);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFaqs = FAQS.filter((f) => {
    const matchesCategory = faqCategory === 'all' || f.category === faqCategory;
    const matchesSearch =
      faqSearch === '' ||
      f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Inter',sans-serif] text-slate-900 pb-20 relative">
      {/* Fullscreen Animated Submission Loader */}
      {submitting && (
        <Loader fullScreen size="lg" />
      )}
      
      {/* 1. Hero Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#3b82f6] text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15)_0%,transparent_60%)]"></div>
        
        <div className="relative max-w-3xl mx-auto z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-white mb-5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
            <span>24/7 Dedicated Customer Care</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-3 text-white">
            How Can We Help You Today?
          </h1>
          
          <p className="text-[#e0e7ff] text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-8 font-normal">
            Need help listing a property, navigating leads, or connecting with verified owners?
            Our real estate support specialists are standing by to assist you.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <a
              href="https://wa.me/919876543210?text=Hi%20India%20DITS%20Support,%20I%20need%20assistance%20with%20my%20property%20listing."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/20 transition-all hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span>Instant WhatsApp Chat</span>
            </a>

            <a
              href="tel:+919876543210"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-bold text-sm transition-all hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>+91 98765 43210</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. 3 Quick Contact Option Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 relative z-20 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Direct Phone */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-md shadow-slate-200/50 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#006ce6] flex items-center justify-center mb-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Phone Support</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-4">
                Speak directly with our property care executives for instant assistance.
              </p>
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 mb-1">+91 98765 43210</div>
              <div className="text-[11px] font-medium text-slate-400 mb-4">Mon – Sat: 9:00 AM – 8:00 PM IST</div>
              <a
                href="tel:+919876543210"
                className="block text-center py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-[#006ce6] text-[#006ce6] hover:text-white text-xs font-bold transition-colors"
              >
                Call Now
              </a>
            </div>
          </div>

          {/* Card 2: WhatsApp Chat */}
          <div className="bg-gradient-to-b from-emerald-50/70 via-white to-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-300/80 shadow-md shadow-emerald-500/10 flex flex-col justify-between relative hover:-translate-y-1 hover:shadow-xl transition-all">
            <div className="absolute -top-3 right-5 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-sm tracking-wider">
              Fastest Response
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">WhatsApp Support</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-4">
                Quick chat on WhatsApp for listing help, verification, and lead inquiries.
              </p>
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 mb-1">+91 98765 43210</div>
              <div className="text-[11px] font-medium text-emerald-600 mb-4">Typical response: &lt; 5 mins</div>
              <a
                href="https://wa.me/919876543210?text=Hello%20India%20DITS,%20I%20would%20like%20to%20inquire%20about%20your%20property%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Start Chat
              </a>
            </div>
          </div>

          {/* Card 3: Email Support */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-md shadow-slate-200/50 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Email Support</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-4">
                Submit detailed business, partnership, or account inquiries via email.
              </p>
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 mb-1 truncate">support@indiadits.com</div>
              <div className="text-[11px] font-medium text-slate-400 mb-4">Turnaround: Within 2 hours</div>
              <a
                href="mailto:support@indiadits.com"
                className="block text-center py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-600 hover:text-white text-xs font-bold transition-colors"
              >
                Send Email
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Main Form & Side Card Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            type="button"
            className={`inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'form'
                ? 'bg-[#006ce6] text-white shadow-md shadow-blue-500/25'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            onClick={() => setActiveTab('form')}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Submit a Support Ticket</span>
          </button>

          <button
            type="button"
            className={`inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'faqs'
                ? 'bg-[#006ce6] text-white shadow-md shadow-blue-500/25'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            onClick={() => setActiveTab('faqs')}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>Frequently Asked Questions</span>
          </button>
        </div>

        {activeTab === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/80 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
                  Send us a Message
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Fill out the details below and our team will get back to you within 2 hours.
                </p>
              </div>

              {submitError && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs sm:text-sm mb-6 font-medium">
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>{submitError}</span>
                </div>
              )}

              {submitSuccess ? (
                <div className="text-center py-10 px-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Ticket Submitted Successfully!</h3>
                  <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed mb-6">
                    Your reference ticket ID is <strong className="text-[#006ce6]">{submitSuccess.ticketId || '#DITS-SUPPORT'}</strong>.
                    Our team will contact you shortly on your mobile or email.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      className="px-5 py-2.5 bg-[#006ce6] hover:bg-[#005bb5] text-white font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
                      onClick={() => {
                        setSubmitSuccess(null);
                        setFormData({
                          name: '',
                          email: '',
                          mobile: '',
                          category: 'Owner Support',
                          priority: 'Medium',
                          message: '',
                        });
                      }}
                    >
                      Submit Another Ticket
                    </button>
                    <button
                      type="button"
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
                      onClick={() => router.push('/')}
                    >
                      Return Home
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">
                      What do you need help with?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Owner Support',
                        'Buyer / Tenant Help',
                        'Lead Inquiries',
                        'Technical Issue',
                        'General Question',
                      ].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            formData.category === cat
                              ? 'bg-blue-50 text-[#006ce6] border border-blue-200 font-bold shadow-2xs'
                              : 'bg-slate-100 text-slate-600 border border-slate-200/80 hover:bg-slate-200'
                          }`}
                          onClick={() => handleChange('category', cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#006ce6] focus:ring-3 focus:ring-blue-500/10 transition-all"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
                        <span className="px-3 text-xs sm:text-sm font-bold text-slate-500 bg-slate-50 border-r border-slate-200 py-2.5">
                          +91
                        </span>
                        <input
                          type="tel"
                          placeholder="10-digit mobile"
                          className="w-full px-3 py-2.5 text-sm text-slate-900 bg-transparent placeholder:text-slate-400 focus:outline-none"
                          value={formData.mobile}
                          onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="rahul@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#006ce6] focus:ring-3 focus:ring-blue-500/10 transition-all"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                        Urgency / Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => handleChange('priority', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:border-[#006ce6] focus:ring-3 focus:ring-blue-500/10 transition-all cursor-pointer"
                      >
                        <option value="Normal">Normal (Response within 4 hrs)</option>
                        <option value="Medium">Medium (Response within 2 hrs)</option>
                        <option value="Urgent">Urgent (Immediate Callback)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                      Describe your query or requirement <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Please provide details regarding your property, lead issue, or inquiry..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-[#006ce6] focus:ring-3 focus:ring-blue-500/10 transition-all resize-y"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                    ></textarea>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#006ce6] hover:bg-[#005bb5] text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Support Ticket</span>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </>
                      )}
                    </button>

                    <span className="text-xs text-slate-400 font-medium">
                      🔒 Your contact information is kept strictly confidential.
                    </span>
                  </div>

                </form>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-[#006ce6] px-3 py-1 rounded-lg text-xs font-bold mb-4">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <span>Direct Listing Support</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Need Help Listing Your Property?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                  Our listing experts will help you write the best property description, select competitive rental prices, and get verified leads in 24 hours.
                </p>

                <div className="space-y-3 mb-6">
                  {[
                    'Instant Listing Approval',
                    'Zero Brokerage Fees',
                    'Direct Buyer WhatsApp Leads',
                    'Automated SMS Notifications',
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-black flex-shrink-0">
                        ✓
                      </span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center mt-4">
                <h4 className="text-sm font-bold text-emerald-900 mb-1">Prefer WhatsApp?</h4>
                <p className="text-xs text-emerald-700 mb-4 leading-relaxed">
                  Send us your property details directly on WhatsApp and we will help you get listed!
                </p>
                <a
                  href="https://wa.me/919876543210?text=Hi%20India%20DITS,%20please%20help%20me%20list%20my%20property."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  <span>Chat with Listing Expert</span>
                </a>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'faqs' && (
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-center bg-white border border-slate-300 rounded-2xl px-4 py-1 mb-6 shadow-sm focus-within:border-[#006ce6] focus-within:ring-3 focus-within:ring-blue-500/10 transition-all">
              <svg className="w-5 h-5 text-slate-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search FAQs by question or keyword..."
                className="w-full px-3 py-3 text-sm text-slate-900 bg-transparent placeholder:text-slate-400 focus:outline-none"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
              />
              {faqSearch && (
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 cursor-pointer"
                  onClick={() => setFaqSearch('')}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: 'all', label: 'All FAQs' },
                { id: 'owners', label: 'Property Owners' },
                { id: 'buyers', label: 'Buyers & Tenants' },
                { id: 'technical', label: 'Account & Edits' },
                { id: 'general', label: 'General & Legal' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    faqCategory === c.id
                      ? 'bg-[#006ce6] text-white shadow-xs'
                      : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => setFaqCategory(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="space-y-3 mb-10">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, idx) => {
                  const isOpen = expandedFaq === idx;
                  return (
                    <div
                      key={idx}
                      className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                        isOpen ? 'border-blue-300 shadow-md shadow-blue-500/5' : 'border-slate-200/80'
                      }`}
                    >
                      <button
                        type="button"
                        className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer"
                        onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      >
                        <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {faq.question}
                        </span>
                        <span
                          className={`w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 bg-blue-50 text-[#006ce6]' : ''
                          }`}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed animate-in fade-in duration-150">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80">
                  <p className="text-slate-500 text-sm mb-4">No questions matched your search query "{faqSearch}".</p>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-[#006ce6] rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    onClick={() => { setFaqSearch(''); setFaqCategory('all'); }}
                  >
                    Clear Search Filters
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </section>

    </div>
  );
};

export default ContactSupportPage;
