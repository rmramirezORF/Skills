---
name: qa-full
description: Dynamic QA workflow for frontend, backend, or fullstack analysis.
---

## Input

{
  "mode": "frontend | backend | fullstack (optional)",
  "hu": "string"
}

---

## Steps

0. Detect mode (if not provided)

---

1. Execute hu-parser
   - Input: HU

2. Execute semantic-analyzer
   - Input: hu-parser output

---

3. Execute code-analyzer
   - Input: semantic-analyzer output

4. Execute db-analyzer (ONLY if backend or fullstack)
   - Input: semantic-analyzer output

---

5. Execute traceability (ONLY if fullstack)
   - Input:
     - hu-parser output
     - code-analyzer output
     - db-analyzer output

---

6. Execute rules-engine
   - Input:
     - hu-parser output
     - code-analyzer output
     - db-analyzer output (if exists)
     - traceability output (if exists)

---

7. Execute qa-validator
   - Input:
     - hu-parser output
     - code-analyzer output
     - db-analyzer output (if exists)
     - rules-engine output

---

8. Execute coverage-analyzer
   - Input:
     - hu-parser output
     - code-analyzer output
     - db-analyzer output (if exists)
     - traceability output (if exists)
     - rules-engine output
     - qa-validator output

---

9. Execute suggestion-engine
   - Input:
     - qa-validator output
     - rules-engine output
     - coverage-analyzer output

---

10. Execute test-generator
    - Input:
      - hu-parser output
      - qa-validator output
      - rules-engine output

---

11. Execute result-builder
    - Input:
      - qa-validator
      - coverage-analyzer
      - rules-engine
      - suggestion-engine
      - test-generator