---
name: gov-enr-migrar-activo-ia-v1-0
description: >
  Convierte un activo de IA heredado (Aniro u otros prompts pre-estándar)
  al formato canónico ORF-STD-IA-2026-01: asigna nombre, restructura el
  cuerpo en las 9 secciones obligatorias, y propone versión inicial v1_0.
  Es la skill principal de la fase F2·Q2 (Catálogo).

  Trigger: SOLO se carga si el repertorio está activo (@repertorio) Y el
  prompt pertenece al tema `estandar-ia` o menciona: "migrar prompt",
  "convertir al estándar", "renombrar activo heredado", "catalogar Aniro",
  "actualizar prompt viejo". Si NO hay @repertorio, NO cargar.
---

# Migrar activo de IA al estándar

## Cuándo se ejecuta

Cuando hay un prompt/agente/asistente pre-estándar (ej. heredado de Aniro) y se debe convertir al formato canónico ORF.

Es el caso de uso central de la **Fase F2·Q2 (Catálogo)** del roadmap.

---

## Proceso (6 pasos)

### Paso 1 — Recolectar el activo original

El usuario aporta:
- El archivo o texto del prompt original
- Cualquier metadata que tenga (autor, fecha, propósito)
- A qué proceso/área pertenece

Si falta algo → preguntar.

### Paso 2 — Inferir las 6 dimensiones

A partir del contenido del prompt original, deducir:

| Dimensión | Cómo deducir |
|---|---|
| Proceso (FIN/SAL/SCM/...) | ¿Qué área de negocio sirve? |
| Fuente (ERP/CRM/CONV/...) | ¿De dónde vienen los datos? |
| Tipo (CTX/QRY/ENR/...) | ¿Qué hace? (consulta, resume, valida, alerta...) |
| Nombre conceptual | 2-4 palabras PascalCase que capturen el propósito |
| Versión | `v1_0` (es el primer release bajo el nuevo estándar) |
| Owner | Persona/área responsable |

**Si alguna dimensión no es deducible con confianza → preguntar al usuario antes de inventar.**

### Paso 3 — Generar el nombre canónico

Aplicar la skill [nombrar-activo-ia](../nombrar-activo-ia/SKILL.md) con las dimensiones inferidas.

Resultado: `FUENTE-TIPO-Nombre_v1_0`

### Paso 4 — Mapear el contenido a las 9 secciones

Tomar el prompt original (que probablemente está mezclado/desordenado) y separar su contenido en las 9 secciones:

| Sección | Qué buscar en el original |
|---|---|
| HEADER | Metadata, título, propósito declarado |
| ROLE | Frases tipo "Eres un...", "Actúa como..." |
| CONTEXT | Mención de sistemas, datos, esquemas |
| RULES | Frases con "nunca", "siempre", "prohibido", "obligatorio" |
| GUIDELINES | Frases con "preferir", "cuando", "sugerencia", criterio |
| PROCESS | Pasos enumerados o secuencia de razonamiento |
| OUTPUT | Sección "responde con", "formato", esquema declarado |
| EXAMPLES | Ejemplos existentes en el original |
| GUARDRAILS | Frases tipo "si X, entonces Y", manejo de excepciones |

Si una sección queda vacía después del mapeo → marcar `N/A — no presente en el original; agregar en próxima iteración` y avisar al usuario.

### Paso 5 — Reportar gaps

Generar un reporte de qué quedó cubierto, qué quedó parcial y qué falta:

```json
{
  "secciones_cubiertas": ["HEADER", "ROLE", "PROCESS", "OUTPUT"],
  "secciones_parciales": ["CONTEXT", "RULES"],
  "secciones_faltantes": ["GUIDELINES", "EXAMPLES", "GUARDRAILS"],
  "recomendacion": "Antes de promover a producción, completar las 3 secciones faltantes con el dueño del activo."
}
```

### Paso 6 — Generar el activo migrado

Producir el archivo nuevo con:
- Nombre canónico (ej. `FIN-QRY-Cartera_VencimientoCliente_v1_0.md`)
- Las 9 secciones (con `N/A — pendiente` donde falte contenido)
- Una nota al final del HEADER:

```yaml
notas_migracion:
  origen: "Prompt heredado: <referencia al original>"
  fecha_migracion: "YYYY-MM-DD"
  cobertura: "X de 9 secciones completas; Y secciones marcadas como pendientes"
```

---

## Output esperado

Dos artefactos:

1. **El archivo migrado** (`{nombre-canonico}.md`)
2. **El reporte de migración** (JSON o tabla):

```json
{
  "original": "asistente_cartera_v3_final_FINAL.txt",
  "migrado_a": "FIN-QRY-Cartera_VencimientoCliente_v1_0.md",
  "dimensiones_inferidas": {
    "proceso": "FIN",
    "fuente": "ERP",
    "tipo": "QRY",
    "nombre": "Cartera_VencimientoCliente",
    "version": "v1_0"
  },
  "cobertura_secciones": {
    "completas": 4,
    "parciales": 2,
    "faltantes": 3,
    "detalle": {
      "HEADER": "completa",
      "ROLE": "completa",
      "CONTEXT": "parcial — falta lista de tablas",
      "RULES": "parcial — solo 1 regla detectada",
      "GUIDELINES": "faltante",
      "PROCESS": "completa",
      "OUTPUT": "completa",
      "EXAMPLES": "faltante",
      "GUARDRAILS": "faltante"
    }
  },
  "siguiente_accion": "Completar GUIDELINES, EXAMPLES y GUARDRAILS con el dueño del activo."
}
```

---

## Reglas

- ✅ Preservar TODO el contenido del activo original (no perder reglas, ejemplos, casos límite que ya estaban).
- ✅ Si el original mezcla RULES con GUIDELINES, **separarlas correctamente** durante la migración (no dejarlas mezcladas).
- ✅ Marcar como `N/A — pendiente` (no dejar en blanco) las secciones que el original no cubre.
- ✅ Reportar honestamente la cobertura de secciones (no inflar la calidad).
- ✅ Siempre asignar `v1_0` (es el primer release bajo el nuevo estándar, sin importar la "versión" que tenía el original).
- ❌ NO inventar reglas, ejemplos o contexto que no estaban en el original.
- ❌ NO descartar partes del original "porque no encajan" — buscar dónde sí encajan.
- ❌ NO promover el activo migrado a producción sin completar las secciones faltantes.

---

## Anti-patrones a detectar y reportar al migrar

Cuando migres un activo heredado, **detecta y reporta** estos antipatrones del original:

| Antipatrón en el original | Acción al migrar |
|---|---|
| Nombre tipo `asistente_cartera_v3_final_FINAL.txt` | Renombrar a canónico, anotar el original en `notas_migracion` |
| RULES y GUIDELINES mezcladas | Separar; reportar la cantidad de reglas que se reclasificaron |
| Sin EXAMPLES | Marcar `N/A — pendiente`, sugerir al dueño que aporte ejemplos reales |
| Versiones tipo `v_final`, `v3.5.7` | Asignar `v1_0` y documentar la equivalencia |
| Sin OUTPUT explícito | Inferir del contenido y proponer; pedir validación al usuario |

---

## Ejemplo de uso

**Usuario:** _"@repertorio estandar-ia: migra este prompt heredado: [pega el contenido]"_

**Skill:**
> Voy a migrar este activo. Primero infiero las dimensiones:
>
> - Proceso detectado: **FIN** (menciona "cartera", "vencimiento")
> - Fuente detectada: **ERP** (consulta tablas del ERP)
> - Tipo detectado: **QRY** (genera T-SQL)
> - Nombre conceptual propuesto: **Cartera_VencimientoCliente**
>
> Nombre canónico propuesto: `FIN-QRY-Cartera_VencimientoCliente_v1_0`
>
> ¿Confirmas las dimensiones inferidas, o ajusto alguna?

**Usuario:** _"Confirmo"_

**Skill:** _(genera el archivo migrado con las 9 secciones + reporte de cobertura JSON)_
