import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/index.css';
import { Header } from '@/components/layout/Header/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { ErrorBoundary } from '@/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'India DITS | Direct Owner Real Estate & Property Portal',
  description: 'Zero brokerage direct owner listings for Rent, Sale, Commercial, Plots, and PG across Tamil Nadu and all of India.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#f8fafc]`} suppressHydrationWarning>
        <ErrorBoundary>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  );
}
