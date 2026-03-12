import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConditionalHeader from "@/components/ConditionalHeader";
import BackgroundPattern from "@/components/BackgroundPattern";
import { LocationProvider } from "@/features/location/context/LocationContext";
import { SearchProvider } from "@/context/SearchContext";
import ZzeWrapper from "@/components/ZzeWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <html lang="en">
        <body className="bg-white dark:bg-[#05080d] text-gray-900 transition-colors duration-500 min-h-screen relative antialiased">
          <BackgroundPattern />
          <LocationProvider>
            <SearchProvider>
              {/* Header — sticky, sits above everything, z-index 100 */}
              <ConditionalHeader />

              {/* ZzeWrapper — handles push layout + FAB + drawer */}
              {/* Children (page content) sit inside the push div */}
              <ZzeWrapper>
                <main className="relative z-10 bg-transparent">
                  {children}
                </main>
              </ZzeWrapper>

            </SearchProvider>
          </LocationProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}