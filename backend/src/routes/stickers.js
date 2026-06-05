const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Sticker = require("../models/Sticker");
const UserSticker = require("../models/UserSticker");

// GET /api/stickers — lista todas as figurinhas com status do usuário
router.get("/", auth, async (req, res) => {
  try {
    const stickers = await Sticker.find().sort({ order: 1 });
    const userStickers = await UserSticker.find({ user: req.userId });

    const userMap = {};
    for (const us of userStickers) {
      userMap[us.sticker.toString()] = {
        status: us.status,
        quantity: us.quantity,
      };
    }

    const result = stickers.map((sticker) => ({
      _id: sticker._id,
      code: sticker.code,
      section: sticker.section,
      group: sticker.group,
      team: sticker.team,
      teamCode: sticker.teamCode,
      number: sticker.number,
      description: sticker.description,
      isSpecial: sticker.isSpecial,
      extraColor: sticker.extraColor,
      order: sticker.order,
      status: userMap[sticker._id.toString()]?.status || null,
      quantity: userMap[sticker._id.toString()]?.quantity || 0,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor.", error: err.message });
  }
});

// POST /api/stickers/:id/status — marca ou atualiza status de uma figurinha
router.post("/:id/status", auth, async (req, res) => {
  try {
    const { status, quantity } = req.body;

    if (!["colada", "repetida"].includes(status)) {
      return res.status(400).json({ message: "Status inválido." });
    }

    const sticker = await Sticker.findById(req.params.id);
    if (!sticker) {
      return res.status(404).json({ message: "Figurinha não encontrada." });
    }

    const userSticker = await UserSticker.findOneAndUpdate(
      { user: req.userId, sticker: req.params.id },
      {
        status,
        quantity: status === "repetida" ? quantity || 1 : 1,
      },
      { upsert: true, new: true },
    );

    res.json(userSticker);
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor.", error: err.message });
  }
});

// DELETE /api/stickers/:id/status — remove status de uma figurinha
router.delete("/:id/status", auth, async (req, res) => {
  try {
    await UserSticker.findOneAndDelete({
      user: req.userId,
      sticker: req.params.id,
    });

    res.json({ message: "Status removido com sucesso." });
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor.", error: err.message });
  }
});

// GET /api/stickers/progress
router.get("/progress", auth, async (req, res) => {
  try {
    const totalOfficial = await Sticker.countDocuments({
      section: { $in: ["FWC", "team"] },
    });
    const userStickers = await UserSticker.find({ user: req.userId }).populate(
      "sticker",
    );

    const possuidas = userStickers.filter(
      (us) =>
        ["colada", "repetida", "a_colar"].includes(us.status) &&
        ["FWC", "team"].includes(us.sticker.section),
    );
    const repetidas = userStickers.filter(
      (us) =>
        us.status === "repetida" &&
        ["FWC", "team"].includes(us.sticker.section),
    );
    const totalRepetidas = repetidas.reduce((acc, us) => acc + us.quantity, 0);

    const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
    const byGroup = {};

    for (const group of groups) {
      const total = await Sticker.countDocuments({ group });
      const possuídasGroup = userStickers.filter(
        (us) =>
          ["colada", "repetida", "a_colar"].includes(us.status) &&
          us.sticker.group === group,
      ).length;

      byGroup[group] = { total, coladas: possuídasGroup };
    }

    res.json({
      total: totalOfficial,
      coladas: possuidas.length,
      repetidas: totalRepetidas,
      byGroup,
    });
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor.", error: err.message });
  }
});

// GET /api/stickers/public/:userId — repetidas públicas de um usuário
router.get("/public/:userId", async (req, res) => {
  try {
    const userStickers = await UserSticker.find({
      user: req.params.userId,
      status: "repetida",
    }).populate("sticker");

    const result = userStickers
      .filter((us) => us.sticker)
      .sort((a, b) => a.sticker.order - b.sticker.order)
      .map((us) => ({
        code: us.sticker.code,
        section: us.sticker.section,
        group: us.sticker.group,
        team: us.sticker.team,
        description: us.sticker.description,
        quantity: us.quantity,
      }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor.", error: err.message });
  }
});

module.exports = router;
