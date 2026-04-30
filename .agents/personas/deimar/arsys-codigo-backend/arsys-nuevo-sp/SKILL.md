---
name: arsys-nuevo-sp
description: Crea un stored procedure nuevo en ARSYS siguiendo convención fn<Descripcion> + guía para importarlo al EDMX correcto como Function Import. Úsala cuando el usuario diga "nuevo SP", "stored procedure", "procedimiento almacenado", "fnGenerar", "Function Import".
argument-hint: [NombreSP] [BaseDatos]
---

# Nuevo stored procedure en ARSYS

Crea un SP respetando convención y guía su integración con Entity Framework.

## Paso 1 — Contexto

Lee:
- `C:\DEIMAR\ARSYS\ArsysServiciosORF\ArsysServiciosORF\CLAUDE.md` (sección Database Access)
- Ejemplos existentes de SPs:
  - `fnGenerarReporteVentasIca`
  - `fnSaldosContabilidad`
  - `GenerarCierreSaldoInventario`
  - `BalanceTercero`

## Paso 2 — Datos necesarios

1. **Nombre del SP** — prefijo `fn` + PascalCase descripción (ej. `fnConsultarFacturasPendientesCobrar`).
2. **Base de datos destino**: `ArsysTdh2026` (principal), `ArsysNominaORF`, `ArsysRoa2026`, `ArsysDocumentos`.
3. **Schema**: funcional del módulo (`Producto`, `Contabilidad`, `Venta`, `Inventario`, `Nomina`, etc.). Si no aplica, `dbo`.
4. **Parámetros de entrada** (siempre incluir `@idSociedad` si hay multi-tenancy).
5. **Columnas de retorno** (nombres exactos — EF Function Import los mapea).

## Paso 3 — Plantilla SP

```sql
USE [ArsysTdh2026]
GO

IF OBJECT_ID(N'[<Schema>].[<NombreSP>]', N'P') IS NOT NULL
    DROP PROCEDURE [<Schema>].[<NombreSP>]
GO

-- ===========================================================
-- Autor:        Deimar Cuchimba
-- Fecha:        <hoy>
-- Descripción:  <qué hace en 1 línea>
-- Módulo:       <Modulo>
-- Ejemplo:      EXEC [<Schema>].[<NombreSP>] @idSociedad = 1
-- ===========================================================
CREATE PROCEDURE [<Schema>].[<NombreSP>]
    @idSociedad INT,
    -- otros parámetros
    @fechaInicio DATE = NULL,
    @fechaFin DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        t.id<Tabla>       AS Id,
        t.numero          AS Numero,
        t.descripcion     AS Descripcion,
        t.fechaCreacion   AS FechaCreacion
        -- etc.
    FROM <Schema>.<Tabla> t
    WHERE t.idSociedad = @idSociedad
      AND (@fechaInicio IS NULL OR t.fecha >= @fechaInicio)
      AND (@fechaFin    IS NULL OR t.fecha <= @fechaFin)
    ORDER BY t.fecha DESC;
END
GO
```

## Paso 4 — Importar al EDMX

Instrucciones manuales para Visual Studio 2013:

1. Abrir `ArsysServiciosORF.sln`.
2. Proyecto `Arsys.Infraestructura.Datos` → abrir el `.edmx` correcto:
   - `ModelArsys.edmx` — principal (Producto, Inventario, Venta, Compras)
   - `ModelArsysContable.edmx` — contabilidad
   - `ModelArsysTransporte.edmx` — transporte
   - `ModelArsysCAF.edmx` — activo fijo
   - `ModelArsysMtto.edmx` — mantenimiento
   - `ModelArsysPaddy.edmx` — paddy
   - `ModelArsysNomina.edmx` — nómina legacy
   - `ModelNominaORF.edmx` — nómina ORF
   - `ModelArsysSeguridad.edmx` — seguridad
3. Click derecho en diseñador → **Update Model from Database**.
4. Pestaña **Add** → expandir **Stored Procedures and Functions** → marcar el nuevo SP → Finish.
5. En diseñador, click derecho en el SP → **Add Function Import**.
6. Nombre del resultado: `<NombreSP>_Result` (convención ARSYS).
7. Configurar Return Type:
   - Si retorna filas → **Complex** (click "Get Column Information" + "Create New Complex Type").
   - Si retorna escalar → tipo escalar correspondiente.
   - Si solo ejecuta → None.
8. Guardar el .edmx (genera clases `<NombreSP>_Result`).

## Paso 5 — Usar desde repositorio

```csharp
public List<<NombreSP>_Result> Ejecutar<NombreSP>(int idSociedad, DateTime? inicio, DateTime? fin)
{
    using (ArsysEntities ctx = new ArsysEntities())
    {
        return ctx.<NombreSP>(idSociedad, inicio, fin).ToList();
    }
}
```

## Paso 6 — Uso desde reporte .rdl

Si el SP alimenta un reporte `arsRpt*`:
- En el `.rdl` → DataSet → CommandType = **StoredProcedure**, CommandText = `<Schema>.<NombreSP>`.
- Parámetros del reporte mapean a los `@` del SP.

## Paso 7 — Reportar

- Script SQL del SP (listo para ejecutar)
- EDMX a actualizar
- Pasos manuales en VS2013 para Function Import
- Uso propuesto desde repositorio/reporte
