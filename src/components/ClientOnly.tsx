import { useEffect, useState, type ReactNode } from "react";

/**
 * Só renderiza os filhos depois de montar no browser. Necessário para
 * bibliotecas como o Leaflet, que acedem a `window` assim que são
 * importadas e por isso rebentam durante a renderização no servidor (SSR).
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? children : fallback;
}
