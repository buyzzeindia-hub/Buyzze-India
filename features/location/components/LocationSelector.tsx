"use client";

import { useLocation } from "../context/LocationContext";

export default function LocationSelector() {
  const { location, updateLocation } = useLocation();

  const detectLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          );
          const data = await res.json();

          updateLocation(
            data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.state ||
              ""
          );
        } catch (err) {
          console.error("Reverse geocoding error:", err);
        }
      },
      (err) => {
        console.error("GPS Accuracy Lock Error:", err);
      },
      {
        enableHighAccuracy: true, // 🚨 True hardware pinpoint satellite active tracking
        timeout: 15000,           // 🚨 15 seconds accuracy buffer lock
        maximumAge: 0             // 🚨 Force bypass browser geolocation standard cache
      }
    );
  };

  return (
    <div className="flex gap-2 items-center">
      <input
        className="border px-3 py-1 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        placeholder="Enter location"
        value={location}
        onChange={(e) => updateLocation(e.target.value)}
      />
      <button
        onClick={detectLocation}
        className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
      >
        Use GPS
      </button>
    </div>
  );
}