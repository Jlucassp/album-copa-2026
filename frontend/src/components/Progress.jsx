import { useEffect, useState } from "react";
import api from "../services/api";

export default function Progress({
  refreshKey,
  progressData,
  setProgressData,
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const { data } = await api.get("/stickers/progress");
        setProgressData(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchProgress();
  }, [refreshKey, setProgressData]);

  async function handleExportFaltantes() {
    try {
      const { data } = await api.get("/stickers");
      const faltantes = data.filter(
        (s) => !s.status && ["FWC", "team", "coca-cola"].includes(s.section),
      );

      const fwc = faltantes.filter((s) => s.section === "FWC");
      const teams = faltantes.filter((s) => s.section === "team");
      const cocaCola = faltantes.filter((s) => s.section === "coca-cola");
      const groups = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
      ];

      let text = "❌ *Figurinhas que faltam - Meu Álbum Copa 2026*\n\n";

      if (fwc.length > 0) {
        text += `⭐ *FWC*\n`;
        text += fwc.map((s) => s.code).join(", ");
        text += "\n\n";
      }

      groups.forEach((g) => {
        const groupStickers = teams.filter((s) => s.group === g);
        if (groupStickers.length === 0) return;
        const teamNames = [...new Set(groupStickers.map((s) => s.team))];
        teamNames.forEach((team) => {
          const teamStickers = groupStickers.filter((s) => s.team === team);
          text += `*${team}*\n`;
          text += teamStickers.map((s) => s.code).join(", ");
          text += "\n\n";
        });
      });

      if (cocaCola.length > 0) {
        text += `🥤 *Coca-Cola*\n`;
        text += cocaCola.map((s) => s.code).join(", ");
        text += "\n\n";
      }

      text += `_Total: ${faltantes.length} figurinha${faltantes.length !== 1 ? "s" : ""} faltando_`;

      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error(err);
    }
  }

  if (!progressData) return null;

  const percent = Math.round((progressData.coladas / progressData.total) * 100);

  return (
    <div
      className="flex items-center gap-4 px-6 py-3 border-b"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Progresso geral
          </span>
          <span
            className="text-xs font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {progressData.coladas} / {progressData.total}
            <span className="text-yellow-400 ml-1">({percent}%)</span>
          </span>
        </div>
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--border)" }}
        >
          <div
            className="h-full bg-yellow-400 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="text-center hidden sm:block">
        <p
          className="text-xs uppercase tracking-widest font-semibold"
          style={{ color: "var(--text-muted)" }}
        >
          Repetidas
        </p>
        <p
          className="font-bold text-sm"
          style={{ color: "var(--text-primary)" }}
        >
          {progressData.repetidas}
        </p>
      </div>

      <div className="text-center hidden sm:block">
        <p
          className="text-xs uppercase tracking-widest font-semibold"
          style={{ color: "var(--text-muted)" }}
        >
          Faltam
        </p>
        <p
          className="font-bold text-sm"
          style={{ color: "var(--text-primary)" }}
        >
          {progressData.total - progressData.coladas}
        </p>
      </div>

      <button
        onClick={handleExportFaltantes}
        className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap hidden sm:block"
        style={{
          backgroundColor: copied
            ? "rgba(74,222,128,0.15)"
            : "rgba(250,204,21,0.15)",
          color: copied ? "#4ade80" : "#facc15",
          border: `1px solid ${copied ? "rgba(74,222,128,0.3)" : "rgba(250,204,21,0.3)"}`,
        }}
      >
        {copied ? "✓ Copiado!" : "📋 Exportar faltantes"}
      </button>
    </div>
  );
}
