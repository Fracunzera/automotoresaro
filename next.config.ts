import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos subidas desde el panel a Vercel Blob
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
    // Fotos guardadas en modo local
    localPatterns: [{ pathname: "/api/fotos/**" }, { pathname: "/autos/**" }],
  },
};

export default nextConfig;
