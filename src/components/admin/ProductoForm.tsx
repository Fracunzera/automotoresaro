"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { borrarProductoAccion, guardarProductoAccion } from "@/app/admin/acciones-tienda";
import type { DatosProducto, Producto } from "@/lib/productos-tipos";
import { Casilla, CampoNumero, CampoPesos } from "./Campos";
import { Confirmar } from "./Confirmar";
import { SubirFotos } from "./SubirFotos";

const VACIO: DatosProducto = {
  nombre: "", descripcion: "", categoria: "", precio: 0, precioAnterior: 0, fotos: [], stock: 0,
  variantes: [], nombreVariante: "Talle", destacado: false, estado: "publicado",
};

function Seccion({ n, titulo, ayuda, children }: { n: number; titulo: string; ayuda?: string; children: ReactNode }) {
  return (
    <section className="tarjeta-g p-5 sm:p-7">
      <h2 className="flex items-baseline gap-3 text-2xl font-bold"><span className="font-display text-3xl text-rojo">{n}.</span> {titulo}</h2>
      {ayuda && <p className="mt-1 text-lg text-stone-600">{ayuda}</p>}
      <div className="mt-5 space-y-6">{children}</div>
    </section>
  );
}

export function ProductoForm({ producto, categorias, esAdmin }: { producto?: Producto; categorias: string[]; esAdmin: boolean }) {
  const router = useRouter();
  const [d, setD] = useState<DatosProducto>(() => (producto ? { ...VACIO, ...producto } : VACIO));
  const [controlStock, setControlStock] = useState(producto ? producto.stock !== null : true);
  const [nuevaVariante, setNuevaVariante] = useState("");
  const [error, setError] = useState("");
  const [cambios, setCambios] = useState(false);
  const [borrar, setBorrar] = useState(false);
  const [guardando, start] = useTransition();
  const set = <K extends keyof DatosProducto>(k: K, v: DatosProducto[K]) => { setD((p) => ({ ...p, [k]: v })); setCambios(true); };

  useEffect(() => {
    if (!cambios) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [cambios]);

  function agregarVariantes() {
    // Se pueden escribir varias juntas separadas por coma: "S, M, L"
    const nuevas = nuevaVariante.split(",").map((v) => v.trim()).filter((v) => v && !d.variantes.includes(v));
    if (nuevas.length) set("variantes", [...d.variantes, ...nuevas]);
    setNuevaVariante("");
  }

  function guardar(estado: "publicado" | "oculto") {
    setError("");
    start(async () => {
      const r = await guardarProductoAccion(producto?.id ?? null, { ...d, estado, stock: controlStock ? d.stock : null });
      if (!r.ok) { setError(r.error); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); return; }
      setCambios(false);
      router.push(`/admin/productos?ok=${encodeURIComponent(r.mensaje)}`);
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const b = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
        guardar(b?.dataset.publicar === "no" ? "oculto" : producto ? d.estado : "publicado");
      }}
      className="space-y-6"
    >
      <Seccion n={1} titulo="Fotos" ayuda="Con buena luz y fondo liso. La primera es la que se ve en la tienda.">
        <SubirFotos fotos={d.fotos} onChange={(f) => set("fotos", f)} />
      </Seccion>

      <Seccion n={2} titulo="Qué es">
        <div>
          <label htmlFor="nombre" className="etiqueta-g">Nombre del producto</label>
          <input id="nombre" required value={d.nombre} onChange={(e) => set("nombre", e.target.value)} maxLength={120} className="campo-g" placeholder="Ej: Remera de algodón" />
        </div>
        <div>
          <label htmlFor="categoria" className="etiqueta-g">Categoría</label>
          <input id="categoria" list="categorias" value={d.categoria} onChange={(e) => set("categoria", e.target.value)} maxLength={50} className="campo-g" placeholder="Ej: Ropa" />
          <datalist id="categorias">{categorias.map((c) => <option key={c} value={c} />)}</datalist>
          {categorias.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {categorias.map((c) => (
                <button key={c} type="button" onClick={() => set("categoria", c)} className={`min-h-10 rounded-md border-2 px-3 text-base ${d.categoria === c ? "border-tinta bg-tinta text-white" : "border-stone-300 bg-white"}`}>{c}</button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="descripcion" className="etiqueta-g">Descripción</label>
          <textarea id="descripcion" rows={4} value={d.descripcion} onChange={(e) => set("descripcion", e.target.value)} maxLength={4000} className="campo-g h-auto! py-3" placeholder="Material, medidas, cuidados…" />
        </div>
      </Seccion>

      <Seccion n={3} titulo="Precio">
        <div className="grid gap-6 sm:grid-cols-2">
          <CampoPesos id="precio" label="Precio" valor={d.precio} onChange={(v) => set("precio", v)} requerido />
          <CampoPesos id="anterior" label="Precio anterior (opcional)" valor={d.precioAnterior} onChange={(v) => set("precioAnterior", v)} ayuda="Si lo cargás, se muestra tachado y como oferta." />
        </div>
      </Seccion>

      <Seccion n={4} titulo="Stock y opciones">
        <Casilla label="Controlar el stock" ayuda="Si lo tildás, cuando se termina se muestra “Sin stock” y no se puede comprar." valor={controlStock} onChange={(v) => { setControlStock(v); setCambios(true); }} />
        {controlStock && <CampoNumero id="stock" label="¿Cuántas unidades tenés?" valor={d.stock ?? 0} onChange={(v) => set("stock", v)} />}
        <div>
          <p className="etiqueta-g">Opciones para elegir (opcional)</p>
          <p className="ayuda-g -mt-1 mb-3">Por ejemplo talles (S, M, L) o colores. Si no tiene, dejalo vacío.</p>
          <label htmlFor="nombre-variante" className="mb-1 block text-base font-semibold">Nombre de la opción</label>
          <input id="nombre-variante" value={d.nombreVariante} onChange={(e) => set("nombreVariante", e.target.value)} maxLength={30} className="campo-g max-w-xs" placeholder="Talle, Color, Número…" />
          <div className="mt-3 flex flex-wrap gap-2">
            {d.variantes.map((v) => (
              <span key={v} className="flex min-h-11 items-center gap-2 rounded-md border-2 border-tinta bg-papel pl-3 text-lg font-semibold">
                {v}
                <button type="button" onClick={() => set("variantes", d.variantes.filter((x) => x !== v))} aria-label={`Quitar ${v}`} className="h-full px-3 text-xl text-stone-500 hover:text-rojo-oscuro">×</button>
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={nuevaVariante} onChange={(e) => setNuevaVariante(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregarVariantes(); } }} className="campo-g" placeholder="Ej: S, M, L, XL" aria-label="Agregar opciones" />
            <button type="button" onClick={agregarVariantes} className="btn-g shrink-0 border-2 border-tinta bg-white">Agregar</button>
          </div>
        </div>
        <Casilla label="Mostrar en la portada" ayuda="Aparece entre los destacados de la página de inicio." valor={d.destacado} onChange={(v) => set("destacado", v)} />
      </Seccion>

      {error && <p role="alert" className="rounded-lg bg-rojo-claro p-4 text-xl font-semibold text-rojo-oscuro">{error}</p>}

      <div className="sticky bottom-0 -mx-4 border-t-2 border-linea bg-white p-4 sm:static sm:mx-0 sm:rounded-lg sm:border-2">
        {producto ? (
          <button type="submit" disabled={guardando} className="btn-g w-full bg-rojo text-white hover:bg-rojo-oscuro">{guardando ? "Guardando…" : "Guardar cambios"}</button>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="submit" disabled={guardando} className="btn-g bg-rojo text-white hover:bg-rojo-oscuro">{guardando ? "Guardando…" : "Guardar y publicar"}</button>
            <button type="submit" data-publicar="no" disabled={guardando} className="btn-g border-2 border-tinta bg-white">Guardar sin publicar</button>
          </div>
        )}
      </div>

      {producto && esAdmin && (
        <button type="button" onClick={() => setBorrar(true)} className="btn-g w-full border-2 border-stone-300 bg-white text-rojo-oscuro hover:border-rojo">Borrar este producto</button>
      )}
      {borrar && producto && (
        <Confirmar
          titulo={`¿Borrar “${producto.nombre}”?`}
          texto="Se borra para siempre, con sus fotos. Si solo querés que no se vea, ocultalo."
          confirmar="Sí, borrarlo"
          peligro
          cargando={guardando}
          onCancelar={() => setBorrar(false)}
          onConfirmar={() => start(async () => {
            const r = await borrarProductoAccion(producto.id);
            if (!r.ok) { setBorrar(false); return setError(r.error); }
            setCambios(false);
            router.push(`/admin/productos?ok=${encodeURIComponent(r.mensaje)}`);
            router.refresh();
          })}
        />
      )}
    </form>
  );
}
