# Índice de Temas — Repertorio Arsys

Este índice se carga **solo cuando** se activa `@repertorio`. Lista los temas disponibles y orienta a Claude para entrar al correcto.

---

## Temas

| Tema | Identificadores en el prompt | Workflow | Carpeta |
|---|---|---|---|
| **HU** | "historia de usuario", "HU", "valida HU", "como usuario quiero", "cumple con la historia" | Sí | `temas/hu/` |
| **Calidad** | "calidad", "estándares Arsys", "code review", "buenas prácticas", "convenciones" | Por definir | `temas/calidad/` |
| **Documentación** | "README", "ADR", "changelog", "documenta", "manual" | Por definir | `temas/documentacion/` |
| **Bugs** | "bug", "error", "fallo", "no funciona", "rompió", "incidente" | Por definir | `temas/bugs/` |
| **Frontend** | "componente", "UI", "vista", "estilo", "responsive", "accesibilidad" | Por definir | `temas/frontend/` |
| **Git** | "commit", "rama", "merge", "release", "git" | No | `temas/git/` |
| **Meta** | "nueva skill", "crear skill", "agregar tema" | No | `temas/meta/` |

---

## Cómo navegar

1. **Leer este índice primero** (1 sola lectura por consulta).
2. **Identificar el tema** comparando el prompt con la columna *Identificadores*.
3. **Entrar a `temas/<tema>/`** y leer su `README.md` para entender alcance.
4. **Si hay `WORKFLOW.md`** → ejecutar pasos en orden.
5. **Si no hay WORKFLOW** → listar `skills/` y elegir las relevantes.

**No leer múltiples temas a la vez** salvo que el usuario lo pida explícitamente.

---

## Estado actual de los temas

| Tema | Skills | Workflow | Estado |
|---|---|---|---|
| HU | 11 | qa-full | ✅ Operativo |
| Calidad | 0 | — | 🟡 Placeholder |
| Documentación | 0 | — | 🟡 Placeholder |
| Bugs | 0 | — | 🟡 Placeholder |
| Frontend | 0 | — | 🟡 Placeholder |
| Git | 1 (commit-guides) | — | ✅ Operativo |
| Meta | 1 (skill-creator) | — | ✅ Operativo |

---

## Convenciones del repertorio

- **kebab-case** para nombres de skills y temas.
- `SKILL.md` siempre en mayúsculas.
- Cada skill autodocumentada en su `SKILL.md` (frontmatter + instrucciones).
- Cada tema con `README.md` que describa su alcance.
- Workflows opcionales en `WORKFLOW.md` cuando hay secuencia determinista.
