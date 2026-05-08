# Personas del Repertorio

Este índice se carga **solo cuando** se activa `@repertorio` con referencia a una persona o un tema de negocio. Lista las personas registradas y sus dominios.

---

## Personas registradas

| Persona | Rol | Dominios | Suplentes |
|---|---|---|---|
| **Deimar** | _(pendiente)_ | _(pendiente)_ | — |
| **Ferney** | _(pendiente)_ | _(pendiente)_ | — |
| **Oscar** | _(pendiente)_ | _(pendiente)_ | — |
| **Daniel** | _(pendiente)_ | _(pendiente)_ | — |
| **Reyving** | _(pendiente)_ | _(pendiente)_ | — |

---

## Búsqueda por dominio (temas de negocio)

| Dominio | Owner | Suplentes |
|---|---|---|
| _(pendiente — se llena conforme cada persona registre sus temas)_ | — | — |

---

## Cómo activar

| Sintaxis | Comportamiento |
|---|---|
| `@repertorio <dominio>` | Busca el dominio en `personas/*/temas/`. Si solo una persona lo tiene, entra directo y menciona al owner. Si hay varias, pregunta. |
| `@repertorio <persona>` | Carga el PERFIL de esa persona y lista sus dominios disponibles. |
| `@repertorio <persona> <dominio>` | Entra directo al tema de esa persona. |
| `@repertorio <dominio> onboarding` | Carga README + glosario del tema sin ejecutar skills. Útil para sustitutos que necesitan ponerse al día. |

---

## Cómo registrar una persona nueva

1. Crear carpeta `personas/<nombre>/` con `PERFIL.md` y subcarpeta `temas/`.
2. Agregar entrada en este `PERSONAS.md`.
3. Cuando la persona registre temas, completar la tabla de dominios.

(El skill `meta/skill-creator` puede automatizar este scaffolding.)

---

## Cómo registrar un tema de negocio para una persona

1. Copiar la plantilla `temas/meta/skills/skill-creator/assets/TEMA-NEGOCIO-TEMPLATE/`
   a `personas/<nombre>/temas/<dominio>/`.
2. Completar `README.md`, `glosario.md`, `WORKFLOW.md` (si aplica) y las skills.
3. Actualizar el `PERFIL.md` de la persona con el nuevo dominio.
4. Actualizar este `PERSONAS.md` con el dominio y su owner.

---

## Reglas

- Una persona puede tener varios dominios.
- Un dominio tiene UN owner pero puede tener N suplentes.
- Las skills viven dentro del dominio del owner. Cualquier persona puede ejecutarlas.
- Los temas técnicos (`temas/` global) NO son temas de negocio: no tienen owner individual.
