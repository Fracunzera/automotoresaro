import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { ClienteProvider } from "@/components/cuenta/ClienteContext";
import { CarritoProvider } from "@/components/tienda/CarritoContext";

export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClienteProvider>
      <CarritoProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloat />
      </CarritoProvider>
    </ClienteProvider>
  );
}
