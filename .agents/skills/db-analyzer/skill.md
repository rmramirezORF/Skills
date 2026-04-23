---
name: db-analyzer
description: Analyze database structure and data using MCP to validate persistence related to a user story.
---

## Purpose
Verify that the user story is supported by database structures and data.

## Instructions
- Use keywords and synonyms as reference
- Query the database via MCP to find:
  - related tables
  - relevant columns
  - possible relationships
- Identify if data persistence is supported

## Output Format
Return ONLY JSON:

{
  "tables": [],
  "columns": [],
  "relationships": [],
  "evidence": []
}

## Rules
- Use MCP to query real database metadata
- Match tables and columns semantically
- Do not assume structures that are not found
- Evidence should reference table or column names
- Avoid duplicates

## Example

Input:
{
  "keywords": ["usuario", "registrar"],
  "synonyms": ["user", "register", "createUser"]
}

Output:
{
  "tables": ["usuario", "users"],
  "columns": ["correo", "password", "estado"],
  "relationships": ["usuario → rol"],
  "evidence": [
    "table: usuario",
    "column: correo",
    "column: password"
  ]
}