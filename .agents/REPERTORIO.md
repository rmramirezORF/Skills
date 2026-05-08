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

## Tipos de tema

| Tipo | Dónde vive | Tiene owner |
|---|---|---|
| **Técnico transversal** (hu, calidad, frontend, git, meta, documentacion, bugs) | `temas/` | No — del equipo |
| **De negocio** (nómina, contabilidad, facturación, etc.) | `personas/<owner>/temas/` | Sí — una persona específica |

Los técnicos los conoce todo el equipo. Los de negocio tienen un dueño que los mantiene, pero **cualquiera puede ejecutarlos** cuando el dueño no está disponible.

---

## Flujo cuando se activa

### 1. Detectar la sintaxis usada

| Sintaxis | Acción |
|---|---|
| `@repertorio <tema>` | Buscar `<tema>` primero en `temas/` (técnico). Si no está, buscar en `personas/*/temas/<tema>/` (negocio). |
| `@repertorio <persona>` | Cargar `personas/<persona>/PERFIL.md`. Listar sus dominios y preguntar cuál usar. |
| `@repertorio <persona> <tema>` | Entrar directo a `personas/<persona>/temas/<tema>/`. |
| `@repertorio <tema> onboarding` | Cargar README + glosario del tema SIN ejecutar skills. Para sustitutos. |
| `@repertorio` (solo) | Preguntar qué tema o persona se quiere usar. |

### 2. Buscar el tema

- Empezar por `catalog/INDEX.md` (temas técnicos).
- Si no está, consultar `catalog/PERSONAS.md` y buscar en `personas/*/temas/`.
- Si hay **0 coincidencias** → "No encuentro el tema X. Técnicos disponibles: ... De negocio disponibles: ..."
- Si hay **1 coincidencia** → entrar. Si es de negocio, mencionar al owner: "Tema 'nomina' (owner: Ferney)".
- Si hay **N coincidencias** → preguntar al usuario cuál.

### 3. Entrar al tema

- Si existe `WORKFLOW.md` → leerlo y ejecutar sus pasos en orden.
- Si NO existe `WORKFLOW.md` → listar las skills de `skills/` y elegir las que apliquen al prompt.
- Para temas de negocio: leer también `README.md` y `glosario.md` para tener contexto del dominio.

### 4. Ejecutar

Cargar las `SKILL.md` necesarias y seguir sus instrucciones usando los tools nativos disponibles (Read, Grep, Bash, Glob, MCP, etc.).

### 5. Consolidar y responder

Devolver el resultado al usuario. Si se entró a un tema de negocio sin que el owner esté presente, sugerir al final: "_Owner del tema: <nombre>. Notificarle el cambio si es relevante._"

---

## Modo onboarding (sustitutos)

Cuando el prompt es del estilo `@repertorio <tema> onboarding`, `@repertorio aprende <tema>` o `@repertorio explícame <tema>`:

1. Cargar `README.md` del tema (contexto del dominio).
2. Cargar `glosario.md` (términos del negocio).
3. Listar las skills disponibles SIN ejecutar ninguna.
4. Mostrar al owner y suplentes desde el `PERFIL.md`.
5. Devolver un resumen estructurado para que el sustituto se ponga al día.

Ejemplo: `@repertorio nomina onboarding` → Deimar recibe el contexto completo de nómina sin ejecutar liquidaciones.

---

## Sintaxis aceptada

| Forma | Ejemplo |
|---|---|
| Tema técnico | `@repertorio valida esta HU: ...` |
| Tema técnico explícito | `@repertorio calidad: revisa este código` |
| Tema de negocio | `@repertorio nomina: liquidar a Pedro` |
| Persona + tema | `@repertorio ferney nomina: liquidar a Pedro` |
| Solo persona | `@repertorio ferney` (lista sus dominios) |
| Onboarding | `@repertorio nomina onboarding` |
| Embebida en frase | `usa @repertorio para verificar bugs en este módulo` |

---

## Si no se identifica tema o persona

Preguntar al usuario:

> "Activé el repertorio pero no detecto el tema o la persona. Opciones disponibles:
> - **Temas técnicos:** HU, Calidad, Documentación, Bugs, Frontend, Git, Meta
> - **Personas registradas:** Deimar, Ferney, Oscar, Daniel, Reyving
> - **Temas de negocio:** (ver `catalog/PERSONAS.md`)
>
> ¿Qué quieres usar?"

NO asumir un tema por defecto. Esperar respuesta.

---

## Si el tema existe pero está vacío (placeholder)

Avisar al usuario:

> "El tema `<tema>` está registrado en el repertorio pero aún no tiene skills definidas. ¿Quieres que cree una skill nueva para esto? (puedo usar el tema **Meta** para ayudarte)."

---

## Anti-patrones (no hacer)

- ❌ Activarse por palabras parecidas ("repertorios", "repositorio", "repertorio musical").
- ❌ Asumir que el usuario quiere usar el repertorio si hay coincidencia temática sin la palabra clave.
- ❌ Cargar todos los `SKILL.md` de un tema cuando solo se necesita uno.
- ❌ Leer otros temas cuando el prompt solo menciona uno.
- ❌ Bloquear el acceso a un tema de negocio porque el owner no está presente — cualquiera puede ejecutarlo.
- ❌ Cargar el contenido de `personas/X/` cuando el prompt no menciona ni a X ni a sus dominios.

---

## Estructura del repertorio

```
.agents/
├── REPERTORIO.md             ← Este archivo (activador)
├── catalog/
│   ├── INDEX.md              ← Temas técnicos transversales
│   └── PERSONAS.md           ← Personas registradas y temas de negocio
├── temas/                    ← Técnicos del equipo (sin owner individual)
│   ├── hu/, calidad/, frontend/, git/, meta/, documentacion/, bugs/
└── personas/                 ← Personas con sus temas de negocio
    ├── deimar/
    │   ├── PERFIL.md
    │   └── temas/<dominio>/  ← README, glosario, WORKFLOW, skills/
    ├── ferney/
    ├── oscar/
    ├── daniel/
    └── reyving/
```

Cada tema (técnico o de negocio) es **autocontenido**.
