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

1. Execute exe-enr-parsear-hu-v1-0
   - Input: HU

2. Execute exe-enr-extraer-keywords-hu-v1-0
   - Input: exe-enr-parsear-hu-v1-0 output

---

3. Execute sys-qry-analizar-codigo-v1-0
   - Input: exe-enr-extraer-keywords-hu-v1-0 output

4. Execute erp-qry-analizar-bd-v1-0 (ONLY if backend or fullstack)
   - Input: exe-enr-extraer-keywords-hu-v1-0 output

---

5. Execute exe-enr-mapear-trazabilidad-v1-0 (ONLY if fullstack)
   - Input:
     - exe-enr-parsear-hu-v1-0 output
     - sys-qry-analizar-codigo-v1-0 output
     - erp-qry-analizar-bd-v1-0 output

---

6. Execute exe-val-evaluar-reglas-v1-0
   - Input:
     - exe-enr-parsear-hu-v1-0 output
     - sys-qry-analizar-codigo-v1-0 output
     - erp-qry-analizar-bd-v1-0 output (if exists)
     - exe-enr-mapear-trazabilidad-v1-0 output (if exists)

---

7. Execute exe-val-dictaminar-hu-v1-0
   - Input:
     - exe-enr-parsear-hu-v1-0 output
     - sys-qry-analizar-codigo-v1-0 output
     - erp-qry-analizar-bd-v1-0 output (if exists)
     - exe-val-evaluar-reglas-v1-0 output

---

8. Execute exe-val-medir-cobertura-v1-0
   - Input:
     - exe-enr-parsear-hu-v1-0 output
     - sys-qry-analizar-codigo-v1-0 output
     - erp-qry-analizar-bd-v1-0 output (if exists)
     - exe-enr-mapear-trazabilidad-v1-0 output (if exists)
     - exe-val-evaluar-reglas-v1-0 output
     - exe-val-dictaminar-hu-v1-0 output

---

9. Execute exe-enr-generar-sugerencias-v1-0
   - Input:
     - exe-val-dictaminar-hu-v1-0 output
     - exe-val-evaluar-reglas-v1-0 output
     - exe-val-medir-cobertura-v1-0 output

---

10. Execute exe-enr-generar-pruebas-v1-0
    - Input:
      - exe-enr-parsear-hu-v1-0 output
      - exe-val-dictaminar-hu-v1-0 output
      - exe-val-evaluar-reglas-v1-0 output

---

11. Execute exe-sum-consolidar-resultado-qa-v1-0
    - Input:
      - exe-val-dictaminar-hu-v1-0
      - exe-val-medir-cobertura-v1-0
      - exe-val-evaluar-reglas-v1-0
      - exe-enr-generar-sugerencias-v1-0
      - exe-enr-generar-pruebas-v1-0