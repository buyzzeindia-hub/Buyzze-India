export function locationMatch(userLocation: string, productLocation: string) {
  if (!userLocation || !productLocation) return false;

  const normalize = (str: string) =>
    str.toLowerCase().replace(/\s+/g, "");

  const u = normalize(userLocation);
  const p = normalize(productLocation);

  if (p.includes(u) || u.includes(p)) return true;

  const aliases = [
    ["vns", "varanasi"],
    ["up", "uttarpradesh"],
    ["delhi", "dl"],
    ["mumbai", "bombay"],
  ];

  return aliases.some(
    ([a, b]) =>
      (u.includes(a) && p.includes(b)) ||
      (u.includes(b) && p.includes(a))
  );
}
