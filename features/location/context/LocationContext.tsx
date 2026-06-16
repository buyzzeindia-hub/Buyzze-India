"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const LocationContext = createContext<any>(null);

// ── 1. Reverse Geocode with Zoom Support (Street to City Level) ───────
async function reverseGeocodeWithZoom(lat: number, lon: number, zoom: number) {
  // Namedetails=1 lene se landmark aur mohalla pakadne mein aasani hoti hai
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=${zoom}&addressdetails=1&namedetails=1`;
  const res = await fetch(url, {
    headers: { "Accept-Language": "en-IN,en;q=0.9" },
  });
  if (!res.ok) throw new Error(`Nominatim zoom=${zoom} failed`);
  return res.json();
}

// ── 2. Get Most Granular Name (For "Ramnagar" level accuracy) ──────────
function getMostGranularName(addr: any): string {
  // India ke address system ke hisaab se priority set ki gayi hai
  const candidates = [
    addr.hamlet,           // Chhota gaon/area
    addr.neighbourhood,    // Mohalla/Ward
    addr.residential,      // Colony/Society
    addr.suburb,           // Sub-area (e.g. Lanka)
    addr.village,          // Village name
    addr.town,             // Town name (e.g. Ramnagar)
    addr.city_district,    // District level area
    addr.city,             // Main City (e.g. Varanasi)
    addr.municipality,
    addr.district,
  ].filter(Boolean);

  return candidates[0] || "";
}

// ── 3. Parse Full Address (City, State, Pincode) ──────────────────────
function parseFullAddress(data: any) {
  const addr = data.address || {};
  
  // Sabse granular naam dhoondho
  const granularCity = getMostGranularName(addr);
  
  // State aur Pincode hamesha preserve rahega
  const state = addr.state || "";
  const pincode = addr.postcode || "";

  return { 
    city: granularCity, 
    state: state, 
    pincode: pincode 
  };
}

// ── 4. Get Best Possible Location (Scanning Multiple Levels) ──────────
async function getBestLocationData(lat: number, lon: number) {
  // 18 (Street) se 14 (Town) tak scan karo jab tak granular data na mile
  const zoomLevels = [18, 17, 16, 15, 14];
  let finalResult = { city: "", state: "", pincode: "" };

  for (const zoom of zoomLevels) {
    try {
      const data = await reverseGeocodeWithZoom(lat, lon, zoom);
      const parsed = parseFullAddress(data);

      if (parsed.city) {
        finalResult = parsed;
        // Agar mohalla/village mil gaya toh loop break karo
        break; 
      }
    } catch (e) {
      console.warn(`Zoom level ${zoom} failed, trying next...`);
    }
  }
  return finalResult;
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [detectedCity, setDetectedCity] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [pincode, setPincode] = useState<string>("");
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isNearbyActive, setIsNearbyActive] = useState<boolean>(false);
  const [locating, setLocating] = useState<boolean>(false);

  // ── 5. IP Fallback (Essential for PC/Laptops without GPS) ───────────
  const fetchIPFallback = useCallback(async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      
      if (data.city) {
        const fullAddr = [data.city, data.region, data.postal].filter(Boolean).join(", ");
        setDetectedCity(data.city);
        setSelectedCity(fullAddr);
        setPincode(data.postal || "");
        setCoords({ lat: data.latitude, lng: data.longitude });
        
        // LocalStorage mein save karo taaki next time instant load ho
        localStorage.setItem("buyzze_loc_cache", JSON.stringify({
          city: data.city,
          display: fullAddr,
          pin: data.postal,
          lat: data.latitude,
          lng: data.longitude
        }));
      }
    } catch (err) {
      console.error("IP Location Fallback failed:", err);
    } finally {
      setLocating(false);
    }
  }, []);

  // ── 6. Main Detection Logic (Hardware GPS + Smart Lock) ─────────────
  const detectLocation = useCallback(() => {
    if (typeof window === "undefined") return;
    setLocating(true);

    // Agar browser support hi nahi karta, toh seedha IP par jao
    if (!navigator.geolocation) {
      fetchIPFallback();
      return;
    }

    let bestPosition: GeolocationPosition | null = null;
    let watchId: number;
    let isResolved = false;

    const finalize = async (position: GeolocationPosition) => {
      if (isResolved) return;
      isResolved = true;
      navigator.geolocation.clearWatch(watchId);

      const { latitude, longitude, accuracy } = position.coords;
      console.log(`📍 Hardware Lock: ${Math.round(accuracy)}m accuracy`);

      try {
        const { city, state, pincode: pin } = await getBestLocationData(latitude, longitude);
        
        if (city) {
          const fullDisplay = [city, state, pin].filter(Boolean).join(", ");
          setDetectedCity(city);
          setSelectedCity(fullDisplay);
          setPincode(pin);
          setCoords({ lat: latitude, lng: longitude });

          localStorage.setItem("buyzze_loc_cache", JSON.stringify({
            city, display: fullDisplay, pin, lat: latitude, lng: longitude
          }));
        } else {
          fetchIPFallback(); // Geocode fail hone par IP fallback
        }
      } catch (e) {
        fetchIPFallback();
      } finally {
        setLocating(false);
      }
    };

    // Satellite GPS lock hone mein time lagta hai, isliye watchPosition use kiya
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!bestPosition || pos.coords.accuracy < bestPosition.coords.accuracy) {
          bestPosition = pos;
        }
        // Agar accuracy 50 meters se behtar hai (Perfect Lock), toh turant final karo
        if (pos.coords.accuracy <= 50) finalize(pos);
      },
      (err) => {
        if (!isResolved) {
          console.warn("GPS Hardware error, switching to IP Fallback...");
          isResolved = true;
          navigator.geolocation.clearWatch(watchId);
          fetchIPFallback();
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );

    // 10 second ka safety timer - best hardware lock ka wait karne ke liye
    setTimeout(() => {
      if (!isResolved) {
        bestPosition ? finalize(bestPosition) : fetchIPFallback();
      }
    }, 10000);
  }, [fetchIPFallback]);

  // Initial Load: Cache ya Detection
  useEffect(() => {
    const cached = localStorage.getItem("buyzze_loc_cache");
    if (cached) {
      const d = JSON.parse(cached);
      setDetectedCity(d.city);
      setSelectedCity(d.display);
      setPincode(d.pin);
      setCoords({ lat: d.lat, lng: d.lng });
    }
    detectLocation();
  }, [detectLocation]);

  return (
    <LocationContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        detectedCity,
        setDetectedCity,
        pincode,
        coords,
        locating,
        isNearbyActive,
        setIsNearbyActive,
        detectLocation,
        location: selectedCity, // Backward compatibility
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => useContext(LocationContext);