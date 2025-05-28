import { useCallback, useEffect, useMemo, useState } from "react";

const MOBILE_BREAKPOINT = 768;

// Debounce function to reduce number of renders during resize
function debounce<T extends (...args: any[]) => any>(fn: T, ms = 300) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  // Memoized media query to avoid recreation on each render
  const mobileQuery = useMemo(
    () =>
      typeof window !== "undefined"
        ? `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
        : "",
    []
  );

  // Debounced handler to avoid excessive re-renders
  const debouncedSetMobile = useCallback(
    debounce(() => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }, 100),
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Use matchMedia for better performance
    const mql = window.matchMedia(mobileQuery);

    // Use the more efficient matchMedia callback when available
    const handleChange = () => {
      debouncedSetMobile();
    };

    mql.addEventListener("change", handleChange);

    return () => {
      mql.removeEventListener("change", handleChange);
    };
  }, [mobileQuery, debouncedSetMobile]);

  return !!isMobile;
}
