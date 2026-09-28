'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { environment } from '../../environment';
import { authFetch } from '../../utils/apiClient';
import { Loader } from '../../components/common/Loader/Loader';

interface VisitorLead {
  id?: string;
  _id?: string;
  userId?: string;
  name?: string;
  mobile?: string;
  email?: string;
  isRealEstateAgent?: boolean;
  viewedTime?: string;
  createdAt?: string;
  user?: {
    name?: string;
    mobile?: string;
    email?: string;
    isRealEstateAgent?: boolean;
  };
}

export const PropertyLeadsPage: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [leads, setLeads] = useState<VisitorLead[]>([]);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch leads for this property
  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        // Fetch property details if not in location state
        if (!property && id) {
          const propRes = await authFetch(`${environment.apiBaseUrl}/properties/${id}`);
          const propData = await propRes.json();
          if (propData.success && propData.data) {
            setProperty(propData.data);
          }
        }

        // Fetch leads from backend
        const leadsRes = await authFetch(`${environment.apiBaseUrl}/leads/property/${id}`);
        const leadsData = await leadsRes.json();

        if (leadsData.success && Array.isArray(leadsData.data)) {
          // Deduplicate by userId so each user counts as 1 lead
          const seenUsers = new Set<string>();
          const uniqueLeads: VisitorLead[] = [];
          leadsData.data.forEach((lead: any) => {
            const uid = String(lead.userId || lead.userid || lead.user?.id || lead.id || '');
            if (uid && !seenUsers.has(uid)) {
              seenUsers.add(uid);
              uniqueLeads.push(lead);
            }
          });
          setLeads(uniqueLeads);
        } else {
          setLeads([]);
        }
      } catch (err) {
        console.error("Failed to load visitor leads", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLeads();
    }
  }, [id, property]);

  const filteredLeads = leads.filter((lead) => {
    const name = (lead.user?.name || lead.name || '').toLowerCase();
    const mobile = (lead.user?.mobile || lead.mobile || '').toLowerCase();
    const email = (lead.user?.email || lead.email || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return name.includes(query) || mobile.includes(query) || email.includes(query);
  });

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formatTimestamp = (lead: VisitorLead) => {
    if (lead.viewedTime) return lead.viewedTime;
    if (lead.createdAt) {
      try {
        const d = new Date(lead.createdAt);
        const day = String(d.getDate()).padStart(2, '0');
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[d.getMonth()];
        const year = d.getFullYear();
        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const strHours = String(hours).padStart(2, '0');
        return `${day} ${month} ${year}, ${strHours}:${minutes} ${ampm}`;
      } catch {
        return lead.createdAt;
      }
    }
    return 'Recently';
  };

  const exportToCSV = () => {
    if (filteredLeads.length === 0) return;
    const headers = ['Name', 'Mobile', 'Email', 'User Type', 'Viewed Date & Time'];
    const rows = filteredLeads.map((l) => [
      `"${l.user?.name || l.name || 'User'}"`,
      `"${l.user?.mobile || l.mobile || 'N/A'}"`,
      `"${l.user?.email || l.email || 'N/A'}"`,
      `"${(l.user?.isRealEstateAgent ?? l.isRealEstateAgent) ? 'Real Estate Agent' : 'Buyer / Tenant'}"`,
      `"${formatTimestamp(l)}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_property_${id || 'details'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalBuyers = leads.filter(l => !(l.user?.isRealEstateAgent ?? l.isRealEstateAgent)).length;
  const totalAgents = leads.filter(l => (l.user?.isRealEstateAgent ?? l.isRealEstateAgent)).length;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-6 px-4 sm:px-8 pb-16 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Bar Navigation */}
        <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
          <button 
            type="button"
            className="inline-flex items-center gap-2 bg-white border border-slate-200 py-2 px-4 rounded-lg text-slate-700 text-xs sm:text-sm font-semibold cursor-pointer transition-all shadow-xs hover:bg-slate-100 hover:text-slate-900 hover:-translate-x-0.5"
            onClick={() => router.push(property?.id ? `/property-view/${property.id}` : '/for-owner')}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Property Details</span>
          </button>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-sm shadow-emerald-500/20 disabled:opacity-50"
              onClick={exportToCSV}
              disabled={leads.length === 0}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Header Title & Property Summary */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 m-0 mb-1 tracking-tight">
            Interested Leads & Visitors
          </h1>
          <p className="text-sm text-slate-500 m-0">
            {property ? (
              <span>
                Viewing contacts for <strong className="text-blue-600">{property.propertyType || property.propertyCategory || 'Property'}</strong> in {property.locality || property.city || 'India'}
              </span>
            ) : (
              <span>Verified potential buyers and tenants who viewed your property</span>
            )}
          </p>
        </div>

        {/* 4 Counter Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none">{leads.length}</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Total Leads Recorded</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none">{totalBuyers}</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Direct Buyers / Tenants</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none">{totalAgents}</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Real Estate Agents</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none">
                {leads.length > 0 ? formatTimestamp(leads[0]).split(',')[0] : 'None'}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Latest Activity Date</div>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search leads by name, phone, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
            />
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-900">{filteredLeads.length}</strong> of {leads.length} Leads
          </div>
        </div>

        {/* Leads Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <Loader size="md" />
          ) : filteredLeads.length === 0 ? (
            <div className="py-16 px-4 text-center text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 stroke-[1.5] text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h3 className="text-base font-bold text-slate-700 m-0 mb-1">No Leads Found</h3>
              <p className="text-xs text-slate-500 m-0 max-w-sm mx-auto">
                {searchTerm ? 'No visitor records matching your search query.' : 'As soon as users view your listing details, their contact details will appear here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-5 whitespace-nowrap w-16">#</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">Visitor Name</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">Mobile Number</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">Email Address</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">User Type</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">Viewed Timestamp</th>
                    <th className="py-3.5 px-5 whitespace-nowrap text-right">Instant Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead, idx) => {
                    const userName = lead.user?.name || lead.name || 'Anonymous User';
                    const userMobile = lead.user?.mobile || lead.mobile || 'N/A';
                    const userEmail = lead.user?.email || lead.email || 'N/A';
                    const isAgent = lead.user?.isRealEstateAgent ?? lead.isRealEstateAgent ?? false;

                    return (
                      <tr key={lead.id || lead._id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-5 text-slate-400 font-bold">{idx + 1}</td>

                        <td className="py-3.5 px-5 text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 font-extrabold text-xs flex items-center justify-center flex-shrink-0 border border-blue-100">
                              {getInitials(userName)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{userName}</div>
                              <div className="text-[11px] text-slate-400">Verified User</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5 text-slate-900">
                          {userMobile !== 'N/A' ? (
                            <a
                              href={`tel:${userMobile}`}
                              className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                            >
                              <svg className="w-4 h-4 text-blue-600 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                              </svg>
                              <span>{userMobile.startsWith('+') ? userMobile : `+91 ${userMobile}`}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">Not Provided</span>
                          )}
                        </td>

                        <td className="py-3.5 px-5 text-slate-900">
                          {userEmail !== 'N/A' ? (
                            <a
                              href={`mailto:${userEmail}`}
                              className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-blue-600 transition-colors"
                            >
                              <svg className="w-4 h-4 text-red-500 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                              </svg>
                              <span className="truncate max-w-[180px]">{userEmail}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">Not Provided</span>
                          )}
                        </td>

                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isAgent
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isAgent ? '🏢 Agent' : '👤 Direct Buyer'}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-slate-500 text-xs whitespace-nowrap font-medium">
                          {formatTimestamp(lead)}
                        </td>

                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {userMobile !== 'N/A' && (
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
                                onClick={() => {
                                  window.open(
                                    `https://wa.me/${userMobile.replace(/\D/g, '')}?text=${encodeURIComponent(
                                      `Hi ${userName}, thanks for checking out my property on India DITS! Are you interested in scheduling a visit?`
                                    )}`,
                                    '_blank'
                                  );
                                }}
                                title="Chat on WhatsApp"
                              >
                                <svg className="w-4 h-4 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                </svg>
                                <span>WhatsApp</span>
                              </button>
                            )}

                            {userEmail !== 'N/A' && (
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 transition-all cursor-pointer shadow-2xs"
                                onClick={() => {
                                  window.open(
                                    `mailto:${userEmail}?subject=Regarding Property on India DITS&body=Hi ${userName}, thanks for checking out my property on India DITS!`
                                  );
                                }}
                                title="Send Email"
                              >
                                <svg className="w-4 h-4 flex-shrink-0" style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                  <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                <span>Email</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PropertyLeadsPage;
