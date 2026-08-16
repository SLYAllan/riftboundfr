import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "block-editor.tsx"), "utf8");

describe("noms accessibles de l’éditeur d’article", () => {
  it("relie les libellés aux champs", () => {
    const champsDynamiques = [
      "text-content-${block.id}",
      "deck-name-${block.id}",
      "deck-legend-${block.id}",
      "deck-player-${block.id}",
      "deck-context-${block.id}",
      "deck-code-${block.id}",
      "sponsor-title-${block.id}",
      "sponsor-cta-${block.id}",
      "sponsor-url-${block.id}",
      "sponsor-image-${block.id}",
      "sponsor-description-${block.id}",
      "sponsor-style-${block.id}",
      "image-src-${block.id}",
      "image-alt-${block.id}",
      "image-caption-${block.id}",
      "image-width-${block.id}",
      "tweet-author-${block.id}",
      "tweet-handle-${block.id}",
      "tweet-date-${block.id}",
      "tweet-url-${block.id}",
      "tweet-content-${block.id}",
      "tweet-avatar-${block.id}",
      "tweet-media-${block.id}",
      "tweet-media-alt-${block.id}",
      "bracket-title-${block.id}",
      "bracket-rounds-${block.id}",
    ];

    for (const champ of champsDynamiques) {
      expect(source).toContain(`htmlFor={\`${champ}\`}`);
      expect(source).toContain(`id={\`${champ}\`}`);
    }

    for (const champ of [
      "bulk-player",
      "bulk-context",
      "bulk-decklists",
      "article-title",
      "article-category",
      "article-excerpt",
      "article-cover-image",
      "article-tags",
      "article-tournament-name",
      "article-tournament-date",
      "article-tournament-location",
      "article-tournament-player-count",
    ]) {
      expect(source).toContain(`htmlFor=\"${champ}\"`);
      expect(source).toContain(`id=\"${champ}\"`);
    }
  });

  it("nomme les actions d’icône des blocs", () => {
    for (const nom of ["Dupliquer le bloc", "Monter le bloc", "Descendre le bloc", "Supprimer le bloc"]) {
      expect(source).toContain(`aria-label=\"${nom}\"`);
    }
  });
});
