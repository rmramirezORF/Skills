---
name: coverage-analyzer
description: Measure how much of the user story is implemented based on available evidence.
---

## Purpose
Calculate the implementation coverage of a user story.

## Instructions
- Use input from:
  - hu-parser
  - code-analyzer
  - db-analyzer
  - traceability
  - rules-engine
- Evaluate how many elements of the HU are covered:
  - action implemented
  - data persistence
  - validations
  - consistency across layers
- Estimate a percentage of coverage (0–100)

## Output Format
Return ONLY JSON:

{
  "coverage": 0,
  "details": [],
  "missing": []
}

## Rules
- Coverage must be an integer (0–100)
- Base calculation on evidence, not assumptions
- "details" = what is covered
- "missing" = what is not implemented
- Keep descriptions short and clear
- Do not duplicate items

## Example

Input:
{
  "status": "PARCIAL"
},
{
  "errors": ["No persistencia en BD"],
  "warnings": ["Faltan validaciones"]
}

Output:
{
  "coverage": 60,
  "details": [
    "Existe endpoint",
    "Existe lógica básica"
  ],
  "missing": [
    "Persistencia en base de datos",
    "Validaciones completas"
  ]
}