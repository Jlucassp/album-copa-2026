import { useState, useCallback } from "react";
import api from "../services/api";

export default function Trocas() {
  const [trades, setTrades] = useState([]);
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

  const [fetched, setFetched] = useState(false);
  if (!fetched) {
    setFetched(true);
    fetchTrades();
  }

  async function handleStatus(id, status, counterStickers) {
    try {
      await api.patch(`/trades/${id}`, { status, counterStickers });
      setTrades((prev) =>
        prev.map((t) =>
          t._id === id
            ? {
                ...t,
                status,
                counterStickers: counterStickers || t.counterStickers,
              }
            : t,
        ),
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
              onRefresh={fetchTrades}
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
              onRefresh={fetchTrades}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TradeCard({ trade, onStatus, onDelete, onRefresh }) {
  const isPendente = trade.status === "pendente";
  const isAceito = trade.status === "aceito";
  const [showCounter, setShowCounter] = useState(false);
  const [counterCodes, setCounterCodes] = useState("");
  const [showDeliver, setShowDeliver] = useState(false);
  const [deliveredCodes, setDeliveredCodes] = useState([]);

  const statusColor = isPendente
    ? "#facc15"
    : isAceito
      ? "#4ade80"
      : trade.status === "contraproposta"
        ? "#60a5fa"
        : "#f87171";
  const statusLabel = isPendente
    ? "Pendente"
    : isAceito
      ? "Aceito"
      : trade.status === "contraproposta"
        ? "Contraproposta"
        : "Recusado";

  function toggleDeliver(code) {
    setDeliveredCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  }

  async function handleDeliver() {
    try {
      await api.patch(`/trades/${trade._id}/deliver`, { deliveredCodes });
      setShowDeliver(false);
      setDeliveredCodes([]);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao registrar entrega.");
    }
  }

  async function handleCounter() {
    const codes = counterCodes
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);
    if (codes.length === 0) return;
    const stickers = codes.map((code) => ({
      code,
      description: "",
      quantity: 1,
    }));
    await onStatus(trade._id, "contraproposta", stickers);
    setShowCounter(false);
    setCounterCodes("");
  }

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
            {trade.requester?.name || trade.requesterName || "Usuário"}
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

      {/* Figurinhas solicitadas */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          Figurinhas solicitadas
        </p>
        <div className="flex flex-wrap gap-2">
          {trade.stickers.map((s, i) => (
            <div
              key={i}
              onClick={() => showDeliver && toggleDeliver(s.code)}
              className="px-3 py-1.5 rounded-lg border transition-all"
              style={{
                backgroundColor: deliveredCodes.includes(s.code)
                  ? "rgba(74,222,128,0.15)"
                  : s.delivered
                    ? "rgba(74,222,128,0.1)"
                    : "var(--bg-secondary)",
                borderColor: deliveredCodes.includes(s.code)
                  ? "#4ade80"
                  : s.delivered
                    ? "rgba(74,222,128,0.4)"
                    : "var(--border)",
                cursor: showDeliver ? "pointer" : "default",
              }}
            >
              <p
                className="text-xs font-bold"
                style={{
                  color: deliveredCodes.includes(s.code)
                    ? "#4ade80"
                    : s.delivered
                      ? "#4ade80"
                      : "#60a5fa",
                }}
              >
                {s.code} {s.delivered ? "✓" : ""}
              </p>
            </div>
          ))}
        </div>
        {showDeliver && (
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            Clique nas figurinhas que foram entregues
          </p>
        )}
      </div>

      {/* Contraproposta enviada */}
      {trade.status === "contraproposta" &&
        trade.counterStickers?.length > 0 && (
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Sua contraproposta
            </p>
            <div className="flex flex-wrap gap-2">
              {trade.counterStickers.map((s, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-lg border"
                  style={{
                    backgroundColor: "rgba(96,165,250,0.1)",
                    borderColor: "rgba(96,165,250,0.4)",
                  }}
                >
                  <p className="text-xs font-bold" style={{ color: "#60a5fa" }}>
                    {s.code}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Campo contraproposta */}
      {showCounter && (
        <div className="space-y-2">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Códigos da contraproposta (separados por vírgula)
          </p>
          <input
            type="text"
            placeholder="ex: BRA1, MEX3, FWC2"
            value={counterCodes}
            onChange={(e) => setCounterCodes(e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCounter}
              className="flex-1 py-2 rounded-lg text-sm font-semibold"
              style={{
                backgroundColor: "rgba(96,165,250,0.15)",
                color: "#60a5fa",
                border: "1px solid rgba(96,165,250,0.3)",
              }}
            >
              Enviar contraproposta
            </button>
            <button
              onClick={() => setShowCounter(false)}
              className="py-2 px-3 rounded-lg text-sm"
              style={{
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Ações entregar */}
      {showDeliver && (
        <div className="flex gap-2">
          <button
            onClick={handleDeliver}
            disabled={deliveredCodes.length === 0}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
            style={{
              backgroundColor: "rgba(74,222,128,0.15)",
              color: "#4ade80",
              border: "1px solid rgba(74,222,128,0.3)",
            }}
          >
            ✓ Confirmar {deliveredCodes.length} entregue
            {deliveredCodes.length !== 1 ? "s" : ""}
          </button>
          <button
            onClick={() => {
              setShowDeliver(false);
              setDeliveredCodes([]);
            }}
            className="py-2 px-3 rounded-lg text-sm"
            style={{
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Ações principais */}
      {!showDeliver && !showCounter && (
        <div className="flex gap-2">
          {isPendente && (
            <>
              <button
                onClick={() => setShowDeliver(true)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: "rgba(74,222,128,0.15)",
                  color: "#4ade80",
                  border: "1px solid rgba(74,222,128,0.3)",
                }}
              >
                ✓ Registrar entrega
              </button>
              <button
                onClick={() => setShowCounter(true)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: "rgba(96,165,250,0.15)",
                  color: "#60a5fa",
                  border: "1px solid rgba(96,165,250,0.3)",
                }}
              >
                ↩ Contraproposta
              </button>
              <button
                onClick={() => onStatus(trade._id, "recusado")}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: "rgba(248,113,113,0.15)",
                  color: "#f87171",
                  border: "1px solid rgba(248,113,113,0.3)",
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
      )}
    </div>
  );
}
