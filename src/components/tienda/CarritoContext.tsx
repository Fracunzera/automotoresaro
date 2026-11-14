"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type ItemCarrito = { productoId: string; variante: string; cantidad: number };

type Estado = {
  items: ItemCarrito[];
  cantidad: number;
  agregar: (it: ItemCarrito) => void;
  cambiar: (productoId: string, variante: string, cantidad: number) => void;
  quitar: (productoId: string, variante: string) => void;
  vaciar: () => void;
};

const Ctx = createContext<Estado>({ items: [], cantidad: 0, agregar: () => {}, cambiar: () => {}, quitar: () => {}, vaciar: () => {} });
export const useCarrito = () => useContext(Ctx);

const CLAVE = "carrito";

/** Carrito guardado en el navegador del comprador (sobrevive si cierra la página). */
export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);

  useEffect(() => {
    try {
      const g = JSON.parse(localStorage.getItem(CLAVE) ?? "[]");
      if (Array.isArray(g)) setItems(g.filter((x) => x && typeof x.productoId === "string" && x.cantidad > 0).slice(0, 50));
    } catch {
      /* sin carrito guardado */
    }
  }, []);

  const guardar = useCallback((nuevo: ItemCarrito[]) => {
    setItems(nuevo);
    try {
      localStorage.setItem(CLAVE, JSON.stringify(nuevo));
    } catch {
      /* navegador sin almacenamiento: el carrito vive mientras la página esté abierta */
    }
  }, []);

  const igual = (a: ItemCarrito, id: string, v: string) => a.productoId === id && a.variante === v;

  const valor: Estado = {
    items,
    cantidad: items.reduce((s, i) => s + i.cantidad, 0),
    agregar: (it) => {
      const existe = items.find((x) => igual(x, it.productoId, it.variante));
      guardar(existe ? items.map((x) => (x === existe ? { ...x, cantidad: Math.min(99, x.cantidad + it.cantidad) } : x)) : [...items, it]);
    },
    cambiar: (id, v, c) => guardar(items.map((x) => (igual(x, id, v) ? { ...x, cantidad: Math.max(1, Math.min(99, c)) } : x))),
    quitar: (id, v) => guardar(items.filter((x) => !igual(x, id, v))),
    vaciar: () => guardar([]),
  };

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}
