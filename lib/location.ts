export const normalize = (str: string) =>
  str.toLowerCase().replace(/\s/g, "");

export const locationMatch = (
  productCity: string,
  productState: string,
  userCity: string,
  userState: string
) => {
  const pc = normalize(productCity);
  const ps = normalize(productState);
  const uc = normalize(userCity);
  const us = normalize(userState);

  return (
    pc.includes(uc) ||
    uc.includes(pc) ||
    ps.includes(us) ||
    us.includes(ps)
  );
};
