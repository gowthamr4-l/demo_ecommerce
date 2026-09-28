'use client';

import React from 'react';
import Link from 'next/link';

export default function WorkflowDocsPage() {
  return (
    <div className="w-full h-screen flex flex-col bg-[#f8fafc]">
      {/* Top quick navigation bar */}
      <div className="bg-[#006ce6] text-white px-4 py-2.5 flex items-center justify-between shadow-sm z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-white font-extrabold text-sm hover:opacity-90 transition-opacity">
            <span className="w-6 h-6 rounded bg-white text-[#006ce6] flex items-center justify-center font-black text-xs">ID</span>
            <span>India DITS</span>
          </Link>
          <span className="text-blue-200 text-xs hidden sm:inline-block">• System Workflows & Architecture</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/api-docs" className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3 py-1 rounded-lg transition-colors">
            📡 Swagger API
          </Link>
          <a href="/workflow-documentation.html" target="_blank" className="bg-white text-[#006ce6] hover:bg-blue-50 text-xs font-bold px-3 py-1 rounded-lg transition-colors shadow-sm">
            ↗ Fullscreen
          </a>
          <Link href="/" className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3 py-1 rounded-lg transition-colors">
            ← Back
          </Link>
        </div>
      </div>

      {/* Embedded Workflow Manual */}
      <iframe
        src="/workflow-documentation.html"
        title="India DITS System Workflows Documentation"
        className="w-full flex-1 border-none"
      />
    </div>
  );
}
