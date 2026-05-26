# Skill: arsys-propagar-campo-bd-frontend

**Resumen ejecutivo — Para desarrolladores Arsys**

Propaga un campo **nuevo** desde la BD `ArsysMfh` (ejecutando el `ALTER TABLE`) hasta un formulario WinForms **ya existente** del frontend Arsys, atravesando todas las capas intermedias (EDMX, T4, backend, WCF, proxies, MVP).

> Especificación técnica completa: ver [SKILL.md](SKILL.md).

---

## Cuándo usar esta skill

Cuando necesitas que un **campo nuevo** exista en una tabla de `ArsysMfh` y aparezca en un `arsFrm*` existente. La skill se encarga de:

1. Crear la columna en BD (con FK / índice si aplica).
2. Mapearla en el `.edmx` (SSDL + CSDL + MSL + Association/NavigationProperty si es FK).
3. Regenerar las clases T4, compilar el backend y los proxies WCF.
4. Ajustar Modelo, Presenter y Vista del formulario destino.
5. Registrar los cambios en TFS (sin hacer check-in).

> Esta skill **modifica un formulario existente**. Si necesitas crear un formulario desde cero, usa `arsys-mapear-tabla-y-crear-formulario`.

---

## Cómo invocarla

Escribe en el chat algo como:

> "Agrega el campo `idConceptoPresupuesto INT NULL` a la tabla `Compra.DocumentoProveedorCabecera` y propágalo al formulario `arsFrmEmpaqueCorteCompraConsignacion`."

**Triggers reconocidos:** agregar, propagar, incluir, añadir, llevar el campo X a la tabla Y y al formulario arsFrmZ.

---

## Inputs que se te pedirán

| Input | Ejemplo | Obligatorio |
|---|---|---|
| Tabla y schema en ArsysMfh | `Compra.DocumentoProveedorCabecera` | Sí |
| Nombre del campo y tipo SQL | `idConceptoPresupuesto INT NULL` (con FK opcional) | Sí |
| Formulario destino | `arsFrmEmpaqueCorteCompraConsignacion` | Sí |
| Comportamiento esperado en el formulario | guardar / mostrar en grid / lookup / validación | Sí |

**Credenciales BD:** no se piden. Se leen automáticamente del `App.config` de `Arsys.Infraestructura.Datos`.

---

## Diagrama del flujo (11 fases + 1 puerta + 2 checkpoints humanos)

```
                          ┌──────────────────────────────────────┐
                          │  Invocación + Inputs                 │
                          └──────────────────┬───────────────────┘
                                             │
                          ┌──────────────────▼───────────────────┐
                          │  🚪 PUERTA — Modo plan (PLAN GLOBAL)  │
                          │  Agente presenta:                    │
                          │   • Fases aplicables                 │
                          │   • Archivos a crear/modificar       │
                          │   • Comandos (sqlcmd, msbuild,       │
                          │     svcutil, tf, TextTransform)      │
                          │   • Connection string (pwd enmascar.)│
                          │   • Checkpoints humanos (F5, F10)    │
                          │   • Riesgos                          │
                          │  Espera aprobación EXPLÍCITA         │
                          └──────────────────┬───────────────────┘
                                       Aprobado
                                             │
   ┌─────────────────────────────────────────▼──────────────────────────────────────────┐
   │  BD + BACKEND — Fases 1 a 4 (Agente 100% automático)                              │
   │                                                                                    │
   │   F1  ALTER TABLE en ArsysMfh ─► validar con INFORMATION_SCHEMA                   │
   │        (script idempotente, FK e índice si aplica)                                │
   │   F2  EDMX (SSDL + CSDL + MSL + Association/NavigationProperty si es FK)          │
   │   F3  Plantillas .tt (TextTransform.exe) — Plan B: edición manual                 │
   │   F4  Compilar backend en cascada (msbuild)                                       │
   │                                                                                    │
   └─────────────────────────────────────────┬──────────────────────────────────────────┘
                                             │
                          ┌──────────────────▼───────────────────┐
                          │  👤 F5 — Reinicio WCF (HUMANO)        │
                          │   iisreset / iisexpress / net stop    │
                          │   Agente valida WSDL 200 OK          │
                          └──────────────────┬───────────────────┘
                                             │
   ┌─────────────────────────────────────────▼──────────────────────────────────────────┐
   │  FRONTEND — Fases 6 a 9 (Agente: F6-F8 automático; F9 estructura + ajuste humano) │
   │                                                                                    │
   │   F6  Copiar Arsys.Dominio.Entidades.dll/.pdb al frontend (tf checkout + copy)    │
   │   F7  Regenerar Service References (svcutil.exe) — Plan B: edición manual         │
   │   F8  Compilar frontend en cascada (msbuild)                                      │
   │   F9  Ajustar MVP: Modelo (M<E>) + Presenter (P<E>) + Vista (arsFrm<E>)           │
   │        • Asignar campo al contrato antes del envío WCF                            │
   │        • Mostrar en grids/lookups, cablear handlers                               │
   │        • Limpiar en LimpiarControles / Click_Nuevo                                │
   │                                                                                    │
   └─────────────────────────────────────────┬──────────────────────────────────────────┘
                                             │
                          ┌──────────────────▼───────────────────┐
                          │  👤 F10 — Pruebas end-to-end (HUMANO)│
                          │   Usuario abre cliente ORF y opera   │
                          │   el formulario; agente valida       │
                          │   persistencia con SQL               │
                          └──────────────────┬───────────────────┘
                                             │
                          ┌──────────────────▼───────────────────┐
                          │  F11 — TFS (Agente: tf add)          │
                          │  👤 Check-in lo hace el usuario      │
                          └──────────────────────────────────────┘
```

---

## Qué se automatiza vs qué requiere humano

| Fase | Quién | Acción |
|---|---|---|
| **Puerta** | 👤 Humano | Aprobar el plan global |
| 1 — BD (ALTER TABLE) | 🤖 Agente | `sqlcmd` con credenciales del App.config, valida con `INFORMATION_SCHEMA` |
| 2 — EDMX (3 secciones) | 🤖 Agente | Edita SSDL, CSDL, MSL (+ Association/NavigationProperty si FK) |
| 3 — Plantillas .tt | 🤖 Agente | TextTransform.exe (Plan B: edición manual del `.cs`) |
| 4 — Compilar backend | 🤖 Agente | msbuild en cascada (5 proyectos) |
| **5 — Reiniciar WCF** | 👤 **Humano** | `iisreset` / equivalente; agente valida WSDL |
| 6 — Copiar DLL | 🤖 Agente | `tf checkout` + `Copy-Item` (`.dll` + `.pdb`) |
| 7 — Regenerar proxies | 🤖 Agente | `svcutil.exe` (Plan B: insertar propiedad manual) |
| 8 — Compilar frontend | 🤖 Agente | msbuild en cascada (7 proyectos) |
| 9 — Ajustar MVP del formulario | 🤖 + 👤 | Agente genera estructura; humano valida semántica |
| **10 — Pruebas end-to-end** | 👤 **Humano** | Operar el cliente; agente valida con SQL |
| 11 — TFS | 🤖 / 👤 | Agente hace `tf add`; humano hace `tf checkin` |

> **Esta skill tiene 1 sola puerta de aprobación** (al inicio). A diferencia de [arsys-mapear-tabla-y-crear-formulario](../arsys-mapear-tabla-y-crear-formulario/README.md), no requiere una segunda confirmación intermedia.

---

## Qué esperar como salida

### BD
- Columna nueva en la tabla indicada (con FK / índice si se solicitó).
- Script `Scripts<Tabla>_<campo>.sql` versionable en TFS.

### Backend (modificaciones)
- `ModelArsys[X].edmx` (3 secciones + Association si FK).
- `ModelArsys[X].cs` y `ModelArsys[X].Context.cs` (autogenerados o ajustados manual).
- `Extender<Entidad>.cs` (limpiar transitoria si quedó duplicada).
- DLLs `Arsys.Dominio.Entidades.dll` + `.pdb` recompiladas.

### Frontend (modificaciones)
- `Reference.cs` regenerado en cada Service Reference afectado.
- `Arsys.Presentacion.Base\Librerias\Arsys.Dominio.Entidades.dll` actualizada.
- `M<Entidad>.cs` — propiedad nueva.
- `P<Entidad>.cs` — mapeo Vista ↔ Modelo.
- `arsFrm<...>.cs` (+ `Designer.cs` / `.resx` si se agregan controles visuales) — asignación, validación, limpieza y restauración del campo.
- Variante `ModelORF` ajustada si existe.

---

## Cuándo la skill se detiene (Plan B / cancelaciones)

| Evento | Reacción |
|---|---|
| `App.config` no parseable / connection string no encontrado | Detiene, reporta. |
| Múltiples connection strings que apuntan a `ArsysMfh` | Pregunta cuál usar antes de aprobar el plan. |
| SQL `ALTER TABLE` falla | Detiene, reporta el error SQL. |
| Columna ya existe en BD | Idempotencia: reporta y continúa. |
| `TextTransform.exe` falla | Plan B: edición manual del `.cs` autogenerado. |
| `svcutil` falla / produce `Reference.cs` incompatible | Plan B: inserción manual de la propiedad (solo para campos simples). |
| Build backend o frontend falla | Detiene, corrige errores propios, reintenta. |
| Usuario cancela en la puerta inicial | No se ejecuta nada. |

---

## Mapping Service References (Referencia rápida)

| Entidad / Schema afectado | Service References a regenerar |
|---|---|
| `Compra.*`, `DocumentoProveedor*`, `CuentaPagar.*` | `ServiciosComprasArsys`, `ServiciosCuentaPagarArsys`, `ServiciosReporteArsys` |
| `Ventas.*`, `Factura*`, `CuentaCobrar.*` | `ServiciosVentaArsys`, `ServiciosCuentaCobrarArsys`, `ServiciosReporteArsys` |
| `Inventario.*`, `Stock*`, `Producto*` | `ServiciosInventarioArsys`, `ServiciosVentaArsys`, `ServiciosComprasArsys` |
| `Tercero.*`, `Proveedor*`, `Cliente*`, `Socio*` | `ServiciosTerceroArsys` (y la mayoría) |
| `Sociedad.*`, `Oficina.*`, `CentroCosto.*` | Casi todos los servicios |
| `Contabilidad.*` | `ServiciosContabilidadArsys`, `ServiciosReporteArsys` |
| `Seguridad.*` | `ServiciosSeguridadArsys` |

---

## Reglas Arsys que la skill garantiza siempre

- Idioma **español** en variables, comentarios y mensajes.
- `ArsysSingleton.ObtenerInstancia.FechaServidor` (nunca `DateTime.Now`).
- **Idempotencia** en scripts SQL (`IF COL_LENGTH IS NULL` / `IF NOT EXISTS`) y en ediciones EDMX (detectar si el campo ya existe).
- **Validación con Grep** de coherencia tras cada edición.
- **Nunca** hace `tf checkin` automático — solo `tf add`.
- **Nunca** modifica `bin`, `obj`, `.suo`, `.user`.
- **Nunca** expone contraseña BD en logs (siempre enmascarada como `*****`).
- **Detiene el flujo al primer error** — no encadena fallas.

---

## Referencias rápidas

- **Backend solución:** `C:\Arsys\ArsysServiciosORF\ArsysServicios.sln` (137 proyectos).
- **Frontend solución:** `C:\Arsys\ArsysPresentacion\ArsysPresentacion.sln` (76 proyectos).
- **BD:** `devtes.orf.com\desarrollo` → `ArsysMfh`.
- **Connection strings:** `C:\Arsys\ArsysServiciosORF\Arsys.Infraestructura.Datos\App.config`.
- **DLL compartida:** `C:\Arsys\ArsysPresentacion\Arsys.Presentacion.Base\Librerias\Arsys.Dominio.Entidades.dll`.
- **Endpoint WCF:** `http://localhost:30584/servicios/Servicios<Modulo>Arsys.svc`.

### Mapping Connection String → EDMX → Schema

| Connection String | EDMX | Schemas |
|---|---|---|
| `ArsysEntities` | `ModelArsys.edmx` | Tablas genéricas, Inventario, Producto |
| `ArsysEntitiesContable` | `ModelArsysContable.edmx` | `Compra.*`, `CuentaPagar.*`, `Contabilidad.*` |
| `ArsysEntitiesSeguridad` | `ModelArsysSeguridad.edmx` | `Sociedad.*`, `Seguridad.*` |
| `ArsysEntitiesCAF` | `ModelArsysCAF.edmx` | `ActivoFijo.*` |
| `ArsysEntitiesNomina` | `ModelArsysNomina.edmx` | `Nomina.*` |
| `ArsysEntitiesMtto` | `ModelArsysMtto.edmx` | `Mtto.*` |
| `ArsysEntitiesPaddy` | `ModelArsysPaddy.edmx` | `Paddy.*` |
| `ArsysEntitiesTransporte` | `ModelArsysTransporte.edmx` | `Transporte.*` |

---

**Stack:** .NET Framework 4.5 · C# · WinForms · DevExpress 14.1.7 · EF6 Database First · WCF · MVP Passive View · Unity IoC · TFS.
