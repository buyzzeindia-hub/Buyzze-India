"use client";

import { useLocation } from "../context/LocationContext";

export default function LocationSelector() {
  const { location, updateLocation } = useLocation();

  const detectLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
      );
      const data = await res.json();

      updateLocation(
        data.address.city ||
          data.address.town ||
          data.address.state ||
          ""
      );
    });
  };

  return (
    <div className="flex gap-2 items-center">
      <input
        className="border px-3 py-1 rounded"
        placeholder="Enter location"
        value={location}
        onChange={(e) => updateLocation(e.target.value)}
      />
      <button
        onClick={detectLocation}
        className="text-sm text-blue-600"
      >
        Use GPS
      </button>
    </div>
  );
}
