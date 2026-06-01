import { useState, useCallback } from "react";
import api from "../services/api";

export default function TrocasEnviadas() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const fetchTrades = useCallback(async () => {
    try {
      const { data } = await api.get("/trades/sent");
      setTrades(data);
    } catch {
      console.error("Erro ao buscar pedidos enviados.");
    } finally {
      setLoading(false);
    }
  }, []);

  const [fetched, setFetched] = useState(false);
  if (!fetched) {
    setFetched(true);
    fetchTrades();
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
          Nenhum pedido enviado ainda!
        </p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Acesse o link de repetidas de um amigo para solicitar figurinhas.
        </p>
      </div>
    );
  }

  const pendentes = trades.filter((t) => t.status === "pendente");
  const contrapropostas = trades.filter((t) => t.status === "contraproposta");
  const respondidos = trades.filter(
    (t) => t.status === "aceito" || t.status === "recusado",
  );

  return (
    <div className="space-y-8">
      {contrapropostas.length > 0 && (
        <div className="space-y-4">
          <h3
            className="font-bold text-base flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <span className="w-1 h-4 bg-blue-400 rounded-full inline-block" />
            Contrapropostas ({contrapropostas.length})
          </h3>
          {contrapropostas.map((trade) => (
            <TrocaEnviadaCard
              key={trade._id}
              trade={trade}
              onDelete={handleDelete}
              editingId={editingId}
              setEditingId={setEditingId}
              onRefresh={fetchTrades}
            />
          ))}
        </div>
      )}

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
            <TrocaEnviadaCard
              key={trade._id}
              trade={trade}
              onDelete={handleDelete}
              editingId={editingId}
              setEditingId={setEditingId}
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
            <TrocaEnviadaCard
              key={trade._id}
              trade={trade}
              onDelete={handleDelete}
              editingId={editingId}
              setEditingId={setEditingId}
              onRefresh={fetchTrades}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TrocaEnviadaCard({
  trade,
  onDelete,
  editingId,
  setEditingId,
  onRefresh,
}) {
  const isPendente = trade.status === "pendente";
  const isContraproposta = trade.status === "contraproposta";
  const isAceito = trade.status === "aceito";
  const statusColor = isPendente
    ? "#facc15"
    : isContraproposta
      ? "#60a5fa"
      : isAceito
        ? "#4ade80"
        : "#f87171";
  const statusLabel = isPendente
    ? "Pendente"
    : isContraproposta
      ? "Contraproposta"
      : isAceito
        ? "Aceito"
        : "Recusado";
  const isEditing = editingId === trade._id;
  const [removingStickers, setRemovingStickers] = useState([]);

  async function handleEdit() {
    if (removingStickers.length === trade.stickers.length) {
      alert("Você precisa manter ao menos uma figurinha.");
      return;
    }
    try {
      const newStickers = trade.stickers.filter(
        (s) => !removingStickers.includes(s.code),
      );
      await api.patch(`/trades/${trade._id}/edit`, { stickers: newStickers });
      setEditingId(null);
      setRemovingStickers([]);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao editar pedido.");
    }
  }

  function toggleRemove(code) {
    setRemovingStickers((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
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
            Para: {trade.owner?.name || "Usuário"}
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
          {trade.stickers.map((s, i) => {
            const isRemoving = removingStickers.includes(s.code);
            return (
              <div
                key={i}
                onClick={() => isEditing && toggleRemove(s.code)}
                className="px-3 py-1.5 rounded-lg border transition-all"
                style={{
                  backgroundColor: isRemoving
                    ? "rgba(248,113,113,0.1)"
                    : "var(--bg-secondary)",
                  borderColor: isRemoving ? "#f87171" : "var(--border)",
                  cursor: isEditing ? "pointer" : "default",
                  textDecoration: isRemoving ? "line-through" : "none",
                }}
              >
                <p
                  className="text-xs font-bold"
                  style={{ color: isRemoving ? "#f87171" : "#60a5fa" }}
                >
                  {s.code}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contraproposta */}
      {isContraproposta && trade.counterStickers?.length > 0 && (
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Contraproposta recebida
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

      {/* Ações */}
      <div className="flex gap-2">
        {isPendente && !isEditing && (
          <button
            onClick={() => setEditingId(trade._id)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor: "rgba(250,204,21,0.15)",
              color: "#facc15",
              border: "1px solid rgba(250,204,21,0.3)",
            }}
          >
            ✏️ Editar
          </button>
        )}
        {isEditing && (
          <>
            <button
              onClick={handleEdit}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                backgroundColor: "rgba(74,222,128,0.15)",
                color: "#4ade80",
                border: "1px solid rgba(74,222,128,0.3)",
              }}
            >
              ✓ Salvar
            </button>
            <button
              onClick={() => {
                setEditingId(null);
                setRemovingStickers([]);
              }}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
            >
              Cancelar
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
