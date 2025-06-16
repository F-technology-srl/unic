// const { readCachedProjectGraph } = require('@nx/devkit');
// const projectGraphs = readCachedProjectGraph();
// const projects = Object.keys(projectGraphs.nodes);
// Error: [readCachedProjectGraph] ERROR: No cached ProjectGraph is available.
// If you are leveraging \`readCachedProjectGraph()\` directly then you will need to refactor your usage to first ensure that
// the ProjectGraph is created by calling \`await createProjectGraphAsync()\` somewhere before attempting to read the data.

const fs = require('fs');
const path = require('path');

// Leggi il grafo del progetto dal file JSON generato con comando "generate-graph"
const projectGraphPath = path.join(__dirname, 'project-graph.json');
let projects = [];

try {
  const projectGraph = JSON.parse(fs.readFileSync(projectGraphPath, 'utf-8'));
  projects = Object.keys(projectGraph.nodes);
} catch (error) {
  console.error('Errore nel leggere il grafo del progetto:', error);
}

module.exports = {
  extends: ['@commitlint/config-angular'],
  rules: {
    'subject-max-length': [1, 'always', 100],
    'header-max-length': [1, 'always', 100],
    'scope-enum': [2, 'always', [...projects, 'global']],
    'scope-empty': [1, 'never'],
    'scope-case': [2, 'always', 'lowerCase'],
    'type-enum': [
      2,
      'always',
      [
        'build',
        'ci',
        'docs',
        'feat',
        'fix',
        'hotfix',
        'perf',
        'refactor',
        'release',
        'revert',
        'style',
        'test',
        'wip',
      ],
    ],
  },
};
