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

`orderinvoer.html` is een losstaande module voor verkooporderinvoer; layout en
veldnamen volgen de Kwekerijbaas BC verkooporder.

### Orderkop (3 kolommen, conform BC layout)

- **Klant** — Klantnr., Klantnaam, Contactpersoonnr., Contact, Telefoon,
  Mobiele telefoon, E-mailadres
- **Verkoopadres** — Adres, Adres 2, Postcode, Plaats, Land/regio-code
- **Datums** — Documentdatum, Boekingsdatum, Btw-datum, Vervaldatum,
  Orderdatum + Ordertijd
- **Toegezegde leverdatum / -tijd**
- **Interne leverdatum / -tijd** (verplicht)
- **Referentie / Proces** — Extern documentnr., Uw referentie, Verkoper,
  Locatiecode, Eindklantnr./naam, Depotcode/-naam, Laadbeleid
- **Status** — Status, Statuscode, Afleverplaats, Orderbevestiging,
  Opmerkingen, Beschrijving van werk

Ordernummer auto-generatie in formaat `VOR{JJ}-NNNNN` (bv. `VOR26-01664`).

### Orderregels (greenhouse-essentials, horizontaal scrollbaar)

Soort, Nr., Variant, Geslacht, Omschrijving, Aantal, Code van eenheid,
Eenheidsprijs, Regelkorting %, Regelbedrag (auto), Locatiecode, Potcode,
Fustcode, Aantal per fust, Hoescode, Stickercode, Etiket, Verzenddatum,
Eindklantnr.

Artikellijst importeren via JSON-export uit Artikelinvoer geeft autocomplete
op artikelnr met automatische invulling van omschrijving, eenheid, geslacht
en potcode.

### Export-opties

- **BC RapidStart XML** — `<DataList>` met `<Sales_Header>` + `<Sales_Line>`
  elementen, Documenttype = Order. Veldnamen volgen de Nederlandse BC-captions
  (gesaniteerd tot geldige XML-elementnamen). Per order of batch.
- **Regels CSV (Excel)** — semikolon-gescheiden CSV met de exacte BC-kolomnamen
  (Documenttype, Documentnr., Soort, Nr., Aantal, …) voor "Bewerken in Excel"
  / Excel-import workflow. Per order of batch.
- **JSON backup** — orders en klanten apart.

### Importeren in Business Central

**Via Configuration Package XML:**

1. In BC: open **Configuration Packages** → **New** → vul Code en Package Name
2. Voeg tabellen toe: 36 Sales Header en 37 Sales Line
3. **Import Package** → kies de geëxporteerde XML
4. **Apply Package** om de orders te plaatsen

**Via Excel-CSV** (regels):

1. Open een verkooporder in BC en gebruik **Bewerken in Excel** op de regels
2. Plak de geëxporteerde regels in de Excel; controleer kolomnamen en boek terug

## Hosting via GitHub Pages

1. Push dit repository naar GitHub
2. Ga naar **Settings > Pages > Source: main branch**
3. Site is live op `https://<gebruikersnaam>.github.io/kwekerijbaas-artikelinvoer/`

## Kwekerijbaas

Drietorensweg / Enserweg — Blooming Joy productlijnen
