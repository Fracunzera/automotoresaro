"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  actualizarEmpleadoAccion, borrarEmpleadoAccion, cambiarMiPasswordAccion, crearEmpleadoAccion, nuevaPasswordEmpleadoAccion,
} from "@/app/admin/acciones-equipo";
import { Casilla, Opciones } from "./Campos";
import { Confirmar } from "./Confirmar";

type Rol = "admin" | "vendedor";
const ROLES_TEXTO: Record<Rol, string> = { vendedor: "Vendedor", admin: "Administrador" };
const AYUDA_ROL: Record<Rol, string> = {
  vendedor: "Carga y edita autos, los reserva o vende, y atiende clientes. No ve costos, comisiones ni ganancias.",
  admin: "Puede hacer todo, igual que vos.",
};

/** Contraseña fácil de dictar: palabra + números (ej. "auto-4827-ruta"). */
function generarPassword() {
  const palabras = ["auto", "ruta", "rueda", "motor", "volante", "freno", "faro", "nafta", "playa", "patente", "llave", "cubierta"];
  const p = () => palabras[Math.floor(Math.random() * palabras.length)];
  return `${p()}-${Math.floor(1000 + Math.random() * 9000)}-${p()}`;
}

function CampoPassword({ id, label, valor, onChange, generar }: { id: string; label: string; valor: string; onChange: (v: string) => void; generar?: boolean }) {
  return (
    <div>
      <label htmlFor={id} className="etiqueta-g">{label}</label>
      <div className="flex gap-2">
        <input id={id} type="text" value={valor} onChange={(e) => onChange(e.target.value)} className="campo-g font-mono" autoComplete="new-password" autoCapitalize="none" spellCheck={false} />
        {generar && (
          <button type="button" onClick={() => onChange(generarPassword())} className="btn-g shrink-0 border-2 border-stone-300 bg-white hover:border-tinta">
            Inventar una
          </button>
        )}
      </div>
      <p className="ayuda-g">Mínimo 8 caracteres. Anotala y pasásela al empleado: después no se puede volver a ver.</p>
    </div>
  );
}

const Mensaje = ({ m }: { m: { ok: boolean; t: string } | null }) =>
  m ? (
    <p role={m.ok ? "status" : "alert"} className={`rounded-lg border-2 p-4 text-lg font-semibold ${m.ok ? "border-[#9fd3b2] bg-[#e7f4ec] text-[#17733c]" : "border-rojo bg-rojo-claro text-rojo-oscuro"}`}>
      {m.ok ? "✓ " : ""}{m.t}
    </p>
  ) : null;

export function EmpleadoNuevoForm() {
  const router = useRouter();
  const [d, setD] = useState({ nombre: "", usuario: "", password: generarPassword(), rol: "vendedor" as Rol });
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [cargando, start] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await crearEmpleadoAccion(d);
          if (!r.ok) return setMsg({ ok: false, t: r.error });
          router.push(`/admin/empleados?ok=${encodeURIComponent(`${r.mensaje} Contraseña: ${d.password}`)}`);
          router.refresh();
        });
      }}
      className="tarjeta-g space-y-6 p-5 sm:p-7"
    >
      <div>
        <label htmlFor="nombre" className="etiqueta-g">Nombre y apellido</label>
        <input
          id="nombre"
          required
          value={d.nombre}
          onChange={(e) => {
            const nombre = e.target.value;
            // Proponer un usuario a partir del nombre (ej. "Juan Pérez" → "juan.perez")
            const sugerido = nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");
            setD((p) => ({ ...p, nombre, usuario: p.usuario === "" || p.usuario === sugerirDe(p.nombre) ? sugerido : p.usuario }));
          }}
          className="campo-g"
          autoComplete="off"
        />
      </div>
      <div>
        <label htmlFor="usuario" className="etiqueta-g">Usuario</label>
        <input id="usuario" required value={d.usuario} onChange={(e) => setD({ ...d, usuario: e.target.value.toLowerCase().replace(/\s/g, "") })} className="campo-g" autoComplete="off" autoCapitalize="none" spellCheck={false} />
        <p className="ayuda-g">Con esto entra. Sin espacios ni tildes.</p>
      </div>
      <CampoPassword id="password" label="Contraseña" valor={d.password} onChange={(v) => setD({ ...d, password: v })} generar />
      <div>
        <Opciones label="¿Qué puede hacer?" opciones={["vendedor", "admin"] as const} textos={ROLES_TEXTO} valor={d.rol} onChange={(rol) => setD({ ...d, rol })} />
        <p className="ayuda-g">{AYUDA_ROL[d.rol]}</p>
      </div>
      <Mensaje m={msg} />
      <button disabled={cargando} className="btn-g w-full bg-rojo text-white hover:bg-rojo-oscuro">{cargando ? "Guardando…" : "Dar de alta"}</button>
    </form>
  );
}

function sugerirDe(nombre: string) {
  return nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");
}

export function EmpleadoEditarForm({ id, usuario, inicial, esYo }: { id: string; usuario: string; inicial: { nombre: string; rol: Rol; activo: boolean }; esYo: boolean }) {
  const router = useRouter();
  const [d, setD] = useState(inicial);
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [msgPass, setMsgPass] = useState<{ ok: boolean; t: string } | null>(null);
  const [borrar, setBorrar] = useState(false);
  const [cargando, start] = useTransition();
  const volver = (t: string) => { router.push(`/admin/empleados?ok=${encodeURIComponent(t)}`); router.refresh(); };

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const r = await actualizarEmpleadoAccion(id, d);
            if (!r.ok) return setMsg({ ok: false, t: r.error });
            volver(r.mensaje);
          });
        }}
        className="tarjeta-g space-y-6 p-5 sm:p-7"
      >
        <p className="text-lg text-stone-600">Usuario: <b className="text-tinta">{usuario}</b></p>
        <div>
          <label htmlFor="nombre" className="etiqueta-g">Nombre y apellido</label>
          <input id="nombre" required value={d.nombre} onChange={(e) => setD({ ...d, nombre: e.target.value })} className="campo-g" autoComplete="off" />
        </div>
        <div>
          <Opciones label="¿Qué puede hacer?" opciones={["vendedor", "admin"] as const} textos={ROLES_TEXTO} valor={d.rol} onChange={(rol) => setD({ ...d, rol })} />
          <p className="ayuda-g">{AYUDA_ROL[d.rol]}</p>
        </div>
        {!esYo && (
          <Casilla
            label="Puede entrar al panel"
            ayuda="Destildalo para darlo de baja: no va a poder entrar más, pero queda registrado lo que hizo."
            valor={d.activo}
            onChange={(v) => setD({ ...d, activo: v })}
          />
        )}
        <Mensaje m={msg} />
        <button disabled={cargando} className="btn-g w-full bg-rojo text-white hover:bg-rojo-oscuro">{cargando ? "Guardando…" : "Guardar cambios"}</button>
      </form>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const r = await nuevaPasswordEmpleadoAccion(id, pass);
            setMsgPass(r.ok ? { ok: true, t: `${r.mensaje} Contraseña: ${pass}` } : { ok: false, t: r.error });
            if (r.ok) setPass("");
          });
        }}
        className="tarjeta-g space-y-5 p-5 sm:p-7"
      >
        <h2 className="text-2xl font-bold">¿Se olvidó la contraseña?</h2>
        <p className="text-lg text-stone-600">Poné una nueva y pasásela. Se le cierra la sesión en todos sus dispositivos.</p>
        <CampoPassword id="nueva" label="Contraseña nueva" valor={pass} onChange={setPass} generar />
        <Mensaje m={msgPass} />
        <button disabled={cargando || !pass} className="btn-g w-full border-2 border-tinta bg-white hover:bg-papel">Cambiar la contraseña</button>
      </form>

      {!esYo && (
        <button type="button" onClick={() => setBorrar(true)} className="btn-g w-full border-2 border-stone-300 bg-white text-rojo-oscuro hover:border-rojo">
          Borrar este empleado
        </button>
      )}
      {borrar && (
        <Confirmar
          titulo={`¿Borrar a ${d.nombre}?`}
          texto="No va a poder entrar más. Si solo querés que no entre, es mejor darlo de baja (destildar “Puede entrar al panel”)."
          confirmar="Sí, borrarlo"
          peligro
          cargando={cargando}
          onCancelar={() => setBorrar(false)}
          onConfirmar={() => start(async () => { const r = await borrarEmpleadoAccion(id); if (!r.ok) { setBorrar(false); return setMsg({ ok: false, t: r.error }); } volver(r.mensaje); })}
        />
      )}
    </div>
  );
}

export function MiPasswordForm() {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [cargando, start] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (nueva !== repetir) return setMsg({ ok: false, t: "Las dos contraseñas nuevas no coinciden." });
        start(async () => {
          const r = await cambiarMiPasswordAccion(actual, nueva);
          setMsg(r.ok ? { ok: true, t: r.mensaje } : { ok: false, t: r.error });
          if (r.ok) { setActual(""); setNueva(""); setRepetir(""); }
        });
      }}
      className="tarjeta-g space-y-6 p-5 sm:p-7"
    >
      <div>
        <label htmlFor="actual" className="etiqueta-g">Contraseña actual</label>
        <input id="actual" type="password" required value={actual} onChange={(e) => setActual(e.target.value)} className="campo-g" autoComplete="current-password" />
      </div>
      <div>
        <label htmlFor="nueva" className="etiqueta-g">Contraseña nueva</label>
        <input id="nueva" type="password" required minLength={8} value={nueva} onChange={(e) => setNueva(e.target.value)} className="campo-g" autoComplete="new-password" />
        <p className="ayuda-g">Mínimo 8 caracteres.</p>
      </div>
      <div>
        <label htmlFor="repetir" className="etiqueta-g">Repetí la contraseña nueva</label>
        <input id="repetir" type="password" required value={repetir} onChange={(e) => setRepetir(e.target.value)} className="campo-g" autoComplete="new-password" />
      </div>
      <Mensaje m={msg} />
      <button disabled={cargando} className="btn-g w-full bg-rojo text-white hover:bg-rojo-oscuro">{cargando ? "Guardando…" : "Cambiar mi contraseña"}</button>
    </form>
  );
}
