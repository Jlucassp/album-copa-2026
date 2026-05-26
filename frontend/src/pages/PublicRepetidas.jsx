import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export default function PublicRepetidas() {
  const { userId } = useParams();
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState([]);
  const [requesterName, setRequesterName] = useState("");
  const [step, setStep] = useState("browse"); // browse | confirm | success

  useEffect(() => {
    async function fetchRepetidas() {
      try {
        const { data } = await api.get(`/stickers/public/${userId}`);
        setStickers(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchRepetidas();
  }, [userId]);

  function toggleSelect(sticker) {
    setSelected((prev) => {
      const exists = prev.find((s) => s.code === sticker.code);
      if (exists) return prev.filter((s) => s.code !== sticker.code);
      return [...prev, sticker];
    });
  }

  async function handleConfirm() {
    if (!requesterName.trim()) return;
    try {
      await api.post(`/trades/${userId}`, {
        requesterName: requesterName.trim(),
        stickers: selected.map((s) => ({
          code: s.code,
          description: s.description,
          quantity: s.quantity,
        })),
      });
      setStep("success");
    } catch {
      alert("Erro ao enviar pedido. Tente novamente.");
    }
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Carregando...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Usuário não encontrado.
        </p>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="text-center space-y-3">
          <p className="text-4xl">🎉</p>
          <p
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Pedido enviado!
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            O dono do álbum vai ver seu pedido em breve.
          </p>
        </div>
      </div>
    );
  }

  const fwc = stickers.filter((s) => s.section === "FWC");
  const teams = stickers.filter((s) => s.section === "team");
  const cocaCola = stickers.filter((s) => s.section === "coca-cola");
  const extra = stickers.filter((s) => s.section === "extra");
  const total = stickers.reduce((acc, s) => acc + s.quantity, 0);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Header */}
      <div
        className="border-b px-6 py-5 sticky top-0 z-10"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-black"
              style={{ color: "var(--text-primary)" }}
            >
              Meu<span className="text-yellow-400">Álbum</span>
            </h1>
            <p
              className="text-sm mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {total} figurinha{total !== 1 ? "s" : ""} disponíveis para troca
            </p>
          </div>

          {selected.length > 0 && step === "browse" && (
            <button
              onClick={() => setStep("confirm")}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ backgroundColor: "#facc15", color: "#09090b" }}
            >
              Pedir {selected.length} figurinha
              {selected.length !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      {step === "browse" && (
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
          {stickers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <p
                className="font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                Nenhuma figurinha repetida disponível.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Clique nas figurinhas que você quer e depois confirme o pedido.
              </p>
              {fwc.length > 0 && (
                <Section
                  title="⭐ Especiais FWC"
                  stickers={fwc}
                  selected={selected}
                  onToggle={toggleSelect}
                />
              )}
              {groups.map((g) => {
                const groupStickers = teams.filter((s) => s.group === g);
                if (groupStickers.length === 0) return null;
                return (
                  <Section
                    key={g}
                    title={`Grupo ${g}`}
                    stickers={groupStickers}
                    selected={selected}
                    onToggle={toggleSelect}
                  />
                );
              })}
              {cocaCola.length > 0 && (
                <Section
                  title="🥤 Coca-Cola"
                  stickers={cocaCola}
                  selected={selected}
                  onToggle={toggleSelect}
                />
              )}
              {extra.length > 0 && (
                <Section
                  title="✨ Extra Stickers"
                  stickers={extra}
                  selected={selected}
                  onToggle={toggleSelect}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Confirmação */}
      {step === "confirm" && (
        <div className="max-w-lg mx-auto px-6 py-8 space-y-6">
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Confirmar pedido
          </h2>

          {/* Nome */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              Seu nome
            </label>
            <input
              type="text"
              placeholder="Como você se chama?"
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Lista de figurinhas selecionadas */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              Figurinhas selecionadas ({selected.length})
            </p>
            <div className="space-y-2">
              {selected.map((s) => (
                <div
                  key={s.code}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl border"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div>
                    <p
                      className="font-bold text-sm"
                      style={{ color: "#60a5fa" }}
                    >
                      {s.code}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {s.description}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSelect(s)}
                    className="text-xs px-2 py-1 rounded-lg"
                    style={{
                      color: "var(--text-muted)",
                      backgroundColor: "var(--bg-secondary)",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep("browse")}
              className="flex-1 py-3 rounded-xl text-sm font-semibold"
              style={{
                backgroundColor: "var(--bg-card)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              Voltar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!requesterName.trim()}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              style={{ backgroundColor: "#facc15", color: "#09090b" }}
            >
              Enviar pedido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, stickers, selected, onToggle }) {
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
        {stickers.map((s, i) => {
          const isSelected = selected.find((sel) => sel.code === s.code);
          return (
            <button
              key={i}
              onClick={() => onToggle(s)}
              className="rounded-xl px-4 py-3 flex items-center justify-between border transition-all text-left"
              style={{
                backgroundColor: isSelected
                  ? "rgba(250, 204, 21, 0.1)"
                  : "var(--bg-card)",
                borderColor: isSelected
                  ? "rgba(250, 204, 21, 0.5)"
                  : "rgba(96, 165, 250, 0.3)",
              }}
            >
              <div>
                <p
                  className="font-bold text-sm"
                  style={{ color: isSelected ? "#facc15" : "#60a5fa" }}
                >
                  {s.code}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {s.description}
                </p>
              </div>
              <span
                className="font-black text-lg"
                style={{ color: isSelected ? "#facc15" : "#60a5fa" }}
              >
                {isSelected ? "✓" : `${s.quantity}x`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
