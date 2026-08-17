# Tweet EN — habillage de stream, 17 août 2026

## Note de situation

1. La page vit sur `/profil/overlay`, derrière la connexion Discord. La version
   anglaise est `/en/profil/overlay`. Le lien qu'on colle dans OBS est privé :
   **ne jamais le montrer en clair dans un tweet**. La première capture affichait
   le vrai jeton d'Allan, elle a été refaite avec un jeton masqué (`xxxx…`) — si
   tu régénères l'image, masque-le à nouveau.
2. **Déployé et vérifié en prod le 17 août.** Le site répond, la tier list et les
   quatre tournois chinois sont en ligne. Rien n'empêche plus de poster.
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

## Version longue (un seul post, abonnement X)

Texte brut, sans chevrons : à copier tel quel. Ton posé, sans se donner le beau
rôle. Chaque phrase correspond à une case réelle du tableau de bord.
Média : la même capture.

---

Made a free stream overlay for Riftbound. It is on riftboundfrance.fr, take it if
you want it.

Started it for our own French streams. Building one from scratch is an afternoon
in OBS nudging text boxes around, and I would rather see more locals streamed
than have everyone redo that afternoon.

One browser source in OBS, one control panel open on a second screen or your
phone. You type a name, it shows up on stream. Nothing to install, no plugin, no
account anywhere else.

Setup takes about a minute: sign in, copy your private link, drop it in OBS as a
Browser source at 1920x1080. Keep that link to yourself, anyone who has it can
watch your overlay. One button retires it and gives you a fresh one.

What you can put on screen:

Both players with their legend, champion and battlefield. Pick the legend first
and the champion list narrows down to the ones that go with it.

Points and games won, on buttons that stop at the score ending the match. And a
swap for when the two of them change seats.

Cameras through VDO.Ninja, muted from the start. If one freezes mid-game, you
reload that frame alone. No camera? A still image does the job.

A timer you start, pause and reset. Timer and points can be taken off screen for
a minute and come back exactly as they were.

Card previews from a pasted decklist. Paste both lists, battlefields and runes
drop out of the rotation on their own, then click a card to show it or let the
slideshow run while you keep talking. Both decks in one frame, or one frame each.

Tournament name and logo on top.

Nothing that would kill your OBS link happens on a single click, and the whole
panel works from a phone sitting next to the mat.

If it saves you an afternoon, it did its job. It is early, so tell me what
breaks.

🔗 riftboundfrance.fr

---

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
