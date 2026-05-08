# Índice de Temas Técnicos — Repertorio Arsys

Este índice se carga **solo cuando** se activa `@repertorio`. Lista los temas **técnicos transversales** del equipo. Para temas de negocio (con owner por persona) ver [catalogo-personas.md](catalogo-personas.md).

---

## Temas técnicos

| Tema | Identificadores en el prompt | Workflow | Carpeta |
|---|---|---|---|
| **HU** | "historia de usuario", "HU", "valida HU", "como usuario quiero", "cumple con la historia" | Sí | `temas/hu/` |
| **Calidad** | "calidad", "estándares Arsys", "code review", "buenas prácticas", "convenciones" | Por definir | `temas/calidad/` |
| **Documentación** | "README", "ADR", "changelog", "documenta", "manual" | Por definir | `temas/documentacion/` |
| **Bugs** | "bug", "error", "fallo", "no funciona", "rompió", "incidente" | Por definir | `temas/bugs/` |
<<<<<<< HEAD
| **Frontend** | "componente", "UI", "vista", "estilo", "responsive", "accesibilidad", "pantalla", "formulario", "grid", "layout", "WebForms", ".aspx", "DevExpress", "XtraGrid", "WinForms", "auditoría UX", "modernizar pantalla", "versionado" | Por definir | `temas/frontend/` |
| **Git** | "commit", "rama", "merge", "release", "git" | No | `temas/git/` |
| **Meta** | "nueva skill", "crear skill", "agregar tema" | No | `temas/meta/` |
| **Estándar IA** | "estándar IA", "ORF-STD-IA", "nombrar activo", "validar prompt", "9 secciones", "FUENTE-TIPO", "v1_0", "migrar Aniro", "catalogar activo", "estructura de prompt" | No | `temas/estandar-ia/` |

---

## Temas de negocio

Los temas de negocio (nómina, contabilidad, facturación, etc.) NO viven aquí — viven en `personas/<owner>/temas/<dominio>/`. Para listarlos y encontrar su owner, consultar [catalogo-personas.md](catalogo-personas.md).

---

## Cómo navegar

1. **Leer este índice primero** (1 sola lectura por consulta).
2. **Identificar el tema** comparando el prompt con la columna *Identificadores*.
3. Si el tema NO está en esta tabla → consultar `catalogo-personas.md` (puede ser un tema de negocio).
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
<<<<<<< HEAD
| Frontend | 2 (ux-enterprise, version) | — | ✅ Operativo |
=======
| Frontend | 1 (ux-enterprise) | — | ✅ Operativo |
>>>>>>> 0fb7e17492fadbb6d24ee9637dc3946b3d816e67
| Git | 1 (commit-guides) | — | ✅ Operativo |
| Meta | 1 (skill-creator) | — | ✅ Operativo |

---

## Convenciones del repertorio

- **kebab-case** para nombres de skills y temas.
- `SKILL.md` siempre en mayúsculas.
- Cada skill autodocumentada en su `SKILL.md` (frontmatter + instrucciones).
- Cada tema con `README.md` que describa su alcance.
- Workflows opcionales en `WORKFLOW.md` cuando hay secuencia determinista.
