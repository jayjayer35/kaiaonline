// Checks the admin password without doing anything else.
// Uses the same environment variable as delete-drawing — if yours is
// named something other than ADMIN_PASSWORD, change it below to match.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'method not allowed' };
  }

  let password;
  try {
    ({ password } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, body: 'bad request' };
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !password || password !== expected) {
    return { statusCode: 401, body: JSON.stringify({ ok: false }) };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
