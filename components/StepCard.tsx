
import React, { useState } from 'react';
import { Copy, Check, X, ChevronRight } from 'lucide-react';
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

  // Dynamic classes for Description Animation (Grid Rows)
  // Mobile: Toggles based on isExpanded
  // Desktop: Always open (1fr)
  const descMobileClass = isExpanded 
    ? "grid-rows-[1fr] opacity-100 mb-3" 
    : "grid-rows-[0fr] opacity-50 mb-0";
  const descDesktopClass = "md:grid-rows-[1fr] md:opacity-100 md:mb-3";

  // Dynamic classes for Details Animation
  // Mobile: Toggles based on isExpanded
  // Desktop: Toggles based on isActive
  const detailsMobileClass = isExpanded
    ? "grid-rows-[1fr] opacity-100 pt-2 mt-3 border-t border-gh-border/50"
    : "grid-rows-[0fr] opacity-0 pt-0 mt-0 border-t-0 border-transparent";
    
  const detailsDesktopClass = isActive
    ? "md:grid-rows-[1fr] md:opacity-100 md:pt-2 md:mt-3 md:border-t md:border-gh-border/50"
    : "md:grid-rows-[0fr] md:opacity-0 md:pt-0 md:mt-0 md:border-t-0 md:border-transparent";

  return (
    <div 
      onClick={onActivate}
      className={`
        group relative rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-sm
        ${isActive 
          ? 'bg-gh-card border-gh-borderActive shadow-md translate-x-1 z-10' 
          : 'bg-gh-card border-gh-border hover:border-gh-borderActive/50 hover:bg-gh-card/90 opacity-80 hover:opacity-100'}
      `}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[4px] transition-colors duration-300 ${isActive ? 'bg-gh-borderActive' : 'bg-transparent'}`}></div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
           <div className="flex-1">
             <h3 className={`text-sm font-bold ${isActive ? 'text-gh-link' : 'text-gh-text'} group-hover:text-gh-link transition-colors`}>
                {step.title}
             </h3>
           </div>
           
           <div className="flex items-center gap-2 mt-0.5">
             {/* Mobile Toggle Button - Chevron */}
             <button 
                onClick={toggleExpand}
                className={`md:hidden p-1 text-gh-muted hover:text-gh-text transition-transform duration-300 ${isExpanded ? '-rotate-90' : 'rotate-90'}`}
                aria-label={isExpanded ? "Collapse" : "Expand"}
             >
                <ChevronRight size={18} />
             </button>

             {/* Desktop Active Indicator */}
             {isActive && <ChevronRight size={16} className="hidden md:block text-gh-borderActive shrink-0" />}
           </div>
        </div>

        {/* Description - Smooth Grid Animation */}
        <div className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out ${descMobileClass} ${descDesktopClass}`}>
           <div className="overflow-hidden">
             <p className="text-xs text-gh-muted leading-relaxed font-medium">
               {step.description}
             </p>
           </div>
        </div>

        {/* Command - Always Visible */}
        <div className="bg-gh-code-bg rounded border border-gh-border flex items-center justify-between group/code relative overflow-hidden z-10">
           <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto custom-scrollbar w-full">
              <span className="text-gh-muted select-none text-xs shrink-0 font-bold">$</span>
              <code className="font-mono text-xs text-[#f1f5f9] whitespace-nowrap">
                {step.command}
              </code>
           </div>
           <button 
              onClick={handleCopy}
              className={`p-2 border-l border-gh-border/20 bg-transparent hover:bg-white/10 transition-colors h-full shrink-0 ${copyStatus === 'success' ? 'text-green-400' : 'text-gh-muted hover:text-white'}`}
            >
              {copyStatus === 'idle' && <Copy size={12} />}
              {copyStatus === 'success' && <Check size={12} />}
              {copyStatus === 'error' && <X size={12} />}
           </button>
        </div>

        {/* Details - Smooth Grid Animation */}
        <div className={`grid transition-[grid-template-rows,opacity,padding,margin] duration-300 ease-in-out ${detailsMobileClass} ${detailsDesktopClass}`}>
           <div className="overflow-hidden">
             <ul className="space-y-1.5">
               {step.details.map((detail, idx) => (
                 <li key={idx} className="flex items-start gap-2 text-[11px] text-gh-muted font-medium">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-gh-borderActive shrink-0 opacity-70"></span>
                    <span>{detail}</span>
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
