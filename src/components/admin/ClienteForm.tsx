"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { borrarClienteAccion, guardarClienteAccion } from "@/app/admin/acciones-clientes";
import { Casilla } from "./Campos";
import { Confirmar } from "./Confirmar";

type Datos = { email: string; nombre: string; telefono: string; ciudad: string; notas: string; aceptaMails: boolean };

export function ClienteForm({ id, inicial, origenWeb, puedeBorrar }: { id?: string; inicial: Datos; origenWeb?: boolean; puedeBorrar?: boolean }) {
  const router = useRouter();
  const [d, setD] = useState(inicial);
  const [error, setError] = useState("");
  const [borrar, setBorrar] = useState(false);
  const [cargando, start] = useTransition();
  const campo = (k: keyof Datos, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={k} className="etiqueta-g">{label}</label>
      <input id={k} value={String(d[k])} onChange={(e) => setD({ ...d, [k]: e.target.value })} className="campo-g" {...props} />
    </div>
  );
  const ir = (msg: string) => { router.push(`/admin/clientes?ok=${encodeURIComponent(msg)}`); router.refresh(); };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        start(async () => {
          const r = await guardarClienteAccion(id ?? null, { ...d });
          if (!r.ok) return setError(r.error);
          ir(r.mensaje);
        });
      }}
      className="tarjeta-g space-y-6 p-5 sm:p-7"
    >
      {campo("nombre", "Nombre y apellido", { required: true, autoComplete: "off" })}
      {campo("email", "Email", { type: "email", required: true, autoComplete: "off", readOnly: origenWeb })}
      {origenWeb && <p className="-mt-4 text-base text-stone-500">Se registró solo con este email, por eso no se puede cambiar.</p>}
      <div className="grid gap-6 sm:grid-cols-2">
        {campo("telefono", "Teléfono", { type: "tel", autoComplete: "off" })}
        {campo("ciudad", "Ciudad", { autoComplete: "off" })}
      </div>
      <div>
        <label htmlFor="notas" className="etiqueta-g">Notas <span className="font-normal text-stone-500">(solo las ves vos)</span></label>
        <textarea id="notas" rows={3} value={d.notas} onChange={(e) => setD({ ...d, notas: e.target.value })} className="campo-g h-auto! py-3" placeholder="Ej: busca una pick-up diésel hasta $30 millones" />
      </div>
      <Casilla
        label="Aceptó recibir mails con novedades"
        ayuda="Marcalo solo si el cliente te dijo que sí. Los mails a todos los clientes solo les llegan a los que aceptaron."
        valor={d.aceptaMails}
        onChange={(v) => setD({ ...d, aceptaMails: v })}
      />
      {error && <p role="alert" className="rounded-lg bg-rojo-claro p-4 text-lg font-semibold text-rojo-oscuro">{error}</p>}
      <button disabled={cargando} className="btn-g w-full bg-rojo text-white hover:bg-rojo-oscuro">{cargando ? "Guardando…" : "Guardar cliente"}</button>
      {id && puedeBorrar && (
        <button type="button" onClick={() => setBorrar(true)} className="btn-g w-full border-2 border-stone-300 bg-white text-rojo-oscuro hover:border-rojo">
          Borrar este cliente
        </button>
      )}
      {borrar && id && (
        <Confirmar
          titulo={`¿Borrar a ${d.nombre || d.email}?`}
          texto="Se borran sus datos y sus favoritos. No se puede deshacer."
          confirmar="Sí, borrarlo"
          peligro
          cargando={cargando}
          onCancelar={() => setBorrar(false)}
          onConfirmar={() => start(async () => { const r = await borrarClienteAccion(id); if (!r.ok) { setBorrar(false); return setError(r.error); } ir(r.mensaje); })}
        />
      )}
    </form>
  );
}
