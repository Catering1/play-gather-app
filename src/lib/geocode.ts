import { CITY_COORDS } from "@/data/games";

export type Coords = { lat: number; lng: number };

/**
 * Traduz "local + cidade" em coordenadas usando o Nominatim (OpenStreetMap),
 * que é gratuito e não exige chave de API. Se falhar ou não encontrar nada,
 * devolve o centro da cidade — o jogo nunca fica sem posição no mapa.
 */
export async function geocodeVenue(venue: string, city: string): Promise<Coords> {
  const fallback = CITY_COORDS[city] ?? CITY_COORDS["Lisboa"]!;

  try {
    const query = encodeURIComponent(`${venue}, ${city}, Portugal`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=pt&q=${query}`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return fallback;

    const results = (await res.json()) as { lat: string; lon: string }[];
    const hit = results[0];
    if (!hit) return fallback;

    const lat = Number(hit.lat);
    const lng = Number(hit.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return fallback;

    return { lat, lng };
  } catch {
    return fallback;
  }
}
