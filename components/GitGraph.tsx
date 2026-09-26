import React, { useState, useEffect } from 'react';
import { scaleLinear } from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { GitState, GitNode, GitLink } from '../types';

interface GitGraphProps {
  state: GitState;
  isDark: boolean;
  bgColor: string;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: string;
  subContent?: string;
  type?: string;
}

// Visual Palette
const lightModePalette: Record<string, string> = {
  '#6366f1': '#4f46e5',
  '#22d3ee': '#0891b2',
  '#c084fc': '#9333ea',
  '#fbbf24': '#d97706',
  '#4ade80': '#16a34a',
  '#f472b6': '#db2777',
  '#fb7185': '#ef4444',
};

// Helper to estimate text width for background pills
const estimateTextWidth = (text: string, fontSize: number) => {
  return text.length * (fontSize * 0.65) + 24;
};

const GitGraph: React.FC<GitGraphProps> = ({ state, isDark, bgColor }) => {
  // --- STATE ---
  const [pulsingNodeId, setPulsingNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, content: '' });
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dimensions
  const width = 800;
  const height = 500;
  const isMobile = windowWidth < 768;

  // --- HANDLERS ---
  const handleNodeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPulsingNodeId(id);
    setTimeout(() => setPulsingNodeId(null), 900);
  };

  const resolveColor = (color: string | undefined) => {
    if (!color) return isDark ? '#FFFFFF' : '#000000';
    if (isDark) return color;
    return lightModePalette[color] || color;
  };

  const linkColor = isDark ? '#525252' : '#94a3b8';

  // --- SCALES & LAYOUT ---
  const margin = isMobile 
    ? { top: 40, right: 180, bottom: 30, left: 15 } 
    : { top: 60, right: 140, bottom: 60, left: 80 };

  const xScale = scaleLinear().domain([0, 100]).range([margin.left, width - margin.right]);
  const yScale = scaleLinear().domain([-1.5, 2.5]).range([margin.top, height - margin.bottom]);

  const generatePath = (link: GitLink) => {
    const sourceNode = state.nodes.find(n => n.id === link.source);
    const targetNode = state.nodes.find(n => n.id === link.target);
    
    if (!sourceNode || !targetNode) return null;
    
    const x1 = xScale(sourceNode.x);
    const y1 = yScale(sourceNode.y);
    const x2 = xScale(targetNode.x);
    const y2 = yScale(targetNode.y);
    
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  };

  const showTooltip = (e: React.MouseEvent, content: string, subContent?: string, type?: string) => {
      const rect = (e.currentTarget as Element).getBoundingClientRect();
      const parent = (e.currentTarget as Element).closest('div.relative.group');
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        setTooltip({
          visible: true,
          x: rect.left - parentRect.left + rect.width / 2,
          y: rect.top - parentRect.top - 12,
          content,
          subContent,
          type
        });
      }
  };

  const handleNodeEnter = (e: React.MouseEvent, node: GitNode) => {
    setHoveredNodeId(node.id);
    let sub = node.type.toUpperCase();
    if (node.status) sub = `File Status: ${node.status.toUpperCase()}`;
    else if (node.tags && node.tags.length > 0) sub = `Tag: ${node.tags.join(', ')}`;
    else if (node.isHead) sub = 'HEAD Ref (Current Position)';
    else if (node.type === 'init') sub = 'Initial Repository State';
    else if (node.type === 'merge') sub = 'Merge Commit (Combined History)';
    
    showTooltip(e, node.label || node.id, sub, node.type);
  };
  
  const handleLinkEnter = (e: React.MouseEvent, link: GitLink) => {
      const sourceNode = state.nodes.find(n => n.id === link.source);
      const targetNode = state.nodes.find(n => n.id === link.target);
      
      const sLabel = sourceNode?.label || link.source;
      const tLabel = targetNode?.label || link.target;
      const type = link.type ? link.type.charAt(0).toUpperCase() + link.type.slice(1) : 'Direct Commit Flow';
      
      showTooltip(e, `${sLabel} ➔ ${tLabel}`, type, 'link');
  };

  const handleMouseLeave = () => {
    setHoveredNodeId(null);
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="w-full h-full relative group bg-gh-bg/50 select-none">
      <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full">
          <defs>
            {/* Smooth Neon Glow Filter */}
            <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Soft Drop Shadow */}
            <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">
               <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity={isDark ? "0.4" : "0.15"}/>
            </filter>

            {/* Arrowhead Marker */}
            <marker id="arrowhead" markerWidth="7" markerHeight="5" refX="15" refY="2.5" orient="auto">
              <polygon points="0 0, 7 2.5, 0 5" fill={linkColor} />
            </marker>

            {/* Pulsing Arrowhead Marker */}
            <marker id="arrowhead-active" markerWidth="7" markerHeight="5" refX="15" refY="2.5" orient="auto">
              <polygon points="0 0, 7 2.5, 0 5" fill={resolveColor('#6366f1')} />
            </marker>
          </defs>

          {/* Background Swimlanes / Zones */}
          <g opacity={isDark ? 0.35 : 0.65}>
            {/* Remote Zone */}
            <rect x="0" y="0" width={width} height={yScale(-0.5)} fill={isDark ? "rgba(192, 132, 252, 0.04)" : "rgba(147, 51, 234, 0.05)"} />
            <g transform={`translate(${isMobile ? 12 : 30}, ${isMobile ? 24 : 38})`}>
              <circle cx="0" cy="0" r="3" fill={resolveColor('#c084fc')} opacity={0.8} />
              <text x="8" y="3" className="text-[10px] font-sans font-bold uppercase tracking-wider" fill={resolveColor('#c084fc')}>
                ☁️ Remote Zone (Origin)
              </text>
            </g>

            {/* Stash / Temp Zone */}
            <rect x="0" y={yScale(1.2)} width={width} height={height - yScale(1.2)} fill={isDark ? "rgba(251, 191, 36, 0.04)" : "rgba(217, 119, 6, 0.05)"} />
            <g transform={`translate(${isMobile ? 12 : 30}, ${height - (isMobile ? 15 : 22)})`}>
              <circle cx="0" cy="0" r="3" fill={resolveColor('#fbbf24')} opacity={0.8} />
              <text x="8" y="3" className="text-[10px] font-sans font-bold uppercase tracking-wider" fill={resolveColor('#fbbf24')}>
                📦 Stash & Local Working Area
              </text>
            </g>
          </g>

          {/* AnimatePresence for smooth entry/exit of graph elements */}
          <AnimatePresence>
              {/* Branch Guideline Tracks & Branch Badges */}
              {state.branches.map((branch) => {
                const branchColor = resolveColor(branch.color);
                const fontSize = isMobile ? 14 : 11;
                const labelWidth = estimateTextWidth(branch.name, fontSize);
                const xPos = width - margin.right + 15;
                const yPos = yScale(branch.y);
                
                return (
                  <motion.g 
                    key={branch.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Connecting Guideline Track */}
                    <line 
                      x1={margin.left} y1={yPos} x2={xPos - 5} y2={yPos} 
                      stroke={branchColor} strokeWidth={1.5} strokeDasharray="5,5" opacity={0.35}
                    />
                    
                    {/* Branch Badge Pill */}
                    <rect
                        x={xPos} 
                        y={yPos - (isMobile ? 14 : 11)} 
                        width={labelWidth + 14} 
                        height={isMobile ? 28 : 22} 
                        rx={6}
                        fill={isDark ? '#1e1e1e' : '#ffffff'} 
                        stroke={branchColor}
                        strokeWidth={1.5}
                        filter="url(#shadow)"
                    />
                    
                    {/* Fork Branch Icon Glyph inside Pill */}
                    <g transform={`translate(${xPos + 6}, ${yPos - 6}) scale(0.65)`}>
                      <circle cx="4" cy="5" r="2.5" fill="none" stroke={branchColor} strokeWidth="2" />
                      <circle cx="4" cy="15" r="2.5" fill="none" stroke={branchColor} strokeWidth="2" />
                      <circle cx="14" cy="9" r="2.5" fill="none" stroke={branchColor} strokeWidth="2" />
                      <path d="M4 7.5 L4 12.5 M4 7.5 C4 9 7 9 11.5 9" fill="none" stroke={branchColor} strokeWidth="2" />
                    </g>

                    {/* Branch Name Text */}
                    <text 
                      x={xPos + 22 + (labelWidth - 16) / 2} 
                      y={yPos} 
                      fill={branchColor} 
                      fontSize={fontSize} 
                      fontFamily="sans-serif" 
                      fontWeight="700" 
                      textAnchor="middle" 
                      alignmentBaseline="middle" 
                      dy={1}
                    >
                      {branch.name}
                    </text>
                  </motion.g>
                );
              })}

              {/* Links / Connecting Edges */}
              {state.links.map((link) => {
                const pathD = generatePath(link);
                if (!pathD) return null;
                const isHovered = hoveredNodeId === link.source || hoveredNodeId === link.target;

                return (
                  <motion.g 
                     key={`${link.source}-${link.target}`}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 0.3 }}
                     onMouseEnter={(e) => handleLinkEnter(e, link)}
                     onMouseLeave={handleMouseLeave}
                  >
                    {/* Invisible thick path for easier hovering */}
                    <path d={pathD} stroke="transparent" strokeWidth={24} fill="none" className="cursor-pointer" />
                    
                    {/* Glowing highlight when hovered */}
                    {isHovered && (
                      <path 
                        d={pathD} 
                        fill="none" 
                        stroke={resolveColor('#6366f1')} 
                        strokeWidth={6} 
                        strokeOpacity={0.4} 
                        filter="url(#glow)" 
                      />
                    )}

                    <motion.path
                      d={pathD}
                      fill="none"
                      stroke={isHovered ? resolveColor('#6366f1') : linkColor}
                      strokeWidth={isHovered ? 2.5 : 2}
                      strokeDasharray={link.type === 'dashed' ? "6,4" : "0"}
                      markerEnd={link.type !== 'dashed' ? (isHovered ? "url(#arrowhead-active)" : "url(#arrowhead)") : undefined}
                      className="pointer-events-none transition-colors duration-200"
                      animate={{ d: pathD }} 
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  </motion.g>
                );
              })}

              {/* Nodes */}
              {state.nodes.map((node) => {
                const isGhost = node.type === 'ghost';
                const isRemote = node.type === 'remote';
                const isFile = node.type === 'file';
                const isConflict = node.status === 'conflict';
                const isIgnored = node.status === 'ignored';
                const isMerge = node.type === 'merge';
                const isStash = node.type === 'stash';
                const isInit = node.type === 'init';
                
                let rawColor = node.y === 0 ? '#6366f1' : (node.y === -1 ? '#c084fc' : '#22d3ee');
                if (isStash) rawColor = '#fbbf24';
                if (isFile) {
                   if (isConflict) rawColor = '#fbbf24';
                   else if (isIgnored) rawColor = isDark ? '#525252' : '#94a3b8';
                   else rawColor = node.status === 'staged' ? '#4ade80' : (node.status === 'deleted' ? '#fb7185' : '#fbbf24');
                }
                if (isGhost) rawColor = isDark ? '#333333' : '#666666';
                const finalColor = resolveColor(rawColor);
                const isPulsing = pulsingNodeId === node.id;
                
                const nodeRadius = isRemote ? 11 : 15;
                const pulseRadius = 28;

                // Label Logic
                const labelText = node.label || '';
                const isOutsideLabel = ['remote', 'ghost', 'stash', 'file'].includes(node.type) || labelText.length > 3 || isInit;
                
                // Position offset
                let labelYOffset = 4;
                if (isOutsideLabel) {
                    labelYOffset = isFile ? 26 : nodeRadius + 18;
                }

                const labelFontSize = isOutsideLabel ? 11 : 10;
                const labelWidth = estimateTextWidth(labelText, labelFontSize);

                return (
                  <motion.g
                    layoutId={node.id}
                    key={node.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: isPulsing ? 1.25 : 1, 
                      opacity: isGhost ? 0.6 : 1,
                      x: xScale(node.x), 
                      y: yScale(node.y)
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    onClick={(e) => handleNodeClick(e, node.id)}
                    onMouseEnter={(e) => handleNodeEnter(e, node)}
                    onMouseLeave={handleMouseLeave}
                    className="cursor-pointer group/node"
                  >
                    {/* Animated Pulsing Wave Effect */}
                    {((node.isHead && !isFile) || isPulsing) && (
                      <>
                        <motion.circle 
                          r={pulseRadius} fill="none" stroke={finalColor} strokeWidth={1.5} 
                          initial={{ scale: 1, opacity: 0 }}
                          animate={{ scale: 1.6, opacity: [0, 0.4, 0] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                        />
                        <motion.circle 
                          r={pulseRadius - 6} fill="none" stroke={finalColor} strokeWidth={1} 
                          initial={{ scale: 1, opacity: 0 }}
                          animate={{ scale: 1.3, opacity: [0, 0.25, 0] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
                        />
                      </>
                    )}

                    {/* HEAD Pointer Flag */}
                    {node.isHead && !isFile && (
                      <g transform={`translate(0, ${-nodeRadius - 16})`}>
                        <rect x="-19" y="-9" width="38" height="15" rx="3.5" fill="#3b82f6" fillOpacity="0.95" stroke="#60a5fa" strokeWidth="1" filter="url(#shadow)" />
                        <text x="0" y="1.5" textAnchor="middle" alignmentBaseline="middle" fill="#ffffff" fontSize="8.5" fontWeight="bold" fontFamily="monospace">HEAD</text>
                        <polygon points="-3.5,6 3.5,6 0,10.5" fill="#3b82f6" />
                      </g>
                    )}

                    {/* Tags Badge (e.g. v1.0.0, origin/main) */}
                    {node.tags && node.tags.length > 0 && (
                      <g transform={`translate(0, ${-nodeRadius - (node.isHead ? 34 : 16)})`}>
                        <rect x="-24" y="-8" width="48" height="15" rx="3.5" fill="#f472b6" fillOpacity="0.95" stroke="#db2777" strokeWidth="1" filter="url(#shadow)" />
                        <text x="0" y="2" textAnchor="middle" alignmentBaseline="middle" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="monospace">🏷️ {node.tags[0]}</text>
                      </g>
                    )}

                    {/* Node Visual Shape & Glyphs */}
                    {isFile ? (
                        isConflict ? (
                          /* Conflict Triangle */
                          <g transform="translate(0, -2)">
                            <path d="M0 -15 L15 11 L-15 11 Z" fill={bgColor} stroke={finalColor} strokeWidth={2} strokeLinejoin="round" filter="url(#glow)" />
                            <line x1="0" y1="-5" x2="0" y2="3" stroke={finalColor} strokeWidth="2.5" strokeLinecap="round" />
                            <circle cx="0" cy="7.5" r="1.2" fill={finalColor} />
                          </g>
                        ) : (
                          /* Document Shape with Status Glyph */
                          <g transform="translate(0, 0)" filter="url(#shadow)">
                            <rect 
                              x={-12} y={-15} width={24} height={30} rx={3} 
                              fill={isIgnored ? 'transparent' : bgColor} 
                              stroke={finalColor} 
                              strokeWidth={2} 
                              strokeDasharray={isIgnored ? "4,2" : "0"}
                            />
                            {/* Document Fold Line */}
                            <path d="M4 -15 L12 -7 L4 -7 Z" fill={finalColor} opacity={0.4} />

                            {/* Staged Checkmark */}
                            {node.status === 'staged' && (
                              <path d="M-5 2 L-1 6 L6 -2" fill="none" stroke={finalColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            )}

                            {/* Modified Pencil Line */}
                            {node.status === 'modified' && (
                              <g stroke={finalColor} strokeWidth="1.8" strokeLinecap="round">
                                <line x1="-5" y1="2" x2="5" y2="2" />
                                <line x1="-5" y1="6" x2="1" y2="6" />
                              </g>
                            )}

                            {/* Deleted Minus Line */}
                            {node.status === 'deleted' && (
                              <line x1="-5" y1="2" x2="5" y2="2" stroke={finalColor} strokeWidth="2.5" strokeLinecap="round" />
                            )}
                          </g>
                        )
                    ) : isStash ? (
                        /* Stash / Box Glyph */
                        <g filter="url(#shadow)">
                          <rect x={-11} y={-11} width={22} height={22} rx={4} fill={bgColor} stroke={finalColor} strokeWidth={2} />
                          <line x1={-11} y1={-3} x2={11} y2={-3} stroke={finalColor} strokeWidth={1.5} />
                          <rect x={-4} y={-1} width={8} height={4} rx={1} fill="none" stroke={finalColor} strokeWidth="1.2" />
                        </g>
                    ) : isRemote ? (
                        /* Remote Satellite / Cloud Node */
                        <g filter="url(#shadow)">
                          <circle r={nodeRadius} fill={bgColor} stroke={finalColor} strokeWidth={2} strokeDasharray="3,2" />
                          <circle r={4} fill={finalColor} opacity={0.8} />
                        </g>
                    ) : isMerge ? (
                        /* Merge Commit with Double Interlocking Core */
                        <g filter={node.isHead ? "url(#glow)" : "url(#shadow)"}>
                          <circle r={nodeRadius} fill={bgColor} stroke={finalColor} strokeWidth={3} />
                          <circle cx="-3" cy="-3" r="2.5" fill={finalColor} />
                          <circle cx="3" cy="3" r="2.5" fill={finalColor} />
                          <path d="M-3 0 C-3 2 0 3 3 3" fill="none" stroke={finalColor} strokeWidth="1.5" />
                        </g>
                    ) : (
                        /* Standard Commit & Init Nodes */
                        <g filter={node.isHead ? "url(#glow)" : "url(#shadow)"}>
                          <circle
                            r={nodeRadius}
                            fill={bgColor}
                            stroke={finalColor}
                            strokeWidth={3}
                          />
                          {/* Inner Concentric Core Dot */}
                          <circle r={4.5} fill={finalColor} opacity={node.isHead ? 1 : 0.85} />
                        </g>
                    )}
                    
                    {/* Node Label Capsule */}
                    {labelText && (
                        <g transform={`translate(0, ${labelYOffset})`}>
                            {/* Background Pill */}
                            {isOutsideLabel && (
                                <rect
                                    x={-labelWidth / 2}
                                    y={-labelFontSize - 1}
                                    width={labelWidth}
                                    height={labelFontSize * 2}
                                    rx={4}
                                    fill={bgColor}
                                    fillOpacity={0.9}
                                    stroke={isGhost ? 'transparent' : finalColor}
                                    strokeWidth={1}
                                    strokeOpacity={0.4}
                                    filter="url(#shadow)"
                                />
                            )}
                            <text
                                textAnchor="middle"
                                alignmentBaseline="middle"
                                fill={isOutsideLabel ? (isDark ? '#f1f5f9' : '#1e293b') : (isDark ? '#ffffff' : '#000000')}
                                fontSize={labelFontSize} 
                                fontFamily={isOutsideLabel ? "sans-serif" : "monospace"} 
                                fontWeight={isOutsideLabel ? "700" : "bold"} 
                                className="pointer-events-none select-none"
                                dy={1}
                            >
                                {labelText}
                            </text>
                        </g>
                    )}
                  </motion.g>
                );
              })}
          </AnimatePresence>
        </svg>

        {/* Interactive Floating Tooltip */}
        <AnimatePresence>
          {tooltip.visible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{ left: tooltip.x, top: tooltip.y }}
              className="absolute -translate-x-1/2 -translate-y-full z-50 pointer-events-none"
            >
              <div className="bg-gh-header/95 border border-gh-border text-gh-text px-3.5 py-2.5 rounded-xl shadow-2xl text-xs whitespace-nowrap min-w-[140px] text-center backdrop-blur-md">
                <div className="font-bold text-sm text-gh-text font-sans flex items-center justify-center gap-1.5">
                   <span>{tooltip.content}</span>
                </div>
                {tooltip.subContent && (
                   <div className="text-[10px] text-gh-muted font-mono border-t border-gh-border/60 pt-1 mt-1 tracking-wide">
                     {tooltip.subContent}
                   </div>
                )}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-gh-header border-r border-b border-gh-border"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GitGraph;
