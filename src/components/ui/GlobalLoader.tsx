"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function GlobalLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset loading state when the path or search params change (navigation completes)
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsLoading(false);
  }, [pathname, searchParams]);

  // Intercept all clicks on anchor tags to detect navigation start
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Find the closest anchor tag
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external links, anchor links, same-page links, or links opening in new tabs
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        target.getAttribute("target") === "_blank"
      ) {
        return;
      }

      // Check if the link is internal
      const isInternal =
        href.startsWith("/") || href.startsWith(window.location.origin);

      if (isInternal) {
        let targetPathAndSearch = href;
        try {
          // Attempt to parse the target URL to compare with current URL
          const targetUrl = new URL(href, window.location.origin);
          targetPathAndSearch = targetUrl.pathname + targetUrl.search;
        } catch (error) {
          // Fallback if URL parsing fails
        }

        const currentUrl = window.location.pathname + window.location.search;

        // If navigating to a different URL, trigger the loader with a small delay
        if (currentUrl !== targetPathAndSearch) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          // Delay showing the loader to prevent flashing on fast transitions
          timeoutRef.current = setTimeout(() => {
            setIsLoading(true);
          }, 150);
        }
      }
    };

    // Capture beforeunload for hard reloads/external navigations
    const handleBeforeUnload = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsLoading(true);
    };

    // Use capture phase to intercept clicks before other handlers might prevent default
    document.addEventListener("click", handleClick, true);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          // Ultra-subtle overlay: just enough blur/dim to ensure the green spinner pops on complex pages
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/5 backdrop-blur-[2px] dark:bg-black/30"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: 360 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              scale: { duration: 0.2, ease: "easeOut" },
              opacity: { duration: 0.2 },
              rotate: { duration: 2.5, ease: "linear", repeat: Infinity },
            }}
            className="flex items-center justify-center"
          >
            {/* Thick Green Dotted Circle Spinner */}
            <svg
              width="76"
              height="76"
              viewBox="0 0 100 100"
              className="drop-shadow-[0_0_12px_rgba(59,201,142,0.5)]"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--mint2, #3bc98e)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="0 24"
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
