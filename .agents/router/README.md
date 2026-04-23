# Router de Skills por Tema

Este router clasifica las consultas del usuario por tema y ejecuta el workflow correspondiente.

## Arquitectura

```
Usuario
  ↓
Router (clasifica por tema)
  ↓
Workflow QA (para tema qa-hu)
  ↓
Skill 1 → Skill 2 → Skill 3 → Skill 4
  ↓
Consolidación IA
  ↓
Respuesta final
```

## Cómo funciona

1. **Clasificación**: El router analiza el input del usuario usando reglas específicas por tema.
2. **Workflow**: Selecciona el workflow apropiado (ej: qa-full para QA de HU).
3. **Ejecución**: Ejecuta las skills en secuencia, pasando resultados entre ellas.
4. **Consolidación**: Combina todos los resultados en una respuesta coherente.

## Temas soportados

- `qa-hu`: QA para Historias de Usuario
  - Reglas en `rules/qa.rules.js`
  - Workflow: `../workflows/qa-full`

## Uso

```javascript
const SkillRouter = require('./router');

const router = new SkillRouter();

// Procesar una consulta
const result = await router.processUserQuery(
  "Como usuario quiero poder registrar un nuevo usuario en el sistema"
);

console.log(result);
```

## Estructura de respuesta

```json
{
  "status": "completed",
  "theme": "qa-hu",
  "context": {
    "type": "qa-hu",
    "actor": "usuario",
    "action": "poder registrar un nuevo usuario",
    "outcome": "en el sistema",
    "confidence": 0.9
  },
  "timestamp": "2026-04-23T...",
  "results": {
    "hu-parser": {...},
    "semantic-analyzer": {...},
    // ... otros skills
  },
  "summary": {
    "coverage": 85,
    "errors": [],
    "warnings": [],
    "suggestions": [...]
  }
}
```

## Agregar nuevos temas

1. Crear reglas en `rules/nuevo-tema.rules.js`
2. Agregar entrada en `../skills/router.json`
3. Crear workflow en `../workflows/nuevo-workflow/`
4. Importar reglas en el constructor del router

## Requisitos

- Node.js
- Skills deben exportar una función `execute(input)` que retorne una Promise
- Workflows definidos en archivos `workflow.md` con formato específico