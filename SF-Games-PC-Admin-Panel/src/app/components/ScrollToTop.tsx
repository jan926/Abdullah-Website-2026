import { useLayoutEffect } from "react";
import { useLocation } from "react-router";

export function ScrollToTop() {
  const location = useLocation();

  useLayoutEffect(() => {
    if (location.hash) return;
    const adminScroll = document.querySelector<HTMLElement>(".admin-main-scroll");
    if (adminScroll) {
      adminScroll.scrollTo({ top: 0, left: 0 });
      return;
    }
    window.scrollTo({ top: 0, left: 0 });
  }, [location.pathname, location.search]);

  return null;
}
