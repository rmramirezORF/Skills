---
name: gov-ctx-guia-creacion-rag-v1-0
description: >
  Guía operativa para crear un documento de Knowledge Base (KB) que vaya al RAG
  de ANIRO. Cubre: qué es un KB, las 3 fuentes posibles (entrevista a persona,
  ISOTools/SIG, extracción de BD), frontmatter exigido por el ingester, naming,
  estructura del archivo, validación y ubicación en el repo.

  Trigger: SOLO se carga si el repertorio está activo (@repertorio) Y el prompt
  menciona: "crear KB", "crear RAG", "subir documento al RAG", "ingestar al RAG",
  "documentar para ANIRO", "cómo se hace un KB", "frontmatter del RAG",
  "naming de KB". Si NO hay @repertorio, NO cargar.
---

# Guía operativa — Cómo se crea un KB para ANIRO

## ¿Qué es un KB?

**KB** = **Knowledge Base** (Base de Conocimiento). Es un documento Markdown estructurado que documenta un **área, proceso o módulo del negocio** de ORF con suficiente detalle para que el agente RAG (ANIRO) responda preguntas operativas sobre él.

El prefijo `KB-` en nombres de archivo es una **convención visual** que usamos para distinguir Knowledge Bases formales (estructuradas según `assets/KB-AREA-TEMPLATE.md`) del resto de archivos del RAG (formatos, caracterizaciones, flujogramas, etc.).

Técnicamente, todos los KBs son equivalentes al tipo `CTX` del estándar [ORF-STD-IA-2026-01](../../referencias/dimensiones.md) — son archivos de contexto que el RAG consume.

---

## Las 3 fuentes de un KB

Antes de empezar, identifica de **dónde proviene** la información del KB. Esto determina varias cosas (campo `fuente:` del frontmatter, plantilla a usar, owner asignado).

### Fuente 1 — **Entrevista a persona** (`fuente: entrevista`)

El KB proviene de **una conversación con un experto del área** (compañero, gerente, analista, etc.). Se capturó vía:
- Una reunión grabada o transcrita.
- Una sesión guiada por la skill [`gov-enr-documentar-area-v1-0`](../gov-enr-documentar-area-v1-0/SKILL.md).
- Notas tomadas durante onboarding o handover.

**Características**:
- El `owner` es una persona con nombre y apellido.
- Captura conocimiento **tácito**: cómo se opera realmente, gotchas, atajos, "cómo nos saltamos esto".
- Puede contener fechas, casos puntuales, anécdotas que iluminan el porqué.

**Ejemplos actuales en `aniro/docs/rules/`**:
- `comercializacion_pt/kb-administracion-ventas-*.md` (4 archivos — entrevistas con Aprendiz, Analista, Coordinador, Directora)
- `general/mapa-procesos-orf.md` (entrevista con Laura Stefania Giraldo)

### Fuente 2 — **ISOTools / SIG** (`fuente: isotools`)

El KB proviene del **sistema corporativo de gestión documental ISOTools** que aloja los documentos oficiales del **Sistema Integrado de Gestión (SIG)** de ORF.

**Características**:
- El `owner` es un área o proceso (no una persona).
- Contiene la versión **oficial y aprobada** del proceso (con código tipo `CB-FM-11-V1`, `SC-FM-03-V1`, etc.).
- Estructura SIG estándar: objetivos, entradas, salidas, RACI, indicadores, formatos, flujogramas.
- Fuente única de verdad legal/normativa.

**Ejemplos actuales en `aniro/docs/rules/`**:
- `atencion_soporte_cliente/caracterizacion.md`, `formato-uso-imagen-menor.md`
- `comercializacion_pt/caracterizacion-gestion-de-la-venta.md`
- `gestion_financiera/cartera_blanco/flujograma-deterioro-de-cartera.md`
- Todos los `caracterizacion-*.md`, `formato-*.md`, `flujograma-*.md`, `matriz-raci.md`, `ficha-de-indicadores.md`

### Fuente 3 — **Extracción directa de BD / código** (`fuente: extraccion-bd`)

El KB proviene de **inspección directa del esquema de una base de datos** o del código de una aplicación. No hay una persona detrás contando — es el sistema mismo el que se documenta.

**Características**:
- El `owner` es típicamente un técnico (DBA, desarrollador, arquitecto).
- Captura **conocimiento estructural**: tablas, columnas, FKs, triggers, SPs, gotchas del esquema.
- Tiene snapshot temporal (`fecha: 2026-05-26`) porque la BD evoluciona.
- Muy útil para el perfil técnico del agente.

**Ejemplos actuales en `aniro/docs/rules/`**:
- `captacion_arroz/KB-BASCULA-PesajesPlantas_v3_0.md` (extracción del schema `Bascula`)
- `captacion_arroz/KB-PADDY-CompraYLiquidacion_v4_0.md` (extracción del schema `Paddy`)
- `gestion_humana/KB-NOMINA-LiquidacionYContratos_v1_0.md` (extracción de `ArsysNominaORF`)

### Fuente 4 — **Mixta** (`fuente: mixta`)

Cuando el KB combina varias fuentes (ej. entrevista + revisión de BD para validar). En el frontmatter listar las fuentes específicas en `fuentes:`.

**Ejemplo**:
- `gestion_humana/KB-NOMINA_v2_0.md` combina entrevistas (Ferney Acosta, Directora GH) con extracción del schema.

---

## Frontmatter canónico de un KB

El ingester (`backend/src/rag/ingest.py`) **solo lee 3 campos** del frontmatter para filtrar permisos (`proceso/nivel/perfil`). El resto son **metadata extendida** que viaja en el chunk y le da trazabilidad al humano y contexto al agente.

### Plantilla completa (recomendada)

```yaml
---
# ─── DIMENSIONES DE FILTRADO (las lee el ingester — OBLIGATORIAS) ───
proceso: <slug-dominio>            # comercializacion_pt, gestion_humana, etc.
nivel: <publico|intermedio|restrictivo>
perfil: <funcional|tecnico|ambos>

# ─── CONTEXTO ORGANIZACIONAL (recomendados) ───
subproceso:                        # Subdivisión opcional (ej. cartera_blanco dentro de gestion_financiera)
area:                              # Nombre humano del área (ej. "Cartera Blanco")
codigo:                            # Código oficial del SIG (ej. CP-FI-01-V1, SC-CP-01-V1, CB-FM-11-V1)
tipo_fuente: <entrevista|isotools|extraccion-bd|mixta>
fuente:                            # Detalle de la fuente:
                                   #   - Si tipo_fuente=isotools → path del PDF (ej. "Cartera blanco/Caracterización y Políticas/CARACTERIZACION.pdf")
                                   #   - Si tipo_fuente=entrevista → nombre de la persona (ej. "Laura Stefania Giraldo Chillón")
                                   #   - Si tipo_fuente=extraccion-bd → host/base/path del código (ej. "ArsysNominaORF en olddto.orf.com")
                                   #   - Si tipo_fuente=mixta → listar todas

# ─── METADATA EXTENDIDA (usar cuando aplican) ───
titulo:                            # Título humano del KB
version:                           # v1.0, v2.0... (recomendado en KBs versionados)
fecha:                             # YYYY-MM-DD del KB
owner:                             # Persona o equipo responsable de mantener este KB
empresas: []                       # Cuando aplica (ej. KBs multi-empresa: [Roa, TDH, IROA])
bases_de_datos: []                 # Cuando es extracción técnica
periodicidad:                      # Cuando aplica (Quincenal, Mensual, Anual)
jurisdiccion:                      # Cuando aplica (Colombia, etc.)
---
```

### Reglas

| Regla | Por qué |
|---|---|
| Los 3 campos del primer bloque (`proceso/nivel/perfil`) son **obligatorios** | El ingester de ANIRO los lee para filtrar permisos |
| `subproceso/area/codigo/tipo_fuente/fuente` son **recomendados** | Dan trazabilidad y permiten cross-reference con el doc original |
| Si un campo NO APLICA → **dejarlo vacío** (no eliminarlo) | Consistencia visual + futurabilidad (si más tarde aplica, ya está el placeholder) |
| Listas vacías → `[]` (formato YAML) | Estándar |
| **Distinción clave**: `tipo_fuente` (categoría) vs `fuente` (detalle específico) | `tipo_fuente: isotools` + `fuente: <path del PDF>` |

### Ejemplos reales del corpus

**ISOTools (descarga del SIG)**:
```yaml
---
proceso: comercializacion_pt
nivel: intermedio
perfil: ambos
subproceso:
area:
codigo: CP-FI-01-V1
tipo_fuente: isotools
fuente: Comercializacion PT/Fichas de indicadores/FICHA_DE_INDICADORES_COMERCIALIZACION_PT.pdf
---
```

**Entrevista a persona**:
```yaml
---
proceso: comercializacion_pt
nivel: intermedio
perfil: ambos
subproceso:
area: Administración de Ventas
codigo:
tipo_fuente: entrevista
fuente: Cristian Jhoan Serrato Mendoza (Analista de Administración de Ventas)
fecha: 2026-05-15
owner: Cristian Jhoan Serrato Mendoza
---
```

**Extracción técnica de BD**:
```yaml
---
proceso: gestion_humana
nivel: intermedio
perfil: ambos
subproceso:
area: Nómina (Liquidación de nómina y contratos)
codigo:
tipo_fuente: extraccion-bd
fuente: ArsysNominaORF en olddto.orf.com (216 tablas) + ArsysRoa2026.Nomina (24 tablas)
version: v1.0
fecha: 2026-05-26
owner: Oscar Alvarado Varón
empresas: [Roa, TDH, InversionesRoa, SemillasDelHuila]
bases_de_datos: [ArsysNominaORF, ArsysRoa2026]
---
```

### Tabla de `proceso:` — los **21 procesos canónicos** de ORF (vocabulario cerrado)

> **REGLA CRÍTICA**: `proceso:` SOLO puede ser uno de estos 21 valores. Si lo que documentas no encaja en ninguno, NO inventes un nuevo proceso → usa `subproceso:` (ver siguiente sección). El error más común es poner el sub-proceso en `proceso:` (ej. `proceso: liquidacion_nomina` cuando debería ser `proceso: gestion_humana, subproceso: liquidacion_nomina`).

**Procesos estratégicos (3)** — ¿hacia dónde vamos?

| Slug | Significado |
|---|---|
| `planeacion_estrategica` | Directivas, definición de metas, estrategia |
| `riesgo_cumplimiento` | Cumplimientos normativos, controles internos |
| `revisoria_fiscal` | Auditoría legal |

**Procesos misionales (10)** — ¿qué hacemos? (el core del negocio)

| Slug | Cadena | Significado |
|---|---|---|
| `captacion_arroz` | Arroz | Recepción y pesaje de materia prima (paddy) |
| `procesamiento_arroz` | Arroz | Trilla, molino — paddy → arroz blanco |
| `comercializacion_pt` | Arroz | Ventas, gestión comercial de PT (incluye Adm. de Ventas, GTM, Trade, Marcas) |
| `logistica_pt` | Arroz | Despachos, devoluciones de producto terminado |
| `atencion_soporte_cliente` | Arroz | PQRSF, autorizaciones, soporte post-venta |
| `aprovisionamiento_agroinsumos` | Agroinsumos | Compra de fertilizantes, agroquímicos, semillas |
| `mercadeo_agroinsumos` | Agroinsumos | Estrategia de comunicación y posicionamiento |
| `comercializacion_agroinsumos` | Agroinsumos | Venta a productores agrícolas |
| `logistica_agroinsumos` | Agroinsumos | Distribución y entrega |
| `gestion_idi` | Otras | Investigación y desarrollo (I+D+i) |

> *Nota: `gestion_calidad` (aseguramiento de producto) técnicamente es misional según el mapa, pero suele tratarse como apoyo. Por convención lo listamos como apoyo abajo.*

**Procesos de apoyo (8)** — ¿quién sostiene la operación? (transversales)

| Slug | Significado |
|---|---|
| `adquisiciones` | Compras generales (no agroinsumos) |
| `mantenimiento_infraestructura` | Infraestructura, equipos, plantas |
| `gestion_humana` | Talento, nómina, SST, capacitación |
| `gestion_financiera` | Tesorería, contabilidad, cartera, costos, tributario |
| `tecnologia` | TI: ARSYS, PDA, dashboards |
| `calidad_medio_ambiente` | Calidad de gestión SIG + medio ambiente |
| `gestion_calidad` | Calidad de producto terminado |
| `gestion_administrativa` | Archivo documental, jurídica, seguridad física |

**Especial: `general`** — transversal a TODO

| Slug | Cuándo usar |
|---|---|
| `general` | Cuando el KB NO pertenece a un proceso específico sino que es transversal: glosarios, mapa de procesos, business-logic, "qué es ORF". Vive en `docs/rules/general/`. |

---

### Regla de decisión: proceso vs subproceso vs nuevo

```
                ¿Mi KB documenta uno de los 21 procesos canónicos?
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
               SÍ                          NO
                │                           │
                ▼                           ▼
   proceso: <slug>          ¿Es parte de un proceso canónico?
   subproceso: (vacío)                     │
                              ┌────────────┴────────────┐
                              ▼                         ▼
                             SÍ                        NO
                              │                         │
                              ▼                         ▼
                  proceso: <padre>            Esto NO debería pasar.
                  subproceso: <mi-slug>       Es señal de que el mapa
                                              de procesos necesita
                                              actualización formal.
                                              → Marcar con [PROPUESTO]
                                              y discutir con gobierno IA
                                              antes de ingestar.
```

### `subproceso:` — formales conocidos

Estos sub-procesos YA existen como dominios en BD (legacy o por necesidad operativa). Si tu KB documenta uno de estos, ponlo en `subproceso:` y el `proceso:` padre arriba.

| Subproceso (slug) | Proceso padre |
|---|---|
| `go_to_market` | `comercializacion_pt` |
| `trade_marketing` | `comercializacion_pt` |
| `gestion_marcas` | `comercializacion_pt` |
| `cartera_blanco` | `gestion_financiera` |
| `sst` | `gestion_humana` |

### `subproceso:` — informales (sin slug propio en BD, pero conceptualmente válidos)

Si tu KB documenta uno de estos, ponlo como string libre en `subproceso:`. Son sub-procesos reales del negocio aunque no tengan dominio dedicado:

| Subproceso sugerido | Proceso padre | Ejemplo de uso |
|---|---|---|
| `liquidacion_nomina` | `gestion_humana` | `proceso: gestion_humana, subproceso: liquidacion_nomina` |
| `liquidacion_contrato` | `gestion_humana` | Retiro de empleado |
| `prestaciones_sociales` | `gestion_humana` | Cesantías, primas, vacaciones |
| `seguridad_social` | `gestion_humana` | PILA, aportes EPS/ARL/AFP |
| `tesoreria` | `gestion_financiera` | Pagos, MOVBAT |
| `contabilidad` | `gestion_financiera` | Asientos contables |
| `costos` | `gestion_financiera` | P&L precomputado |
| `cartera_insumos` | `gestion_financiera` | Crédito de agroinsumos |
| `administracion_ventas` | `comercializacion_pt` | Reportería comercial, indicadores |
| `gestion_de_la_venta` | `comercializacion_pt` | Procedimiento del rep (CP-CP-03-V2) |

### ¿Y si mi proceso no encaja en NINGUNO de los 21?

Esto **NO debería pasar** en el negocio actual de ORF. Pero si lo encuentras:

1. **PARA antes de ingestar**. No inventes un nuevo proceso top-level.
2. **Revisa el mapa de procesos** (`docs/rules/general/mapa-procesos-orf.md`) — quizá el slug existe con un nombre que no esperabas.
3. **Pregunta al equipo de gobierno IA**: ¿este KB es un sub-proceso de algún proceso canónico? ¿O realmente es un proceso nuevo que falta en el mapa oficial?
4. Si es **sub-proceso nuevo** → ponle slug descriptivo en `subproceso:` con `proceso:` padre. Documéntalo aquí para que se agregue a la lista informal.
5. Si es **proceso nuevo real** (rarísimo) → requiere actualización del mapa oficial ORF-STD-IA → no es decisión individual.

> El ingester actual tiene un **fallback de path** (gracias al hardening): si `proceso:` no existe en BD, usa la carpeta del archivo como respaldo. Eso evita que el doc se pierda, pero **NO es excusa** para poner slugs inválidos en el frontmatter.

### Tabla de `nivel:`

| Nivel | Hierarchy | Quién puede leer |
|---|---|---|
| `publico` | 1 | Cualquier usuario activo |
| `intermedio` | 2 | Usuarios `intermedio` y `restrictivo` |
| `restrictivo` | 3 | Solo usuarios `restrictivo` (admins / técnicos con acceso a datos reales) |

### Tabla de `perfil:`

| Perfil | Significado |
|---|---|
| `funcional` | Lenguaje de negocio. No incluye nombres de tablas, SQL ni código. |
| `tecnico` | Detalles de implementación: tablas, columnas, fórmulas, SQL. |
| `ambos` | Cualquier perfil puede leerlo (el agente adapta el lenguaje en la respuesta). |

### Campos opcionales (metadata extendida — útil para humanos, no para el ingester)

```yaml
fuente: entrevista | isotools | extraccion-bd | mixta
kb_id: KB-<AREA>-<NombreEspecifico>_v<MAJOR>_<minor>
titulo: <Título humano>
version: v<MAJOR>.<minor>
fecha: YYYY-MM-DD
owner: <Persona o equipo>
fuentes:
  - "<Fuente 1 específica>"
  - "<Fuente 2 específica>"
referencia: <link a documento original — ej. URL de ISOTools>
```

---

## Naming del archivo

### Reglas generales

- **Ubicación**: `docs/rules/<dominio>/<archivo>.md` (o `<dominio>/<sub-dominio>/<archivo>.md` cuando aplica).
- **Idioma**: kebab-case en español.
- **Sin acentos** ni caracteres especiales.

### Por fuente

**Entrevista a persona** → `kb-<area>-<rol>.md` o `kb-<tema>.md`
```
comercializacion_pt/kb-administracion-ventas-analista.md
comercializacion_pt/kb-administracion-ventas-directora.md
general/mapa-procesos-orf.md
```

**ISOTools / SIG** → tipo de documento + nombre específico
```
atencion_soporte_cliente/caracterizacion.md
atencion_soporte_cliente/formato-uso-imagen-menor.md
gestion_financiera/cartera_blanco/flujograma-deterioro-de-cartera.md
gestion_financiera/cartera_blanco/matriz-raci.md
```

**Extracción de BD** → `KB-<AREA>-<NombreEspecifico>_v<N>_<M>.md` (con prefijo `KB-` MAYÚSCULA por convención de Oscar/equipo técnico)
```
captacion_arroz/KB-BASCULA-PesajesPlantas_v3_0.md
captacion_arroz/KB-PADDY-CompraYLiquidacion_v4_0.md
gestion_humana/KB-NOMINA-LiquidacionYContratos_v1_0.md
```

> **Excepción al estándar**: los KBs de extracción técnica mantienen `KB-MAYÚSCULA` como convención visual. Es la única excepción aceptada al kebab-case del RAG porque comunica visualmente "esto es snapshot técnico estructurado".

---

## Estructura del contenido

Para KBs formales (los tipo `KB-*` con extracción o entrevista profunda), usar la plantilla [`assets/KB-AREA-TEMPLATE.md`](../../assets/KB-AREA-TEMPLATE.md). Tiene 12 secciones canónicas.

Para docs del SIG (caracterizaciones, formatos, flujogramas), **conservar la estructura original del documento ISOTools** — no forzar el template porque pierde fidelidad legal/normativa.

---

## Flujo end-to-end por fuente

### Flujo A — Documentar desde una persona

```
1. Identificar al experto y agendar reunión (60-120 min)
2. Invocar skill gov-enr-documentar-area-v1-0 (entrevista guiada)
3. Producir borrador en docs/rules/<dominio>/kb-<area>.md
4. Aplicar plantilla KB-AREA-TEMPLATE.md
5. Validar frontmatter (proceso, nivel, perfil, fuente: entrevista)
6. Re-ingestar localmente y probar con 3-5 preguntas
7. Push y deploy
```

### Flujo B — Subir doc de ISOTools

```
1. Descargar el documento oficial de ISOTools
2. Convertir a Markdown (manual o vía pandoc si es .docx)
3. Conservar el código original del SIG en el contenido (CB-FM-11-V1, etc.)
4. Ubicar en docs/rules/<dominio>/<sub-dominio>/<tipo>-<nombre>.md
5. Añadir frontmatter mínimo (proceso, nivel, perfil, fuente: isotools, referencia: <url ISOTools>)
6. Re-ingestar localmente
7. Push y deploy
```

### Flujo C — Documentar desde extracción de BD

```
1. Conectarse a la BD (SQL Server, Postgres, etc.) con un usuario read-only
2. Inventariar tablas, FKs, SPs, triggers, dominios de valores
3. Producir KB con plantilla KB-AREA-TEMPLATE.md (énfasis en secciones técnicas: 5, 8, 9, 11)
4. Capturar snapshot de conteos en la sección 11 (apéndice)
5. Frontmatter con fuente: extraccion-bd + perfil: tecnico (o ambos)
6. Re-ingestar localmente
7. Push y deploy
```

---

## Checklist antes de ingestar

- [ ] El archivo tiene **frontmatter top-level** válido (`proceso`, `nivel`, `perfil`).
- [ ] El `proceso:` es un slug que existe en `app.domains` (ver tabla arriba).
- [ ] El `nivel:` está acorde al contenido (datos reales → `restrictivo`, fórmulas/reglas → `intermedio`, info general → `publico`).
- [ ] El `perfil:` refleja a quién va dirigido el contenido.
- [ ] El campo opcional `fuente:` está definido (entrevista | isotools | extraccion-bd | mixta).
- [ ] El nombre del archivo está en kebab-case (o `KB-MAYÚSCULA` si es extracción técnica).
- [ ] El archivo está en la carpeta de dominio correcta (`docs/rules/<dominio>/`).
- [ ] Si el contenido cubre varios dominios → es transversal → va a `docs/rules/general/`.
- [ ] Si hay versionado (extracción de BD evoluciona) → seguir [`gov-ctx-versionar-activo-ia-v1-0`](../gov-ctx-versionar-activo-ia-v1-0/SKILL.md).
- [ ] Re-ingesta local: `cd backend && uv run python -m scripts.ingest`. Verificar `ingested:` y `chunks:` en el output.
- [ ] Probar con 3-5 preguntas relacionadas: el agente debe encontrar y citar el nuevo doc.

---

## Cómo se ingesta (operacional)

### Local
```bash
cd backend
uv run python -m scripts.ingest
```

Output esperado:
```
{"seen": N, "skipped_hash": N, "ingested": N, "chunks": N, ...}
```

### Producción (VM)
```powershell
cd C:\wamp64\www\aniro\backend
uv run python -m scripts.ingest
pm2 restart aniro-backend  # opcional, refresca pools
```

### Comportamiento del ingester

- **Si el `content_hash` ya existe** en BD → skip (idempotente).
- **Si el archivo cambió** (mismo `source_path`, hash distinto) → borra la versión anterior y reingest.
- **Si el frontmatter inválido** → fallback al path (carpeta) gracias al hardening del ingester.
- **Si la carpeta es `_referencias/`** → skip intencional.
- **Si la carpeta es `general/`** → ingesta sin `domain_id` (transversal).

---

## Errores comunes y cómo evitarlos

| Error | Síntoma | Solución |
|---|---|---|
| `proceso:` no existe en BD | Warning `ingest_unknown_domain` en log | Verificar tabla `app.domains` o crear el dominio antes |
| Frontmatter con valores anidados (`taxonomia: { proceso: [...] }`) | Cae a fallback de path | Usar campos top-level `proceso:`, `nivel:`, `perfil:` |
| Archivo en carpeta que NO existe en `app.domains` | Skip silencioso | Mover a una carpeta de dominio válido |
| Conflicto de nombres entre fuentes | Embeddings redundantes / ruidosos | Usar nombres distintos: `kb-administracion-ventas-analista.md` vs `caracterizacion-analitica-comercial.md` |
| Doc viejo en BD pero archivo eliminado | "Huérfano" en consultas | Limpiar con `DELETE FROM aniro.documents WHERE source_path = '...'` (CASCADE limpia chunks) |

---

## Versionado de KBs

- **`v1_0`** — Primera versión de un KB.
- **`v1_1`** — Refinamiento sin cambio estructural (ajuste de redacción, corrección, ejemplo nuevo). Compatible hacia atrás.
- **`v2_0`** — Cambio estructural: el contenido se reorganizó, el vocabulario cambió, una sección se eliminó/agregó. Conviven con `v1_x` durante deprecación.

Ver [`gov-ctx-versionar-activo-ia-v1-0`](../gov-ctx-versionar-activo-ia-v1-0/SKILL.md) para la decisión rápida.

**Para extracciones de BD**: cuando re-extraes el schema (mayo vs julio), si los conteos/estructura cambiaron significativamente → `v2_0`. Si solo se afinaron descripciones → `v1_1`.

---

## Plantillas y skills relacionadas

| Recurso | Cuándo usarlo |
|---|---|
| [`assets/KB-AREA-TEMPLATE.md`](../../assets/KB-AREA-TEMPLATE.md) | Plantilla de las 12 secciones canónicas para KBs formales |
| [`gov-enr-documentar-area-v1-0`](../gov-enr-documentar-area-v1-0/SKILL.md) | Cuando vas a entrevistar a un experto (Flujo A) |
| [`gov-ctx-disenar-rag-v1-0`](../gov-ctx-disenar-rag-v1-0/SKILL.md) | Cuando vas a diseñar/auditar el pipeline RAG (chunking, embedding, etc.) |
| [`gov-ctx-versionar-activo-ia-v1-0`](../gov-ctx-versionar-activo-ia-v1-0/SKILL.md) | Cuando actualizas un KB existente |
| [`gov-val-estructura-prompt-v1-0`](../gov-val-estructura-prompt-v1-0/SKILL.md) | Para validar que el contenido siga la estructura |

---

## Resumen ejecutivo

1. **Identifica la fuente**: entrevista, isotools o extracción-bd.
2. **Elige naming** acorde a la fuente (kebab-case general, `KB-MAYÚSCULA` solo para extracción técnica).
3. **Ubica en la carpeta del dominio** correspondiente.
4. **Frontmatter top-level obligatorio**: `proceso`, `nivel`, `perfil`.
5. **Campos opcionales recomendados**: `fuente`, `owner`, `fecha`, `version`, `referencia`.
6. **Re-ingesta local** y verifica con preguntas.
7. **Push y deploy**.
