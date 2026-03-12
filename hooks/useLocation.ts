"use client";

import { useEffect, useState } from "react";

export function useLocation() {
  const [location, setLocation] = useState({
    city: "",
    state: "",
    lat: null as number | null,
    lng: null as number | null,
  });

  useEffect(() => {
    const saved = localStorage.getItem("user-location");
    if (saved) {
      setLocation(JSON.parse(saved));
    }
  }, []);

  const saveLocation = (loc: typeof location) => {
    setLocation(loc);
    localStorage.setItem("user-location", JSON.stringify(loc));
  };

  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
      );
      const data = await res.json();

      saveLocation({
        city:
          data.address.city ||
          data.address.town ||
          data.address.village ||
          "",
        state: data.address.state || "",
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  };

  return {
    location,
    detectLocation,
    saveLocation,
  };
}
