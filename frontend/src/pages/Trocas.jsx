import { useState, useCallback } from "react";
import api from "../services/api";

function getInitialTrades() {
  return [];
}
export default function Trocas() {
  const [trades, setTrades] = useState(getInitialTrades);
  const [loading, setLoading] = useState(true);

  const fetchTrades = useCallback(async () => {
    try {
      const { data } = await api.get("/trades");
      setTrades(data);
    } catch {
      console.error("Erro ao buscar pedidos.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Chama fetchTrades na primeira renderização sem useEffect
  const [fetched, setFetched] = useState(false);
  if (!fetched) {
    setFetched(true);
    fetchTrades();
  }

  async function handleStatus(id, status) {
    try {
      await api.patch(`/trades/${id}`, { status });
      setTrades((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status } : t)),
      );
    } catch {
      console.error("Erro ao atualizar pedido.");
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/trades/${id}`);
      setTrades((prev) => prev.filter((t) => t._id !== id));
    } catch {
      console.error("Erro ao remover pedido.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Carregando pedidos...
        </p>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <p className="font-semibold" style={{ color: "var(--text-secondary)" }}>
          Nenhum pedido de troca ainda!
        </p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Compartilhe o link das suas repetidas para receber pedidos.
        </p>
      </div>
    );
  }

  const pendentes = trades.filter((t) => t.status === "pendente");
  const respondidos = trades.filter((t) => t.status !== "pendente");

  return (
    <div className="space-y-8">
      {pendentes.length > 0 && (
        <div className="space-y-4">
          <h3
            className="font-bold text-base flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <span className="w-1 h-4 bg-yellow-400 rounded-full inline-block" />
            Pendentes ({pendentes.length})
          </h3>
          {pendentes.map((trade) => (
            <TradeCard
              key={trade._id}
              trade={trade}
              onStatus={handleStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
      {respondidos.length > 0 && (
        <div className="space-y-4">
          <h3
            className="font-bold text-base flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <span className="w-1 h-4 bg-zinc-500 rounded-full inline-block" />
            Respondidos ({respondidos.length})
          </h3>
          {respondidos.map((trade) => (
            <TradeCard
              key={trade._id}
              trade={trade}
              onStatus={handleStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TradeCard({ trade, onStatus, onDelete }) {
  const isPendente = trade.status === "pendente";
  const isAceito = trade.status === "aceito";
  const statusColor = isPendente ? "#facc15" : isAceito ? "#4ade80" : "#f87171";
  const statusLabel = isPendente
    ? "Pendente"
    : isAceito
      ? "Aceito"
      : "Recusado";

  return (
    <div
      className="rounded-xl border p-4 space-y-4"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold" style={{ color: "var(--text-primary)" }}>
            {trade.requesterName}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {new Date(trade.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {trade.stickers.map((s, i) => (
          <div
            key={i}
            className="px-3 py-1.5 rounded-lg border"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border)",
            }}
          >
            <p className="text-xs font-bold" style={{ color: "#60a5fa" }}>
              {s.code}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {isPendente && (
          <>
            <button
              onClick={() => onStatus(trade._id, "aceito")}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                backgroundColor: "rgba(74, 222, 128, 0.15)",
                color: "#4ade80",
                border: "1px solid rgba(74, 222, 128, 0.3)",
              }}
            >
              ✓ Aceitar
            </button>
            <button
              onClick={() => onStatus(trade._id, "recusado")}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                backgroundColor: "rgba(248, 113, 113, 0.15)",
                color: "#f87171",
                border: "1px solid rgba(248, 113, 113, 0.3)",
              }}
            >
              ✕ Recusar
            </button>
          </>
        )}
        <button
          onClick={() => onDelete(trade._id)}
          className="py-2 px-3 rounded-lg text-sm transition-all"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-muted)",
            border: "1px solid var(--border)",
          }}
        >
          🗑
        </button>
      </div>
    </div>
  );
}
