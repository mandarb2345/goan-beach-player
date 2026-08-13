# Konkani Konnect — Goa Beach Player

A single web page: looping Goan beach video in the background, custom Spotify-style
music player centered on top, playing your own Konkani MP3s.

## Folder structure
```
goan-beach-player/
├── index.html
├── style.css
├── script.js
└── assets/
    ├── video/        ← put your beach video here (beach.mp4)
    ├── songs/         ← put your mp3 files here
    └── covers/        ← put album cover images here (optional)
```

## Step 1 — Open the project in VS Code
1. Open VS Code.
2. File → Open Folder → select the `goan-beach-player` folder.
3. You should see `index.html`, `style.css`, `script.js`, and `assets/` in the sidebar.

## Step 2 — Add your beach video
1. Rename your downloaded video file to `beach.mp4`.
2. Drag it into `assets/video/` in the VS Code sidebar (or use your file explorer).
   - Keep it under ~15–20MB if possible so the page loads fast. If it's large,
     compress it first (e.g. with HandBrake, free) or trim it to 15–30 seconds —
     it loops anyway, so it doesn't need to be long.

## Step 3 — Add your songs
1. Drag your MP3 files into `assets/songs/`.
2. Open `script.js` and find the `playlist` array near the top.
3. For each song, fill in the real title, artist, and filename, for example:
```js
{
  title: "Rosa Mistica",
  artist: "Lorna",
  src: "assets/songs/rosa-mistica.mp3",
  cover: "assets/covers/rosa-mistica.jpg"
}
```
4. Add or remove objects in the array to match how many songs you have.
   (`cover` is optional — leave it as `"assets/covers/default-cover.svg"` if you
   don't have album art yet.)

## Step 4 — Run it with Live Server
Browsers block video/audio from loading via `file://` paths, so you need a local server:
1. In VS Code, go to the Extensions icon (left sidebar, looks like 4 squares).
2. Search for **"Live Server"** by Ritwick Dey and click Install.
3. Right-click `index.html` in the sidebar → **"Open with Live Server"**.
4. Your browser opens automatically at something like `http://127.0.0.1:5500`.
   The page should now show your looping beach video with the player on top.

## Step 5 — Customize it further (optional)
- Colors, fonts, and card shape live in `style.css` under `:root` at the top —
  change the hex values to retheme everything at once.
- The rotating disc, scalloped card edge, and progress bar are all pure CSS —
  search for `.scallop-edge` or `.cover-art` in `style.css` to tweak them.
- Want autoplay music too? Browsers block autoplaying audio with sound until the
  user interacts with the page once — this is a browser rule, not a bug, so a
  first click on Play is expected.

## Notes on legality
Only add MP3s you own or have the rights to use. This player is just code — it
doesn't come with any music, so the audio is entirely up to what you add.
