"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Estado = {
  cargado: boolean;
  cliente: { nombre: string } | null;
  favoritos: string[];
  admin: boolean;
  alternar: (autoId: string) => Promise<void>;
};

const Ctx = createContext<Estado>({ cargado: false, cliente: null, favoritos: [], admin: false, alternar: async () => {} });

export const useCliente = () => useContext(Ctx);

/** Sabe quién está conectado y qué autos guardó, sin que las páginas dejen de ser rápidas. */
export function ClienteProvider({ children }: { children: ReactNode }) {
  const [cargado, setCargado] = useState(false);
  const [cliente, setCliente] = useState<Estado["cliente"]>(null);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [admin, setAdmin] = useState(false);
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    fetch("/api/cuenta/estado", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { cliente: Estado["cliente"]; favoritos: string[]; admin: boolean }) => {
        setCliente(d.cliente);
        setFavoritos(d.favoritos);
        setAdmin(d.admin);
      })
      .catch(() => {})
      .finally(() => setCargado(true));
  }, [path]);

  const alternar = useCallback(
    async (autoId: string) => {
      if (!cliente) {
        router.push(`/ingresar?volver=${encodeURIComponent(window.location.pathname)}&fav=${autoId}`);
        return;
      }
      // Cambio inmediato en pantalla; se corrige si falla
      setFavoritos((f) => (f.includes(autoId) ? f.filter((x) => x !== autoId) : [autoId, ...f]));
      const r = await fetch("/api/cuenta/favoritos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoId }),
      });
      const d = (await r.json().catch(() => ({}))) as { favoritos?: string[] };
      if (d.favoritos) setFavoritos(d.favoritos);
      else if (r.status === 401) setCliente(null);
    },
    [cliente, router],
  );

  return <Ctx.Provider value={{ cargado, cliente, favoritos, admin, alternar }}>{children}</Ctx.Provider>;
}

/** Corazón para guardar un auto en favoritos. */
export function BotonFavorito({ autoId, className = "", conTexto = false }: { autoId: string; className?: string; conTexto?: boolean }) {
  const { favoritos, alternar } = useCliente();
  const guardado = favoritos.includes(autoId);
  return (
    <button
      type="button"
      aria-pressed={guardado}
      aria-label={guardado ? "Quitar de favoritos" : "Guardar en favoritos"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        alternar(autoId);
      }}
      className={className}
    >
      <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden="true">
        <path
          d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z"
          fill={guardado ? "#d12b1f" : "none"}
          stroke={guardado ? "#d12b1f" : "currentColor"}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      {conTexto && <span>{guardado ? "Guardado en favoritos" : "Guardar en favoritos"}</span>}
    </button>
  );
}
