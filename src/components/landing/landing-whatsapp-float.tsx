"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

type ReadonlyLandingWhatsappFloatProps = {
  readonly productName: string;
  readonly phoneDigits: string;
};

/** Clears sticky bar (qty + full-width CTA on mobile) + safe area */
const WA_BOTTOM = "max(10rem, calc(7.25rem + env(safe-area-inset-bottom, 0px)))";

export function LandingWhatsappFloat({
  productName,
  phoneDigits,
}: ReadonlyLandingWhatsappFloatProps) {
  const text = `مرحباً Home1raq، أود طلب المنتج: ${productName}`;
  const href = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 28, delay: 0.12 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      style={{ bottom: WA_BOTTOM }}
      className="fixed end-4 z-[45] flex size-12 items-center justify-center rounded-full border border-white/25 bg-gradient-to-br from-[#25D366] to-[#0f7a4a] text-white shadow-[0_10px_36px_rgba(37,211,102,0.45),0_0_24px_rgba(37,211,102,0.22)] ring-1 ring-white/10 md:end-8 md:size-[3.25rem]"
    >
      <MessageCircle className="size-[1.35rem] md:size-6" strokeWidth={2.1} aria-hidden />
    </motion.a>
  );
}
