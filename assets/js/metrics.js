/* === EQUILIBRIUM METRICS v2 (Local, deterministic, no backend) === */
const EQ = {
  key: "eq_metrics_v2",
  schema() {
    return { avvio: [], stabilita: [], chiusura: [], recupero: [] };
  },
  load() {
    try {
      return JSON.parse(localStorage.getItem(this.key)) || this.schema();
    } catch (e) {
      return this.schema();
    }
  },
  save(data) {
    localStorage.setItem(this.key, JSON.stringify(data));
  },
  nowISO() {
    return new Date().toISOString();
  },
  add(type, value) {
    if (value === "" || value === null || value === undefined) return;
    const v = Number(value);
    if (!Number.isFinite(v)) return;
    const data = this.load();
    if (!data[type]) data[type] = [];
    data[type].push({ value: v, date: this.nowISO() });
    this.save(data);
    this.render();
  },
  reset() {
    localStorage.removeItem(this.key);
    this.render();
  },
  avg(arr) {
    if (!arr || arr.length === 0) return null;
    const s = arr.reduce((a, b) => a + b.value, 0);
    return s / arr.length;
  },
  lastN(arr, n) {
    if (!arr) return [];
    return arr.slice(Math.max(0, arr.length - n));
  },
  withinDays(arr, days) {
    const cut = Date.now() - days * 86400000;
    return (arr || []).filter(x => new Date(x.date).getTime() >= cut);
  },
  fmt1(x) {
    if (x === null || x === undefined) return "—";
    return (Math.round(x * 10) / 10).toFixed(1);
  },
  setText(id, txt) {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  },

  /* --- deterministic interpretation --- */
  score(data) {
    const A = this.avg(this.withinDays(data.avvio, 14));       // minutes (lower better)
    const S = this.avg(this.withinDays(data.stabilita, 14));   // minutes (higher better)
    const C = this.avg(this.withinDays(data.chiusura, 14));    // 0/1 (higher better)
    const R = this.avg(this.withinDays(data.recupero, 14));    // 1-10 (higher better)

    // Normalize into 0..100
    // Avvio: 0 min->100, 15+ min->0
    let av = (A === null) ? null : Math.max(0, Math.min(100, 100 - (A / 15) * 100));
    // Stabilita: 10 min->0, 45+ min->100
    let st = (S === null) ? null : Math.max(0, Math.min(100, ((S - 10) / 35) * 100));
    // Chiusura: 0->0, 1->100
    let ch = (C === null) ? null : Math.max(0, Math.min(100, C * 100));
    // Recupero: 1->0, 10->100
    let re = (R === null) ? null : Math.max(0, Math.min(100, ((R - 1) / 9) * 100));

    const parts = [av, st, ch, re].filter(x => x !== null);
    const overall = parts.length ? parts.reduce((a,b)=>a+b,0)/parts.length : null;

    // Weakest module mapping
    const map = [
      { k: "Innesco", v: av, why: "Tempo di avvio alto" },
      { k: "Tunnel Controllato", v: st, why: "Stabilità sessione bassa" },
      { k: "Chiusura Protetta", v: ch, why: "Chiusure instabili" },
      { k: "Recupero Strategico", v: re, why: "Recupero insufficiente" }
    ].filter(x => x.v !== null);

    map.sort((a,b)=>a.v-b.v);
    const weakest = map.length ? map[0] : null;

    let label = "—";
    let band = "neutral";
    if (overall !== null) {
      if (overall >= 75) { label = "Stabile"; band = "good"; }
      else if (overall >= 55) { label = "Fragile ma recuperabile"; band = "warn"; }
      else { label = "A rischio (serve architettura)"; band = "bad"; }
    }

    return { A, S, C, R, av, st, ch, re, overall, label, band, weakest };
  },

  /* --- simple canvas sparkline --- */
  drawSpark(canvasId, arr, mode) {
    const c = document.getElementById(canvasId);
    if (!c) return;
    const ctx = c.getContext("2d");
    const w = c.width, h = c.height;

    ctx.clearRect(0,0,w,h);

    const data = this.lastN(arr || [], 14);
    if (!data.length) {
      ctx.globalAlpha = 0.6;
      ctx.font = "12px system-ui";
      ctx.fillText("Nessun dato", 10, 20);
      ctx.globalAlpha = 1;
      return;
    }

    const vals = data.map(x=>x.value);
    let min = Math.min(...vals), max = Math.max(...vals);
    if (min === max) { min -= 1; max += 1; }

    // For "lower is better" (avvio) invert for display consistency
    const invert = (mode === "lowerBetter");

    const pad = 10;
    const nx = data.length - 1;

    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((p, i) => {
      const x = pad + (nx === 0 ? 0 : (i / nx) * (w - pad*2));
      let yNorm = (p.value - min) / (max - min);
      if (invert) yNorm = 1 - yNorm;
      const y = pad + yNorm * (h - pad*2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // dots
    ctx.globalAlpha = 0.7;
    data.forEach((p,i)=>{
      const x = pad + (nx === 0 ? 0 : (i / nx) * (w - pad*2));
      let yNorm = (p.value - min) / (max - min);
      if (invert) yNorm = 1 - yNorm;
      const y = pad + yNorm * (h - pad*2);
      ctx.beginPath();
      ctx.arc(x,y,2.5,0,Math.PI*2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  },

  exportCSV(data) {
    const rows = [["type","value","date"]];
    ["avvio","stabilita","chiusura","recupero"].forEach(t=>{
      (data[t]||[]).forEach(r=>{
        rows.push([t, String(r.value), r.date]);
      });
    });
    return rows.map(r=>r.map(x=>{
      const s = String(x).replace(/"/g,'""');
      return `"${s}"`;
    }).join(",")).join("\n");
  },

  download(filename, content, mime) {
    const blob = new Blob([content], {type: mime});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
  },

  render() {
    const data = this.load();
    const s = this.score(data);

    // Averages
    this.setText("avg-avvio", s.A===null ? "—" : this.fmt1(s.A) + " min");
    this.setText("avg-stabilita", s.S===null ? "—" : this.fmt1(s.S) + " min");
    this.setText("avg-chiusura", s.C===null ? "—" : this.fmt1(s.C));
    this.setText("avg-recupero", s.R===null ? "—" : this.fmt1(s.R));

    // Status
    this.setText("eq-status", s.label);
    this.setText("eq-score", s.overall===null ? "—" : this.fmt1(s.overall) + "/100");
    this.setText("eq-weakest", s.weakest ? (s.weakest.k + " • " + s.weakest.why) : "—");

    const badge = document.getElementById("eq-badge");
    if (badge) {
      badge.classList.remove("badge--good","badge--warn","badge--bad");
      if (s.band === "good") badge.classList.add("badge--good");
      if (s.band === "warn") badge.classList.add("badge--warn");
      if (s.band === "bad") badge.classList.add("badge--bad");
    }

    // Sparklines
    this.drawSpark("spark-avvio", data.avvio, "lowerBetter");
    this.drawSpark("spark-stabilita", data.stabilita, "higherBetter");
    this.drawSpark("spark-chiusura", data.chiusura, "higherBetter");
    this.drawSpark("spark-recupero", data.recupero, "higherBetter");

    // Bind export buttons once
    const csvBtn = document.getElementById("btn-export-csv");
    if (csvBtn && !csvBtn.dataset.bound) {
      csvBtn.dataset.bound = "1";
      csvBtn.addEventListener("click", ()=>{
        const d = this.load();
        const csv = this.exportCSV(d);
        this.download("equilibrium_metrics.csv", csv, "text/csv");
      });
    }
    const jsonBtn = document.getElementById("btn-export-json");
    if (jsonBtn && !jsonBtn.dataset.bound) {
      jsonBtn.dataset.bound = "1";
      jsonBtn.addEventListener("click", ()=>{
        const d = this.load();
        this.download("equilibrium_metrics.json", JSON.stringify(d,null,2), "application/json");
      });
    }
  }
};

window.addEventListener("load", ()=>EQ.render());
