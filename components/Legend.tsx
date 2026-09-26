import React from 'react';
import { GitCommit, FileCheck, FileCode, GitBranch, Cloud, Archive, AlertTriangle } from 'lucide-react';

export const Legend: React.FC = () => {
  return (
    <div className="mx-4 mb-6 mt-4 p-4.5 bg-gh-card border border-gh-border rounded-xl shadow-sm">
      <h3 className="text-xs font-bold text-gh-text uppercase tracking-widest mb-3.5 border-b border-gh-border pb-2 flex items-center justify-between">
        <span>Visual Graph Legend</span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gh-btn text-gh-muted font-semibold">Interactive</span>
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-4">
        {/* Column 1: Nodes & Files */}
        <div className="space-y-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gh-muted">Node Types</div>
          
          <div className="flex items-center gap-2.5">
             <div className="w-5 h-5 rounded-full bg-gh-bg border-2 border-indigo-500 flex items-center justify-center shrink-0 shadow-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
             </div>
             <div className="flex items-center gap-1.5">
               <GitCommit size={14} className="text-gh-text" />
               <span className="text-xs font-semibold text-gh-text">Commit (History)</span>
             </div>
          </div>

          <div className="flex items-center gap-2.5">
             <div className="w-5 h-5 rounded-sm bg-gh-bg border-2 border-emerald-500 border-dashed flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-emerald-500">✓</span>
             </div>
             <div className="flex items-center gap-1.5">
               <FileCheck size={14} className="text-gh-text" />
               <span className="text-xs font-semibold text-gh-text">Staged File</span>
             </div>
          </div>

          <div className="flex items-center gap-2.5">
             <div className="w-5 h-5 rounded-sm bg-gh-bg border-2 border-amber-500 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-amber-500">✎</span>
             </div>
             <div className="flex items-center gap-1.5">
               <FileCode size={14} className="text-gh-text" />
               <span className="text-xs font-semibold text-gh-text">Modified File</span>
             </div>
          </div>

          <div className="flex items-center gap-2.5">
             <div className="w-5 h-5 rounded-sm bg-gh-bg border-2 border-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle size={12} className="text-rose-500" />
             </div>
             <span className="text-xs font-semibold text-gh-text">Merge Conflict</span>
          </div>
        </div>

        {/* Column 2: Branches & Regions */}
        <div className="space-y-2.5">
           <div className="text-[10px] font-bold uppercase tracking-wider text-gh-muted">Branches & Zones</div>
           
           <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 ring-2 ring-indigo-500/30 shrink-0"></div>
              <div className="flex items-center gap-1.5">
                <GitBranch size={13} className="text-gh-text" />
                <span className="text-xs font-semibold text-gh-text">Main Branch</span>
              </div>
           </div>

           <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-sky-500 ring-2 ring-sky-500/30 shrink-0"></div>
              <div className="flex items-center gap-1.5">
                <GitBranch size={13} className="text-gh-text" />
                <span className="text-xs font-semibold text-gh-text">Feature Branch</span>
              </div>
           </div>

           <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-purple-500 ring-2 ring-purple-500/30 shrink-0"></div>
              <div className="flex items-center gap-1.5">
                <Cloud size={13} className="text-gh-text" />
                <span className="text-xs font-semibold text-gh-text">Remote / Origin</span>
              </div>
           </div>

           <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-sm bg-amber-500 ring-2 ring-amber-500/30 shrink-0"></div>
              <div className="flex items-center gap-1.5">
                <Archive size={13} className="text-gh-text" />
                <span className="text-xs font-semibold text-gh-text">Stash / Temp</span>
              </div>
           </div>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-gh-border text-xs text-gh-muted leading-relaxed font-medium">
        <p>
          <strong className="text-gh-text font-bold">Pro Tip:</strong> Click any node to trigger a pulse wave or hover for commit details and references.
        </p>
      </div>
    </div>
  );
};
