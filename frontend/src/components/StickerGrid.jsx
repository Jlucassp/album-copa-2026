import { useEffect, useState } from "react";
import api from "../services/api";

const FILTERS = [
  { label: "Todas", value: "all" },
  { label: "Faltam", value: "missing" },
  { label: "Coladas", value: "colada" },
  { label: "Repetidas", value: "repetida" },
];

export default function StickerGrid({
  active,
  onRefresh,
  globalSearch,
  onStickerChange,
}) {
  const [stickers, setStickers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [pendingCodes, setPendingCodes] = useState([]);
  const [currentActive, setCurrentActive] = useState(active);

  if (active !== currentActive) {
    setCurrentActive(active);
    setFilter("all");
  }

  useEffect(() => {
    async function fetchPendingCodes() {
      try {
        const { data } = await api.get("/trades/pending-stickers");
        setPendingCodes(data);
      } catch {
        console.error("Erro ao buscar figurinhas pendentes.");
      }
    }
    fetchPendingCodes();
  }, []);

  useEffect(() => {
    async function fetchStickers() {
      setLoading(true);
      try {
        const { data } = await api.get("/stickers");

        if (globalSearch) {
          setStickers(data.filter((s) => s.section !== "extra"));
          return;
        }

        let filtered = [];
        if (active === "FWC") {
          filtered = data.filter((s) => s.section === "FWC");
        } else if (active === "coca-cola") {
          filtered = data.filter((s) => s.section === "coca-cola");
        } else if (active === "extra") {
          filtered = data.filter((s) => s.section === "extra");
        } else if (active.startsWith("group-")) {
          const group = active.replace("group-", "");
          filtered = data.filter((s) => s.group === group);
        }

        setStickers(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchStickers();
  }, [active, globalSearch]);

  async function handleToggle(sticker) {
    const oldStatus = sticker.status;
    const newStatus =
      oldStatus === "colada" ||
      oldStatus === "repetida" ||
      oldStatus === "a_colar"
        ? null
        : "colada";

    // Optimistic update
    updateSticker(sticker._id, newStatus, newStatus ? 1 : 0);
    onStickerChange(oldStatus, newStatus);

    try {
      if (
        oldStatus === "colada" ||
        oldStatus === "repetida" ||
        oldStatus === "a_colar"
      ) {
        await api.delete(`/stickers/${sticker._id}/status`);
      } else {
        await api.post(`/stickers/${sticker._id}/status`, {
          status: "colada",
          quantity: 1,
        });
      }
    } catch (err) {
      // Reverte se der erro
      updateSticker(sticker._id, oldStatus, sticker.quantity);
      onStickerChange(newStatus, oldStatus);
      console.error(err);
    }
  }

  async function handleRepeat(sticker, delta) {
    const currentExtras = sticker.status === "repetida" ? sticker.quantity : 0;
    const newExtras = currentExtras + delta;
    const oldStatus = sticker.status;
    const newStatus = newExtras <= 0 ? "colada" : "repetida";
    const newQty = newExtras <= 0 ? 1 : newExtras;

    // Optimistic update
    updateSticker(sticker._id, newStatus, newQty);
    onStickerChange(oldStatus, newStatus);

    try {
      if (newExtras <= 0) {
        await api.post(`/stickers/${sticker._id}/status`, {
          status: "colada",
          quantity: 1,
        });
      } else {
        await api.post(`/stickers/${sticker._id}/status`, {
          status: "repetida",
          quantity: newExtras,
        });
      }
    } catch (err) {
      // Reverte se der erro
      updateSticker(sticker._id, oldStatus, sticker.quantity);
      onStickerChange(newStatus, oldStatus);
      console.error(err);
    }
  }

  function updateSticker(id, status, quantity) {
    setStickers((prev) =>
      prev.map((s) => (s._id === id ? { ...s, status, quantity } : s)),
    );
  }

  const filteredStickers = stickers.filter((s) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "missing"
          ? !s.status
          : filter === "colada"
            ? s.status === "colada" ||
              s.status === "repetida" ||
              s.status === "a_colar"
            : s.status === filter;

    const matchesSearch =
      !globalSearch.trim() ||
      s.code.toLowerCase().includes(globalSearch.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Carregando figurinhas...
        </p>
      </div>
    );
  }

  const isGroupSection = active.startsWith("group-");
  const teams = isGroupSection
    ? [...new Set(stickers.map((s) => s.team))]
    : null;

  return (
    <div className="space-y-6">
      {/* Filtros e busca */}
      <div className="flex flex-col gap-3">
        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150"
              style={{
                backgroundColor:
                  filter === f.value ? "#facc15" : "var(--bg-card)",
                color: filter === f.value ? "#09090b" : "var(--text-secondary)",
                border: `1px solid ${filter === f.value ? "#facc15" : "var(--border)"}`,
              }}
            >
              {f.label}
            </button>
          ))}

          {/* Contador */}
          <span
            className="ml-auto text-sm self-center"
            style={{ color: "var(--text-muted)" }}
          >
            {filteredStickers.length} figurinha
            {filteredStickers.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Grade */}
      {filteredStickers.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Nenhuma figurinha encontrada.
          </p>
        </div>
      ) : isGroupSection ? (
        teams.map((team) => {
          const teamStickers = filteredStickers.filter((s) => s.team === team);
          if (teamStickers.length === 0) return null;

          const allColadas = teamStickers.every(
            (s) => s.status === "colada" || s.status === "repetida",
          );

          async function handleMarkAll() {
            try {
              const missing = stickers.filter(
                (s) => s.team === team && !s.status,
              );
              await Promise.all(
                missing.map((s) =>
                  api.post(`/stickers/${s._id}/status`, {
                    status: "colada",
                    quantity: 1,
                  }),
                ),
              );
              setStickers((prev) =>
                prev.map((s) =>
                  s.team === team && !s.status
                    ? { ...s, status: "colada", quantity: 1 }
                    : s,
                ),
              );
              onRefresh();
            } catch (err) {
              console.error(err);
            }
          }

          async function handleUnmarkAll() {
            try {
              const owned = stickers.filter((s) => s.team === team && s.status);
              await Promise.all(
                owned.map((s) => api.delete(`/stickers/${s._id}/status`)),
              );
              setStickers((prev) =>
                prev.map((s) =>
                  s.team === team ? { ...s, status: null, quantity: 0 } : s,
                ),
              );
              onRefresh();
            } catch (err) {
              console.error(err);
            }
          }

          return (
            <div key={team}>
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="font-bold text-base flex items-center gap-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <span className="w-1 h-4 bg-yellow-400 rounded-full inline-block" />
                  {stickers.find((s) => s.team === team)?.flag} {team}
                </h3>
                <div className="flex gap-2">
                  {!allColadas && (
                    <button
                      onClick={handleMarkAll}
                      className="text-xs px-3 py-1 rounded-lg font-semibold transition-all"
                      style={{
                        backgroundColor: "rgba(250, 204, 21, 0.15)",
                        color: "#facc15",
                        border: "1px solid rgba(250, 204, 21, 0.3)",
                      }}
                    >
                      ✓ Marcar todas
                    </button>
                  )}
                  <button
                    onClick={handleUnmarkAll}
                    className="text-xs px-3 py-1 rounded-lg font-semibold transition-all"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      color: "var(--text-muted)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    ✕ Desmarcar todas
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {teamStickers.map((sticker) => (
                  <StickerCard
                    key={sticker._id}
                    sticker={sticker}
                    onToggle={handleToggle}
                    onRepeat={handleRepeat}
                    isPending={pendingCodes.includes(sticker.code)}
                  />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {filteredStickers.map((sticker) => (
            <StickerCard
              key={sticker._id}
              sticker={sticker}
              onToggle={handleToggle}
              onRepeat={handleRepeat}
              isPending={pendingCodes.includes(sticker.code)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StickerCard({ sticker, onToggle, onRepeat, isPending }) {
  const isColada = sticker.status === "colada";
  const isRepetida = sticker.status === "repetida";
  const isAColar = sticker.status === "a_colar";

  return (
    <div
      className="relative rounded-xl border transition-all duration-200 p-2 flex flex-col items-center gap-1"
      style={{
        backgroundColor: isColada
          ? "rgba(250, 204, 21, 0.1)"
          : isRepetida
            ? "rgba(96, 165, 250, 0.1)"
            : isAColar
              ? "rgba(74, 222, 128, 0.1)"
              : "var(--bg-card)",
        borderColor: isColada
          ? "rgba(250, 204, 21, 0.5)"
          : isRepetida
            ? "rgba(96, 165, 250, 0.5)"
            : isAColar
              ? "rgba(74, 222, 128, 0.5)"
              : "var(--border)",
      }}
    >
      {/* Indicador de troca pendente */}
      {isPending && (
        <div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2"
          style={{
            backgroundColor: "#f97316",
            borderColor: "var(--bg-primary)",
          }}
          title="Troca pendente"
        />
      )}

      <span
        className="text-xs font-bold"
        style={{
          color: isColada
            ? "#facc15"
            : isRepetida
              ? "#60a5fa"
              : isAColar
                ? "#4ade80"
                : "var(--text-muted)",
        }}
      >
        {sticker.code}
      </span>

      <button
        onClick={() => onToggle(sticker)}
        title={
          isColada || isRepetida || isAColar ? "Remover" : "Marcar como colada"
        }
        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all"
        style={{
          backgroundColor: isColada
            ? "#facc15"
            : isRepetida
              ? "rgba(96, 165, 250, 0.2)"
              : isAColar
                ? "rgba(74, 222, 128, 0.2)"
                : "var(--bg-secondary)",
          color: isColada
            ? "#09090b"
            : isRepetida
              ? "#60a5fa"
              : isAColar
                ? "#4ade80"
                : "var(--text-muted)",
        }}
      >
        {isColada || isRepetida || isAColar ? "✓" : "+"}
      </button>

      {(isColada || isRepetida) && (
        <div className="flex items-center gap-1 mt-0.5">
          <button
            onClick={() => onRepeat(sticker, 1)}
            title="Tenho repetida"
            className="w-5 h-5 rounded text-xs transition-all flex items-center justify-center"
            style={{
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-muted)",
            }}
          >
            +
          </button>
          {isRepetida && (
            <>
              <span className="text-xs font-bold" style={{ color: "#60a5fa" }}>
                {sticker.quantity}x
              </span>
              <button
                onClick={() => onRepeat(sticker, -1)}
                className="w-5 h-5 rounded text-xs transition-all flex items-center justify-center"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-muted)",
                }}
              >
                −
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
