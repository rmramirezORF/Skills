---
name: arsys-nuevo-reporte
description: Crea un reporte nuevo (.rdl) en ArsysReportes siguiendo la convención arsRpt*. Úsala cuando el usuario pida "nuevo reporte", "crear reporte", "rdl", "arsRpt" o mencione ArsysReportes.
argument-hint: [NombreReporte] [Modulo]
---

# Nuevo reporte en ArsysReportes

Genera un reporte `.rdl` nuevo siguiendo la convención del proyecto.

## Paso 1 — Contexto

Lee primero:
- `C:\DEIMAR\ARSYS\ArsysPresentacion\CLAUDE.md` (para saber cómo se consume desde el cliente)
- Revisa un reporte existente del módulo destino en `C:\DEIMAR\ARSYS\ArsysReportes\ArsysReportes\Arsys.Reportes.Reporte\<Modulo>\` — copia el estilo.

## Paso 2 — Datos que necesitas del usuario

1. **Nombre descriptivo** del reporte (ej. "Faltante Transporte Por Vehículo") → se convertirá a `arsRptFaltanteTransportePorVehiculo.rdl`.
2. **Módulo** (Compras, Venta, Inventario, Contabilidad, CuentaBancaria, Paddy, Nomina, ActivoFijo…).
3. **Origen de datos**:
   - ¿Stored procedure (`fn<Desc>`) ya existe? Si sí, nombre y parámetros.
   - Si no, ¿consulta directa a tablas? ¿Cuáles?
4. **Parámetros del reporte** (comunes: `IdSociedad`, rango de fechas, filtros).
5. **Agrupaciones / totales** esperados.

## Paso 3 — Ubicación y nombre

Ruta destino:
```
C:\DEIMAR\ARSYS\ArsysReportes\ArsysReportes\Arsys.Reportes.Reporte\<Modulo>\arsRpt<Descripcion>.rdl
```

Nombre sigue **PascalCase** sin espacios ni guiones, prefijo obligatorio `arsRpt`.

## Paso 4 — Plantilla .rdl mínima

Genera un `.rdl` con estructura base:

```xml
<?xml version="1.0" encoding="utf-8"?>
<Report xmlns="http://schemas.microsoft.com/sqlserver/reporting/2008/01/reportdefinition"
        xmlns:rd="http://schemas.microsoft.com/SQLServer/reporting/reportdesigner">
  <DataSources>
    <DataSource Name="ArsysDS">
      <ConnectionProperties>
        <DataProvider>SQL</DataProvider>
        <ConnectString>Data Source=dtt.orf.com;Initial Catalog=ArsysTdh2026</ConnectString>
      </ConnectionProperties>
      <rd:SecurityType>None</rd:SecurityType>
      <rd:DataSourceID>{GUID}</rd:DataSourceID>
    </DataSource>
  </DataSources>
  <DataSets>
    <DataSet Name="ds{Nombre}">
      <Query>
        <DataSourceName>ArsysDS</DataSourceName>
        <CommandType>StoredProcedure</CommandType>
        <CommandText>fn{NombreSP}</CommandText>
        <QueryParameters>
          <QueryParameter Name="@idSociedad">
            <Value>=Parameters!IdSociedad.Value</Value>
          </QueryParameter>
          <!-- más parámetros -->
        </QueryParameters>
      </Query>
      <Fields>
        <!-- un <Field> por columna del SP/query -->
      </Fields>
    </DataSet>
  </DataSets>
  <ReportParameters>
    <ReportParameter Name="IdSociedad">
      <DataType>Integer</DataType>
      <Prompt>Sociedad</Prompt>
    </ReportParameter>
  </ReportParameters>
  <!-- Body con Tablix, títulos, logo ORF estándar -->
</Report>
```

Tras generar el esqueleto, **el usuario debe abrirlo en Visual Studio 2013 / Report Builder** para diseñar layout visual (tablix, header con logo, totales). La skill no genera el XAML completo del layout — solo la base de datos + parámetros + fields.

## Paso 5 — Integración con cliente

Si el reporte debe invocarse desde un `arsFrm` en `ArsysPresentacion`:

1. Agregar botón/opción en el formulario correspondiente.
2. El reporte se invoca por URL típicamente desde `arsFrmBase` (ver patrón de impresión en `ArsysPresentacion/CLAUDE.md`).
3. La URL suele ser `<BaseReportes>/Arsys.Reportes.Reporte/<Modulo>/arsRpt<Desc>.aspx`.

## Paso 6 — Reportar al usuario

- Ruta completa del .rdl creado
- SP requerido (si no existe, indicar que hay que crearlo)
- Parámetros definidos
- Próximos pasos: abrir en VS 2013, diseñar layout, probar en `Arsys.Reportes.Reporte/Default.aspx`
