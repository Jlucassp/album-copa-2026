import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import api from "../services/api";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, password: form.password };

      const { data } = await api.post(endpoint, payload);
      const redirect = location.state?.redirect || "/";
      login(data.token, data.user);
      navigate(redirect);
    } catch (err) {
      setError(
        err.response?.data?.message || "Erro ao conectar com o servidor.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <h1
            className="text-4xl font-black tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Meu<span className="text-yellow-400">Álbum</span>
          </h1>
          <p
            className="text-sm mt-1 tracking-widest uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Copa do Mundo 2026
          </p>
        </div>

        {/* Toggle */}
        <div
          className="flex rounded-xl p-1 mb-8"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <button
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{
              backgroundColor: mode === "login" ? "#facc15" : "transparent",
              color: mode === "login" ? "#09090b" : "var(--text-muted)",
            }}
          >
            Entrar
          </button>
          <button
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{
              backgroundColor: mode === "register" ? "#facc15" : "transparent",
              color: mode === "register" ? "#09090b" : "var(--text-muted)",
            }}
          >
            Criar conta
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                Nome
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Seu nome"
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors border"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          )}

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              E-mail
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors border"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              Senha
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors border"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold py-3 rounded-xl transition-colors duration-200 text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading
              ? "Aguarde..."
              : mode === "login"
                ? "Entrar"
                : "Criar conta"}
          </button>
        </form>
      </div>
    </div>
  );
}
