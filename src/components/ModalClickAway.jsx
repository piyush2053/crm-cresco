import { useEffect } from "react";

// Central fallback for the app's existing modal implementations. A modal is
// dismissed only when the pointer starts on its backdrop itself. Clicks inside
// the panel (including selects, scrollbars, and nested content) are untouched.
export default function ModalClickAway() {
  useEffect(() => {
    function dismissFromBackdrop(event) {
      if (event.button !== 0 || !(event.target instanceof HTMLElement)) return;

      const backdrop = event.target;
      if (
        !backdrop.classList.contains("fixed") ||
        !backdrop.classList.contains("inset-0") ||
        backdrop.dataset.clickAwayHandled === "true"
      ) return;

      // Search only through the clicked backdrop's direct modal panel. This
      // prevents an inner modal from accidentally closing its parent modal.
      const panel = Array.from(backdrop.children).find((child) =>
        child instanceof HTMLElement && child.querySelector("svg.lucide-x"),
      );
      const closeButton = panel?.querySelector("svg.lucide-x")?.closest("button");
      if (closeButton instanceof HTMLButtonElement && !closeButton.disabled) {
        closeButton.click();
      }
    }

    document.addEventListener("pointerdown", dismissFromBackdrop, true);
    return () => document.removeEventListener("pointerdown", dismissFromBackdrop, true);
  }, []);

  return null;
}
