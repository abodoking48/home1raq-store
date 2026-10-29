import { MessageCircle } from "lucide-react";
import { STORE_CONTACT, STORE_WHATSAPP_LOCAL, whatsappLink } from "@/lib/store-info";
import { siteCopy } from "@/lib/stitch-copy";

/** Visible contact details (WhatsApp + socials; address/hours only once the owner provides them). */
export function ContactCard() {
  return (
    <div className="glass-panel space-y-4 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-foreground">تواصل معنا</h2>
      <a
        href={whatsappLink("مرحباً Home1raq")}
        target="_blank"
        rel="noreferrer"
        className="flex w-fit items-center gap-2 rounded-xl bg-[#25D366]/10 px-4 py-3 font-bold text-[#25D366] ring-1 ring-[#25D366]/40 hover:bg-[#25D366]/20"
      >
        <MessageCircle className="size-5" aria-hidden />
        واتساب: <span dir="ltr" className="tabular-nums">{STORE_WHATSAPP_LOCAL}</span>
      </a>
      {STORE_CONTACT.address && <p className="text-muted-foreground">العنوان: {STORE_CONTACT.address}</p>}
      {STORE_CONTACT.hours && <p className="text-muted-foreground">أوقات الدوام: {STORE_CONTACT.hours}</p>}
      <ul className="flex flex-wrap gap-3 text-sm">
        {siteCopy.footer.socialLinks.map((l) => (
          <li key={l.label}>
            <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
