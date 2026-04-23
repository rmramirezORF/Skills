const fs = require('fs');
const path = require('path');
const QARules = require('./rules/qa.rules');

/**
 * Router principal para clasificar y ejecutar workflows por tema
 */
class SkillRouter {
  constructor() {
    this.themes = this.loadThemes();
    this.workflows = this.loadWorkflows();
    this.rules = {
      'qa-hu': QARules
    };
  }

  /**
   * Carga la configuración de temas desde router.json
   */
  loadThemes() {
    try {
      const routerPath = path.join(__dirname, '..', 'skills', 'router.json');
      const routerData = fs.readFileSync(routerPath, 'utf8');
      return JSON.parse(routerData).themes;
    } catch (error) {
      console.error('Error loading themes:', error);
      return {};
    }
  }

  /**
   * Carga workflows disponibles
   */
  loadWorkflows() {
    const workflowsPath = path.join(__dirname, '..', 'workflows');
    const workflows = {};

    try {
      const workflowDirs = fs.readdirSync(workflowsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      workflowDirs.forEach(dir => {
        const workflowPath = path.join(workflowsPath, dir, 'workflow.md');
        if (fs.existsSync(workflowPath)) {
          workflows[dir] = this.parseWorkflow(workflowPath);
        }
      });
    } catch (error) {
      console.error('Error loading workflows:', error);
    }

    return workflows;
  }

  /**
   * Parsea un archivo workflow.md
   */
  parseWorkflow(workflowPath) {
    const content = fs.readFileSync(workflowPath, 'utf8');
    const lines = content.split('\n');
    const workflow = {
      name: '',
      description: '',
      steps: []
    };

    let inSteps = false;
    lines.forEach(line => {
      if (line.startsWith('name:')) {
        workflow.name = line.replace('name:', '').trim();
      } else if (line.startsWith('description:')) {
        workflow.description = line.replace('description:', '').trim();
      } else if (line.startsWith('## Steps')) {
        inSteps = true;
      } else if (inSteps && line.match(/^\d+\./)) {
        const step = line.replace(/^\d+\.\s*/, '').trim();
        workflow.steps.push(step);
      }
    });

    return workflow;
  }

  /**
   * Clasifica el input del usuario por tema usando reglas específicas
   */
  classifyTheme(userInput) {
    // Verificar cada tema con sus reglas
    for (const [theme, rules] of Object.entries(this.rules)) {
      if (rules.matches(userInput)) {
        const confidence = rules.confidence(userInput);
        if (confidence > 0.5) { // Umbral de confianza
          return theme;
        }
      }
    }

    // Fallback: lógica simple
    const input = userInput.toLowerCase();
    if (input.includes('historia') || input.includes('hu') || input.includes('qa')) {
      return 'qa-hu';
    }

    return 'default';
  }

  /**
   * Extrae información contextual del input usando reglas del tema
   */
  extractContext(theme, userInput) {
    const rules = this.rules[theme];
    if (rules && rules.extractInfo) {
      return rules.extractInfo(userInput);
    }
    return { type: theme, confidence: 0 };
  }

  /**
   * Ejecuta el workflow completo para un tema
   */
  async executeWorkflow(theme, userInput) {
    const themeConfig = this.themes[theme];
    if (!themeConfig) {
      throw new Error(`Tema no encontrado: ${theme}`);
    }

    const workflowName = themeConfig.workflow.replace('../workflows/', '');
    const workflow = this.workflows[workflowName];
    if (!workflow) {
      throw new Error(`Workflow no encontrado: ${workflowName}`);
    }

    console.log(`Ejecutando workflow: ${workflow.name}`);
    console.log(`Descripción: ${workflow.description}`);

    const results = {};
    let currentInput = { hu: userInput }; // Input inicial

    // Ejecutar cada paso del workflow
    for (const step of workflow.steps) {
      const skillName = this.extractSkillName(step);
      if (skillName) {
        console.log(`Ejecutando skill: ${skillName}`);
        try {
          const skillResult = await this.executeSkill(skillName, currentInput);
          results[skillName] = skillResult;
          currentInput = { ...currentInput, [skillName]: skillResult }; // Pasar resultado al siguiente
        } catch (error) {
          console.error(`Error en skill ${skillName}:`, error);
          results[skillName] = { error: error.message };
        }
      }
    }

    // Consolidar resultados
    return this.consolidateResults(results);
  }

  /**
   * Extrae el nombre de la skill de un paso del workflow
   */
  extractSkillName(step) {
    // Ejemplo: "Execute hu-parser" -> "hu-parser"
    const match = step.match(/Execute\s+([^\s(]+)/);
    return match ? match[1] : null;
  }

  /**
   * Ejecuta una skill individual
   */
  async executeSkill(skillName, input) {
    try {
      // Importar dinámicamente la skill
      const skillPath = path.join(__dirname, '..', 'skills', skillName, 'index.js');
      const skillModule = require(skillPath);

      if (typeof skillModule.execute === 'function') {
        return await skillModule.execute(input);
      } else {
        throw new Error(`Skill ${skillName} no tiene método execute`);
      }
    } catch (error) {
      throw new Error(`Error cargando skill ${skillName}: ${error.message}`);
    }
  }

  /**
   * Consolida los resultados de todas las skills
   */
  consolidateResults(results) {
    // Lógica de consolidación IA
    // Por ahora, combinar todos los resultados en un JSON
    const consolidated = {
      status: 'completed',
      timestamp: new Date().toISOString(),
      results: results,
      summary: this.generateSummary(results)
    };

    return consolidated;
  }

  /**
   * Genera un resumen de los resultados
   */
  generateSummary(results) {
    const summary = {
      coverage: results['coverage-analyzer']?.coverage || 0,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Recopilar de diferentes skills
    if (results['qa-validator']) {
      summary.errors.push(...(results['qa-validator'].errors || []));
      summary.warnings.push(...(results['qa-validator'].warnings || []));
    }

    if (results['suggestion-engine']) {
      summary.suggestions.push(...(results['suggestion-engine'].suggestions || []));
    }

    return summary;
  }

  /**
   * Método principal para procesar una consulta del usuario
   */
  async processUserQuery(userInput) {
    try {
      const theme = this.classifyTheme(userInput);
      console.log(`Tema clasificado: ${theme}`);

      const context = this.extractContext(theme, userInput);
      console.log(`Contexto extraído:`, context);

      const result = await this.executeWorkflow(theme, userInput);
      return {
        ...result,
        theme,
        context
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Exportar para uso
module.exports = SkillRouter;

// Ejemplo de uso si se ejecuta directamente
if (require.main === module) {
  const router = new SkillRouter();

  // Ejemplo de input
  const exampleInput = "Como usuario quiero poder registrar un nuevo usuario en el sistema";

  router.processUserQuery(exampleInput)
    .then(result => {
      console.log('Resultado final:', JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error('Error:', error);
    });
}