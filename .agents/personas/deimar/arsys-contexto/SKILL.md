---
name: arsys-contexto
description: Carga el contexto del ERP ARSYS (C:\DEIMAR\ARSYS). Úsala automáticamente cuando el usuario mencione ARSYS, trabaje en C:\DEIMAR\ARSYS, o pregunte por ArsysPresentacion, ArsysServiciosORF, arsRpt, WCF, Repositorio, IDominioContrato, MVP, ClienteORF, CERES, TDH, IROA, SMH, arsFrm, ArsysSingleton, FabricaIoCArsys, ModelArsys, ArsysTdh2026, ArsysRoa2026, ArsysNominaORF, Paddy, DevExpress, idSociedad, EDMX.
---

# Contexto ARSYS

Ubicación del código: `C:\DEIMAR\ARSYS`
Usuario: Deimar Cuchimba (programador, equipo ORF).

## Paso 1 — Leer fuentes canónicas

Antes de responder, **LEE siempre** estos dos archivos (son la fuente de verdad mantenida por el equipo):

1. `C:\DEIMAR\ARSYS\ArsysPresentacion\CLAUDE.md` — Capa cliente (76 proyectos, WinForms + DevExpress 14.1, MVP, consumo de WCF).
2. `C:\DEIMAR\ARSYS\ArsysServiciosORF\ArsysServiciosORF\CLAUDE.md` — Backend (154 proyectos, WCF + EF 6.1.1 Database First, Repository + Domain Services + Unit of Work, Unity DI).

No respondas sobre ARSYS sin haber leído el CLAUDE.md relevante a la capa que tocas.

## Resumen ejecutivo (para orientarte rápido)

ARSYS es un ERP **.NET Framework 4.5** de ORF con ~230 proyectos en dos soluciones principales:

| Capa | Solución | Tecnología |
|---|---|---|
| Cliente (UI) | `ArsysPresentacion.sln` | WinForms + DevExpress 14.1, patrón MVP |
| Backend | `ArsysServiciosORF.sln` | WCF (64 .svc) + EF 6.1.1 + Unity |
| Reportes | `ArsysReportes.sln` | ASP.NET WebForms con .rdl (`arsRpt*`) |
| Nómina | `ArsysNominaORFPresentacion.sln` | Solución separada |

**Clientes (ejecutables):** ClienteORF, ClienteCERES, ClienteINV, ClienteTDH, Cloud — comparten código, diferencian por `ArsysSingleton.aplicacionCliente` y skins DevExpress.

**Bases de datos (SQL Server, server `dtt.orf.com`):**
- `ArsysTdh2026` — principal (300+ tablas en ModelArsys.edmx)
- `ArsysNominaORF` — nómina ORF
- `ArsysDocumentos` — FileStream
- `ArsysRoa2026` — ROA company

## Flujo de una petición (memorízalo)

```
WinForm (arsFrmX) → Presenter (PX) → Model (MX) → WCF Proxy
→ Servicios{Modulo}Arsys.svc → Dominio{Entidad} (con TransactionScope)
→ IRepositorio{Entidad} → RepositorioArsys<T> → EF → SQL Server
```

La UI **nunca** toca BD directamente. Toda escritura pasa por `TransactionScope` y `_unidadDeTrabajo.RealizarCambios()` (hace auditoría automática de `fechaCreacion`/`fechaModificacion`).

## Reglas de nombres (resumen — detalle en los CLAUDE.md)

| Elemento | Patrón | Ejemplo |
|---|---|---|
| Formulario | `arsFrm<Entidad>` | `arsFrmProducto` |
| Model MVP | `M<Entidad>` | `MProducto` |
| Presenter | `P<Entidad>` | `PProducto` |
| Interface Repo | `IRepositorio<Entidad>` | `IRepositorioProducto` |
| Impl. Repo | `Repositorio<Entidad>` | `RepositorioProducto` |
| Interface Dominio | `IDominioContrato<Entidad>` | `IDominioContratoProducto` |
| Impl. Dominio | `Dominio<Entidad>` | `DominioProducto` |
| Interface WCF | `IServicios<Modulo>Arsys` | `IServiciosProductoArsys` |
| Impl. WCF | `Servicios<Modulo>Arsys` | `ServiciosProductoArsys` |
| Reporte RDL | `arsRpt<Descripcion>` | `arsRptFomentoArrocero` |
| Tabla BD | PascalCase | `Producto`, `FacturaCabecera` |
| Columna BD | camelCase | `idProducto`, `numeroProducto` |
| Stored procedure | `fn<Descripcion>` | `fnGenerarReporteVentasIca` |

## Cómo responder pedidos

Cuando el usuario pida crear o modificar algo:

1. **Identifica el módulo** (Producto, Inventario, Compras, Nomina, Paddy, ActivoFijo…).
2. **Identifica la capa afectada**:
   - UI → `ArsysPresentacion/Arsys.Presentacion.WinForms.<Modulo>/`
   - Lógica MVP → `ArsysPresentacion/Arsys.Presentacion.WinForms.<Modulo>.MVP/`
   - Servicio WCF → `ArsysServiciosORF/Arsys.ServiciosDistribuidos/`
   - Dominio → `ArsysServiciosORF/Arsys.Dominio.Servicios.<Modulo>/`
   - Repositorio → `ArsysServiciosORF/Arsys.Infraestructura.Repositorio.<Modulo>/`
   - Reporte → `ArsysReportes/Arsys.Reportes.Reporte/<Modulo>/` con nombre `arsRpt*`
3. **Lee el CLAUDE.md de la capa** para patrones exactos.
4. **Copia el patrón del vecino** (ej. si creas `RepositorioClienteNuevo`, mira `RepositorioProducto` primero).
5. Si creas un nuevo Repositorio o Dominio, **regístralo en `FabricaIoCArsys`** (`Arsys.Transversal.Arsys/FabricaIoCArsys.cs`).

## Gotchas frecuentes

- **Lazy loading DESHABILITADO** en EF → siempre `.Include()` explícito.
- **DevExpress**: usar `XtraMessageBox`, NUNCA `MessageBox`.
- **Entidades compartidas**: `Arsys.Dominio.Entidades.dll` es un DLL pre-compilado (no en fuentes).
- **Timezone**: fechas en hora local Colombia (es-CO).
- **Session WCF**: el cliente inyecta cabeceras via `ModeloBase.asignarCabecera(client.Endpoint)`. El servidor filtra por `idSociedad` en casi todo.
- **Multi-tenancy**: `idSociedad` → ORF=1, TDH=3, SMH=4, IROA=5, AVIATEC=14.
- **Build**: solo MSBuild o Visual Studio 2013. No hay CI ni tests automatizados.
