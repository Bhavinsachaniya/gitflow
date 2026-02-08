
export type NodeType = 'commit' | 'init' | 'merge' | 'stash' | 'ghost' | 'remote' | 'file';

export interface GitNode {
  id: string;
  x: number; // 0-100 scale
  y: number; // 0 = main, 1 = feature, -1 = remote
  label?: string;
  isHead?: boolean;
  type: NodeType;
  tags?: string[]; // e.g., ['origin/main', 'v1.0']
  status?: 'modified' | 'staged' | 'deleted' | 'conflict' | 'ignored'; // For file nodes
}

export interface GitLink {
  source: string;
  target: string;
  type?: 'solid' | 'dashed' | 'remote';
}

export interface BranchInfo {
  name: string;
  y: number;
  color: string;
  type: 'local' | 'remote';
}

export interface GitState {
  nodes: GitNode[];
  links: GitLink[];
  branches: BranchInfo[];
  headLabel?: string;
  message?: string; // Floating message on graph
}

export interface CheatSheetStep {
  id: string;
  title: string;
  command: string;
  description: string;
  details: string[]; 
  graphState: GitState;
  category: 'setup' | 'stage' | 'branch' | 'inspect' | 'tracking' | 'share' | 'rewrite' | 'temporary';
}
