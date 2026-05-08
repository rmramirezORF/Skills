---
name: rules-engine
description: Evaluate implementation against defined QA rules and standards.
---

## Purpose
Validate the implementation of a user story based on predefined rules and standards.

## Instructions
- Use input from:
  - hu-parser
  - code-analyzer
  - db-analyzer
  - traceability
- Load rules from `temas/hu/config/rules.md` and standards from `temas/hu/config/standards.md`
- Evaluate each rule against the available evidence
- Identify:
  - violations (errors)
  - warnings (partial issues)

## Output Format
Return ONLY JSON:

{
  "errors": [],
  "warnings": []
}

## Rules
- An error = rule clearly not met
- A warning = partially met or unclear
- Do not assume compliance without evidence
- Keep messages short and specific
- Avoid duplicates

## Example

Input:
{
  "links": [],
  "consistency": "BAJA",
  "gaps": ["No relación clara entre código y BD"]
}

Rules:
- Must have endpoint
- Must persist data in database
- Must include validations

Output:
{
  "errors": [
    "No se evidencia persistencia en base de datos"
  ],
  "warnings": [
    "Relación débil entre código y base de datos",
    "Faltan validaciones"
  ]
}