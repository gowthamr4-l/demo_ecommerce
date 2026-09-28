import React from 'react';
import { SeoPropertyData, formatPrice } from '../../lib/generateSeoDescription';

interface PriceBreakdownProps {
  property: SeoPropertyData;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({ property }) => {
  const isRent = !(property.adType === 'Sale' || property.adType === 'Resale');
  const price = property.expectedRent || property.expectedPrice || 0;
  const deposit = property.expectedDeposit;
  const maintenance = property.monthlyMaintenance;
  const area = property.builtUpArea || property.carpetArea || property.plotArea;
  const pricePerSqFt = area && price ? Math.round(price / area) : null;

  return (
    <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 lg:p-8 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
          <span className="w-2 h-5 bg-[#006ce6] rounded-full"></span>
          Price Breakdown &amp; Financials
        </h2>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
          0% Brokerage
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {isRent ? 'Monthly Rent' : 'Expected Price'}
          </span>
          <span className="text-lg sm:text-xl font-black text-[#006ce6] mt-2">
            {formatPrice(price)}
          </span>
        </div>

        {/* Metric 2 */}
        {isRent && deposit !== undefined && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Security Deposit
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-800 mt-2">
              {formatPrice(deposit)}
            </span>
          </div>
        )}

        {/* Metric 3 */}
        {maintenance !== undefined && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Maintenance
            </span>
            <span className="text-base sm:text-lg font-extrabold text-slate-800 mt-2">
              {typeof maintenance === 'number' ? `₹${maintenance.toLocaleString('en-IN')}/mo` : maintenance}
            </span>
          </div>
        )}

        {/* Metric 4 */}
        {area && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Super Area
            </span>
            <span className="text-base sm:text-lg font-extrabold text-slate-800 mt-2">
              {area} sq.ft.
              {pricePerSqFt && !isRent && (
                <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                  (₹{pricePerSqFt.toLocaleString('en-IN')}/sq.ft.)
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Brokerage Savings Notice */}
      <div className="p-3.5 bg-gradient-to-r from-blue-50/80 via-emerald-50/50 to-white rounded-2xl border border-blue-100 flex items-center gap-3">
        <span className="text-xl">💰</span>
        <p className="text-xs text-slate-700 font-semibold leading-relaxed">
          <strong className="text-slate-900 font-extrabold">Save Up to ₹50,000+ in Brokerage!</strong> Connect directly with the verified owner on India DITS with zero broker commission.
        </p>
      </div>
    </section>
  );
};
