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
      trim: true,
      default: null,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    stickers: [
      {
        code: String,
        description: String,
        quantity: Number,
        delivered: {
          type: Boolean,
          default: false,
        },
      },
    ],
    counterStickers: [
      {
        code: String,
        description: String,
        quantity: Number,
      },
    ],
    status: {
      type: String,
      enum: ["pendente", "aceito", "recusado", "contraproposta"],
      default: "pendente",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("TradeRequest", tradeRequestSchema);
