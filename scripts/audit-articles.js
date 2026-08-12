const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://postgres:postgres@127.0.0.1:5433/riftbound' } } });

async function main() {
  console.log('=== TASK 1: AUDIT ALL PUBLISHED ARTICLES ===');
  const articles = await prisma.article.findMany({
    where: { published: true },
    include: { decks: { select: { id: true, slug: true, tournamentContext: true } } },
    orderBy: { publishedAt: 'desc' }
  });

  console.log('Total published articles: ' + articles.length);

  const tournamentContexts = await prisma.deck.findMany({
    where: { tournamentContext: { not: null } },
    select: { tournamentContext: true },
    distinct: ['tournamentContext']
  });
  const tcNames = tournamentContexts.map(t => t.tournamentContext);
  console.log('Distinct tournament contexts in Deck table: ' + tcNames.length);
  tcNames.forEach(tc => console.log('  - ' + tc));
  console.log('');

  for (const a of articles) {
    const deckCount = a.decks.length;
    const matchesTournament = a.tournamentName ? tcNames.includes(a.tournamentName) : null;

    console.log('Article: ' + a.slug);
    console.log('  Category: ' + a.category);
    console.log('  tournamentName: ' + (a.tournamentName || '** MISSING **'));
    console.log('  tournamentDate: ' + (a.tournamentDate ? a.tournamentDate.toISOString().split('T')[0] : '** MISSING **'));
    console.log('  tournamentLocation: ' + (a.tournamentLocation || '** MISSING **'));
    console.log('  tournamentPlayerCount: ' + (a.tournamentPlayerCount !== null ? a.tournamentPlayerCount : '** MISSING **'));
    console.log('  Linked decks: ' + deckCount);
    if (a.tournamentName) {
      console.log('  Tournament exists in deck data: ' + (matchesTournament ? 'YES' : '** NO **'));
    }
    console.log('');
  }

  const missingTN = articles.filter(a => !a.tournamentName);
  const missingDate = articles.filter(a => !a.tournamentDate);
  const missingLoc = articles.filter(a => !a.tournamentLocation);
  const missingPC = articles.filter(a => a.tournamentPlayerCount === null);
  const noDecks = articles.filter(a => a.decks.length === 0);

  console.log('--- SUMMARY ---');
  console.log('Missing tournamentName: ' + missingTN.length + ' -> ' + JSON.stringify(missingTN.map(a => a.slug)));
  console.log('Missing tournamentDate: ' + missingDate.length + ' -> ' + JSON.stringify(missingDate.map(a => a.slug)));
  console.log('Missing tournamentLocation: ' + missingLoc.length + ' -> ' + JSON.stringify(missingLoc.map(a => a.slug)));
  console.log('Missing tournamentPlayerCount: ' + missingPC.length + ' -> ' + JSON.stringify(missingPC.map(a => a.slug)));
  console.log('No linked decks: ' + noDecks.length + ' -> ' + JSON.stringify(noDecks.map(a => a.slug)));

  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
