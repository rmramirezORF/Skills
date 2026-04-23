---
name: test-generator
description: Generate test cases based on user story and QA results.
---

## Purpose
Create test cases to validate the correct implementation of a user story.

## Instructions
- Use input from:
  - hu-parser
  - qa-validator
- Generate test cases based on:
  - expected behavior
  - detected issues
- Include both positive and negative scenarios

## Output Format
Return ONLY JSON:

{
  "tests": []
}

## Rules
- Tests must be clear and concise
- Include at least:
  - 1 happy path
  - negative cases if issues exist
- Do not duplicate tests
- Focus on functional validation

## Example

Input:
{
  "actor": "usuario",
  "action": "registrarse",
  "outcome": "acceder",
  "acceptance_criteria": []
},
{
  "status": "PARCIAL",
  "reasons": [
    "Faltan validaciones"
  ]
}

Output:
{
  "tests": [
    "Registro exitoso con datos válidos",
    "Registro con correo inválido debe fallar",
    "Registro con campos vacíos debe fallar"
  ]
}