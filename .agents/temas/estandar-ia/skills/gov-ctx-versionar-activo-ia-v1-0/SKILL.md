---
name: gov-ctx-versionar-activo-ia-v1-0
description: >
  Decide la siguiente versión de un activo de IA según el tipo de cambio
  realizado, siguiendo las reglas vMAJOR_minor del estándar
  ORF-STD-IA-2026-01: v1_0 (inicial), v1_x (refinamiento), v2_0 (ruptura).

  Trigger: SOLO se carga si el repertorio está activo (@repertorio) Y el
  prompt pertenece al tema `estandar-ia` o menciona: "versionar activo",
  "qué versión asigno", "subir versión", "v1_1 o v2_0", "siguiente versión
  del prompt". Si NO hay @repertorio, NO cargar.
---

# Versionar activo de IA

## Cuándo se ejecuta

Cuando se modifica un activo existente y hay que decidir si la nueva versión es:
- `v1_x → v1_(x+1)` (refinamiento, compatible)
- `v1_x → v2_0` (ruptura, incompatible)

---

## Proceso (4 pasos)

### Paso 1 — Recolectar el cambio

Pedir al usuario:

> "Describe en 1-2 frases qué cambió en este activo respecto a la versión anterior."

Si el usuario provee diff/before/after directamente, mejor.

### Paso 2 — Clasificar el tipo de cambio

Aplicar este árbol de decisión:

```
¿El cambio puede romper a un consumidor existente del activo?
│
├── SÍ → v(MAJOR+1)_0  ← RUPTURA
│   Ejemplos: cambia el esquema del OUTPUT, se elimina/cambia una RULE,
│             cambia el contrato esperado del input, se reescribe PROCESS
│             cambiando los pasos del razonamiento.
│
└── NO → ¿Cambia la intención de alguna sección?
        │
        ├── SÍ → v(MAJOR)_(minor+1)  ← REFINAMIENTO
        │   Ejemplos: mejor ejemplo en EXAMPLES, reformulación de
        │             GUIDELINES sin cambiar intención, aclaración en PROCESS,
        │             ajuste menor en HEADER.
        │
        └── NO → No requiere nueva versión
            Ejemplos: corrección de ortografía sin cambio observable,
                      reformateo del archivo sin cambio de contenido.
```

### Paso 3 — Cuestionario de validación

Antes de confirmar, preguntar:

| Pregunta | Si responde "sí" |
|---|---|
| ¿Cambia el esquema del OUTPUT? | RUPTURA |
| ¿Se elimina o cambia el sentido de una RULE? | RUPTURA |
| ¿Cambia el formato esperado del input? | RUPTURA |
| ¿Cambian los pasos lógicos en PROCESS? | RUPTURA |
| ¿Solo se mejoraron ejemplos o redacción de GUIDELINES? | REFINAMIENTO |
| ¿Se aclaró un texto sin cambiar la intención? | REFINAMIENTO |

Una sola "sí" en RUPTURA → es ruptura. Si todas son refinamiento → es refinamiento.

### Paso 4 — Proponer versión y plan de coexistencia

```
Versión actual:    v1_2
Versión propuesta: v2_0  (RUPTURA)

Plan:
- Publicar v2_0 como nuevo archivo
- Mantener v1_2 activo durante el período de deprecación
- Notificar a consumidores actuales del cambio de contrato
- Documentar en HEADER de v2_0 qué cambió respecto a v1_2
```

Si es refinamiento, el plan es más simple:

```
Versión actual:    v1_2
Versión propuesta: v1_3  (REFINAMIENTO)

Plan:
- Reemplazar v1_2 por v1_3 en producción
- No requiere período de coexistencia (compatible hacia atrás)
- Documentar el cambio en HEADER
```

---

## Output esperado

```json
{
  "version_actual": "v1_2",
  "version_propuesta": "v1_3",
  "tipo_cambio": "REFINAMIENTO",
  "razonamiento": [
    "Se reformuló GUIDELINES para clarificar el manejo de fechas ambiguas",
    "Se mejoró el ejemplo malo en EXAMPLES",
    "Ningún cambio afecta el contrato de input/output ni RULES"
  ],
  "plan_publicacion": {
    "coexistencia_requerida": false,
    "deprecar_anterior": true,
    "notificar_consumidores": false
  },
  "documentar_en_header": "v1_3: clarificación de manejo de fechas ambiguas en GUIDELINES + ejemplo mejorado."
}
```

---

## Reglas

- ✅ Si hay duda entre refinamiento y ruptura → tratar como **ruptura** (más conservador, no rompe consumidores por error).
- ✅ El minor siempre reinicia con cada major (de `v1_5` a una ruptura es `v2_0`, no `v2_6`).
- ✅ Las versiones nunca se reutilizan ni se sobrescriben.
- ✅ Cada cambio de versión documenta qué cambió en el HEADER del activo.
- ❌ NO subir solo el minor cuando el cambio rompe contrato.
- ❌ NO subir directamente a `v3_0` saltando `v2_0`.
- ❌ NO mantener una sola versión "v_final" — eso fue un antipatrón del modelo anterior.

---

## Anti-patrones del modelo anterior (a NO repetir)

- ❌ `v_final`, `v_FINAL`, `v_definitivo`
- ❌ `v3_final_v2`
- ❌ Sobrescribir `v1_0` con cambios sin subir versión
- ❌ Versiones por fecha: `v_2026_03_15`

---

## Ejemplo de interacción

**Usuario:** _"@repertorio estandar-ia: tengo `FIN-QRY-Cartera_VencimientoCliente_v1_0` y le cambié el esquema del JSON de salida para incluir un nuevo campo 'dias_atraso'. ¿Qué versión asigno?"_

**Skill:**
> Cambio detectado: nuevo campo `dias_atraso` en el OUTPUT.
>
> **Pregunta clave:** ¿Los consumidores actuales que parsean el JSON con la estructura previa pueden seguir funcionando si reciben el nuevo campo?
>
> - Si el JSON solo **agrega** un campo y los consumidores ignoran campos extra → es REFINAMIENTO (`v1_1`)
> - Si el cambio implica que los consumidores actuales rompen al recibir el nuevo formato → es RUPTURA (`v2_0`)
>
> ¿Cuál aplica en tu caso?

**Usuario:** _"Solo se agrega el campo, los consumidores actuales no se rompen"_

**Skill:**
> Entonces es **REFINAMIENTO**. Versión propuesta: **`v1_1`**.
>
> Plan:
> - Renombrar archivo a `FIN-QRY-Cartera_VencimientoCliente_v1_1.md`
> - Actualizar HEADER con nota: "v1_1: agrega campo `dias_atraso` al OUTPUT (compatible)"
> - No requiere período de coexistencia
>
> ¿Confirmas?
