

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