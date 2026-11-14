import { getAgencia } from "@/lib/agencia";
import { whatsappLink } from "@/lib/utils";
import { WhatsAppIcon } from "./Icon";

export async function WhatsAppFloat() {
  const ag = await getAgencia();
  return (
    <a
      href={whatsappLink(ag.whatsapp, `Hola ${ag.nombre}, quería hacer una consulta.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-4 right-4 z-50 grid size-13 place-items-center rounded-full bg-[#1faa53] text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)] transition-transform hover:scale-105"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
