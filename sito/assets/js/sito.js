// Costruisce la pagina da window.SITO (config.js) e window.DOCUMENTI (generato in pubblicazione)
(function () {
  const S = window.SITO;
  const D = window.DOCUMENTI || [];
  const main = document.getElementById("contenuto");
  const salti = document.getElementById("salti");

  function el(tag, attrs, ...figli) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === undefined || v === null || v === "") continue;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else n.setAttribute(k, v);
    }
    for (const f of figli) if (f) n.append(f);
    return n;
  }

  // Titolo leggibile dal nome del file: "valutazione-capitolati" -> "Valutazione capitolati"
  const daNome = (nome) => {
    const t = nome.replace(/^\d{4}-\d{2}-\d{2}_?/, "").replace(/[-_]+/g, " ").trim();
    return t.charAt(0).toUpperCase() + t.slice(1);
  };
  const recenti = (a, b) => (b.data || "").localeCompare(a.data || "");

  // Una riga: titolo a sinistra, versione e link PDF a destra
  function riga(titolo, d) {
    const destra = el("span", { class: "dx" });
    if (d.versione) destra.append(el("span", { class: "ver", text: "v" + d.versione }));
    destra.append(d.file
      ? el("a", { class: "pdf", href: d.file, target: "_blank", rel: "noopener", text: "PDF" })
      : el("span", { class: "prep", text: "in preparazione" }));
    return el("li", { class: d.file ? "" : "off" }, el("span", { class: "tit" }, titolo), destra);
  }

  function sezione(id, titolo, nota, ...corpo) {
    salti.append(el("a", { href: "#" + id, text: titolo }));
    main.append(el("section", { id }, el("h2", {}, titolo, nota ? el("span", { class: "nota", text: nota }) : null), ...corpo));
  }

  function listaVerbali(voci, esterni) {
    const lista = el("ul", { class: "lista" });
    if (!voci.length) lista.append(el("li", { class: "vuoto", text: "Nessun verbale" }));
    voci.sort(recenti).forEach((v) => {
      const con = esterni ? v.con || daNome(v.nome.replace(/^.*verbale-esterno-?/, "")) : "";
      lista.append(riga(el("span", {}, el("span", { class: "data", text: v.data }), con ? " · " + con : ""), v));
    });
    return lista;
  }

  // Intestazione
  const info = document.getElementById("info");
  info.append(
    el("strong", { text: `Gruppo ${S.gruppo.numero}` }), " · ",
    `Capitolato ${S.capitolato.codice} `, el("strong", { text: S.capitolato.nome }), ` (${S.capitolato.proponente})`, " · ",
    el("a", { href: "mailto:" + S.gruppo.email, text: S.gruppo.email })
  );
  if (S.gruppo.github) info.append(" · ", el("a", { href: S.gruppo.github, text: "GitHub" }));

  // Fasi: documenti (attesi + presenti) e verbali della fase
  for (const f of S.fasi) {
    const diFase = D.filter((d) => d.fase === f.id);
    const docs = diFase.filter((d) => d.sezione === "documenti");
    const est = diFase.filter((d) => d.sezione === "verbali-esterni");
    const int = diFase.filter((d) => d.sezione === "verbali-interni");
    if (!docs.length && !est.length && !int.length && !(f.attesi || []).length) continue;

    const corpo = [];
    const righe = (f.attesi || []).map((a) => {
      const trovato = docs.find((d) => d.nome === a.nome);
      return riga(a.titolo, trovato || {});
    });
    docs.filter((d) => !(f.attesi || []).some((a) => a.nome === d.nome))
      .forEach((d) => righe.push(riga(d.titolo || daNome(d.nome), d)));
    if (righe.length) {
      const lista = el("ul", { class: "lista" });
      righe.forEach((r) => lista.append(r));
      corpo.push(el("h3", { text: "Documenti" }), lista);
    }
    corpo.push(el("div", { class: "colonne" },
      el("div", {}, el("h3", { text: "Verbali esterni" }), listaVerbali(est, true)),
      el("div", {}, el("h3", { text: "Verbali interni" }), listaVerbali(int, false))));
    sezione(f.id, f.titolo, f.scadenza ? "consegna " + f.scadenza : "", ...corpo);
  }

  // Diari di bordo
  const diari = el("ul", { class: "lista" });
  const voci = D.filter((d) => d.sezione === "diari-di-bordo").sort(recenti);
  if (!voci.length) diari.append(el("li", { class: "vuoto", text: "Nessun diario di bordo" }));
  voci.forEach((d) => diari.append(riga(el("span", { class: "data", text: d.data || d.nome }), d)));
  sezione("diari", "Diari di bordo", "", diari);

  // Team
  const team = el("ul", { class: "team" });
  S.membri.forEach((m) => team.append(el("li", {}, el("span", { text: m.nome }), el("span", { class: "data", text: m.matricola }))));
  sezione("team", "Team", "", team);

  document.getElementById("piede").textContent = `${S.gruppo.nome} · ${S.gruppo.corso}`;
})();
