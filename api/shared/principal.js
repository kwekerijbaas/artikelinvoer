// Parse de Static-Web-Apps client-principal header.
// SWA injecteert deze in elke /api request: een base64-encoded JSON met
// { userId, userDetails, identityProvider, userRoles, claims[] }.
// userDetails bevat doorgaans het emailadres voor azureActiveDirectory.

function readPrincipal(req) {
  const raw = req.headers['x-ms-client-principal'];
  if (!raw) return null;
  try {
    const json = Buffer.from(raw, 'base64').toString('utf8');
    const p = JSON.parse(json);
    return {
      userId: p.userId || '',
      userDetails: p.userDetails || '',
      identityProvider: p.identityProvider || '',
      roles: p.userRoles || [],
      claims: p.claims || []
    };
  } catch (e) {
    return null;
  }
}

function principalLabel(p) {
  if (!p) return '';
  return p.userDetails || p.userId || '';
}

module.exports = { readPrincipal, principalLabel };
