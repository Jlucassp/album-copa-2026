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

// GET /api/trades/pending-stickers - códigos bloqueados para o solicitante
router.get("/pending-stickers", auth, async (req, res) => {
  try {
    // Figurinhas em pedidos pendentes
    const trades = await TradeRequest.find({
      requester: req.userId,
      status: { $in: ["pendente", "contraproposta"] },
    });

    const codes = new Set();
    trades.forEach((trade) => {
      trade.stickers.forEach((s) => codes.add(s.code));
    });

    // Figurinhas com status a_colar na coleção do solicitante
    const UserSticker = require("../models/UserSticker");
    const Sticker = require("../models/Sticker");

    const aColares = await UserSticker.find({
      user: req.userId,
      status: "a_colar"
    }).populate("sticker");

    aColares.forEach(us => {
      if (us.sticker) codes.add(us.sticker.code);
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

// PATCH /api/trades/:id/deliver - dono marca quais figurinhas foram entregues
router.patch("/:id/deliver", auth, async (req, res) => {
  try {
    const { deliveredCodes } = req.body;

    if (!deliveredCodes || !Array.isArray(deliveredCodes)) {
      return res.status(400).json({ message: "Lista de figurinhas inválida." });
    }

    const trade = await TradeRequest.findOne({ _id: req.params.id, owner: req.userId });
    if (!trade) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    if (!trade.requester) {
      return res.status(400).json({ message: "Pedido sem solicitante identificado." });
    }

    // Marca as figurinhas entregues no pedido
    trade.stickers = trade.stickers.map(s => ({
      ...s.toObject(),
      delivered: deliveredCodes.includes(s.code)
    }));
    trade.status = "aceito";
    await trade.save();

    // Para cada figurinha entregue, atualiza a coleção do solicitante e do dono
    const Sticker = require("../models/Sticker");
    const UserSticker = require("../models/UserSticker");

    for (const code of deliveredCodes) {
      const sticker = await Sticker.findOne({ code });
      if (!sticker) continue;

      // Adiciona como a_colar na coleção do solicitante
      await UserSticker.findOneAndUpdate(
        { user: trade.requester, sticker: sticker._id },
        { status: "a_colar", quantity: 1 },
        { upsert: true, new: true }
      );

      // Diminui repetidas do dono
      const ownerSticker = await UserSticker.findOne({
        user: trade.owner,
        sticker: sticker._id,
        status: "repetida"
      });

      if (ownerSticker) {
        if (ownerSticker.quantity <= 1) {
          // Volta para colada se só tiver 1 repetida
          await UserSticker.findOneAndUpdate(
            { user: trade.owner, sticker: sticker._id },
            { status: "colada", quantity: 1 }
          );
        } else {
          // Diminui a quantidade de repetidas
          await UserSticker.findOneAndUpdate(
            { user: trade.owner, sticker: sticker._id },
            { $inc: { quantity: -1 } }
          );
        }
      }
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
