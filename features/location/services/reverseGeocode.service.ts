export async function reverseGeocode(lat: number, lon: number) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
  );

  const data = await res.json();

  return {
    city:
      data.address.city ||
      data.address.town ||
      data.address.village ||
      "",
    state: data.address.state || "",
  };
}
