
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
  return text.length * (fontSize * 0.65) + 16;
};

const GitGraph: React.FC<GitGraphProps> = ({ state, isDark, bgColor }) => {
  // --- STATE ---
  const [pulsingNodeId, setPulsingNodeId] = useState<string | null>(null);
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
    setTimeout(() => setPulsingNodeId(null), 800);
  };

  const resolveColor = (color: string | undefined) => {
    if (!color) return isDark ? '#FFFFFF' : '#000000';
    if (isDark) return color;
    return lightModePalette[color] || color;
  };

  const linkColor = isDark ? '#525252' : '#94a3b8';

  // --- SCALES & LAYOUT ---
  // Increased right margin on mobile (180) to ensure branch labels fit inside the 800px viewBox
  const margin = isMobile 
    ? { top: 40, right: 180, bottom: 30, left: 10 } 
    : { top: 60, right: 120, bottom: 60, left: 80 };

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

  const showTooltip = (e: React.MouseEvent, content: string, subContent?: string) => {
      const rect = (e.currentTarget as Element).getBoundingClientRect();
      const parent = (e.currentTarget as Element).closest('div.relative.group');
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        setTooltip({
          visible: true,
          x: rect.left - parentRect.left + rect.width / 2,
          y: rect.top - parentRect.top - 10,
          content,
          subContent
        });
      }
  };

  const handleNodeEnter = (e: React.MouseEvent, node: GitNode) => {
    let sub = node.type.toUpperCase();
    if (node.status) sub = `Status: ${node.status.toUpperCase()}`;
    else if (node.tags && node.tags.length > 0) sub = `Tags: ${node.tags.join(', ')}`;
    else if (node.isHead) sub = 'HEAD Ref';
    
    showTooltip(e, node.label || node.id, sub);
  };
  
  const handleLinkEnter = (e: React.MouseEvent, link: GitLink) => {
      const sourceNode = state.nodes.find(n => n.id === link.source);
      const targetNode = state.nodes.find(n => n.id === link.target);
      
      const sLabel = sourceNode?.label || link.source;
      const tLabel = targetNode?.label || link.target;
      const type = link.type ? link.type.charAt(0).toUpperCase() + link.type.slice(1) : 'Solid';
      
      showTooltip(e, `${sLabel} ➔ ${tLabel}`, `${type} Link`);
  };

  const handleMouseLeave = () => setTooltip(prev => ({ ...prev, visible: false }));

  return (
    <div className="w-full h-full relative group bg-gh-bg/50">
      <div className="w-full h-full flex items-center justify-center select-none overflow-hidden relative">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">
               <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.2"/>
            </filter>
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="14" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill={linkColor} />
            </marker>
          </defs>

          {/* Background Grid */}
          <g opacity={isDark ? 0.3 : 0.6}>
            <rect x="0" y="0" width={width} height={yScale(-0.5)} fill={isDark ? "rgba(192, 132, 252, 0.03)" : "rgba(147, 51, 234, 0.04)"} />
            <text x={isMobile ? 10 : 30} y={isMobile ? 25 : 40} className="text-[9px] sm:text-[10px] font-sans font-semibold uppercase tracking-widest opacity-60" fill={resolveColor('#c084fc')}>Remote Zone</text>
            <rect x="0" y={yScale(1.2)} width={width} height={height - yScale(1.2)} fill={isDark ? "rgba(251, 191, 36, 0.03)" : "rgba(217, 119, 6, 0.04)"} />
            <text x={isMobile ? 10 : 30} y={height - (isMobile ? 15 : 20)} className="text-[9px] sm:text-[10px] font-sans font-semibold uppercase tracking-widest opacity-60" fill={resolveColor('#fbbf24')}>Stash / Temp</text>
          </g>

          {/* AnimatePresence for smooth entry/exit of graph elements */}
          <AnimatePresence>
              {/* Links */}
              {state.links.map((link) => {
                const pathD = generatePath(link);
                if (!pathD) return null;

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
                    <path d={pathD} stroke="transparent" strokeWidth={20} fill="none" className="cursor-pointer" />
                    <motion.path
                      d={pathD}
                      fill="none"
                      stroke={linkColor}
                      strokeWidth={2}
                      strokeDasharray={link.type === 'dashed' ? "6,4" : "0"}
                      markerEnd={link.type !== 'dashed' ? "url(#arrowhead)" : undefined}
                      className="pointer-events-none"
                      animate={{ d: pathD }} 
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  </motion.g>
                );
              })}

              {/* Branches (Badges) */}
              {state.branches.map((branch) => {
                const branchColor = resolveColor(branch.color);
                const fontSize = isMobile ? 16 : 11; // Larger font for mobile readability
                const labelWidth = estimateTextWidth(branch.name, fontSize);
                const xPos = width - margin.right + 15;
                
                return (
                  <motion.g 
                    key={branch.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Connecting Line */}
                    <line 
                      x1={margin.left} y1={yScale(branch.y)} x2={xPos - 5} y2={yScale(branch.y)} 
                      stroke={branchColor} strokeWidth={1} strokeDasharray="4,4" opacity={0.4}
                    />
                    
                    {/* Badge Background */}
                    <rect
                        x={xPos} 
                        y={yScale(branch.y) - (isMobile ? 14 : 10)} 
                        width={labelWidth} 
                        height={isMobile ? 28 : 20} 
                        rx={4}
                        fill={isDark ? '#1e1e1e' : '#ffffff'} 
                        stroke={branchColor}
                        strokeWidth={1.5}
                        className="shadow-sm"
                    />
                    {/* Branch Name */}
                    <text 
                      x={xPos + labelWidth / 2} 
                      y={yScale(branch.y)} 
                      fill={branchColor} 
                      fontSize={fontSize} 
                      fontFamily="sans-serif" 
                      fontWeight="600" 
                      textAnchor="middle" 
                      alignmentBaseline="middle" 
                      dy={1}
                    >
                      {branch.name}
                    </text>
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
                
                let rawColor = node.y === 0 ? '#6366f1' : (node.y === -1 ? '#c084fc' : '#22d3ee');
                if (node.type === 'stash') rawColor = '#fbbf24';
                if (isFile) {
                   if (isConflict) rawColor = '#fbbf24';
                   else if (isIgnored) rawColor = isDark ? '#525252' : '#94a3b8';
                   else rawColor = node.status === 'staged' ? '#4ade80' : (node.status === 'deleted' ? '#fb7185' : '#fbbf24');
                }
                if (isGhost) rawColor = isDark ? '#333333' : '#666666';
                const finalColor = resolveColor(rawColor);
                const isPulsing = pulsingNodeId === node.id;
                
                const nodeRadius = isRemote ? 10 : 14;
                const pulseRadius = 26;

                // Label Logic
                const labelText = node.label || '';
                // Show label outside if it's a special type or long text (>3 chars)
                const isOutsideLabel = ['remote', 'ghost', 'stash', 'file'].includes(node.type) || labelText.length > 3;
                
                // Position offset
                let labelYOffset = 4; // Default center
                if (isOutsideLabel) {
                    labelYOffset = isFile ? 26 : nodeRadius + 16;
                }

                const labelFontSize = isOutsideLabel ? 11 : 10;
                const labelWidth = estimateTextWidth(labelText, labelFontSize);

                return (
                  <motion.g
                    layoutId={node.id}
                    key={node.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: isPulsing ? 1.3 : 1, 
                      opacity: isGhost ? 0.6 : 1,
                      x: xScale(node.x), 
                      y: yScale(node.y)
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 250, damping: 25 }}
                    onClick={(e) => handleNodeClick(e, node.id)}
                    onMouseEnter={(e) => handleNodeEnter(e, node)}
                    onMouseLeave={handleMouseLeave}
                    className="cursor-pointer"
                  >
                    {/* Pulsing Effect */}
                    {(node.isHead && !isFile) || isPulsing ? (
                      <motion.circle 
                        r={pulseRadius} fill="none" stroke={finalColor} strokeWidth={1.5} 
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: [0, 0.3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                      />
                    ) : null}

                    {/* Node Shape */}
                    {isFile ? (
                        isConflict ? (
                          <g transform="translate(-14, -14) scale(1.1)">
                            <path d="M14 2L28 26H0L14 2Z" fill={bgColor} stroke={finalColor} strokeWidth={2} strokeLinejoin="round" />
                            <text x="14" y="20" textAnchor="middle" fill={finalColor} fontSize="14" fontWeight="bold">!</text>
                          </g>
                        ) : (
                          <rect 
                            x={-12} y={-15} width={24} height={30} rx={3} 
                            fill={isIgnored ? 'transparent' : bgColor} 
                            stroke={finalColor} 
                            strokeWidth={2} 
                            strokeDasharray={isIgnored ? "4,2" : "0"}
                          />
                        )
                    ) : (
                        <circle
                          r={nodeRadius}
                          fill={bgColor}
                          stroke={finalColor}
                          strokeWidth={isRemote ? 2 : 3}
                          filter={node.isHead ? (isDark ? "url(#glow)" : "url(#shadow)") : "url(#shadow)"}
                        />
                    )}
                    
                    {/* Node Label */}
                    {labelText && (
                        <g transform={`translate(0, ${labelYOffset})`}>
                            {/* Background Pill for Outside Labels */}
                            {isOutsideLabel && (
                                <rect
                                    x={-labelWidth / 2}
                                    y={-labelFontSize}
                                    width={labelWidth}
                                    height={labelFontSize * 1.8}
                                    rx={4}
                                    fill={bgColor}
                                    fillOpacity={0.85}
                                    stroke={isGhost ? 'transparent' : finalColor}
                                    strokeWidth={1}
                                    strokeOpacity={0.3}
                                />
                            )}
                            <text
                                textAnchor="middle"
                                alignmentBaseline="middle"
                                fill={isOutsideLabel ? (isDark ? '#e5e5e5' : '#374151') : (isDark ? '#ffffff' : '#000000')}
                                fontSize={labelFontSize} 
                                fontFamily={isOutsideLabel ? "sans-serif" : "monospace"} 
                                fontWeight={isOutsideLabel ? "600" : "bold"} 
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

        {/* Floating Tooltip */}
        <AnimatePresence>
          {tooltip.visible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ left: tooltip.x, top: tooltip.y }}
              className="absolute -translate-x-1/2 -translate-y-full z-50 pointer-events-none"
            >
              <div className="bg-gh-header border border-gh-border text-gh-text px-3 py-2 rounded-md shadow-xl text-xs whitespace-nowrap min-w-[120px] text-center backdrop-blur-md bg-opacity-95">
                <div className="font-semibold mb-1 text-sm text-gh-text font-sans">{tooltip.content}</div>
                {tooltip.subContent && (
                   <div className="text-[10px] text-gh-muted font-mono border-t border-gh-border pt-1 mt-1 uppercase tracking-wide">{tooltip.subContent}</div>
                )}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rotate-45 bg-gh-header border-r border-b border-gh-border"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GitGraph;
