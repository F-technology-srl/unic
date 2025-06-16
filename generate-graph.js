const { createProjectGraphAsync } = require('@nx/devkit');
const fs = require('fs');
const path = require('path');

async function generateProjectGraph() {
  try {
    // Crea il grafo del progetto
    const projectGraph = await createProjectGraphAsync();

    // Salva il grafo in un file JSON
    const outputPath = path.join(__dirname, 'project-graph.json');
    fs.writeFileSync(outputPath, JSON.stringify(projectGraph, null, 2));
    // console.log('✅ Project graph salvato con successo in project-graph.json');
    process.exit(); // Termina il processo con successo
  } catch (error) {
    console.error('❌ Errore nella generazione del grafo del progetto:', error);
    process.exit(1); // Termina il processo con un errore
  }
}

generateProjectGraph();
