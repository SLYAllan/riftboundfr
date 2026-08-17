# Tweet EN — habillage de stream, 17 août 2026

## Note de situation

1. La page vit sur `/profil/overlay`, derrière la connexion Discord. La version
   anglaise est `/en/profil/overlay`. Le lien qu'on colle dans OBS est privé :
   **ne jamais le montrer en clair dans un tweet**. La première capture affichait
   le vrai jeton d'Allan, elle a été refaite avec un jeton masqué (`xxxx…`) — si
   tu régénères l'image, masque-le à nouveau.
2. **Rien de tout ça n'est déployé au moment où j'écris.** Les cinq commits du
   17 août sont locaux. Poster ces tweets avant le déploiement promettrait des
   boutons que personne ne trouverait.
3. Visuel prêt : `images/overlay-dashboard-en.png`, 1905x2381, donc du 4:5 que X
   affiche en entier sans rogner. Les liens y disent `riftboundfrance.fr` alors que
   la capture vient du local, et les joueurs sont inventés (Astra, Vex).
4. Ce qui est vrai et vérifié dans OBS : la source navigateur en 1920x1080, la
   caméra VDO.Ninja dans le cadre, le chrono, les points, les deux affiches de
   cartes, le logo et le titre du tournoi.
5. Gratuit, pas d'installation, pas de compte tiers : c'est l'argument. Un
   compte Riftbound France suffit.

## Fil principal (5 tweets)

**1/5 — l'accroche**

> Free stream overlay for Riftbound. One browser source in OBS, and a control
> panel that updates the screen live: players, legends, champions, battlefields,
> score, timer, cards.
>
> No install, no third-party account.
> 🔗 riftboundfrance.fr

*Média : `images/overlay-dashboard-en.png`.*

**2/5 — la mise en route**

> Setup is three steps.
> 1. Copy your private overlay link.
> 2. In OBS: Sources → + → Browser, paste it, 1920x1080.
> 3. Fill the boxes. The screen follows on its own — nothing to restart.

**3/5 — les cartes**

> Paste both decklists and click a card to put it on screen. Battlefields, runes
> and the legend are dropped from the rotation on their own.
>
> One frame with both decks, or two frames side by side. Auto slideshow if you
> would rather keep your hands on the cast.

**4/5 — les détails qui comptent en direct**

> Built from actual casting problems:
> · Reload button when a VDO.Ninja camera freezes — no need to re-paste the link
> · Points and timer can be hidden without losing the score
> · Two clicks before anything that kills your OBS link
> · Works from a phone next to the mat

**5/5 — l'appel**

> It is free and it is live. If you run Riftbound events, take it and tell me what
> breaks.
>
> 🔗 riftboundfrance.fr

## Version courte (un seul tweet)

> Free Riftbound stream overlay: one OBS browser source, one control panel.
> Players, legends, champions, battlefields, score, timer, and card previews
> pulled straight from a pasted decklist.
>
> No install, no third-party account.
> 🔗 riftboundfrance.fr

*Média : la même capture.*

## Texte alternatif de l'image

> Stream overlay control panel, dark interface. Four sections: the OBS link with
> Copy and New link buttons; both players with legend, champion, battlefield,
> points, games won and a VDO.Ninja camera field; the match with format, points to
> win, round, timer; the card display with both decklists and a slideshow toggle.

## À vérifier avant de poster

- Le déploiement est passé et `/en/profil/overlay` répond en prod.
- Le lien de la capture est bien masqué : il doit se lire `overlay/xxxxxxxx…`.
- Aucune promesse de fonctionnalité absente : pas de « multi-caméra », pas de
  « thèmes », pas de « bracket » — ça n'existe pas.
