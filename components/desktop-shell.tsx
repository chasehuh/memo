"use client";

import { useEffect, useState } from "react";

/** Marks the document when running inside the Tauri macOS shell. */
export function DesktopShell() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const desktop =
      ua.includes("agentnote-desktop") || "__TAURI_INTERNALS__" in window;
    if (desktop) {
      document.documentElement.dataset.desktop = "tauri";
      setIsDesktop(true);
    }
  }, []);

  if (!isDesktop) return null;

  // Login (and any page without `.zed-shell`) needs an opaque titlebar strip
  // so Overlay traffic lights don't float over a see-through hole.
  return <div className="zed-desktop-chrome" aria-hidden />;
}
