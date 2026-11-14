"use client";

import { useActionState, useState } from "react";
import { ingresar } from "@/app/admin/acciones";

export function FormIngreso() {
  const [estado, accion, cargando] = useActionState(ingresar, undefined);
  const [ver, setVer] = useState(false);

  return (
    <form action={accion} className="mt-6 space-y-5">
      <div>
        <label htmlFor="password" className="etiqueta-g">Contraseña</label>
        <input
          id="password"
          name="password"
          type={ver ? "text" : "password"}
          autoComplete="current-password"
          required
          autoFocus
          className="campo-g"
        />
        <label className="mt-3 flex cursor-pointer items-center gap-3 text-lg">
          <input type="checkbox" checked={ver} onChange={(e) => setVer(e.target.checked)} className="size-6 accent-rojo" />
          Mostrar la contraseña
        </label>
      </div>
      {estado?.error && (
        <p role="alert" className="rounded-md bg-rojo-claro p-4 text-lg font-semibold text-rojo-oscuro">{estado.error}</p>
      )}
      <button disabled={cargando} className="btn-g w-full bg-rojo text-white hover:bg-rojo-oscuro">
        {cargando ? "Entrando…" : "Entrar"}
      </button>
      <p className="text-base text-stone-500">Vas a quedar conectado en este dispositivo durante 30 días.</p>
    </form>
  );
}
