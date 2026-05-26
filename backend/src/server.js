const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/auth", require("./routes/auth"));
app.use("/api/stickers", require("./routes/stickers"));
app.use("/api/trades", require("./routes/trades"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Conectado ao MongoDB");
    app.listen(process.env.PORT || 3001, () => {
      console.log(`🚀 Servidor rodando na porta ${process.env.PORT || 3001}`);
    });
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar ao MongoDB:", err.message);
  });
