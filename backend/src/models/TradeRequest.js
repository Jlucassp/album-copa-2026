const mongoose = require("mongoose");

const tradeRequestSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requesterName: {
      type: String,
      required: true,
      trim: true,
    },
    stickers: [
      {
        code: String,
        description: String,
        quantity: Number,
      },
    ],
    status: {
      type: String,
      enum: ["pendente", "aceito", "recusado"],
      default: "pendente",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("TradeRequest", tradeRequestSchema);
