import { useEffect, useState } from "react";
import api from "../services/api";

const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export default function Repetidas() {
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchRepetidas() {
      setLoading(true);
      try {
        const { data } = await api.get("/stickers");
        setStickers(data.filter((s) => s.status === "repetida"));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRepetidas();
  }, []);

  function handleExport() {
    const fwc = stickers.filter((s) => s.section === "FWC");
    const teams = stickers.filter((s) => s.section === "team");
    const cocaCola = stickers.filter((s) => s.section === "coca-cola");
    const extra = stickers.filter((s) => s.section === "extra");

    let text = "🔁 *Minhas repetidas - Meu Álbum Copa 2026*\n\n";

    if (fwc.length > 0) {
      text += `⭐ *FWC*\n`;
      text += fwc
        .map((s) => `${s.code}${s.quantity > 1 ? ` (${s.quantity}x)` : ""}`)
        .join(", ");
      text += "\n\n";
    }

    groups.forEach((g) => {
      const groupStickers = teams.filter((s) => s.group === g);
      if (groupStickers.length === 0) return;

      const teamNames = [...new Set(groupStickers.map((s) => s.team))];
      teamNames.forEach((team) => {
        const teamStickers = groupStickers.filter((s) => s.team === team);
        text += `*${team}*\n`;
        text += teamStickers
          .map((s) => `${s.code}${s.quantity > 1 ? ` (${s.quantity}x)` : ""}`)
          .join(", ");
        text += "\n\n";
      });
    });

    if (cocaCola.length > 0) {
      text += `🥤 *Coca-Cola*\n`;
      text += cocaCola
        .map((s) => `${s.code}${s.quantity > 1 ? ` (${s.quantity}x)` : ""}`)
        .join(", ");
      text += "\n\n";
    }

    if (extra.length > 0) {
      text += `✨ *Extra Stickers*\n`;
      text += extra
        .map((s) => `${s.code}${s.quantity > 1 ? ` (${s.quantity}x)` : ""}`)
        .join(", ");
      text += "\n\n";
    }

    const total = stickers.reduce((acc, s) => acc + s.quantity, 0);
    text += `_Total: ${total} figurinha${total !== 1 ? "s" : ""} repetida${total !== 1 ? "s" : ""}_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Carregando...
        </p>
      </div>
    );
  }

  if (stickers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <p className="font-semibold" style={{ color: "var(--text-secondary)" }}>
          Nenhuma figurinha repetida ainda!
        </p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Quando você tiver repetidas, elas aparecerão aqui.
        </p>
      </div>
    );
  }

  const fwc = stickers.filter((s) => s.section === "FWC");
  const teams = stickers.filter((s) => s.section === "team");
  const cocaCola = stickers.filter((s) => s.section === "coca-cola");
  const extra = stickers.filter((s) => s.section === "extra");
  const total = stickers.reduce((acc, s) => acc + s.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header com botão exportar */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {total} figurinha{total !== 1 ? "s" : ""} repetida
          {total !== 1 ? "s" : ""}
        </p>
        <button
          onClick={handleExport}
          className="text-xs px-4 py-2 rounded-lg font-semibold transition-all"
          style={{
            backgroundColor: copied
              ? "rgba(74,222,128,0.15)"
              : "rgba(250,204,21,0.15)",
            color: copied ? "#4ade80" : "#facc15",
            border: `1px solid ${copied ? "rgba(74,222,128,0.3)" : "rgba(250,204,21,0.3)"}`,
          }}
        >
          {copied ? "✓ Copiado!" : "📋 Copiar para WhatsApp"}
        </button>
      </div>

      {/* Lista */}
      {fwc.length > 0 && <Section title="⭐ Especiais FWC" stickers={fwc} />}
      {groups.map((g) => {
        const groupStickers = teams.filter((s) => s.group === g);
        if (groupStickers.length === 0) return null;
        return (
          <Section key={g} title={`Grupo ${g}`} stickers={groupStickers} />
        );
      })}
      {cocaCola.length > 0 && (
        <Section title="🥤 Coca-Cola" stickers={cocaCola} />
      )}
      {extra.length > 0 && (
        <Section title="✨ Extra Stickers" stickers={extra} />
      )}
    </div>
  );
}

function Section({ title, stickers }) {
  return (
    <div>
      <h3
        className="font-bold text-base mb-3 flex items-center gap-2"
        style={{ color: "var(--text-primary)" }}
      >
        <span className="w-1 h-4 bg-yellow-400 rounded-full inline-block" />
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {stickers.map((s) => (
          <div
            key={s._id}
            className="rounded-xl px-4 py-3 flex items-center justify-between border"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "rgba(96, 165, 250, 0.3)",
            }}
          >
            <div>
              <p className="font-bold text-sm" style={{ color: "#60a5fa" }}>
                {s.code}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {s.description}
              </p>
            </div>
            <span className="font-black text-lg" style={{ color: "#60a5fa" }}>
              {s.quantity}x
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
