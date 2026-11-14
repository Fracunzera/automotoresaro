"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type FilaCliente = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  ciudad: string;
  aceptaMails: boolean;
  origen: "web" | "agencia";
  creado: string;
  favoritos: string[];
  compras: string[];
};

const fecha = (iso: string) => new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });

export function ListaClientes({ filas, esAdmin }: { filas: FilaCliente[]; esAdmin: boolean }) {
  const [q, setQ] = useState("");
  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? filas.filter((f) => `${f.nombre} ${f.email} ${f.telefono} ${f.ciudad}`.toLowerCase().includes(t)) : filas;
  }, [q, filas]);

  return (
    <>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nombre, email o teléfono"
        aria-label="Buscar cliente"
        className="campo-g mt-6"
      />
      <ul className="mt-4 space-y-3">
        {visibles.map((c) => (
          <li key={c.id} className="tarjeta-g p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xl font-bold">{c.nombre || "(sin nombre)"}</p>
                <p className="break-all text-lg text-stone-700">{c.email}</p>
                <p className="text-lg text-stone-600">
                  {[c.telefono, c.ciudad].filter(Boolean).join(" · ")}
                </p>
              </div>
              <span className={`rounded-sm px-2.5 py-1 text-base font-bold ${c.aceptaMails ? "bg-[#e7f4ec] text-[#17733c]" : "bg-stone-200 text-stone-600"}`}>
                {c.aceptaMails ? "Acepta mails" : "No acepta mails"}
              </span>
            </div>
            <p className="mt-2 text-base text-stone-500">
              {c.origen === "web" ? "Se registró en la página" : "Lo agregaste vos"} el {fecha(c.creado)}
            </p>
            {c.compras.length > 0 && <p className="mt-2 text-lg"><b>Compró:</b> {c.compras.join(", ")}</p>}
            {c.favoritos.length > 0 && <p className="mt-1 text-lg"><b>♥ Le interesan:</b> {c.favoritos.join(", ")}</p>}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:flex">
              <Link href={`/admin/clientes/${c.id}`} className="btn-g border-2 border-tinta bg-white hover:bg-papel">Ver / editar</Link>
              {esAdmin && <Link href={`/admin/mails?cliente=${c.id}`} className="btn-g border-2 border-stone-300 bg-white hover:border-tinta">Mandar mail</Link>}
              {c.telefono && (
                <a href={`https://wa.me/${c.telefono.replace(/\D/g, "").replace(/^0/, "54")}`} target="_blank" rel="noopener noreferrer" className="btn-g col-span-2 border-2 border-stone-300 bg-white hover:border-tinta sm:col-span-1">
                  WhatsApp
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
      {visibles.length === 0 && (
        <p className="tarjeta-g mt-4 p-8 text-center text-xl">{filas.length ? "No hay clientes con esa búsqueda." : "Todavía no hay clientes registrados."}</p>
      )}
    </>
  );
}
