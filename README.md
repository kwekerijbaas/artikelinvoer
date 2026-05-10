# Kwekerijbaas — Apps

Twee onafhankelijke web-apps die naast elkaar bestaan. Beide zijn pure HTML/CSS/JS en kunnen direct in de browser worden geopend, geen server nodig.

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

## 2. Offerte- &amp; Orderinvoer (`offertes.html`) — Offerte / order workflow

Aparte app voor verkopers en planners om offertes, voorlopige orders, definitieve orders en opzetregels te beheren. Gebaseerd op tabblad **2026** uit *Opzet afname 2026.xlsx*.

### Functionaliteiten

- **Status flow**: Aanvraag (V) → In behandeling (O) → Voorlopig (B) → Definitief (A/AD/AI) → Vervallen (X)
- Voorgeladen lookup-data uit het Excel: 65 klanten, 68 eindklanten, 28 afzetlanden, 344 VRCs, 168 planningsgroepen, 149 teelten, 386 teeltspecificaties, 26 potmaten, 12 kartypes, 49 verlaaddagen
- 80 voorbeeldorder­regels uit tabblad 2026
- Ruime invoer-drawer met daginvoer Ma–Zo, prijs, fust, kar, bedrukkings-opties (karposter, kar­stickers, etiket, hoes, doos, draagbeugel)
- **Kopiëren vanuit bestaande regel** (modal-zoeker) → snel varianten toevoegen
- **Bulk-acties**: selecteer meerdere regels en switch status, dupliceer, verwijder, of download Rapid Start XML in batch
- **Inline cell-editing** op week, prijs en dagaantallen Ma–Zo
- **Per-regel Rapid Start XML download** voor import in Microsoft Business Central / Agriware (configuratie-pakket-formaat — schema is benadering, valideer met je BC-omgeving)
- **VRC-koppeling**: vrij invulbaar veld met datalist van bestaande VRC-codes — directe link met ERP
- Filteren op status, klant, productgroep, verkoper, week-range, vrije zoektekst
- Excel-, CSV- en JSON-export

## Gebruik

Open `index.html` of `offertes.html` in een browser. Geen server of installatie nodig.

## Hosting via GitHub Pages

1. Push dit repository naar GitHub
2. Ga naar **Settings > Pages > Source: main branch**
3. Site is live op `https://<gebruikersnaam>.github.io/kwekerijbaas-artikelinvoer/`

## Kwekerijbaas

Drietorensweg / Enserweg — Blooming Joy productlijnen
