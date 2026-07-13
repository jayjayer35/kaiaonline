// readmore-audio.js
// gives <details class="readmore"> entries an optional "play a song once when opened" feature.
// most readmores do nothing special. to make one play a song, just add a data-song attribute:
//   <details class="readmore" data-song="../assets/music/mysong.mp3">
// the song plays through once and stops (no looping). opening a different one
// with a song will stop whatever was already playing.
//
// volume: defaults to DEFAULT_VOLUME below (0.0 to 1.0). override per-post with data-volume:
//   <details class="readmore" data-song="../assets/music/mysong.mp3" data-volume="0.3">

(function () {
    const DEFAULT_VOLUME = 0.1;

    let currentAudio = null;

    document.querySelectorAll("details.readmore[data-song]").forEach((details) => {
        details.addEventListener("toggle", () => {
            if (details.open) {
                // stop whatever song was previously playing, if any
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                }

                const audio = new Audio(details.dataset.song);
                const volume = parseFloat(details.dataset.volume);
                audio.volume = isNaN(volume) ? DEFAULT_VOLUME : Math.min(1, Math.max(0, volume));
                audio.play().catch(() => {
                    // ignored: browser blocked autoplay for some reason
                });

                details._readmoreAudio = audio;
                currentAudio = audio;
            } else {
                // closed again, stop its song if it's the one playing
                if (details._readmoreAudio) {
                    details._readmoreAudio.pause();
                    details._readmoreAudio.currentTime = 0;
                    if (currentAudio === details._readmoreAudio) {
                        currentAudio = null;
                    }
                }
            }
        });
    });
})();