---
name: arsys-formulario-contable
description: Crea un formulario ARSYS nuevo que contabiliza (genera documento contable, cuenta mayor, movimiento). Replica el patrón de arsFrmDocumentoContable existentes — integración con IDominioContratoDocumentoContable, TransactionScope y registro en cuenta mayor. Úsala cuando el usuario diga "formulario contable", "contabilizar", "generar asiento", "documento contable", "cuenta mayor".
argument-hint: [NombreFormulario] [TipoDocumento]
---

# Formulario contable en ARSYS

Crea un `arsFrm` que contabiliza siguiendo el patrón establecido del módulo Contabilidad.

## Paso 1 — Contexto

Lee:
- `C:\DEIMAR\ARSYS\ArsysPresentacion\CLAUDE.md`
- `C:\DEIMAR\ARSYS\ArsysServiciosORF\ArsysServiciosORF\CLAUDE.md`
- **Ejemplo vivo obligatorio**: explora formularios contables existentes para copiar el patrón exacto:
  ```
  C:\DEIMAR\ARSYS\ArsysPresentacion\Arsys.Presentacion.WinForms.Contabilidad\
    ├── arsFrmDocumentoContable*.cs
    ├── arsFrmAnulacionCheque.cs          ← ejemplo de anulación
    ├── arsFrmAnulacionOtrosPasivosFinancieros.cs
    └── arsFrmConsultaSaldosContabilidad.cs
  ```

Lee 1-2 de estos archivos para ver EXACTAMENTE cómo llaman al dominio contable.

## Paso 2 — Datos necesarios

1. **Nombre del formulario** (`arsFrm<Descripcion>`).
2. **Tipo de operación contable**: ¿genera documento? ¿anula? ¿consulta movimiento? ¿ajuste?
3. **Módulo origen del hecho** (Compras, Venta, Inventario, Nomina, CuentaBancaria, etc.) — define qué servicio de dominio invoca.
4. **Entidad principal** involucrada (ej. `FacturaCompra`, `Cheque`, `NotaCredito`).
5. **Clase de documento contable** (viene de tabla `ClaseDocumento`) — identificador del asiento.

## Paso 3 — Patrón contable típico

Cuando una operación contabiliza, el flujo es:

```
arsFrm<X>.Guardar()
  → M<X>.GuardarX(entidad)                       [MVP Model]
    → ServiciosXArsysClient.GuardarX(entidad)    [WCF client proxy]
      → ServiciosXArsys.GuardarX(entidad)        [WCF server]
        → DominioX.GuardarX(entidad)             [Domain service]
          using (TransactionScope tx = ...)
          {
             _IRepositorioX.Agregar(entidad)
             _IDominioContratoDocumentoContable.GenerarDocumentoContable(entidad)
               → inserta en Contabilidad.DocumentoCabecera
               → inserta en Contabilidad.DocumentoDetalle (N líneas)
               → actualiza Contabilidad.CuentaMayor (saldos)
             _IRepositorioX.UnidadDeTrabajo.RealizarCambios()
             tx.Complete()
          }
```

**Regla crítica:** TODO cambio contable va dentro del mismo `TransactionScope`. Si falla la contabilización, el documento del módulo origen también se deshace.

## Paso 4 — Archivos a crear

| Archivo | Ruta | Responsabilidad |
|---|---|---|
| UI | `Arsys.Presentacion.WinForms.<Modulo>\arsFrm<X>.cs` + `.Designer.cs` + `.resx` | Controles DevExpress, validaciones UI |
| Model | `Arsys.Presentacion.WinForms.<Modulo>.MVP\Model\M<X>.cs` | Llama al proxy WCF |
| Presenter | `Arsys.Presentacion.WinForms.<Modulo>.MVP\Presenter\P<X>.cs` | Orquesta View+Model |

Y en backend (si no existe el método contable):
| Archivo | Para qué |
|---|---|
| `Arsys.Dominio.Servicios.<Modulo>\Dominio<X>.cs` | Orquesta TransactionScope + llama a contabilización |

## Paso 5 — Controles estándar del formulario contable

El `arsFrm` contable SIEMPRE incluye:

- `arsTxtConsecutivo` — número de documento (readonly, se asigna al guardar)
- `arsDteFecha` — fecha contable
- `arsGleClaseDocumento` — GridLookUp para seleccionar clase (filtrado por tipo)
- `arsTxtConcepto` o `arsLacConcepto` — descripción del asiento
- `arsGcDetalle` con columnas típicas:
  - `arsGcColCuentaContable`
  - `arsGcColCentroCosto`
  - `arsGcColCentroEconomico`
  - `arsGcColDebito`
  - `arsGcColCredito`
  - `arsGcColTercero`
  - `arsGcColClaveContabilizacion`
- `arsLblTotalDebito` / `arsLblTotalCredito` — totales calculados
- Validación: **débito == crédito** antes de guardar.

## Paso 6 — Validaciones obligatorias antes de contabilizar

Genera este bloque en `Guardar()`:

```csharp
public void Guardar()
{
    // 1. Validar totales cuadren
    if (totalDebito != totalCredito)
    {
        XtraMessageBox.Show("Débito y Crédito no cuadran.", "Error", ...);
        return;
    }
    // 2. Validar clase documento
    if (arsGleClaseDocumento.EditValue == null) { ... return; }
    // 3. Validar al menos 2 líneas de detalle
    if (arsGcDetalle.DataSource == null || ((List<T>)arsGcDetalle.DataSource).Count < 2) { ... return; }
    // 4. Validar período no cerrado (llamar a ServiciosContabilidadArsys.PeriodoAbierto)
    // 5. Invocar Model → WCF
}
```

## Paso 7 — Reportar

- Archivos creados con rutas
- Ejemplo de invocación desde menú MDI
- Puntos pendientes: abrir en VS 2013 para diseñar layout, confirmar idClaseDocumento, probar período abierto
