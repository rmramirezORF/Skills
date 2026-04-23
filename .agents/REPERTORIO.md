---
name: repertorio
description: >
  Meta-skill activador del repertorio interno de Arsys.
  Trigger: SOLO cuando el usuario incluye literalmente "@repertorio" en su prompt.
  Si "@repertorio" NO aparece, esta skill no se activa y nada del repertorio se carga.
  Mantener este principio es esencial para evitar sobrecontextualización.
---

# Repertorio de Skills — Arsys

Esta skill es la **única puerta de entrada** al repertorio interno. Sin la palabra clave `@repertorio` en el prompt del usuario, el repertorio permanece inactivo.

---

## Reglas de activación

| Condición en el prompt | Acción |
|---|---|
| Contiene `@repertorio` | Activar el flujo descrito abajo |
| No contiene `@repertorio` | NO cargar nada del repertorio. Responder normalmente. |

---

## Flujo cuando se activa

1. **Leer el índice de temas** en `.agents/catalog/INDEX.md`.
2. **Identificar el tema** que el usuario menciona en el prompt (HU, Calidad, Documentación, Bugs, Frontend, Git, Meta).
3. **Entrar al tema** correspondiente en `.agents/temas/<tema>/`:
   - Si existe `WORKFLOW.md` → leerlo y ejecutar sus pasos en orden.
   - Si NO existe `WORKFLOW.md` → listar las skills del tema en `skills/` y elegir las que apliquen al prompt.
4. **Cargar las SKILL.md necesarias** y seguir sus instrucciones usando los tools nativos disponibles (Read, Grep, Bash, Glob, mcp__sqlserver, etc.).
5. **Consolidar y responder** al usuario con el resultado.

---

## Sintaxis aceptada

| Forma | Ejemplo |
|---|---|
| Como mención directa | `@repertorio valida esta HU: ...` |
| Con tema explícito | `@repertorio calidad: revisa este código` |
| Embebida en frase | `usa @repertorio para verificar bugs en este módulo` |

Todas son equivalentes. Lo importante es que `@repertorio` aparezca literalmente.

---

## Si `@repertorio` aparece pero no se identifica tema

Preguntar al usuario:

> "Activé el repertorio pero no detecto el tema. Disponibles: **HU**, **Calidad**, **Documentación**, **Bugs**, **Frontend**, **Git**, **Meta**. ¿Cuál aplica?"

NO asumir un tema por defecto. Esperar respuesta.

---

## Si `@repertorio` aparece y el tema existe pero está vacío (placeholder)

Avisar al usuario:

> "El tema `<tema>` está registrado en el repertorio pero aún no tiene skills definidas. ¿Quieres que crea una skill nueva para esto? (puedo usar el tema **Meta** para ayudarte)."

---

## Anti-patrones (no hacer)

- ❌ Activarse por palabras parecidas ("repertorios", "repositorio", "repertorio musical").
- ❌ Asumir que el usuario quiere usar el repertorio si hay coincidencia temática sin la palabra clave.
- ❌ Cargar todos los `SKILL.md` de un tema cuando solo se necesita uno.
- ❌ Leer otros temas cuando el prompt solo menciona uno.

---

## Estructura del repertorio

```
.agents/
├── REPERTORIO.md           ← Este archivo (activador)
├── catalog/
│   └── INDEX.md            ← Mapa de temas disponibles
└── temas/
    ├── hu/                 ← Validación de Historias de Usuario
    ├── calidad/            ← Estándares de código de Arsys
    ├── documentacion/      ← READMEs, ADRs, changelogs
    ├── bugs/               ← Análisis y resolución
    ├── frontend/           ← UI/componentes
    ├── git/                ← Commits, branches, releases
    └── meta/               ← Crear nuevas skills/temas
```

Cada tema es **autocontenido**: incluye su README, su WORKFLOW (opcional) y sus skills internas.
