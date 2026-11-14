import { site } from "@/config/site";
import { whatsappLink } from "@/lib/utils";
import { WhatsAppIcon } from "./Icon";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink(`Hola ${site.nombre}! Quería hacer una consulta.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-xl transition hover:scale-105"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
