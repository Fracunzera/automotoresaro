"use client";

import { useActionState, useState } from "react";
import { ingresar } from "@/app/admin/acciones";

/** Ingreso de la agencia: usuario y contraseña. Letra grande. */
export function FormIngreso({ volver }: { volver: string }) {
  const [estado, accion, cargando] = useActionState(ingresar, undefined);
  const [ver, setVer] = useState(false);

  return (
    <form action={accion} className="space-y-5 text-lg">
      <input type="hidden" name="volver" value={volver} />
      <div>
        <label htmlFor="usuario" className="etiqueta-g">Usuario</label>
        <input id="usuario" name="usuario" autoComplete="username" autoCapitalize="none" required autoFocus className="campo-g" />
      </div>
      <div>
        <label htmlFor="password" className="etiqueta-g">Contraseña</label>
        <input id="password" name="password" type={ver ? "text" : "password"} autoComplete="current-password" required className="campo-g" />
        <label className="mt-3 flex cursor-pointer items-center gap-3">
          <input type="checkbox" checked={ver} onChange={(e) => setVer(e.target.checked)} className="size-6 accent-rojo" />
          Mostrar la contraseña
        </label>
      </div>
      {estado?.error && (
        <p role="alert" className="rounded-md bg-rojo-claro p-4 font-semibold text-rojo-oscuro">{estado.error}</p>
      )}
      <button disabled={cargando} className="btn-g w-full bg-rojo text-white hover:bg-rojo-oscuro">
        {cargando ? "Entrando…" : "Entrar al panel"}
      </button>
      <p className="text-base text-stone-500">Vas a quedar conectado en este dispositivo durante 30 días.</p>
    </form>
  );
}
