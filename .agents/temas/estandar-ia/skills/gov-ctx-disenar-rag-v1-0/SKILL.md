---
name: gov-ctx-disenar-rag-v1-0
description: >
  Define las 7 dimensiones técnicas del RAG (Retrieval-Augmented Generation)
  para un nuevo agente o asistente de IA en ORF. Se invoca DESPUÉS de tener
  un corpus de KBs producidos por `gov-enr-documentar-area-v1-0`.

  Trigger: SOLO se carga si el repertorio está activo (@repertorio) Y el
  prompt menciona: "diseñar RAG", "definir chunking", "elegir embedding",
  "configurar vector store", "evaluar retrieval", "diseñar arquitectura RAG",
  "evaluación de RAG", "ground truth RAG".
  Si NO hay @repertorio, NO cargar.
---

# Diseño técnico de un RAG (Retrieval-Augmented Generation) — ORF

## Cuándo usar esta skill

- Ya existe un **corpus de KBs** producidos por `gov-enr-documentar-area-v1-0`.
- Hay que **diseñar o auditar** el pipeline de RAG que servirá esos KBs.
- Se va a construir un agente nuevo, o se va a evaluar uno existente (como ANIRO).

**No usar esta skill si:**
- Todavía no hay KBs ingestables (ir primero a `gov-enr-documentar-area-v1-0`).
- El problema es de **prompting** del agente (ir a `gov-ctx-estructurar-prompt-v1-0`).
- El problema es de **nombrado** del activo (ir a `gov-ctx-nombrar-activo-ia-v1-0`).

---

## Las 7 dimensiones técnicas del RAG

Todo RAG productivo de ORF debe decidir explícitamente las 7 dimensiones siguientes. Para cada una hay una **decisión recomendada** (lo que usamos en ANIRO) y los criterios para revisarla.

### 1. Chunking — cómo se parte el corpus

| Aspecto | Recomendado en ORF | Por qué |
|---|---|---|
| Estrategia | Paragraph-aware (no fixed-size) | Preserva contexto semántico — un párrafo es una unidad de sentido completa |
| Tamaño objetivo | ~500 tokens | Equilibrio entre granularidad y costo de embedding |
| Solape (overlap) | 50-100 tokens | Evita perder contexto en bordes de chunks |
| Conservar metadata | Frontmatter completo + path del archivo | Permite filtrar y citar en producción |

**Anti-patrón**: chunks fijos de 1000+ tokens sin overlap → pierde queries puntuales sobre subtemas.

### 2. Embedding — modelo de vectorización

| Aspecto | Recomendado en ORF | Por qué |
|---|---|---|
| Modelo | `intfloat/multilingual-e5-large` | Multilingüe (es/en), rinde bien en español de negocios |
| Dimensiones | 1024 | Suficiente para el corpus actual (~600 chunks) |
| Local vs API | **Local vía fastembed** | Sin dependencia externa, sin costo recurrente, sin envío de datos a terceros |
| Cache | `~/.cache/orf-aniro/fastembed/` | ~2.2 GB en primera descarga |

**Anti-patrón**: usar OpenAI ada-002 → envía contenido corporativo a un tercero, costo recurrente.

### 3. Vector store — dónde viven los embeddings

| Aspecto | Recomendado en ORF | Por qué |
|---|---|---|
| Tecnología | Postgres + **pgvector** | Misma BD que el resto del sistema (auth, audit, conversaciones) — operación simplificada |
| Índice | **HNSW** (no IVFFlat) | Mejor recall en corpus pequeño/mediano |
| Tipo de columna | `vector(1024)` | Coincide con dimensiones del embedding |
| Adicionales para hybrid | GIN sobre `tsvector` español + GIN trigram | Permite full-text search en paralelo |

**Anti-patrón**: vector store separado (Pinecone, Weaviate) → multiplica costo y complejidad operativa.

### 4. Retrieval — cómo se buscan los chunks relevantes

| Aspecto | Recomendado en ORF | Por qué |
|---|---|---|
| Estrategia | **Hybrid Search** (vector + BM25) | Vector captura semántica, FTS captura códigos/IDs exactos |
| Fusión | **Reciprocal Rank Fusion** (RRF, k=60) | Estándar para combinar rankings heterogéneos sin calibrar scores |
| Top-N por señal | 20 candidatos | Buen balance recall/costo antes de fusión |
| Filtros de permisos | Aplicados en CTE compartido | Filtra UNA sola vez, no por cada señal — más rápido y limpio |

**Anti-patrón**: solo vector search → falla en preguntas con códigos exactos (ej. "SC-FM-03-V1").

### 5. Re-ranking — re-orden de candidatos

| Aspecto | Recomendado en ORF | Por qué |
|---|---|---|
| Estado | **No implementado todavía** (Sprint 4 condicional) | Costo: +300-800ms por consulta, ganancia: +15-25% calidad |
| Modelo si se activa | `BAAI/bge-reranker-v2-m3` (local) o Cohere Rerank API | Multilingüe, latencia razonable |
| Cuándo activar | Solo si Langfuse muestra pulgares abajo en alta proporción | No optimizar a ciegas |

**Anti-patrón**: activar reranker por defecto en todos los queries → costo de latencia sin justificación.

### 6. Citación — cómo el agente referencia las fuentes

| Aspecto | Recomendado en ORF | Por qué |
|---|---|---|
| Formato | `[fuente: <title>]` o `[fuente: <source_path>]` al final de la respuesta | Trazabilidad sin saturar la prosa |
| Granularidad | Por documento, no por chunk | El usuario quiere saber QUÉ doc, no qué fragmento exacto |
| Múltiples fuentes | Listar separadas por coma | `[fuente: caracterizacion-1, orf-business-logic, cadena-de-valor]` |
| Cuando NO citar | Cuando la pregunta es meta (sobre el agente mismo) o cuando NO hay docs encontrados | Evita citas falsas |

**Anti-patrón**: omitir citaciones → el usuario no sabe de dónde viene la info, no puede verificar.

### 7. Evaluación — cómo se mide la calidad del RAG

| Aspecto | Recomendado en ORF | Por qué |
|---|---|---|
| Dataset mínimo | **≥30 preguntas** con ground truth | Suficiente para detectar regresiones; menos da muy pocas señales |
| Métricas | Recall@k, MRR, exact match en citas | Cubre relevancia + ranking + atribución |
| Herramienta | **Langfuse** (planeado para Sprint 2) | Captura trazas reales en producción, no solo benchmarks sintéticos |
| Frecuencia | Cada cambio mayor del RAG (re-chunking, nuevo modelo, etc.) | Catch de regresiones temprano |

**Anti-patrón**: lanzar a producción sin dataset de evaluación → cualquier degradación pasa desapercibida.

---

## Orden recomendado de decisión

```
1. Chunking ─── 2. Embedding ─── 3. Vector store ─┐
                                                   ├── 4. Retrieval ── 5. Reranking
                                                   │
                                  6. Citación ─────┤
                                                   │
                                  7. Evaluación ───┘ (cierra el loop)
```

1. **Primero**: cómo voy a partir el corpus (chunking) → eso define qué embedding tiene sentido.
2. **Segundo**: qué modelo de embedding → eso define las dimensiones del vector store.
3. **Tercero**: dónde guardo los vectores (vector store).
4. **Cuarto**: estrategia de retrieval (hybrid recomendado).
5. **Quinto**: si necesito reranking (opcional, condicional).
6. **Sexto**: cómo cito (afecta formato del prompt final).
7. **Séptimo**: cómo evalúo (define qué dataset y métricas usar).

---

## Output

Un documento `RAG-{NOMBRE_AGENTE}-Diseno_v1_0.md` con:

```markdown
# Diseño del RAG — {NOMBRE_AGENTE}

## 1. Chunking
- Estrategia: ...
- Tamaño: ... tokens
- Overlap: ... tokens

## 2. Embedding
- Modelo: ...
- Dimensiones: ...
- Local/API: ...

## 3. Vector store
- Tecnología: ...
- Índice: ...

## 4. Retrieval
- Estrategia: ...
- Fusión: ...
- Top-N: ...

## 5. Re-ranking
- Estado: ...
- Modelo (si aplica): ...

## 6. Citación
- Formato: ...
- Granularidad: ...

## 7. Evaluación
- Dataset: N preguntas con ground truth
- Métricas: ...
- Herramienta: ...

## Decisiones y trade-offs
{razonamiento de las decisiones distintas a las recomendadas}
```

---

## Reglas

- ✅ Las 7 dimensiones son **obligatorias**. Si alguna no se decidió, marcarla `[PENDIENTE]`.
- ✅ Si se elige algo **distinto a la recomendación**, justificar en sección "Decisiones y trade-offs".
- ✅ Antes de publicar el RAG, **debe existir el dataset de evaluación** con ≥30 preguntas y ground truth.
- ❌ No saltarse dimensión 7 (Evaluación) "porque ya hay corpus". Sin evaluación no hay forma de saber si el RAG funciona o degrada.
- ❌ No optimizar dimensiones (reranking, embedding más grande) **antes** de tener métricas que indiquen que hay un problema.

---

## Referencia — ANIRO como caso vivo

ANIRO (agente RAG de ORF) implementa este estándar:

| Dimensión | Implementación en ANIRO |
|---|---|
| 1. Chunking | Paragraph-aware ~500 tokens (ver `backend/src/rag/chunking.py`) |
| 2. Embedding | `intfloat/multilingual-e5-large`, 1024 dims, fastembed local |
| 3. Vector store | Postgres + pgvector + HNSW (ver `backend/src/db/schema.py`) |
| 4. Retrieval | Hybrid (vector + tsvector) + RRF k=60 (ver `backend/src/rag/retrieval.py`) |
| 5. Re-ranking | No implementado (pendiente Sprint 4) |
| 6. Citación | `[fuente: <title>]` al final de la respuesta |
| 7. Evaluación | Pendiente Sprint 2 (Langfuse) — actualmente solo batería manual |
