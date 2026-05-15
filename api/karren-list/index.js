const { listItems, LIST_KARREN, LIST_COMPONENTEN, assertConfig } = require('../shared/graph');
const { readPrincipal } = require('../shared/principal');

// GET /api/karren/list  →  { karren: [...], componenten: [...], fetched_at }
// SWA-auth zorgt dat /api/* alleen door ingelogde users wordt aangeroepen
// (afgedwongen via staticwebapp.config.json). Hier nog een extra principal-check
// zodat de Function ook standalone niet anoniem aanspreekbaar is.

module.exports = async function (context, req) {
  const principal = readPrincipal(req);
  if (!principal) {
    context.res = { status: 401, body: { error: 'unauthenticated' } };
    return;
  }
  try {
    assertConfig();
    const [karItems, compItems] = await Promise.all([
      listItems(LIST_KARREN),
      listItems(LIST_COMPONENTEN)
    ]);

    const karren = karItems.map(it => fieldsToKar(it.fields));
    const componenten = compItems.map(it => fieldsToComp(it.fields));

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: { karren, componenten, fetched_at: new Date().toISOString() }
    };
  } catch (err) {
    context.log.error('karren-list error', err);
    context.res = { status: 500, body: { error: err.message } };
  }
};

// SP geeft alle veldnamen onder fields.<naam>. Booleans komen als true/false,
// numerieke velden als numbers, datums als ISO-strings. Onbekende velden negeren we.
function fieldsToKar(f) {
  return {
    kar_id: f.kar_id || '',
    status: f.status || '',
    vrc: f.vrc || '',
    vrc_info: f.vrc_info || '',
    klant: f.klant || '',
    eindklant: f.eindklant || '',
    afzetland: f.afzetland || '',
    jaar: f.jaar ?? '',
    week: f.week ?? '',
    verlaaddag: f.verlaaddag || '',
    losdag: f.losdag || '',
    actiedag: f.actiedag || '',
    af_tuin: f.af_tuin || '',
    transport: f.transport || '',
    verkoper: f.verkoper || '',
    gepland: f.gepland || '',
    type_kar: f.type_kar || '',
    aantal_lagen_kar: f.aantal_lagen_kar ?? '',
    aantal_kar_bruto: f.aantal_kar_bruto ?? '',
    mix_type: f.mix_type || '',
    details_klantmix: f.details_klantmix || '',
    ladingdrager: f.ladingdrager || '',
    karposter: !!f.karposter,
    karsticker: !!f.karsticker,
    opzetstuk: !!f.opzetstuk,
    sealen_strappen: !!f.sealen_strappen,
    opmerking: f.opmerking || '',
    updated_at: f.updated_at || '',
    updated_by: f.updated_by || ''
  };
}

function fieldsToComp(f) {
  return {
    kar_id: f.kar_id || '',
    comp_idx: f.comp_idx ?? 0,
    artikelnr: f.artikelnr || '',
    naam: f.naam || '',
    productgroep: f.productgroep || '',
    teelt: f.teelt || '',
    potmaat: f.potmaat || '',
    kleur: f.kleur || '',
    bloeistadium: f.bloeistadium || '',
    teeltspecificatie: f.teeltspecificatie || '',
    planningsgroep: f.planningsgroep || '',
    aantal_per_kar: f.aantal_per_kar ?? '',
    aantal_fust_laag: f.aantal_fust_laag ?? '',
    aantal_per_fust: f.aantal_per_fust ?? '',
    aantal_fust: f.aantal_fust ?? '',
    fust_berekenen: !!f.fust_berekenen,
    prijs: f.prijs ?? '',
    prijs_consument: f.prijs_consument ?? '',
    type_verpakking: f.type_verpakking || '',
    verpakking_kleur: f.verpakking_kleur || '',
    ean: f.ean || '',
    sticker: !!f.sticker,
    etiket: !!f.etiket,
    hoes: !!f.hoes,
    updated_at: f.updated_at || ''
  };
}
