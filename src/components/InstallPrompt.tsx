"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIos() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [showIosHint] = useState(() => {
    if (typeof window === "undefined") return false;
    if (isStandalone()) return false;
    if (window.localStorage.getItem("kokoro-install-dismissed")) return false;
    return isIos();
  });

  useEffect(() => {
    if (isStandalone() || showIosHint) return;

    const wasDismissed = window.localStorage.getItem("kokoro-install-dismissed");
    if (wasDismissed) return;

    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [showIosHint]);

  function dismiss() {
    setDismissed(true);
    window.localStorage.setItem("kokoro-install-dismissed", "1");
  }

  const visible = !dismissed && (deferredPrompt || showIosHint);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed inset-x-0 bottom-4 z-30 mx-auto w-[92%] max-w-md"
          style={{ isolation: "isolate" }}
        >
          <div className="glass-strong flex items-center gap-3 rounded-2xl p-4 shadow-xl">
            <Download className="h-5 w-5 shrink-0 text-kokoro-600" />
            <div className="flex-1 text-sm text-kokoro-800">
              {deferredPrompt ? (
                <span>Install Kokoro for quick access and order updates.</span>
              ) : (
                <span>Tap Share → &quot;Add to Home Screen&quot; to install Kokoro.</span>
              )}
            </div>
            {deferredPrompt && (
              <button
                onClick={async () => {
                  await deferredPrompt.prompt();
                  setDeferredPrompt(null);
                  dismiss();
                }}
                className="rounded-full bg-kokoro-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-kokoro-600"
              >
                Install
              </button>
            )}
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="rounded-full p-1 text-kokoro-500 hover:bg-kokoro-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
