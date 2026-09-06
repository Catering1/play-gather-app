import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CITY_COORDS, DEFAULT_CITY, formatPrice } from "@/data/games";
import type { Game } from "@/lib/queries";

const pin = L.divIcon({
  className: "",
  html:
    '<div style="width:16px;height:16px;border-radius:9999px;background:hsl(146 88% 45%);' +
    'border:2px solid white;box-shadow:0 1px 6px rgba(0,0,0,.5)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8],
});

/** Reajusta o centro/zoom sempre que a lista de jogos visíveis muda. */
function FitToGames({ games, cityFallback }: { games: Game[]; cityFallback: string }) {
  const map = useMap();

  useMemo(() => {
    const withCoords = games.filter(
      (g): g is Game & { lat: number; lng: number } => g.lat !== null && g.lng !== null,
    );

    if (withCoords.length === 0) {
      const c = CITY_COORDS[cityFallback] ?? CITY_COORDS[DEFAULT_CITY]!;
      map.setView([c.lat, c.lng], 12);
      return;
    }

    if (withCoords.length === 1) {
      map.setView([withCoords[0]!.lat, withCoords[0]!.lng], 14);
      return;
    }

    const bounds = L.latLngBounds(withCoords.map((g) => [g.lat, g.lng]));
    map.fitBounds(bounds, { padding: [32, 32] });
  }, [games, cityFallback, map]);

  return null;
}

export function MapView({ games, city }: { games: Game[]; city?: string | undefined }) {
  const center = CITY_COORDS[city ?? DEFAULT_CITY] ?? CITY_COORDS[DEFAULT_CITY]!;
  const withCoords = games.filter(
    (g): g is Game & { lat: number; lng: number } => g.lat !== null && g.lng !== null,
  );

  return (
    <div className="mf-map h-[60vh] w-full overflow-hidden rounded-3xl ring-1 ring-border">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={12}
        scrollWheelZoom
        style={{ height: "100%", width: "100%", background: "hsl(212 45% 7%)" }}
      >
        <TileLayer
          className="mf-map-tiles"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToGames games={games} cityFallback={city ?? DEFAULT_CITY} />
        {withCoords.map((g) => (
          <Marker key={g.id} position={[g.lat, g.lng]} icon={pin}>
            <Popup>
              <div className="min-w-[160px] space-y-1.5">
                <p className="font-semibold">{g.title}</p>
                <p className="text-xs text-muted-foreground">
                  {g.venue} · {g.city}
                </p>
                <p className="text-xs text-muted-foreground">
                  {g.dayLabel} · {g.time} · {formatPrice(g.price)}
                </p>
                <Link
                  to="/jogo/$id"
                  params={{ id: g.id }}
                  className="mt-1 inline-block text-xs font-semibold text-primary"
                >
                  Ver jogo →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
