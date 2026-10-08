# Shmup record book

A static page that lists shmup high scores and clears from one JSON file. No build step, no dependencies.

## Put it on GitHub Pages

1. Create a new public repository (for example `shmup-records`).
2. Upload everything in this folder to the repository root: `index.html`, `style.css`, `app.js`, `README.md` and the `data` folder.
3. In the repository, open **Settings → Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose the `main` branch and the `/ (root)` folder, then save.
4. After a minute or so the site is live at `https://<your-username>.github.io/<repo-name>/`.

To use `https://<your-username>.github.io/` instead, name the repository `<your-username>.github.io`.

## Add or edit entries

Edit `data/scores.json` and commit. Each entry is one run:

| Field | Required | Notes |
| --- | --- | --- |
| `game` | yes | Entries with the same `game` are grouped together |
| `score` | no | A plain number, no commas. Leave it out for a clear with no score logged |
| `clear` | no | `"1CC"` or `"2-ALL"`. Leave it out for a score without a clear |
| `ship` | no | Ship, type or character |
| `mode` | no | Difficulty, loop, version or any other mode |
| `date` | no | `YYYY-MM-DD` (or `YYYY-MM`) |
| `platform` | no | For example `FinalBurn Neo`, `PCB`, `Switch` |
| `proof` | no | Link to a video, replay or screenshot (`http` or `https` only) |
| `notes` | no | Free text |
| `hardware`, `year`, `rom` | no | Game details. Only the first entry for each game needs them. `rom` is searchable |

The sample entries are placeholders. Delete them before you publish.

## Preview locally

Browsers block `fetch` on files opened from disk, so run a small server from this folder:

```
python -m http.server
```

Then open http://localhost:8000.
