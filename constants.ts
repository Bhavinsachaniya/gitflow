
import { CheatSheetStep } from './types';

// Visual Palette - Consistent with Dark/Light themes
const C = {
  MAIN: '#6366f1',    // Indigo (Main)
  FEATURE: '#22d3ee', // Cyan (Feature)
  REMOTE: '#c084fc',  // Purple (Remote)
  STASH: '#fbbf24',   // Amber
  FILE_MOD: '#fb7185', // Rose (Modified)
  FILE_STAGED: '#4ade80', // Green (Staged)
  TAG: '#f472b6',     // Pink (Tag)
};

export const steps: CheatSheetStep[] = [
  // --- MODULE 1: GETTING STARTED ---
  {
    id: 'config',
    title: '1. Identity Setup',
    category: 'setup',
    command: 'git config --global user.name "Your Name"',
    description: 'Before you start, tell Git who you are. This name matches your changes to you.',
    details: [
      'Sets your default identity',
      'Saved in your global .gitconfig',
      'Required to create commits'
    ],
    graphState: {
      nodes: [
        { id: 'user', x: 50, y: 0, type: 'ghost', label: 'Identity Set' }
      ],
      links: [],
      branches: [],
      message: "User Configured"
    }
  },
  {
    id: 'init',
    title: '2. Start a Repository',
    category: 'setup',
    command: 'git init',
    description: 'Turn your current folder into a Git repository to start tracking history.',
    details: [
      'Creates a hidden .git/ folder',
      'Initializes the staging area',
      'Sets up the default branch (main)'
    ],
    graphState: {
      nodes: [
        { id: 'start', x: 10, y: 0, type: 'init', label: 'Start', isHead: true }
      ],
      links: [],
      branches: [{ name: 'main', y: 0, color: C.MAIN, type: 'local' }],
      headLabel: 'main',
      message: "Repo Initialized"
    }
  },

  // --- MODULE 2: BASIC WORKFLOW ---
  {
    id: 'status',
    title: '3. Check Status',
    category: 'stage',
    command: 'git status',
    description: 'The most useful command. It tells you what files are changed, staged, or untracked.',
    details: [
      'See modified files (Red)',
      'See staged files (Green)',
      'See current branch info'
    ],
    graphState: {
      nodes: [
        { id: 'c1', x: 10, y: 0, type: 'commit', label: 'Init' },
        { id: 'f1', x: 30, y: 0, type: 'file', label: 'script.js', status: 'modified' }
      ],
      links: [{ source: 'c1', target: 'f1', type: 'dashed' }],
      branches: [{ name: 'main', y: 0, color: C.MAIN, type: 'local' }],
      headLabel: 'main',
      message: "1 File Modified"
    }
  },
  {
    id: 'diff',
    title: '4. Inspect Changes',
    category: 'inspect',
    command: 'git diff',
    description: 'See the exact lines of code that have changed between your working file and the last commit.',
    details: [
      'Shows line-by-line additions (+)',
      'Shows line-by-line deletions (-)',
      'Review before staging'
    ],
    graphState: {
      nodes: [
        { id: 'c1', x: 10, y: 0, type: 'commit', label: 'Init' },
        { id: 'f1', x: 30, y: 0, type: 'file', label: 'script.js', status: 'modified' },
        { id: 'view', x: 30, y: 1, type: 'ghost', label: 'Diff View' }
      ],
      links: [
        { source: 'c1', target: 'f1', type: 'dashed' },
        { source: 'f1', target: 'view', type: 'dashed' }
      ],
      branches: [{ name: 'main', y: 0, color: C.MAIN, type: 'local' }],
      headLabel: 'main',
      message: "Comparing Lines"
    }
  },
  {
    id: 'add',
    title: '5. Stage Changes',
    category: 'stage',
    command: 'git add script.js',
    description: 'Move changes from your working directory to the "Staging Area" to prepare for a commit.',
    details: [
      'Prepares file for snapshot',
      'Use "git add ." for all files',
      'Moves from Red -> Green in status'
    ],
    graphState: {
      nodes: [
        { id: 'c1', x: 10, y: 0, type: 'commit', label: 'Init' },
        { id: 'f1', x: 30, y: 0, type: 'file', label: 'script.js', status: 'staged' }
      ],
      links: [{ source: 'c1', target: 'f1', type: 'dashed' }],
      branches: [{ name: 'main', y: 0, color: C.MAIN, type: 'local' }],
      headLabel: 'main',
      message: "Ready to Commit"
    }
  },
  {
    id: 'commit',
    title: '6. Commit Snapshot',
    category: 'stage',
    command: 'git commit -m "Add script"',
    description: 'Permanently save the files in the Staging Area as a new history snapshot.',
    details: [
      'Creates a new commit node',
      'Moves HEAD pointer forward',
      'Requires a descriptive message'
    ],
    graphState: {
      nodes: [
        { id: 'c1', x: 10, y: 0, type: 'commit', label: 'Init' },
        { id: 'c2', x: 35, y: 0, type: 'commit', label: 'C2', isHead: true }
      ],
      links: [{ source: 'c1', target: 'c2' }],
      branches: [{ name: 'main', y: 0, color: C.MAIN, type: 'local' }],
      headLabel: 'main',
      message: "Saved to History"
    }
  },

  // --- MODULE 3: BRANCHING ---
  {
    id: 'branch-create',
    title: '7. Create Branch',
    category: 'branch',
    command: 'git branch feature-login',
    description: 'Create a safe parallel timeline for new code without affecting the main codebase.',
    details: [
      'Creates a new pointer',
      'Points to current commit',
      'Does NOT switch you to it yet'
    ],
    graphState: {
      nodes: [
        { id: 'c1', x: 10, y: 0, type: 'commit', label: 'C1' },
        { id: 'c2', x: 35, y: 0, type: 'commit', label: 'C2', isHead: true }
      ],
      links: [{ source: 'c1', target: 'c2' }],
      branches: [
        { name: 'main', y: 0, color: C.MAIN, type: 'local' },
        { name: 'feature-login', y: 1, color: C.FEATURE, type: 'local' }
      ],
      headLabel: 'main',
      message: "New Pointer Created"
    }
  },
  {
    id: 'checkout',
    title: '8. Switch Branch',
    category: 'branch',
    command: 'git checkout feature-login',
    description: 'Switch your active directory to the new branch to start working there.',
    details: [
      'Updates Working Directory',
      'Moves HEAD to new branch',
      'New commits go here now'
    ],
    graphState: {
      nodes: [
        { id: 'c1', x: 10, y: 0, type: 'commit', label: 'C1' },
        { id: 'c2', x: 35, y: 0, type: 'commit', label: 'C2', isHead: true }
      ],
      links: [{ source: 'c1', target: 'c2' }],
      branches: [
        { name: 'main', y: 0, color: C.MAIN, type: 'local' },
        { name: 'feature-login', y: 1, color: C.FEATURE, type: 'local' }
      ],
      headLabel: 'feature-login',
      message: "Switched Context"
    }
  },
  {
    id: 'commit-branch',
    title: '9. Work on Feature',
    category: 'branch',
    command: 'git commit -m "Login logic"',
    description: 'Make a commit on the feature branch. Notice how "main" stays behind.',
    details: [
      'Feature branch advances',
      'Main remains safe',
      'Histories diverge'
    ],
    graphState: {
      nodes: [
        { id: 'c1', x: 10, y: 0, type: 'commit', label: 'C1' },
        { id: 'c2', x: 35, y: 0, type: 'commit', label: 'C2' },
        { id: 'c3', x: 60, y: 1, type: 'commit', label: 'C3', isHead: true }
      ],
      links: [
        { source: 'c1', target: 'c2' },
        { source: 'c2', target: 'c3' }
      ],
      branches: [
        { name: 'main', y: 0, color: C.MAIN, type: 'local' },
        { name: 'feature-login', y: 1, color: C.FEATURE, type: 'local' }
      ],
      headLabel: 'feature-login',
      message: "Diverged History"
    }
  },

  // --- MODULE 4: MERGING ---
  {
    id: 'merge',
    title: '10. Merge Feature',
    category: 'branch',
    command: 'git merge feature-login',
    description: 'Combine the feature history back into main. (Run this while on main!).',
    details: [
      'Joins two histories',
      'Creates a "Merge Commit"',
      'Brings in changes from feature'
    ],
    graphState: {
      nodes: [
        { id: 'c1', x: 10, y: 0, type: 'commit', label: 'C1' },
        { id: 'c2', x: 35, y: 0, type: 'commit', label: 'C2' },
        { id: 'c3', x: 35, y: 1, type: 'commit', label: 'C3' },
        { id: 'm1', x: 65, y: 0, type: 'merge', label: 'Merge', isHead: true }
      ],
      links: [
        { source: 'c1', target: 'c2' },
        { source: 'c2', target: 'c3' },
        { source: 'c2', target: 'm1' },
        { source: 'c3', target: 'm1' }
      ],
      branches: [
        { name: 'main', y: 0, color: C.MAIN, type: 'local' },
        { name: 'feature', y: 1, color: C.FEATURE, type: 'local' }
      ],
      headLabel: 'main',
      message: "Feature Integrated"
    }
  },
  {
    id: 'merge-conflict',
    title: '11. Resolve Conflicts',
    category: 'branch',
    command: 'git merge feature-conflict',
    description: 'Scenario: Same file changed in both branches. Git pauses and asks you to fix it manually.',
    details: [
      'Git pauses merge',
      'File marked with <<<< >>>>',
      'Fix manually, then Add + Commit'
    ],
    graphState: {
      nodes: [
        { id: 'c1', x: 10, y: 0, type: 'commit', label: 'Base' },
        { id: 'c2', x: 35, y: 0, type: 'commit', label: 'Main Tip', isHead: true },
        { id: 'c3', x: 35, y: 1, type: 'commit', label: 'Feat Tip' },
        { id: 'f_con', x: 60, y: 0.5, type: 'file', label: 'conflict.txt', status: 'conflict' }
      ],
      links: [
        { source: 'c1', target: 'c2' },
        { source: 'c1', target: 'c3' },
        { source: 'c2', target: 'f_con', type: 'dashed' },
        { source: 'c3', target: 'f_con', type: 'dashed' }
      ],
      branches: [
        { name: 'main', y: 0, color: C.MAIN, type: 'local' },
        { name: 'feature', y: 1, color: C.FEATURE, type: 'local' }
      ],
      headLabel: 'main',
      message: "Merge Paused!"
    }
  },

  // --- MODULE 5: UNDOING & TEMP ---
  {
    id: 'reset-soft',
    title: '12. Soft Reset',
    category: 'rewrite',
    command: 'git reset --soft HEAD~1',
    description: 'Undo the last commit, but keep the changes in your staging area to edit them.',
    details: [
      'Head moves back 1 step',
      'Files stay staged (Green)',
      'Safe for fixing typos'
    ],
    graphState: {
      nodes: [
        { id: 'c1', x: 10, y: 0, type: 'commit', label: 'C1', isHead: true },
        { id: 'c2', x: 35, y: 0, type: 'ghost', label: 'Undone' },
        { id: 'f1', x: 35, y: 1, type: 'file', label: 'Kept', status: 'staged' }
      ],
      links: [{ source: 'c1', target: 'c2', type: 'dashed' }],
      branches: [{ name: 'main', y: 0, color: C.MAIN, type: 'local' }],
      headLabel: 'main',
      message: "Back to Staged"
    }
  },
  {
    id: 'reset-hard',
    title: '13. Hard Reset',
    category: 'rewrite',
    command: 'git reset --hard HEAD~1',
    description: 'Dangerous! Completely destroy the last commit and all changes in files.',
    details: [
      'Head moves back',
      'Changes are DELETED',
      'Use with caution'
    ],
    graphState: {
      nodes: [
        { id: 'c1', x: 10, y: 0, type: 'commit', label: 'C1', isHead: true },
        { id: 'c2', x: 35, y: 0, type: 'ghost', label: 'Deleted' }
      ],
      links: [{ source: 'c1', target: 'c2', type: 'dashed' }],
      branches: [{ name: 'main', y: 0, color: C.MAIN, type: 'local' }],
      headLabel: 'main',
      message: "History Erased"
    }
  },
  {
    id: 'stash-list',
    title: '14. Stash Changes',
    category: 'temporary',
    command: 'git stash list',
    description: 'Temporarily shelve (hide) your dirty work so you can switch branches cleanly. View the list of saved states.',
    details: [
      'Cleans working directory',
      'Saves changes in a stack',
      'Use "git stash pop" to restore'
    ],
    graphState: {
      nodes: [
        { id: 'c1', x: 10, y: 0, type: 'commit', label: 'Head', isHead: true },
        { id: 's1', x: 10, y: 1.5, type: 'stash', label: 'stash@{0}' },
        { id: 's2', x: 30, y: 1.5, type: 'stash', label: 'stash@{1}' }
      ],
      links: [
        { source: 'c1', target: 's1', type: 'dashed' },
        { source: 's1', target: 's2', type: 'dashed' }
      ],
      branches: [{ name: 'main', y: 0, color: C.MAIN, type: 'local' }],
      headLabel: 'main',
      message: "Work Shelved"
    }
  },

  // --- MODULE 6: REMOTE & SHARING ---
  {
    id: 'remote-add',
    title: '15. Add Remote',
    category: 'setup',
    command: 'git remote add origin https://...',
    description: 'Link your existing local repository to an empty repository on a remote server (like GitHub).',
    details: [
      'Configures "origin" alias',
      'Does not upload yet',
      'Prepares for push'
    ],
    graphState: {
      nodes: [
        { id: 'c1', x: 10, y: 0, type: 'commit', label: 'Local', isHead: true },
        { id: 'r1', x: 60, y: -1, type: 'remote', label: 'Origin (Empty)' }
      ],
      links: [{ source: 'c1', target: 'r1', type: 'dashed' }],
      branches: [{ name: 'main', y: 0, color: C.MAIN, type: 'local' }],
      headLabel: 'main',
      message: "Target Set"
    }
  },
  {
    id: 'clone',
    title: '16. Clone Remote',
    category: 'share',
    command: 'git clone https://github.com/...',
    description: 'Download an existing repository from the internet (GitHub/GitLab) to your computer.',
    details: [
      'Downloads entire history',
      'Sets up "origin" remote',
      'Checks out main branch'
    ],
    graphState: {
      nodes: [
        { id: 'r1', x: 10, y: -1, type: 'remote', label: 'Origin', tags: ['HEAD'] },
        { id: 'c1', x: 10, y: 0, type: 'commit', label: 'Local', isHead: true }
      ],
      links: [{ source: 'r1', target: 'c1', type: 'dashed' }],
      branches: [
        { name: 'origin', y: -1, color: C.REMOTE, type: 'remote' },
        { name: 'main', y: 0, color: C.MAIN, type: 'local' }
      ],
      message: "Downloaded Project"
    }
  },
  {
    id: 'push',
    title: '17. Push Changes',
    category: 'share',
    command: 'git push origin main',
    description: 'Upload your local commits to the remote server to share with others.',
    details: [
      'Sends new commits',
      'Updates remote reference',
      'Publish your work'
    ],
    graphState: {
      nodes: [
        { id: 'c1', x: 10, y: 0, type: 'commit', label: 'C1' },
        { id: 'c2', x: 35, y: 0, type: 'commit', label: 'C2', isHead: true },
        { id: 'r_c2', x: 35, y: -1, type: 'remote', label: 'Remote', tags: ['origin'] }
      ],
      links: [
        { source: 'c1', target: 'c2' },
        { source: 'c2', target: 'r_c2', type: 'dashed' }
      ],
      branches: [
        { name: 'main', y: 0, color: C.MAIN, type: 'local' },
        { name: 'origin', y: -1, color: C.REMOTE, type: 'remote' }
      ],
      message: "Synced to Cloud"
    }
  },
  {
    id: 'tag',
    title: '18. Tag Version',
    category: 'share',
    command: 'git tag v1.0.0',
    description: 'Attach a permanent version number to a specific commit. Useful for releases.',
    details: [
      'Creates a static reference',
      'Does not move like a branch',
      'Push with "git push --tags"'
    ],
    graphState: {
      nodes: [
        { id: 'c1', x: 10, y: 0, type: 'commit', label: 'C1' },
        { id: 'c2', x: 35, y: 0, type: 'commit', label: 'C2', isHead: true, tags: ['v1.0.0'] }
      ],
      links: [{ source: 'c1', target: 'c2' }],
      branches: [{ name: 'main', y: 0, color: C.MAIN, type: 'local' }],
      headLabel: 'main',
      message: "Release Marked"
    }
  }
];
