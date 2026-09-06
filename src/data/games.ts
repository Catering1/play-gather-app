import futebolImg from "@/assets/futebol.jpg";
import tenisImg from "@/assets/tenis.jpg";
import pingpongImg from "@/assets/pingpong.jpg";
import basquetebolImg from "@/assets/basquetebol.jpg";
import badmintonImg from "@/assets/badminton.jpg";
import voleibolImg from "@/assets/voleibol.jpg";

export type Sport = "Futebol" | "Ping Pong" | "Ténis" | "Basquetebol" | "Badminton" | "Voleibol";

export type Level = "Iniciante" | "Intermédio" | "Avançado" | "Todos os níveis";

export const SPORTS: Sport[] = [
  "Futebol",
  "Ping Pong",
  "Ténis",
  "Basquetebol",
  "Badminton",
  "Voleibol",
];

export const LEVELS: Level[] = ["Iniciante", "Intermédio", "Avançado", "Todos os níveis"];

export const CITIES = ["Lisboa", "Porto", "Setúbal", "Braga", "Cascais"];

export const DEFAULT_CITY = "Lisboa";

/** Coordenadas do centro de cada cidade — usadas para centrar o mapa e como
 * posição de recurso quando o geocoding do local exato falha. */
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Lisboa: { lat: 38.7223, lng: -9.1393 },
  Porto: { lat: 41.1579, lng: -8.6291 },
  Setúbal: { lat: 38.5244, lng: -8.8882 },
  Braga: { lat: 41.5454, lng: -8.4265 },
  Cascais: { lat: 38.6979, lng: -9.4215 },
};

export const SPORT_IMAGE: Record<Sport, string> = {
  Futebol: futebolImg,
  "Ping Pong": pingpongImg,
  Ténis: tenisImg,
  Basquetebol: basquetebolImg,
  Badminton: badmintonImg,
  Voleibol: voleibolImg,
};

export function formatPrice(price: number) {
  return price === 0 ? "Grátis" : `${price}€`;
}
