import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const scrollTargetsToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const layoutBody = document.querySelector(".Pomonike-body");
  if (layoutBody) {
    layoutBody.scrollTop = 0;
  }
};

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    scrollTargetsToTop();
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
