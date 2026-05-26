const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const TradeRequest = require("../models/TradeRequest");

// POST /api/trades/:ownerId — amigo faz um pedido de troca
router.post("/:ownerId", async (req, res) => {
  try {
    const { requesterName, stickers } = req.body;

    if (!requesterName || !stickers || stickers.length === 0) {
      return res
        .status(400)
        .json({ message: "Nome e figurinhas são obrigatórios." });
    }

    const trade = await TradeRequest.create({
      owner: req.params.ownerId,
      requesterName,
      stickers,
    });

    res.status(201).json(trade);
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor.", error: err.message });
  }
});

// GET /api/trades — lista pedidos recebidos pelo usuário logado
router.get("/", auth, async (req, res) => {
  try {
    const trades = await TradeRequest.find({ owner: req.userId }).sort({
      createdAt: -1,
    });

    res.json(trades);
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor.", error: err.message });
  }
});

// PATCH /api/trades/:id — aceita ou recusa um pedido
router.patch("/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["aceito", "recusado"].includes(status)) {
      return res.status(400).json({ message: "Status inválido." });
    }

    const trade = await TradeRequest.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { status },
      { new: true },
    );

    if (!trade) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    res.json(trade);
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor.", error: err.message });
  }
});

// DELETE /api/trades/:id — remove um pedido
router.delete("/:id", auth, async (req, res) => {
  try {
    await TradeRequest.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });
    res.json({ message: "Pedido removido." });
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor.", error: err.message });
  }
});

module.exports = router;
