# Repertorio de Skills — Arsys

Repositorio interno del equipo de desarrollo de **Arsys** (ORF S.A.) que centraliza un
**repertorio de skills** para Claude Code: instrucciones reutilizables que estandarizan
tareas técnicas y de negocio recurrentes.

El objetivo es que cualquier integrante del equipo pueda ejecutar procesos comunes
(validar historias de usuario, crear entidades, revisar código, hacer commits, etc.)
de forma consistente, sin depender de quién los conozca.

---

## Cómo funciona

Todo el repertorio vive bajo `.agents/` y se activa **únicamente** cuando el usuario
escribe la palabra clave `@repertorio` en su prompt. Sin esa palabra, nada del
repertorio se carga — esto evita sobrecargar el contexto de Claude.

```
@repertorio valida esta HU: ...
@repertorio calidad: revisa este código
@repertorio ferney nomina: liquidar a Pedro
@repertorio hu onboarding
```

El archivo `.agents/REPERTORIO.md` es la puerta de entrada y define las reglas de
activación y el flujo de ejecución.

---

## Estructura

```
.agents/
├── REPERTORIO.md             ← Activador y reglas de uso
├── catalog/
│   ├── catalogo-temas.md     ← Índice de temas técnicos transversales
│   └── catalogo-personas.md  ← Personas registradas y temas de negocio
├── temas/                    ← Temas técnicos del equipo (sin owner individual)
│   ├── hu/                   ← Validación de historias de usuario
│   ├── calidad/              ← Estándares y code review
│   ├── frontend/             ← UI, WebForms, WinForms, auditoría UX
│   ├── git/                  ← Convenciones de commits y ramas
│   ├── meta/                 ← Creación de nuevas skills y temas
│   ├── estandar-ia/          ← Estándar ORF para activos de IA
│   ├── documentacion/        ← READMEs, ADRs, changelogs
│   └── bugs/                 ← Diagnóstico de errores e incidentes
└── personas/                 ← Personas con sus temas de negocio
    ├── deimar/   (arsys: backend, UI, reportes, análisis)
    ├── ferney/   (nómina)
    ├── oscar/
    ├── daniel/
    └── reyving/
```

### Dos tipos de tema

| Tipo | Dónde vive | Owner |
|---|---|---|
| **Técnico transversal** (hu, calidad, frontend, git, meta…) | `temas/` | Del equipo |
| **De negocio** (nómina, contabilidad, facturación…) | `personas/<owner>/temas/` | Una persona |

Los temas técnicos los conoce todo el equipo. Los de negocio tienen un dueño que los
mantiene, pero **cualquiera puede ejecutarlos** cuando el dueño no está disponible.

Cada tema es **autocontenido**: tiene su `README.md`, opcionalmente un `WORKFLOW.md`
con la secuencia de pasos, y una carpeta `skills/` con los `SKILL.md` individuales.

---

## Uso del repositorio (equipo)

Cada integrante trabaja en su propia rama. Los pasos básicos de git están en
[EQUIPO.md](EQUIPO.md):

1. Clonar el repo y traer todas las ramas.
2. Entrar a tu rama (`Deimar`, `Ferney`, `Oscar`, `Daniel`, `Reyving`).
3. Antes de pushear, traer lo último de `main` a tu rama (`git fetch` + `git merge`).
4. Commitear y pushear a tu rama; avisar al responsable para el merge a `main`.

---

## Convenciones

- **kebab-case** para nombres de skills y temas.
- `SKILL.md` siempre en mayúsculas, autodocumentado (frontmatter + instrucciones).
- Cada tema con un `README.md` que describa su alcance.
- `WORKFLOW.md` opcional, solo cuando hay una secuencia determinista de pasos.

---

## Estado actual

| Tema | Skills | Estado |
|---|---|---|
| HU | 11 | ✅ Operativo |
| Frontend | 2 | ✅ Operativo |
| Estándar IA | 8 | ✅ Operativo |
| Git | 1 | ✅ Operativo |
| Meta | 1 | ✅ Operativo |
| Calidad / Documentación / Bugs | 0 | 🟡 Placeholder |
