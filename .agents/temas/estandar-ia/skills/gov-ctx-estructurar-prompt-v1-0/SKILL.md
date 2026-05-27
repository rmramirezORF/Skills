---
name: gov-ctx-estructurar-prompt-v1-0
description: >
  Construye el cuerpo de un activo de IA con las 9 secciones obligatorias del
  estándar ORF-STD-IA-2026-01: HEADER, ROLE, CONTEXT, RULES, GUIDELINES,
  PROCESS, OUTPUT, EXAMPLES, GUARDRAILS — en orden, sin excepción.

  Trigger: SOLO se carga si el repertorio está activo (@repertorio) Y el
  prompt pertenece al tema `estandar-ia` o menciona: "estructurar prompt",
  "crear prompt con 9 secciones", "armar el cuerpo del activo",
  "redactar prompt según estándar". Si NO hay @repertorio, NO cargar.
---

# Estructurar prompt — 9 secciones canónicas

## Cuándo se ejecuta

Cuando ya se decidió el nombre del activo (vía `nombrar-activo-ia`) y toca redactar el cuerpo del prompt según el estándar.

---

## Proceso (10 pasos)

### Paso 1 — Confirmar contexto

Antes de empezar, asegurar que se tiene:

- Nombre canónico del activo (ej. `FIN-QRY-Cartera_VencimientoCliente_v1_0`)
- Propósito del activo en una frase
- Quién es el dueño/responsable
- Fecha de creación

Si falta alguno → preguntar al usuario.

### Paso 2 — HEADER (sección 1)

Bloque YAML con metadata:

```yaml
nombre:    FIN-QRY-Cartera_VencimientoCliente_v1_0
version:   v1_0
dueño:     Cartera · ORF
proceso:   FIN
fuente:    ERP
fecha:     2026-04-15
proposito: Genera consulta T-SQL para listar facturas vencidas por cliente.
```

### Paso 3 — ROLE (sección 2)

Definir voz y autoridad del modelo. Pregunta clave: _"¿Qué identidad asume la IA en este activo?"_

**Patrón sugerido:**
> "Eres {profesión/especialidad} de ORF, experto en {dominio específico}."

Ejemplo: "Eres analista financiero de ORF, experto en cartera y vencimientos."

### Paso 4 — CONTEXT (sección 3)

Listar:
- Sistemas en alcance (ERP, módulos, APIs)
- Esquemas/tablas relevantes
- Términos de negocio que el modelo debe conocer
- Glosario crítico si aplica

### Paso 5 — RULES (sección 4)

**Reglas duras** — inviolables. Patrones típicos:

- Restricciones de PII
- Fronteras de datos (qué tablas SÍ, cuáles NO)
- Formato obligatorio del output
- Prohibiciones absolutas

> ⚠️ Si se duda si una regla es "dura" o "blanda" → si se puede saltar a veces, va en GUIDELINES.

### Paso 6 — GUIDELINES (sección 5)

**Guías blandas** — aplicar con criterio. Patrones típicos:

- Estilo de respuesta (concisa vs detallada)
- Tono (formal vs cercano)
- Manejo de ambigüedades (qué asumir cuando un dato no es claro)
- Preferencias estéticas

### Paso 7 — PROCESS (sección 6)

Pasos secuenciales que la IA debe seguir antes de responder. Numerar.

Patrón:
1. Identificar entidades del input
2. Determinar parámetros
3. Construir el output según OUTPUT
4. Validar contra RULES
5. Devolver

### Paso 8 — OUTPUT (sección 7)

Esquema EXACTO. Si es JSON → mostrar el schema. Si es T-SQL → describir las columnas esperadas. Si es prosa → enumerar las secciones obligatorias.

**No dejar ambigüedad.**

### Paso 9 — EXAMPLES (sección 8)

**Mínimo dos:**

- ✅ Un ejemplo correcto (input + output deseado + por qué es correcto)
- ❌ Un ejemplo incorrecto (input + output equivocado + qué regla viola)

El contraste es lo que calibra al modelo.

### Paso 10 — GUARDRAILS (sección 9)

Tabla de situaciones excepcionales y acción para cada una:

| Situación | Acción |
|---|---|
| Input fuera de scope | ... |
| Datos faltantes | ... |
| Conflicto entre RULES | ... |
| Output que viola RULE en revisión final | ... |

---

## Output esperado

Un archivo Markdown completo siguiendo la plantilla [PROMPT-TEMPLATE.md](../../assets/PROMPT-TEMPLATE.md), con las 9 secciones rellenadas según los datos del usuario.

Nombrar el archivo: `{nombre-canonico}.md`, ej. `FIN-QRY-Cartera_VencimientoCliente_v1_0.md`.

---

## Reglas

- ✅ **Las 9 secciones siempre** y en orden. Si una no aplica → dejar la sección con `N/A — razón`, no omitir.
- ✅ Encabezados EXACTOS: `HEADER`, `ROLE`, `CONTEXT`, `RULES`, `GUIDELINES`, `PROCESS`, `OUTPUT`, `EXAMPLES`, `GUARDRAILS` (en mayúsculas).
- ✅ Separar RULES de GUIDELINES rigurosamente (es el principal antipatrón del estándar).
- ✅ EXAMPLES debe incluir uno bueno y uno malo, ambos explicados.
- ✅ Si el usuario no provee información para una sección → **preguntar**, no inventar.
- ❌ NO mezclar reglas duras con criterios blandos en la misma sección.
- ❌ NO omitir GUARDRAILS porque "no se necesita".
- ❌ NO usar otros encabezados (PURPOSE, INSTRUCTIONS, etc.) — esos son del formato anterior.

---

## Ejemplo de interacción

**Usuario:** _"@repertorio estandar-ia: estructura el prompt para `FIN-QRY-Cartera_VencimientoCliente_v1_0`"_

**Skill:**
> Voy a construir el cuerpo con las 9 secciones. Necesito confirmar:
>
> 1. **Propósito** (una frase): ¿qué hace exactamente este prompt?
> 2. **Dueño:** ¿quién es responsable?
> 3. **Sistemas en alcance:** ¿solo ERP Arsys? ¿qué tablas?
> 4. **Reglas duras:** ¿hay restricciones de PII, fronteras de datos?
> 5. **Output:** ¿T-SQL ejecutable, JSON, otro?
>
> Cuando tenga estos datos, redacto las 9 secciones.

**Usuario:** _(provee datos)_

**Skill:** _(genera el archivo `.md` con las 9 secciones completas y se lo entrega listo para guardar)_
