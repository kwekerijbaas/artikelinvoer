# Migratieplan — splitsing artikelinvoer-repo

Deze repo (`kwekerijbaas/artikelinvoer`) host drie afzonderlijke apps:

| Bestand | App | Toekomstige repo |
|---|---|---|
| `opzet_afname.html` + `/api` | Verkoop/planning workflow (groeit naar CRM) | `kb-verkoop-opzetafname` |
| `index.html` | Masterdata beheer Blooming Joy-artikelen | `kb-masterdata-artikelen` |
| `artikelinvoer.html` | Legacy voorloper van masterdata | `/legacy/` in masterdata-repo |

De repo-naam dekt de lading al lang niet meer — splitsing aligneert met de naming-conventie `kb-<domein>-<applicatie>` uit de inrichtingsrichtlijnen.

## Hand-off prompt voor thuis-Claude (met `gh` + `az` + org-admin)

Kopieer onderstaande prompt in een Claude-sessie op je laptop met:
- `gh` CLI ingelogd als org-admin van `kwekerijbaas`
- `az` CLI ingelogd op de Kwekerijbaas-tenant (`5026748d-0958-4629-a93b-b72015d1aa7f`)
- Een lege werkmap
- Computer/browser-use is fijn maar niet vereist; het meeste gaat via CLI

```
=== DOEL ===

Splitst de monorepo github.com/kwekerijbaas/artikelinvoer in drie schone
repos volgens naming-conventie kb-<domein>-<applicatie>:

  1. kb-verkoop-opzetafname    ← opzet_afname.html + /api SP-sync backend
  2. kb-masterdata-artikelen   ← index.html + artikelinvoer.html (/legacy)
  3. artikelinvoer             ← gearchiveerd, verwijst naar 1 en 2

=== VOORWAARDEN VOORAF (CHECK DEZE EERST) ===

1. PR #11 (SharePoint-sync backend) is gemerged naar main, draait stabiel
   op https://opzetafname.kwekerijbaas.nl.
   Niet gemerged? → STOP. Niet splitsen midden in een grote PR.

2. docs/ai-coding-guidelines.md bestaat in een template-repo of in deze
   repo. Niet aanwezig? → STOP en meld dat, dan schrijf ik die eerst.

3. gh auth status toont "Logged in" + scopes 'admin:org', 'repo', 'workflow'.

4. az account show toont tenant 5026748d-0958-4629-a93b-b72015d1aa7f.

Bij twijfel: stoppen en vragen.

=== FASE 1 — BESLISSINGEN (VRAAG, BEVESTIG) ===

Vraag mij om akkoord op:

(a) Repo-namen:
    - kb-verkoop-opzetafname
    - kb-masterdata-artikelen
    Liever andere domein-prefix?

(b) Legacy artikelinvoer.html: meeverhuizen naar kb-masterdata-artikelen
    onder /legacy/ (met "verouderd" banner), of apart archiveren?
    Voorstel: meeverhuizen.

(c) Git-history: vers starten of git filter-repo voor per-app history?
    Voorstel: vers starten — history is volledig vermengd, splitsen
    kost meer tijd dan waard. De oude repo blijft als archief staan
    voor wie wil graven.

(d) Custom domain voor masterdata-app:
    - masterdata.kwekerijbaas.nl (nieuwe SWA + DNS + Entra-redirect)
    - of: voorlopig op SWA-default-URL
    Voorstel: voorlopig default-URL — pas custom domain als er vraag is.

Stop hier. Wacht op antwoorden.

=== FASE 2 — VOORBEREIDEN IN STAGING ===

Clone artikelinvoer-repo lokaal, maak branch 'prep/splitsing':

  git clone https://github.com/kwekerijbaas/artikelinvoer
  cd artikelinvoer && git checkout -b prep/splitsing

Bouw twee staging-mappen die de nieuwe repos worden:

  staging/kb-verkoop-opzetafname/
    ├── index.html                  ← gerenamed van opzet_afname.html
    ├── api/                        ← volledig, ongewijzigd
    ├── data/agriware-artikelen-per-categorie.json
    ├── staticwebapp.config.json    ← ongewijzigd
    ├── .github/workflows/azure-static-web-apps.yml   ← ongewijzigd
    ├── README.md                   ← nieuw, verplichte secties
    ├── CLAUDE.md                   ← uit template-repo
    ├── .github/copilot-instructions.md
    ├── .github/PULL_REQUEST_TEMPLATE.md
    ├── .gitignore                  ← inclusief .env *.pem *.pfx
    ├── docs/ai-coding-guidelines.md (kopie)
    ├── docs/runbook.md             ← verplicht (app zit op mvp/prod)
    └── docs/adr/0001-splitsing-uit-artikelinvoer.md

  staging/kb-masterdata-artikelen/
    ├── index.html                  ← huidige index.html
    ├── legacy/artikelinvoer.html   ← met "verouderd" banner toegevoegd
    ├── data/agriware-artikelen-per-categorie.json (kopie)
    ├── staticwebapp.config.json    ← NIEUW (alleen Entra-auth, geen /api)
    ├── .github/workflows/azure-static-web-apps.yml   ← NIEUW, eigen secret
    ├── README.md / CLAUDE.md / copilot / PR-template / .gitignore /
        docs/ai-coding-guidelines.md / docs/runbook.md /
        docs/adr/0001-splitsing-uit-artikelinvoer.md

In docs/adr/0001 leg vast: datum, bron-commit-SHA, welke afwijkingen van
de richtlijnen blijven bestaan en waarom.

Push branch prep/splitsing. Open draft PR. Vraag mij om review.

Stop hier. Wacht op review.

=== FASE 3 — NIEUWE REPOS AANMAKEN ===

Per repo, na review-akkoord:

  gh repo create kwekerijbaas/<naam> --private \
    --description "<korte beschrijving>" --confirm

Push de inhoud uit staging/<naam>/ als initial commit op main.

Stel branch-protection op main in:
  gh api -X PUT repos/kwekerijbaas/<naam>/branches/main/protection \
    -F required_pull_request_reviews.required_approving_review_count=1 \
    -F enforce_admins=true -F allow_force_pushes=false \
    -F allow_deletions=false -F required_status_checks=null \
    -F restrictions=null

Stop na elke repo. Bevestig met mij voordat je doorgaat.

=== FASE 4 — AZURE-RESOURCES ===

kb-verkoop-opzetafname:
  Geen nieuwe resources. Hook de bestaande SWA om naar de nieuwe repo:
    az staticwebapp update \
      --name swa-opzet-afname-734-weu-prd \
      --resource-group rg-opzet-afname-734-weu-prd \
      --source https://github.com/kwekerijbaas/kb-verkoop-opzetafname \
      --branch main
  App settings (GRAPH_*, SP_*, AAD_*) blijven gelijk.
  Verifieer: https://opzetafname.kwekerijbaas.nl draait nog na repo-switch.

kb-masterdata-artikelen:
  Nieuwe SWA (Free tier — geen Functions nodig):
    az staticwebapp create \
      --name swa-masterdata-artikelen-734-weu-prd \
      --resource-group rg-opzet-afname-734-weu-prd \
      --location westeurope --sku Free \
      --source https://github.com/kwekerijbaas/kb-masterdata-artikelen \
      --branch main --login-with-github

  Entra-login: maak nieuwe App Registration "masterdata-app" (schone
  audit-trail per app). Voeg AAD_CLIENT_ID + AAD_CLIENT_SECRET toe als
  SWA app settings.

  Haal deploy-token op + zet in GitHub:
    az staticwebapp secrets list --name swa-masterdata-... \
      --query properties.apiKey -o tsv
    gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN \
      --repo kwekerijbaas/kb-masterdata-artikelen --body "<token>"

Verifieer beide URL's openen + Entra-login werkt + apps laden.

Stop hier. Bevestig met mij voor cutover.

=== FASE 5 — CUTOVER & ARCHIVEREN ===

1. Update bookmarks/communicatie naar de nieuwe app-URL's.

2. In oude artikelinvoer-repo, op een laatste branch 'archive/prep':
   - Vervang README door:
       "Deze repo is opgesplitst. Zie:
        - github.com/kwekerijbaas/kb-verkoop-opzetafname
        - github.com/kwekerijbaas/kb-masterdata-artikelen
        History blijft hier beschikbaar; geen actieve ontwikkeling meer."
   - Verwijder .github/workflows/ (geen deploys meer vanuit deze repo).
   - PR + merge.

3. Archiveer de repo:
     gh repo archive kwekerijbaas/artikelinvoer
   GEEN delete — history blijft.

=== EINDRAPPORT ===

Stuur me terug:
- Nieuwe repo-URL's
- Nieuwe app-URL's (default + eventueel custom domain)
- Welke Azure-resources nieuw aangemaakt
- Wat eventueel niet is gelukt en waarom

=== NIET DOEN ZONDER MIJN AKKOORD ===

- Geen 'gh repo delete' op artikelinvoer (alleen archive)
- Geen force-push, geen overschrijving van main op bestaande repos
- Geen wijzigingen aan opzet-afname-app Entra App Registration of haar secret
- Geen wijzigingen aan SharePoint-lists, app settings GRAPH_*/SP_*
- Geen DNS-wijzigingen op opzetafname.kwekerijbaas.nl
- Geen branch-protection-wijzigingen op andere bestaande repos
- Geen wijzigingen aan andere kwekerijbaas-org-repos
```
