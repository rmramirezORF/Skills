---
# ─── DIMENSIONES DE FILTRADO (las lee el ingester de ANIRO — OBLIGATORIAS) ───
proceso: <slug-dominio>            # comercializacion_pt, gestion_humana, etc.
nivel: <publico|intermedio|restrictivo>
perfil: <funcional|tecnico|ambos>

# ─── CONTEXTO ORGANIZACIONAL (recomendados) ───
subproceso:                        # Subdivisión opcional (ej. cartera_blanco dentro de gestion_financiera)
area:                              # Nombre humano del área (ej. "Cartera Blanco")
codigo:                            # Código oficial del SIG (ej. CP-FI-01-V1, SC-CP-01-V1, CB-FM-11-V1)
tipo_fuente:                       # entrevista | isotools | extraccion-bd | mixta
fuente:                            # Detalle específico:
                                   #   - isotools → path del PDF original
                                   #   - entrevista → nombre de la persona
                                   #   - extraccion-bd → host/BD/path del código
                                   #   - mixta → listar las fuentes

# ─── METADATA EXTENDIDA (usar cuando aplican) ───
titulo:                            # Título humano del KB
version:                           # v1.0, v2.0...
fecha:                             # YYYY-MM-DD del KB
owner:                             # Persona o equipo responsable
empresas: []                       # Cuando aplica
bases_de_datos: []                 # Cuando es extracción técnica
periodicidad:                      # Quincenal | Mensual | Anual...
jurisdiccion:                      # Colombia, etc.
---

# KB <NombreCompletoDelArea>

> **Para qué sirve**: <una línea diciendo qué pregunta funcional/operativa permite responder este KB>.

> **No es**: <una línea diciendo qué NO cubre — útil para evitar mal uso>.

---

## 0. Convenciones de etiquetado (LEER PRIMERO)

> **Tags**: perfil=<tecnico|funcional|tecnico,funcional> | nivel=<publico|intermedio|restrictivo> | proceso=<slug> | sub_proceso=<…>

Cada sección significativa lleva una línea de **tags** justo bajo el encabezado. Esto le permite al RAG filtrar qué chunk se sirve a qué usuario.

| Etiqueta | Valores | Significado |
|---|---|---|
| `perfil` | `tecnico`, `funcional`, `tecnico,funcional` | A quién va dirigido el chunk |
| `nivel` | `publico`, `intermedio`, `restrictivo` | Profundidad de información (datos crudos requieren `restrictivo`) |
| `proceso` | slug de dominio (ver `general/glosario.md` sección 10.1) | Macroproceso al que pertenece |
| `sub_proceso` | libre | Subdivisión funcional para filtrado granular |

---

## 1. Reglas universales del modelo

> **Tags**: perfil=funcional | nivel=intermedio | proceso=<...> | sub_proceso=convenciones

Reglas que aplican a TODO el área. Convenciones de signo, estados de registros, modelo operativo, filosofía.

---

## 2. Contexto del dominio

> **Tags**: perfil=funcional | nivel=publico | proceso=<...> | sub_proceso=contexto

### 2.1 Qué es el módulo / proceso
<descripción de alto nivel — para qué existe>

### 2.2 Alcance funcional — qué SÍ hace
<lista de procesos cubiertos>

### 2.3 Qué NO hace
<lista de procesos NO cubiertos — evita confusiones>

### 2.4 Empresas y bases de datos
<empresas del grupo que aplican + BDs relevantes>

---

## 3. Modelo funcional — flujo macro

> **Tags**: perfil=funcional,tecnico | nivel=intermedio | proceso=<...> | sub_proceso=modelo

### 3.1 Flujo general
<diagrama o secuencia de pasos>

### 3.2 Tablas/entidades centrales
<lista de tablas principales con propósito>

### 3.3 Relaciones entre entidades
<FKs principales, cómo se navega el modelo>

### 3.4 IDs ancla del modelo
<PKs y FKs clave que el agente necesita conocer para hacer queries>

---

## 4. Catálogos de negocio

> **Tags**: perfil=funcional,tecnico | nivel=intermedio | proceso=<...> | sub_proceso=catalogos

Para cada catálogo importante:

### 4.X Nombre del catálogo

| Código | Significado | Notas |
|---|---|---|
| ... | ... | ... |

---

## 5. Reglas reales de cálculo

> **Tags**: perfil=funcional,tecnico | nivel=intermedio | proceso=<...> | sub_proceso=calculos

Capturar **literal** las fórmulas, NO parafrasear. Si hay SQL, conservarlo.

### 5.X Nombre del cálculo (con código si existe, ej. L-01)

```
<fórmula matemática>
```

Variables:
- `var1`: descripción
- `var2`: descripción

Casos especiales:
- ...

---

## 6. Ciclo de vida operativo

> **Tags**: perfil=funcional | nivel=intermedio | proceso=<...> | sub_proceso=ciclo

### 6.1 Ritmo del ciclo
<diario / quincenal / mensual / por evento>

### 6.2 Pasos en orden cronológico
<paso 1 → paso 2 → ...>

### 6.3 Responsables por paso
<matriz de quién hace qué>

---

## 7. Integraciones externas

> **Tags**: perfil=tecnico | nivel=intermedio | proceso=<...> | sub_proceso=integraciones

Sistemas externos con los que el módulo conversa:

| Sistema | Tipo de integración | Frecuencia | Notas |
|---|---|---|---|
| ... | ... | ... | ... |

---

## 8. Gotchas y observaciones del esquema real

> **Tags**: perfil=tecnico | nivel=restrictivo | proceso=<...> | sub_proceso=gotchas

Anti-patrones, inconsistencias y cosas que confunden al que entra por primera vez. **Numerar como G1, G2, ...** para citarlos fácil.

### G1. <Título descriptivo del gotcha>
<descripción + cómo se evita>

### G2. <...>
<...>

---

## 9. Validaciones obligatorias

> **Tags**: perfil=tecnico,funcional | nivel=intermedio | proceso=<...> | sub_proceso=validaciones

Reglas que SIEMPRE se cumplen en datos válidos. Sirven para detectar inconsistencias.

- ☑ <validación 1>
- ☑ <validación 2>

---

## 10. Fuentes y sistemas relacionados

Referencias a otros KBs, sistemas y documentación que complementan este:

- `<otro-kb>.md` — para qué
- `<sistema>` — qué provee

---

## 11. Apéndice — snapshot de datos (cuando aplique)

> **Tags**: perfil=tecnico | nivel=restrictivo | proceso=<...> | sub_proceso=snapshot

Conteos de filas, rangos temporales, métricas observadas en un momento específico. Útil para que el agente entienda la magnitud del módulo.

### Snapshot (fecha: YYYY-MM-DD)

| Métrica | Valor |
|---|---|
| Tablas operativas | N |
| Filas en tabla principal | N |
| Rango temporal | YYYY-MM a YYYY-MM |

---

## Cómo se usa esta plantilla

1. **Producir** el KB siguiendo `gov-enr-documentar-area-v1-0` (entrevista al experto).
2. **Estructurar** las respuestas según las secciones de arriba.
3. **Aplicar tags** a cada sub-sección — son obligatorias para el filtrado del RAG.
4. **Validar** con `gov-val-estructura-prompt-v1-0` antes de ingresar al RAG.
5. **Versionar** según `gov-ctx-versionar-activo-ia-v1-0` (v1_0 inicial, v1_1 refinamiento, v2_0 ruptura).
6. **Subir** a la carpeta correspondiente de `docs/rules/<dominio>/` en el repo de ANIRO.

> **Nota sobre el prefijo `KB-` en archivos**: el ingester de ANIRO acepta cualquier nombre (kebab-case) siempre que el frontmatter top-level tenga `proceso/nivel/perfil` válidos. El prefijo `KB-` es **convención visual** para distinguir documentos Knowledge Base estructurados según esta plantilla. Equivale al código `CTX` del estándar ORF-STD-IA-2026-01.
