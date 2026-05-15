// Microsoft Graph helper — client-credentials flow.
// Token wordt in-memory gecached tot ~5 min voor expiry.

const { fetch } = require('undici');

const TENANT = process.env.GRAPH_TENANT_ID;
const CLIENT_ID = process.env.GRAPH_CLIENT_ID;
const CLIENT_SECRET = process.env.GRAPH_CLIENT_SECRET;
const SITE_ID = process.env.SP_SITE_ID;
const LIST_KARREN = process.env.SP_LIST_KARREN_ID;
const LIST_COMPONENTEN = process.env.SP_LIST_COMPONENTEN_ID;

let cachedToken = null;
let cachedTokenExp = 0;

async function getToken() {
  const now = Date.now() / 1000;
  if (cachedToken && cachedTokenExp - now > 300) return cachedToken;

  if (!TENANT || !CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Graph app settings ontbreken (GRAPH_TENANT_ID / GRAPH_CLIENT_ID / GRAPH_CLIENT_SECRET)');
  }

  const url = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  });
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token-call faalde: HTTP ${res.status} ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  cachedToken = data.access_token;
  cachedTokenExp = now + Number(data.expires_in || 3600);
  return cachedToken;
}

async function graph(path, opts = {}) {
  const token = await getToken();
  const url = `https://graph.microsoft.com/v1.0${path}`;
  const headers = Object.assign(
    {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    },
    opts.headers || {}
  );
  if (opts.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? (typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body)) : undefined
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Graph ${opts.method || 'GET'} ${path} → ${res.status} ${text.slice(0, 400)}`);
  }
  return text ? JSON.parse(text) : null;
}

// Haal alle items op (paginated). Geeft array van { id, fields }.
async function listItems(listId) {
  const items = [];
  let next = `/sites/${SITE_ID}/lists/${listId}/items?$expand=fields&$top=2000`;
  while (next) {
    const data = await graph(next);
    for (const it of data.value || []) {
      items.push({ id: it.id, fields: it.fields || {} });
    }
    const nl = data['@odata.nextLink'];
    if (!nl) break;
    next = nl.replace('https://graph.microsoft.com/v1.0', '');
  }
  return items;
}

async function createItem(listId, fields) {
  return graph(`/sites/${SITE_ID}/lists/${listId}/items`, {
    method: 'POST',
    body: { fields }
  });
}

async function updateItem(listId, itemId, fields) {
  return graph(`/sites/${SITE_ID}/lists/${listId}/items/${itemId}/fields`, {
    method: 'PATCH',
    body: fields
  });
}

async function deleteItem(listId, itemId) {
  return graph(`/sites/${SITE_ID}/lists/${listId}/items/${itemId}`, {
    method: 'DELETE'
  });
}

function assertConfig() {
  const missing = [];
  if (!TENANT) missing.push('GRAPH_TENANT_ID');
  if (!CLIENT_ID) missing.push('GRAPH_CLIENT_ID');
  if (!CLIENT_SECRET) missing.push('GRAPH_CLIENT_SECRET');
  if (!SITE_ID) missing.push('SP_SITE_ID');
  if (!LIST_KARREN) missing.push('SP_LIST_KARREN_ID');
  if (!LIST_COMPONENTEN) missing.push('SP_LIST_COMPONENTEN_ID');
  if (missing.length) throw new Error('App settings ontbreken: ' + missing.join(', '));
}

module.exports = {
  LIST_KARREN,
  LIST_COMPONENTEN,
  graph,
  listItems,
  createItem,
  updateItem,
  deleteItem,
  assertConfig
};
