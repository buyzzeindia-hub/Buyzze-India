"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const LocationContext = createContext<any>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [detectedCity, setDetectedCity] = useState<string>(""); 
  const [selectedCity, setSelectedCity] = useState<string>(""); 
  const [isNearbyActive, setIsNearbyActive] = useState<boolean>(false);

  const detectLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.suburb || "";
          
          if (city) {
            setDetectedCity(city);
            setSelectedCity(city);
          }
        } catch (e) {
          console.error("Geocoding failed", e);
        }
      },
      (err) => console.warn("GPS access denied or unavailable"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  return (
    <LocationContext.Provider value={{ 
      selectedCity, setSelectedCity, 
      detectedCity, isNearbyActive, 
      setIsNearbyActive, detectLocation 
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => useContext(LocationContext);