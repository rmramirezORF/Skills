---
name: arsys-estandar-codigo
description: Revisa y reformatea un archivo .cs de ARSYS aplicando el estándar — header, regiones ordenadas, prefijos ars* en controles DevExpress, uso correcto de DevExpress (no WinForms stock), nombres MVP, patrones Repository. Reporta incumplimientos y ofrece corregirlos. Úsala cuando el usuario diga "revisar estándar", "estandarizar", "formatear archivo", "verificar convenciones", "revisar código".
argument-hint: [ruta-archivo.cs]
---

# Revisar y aplicar estándar ARSYS

Audita un `.cs` contra el estándar del proyecto y opcionalmente lo reescribe.

## Paso 1 — Contexto

Lee:
- `C:\DEIMAR\ARSYS\ArsysPresentacion\CLAUDE.md` (para forms, MVP, controles)
- `C:\DEIMAR\ARSYS\ArsysServiciosORF\ArsysServiciosORF\CLAUDE.md` (para backend)

## Paso 2 — Pedir archivo

Ruta completa del `.cs` a revisar. Si el usuario dio más de uno, procesarlos uno por uno.

## Paso 3 — Identificar tipo de archivo

Detectar por ubicación/contenido:

| Tipo | Indicador | Reglas que aplican |
|---|---|---|
| Form (arsFrm) | Hereda `arsFrmBase`, archivo `.cs` + `.Designer.cs` | A, B, C, D, E |
| UserControl (arsUsr) | Hereda `XtraUserControl` | A, B, C, E |
| Model (M\<X\>) | En `.MVP\Model\` | A, B, F |
| Presenter (P\<X\>) | En `.MVP\Presenter\` | A, B, F |
| Repositorio | En `Arsys.Infraestructura.Repositorio.*` | A, B, G |
| Dominio | En `Arsys.Dominio.Servicios.*` | A, B, H |
| WCF Service | En `Arsys.ServiciosDistribuidos` | A, B, I |
| Interfaz | Empieza con `I` | A, B |

## Paso 4 — Reglas a verificar

### A. Header del archivo
```csharp
// ***************************************************************
// Assembly        : <Namespace>.<Clase>
// Autor           : <Nombre>
// Fecha Creación  : <yyyy-MM-dd>
// Descripción     : <1 línea>
// Copyright       : © todos los derechos reservados a Molinos ROA S.A
// ***************************************************************
```
❌ Reportar si falta o incompleto.

### B. Orden de regiones

1. `#region Versionado` (con sub-regiones `#region Ver X.Y` o `#region yyyy-MM-dd`)
2. `#region Librerias Importadas` (todos los `using`)
3. `namespace` { `partial class` ... {

Dentro de la clase:
4. `#region Variables Globales`
5. `#region Objetos`
6. `#region Constructor`
7. `#region Eventos` (sub: Click, DoubleClick, EditValueChanged, FocusedRowChanged)
8. `#region Métodos de la Interfaz` (solo formularios con ICrudBase)
9. `#region Metodos Publicos`
10. `#region Métodos Privados`
11. `#region Asíncrono` (si usa BackgroundWorker)
12. `#region Barra de Usuarios` (si maneja permisos)

❌ Reportar regiones faltantes o fuera de orden.

### C. Prefijos de controles (solo en `.Designer.cs`)

| Control DevExpress | Prefijo obligatorio |
|---|---|
| `SimpleButton` | `arsBtn` |
| `TextEdit` | `arsTxt` |
| `ComboBoxEdit` | `arsCmb` |
| `CheckEdit` | `arsChk` |
| `DateEdit` | `arsDte` |
| `GridLookUpEdit` | `arsGle` |
| `GridControl` | `arsGc` |
| `GridView` | `arsGv` |
| `GridColumn` (en GridView) | `arsGcCol` |
| `LookUpEdit` | `arsLac` |
| `LabelControl` | `arsLbl` |
| `SpinEdit` | `arsSpa` |
| `BackgroundWorker` | `arsAsincrono` |

❌ Reportar cada control con prefijo incorrecto.

### D. Solo DevExpress en UI

Prohibido: `System.Windows.Forms.TextBox`, `Button`, `MessageBox`, `ComboBox`, `DataGridView`.
Permitido: `DevExpress.XtraEditors.*`, `XtraMessageBox`.

❌ Reportar cualquier uso de WinForms stock.

### E. Herencia correcta

- Formularios: `public partial class arsFrm<X> : arsFrmBase, ICrudBase`
- UserControls: `public partial class arsUsr<X> : XtraUserControl`

### F. Patrón MVP (Models y Presenters)

- Model invoca proxy WCF usando:
  ```csharp
  var client = new Servicios<Modulo>ArsysClient(
      Convert.ToString(EServicio.<X>),
      ArsysSingleton.ObtenerInstancia.getCadena(EServicio.<X>)
  );
  ModeloBase.asignarCabecera(client.Endpoint);
  ```
- ❌ Reportar si falta `asignarCabecera` o usa URL hardcodeada.

### G. Repositorios

- Nombre: `Repositorio<Entidad>` hereda `RepositorioArsys<Entidad>` implementa `IRepositorio<Entidad>`.
- Consultas con `using (ArsysEntities ctx = new ArsysEntities())`.
- Lazy loading deshabilitado → uso explícito de `.Include()` cuando hay navegación.
- Filtro por `idSociedad` en listados.

### H. Dominio (escrituras)

- `TransactionScope` obligatorio en escrituras.
- `_IRepositorio<X>.UnidadDeTrabajo.RealizarCambios()` al final.
- `tx.Complete()` dentro de try.
- Catch llama a `AdministradorError.RegistrarError(ex)`.

### I. WCF

- Interfaz con `[ServiceContract]`.
- Cada método con `[OperationContract]`.
- Implementación delega a `FabricaIoCArsys.Resolve<IDominioContrato<X>>()`.
- Catch lanza `FaultException(ex.Message)`.

## Paso 5 — Salida del análisis

Presentar reporte en este formato:

```
=== Análisis de <archivo> ===

Tipo detectado: [Form / UserControl / Model / Repositorio / ...]

✅ Cumple (N)
  • Header correcto
  • Regiones en orden
  ...

❌ Incumple (M)
  • [C] Línea 145: control 'txtNombre' debería ser 'arsTxtNombre'
  • [C] Línea 189: 'btnGuardar' debería ser 'arsBtnGuardar'
  • [D] Línea 203: uso de System.Windows.Forms.MessageBox → usar XtraMessageBox
  • [B] Falta región '#region Asíncrono' (BackgroundWorker presente)
  • [H] Línea 67: escritura sin TransactionScope

Severidad: <Alta/Media/Baja>
```

## Paso 6 — Preguntar si aplicar correcciones

> ¿Quieres que aplique las correcciones automáticas? (renombrado de controles, reordenar regiones, reemplazar MessageBox → XtraMessageBox). Los cambios estructurales grandes (agregar regiones faltantes) los haré con tu confirmación por cada uno.

Si dice sí → aplicar solo correcciones de bajo riesgo (renombres, reemplazos uno-a-uno), pedir confirmación para cambios de estructura.

## Paso 7 — Reportar

- Cambios aplicados
- Cambios pendientes (los que requieren decisión humana)
- Sugerencia: compilar después para verificar que el renombrado no rompió nada
