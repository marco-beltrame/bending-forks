#!/usr/bin/env python3
"""Compila i documenti LaTeX e prepara il sito.

- Ogni file .tex in src/ (tranne src/comune/) diventa un PDF in _site/pdf/, con lo stesso percorso.
- I file .pdf già pronti in src/ (es. diari di bordo) vengono copiati così come sono.
- In _site/assets/js/documenti.js viene scritto l'elenco dei documenti, che il sito legge da solo.

Struttura attesa:  src/<fase>/<sezione>/<file>.tex
  fase:    candidatura, rtb, pb
  sezione: documenti, verbali-esterni, verbali-interni   (oppure src/diari-di-bordo/<file>.pdf)

Metadati facoltativi in testa al .tex (righe di commento):
  %! titolo: Valutazione dei capitolati
  %! con: Uranion          (solo verbali esterni)
Versione e data si ricavano dal documento e dal nome del file (AAAA-MM-GG_...).

Uso: python3 scripts/compila.py [--solo-sito]
"""
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
SRC = RADICE / "src"
SITO = RADICE / "sito"
OUT = RADICE / "_site"
COMUNE = SRC / "comune"


def metadati(tex: Path) -> dict:
    testo = tex.read_text(encoding="utf-8", errors="ignore")
    meta = dict(re.findall(r"^%!\s*(\w+)\s*:\s*(.+?)\s*$", testo, re.M))
    if "versione" not in meta:
        m = re.search(r"\\textbf\{Versione\}\s*&\s*([0-9]+\.[0-9]+\.[0-9]+)", testo)
        if m:
            meta["versione"] = m.group(1)
    meta["segnaposto"] = len(re.findall(r"\\ph\{", testo))
    return meta


def compila(tex: Path, dest: Path) -> bool:
    dest.parent.mkdir(parents=True, exist_ok=True)
    build = OUT / "_build" / tex.relative_to(SRC).parent
    build.mkdir(parents=True, exist_ok=True)
    env = dict(os.environ, TEXINPUTS=f"{tex.parent}//:{COMUNE}//:")
    cmd = ["pdflatex", "-interaction=nonstopmode", "-halt-on-error", f"-output-directory={build}", tex.name]
    for _ in range(2):  # due passaggi per indice e riferimenti
        r = subprocess.run(cmd, cwd=tex.parent, env=env, capture_output=True, text=True)
        if r.returncode != 0:
            print(f"::error file={tex.relative_to(RADICE)}::compilazione fallita")
            print("\n".join(r.stdout.splitlines()[-25:]))
            return False
    shutil.copy2(build / (tex.stem + ".pdf"), dest)
    return True


def voce(rel: Path, meta: dict) -> dict:
    parti = rel.parts
    if parti[0] == "diari-di-bordo":
        fase, sezione = "", "diari-di-bordo"
    else:
        fase = parti[0]
        sezione = parti[1] if len(parti) > 2 else "documenti"
    nome = rel.stem
    m = re.match(r"(\d{4}-\d{2}-\d{2})", nome)
    return {
        "file": "pdf/" + rel.with_suffix(".pdf").as_posix(),
        "fase": fase,
        "sezione": sezione,
        "nome": nome,
        "titolo": meta.get("titolo", ""),
        "con": meta.get("con", ""),
        "versione": meta.get("versione", ""),
        "data": m.group(1) if m else "",
    }


def main():
    solo_sito = "--solo-sito" in sys.argv
    if OUT.exists():
        shutil.rmtree(OUT)
    shutil.copytree(SITO, OUT)
    (OUT / ".nojekyll").touch()

    documenti, errori = [], 0
    for f in sorted(SRC.rglob("*")):
        if not f.is_file() or COMUNE in f.parents:
            continue
        rel = f.relative_to(SRC)
        dest = OUT / "pdf" / rel.with_suffix(".pdf")
        if f.suffix == ".tex":
            meta = metadati(f)
            if meta["segnaposto"] > 0:
                print(f"::warning file={f.relative_to(RADICE)}::{meta['segnaposto']} segnaposto [..] ancora da compilare")
            if not solo_sito:
                print(f"Compilo {rel}")
                if not compila(f, dest):
                    errori += 1
                    continue
            documenti.append(voce(rel, meta))
        elif f.suffix == ".pdf":
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(f, dest)
            documenti.append(voce(rel, {}))

    shutil.rmtree(OUT / "_build", ignore_errors=True)
    js = "// Generato da scripts/compila.py: non modificare a mano\nwindow.DOCUMENTI = "
    (OUT / "assets/js/documenti.js").write_text(js + json.dumps(documenti, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print(f"{len(documenti)} documenti, {errori} errori")
    sys.exit(1 if errori else 0)


if __name__ == "__main__":
    main()
