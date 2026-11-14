import Link from "next/link";

export default function NotFound() {
  return (
    <div className="contenedor py-24">
      <p className="sobretitulo">Error 404</p>
      <h1 className="titulo mt-2 text-[48px]">Esta página no existe</h1>
      <p className="mt-3 max-w-md text-lg text-stone-600">Puede que el auto ya se haya vendido o que el link esté mal escrito.</p>
      <Link href="/autos" className="btn-rojo mt-8">Ver autos disponibles</Link>
    </div>
  );
}
