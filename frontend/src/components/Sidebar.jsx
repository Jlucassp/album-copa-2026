import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import api from "../services/api";

const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export default function Sidebar({
  active,
  onSelect,
  isOpen,
  onClose,
  refreshKey,
}) {
  const { user, logout } = useAuth();
  const [byGroup, setByGroup] = useState({});

  useEffect(() => {
    async function fetchProgress() {
      try {
        const { data } = await api.get("/stickers/progress");
        setByGroup(data.byGroup);
      } catch (err) {
        console.error(err);
      }
    }
    fetchProgress();
  }, [refreshKey]);

  function handleSelect(section) {
    onSelect(section);
    onClose();
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-30
          flex flex-col transition-transform duration-300
          border-r
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        {/* Logo */}
        <div
          className="px-6 py-6 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <h1
            className="text-2xl font-black"
            style={{ color: "var(--text-primary)" }}
          >
            Meu<span className="text-yellow-400">Álbum</span>
          </h1>
          <p
            className="text-xs tracking-widest uppercase mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            Copa 2026
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <SidebarItem
            label="⭐ Especiais FWC"
            active={active === "FWC"}
            onClick={() => handleSelect("FWC")}
          />
          <SidebarItem
            label="🔁 Minhas Repetidas"
            active={active === "repetidas"}
            onClick={() => handleSelect("repetidas")}
          />
          <SidebarItem
            label="🤝 Pedidos de Troca"
            active={active === "trocas"}
            onClick={() => handleSelect("trocas")}
          />
          <SidebarItem
            label="📤 Pedidos Enviados"
            active={active === "trocas-enviadas"}
            onClick={() => handleSelect("trocas-enviadas")}
          />

          <div className="pt-3 pb-1 px-3">
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Grupos
            </p>
          </div>

          {groups.map((g) => {
            const groupData = byGroup[g];
            const percent = groupData
              ? Math.round((groupData.coladas / groupData.total) * 100)
              : 0;
            return (
              <SidebarItem
                key={g}
                label={`Grupo ${g}`}
                active={active === `group-${g}`}
                onClick={() => handleSelect(`group-${g}`)}
                percent={percent}
              />
            );
          })}

          <div className="pt-3 pb-1 px-3">
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Especiais
            </p>
          </div>
          <SidebarItem
            label="🥤 Coca-Cola"
            active={active === "coca-cola"}
            onClick={() => handleSelect("coca-cola")}
          />
          <SidebarItem
            label="✨ Extra Stickers"
            active={active === "extra"}
            onClick={() => handleSelect("extra")}
          />
        </nav>

        {/* User */}
        <div
          className="px-4 py-4 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {user?.name}
          </p>
          <button
            onClick={logout}
            className="text-xs hover:text-red-400 transition-colors mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({ label, active, onClick, percent }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
      style={{
        backgroundColor: active ? "#facc15" : "transparent",
        color: active ? "#09090b" : "var(--text-secondary)",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = "var(--bg-card)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <div className="flex items-center justify-between">
        <span>{label}</span>
        {percent !== undefined && (
          <span
            className="text-xs font-bold"
            style={{ color: active ? "#09090b" : "var(--text-muted)" }}
          >
            {percent}%
          </span>
        )}
      </div>
      {percent !== undefined && (
        <div
          className="mt-1.5 w-full h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--border)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              backgroundColor: active ? "rgba(0,0,0,0.3)" : "#facc15",
            }}
          />
        </div>
      )}
    </button>
  );
}
