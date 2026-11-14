import { PanelNav } from "@/components/admin/PanelNav";

export const dynamic = "force-dynamic";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PanelNav />
      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">{children}</main>
    </>
  );
}
