import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, tokenValido } from "@/lib/sesion";

/** Protege el panel: sin sesión, redirige a la pantalla de ingreso. */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/ingresar") return NextResponse.next();

  if (await tokenValido(req.cookies.get(COOKIE_SESION)?.value)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Tenés que ingresar de nuevo." }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/ingresar";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
