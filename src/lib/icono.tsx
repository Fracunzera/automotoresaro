/** Ícono de la app (pestaña del navegador y pantalla de inicio) con el nombre y colores de la marca. */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getAgencia } from "./agencia";
import { colorValido } from "./agencia-tipos";

/** "Automotores Aro" → "ARO"; "Tienda La Esquina" → "LE"; nombres de una palabra → primeras letras. */
function sigla(nombre: string) {
  const palabras = nombre.trim().split(/\s+/).filter((p) => !/^(la|el|los|las|de|del|y)$/i.test(p));
  const ultima = palabras[palabras.length - 1] ?? "A";
  if (ultima.length <= 4) return ultima.toUpperCase();
  if (palabras.length >= 2) return palabras.slice(-2).map((p) => p[0]).join("").toUpperCase();
  return ultima.slice(0, 3).toUpperCase();
}

export async function generarIcono(tam: number) {
  const ag = await getAgencia();
  const fuente = await readFile(path.join(process.cwd(), "src/fonts/barlow-condensed-latin-800-normal.woff"));
  const oscuro = colorValido(ag.marca.colorOscuro) ? ag.marca.colorOscuro : "#15171a";
  const principal = colorValido(ag.marca.colorPrincipal) ? ag.marca.colorPrincipal : "#d12b1f";
  const texto = sigla(ag.nombre);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: oscuro, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
          <div style={{ fontFamily: "Barlow", fontSize: tam * (texto.length > 3 ? 0.3 : 0.36), color: "#ffffff", lineHeight: 1, letterSpacing: -tam * 0.005 }}>{texto}</div>
          <div style={{ height: tam * 0.045, background: principal, marginTop: tam * 0.03 }} />
        </div>
      </div>
    ),
    { width: tam, height: tam, fonts: [{ name: "Barlow", data: fuente, weight: 800, style: "normal" }] },
  );
}
