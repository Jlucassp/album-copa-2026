const mongoose = require("mongoose");

const userStickerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sticker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sticker",
      required: true,
    },
    status: {
      type: String,
      enum: ["colada", "repetida", "a_colar"],
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { timestamps: true },
);

// Garante que um usuário não tenha a mesma figurinha duplicada na coleção
userStickerSchema.index({ user: 1, sticker: 1 }, { unique: true });

module.exports = mongoose.model("UserSticker", userStickerSchema);
