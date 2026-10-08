# Shmup record book

A static page that lists shmup high scores and clears from a JSON file. No build step, no dependencies.

## Put it on GitHub Pages

1. Create a new public repository (for example `shmup-records`).
2. Upload everything in this folder to the repository root: `index.html`, `style.css`, `app.js`, `README.md`, and the `assets` and `data` folders.
3. In the repository, open **Settings → Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose the `main` branch and the `/ (root)` folder, then save.
4. After a minute or so the site is live at `https://<your-username>.github.io/<repo-name>/`.

GitHub's file uploader skips folders you select individually. Drag the whole folder in, or use **Add file → Create new file** and type the path (for example `data/site.json`).

## Add or edit entries (`data/scores.json`)

Each entry is one run:

| Field | Required | Notes |
| --- | --- | --- |
| `game` | yes | Entries with the same `game` are grouped together |
| `score` | no | A plain number, no commas. Leave it out for a clear with no score logged |
| `clear` | no | `"1CC"` or `"2-ALL"`. Leave it out for a score without a clear |
| `ship` | no | Ship, type or character |
| `mode` | no | Difficulty, loop, version or any other mode |
| `date` | no | `YYYY-MM-DD` (or `YYYY-MM`) |
| `platform` | no | For example `FinalBurn Neo`, `PCB`, `Switch`. Feeds the Platform dropdown |
| `video` | no | Link to the YouTube video (`http` or `https` only). Shown as a "Video" link. An older `proof` field still works until you rename it |
| `notes` | no | Free text |
| `developer`, `hardware`, `year`, `rom` | no | Game details. Put them on any one entry for the game. `developer` and `rom` are searchable |

## Social links and latest upload (`data/site.json`)

```json
{
  "youtubeChannelId": "UCxxxxxxxxxxxxxxxxxxxxxx",
  "links": [
    { "label": "YouTube", "url": "https://www.youtube.com/@your-handle" },
    { "label": "Twitch", "url": "https://www.twitch.tv/your-handle" }
  ]
}
```

- `links` becomes the row of buttons in the header. Add, remove or rename them freely.
- `youtubeChannelId` turns on the "Latest upload" player. It is the channel ID, which starts with `UC` and is 24 characters long, not the `@handle`. To find it, open YouTube Studio, then **Settings → Channel → Advanced settings**. Leave it as `""` to hide the player.
- The player loads your channel's uploads playlist, which starts on the newest upload, so it updates by itself when you publish a new video.

## Preview locally

Browsers block `fetch` on files opened from disk, so run a small server from this folder:

```
python -m http.server
```

Then open http://localhost:8000.
