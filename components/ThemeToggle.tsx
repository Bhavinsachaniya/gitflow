
import React, { useCallback } from 'react';
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
  
  const toggleTheme = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // 1. Check support
    const isAppearanceTransition = 
      // @ts-ignore
      document.startViewTransition && 
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isAppearanceTransition) {
      setIsDark(!isDark);
      return;
    }

    // 2. Coordinates
    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    // 3. Inject temporary styles to disable default fade
    const style = document.createElement('style');
    style.innerHTML = `
      ::view-transition-old(root),
      ::view-transition-new(root) {
        animation: none;
        mix-blend-mode: normal;
      }
    `;
    document.head.appendChild(style);

    // 4. Start Transition
    // @ts-ignore
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setIsDark(!isDark);
      });
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      // Animate the new view expanding
      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 400,
          easing: 'ease-out',
          pseudoElement: '::view-transition-new(root)',
        }
      ).onfinish = () => {
        // Cleanup styles
        if (style.parentNode) style.parentNode.removeChild(style);
      };
    });
  }, [isDark, setIsDark]);

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-full transition-all duration-300
        hover:bg-gh-border active:scale-95
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
        className="w-5 h-5 overflow-hidden"
      >
        <defs>
          <mask id="moon-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <motion.circle
              initial={false}
              animate={{ cx: isDark ? 25 : 17, cy: isDark ? 0 : 2 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              cx="17"
              cy="2"
              r="7"
              fill="black"
            />
          </mask>
        </defs>
        
        {/* Main Body (Sun Core / Moon) */}
        <motion.circle
          initial={false}
          animate={{ r: isDark ? 5 : 9 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          cx="12"
          cy="12"
          fill="currentColor"
          stroke="none"
          mask="url(#moon-mask)"
        />

        {/* Sun Rays */}
        <motion.g
          initial={false}
          animate={{ 
            opacity: isDark ? 1 : 0, 
            scale: isDark ? 1 : 0,
            rotate: isDark ? 0 : -45
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ originX: "12px", originY: "12px" }}
        >
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </motion.g>
      </svg>
    </button>
  );
};
