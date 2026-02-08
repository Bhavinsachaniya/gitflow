
import React, { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { flushSync } from 'react-dom';

interface ThemeToggleProps {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
  className?: string;
}

export const ThemeToggleButton: React.FC<ThemeToggleProps> = ({ 
  isDark, 
  setIsDark, 
  className = "" 
}) => {
  const isTransitioning = useRef(false);

  const toggleTheme = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isTransitioning.current) return;

    // 1. Feature Detection
    const isAppearanceTransition = 
      // @ts-ignore
      document.startViewTransition && 
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fallback if API not supported
    if (!isAppearanceTransition) {
      setIsDark(!isDark);
      return;
    }

    isTransitioning.current = true;

    // 2. Get click coordinates for the circular reveal origin
    const x = e.clientX;
    const y = e.clientY;
    
    // Calculate distance to the furthest corner
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    // 3. Start View Transition
    try {
      // @ts-ignore
      const transition = document.startViewTransition(() => {
        flushSync(() => {
          setIsDark(!isDark);
        });
      });

      // Wait for the pseudo-elements to be created
      await transition.ready;

      // 4. Animate the clip-path
      // Note: We animate the NEW view (the one coming in) to expand over the OLD view
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500, // Slightly longer for a more "premium" feel
          easing: 'ease-in-out', // Smoother acceleration/deceleration
          pseudoElement: '::view-transition-new(root)',
        }
      );
      
      await transition.finished;
    } catch (error) {
      // Fallback in case of any weird browser errors
      console.error("ViewTransition failed:", error);
      setIsDark(!isDark);
    } finally {
      isTransitioning.current = false;
    }
  }, [isDark, setIsDark]);

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-full transition-all duration-300
        hover:bg-gh-border active:scale-90
        text-gh-text
        ${className}
      `}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <defs>
          <mask id="moon-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <motion.circle
              // Animated mask circle that "bites" into the sun to form the moon
              animate={{ cx: isDark ? 25 : 17, cy: isDark ? 0 : 2 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              cx="17"
              cy="2"
              r="7"
              fill="black"
            />
          </mask>
        </defs>
        
        {/* Main Body (Sun Core / Moon) */}
        <motion.circle
          layout
          animate={{ r: isDark ? 5 : 9, fill: isDark ? "currentColor" : "currentColor" }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          cx="12"
          cy="12"
          fill="currentColor"
          stroke="none"
          mask="url(#moon-mask)"
        />

        {/* Sun Rays - Scale out when light, scale in (hide) when dark */}
        <motion.g
          animate={{ 
            opacity: isDark ? 1 : 0, 
            scale: isDark ? 1 : 0,
            rotate: isDark ? 0 : -90 // Rotate effect while hiding/showing
          }}
          transition={{ duration: 0.4, ease: "backOut" }}
          style={{ originX: "12px", originY: "12px" }}
        >
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </motion.g>
      </svg>
    </button>
  );
};
