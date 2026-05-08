---
name: hu-parser
description: Extrae información estructurada de una Historia de Usuario (HU) para su análisis en procesos de QA.
---

# hu-parser

## Purpose
Convert a user story written in natural language into a structured JSON format that can be used by other skills in the QA workflow.

---

## Instructions

You will receive a user story written in natural language.

Your task is to:

1. Identify the main components of the user story:
   - actor (who)
   - action (what they want to do)
   - outcome (why / expected result)

2. Extract or infer acceptance criteria:
   - If explicitly provided → extract them
   - If not → infer logical criteria based on the action

3. Capture any relevant context if present.

4. Detect structural issues in the user story:
   - Missing actor
   - Missing action
   - Missing outcome
   - Ambiguity

---

## Output Format

Return ONLY a valid JSON object with the following structure:

```json
{
  "actor": "string",
  "action": "string",
  "outcome": "string",
  "acceptance_criteria": ["string"],
  "context": "string",
  "issues": ["string"]
}