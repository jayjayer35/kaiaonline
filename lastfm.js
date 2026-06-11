const USERNAME = "kaiasei"; // Put your LastFM username here
const BASE_URL = `https://lastfm-last-played.biancarosa.com.br/${USERNAME}/latest-song`;

const getTrack = async () => {
    const request = await fetch(BASE_URL);
    const json = await request.json();
    let status

    let isPlaying = json.track['@attr']?.nowplaying || false;

    if(!isPlaying) {
        // Trigger if a song isn't playing
        return;
    } else {
        // Trigger if a song is playing
    }

    // Values:
    // COVER IMAGE: json.track.image[1]['#text']
    // TITLE: json.track.name
    // ARTIST: json.track.artist['#text']

    document.getElementById("listening").innerHTML = `
  <div style="display:flex; align-items:center; justify-content:center; gap:10px;">
    <img
      src="${json.track.image[1]['#text']}"
      style="width:64px; height:64px; object-fit:cover;"
    >

    <div id="trackInfo">
      <span id="trackName">${json.track.name}</span>
      -
      <span id="artistName">${json.track.artist['#text']}</span>
    </div>
  </div>
`
};

getTrack();
setInterval(() => { getTrack(); }, 10000);