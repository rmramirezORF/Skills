# Conocimiento del área — {NOMBRE_AREA}

> Plantilla para documentar TODO el conocimiento operativo de UNA sola área de ORF.
> Basada en el patrón validado de `aniro-main/docs/rules/orf-business-logic.md`.
>
> **Regla de oro:** un documento = un área. Si el experto menciona conocimiento de otra
> área, abrir un documento separado para esa área.

---

## Metadata

```yaml
area:           {Nombre del área, ej. Cartera, Nómina, Inventario}
owner:          {Persona dueña del conocimiento}
entrevistado:   {Quién aportó la información}
entrevistador:  {Quién condujo la entrevista}
fecha:          {YYYY-MM-DD}
version:        v1_0
fuente_etl:     {Si aplica: ETL/dashboard/sistema que materializa estas reglas}
sistemas:       [{Lista de sistemas que toca: Arsys, ERP, etc.}]
```

---

## Índice

1. [Glosario del área](#1-glosario-del-área)
2. [IDs y códigos maestros](#2-ids-y-códigos-maestros)
3. [Mapa de procesos del área](#3-mapa-de-procesos-del-área)
4. [Procesos en detalle](#4-procesos-en-detalle)
5. [Reglas de negocio críticas](#5-reglas-de-negocio-críticas)
6. [Decisiones de diseño y por qué](#6-decisiones-de-diseño-y-por-qué)
7. [Gotchas, casos límite y bitácora de fixes](#7-gotchas-casos-límite-y-bitácora-de-fixes)
8. [Validaciones obligatorias](#8-validaciones-obligatorias)
9. [Fuentes y sistemas relacionados](#9-fuentes-y-sistemas-relacionados)
10. [Apéndice — valores de referencia](#10-apéndice--valores-de-referencia)

---

## 1. Glosario del área

> Términos que la gente del área usa con un significado específico (puede que distinto del uso general). Sin glosario, quien lea esto sin contexto se va a confundir.

### Términos de negocio

| Término | Definición | Sinónimos comunes (que NO se deben usar) |
|---|---|---|
| {Término} | {Definición clara, 1-2 frases} | {Variantes a evitar} |

### Términos técnicos / del sistema

| Término | Definición | Fuente (tabla, módulo, sistema) |
|---|---|---|
| {Término} | {Definición} | {Dónde vive en el sistema} |

---

## 2. IDs y códigos maestros

> Identificadores estables que se usan en filtros, reportes y reglas. Preferir IDs sobre nombres (los nombres cambian, los IDs no).

### {Categoría 1 — ej. Segmentos / Tipos / Estados}

| ID | Nombre | Uso |
|---|---|---|
| {id} | {nombre} | {cuándo se usa} |

### {Categoría 2 — ej. Cuentas contables / Códigos de proceso}

| Código | Descripción | Uso |
|---|---|---|
| {código} | {descripción} | {cuándo se usa} |

---

## 3. Mapa de procesos del área

> Listado de los procesos principales que el área ejecuta. Esta sección es solo una vista de conjunto — el detalle va en la sección 4.

```
{Diagrama ASCII o lista numerada de procesos}

Ej:
1. {Proceso A}
   ├── {Sub-proceso A.1}
   └── {Sub-proceso A.2}
2. {Proceso B}
3. {Proceso C}
```

| # | Proceso | Frecuencia | Owner | Sistemas |
|---|---|---|---|---|
| 1 | {Nombre} | diario / semanal / mensual / trigger | {persona} | {sistemas} |

---

## 4. Procesos en detalle

> Por cada proceso del mapa anterior, una sub-sección con: qué hace, cuándo se ejecuta, fórmula/SQL si aplica, y reglas que rigen.

### 4.1 {Nombre del proceso}

**Qué hace:** {descripción en 1-2 frases}

**Cuándo se ejecuta:** {trigger temporal o de evento}

**Fuente de datos:** {tablas, archivos, APIs}

**Fórmula / Lógica:**

```
{Si aplica: SQL, fórmula matemática, pseudocódigo, regla en prosa}
```

**Reglas críticas:**

1. {Regla 1}
2. {Regla 2}
3. {Regla 3}

### 4.2 {Otro proceso}
...

---

## 5. Reglas de negocio críticas

> Reglas transversales del área (no específicas de un proceso). Lo que SIEMPRE debe cumplirse, sin importar el proceso.

| # | Regla | Por qué | Consecuencia si se viola |
|---|---|---|---|
| 1 | {Regla} | {Razón} | {Qué pasa mal} |

---

## 6. Decisiones de diseño y por qué

> Patrón **Decisión + Motivo** (lección de Aniro §15). Para cada decisión técnica/operativa importante, documentar la decisión Y el motivo. Sin el "por qué", la próxima persona la cambia sin querer.

### 6.1 {Nombre de la decisión}

**Decisión:** {Qué se hace}

**Motivo:** {Por qué se hace así (y no de otra forma)}

**Alternativas consideradas:** {opcional — qué se evaluó y se descartó}

### 6.2 {Otra decisión}
...

---

## 7. Gotchas, casos límite y bitácora de fixes

> Errores comunes, casos raros que parecen bugs pero son correctos, y bitácora de fixes que se han hecho. Este es el conocimiento que se pierde cuando alguien sale de vacaciones.

### 7.1 {Nombre del gotcha o fix}

**Síntoma observado:** {qué se vio que no cuadraba}

**Causa raíz:** {por qué pasaba}

**Fix aplicado:** {qué se hizo}

**Reglas derivadas:** {qué se aprendió, en formato de regla aplicable}

### 7.2 {Otro caso}
...

---

## 8. Validaciones obligatorias

> Checks que deben pasar antes de considerar que un proceso terminó bien. Aniro tiene "validación de cuadre post-ejecución" — patrón a replicar.

| Validación | Cuándo se ejecuta | Qué se verifica | Acción si falla |
|---|---|---|---|
| {nombre} | pre / post / continuo | {check} | {abortar / alertar / reintentar} |

---

## 9. Fuentes y sistemas relacionados

> A qué sistemas externos / archivos / APIs el área depende, y cómo se conectan.

| Sistema / Archivo | Tipo | Para qué se usa | Owner externo | Frecuencia de actualización |
|---|---|---|---|---|
| {nombre} | tabla / API / archivo / dashboard | {uso} | {persona/área externa} | {diaria / mensual / a demanda} |

---

## 10. Apéndice — valores de referencia

> Valores conocidos / golden dataset. Para cuando alguien re-ejecute un proceso, pueda comparar contra estos números y saber si está bien.

### 10.1 {Período de referencia, ej. Enero 2026}

| Métrica / Concepto | Valor esperado | Notas |
|---|---|---|
| {métrica} | {valor} | {contexto} |

---

## Notas para el entrevistador

- Si una sección no aplica al área → escribir `N/A — razón` (no eliminarla).
- Si el experto no recuerda un dato → dejar `[PENDIENTE — preguntar a {persona}]`.
- Cada cita textual del experto preservar literal (entre comillas) si es importante.
- Validar el documento con el experto antes de cerrar la versión.

## Notas para usar este documento

- **Como contexto monolítico:** el documento se carga completo en el contexto del agente.
- **Como insumo para RAG:** este documento se chunkea y vectoriza posteriormente. Por eso conservar headings claros (los chunks se cortan por sección).
- **Versionado:** cualquier cambio importante actualiza la versión en el frontmatter (v1_0 → v1_1 refinamiento, v1_x → v2_0 ruptura).
