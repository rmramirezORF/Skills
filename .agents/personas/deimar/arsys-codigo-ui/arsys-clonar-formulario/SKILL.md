---
name: arsys-clonar-formulario
description: Clona un formulario arsFrm existente de ARSYS para crear uno nuevo, renombrando todos los controles DevExpress según estándar (arsBtn, arsTxt, arsGle, arsGcCol, etc.) y manteniendo regiones ordenadas. Úsala cuando el usuario diga "clonar formulario", "copiar arsFrm", "duplicar formulario" o "crear formulario basado en X".
argument-hint: [FormularioOrigen] [FormularioDestino] [Modulo]
---

# Clonar formulario ARSYS

Clona un `arsFrm*` existente adaptando nombres, controles y regiones al estándar.

## Paso 1 — Contexto

Lee:
- `C:\DEIMAR\ARSYS\ArsysPresentacion\CLAUDE.md`
- El formulario origen completo: `.cs`, `.designer.cs` y `.resx` (los 3 son un triad indivisible).

## Paso 2 — Datos necesarios

1. **Formulario origen** (nombre completo, ej. `arsFrmConsultaSaldosContabilidad`).
2. **Formulario destino** (PascalCase, debe empezar con `arsFrm`, ej. `arsFrmConsultaMovimientoContabilidad`).
3. **Módulo destino** (suele ser el mismo del origen, pero puede cambiar).
4. **Entidad principal** que maneja (para renombrar controles: `arsTxtNit` → `arsTxtDocumento`, etc.).

## Paso 3 — Localizar triada origen

Ruta típica:
```
C:\DEIMAR\ARSYS\ArsysPresentacion\Arsys.Presentacion.WinForms.<Modulo>\<arsFrm>.cs
                                                                      \<arsFrm>.Designer.cs
                                                                      \<arsFrm>.resx
```

Si el origen tiene Model/Presenter en `.MVP`, también clonar:
```
Arsys.Presentacion.WinForms.<Modulo>.MVP\Model\M<Entidad>.cs
Arsys.Presentacion.WinForms.<Modulo>.MVP\Presenter\P<Entidad>.cs
```

## Paso 4 — Reglas de renombrado

1. Cambiar `arsFrm<EntidadOrigen>` → `arsFrm<EntidadDestino>` en TODO el archivo.
2. Cambiar `namespace` si cambia módulo.
3. Renombrar controles según prefijos estándar:

| Prefijo | DevExpress Control | Cambiar solo el sufijo |
|---|---|---|
| `arsBtn` | SimpleButton | `arsBtnGuardar` → mantener por función |
| `arsTxt` | TextEdit | `arsTxtNit` → `arsTxtDocumento` |
| `arsCmb` | ComboBoxEdit | igual |
| `arsChk` | CheckEdit | igual |
| `arsDte` | DateEdit | igual |
| `arsGle` | GridLookUpEdit | igual |
| `arsGc` | GridControl | igual |
| `arsGcCol<Campo>` | GridColumn | 1 columna = 1 arsGcCol |
| `arsLbl` | LabelControl | igual |
| `arsSpa` | SpinEdit | igual |
| `arsLac` | LookUpEdit | igual |
| `arsUsr<Nombre>` | UserControl | igual |
| `arsAsincrono` | BackgroundWorker | `arsAsincrono<Descripcion>` |

4. **Nunca** uses controles stock de WinForms (`TextBox`, `Button`) — solo DevExpress 14.1.
5. Si hay `arsColNit` (columnas de GridView antiguas) y `arsGcCol*` (columnas de GridControl), mantener el mismo estilo del origen.

## Paso 5 — Estructura de regiones (verificar y conservar)

El `.cs` clonado DEBE respetar este orden:

```csharp
// ***************************************************************
// Assembly        : <namespace>.<EntidadDestino>
// Autor           : Deimar Cuchimba
// Fecha Creación  : <hoy>
// Descripción     : <una línea describiendo el propósito>
// Copyright       : © todos los derechos reservados a Molinos ROA S.A
// ***************************************************************

#region Versionado
  #region Ver 1.0
  // Fecha: <hoy>  Autor: Deimar  Descripción: Creación inicial
  #endregion
#endregion

#region Librerias Importadas
  using Arsys.Dominio.Entidades;
  using Arsys.Presentacion.Base;
  // ... resto
  using DevExpress.XtraEditors;
  using System;
  using System.Windows.Forms;
#endregion

namespace Arsys.Presentacion.WinForms.<Modulo>
{
    public partial class arsFrm<EntidadDestino> : arsFrmBase, ICrudBase
    {
        #region Variables Globales
        #endregion

        #region Objetos
        #endregion

        #region Constructor
        public arsFrm<EntidadDestino>() { InitializeComponent(); }
        #endregion

        #region Eventos
            #region Click
            #endregion
            #region DoubleClick
            #endregion
            #region EditValueChanged
            #endregion
            #region FocusedRowChanged
            #endregion
        #endregion

        #region Métodos de la Interfaz
            public void Guardar() { }
            public void Nuevo() { }
            public void Eliminar() { }
            public void Modificar() { }
            public void LimpiarControles() { }
            public void HabilitarControles(bool habilitar) { }
        #endregion

        #region Metodos Publicos
        #endregion

        #region Métodos Privados
        #endregion

        #region Asíncrono
        #endregion

        #region Barra de Usuarios
        #endregion
    }
}
```

## Paso 6 — Proceso

1. Leer los 3 archivos origen.
2. Mostrar al usuario lista de controles detectados con propuesta de renombrado.
3. Esperar OK.
4. Escribir los 3 archivos destino con transformaciones aplicadas.
5. Si hay Model/Presenter, clonar también (renombrar `M<Entidad>` y `P<Entidad>`).
6. Actualizar referencias en el `.csproj` del módulo destino (agregar los nuevos archivos como `<Compile>` y `<EmbeddedResource>`).

## Paso 7 — Reportar

- Rutas creadas
- Controles renombrados (lista)
- Si falta Model/Presenter, ofrecer crearlos
- Próximos pasos: abrir en Visual Studio 2013, ajustar layout visual, implementar lógica en `Guardar`, `Nuevo`, etc.
