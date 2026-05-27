# Tema: Estándar IA

Aplica el estándar **ORF-STD-IA-2026-01** ("El lenguaje común para construir IA propia") al ciclo de vida de los activos de IA: nombrarlos, estructurarlos, versionarlos, validarlos y migrarlos.

## Propósito

Cada activo de IA en ORF (prompt, agente, asistente) debe respetar:

1. **Nombre canónico** de 5 segmentos: `FUENTE-TIPO-Nombre_vMAJOR_minor`
2. **Estructura interna** de 9 secciones obligatorias
3. **Versionado** semántico: `v1_0` (inicial), `v1_1` (refinamiento), `v2_0` (ruptura)
4. **6 dimensiones** que describen el activo (3 en el nombre + 3 en metadata)

## Skills

| Skill | Propósito | Cuándo usar |
|---|---|---|
| [`gov-ctx-nombrar-activo-ia-v1-0`](skills/gov-ctx-nombrar-activo-ia-v1-0/SKILL.md) | Genera nombre canónico siguiendo el estándar | Antes de crear cualquier activo nuevo |
| [`gov-val-nombre-activo-ia-v1-0`](skills/gov-val-nombre-activo-ia-v1-0/SKILL.md) | Verifica que un nombre cumpla el estándar | Auditar activos existentes o nombres propuestos |
| [`gov-ctx-estructurar-prompt-v1-0`](skills/gov-ctx-estructurar-prompt-v1-0/SKILL.md) | Construye un prompt con las 9 secciones | Crear el cuerpo de un activo nuevo |
| [`gov-val-estructura-prompt-v1-0`](skills/gov-val-estructura-prompt-v1-0/SKILL.md) | Verifica que un prompt tenga las 9 secciones | Auditar prompts existentes |
| [`gov-ctx-versionar-activo-ia-v1-0`](skills/gov-ctx-versionar-activo-ia-v1-0/SKILL.md) | Decide la siguiente versión según tipo de cambio | Antes de publicar un cambio |
| [`gov-enr-migrar-activo-ia-v1-0`](skills/gov-enr-migrar-activo-ia-v1-0/SKILL.md) | Convierte un activo heredado al estándar | Catalogación (fase F2·Q2) |
| [`gov-enr-documentar-area-v1-0`](skills/gov-enr-documentar-area-v1-0/SKILL.md) | Entrevista directa al experto del área para producir un KB ingestable (un doc = un área) | Cuando se quiere extraer el conocimiento de un área para alimentar el agente |
| [`gov-ctx-disenar-rag-v1-0`](skills/gov-ctx-disenar-rag-v1-0/SKILL.md) | Define las 7 dimensiones técnicas del RAG (chunking, embedding, vector store, retrieval, re-ranking, citación, evaluación) | Cuando ya hay un corpus de KBs y se va a diseñar/auditar el pipeline RAG del agente |
| [`gov-ctx-guia-creacion-rag-v1-0`](skills/gov-ctx-guia-creacion-rag-v1-0/SKILL.md) | Guía operativa para crear un KB que vaya al RAG: 3 fuentes (entrevista, ISOTools, extracción BD), frontmatter exigido, naming, ubicación en repo y checklist de validación | Cuando alguien va a producir un documento nuevo para alimentar a ANIRO y necesita el "cómo se hace" práctico |

## Referencias

| Documento | Contenido |
|---|---|
| [referencias/dimensiones.md](referencias/dimensiones.md) | Los 24 códigos cerrados (8 fuente + 8 proceso + 8 tipo) |
| [referencias/estructura-prompt.md](referencias/estructura-prompt.md) | Las 9 secciones obligatorias en orden |
| [referencias/versionado.md](referencias/versionado.md) | Reglas de versionado v1_0 / v1_1 / v2_0 |

## Plantilla

| Archivo | Uso |
|---|---|
| [assets/PROMPT-TEMPLATE.md](assets/PROMPT-TEMPLATE.md) | Plantilla canónica de prompt con las 9 secciones |
| [assets/KB-AREA-TEMPLATE.md](assets/KB-AREA-TEMPLATE.md) | Plantilla para producir un KB de área (alineado con el ingester de ANIRO) |

## Documento fuente

ORF-STD-IA-2026-01 · "El lenguaje común para construir IA propia" · TI / Digital · ORF · Abril 2026.

## Estado del estándar

| Fase | Q | Descripción | Estado |
|---|---|---|---|
| F1 | Q1 | Definición — estándar publicado y socializado | ✅ Cerrada |
| F2 | Q2 | Catálogo — recodificar activos heredados | 🟡 **Activa** |
| F3 | Q3 | Producción — activos nuevos cumplen el estándar | ⏸️ Planeada |
| F4 | Q4 | Gobernanza — comité y rituales de revisión | ⏸️ Planeada |
