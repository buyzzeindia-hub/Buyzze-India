export const runtime = 'nodejs';

import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConditionalHeader from "@/components/ConditionalHeader";
import BackgroundPattern from "@/components/BackgroundPattern";
import { LocationProvider } from "@/features/location/context/LocationContext";
import { SearchProvider } from "@/context/SearchContext";
import ZzeWrapper from "@/components/ZzeWrapper";
import Providers from "@/components/Providers";
import FastAuthPopup from "@/components/auth/FastAuthPopup";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <html lang="en" suppressHydrationWarning>
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