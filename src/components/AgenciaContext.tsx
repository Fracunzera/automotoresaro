"use client";

import { createContext, useContext, type ReactNode } from "react";
import { AGENCIA_INICIAL, type Agencia } from "@/lib/agencia-tipos";

const Ctx = createContext<Agencia>(AGENCIA_INICIAL);

/** Datos de la agencia (dirección, teléfono...) para los componentes del navegador. */
export function AgenciaProvider({ agencia, children }: { agencia: Agencia; children: ReactNode }) {
  return <Ctx.Provider value={agencia}>{children}</Ctx.Provider>;
}

export const useAgencia = () => useContext(Ctx);
