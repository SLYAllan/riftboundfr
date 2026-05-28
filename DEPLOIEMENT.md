# Deploiement Riftbound France (Coolify)

Serveur : Hetzner CX23 (178.104.237.33) — partage avec Hearthdoku.
Coolify gere le build, le deploy, le SSL et le reverse proxy.

---

## Etape 1 : Creer le repo GitHub

Sur ton PC local :

```bash
cd C:\Users\Allan\Documents\Claude\RiftboundFr
git add -A
git commit -m "Initial commit"
```

Sur GitHub : creer un repo prive (ex: `riftboundfr`), puis :

```bash
git remote add origin git@github.com:TON-USERNAME/riftboundfr.git
git branch -M main
git push -u origin main
```

---

## Etape 2 : Configurer le DNS

Chez ton registrar, ajouter ces enregistrements A vers `178.104.237.33` :

```
A    riftboundfrance.fr      → 178.104.237.33
A    www.riftboundfrance.fr  → 178.104.237.33
```

Attendre la propagation (~5 min a 1h).

---

## Etape 3 : Ajouter le projet dans Coolify

1. Ouvrir Coolify (https://178.104.237.33:8000 ou ton URL Coolify)
2. **Projects** → **Add New Project** → nommer "Riftbound France"
3. Creer un **Environment** (ex: "production")

### 3a. Ajouter la base de donnees PostgreSQL

1. Dans l'environment → **New Resource** → **Database** → **PostgreSQL**
2. Configurer :
   - Name: `riftbound-db`
   - Postgres User: `riftbound`
   - Postgres Password: generer un mot de passe fort
   - Postgres Database: `riftbound`
3. **Start** la database
4. Noter l'**Internal URL** (ressemble a `postgresql://riftbound:PASSWORD@riftbound-db:5432/riftbound`)

### 3b. Ajouter l'application Next.js

1. Dans l'environment → **New Resource** → **Application**
2. Source : **GitHub** → selectionner le repo `riftboundfr`
3. Branch : `main`
4. Build Pack : **Dockerfile** (il va detecter le Dockerfile existant)
5. Configurer :
   - **Domains** : `https://riftboundfrance.fr,https://www.riftboundfrance.fr`
   - **Port** : `3000`
   - Cocher **Auto Deploy** pour deployer a chaque push

---

## Etape 4 : Variables d'environnement

Dans Coolify, onglet **Environment Variables** de l'app, ajouter :

```
DATABASE_URL=postgresql://riftbound:MOT_DE_PASSE@riftbound-db:5432/riftbound
SESSION_SECRET=GENERER_AVEC_openssl_rand_-hex_32
ADMIN_PASSWORD=ton-mot-de-passe-admin
DISCORD_CLIENT_ID=ton-client-id
DISCORD_CLIENT_SECRET=ton-client-secret
NEXT_PUBLIC_SITE_URL=https://riftboundfrance.fr
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Pour generer le SESSION_SECRET, dans un terminal :
```bash
openssl rand -hex 32
```

> **Important** : `DATABASE_URL` doit utiliser le hostname interne Docker de la DB Coolify, pas `localhost`. Coolify affiche cette URL dans les details de la resource PostgreSQL.

---

## Etape 5 : Configurer Discord OAuth

1. https://discord.com/developers/applications
2. Selectionner ou creer ton application
3. **OAuth2** → **Redirects** → Ajouter :
   ```
   https://riftboundfrance.fr/api/auth/discord/callback
   ```
4. Copier Client ID et Client Secret dans les env vars Coolify

---

## Etape 6 : Premier deploy

1. Dans Coolify, cliquer **Deploy** sur l'app
2. Attendre le build (~3-5 min la premiere fois)
3. Une fois deploye, initialiser la DB :
   - Dans Coolify → app → **Terminal** (ou via SSH sur le serveur)
   ```bash
   npx prisma db push
   ```

---

## Etape 7 : Importer les donnees

### Option A : Sync depuis l'admin
Aller sur https://riftboundfrance.fr/admin → **Synchronisation Riftcodex**

### Option B : Importer le dump de ta DB locale
```bash
# Sur ton PC — exporter depuis le container Docker local
docker exec riftbound-db pg_dump -U postgres riftbound > dump.sql

# Copier vers le serveur
scp dump.sql root@178.104.237.33:~/

# Sur le serveur — trouver le container PostgreSQL de Coolify
docker ps | grep postgres  # noter le CONTAINER_ID

# Importer
docker exec -i CONTAINER_ID psql -U riftbound riftbound < ~/dump.sql
```

---

## Workflow quotidien

```bash
# Sur ton PC, apres avoir fait des modifs avec Claude
git add -A
git commit -m "description des changements"
git push
```

C'est tout. Coolify detecte le push et rebuild automatiquement (~2-3 min).

Tu peux suivre le build en temps reel dans Coolify → app → **Deployments**.

---

## Redirect www

Coolify gere le redirect www → apex automatiquement si tu mets les deux domaines dans la config :
```
https://riftboundfrance.fr,https://www.riftboundfrance.fr
```

Si ca ne redirige pas automatiquement, ajouter dans le middleware Next.js ou configurer dans les labels Traefik via Coolify.

---

## Backups

### Via Coolify (recommande)
Coolify a un systeme de backup integre :
1. Aller dans la resource PostgreSQL
2. Onglet **Backups**
3. Configurer un backup automatique (ex: tous les jours a 3h)
4. Optionnel : configurer un S3-compatible storage (Hetzner Object Storage ~1€/mois)

### Via cron (alternative)
```bash
# Sur le serveur
crontab -e

# Ajouter (remplacer CONTAINER_ID)
0 3 * * * docker exec CONTAINER_ID pg_dump -U riftbound riftbound | gzip > /root/backups/riftbound-$(date +\%Y\%m\%d).sql.gz
```

---

## Commandes utiles

```bash
# Voir les logs de l'app (via Coolify UI ou SSH)
docker logs CONTAINER_ID -f --tail 50

# Acceder a la DB
docker exec -it CONTAINER_ID psql -U riftbound riftbound

# Prisma migrations apres changement de schema
# Dans Coolify → app → Terminal
npx prisma db push

# Lister les containers
docker ps
```

---

## Checklist avant mise en ligne

- [ ] Repo GitHub cree et code pushe
- [ ] DNS A records configures (apex + www)
- [ ] PostgreSQL cree dans Coolify
- [ ] App ajoutee dans Coolify avec le bon Dockerfile
- [ ] Toutes les env vars configurees
- [ ] Discord OAuth redirect URI configure
- [ ] Premier deploy reussi
- [ ] `prisma db push` execute
- [ ] Cartes synchronisees (admin ou dump importe)
- [ ] Test : page d'accueil charge en HTTPS
- [ ] Test : login Discord fonctionne
- [ ] Test : deckbuilder fonctionne
- [ ] Test : publication d'un deck fonctionne
- [ ] Backup DB configure
- [ ] ADMIN_PASSWORD est un vrai mot de passe (pas "changeme")
