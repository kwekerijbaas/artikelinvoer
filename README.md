# Kwekerijbaas — Apps

Drie web-apps in deze repo. Beide eerste zijn pure HTML/CSS/JS en kunnen direct in de browser worden geopend. De derde (`opzet_afname.html`) draait in productie op Azure Static Web Apps achter Entra ID-login.

## 1. Artikelinvoer (`index.html`) — Masterdata

Masterdata beheertool voor Blooming Joy verkoopartikelen.

### Functionaliteiten

- Invoerformulier met live preview van Naam uitgeschreven, Stickernaam en Artikelnr
- 347 bestaande artikelen voorgeladen (Family, Friends, Solo)
- Dropdowns gevuld vanuit Agriware stamdata (geslachten, kleuren, potcodes, eenheden, etc.)
- Nieuwe referentiewaarden toevoegen via + knop (thema, soort, typekleur, potmaat)
- **Inline cell-editing**: klik een cel om direct te bewerken
- **Teelt + Teeltomschrijving** met lookup-lijsten uit Opzet afname 2026 (vrije tekst toegestaan)
- Artikelen bewerken en verwijderen
- Sorteerbare kolommen en filters (zoekbalk + combinatietype)
- CSV-export voor Agriware-import
- JSON backup/import voor persistentie

## 2. Opzet/afname (`opzet_afname.html`) — Verkoop / planning workflow

Hoofd-app voor verkopers en planners om offertes, voorlopige orders, definitieve orders en opzetregels te beheren. Gebaseerd op tabblad **2026** uit *Opzet afname 2026.xlsx*. Op den duur uit te bouwen tot volledig CRM (offertes versturen, klantbeheer, deal-pipeline).

### Functionaliteiten

- **Status flow**: Aanvraag (V) → In behandeling (O) → Voorlopig (B) → Definitief (A/AD/AI) → Vervallen (X)
- Voorgeladen lookup-data uit het Excel: 65 klanten, 68 eindklanten, 28 afzetlanden, 344 VRCs, 168 planningsgroepen, 149 teelten, 386 teeltspecificaties, 26 potmaten, 12 kartypes
- 134 traycodes (uit STAM.fust) bundled als default-lookup voor Tray-veld
- **Agriware-lijsten import** (centraal modaal): vervang klanten / eindklanten / trays / masterdata-artikelen met verse exports uit Agriware (CSV/JSON/XLSX). LocalStorage-persistentie.
- **Verpakking algemeen** sectie: type verpakking, kleur, EAN, plantenpaspoort, verkoopprijs consument, sealen, mix-type, min. contract %, ladingdrager
- **11 bedrukkings-opties** als uitklapbare kaarten: karposter, sticker (pot/hoes), karsticker, etiket, hoes, doos, tray (met traycode-lookup), inlegtray, TGW, draagbeugel, overpakken — elk met eigen 'wie regelt layout / productie / betaald' (Baas / Klant / Derde)
- Ruime invoer-drawer met geplande aantallen, prijs, fust, kar (Ma–Zo verdeling wordt elders bijgehouden voor PowerBI-koppeling)
- **Kopiëren vanuit bestaande regel** (modal-zoeker) → snel varianten toevoegen
- **Bulk-acties**: selecteer meerdere regels en switch status, dupliceer, verwijder, of download Rapid Start XML in batch
- **Inline cell-editing** op week, prijs en geplande aantallen
- **Dashboard-tab** met 4 KPI's (orderregels, geplande aantallen, geplande omzet, unieke klanten) en 3 grafieken (aantallen per week, top 10 klanten op omzet, verdeling per productgroep)
- **Sorteerbare kolommen** met visuele indicator (▲/▼) en lichte ↕-hint op klikbare headers
- **Per-regel Rapid Start XML download** voor import in Business Central (schema benadering — werk samen met BC-team uit voor productie)
- Filteren op status, klant, productgroep, verkoper, jaar, week-range, vrije zoektekst
- VRC-groepering, jaar-overzetten, auto-rollover, klantvragen-import
- Excel-, CSV- en JSON-export
- Image-preview in master-picker

## 3. Legacy: `artikelinvoer.html`

Voorloper van `index.html`. Wordt door SWA serveerd onder `/artikelinvoer.html`.

## Lokaal gebruik

Open `index.html` of `opzet_afname.html` in een browser. Geen server of installatie nodig.

## Hosting in Azure (productie)

`opzet_afname.html` draait op **Azure Static Web Apps** (Standard tier, ~€9/maand) met Microsoft Entra ID-authenticatie (alleen `@kwekerijbaas.nl`-accounts).

### Azure-resources

- **Resource Group**: `rg-opzet-afname-754-msw-prd` (West Europe)
- **Static Web App**: `swa-opzet-afname-754-msw-prd`
- **Default URL**: `https://yellow-meadow-04b0a3c80.7.azurestaticapps.net`
- **Custom domain (na DNS)**: `https://opzetafname.kwekerijbaas.nl`
- **Entra App Registration**: `opzet-afname-app` (single-tenant)

### Deploy-flow

Push naar `main` → workflow `.github/workflows/azure-static-web-apps.yml` deployt automatisch via deployment token in GitHub Secrets (`AZURE_STATIC_WEB_APPS_API_TOKEN`). PR's krijgen automatisch een preview-environment URL.

### Routing

`staticwebapp.config.json` zorgt voor:
- `/` → rewrite naar `/opzet_afname.html`
- Alle routes vereisen `authenticated` rol (Entra ID-login)
- 401 → redirect naar `/.auth/login/aad`
- Andere identity providers (GitHub, Twitter) uitgezet

### Custom domain instellen (eenmalig, zodra DNS klaar is)

1. CNAME zetten bij DNS-provider:
   ```
   Type:    CNAME
   Naam:    opzetafname
   Waarde:  yellow-meadow-04b0a3c80.7.azurestaticapps.net
   TTL:     3600
   ```
2. In Azure:
   ```bash
   az staticwebapp hostname set \
     --name swa-opzet-afname-754-msw-prd \
     --resource-group rg-opzet-afname-754-msw-prd \
     --hostname opzetafname.kwekerijbaas.nl
   ```
3. Redirect-URI uitbreiden in Entra App Registration:
   ```bash
   az ad app update --id <ENTRA_CLIENT_ID> \
     --web-redirect-uris \
     "https://yellow-meadow-04b0a3c80.7.azurestaticapps.net/.auth/login/aad/callback" \
     "https://opzetafname.kwekerijbaas.nl/.auth/login/aad/callback"
   ```

### Admin-consent op Entra App Registration

Bij eerste gebruik (of na het toevoegen van extra API-permissies) moet een Azure-tenant-admin éénmalig admin-consent geven. Zonder deze stap krijgen niet-admin gebruikers een "Need admin approval"-prompt en lukt de login niet.

**Vereiste rol**: Global Administrator, Cloud Application Administrator, of Application Administrator.

1. Azure Portal → **Entra ID** → **App registrations** → zoek `opzet-afname-app` (of de Application (client) ID die als `AAD_CLIENT_ID` in de SWA-configuratie staat).
2. Open de app → **API permissions** in het linkermenu.
3. Klik bovenaan op **"Grant admin consent for [tenantnaam]"** en bevestig.
4. Onder *Status* moeten alle permissies (minimaal `User.Read`) een groen vinkje krijgen.

**Optioneel — toegang beperken tot specifieke gebruikers/groepen**:

1. Entra ID → **Enterprise applications** → dezelfde app openen.
2. *Properties* → **Assignment required? = Yes**.
3. *Users and groups* → voeg de juiste personen of een groep toe.

**Verifiëren**: open een incognito-tab op `https://opzetafname.kwekerijbaas.nl`, log in als niet-admin testgebruiker — de consent-prompt moet weg zijn en de gebruiker landt direct op `opzet_afname.html`.

### Backend setup (eenmalig) — SharePoint-sync via Azure Functions

De app schrijft elke kar via `/api/karren/save` (managed Function in dezelfde SWA) naar twee SharePoint Lists, en leest via `/api/karren/list` terug voor multi-user. Authenticatie loopt via SWA's ingebouwde Entra-ID; identiteit wordt server-side gestempeld in `updated_by` — geen handmatige naam/email-invoer.

**Vooraf**: zorg dat de twee SharePoint Lists `Opzet_Afname` en `Opzet_Afname_Componenten` op de gedeelde site bestaan (zelfde structuur als in de oude Power Automate setup). Beide lists hebben naast `Title` een eigen kolom `kar_id`. Componenten-list heeft daarnaast `comp_idx`.

**Eénmalige setup in Cloud Shell** (`https://shell.azure.com` → Bash):

```bash
# === variabelen ===
RG="rg-opzet-afname-754-msw-prd"
SWA="swa-opzet-afname-754-msw-prd"
TENANT_ID="5026748d-0958-4629-a93b-b72015d1aa7f"
APP_DISPLAY_NAME="opzet-afname-sp-sync"
SP_SITE_HOST="kwekerijabaas.sharepoint.com"     # tenant-URL (let op: kwekerijabaas met extra 'a')
SP_SITE_PATH="/sites/opzetafname"               # site waar Opzet_Afname-lists op staan
LIST_KARREN="Opzet_Afname"
LIST_COMPONENTEN="Opzet_Afname_Componenten"

# === 1. App Registration met client secret ===
APP_JSON=$(az ad app create --display-name "$APP_DISPLAY_NAME" --sign-in-audience AzureADMyOrg)
APP_ID=$(echo "$APP_JSON" | jq -r '.appId')
az ad sp create --id "$APP_ID" >/dev/null
SECRET_JSON=$(az ad app credential reset --id "$APP_ID" --display-name "swa-functions" --years 2)
CLIENT_SECRET=$(echo "$SECRET_JSON" | jq -r '.password')

# === 2. Graph application-permission: Sites.Selected (least privilege) ===
# Permission ID is constant binnen Microsoft Graph (00000003-0000-0000-c000-000000000000)
GRAPH_APP="00000003-0000-0000-c000-000000000000"
SITES_SELECTED_ROLE_ID="883ea226-0bf2-4a8f-9f9d-92c9162a727d"  # Sites.Selected (Application)
az ad app permission add --id "$APP_ID" \
  --api "$GRAPH_APP" \
  --api-permissions "${SITES_SELECTED_ROLE_ID}=Role"
az ad app permission admin-consent --id "$APP_ID"

# === 3. SP-site GUIDs ophalen + grant op de site (admin consent required) ===
SITE_RESP=$(az rest --method GET \
  --uri "https://graph.microsoft.com/v1.0/sites/${SP_SITE_HOST}:${SP_SITE_PATH}")
SITE_ID=$(echo "$SITE_RESP" | jq -r '.id')
echo "SITE_ID: $SITE_ID"

# Grant deze app write-toegang op specifiek deze site (Sites.Selected vereist explicit grant)
az rest --method POST \
  --uri "https://graph.microsoft.com/v1.0/sites/${SITE_ID}/permissions" \
  --headers "Content-Type=application/json" \
  --body "{\"roles\":[\"write\"],\"grantedToIdentities\":[{\"application\":{\"id\":\"${APP_ID}\",\"displayName\":\"${APP_DISPLAY_NAME}\"}}]}"

# === 4. List-IDs ophalen ===
LIST_KARREN_ID=$(az rest --method GET \
  --uri "https://graph.microsoft.com/v1.0/sites/${SITE_ID}/lists?\$filter=displayName eq '${LIST_KARREN}'" \
  | jq -r '.value[0].id')
LIST_COMP_ID=$(az rest --method GET \
  --uri "https://graph.microsoft.com/v1.0/sites/${SITE_ID}/lists?\$filter=displayName eq '${LIST_COMPONENTEN}'" \
  | jq -r '.value[0].id')
echo "LIST_KARREN_ID: $LIST_KARREN_ID"
echo "LIST_COMP_ID:   $LIST_COMP_ID"

# === 5. App settings op de SWA zetten (worden door /api Functions gelezen) ===
az staticwebapp appsettings set \
  --name "$SWA" --resource-group "$RG" \
  --setting-names \
    GRAPH_TENANT_ID="$TENANT_ID" \
    GRAPH_CLIENT_ID="$APP_ID" \
    GRAPH_CLIENT_SECRET="$CLIENT_SECRET" \
    SP_SITE_ID="$SITE_ID" \
    SP_LIST_KARREN_ID="$LIST_KARREN_ID" \
    SP_LIST_COMPONENTEN_ID="$LIST_COMP_ID"

echo "✅ Klaar — push naar main, dan deployt de workflow de /api functions automatisch."
```

**Wat het script doet:**
1. Maakt een aparte App Registration (los van de SWA-login-app) speciaal voor SharePoint-access
2. Genereert een client secret met geldigheid 2 jaar
3. Vraagt Microsoft Graph `Sites.Selected` permission aan + admin-consent (least privilege — geen toegang tot andere SP-sites)
4. Grant deze App schrijftoegang op specifiek de juiste SharePoint-site
5. Haalt site-ID en list-IDs op via Graph
6. Zet 6 app settings op de SWA: tenant/client/secret + site/list-IDs

**Vereiste rol**: Global Administrator of Application Administrator (voor admin-consent en site-grant).

**Secret-rotatie**: na 2 jaar verloopt het secret. Herhaal stap 1 (`credential reset`) + stap 5 om alleen `GRAPH_CLIENT_SECRET` te vervangen.

#### Hand-off prompt voor een Claude met browser/computer-use

Kopieer onderstaande prompt in een Claude-sessie die je eigen browser kan besturen (computer-use of Playwright-MCP). De prompt schetst eerst het bredere plan zodat de agent snapt waarom hij dit doet en welke vervolgstappen er aankomen, en geeft daarna de concrete acties van vandaag.

```
=== CONTEXT ===

Repo: github.com/kwekerijbaas/artikelinvoer (branch claude/fix-code-session-aAOlQ → PR #11)
Productie-app: https://opzetafname.kwekerijbaas.nl
Een verkoop/planning-app voor Kwekerijbaas, draait als Static Web App op
Azure met Entra-ID-login. Op dit moment slaat de app alles in localStorage
op — werkt prima single-user, maar verkoper/planner/inkoper kunnen elkaars
wijzigingen niet zien.

=== EINDPLAATJE (waar we naartoe werken) ===

De app groeit door naar een licht CRM/planning-systeem. De backend-keuze
gaat in twee fases:

  FASE A — NU: SharePoint Lists als opslag
    Waarom: bestaat al, gratis bij M365, PowerBI kan er direct uit lezen,
    geen DB-onderhoud, multi-user via Graph API. Goed genoeg voor ~paar
    duizend regels en de huidige use-case.
    Beperkingen waar we mee kunnen leven: ~5000 items per view zonder
    indexing, geen relationele queries, Graph API ~200-500ms per call,
    geen transacties (last-write-wins op updated_at — al ingebouwd).

  FASE B — LATER (waarschijnlijk 6-12 maanden): Azure SQL Serverless of
    Cosmos DB als de data-omvang of feature-set groeit (offertes versturen,
    klant-pipeline, contact-history). De /api Functions blijven dan dezelfde
    HTTP-contracten serveren (POST /api/karren/save, GET /api/karren/list),
    alleen de implementatie wisselt van Graph-naar-SP → SQL/Cosmos. De
    frontend hoeft dan niks aan te passen. Dat is precies waarom we nu al
    via een /api gateway gaan en niet direct vanuit de browser naar
    SharePoint praten.

=== WAT AL KLAAR STAAT (in de repo, gepusht op branch) ===

- /api/karren-list  → GET, leest beide SP-lists via Graph
- /api/karren-save  → POST, upsert kar + replace componenten, stempelt
                     updated_by uit SWA x-ms-client-principal
- /api/shared/graph.js → Graph helper (client-credentials, token-cache)
- staticwebapp.config.json → /api/* vereist Entra-login
- Workflow → api_location: "api", deployt Functions mee
- Frontend → sync-modal opgeschoond (geen webhook-URLs, geen handmatige
  naam/email meer), gebruikt /api/karren/{save,list}
- README → deze setup-bundel + Cloud Shell-script
- SharePoint Lists bestaan al: Opzet_Afname + Opzet_Afname_Componenten
  op https://kwekerijabaas.sharepoint.com/sites/opzetafname

=== WAT JIJ NU MOET DOEN (Fase A activeren) ===

Stap 0 (verificatie — vóór alles):
  Open https://shell.azure.com (browser is ingelogd op de Azure-tenant).
  Als Cloud Shell om een storage-account vraagt: "Create storage" → default
  opties.
  Run dan:
      az staticwebapp list -o table
  Noteer de exacte Name + ResourceGroup-kolom voor de opzet-afname SWA.
  Mijn README heeft RG="rg-opzet-afname-754-msw-prd" en
  SWA="swa-opzet-afname-754-msw-prd" maar dat zijn placeholders die niet
  meer kloppen — vervang ze door wat az teruggeeft.

Stap 1 (script draaien):
  Open in een nieuw tabblad de README van de repo, sectie
  "Backend setup (eenmalig)" → kopieer het bash-blok (start bij `RG=`).
  Pas RG en SWA aan naar de waardes uit stap 0. SP_SITE_HOST en
  SP_SITE_PATH staan al goed ingevuld (kwekerijabaas.sharepoint.com /
  /sites/opzetafname — let op de extra 'a' in tenant-naam).
  Plak en run het hele blok.

Stap 2 (verifiëren):
  Open https://opzetafname.kwekerijbaas.nl, log in.
  Klik op het Sync-bolletje rechtsboven → "Sync ingeschakeld" aan →
  "Opslaan" → "Nu ophalen". Er moet een toast komen met aantal karren +
  componenten. Als de lists nog leeg zijn → 0 / 0 is OK, betekent
  alleen dat de Graph-call werkt.
  Daarna één testregel maken/opslaan → "Nu ophalen" → de regel moet
  verschijnen na refresh.

Stap 3 (rapporteren):
  Stuur me terug:
    - De juiste RG- en SWA-namen (voor README-update)
    - $SITE_ID, $LIST_KARREN_ID, $LIST_COMP_ID uit het script
    - Of `az staticwebapp appsettings set` zonder errors liep
    - Bevestiging dat de "Nu ophalen"-toast verschijnt in de app
    - Eventuele blockers (typisch: permission admin-consent of de
      sites/{id}/permissions POST hebben Application Administrator rol
      nodig — meld dat als 't faalt, dan vraag ik IT)

NIET NU doen:
  - Geen database aanmaken — fase B is voor later
  - Geen wijzigingen aan de SWA-login App Registration (die heet
    "opzet-afname-app", werkt al). Het script maakt een aparte
    Registration ("opzet-afname-sp-sync") speciaal voor Graph-toegang.
  - Geen branch mergen naar main vanuit jouw kant; ik review en merge.
```


### Toekomstige uitbreidingen (architectuur)

De gekozen SWA Standard tier ondersteunt een groei-pad naar CRM. De stap naar fase B (database) hoeft het frontend-contract niet te raken: zelfde `/api/karren/{save,list}`-endpoints, andere implementatie eronder.

- **Azure SQL Serverless** of **Cosmos DB** voor persistente data (regels, klanten, offertes, contacten)
- **Azure Blob Storage** voor offerte-PDF's en attachments
- **Microsoft Graph API** voor email-versturen via bestaande M365

## Kwekerijbaas

Drietorensweg / Enserweg — Blooming Joy productlijnen
