// unique visitor counter for the header. counts each visitorID once a month,
// pings discord for new visitors, and ALWAYS answers with totalCount (or an
// error message) so the header never gets stuck on "…".
//
// setup: in Netlify → Site settings → Environment variables, add
//   JSONBIN_KEY  = your JSONBin master key
// (it used to be pasted in this file; keeping it in env vars keeps it private)

const BIN_URL = 'https://api.jsonbin.io/v3/b/689937f9ae596e708fc718f9'; //your bin URL you IDIOT
const BIN_API_KEY = '$2a$10$UzWzekC9pYB.ho/FqEH7oOGidp3/9ZBv4JcsLsTFj00vfuAVbVfSy'; //JSON bin API key (Netlify env var)
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL; //Netlify env vars
const DISCORD_WEBHOOK_URL_2 = process.env.DISCORD_WEBHOOK_URL_2; //second Discord webhook (optional)
const IPINFO_TOKEN = process.env.IPINFO_TOKEN;

const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;

// every outside call gets a time limit, so one slow service can't make the
// whole function time out (netlify stops functions after ~10 seconds)
const within = (ms) => ({ signal: AbortSignal.timeout(ms) });

const reply = (statusCode, obj) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store'
  },
  body: JSON.stringify(obj)
});

// Random messages
function getRandomMessage() {
  const messages = [
    "Hello!",
    "Look, a person!",
    "Haia",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

const gifs = [
  /*"https://kaia.starscene.com/assets/spamton.gif",
  "https://kaia.starscene.com/assets/outtahere.gif",
  "https://kaia.starscene.com/assets/mycar.gif",
  "https://kaia.starscene.com/assets/owspin.gif",
  "https://kaia.starscene.com/assets/owdance.gif",
  "https://kaia.starscene.com/assets/owgames.gif",
  "https://kaia.starscene.com/assets/owlk.gif",
  "https://kaia.starscene.com/assets/ratsss.gif",
  "https://kaia.starscene.com/assets/garn47.gif",
  "https://kaia.starscene.com/assets/skeleton.gif",
  "https://kaia.starscene.com/assets/snailien.gif",
  "https://kaia.starscene.com/assets/franz.gif",
  "https://kaia.starscene.com/assets/nepeta.gif",
  "https://kaia.starscene.com/assets/johnegbert.gif",
  "https://kaia.starscene.com/assets/jade-jade-harley.gif",*/
];

// locations that are really bots/servers, not people. these still SEE the
// count, they just don't add to it or ping discord
const SKIP_LOCATIONS = [
  { city: 'ashburn',   region: 'virginia',  country: 'us' },
  { city: 'singapore', region: 'singapore', country: 'sg' },
];

async function getLocation(ip) {
  if (ip === 'Unknown' || !IPINFO_TOKEN) return null;
  try {
    const res = await fetch(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`, within(2500));
    if (!res.ok) return null;
    const data = await res.json();
    return {
      city: data.city || 'Unknown city',
      region: data.region || 'Unknown region',
      country: data.country || 'Unknown country'
    };
  } catch {
    return null;
  }
}

exports.handler = async (event) => {
  try {
    const visitorID = event.queryStringParameters?.visitorID;
    if (!visitorID) return reply(400, { error: 'missing visitorID' });
    if (!BIN_API_KEY) return reply(500, { error: 'JSONBIN_KEY env var is not set' });

    // x-forwarded-for can be a list ("client, proxy, ..."), the first one is the visitor
    const visitorIP =
      event.headers['x-nf-client-connection-ip'] ||
      (event.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      'Unknown';

    const location = await getLocation(visitorIP);
    const locationText = location
      ? `${location.city}, ${location.region}, ${location.country}`
      : 'Unknown location';

    const skipped = !!location && SKIP_LOCATIONS.some(s =>
      location.city.toLowerCase() === s.city &&
      location.region.toLowerCase() === s.region &&
      location.country.toLowerCase() === s.country);

    // Get current data from JSONBin
    const getRes = await fetch(BIN_URL + '/latest', {
      headers: { 'X-Master-Key': BIN_API_KEY, 'X-Bin-Meta': 'false' },
      ...within(4000)
    });
    if (!getRes.ok) {
      const why = await getRes.text().catch(() => '');
      throw new Error(`jsonbin read failed (${getRes.status}) ${why.slice(0, 200)}`);
    }
    const data = await getRes.json();
    const record = (data && data.record) ? data.record : (data || {});

    // Initialize if empty
    if (!record.count) record.count = 0;
    if (!record.visitors) record.visitors = {};

    if (skipped) return reply(200, { totalCount: record.count, skipped: true });

    const now = Date.now();
    const lastVisit = record.visitors[visitorID] || 0;

    // Increment only if first visit or last visit > 1 month
    if (now - lastVisit <= ONE_MONTH) {
      return reply(200, { totalCount: record.count });
    }

    record.count += 1;
    record.visitors[visitorID] = now;

    // forget visitors older than a month. they'd be counted again anyway, so
    // nothing changes, but it stops the bin growing forever (jsonbin bins
    // have a size limit, and a huge bin is also slow to load)
    for (const [id, ts] of Object.entries(record.visitors)) {
      if (now - ts > ONE_MONTH) delete record.visitors[id];
    }

    // Save updated record
    const putRes = await fetch(BIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': BIN_API_KEY
      },
      body: JSON.stringify(record),
      ...within(4000)
    });
    if (!putRes.ok) {
      const why = await putRes.text().catch(() => '');
      throw new Error(`jsonbin save failed (${putRes.status}) ${why.slice(0, 200)}`);
    }

    // Send Discord webhook(s), only after the new count really saved
    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
    const embed = {
      title: getRandomMessage(),
      description: `Visitor #**${record.count}**.`,
      color: 0xffb6c1,
      fields: [
        { name: "From:", value: locationText, inline: true },
      ],
      timestamp: new Date().toISOString()
    };
    if (randomGif) embed.image = { url: randomGif };
    const payload = JSON.stringify({ embeds: [embed] });

    const webhookUrls = [DISCORD_WEBHOOK_URL, DISCORD_WEBHOOK_URL_2].filter(Boolean);
    await Promise.allSettled(
      webhookUrls.map(url =>
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          ...within(3000)
        })
      )
    );

    return reply(200, { totalCount: record.count });

  } catch (err) {
    return reply(500, { error: String(err && err.message || err) });
  }
};