# Bending Forks · Gruppo 15

Sito e documentazione del gruppo 15 *Bending Forks* (Ingegneria del Software 2026/27, Università di Padova).
Sito: https://marco-beltrame.github.io/bending-forks/

Ad ogni push su `main` una GitHub Action compila i sorgenti LaTeX e pubblica il sito su GitHub Pages.

## Struttura

```
src/                     sorgenti dei documenti che finiscono sul sito
  comune/                stile comune (bendingforks.sty) e logo, usabili da tutti i .tex
  candidatura/
    documenti/           lettera-di-presentazione.tex, valutazione-capitolati.tex, preventivo-costi.tex
    verbali-esterni/     AAAA-MM-GG_verbale-esterno-<azienda>.tex
    verbali-interni/     AAAA-MM-GG_verbale-interno.tex
  rtb/ , pb/             stessa struttura di candidatura/
  diari-di-bordo/        AAAA-MM-GG_diario-di-bordo.pdf (PDF già pronti, copiati così come sono)
modelli/                 template da copiare in src/ (non vengono pubblicati)
sito/                    pagina web (HTML, CSS, JS)
scripts/compila.py       compila i .tex in PDF e genera l'elenco dei documenti
```

## Come si pubblica un documento
1. Metti il `.tex` nella cartella giusta di `src/` (il nome del file decide dove compare sul sito).
2. Fai commit e push su `main`. Dopo un paio di minuti il PDF è online.

Il sito trova i documenti da solo: non c'è nessun elenco da aggiornare a mano.
Versione e data si leggono dal documento (riga `Versione` in copertina) e dal nome del file.
In testa al `.tex` si possono aggiungere metadati facoltativi:

```
%! titolo: Valutazione dei capitolati
%! con: Uranion
```

Nel log dell'Action compare un avviso per ogni documento che contiene ancora segnaposto `\ph{...}`;
se un documento non compila, l'Action fallisce e il sito resta quello precedente.

I documenti attesi in ogni fase (che compaiono come "in preparazione" finché non ci sono) e i dati del gruppo
sono in `sito/assets/js/config.js`.

## Provare in locale
Serve una distribuzione LaTeX (TeX Live o MiKTeX) e Python 3:

```
python3 scripts/compila.py
```

poi apri `_site/index.html` nel browser.

## Attivare GitHub Pages (una volta sola)
Settings → Pages → Build and deployment → Source: **GitHub Actions**.
