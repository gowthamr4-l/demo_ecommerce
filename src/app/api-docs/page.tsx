'use client';

import React, { useEffect, useRef } from 'react';
import { OPENAPI_SPEC } from '../../lib/swaggerSpec';

export default function ApiDocsPage() {
  const swaggerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject Swagger UI stylesheet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css';
    document.head.appendChild(link);

    // Inject Swagger UI Bundle script
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.min.js';
    script.async = true;
    script.onload = () => {
      const win = window as any;
      if (win.SwaggerUIBundle && swaggerContainerRef.current) {
        win.ui = win.SwaggerUIBundle({
          spec: OPENAPI_SPEC,
          domNode: swaggerContainerRef.current,
          presets: [
            win.SwaggerUIBundle.presets.apis,
          ],
          layout: 'BaseLayout',
          deepLinking: true,
          showExtensions: true,
          showCommonExtensions: true,
          defaultModelsExpandDepth: 1,
          defaultModelExpandDepth: 1,
          displayRequestDuration: true,
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (link.parentNode) link.parentNode.removeChild(link);
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">India DITS - Interactive Swagger API Docs</h1>
          <p className="text-xs text-slate-500">Live, interactive API documentation directly inside the application</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/india-dits-swagger-ui.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
          >
            Open Standalone Fullscreen ↗
          </a>
        </div>
      </div>
      <div ref={swaggerContainerRef} className="swagger-ui-container p-4" />
    </div>
  );
}
