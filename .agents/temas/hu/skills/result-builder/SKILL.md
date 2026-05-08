---
name: result-builder
description: Consolida los resultados de todas las skills del workflow hu-validation en una respuesta final estructurada lista para el usuario.
---

# result-builder

## Purpose
Combinar las salidas de qa-validator, coverage-analyzer, rules-engine, suggestion-engine y test-generator en un único objeto consolidado y formateado.

---

## Instructions

Recibirás los outputs de las skills previas del workflow.

Tu tarea es:

1. Combinar todos los hallazgos en una estructura coherente.
2. Calcular el veredicto final (cumple / cumple parcialmente / no cumple).
3. Resumir cobertura, errores, advertencias y sugerencias.
4. Adjuntar los casos de prueba generados.

---

## Input Format

```json
{
  "qa-validator": {},
  "coverage-analyzer": {},
  "rules-engine": {},
  "suggestion-engine": {},
  "test-generator": {}
}
```

---

## Output Format

Return ONLY a valid JSON object:

```json
{
  "verdict": "cumple | cumple_parcialmente | no_cumple",
  "coverage": 0,
  "summary": {
    "errors": [],
    "warnings": [],
    "suggestions": []
  },
  "tests": [],
  "final_answer": "string"
}
```

---

## Rules

- No inventar datos que no estén en el input.
- Si una skill faltó, marcarla como `null` en lugar de omitirla.
- `final_answer` debe ser una frase corta apta para mostrar al usuario.
