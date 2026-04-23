---
name: suggestion-engine
description: Generate actionable improvements based on QA validation results.
---

## Purpose
Provide clear and actionable suggestions to improve the implementation of a user story.

## Instructions
- Use input from:
  - qa-validator
  - code-analyzer
- For each detected issue:
  - Propose a concrete improvement
- Suggestions should be practical and implementable

## Output Format
Return ONLY JSON:

{
  "suggestions": []
}

## Rules
- Suggestions must be specific (not generic)
- Focus on backend, validation, and structure
- Do not repeat information from reasons
- Keep each suggestion short and actionable
- If no issues → return empty array

## Example

Input:
{
  "status": "PARCIAL",
  "reasons": [
    "Faltan validaciones",
    "No se evidencia manejo de errores"
  ]
}

Output:
{
  "suggestions": [
    "Agregar validación de datos de entrada en el endpoint",
    "Implementar manejo de errores con respuestas claras",
    "Validar formato y unicidad del correo en backend"
  ]
}