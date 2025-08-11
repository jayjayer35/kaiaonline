const fetch = require('node-fetch');

const BIN_URL = 'https://api.jsonbin.io/v3/b/689937f9ae596e708fc718f9'; // replace with your bin URL
const BIN_API_KEY = '$2a$10$UzWzekC9pYB.ho/FqEH7oOGidp3/9ZBv4JcsLsTFj00vfuAVbVfSy'; // replace with your JSON bin API key
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL; // put in Netlify env vars

exports.handler = async (event, context) => {
  try {
    // --- Get current count ---
    const getRes = await fetch(BIN_URL, {
      headers: { 'X-Master-Key': BIN_API_KEY }
    });
    const getData = await getRes.json();
    const count = getData.record.count || 0;

    // --- Increment ---
    const newCount = count + 1;

    // --- Update JSON bin ---
    await fetch(BIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': BIN_API_KEY
      },
      body: JSON.stringify({ count: newCount })
    });

    // --- Send message to Discord ---
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `New visit! Total count: **${newCount}**`
      })
    });

    // --- Respond to browser ---
    return {
      statusCode: 200,
      body: JSON.stringify({ count: newCount }),
      headers: { 'Access-Control-Allow-Origin': '*' }
    };

  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};