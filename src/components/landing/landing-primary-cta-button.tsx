"use client";

import { ShoppingBag } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type LandingPrimaryCtaButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> & {
  /** Default: "اطلب الآن" */
  readonly label?: string;
  /** Pulse glow — default true; set false for sticky duplicate CTA */
  readonly pulse?: boolean;
};

/**
 * High-contrast primary CTA for landing pages (in-flow + sticky bar).
 * Pulse + hover/active motion — class names in `globals.css` (`.landing-cta-pulse`).
 */
export function LandingPrimaryCtaButton({
  label = "اطلب الآن",
  pulse = true,
  className,
  children,
  ...props
}: LandingPrimaryCtaButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        pulse && "landing-cta-pulse",
        "group relative inline-flex w-full min-h-14 items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-6 text-lg font-black tracking-tight",
        "bg-gradient-to-br from-[#00ff88] to-[#00c96a] text-[#004422] shadow-[0_8px_32px_rgba(0,255,136,0.45)]",
        "transition-all duration-200 hover:scale-[1.02] hover:brightness-110 hover:shadow-[0_12px_40px_rgba(0,255,136,0.55)]",
        "active:scale-[0.97] active:brightness-95",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "md:min-h-16 md:text-xl",
        className,
      )}
      {...props}
    >
      <ShoppingBag
        className="size-5 shrink-0 transition-transform duration-200 group-hover:scale-110 md:size-6"
        aria-hidden
      />
      <span>{children ?? label}</span>
    </button>
  );
}
