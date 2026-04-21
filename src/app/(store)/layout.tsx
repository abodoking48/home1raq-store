import { StoreFooter } from "@/components/layout/store-footer";
import { StoreHeader } from "@/components/layout/store-header";
import { WhatsAppButton } from "@/components/whatsapp-button";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <StoreHeader />
      <main className="flex-1 pt-20">{children}</main>
      <StoreFooter />
      <WhatsAppButton />
    </div>
  );
}
