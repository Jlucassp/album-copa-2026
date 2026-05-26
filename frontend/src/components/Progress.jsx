import { useEffect, useState } from "react";
import api from "../services/api";

export default function Progress({ refreshKey }) {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const { data } = await api.get("/stickers/progress");
        setProgress(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchProgress();
  }, [refreshKey]);

  if (!progress) return null;

  const percent = Math.round((progress.coladas / progress.total) * 100);

  return (
    <div
      className="flex items-center gap-6 px-6 py-3 border-b"
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
            {progress.coladas} / {progress.total}
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
          {progress.repetidas}
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
          {progress.total - progress.coladas}
        </p>
      </div>
    </div>
  );
}
