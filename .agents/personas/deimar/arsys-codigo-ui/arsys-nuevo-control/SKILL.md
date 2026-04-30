---
name: arsys-nuevo-control
description: Crea un UserControl nuevo (arsUsr*) para ARSYS siguiendo estándar de controles DevExpress, regiones ordenadas y prefijos ars. Úsala cuando el usuario diga "nuevo control", "user control", "arsUsr", "crear control reutilizable".
argument-hint: [NombreControl] [Modulo]
---

# Nuevo UserControl ARSYS

Crea un `arsUsr<Nombre>` (UserControl de DevExpress) reutilizable.

## Paso 1 — Contexto

Lee:
- `C:\DEIMAR\ARSYS\ArsysPresentacion\CLAUDE.md`
- Un UserControl existente de referencia en `Arsys.Presentacion.Controles\ControlesUsuario\` para copiar el patrón.

## Paso 2 — Datos necesarios

1. **Nombre del control** → prefijado con `arsUsr` (ej. `arsUsrBusquedaTercero`).
2. **Ubicación**:
   - Si es reutilizable en varios módulos → `Arsys.Presentacion.Controles\ControlesUsuario\`
   - Si es específico de un módulo → `Arsys.Presentacion.WinForms.<Modulo>\ControlesUsuario\`
3. **Propiedades públicas** que expondrá (valor seleccionado, etc.).
4. **Eventos custom** (ej. `ValorSeleccionado`, `BusquedaCompletada`).

## Paso 3 — Estructura del archivo .cs

```csharp
// ***************************************************************
// Assembly        : Arsys.Presentacion.Controles.<arsUsrX>
// Autor           : Deimar Cuchimba
// Fecha Creación  : <hoy>
// Descripción     : <una línea>
// Copyright       : © todos los derechos reservados a Molinos ROA S.A
// ***************************************************************

#region Versionado
  #region Ver 1.0
  // Fecha: <hoy> Autor: Deimar Descripción: Creación inicial
  #endregion
#endregion

#region Librerias Importadas
using System;
using System.ComponentModel;
using System.Windows.Forms;
using DevExpress.XtraEditors;
using Arsys.Dominio.Entidades;
using Arsys.Presentacion.Base;
#endregion

namespace Arsys.Presentacion.Controles.ControlesUsuario
{
    public partial class arsUsr<Nombre> : XtraUserControl
    {
        #region Variables Globales
        #endregion

        #region Propiedades Publicas
        // Ejemplo:
        // [Browsable(true)]
        // public string ValorSeleccionado { get; set; }
        #endregion

        #region Eventos Publicos
        // Ejemplo:
        // public event EventHandler ValorSeleccionado;
        #endregion

        #region Constructor
        public arsUsr<Nombre>()
        {
            InitializeComponent();
        }
        #endregion

        #region Eventos
            #region EditValueChanged
            #endregion
            #region Click
            #endregion
        #endregion

        #region Metodos Publicos
        #endregion

        #region Métodos Privados
        #endregion
    }
}
```

## Paso 4 — Controles internos permitidos

Solo DevExpress 14.1:
- `TextEdit` → nombrar `arsTxt<X>`
- `SimpleButton` → `arsBtn<X>`
- `GridControl` → `arsGc<X>` + `arsGv<X>` (GridView)
- `LookUpEdit` → `arsLac<X>`
- `GridLookUpEdit` → `arsGle<X>`
- `DateEdit` → `arsDte<X>`
- `ComboBoxEdit` → `arsCmb<X>`
- `CheckEdit` → `arsChk<X>`
- `LabelControl` → `arsLbl<X>`
- `SpinEdit` → `arsSpa<X>`

## Paso 5 — Registro en csproj

Agregar al `Arsys.Presentacion.Controles.csproj` (o al módulo destino):

```xml
<Compile Include="ControlesUsuario\arsUsr<Nombre>.cs">
  <SubType>UserControl</SubType>
</Compile>
<Compile Include="ControlesUsuario\arsUsr<Nombre>.Designer.cs">
  <DependentUpon>arsUsr<Nombre>.cs</DependentUpon>
</Compile>
<EmbeddedResource Include="ControlesUsuario\arsUsr<Nombre>.resx">
  <DependentUpon>arsUsr<Nombre>.cs</DependentUpon>
</EmbeddedResource>
```

## Paso 6 — Reportar

- Rutas creadas
- Referencias a agregar en consumidores
- Próximos pasos: compilar `Arsys.Presentacion.Controles`, arrastrar desde Toolbox en VS2013 (debe aparecer al compilar Release)
