"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { enviarMailAccion } from "@/app/admin/acciones-clientes";
import { formatNumero } from "@/lib/utils";
import { Opciones } from "./Campos";
import { Confirmar } from "./Confirmar";

type ClienteMin = { id: string; nombre: string; email: string; aceptaMails: boolean };
type AutoMin = { id: string; titulo: string; precio: number };

export function RedactarMail({
  clientes, autos, clienteInicial, emailPrueba: pruebaInicial,
}: { clientes: ClienteMin[]; autos: AutoMin[]; clienteInicial?: string; emailPrueba: string }) {
  const router = useRouter();
  const [destino, setDestino] = useState<"todos" | "uno">(clienteInicial ? "uno" : "todos");
  const [clienteId, setClienteId] = useState(clienteInicial ?? "");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [emailPrueba, setEmailPrueba] = useState(pruebaInicial);
  const [confirmar, setConfirmar] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [cargando, start] = useTransition();

  const aceptan = clientes.filter((c) => c.aceptaMails).length;
  const cliente = clientes.find((c) => c.id === clienteId);
  const cantidad = destino === "todos" ? aceptan : cliente ? 1 : 0;

  function mandar(tipo: "prueba" | "uno" | "todos") {
    setMsg(null);
    start(async () => {
      const r = await enviarMailAccion({ destino: tipo, clienteId, emailPrueba, asunto, mensaje, autos: elegidos });
      setConfirmar(false);
      setMsg(r.ok ? { ok: true, t: r.mensaje } : { ok: false, t: r.error });
      if (r.ok && tipo !== "prueba") {
        setAsunto(""); setMensaje(""); setElegidos([]);
        router.refresh();
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  return (
    <div className="space-y-6">
      {msg && (
        <p role="status" className={`rounded-lg border-2 p-4 text-lg font-semibold ${msg.ok ? "border-[#9fd3b2] bg-[#e7f4ec] text-[#17733c]" : "border-rojo bg-rojo-claro text-rojo-oscuro"}`}>
          {msg.ok ? "✓ " : ""}{msg.t}
        </p>
      )}

      <section className="tarjeta-g space-y-6 p-5 sm:p-7">
        <Opciones
          label="¿A quién se lo mandás?"
          opciones={["todos", "uno"] as const}
          textos={{ todos: `A todos los que aceptan (${aceptan})`, uno: "A un cliente" }}
          valor={destino}
          onChange={setDestino}
        />
        {destino === "uno" && (
          <div>
            <label htmlFor="cliente" className="etiqueta-g">Cliente</label>
            <select id="cliente" value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="campo-g">
              <option value="">Elegí un cliente</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre} ({c.email})</option>)}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="asunto" className="etiqueta-g">Asunto</label>
          <input id="asunto" value={asunto} onChange={(e) => setAsunto(e.target.value)} maxLength={150} className="campo-g" placeholder="Ej: Llegaron 3 pick-ups nuevas" />
          <p className="ayuda-g">Es el título que la persona ve en su casilla.</p>
        </div>
        <div>
          <label htmlFor="mensaje" className="etiqueta-g">Mensaje</label>
          <textarea
            id="mensaje"
            rows={7}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            className="campo-g h-auto! py-3"
            placeholder={"Ej: Esta semana ingresaron autos que te pueden interesar. Te esperamos en la agencia o escribinos por WhatsApp."}
          />
          <p className="ayuda-g">El saludo con el nombre (“Hola Juan,”) se agrega solo.</p>
        </div>
        {autos.length > 0 && (
          <fieldset>
            <legend className="etiqueta-g">Sumar autos al mail <span className="font-normal text-stone-500">(opcional, hasta 6)</span></legend>
            <div className="space-y-2">
              {autos.map((a) => {
                const on = elegidos.includes(a.id);
                return (
                  <label key={a.id} className={`flex cursor-pointer items-center gap-4 rounded-md border-2 p-3 text-lg ${on ? "border-tinta bg-papel" : "border-stone-300 bg-white"}`}>
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={!on && elegidos.length >= 6}
                      onChange={() => setElegidos(on ? elegidos.filter((x) => x !== a.id) : [...elegidos, a.id])}
                      className="size-6 shrink-0 accent-rojo"
                    />
                    <span className="flex-1 font-semibold">{a.titulo}</span>
                    <span className="text-stone-600">$ {formatNumero(a.precio)}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}
      </section>

      <section className="tarjeta-g space-y-4 p-5 sm:p-7">
        <h2 className="text-xl font-bold">1. Mandate una prueba</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input type="email" value={emailPrueba} onChange={(e) => setEmailPrueba(e.target.value)} placeholder="tu@email.com" aria-label="Email para la prueba" className="campo-g" />
          <button type="button" disabled={cargando} onClick={() => mandar("prueba")} className="btn-g shrink-0 border-2 border-tinta bg-white hover:bg-papel">
            Mandar prueba
          </button>
        </div>
        <h2 className="pt-4 text-xl font-bold">2. Mandalo</h2>
        <button
          type="button"
          disabled={cargando || cantidad === 0}
          onClick={() => setConfirmar(true)}
          className="btn-g w-full bg-rojo text-white hover:bg-rojo-oscuro"
        >
          {cantidad === 0 ? (destino === "uno" ? "Elegí un cliente" : "No hay clientes que acepten mails") : `Mandar a ${destino === "uno" && cliente ? cliente.nombre : cantidad === 1 ? "1 cliente" : `${cantidad} clientes`}`}
        </button>
        {destino === "uno" && cliente && !cliente.aceptaMails && (
          <p className="text-lg text-stone-600">Este cliente no aceptó recibir novedades: mandale solo algo puntual (papeles, una consulta, etc.).</p>
        )}
      </section>

      {confirmar && (
        <Confirmar
          titulo={destino === "todos" ? `¿Mandar el mail a ${cantidad === 1 ? "1 cliente" : `${cantidad} clientes`}?` : `¿Mandar el mail a ${cliente?.nombre}?`}
          texto={`Asunto: “${asunto || "(sin asunto)"}”. Una vez enviado no se puede cancelar.`}
          confirmar="Sí, mandarlo"
          cargando={cargando}
          onCancelar={() => setConfirmar(false)}
          onConfirmar={() => mandar(destino)}
        />
      )}
    </div>
  );
}
