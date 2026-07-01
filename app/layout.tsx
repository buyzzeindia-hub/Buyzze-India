export const runtime = 'nodejs';

import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConditionalHeader from "@/components/ConditionalHeader";
import BackgroundPattern from "@/components/BackgroundPattern";
import { LocationProvider } from "@/features/location/context/LocationContext";
import { SearchProvider } from "@/context/SearchContext";
import ZzeWrapper from "@/components/ZzeWrapper";
import Providers from "@/components/Providers";
import FastAuthPopup from "@/components/auth/FastAuthPopup";

// ✅ COMPLETE SEO OPTIMIZATION (Meta Tags & OpenGraph)
export const metadata: Metadata = {
  title: "BuYzze | 100% Scam-Free Used Mobile Marketplace",
  description: "Buy and sell second-hand phones with confidence. Verified sellers, AI price predictor, and safe transactions. Explore the best trusted used mobile marketplace in India.",
  keywords: "used mobile marketplace, second hand phones, buy verified used mobiles, scam-free mobile marketplace, AI used phone price, sell used phone, BuyZze",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "BuYzze | Verified Used Mobile Marketplace",
    description: "100% Scam-Free platform to buy and sell used phones.",
    url: "https://buyzze.in",
    siteName: "BuYzze",
    locale: "en_IN",
    type: "website",
  },
  alternates: {
    canonical: "https://buyzze.in",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ JSON-LD SCHEMA (Google Bot ke liye Structured Data)
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BuYzze",
    "url": "https://buyzze.in",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://buyzze.in/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
          />
        </head>
        <body className="bg-white dark:bg-[#05080d] text-gray-900 dark:text-white transition-colors duration-300 min-h-screen relative antialiased">
          <Providers>
            <BackgroundPattern />
            <LocationProvider>
             <FastAuthPopup />
              <SearchProvider>
                <ConditionalHeader />
                <ZzeWrapper>
                  <main className="relative z-10 bg-transparent">
                    {children}
                  </main>
                </ZzeWrapper>
              </SearchProvider>
            </LocationProvider>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}