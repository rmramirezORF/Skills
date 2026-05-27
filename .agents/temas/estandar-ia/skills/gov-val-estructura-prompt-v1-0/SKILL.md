---
name: gov-val-estructura-prompt-v1-0
description: >
  Audita el cuerpo de un activo de IA y verifica que cumpla con las 9
  secciones obligatorias del estándar ORF-STD-IA-2026-01: HEADER, ROLE,
  CONTEXT, RULES, GUIDELINES, PROCESS, OUTPUT, EXAMPLES, GUARDRAILS — en
  orden, sin omisiones, con RULES y GUIDELINES separadas.

  Trigger: SOLO se carga si el repertorio está activo (@repertorio) Y el
  prompt pertenece al tema `estandar-ia` o menciona: "validar prompt",
  "auditar estructura", "revisar las 9 secciones", "verificar prompt
  según estándar". Si NO hay @repertorio, NO cargar.
---

# Validar estructura de prompt

## Cuándo se ejecuta

Cuando se necesita auditar un activo (existente o propuesto) para verificar que cumpla con la estructura interna del estándar ORF.

---

## Proceso de validación (5 chequeos)

### Chequeo 1 — Las 9 secciones presentes

Verificar que el archivo contenga, EN ORDEN, las 9 secciones con los encabezados exactos:

```
1. HEADER
2. ROLE
3. CONTEXT
4. RULES
5. GUIDELINES
6. PROCESS
7. OUTPUT
8. EXAMPLES
9. GUARDRAILS
```

**Permitido:** una sección con contenido `N/A — razón` (cumple si está justificado).
**No permitido:** sección omitida sin justificación.

### Chequeo 2 — Orden correcto

El orden debe ser estricto. Si HEADER va después de ROLE → error de orden.

### Chequeo 3 — Encabezados exactos

Los encabezados deben coincidir literalmente:

| ✅ Correcto | ❌ Incorrecto |
|---|---|
| `## HEADER` | `## Header`, `## Encabezado`, `## Identidad` |
| `## RULES` | `## Reglas`, `## Rules duras`, `## RULE` |
| `## GUARDRAILS` | `## Guardrail`, `## Salvaguardas`, `## Errores` |

### Chequeo 4 — RULES y GUIDELINES separadas

Detectar si dentro de RULES aparecen frases que suenan a "guía blanda" (palabras como "preferir", "cuando sea posible", "en general") → posible mezcla incorrecta.

Detectar si dentro de GUIDELINES aparecen frases que suenan a "regla dura" (palabras como "nunca", "siempre", "prohibido") → posible mezcla incorrecta.

### Chequeo 5 — EXAMPLES tiene caso bueno y malo

La sección EXAMPLES debe incluir AL MENOS:
- Un ejemplo marcado como ✅ correcto
- Un ejemplo marcado como ❌ incorrecto
- Una explicación breve de cada uno

Si solo hay uno → reportar como advertencia.

---

## Output esperado

```json
{
  "archivo": "FIN-QRY-Cartera_VencimientoCliente_v1_0.md",
  "valido": false,
  "secciones": {
    "HEADER":     { "presente": true,  "orden_correcto": true  },
    "ROLE":       { "presente": true,  "orden_correcto": true  },
    "CONTEXT":    { "presente": true,  "orden_correcto": true  },
    "RULES":      { "presente": true,  "orden_correcto": true  },
    "GUIDELINES": { "presente": false, "orden_correcto": null  },
    "PROCESS":    { "presente": true,  "orden_correcto": false },
    "OUTPUT":     { "presente": true,  "orden_correcto": false },
    "EXAMPLES":   { "presente": true,  "orden_correcto": true  },
    "GUARDRAILS": { "presente": false, "orden_correcto": null  }
  },
  "errores": [
    "Sección GUIDELINES omitida sin justificación.",
    "Sección PROCESS aparece antes que OUTPUT pero no en orden estricto.",
    "Sección GUARDRAILS omitida sin justificación.",
    "EXAMPLES contiene solo un ejemplo (debería incluir uno correcto y uno incorrecto)."
  ],
  "advertencias": [
    "En RULES se detectó la frase 'cuando sea posible'. Posible mezcla con GUIDELINES — revisar."
  ],
  "recomendacion": "Reestructurar el archivo siguiendo `assets/PROMPT-TEMPLATE.md`."
}
```

Si el archivo es válido:

```json
{
  "archivo": "FIN-QRY-Cartera_VencimientoCliente_v1_0.md",
  "valido": true,
  "secciones": {
    "HEADER":     { "presente": true, "orden_correcto": true },
    "ROLE":       { "presente": true, "orden_correcto": true },
    "...":        "..."
  },
  "errores": [],
  "advertencias": []
}
```

---

## Reglas

- ✅ Reportar TODOS los problemas en una sola pasada (no detenerse en el primero).
- ✅ Distinguir error (rompe el estándar) vs advertencia (cumple pero podría mejorar).
- ✅ Si una sección está marcada `N/A — razón`, contarla como presente y válida.
- ❌ NO marcar como válido un archivo al que le falte cualquier sección sin justificación.
- ❌ NO inventar reglas que no estén en el estándar.

---

## Ejemplo de uso

**Usuario:** _"@repertorio estandar-ia: valida la estructura de `FIN-RPT-VentasMensual_v1_0.md`"_

**Skill:** _(lee el archivo, devuelve el JSON con el resultado del chequeo)_
