// Remplace le tiret cadratin (—, "tiret IA") par un tiret simple (-) dans tout le
// contenu rédactionnel des articles (titre, extrait, blocs). Les decklists ne portent
// ici que des LABELS ("Champion, Titre — Best of X", "1st — RQ ... (Domaines)"), jamais
// de pseudo joueur (vérifié) : le remplacement est sûr.
//
// IMPORTANT : on écrit en SQL brut (pas via l'ORM) pour NE PAS déclencher le
// @updatedAt de Prisma. Aucune date (createdAt / publishedAt / updatedAt) n'est touchée.
//
// Usage local : npx tsx scripts/fix-emdash-articles.mts
//   prod  : DATABASE_URL="postgresql://...:15432/..." npx tsx scripts/fix-emdash-articles.mts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function clean(node: any): { value: any; n: number } {
  let n = 0;
  const rec = (v: any): any => {
    if (typeof v === "string") {
      const c = (v.match(/—/g) || []).length;
      if (c) { n += c; return v.replace(/—/g, "-"); }
      return v;
    }
    if (Array.isArray(v)) return v.map(rec);
    if (v && typeof v === "object") {
      const o: any = {};
      for (const k of Object.keys(v)) o[k] = rec(v[k]);
      return o;
    }
    return v;
  };
  return { value: rec(node), n };
}

const arts = await prisma.article.findMany({ select: { id: true, slug: true, title: true, excerpt: true, blocks: true } });
let changedArticles = 0;
let totalRepl = 0;
for (const a of arts) {
  const t = clean(a.title ?? "");
  const e = a.excerpt == null ? { value: null, n: 0 } : clean(a.excerpt);
  const b = clean(a.blocks);
  const n = t.n + e.n + b.n;
  if (!n) continue;
  await prisma.$executeRaw`
    UPDATE "Article"
    SET title = ${t.value}, excerpt = ${e.value}, blocks = ${JSON.stringify(b.value)}::jsonb
    WHERE id = ${a.id}`;
  changedArticles++;
  totalRepl += n;
  console.log(`  ${a.slug}: ${n}`);
}
console.log(`\nArticles modifiés : ${changedArticles}/${arts.length} - remplacements : ${totalRepl} (dates préservées)`);
await prisma.$disconnect();
