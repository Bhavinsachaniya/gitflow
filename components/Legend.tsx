
import React from 'react';

export const Legend: React.FC = () => {
  return (
    <div className="mx-4 mb-8 mt-4 p-5 bg-gh-canvas border border-gh-border rounded-xl shadow-sm">
      <h3 className="text-xs font-bold text-gh-muted uppercase tracking-widest mb-4 border-b border-gh-border pb-2">
        Visual Legend
      </h3>
      
      <div className="grid grid-cols-2 gap-y-4 gap-x-2">
        {/* Column 1: Nodes */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <div className="w-4 h-4 rounded-full bg-gh-bg border-2 border-indigo-500 shadow-sm"></div>
             <span className="text-[11px] font-medium text-gh-text">Commit</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-4 h-5 rounded-[2px] bg-gh-bg border-2 border-emerald-500 border-dashed"></div>
             <span className="text-[11px] font-medium text-gh-text">Staged File</span>
          </div>
           <div className="flex items-center gap-3">
             <div className="w-4 h-5 rounded-[2px] bg-gh-bg border-2 border-rose-500"></div>
             <span className="text-[11px] font-medium text-gh-text">Modified File</span>
          </div>
        </div>

        {/* Column 2: Branches/Colors */}
        <div className="space-y-3">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-indigo-500/20"></div>
              <span className="text-[11px] font-medium text-gh-muted">Main Branch</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-500 ring-2 ring-cyan-500/20"></div>
              <span className="text-[11px] font-medium text-gh-muted">Feature Branch</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 ring-2 ring-purple-500/20"></div>
              <span className="text-[11px] font-medium text-gh-muted">Remote/Origin</span>
           </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gh-border text-[10px] text-gh-muted leading-relaxed">
        <p>
          <strong>Tip:</strong> Hover over any node in the graph to see detailed information about its status, tags, or commit message.
        </p>
      </div>
    </div>
  );
};
