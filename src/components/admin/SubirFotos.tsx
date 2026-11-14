"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";

const LADO_MAX = 1600;

/** Achica la foto en el teléfono antes de subirla (más rápido y liviano). */
async function achicar(archivo: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(archivo);
    const escala = Math.min(1, LADO_MAX / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * escala);
    canvas.height = Math.round(bmp.height * escala);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    if (blob) return blob;
  } catch {
    /* el navegador no pudo leerla: se intenta subir tal cual */
  }
  if (["image/jpeg", "image/png", "image/webp"].includes(archivo.type)) return archivo;
  throw new Error("formato");
}

export function SubirFotos({ fotos, onChange }: { fotos: string[]; onChange: (f: string[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [progreso, setProgreso] = useState<{ hecho: number; total: number } | null>(null);
  const [error, setError] = useState("");

  async function subir(archivos: FileList | null) {
    if (!archivos?.length) return;
    setError("");
    const lista = Array.from(archivos).slice(0, 30 - fotos.length);
    const nuevas: string[] = [];
    let fallidas = 0;
    setProgreso({ hecho: 0, total: lista.length });
    for (const [i, archivo] of lista.entries()) {
      try {
        const blob = await achicar(archivo);
        const form = new FormData();
        form.append("foto", blob, "foto.jpg");
        const res = await fetch("/api/admin/fotos", { method: "POST", body: form });
        const datos = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
        if (!res.ok || !datos.url) throw new Error(datos.error || "error");
        nuevas.push(datos.url);
        onChange([...fotos, ...nuevas]);
      } catch (e) {
        fallidas++;
        const msg = e instanceof Error ? e.message : "";
        if (msg.startsWith("Tu sesión")) { setError(msg); break; }
      }
      setProgreso({ hecho: i + 1, total: lista.length });
    }
    setProgreso(null);
    if (fallidas) setError(`${fallidas === 1 ? "Una foto no se pudo subir" : `${fallidas} fotos no se pudieron subir`}. Probá de nuevo con esa${fallidas > 1 ? "s" : ""} foto${fallidas > 1 ? "s" : ""}.`);
    if (input.current) input.current.value = "";
  }

  const mover = (i: number, d: number) => {
    const f = [...fotos];
    [f[i], f[i + d]] = [f[i + d], f[i]];
    onChange(f);
  };
  const principal = (i: number) => onChange([fotos[i], ...fotos.filter((_, j) => j !== i)]);
  const quitar = (i: number) => onChange(fotos.filter((_, j) => j !== i));

  return (
    <div>
      <input ref={input} type="file" accept="image/*" multiple className="sr-only" id="fotos" onChange={(e) => subir(e.target.files)} />
      <label
        htmlFor="fotos"
        className={`btn-g w-full cursor-pointer border-2 border-dashed border-tinta bg-white py-6 text-xl hover:bg-papel ${progreso ? "pointer-events-none opacity-60" : ""}`}
      >
        {progreso ? `Subiendo fotos… ${progreso.hecho} de ${progreso.total}` : fotos.length ? "+ Agregar más fotos" : "+ Agregar fotos"}
      </label>
      <p className="ayuda-g">
        Podés elegir varias juntas desde la galería o sacarlas con la cámara. La primera es la que se ve en el catálogo.
      </p>
      {error && <p role="alert" className="mt-3 rounded-md bg-rojo-claro p-3 text-lg font-semibold text-rojo-oscuro">{error}</p>}

      {fotos.length > 0 && (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {fotos.map((f, i) => (
            <li key={f} className="overflow-hidden rounded-md border-2 border-linea bg-white">
              <div className="relative">
                <img src={f} alt={`Foto ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
                <span className={`absolute left-2 top-2 rounded-sm px-2.5 py-1 text-base font-bold ${i === 0 ? "bg-rojo text-white" : "bg-white/90 text-tinta"}`}>
                  {i === 0 ? "Foto principal" : `Foto ${i + 1}`}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-2">
                {i > 0 ? (
                  <button type="button" onClick={() => principal(i)} className="btn-g col-span-2 min-h-12! border-2 border-stone-300 text-base hover:border-tinta">
                    Usar como principal
                  </button>
                ) : null}
                <button type="button" disabled={i === 0} onClick={() => mover(i, -1)} className="btn-g min-h-12! border-2 border-stone-300 text-base hover:border-tinta disabled:opacity-30">
                  ← Antes
                </button>
                <button type="button" disabled={i === fotos.length - 1} onClick={() => mover(i, 1)} className="btn-g min-h-12! border-2 border-stone-300 text-base hover:border-tinta disabled:opacity-30">
                  Después →
                </button>
                <button type="button" onClick={() => quitar(i)} className="btn-g col-span-2 min-h-12! border-2 border-stone-300 text-base text-rojo-oscuro hover:border-rojo">
                  Quitar esta foto
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
