"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { guardarMarcaAccion } from "@/app/admin/acciones-equipo";
import { ICONOS_BENEFICIO, blancoSeLee, cssTema, type Marca } from "@/lib/agencia-tipos";
import { Icon } from "../Icon";
import { SubirImagen } from "./SubirImagen";

const PALETA_PRINCIPAL = ["#d12b1f", "#e8590c", "#c2185b", "#7b1fa2", "#1f45c9", "#0b7285", "#1f7a3a", "#b08800", "#5c4033", "#2b2e34"];
const PALETA_OSCURO = ["#15171a", "#0d1b4d", "#1b2a24", "#2a1a1a", "#1f1f2e", "#333333"];

function Seccion({ titulo, ayuda, children }: { titulo: string; ayuda?: string; children: ReactNode }) {
  return (
    <section className="tarjeta-g space-y-6 p-5 sm:p-7">
      <div>
        <h2 className="text-2xl font-bold">{titulo}</h2>
        {ayuda && <p className="mt-1 text-lg text-stone-600">{ayuda}</p>}
      </div>
      {children}
    </section>
  );
}

function ElegirColor({ id, label, valor, paleta, onChange }: { id: string; label: string; valor: string; paleta: string[]; onChange: (c: string) => void }) {
  return (
    <fieldset>
      <legend className="etiqueta-g">{label}</legend>
      <div className="flex flex-wrap items-center gap-2">
        {paleta.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Color ${c}`}
            aria-pressed={valor.toLowerCase() === c}
            onClick={() => onChange(c)}
            className={`size-12 rounded-full border-4 ${valor.toLowerCase() === c ? "border-tinta ring-2 ring-white ring-inset" : "border-white shadow"}`}
            style={{ background: c }}
          />
        ))}
        <label className="flex min-h-12 cursor-pointer items-center gap-2 rounded-md border-2 border-stone-300 bg-white px-3 text-base font-semibold">
          <input id={id} type="color" value={valor} onChange={(e) => onChange(e.target.value)} className="size-8 cursor-pointer border-0 bg-transparent p-0" />
          Otro color
        </label>
      </div>
    </fieldset>
  );
}

export function MarcaForm({ inicial, nombre }: { inicial: Marca; nombre: string }) {
  const router = useRouter();
  const [m, setM] = useState<Marca>(inicial);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [guardando, start] = useTransition();
  const set = <K extends keyof Marca>(k: K, v: Marca[K]) => setM((p) => ({ ...p, [k]: v }));
  const setB = (i: number, k: "titulo" | "texto" | "icono", v: string) =>
    setM((p) => ({ ...p, beneficios: p.beneficios.map((b, j) => (j === i ? { ...b, [k]: v } : b)) }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        start(async () => {
          const r = await guardarMarcaAccion({ ...m });
          setMsg(r.ok ? { ok: true, t: r.mensaje } : { ok: false, t: r.error });
          if (r.ok) router.refresh();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      }}
      className="space-y-6"
    >
      {/* Vista previa con los colores elegidos (sin afectar el resto hasta guardar) */}
      <style>{cssTema(m).replace(":root", ".vista-previa")}</style>

      {msg && (
        <p role="status" className={`rounded-lg border-2 p-4 text-lg font-semibold ${msg.ok ? "border-[#9fd3b2] bg-[#e7f4ec] text-[#17733c]" : "border-rojo bg-rojo-claro text-rojo-oscuro"}`}>
          {msg.ok ? "✓ " : ""}{msg.t}
        </p>
      )}

      <Seccion titulo="Colores" ayuda="Abajo ves cómo queda antes de guardar.">
        <ElegirColor id="principal" label="Color principal (botones y detalles)" valor={m.colorPrincipal} paleta={PALETA_PRINCIPAL} onChange={(c) => set("colorPrincipal", c)} />
        {!blancoSeLee(m.colorPrincipal) && (
          <p className="rounded-md bg-[#fff8e1] p-3 text-lg">Ojo: este color es muy claro y el texto blanco de los botones no se va a leer bien. Elegí uno más oscuro.</p>
        )}
        <ElegirColor id="oscuro" label="Color oscuro (portada, encabezado y pie)" valor={m.colorOscuro} paleta={PALETA_OSCURO} onChange={(c) => set("colorOscuro", c)} />

        <div className="vista-previa overflow-hidden rounded-lg border-2 border-linea">
          <div className="bg-tinta px-4 py-2 text-sm text-stone-300">Encabezado · {nombre}</div>
          <div className="bg-tinta px-4 pb-6 pt-4 text-white">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-rojo">{nombre}</p>
            <p className="titulo mt-1 text-[30px] uppercase text-white">{m.portadaTitulo || "Título de la portada"}</p>
            <span className="btn-rojo mt-4">Botón de ejemplo</span>
          </div>
          <div className="flex items-center justify-between bg-white px-4 py-3">
            <span className="font-display text-2xl font-bold">$ 12.500.000</span>
            <span className="font-semibold text-rojo">Ver más →</span>
          </div>
        </div>
      </Seccion>

      <Seccion titulo="Logo" ayuda="Opcional. Si no subís un logo, se muestra el nombre en letras. Mejor si es PNG con fondo transparente.">
        <SubirImagen id="logo" valor={m.logo} onChange={(u) => set("logo", u)} formato="png" ladoMax={800} alto="h-28" textoBoton="Subir logo" />
      </Seccion>

      <Seccion titulo="Portada" ayuda="Lo primero que se ve al entrar a la página.">
        <div>
          <label htmlFor="titulo" className="etiqueta-g">Título grande</label>
          <input id="titulo" value={m.portadaTitulo} onChange={(e) => set("portadaTitulo", e.target.value)} maxLength={80} className="campo-g" />
        </div>
        <div>
          <label htmlFor="eslogan" className="etiqueta-g">Frase debajo del título</label>
          <input id="eslogan" value={m.eslogan} onChange={(e) => set("eslogan", e.target.value)} maxLength={160} className="campo-g" />
        </div>
        <div>
          <span className="etiqueta-g">Foto de fondo (opcional)</span>
          <SubirImagen id="portada" valor={m.portadaFoto} onChange={(u) => set("portadaFoto", u)} textoBoton="Subir foto de portada" />
          <p className="ayuda-g">Una foto del local o de los productos, apaisada. Se oscurece un poco para que se lea el texto.</p>
        </div>
        <div>
          <label htmlFor="descripcion" className="etiqueta-g">Descripción corta</label>
          <textarea id="descripcion" rows={2} value={m.descripcion} onChange={(e) => set("descripcion", e.target.value)} maxLength={300} className="campo-g h-auto! py-3" />
          <p className="ayuda-g">Aparece al pie de la página y cuando se comparte el link (WhatsApp, Facebook, Google).</p>
        </div>
      </Seccion>

      <Seccion titulo="Por qué elegirnos" ayuda="Los beneficios que se muestran en la portada. Hasta 6.">
        {m.beneficios.map((b, i) => (
          <div key={i} className="space-y-3 rounded-md border-2 border-linea p-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold">Beneficio {i + 1}</p>
              <button type="button" onClick={() => setM((p) => ({ ...p, beneficios: p.beneficios.filter((_, j) => j !== i) }))} className="text-base font-semibold text-rojo-oscuro">
                Quitar
              </button>
            </div>
            <input value={b.titulo} onChange={(e) => setB(i, "titulo", e.target.value)} maxLength={60} placeholder="Título" aria-label={`Título del beneficio ${i + 1}`} className="campo-g" />
            <textarea value={b.texto} onChange={(e) => setB(i, "texto", e.target.value)} maxLength={200} rows={2} placeholder="Explicación corta" aria-label={`Texto del beneficio ${i + 1}`} className="campo-g h-auto! py-3" />
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={`Ícono del beneficio ${i + 1}`}>
              {ICONOS_BENEFICIO.map((ic) => (
                <button
                  key={ic.id}
                  type="button"
                  role="radio"
                  aria-checked={b.icono === ic.id}
                  aria-label={ic.nombre}
                  onClick={() => setB(i, "icono", ic.id)}
                  className={`grid size-12 place-items-center rounded-md border-2 ${b.icono === ic.id ? "border-tinta bg-tinta text-white" : "border-stone-300 bg-white"}`}
                >
                  <Icon name={ic.id} className="size-6" />
                </button>
              ))}
            </div>
          </div>
        ))}
        {m.beneficios.length < 6 && (
          <button type="button" onClick={() => set("beneficios", [...m.beneficios, { titulo: "", texto: "", icono: "check" }])} className="btn-g w-full border-2 border-dashed border-tinta bg-white">
            + Agregar beneficio
          </button>
        )}
      </Seccion>

      <Seccion titulo="Página “Nosotros”" ayuda="Contá la historia del negocio: desde cuándo están, quiénes atienden, qué los diferencia.">
        <div>
          <label htmlFor="nos-titulo" className="etiqueta-g">Título</label>
          <input id="nos-titulo" value={m.nosotrosTitulo} onChange={(e) => set("nosotrosTitulo", e.target.value)} maxLength={100} className="campo-g" />
        </div>
        <div>
          <label htmlFor="nos-texto" className="etiqueta-g">Texto</label>
          <textarea id="nos-texto" rows={6} value={m.nosotrosTexto} onChange={(e) => set("nosotrosTexto", e.target.value)} maxLength={3000} className="campo-g h-auto! py-3" />
          <p className="ayuda-g">Dejá una línea en blanco para separar párrafos.</p>
        </div>
      </Seccion>

      <div className="sticky bottom-0 -mx-4 border-t-2 border-linea bg-white p-4 sm:static sm:mx-0 sm:rounded-lg sm:border-2">
        <button disabled={guardando} className="btn-g w-full bg-rojo text-white hover:bg-rojo-oscuro">{guardando ? "Guardando…" : "Guardar marca"}</button>
      </div>
    </form>
  );
}
