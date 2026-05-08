---
name: GOV-CTX-DisenarRAG_v1_0
description: >
  📝 BORRADOR — propuesta de complemento al estándar ORF-STD-IA-2026-01.
  Guía el diseño de un activo RAG cubriendo las 7 dimensiones obligatorias
  (base de conocimiento, chunking, embedding, vector store, retrieval,
  re-ranking, citación) más versionado independiente del índice. Aún no es
  estándar oficial — usar para discusión con el equipo de gobernanza.

  Trigger: SOLO se carga si el repertorio está activo (@repertorio) Y el
  prompt pertenece al tema `estandar-ia` o menciona: "diseñar RAG",
  "armar RAG", "crear retrieval-augmented", "vector store", "embeddings",
  "chunking", "indexar documentos", "base de conocimiento". Si NO hay
  @repertorio, NO cargar.
estado: PROPUESTA — no aprobado por gobernanza
---

# 📝 Diseñar un activo RAG — PROPUESTA

> ⚠️ **Esta skill es BORRADOR.** Refleja una propuesta de complemento al estándar ORF
> que aún no ha sido aprobada por TI/Digital. Usar como guía técnica mientras tanto;
> validar con el equipo antes de publicar el activo en producción.

## Cuándo se ejecuta

Cuando alguien va a diseñar un sistema RAG (Retrieval-Augmented Generation) en ORF y necesita asegurar que cubra las 7 dimensiones técnicas y las decisiones de versionado/citación.

---

## Proceso (8 pasos)

### Paso 1 — Confirmar que es realmente un RAG

Verificar primero que el caso de uso justifica un RAG:

| Caso | ¿Conviene RAG? |
|---|---|
| Preguntas frecuentes sobre manuales/documentos | ✅ Sí |
| Buscar en una base de conocimiento que cambia | ✅ Sí |
| Responder con info que NO cabe en el contexto del modelo | ✅ Sí |
| Datos estructurados (tablas, registros) | ❌ No — usar `QRY` con T-SQL |
| Cálculos exactos sobre datos numéricos | ❌ No — usar lógica determinista |
| Información que cambia en tiempo real (API) | ⚠️ Híbrido — RAG + tool calls |

Si el usuario duda → preguntar qué tipo de input recibirá y qué tipo de output necesita.

### Paso 2 — Recolectar las 7 dimensiones

Preguntar al usuario una por una:

| # | Dimensión | Pregunta clave |
|---|---|---|
| 1 | Base de conocimiento | ¿De dónde sale el texto? ¿cuánto volumen? ¿qué tan seguido cambia? |
| 2 | Chunking | ¿Documentos estructurados o texto libre? ¿qué tamaño tienen los párrafos? |
| 3 | Embedding | ¿Hay modelo aprobado por TI? ¿multilingüe necesario? |
| 4 | Vector store | ¿Stack disponible? ¿managed o self-hosted? |
| 5 | Retrieval | ¿hybrid o solo dense? ¿cuántos chunks por consulta? |
| 6 | Re-ranking | ¿latencia crítica o se puede agregar paso adicional? |
| 7 | Citación | ¿qué metadata se requiere mostrar al usuario final? |

Si el usuario no sabe responder a varias → marcar las que faltan como "TBD" y avanzar; al final reportar qué quedó sin definir.

### Paso 3 — Asignar tipo y nombre canónico

El RAG NO es un nuevo tipo. Asignar según función externa:

| Función | Tipo |
|---|---|
| Responde preguntas del usuario | `QRY` |
| Estructura texto no estructurado | `ENR` |
| Resume documentos | `SUM` |

Componer el nombre con la skill `GOV-CTX-NombrarActivoIA_v1_0`.

Adicional al nombre del activo, definir el nombre del índice:
```
idx-{dominio}-{nombre}_v1_0
```

### Paso 4 — Diseñar el chunking

Sugerencia inicial según tipo de documento:

| Tipo de documento | Estrategia | Tamaño | Overlap |
|---|---|---|---|
| Manuales / PDFs estructurados | recursive + respect headings | 256-512 tokens | 10% |
| Texto plano largo (artículos) | recursive | 512 tokens | 15% |
| Código / queries / scripts | structural (por función/bloque) | variable | 0% |
| Tablas | una fila por chunk con headers | N/A | N/A |
| Conversaciones/tickets | un mensaje + contexto | 256 tokens | 0% |

Documentar la metadata que viaja con cada chunk: `documento_id`, `seccion`, `pagina`, `fecha`, `autor`, `version_documento`.

### Paso 5 — Elegir embedding y vector store

**Por defecto en stack ORF (sugerido):**

- **Embedding:** modelo multilingüe consistente con el corpus (preguntar a TI cuál está aprobado)
- **Vector store:** Azure AI Search si stack Microsoft / pgvector si ya hay PostgreSQL / Qdrant si se prefiere open source

**Documentar siempre:**
- Modelo exacto y versión (`text-embedding-3-large`, `bge-m3`, etc.)
- Dimensiones (1024, 1536, 3072)
- Tipo de índice (HNSW recomendado)
- Métrica de distancia (coseno típico)

### Paso 6 — Diseñar retrieval

**Recomendación inicial:** hybrid search.

```
top-20 sparse (BM25) + top-20 dense (embedding) → RRF fusion → top-5 final
```

Si el caso es simple (corpus pequeño, preguntas claras) → empezar con dense top-5 y subir complejidad si la métrica lo justifica.

Definir:
- top-k final (típico 3-10)
- Threshold mínimo de score (ej. 0.7 coseno) para filtrar resultados malos
- Filtros por metadata (por fecha, módulo, autor) si aplican

### Paso 7 — Definir citación obligatoria

**Toda respuesta del activo RAG debe incluir las fuentes consultadas:**

```json
{
  "respuesta": "...",
  "fuentes": [
    {
      "documento_id": "...",
      "seccion": "...",
      "pagina": 0,
      "score": 0.0,
      "fragmento": "..."
    }
  ]
}
```

Esto va en la sección OUTPUT del prompt — es OBLIGATORIO.

### Paso 8 — Estructurar el prompt con las 9 secciones del estándar

Usar la plantilla canónica de [PROMPT-TEMPLATE.md](../../assets/PROMPT-TEMPLATE.md) con estos refuerzos para RAG:

- **HEADER:** agregar campos `arquitectura: rag`, `indice: idx-...`, `indice_compat: idx-..._vN_x`
- **CONTEXT:** declarar la base de conocimiento (qué se indexó, qué NO)
- **RULES:** incluir explícitamente:
  - "Si NO hay evidencia en los chunks recuperados → NO inventar; responder 'No tengo información sobre eso en mi base de conocimiento'."
  - "Citar SIEMPRE las fuentes en el formato OUTPUT."
- **PROCESS:** describir el flujo: query → retrieve → (rerank) → generate
- **OUTPUT:** incluir el bloque obligatorio de `fuentes`
- **GUARDRAILS:** definir qué hacer cuando:
  - top-k retorna vacío
  - todos los scores están bajo el threshold
  - los chunks recuperados se contradicen entre sí

### Paso 9 — Definir métricas y plan de evaluación

Antes de promover a producción:

- [ ] Dataset de evaluación: mínimo 30 preguntas con ground truth
- [ ] Recall@k ≥ 0.85
- [ ] Precision@k ≥ 0.70
- [ ] Faithfulness ≥ 0.90
- [ ] Answer relevancy ≥ 0.85
- [ ] Latencia p95 dentro del SLA del caso de uso

Framework sugerido: RAGAS (Python) o TruLens.

---

## Output esperado

Un objeto que documenta las 7 dimensiones del RAG diseñado:

```json
{
  "activo": {
    "nombre": "FIN-QRY-Cartera_PreguntasFrecuentes_v1_0",
    "tipo": "QRY",
    "arquitectura": "rag"
  },
  "indice": {
    "nombre": "idx-cartera-faq_v1_0",
    "rangos_compatibles": ["idx-cartera-faq_v1_x"]
  },
  "dimensiones": {
    "base_conocimiento": "Manuales de Cartera (47 PDFs, ~3000 páginas, español)",
    "chunking": { "estrategia": "recursive", "tamaño": 512, "overlap": "10%" },
    "embedding": { "modelo": "voyage-3-large", "dimensiones": 1024 },
    "vector_store": { "tecnologia": "pgvector", "indice": "HNSW", "metrica": "coseno" },
    "retrieval": { "tipo": "hybrid", "top_k": 5, "threshold": 0.7 },
    "reranking": { "estrategia": "cross-encoder", "modelo": "bge-reranker-base" },
    "citacion": { "campos": ["documento_id", "seccion", "pagina", "score"] }
  },
  "metricas_objetivo": {
    "recall_at_k": 0.85,
    "precision_at_k": 0.70,
    "faithfulness": 0.90,
    "answer_relevancy": 0.85
  },
  "preguntas_pendientes": [
    "Confirmar modelo de embedding aprobado por TI",
    "Definir frecuencia de reindexación"
  ]
}
```

---

## Reglas

- ✅ Las 7 dimensiones se documentan SIEMPRE, aunque alguna quede como "TBD".
- ✅ El índice tiene versionado propio (`idx-..._vN_M`) independiente del activo.
- ✅ Citación de fuentes es OBLIGATORIA en el OUTPUT.
- ✅ Antes de producción: dataset de evaluación con métricas medidas.
- ✅ Si se cambia el modelo de embedding → reindex completo + nueva versión MAJOR del índice.
- ❌ NO usar dense-only retrieval por defecto — preferir hybrid.
- ❌ NO permitir respuestas sin fuentes en producción.
- ❌ NO mezclar índices de distintos modelos de embedding.
- ❌ NO promover a producción sin métricas medidas.

---

## Anti-patrones a detectar

- ❌ "Vamos a indexar todo lo que tenemos" sin curaduría
- ❌ "Después le pongo evaluación" — sin baseline no se sabe si los cambios mejoran
- ❌ Confundir "el activo dice cosas correctas" con "el activo está bien diseñado"
- ❌ Reusar índices entre activos sin compatibilidad declarada en HEADER
- ❌ Cambiar el modelo de embedding sin reindexar (los vectores son incompatibles)

---

## Ejemplo de uso

**Usuario:** _"@repertorio estandar-ia: ayúdame a diseñar un RAG para responder preguntas frecuentes sobre los manuales del módulo de cartera del ERP"_

**Skill:**
> Voy a guiarte por las 7 dimensiones del RAG. Empecemos:
>
> **Dimensión 1 — Base de conocimiento:**
> - ¿Cuántos manuales hay y en qué formato?
> - ¿Están en español, inglés o mixto?
> - ¿Cada cuánto se actualizan?

_(El usuario va respondiendo y la skill avanza dimensión por dimensión, devolviendo al final el JSON estructurado con las 7 dimensiones documentadas y las preguntas pendientes para el equipo de gobernanza.)_

---

## Estado del estándar de RAG

| Fase | Acción |
|---|---|
| F0 — Borrador | ✅ Esta skill (propuesta) |
| F1 — Discusión | 🟡 Pendiente: revisar con TI/Digital ORF |
| F2 — Adopción | ⏸️ Cuando se aprueben las "preguntas abiertas" |
| F3 — Estándar oficial | ⏸️ Integrar al ORF-STD-IA como anexo |
