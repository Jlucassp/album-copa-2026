const mongoose = require("mongoose");

const stickerSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    section: {
      type: String,
      required: true,
      enum: ["FWC", "team", "coca-cola", "extra"],
    },
    group: {
      type: String,
      default: null,
    },
    team: {
      type: String,
      default: null,
    },
    jsflag: {
      type: String,
      default: null,
    },
    teamCode: {
      type: String,
      default: null,
    },
    number: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    isSpecial: {
      type: Boolean,
      default: false,
    },
    extraColor: {
      type: String,
      enum: ["bronze", "prata", "ouro", "roxa", null],
      default: null,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Sticker", stickerSchema);
