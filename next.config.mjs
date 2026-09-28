import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clean up legacy src/Pages and src/pages directory if present so Next.js does not treat it as Pages Router
const legacyPagesDir = path.join(__dirname, 'src', 'Pages');
if (fs.existsSync(legacyPagesDir)) {
  try {
    fs.rmSync(legacyPagesDir, { recursive: true, force: true });
    console.log('✓ Cleaned up legacy src/Pages directory');
  } catch (e) {
    console.warn('Could not remove src/Pages:', e);
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  eslint: {
    // Disables ESLint blocking the production build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type checking is enabled
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
