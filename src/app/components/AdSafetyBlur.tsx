import { useEffect } from "react";

const AD_SELECTORS = [
  "ins.adsbygoogle",
  "iframe[src*='ads']",
  "iframe[src*='ad.']",
  "iframe[src*='doubleclick']",
  "iframe[src*='googlesyndication']",
  "iframe[src*='effectivecpm']",
  "iframe[src*='monetag']",
  "[id*='ad-container']",
  "[class*='ad-container']",
  "[data-ad]",
  "[data-ad-slot]",
];

const BLUR_STYLE = "blur(15px)";

function applyAdSafetyBlur(root: ParentNode = document.body) {
  AD_SELECTORS.forEach((selector) => {
    root.querySelectorAll(selector).forEach((node) => {
      const element = node as HTMLElement;
      element.style.filter = BLUR_STYLE;
      element.style.webkitFilter = BLUR_STYLE;
      element.style.backdropFilter = BLUR_STYLE;
      element.style.webkitBackdropFilter = BLUR_STYLE;
      element.setAttribute("data-ad-safety-blur", "true");
    });
  });
}

export function AdSafetyBlur() {
  useEffect(() => {
    applyAdSafetyBlur();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            applyAdSafetyBlur(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    const interval = window.setInterval(() => applyAdSafetyBlur(), 4000);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
