# QA Prompts

Plantillas reutilizables para guiar cada etapa del flujo de QA.

---

## 1. Leer HU y extraer requisitos

Analiza la siguiente Historia de Usuario:

{{hu}}

Extrae:
- actor
- acción
- resultado
- criterios de aceptación

Si falta información, infiérela de forma lógica.
Detecta posibles errores o ambigüedades.

---

## 2. Análisis semántico

A partir de esta información:

{{hu_parsed}}

Genera:
- palabras clave relevantes
- sinónimos usados comúnmente en código

Incluye términos en inglés y convenciones de desarrollo.

---

## 3. Análisis de código

Usando las siguientes palabras clave:

{{keywords}}

Busca en el código:
- endpoints
- funciones
- servicios
- validaciones

Devuelve solo evidencia relevante.

---

## 4. Análisis de base de datos

Usando las palabras clave:

{{keywords}}

Consulta la base de datos y encuentra:
- tablas relacionadas
- columnas relevantes
- posibles relaciones

**Orden de prioridad de fuentes:**

1. **MCP de BD activo** (`mcp__sqlserver`, `mcp__postgres`, etc.) — usar siempre que esté disponible.
2. **Backup** (`.bak`, `.sql`, `.dump` en el repo) — usar SOLO si no hay MCP.
3. **Ninguna fuente** — reportar error y continuar el workflow sin evidencia de BD.

**Reglas:**
- Si hay MCP, NO usar backup aunque exista.
- Reportar siempre `source` (`mcp` / `backup` / `none`) y `mcp_available` (true/false) en el output.
- Si se usa backup, incluir advertencia de posible desactualización.
- Si no hay MCP, reportarlo explícitamente aunque se haya usado backup como fallback.

---

## 5. Trazabilidad

Relaciona:
- la HU
- el código encontrado
- la base de datos

Identifica:
- conexiones entre capas
- inconsistencias
- elementos faltantes

---

## 6. Evaluación de reglas

Evalúa la implementación usando las reglas definidas:

{{rules}}

Detecta:
- errores (incumplimientos)
- advertencias (parcial cumplimiento)

---

## 7. Medición de cobertura

Con base en toda la información:

{{analysis}}

Determina:
- porcentaje de cobertura (0–100)
- qué está implementado
- qué falta

---

## 8. Validación QA

Evalúa si la HU:
- cumple
- cumple parcialmente
- no cumple

Justifica con evidencia concreta.

---

## 9. Sugerencias de mejora

Con base en los errores detectados:

{{issues}}

Propón:
- mejoras concretas
- acciones implementables

Evita sugerencias genéricas.

---

## 10. Generación de pruebas

Basado en la HU y el análisis:

{{hu_parsed}}

Genera:
- casos positivos (happy path)
- casos negativos (errores)

Asegura cobertura funcional.