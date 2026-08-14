export function destinationConnexion(destination: string | null | undefined): string {
  if (!destination?.startsWith("/") || destination.startsWith("//")) return "/";

  try {
    const url = new URL(destination, "https://riftboundfrance.fr");
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}
