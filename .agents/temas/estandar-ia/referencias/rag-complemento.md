# 📝 PROPUESTA — Complemento RAG al estándar ORF-STD-IA-2026-01

> ⚠️ **Estado: BORRADOR**. No forma parte del estándar oficial publicado por TI/Digital ORF.
> Este documento es una propuesta del equipo para **llevar a discusión** y eventualmente
> adoptar (o rechazar) en una próxima revisión del estándar (fase F4 — Gobernanza).
>
> **No usar como referencia oficial** hasta que sea aprobado.

---

## Por qué se propone

El estándar ORF-STD-IA-2026-01 cubre activos de IA en general (prompts, agentes, asistentes) pero **no documenta cómo construir y operar sistemas RAG** (Retrieval-Augmented Generation).

Un RAG no es solo un prompt — es una arquitectura compuesta por:

- Una base de conocimiento (texto, documentos, esquemas)
- Un proceso de indexación (chunking + embedding)
- Un retriever (consulta semántica al vector store)
- Un prompt que consume los chunks recuperados
- Una estrategia de citación de fuentes

Estandarizar cada una de estas piezas evita que cada equipo invente su propia versión y permite evaluar/auditar la calidad de manera comparable.

---

## Dos niveles de madurez

Antes del aparato técnico de chunking + embeddings + vector store, hay un nivel más simple que muchos casos de ORF pueden cubrir hoy. Esta propuesta distingue dos niveles:

### Nivel 1 — Knowledge Base monolítico

**Cuándo aplica:** el documento de conocimiento cabe completo en el contexto del agente (~200K tokens para Claude). Esto cubre la mayoría de áreas individuales.

**Ejemplo real en ORF:** [`aniro-main/docs/rules/orf-business-logic.md`](../../../../aniro-main/docs/rules/orf-business-logic.md) — 2600 líneas, 37 secciones, ya en producción. Ferney/equipo cargan ese documento como contexto y el agente trabaja con él directamente. **No hay vector store, no hay retrieval — solo lectura completa.**

**Ventajas:**
- Cero infraestructura adicional
- Trazabilidad perfecta (todo el contexto está visible)
- Fácil de auditar y versionar como un archivo Markdown

**Cuándo deja de servir:**
- El corpus excede ~100K-200K tokens
- Hay decenas de áreas y cargar todas sobra contexto
- Se necesita filtrar por metadata estructurada

**Cómo construirlo:** ver skill `GOV-ENR-DocumentarArea_v1_0` y plantilla `KB-AREA-TEMPLATE.md` — entrevistan al experto y producen el documento siguiendo el patrón Aniro.

### Nivel 2 — RAG completo

**Cuándo aplica:** el corpus excede el contexto, o se necesita búsqueda selectiva por metadata.

Es lo que cubre el resto de este documento (las 7 dimensiones técnicas).

**Insumo natural:** los documentos producidos en Nivel 1 (siguiendo `KB-AREA-TEMPLATE.md`) ya están optimizados para chunking porque tienen headings claros y secciones autocontenidas.

### Decisión recomendada

```
¿Cuántas áreas / cuánto corpus?
│
├── 1-3 áreas, < 100K tokens total
│   └── Nivel 1 (KB monolítico) — empezar aquí
│
├── 4-10 áreas, 100K-500K tokens
│   └── Nivel 1 con cargas selectivas (un doc por área, agente decide cuál cargar)
│
└── 10+ áreas, > 500K tokens, búsqueda selectiva
    └── Nivel 2 (RAG completo)
```

**Recomendación:** la mayoría de equipos en ORF probablemente cabe en Nivel 1 hoy. Migrar a Nivel 2 solo cuando el dolor sea real, no preventivamente.

---

## Cómo encaja con el estándar oficial

Esta propuesta **NO modifica** el estándar publicado. Lo extiende sin romperlo:

| Pieza del estándar oficial | Cómo se aplica al RAG |
|---|---|
| **6 dimensiones del nombre** | Se mantiene. Ver propuesta de tipo y proceso abajo. |
| **9 secciones del prompt** | Se mantienen. RAG se documenta dentro de `CONTEXT` y `PROCESS`. |
| **Versionado vMAJOR_minor** | Se aplica al activo Y por separado a la base de conocimiento (índice). |
| **Códigos cerrados** | Se proponen pequeñas extensiones, no reemplazos. |

---

## Decisión propuesta sobre clasificación

Un activo RAG **NO es un nuevo tipo** dentro de los 8 cerrados (CTX, QRY, ENR, RTR, SUM, VAL, ALS, RPT). Es una **arquitectura interna** del activo.

**Convención propuesta:**

- El tipo del activo se asigna según su **función externa**, no su implementación:
  - Si el activo responde consultas de usuarios → `QRY`
  - Si extrae estructura de texto no estructurado → `ENR`
  - Si resume al usuario → `SUM`
- En el `HEADER` del prompt, se agrega un campo nuevo: `arquitectura: rag`

Ejemplo:

```yaml
nombre:       FIN-QRY-Cartera_PreguntasFrecuentes_v1_0
arquitectura: rag                          # ← campo nuevo propuesto
indice:       idx-cartera-faq_v1_0         # ← campo nuevo propuesto
```

Así el catálogo de activos sigue funcionando con los 8 tipos cerrados, pero los RAG quedan identificables por la metadata.

---

## Las 7 dimensiones del diseño de un RAG

Toda propuesta de activo RAG debe documentar estas 7 dimensiones explícitamente.

### Dimensión RAG-1 — Base de conocimiento (qué se indexa)

- **Fuente:** ¿de dónde sale el texto? (documentos, BD, API, código, manuales)
- **Volumen estimado:** cuántos documentos / GB / tokens
- **Velocidad de actualización:** ¿estático? ¿se actualiza diario? ¿streaming?
- **Idioma(s):** español, inglés, mixto
- **Sensibilidad:** ¿hay PII? ¿información clasificada?

### Dimensión RAG-2 — Chunking (cómo se trocea)

| Parámetro | Opciones | Recomendación inicial |
|---|---|---|
| Estrategia | fixed-size / recursive / semantic / structural | recursive (para mezcla de docs) |
| Tamaño | 128–1024 tokens | 256-512 tokens |
| Overlap | 0–20% | 10–15% |
| Preservar estructura | sí (respetar headings) / no | sí cuando es markdown/HTML |

Documentar también: **qué metadata viaja con cada chunk** (documento padre, página, sección, fecha).

### Dimensión RAG-3 — Embedding (cómo se vectoriza)

| Parámetro | A documentar |
|---|---|
| Modelo | nombre y versión exactos (ej. `voyage-3-large`, `text-embedding-3-small`, `bge-m3`) |
| Dimensiones | 384 / 768 / 1024 / 1536 / 3072 |
| Normalización | L2 / coseno |
| Idioma del modelo | multilingüe vs solo inglés |
| Costo por millón de tokens | si aplica (modelo comercial) |

**Regla:** si se cambia el modelo de embedding, se debe **reindexar todo**. Eso fuerza nueva versión del índice (RAG-7).

### Dimensión RAG-4 — Vector store (dónde se guarda)

| Tecnología | Cuándo conviene |
|---|---|
| **pgvector** (extensión de PostgreSQL) | Si ya hay PostgreSQL en stack — bajo overhead operativo |
| **Azure AI Search** | Stack Microsoft (encaja con ORF) — managed, hybrid search nativo |
| **Qdrant / Weaviate / Milvus** | Open source, dedicados, alto rendimiento |
| **Pinecone** | Managed, sin infraestructura propia, SaaS |
| **SQL Server con vector type** (>= 2025) | Si se mantiene stack 100% Microsoft y hay licencia |

A documentar: tipo de índice (HNSW, IVF), parámetros de construcción.

### Dimensión RAG-5 — Retrieval (cómo se busca)

| Parámetro | Opciones |
|---|---|
| Tipo | dense (semantic) / sparse (BM25/keyword) / **hybrid** (recomendado) |
| top-k | 3–20 (típico: 5-10) |
| Threshold | umbral mínimo de similaridad (ej. coseno > 0.7) |
| Filtros | por metadata (fecha, autor, módulo) |
| Reranking | sí/no — ver RAG-6 |

**Patrón recomendado para casos serios:** hybrid con top-20 sparse + top-20 dense → fusión RRF → top-5 final.

### Dimensión RAG-6 — Re-ranking (refinamiento — opcional)

Cuando la calidad del retrieval no basta:

| Estrategia | Cuándo conviene |
|---|---|
| Cross-encoder (ej. `bge-reranker`) | Latencia aceptable, alta precisión |
| LLM-as-judge | Casos críticos, costo más alto |
| MMR (diversidad) | Cuando importa cubrir múltiples aspectos del query |
| Sin reranking | Casos simples / latencia crítica |

### Dimensión RAG-7 — Citation y trazabilidad (cómo se cita)

Todo activo RAG **debe** devolver, junto con la respuesta, la lista de fuentes consultadas. Formato sugerido:

```json
{
  "respuesta": "...",
  "fuentes": [
    {
      "documento_id": "Manual_Cartera_v3.pdf",
      "seccion": "3.2 Vencimiento",
      "pagina": 45,
      "score": 0.87,
      "fragmento": "Las cuotas vencidas..."
    }
  ]
}
```

Razones: auditoría, confianza del usuario, debugging cuando la respuesta es incorrecta.

---

## Versionado de RAG (extensión a la regla v1_0 / v1_x / v2_0)

Un RAG tiene **dos cosas que versionar independientemente**:

### Versión del activo (prompt + lógica)

Misma regla que el estándar oficial:
- `v1_0` inicial
- `v1_x` refinamiento (compatible)
- `v2_0` ruptura

Ejemplo: `FIN-QRY-Cartera_PreguntasFrecuentes_v1_2`

### Versión del índice (base de conocimiento)

Independiente del activo. Se nombra:

```
idx-{dominio}-{nombre}_v{MAJOR}_{minor}
```

Ejemplo: `idx-cartera-faq_v2_0`

| Cambio en el índice | Impacto |
|---|---|
| Cambio del modelo de embedding | RUPTURA → `v2_0` (reindex completo obligatorio) |
| Cambio de la estrategia de chunking | RUPTURA → `v2_0` |
| Cambio del vector store | RUPTURA → `v2_0` |
| Adición de documentos nuevos | REFINAMIENTO → `v1_(x+1)` |
| Borrado de documentos | REFINAMIENTO o RUPTURA según escala |

El HEADER del activo declara qué versión del índice consume:

```yaml
nombre:        FIN-QRY-Cartera_PreguntasFrecuentes_v1_0
indice:        idx-cartera-faq_v1_0
indice_compat: idx-cartera-faq_v1_x   # rangos compatibles
```

---

## Patrones comunes (5 arquetipos)

| Patrón | Cuándo usarlo | Complejidad |
|---|---|---|
| **Naive RAG** | Pruebas iniciales, dominios pequeños | Baja |
| **Hybrid RAG** (sparse + dense) | Producción típica con datos heterogéneos | Media |
| **Multi-hop RAG** | Preguntas que requieren combinar varios docs | Alta |
| **Agentic RAG** (con tool use) | El modelo decide qué retrievers invocar | Alta |
| **GraphRAG** | Conocimiento estructurado en grafo | Alta |

Recomendación inicial para ORF: **Hybrid RAG** como default. Subir complejidad solo si la métrica de calidad lo justifica.

---

## Métricas mínimas (cómo se evalúa)

Todo activo RAG debe reportar estas métricas en su HEADER al publicarse:

| Métrica | Cómo se mide | Threshold sugerido |
|---|---|---|
| **Recall@k** | ¿el chunk correcto está en los top-k retrieved? | ≥ 0.85 |
| **Precision@k** | ¿qué % de los top-k son relevantes? | ≥ 0.70 |
| **Faithfulness** | ¿la respuesta se basa en los chunks recuperados? | ≥ 0.90 |
| **Answer relevancy** | ¿la respuesta responde la pregunta? | ≥ 0.85 |
| **Latencia p95** | tiempo total de respuesta | depende del caso |

Frameworks comunes para medir: RAGAS, TruLens, DeepEval.

---

## Anti-patrones (a no hacer)

- ❌ **Indexar todo "por si acaso"** sin curaduría → ruido, mala recall
- ❌ **Chunks demasiado grandes** (>1024 tokens) → respuestas vagas
- ❌ **Chunks demasiado chicos** (<128 tokens) → falta contexto
- ❌ **Solo dense retrieval** sin probar hybrid → se pierden matches por nombres exactos, códigos, IDs
- ❌ **No versionar el índice** → respuestas que cambian sin razón visible
- ❌ **No citar fuentes** → no se puede auditar ni corregir
- ❌ **Reindexar parcial cuando se cambió el modelo de embedding** → vectores incompatibles
- ❌ **Mezclar idiomas en chunks sin marcar metadata** → embeddings degradados
- ❌ **Construir RAG sin métricas previas** → no se sabe si mejora o empeora con cambios

---

## Checklist antes de promover a producción

- [ ] Las 7 dimensiones (RAG-1 a RAG-7) están documentadas en el HEADER del activo
- [ ] El índice tiene versión propia (`idx-...`)
- [ ] Hay dataset de evaluación (mínimo 30 preguntas representativas con ground truth)
- [ ] Se midió Recall@k, Precision@k, Faithfulness y Answer Relevancy
- [ ] Las respuestas incluyen citación de fuentes con score
- [ ] Hay GUARDRAILS para: query fuera de scope, top-k vacío, score bajo
- [ ] Las RULES del prompt incluyen: "Si no hay evidencia en los chunks, NO inventar"
- [ ] Está definido el plan de actualización del índice (frecuencia, owner)
- [ ] Está definida la política de retención (¿cuánto tiempo se guardan los embeddings?)

---

## Preguntas abiertas para el equipo de gobernanza

Antes de que esta propuesta se vuelva estándar oficial, el equipo TI/Digital tendría que decidir:

1. **Stack tecnológico aprobado:** ¿qué vector stores se soportan oficialmente en ORF?
2. **Modelo de embedding por defecto:** ¿hay uno aprobado para todos los RAGs?
3. **Frameworks de evaluación:** ¿se adopta RAGAS, TruLens u otro?
4. **PII en bases de conocimiento:** ¿qué se permite indexar y qué no?
5. **Política de costos:** ¿hay budget máximo por activo RAG (tokens/llamadas/storage)?
6. **Dueño del índice vs dueño del activo:** ¿pueden ser personas distintas?
7. **Testing obligatorio:** ¿se exige dataset de evaluación antes de F3?
8. **Multi-tenant:** ¿un mismo índice puede servir a varios activos? ¿cómo se versiona si sí?

---

## Próximos pasos sugeridos

1. **Revisar este borrador** con el equipo TI/Digital ORF.
2. **Validar las decisiones de clasificación** (no agregar tipo nuevo, usar metadata).
3. **Decidir las preguntas abiertas** del bloque anterior.
4. **Promover a estándar oficial** (en F4 — Gobernanza) o ajustar.
5. Si se aprueba: integrar la skill complementaria `GOV-CTX-DisenarRAG_v1_0` al repertorio oficial.

---

## Lecciones del documento Aniro (referencia interna)

El equipo de ORF ya construyó un knowledge base sólido en `aniro-main/docs/rules/orf-business-logic.md`. De su estructura se extraen 7 patrones que toda KB del nivel 1 (y por extensión cada documento que alimente un RAG nivel 2) debería seguir:

| # | Patrón Aniro | Aplicación al estándar |
|---|---|---|
| 1 | **Glosario al inicio** | Sin definir términos del dominio, los chunks pierden semántica. Sección 1 obligatoria. |
| 2 | **IDs y códigos maestros** sobre nombres | Los nombres cambian, los IDs no. Metadata de chunks debe usar IDs estables. |
| 3 | **Patrón "Decisión + Motivo"** | Cada decisión técnica documenta su razón. Sin motivo, la próxima persona la cambia sin saber. |
| 4 | **Filtros genéricos vs hardcoded** | Capturar nuevos casos sin reentrenar (ej. regex de exclusión en lugar de listas) |
| 5 | **Validación obligatoria con falla explícita** | Si no hay datos suficientes, fallar — nunca calcular con valores inventados o por defecto |
| 6 | **Bitácora histórica de fixes** | Bug → Síntoma → Fix → Reglas derivadas. Patrón replicable en `KB-AREA-TEMPLATE.md` sección 7. |
| 7 | **Apéndice con valores de referencia** | Golden dataset embebido en el doc. Permite validar futuros cambios. |

Estos 7 patrones están integrados a la plantilla [`KB-AREA-TEMPLATE.md`](../assets/KB-AREA-TEMPLATE.md) y a la skill [`GOV-ENR-DocumentarArea_v1_0`](../skills/GOV-ENR-DocumentarArea_v1_0/SKILL.md).

---

## Glosario rápido

- **RAG**: Retrieval-Augmented Generation. Arquitectura que recupera contexto relevante de una base de conocimiento antes de generar la respuesta.
- **Chunk**: fragmento de texto producido al trocear un documento.
- **Embedding**: vector numérico que representa el significado semántico de un texto.
- **Retrieval**: proceso de buscar los chunks más relevantes a una consulta.
- **Re-ranking**: segundo paso opcional para refinar el orden de los chunks recuperados.
- **HNSW**: algoritmo de índice vectorial común (Hierarchical Navigable Small World).
- **BM25**: algoritmo clásico de retrieval por keywords.
- **MMR**: Maximal Marginal Relevance — estrategia para diversificar resultados.
- **Faithfulness**: métrica que mide cuánto se ciñe la respuesta a las fuentes recuperadas.
