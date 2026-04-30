# Índice de Temas Técnicos — Repertorio Arsys

Este índice se carga **solo cuando** se activa `@repertorio`. Lista los temas **técnicos transversales** del equipo. Para temas de negocio (con owner por persona) ver [PERSONAS.md](PERSONAS.md).

---

## Temas técnicos

| Tema | Identificadores en el prompt | Workflow | Carpeta |
|---|---|---|---|
| **HU** | "historia de usuario", "HU", "valida HU", "como usuario quiero", "cumple con la historia" | Sí | `temas/hu/` |
| **Calidad** | "calidad", "estándares Arsys", "code review", "buenas prácticas", "convenciones" | Por definir | `temas/calidad/` |
| **Documentación** | "README", "ADR", "changelog", "documenta", "manual" | Por definir | `temas/documentacion/` |
| **Bugs** | "bug", "error", "fallo", "no funciona", "rompió", "incidente" | Por definir | `temas/bugs/` |
| **Frontend** | "componente", "UI", "vista", "estilo", "responsive", "accesibilidad", "pantalla", "formulario", "grid", "layout", "WebForms", ".aspx", "DevExpress", "XtraGrid", "WinForms", "auditoría UX", "modernizar pantalla" | Por definir | `temas/frontend/` |
| **Git** | "commit", "rama", "merge", "release", "git" | No | `temas/git/` |
| **Meta** | "nueva skill", "crear skill", "agregar tema" | No | `temas/meta/` |

---

## Temas de negocio

Los temas de negocio (nómina, contabilidad, facturación, etc.) NO viven aquí — viven en `personas/<owner>/temas/<dominio>/`. Para listarlos y encontrar su owner, consultar [PERSONAS.md](PERSONAS.md).

---

## Cómo navegar

1. **Leer este índice primero** (1 sola lectura por consulta).
2. **Identificar el tema** comparando el prompt con la columna *Identificadores*.
3. Si el tema NO está en esta tabla → consultar `PERSONAS.md` (puede ser un tema de negocio).
4. **Entrar a `temas/<tema>/`** (técnico) o a `personas/<owner>/temas/<tema>/` (negocio) y leer su `README.md`.
5. **Si hay `WORKFLOW.md`** → ejecutar pasos en orden.
6. **Si no hay WORKFLOW** → listar `skills/` y elegir las relevantes.

**No leer múltiples temas a la vez** salvo que el usuario lo pida explícitamente.

---

## Estado actual de los temas

| Tema | Skills | Workflow | Estado |
|---|---|---|---|
| HU | 11 | qa-full | ✅ Operativo |
| Calidad | 0 | — | 🟡 Placeholder |
| Documentación | 0 | — | 🟡 Placeholder |
| Bugs | 0 | — | 🟡 Placeholder |
| Frontend | 1 (ux-enterprise) | — | ✅ Operativo |
| Git | 1 (commit-guides) | — | ✅ Operativo |
| Meta | 1 (skill-creator) | — | ✅ Operativo |

---

## Convenciones del repertorio

- **kebab-case** para nombres de skills y temas.
- `SKILL.md` siempre en mayúsculas.
- Cada skill autodocumentada en su `SKILL.md` (frontmatter + instrucciones).
- Cada tema con `README.md` que describa su alcance.
- Workflows opcionales en `WORKFLOW.md` cuando hay secuencia determinista.
