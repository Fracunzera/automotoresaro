import localFont from "next/font/local";

/**
 * Tipografías alojadas en el propio sitio (src/fonts), sin depender de Google Fonts.
 * Barlow: inspirada en patentes y carteles viales. Licencia SIL Open Font License (ver src/fonts/OFL.txt).
 */
export const barlow = localFont({
  variable: "--font-barlow",
  display: "swap",
  src: [
    { path: "../fonts/barlow-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/barlow-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/barlow-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/barlow-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

export const barlowCondensed = localFont({
  variable: "--font-barlow-condensed",
  display: "swap",
  src: [
    { path: "../fonts/barlow-condensed-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/barlow-condensed-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../fonts/barlow-condensed-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
});
