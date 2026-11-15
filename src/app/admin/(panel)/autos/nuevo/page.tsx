import { esTienda } from "@/lib/rubro";
import { notFound } from "next/navigation";
import { AutoForm } from "@/components/admin/AutoForm";
import { leerNegocio } from "@/lib/negocio";
import { negocioVacio } from "@/lib/negocio-tipos";
import { usuarioActual } from "@/lib/usuarios";
import { getConsulta } from "@/lib/consultas";
import { COMBUSTIBLES, TRANSMISIONES, marcaConocida, type DatosAuto } from "@/lib/tipos";


type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function NuevoAuto({ searchParams }: { searchParams: SP }) {
  if (esTienda) notFound();
  const sp = await searchParams;
  const [{ ajustes }, yo, consulta] = await Promise.all([
    leerNegocio(),
    usuarioActual(),
    typeof sp.consulta === "string" ? getConsulta(sp.consulta) : undefined,
  ]);
  // Si viene de una consulta de "Vendé tu auto", se completan los datos que ya dio la persona
  const desdeConsulta: Partial<DatosAuto> | undefined = consulta && {
    marca: marcaConocida(consulta.marca),
    modelo: consulta.modelo,
    version: consulta.version,
    anio: consulta.anio,
    km: consulta.km,
    ...((COMBUSTIBLES as readonly string[]).includes(consulta.combustible) ? { combustible: consulta.combustible as DatosAuto["combustible"] } : {}),
    ...((TRANSMISIONES as readonly string[]).includes(consulta.transmision) ? { transmision: consulta.transmision as DatosAuto["transmision"] } : {}),
    fotos: consulta.fotos ?? [],
    precio: consulta.oferta || consulta.precioPretendido || 0,
    descripcion: consulta.comentarios,
  };
  return (
    <div>
      <h1 className="text-3xl font-bold">Cargar un auto nuevo</h1>
      <p className="mt-1 mb-6 text-lg text-stone-600">
        {consulta ? `Ya completamos lo que cargó ${consulta.nombre}: datos, fotos y precio. Revisalos, completá el acuerdo con el dueño y publicalo.` : "Completá de arriba hacia abajo. Al final tocá “Guardar y publicar”."}
      </p>
      <AutoForm
        negocioInicial={consulta ? {
          ...negocioVacio(ajustes),
          tipo: "consignacion",
          duenoNombre: consulta.nombre,
          duenoTelefono: consulta.telefono,
          notas: `Lo cargó el dueño en “Vendé tu auto”.${consulta.precioPretendido ? ` Pretendía $ ${consulta.precioPretendido.toLocaleString("es-AR")}.` : ""}${consulta.zona ? ` Es de ${consulta.zona}.` : ""}`,
        } : negocioVacio(ajustes)}
        consultaId={consulta?.id}
        ajustes={ajustes}
        esAdmin={yo?.rol === "admin"}
        datosIniciales={desdeConsulta}
      />
    </div>
  );
}
