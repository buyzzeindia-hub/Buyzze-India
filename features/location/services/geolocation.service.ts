export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true, // 🚨 Strict hardware GPS lock clear filter active
        timeout: 15000,           // 🚨 accurate lock wait window
        maximumAge: 0             // 🚨 force raw fresh calculation bypass cache
      }
    );
  });
}