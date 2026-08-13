/* ============================================================
   KONKANI KONNECT
   Floating Music Player
============================================================ */


/* ============================================================
   PLAYLIST
   NOTE: each song has a "video" field — that's the beach clip
   that fades in while that song is active.
============================================================ */

const playlist = [

    {
        title: "Tum Mojem Sukh",
        artist: "Alfred Rose",
        src: "assets/songs/Tum-Mojem-Sukh.mp3",
        cover: "assets/covers/default-cover.svg",
        video: "assets/video/beach1.mp4"
    },

    {
        title: "Konkani-Masala",
        artist: "The 7 Notes Band",
        src: "assets/songs/Konkani-Masala.mp3",
        cover: "assets/covers/default-cover.svg",
        video: "assets/video/beach2.mp4"
    },

    {
        title: "Ye-Ye-Cathrina",
        artist: "godgodo",
        src: "assets/songs/Ye-Ye-Cathrina.mp3",
        cover: "assets/covers/default-cover.svg",
        video: "assets/video/beach3.mp4"
    },
    {
        title: "Rosalina",
        artist: "Artist Name",
        src: "assets/songs/Rosalina.mp3",
        cover: "assets/covers/default-cover.svg",
        video: "assets/video/beach4.mp4"
    },
    {
        title: "Mog-Tuzo-Kithlo-Ashelom",
        artist: "Alison Gonsalves",
        src: "assets/songs/Mog-Tuzo-Kithlo-Ashelom.mp3",
        cover: "assets/covers/default-cover.svg",
        video: "assets/video/beach5.mp4"
    }
];


/* Fallback video used if a song's "video" field is missing */
const DEFAULT_VIDEO = "assets/video/beach.mp4";

/* How long the crossfade takes — must match the CSS transition
   duration in style.css (.bg-video { transition: opacity ... }) */
const CROSSFADE_MS = 1200;


/* ============================================================
   AUDIO
============================================================ */

const audio = new Audio();

audio.preload = "metadata";

audio.volume = 0.8;


/* ============================================================
   STATE
============================================================ */

let currentIndex = 0;

let isPlaying = false;


/* ============================================================
   DOM
============================================================ */

const player =
    document.getElementById("music-player");

const dragArea =
    document.getElementById("drag-area");

const playButton =
    document.getElementById("play-btn");

const playIcon =
    document.getElementById("play-icon");

const pauseIcon =
    document.getElementById("pause-icon");

const prevButton =
    document.getElementById("prev-btn");

const nextButton =
    document.getElementById("next-btn");

const coverArt =
    document.getElementById("cover-art");

const playingDot =
    document.getElementById("playing-dot");

const titleElement =
    document.getElementById("track-title");

const artistElement =
    document.getElementById("track-artist");

const currentTimeElement =
    document.getElementById("current-time");

const durationElement =
    document.getElementById("duration-time");

const progressBar =
    document.getElementById("progress-bar");

const progressFill =
    document.getElementById("progress-fill");

const progressKnob =
    document.getElementById("progress-knob");

const volumeSlider =
    document.getElementById("volume-slider");

const playlistElement =
    document.getElementById("playlist");

const playlistButton =
    document.getElementById("playlist-button");

const closePlaylistButton =
    document.getElementById("close-playlist");

/* Two stacked background videos, used for crossfading */
const bgVideos = [
    document.getElementById("bg-video-a"),
    document.getElementById("bg-video-b")
];

let activeVideoIndex = 0;
let isFirstVideoLoad = true;


/* ============================================================
   FORMAT TIME
============================================================ */

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes =
        Math.floor(seconds / 60);

    const secondsPart =
        Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");

    return `${minutes}:${secondsPart}`;
}


/* ============================================================
   RENDER PLAYLIST
============================================================ */

function renderPlaylist() {

    playlistElement.innerHTML = "";

    playlist.forEach((song, index) => {

        const item =
            document.createElement("li");

        item.innerHTML = `

            <span class="track-num">
                ${index + 1}
            </span>

            <div class="li-meta">

                <div class="li-title">
                    ${song.title}
                </div>

                <div class="li-artist">
                    ${song.artist}
                </div>

            </div>
        `;


        item.addEventListener("click", () => {

            loadTrack(index, true);

            closePlaylist();

        });


        playlistElement.appendChild(item);

    });
}


/* ============================================================
   ACTIVE SONG
============================================================ */

function updateActiveSong() {

    Array
        .from(playlistElement.children)
        .forEach((item, index) => {

            item.classList.toggle(
                "active",
                index === currentIndex
            );

        });
}


/* ============================================================
   SWITCH BACKGROUND VIDEO (crossfade)
   Called from loadTrack() whenever the song changes.

   How it works:
   - There are two <video> elements stacked exactly on top of
     each other (bg-video-a / bg-video-b).
   - Only one has the "active" class at a time, which is what
     controls opacity (see .bg-video / .bg-video.active in CSS).
   - To switch videos, we load the NEW clip into whichever video
     element is currently hidden, start it playing muted, then
     flip the "active" class. The CSS opacity transition makes
     that flip look like a smooth crossfade instead of a hard cut.
   - After the fade finishes, we pause the old (now-hidden) video
     so it isn't wasting CPU/battery in the background.
============================================================ */

function switchBackgroundVideo(song) {

    const nextVideoSrc =
        song.video || DEFAULT_VIDEO;

    const currentVideo =
        bgVideos[activeVideoIndex];

    const alreadyPlayingThisVideo =
        currentVideo.currentSrc &&
        currentVideo.currentSrc.endsWith(nextVideoSrc.replace("./", ""));

    if (alreadyPlayingThisVideo) {
        return;
    }


    /* On the very first load, just show a video directly —
       no need to crossfade from a blank screen. */
    if (isFirstVideoLoad) {

        currentVideo.src = nextVideoSrc;
        currentVideo.load();
        currentVideo.play().catch(() => {});

        isFirstVideoLoad = false;

        return;
    }


    const nextIndex =
        1 - activeVideoIndex;

    const nextVideo =
        bgVideos[nextIndex];

    const oldVideo =
        currentVideo;


    nextVideo.src = nextVideoSrc;
    nextVideo.load();


    const startCrossfade = () => {

        nextVideo
            .play()
            .catch(() => {

                console.log(
                    "Video autoplay was blocked by the browser."
                );

            });

        nextVideo.classList.add("active");

        oldVideo.classList.remove("active");


        /* Pause the old video once it has fully faded out,
           to save resources. Matches the CSS transition time. */
        window.setTimeout(() => {

            oldVideo.pause();

        }, CROSSFADE_MS);

    };


    /* Wait until the new clip actually has a frame ready,
       so we don't fade into a black flash while it buffers. */
    nextVideo.addEventListener(
        "loadeddata",
        startCrossfade,
        { once: true }
    );


    activeVideoIndex = nextIndex;
}


/* ============================================================
   LOAD SONG
============================================================ */

function loadTrack(
    index,
    autoPlay = false
) {

    if (playlist.length === 0) {
        return;
    }


    currentIndex = index;


    const song =
        playlist[currentIndex];


    audio.src =
        song.src;


    titleElement.textContent =
        song.title;


    artistElement.textContent =
        song.artist;


    coverArt.src =
        song.cover ||
        "assets/covers/default-cover.svg";


    currentTimeElement.textContent =
        "0:00";


    durationElement.textContent =
        "0:00";


    progressFill.style.width =
        "0%";


    progressKnob.style.left =
        "0%";


    updateActiveSong();


    /* Crossfade to this song's beach video */
    switchBackgroundVideo(song);


    if (autoPlay) {
        playSong();
    }
}


/* ============================================================
   PLAY
============================================================ */

async function playSong() {

    try {

        await audio.play();

        isPlaying = true;


        playIcon.style.display =
            "none";

        pauseIcon.style.display =
            "block";


        coverArt.classList.add(
            "spinning"
        );


        playingDot.classList.add(
            "active"
        );


        playButton.title =
            "Pause";

    }

    catch (error) {

        console.error(
            "Could not play audio:",
            error
        );

        isPlaying = false;
    }
}


/* ============================================================
   PAUSE
============================================================ */

function pauseSong() {

    audio.pause();

    isPlaying = false;


    playIcon.style.display =
        "block";

    pauseIcon.style.display =
        "none";


    coverArt.classList.remove(
        "spinning"
    );


    playingDot.classList.remove(
        "active"
    );


    playButton.title =
        "Play";
}


/* ============================================================
   PLAY / PAUSE
============================================================ */

playButton.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        if (isPlaying) {

            pauseSong();

        } else {

            playSong();

        }

    }
);


/* ============================================================
   PREVIOUS
============================================================ */

prevButton.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();


        const newIndex =
            (
                currentIndex -
                1 +
                playlist.length
            )
            %
            playlist.length;


        loadTrack(
            newIndex,
            true
        );

    }
);


/* ============================================================
   NEXT
============================================================ */

nextButton.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();


        const newIndex =
            (
                currentIndex +
                1
            )
            %
            playlist.length;


        loadTrack(
            newIndex,
            true
        );

    }
);


/* ============================================================
   AUTO NEXT
============================================================ */

audio.addEventListener(
    "ended",
    () => {

        const newIndex =
            (
                currentIndex +
                1
            )
            %
            playlist.length;


        loadTrack(
            newIndex,
            true
        );

    }
);


/* ============================================================
   AUDIO TIME
============================================================ */

audio.addEventListener(
    "timeupdate",
    () => {

        if (!Number.isFinite(audio.duration)) {
            return;
        }


        const percentage =
            (
                audio.currentTime /
                audio.duration
            ) * 100;


        progressFill.style.width =
            `${percentage}%`;


        progressKnob.style.left =
            `${percentage}%`;


        currentTimeElement.textContent =
            formatTime(
                audio.currentTime
            );

    }
);


/* ============================================================
   AUDIO DURATION
============================================================ */

audio.addEventListener(
    "loadedmetadata",
    () => {

        durationElement.textContent =
            formatTime(
                audio.duration
            );

    }
);


/* ============================================================
   PROGRESS BAR
============================================================ */

progressBar.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();


        if (!Number.isFinite(audio.duration)) {
            return;
        }


        const rect =
            progressBar.getBoundingClientRect();


        const percentage =
            (
                event.clientX -
                rect.left
            )
            /
            rect.width;


        const safePercentage =
            Math.max(
                0,
                Math.min(
                    1,
                    percentage
                )
            );


        audio.currentTime =
            safePercentage *
            audio.duration;

    }
);


/* ============================================================
   VOLUME
============================================================ */

volumeSlider.addEventListener(
    "input",
    (event) => {

        event.stopPropagation();

        audio.volume =
            Number(
                event.target.value
            );

    }
);


volumeSlider.addEventListener(
    "pointerdown",
    (event) => {

        event.stopPropagation();

    }
);


/* ============================================================
   PLAYLIST OPEN / CLOSE
============================================================ */

function openPlaylist() {

    player.classList.add(
        "playlist-open"
    );
}


function closePlaylist() {

    player.classList.remove(
        "playlist-open"
    );
}


playlistButton.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        player.classList.toggle(
            "playlist-open"
        );

    }
);


closePlaylistButton.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        closePlaylist();

    }
);


/* ============================================================
   DRAGGING
============================================================ */

let dragging = false;

let pointerId = null;

let startMouseX = 0;
let startMouseY = 0;

let startPlayerX = 0;
let startPlayerY = 0;


/* ------------------------------------------------------------
   Clamp player inside browser
------------------------------------------------------------ */

function clampPosition(x, y) {

    const width =
        player.offsetWidth;

    const height =
        player.offsetHeight;


    const maxX =
        window.innerWidth -
        width -
        5;


    const maxY =
        window.innerHeight -
        height -
        5;


    return {

        x: Math.max(
            5,
            Math.min(
                x,
                maxX
            )
        ),

        y: Math.max(
            5,
            Math.min(
                y,
                maxY
            )
        )

    };
}


/* ------------------------------------------------------------
   START DRAG
------------------------------------------------------------ */

dragArea.addEventListener(
    "pointerdown",
    (event) => {

        if (
            event.pointerType === "mouse" &&
            event.button !== 0
        ) {
            return;
        }


        const rect =
            player.getBoundingClientRect();


        player.style.left =
            `${rect.left}px`;

        player.style.top =
            `${rect.top}px`;

        player.style.transform =
            "none";


        startMouseX =
            event.clientX;

        startMouseY =
            event.clientY;


        startPlayerX =
            rect.left;

        startPlayerY =
            rect.top;


        pointerId =
            event.pointerId;


        dragging = true;


        player.classList.add(
            "dragging"
        );


        dragArea.setPointerCapture(
            event.pointerId
        );


        event.preventDefault();

    }
);


/* ------------------------------------------------------------
   DRAG MOVE
------------------------------------------------------------ */

dragArea.addEventListener(
    "pointermove",
    (event) => {

        if (
            !dragging ||
            event.pointerId !== pointerId
        ) {
            return;
        }


        const differenceX =
            event.clientX -
            startMouseX;


        const differenceY =
            event.clientY -
            startMouseY;


        const position =
            clampPosition(

                startPlayerX +
                differenceX,

                startPlayerY +
                differenceY

            );


        player.style.left =
            `${position.x}px`;

        player.style.top =
            `${position.y}px`;

    }
);


/* ------------------------------------------------------------
   END DRAG
------------------------------------------------------------ */

function stopDrag(event) {

    if (!dragging) {
        return;
    }


    if (
        event &&
        event.pointerId !== pointerId
    ) {
        return;
    }


    dragging = false;

    pointerId = null;


    player.classList.remove(
        "dragging"
    );


    savePlayerPosition();

}


dragArea.addEventListener(
    "pointerup",
    stopDrag
);


dragArea.addEventListener(
    "pointercancel",
    stopDrag
);


/* ============================================================
   SAVE POSITION
============================================================ */

function savePlayerPosition() {

    const rect =
        player.getBoundingClientRect();


    try {

        localStorage.setItem(
            "konkani-player-position",
            JSON.stringify({
                x: rect.left,
                y: rect.top
            })
        );

    }
    catch (error) {

        console.warn(
            "Could not save player position."
        );

    }
}


/* ============================================================
   RESTORE POSITION
============================================================ */

function restorePlayerPosition() {

    try {

        const saved =
            localStorage.getItem(
                "konkani-player-position"
            );


        if (!saved) {
            return;
        }


        const position =
            JSON.parse(saved);


        if (
            typeof position.x !== "number" ||
            typeof position.y !== "number"
        ) {
            return;
        }


        const safe =
            clampPosition(
                position.x,
                position.y
            );


        player.style.left =
            `${safe.x}px`;


        player.style.top =
            `${safe.y}px`;


        player.style.transform =
            "none";

    }
    catch (error) {

        console.warn(
            "Could not restore player position."
        );

    }
}


/* ============================================================
   KEEP PLAYER INSIDE SCREEN
============================================================ */

window.addEventListener(
    "resize",
    () => {

        const rect =
            player.getBoundingClientRect();


        const safe =
            clampPosition(
                rect.left,
                rect.top
            );


        player.style.left =
            `${safe.x}px`;

        player.style.top =
            `${safe.y}px`;

        player.style.transform =
            "none";

    }
);


/* ============================================================
   BACKGROUND VIDEO — ERROR HANDLING
============================================================ */

bgVideos.forEach((video) => {

    video.addEventListener(
        "error",
        () => {

            console.error(
                "A beach video could not be loaded."
            );

            console.error(
                "Check the 'video' path for the current song in the playlist array."
            );

        }
    );

});


/* ============================================================
   INITIALIZE PLAYER
============================================================ */

renderPlaylist();

loadTrack(
    0,
    false
);

restorePlayerPosition();