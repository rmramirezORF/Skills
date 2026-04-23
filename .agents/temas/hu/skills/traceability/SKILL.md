---
name: traceability
description: Relate user story elements with code and database evidence to determine implementation consistency.
---

## Purpose
Establish relationships between the user story, the code implementation, and the database.

## Instructions
- Use input from:
  - hu-parser
  - code-analyzer
  - db-analyzer
- Identify connections between:
  - actions and endpoints/functions
  - data and database tables/columns
- Determine if there is consistency across layers

## Output Format
Return ONLY JSON:

{
  "links": [],
  "consistency": "",
  "gaps": []
}

## Rules
- Links must connect HU → code → database
- Consistency values:
  - ALTA
  - MEDIA
  - BAJA
- Gaps should describe missing connections
- Do not assume relationships without evidence
- Keep descriptions short and clear

## Example

Input:
{
  "action": "registrarse"
},
{
  "endpoints": ["POST /register"],
  "functions": ["createUser()"]
},
{
  "tables": ["usuario"],
  "columns": ["correo", "password"]
}

Output:
{
  "links": [
    "registrarse → POST /register → tabla usuario",
    "createUser() → usuario.correo"
  ],
  "consistency": "MEDIA",
  "gaps": [
    "No se evidencia relación clara entre endpoint y columnas",
    "Faltan validaciones en base de datos"
  ]
}