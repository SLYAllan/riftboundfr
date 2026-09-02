import { NextResponse } from "next/server";

/**
 * Limiteur de débit centralisé (M3).
 *
 * En mémoire process-local : perdu au redéploiement et NON partagé entre
 * instances. Le site tourne sur un seul container Coolify → acceptable.
 * Pour du multi-instance, basculer ces buckets sur Redis/Upstash.
 *
 * Buckets nommés = fenêtres indépendantes par endpoint.
 */
const buckets = new Map<string, Map<string, number[]>>();

/**
 * IP du client, telle que le proxy nous la donne.
 *
 * `x-real-ip` est posée par Traefik/Coolify et remplace toujours celle qu'un
 * client aurait écrite. Le repli lit le DERNIER hop de `x-forwarded-for`, pas le
 * premier : un proxy AJOUTE l'adresse qu'il voit à la fin de la liste, donc le
 * premier élément est celui que le client a écrit lui-même. Le lire revenait à
 * laisser n'importe qui changer d'identité à chaque requête et passer sous
 * toutes les limites, en faisant grossir les compteurs en mémoire au passage.
 *
 * Accepte Request ou NextRequest (NextRequest hérite de Request).
 */
export function clientIp(req: Request): string {
  const transmises = req.headers.get("x-forwarded-for")?.split(",") ?? [];
  return (
    req.headers.get("x-real-ip")?.trim() ||
    transmises[transmises.length - 1]?.trim() ||
    "unknown"
  );
}

interface RateLimitOpts {
  bucket: string;
  limit?: number;
  windowMs?: number;
}

/** Retourne false si la limite est dépassée pour (bucket, IP). */
export function rateLimit(req: Request, { bucket, limit = 5, windowMs = 60_000 }: RateLimitOpts): boolean {
  const ip = clientIp(req);
  const now = Date.now();
  let store = buckets.get(bucket);
  if (!store) {
    store = new Map();
    buckets.set(bucket, store);
  }
  const hits = (store.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    store.set(ip, hits);
    return false;
  }
  hits.push(now);
  store.set(ip, hits);
  // Nettoyage opportuniste pour borner la mémoire (entrées toutes expirées).
  if (store.size > 5000) {
    for (const [k, v] of store) {
      if (v.every((t) => now - t >= windowMs)) store.delete(k);
    }
  }
  return true;
}

/** Réponse 429 standard. */
export function tooMany(message = "Trop de requêtes, réessayez dans une minute"): NextResponse {
  return NextResponse.json({ error: message }, { status: 429 });
}
