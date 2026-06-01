const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const TradeRequest = require("../models/TradeRequest");
const User = require("../models/User");

// POST /api/trades/:ownerId — faz um pedido de troca (requer login)
router.post("/:ownerId", auth, async (req, res) => {
  try {
    const { stickers } = req.body;

    if (!stickers || stickers.length === 0) {
      return res
        .status(400)
        .json({ message: "Selecione ao menos uma figurinha." });
    }

    if (req.userId === req.params.ownerId) {
      return res
        .status(400)
        .json({ message: "Você não pode fazer um pedido para si mesmo." });
    }

    const requester = await User.findById(req.userId).select("name");

    const trade = await TradeRequest.create({
      owner: req.params.ownerId,
      requester: req.userId,
      requesterName: requester.name,
      stickers,
    });

    res.status(201).json(trade);
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor.", error: err.message });
  }
});

// GET /api/trades — pedidos RECEBIDOS pelo usuário logado
router.get("/", auth, async (req, res) => {
  try {
    const trades = await TradeRequest.find({ owner: req.userId })
      .populate("requester", "name")
      .sort({
        createdAt: -1,
      });

    res.json(trades);
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor.", error: err.message });
  }
});

// GET /api/trades/sent - pedidos ENVIADOS pelo usuário logado
router.get("/sent", auth, async (req, res) => {
  try {
    const trades = await TradeRequest.find({ requester: req.userId })
      .populate("owner", "name")
      .sort({ createdAt: -1 });

    res.json(trades);
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor.", error: err.message });
  }
});

// GET /api/trades/pending-stickers - códigos de figurinhas com troca pendente
router.get("/pending-stickers", auth, async (req, res) => {
  try {
    const trades = await TradeRequest.find({
      requester: req.userId,
      status: { $in: ["pendente", "contraproposta"] },
    });

    const codes = new Set();
    trades.forEach((trade) => {
      trade.stickers.forEach((s) => codes.add(s.code));
    });

    res.json([...codes]);
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor.", error: err.message });
  }
});

// PATCH /api/trades/:id — aceita, recusa ou faz contraproposta
router.patch("/:id", auth, async (req, res) => {
  try {
    const { status, counterStickers } = req.body;

    if (!["aceito", "recusado", "contraproposta"].includes(status)) {
      return res.status(400).json({ message: "Status inválido." });
    }

    const update = { status };
    if (status === "contraproposta" && counterStickers) {
      update.counterStickers = counterStickers;
    }

    const trade = await TradeRequest.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      update,
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

// PATCH /api/trades/:id/edit - solicitante edita o pedido
router.patch("/:id/edit", auth, async (req, res) => {
  try {
    const { stickers } = req.body;

    if (!stickers || stickers.length === 0) {
      return res
        .status(400)
        .json({ message: "Selecione ao menos uma figurinha." });
    }

    const trade = await TradeRequest.findOneAndUpdate(
      { _id: req.params.id, requester: req.userId, status: "pendente" },
      { stickers },
      { new: true },
    );

    if (!trade) {
      return res
        .status(404)
        .json({ message: "Pedido não encontrado ou não pode ser editado." });
    }

    res.json(trade);
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor.", error: err.message });
  }
});

// DELETE /api/trades/:id — remove um pedido
router.delete("/:id", auth, async (req, res) => {
  try {
    const trade = await TradeRequest.findOne({ _id: req.params.id });

    if (!trade) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    // Dono ou solicitante podem deletar
    if (
      trade.owner.toString() !== req.userId &&
      trade.requester?.toString() !== req.userId
    ) {
      return res.status(403).json({ message: "Sem permissão." });
    }

    await TradeRequest.findByIdAndDelete(req.params.id);
    res.json({ message: "Pedido removido." });
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor.", error: err.message });
  }
});

module.exports = router;
