---
name: gov-val-nombre-activo-ia-v1-0
description: >
  Verifica que un nombre propuesto o existente cumpla con el estándar
  ORF-STD-IA-2026-01: formato FUENTE-TIPO-Nombre_vMAJOR_minor con códigos
  válidos del catálogo cerrado. Reporta exactamente qué falla.

  Trigger: SOLO se carga si el repertorio está activo (@repertorio) Y el
  prompt pertenece al tema `estandar-ia` o menciona: "validar nombre",
  "verificar activo", "revisar código", "auditar nombre activo",
  "este nombre cumple el estándar". Si NO hay @repertorio, NO cargar.
---

# Validar nombre de activo de IA

## Cuándo se ejecuta

Cuando alguien presenta un nombre (propuesto o ya en uso) y necesita verificar si cumple el estándar antes de publicarlo o auditarlo.

---

## Proceso de validación (5 chequeos)

### Chequeo 1 — Formato general

El nombre debe matchear el patrón:
```
^[A-Z]+-[A-Z]+-[A-Za-z0-9_]+_v\d+_\d+$
```

**Verificar:**
- Tres segmentos separados por `-`
- Sufijo de versión `_vN_N` (mayor + menor numéricos)
- Sin espacios, sin caracteres especiales fuera de `_`

### Chequeo 2 — Código del segmento ① (Fuente o Proceso)

El primer segmento DEBE estar en una de estas listas cerradas:

**Proceso:** `FIN`, `SAL`, `SCM`, `OPS`, `HR`, `CST`, `MKT`, `EXE`
**Fuente:** `ERP`, `CRM`, `CONV`, `FUSE`, `PRED`, `ALERT`, `SYS`, `GOV`

Si el código no está en ninguna → **error**: "Código no reconocido en el catálogo cerrado".

### Chequeo 3 — Código del segmento ② (Tipo)

El segundo segmento DEBE estar en: `CTX`, `QRY`, `ENR`, `RTR`, `SUM`, `VAL`, `ALS`, `RPT`.

Si no → **error**.

### Chequeo 4 — Nombre conceptual (segmento ③)

Verificar:
- ✅ Inicia con mayúscula
- ✅ Usa PascalCase dentro de cada concepto
- ✅ Usa `_` para separar conceptos (no espacios, no `-`)
- ⚠️ Recomendado: 2-4 palabras conceptuales (no más, no menos)
- ❌ Sin caracteres especiales aparte de `_` y letras/dígitos

### Chequeo 5 — Versión

Verificar:
- ✅ Formato `v<entero>_<entero>`, ej. `v1_0`, `v2_3`
- ✅ Mayor ≥ 1 (no hay `v0_x`)
- ⚠️ Si es activo nuevo → debe ser `v1_0` (no `v1_1` ni superior)

---

## Output esperado

Devolver SIEMPRE un JSON con resultado estructurado:

### Caso A — Nombre válido

```json
{
  "nombre": "FIN-QRY-Cartera_VencimientoCliente_v1_0",
  "valido": true,
  "segmentos": {
    "primer_segmento": { "valor": "FIN", "tipo": "proceso", "significado": "Finance" },
    "tipo": { "valor": "QRY", "significado": "Prompt de consulta" },
    "nombre_conceptual": "Cartera_VencimientoCliente",
    "version": { "major": 1, "minor": 0, "etiqueta": "versión inicial" }
  },
  "advertencias": []
}
```

### Caso B — Nombre inválido

```json
{
  "nombre": "fin-qry-cartera_vencimiento_v_final",
  "valido": false,
  "errores": [
    "El segmento 1 'fin' debe estar en MAYÚSCULAS.",
    "El segmento 2 'qry' debe estar en MAYÚSCULAS.",
    "El nombre conceptual 'cartera_vencimiento' no usa PascalCase. Debería ser 'Cartera_Vencimiento'.",
    "Versión 'v_final' no cumple formato vMAJOR_minor. Use vN_N (ej. v1_0)."
  ],
  "advertencias": [
    "Considere si 'Cartera_Vencimiento' es lo bastante específico — añadir 'Cliente' o similar."
  ],
  "sugerencia": "FIN-QRY-Cartera_VencimientoCliente_v1_0"
}
```

---

## Reglas

- ✅ Reportar TODOS los errores en una pasada (no detenerse en el primero).
- ✅ Distinguir entre **error** (rompe el estándar) y **advertencia** (cumple pero podría mejorar).
- ✅ Cuando hay errores, ofrecer una **sugerencia** de cómo quedaría el nombre corregido.
- ❌ NO marcar como válido un nombre que use un código fuera del catálogo cerrado, aunque "se entienda".
- ❌ NO inventar reglas que no estén en el estándar (ej. máximo de caracteres no está definido).

---

## Ejemplo de uso

**Usuario:** _"@repertorio estandar-ia: valida si `SAL-SUM-PipelineSemanal_v1_1` cumple el estándar"_

**Skill:**
```json
{
  "nombre": "SAL-SUM-PipelineSemanal_v1_1",
  "valido": true,
  "segmentos": {
    "primer_segmento": { "valor": "SAL", "tipo": "proceso", "significado": "Sales" },
    "tipo": { "valor": "SUM", "significado": "Prompt de resumen" },
    "nombre_conceptual": "PipelineSemanal",
    "version": { "major": 1, "minor": 1, "etiqueta": "refinamiento (compatible)" }
  },
  "advertencias": [
    "Nombre conceptual con 1 palabra: aceptable, pero considere si una 2da palabra (ej. PipelineSemanal_Comercial) aporta claridad."
  ]
}
```
