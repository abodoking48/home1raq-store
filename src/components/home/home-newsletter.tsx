"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteCopy } from "@/lib/stitch-copy";

export function HomeNewsletter() {
  const n = siteCopy.newsletter;
  const [email, setEmail] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success(n.toast);
    setEmail("");
  }

  return (
    <section id={n.id} className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-24">
      <div className="glass-panel relative overflow-hidden rounded-[2rem] p-10 text-center md:p-16">
        <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-primary/5 blur-[80px]" />
        <h2 className="font-heading text-3xl font-black text-foreground md:text-4xl">
          {n.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          {n.subtitle}
        </p>
        <form
          onSubmit={onSubmit}
          className="mx-auto mt-8 flex max-w-2xl flex-col gap-4 pt-4 md:flex-row"
        >
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={n.placeholder}
            className="grow rounded-2xl border-white/10 bg-white/5 py-6"
          />
          <Button
            type="submit"
            className="rounded-2xl bg-primary px-10 py-6 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02]"
          >
            {n.submit}
          </Button>
        </form>
      </div>
    </section>
  );
}
