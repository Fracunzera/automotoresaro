"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { confirmarCodigo, guardarPerfil, pedirCodigo } from "@/app/(sitio)/cuenta/acciones";

type Paso = "email" | "codigo" | "perfil";

export function Ingreso({ volver, fav }: { volver: string; fav?: string }) {
  const [paso, setPaso] = useState<Paso>("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [perfil, setPerfil] = useState({ nombre: "", telefono: "", ciudad: "", aceptaMails: false });
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [cargando, start] = useTransition();

  async function terminar() {
    if (fav) {
      await fetch("/api/cuenta/favoritos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ autoId: fav }) }).catch(() => {});
    }
    window.location.assign(volver);
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    setError("");
    start(async () => {
      if (paso === "email") {
        const r = await pedirCodigo(email);
        if (!r.ok) return setError(r.error);
        setAviso("");
        setPaso("codigo");
      } else if (paso === "codigo") {
        const r = await confirmarCodigo(email, codigo);
        if (!r.ok) return setError(r.error);
        if (r.completarPerfil) setPaso("perfil");
        else await terminar();
      } else {
        const r = await guardarPerfil(perfil);
        if (!r.ok) return setError(r.error);
        await terminar();
      }
    });
  }

  return (
    <form onSubmit={enviar} className="rounded-lg border border-linea p-6 sm:p-8">
      {paso === "email" && (
        <>
          <h1 className="titulo text-[34px]">Ingresá o creá tu cuenta</h1>
          <p className="mt-2 text-stone-600">
            {fav ? "Para guardar autos en favoritos, ingresá con tu email." : "Guardá tus autos favoritos y miralos desde cualquier dispositivo."} Sin contraseñas: te mandamos un código por mail.
          </p>
          <label htmlFor="email" className="etiqueta mt-6">Email</label>
          <input id="email" type="email" inputMode="email" autoComplete="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} className="campo" placeholder="tunombre@email.com" />
          <button disabled={cargando} className="btn-rojo mt-5 w-full">{cargando ? "Enviando…" : "Recibir código"}</button>
        </>
      )}

      {paso === "codigo" && (
        <>
          <h1 className="titulo text-[34px]">Revisá tu mail</h1>
          <p className="mt-2 text-stone-600">
            Mandamos un código de 6 números a <b className="text-tinta">{email}</b>. Si no lo ves, fijate en correo no deseado.
          </p>
          <label htmlFor="codigo" className="etiqueta mt-6">Código</label>
          <input
            id="codigo"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            autoFocus
            maxLength={7}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="campo h-14! text-center font-display text-3xl! font-bold tracking-[0.4em]"
          />
          <button disabled={cargando || codigo.length < 6} className="btn-rojo mt-5 w-full">{cargando ? "Verificando…" : "Entrar"}</button>
          <div className="mt-4 flex justify-between text-sm">
            <button type="button" onClick={() => { setPaso("email"); setCodigo(""); setError(""); }} className="font-semibold text-stone-600 hover:text-tinta">
              Cambiar email
            </button>
            <button
              type="button"
              disabled={cargando}
              onClick={() => start(async () => { const r = await pedirCodigo(email); if (r.ok) setAviso("Te mandamos un código nuevo."); else setError(r.error); })}
              className="font-semibold text-rojo hover:underline"
            >
              Mandar otro código
            </button>
          </div>
        </>
      )}

      {paso === "perfil" && (
        <>
          <h1 className="titulo text-[34px]">¡Bienvenido!</h1>
          <p className="mt-2 text-stone-600">Un último paso: contanos cómo te llamás.</p>
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="nombre" className="etiqueta">Nombre y apellido</label>
              <input id="nombre" required autoFocus autoComplete="name" value={perfil.nombre} onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })} className="campo" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="telefono" className="etiqueta">Teléfono <span className="font-normal text-stone-400">(opcional)</span></label>
                <input id="telefono" type="tel" autoComplete="tel" value={perfil.telefono} onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })} className="campo" />
              </div>
              <div>
                <label htmlFor="ciudad" className="etiqueta">Ciudad <span className="font-normal text-stone-400">(opcional)</span></label>
                <input id="ciudad" autoComplete="address-level2" value={perfil.ciudad} onChange={(e) => setPerfil({ ...perfil, ciudad: e.target.value })} className="campo" />
              </div>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-md bg-papel p-4 text-[15px]">
              <input type="checkbox" checked={perfil.aceptaMails} onChange={(e) => setPerfil({ ...perfil, aceptaMails: e.target.checked })} className="mt-0.5 size-5 shrink-0 accent-rojo" />
              <span>Quiero recibir por mail los autos nuevos y novedades. Me puedo dar de baja cuando quiera.</span>
            </label>
          </div>
          <button disabled={cargando} className="btn-rojo mt-5 w-full">{cargando ? "Guardando…" : "Listo"}</button>
          <p className="mt-3 text-[13px] text-stone-500">
            Al continuar aceptás nuestra <Link href="/privacidad" className="underline">política de privacidad</Link>.
          </p>
        </>
      )}

      {aviso && <p role="status" className="mt-4 rounded-md bg-[#e7f4ec] p-3 text-sm font-semibold text-[#17733c]">{aviso}</p>}
      {error && <p role="alert" className="mt-4 rounded-md bg-rojo-claro p-3 text-sm font-semibold text-rojo-oscuro">{error}</p>}
    </form>
  );
}
