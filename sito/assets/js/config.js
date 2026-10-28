// Informazioni fisse del sito. I documenti NON si elencano qui:
// il sito li trova da solo in base ai file presenti in src/ (vedi README).

window.SITO = {
  gruppo: {
    nome: "Bending Forks",
    numero: 15,
    email: "bending.forks.swe@gmail.com",
    github: "", // es. "https://github.com/bending-forks"
    corso: "Ingegneria del Software · A.A. 2026/27 · Università degli Studi di Padova",
  },

  capitolato: { codice: "C3", nome: "Fossdot", proponente: "Uranion" },

  // Fasi in ordine. Una fase compare solo se ha documenti (o documenti attesi).
  // "attesi": documenti previsti per la fase. Il nome deve coincidere con il file in
  // src/<fase>/documenti/<nome>.tex; finché il file non c'è compare "in preparazione".
  fasi: [
    {
      id: "candidatura",
      titolo: "Candidatura",
      scadenza: "2026-10-30",
      attesi: [
        { nome: "lettera-di-presentazione", titolo: "Lettera di presentazione" },
        { nome: "valutazione-capitolati", titolo: "Valutazione dei capitolati" },
        { nome: "preventivo-costi", titolo: "Preventivo dei costi e assunzione degli impegni" },
      ],
    },
    { id: "rtb", titolo: "RTB", attesi: [] },
    { id: "pb", titolo: "PB", attesi: [] },
  ],

  membri: [
    { nome: "Marco Beltrame", matricola: "2111021" },
    { nome: "Lorenzo Milanese", matricola: "2117110" },
    { nome: "Filippo Rampazzo", matricola: "2101097" },
    { nome: "Nicholas Salmaso", matricola: "2080038" },
    { nome: "Luca Stangherlin", matricola: "2137996" },
    { nome: "Aldo Toffoli", matricola: "2113202" },
    { nome: "Matteo Wu", matricola: "2075514" },
  ],
};
