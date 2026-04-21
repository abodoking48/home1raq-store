"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const defaultNumber = "9647XXXXXXXXX";

export function WhatsAppButton() {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? defaultNumber;
  const digits = raw.replace(/\D/g, "");
  const href = `https://wa.me/${digits}?text=${encodeURIComponent(
    "مرحباً Home1raq، أود الاستفسار عن طلبي.",
  )}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-6 end-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-[0_12px_40px_rgba(37,211,102,0.35)] md:bottom-8 md:end-8"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      <MessageCircle className="size-7" />
    </motion.a>
  );
}
