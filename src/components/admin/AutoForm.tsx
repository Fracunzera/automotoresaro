"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { borrarAutoAccion, guardarAuto } from "@/app/admin/acciones";
import {
  MODO_COMISION_TEXTO, calcularGanancia, paraElDueno,
  type Ajustes, type ModoComision, type NegocioAuto,
} from "@/lib/negocio-tipos";
import {
  CARROCERIAS, COLORES, COMBUSTIBLES, EQUIPAMIENTO_COMUN, MARCAS_COMUNES, TRANSMISIONES,
  type Auto, type DatosAuto,
} from "@/lib/tipos";
import { formatNumero } from "@/lib/utils";
import { Casilla, CampoNumero, CampoPesos, Opciones } from "./Campos";
import { Confirmar } from "./Confirmar";
import { SubirFotos } from "./SubirFotos";

const anioActual = new Date().getFullYear();
const pesos = (n: number) => `$ ${formatNumero(n)}`;

const VACIO: DatosAuto = {
  marca: "", modelo: "", version: "", anio: 0, km: 0, precio: 0,
  combustible: "Nafta", transmision: "Manual", carroceria: "Sedán",
  color: "", colorHex: "", puertas: 4, motor: "",
  fotos: [], equipamiento: [], descripcion: "",
  unicoDueno: false, serviceOficial: false, destacado: false,
};

function Seccion({ n, titulo, ayuda, children }: { n: number; titulo: string; ayuda?: string; children: ReactNode }) {
  return (
    <section className="tarjeta-g p-5 sm:p-7">
      <h2 className="flex items-baseline gap-3 text-2xl font-bold">
        <span className="font-display text-3xl text-rojo">{n}.</span> {titulo}
      </h2>
      {ayuda && <p className="mt-1 text-lg text-stone-600">{ayuda}</p>}
      <div className="mt-5 space-y-6">{children}</div>
    </section>
  );
}

export function AutoForm({ auto, negocioInicial, ajustes }: { auto?: Auto; negocioInicial: NegocioAuto; ajustes: Ajustes }) {
  const router = useRouter();
  const [d, setD] = useState<DatosAuto>(() => (auto ? { ...VACIO, ...auto } : VACIO));
  const [neg, setNeg] = useState<NegocioAuto>(negocioInicial);
  const [marcaOtra, setMarcaOtra] = useState(() => !!auto && !MARCAS_COMUNES.includes(auto.marca));
  const [extra, setExtra] = useState("");
  const [error, setError] = useState("");
  const [cambios, setCambios] = useState(false);
  const [sinFotos, setSinFotos] = useState<null | boolean>(null);
  const [borrar, setBorrar] = useState(false);
  const [guardando, start] = useTransition();

  const set = <K extends keyof DatosAuto>(k: K, v: DatosAuto[K]) => { setD((p) => ({ ...p, [k]: v })); setCambios(true); };
  const setN = <K extends keyof NegocioAuto>(k: K, v: NegocioAuto[K]) => { setNeg((p) => ({ ...p, [k]: v })); setCambios(true); };

  // Avisar si se va de la página sin guardar
  useEffect(() => {
    if (!cambios) return;
    const aviso = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [cambios]);

  const ganancia = useMemo(() => calcularGanancia(neg, d.precio, ajustes.comisionMinima), [neg, d.precio, ajustes.comisionMinima]);
  const alDueno = useMemo(() => paraElDueno(neg, d.precio, ajustes.comisionMinima), [neg, d.precio, ajustes.comisionMinima]);
  const equipamientoTodo = Array.from(new Set([...EQUIPAMIENTO_COMUN, ...d.equipamiento]));

  function enviar(publicar: boolean, confirmadoSinFotos = false) {
    setError("");
    if (d.fotos.length === 0 && !confirmadoSinFotos) return setSinFotos(publicar);
    start(async () => {
      const r = await guardarAuto(auto?.id ?? null, { ...d }, { ...neg }, publicar);
      if (!r.ok) {
        setError(r.error);
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        return;
      }
      setCambios(false);
      router.push(`/admin/autos?ok=${encodeURIComponent(r.mensaje)}`);
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const boton = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
        enviar(boton?.dataset.publicar !== "no");
      }}
      className="space-y-6"
    >
      <Seccion n={1} titulo="Fotos" ayuda="Sacalas siempre en el mismo lugar y con buena luz. Mínimo 4: frente, costado, atrás e interior.">
        <SubirFotos fotos={d.fotos} onChange={(f) => set("fotos", f)} />
      </Seccion>

      <Seccion n={2} titulo="Qué auto es">
        <div>
          <label htmlFor="marca" className="etiqueta-g">Marca</label>
          <select
            id="marca"
            value={marcaOtra ? "__otra" : d.marca}
            onChange={(e) => {
              if (e.target.value === "__otra") { setMarcaOtra(true); set("marca", ""); }
              else { setMarcaOtra(false); set("marca", e.target.value); }
            }}
            required={!marcaOtra}
            className="campo-g"
          >
            <option value="" disabled>Elegí la marca</option>
            {MARCAS_COMUNES.map((m) => <option key={m}>{m}</option>)}
            <option value="__otra">Otra marca…</option>
          </select>
          {marcaOtra && (
            <input value={d.marca} onChange={(e) => set("marca", e.target.value)} required placeholder="Escribí la marca" className="campo-g mt-3" aria-label="Otra marca" />
          )}
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="modelo" className="etiqueta-g">Modelo</label>
            <input id="modelo" value={d.modelo} onChange={(e) => set("modelo", e.target.value)} required placeholder="Ej: Corolla" className="campo-g" />
          </div>
          <div>
            <label htmlFor="version" className="etiqueta-g">Versión <span className="font-normal text-stone-500">(si la sabés)</span></label>
            <input id="version" value={d.version} onChange={(e) => set("version", e.target.value)} placeholder="Ej: 2.0 XEi CVT" className="campo-g" />
          </div>
          <div>
            <label htmlFor="anio" className="etiqueta-g">Año</label>
            <select id="anio" value={d.anio || ""} onChange={(e) => set("anio", Number(e.target.value))} required className="campo-g">
              <option value="" disabled>Elegí el año</option>
              {Array.from({ length: 40 }, (_, i) => anioActual + 1 - i).map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <CampoNumero id="km" label="Kilómetros" valor={d.km} onChange={(v) => set("km", v)} sufijo="km" requerido />
        </div>
        <Opciones label="Tipo de auto" opciones={CARROCERIAS} valor={d.carroceria} onChange={(v) => {
          set("carroceria", v);
          if (v === "Sedán" || v === "Pick-up") set("puertas", 4);
          else if (v === "Coupé") set("puertas", 2);
          else set("puertas", 5);
        }} />
        <Opciones label="Combustible" opciones={COMBUSTIBLES} valor={d.combustible} onChange={(v) => set("combustible", v)} />
        <Opciones label="Caja" opciones={TRANSMISIONES} valor={d.transmision} onChange={(v) => set("transmision", v)} />
        <fieldset>
          <legend className="etiqueta-g">Color</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {COLORES.map((c) => (
              <button
                key={c.nombre}
                type="button"
                aria-pressed={d.color === c.nombre}
                onClick={() => { set("color", c.nombre); set("colorHex", c.hex); }}
                className={`flex min-h-14 items-center gap-3 rounded-md border-2 px-3 text-left text-lg font-semibold ${
                  d.color === c.nombre ? "border-tinta bg-papel" : "border-stone-300 bg-white hover:border-tinta"
                }`}
              >
                <span className="size-7 shrink-0 rounded-full border border-black/20" style={{ background: c.hex }} />
                {c.nombre}
              </button>
            ))}
          </div>
        </fieldset>
      </Seccion>

      <Seccion n={3} titulo="Precio">
        <CampoPesos id="precio" label="Precio de contado" valor={d.precio} onChange={(v) => set("precio", v)} requerido ayuda="Es el precio que se ve en la página." />
      </Seccion>

      <Seccion n={4} titulo="Datos del negocio" ayuda="🔒 Esto es privado: solo lo ves vos en el panel, nunca aparece en la página.">
        <Opciones
          label="¿De quién es el auto?"
          opciones={["propio", "consignacion"] as const}
          textos={{ propio: "Es mío (lo compré)", consignacion: "Es de un cliente" }}
          valor={neg.tipo}
          onChange={(v) => setN("tipo", v)}
        />

        {neg.tipo === "propio" ? (
          <div className="grid gap-6 sm:grid-cols-2">
            <CampoPesos id="costo" label="¿Cuánto lo pagaste?" valor={neg.costo} onChange={(v) => setN("costo", v)} />
            <CampoPesos id="gastos" label="Gastos de preparación" valor={neg.gastos} onChange={(v) => setN("gastos", v)} ayuda="Mecánica, chapa, papeles, lavado, etc." />
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="dueno" className="etiqueta-g">Nombre del dueño</label>
                <input id="dueno" value={neg.duenoNombre} onChange={(e) => setN("duenoNombre", e.target.value)} className="campo-g" autoComplete="off" />
              </div>
              <div>
                <label htmlFor="tel-dueno" className="etiqueta-g">Teléfono del dueño</label>
                <input id="tel-dueno" type="tel" value={neg.duenoTelefono} onChange={(e) => setN("duenoTelefono", e.target.value)} className="campo-g" autoComplete="off" />
              </div>
            </div>
            <Opciones
              label="¿Cómo cobrás por este auto?"
              opciones={["porcentaje", "fijo", "neto"] as readonly ModoComision[]}
              textos={MODO_COMISION_TEXTO}
              valor={neg.comisionModo}
              onChange={(v) => { setN("comisionModo", v); setN("comisionValor", v === "porcentaje" ? ajustes.comisionModo === "porcentaje" ? ajustes.comisionValor : 5 : 0); }}
            />
            {neg.comisionModo === "porcentaje" ? (
              <CampoNumero id="comision" label="Porcentaje de comisión" valor={neg.comisionValor} onChange={(v) => setN("comisionValor", Math.min(v, 100))} sufijo="%" />
            ) : neg.comisionModo === "fijo" ? (
              <CampoPesos id="comision" label="Comisión fija" valor={neg.comisionValor} onChange={(v) => setN("comisionValor", v)} />
            ) : (
              <CampoPesos id="comision" label="Precio que recibe el dueño" valor={neg.comisionValor} onChange={(v) => setN("comisionValor", v)} ayuda="Lo que se vende por encima de esto es tu ganancia." />
            )}
            {ajustes.comisionMinima > 0 && neg.comisionModo !== "neto" && (
              <p className="text-lg text-stone-600">Se aplica tu comisión mínima de {pesos(ajustes.comisionMinima)}.</p>
            )}
          </>
        )}

        <div className="rounded-md bg-tinta p-5 text-white">
          {ganancia !== null ? (
            <>
              <p className="text-lg text-stone-300">Si se vende a {pesos(d.precio)}, ganás</p>
              <p className={`font-display text-[44px] font-bold leading-none ${ganancia < 0 ? "text-[#ff8a80]" : ""}`}>{pesos(ganancia)}</p>
              {alDueno !== null && <p className="mt-2 text-lg text-stone-300">Al dueño le quedan {pesos(alDueno)}.</p>}
              {ganancia < 0 && <p className="mt-2 text-lg font-semibold text-[#ff8a80]">Ojo: con este precio perdés plata.</p>}
            </>
          ) : (
            <p className="text-lg text-stone-300">
              {d.precio ? (neg.tipo === "propio" ? "Cargá cuánto lo pagaste para ver la ganancia." : "Completá la comisión para ver la ganancia.") : "Cargá el precio para ver la ganancia."}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="notas" className="etiqueta-g">Notas privadas <span className="font-normal text-stone-500">(opcional)</span></label>
          <textarea id="notas" rows={3} value={neg.notas} onChange={(e) => setN("notas", e.target.value)} className="campo-g h-auto! py-3" placeholder="Ej: el dueño acepta ofertas desde $…; falta cambiar cubiertas" />
        </div>
      </Seccion>

      <Seccion n={5} titulo="Más detalles" ayuda="Opcional, pero ayuda a vender.">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="motor" className="etiqueta-g">Motor</label>
            <input id="motor" value={d.motor} onChange={(e) => set("motor", e.target.value)} placeholder="Ej: 1.6 / 2.0 TDI" className="campo-g" />
          </div>
          <div>
            <label htmlFor="puertas" className="etiqueta-g">Puertas</label>
            <select id="puertas" value={d.puertas} onChange={(e) => set("puertas", Number(e.target.value))} className="campo-g">
              {[2, 3, 4, 5].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="descripcion" className="etiqueta-g">Descripción</label>
          <textarea
            id="descripcion"
            rows={4}
            value={d.descripcion}
            onChange={(e) => set("descripcion", e.target.value)}
            className="campo-g h-auto! py-3"
            placeholder="Ej: Impecable, services al día, cubiertas nuevas. Nunca chocado."
          />
        </div>
        <div className="space-y-3">
          <Casilla label="Único dueño" valor={d.unicoDueno} onChange={(v) => set("unicoDueno", v)} />
          <Casilla label="Services en concesionario oficial" valor={d.serviceOficial} onChange={(v) => set("serviceOficial", v)} />
          <Casilla label="Mostrar en la portada" ayuda="Aparece primero en la página de inicio." valor={d.destacado} onChange={(v) => set("destacado", v)} />
        </div>
        <fieldset>
          <legend className="etiqueta-g">Equipamiento <span className="font-normal text-stone-500">(tocá los que tiene)</span></legend>
          <div className="flex flex-wrap gap-2">
            {equipamientoTodo.map((e) => {
              const tiene = d.equipamiento.includes(e);
              return (
                <button
                  key={e}
                  type="button"
                  aria-pressed={tiene}
                  onClick={() => set("equipamiento", tiene ? d.equipamiento.filter((x) => x !== e) : [...d.equipamiento, e])}
                  className={`min-h-12 rounded-md border-2 px-4 text-lg ${tiene ? "border-tinta bg-tinta font-semibold text-white" : "border-stone-300 bg-white hover:border-tinta"}`}
                >
                  {tiene ? "✓ " : ""}{e}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Otro (escribilo acá)" className="campo-g" aria-label="Agregar otro equipamiento" />
            <button
              type="button"
              onClick={() => { const t = extra.trim(); if (t && !d.equipamiento.includes(t)) set("equipamiento", [...d.equipamiento, t]); setExtra(""); }}
              className="btn-g shrink-0 border-2 border-tinta bg-white"
            >
              Agregar
            </button>
          </div>
        </fieldset>
      </Seccion>

      {error && <p role="alert" className="rounded-lg bg-rojo-claro p-4 text-xl font-semibold text-rojo-oscuro">{error}</p>}

      {/* Botones de guardar */}
      <div className="sticky bottom-0 -mx-4 border-t-2 border-linea bg-white p-4 sm:static sm:mx-0 sm:rounded-lg sm:border-2">
        {auto ? (
          <button type="submit" disabled={guardando} className="btn-g w-full bg-rojo text-white hover:bg-rojo-oscuro">
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="submit" disabled={guardando} className="btn-g bg-rojo text-white hover:bg-rojo-oscuro">
              {guardando ? "Guardando…" : "Guardar y publicar"}
            </button>
            <button type="submit" data-publicar="no" disabled={guardando} className="btn-g border-2 border-tinta bg-white">
              Guardar sin publicar
            </button>
          </div>
        )}
      </div>

      {auto && (
        <div className="pt-6">
          <button type="button" onClick={() => setBorrar(true)} className="btn-g w-full border-2 border-stone-300 bg-white text-rojo-oscuro hover:border-rojo">
            Borrar este auto
          </button>
        </div>
      )}

      {sinFotos !== null && (
        <Confirmar
          titulo="Este auto no tiene fotos"
          texto="Sin fotos recibe muchas menos consultas. ¿Querés guardarlo igual y agregar las fotos después?"
          confirmar="Guardar igual"
          onCancelar={() => setSinFotos(null)}
          onConfirmar={() => { const p = sinFotos; setSinFotos(null); enviar(p, true); }}
        />
      )}

      {borrar && auto && (
        <Confirmar
          titulo={`¿Borrar el ${auto.marca} ${auto.modelo} ${auto.anio}?`}
          texto="Se borra para siempre, con sus fotos y sus datos. Si solo querés que no se vea, usá “Ocultar” en Mis autos."
          confirmar="Sí, borrarlo"
          peligro
          cargando={guardando}
          onCancelar={() => setBorrar(false)}
          onConfirmar={() =>
            start(async () => {
              const r = await borrarAutoAccion(auto.id, `${auto.marca} ${auto.modelo} ${auto.anio}`);
              if (!r.ok) { setBorrar(false); return setError(r.error); }
              setCambios(false);
              router.push(`/admin/autos?ok=${encodeURIComponent(r.mensaje)}`);
              router.refresh();
            })
          }
        />
      )}
    </form>
  );
}
