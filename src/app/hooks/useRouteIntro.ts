"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type IntroVariant = "full" | "short";

const STORAGE_KEY = "nasa-welcome-intro";

export function useRouteIntro() {
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState<IntroVariant>("full");
  const hasReadStorage = useRef(false);

  useEffect(() => {
    if (hasReadStorage.current) {
      return;
    }

    hasReadStorage.current = true;

    if (typeof window === "undefined") {
      return;
    }

    try {
      const storedVariant = window.localStorage.getItem(STORAGE_KEY) as IntroVariant | null;
      const nextVariant: IntroVariant = storedVariant === "short" ? "short" : "full";

      setVariant(nextVariant);
      setOpen(true);

      if (nextVariant === "full") {
        window.localStorage.setItem(STORAGE_KEY, "short");
      }
    } catch (error) {
      setVariant("full");
      setOpen(true);
    }
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const reset = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        // ignore storage errors
      }
    }

    setVariant("full");
    setOpen(true);
  }, []);

  return { open, variant, close, setOpen, reset } as const;
}
