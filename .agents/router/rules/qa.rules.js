/**
 * Reglas para clasificar consultas relacionadas con QA de Historias de Usuario
 */

const QARules = {
  // Palabras clave que indican tema QA
  keywords: [
    'historia', 'hu', 'usuario', 'qa', 'prueba', 'validar', 'verificar',
    'cobertura', 'test', 'aceptación', 'criterio', 'requerimiento',
    'funcionalidad', 'especificación', 'validación', 'análisis'
  ],

  // Patrones de frases que indican QA
  patterns: [
    /como\s+usuario\s+quiero/i,
    /como\s+\w+\s+quiero/i,
    /debo\s+poder/i,
    /necesito\s+\w+/i,
    /el\s+sistema\s+debe/i,
    /validar\s+que/i,
    /verificar\s+que/i,
    /probar\s+que/i
  ],

  // Contextos que sugieren QA
  contexts: [
    'desarrollo', 'testing', 'pruebas', 'calidad', 'aceptación',
    'especificaciones', 'requisitos', 'funcionales'
  ],

  /**
   * Evalúa si un input pertenece al tema QA
   */
  matches(input) {
    const lowerInput = input.toLowerCase();

    // Verificar keywords
    const hasKeywords = this.keywords.some(keyword =>
      lowerInput.includes(keyword)
    );

    // Verificar patterns
    const hasPatterns = this.patterns.some(pattern =>
      pattern.test(input)
    );

    // Verificar contextos
    const hasContexts = this.contexts.some(context =>
      lowerInput.includes(context)
    );

    // Si tiene keywords O patterns, es QA
    // Si tiene contexts adicionales, aumenta la confianza
    return hasKeywords || hasPatterns || (hasContexts && (hasKeywords || hasPatterns));
  },

  /**
   * Calcula el nivel de confianza (0-1) de que sea QA
   */
  confidence(input) {
    let score = 0;
    const lowerInput = input.toLowerCase();

    // Keywords encontrados
    const keywordMatches = this.keywords.filter(keyword =>
      lowerInput.includes(keyword)
    ).length;
    score += keywordMatches * 0.3;

    // Patterns encontrados
    const patternMatches = this.patterns.filter(pattern =>
      pattern.test(input)
    ).length;
    score += patternMatches * 0.4;

    // Contexts encontrados
    const contextMatches = this.contexts.filter(context =>
      lowerInput.includes(context)
    ).length;
    score += contextMatches * 0.2;

    // Estructura típica de HU
    if (/como\s+\w+\s+quiero\s+.+para/i.test(input)) {
      score += 0.3;
    }

    return Math.min(score, 1.0);
  },

  /**
   * Extrae información relevante del input para QA
   */
  extractInfo(input) {
    const info = {
      type: 'qa-hu',
      actor: null,
      action: null,
      outcome: null,
      confidence: this.confidence(input)
    };

    // Extraer actor (quién)
    const actorMatch = input.match(/como\s+([^\s,]+)/i);
    if (actorMatch) {
      info.actor = actorMatch[1];
    }

    // Extraer acción (qué quiere hacer)
    const actionMatch = input.match(/quiero\s+(.+?)(?:\s+para|$)/i);
    if (actionMatch) {
      info.action = actionMatch[1].trim();
    }

    // Extraer outcome (por qué)
    const outcomeMatch = input.match(/para\s+(.+)/i);
    if (outcomeMatch) {
      info.outcome = outcomeMatch[1].trim();
    }

    return info;
  }
};

module.exports = QARules;