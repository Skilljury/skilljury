export function encodeSourceSlug(sourceSlug: string) {
  return encodeURIComponent(sourceSlug);
}

export function decodeSourceSlug(sourceSlug: string) {
  return decodeURIComponent(sourceSlug);
}
