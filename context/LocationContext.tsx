"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const LocationContext = createContext<any>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [city, setCity] = useState<string>("Detecting...");
  const [state, setState] = useState<string>("");

  const detectLocation = useCallback(async () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Free Reverse Geocoding API
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await res.json();
            // Supabase ke 'city' aur 'state' column ke format mein data set karein
            setCity(data.city || data.locality || "Unknown");
            setState(data.principalSubdivision || "");
          } catch (error) {
            console.error("Location Fetch Error:", error);
            setCity("Select Location");
          }
        },
        () => {
          setCity("Location Denied");
        }
      );
    } else {
      setCity("Not Supported");
    }
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  return (
    <LocationContext.Provider value={{ city, setCity, state, setState, detectLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => {
  const context = useContext(LocationContext);
  // Is check se aapka crash hona band ho jayega
  if (context === undefined || context === null) {
    return { city: "Detecting...", setCity: () => {}, state: "" };
  }
  return context;
};