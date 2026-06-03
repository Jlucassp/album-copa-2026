import { useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import StickerGrid from "../components/StickerGrid";
import Progress from "../components/Progress";
import Repetidas from "../pages/Repetidas";
import Trocas from "../pages/Trocas";
import TrocasEnviadas from "../pages/TrocasEnviadas";
import { useTheme } from "../context/useTheme";
import { useAuth } from "../context/useAuth";

export default function Album() {
  const [active, setActive] = useState("FWC");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  function handleSelect(section) {
    setActive(section);
    setSearch("");
  }

  return (
    <div
      className="flex overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)", height: "100dvh" }}
    >
      <Sidebar
        active={active}
        onSelect={handleSelect}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        refreshKey={refreshKey}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header
          className="flex items-center gap-4 px-6 py-4 border-b"
          style={{
            backgroundColor: "var(--bg-primary)",
            borderColor: "var(--border)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Busca global */}
          <div className="flex-1 relative">
            <input
              type="text"
              autoComplete="new-password"
              name="busca-figurinha"
              placeholder="Buscar figurinha (ex: BRA1, FWC3, MEX...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl px-4 py-2 text-sm outline-none border transition-colors"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Botão compartilhar repetidas */}
          {active === "repetidas" && (
            <button
              onClick={() => {
                const url = `${window.location.origin}/repetidas/${user.id}`;
                navigator.clipboard.writeText(url);
                alert("Link copiado!");
              }}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap"
              style={{
                backgroundColor: "rgba(250, 204, 21, 0.15)",
                color: "#facc15",
                border: "1px solid rgba(250, 204, 21, 0.3)",
              }}
            >
              🔗 Copiar link
            </button>
          )}

          {/* Título da seção */}
          <h2
            className="font-bold text-lg"
            style={{ color: "var(--text-primary)" }}
          >
            {active === "FWC" && "Especiais FWC"}
            {active === "coca-cola" && "Coca-Cola"}
            {active === "extra" && "Extra Stickers"}
            {active === "repetidas" && "Minhas Repetidas"}
            {active === "trocas" && "Pedidos de Troca"}
            {active === "trocas-enviadas" && "Pedidos Enviados"}
            {active.startsWith("group-") &&
              `Grupo ${active.replace("group-", "")}`}
          </h2>

          {/* Toggle tema */}
          <button
            onClick={toggleTheme}
            className="transition-colors p-2 rounded-lg"
            style={{ color: "var(--text-secondary)" }}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
          >
            {theme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                />
              </svg>
            )}
          </button>
        </header>

        <Progress refreshKey={refreshKey} />

        <div className="flex-1 overflow-y-auto p-6">
          {active === "repetidas" && !search ? (
            <Repetidas />
          ) : active === "trocas" && !search ? (
            <Trocas />
          ) : active === "trocas-enviadas" && !search ? (
            <TrocasEnviadas />
          ) : (
            <StickerGrid
              active={active}
              onRefresh={handleRefresh}
              globalSearch={search}
            />
          )}
        </div>
      </main>
    </div>
  );
}
