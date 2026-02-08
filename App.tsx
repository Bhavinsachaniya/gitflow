
import React, { useState, useRef, useEffect, useMemo, useCallback, useLayoutEffect } from 'react';
import { GitBranch, Github, Linkedin, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GitGraph from './components/GitGraph';
import StepCard from './components/StepCard';
import { Legend } from './components/Legend';
import { ThemeToggleButton } from './components/ThemeToggle';
import { steps } from './constants';
import { GitState, CheatSheetStep } from './types';

type StepsMap = Record<string, CheatSheetStep>;

const App: React.FC = () => {
  const [activeStepId, setActiveStepId] = useState<string>(steps[0].id);
  const [isDark, setIsDark] = useState(true);

  // Undo/Redo History
  const [navHistory, setNavHistory] = useState<string[]>([steps[0].id]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Data Map
  const stepsMap: StepsMap = useMemo(() => {
    return steps.reduce((acc, step) => {
      acc[step.id] = step;
      return acc;
    }, {} as StepsMap);
  }, []);

  const activeStep = stepsMap[activeStepId] || steps[0];
  const activeGraphState: GitState = activeStep.graphState;

  // Refs
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const isManualScroll = useRef(false);
  const scrollTimeout = useRef<number | null>(null);

  // --- EFFECTS ---
  
  // Theme Toggle
  // We use useLayoutEffect here so that the class change happens synchronously 
  // after the React render, ensuring document.startViewTransition captures the new state correctly.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDark]);

  // Initial Load - Force Scroll to Top
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    setActiveStepId(steps[0].id);
    setNavHistory([steps[0].id]);
    setHistoryIndex(0);

    const resetScroll = () => {
        if (stepsContainerRef.current) {
            stepsContainerRef.current.scrollTop = 0;
        }
        window.scrollTo(0, 0);
    };

    resetScroll();
    requestAnimationFrame(resetScroll);

    return () => { 
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'auto'; 
        }
    };
  }, []);

  // Step Activation Logic
  const activateStep = useCallback((id: string, isUndoRedo = false, isScrollSpy = false) => {
    setActiveStepId(prev => {
        if (prev === id) return prev;
        
        if (!isUndoRedo) {
            setNavHistory(h => {
                const newHistory = h.slice(0, historyIndex + 1);
                newHistory.push(id);
                return newHistory;
            });
            setHistoryIndex(i => i + 1);
        }
        return id;
    });

    if (!isScrollSpy) {
        isManualScroll.current = true;
        const el = document.getElementById(`step-${id}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
        scrollTimeout.current = window.setTimeout(() => { isManualScroll.current = false; }, 600);
    }
  }, [historyIndex]);

  // Handle Scroll to detect top/bottom edge cases accurately
  const handleScroll = useCallback(() => {
    if (!stepsContainerRef.current || isManualScroll.current) return;
    
    const container = stepsContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;

    // 1. Force First Step at very top
    if (scrollTop < 20) {
        const firstId = steps[0].id;
        if (activeStepId !== firstId) activateStep(firstId, false, true);
        return;
    }

    // 2. Force Last Step at very bottom
    // We give a generous buffer (50px) to ensure we catch the end
    if (scrollHeight - clientHeight - scrollTop < 50) {
        const lastStepId = steps[steps.length - 1].id;
        if (activeStepId !== lastStepId) activateStep(lastStepId, false, true);
        return;
    }
  }, [activeStepId, activateStep]);

  // Scroll Spy (Intersection Observer)
  useEffect(() => {
    const container = stepsContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver((entries) => {
      if (isManualScroll.current) return;
      
      // If we are near bottom, let handleScroll take priority
      if (container.scrollHeight - container.scrollTop - container.clientHeight < 100) return;

      const visibleEntry = entries.find(entry => entry.isIntersecting);
      if (visibleEntry) {
        const stepId = visibleEntry.target.getAttribute('data-step-id');
        if (stepId && stepId !== activeStepId) {
            activateStep(stepId, false, true);
        }
      }
    }, { 
        root: container,
        // Tuned Active Zone:
        // Top 15% is ignored (header/padding).
        // Bottom 60% is ignored.
        // The "Active" strip is the slice from 15% to 40% of the viewport.
        // This feels most natural for "reading" the top item.
        rootMargin: '-15% 0px -60% 0px', 
        threshold: 0 
    });

    document.querySelectorAll('.step-item').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [activeStepId, activateStep]); 

  const graphBgColor = isDark ? '#121212' : '#FFFFFF';

  return (
    <div className="h-[100dvh] flex flex-col lg:flex-row bg-gh-bg text-gh-text font-sans overflow-hidden transition-colors duration-300">
      
      {/* LEFT PANEL: GUIDE & CHEAT SHEET */}
      <div className="order-2 lg:order-1 flex-1 lg:flex-[0.4] flex flex-col bg-gh-canvas border-r-0 lg:border-r border-gh-border relative z-20 shadow-xl min-w-[320px] transition-colors duration-300 rounded-t-3xl lg:rounded-none overflow-hidden mt-[-20px] lg:mt-0">
        
        {/* Mobile Grab Handle */}
        <div className="lg:hidden w-full flex justify-center pt-3 pb-1 bg-gh-canvas cursor-grab border-b border-gh-border/50 shrink-0">
           <div className="w-12 h-1.5 rounded-full bg-gh-border"></div>
        </div>

        {/* Scrollable Steps List */}
        <div 
            ref={stepsContainerRef} 
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 pt-6 pb-[60vh] custom-scrollbar scroll-smooth space-y-6 z-0 order-1 lg:order-2"
        >
          {steps.map((step) => (
            <div key={step.id} id={`step-${step.id}`} data-step-id={step.id} className="step-item scroll-m-24">
              <StepCard step={step} isActive={activeStepId === step.id} onActivate={() => activateStep(step.id)} isDark={isDark} />
            </div>
          ))}
          
          {/* Legend Section at the bottom of the guide */}
          <div className="pt-4 opacity-100 transition-opacity">
            <Legend />
            <div className="text-center pt-4 text-gh-muted text-xs opacity-50 pb-6 font-mono tracking-widest uppercase">
              End of Workflow
            </div>
          </div>
        </div>

        {/* Header / Toolbar */}
        <div className="order-2 lg:order-1 p-4 border-t lg:border-t-0 lg:border-b border-gh-border bg-gh-header/95 backdrop-blur-sm flex justify-between items-center sticky bottom-0 lg:top-0 z-30 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="p-1.5 rounded-md bg-gh-btn border border-gh-border shadow-sm text-gh-link">
                <GitBranch className="h-5 w-5" />
             </div>
             <div>
                <h1 className="font-bold text-gh-text text-base leading-none">GitFlow</h1>
                <span className="text-[10px] text-gh-muted uppercase tracking-wider font-bold">Cheat Sheet</span>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggleButton isDark={isDark} setIsDark={setIsDark} />
            
            <div className="h-4 w-px bg-gh-border mx-1"></div>
            
            <a href="https://github.com/bhavinsachaniya" target="_blank" rel="noopener noreferrer" className="text-gh-muted hover:text-gh-text transition-all transform hover:scale-110" title="GitHub">
                <Github size={20} />
            </a>
            <a href="https://linkedin.com/in/bhavindotdraft" target="_blank" rel="noopener noreferrer" className="text-gh-muted hover:text-[#0077b5] transition-all transform hover:scale-110" title="LinkedIn">
                <Linkedin size={20} />
            </a>
            <a href="https://bhavinsachaniya.in" target="_blank" rel="noopener noreferrer" className="text-gh-muted hover:text-emerald-400 transition-all transform hover:scale-110" title="Portfolio">
                <Globe size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: VISUALIZATION */}
      <div className="order-1 lg:order-2 h-[48vh] lg:h-auto w-full lg:flex-[0.6] bg-gh-bg relative shrink-0 z-10 flex flex-col border-b lg:border-b-0 border-gh-border transition-colors duration-300">
        
        {/* Context Bar */}
        <div className="p-4 border-b border-gh-border bg-gh-canvas/50 backdrop-blur-sm shrink-0 z-20 transition-colors duration-300 relative shadow-sm">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gh-borderActive via-purple-500 to-gh-borderActive opacity-50"></div>
           <div className="max-w-4xl mx-auto w-full">
              <div className="flex items-center gap-3 mb-2">
                 <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gh-btn border border-gh-border text-gh-link uppercase tracking-wider">{activeStep.category}</span>
                 <h2 className="text-xl font-bold text-gh-text leading-tight truncate">{activeStep.title}</h2>
              </div>
              
              <div className="flex items-center gap-3">
                 <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gh-header border border-gh-border shadow-inner flex-1 min-w-0">
                   <span className="text-gh-success font-mono font-bold select-none text-sm">➜</span>
                   <code className="font-mono text-sm text-gh-text whitespace-nowrap overflow-x-auto custom-scrollbar">{activeStep.command}</code>
                 </div>
                 <AnimatePresence mode="wait">
                  {activeGraphState.message && (
                    <motion.div
                      key={activeGraphState.message}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gh-btn border border-gh-border shadow-sm shrink-0"
                    >
                       <div className="w-2 h-2 rounded-full bg-gh-success animate-pulse"></div>
                       <span className="text-xs font-mono font-medium text-gh-muted">{activeGraphState.message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
           </div>
        </div>

        {/* Graph Area */}
        <div className="flex-1 relative overflow-hidden bg-gh-bg shadow-inner transition-colors duration-300">
           <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `radial-gradient(var(--color-text) 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
           <GitGraph state={activeGraphState} isDark={isDark} bgColor={graphBgColor} />
        </div>
      </div>
    </div>
  );
};

export default App;
