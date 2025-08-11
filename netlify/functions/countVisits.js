const BIN_URL = 'https://api.jsonbin.io/v3/b/689937f9ae596e708fc718f9'; // replace with your bin URL
const BIN_API_KEY = '$2a$10$UzWzekC9pYB.ho/FqEH7oOGidp3/9ZBv4JcsLsTFj00vfuAVbVfSy'; // replace with your JSON bin API key
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL; // put in Netlify env vars

const IPINFO_TOKEN = process.env.IPINFO_TOKEN;

async function getLocation(ip) {
  if (ip === 'Unknown') return null;
  try {
    const res = await fetch(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`);
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

const gifs = [
  "https://tenor.com/view/absolute-cinema-absolute-cinema-meme-spamton-absolute-cinema-spamton-deltarune-gif-10667192312374960411",
  "https://tenor.com/view/dog-mouth-funny-doggo-get-tf-outta-here-gif-17940358",
  "https://tenor.com/view/asgore-undertale-deltarune-gif-8006577193793263180",
  "https://tenor.com/view/outer-wilds-hearthian-gif-27399732",
  "https://tenor.com/view/outer-wilds-echoes-of-the-eye-eote-spoilers-prisoner-gif-27048450",
  "https://tenor.com/view/outer-wilds-slate-you-got-games-on-your-phone-frag-gif-8462655660521155524",
  "https://tenor.com/view/outer-wilds-echoes-of-the-eye-outer-wilds-echoes-of-the-eye-owlk-the-stranger-gif-4445104551402153996",
  "https://tenor.com/view/rat-showering-showering-rat-showering-mouse-mouse-gif-22365797"
];

exports.handler = async (event) => {
  try {
    // Get visitor IP from headers
    const visitorIP = event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || 'Unknown';

    // Get location info from IP
    const location = await getLocation(visitorIP);

    // Prepare location text
    const locationText = location
      ? `${location.city}, ${location.region}, ${location.country}`
      : 'Unknown location';

    // Skip counting and Discord message if visitor is from Ashburn, Virginia, US
    if (
      location &&
      location.city.toLowerCase() === 'ashburn' &&
      location.region.toLowerCase() === 'virginia' &&
      location.country.toLowerCase() === 'us'
    ) {
      // Return early without incrementing count or sending message
      return {
        statusCode: 200,
        body: JSON.stringify({ skipped: true }),
        headers: { 'Access-Control-Allow-Origin': '*' }
      };
    }

    // Get current count
    const getRes = await fetch(BIN_URL, {
      headers: { 'X-Master-Key': BIN_API_KEY }
    });
    const getData = await getRes.json();
    const count = getData.record.count || 0;

    // Increment count
    const newCount = count + 1;

    // Update count in JSON bin
   const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            title: getRandomMessage(),
            description: `Visitor #**${newCount}** just visited.`,
            color: 0xffb6c1,
            fields: [
              {
                name: "Location",
                value: locationText,
                inline: true
              },
              {
                name: "IP Address",
                value: visitorIP,
                inline: true
              }
            ],
            image: {
              url: randomGif
            },
            timestamp: new Date().toISOString()
          }
        ]
      })
    });

    // Respond to client
    return {
      statusCode: 200,
      body: JSON.stringify({ count: newCount }),
      headers: { 'Access-Control-Allow-Origin': '*' }
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};