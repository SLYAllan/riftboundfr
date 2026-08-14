"use client";

import { useEffect, useRef } from "react";

/**
 * Accessibilité des modales custom (H3) : à appliquer sur le conteneur de contenu.
 * - focus le 1er élément focusable à l'ouverture (sinon le conteneur),
 * - Escape ferme,
 * - piège le focus (Tab/Shift+Tab cyclent dans la modale),
 * - rend le focus à l'élément déclencheur à la fermeture.
 * Le conteneur doit porter role="dialog" aria-modal="true" aria-labelledby + tabIndex={-1}.
 */
export function useDialogA11y<T extends HTMLElement = HTMLDivElement>(onClose: () => void) {
  const ref = useRef<T>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const node = ref.current;

    const focusables = (): HTMLElement[] =>
      node
        ? Array.from(
            node.querySelectorAll<HTMLElement>(
              'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])',
            ),
          ).filter((el) => el.offsetParent !== null)
        : [];

    (focusables()[0] ?? node)?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key === "Tab" && node) {
        const items = focusables();
        if (items.length === 0) {
          e.preventDefault();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, []);

  return ref;
}
