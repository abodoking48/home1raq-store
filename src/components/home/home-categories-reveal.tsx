"use client";

import { useEffect } from "react";

export function HomeCategoriesReveal() {
  useEffect(() => {
    const section = document.getElementById("home-categories");
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.setAttribute("data-visible", "true");
        observer.disconnect();
      },
      { threshold: 0.2 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return null;
}
