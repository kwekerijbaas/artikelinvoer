const {
  listItems,
  createItem,
  updateItem,
  deleteItem,
  LIST_KARREN,
  LIST_COMPONENTEN,
  assertConfig
} = require('../shared/graph');
const { readPrincipal, principalLabel } = require('../shared/principal');

// POST /api/karren/save
// Body: { kar: {...}, componenten: [...], sent_at, source }
// Upsert-strategie:
//   - kar:   zoek SP-item met fields.kar_id == kar.kar_id → PATCH, anders POST
//   - comps: verwijder alle SP-items met fields.kar_id == kar.kar_id, dan POST nieuw
// updated_by wordt overschreven met de ingelogde gebruiker (uit SWA principal).

module.exports = async function (context, req) {
  const principal = readPrincipal(req);
  if (!principal) {
    context.res = { status: 401, body: { error: 'unauthenticated' } };
    return;
  }
  try {
    assertConfig();
    const payload = req.body;
    if (!payload || !payload.kar || !payload.kar.kar_id) {
      context.res = { status: 400, body: { error: 'kar.kar_id ontbreekt' } };
      return;
    }
    const karId = String(payload.kar.kar_id);
    const stampedBy = principalLabel(principal);
    const stampedAt = new Date().toISOString();

    const karFields = sanitizeKar(payload.kar, { updated_at: stampedAt, updated_by: stampedBy });

    // Bestaande kar-item zoeken (één keer alle items ophalen — lijst blijft klein)
    const existingKarren = await listItems(LIST_KARREN);
    const existing = existingKarren.find(it => (it.fields || {}).kar_id === karId);

    if (existing) {
      await updateItem(LIST_KARREN, existing.id, karFields);
    } else {
      await createItem(LIST_KARREN, karFields);
    }

    // Componenten: oude verwijderen, nieuwe aanmaken
    const existingComps = await listItems(LIST_COMPONENTEN);
    const toDelete = existingComps.filter(it => (it.fields || {}).kar_id === karId);
    for (const it of toDelete) {
      try {
        await deleteItem(LIST_COMPONENTEN, it.id);
      } catch (e) {
        context.log.warn(`Comp-delete faalde voor ${it.id}: ${e.message}`);
      }
    }

    const comps = Array.isArray(payload.componenten) ? payload.componenten : [];
    for (const c of comps) {
      const fields = sanitizeComp(c, karId, { updated_at: stampedAt });
      await createItem(LIST_COMPONENTEN, fields);
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        ok: true,
        kar_id: karId,
        updated_by: stampedBy,
        updated_at: stampedAt,
        comp_count: comps.length
      }
    };
  } catch (err) {
    context.log.error('karren-save error', err);
    context.res = { status: 500, body: { error: err.message } };
  }
};

// Alleen de bekende velden door laten — SP-list weigert onbekende kolommen.
// Lege strings → null sturen voor numerieke velden zodat SP ze ook echt leegt.
function sanitizeKar(k, overrides) {
  const out = {
    kar_id: str(k.kar_id),
    status: str(k.status),
    vrc: str(k.vrc),
    vrc_info: str(k.vrc_info),
    klant: str(k.klant),
    eindklant: str(k.eindklant),
    afzetland: str(k.afzetland),
    jaar: num(k.jaar),
    week: num(k.week),
    verlaaddag: dateOrEmpty(k.verlaaddag),
    losdag: dateOrEmpty(k.losdag),
    actiedag: dateOrEmpty(k.actiedag),
    af_tuin: str(k.af_tuin),
    transport: str(k.transport),
    verkoper: str(k.verkoper),
    gepland: str(k.gepland),
    type_kar: str(k.type_kar),
    aantal_lagen_kar: num(k.aantal_lagen_kar),
    aantal_kar_bruto: num(k.aantal_kar_bruto),
    mix_type: str(k.mix_type),
    details_klantmix: str(k.details_klantmix),
    ladingdrager: str(k.ladingdrager),
    karposter: !!k.karposter,
    karsticker: !!k.karsticker,
    opzetstuk: !!k.opzetstuk,
    sealen_strappen: !!k.sealen_strappen,
    opmerking: str(k.opmerking)
  };
  // Alleen meesturen wanneer ingevuld — als de SP-kolommen nog niet bestaan
  // blijven saves van niet-gekopieerde regels gewoon werken.
  if (k.copied_from) out.copied_from = str(k.copied_from);
  if (k.copied_at) out.copied_at = str(k.copied_at);
  return Object.assign(out, overrides);
}

function sanitizeComp(c, karId, overrides) {
  const out = {
    kar_id: karId,
    comp_idx: num(c.comp_idx),
    artikelnr: str(c.artikelnr),
    naam: str(c.naam),
    productgroep: str(c.productgroep),
    teelt: str(c.teelt),
    potmaat: str(c.potmaat),
    kleur: str(c.kleur),
    bloeistadium: str(c.bloeistadium),
    teeltspecificatie: str(c.teeltspecificatie),
    planningsgroep: str(c.planningsgroep),
    aantal_per_kar: num(c.aantal_per_kar),
    aantal_fust_laag: num(c.aantal_fust_laag),
    aantal_per_fust: num(c.aantal_per_fust),
    aantal_fust: num(c.aantal_fust),
    fust_berekenen: !!c.fust_berekenen,
    prijs: num(c.prijs),
    prijs_consument: num(c.prijs_consument),
    type_verpakking: str(c.type_verpakking),
    verpakking_kleur: str(c.verpakking_kleur),
    ean: str(c.ean),
    sticker: !!c.sticker,
    etiket: !!c.etiket,
    hoes: !!c.hoes
  };
  return Object.assign(out, overrides);
}

function str(v) {
  if (v === undefined || v === null) return '';
  return String(v);
}
function num(v) {
  if (v === '' || v === undefined || v === null) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}
function dateOrEmpty(v) {
  if (!v) return null;
  return String(v).slice(0, 10);
}
