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

/**
 * The H mark, drawn as two halves split by the white slash. In the loader the
 * halves drift apart along the slash and click back together while the mark
 * breathes (see LOADER_CSS).
 */
export function HuttspotMark({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="-8 -12 152 171"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id="hs-mark-h">
          <path d="M0 0H52V54H87V0H136V147H87V101H52V147H0Z" />
        </clipPath>
        {/* Cuts the slash so it shows whatever is behind the mark */}
        <mask id="hs-mark-slash" maskUnits="userSpaceOnUse" x="-8" y="-12" width="152" height="171">
          <rect x="-8" y="-12" width="152" height="171" fill="#fff" />
          <path d="M-8 109.8L144 43.3" stroke="#000" strokeWidth="5" />
        </mask>
      </defs>
      <g className="hs-mark-orange">
        <g clipPath="url(#hs-mark-h)" mask="url(#hs-mark-slash)">
          <path d="M0 0H108V59.5L29 93.9V147H0Z" fill="#ff6b35" />
        </g>
      </g>
      <g className="hs-mark-green">
        <g clipPath="url(#hs-mark-h)" mask="url(#hs-mark-slash)">
          <path d="M108 0H136V147H29V93.9L108 59.5Z" fill="#0a8754" />
        </g>
      </g>
    </svg>
  );
}

// Kept with the component (not in globals.css) so the loader always looks
// right, even when a stale CSS cache is being served.
const LOADER_CSS = `
.hs-loader {
  background: rgba(247, 247, 245, 0.62);
  -webkit-backdrop-filter: blur(14px) saturate(120%);
  backdrop-filter: blur(14px) saturate(120%);
  animation: hs-loader-in 180ms ease-out both;
}
.hs-loader-text { color: #1a1a1a; }
[data-theme="dark"] .hs-loader { background: rgba(14, 17, 16, 0.66); }
[data-theme="dark"] .hs-loader-text { color: #f2f2f0; }

.hs-loader-mark {
  transform-origin: center;
  animation: hs-mark-breathe 1.8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}
.hs-loader-mark .hs-mark-orange,
.hs-loader-mark .hs-mark-green {
  animation: 1.8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}
.hs-loader-mark .hs-mark-orange { animation-name: hs-mark-part-orange; }
.hs-loader-mark .hs-mark-green { animation-name: hs-mark-part-green; }
.hs-loader-text { animation: hs-text-fade 1.8s ease-in-out infinite; }

@keyframes hs-loader-in { from { opacity: 0; } to { opacity: 1; } }
/* Shrinks a little as the halves part, grows back as they meet */
@keyframes hs-mark-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.88); }
}
/* Halves slide apart across the slash, then click back together */
@keyframes hs-mark-part-orange {
  0%, 15%, 85%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-3px, -7px); }
}
@keyframes hs-mark-part-green {
  0%, 15%, 85%, 100% { transform: translate(0, 0); }
  50% { transform: translate(3px, 7px); }
}
@keyframes hs-text-fade {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

@media (prefers-reduced-motion: reduce) {
  .hs-loader-mark,
  .hs-loader-mark .hs-mark-orange,
  .hs-loader-mark .hs-mark-green { animation: none; }
  .hs-loader-text { animation: hs-text-fade 2.4s ease-in-out infinite; }
}
`;

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
          className="hs-loader"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <style>{LOADER_CSS}</style>
          <HuttspotMark className="hs-loader-mark" style={{ height: 88, width: "auto" }} />
          <p
            className="hs-loader-text font-nunito"
            style={{
              minHeight: 20,
              padding: "0 24px",
              textAlign: "center",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {message ?? "Loading..."}
          </p>
        </div>
      )}
    </LoaderContext.Provider>
  );
}
