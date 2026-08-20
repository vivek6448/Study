import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";
import "./Preloader.css";

const FALLBACK_TIMEOUT = 8000;
const INTRO_EASE = [0.16, 1, 0.3, 1];

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function readThemeColors() {
  if (typeof document === "undefined") {
    return { neutral: "#999999", accent: "#888888" };
  }
  const cs = getComputedStyle(document.documentElement);
  return {
    neutral: cs.getPropertyValue("--border").trim() || "#999999",
    accent: cs.getPropertyValue("--accent").trim() || "#888888",
  };
}

export default function Preloader({ onDone, ready = true }) {
  const [reducedMotion] = useState(prefersReducedMotion);
  const [theme] = useState(readThemeColors);
  const [visible, setVisible] = useState(!reducedMotion);
  const [display, setDisplay] = useState(0);

  const count = useMotionValue(0);
  const dividerColor = useTransform(count, [0, 100], [theme.neutral, theme.accent]);

  const doneRef = useRef(false);
  const pageLoadedRef = useRef(typeof document !== "undefined" && document.readyState === "complete");
  const readyRef = useRef(ready);
  const checkFinishRef = useRef(() => {});

  const callDone = () => {
    if (!doneRef.current) {
      doneRef.current = true;
      onDone?.();
    }
  };

  useLayoutEffect(() => {
    if (reducedMotion) callDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [reducedMotion]);

  useEffect(() => {
    return count.on("change", (v) => setDisplay(Math.round(v)));
  }, [count]);

  useEffect(() => {
    readyRef.current = ready;
    checkFinishRef.current();
  }, [ready]);

  useEffect(() => {
    if (reducedMotion) return;

    let cancelled = false;
    let finished = false;
    let fallbackTimer;
    let finishTimer;
    let finishControls;

    const alreadyComplete = pageLoadedRef.current;
    const introControls = animate(count, alreadyComplete ? 96 : 90, {
      duration: alreadyComplete ? 1.2 : 4.2,
      ease: alreadyComplete ? "easeOut" : INTRO_EASE,
    });

    function finish() {
      if (cancelled || finished) return;
      if (!pageLoadedRef.current || !readyRef.current) return;
      finished = true;
      clearTimeout(fallbackTimer);
      introControls.stop();
      finishControls = animate(count, 100, {
        duration: 1,
        ease: "easeOut",
        onComplete: () => {
          if (cancelled) return;
          finishTimer = setTimeout(() => {
            if (!cancelled) setVisible(false);
          }, 900);
        },
      });
    }
    checkFinishRef.current = finish;

    function handleLoad() {
      pageLoadedRef.current = true;
      finish();
    }

    if (pageLoadedRef.current) {
      finish();
    } else {
      window.addEventListener("load", handleLoad);
    }

    fallbackTimer = setTimeout(() => {
      pageLoadedRef.current = true;
      readyRef.current = true;
      finish();
    }, FALLBACK_TIMEOUT);

    return () => {
      cancelled = true;
      window.removeEventListener("load", handleLoad);
      clearTimeout(fallbackTimer);
      clearTimeout(finishTimer);
      introControls.stop();
      finishControls?.stop();
    };
  }, [reducedMotion, count]);

  if (reducedMotion) return null;

  return (
    <AnimatePresence onExitComplete={callDone}>
      {visible && (
        <motion.div
          className="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
        >
          <p className="preloader-heading">Let's Start Study JavaScript and React JS</p>
          <span className="preloader-count">{display}</span>
          <motion.span className="preloader-divider" style={{ backgroundColor: dividerColor }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
