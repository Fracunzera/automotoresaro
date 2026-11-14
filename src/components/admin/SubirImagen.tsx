"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";

/**
 * Sube UNA imagen (logo o foto de portada) y devuelve su dirección.
 * El logo se guarda en PNG para no perder el fondo transparente.
 */
async function preparar(archivo: File, ladoMax: number, formato: "png" | "jpeg"): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(archivo);
    const escala = Math.min(1, ladoMax / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * escala);
    canvas.height = Math.round(bmp.height * escala);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, `image/${formato}`, 0.85));
    if (blob) return blob;
  } catch {
    /* se intenta subir tal cual */
  }
  if (["image/jpeg", "image/png", "image/webp"].includes(archivo.type)) return archivo;
  throw new Error("formato");
}

export function SubirImagen({
  id, valor, onChange, formato = "jpeg", ladoMax = 1600, alto = "h-40", textoBoton = "Elegir imagen",
}: {
  id: string;
  valor: string;
  onChange: (url: string) => void;
  formato?: "png" | "jpeg";
  ladoMax?: number;
  alto?: string;
  textoBoton?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  async function subir(f: File | undefined) {
    if (!f) return;
    setError("");
    setSubiendo(true);
    try {
      const blob = await preparar(f, ladoMax, formato);
      const form = new FormData();
      form.append("foto", blob, `imagen.${formato === "png" ? "png" : "jpg"}`);
      const res = await fetch("/api/admin/fotos", { method: "POST", body: form });
      const d = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !d.url) throw new Error(d.error || "error");
      onChange(d.url);
    } catch (e) {
      const m = e instanceof Error ? e.message : "";
      setError(m && m !== "error" && m !== "formato" ? m : "No se pudo subir la imagen. Probá con otra.");
    } finally {
      setSubiendo(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <input ref={input} id={id} type="file" accept="image/*" className="sr-only" onChange={(e) => subir(e.target.files?.[0])} />
      {valor ? (
        <div className="space-y-2">
          <div className={`flex items-center justify-center overflow-hidden rounded-md border-2 border-linea bg-[repeating-conic-gradient(#eee_0_25%,#fff_0_50%)] bg-[length:20px_20px] ${alto}`}>
            <img src={valor} alt="" className="max-h-full max-w-full object-contain" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label htmlFor={id} className="btn-g cursor-pointer border-2 border-stone-300 bg-white text-base hover:border-tinta">
              {subiendo ? "Subiendo…" : "Cambiar"}
            </label>
            <button type="button" onClick={() => onChange("")} className="btn-g border-2 border-stone-300 bg-white text-base text-rojo-oscuro hover:border-rojo">
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <label htmlFor={id} className={`btn-g w-full cursor-pointer border-2 border-dashed border-tinta bg-white hover:bg-papel ${subiendo ? "pointer-events-none opacity-60" : ""}`}>
          {subiendo ? "Subiendo…" : `+ ${textoBoton}`}
        </label>
      )}
      {error && <p role="alert" className="mt-2 text-lg font-semibold text-rojo-oscuro">{error}</p>}
    </div>
  );
}
