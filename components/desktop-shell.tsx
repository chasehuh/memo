"use client";

import { useEffect } from "react";

/** Marks the document when running inside the Tauri macOS shell. */
export function DesktopShell() {
  useEffect(() => {
    const ua = navigator.userAgent;
    if (ua.includes("agentnote-desktop") || "__TAURI_INTERNALS__" in window) {
      document.documentElement.dataset.desktop = "tauri";
    }
  }, []);

  return null;
}
