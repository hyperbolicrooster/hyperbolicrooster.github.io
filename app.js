(function () {
  "use strict";

  const PAD = 10; // scores are shown zero-padded to this many digits, like an arcade display

  const $ = (id) => document.getElementById(id);
  const els = {
    archive: $("archive"),
    q: $("q"),
    status: $("status"),
    platform: $("platform"),
    sort: $("sort"),
    count: $("count"),
    empty: $("empty"),
    error: $("error"),
  };

  let entries = [];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function isSafeUrl(value) {
    try {
      const u = new URL(value, location.href);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch (e) {
      return false;
    }
  }

  function hasScore(e) {
    return typeof e.score === "number" && isFinite(e.score);
  }

  function renderScore(e) {
    const node = el("div", "score");
    if (!hasScore(e)) {
      node.classList.add("none");
      node.textContent = "No score logged";
      return node;
    }
    const digits = String(Math.trunc(e.score));
    const padded = digits.padStart(PAD, "0");
    const lead = padded.length - digits.length;
    node.setAttribute("aria-label", e.score.toLocaleString() + " points");
    if (lead > 0) {
      const zeros = el("span", "z", padded.slice(0, lead));
      zeros.setAttribute("aria-hidden", "true");
      node.appendChild(zeros);
    }
    const real = el("span", null, digits);
    real.setAttribute("aria-hidden", "true");
    node.appendChild(real);
    return node;
  }

  function renderBadge(e) {
    const slot = el("div", "badge-slot");
    if (e.clear === "1CC") slot.appendChild(el("span", "badge cc1", "1CC"));
    else if (e.clear === "2-ALL") slot.appendChild(el("span", "badge all2", "2-ALL"));
    return slot;
  }

  function renderEntry(e) {
    const li = el("li", "entry");
    const info = el("div", "entry-info");

    const what = [e.ship, e.mode].filter(Boolean).join(", ") || "Standard run";
    info.appendChild(el("div", "entry-what", what));

    const sub = el("p", "entry-sub");
    const bits = [];
    if (e.date) bits.push(document.createTextNode(e.date));
    if (e.platform) bits.push(document.createTextNode(e.platform));
    if (e.proof && isSafeUrl(e.proof)) {
      const a = el("a", null, "Proof");
      a.href = e.proof;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      bits.push(a);
    }
    bits.forEach((b, i) => {
      if (i > 0) sub.appendChild(document.createTextNode(", "));
      sub.appendChild(b);
    });
    if (bits.length) info.appendChild(sub);

    if (e.notes) info.appendChild(el("p", "entry-note", e.notes));

    li.appendChild(info);
    li.appendChild(renderScore(e));
    li.appendChild(renderBadge(e));
    return li;
  }

  function matchesStatus(e, status) {
    switch (status) {
      case "clears": return e.clear === "1CC" || e.clear === "2-ALL";
      case "1CC": return e.clear === "1CC";
      case "2-ALL": return e.clear === "2-ALL";
      case "scores": return !e.clear;
      default: return true;
    }
  }

  const NO_PLATFORM = "__none__";

  function matchesPlatform(e, value) {
    if (value === "all") return true;
    if (value === NO_PLATFORM) return !e.platform;
    return e.platform === value;
  }

  function populatePlatforms() {
    const names = Array.from(new Set(entries.map((e) => e.platform).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    names.forEach((name) => {
      const opt = el("option", null, name);
      opt.value = name;
      els.platform.appendChild(opt);
    });
    if (entries.some((e) => !e.platform) && names.length) {
      const opt = el("option", null, "No platform listed");
      opt.value = NO_PLATFORM;
      els.platform.appendChild(opt);
    }
    els.platform.disabled = names.length === 0;
  }

  function matchesQuery(e, q) {
    if (!q) return true;
    const hay = [e.game, e.ship, e.mode, e.notes, e.platform, e.hardware, e.rom]
      .filter(Boolean).join(" ").toLowerCase();
    return q.split(/\s+/).every((word) => hay.includes(word));
  }

  function groupByGame(list) {
    const map = new Map();
    list.forEach((e) => {
      if (!map.has(e.game)) map.set(e.game, []);
      map.get(e.game).push(e);
    });
    return Array.from(map, ([game, items]) => ({ game, items }));
  }

  function latestDate(items) {
    return items.reduce((max, e) => (e.date && e.date > max ? e.date : max), "");
  }

  function sortGroups(groups, mode) {
    const byTitle = (a, b) => a.game.localeCompare(b.game, undefined, { sensitivity: "base" });
    if (mode === "recent") {
      groups.sort((a, b) => latestDate(b.items).localeCompare(latestDate(a.items)) || byTitle(a, b));
    } else if (mode === "year") {
      const year = (g) => g.items.find((e) => e.year)?.year || 9999;
      groups.sort((a, b) => year(a) - year(b) || byTitle(a, b));
    } else {
      groups.sort(byTitle);
    }
  }

  function sortEntries(items) {
    // Clears first (higher score first within each), then by score, then newest date
    items.sort((a, b) => {
      const sa = hasScore(a) ? a.score : -1;
      const sb = hasScore(b) ? b.score : -1;
      return sb - sa || (b.date || "").localeCompare(a.date || "");
    });
  }

  function render() {
    const q = els.q.value.trim().toLowerCase();
    const filtered = entries.filter(
      (e) => matchesStatus(e, els.status.value) && matchesPlatform(e, els.platform.value) && matchesQuery(e, q)
    );
    const groups = groupByGame(filtered);
    sortGroups(groups, els.sort.value);

    els.archive.replaceChildren();
    groups.forEach(({ game, items }) => {
      sortEntries(items);
      const section = el("section", "game");
      const head = el("div", "game-head");
      head.appendChild(el("h2", null, game));
      const first = items[0];
      const meta = [first.hardware, first.year].filter(Boolean).join(", ");
      if (meta) head.appendChild(el("p", "game-meta", meta));
      section.appendChild(head);

      const list = el("ul", "entries");
      items.forEach((e) => list.appendChild(renderEntry(e)));
      section.appendChild(list);
      els.archive.appendChild(section);
    });

    els.empty.hidden = filtered.length > 0 || entries.length === 0;
    els.count.textContent = entries.length
      ? "Showing " + filtered.length + " of " + entries.length + " entries in " + groups.length +
        (groups.length === 1 ? " game." : " games.")
      : "";
  }

  function renderTally() {
    const games = new Set(entries.map((e) => e.game));
    const clearedGames = (type) => new Set(entries.filter((e) => e.clear === type).map((e) => e.game)).size;
    $("stat-games").textContent = games.size;
    $("stat-1cc").textContent = clearedGames("1CC");
    $("stat-2all").textContent = clearedGames("2-ALL");
    $("stat-scores").textContent = entries.filter(hasScore).length;
  }

  function showError(message) {
    els.error.textContent = message;
    els.error.hidden = false;
  }

  function init(data) {
    if (!Array.isArray(data)) throw new Error("scores.json must be a list of entries.");
    entries = data.filter((e) => e && typeof e.game === "string" && e.game.trim());
    renderTally();
    populatePlatforms();
    render();
  }

  ["input", "change"].forEach((evt) => {
    els.q.addEventListener(evt, render);
    els.status.addEventListener(evt, render);
    els.platform.addEventListener(evt, render);
    els.sort.addEventListener(evt, render);
  });

  fetch("data/scores.json", { cache: "no-cache" })
    .then((res) => {
      if (!res.ok) throw new Error("Could not load data/scores.json (HTTP " + res.status + ").");
      return res.json();
    })
    .then(init)
    .catch((err) => {
      showError(
        err.message + " If you opened index.html straight from disk, run a local server instead, " +
        "for example: python -m http.server"
      );
    });
})();
