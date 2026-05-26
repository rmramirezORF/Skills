# Skill: arsys-mapear-tabla-y-crear-formulario

**Resumen ejecutivo — Para desarrolladores Arsys**

Mapea una tabla **ya existente** de `ArsysMfh` al modelo EF (EDMX), genera todas las capas backend y crea un formulario WinForms nuevo basado en un formulario plantilla que tú indicas.

> Especificación técnica completa: ver [SKILL.md](SKILL.md).

---

## Cuándo usar esta skill

Cuando ya tienes una **tabla creada en la BD** `ArsysMfh` y necesitas:

1. Mapearla al `.edmx` correspondiente.
2. Generar Entidad + Repositorio + Dominio + Contrato WCF + registro en Unity.
3. Crear un formulario WinForms nuevo **basándose en otro formulario existente** como plantilla.

La skill **NO** crea ni modifica tablas. Si la tabla no existe, se detiene.

---

## Cómo invocarla

Escribe en el chat algo como:

> "Mapea la tabla `Compra.NuevoConcepto` y crea el formulario `arsFrmNuevoConcepto` basado en `arsFrmTipoImputacion`."

---

## Inputs que se te pedirán

| Input | Ejemplo | Obligatorio |
|---|---|---|
| Tabla y schema en ArsysMfh | `Compra.NuevoConcepto` | Sí |
| Módulo destino | `Compra` | Sí |
| Formulario plantilla | `arsFrmTipoImputacion` | **Sí** (no se inventa desde cero) |
| Nombre del nuevo formulario | `NuevoConcepto` → `arsFrmNuevoConcepto` | Sí |
| Tipo (CRUD / consulta / captura) | CRUD completo | No (se infiere de la plantilla) |
| Comportamiento adicional | filtros, lookups, columnas | No (se infiere) |

**Credenciales BD:** no se piden. Se leen automáticamente del `App.config` de `Arsys.Infraestructura.Datos`.

---

## Diagrama del flujo (13 fases + 2 puertas + checkpoints humanos)

```
                          ┌──────────────────────────────────────┐
                          │  Invocación + Inputs                 │
                          └──────────────────┬───────────────────┘
                                             │
                          ┌──────────────────▼───────────────────┐
                          │  🚪 PUERTA 1 — Modo plan (PLAN GLOBAL)│
                          │  Agente presenta:                    │
                          │   • Fases aplicables                 │
                          │   • Archivos a crear/modificar       │
                          │   • Connection string (pwd enmascarada)│
                          │   • Mejoras detectadas vs plantilla  │
                          │   • Riesgos                          │
                          │  Espera aprobación EXPLÍCITA         │
                          └──────────────────┬───────────────────┘
                                       Aprobado
                                             │
   ┌─────────────────────────────────────────▼──────────────────────────────────────────┐
   │  BACKEND — Fases 1 a 5 (Agente 100% automático)                                   │
   │                                                                                    │
   │   F1  Validar tabla en BD ─► extraer estructura (cols, PK, FKs, índices)          │
   │   F2  EDMX (SSDL + CSDL + MSL + Associations)                                     │
   │   F3  Plantillas .tt (TextTransform.exe) — Plan B: generación manual              │
   │   F4  Capas backend: IRepositorio, Repositorio, IDominio, Dominio, Unity, WCF     │
   │   F5  Compilar backend en cascada (msbuild)                                       │
   │                                                                                    │
   └─────────────────────────────────────────┬──────────────────────────────────────────┘
                                             │
                          ┌──────────────────▼───────────────────┐
                          │  👤 F6 — Reinicio WCF (HUMANO)        │
                          │   iisreset / iisexpress / net stop    │
                          │   Agente valida WSDL 200 OK          │
                          └──────────────────┬───────────────────┘
                                             │
   ┌─────────────────────────────────────────▼──────────────────────────────────────────┐
   │  FRONTEND BASE — Fases 7 a 9 (Agente 100% automático)                             │
   │                                                                                    │
   │   F7  Copiar Arsys.Dominio.Entidades.dll/.pdb al frontend (tf checkout + copy)    │
   │   F8  Regenerar Service References (svcutil.exe) — Plan B: edición manual         │
   │   F9  Compilar frontend base en cascada (msbuild)                                 │
   │                                                                                    │
   └─────────────────────────────────────────┬──────────────────────────────────────────┘
                                             │
                          ┌──────────────────▼───────────────────┐
                          │  🚪 PUERTA 2 — Resumen pre-formulario │
                          │  Agente presenta:                    │
                          │   • Nombre + ruta del nuevo formulario│
                          │   • Plantilla base                   │
                          │   • Archivos a crear (Vista/Modelo/  │
                          │     Presenter/Designer/.resx)        │
                          │   • Controles DevExpress             │
                          │   • Eventos a cablear                │
                          │   • MEJORAS a aplicar (con justific.)│
                          │   • Reglas Arsys garantizadas        │
                          │   • Registro en menú (si aplica)     │
                          │  Espera "Sí / Aprobado / Confirmo"   │
                          └──────────────────┬───────────────────┘
                                       Confirmado
                                             │
   ┌─────────────────────────────────────────▼──────────────────────────────────────────┐
   │  FORMULARIO + EMPAQUETADO — Fases 10 y 11 (Agente 100% automático)                │
   │                                                                                    │
   │   F10 Crear formulario: Vista + Designer + .resx + M<E> + P<E> (+ M<E>ORF)        │
   │        • Replica plantilla, aplica mejoras, agrega a .csproj                      │
   │        • Registra acción en menú del cliente (si aplica)                          │
   │   F11 Compilar módulo + cliente (msbuild)                                         │
   │                                                                                    │
   └─────────────────────────────────────────┬──────────────────────────────────────────┘
                                             │
                          ┌──────────────────▼───────────────────┐
                          │  👤 F12 — Pruebas end-to-end (HUMANO)│
                          │   Usuario abre cliente ORF y opera   │
                          │   Agente valida persistencia con SQL │
                          └──────────────────┬───────────────────┘
                                             │
                          ┌──────────────────▼───────────────────┐
                          │  F13 — TFS (Agente: tf add)          │
                          │  👤 Check-in lo hace el usuario      │
                          └──────────────────────────────────────┘
```

---

## Qué se automatiza vs qué requiere humano

| Fase | Quién | Acción |
|---|---|---|
| **Puerta 1** | 👤 Humano | Aprobar el plan global |
| 1 — Validar tabla en BD | 🤖 Agente | Lee BD vía `sqlcmd`, NO modifica |
| 2 — EDMX (3 secciones) | 🤖 Agente | Edita SSDL, CSDL, MSL + Associations |
| 3 — Plantillas .tt | 🤖 Agente | TextTransform.exe (Plan B: manual) |
| 4 — Capas backend | 🤖 Agente | Crea 6+ archivos, registra en Unity y WCF |
| 5 — Compilar backend | 🤖 Agente | msbuild en cascada |
| **6 — Reiniciar WCF** | 👤 **Humano** | `iisreset` / equivalente |
| 7 — Copiar DLL | 🤖 Agente | `tf checkout` + `Copy-Item` |
| 8 — Regenerar proxies | 🤖 Agente | `svcutil.exe` (Plan B: manual) |
| 9 — Compilar frontend base | 🤖 Agente | msbuild en cascada |
| **Puerta 2** | 👤 **Humano** | **Confirmar resumen pre-formulario** |
| 10 — Crear formulario | 🤖 Agente | Vista + Modelo + Presenter + Designer |
| 11 — Compilar módulo + cliente | 🤖 Agente | msbuild |
| **12 — Pruebas end-to-end** | 👤 **Humano** | Operar el cliente; agente valida con SQL |
| 13 — TFS | 🤖/👤 | Agente hace `tf add`; humano hace `tf checkin` |

---

## Qué esperar como salida

### Backend (mínimo 5 archivos nuevos + 5 modificaciones)

- `Arsys.Dominio.Entidades\<Entidad>.cs` y `Extender<Entidad>.cs`
- `Arsys.Dominio.Contratos.<Modulo>\IRepositorio<Entidad>.cs`
- `Arsys.Infraestructura.Repositorio.<Modulo>\Repositorio<Entidad>.cs`
- `Arsys.Dominio.IContrato.<Modulo>\IDominioContrato<Entidad>.cs`
- `Arsys.Dominio.Servicios.<Modulo>\Dominio<Entidad>.cs`
- Modificaciones: `FabricaIoCArsys.cs`, `IServicios<Modulo>Arsys.cs`, `Servicios<Modulo>Arsys.cs`, `ModelArsys[X].edmx`, `ModelArsys[X].cs/.Context.cs`

### Frontend (mínimo 5 archivos nuevos + DLL/proxies actualizados)

- `arsFrm<Entidad>.cs` + `.Designer.cs` + `.resx`
- `M<Entidad>.cs` y `P<Entidad>.cs` (opcional `M<Entidad>ORF.cs`)
- DLL `Arsys.Dominio.Entidades.dll` actualizada en `Arsys.Presentacion.Base\Librerias`
- `Reference.cs` regenerado en cada Service Reference afectado
- Registro de acción en el menú del cliente (si aplica)

---

## Las 2 puertas de aprobación — qué confirmas en cada una

| Puerta | Cuándo | Qué apruebas |
|---|---|---|
| **PUERTA 1** | Al inicio, antes de cualquier ejecución | El **plan global**: fases, archivos, comandos, connection string, mejoras detectadas, riesgos |
| **PUERTA 2** | Antes de la Fase 10 (formulario) | El **resumen pre-formulario**: nombre, ruta, plantilla, controles, eventos, mejoras concretas y registro en menú |

> La aprobación de la Puerta 1 **no sustituye** la Puerta 2. Son dos puertas independientes.
> Si cancelas en Puerta 2, el backend queda creado pero el formulario queda pendiente — la skill te lo reporta.

---

## Mejoras automáticas que la skill puede aplicar sobre la plantilla

La skill detecta y aplica (si corresponde) — siempre reportadas en el plan y en el resumen pre-formulario:

- Patrón `try/finally` `Abort/Close` o helper `Ejecutar<T>` (evita leak WCF).
- Cache local / `Lazy<T>` para consultas repetidas.
- `ArsysSingleton.ObtenerInstancia.FechaServidor` en lugar de `DateTime.Now`.
- `BackgroundWorker` para operaciones largas.
- `SearchLookUpEdit` en vez de `ComboBoxEdit` pesados.
- `.Include()` explícito (lazy loading desactivado).
- Métodos privados `ValidarCampos()` reutilizables.
- Filtro multi-tenant por `IdSociedad`.
- `ConsultarPermisosUsuarioAccion` en `Load`.

> **La plantilla original nunca se modifica.** Solo se lee como referencia.

---

## Cuándo la skill se detiene (Plan B / cancelaciones)

| Evento | Reacción |
|---|---|
| Tabla no existe en `ArsysMfh` | Detiene, reporta. NO crea tablas. |
| `App.config` no parseable / connection string no encontrado | Detiene, reporta. |
| `TextTransform.exe` falla | Plan B: generación manual del `.cs`. |
| `svcutil` falla | Plan B: edición manual del `Reference.cs`. |
| Build falla | Detiene, corrige errores propios y reintenta; si es lógica del usuario, reporta. |
| Usuario cancela en Puerta 1 | No se ejecuta nada. |
| Usuario cancela en Puerta 2 | Backend ya creado, formulario pendiente; reporta estado parcial. |
| Entidad ya existe en EDMX / formulario ya existe | Idempotencia: reporta y omite. |

---

## Reglas Arsys que la skill garantiza siempre

- Idioma **español** en variables, comentarios y mensajes.
- Hereda de `DevExpress.XtraEditors.XtraForm`.
- `ArsysSingleton.ObtenerInstancia.FechaServidor` (nunca `DateTime.Now`).
- Filtrado multi-tenant por `IdSociedad` / `IdEmpresa`.
- Cierre WCF seguro (`try/finally` `Abort/Close`).
- Lazy loading desactivado — `.Include()` explícito.
- Headers de copyright y comentarios de sección estándar.
- **Nunca** hace `tf checkin` automático.
- **Nunca** modifica `bin`, `obj`, `.suo`, `.user`.
- **Nunca** expone contraseña BD en logs.

---

## Referencias rápidas

- **Backend solución:** `C:\Arsys\ArsysServiciosORF\ArsysServicios.sln` (137 proyectos).
- **Frontend solución:** `C:\Arsys\ArsysPresentacion\ArsysPresentacion.sln` (76 proyectos).
- **BD:** `devtes.orf.com\desarrollo` → `ArsysMfh`.
- **Connection strings:** `C:\Arsys\ArsysServiciosORF\Arsys.Infraestructura.Datos\App.config`.
- **DLL compartida:** `C:\Arsys\ArsysPresentacion\Arsys.Presentacion.Base\Librerias\Arsys.Dominio.Entidades.dll`.
- **Endpoint WCF:** `http://localhost:30584/servicios/Servicios<Modulo>Arsys.svc`.
- **IoC:** Unity 3.5 — `FabricaIoCArsys` en `Arsys.Transversal.Arsys`.

---

**Stack:** .NET Framework 4.5 · C# · WinForms · DevExpress 14.1.7 · EF6 Database First · WCF · MVP Passive View · Unity IoC · TFS.
