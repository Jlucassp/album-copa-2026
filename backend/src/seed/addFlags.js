const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Sticker = require("../models/Sticker");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const flags = {
  // Grupo A
  MEX: "🇲🇽",
  RSA: "🇿🇦",
  KOR: "🇰🇷",
  CZE: "🇨🇿",
  // Grupo B
  CAN: "🇨🇦",
  BIH: "🇧🇦",
  QAT: "🇶🇦",
  SUI: "🇨🇭",
  // Grupo C
  BRA: "🇧🇷",
  MAR: "🇲🇦",
  SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  HAI: "🇭🇹",
  // Grupo D
  USA: "🇺🇸",
  PAR: "🇵🇾",
  AUS: "🇦🇺",
  TUR: "🇹🇷",
  // Grupo E
  GER: "🇩🇪",
  CUW: "🇨🇼",
  CIV: "🇨🇮",
  ECU: "🇪🇨",
  // Grupo F
  NED: "🇳🇱",
  JPN: "🇯🇵",
  SWE: "🇸🇪",
  TUN: "🇹🇳",
  // Grupo G
  BEL: "🇧🇪",
  EGY: "🇪🇬",
  IRN: "🇮🇷",
  NZL: "🇳🇿",
  // Grupo H
  ESP: "🇪🇸",
  CPV: "🇨🇻",
  KSA: "🇸🇦",
  URU: "🇺🇾",
  // Grupo I
  FRA: "🇫🇷",
  SEN: "🇸🇳",
  IRQ: "🇮🇶",
  NOR: "🇳🇴",
  // Grupo J
  ARG: "🇦🇷",
  ALG: "🇩🇿",
  AUT: "🇦🇹",
  JOR: "🇯🇴",
  // Grupo K
  POR: "🇵🇹",
  COD: "🇨🇩",
  UZB: "🇺🇿",
  COL: "🇨🇴",
  // Grupo L
  ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  CRO: "🇭🇷",
  GHA: "🇬🇭",
  PAN: "🇵🇦",
};

async function addFlags() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado ao MongoDB");

    let updated = 0;

    for (const [teamCode, flag] of Object.entries(flags)) {
      const result = await Sticker.updateMany({ teamCode }, { $set: { flag } });
      updated += result.modifiedCount;
      console.log(
        `${flag} ${teamCode}: ${result.modifiedCount} figurinhas atualizadas`,
      );
    }

    console.log(`\n✅ ${updated} figurinhas atualizadas com bandeiras!`);

    await mongoose.disconnect();
    console.log("🔌 Desconectado do MongoDB");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro:", err.message);
    process.exit(1);
  }
}

addFlags();
