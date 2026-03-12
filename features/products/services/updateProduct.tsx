"use client";

export default function LocationSelector({
  location,
  setLocation,
}: any) {
  return (
    <div className="border rounded p-3 bg-white flex items-center gap-3">
      <div>
        <p className="text-sm text-gray-500">Location</p>
        <p className="font-medium">
          {location?.city || "Unknown"}, {location?.state || ""}
        </p>
      </div>

      <button
        onClick={() => {
          const city = prompt("Enter city");
          const state = prompt("Enter state");

          if (city && state) {
            setLocation({
              city,
              state,
              manual: true,
            });
          }
        }}
        className="ml-auto text-sm text-blue-600 hover:underline"
      >
        Change
      </button>
    </div>
  );
}
