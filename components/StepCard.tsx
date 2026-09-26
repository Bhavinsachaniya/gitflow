import React, { useState } from 'react';
import { Copy, Check, X, ChevronRight, CheckCircle2 } from 'lucide-react';
import { CheatSheetStep } from '../types';

interface StepCardProps {
  step: CheatSheetStep;
  isActive: boolean;
  onActivate: () => void;
  isDark: boolean;
}

const StepCard: React.FC<StepCardProps> = ({ step, isActive, onActivate }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(step.command);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate();
    }
  };

  // Dynamic classes for Description Animation (Grid Rows)
  const descMobileClass = isExpanded
    ? "grid-rows-[1fr] opacity-100 mb-3"
    : "grid-rows-[0fr] opacity-50 mb-0";
  const descDesktopClass = "md:grid-rows-[1fr] md:opacity-100 md:mb-3";

  // Dynamic classes for Details Animation
  const detailsMobileClass = isExpanded
    ? "grid-rows-[1fr] opacity-100 pt-2.5 mt-3 border-t border-gh-border/60"
    : "grid-rows-[0fr] opacity-0 pt-0 mt-0 border-t-0 border-transparent";

  const detailsDesktopClass = isActive
    ? "md:grid-rows-[1fr] md:opacity-100 md:pt-2.5 md:mt-3 md:border-t md:border-gh-border/60"
    : "md:grid-rows-[0fr] md:opacity-0 md:pt-0 md:mt-0 md:border-t-0 md:border-transparent";

  return (
    <div
      tabIndex={0}
      role="button"
      aria-pressed={isActive}
      onClick={onActivate}
      onKeyDown={handleKeyDown}
      className={`
        group relative rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden backdrop-blur-sm
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-borderActive focus-visible:ring-offset-2
        ${isActive
          ? 'bg-gh-card border-gh-borderActive shadow-md translate-x-1 z-10 ring-1 ring-gh-borderActive/40'
          : 'bg-gh-card border-gh-border hover:border-gh-borderActive hover:bg-gh-card opacity-95 hover:opacity-100 shadow-sm'}
      `}
    >
      {/* Visual Indicator Bar */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-[5px] transition-colors duration-200 ${isActive ? 'bg-gh-borderActive' : 'bg-transparent'}`}
        aria-hidden="true"
      />

      <div className="p-4 pl-4.5">
        {/* Header with Title and Active Badge */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isActive && (
              <CheckCircle2 
                className="w-4 h-4 text-gh-borderActive shrink-0" 
                aria-label="Current active step" 
              />
            )}
            <h3 className={`text-sm font-bold truncate ${isActive ? 'text-gh-borderActive font-extrabold' : 'text-gh-text'} group-hover:text-gh-borderActive transition-colors`}>
              {step.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile Toggle Button - Chevron */}
            <button
              onClick={toggleExpand}
              className={`md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 text-gh-muted hover:text-gh-text transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-borderActive rounded-lg ${isExpanded ? '-rotate-90' : 'rotate-90'}`}
              aria-label={isExpanded ? "Collapse step details" : "Expand step details"}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Description - Smooth Grid Animation */}
        <div className={`grid transition-[grid-template-rows,opacity,margin] duration-200 ease-in-out ${descMobileClass} ${descDesktopClass}`}>
          <div className="overflow-hidden">
            <p className="text-xs text-gh-muted leading-relaxed font-medium">
              {step.description}
            </p>
          </div>
        </div>

        {/* Command Box - Always Visible (64px min-height, WCAG AAA compliant) */}
        <div className="min-h-[64px] bg-gh-code-bg rounded-lg border border-gh-border flex items-center justify-between group/code relative overflow-hidden z-10 shadow-inner">
          <div className="flex items-center gap-2.5 px-3.5 py-3 overflow-x-auto custom-scrollbar w-full">
            <span className="text-gh-success select-none text-sm shrink-0 font-bold" aria-hidden="true">$</span>
            <code className="font-mono text-xs sm:text-sm text-[#F8FAFC] whitespace-nowrap font-semibold">
              {step.command}
            </code>
          </div>
          <button
            onClick={handleCopy}
            className={`min-w-[48px] min-h-[64px] flex items-center justify-center p-3 border-l border-gh-border/30 bg-transparent hover:bg-white/10 active:bg-white/20 transition-all h-full shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gh-borderActive ${copyStatus === 'success' ? 'text-green-300' : 'text-gh-muted hover:text-white'}`}
            title="Copy command to clipboard"
            aria-label="Copy command to clipboard"
          >
            {copyStatus === 'idle' && <Copy size={18} />}
            {copyStatus === 'success' && <Check size={18} className="text-green-300 stroke-[3]" />}
            {copyStatus === 'error' && <X size={18} className="text-rose-300 stroke-[3]" />}
          </button>
        </div>

        {/* Details - Smooth Grid Animation */}
        <div className={`grid transition-[grid-template-rows,opacity,padding,margin] duration-200 ease-in-out ${detailsMobileClass} ${detailsDesktopClass}`}>
          <div className="overflow-hidden">
            <ul className="space-y-1.5 pt-1">
              {step.details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-gh-muted font-medium">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gh-borderActive shrink-0" aria-hidden="true"></span>
                  <span className="leading-snug">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepCard;
