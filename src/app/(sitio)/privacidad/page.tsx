import type { Metadata } from "next";
import { getAgencia } from "@/lib/agencia";

export const metadata: Metadata = { title: "Política de privacidad" };

/* TODO: revisar este texto con un abogado o contador antes de publicar. */
export default async function PrivacidadPage() {
  const ag = await getAgencia();
  return (
    <div className="contenedor max-w-3xl pt-10">
      <h1 className="titulo text-[40px]">Política de privacidad</h1>
      <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-stone-700">
        <p>
          En {ag.nombre} cuidamos tus datos personales según la Ley 25.326 de Protección de los Datos Personales.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-tinta">Qué datos guardamos</h2>
        <p>Tu email y, si los completás, tu nombre, teléfono y ciudad. También los autos que guardás en favoritos.</p>
        <h2 className="pt-4 text-xl font-semibold text-tinta">Para qué los usamos</h2>
        <p>
          Para que puedas ingresar y ver tus favoritos, y para responder tus consultas. Solo te mandamos novedades por mail si lo
          aceptaste, y te podés dar de baja en cualquier momento desde el link al pie de cada mail o desde Mi cuenta.
        </p>
        <h2 className="pt-4 text-xl font-semibold text-tinta">Con quién los compartimos</h2>
        <p>No vendemos ni compartimos tus datos con terceros para publicidad.</p>
        <h2 className="pt-4 text-xl font-semibold text-tinta">Tus derechos</h2>
        <p>
          Podés pedir ver, corregir o borrar tus datos escribiéndonos a {ag.email} o al {ag.telefono}. La Agencia de Acceso a la
          Información Pública es el órgano de control de la Ley 25.326.
        </p>
      </div>
    </div>
  );
}
