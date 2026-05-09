# Kwekerijbaas — Artikelinvoer

Masterdata beheertool voor Blooming Joy verkoopartikelen.

## Functionaliteiten

- Invoerformulier met live preview van Naam uitgeschreven, Stickernaam en Artikelnr
- 347 bestaande artikelen voorgeladen (Family, Friends, Solo)
- Dropdowns gevuld vanuit Agriware stamdata (geslachten, kleuren, potcodes, eenheden, etc.)
- Nieuwe referentiewaarden toevoegen via + knop (thema, soort, typekleur, potmaat)
- Artikelen bewerken en verwijderen
- Sorteerbare kolommen en filters (zoekbalk + combinatietype)
- CSV-export voor Agriware-import
- JSON backup/import voor persistentie

## Gebruik

Open `index.html` in een browser. Geen server of installatie nodig.

## Orderinvoer voor Microsoft Business Central

`orderinvoer.html` is een losstaande module voor verkooporderinvoer met export naar
Microsoft BC. Functionaliteit:

- Klantenbeheer (klantnr, naam, adres, postcode, plaats, landcode)
- Orderkop: ordernr, klant, orderdatum, boekingsdatum, leverdatum
- Optioneel afwijkend leveringsadres (Ship-to)
- Orderregels: artikel, omschrijving, aantal, eenheid, stukprijs, regelbedrag
- Artikellijst importeren via JSON-export uit Artikelinvoer (autocomplete op artikelnr)
- Export naar **RapidStart Configuration Package XML** (tabellen Sales Header / Sales Line, Document Type = Order)
- JSON backup/import voor orders en klanten

### Importeren in Business Central

1. In BC: open **Configuration Packages** → **New** → vul Code en Package Name
2. Voeg tabellen toe: 36 Sales Header en 37 Sales Line
3. **Import Package** → kies de geëxporteerde XML
4. **Apply Package** om de orders te plaatsen

## Hosting via GitHub Pages

1. Push dit repository naar GitHub
2. Ga naar **Settings > Pages > Source: main branch**
3. Site is live op `https://<gebruikersnaam>.github.io/kwekerijbaas-artikelinvoer/`

## Kwekerijbaas

Drietorensweg / Enserweg — Blooming Joy productlijnen
