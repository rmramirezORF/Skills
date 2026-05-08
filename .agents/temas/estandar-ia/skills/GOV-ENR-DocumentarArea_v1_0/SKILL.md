---
name: GOV-ENR-DocumentarArea_v1_0
description: >
  Entrevista al experto de un área de ORF y produce un documento de
  conocimiento puro siguiendo el patrón validado de Aniro (glosario,
  códigos maestros, procesos, reglas, decisiones, gotchas, validaciones,
  apéndice). Aplica la regla "un documento = un área" para mantener
  el conocimiento específico y reutilizable.

  Trigger: SOLO se carga si el repertorio está activo (@repertorio) Y el
  prompt pertenece al tema `estandar-ia` o menciona: "documentar área",
  "construir conocimiento", "entrevistar experto", "knowledge base",
  "armar KB", "extraer conocimiento del área", "ingestar conocimiento".
  Si NO hay @repertorio, NO cargar.
---

# Documentar conocimiento de un área de ORF

## Cuándo se ejecuta

Cuando un experto de un área (Cartera, Nómina, Inventario, Tesorería, etc.) necesita volcar TODO lo que sabe a un documento estructurado. Ese documento luego puede:

- Cargarse como contexto monolítico al agente (KB nivel 1)
- Chunkearse y vectorizarse para un RAG completo (KB nivel 2)
- Servir como onboarding de un sustituto cuando el experto no esté

## Referencia interna

Patrón validado: `aniro-main/docs/rules/orf-business-logic.md` — 2600 líneas, 37 secciones, ya en producción. Esta skill replica su estructura.

Plantilla limpia: [`KB-AREA-TEMPLATE.md`](../../assets/KB-AREA-TEMPLATE.md).

---

## Regla de oro

**Un documento = un área. NO mezclar.**

Si durante la entrevista el experto empieza a hablar de otra área:

> "Eso pertenece al área de {otra}. ¿Quieres que abramos un documento separado para esa área después? Por ahora sigamos con {área actual} para mantener este documento específico."

---

## Proceso (8 fases)

### Fase 1 — Encuadre

Confirmar con el usuario:

| Pregunta | Por qué importa |
|---|---|
| ¿Qué área vamos a documentar? | Define el alcance único del documento |
| ¿Quién es el experto del área? | Para citar la fuente |
| ¿Esta persona es la única que tiene este conocimiento? | Si no, sumar más entrevistados después |
| ¿El conocimiento se materializa en algún ETL/dashboard/sistema? | Para enlazar con código si existe |

Si el área NO es clara → preguntar y NO inventar el alcance.

### Fase 2 — Glosario (sección 1 del documento)

> "Antes de meternos en procesos, vamos a anclar el lenguaje. Necesito que me digas todos los términos del área que se usan con un significado específico."

Hacer preguntas tipo:

- "Cuando dicen `{término X}` en su área, ¿qué significa exactamente?"
- "¿Hay términos que la gente fuera del área usa distinto?"
- "¿Hay siglas que sólo ustedes usan?"

Capturar para cada término: nombre, definición en 1-2 frases, fuente (tabla/sistema).

### Fase 3 — IDs y códigos maestros (sección 2)

> "Ahora dame los identificadores estables: códigos, IDs, status, categorías que se usan en filtros y reglas."

Preguntas guía:

- "¿Qué códigos/IDs usan en el día a día?"
- "Si tuvieras que filtrar todo lo de tu área de un dump, ¿qué ID usarías?"
- "¿Hay status que la gente confunde?" (ej. anulado vs devuelto)

**Lección Aniro:** preferir IDs sobre nombres. Los nombres cambian, los IDs no.

### Fase 4 — Mapa de procesos (sección 3)

> "Listemos los procesos principales del área. Vista de pájaro, sin entrar en detalle todavía."

Preguntas:

- "¿Cuáles son los 5 a 10 procesos centrales del área?"
- "¿Cuáles son diarios, semanales, mensuales, anuales?"
- "¿Quién es el dueño operativo de cada uno?"

Para cada proceso anotar: nombre, frecuencia, owner, sistemas que toca.

### Fase 5 — Procesos en detalle (sección 4)

Por cada proceso del mapa, hacer una mini-entrevista:

| Pregunta | Para qué |
|---|---|
| ¿Qué hace exactamente este proceso? | Descripción funcional |
| ¿Cuándo se dispara? | Trigger |
| ¿De dónde vienen los datos? | Tablas/archivos/APIs |
| ¿Hay una fórmula? ¿SQL? | Lógica reproducible |
| ¿Qué reglas críticas rigen? | Reglas duras |
| ¿Qué pasa si una regla se viola? | Consecuencia (ayuda a entender la importancia) |

Si el experto da una fórmula o SQL, **capturar literal** (no parafrasear).

### Fase 6 — Decisiones de diseño (sección 6)

> "Ahora la parte más importante: ¿qué decisiones técnicas u operativas son no-obvias? Lo que un nuevo en el área tendría que entender para no romper algo sin querer."

Para cada decisión, aplicar el patrón **Decisión + Motivo** (lección Aniro §15):

```markdown
**Decisión:** {qué se hace}
**Motivo:** {por qué se hace así}
**Alternativas consideradas:** {qué se descartó}
```

Preguntas que ayudan a sacar decisiones:

- "¿Hay algo que parece raro pero hacen así por una buena razón?"
- "¿Qué error cometen los nuevos cuando entran al área?"
- "¿Por qué usan X en lugar de Y, si Y parece más obvio?"

### Fase 7 — Gotchas y bitácora (sección 7)

> "Casos raros, fixes que se hicieron, errores históricos que ya están corregidos pero hay que recordar."

Para cada gotcha:

- Síntoma observado (qué se vio mal)
- Causa raíz (por qué pasaba)
- Fix aplicado (qué se hizo)
- Reglas derivadas (qué quedó como regla nueva)

Patrón Aniro: la bitácora histórica protege a la próxima persona de re-cometer el mismo error.

### Fase 8 — Validaciones y referencias

#### Validaciones obligatorias (sección 8)

> "¿Cómo verifican que un proceso quedó bien? ¿Hay totales que tienen que cuadrar?"

Cada validación tiene: cuándo se ejecuta, qué verifica, qué pasa si falla.

#### Fuentes externas (sección 9)

> "¿De qué sistemas/archivos/APIs depende el área? ¿Quién los actualiza?"

#### Apéndice — valores de referencia (sección 10)

> "Para que alguien que reproduzca tus procesos sepa si le quedaron bien, ¿hay valores conocidos para algún período?"

Esto es el **golden dataset** embebido (lección Aniro). Crítico para validar futuros cambios.

---

## Output esperado

Un archivo `.md` con el nombre canónico:

```
KB-{AREA}-{nombre-conceptual}_v1_0.md
```

Ejemplos:

- `KB-CARTERA-FlujoCobranza_v1_0.md`
- `KB-NOMINA-LiquidacionMensual_v1_0.md`
- `KB-INVENTARIO-MovimientosLogisticos_v1_0.md`

> ⚠️ Nota: este nombre NO sigue el formato canónico `FUENTE-TIPO-Nombre_vN_M` del estándar
> ORF para activos de IA, porque NO es un activo de IA — es un documento fuente que ALIMENTA
> a los activos. Se propone el prefijo `KB-` para distinguirlo. Validar con gobernanza.

El archivo debe estar **completo** según la plantilla `KB-AREA-TEMPLATE.md`. Cualquier sección que el experto no cubra:

- Marcar como `[PENDIENTE — preguntar a {persona específica si se conoce}]`
- NO inventar contenido
- NO eliminar la sección

---

## Reglas

- ✅ **Un documento = un área.** Si el experto deriva a otra área, abrir doc separado.
- ✅ Capturar fórmulas/SQL/código literal del experto, no parafrasear.
- ✅ Usar siempre el patrón **Decisión + Motivo** en la sección 6.
- ✅ Marcar `[PENDIENTE]` lo que falte, no inventar.
- ✅ Citar al experto y la fecha en el frontmatter.
- ✅ Validar con el experto antes de cerrar v1_0.
- ❌ NO mezclar áreas en un mismo documento.
- ❌ NO omitir el glosario "porque parece obvio".
- ❌ NO escribir el documento por adelantado y pedir al experto que valide — la entrevista es lo que extrae el conocimiento real.
- ❌ NO saltarse fases — el orden es importante (glosario antes de procesos, procesos antes de decisiones).

---

## Anti-patrones

- ❌ Hacer todas las preguntas a la vez al experto → se satura, da respuestas superficiales.
- ❌ Documentar varias áreas en un solo archivo "porque están relacionadas" → se vuelve inservible para chunking y onboarding.
- ❌ Saltarse el glosario porque "los términos son obvios" → quien lea el doc fuera del área no entenderá.
- ❌ Resumir las decisiones del experto sin el "por qué" → la próxima persona las cambia sin saber.
- ❌ Quedarse solo con el "happy path" sin preguntar por gotchas → se pierde el conocimiento más valioso (el de los casos raros).

---

## Ejemplo de interacción

**Usuario:** _"@repertorio estandar-ia: Ferney quiere documentar el área de Nómina antes de irse de vacaciones"_

**Skill:**
> Listo. Vamos a construir el documento siguiendo el patrón validado de Aniro.
>
> **Fase 1 — Encuadre:**
> - Área a documentar: **Nómina** (confirmado)
> - Experto: **Ferney**
> - ¿Hay otras personas que aportan conocimiento de nómina, o solo Ferney?
> - ¿El proceso de nómina se materializa en algún ETL/sistema/dashboard que podamos enlazar?
>
> Cuando me confirmes esto, pasamos a la Fase 2: glosario.

_(El experto va respondiendo, la skill avanza fase por fase, y al final entrega el archivo `KB-NOMINA-LiquidacionMensual_v1_0.md` siguiendo la plantilla.)_

---

## Después de generar el documento

Una vez producido el documento, hay 2 caminos:

### Camino 1 — Uso como contexto monolítico (Nivel 1)

Si el documento cabe en el contexto del agente (~200K tokens en Claude), se puede usar tal cual:

- Cargarlo en `CLAUDE.md` o equivalente
- El agente lo usa completo en cada interacción
- Es el patrón que Aniro usa hoy

### Camino 2 — Uso como insumo para RAG (Nivel 2)

Si el corpus crece (varios documentos KB del equipo, miles de páginas), aplicar la skill `GOV-CTX-DisenarRAG_v1_0` (BORRADOR) para:

- Chunkear el documento
- Vectorizar
- Recuperar selectivamente

El documento producido por esta skill **ya está optimizado para chunking** porque mantiene headings claros y secciones autocontenidas.

---

## Relación con otras skills del tema

| Skill | Cuándo se usa |
|---|---|
| `GOV-CTX-NombrarActivoIA_v1_0` | Para nombrar activos de IA (no docs KB) |
| `GOV-CTX-EstructurarPrompt_v1_0` | Para construir prompts/agentes |
| `GOV-ENR-DocumentarArea_v1_0` (esta) | Para construir documentos de conocimiento |
| `GOV-CTX-DisenarRAG_v1_0` (BORRADOR) | Para diseñar el RAG que consume estos docs |
