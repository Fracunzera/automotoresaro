import Link from "next/link";

export default function NotFound() {
  return (
    <div className="contenedor py-24 text-center">
      <p className="text-6xl font-extrabold text-marca-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">No encontramos esta página</h1>
      <p className="mt-2 text-slate-500">Puede que el auto ya se haya vendido o que el link esté mal.</p>
      <Link href="/autos" className="btn-primario mt-8">Ver autos disponibles</Link>
    </div>
  );
}
