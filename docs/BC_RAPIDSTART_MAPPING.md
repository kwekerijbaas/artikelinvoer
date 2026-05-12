# BC RapidStart mapping — analyse & verbetervoorstellen

Doel: zorgen dat de orderregels in `opzet_afname.html` zo dicht mogelijk aansluiten bij wat Business Central (BC) verwacht in zijn RapidStart Configuration Package, zodat de hand-over straks foutloos verloopt.

Bron: `Standaard12_05_2026_22_01_11_Verkooporderkop_en_regels.xlsx` (geleverd door VWC), 59 voorbeeld-orderkoppen + 266 voorbeeld-regels uit jullie BC-tenant.

## 1. Wat zit er in de RapidStart export

| Sheet | BC-tabel | Kolommen | Voorbeeld-rijen | Gevulde kolommen |
|---|---|---:|---:|---:|
| `Verkoopkop` | 36 (Sales Header) | 286 | 59 | **177** |
| `37 Verkoopregel` | 37 (Sales Line) | 368 | 266 | **236** |

Belangrijk: van de 286 / 368 mogelijke velden wordt maar een fractie écht ingevuld. De rest blijft leeg of wordt door BC zelf gevuld op basis van boekingsgroepen, klant-defaults en sequences.

## 2. Wat onze app aanlevert vs wat BC verwacht

### 2.1 Verkoopkop (Sales Header)

| BC-veld | Onze huidige bron | Status | Toelichting |
|---|---|---|---|
| `Documenttype` | constant `Order` | ✅ | Vaste waarde |
| `Nr.` | — | 🟦 BC | `Nr.-reeks = V-ORDER` genereert het ordernummer (`VOR26-01700`) |
| `Orderklantnr.` | `r.klant` → moet K-code worden | ⚠️ gap | Wij hebben nu de **naam** als string. BC keyt op K00xxx. → masterdata-koppeling nodig |
| `Factureren aan` | idem `Orderklantnr.` | ⚠️ gap | Default = same as klant |
| `Verkoper` | `r.verkoper` | ✅ | "MAARTJE", "HARROLD", "MARTEIN" matchen exact |
| `Uw referentie` / `Extern documentnr.` | `r.vrc_info` / `r.opmerking` | 🟡 partial | Vrije tekst veld; we kunnen `r.vrc + ' ' + r.opmerking` sturen |
| `Verzendcode` | — | ❌ ontbreekt | `KLOK VBA`, `KLOK_FHN`, `BOX_FHA`, `BOX_FHN`, etc. Niet aanwezig in onze app |
| `Verzendwijze` | — | ❌ ontbreekt | `DAT`, `EXW`, `DAP` (Incoterms). Niet aanwezig |
| `Locatiecode` | — | ❌ ontbreekt | `EW4`, `EW5`. Niet aanwezig |
| `Ladingdrager` | `r.type_kar` | 🟡 partial | Wij: `CC`, `1/2 DC`, ... → matcht maar moet als lookup ipv vrije tekst |
| `Expediteur` | — | ❌ ontbreekt | `01 FABER`, `AF TUIN`. Niet aanwezig |
| `Orderdatum` | — | 🟦 BC | Auto bij aanmaak in BC |
| `Boekingsdatum` | — | 🟦 BC | Auto |
| `Documentdatum` | — | 🟦 BC | Auto |
| `Verzenddatum` | `r.verlaaddag` → moet datum worden | ⚠️ gap | Wij hebben dagcode (`Vrijdag`), BC wil `2026-05-13` |
| `Toegezegde leverdatum` | afgeleid uit `r.week + r.verlaaddag` | ⚠️ gap | Moet ISO-datum worden |
| `Toegezegde levertijd` | — | ❌ ontbreekt | `06:00:00`, `11:00:00`, etc. Per klant default? |
| `Interne Leverdatum` | `r.losdag` → moet datum worden | ⚠️ gap | Idem |
| `Interne levertijd` | — | ❌ ontbreekt | `15:00:00`, `09:00:00`. Per klant/route default? |
| `Betalingscondities` | — | 🟦 klant-default | `VVEILING`, `V7D`, `V45D`. BC vult op basis van klant |
| `Algemene bedrijfsboekingsgroep` | — | 🟦 klant-default | `NLD`, `EU`. Van klant |
| `Btw-bedrijfsboekingsgroep` | — | 🟦 klant-default | Idem |
| `Land-/regiocode btw` | `r.afzetland` → ISO-code | 🟡 partial | Wij: "Duitsland", BC: `DE` → ISO-omzetting nodig |
| `Klantboekingsgroep` | — | 🟦 klant-default | `KLANT`. Van klant |
| `Sneleigenschap 1`, `2`, `3` | — | ❓ onbekend | Waarden `A/N/AF/HD01/N3`, `NEE/JA`, `JA/NEE`. VWC: wat zijn dit? |
| `Status` / `Status code` | — | 🟦 BC | Workflow-managed (`Vrijgegeven` / `Open`, `ORDER-2 GEREEDHAL`, etc.) |

**Legenda**: ✅ klaar · 🟡 partial · ⚠️ gap (we hebben info maar verkeerde vorm) · ❌ ontbreekt · 🟦 BC vult zelf · ❓ vraag voor VWC

### 2.2 Verkoopregel (Sales Line)

| BC-veld | Onze huidige bron | Status | Toelichting |
|---|---|---|---|
| `Documenttype` | constant `Order` | ✅ | |
| `Documentnr.` | — | 🟦 BC | Link naar Sales_Header.Nr. |
| `Regelnr.` | — | 🟦 BC | Auto: 10000, 20000, ... |
| `Soort` | constant `Artikel` | ✅ | |
| `Nr.` (artikelnummer) | — | ⚠️ critical gap | BC verwacht `7201212930` etc. Wij hebben geen artikelnr in onze regels. **Zie sectie 4** |
| `Variant` | — | ❌ ontbreekt | `21220`, `EXCL.`, `21711` |
| `Omschrijving` | `r.teelt + r.potmaat` | 🟡 partial | BC voorbeeld: `P12. CALI BJ Family Coral` |
| `Aantal` | `r.geplande_aantallen` | ✅ | Direct mappable |
| `Eenheid` / `Code van eenheid` | — | 🟦 default | `Stuks` / `STUKS`. Default per artikel |
| `Eenheidsprijs` | `r.prijs` | ✅ | Direct |
| `Locatiecode` | — | ❌ ontbreekt | Per regel (EW4/EW5) |
| `Verzenddatum` | afgeleid `r.week + r.verlaaddag` | ⚠️ gap | ISO-datum |
| `Toegezegde leverdatum` | idem | ⚠️ gap | Idem |
| `Toegezegde levertijd` | — | ❌ ontbreekt | |
| `Geplande leverdatum` | idem | ⚠️ gap | Meestal = Toegezegde leverdatum |
| `Geplande verzenddatum` | idem | ⚠️ gap | Idem |
| `Interne Leverdatum` | `r.losdag` → datum | ⚠️ gap | |
| `Interne levertijd` | — | ❌ ontbreekt | |
| `Raamcontractnr.` | `r.vrc` | ✅ **key field** | Wij: `VRC-02330`, BC: `VRC-02330`. **Exacte match** |
| `Raamcontractregelnr.` | — | ❓ VWC | Welke regel in het BC-raamcontract refereert onze regel? |
| `Fustcode` | `r.fust_incl_excl` ? | 🟡 partial | BC: `TRAY 408 (8) EXCL.`, `LOS (1)`. Wij hebben los: `type_kar`, `aantal_per_fust` etc. |
| `Fustvariant` | — | ❌ ontbreekt | `408DPZW`, `306NPZW`, `LOS` |
| `Fustgroep` | — | ❌ ontbreekt | `TRAYS`, `POTTEN`, `PACKS` |
| `Aantal fust` | `r.aantal_fust` | ✅ | |
| `Aantal per fust` | `r.aantal_per_fust` | ✅ | |
| `Aantal platen` | — | ❌ ontbreekt | BC vermeldt `56`, `50`, `24` |
| `Aantal ladingdragers` | `r.aantal_kar_bruto` | ✅ | |
| `Ladingdrager` | `r.type_kar` | ✅ | |
| `Beladingssjabloon` | — | ❌ ontbreekt | `CC-P12-408(8)EX-5`. Te genereren? |
| `Beladingsoptie` | — | ❌ ontbreekt | Numeriek (`8`, `6`, `5`) |
| `Hoescode` | `r.hoes_*` (bedrukking) | 🟡 partial | BC: `08279930007`. Wij: vrije tekst per bedruk-optie |
| `Stickercode` | `r.sticker_*` | 🟡 partial | Idem |
| `Etiket` | `r.etiket_*` | 🟡 partial | Idem |
| `Geslacht` | — | ❌ ontbreekt | `720`, `850`. Varietaire code per artikel |
| `Artikelcategoriecode` | `r.productgroep`? | 🟡 partial | BC: `PLANTEN`, `TRAYS`, `GESLACHTEN`. Wij: `Voorjaarsbloeier` etc. — andere as |
| `Artikelsoort` | constant `Plant` | ✅ | |
| `Productiefase` | constant `AFLEVERFASE` | ✅ | |
| `Ordernummer klant` | idem `Uw referentie` op kop | 🟡 partial | Bv. `ZAAIPERKGOED WK22 C10N LID` |
| `Verzendcode` | — | ❌ ontbreekt | Erft van kop |
| `Veilingcode` | — | ❌ ontbreekt | `AALSMEER`, `FH NAALDWIJK`. Alleen voor klok |
| `VBN-productcode` | — | ❌ ontbreekt | `109116`, `8977`. VBN-codering per artikel |
| `Floriday artikelnr.`, `Floriday status`, `Floriday verkooporder volgnr.` | — | 🟦 BC | Floriday-integratie genereert deze |
| `Snelkenmerk 1-7` | — | ❓ onbekend | Code-velden, betekenis onduidelijk |
| `Sneleigenschap 1-7` | — | ❓ onbekend | Idem |

## 3. Welke Agriware-masterdata is nodig

Voor een **foutloze** koppeling moeten de volgende lijsten uit Agriware geïmporteerd worden in `opzet_afname.html` (via de bestaande Agriware-lijsten import-modal). Sommige hebben we al, andere nog niet.

| Masterdata | Status in app | Wat we nodig hebben uit Agriware |
|---|---|---|
| **Klanten** | ✅ aanwezig, maar als naam-string | Lijst met `K-code` + naam + adres + land + boekingsgroepen. Onze app moet klantNR opslaan, niet alleen naam |
| **Eindklanten** | ✅ aanwezig | Idem — K-code-koppeling |
| **Contactpersonen** | ❌ ontbreekt | `CT-code` per klant — voor `Ordercontactnr.` / `Factuurcontactnr.` |
| **Verkopers** | ✅ aanwezig | Exacte namen al goed |
| **VRC's / Raamcontracten** | ✅ aanwezig | Lijst van VRC-nummers + per VRC: BC `Nr.` (artikelnr), `Variant`, `Geslacht`, `VBN-productcode` → zodat de app per VRC de juiste BC-artikelinfo kan invullen of laten afleiden |
| **Verzendcodes** | ❌ ontbreekt | `KLOK VBA`, `KLOK_FHN`, `BOX_FHA`, `BOX_FHN`, etc. Lijst nodig + welke per klant/route default is |
| **Verzendwijzes** | ❌ ontbreekt | Incoterms-codes `DAT`, `EXW`, `DAP`, etc. |
| **Expediteurs** | ❌ ontbreekt | `01 FABER`, `AF TUIN`, etc. |
| **Locatiecodes** | ❌ ontbreekt | `EW4`, `EW5`. Lijst + regel voor welke locatie wanneer |
| **Fustcodes + varianten + groepen** | 🟡 deels | Onze app heeft losse `fust_incl_excl` + `aantal_fust` etc. Beter: een fust-masterdata lijst met `Fustcode` (`TRAY 408 (8) EXCL.`) + `Fustvariant` (`408DPZW`) + `Fustgroep` (`TRAYS`) + standaard aantal/laag |
| **Hoescode masterdata** | ❌ ontbreekt | Lijst met hoescode-nummers (`08279930007`) per type, kleur, formaat |
| **Stickercode masterdata** | ❌ ontbreekt | Idem |
| **Etiket masterdata** | ❌ ontbreekt | Idem |
| **Veilingcodes** | ❌ ontbreekt | `AALSMEER`, `FH NAALDWIJK`, `FH AALSMEER` |
| **Land/regio ISO-codes** | 🟡 partial | We hebben afzetland-namen, BC wil ISO (`NL`, `DE`, `DK`). Mapping-tabel land → ISO-code |
| **Betalingscondities** | ❌ ontbreekt | `VVEILING`, `V7D`, `V45D`, etc. Per klant default uit Agriware |
| **Verlaaddag-tijd defaults** | ❌ ontbreekt | Per klant/route: standaard `Toegezegde levertijd` en `Interne levertijd` |

## 4. Hoe komt het BC-artikelnummer (`Nr.`) op een Sales_Line?

Dit is de meest kritieke vraag. Drie opties:

**Optie A — VRC-koppeling**: Als wij `Raamcontractnr.` correct meesturen, kan BC dan het artikelnr afleiden uit de definitie van het raamcontract? Te bevestigen met VWC.

**Optie B — Per-VRC mapping in onze masterdata**: Wanneer Agriware ons een VRC-lijst geeft, neemt die ook het bijhorende BC-artikelnr + variant + geslacht mee. Dan stuurt onze app `Nr.` + `Variant` + `Geslacht` rechtstreeks mee.

**Optie C — Lookup via masterdata-artikellijst (`index.html`)**: Onze `index.html` heeft een artikellijst (347 items) met combinatie teelt + potmaat + kleur → artikelnr. Mits die exact overeenkomt met BC's artikelmaster.

Aanbeveling: **vraag VWC om Optie A te bevestigen**. Als BC het zelf doet via Raamcontract is verreweg het robuustst. Anders Optie B (Agriware-import met BC-velden meegestuurd).

## 5. Verbetervoorstellen voor `opzet_afname.html`

### 5.1 Data-model uitbreidingen

Onze regel-objecten moeten extra velden bevatten zodat ze 1-op-1 mappable worden:

```
r.klantnr           // K00xxx (los van naam)
r.eindklantnr       // K00xxx
r.contactpersoonnr  // CTxxxxxx
r.verzendcode       // KLOK VBA / KLOK_FHN / BOX_*
r.verzendwijze      // DAT / EXW / DAP
r.expediteur        // 01 FABER / AF TUIN
r.locatiecode       // EW4 / EW5
r.toegezegde_levertijd  // HH:MM
r.interne_levertijd     // HH:MM
r.fustcode          // TRAY 408 (8) EXCL.
r.fustvariant       // 408DPZW
r.fustgroep         // TRAYS / POTTEN / PACKS
r.bc_artikelnr      // 7201212930 (uit VRC-lookup of Optie A leeg)
r.bc_variant        // 21220
r.bc_geslacht       // 720
r.veilingcode       // AALSMEER (alleen voor klok-orders)
r.land_iso          // NL / DE / DK (afgeleid uit r.afzetland)
```

Achterwaartse compatibiliteit: bestaande regels in localStorage hebben deze velden niet — dan blijven ze leeg en springt BC op zijn eigen defaults.

### 5.2 UI-aanpassingen in drawer

Toevoegen aan de "Logistiek & Prijs"-sectie van de drawer:

- **Verzendcode** (select uit nieuwe Agriware-lijst)
- **Verzendwijze** (select)
- **Expediteur** (select)
- **Locatiecode** (select EW4/EW5)
- **Toegezegde levertijd** (time input, default uit klant-masterdata)
- **Interne levertijd** (time input, default uit klant-masterdata)

Toevoegen aan "Fust" sectie:
- **Fustcode** (select uit fust-masterdata) → vervangt huidige losse `fust_incl_excl`
- Andere fust-velden auto-vullen uit gekozen fustcode

### 5.3 Klant-record uitbreiden

De Agriware-klantenlijst-import moet voortaan ook **klantnr** opslaan, niet alleen naam. Dropdown in de drawer wordt dan: toon naam, opslaan: nummer.

Migratie: bestaande regels mappen op naam → nieuwe K-code. Niet-mappable regels markeren als "klant niet meer in masterdata".

### 5.4 RapidStart XML generator

`rapidStartXml()` in `opzet_afname.html:2070+` wordt opnieuw opgezet met:

1. **`<DataList>`** root met namespace
2. **`<ConfigPackage>`** metadata blok (Code, ProductVersion, ExportedAt)
3. Per regel:
   - **`<Sales_Header>`** met de mapping uit 2.1 hierboven
   - **`<Sales_Line>`** met de mapping uit 2.2 hierboven
4. Datums in ISO-formaat (`YYYY-MM-DD`), tijden in `HH:MM:SS`
5. Decimalen met punt (niet komma)
6. Element-namen exact zoals in de RapidStart-export uit BC (`Orderklantnr.`, `Raamcontractnr.`, etc.)
7. Lege velden weglaten (niet `<Veld></Veld>`)

Te valideren door een gegenereerde XML te importeren in de BC-sandbox via *Configuration Packages → Import Package → Apply Package*.

## 6. Open vragen voor VWC

1. **VRC → artikelnr**: Leidt BC `Nr.`, `Variant`, `Geslacht` af uit `Raamcontractnr.` zodra we die meesturen? Of moeten wij die velden zelf vullen?
2. **`Raamcontractregelnr.`**: Hoe bepalen we welke regel binnen het VRC een nieuwe order/aanvraag matcht? Per week-combinatie?
3. **`Sneleigenschap 1/2/3` op kop, `Snelkenmerk 1-7` + `Sneleigenschap 1/3/7` op regel**: wat zijn dit, en moeten wij ze vullen of niet?
4. **`Verzendcode` defaults**: per klant geconfigureerd in Agriware, of vraagt het altijd actieve keuze?
5. **`Toegezegde/Interne levertijd`**: per klant, per route, of altijd handmatig?
6. **`Fustcode` granulariteit**: is `r.fust_incl_excl` (huidige Inclusief/Exclusief vlag) genoeg of moet het echt de volledige fustcode-tabel zijn?
7. **`Beladingssjabloon`**: kan dit afgeleid worden uit `Ladingdrager + Potmaat + Fust`-combinatie of moet het een aparte lookup zijn?
8. **`Hoes-/Sticker-/Etiketcode`**: numerieke codes — bestaan masterdata-lijsten in Agriware met `code → omschrijving`?

## 7. Aanbevolen volgorde

1. **VWC beantwoordt open vragen** (sectie 6)
2. **Agriware-imports uitbreiden**: bijwerken `openLookupModal()` om nieuwe lijsten te accepteren (verzendcodes, locatiecodes, fustmasterdata, etc.)
3. **Klant-record migratie** (klantnr verplicht)
4. **Drawer-UI uitbreiding** (sectie 5.2)
5. **RapidStart XML generator herschrijven** (sectie 5.4)
6. **Sandbox-test** met 1 voorbeeld-regel → debugloop tot import slaagt
7. **Full export uit de app** valideren tegen 5–10 verschillende voorbeeld-orders
