---
name: db-analyzer
description: >
  Analiza la estructura y datos de la base de datos para validar la persistencia
  relacionada con una Historia de Usuario. Prioriza acceso vía MCP
  (mcp__sqlserver, mcp__postgres u otro conector activo); usa backup como
  fallback SOLO si no hay MCP disponible.
  Trigger: SOLO se carga si el repertorio está activo (@repertorio) Y el workflow
  del tema `hu` ejecuta este paso.
---

## Purpose
Verificar que la HU está soportada por estructuras y datos en la base de datos.

---

## ⚠️ Orden de prioridad de fuentes (estricto)

| Prioridad | Fuente | Cuándo usarla |
|---|---|---|
| 1 | **MCP de BD activo** (`mcp__sqlserver`, `mcp__postgres`, otros) | Siempre que esté disponible |
| 2 | **Archivo de backup** (`.bak`, `.sql`, `.dump` en el repo) | SOLO si no hay MCP de BD |
| — | Ninguna disponible | Reportar error y continuar sin evidencia |

**Regla absoluta:** si hay MCP, **NO se toca el backup** aunque exista en el proyecto. El backup es plan B, nunca complemento.

---

## Protocolo de selección de fuente

### Paso 1 — Detectar MCP de BD

Revisar tools disponibles que empiecen con `mcp__` y correspondan a un motor de BD (`mcp__sqlserver`, `mcp__postgres`, `mcp__mysql`, etc.).

| Resultado | Acción |
|---|---|
| 1 MCP de BD activo | Usarlo. Saltar al Paso 4. |
| Varios MCPs de BD activos | Preguntar al usuario cuál corresponde al proyecto. Saltar al Paso 4. |
| Ningún MCP de BD activo | Continuar al Paso 2. |

### Paso 2 — Buscar backup

Buscar en el proyecto archivos compatibles con un dump de BD:

- `**/*.bak`
- `**/*.sql` (especialmente nombres como `dump.sql`, `schema.sql`, `backup_*.sql`)
- `**/*.dump`
- Carpetas comunes: `backup/`, `backups/`, `db/`, `database/`, `dumps/`

| Resultado | Acción |
|---|---|
| Se encuentra al menos un backup | Usarlo. Reportar `source: "backup"` y `mcp_available: false`. Saltar al Paso 4. |
| Hay varios backups | Usar el más reciente por fecha de modificación. Reportar el path exacto. |
| No se encuentra backup | Continuar al Paso 3. |

### Paso 3 — Sin fuentes disponibles

Devolver:

```json
{
  "tables": [],
  "columns": [],
  "relationships": [],
  "evidence": [],
  "source": "none",
  "mcp_available": false,
  "backup_found": false,
  "error": "No se encontró MCP de base de datos activo ni archivos de backup en el proyecto. No se puede validar persistencia."
}
```

### Paso 4 — Análisis

Ejecutar la consulta sobre la fuente elegida usando keywords y sinónimos del input.

---

## Output Format

Return ONLY JSON. El campo `source` y `mcp_available` son **obligatorios siempre**.

### Caso A — MCP disponible (escenario ideal)

```json
{
  "tables": ["usuario"],
  "columns": ["correo", "password", "estado"],
  "relationships": ["usuario → rol"],
  "evidence": [
    "table: usuario (mcp__sqlserver__list_tables)",
    "column: correo (mcp__sqlserver__describe_table usuario)"
  ],
  "source": "mcp",
  "source_detail": "mcp__sqlserver",
  "mcp_available": true
}
```

### Caso B — Sin MCP, usando backup (fallback)

```json
{
  "tables": ["usuario"],
  "columns": ["correo", "password", "estado"],
  "relationships": ["usuario → rol"],
  "evidence": [
    "table: usuario (backup/db_dump.sql line 42)",
    "column: correo (backup/db_dump.sql line 45)"
  ],
  "source": "backup",
  "source_detail": "backup/db_dump.sql",
  "mcp_available": false,
  "warning": "MCP de base de datos no disponible. Análisis basado en backup que puede estar desactualizado."
}
```

### Caso C — Sin MCP y sin backup

```json
{
  "tables": [],
  "columns": [],
  "relationships": [],
  "evidence": [],
  "source": "none",
  "mcp_available": false,
  "backup_found": false,
  "error": "No se encontró MCP de base de datos activo ni archivos de backup en el proyecto."
}
```

---

## Rules

- ✅ Siempre intentar MCP primero
- ✅ Solo usar backup si NO hay MCP
- ✅ Reportar `source` y `mcp_available` en TODOS los outputs
- ✅ Si se usa backup, incluir `warning` advirtiendo que puede estar desactualizado
- ✅ Si no hay ninguna fuente, reportar el error explícito (no inventar datos)
- ❌ NO mezclar resultados de MCP y backup en la misma respuesta
- ❌ NO usar backup si MCP está disponible (aunque el backup parezca más completo)
- ❌ NO usar modelos ORM (`schema.prisma`, `*.entity.ts`) como fuente — son código, no BD
- ❌ NO inventar tablas o columnas que no estén en la fuente elegida

---

## Anti-patrones (no hacer)

- ❌ Tener MCP activo y aun así leer `backup/dump.sql` "para tener más cobertura"
- ❌ Reportar resultados sin indicar la `source`
- ❌ Si falla la consulta MCP en mitad del análisis, saltar silenciosamente al backup (reportar el fallo del MCP)
- ❌ Asumir que el backup está actualizado sin advertirlo

---

## Example completo

**Input:**
```json
{
  "keywords": ["usuario", "registrar"],
  "synonyms": ["user", "register", "createUser"]
}
```

**Si hay `mcp__sqlserver` activo → Output:**
```json
{
  "tables": ["usuario"],
  "columns": ["correo", "password", "estado"],
  "relationships": ["usuario → rol"],
  "evidence": [
    "table: usuario (mcp__sqlserver__list_tables)",
    "column: correo (mcp__sqlserver__describe_table usuario)"
  ],
  "source": "mcp",
  "source_detail": "mcp__sqlserver",
  "mcp_available": true
}
```

**Si NO hay MCP pero existe `backup/db_dump.sql` → Output:**
```json
{
  "tables": ["usuario"],
  "columns": ["correo", "password", "estado"],
  "relationships": ["usuario → rol"],
  "evidence": [
    "table: usuario (backup/db_dump.sql)",
    "column: correo (backup/db_dump.sql)"
  ],
  "source": "backup",
  "source_detail": "backup/db_dump.sql",
  "mcp_available": false,
  "warning": "MCP de base de datos no disponible. Análisis basado en backup que puede estar desactualizado."
}
```

**Si NO hay MCP y NO hay backup → Output:**
```json
{
  "tables": [],
  "columns": [],
  "relationships": [],
  "evidence": [],
  "source": "none",
  "mcp_available": false,
  "backup_found": false,
  "error": "No se encontró MCP de base de datos activo ni archivos de backup en el proyecto."
}
```
