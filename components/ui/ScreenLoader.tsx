"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

/**
 * Full-screen HuttSpot loader: the H mark pulsing over a blurred page.
 *
 * Use it for moments where the user has just ACTED and must wait for the
 * app to move them on (signing in/out, starting a payment, opening a chat,
 * finishing onboarding). Pages that are loading their own content keep
 * using skeletons.
 *
 *   const loader = useScreenLoader();
 *   loader.show("Signing you in...");   // call again to change the message
 *   loader.hide();                      // e.g. on error
 *
 * It hides itself when the route changes, so after `router.push` there's
 * nothing to clean up.
 */

type LoaderApi = {
  show: (message?: string) => void;
  hide: () => void;
};

const LoaderContext = createContext<LoaderApi>({
  show: () => {},
  hide: () => {},
});

export const useScreenLoader = () => useContext(LoaderContext);

// Quick actions finish before this, so the loader never just flashes
const SHOW_DELAY_MS = 180;

/** The H mark (orange / green with the white slash) */
export function HuttspotMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 136 147"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id="hs-mark-h">
          <path d="M0 0H52V54H87V0H136V147H87V101H52V147H0Z" />
        </clipPath>
        {/* The slash is cut out, so it shows the page behind it */}
        <mask id="hs-mark-slash">
          <rect width="136" height="147" fill="#fff" />
          <path d="M-4 108L140 45" stroke="#000" strokeWidth="5" />
        </mask>
      </defs>
      <g clipPath="url(#hs-mark-h)" mask="url(#hs-mark-slash)">
        <rect width="136" height="147" fill="#0a8754" />
        <path d="M0 0H108V59.5L29 93.9V147H0Z" fill="#ff6b35" />
      </g>
    </svg>
  );
}

export function ScreenLoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [requested, setRequested] = useState(false);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setRequested(false);
    setVisible(false);
  }, []);

  const show = useCallback((msg?: string) => {
    setMessage(msg);
    setRequested(true);
    if (!timer.current) {
      timer.current = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    }
  }, []);

  // New page → done (only on an actual change, not on first mount)
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    hide();
  }, [pathname, hide]);

  // Coming back with the browser's Back button (e.g. from Paystack) can
  // restore this page from cache with the loader still showing
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => e.persisted && hide();
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, [hide]);

  const api = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <LoaderContext.Provider value={api}>
      {children}
      {requested && visible && (
        <div
          role="status"
          aria-live="polite"
          className="hs-loader fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5"
        >
          <HuttspotMark className="hs-loader-mark h-[72px] w-auto" />
          <p className="hs-loader-text min-h-5 px-6 text-center font-nunito text-sm font-semibold">
            {message ?? "Loading..."}
          </p>
        </div>
      )}
    </LoaderContext.Provider>
  );
}
