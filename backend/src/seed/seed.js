const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Sticker = require("../models/Sticker");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const groups = [
  {
    group: "A",
    teams: [
      { name: "México", code: "MEX" },
      { name: "África do Sul", code: "RSA" },
      { name: "Coreia do Sul", code: "KOR" },
      { name: "República Tcheca", code: "CZE" },
    ],
  },
  {
    group: "B",
    teams: [
      { name: "Canadá", code: "CAN" },
      { name: "Bósnia e Herzegovina", code: "BIH" },
      { name: "Catar", code: "QAT" },
      { name: "Suíça", code: "SUI" },
    ],
  },
  {
    group: "C",
    teams: [
      { name: "Brasil", code: "BRA" },
      { name: "Marrocos", code: "MAR" },
      { name: "Haiti", code: "HAI" },
      { name: "Escócia", code: "SCO" },
    ],
  },
  {
    group: "D",
    teams: [
      { name: "Estados Unidos", code: "USA" },
      { name: "Paraguai", code: "PAR" },
      { name: "Austrália", code: "AUS" },
      { name: "Turquia", code: "TUR" },
    ],
  },
  {
    group: "E",
    teams: [
      { name: "Alemanha", code: "GER" },
      { name: "Curaçao", code: "CUW" },
      { name: "Costa do Marfim", code: "CIV" },
      { name: "Equador", code: "ECU" },
    ],
  },
  {
    group: "F",
    teams: [
      { name: "Holanda", code: "NED" },
      { name: "Japão", code: "JPN" },
      { name: "Suécia", code: "SWE" },
      { name: "Tunísia", code: "TUN" },
    ],
  },
  {
    group: "G",
    teams: [
      { name: "Bélgica", code: "BEL" },
      { name: "Egito", code: "EGY" },
      { name: "Irã", code: "IRN" },
      { name: "Nova Zelândia", code: "NZL" },
    ],
  },
  {
    group: "H",
    teams: [
      { name: "Espanha", code: "ESP" },
      { name: "Cabo Verde", code: "CPV" },
      { name: "Arábia Saudita", code: "KSA" },
      { name: "Uruguai", code: "URU" },
    ],
  },
  {
    group: "I",
    teams: [
      { name: "França", code: "FRA" },
      { name: "Senegal", code: "SEN" },
      { name: "Iraque", code: "IRQ" },
      { name: "Noruega", code: "NOR" },
    ],
  },
  {
    group: "J",
    teams: [
      { name: "Argentina", code: "ARG" },
      { name: "Argélia", code: "ALG" },
      { name: "Áustria", code: "AUT" },
      { name: "Jordânia", code: "JOR" },
    ],
  },
  {
    group: "K",
    teams: [
      { name: "Portugal", code: "POR" },
      { name: "RD Congo", code: "COD" },
      { name: "Uzbequistão", code: "UZB" },
      { name: "Colômbia", code: "COL" },
    ],
  },
  {
    group: "L",
    teams: [
      { name: "Inglaterra", code: "ENG" },
      { name: "Croácia", code: "CRO" },
      { name: "Gana", code: "GHA" },
      { name: "Panamá", code: "PAN" },
    ],
  },
];

const fwcDescriptions = {
  1: "Taça da Copa (1)",
  2: "Taça da Copa (2)",
  3: "Mascote Oficial",
  4: "Slogan Oficial",
  5: "Bola Oficial",
  6: "País-sede: EUA",
  7: "País-sede: México",
  8: "País-sede: Canadá",
  9: "História da Copa: Itália 1934",
  10: "História da Copa: Uruguai 1950",
  11: "História da Copa: Alemanha 1954",
  12: "História da Copa: Brasil 1962",
  13: "História da Copa: Alemanha 1974",
  14: "História da Copa: Argentina 1986",
  15: "História da Copa: Brasil 1994",
  16: "História da Copa: Brasil 2002",
  17: "História da Copa: Itália 2006",
  18: "História da Copa: Alemanha 2014",
  19: "História da Copa: Argentina 2022",
};

const teamStickerDescription = (number) => {
  if (number === 1) return "Logo da seleção";
  if (number === 13) return "Foto oficial da equipe";
  return `Jogador ${number}`;
};

const extraColors = ["bronze", "prata", "ouro", "roxa"];
const extraPlayers = 20;

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado ao MongoDB");

    await Sticker.deleteMany({});
    console.log("🗑️  Figurinhas antigas removidas");

    const stickers = [];
    let order = 1;

    // Logo Panini
    stickers.push({
      code: "00",
      section: "FWC",
      group: null,
      team: null,
      teamCode: null,
      number: 0,
      description: "Logo da Panini",
      isSpecial: false,
      extraColor: null,
      order: order++,
    });

    // FWC1-19
    for (let i = 1; i <= 19; i++) {
      stickers.push({
        code: `FWC${i}`,
        section: "FWC",
        group: null,
        team: null,
        teamCode: null,
        number: i,
        description: fwcDescriptions[i],
        isSpecial: false,
        extraColor: null,
        order: order++,
      });
    }

    // Seleções por grupo
    for (const groupData of groups) {
      for (const team of groupData.teams) {
        for (let i = 1; i <= 20; i++) {
          stickers.push({
            code: `${team.code}${i}`,
            section: "team",
            group: groupData.group,
            team: team.name,
            teamCode: team.code,
            number: i,
            description: teamStickerDescription(i),
            isSpecial: false,
            extraColor: null,
            order: order++,
          });
        }
      }
    }

    // Cola-Cola CC1-CC14
    for (let i = 1; i <= 14; i++) {
      stickers.push({
        code: `CC${i}`,
        section: "coca-cola",
        group: null,
        team: null,
        teamCode: null,
        number: i,
        description: `Figurinha Coca-Cola ${i}`,
        isSpecial: true,
        extraColor: null,
        order: order++,
      });
    }

    // Extra Stickers (20 jogadores x 4 cores = 80)
    for (let i = 1; i <= extraPlayers; i++) {
      for (const color of extraColors) {
        stickers.push({
          code: `EXTRA${i}-${color.toUpperCase()}`,
          section: "extra",
          group: null,
          team: null,
          teamCode: null,
          number: i,
          description: `Extra Sticker ${i} - ${color}`,
          isSpecial: true,
          extraColor: color,
          order: order++,
        });
      }
    }

    await Sticker.insertMany(stickers);
    console.log(`✅ ${stickers.length} figurinhas inseridas com sucesso!`);

    await mongoose.disconnect();
    console.log("🔌 Desconectado do MongoDB");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro no seed:", err.message);
    process.exit(1);
  }
}

seed();
