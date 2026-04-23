---
name: semantic-analyzer
description: Map user story concepts to possible code terms and synonyms.
---

## Purpose
Translate user story elements into keywords that can be used to search in code and database.

## Instructions
- Take the input from hu-parser
- Extract action and key concepts
- Generate:
  - keywords (direct terms)
  - synonyms (alternative names used in code)
- Focus on developer-friendly terms (English, camelCase, etc.)

## Output Format
Return ONLY JSON:

{
  "keywords": [],
  "synonyms": []
}

## Rules
- Include both Spanish and English terms if applicable
- Use common developer naming conventions
- Do not repeat values
- Keep terms relevant to the action

## Example

Input:
{
  "actor": "usuario",
  "action": "registrarse",
  "outcome": "acceder",
  "acceptance_criteria": [],
  "context": "",
  "issues": []
}

Output:
{
  "keywords": ["registrar", "usuario"],
  "synonyms": ["register", "signup", "createUser", "userRegistration"]
}