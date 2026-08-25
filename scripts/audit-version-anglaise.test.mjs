import { createServer } from "node:http";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { phrasesFrancaises, texteVisible } from "./audit-version-anglaise.mjs";

let serveur;
let base;

beforeAll(async () => {
  serveur = createServer((requete, reponse) => {
    if (requete.url === "/en/francais") {
      reponse.end("<p>Nous classons les Légendes à partir des résultats de tournois publics.</p>");
      return;
    }
    if (requete.url === "/en/erreur") {
      reponse.writeHead(500).end("Erreur");
      return;
    }
    reponse.end("<p>We rank Legends using public tournament results.</p>");
  }).listen(0, "127.0.0.1");
  await once(serveur, "listening");
  base = `http://127.0.0.1:${serveur.address().port}`;
});

afterAll(() => serveur.close());

function lanceAudit(route, url = base) {
  return new Promise((resolve, reject) => {
    const argumentsAudit = ["scripts/audit-version-anglaise.mjs"];
    if (route) argumentsAudit.push(route);
    const processus = spawn(process.execPath, argumentsAudit, {
      cwd: process.cwd(),
      env: { ...process.env, BASE: url },
    });
    let sortie = "";
    processus.stdout.on("data", (donnees) => { sortie += donnees; });
    processus.on("error", reject);
    processus.on("close", (code) => resolve({ code, sortie }));
  });
}

describe("audit de la version anglaise", () => {
  it("repère une phrase française et écarte une phrase anglaise", () => {
    expect(phrasesFrancaises(texteVisible("<p>Nous classons les Légendes à partir des résultats de tournois publics.</p>")))
      .toEqual(["Nous classons les Légendes à partir des résultats de tournois publics."]);
    expect(phrasesFrancaises("We rank Legends using public tournament results.")).toEqual([]);
  });

  it("reste vert quand une page anglaise ne contient pas de français", async () => {
    const resultat = await lanceAudit("/anglais");

    expect(resultat.code).toBe(0);
    expect(resultat.sortie).toContain("0 phrase(s) en français");
  });

  it("audite les listes principales sans route explicite", async () => {
    const resultat = await lanceAudit(undefined);

    expect(resultat.code).toBe(0);
    expect(resultat.sortie).toContain("=== /cartes");
    expect(resultat.sortie).toContain("=== /decks");
    expect(resultat.sortie).toContain("=== /articles");
    expect(resultat.sortie).toContain("=== /decks?cat=community");
  });

  it("échoue quand une page anglaise contient du français", async () => {
    const resultat = await lanceAudit("/francais");

    expect(resultat.code).toBe(1);
    expect(resultat.sortie).toContain("1 phrase(s) en français");
  });

  it("échoue quand la page renvoie une erreur HTTP", async () => {
    const resultat = await lanceAudit("/erreur");

    expect(resultat.code).toBe(1);
    expect(resultat.sortie).toContain("HTTP 500");
  });

  it("échoue quand la page ne répond pas", async () => {
    const resultat = await lanceAudit("/indisponible", "http://127.0.0.1:1");

    expect(resultat.code).toBe(1);
    expect(resultat.sortie).toContain("ERREUR");
  });
});
