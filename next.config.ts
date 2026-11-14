import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // deploy/actualizar-todas.sh compila en otra carpeta para no cortar la página mientras actualiza
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    // Fotos subidas desde el panel a Vercel Blob
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
    // Fotos guardadas en modo local
    localPatterns: [{ pathname: "/api/fotos/**" }, { pathname: "/autos/**" }],
  },
};

export default nextConfig;
