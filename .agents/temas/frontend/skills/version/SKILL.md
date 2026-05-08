---
name: version
description: >
  Versiona y documenta cambios sobre formularios ARSYS (WinForms .cs/.Designer.cs).
  Cada vez que se edita un formulario, esta skill obliga a actualizar la versión, la fecha y el
  desarrollador en el diseño del formulario, y a insertar un bloque #region de versionamiento
  ARRIBA del namespace en el code-behind, siguiendo la plantilla estándar del equipo.

  Trigger: SOLO se carga si el repertorio está activo (@repertorio) Y el prompt menciona
  EXPLÍCITAMENTE la palabra clave "versionado". Sin esa palabra, NO cargar esta skill aunque
  se esté editando un formulario o el contenido parezca relevante.

  Si NO hay @repertorio en el prompt, NO cargar esta skill aunque el contenido parezca relevante.
license: Apache-2.0
---

# Versionamiento y Comentarios sobre Cambios en Formularios

Esta skill garantiza que **todo cambio sobre un formulario** quede registrado en dos lugares:

1. **En el diseño del formulario** (cabecera/propiedades visibles del `arsFrm*`): versión, fecha y desarrollador.
2. **En el code-behind (.cs)**: un bloque `#region` justo **arriba del `namespace`** con el detalle del cambio.

Nunca dejes un cambio sin documentar. Nunca omitas el bloque `#region`. Nunca lo coloques dentro de la clase ni dentro del namespace.

---

## When to Use

Activa esta skill **únicamente** cuando el usuario mencione la palabra clave **`versionado`** en el contexto de un formulario.

NO activar:
- Solo porque se editó un formulario.
- Solo porque se hará commit de un formulario.
- Si el usuario habla de "comentar", "documentar", "modificar" sin la palabra `versionado`.

---

## Información necesaria

| Dato | De dónde se obtiene | ¿Preguntar al usuario? |
|---|---|---|
| **Versión** | Auto-incrementar a partir del último `#region V<x.y>` encontrado en el archivo. Si no existe ninguno, iniciar en `V1.0`. Si solo hay `V1.0`, siguiente es `V2.0`. Subir minor (`V2.0` → `V2.1`) si es ajuste menor; subir mayor (`V2.x` → `V3.0`) si es cambio funcional o estructural. | No (proponer y confirmar). |
| **Fecha Modifica** | Fecha del sistema en formato `dd/MM/yyyy` (ej: `07/05/2026`). | No. Tomar siempre del sistema, **nunca pedirla al usuario**. |
| **Modificó** | Nombre del desarrollador actual (perfil activo del repertorio o `git config user.name`). En MAYÚSCULAS y con apellidos completos cuando estén disponibles (ej: `OSCAR ALVARADO VARÓN`). | No (confirmar solo si no se puede inferir). |
| **Descripción** | Resumen en una línea del cambio que se acaba de hacer, derivado del contexto de la tarea/conversación actual y del diff del archivo. Imperativo y específico (qué se adicionó / modificó / eliminó). | No (proponer y confirmar). |
| **Solicitó** | **Persona o área que solicitó el cambio.** | **SÍ — siempre preguntar manualmente al usuario.** Es el único campo que jamás se infiere ni se inventa. |

> **Regla de oro:** *Solicitó* nunca se asume. Si el usuario no lo provee, **detener el proceso y preguntar** antes de escribir el bloque.

---

## Critical Patterns

### Pattern 1: Bloque `#region` de versionamiento (formato obligatorio)

Insertar **inmediatamente arriba** de `namespace ...` en el archivo `.cs` (code-behind). Si ya existen otros `#region V<x.y>` previos, el nuevo va **en la parte superior** del bloque (más reciente arriba).

```csharp
#region V2.0
//Fecha Modifica : 03/03/2020
//Modificó       : OSCAR ALVARADO VARÓN
//Descripción    : Adicionar el campo de prefijo, número documento y fecha documento
//Solicitó       : Jose Nelson
#endregion

namespace Arsys.Presentacion.WinForms.Contabilidad
{
    public partial class arsFrmEjemplo : arsFrmBase
    {
        // ...
    }
}
```

**Reglas estrictas de formato:**

- El identificador del `#region` es exactamente `V<MAYOR>.<MENOR>` (ej: `V2.0`, `V2.1`, `V3.0`). Sin espacios, sin "Ver", sin "Versión".
- Las 4 etiquetas son **exactamente**: `Fecha Modifica`, `Modificó`, `Descripción`, `Solicitó`.
- Cada etiqueta empieza con `//` (comentario de línea simple), un espacio, el texto de la etiqueta, padding de espacios hasta la columna de los `:`, luego ` : ` y el valor.
- Los `:` deben quedar **alineados verticalmente** (todas las etiquetas tienen el mismo ancho de columna). En la plantilla estándar el padding lleva `Fecha Modifica`, `Modificó       `, `Descripción    `, `Solicitó       ` a la misma columna del `:`.
- Tildes y mayúsculas como en el ejemplo (`Modificó`, `Descripción`, `Solicitó`).
- Si hay varios cambios en el tiempo, **acumular** los `#region V*`, no reemplazar los anteriores.

### Pattern 2: Cabecera del diseño del formulario

Además del bloque en el .cs, sincronizar la información en el **diseño del formulario**:

En **WinForms (`arsFrm*.cs` / `.Designer.cs`)**, si el formulario tiene una cabecera de comentario tipo:

```csharp
// ***************************************************************
// Assembly        : ...
// Autor           : ...
// Fecha Creación  : ...
// Descripción     : ...
// ***************************************************************
```

agregar/actualizar las líneas:

```csharp
// Versión         : V2.0
// Fecha Modifica  : 07/05/2026
// Modificó        : OSCAR ALVARADO VARÓN
```

manteniendo el mismo ancho de columna del bloque existente.

---

## Decision Tree

```
¿El archivo modificado es un formulario WinForms (.cs / .Designer.cs)?
  Sí → continuar.
  No → esta skill no aplica.

¿Ya existe un #region V<x.y> con la fecha y descripción de este cambio?
  Sí → no duplicar; salir.
  No → continuar.

¿Tengo el dato "Solicitó" (persona/área que pidió el cambio)?
  No → PREGUNTAR al usuario y esperar respuesta antes de escribir.
  Sí → continuar.

¿Existen #region V* previos en el archivo?
  Sí → leer el último, calcular siguiente versión (minor o mayor según alcance del cambio).
  No → empezar en V1.0 (o V2.0 si el formulario ya estaba en producción sin versionar).

→ Tomar fecha del sistema (dd/MM/yyyy).
→ Tomar nombre del desarrollador del perfil activo / git config.
→ Derivar Descripción del contexto de la tarea (1 línea, imperativo).
→ Insertar #region arriba del namespace, encima de los #region previos.
→ Sincronizar la cabecera del diseño del formulario (Versión / Fecha / Modificó).
→ Reportar al usuario: archivo, versión asignada, valores escritos.
```

---

## Proceso paso a paso

1. **Detectar el formulario tocado.** Buscar el archivo `.cs` correspondiente del WinForms (junto al `.Designer.cs`).
2. **Leer el archivo completo** para localizar el `namespace` y los `#region V*` existentes.
3. **Calcular la siguiente versión** según el último `#region V<x.y>` encontrado (ver Decision Tree).
4. **Obtener fecha del sistema** en formato `dd/MM/yyyy`.
5. **Obtener nombre del desarrollador** del perfil activo en `personas/<owner>/PERFIL.md` o de `git config user.name`. Normalizar a MAYÚSCULAS.
6. **Redactar Descripción** (1 línea, imperativo: *"Adicionar..."*, *"Modificar..."*, *"Eliminar..."*) a partir del contexto del cambio.
7. **Preguntar `Solicitó`** al usuario — *único dato manual obligatorio*. Ejemplo de pregunta:
   > "¿Quién solicitó este cambio? (nombre de la persona o área)"
8. **Construir el bloque** `#region V<x.y> ... #endregion` con el formato del Pattern 1.
9. **Insertar el bloque** justo antes de `namespace` en el `.cs`. Si ya hay `#region V*` previos, colocar el nuevo **arriba de todos** (más reciente primero) y mantener una línea en blanco entre `#endregion` y `namespace`.
10. **Sincronizar la cabecera del diseño** (Pattern 2) si existe.
11. **Reportar** al usuario:
    - Archivo modificado
    - Versión asignada
    - Valores escritos (Fecha, Modificó, Descripción, Solicitó)
    - Si se actualizó también la cabecera del diseño

---

## Code Examples

### Ejemplo 1: Primer versionamiento de un formulario sin historial

**Antes** (`arsFrmFactura.cs`):
```csharp
using System;
using DevExpress.XtraEditors;

namespace Arsys.Presentacion.WinForms.Facturacion
{
    public partial class arsFrmFactura : arsFrmBase
    {
        // ...
    }
}
```

**Después** (con cambio: *"Adicionar campo de observación al detalle de la factura"*, solicitado por *"Área de Cartera"*):
```csharp
using System;
using DevExpress.XtraEditors;

#region V2.0
//Fecha Modifica : 07/05/2026
//Modificó       : OSCAR ALVARADO VARÓN
//Descripción    : Adicionar campo de observación al detalle de la factura
//Solicitó       : Área de Cartera
#endregion

namespace Arsys.Presentacion.WinForms.Facturacion
{
    public partial class arsFrmFactura : arsFrmBase
    {
        // ...
    }
}
```

### Ejemplo 2: Acumular sobre versiones previas

**Antes** (ya tenía `V2.0`):
```csharp
#region V2.0
//Fecha Modifica : 03/03/2020
//Modificó       : OSCAR ALVARADO VARÓN
//Descripción    : Adicionar el campo de prefijo, número documento y fecha documento
//Solicitó       : Jose Nelson
#endregion

namespace Arsys.Presentacion.WinForms.Contabilidad
{
    // ...
}
```

**Después** (nuevo cambio: *"Validar que el número de documento no esté duplicado al guardar"*, solicitado por *"Contabilidad - Marta Pérez"*):
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

namespace Arsys.Presentacion.WinForms.Contabilidad
{
    // ...
}
```

---

## Antipatrones — NO hacer

| ❌ Antipatrón | ✅ Correcto |
|---|---|
| Reemplazar el `#region` previo con el nuevo. | Acumular: el nuevo va arriba; los anteriores se conservan. |
| Poner el `#region` dentro del namespace o dentro de la clase. | Siempre **arriba del namespace**, después de los `using`. |
| Inferir / inventar el campo `Solicitó`. | Preguntar **siempre** manualmente al usuario. |
| Pedirle al usuario la fecha. | Tomarla del sistema (`dd/MM/yyyy`). |
| Usar etiquetas como `Modifico` (sin tilde) o `Description`. | Exactas: `Fecha Modifica`, `Modificó`, `Descripción`, `Solicitó`. |
| Usar `/* ... */` o XML doc para el bloque. | Comentarios `//` línea por línea, dentro de `#region V<x.y>` ... `#endregion`. |
| Versión libre (`V2`, `Ver 2.0`, `Version 2`). | Formato exacto: `V<MAYOR>.<MENOR>` → `V2.0`, `V2.1`, `V3.0`. |
| Solo actualizar el .cs y olvidar el diseño. | Sincronizar también cabecera del formulario (Versión/Fecha/Modificó). |
| Hacer commit sin versionar el formulario tocado. | Versionar **antes** del commit. |

---

## Checklist final (antes de dar el cambio por terminado)

- [ ] El archivo modificado es un formulario WinForms (.cs / .Designer.cs).
- [ ] Pregunté manualmente al usuario el campo **Solicitó**.
- [ ] La **fecha** se tomó del sistema, no la pedí ni la inventé.
- [ ] El nombre del **desarrollador** quedó en MAYÚSCULAS y completo.
- [ ] La **descripción** es una línea imperativa derivada del contexto del cambio.
- [ ] La **versión** se autoincrementó a partir del último `#region V*` (o inició en `V1.0`/`V2.0` si no había).
- [ ] El bloque `#region` quedó **arriba del `namespace`**, no dentro.
- [ ] Las versiones previas **se conservaron** (acumulativo, más reciente arriba).
- [ ] La cabecera del diseño del formulario quedó sincronizada (Versión / Fecha / Modificó).
- [ ] Reporté al usuario archivo, versión y valores escritos.
