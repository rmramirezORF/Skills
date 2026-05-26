# Skill: arsys-version-form

**Resumen ejecutivo — Para desarrolladores Arsys**

Versiona y documenta cambios sobre formularios WinForms de Arsys (`arsFrm*.cs` / `.Designer.cs`). Inserta un bloque `#region V<x.y>` con fecha, desarrollador, descripción y solicitante **justo arriba del `namespace`** y sincroniza la cabecera del diseño.

> Especificación técnica completa: ver [SKILL.md](SKILL.md).

---

## Cuándo usar esta skill

**Trigger restrictivo (doble condición):**

1. El repertorio `@repertorio` debe estar activo.
2. El prompt debe mencionar **explícitamente** la palabra `versionado`.

> **Sin esas dos condiciones, la skill NO se carga**, aunque se esté editando un formulario o el contenido parezca relevante. Palabras como "comentar", "documentar" o "modificar" **no** la activan.

---

## Cómo invocarla

Escribe en el chat algo como:

> "@repertorio aplica el **versionado** al formulario `arsFrmFactura` por el cambio que acabo de hacer."

---

## Qué hace, en una mirada

Inserta este bloque **inmediatamente arriba** del `namespace` del code-behind:

```csharp
#region V2.1
//Fecha Modifica : 07/05/2026
//Modificó       : OSCAR ALVARADO VARÓN
//Descripción    : Validar que el número de documento no esté duplicado al guardar
//Solicitó       : Contabilidad - Marta Pérez
#endregion

namespace Arsys.Presentacion.WinForms.Contabilidad
{
    // ...
}
```

Y sincroniza la cabecera del diseño del formulario (si existe) agregando/actualizando:

```csharp
// Versión         : V2.1
// Fecha Modifica  : 07/05/2026
// Modificó        : OSCAR ALVARADO VARÓN
```

---

## Qué se pregunta al usuario vs qué se infiere

| Dato | Origen | ¿Te lo preguntan? |
|---|---|---|
| **Versión** | Autoincrementada desde el último `#region V<x.y>` (minor para ajuste, mayor para cambio funcional). Si no hay historial: `V1.0` (o `V2.0` si ya estaba en producción). | No — se propone y se confirma. |
| **Fecha Modifica** | Fecha del sistema en `dd/MM/yyyy`. | **Nunca** se pide. |
| **Modificó** | Perfil activo del repertorio o `git config user.name`, en MAYÚSCULAS y con apellidos completos. | No — se confirma si no se puede inferir. |
| **Descripción** | Una línea en imperativo derivada del diff y la tarea actual. | No — se propone y se confirma. |
| **Solicitó** | Persona o área que pidió el cambio. | 🔴 **Siempre se pregunta manualmente.** Único campo que jamás se infiere. |

> **Regla de oro:** si el usuario no provee `Solicitó`, la skill **detiene el proceso y pregunta** antes de escribir el bloque.

---

## Diagrama del flujo

```
                       ┌──────────────────────────────────────┐
                       │  Prompt contiene "versionado"        │
                       │  Y @repertorio está activo            │
                       └──────────────────┬───────────────────┘
                                          │ Sí
                                          ▼
                       ┌──────────────────────────────────────┐
                       │  ¿Es un formulario WinForms (.cs)?   │
                       └──────────────────┬───────────────────┘
                                          │ Sí
                                          ▼
                       ┌──────────────────────────────────────┐
                       │  ¿Existe ya un #region con la fecha  │
                       │  y descripción de este cambio?       │
                       └──────────────────┬───────────────────┘
                                          │ No (no duplicar)
                                          ▼
                       ┌──────────────────────────────────────┐
                       │  Calcular siguiente versión          │
                       │   • Último V<x.y> → minor o mayor    │
                       │   • Sin historial → V1.0 / V2.0      │
                       └──────────────────┬───────────────────┘
                                          │
                                          ▼
                       ┌──────────────────────────────────────┐
                       │  Inferir automáticamente:            │
                       │   • Fecha del sistema (dd/MM/yyyy)   │
                       │   • Desarrollador (perfil / git)     │
                       │   • Descripción (1 línea imperativo) │
                       └──────────────────┬───────────────────┘
                                          │
                                          ▼
                       ┌──────────────────────────────────────┐
                       │  👤 PREGUNTAR al usuario: "Solicitó" │
                       │  Único dato manual obligatorio       │
                       └──────────────────┬───────────────────┘
                                          │ Respuesta recibida
                                          ▼
                       ┌──────────────────────────────────────┐
                       │  Insertar bloque #region             │
                       │   • Arriba del namespace             │
                       │   • Encima de los #region previos    │
                       │     (más reciente primero)           │
                       │   • Línea en blanco antes del        │
                       │     namespace                        │
                       └──────────────────┬───────────────────┘
                                          │
                                          ▼
                       ┌──────────────────────────────────────┐
                       │  Sincronizar cabecera del diseño     │
                       │  (si existe el comentario tipo       │
                       │  "Assembly/Autor/Fecha Creación")    │
                       └──────────────────┬───────────────────┘
                                          │
                                          ▼
                       ┌──────────────────────────────────────┐
                       │  Reportar: archivo, versión, valores │
                       └──────────────────────────────────────┘
```

---

## Reglas estrictas de formato

| Elemento | Regla |
|---|---|
| Identificador del region | `V<MAYOR>.<MENOR>` exacto. Ej: `V2.0`, `V2.1`, `V3.0`. **Sin** "Ver", "Versión", espacios. |
| Etiquetas | Exactamente: `Fecha Modifica`, `Modificó`, `Descripción`, `Solicitó` (con tildes). |
| Estilo de comentario | `//` por línea — **no** `/* */`, **no** XML doc. |
| Alineación | Los `:` quedan alineados verticalmente con padding. |
| Ubicación | **Arriba del `namespace`**, después de los `using`. Nunca dentro del namespace ni dentro de la clase. |
| Historial | **Acumulativo**: nuevos `#region` van **arriba** de los previos. **Nunca** reemplazar versiones anteriores. |
| Línea en blanco | Una línea en blanco entre `#endregion` y `namespace`. |

---

## Antipatrones — NO hacer

| ❌ Antipatrón | ✅ Correcto |
|---|---|
| Reemplazar el `#region` previo con el nuevo | Acumular: el nuevo va arriba, los anteriores se conservan |
| Poner el `#region` dentro del `namespace` o de la clase | Siempre **arriba del namespace**, después de los `using` |
| Inferir / inventar `Solicitó` | Preguntar **siempre** al usuario |
| Pedir la fecha al usuario | Tomarla del sistema |
| Etiquetas como `Modifico` (sin tilde) o `Description` | Exactas: `Fecha Modifica`, `Modificó`, `Descripción`, `Solicitó` |
| `/* ... */` o XML doc para el bloque | `//` línea por línea dentro de `#region`...`#endregion` |
| Versión libre (`V2`, `Ver 2.0`, `Version 2`) | `V<MAYOR>.<MENOR>` → `V2.0`, `V2.1`, `V3.0` |
| Solo actualizar el `.cs` y olvidar el diseño | Sincronizar también la cabecera del formulario |
| Hacer commit sin versionar | Versionar **antes** del commit |

---

## Ejemplo: acumular sobre versiones previas

**Antes** (ya tenía `V2.0`):

```csharp
#region V2.0
//Fecha Modifica : 03/03/2020
//Modificó       : OSCAR ALVARADO VARÓN
//Descripción    : Adicionar el campo de prefijo, número documento y fecha documento
//Solicitó       : Jose Nelson
#endregion

namespace Arsys.Presentacion.WinForms.Contabilidad { /* ... */ }
```

**Después** (nuevo cambio):

```csharp
#region V2.1
//Fecha Modifica : 07/05/2026
//Modificó       : OSCAR ALVARADO VARÓN
//Descripción    : Validar que el número de documento no esté duplicado al guardar
//Solicitó       : Contabilidad - Marta Pérez
#endregion

#region V2.0
//Fecha Modifica : 03/03/2020
//Modificó       : OSCAR ALVARADO VARÓN
//Descripción    : Adicionar el campo de prefijo, número documento y fecha documento
//Solicitó       : Jose Nelson
#endregion

namespace Arsys.Presentacion.WinForms.Contabilidad { /* ... */ }
```

> Nota: la versión **subió a `V2.1`** (cambio menor: validación adicional). Para cambios estructurales o funcionales se subiría a `V3.0`.

---

## Checklist final (antes de dar el cambio por terminado)

- [ ] El archivo modificado es un formulario WinForms (`.cs` / `.Designer.cs`).
- [ ] Se preguntó manualmente al usuario el campo **Solicitó**.
- [ ] La **fecha** se tomó del sistema, no se pidió ni se inventó.
- [ ] El nombre del **desarrollador** quedó en MAYÚSCULAS y completo.
- [ ] La **descripción** es una línea imperativa derivada del contexto del cambio.
- [ ] La **versión** se autoincrementó a partir del último `#region V*` (o inició en `V1.0`/`V2.0` si no había).
- [ ] El bloque `#region` quedó **arriba del `namespace`**, no dentro.
- [ ] Las versiones previas **se conservaron** (acumulativo, más reciente arriba).
- [ ] La cabecera del diseño del formulario quedó sincronizada (Versión / Fecha / Modificó).
- [ ] Se reportó al usuario archivo, versión y valores escritos.

---

**Aplica a:** WinForms (`arsFrm*.cs` / `.Designer.cs`) en cualquier módulo de Arsys (Contabilidad, Compra, Venta, Inventario, etc.).
