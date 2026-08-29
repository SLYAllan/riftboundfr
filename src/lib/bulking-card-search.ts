export function lireReferenceCollection(query: string, defaultSet?: string | null) {
  const value = query.trim();
  const complete = /^([a-z0-9]{2,8})[\s-]+0*(\d{1,4})$/i.exec(value);
  if (complete) return { set: complete[1].toUpperCase(), collectorNumber: Number(complete[2]) };
  if (defaultSet && /^0*\d{1,4}$/.test(value)) return { set: defaultSet.toUpperCase(), collectorNumber: Number(value) };
  if (/^0*\d{1,4}$/.test(value)) return { set: null, collectorNumber: Number(value) };
  return null;
}
