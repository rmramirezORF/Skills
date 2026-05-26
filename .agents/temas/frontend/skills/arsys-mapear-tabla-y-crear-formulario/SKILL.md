---
name: arsys-mapear-tabla-y-crear-formulario
description: Mapea una tabla EXISTENTE de la BD ArsysMfh al modelo EF (EDMX), genera todas las capas backend (Entidad, Repositorio, Dominio, contrato WCF, registro en Unity) y CREA un formulario WinForms COMPLETAMENTE NUEVO en el frontend Arsys, basado en un formulario plantilla de referencia indicado por el usuario, aplicando las convenciones de Arsys y mejoras de rendimiento/estructura cuando se detecten. Valida automaticamente que la tabla exista; nunca crea ni modifica tablas en BD. Lee credenciales del App.config de Arsys.Infraestructura.Datos. SIEMPRE entra en modo plan antes de ejecutar y requiere DOS aprobaciones explicitas del usuario - (1) plan global al inicio (PUERTA 1), (2) confirmacion especifica antes de generar el formulario en la Fase 10 (PUERTA 2). Solo necesita intervencion humana adicional para reiniciar el host WCF (Fase 6) y para validacion visual end-to-end (Fase 12). Trigger cuando el usuario pida mapear una tabla y crear un formulario basado en otro existente.
---

# Skill: Mapeo de Tabla EF + Generación Backend Completa + Formulario WinForms basado en Plantilla en ERP Arsys

## 🔴 REGLA MAESTRA OBLIGATORIA — MODO PLAN SIEMPRE ACTIVO (PUERTA 1)

**INVIOLABLE.** Antes de ejecutar **cualquier** acción de las 13 fases descritas en esta skill, el agente **DEBE** activar el modo plan (EnterPlanMode / ExitPlanMode) y presentar al usuario:

1. El plan completo desglosado en las fases que aplican al caso concreto.
2. Los archivos exactos que se crearán, modificarán o eliminarán (con **rutas absolutas**).
3. La lista completa de proyectos backend y frontend que se tocarán.
4. Los comandos exactos que se ejecutarán (`sqlcmd`, `msbuild`, `svcutil`, `tf`, `copy`, `TextTransform.exe`).
5. Los puntos de checkpoint humano (reinicio del WCF, **confirmación previa al formulario**, prueba end-to-end).
6. El connection string que será usado (leído desde App.config), **enmascarando contraseña** si aplica.
7. La estructura de la nueva entidad / formulario propuestos.
8. Las **mejoras de rendimiento y estructura** identificadas respecto al formulario plantilla.
9. Los riesgos identificados.

**El agente NUNCA debe iniciar la ejecución sin que el usuario apruebe explícitamente el plan.** Si el usuario solicita modificaciones, el agente actualiza el plan y vuelve a presentarlo. Solo tras la aprobación expresa del usuario el agente sale del modo plan y ejecuta. Esta regla aplica **incluso si el usuario invoca la skill con instrucciones aparentemente claras o completas**.

---

## 🔴 CONFIRMACIÓN ESPECÍFICA OBLIGATORIA ANTES DE GENERAR EL FORMULARIO (PUERTA 2 — Fase 10)

**INVIOLABLE Y SEPARADA DE LA PUERTA 1.** Adicional a la aprobación inicial del plan, el agente **DEBE pausar ANTES de comenzar la Fase 10** (creación del formulario nuevo) y solicitar al usuario una **CONFIRMACIÓN EXPLÍCITA Y ESPECÍFICA** para esa fase.

### Procedimiento:

1. Después de finalizar exitosamente la Fase 9 (compilación del frontend base), el agente **NO** debe iniciar la Fase 10 automáticamente.
2. El agente debe preparar y mostrar al usuario un **"Resumen pre-formulario"** que incluya:
   - **Nombre exacto del nuevo formulario** a generar (ej. `arsFrmNuevoConcepto`).
   - **Módulo destino** y **ruta absoluta** donde se ubicarán los archivos (Vista, Modelo, Presenter, Designer, .resx, ModelORF si aplica).
   - **Formulario plantilla** que se tomará como base (ej. `arsFrmTipoImputacion`).
   - **Lista completa de archivos que se crearán**, con su ruta absoluta.
   - **Lista de controles DevExpress** que se replicarán y los que se ajustarán (lookups, grids, fechas, checks, etc.).
   - **Lista de eventos / handlers** que se cablearán.
   - **Lista de MEJORAS** que se aplicarán respecto a la plantilla (cierre WCF, cache local, BackgroundWorker, `.Include` explícito, validaciones robustas, etc.) **con justificación breve** por cada una.
   - **Reglas Arsys** que se garantizarán (XtraForm, idioma español, `ArsysSingleton.ObtenerInstancia.FechaServidor`, IdSociedad, patrón `try/finally Abort/Close`, headers de copyright).
   - Si aplica: **registro de la nueva acción en el menú del cliente** (con la ruta del archivo de configuración / acción a tocar).
3. El agente debe esperar una respuesta **explícita** del usuario:
   - **"Sí" / "Aprobado" / "Continúa" / "Generar" / "Confirmo"** o equivalentes → el agente procede con la Fase 10.
   - **"No" / "Cancela" / "Detente" / "Espera"** o equivalentes → el agente **NO** genera el formulario y pregunta al usuario qué ajustar (formulario plantilla distinto, nombre distinto, mejoras distintas, etc.).
   - Si el usuario solicita cambios → el agente actualiza el resumen pre-formulario y vuelve a pedir confirmación. Este ciclo se repite hasta obtener aprobación explícita o cancelación.
4. **La aprobación previa del plan inicial NO sustituye esta confirmación específica.** Son **dos puertas distintas**: una al inicio (plan global — PUERTA 1) y otra antes de la Fase 10 (formulario — PUERTA 2).
5. Si el usuario cancela en este checkpoint, el agente debe **detener el flujo**. El backend ya creado (Fases 1-9) queda funcional pero sin formulario; el agente reporta que las capas de backend, EDMX y proxy ya se generaron y que el formulario quedó pendiente.
6. **La skill NUNCA debe generar el formulario sin esta confirmación explícita**, incluso si el plan global fue aprobado.

---

## Trigger

La skill debe activarse cuando el usuario pida:

- "Mapear la tabla"

---

## Inputs Esperados

Antes de iniciar, la skill debe preguntar al usuario (si no están en el prompt):

1. **Tabla y schema en ArsysMfh** (ej. `Compra.NuevoConcepto`). La skill **asume que la tabla YA EXISTE** en BD y deberá validarlo.
2. **Módulo destino** (ej. `Compra`, `Venta`, `Inventario`, `Contabilidad`, `Tercero`, etc.) que define en qué proyectos backend y frontend se generan los artefactos.
3. **Formulario base de referencia (OBLIGATORIO):** nombre exacto del formulario existente que se tomará como plantilla (ej. `arsFrmTipoImputacion`, `arsFrmCentroCostoV2`). La skill leerá ese formulario y lo replicará adaptándolo a la nueva entidad.
4. **Nombre del nuevo formulario** (sin prefijo, ej. `NuevoConcepto` → generará `arsFrmNuevoConcepto`).
5. **Tipo de formulario:** CRUD completo (consulta + alta + edición + eliminación) / solo consulta / solo captura. Por defecto: **CRUD completo si la plantilla lo es**.
6. **Comportamiento adicional esperado:** filtros, lookups, validaciones particulares, columnas a mostrar en grid, etc. (opcional, la skill infiere desde la plantilla y la entidad).

### ⚠️ NOTA SOBRE CREDENCIALES BD

La skill **NO debe pedir credenciales al usuario**. Las cadenas de conexión están en el `App.config` del proyecto backend `Arsys.Infraestructura.Datos`. La skill debe leerlas automáticamente desde allí (ver detalle en sección "Resolución del connection string" más abajo).

---

## Resolución del Connection String (Automática, sin Intervención Humana)

La skill debe extraer el connection string de:
```
C:\Arsys\ArsysServiciosORF\Arsys.Infraestructura.Datos\App.config
```

### Procedimiento:

1. **Leer el archivo App.config** (XML).
2. **Localizar el bloque `<connectionStrings>`.**
3. **Identificar el connection string** que apunta a `ArsysMfh` / `devtes.orf.com\desarrollo` según el contexto EF asociado al schema de la tabla (mapping más abajo).
4. El valor del connectionString típicamente está en formato EF:
   ```
   metadata=res://*/...; provider=System.Data.SqlClient; provider connection string="Data Source=devtes.orf.com\desarrollo;Initial Catalog=ArsysMfh;..."
   ```
5. **Parsear el sub-string `"provider connection string"`** para extraer:
   - `Data Source` (servidor + instancia)
   - `Initial Catalog` (base de datos, debe ser `ArsysMfh`)
   - `Integrated Security` (`true` / `SSPI` = autenticación Windows) o `User ID` + `Password`
6. **Construir el comando sqlcmd** con los parámetros extraídos:
   - Si `Integrated Security=True` o `SSPI`:
     ```
     sqlcmd -S "<DataSource>" -d "<InitialCatalog>" -E -Q "<query>"
     ```
   - Si `User ID` / `Password`:
     ```
     sqlcmd -S "<DataSource>" -d "<InitialCatalog>" -U "<User>" -P "<Pass>" -Q "<query>"
     ```
7. **En el plan presentado al usuario, MOSTRAR:**
   - El nombre del connection string usado (ej. `ArsysEntitiesContable`).
   - El servidor y la base extraídos (ej. `Data Source=devtes.orf.com\desarrollo`, `Initial Catalog=ArsysMfh`).
   - El modo de autenticación (Integrated o SQL).
   - Si la autenticación es SQL, **ENMASCARAR la contraseña** (mostrar User ID en claro y Password como `*****`).
8. Si el archivo App.config no existe, no contiene el connection string esperado, o tiene formato no parseable: **detener y reportar**.

### Mapping Connection String → EDMX → Schema:

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

## Contexto del Proyecto

**Stack:** .NET Framework 4.5, C#, WinForms, DevExpress 14.1.7, EF6 Database First (EDMX), WCF, MVP Passive View, Unity IoC, TFS.

**Soluciones:**
- **Backend:** `C:\Arsys\ArsysServiciosORF\ArsysServicios.sln` (137 proyectos).
- **Frontend:** `C:\Arsys\ArsysPresentacion\ArsysPresentacion.sln` (76 proyectos).
- **Servidor BD:** `devtes.orf.com\desarrollo`, base `ArsysMfh`.
- **App.config con connection strings:** `C:\Arsys\ArsysServiciosORF\Arsys.Infraestructura.Datos\App.config`.
- **DLL compartida:** `Arsys.Dominio.Entidades.dll` se versiona manualmente en `C:\Arsys\ArsysPresentacion\Arsys.Presentacion.Base\Librerias`.
- **Endpoint WCF base:** `http://localhost:30584/servicios/Servicios[Modulo]Arsys.svc`.
- **IoC:** Microsoft.Practices.Unity 3.5, registro central en `FabricaIoCArsys` (`Arsys.Transversal.Arsys`).
- **Idioma:** SIEMPRE en español (variables de negocio, comentarios, mensajes).

### Convenciones de Nombres Backend

| Capa | Patrón | Proyecto |
|---|---|---|
| Entidad | `<NombreEntidad>` (ej. `NuevoConcepto`) | `Arsys.Dominio.Entidades` |
| IRepositorio | `IRepositorio<Entidad>` | `Arsys.Dominio.IRepositorio.<Modulo>` |
| Repositorio | `Repositorio<Entidad>` | `Arsys.Infraestructura.Repositorio.<Modulo>` |
| IDominioContrato | `IDominioContrato<Entidad>` | `Arsys.Dominio.IContrato.<Modulo>` |
| Dominio | `Dominio<Entidad>` | `Arsys.Dominio.Servicio.<Modulo>` |
| Operaciones WCF | `OperationContract` en `IServicios<Modulo>Arsys` / `Servicios<Modulo>Arsys` | `Arsys.ServiciosDistribuidos` |

### Convenciones de Nombres Frontend

| Pieza | Patrón |
|---|---|
| Vista | `arsFrm<Entidad>` |
| Modelo | `M<Entidad>` |
| Presenter | `P<Entidad>` |
| ModelORF (si aplica) | `M<Entidad>ORF` |

**Reglas globales:**
- **Singleton de fecha:** usar SIEMPRE `ArsysSingleton.ObtenerInstancia.FechaServidor`, **nunca** `DateTime.Now`.
- **Cierre WCF:** patrón `try/finally` con `Abort/Close` (helper `Ejecutar<T>` si la plantilla lo usa).
- **Multi-tenancy:** filtrar siempre por `IdSociedad` / `IdEmpresa` en queries.
- **Lazy loading desactivado:** usar `.Include()` explícito en queries cuando se necesiten colecciones.

---

## 13 Fases de Ejecución (TODAS sujetas a la REGLA MAESTRA del modo plan)

### Fase 1 — Validar Existencia de la Tabla en BD (AGENTE consulta sin modificar)

**Descripción:** Confirmar que la tabla existe en ArsysMfh y extraer su estructura completa para alimentar el resto del flujo.

**Agente/Humano:** Agente (100% automático tras aprobación plan).

**Pasos:**

1. Resolver el connection string según la sección "Resolución del connection string".
2. Ejecutar consulta de validación contra el servidor:
   ```
   sqlcmd -S "<DataSource>" -d "<InitialCatalog>" -E -Q "
   SELECT TABLE_SCHEMA, TABLE_NAME
   FROM INFORMATION_SCHEMA.TABLES
   WHERE TABLE_SCHEMA = '<schema>' AND TABLE_NAME = '<tabla>';"
   ```
3. **Casos:**
   - **a. La tabla EXISTE:** continuar. Extraer estructura completa (columnas, tipos, nullabilidad, PK, FK, índices) con queries a `INFORMATION_SCHEMA.COLUMNS`, `sys.indexes`, `sys.foreign_keys`, `sys.key_constraints`.
   - **b. La tabla NO EXISTE:** **detener** el flujo, reportar al usuario que la tabla no existe en ArsysMfh y NO continuar (la skill **no crea tablas**, solo las mapea).
4. **Mostrar al usuario en el plan la estructura detectada** (columnas, tipos, PK, FKs, índices) para que valide antes de aprobar.
5. Si la tabla tiene FKs hacia otras tablas: identificar esas tablas y validar que YA estén mapeadas en el EDMX correspondiente (con Grep). Si alguna FK apunta a una tabla no mapeada, **alertar** al usuario en el plan (no detener, pero advertir que las navigation properties podrían quedar incompletas).

---

### Fase 2 — EDMX (Edit en 3 secciones, agregando la entidad NUEVA completa)

**Descripción:** Insertar la entidad nueva en las tres vistas del modelo EDMX (SSDL, CSDL, MSL) con todas sus columnas y asociaciones.

**Agente/Humano:** Agente (100% automático).

**Pasos:**

1. **Localizar el .edmx correcto** según el schema (mapping arriba).
2. **Agregar en SSDL (storage)** un `<EntityType>` nuevo con todas las columnas extraídas en Fase 1, más el `<EntitySet>` correspondiente.
3. **Agregar en CSDL (conceptual)** el `<EntityType>` con las propiedades CLR equivalentes y las `<NavigationProperty>` hacia entidades relacionadas (FKs).
4. **Agregar en MSL** el `<EntitySetMapping>` con los `<ScalarProperty>` de cada columna.
5. **Agregar las `<Association>`** en SSDL/CSDL para las FKs detectadas en Fase 1, y los `<AssociationSetMapping>` en MSL.
6. **Verificar coherencia con Grep** (nombres consistentes en las 3 secciones, tipos coherentes `int ↔ Int32`, `decimal ↔ Decimal`, `datetime ↔ DateTime`, `bit ↔ Boolean`, `nvarchar ↔ String`).
7. **IDEMPOTENCIA:** si la entidad ya está presente en el EDMX (Grep previo), reportar y **omitir la inserción**.

---

### Fase 3 — Plantillas .tt (TextTransform.exe; Plan B = Generación Manual)

**Descripción:** Regenerar las clases C# autogeneradas a partir del EDMX usando las plantillas T4. Si falla, generar manualmente.

**Agente/Humano:** Agente (100% automático, con fallback).

**Pasos:**

1. **Localizar TextTransform.exe** en la instalación de Visual Studio (cualquier versión 2013-2022):
   ```
   C:\Program Files (x86)\Microsoft Visual Studio\2019\Professional\Common7\IDE\TextTransform.exe
   o
   C:\Program Files (x86)\Microsoft Visual Studio\2022\Professional\Common7\IDE\TextTransform.exe
   ```
2. **Ejecutar sobre `ModelArsys[X].tt` y `ModelArsys[X].Context.tt`:**
   ```
   TextTransform.exe -i "C:\Arsys\ArsysServiciosORF\Arsys.Dominio.Entidades\ModelArsys[X].tt" -o "C:\Arsys\ArsysServiciosORF\Arsys.Dominio.Entidades\ModelArsys[X].cs"
   TextTransform.exe -i "C:\Arsys\ArsysServiciosORF\Arsys.Dominio.Entidades\ModelArsys[X].Context.tt" -o "C:\Arsys\ArsysServiciosORF\Arsys.Dominio.Entidades\ModelArsys[X].Context.cs"
   ```
3. **Verificar** que se haya generado el archivo `<Entidad>.cs` en `C:\Arsys\ArsysServiciosORF\Arsys.Dominio.Entidades\` y que el `ModelArsys[X].Context.cs` incluya el `DbSet` correspondiente.
4. **Plan B (generación manual)** si TextTransform falla por dependencias del SDK:
   - Generar manualmente con `Write` el archivo `<Entidad>.cs` siguiendo el patrón de las entidades autogeneradas existentes (atributos `[DataMember]`, constructor con `HashSet` para colecciones de navigation, propiedades nullable según corresponda).
   - Editar el `.Context.cs` para agregar la propiedad `DbSet<Entidad>`.
5. **Crear (si no existe) el archivo extender** `Arsys.Dominio.Entidades\Extender<Entidad>.cs` con la clase parcial vacía (solo namespace + `partial class`, listo para agregar propiedades transitorias futuras).

---

### Fase 4 — Crear Capas Backend (Repositorio + Dominio + WCF + IoC)

**Descripción:** Crear todas las capas del backend para la nueva entidad y registrarlas en el contenedor de IoC y el servicio WCF.

**Agente/Humano:** Agente (100% automático).

**Pasos:**

#### 4.1 — IRepositorio\<Entidad\>
- **Ubicación:** `C:\Arsys\ArsysServiciosORF\Arsys.Dominio.Contratos.<Modulo>\IRepositorio<Entidad>.cs`
- Hereda de `IRepositorioArsys<Entidad>`.
- Agrega operaciones típicas: `ConsultarTodos<Entidad>`, `ConsultarPorId`, etc., basadas en el patrón del módulo.

#### 4.2 — Repositorio\<Entidad\>
- **Ubicación:** `C:\Arsys\ArsysServiciosORF\Arsys.Infraestructura.Repositorio.<Modulo>\Repositorio<Entidad>.cs`
- Hereda de `RepositorioArsys<Entidad>` e implementa `IRepositorio<Entidad>`.
- Constructor recibe el contexto EF correcto (`ArsysEntities[X]`).
- Implementa queries con `.Include()` explícito según navigation properties.
- Filtra por `IdSociedad` si la entidad lo tiene.

#### 4.3 — IDominioContrato\<Entidad\>
- **Ubicación:** `C:\Arsys\ArsysServiciosORF\Arsys.Dominio.IContrato.<Modulo>\IDominioContrato<Entidad>.cs`
- Define operaciones de negocio: `Guardar`, `Modificar`, `Eliminar`, `ConsultarTodos`, `ConsultarPorId`.

#### 4.4 — Dominio\<Entidad\>
- **Ubicación:** `C:\Arsys\ArsysServiciosORF\Arsys.Dominio.Servicios.<Modulo>\Dominio<Entidad>.cs` (o `Arsys.Dominio.Servicio.<Modulo>` según convención existente del módulo).
- Implementa `IDominioContrato<Entidad>`.
- Inyecta el repositorio por constructor.
- Implementa la lógica de negocio (validaciones, guardado con Unidad de Trabajo, manejo de excepciones vía `AdministradorError`).
- Usa `TransactionScope` con `IsolationLevel.Serializable` y timeout de 10 min cuando aplique.

#### 4.5 — Registro en Unity (FabricaIoCArsys)
- **Archivo:** `C:\Arsys\ArsysServiciosORF\Arsys.Transversal.Arsys\FabricaIoCArsys.cs`
- Registrar `IRepositorio<Entidad> → Repositorio<Entidad>`.
- Registrar `IDominioContrato<Entidad> → Dominio<Entidad>`.

#### 4.6 — Exposición en WCF
- **`IServicios<Modulo>Arsys`:** agregar `[OperationContract]` para cada operación pública.
- **`Servicios<Modulo>Arsys`:** implementar las operaciones delegando al `Dominio<Entidad>` (resuelto vía Unity).
- Aplicar `[FaultContract(typeof(ExcepcionArsys))]` según patrón del módulo.

#### 4.7 — Actualizar .csproj
- Actualizar los `.csproj` de cada proyecto donde se agregan archivos nuevos (Visual Studio lo hace automáticamente; la skill debe garantizarlo vía `Edit` del XML del `.csproj` si `Write` no integra).

#### 4.8 — Verificar Coherencia
- Verificar coherencia con `Grep` entre interfaces e implementaciones.

---

### Fase 5 — Compilar Backend (msbuild en Cascada)

**Descripción:** Compilar los proyectos del backend en orden de dependencias.

**Agente/Humano:** Agente (100% automático).

**Orden de compilación:**

1. `Arsys.Dominio.Entidades`
2. `Arsys.Infraestructura.Datos`
3. `Arsys.Infraestructura.Repositorio.<Modulo>`
4. `Arsys.Dominio.Servicios.<Modulo>` (o `.Servicio.<Modulo>`)
5. `Arsys.Transversal.Arsys`
6. `Arsys.ServiciosDistribuidos`

**Comandos:**
```powershell
$sln = "C:\Arsys\ArsysServiciosORF\ArsysServicios.sln"
msbuild "$sln" /p:Configuration=Debug /t:Arsys_Dominio_Entidades /v:minimal
msbuild "$sln" /p:Configuration=Debug /t:Arsys_Infraestructura_Datos /v:minimal
msbuild "$sln" /p:Configuration=Debug /t:Arsys_Infraestructura_Repositorio_<Modulo> /v:minimal
msbuild "$sln" /p:Configuration=Debug /t:Arsys_Dominio_Servicios_<Modulo> /v:minimal
msbuild "$sln" /p:Configuration=Debug /t:Arsys_Transversal_Arsys /v:minimal
msbuild "$sln" /p:Configuration=Debug /t:Arsys_ServiciosDistribuidos /v:minimal
```

**Capturar errores** y corregir si son de código generado por la skill. Si hay errores de lógica del usuario, reportar.

---

### Fase 6 — Reiniciar Host WCF (HUMANO — Checkpoint Obligatorio)

**Descripción:** Recargar el ensamblado en el servicio WCF para que exponga las nuevas operaciones y entidades.

**Agente/Humano:** **HUMANO** (checkpoint obligatorio).

**Pasos:**

1. **Pedir al usuario que reinicie:**
   - **IIS Express:** `iisexpress /stop; iisexpress /start`
   - **O IIS:** `iisreset`
   - **O servicio Windows:** `net stop ArsysServiciosORF; net start ArsysServiciosORF` (si aplica).
2. **Validar que el .svc responda** con WSDL:
   ```powershell
   $uri = "http://localhost:30584/servicios/Servicios<Modulo>Arsys.svc?wsdl"
   $response = Invoke-WebRequest -Uri $uri -UseBasicParsing
   ```
3. **Solo cuando el WSDL responda 200 OK**, avanzar.

---

### Fase 7 — Copiar DLL al Frontend (Bash/PowerShell)

**Descripción:** Actualizar la DLL `Arsys.Dominio.Entidades.dll` en la carpeta de librerías del frontend.

**Agente/Humano:** Agente (100% automático).

**Pasos:**

1. **tf checkout** de la DLL y `.pdb`:
   ```
   tf checkout "C:\Arsys\ArsysPresentacion\Arsys.Presentacion.Base\Librerias\Arsys.Dominio.Entidades.dll"
   tf checkout "C:\Arsys\ArsysPresentacion\Arsys.Presentacion.Base\Librerias\Arsys.Dominio.Entidades.pdb"
   ```
2. **Copiar desde** `C:\Arsys\ArsysServiciosORF\Arsys.Dominio.Entidades\bin\Debug`:
   ```powershell
   Copy-Item -Path "C:\Arsys\ArsysServiciosORF\Arsys.Dominio.Entidades\bin\Debug\Arsys.Dominio.Entidades.dll" `
             -Destination "C:\Arsys\ArsysPresentacion\Arsys.Presentacion.Base\Librerias\Arsys.Dominio.Entidades.dll" -Force
   Copy-Item -Path "C:\Arsys\ArsysServiciosORF\Arsys.Dominio.Entidades\bin\Debug\Arsys.Dominio.Entidades.pdb" `
             -Destination "C:\Arsys\ArsysPresentacion\Arsys.Presentacion.Base\Librerias\Arsys.Dominio.Entidades.pdb" -Force
   ```
3. **Validar timestamp** con `dir /T:W` o `Get-Item ... | Select-Object FullName, LastWriteTime`.

---

### Fase 8 — Update Service References (AGENTE regenera proxies vía línea de comandos)

**Descripción:** Regenerar los proxies WCF (`Reference.cs`) para que incluyan la nueva entidad y operaciones.

**Agente/Humano:** Agente (100% automático, con fallback).

**Pasos:**

1. **Identificar el Service Reference `Servicios<Modulo>Arsys` y los relacionados** según la tabla de mapeo (más abajo).
2. **tf checkout** de los archivos a regenerar:
   ```
   tf checkout Reference.cs
   tf checkout Reference.svcmap
   tf checkout configuration.svcinfo
   tf checkout configuration91.svcinfo
   tf checkout *.wsdl
   tf checkout *.xsd
   ```
3. **Regenerar proxy con `svcutil.exe`** (preferido `SlsvcUtil.exe` si está disponible) leyendo parámetros del `.svcmap` previo (`namespace`, `collectionType`, `enableDataBinding`, `/reference` para reuso de tipos).
4. **Actualizar Reference.svcmap** con fecha y endpoint.
5. **Validar con Grep** que `Reference.cs` contiene la nueva entidad y operaciones.
6. **Plan B:** edición manual del `Reference.cs` si svcutil falla o produce incompatibilidad (solo viable para casos simples).

---

### Fase 9 — Compilar Frontend Base (msbuild en Cascada)

**Descripción:** Compilar los proyectos base del frontend para asegurar que los proxies y la DLL actualizada están disponibles.

**Agente/Humano:** Agente (100% automático).

**Orden de compilación:**

1. `Arsys.Presentacion.Base`
2. `Arsys.Presentacion.Cloud`
3. `Arsys.Presentacion.Controles`
4. `Arsys.Presentacion.Controles.MVP`

Si falla: volver a Fase 7 / 8 (DLL o proxies).

---

## 🔴 CHECKPOINT DE CONFIRMACIÓN OBLIGATORIO ANTES DE FASE 10 (PUERTA 2)

**Antes de iniciar la Fase 10, el agente DEBE detenerse y solicitar confirmación explícita al usuario**, presentando el "Resumen pre-formulario" descrito en la sección "CONFIRMACIÓN ESPECÍFICA OBLIGATORIA ANTES DE GENERAR EL FORMULARIO". El agente solo procede tras una respuesta afirmativa explícita ("Sí", "Aprobado", "Continúa", "Generar", "Confirmo" o equivalentes). Si el usuario cancela, el flujo se detiene y se reporta el estado parcial.

---

### Fase 10 — Crear Formulario Nuevo en Frontend (REQUIERE CONFIRMACIÓN PREVIA — PUERTA 2)

**Descripción:** Esta es la fase clave de creación. La skill replica el formulario plantilla adaptándolo a la nueva entidad, **aplicando mejoras** donde detecte oportunidades. **SOLO se ejecuta tras confirmación explícita del usuario en el checkpoint anterior**.

**Agente/Humano:** Agente (genera artefactos MVP basados en plantilla).

**Pasos:**

#### 10.1 — Leer el formulario plantilla indicado por el usuario (ej. `arsFrmTipoImputacion`)
- **Vista:** `C:\Arsys\ArsysPresentacion\Arsys.Presentacion.WinForms.<ModuloPlantilla>\arsFrm<EntidadPlantilla>.cs` + `.Designer.cs` + `.resx`
- **Modelo:** `C:\Arsys\ArsysPresentacion\Arsys.Presentacion.WinForms.<ModuloPlantilla>.MVP\Model\M<EntidadPlantilla>.cs`
- **Presenter:** `...MVP\Presenter\P<EntidadPlantilla>.cs`
- **Identificar la estructura general** (regions, controles DevExpress usados, BackgroundWorkers, eventos clave, validaciones).

#### 10.2 — Generar los nuevos archivos en el módulo destino (puede ser distinto al de la plantilla)
- **Vista:** `C:\Arsys\ArsysPresentacion\Arsys.Presentacion.WinForms.<Modulo>\arsFrm<NuevaEntidad>.cs` + `.Designer.cs` + `.resx`
- **Modelo:** `...MVP\Model\M<NuevaEntidad>.cs`
- **Presenter:** `...MVP\Presenter\P<NuevaEntidad>.cs`
- Si el módulo plantilla usa `ModelORF` y aplica al destino: también `M<NuevaEntidad>ORF.cs`.

#### 10.3 — Adaptar
- Reemplazar tipos y nombres de la entidad plantilla por la nueva entidad.
- Ajustar los lookups, grids y controles según las propiedades reales de la nueva entidad.
- Mantener los patrones MVP, async (BackgroundWorker), validaciones de campos obligatorios, manejo de errores.
- Cablear los handlers necesarios (`EditValueChanged`, `CrudGuardar`, `CrudEliminar`, `Buscar`, `Limpiar`, `Nuevo`).

#### 10.4 — Reglas obligatorias en el formulario nuevo
- Heredar de `DevExpress.XtraEditors.XtraForm`.
- Idioma español en variables, comentarios y mensajes.
- Singleton `ArsysSingleton.ObtenerInstancia.FechaServidor` en cualquier timestamp (NUNCA `DateTime.Now`).
- Filtrado por `IdSociedad` / `IdEmpresa`.
- Cierre WCF con patrón `try/finally` `Abort/Close` (o helper `Ejecutar<T>` si la base lo provee).
- Headers de copyright y comentarios de sección siguiendo el estándar de Arsys.
- Uso de `ConsultarPermisosUsuarioAccion` si la plantilla lo hace.
- Limpiar campos en `uscBarraUsuario_Click_Nuevo` / `LimpiarControles`.
- BackgroundWorker para operaciones largas (consultas, guardado).

#### 10.5 — APLICAR MEJORAS si se detectan oportunidades (sin romper compatibilidad)
- Patrón de cierre WCF si la plantilla tiene leak (usar helper `Ejecutar<T>`).
- Eliminar consultas duplicadas (cache local cuando aplique).
- Validaciones robustas (campos obligatorios, formatos, rangos).
- Encapsular lógica repetida en métodos privados.
- Usar lookups con `SearchLookUpEdit` donde la plantilla use ComboBoxes pesados.
- Evitar bloqueo de UI: BackgroundWorker en lugar de llamadas síncronas largas.
- Hidratar colecciones explícitamente (`.Include()` en backend) si la plantilla deja navigation properties vacías.
- **Reportar al usuario en el plan qué mejoras se van a aplicar (con justificación breve por cada una).**

#### 10.6 — Agregar al .csproj
- Agregar los nuevos archivos al `.csproj` correspondiente (vista, modelo, presenter).

#### 10.7 — Registro en menú del cliente (si aplica)
- Si el formulario debe estar disponible en el menú del cliente (`ClienteORF`, `Cliente`, etc.): identificar el archivo de configuración de menú / acción del cliente y registrar la nueva acción (consultar al usuario si no está seguro).

---

### Fase 11 — Compilar Frontend del Módulo y Cliente

**Descripción:** Compilar los proyectos del módulo y del cliente para empaquetar el formulario nuevo.

**Agente/Humano:** Agente (100% automático).

**Orden de compilación:**

1. `Arsys.Presentacion.WinForms.<Modulo>.MVP`
2. `Arsys.Presentacion.WinForms.<Modulo>`
3. `Arsys.Presentacion.ClienteORF` (o el cliente que aplique).

Si falla: corregir y reintentar.

---

### Fase 12 — Pruebas (HUMANO — Checkpoint Obligatorio)

**Descripción:** Validar end-to-end el flujo completo abriendo el formulario nuevo en el cliente.

**Agente/Humano:** **HUMANO** ejecuta el cliente; **AGENTE** valida con queries SQL.

**Pasos:**

1. **Pedir al usuario** ejecutar el cliente ORF, abrir el nuevo formulario y operar el flujo (alta, consulta, modificación, eliminación según aplique).
2. La skill puede preparar queries SQL para validar persistencia (`SELECT * FROM ...`) y ejecutarlas vía `sqlcmd` después de que el usuario opere el formulario.

---

### Fase 13 — TFS (Bash/PowerShell, sin Check-in Automático)

**Descripción:** Registrar los archivos nuevos en TFS sin hacer check-in.

**Agente/Humano:** Agente registra cambios; **HUMANO** ejecuta `tf checkin` manualmente.

**Pasos:**

1. **`tf status /recursive`** para detectar pendientes.
2. **`tf info`** por archivo para distinguir add real vs candidato detectado.
3. **`tf add`** explícito para nuevos.
4. **Listar pendientes** al usuario; el `tf checkin` lo ejecuta el usuario manualmente.

---

## Reglas de Comportamiento

1. **MODO PLAN OBLIGATORIO (PUERTA 1):** la skill SIEMPRE entra en modo plan antes de ejecutar cualquier fase y solo procede tras aprobación explícita del usuario. **Inviolable.**
2. **CONFIRMACIÓN ADICIONAL ANTES DEL FORMULARIO (PUERTA 2):** la skill SIEMPRE pausa antes de la Fase 10 y pide confirmación explícita y específica al usuario, separada de la aprobación del plan global. **Segunda puerta de seguridad inviolable.**
3. **CREDENCIALES BD DESDE APP.CONFIG:** la skill NUNCA pide credenciales al usuario, las extrae automáticamente del `App.config` de `Arsys.Infraestructura.Datos`. Si no se pueden extraer, detener.
4. **PROTECCIÓN DE CREDENCIALES:** nunca exponer la contraseña del connection string en logs / outputs / mensajes. Enmascarar siempre como `*****`.
5. **LA SKILL NO CREA NI MODIFICA TABLAS EN BD:** solo valida existencia y mapea. Si la tabla no existe, detener y reportar.
6. **FORMULARIO NUEVO BASADO EN PLANTILLA:** el usuario debe indicar obligatoriamente el formulario plantilla. La skill nunca inventa el formulario desde cero.
7. **APLICACIÓN DE MEJORAS:** la skill DEBE detectar oportunidades de mejora respecto a la plantilla (rendimiento, estructura, seguridad WCF) y aplicarlas en el formulario nuevo, reportándolas al usuario en el plan y en el resumen pre-formulario con justificación. **La plantilla original NO se modifica.**
8. **Idioma:** español obligatorio en toda comunicación, comentarios y código generado.
9. **Autonomía amplia con seguridad:** una vez aprobado el plan global y confirmado el resumen pre-formulario, la skill ejecuta sin pedir confirmación intermedia, pero SIEMPRE valida cada paso antes de avanzar.
10. **Detener el flujo ante el primer error:** si una fase falla, detener y reportar; NO encadenar fallas.
11. **No crear documentación** (*.md, README) sin que el usuario lo pida.
12. **Manejar fallas con Plan B:**
    - Tabla no existe → detener, reportar.
    - App.config no parseable / connection string no encontrado → detener, reportar.
    - `TextTransform.exe` falla → generación manual del `.cs` autogenerado.
    - `svcutil` falla → edición manual del `Reference.cs`.
    - Build falla → corregir y reintentar.
    - Usuario cancela en el checkpoint pre-formulario → detener, reportar estado parcial (backend ya creado, formulario pendiente).
13. **Nunca hacer `tf checkin` automático** — solo `tf add`.
14. **Nunca tocar `bin`, `obj`, `.suo`, `.user`** ni sugerir agregarlos a TFS.
15. **Usar `ArsysSingleton.ObtenerInstancia.FechaServidor`** para timestamps en código nuevo.
16. **Verificar siempre con Grep** que las inserciones EDMX, las generaciones backend y los formularios queden coherentes.
17. **Idempotencia:** si la entidad ya está mapeada en el EDMX o el formulario ya existe, reportar y omitir, no duplicar.
18. **Checkpoints humanos obligatorios durante la ejecución:**
    - **a.** Aprobación inicial del plan global (modo plan — **PUERTA 1**).
    - **b.** **CONFIRMACIÓN ESPECÍFICA** antes de la Fase 10 (resumen pre-formulario — **PUERTA 2**).
    - **c.** Fase 6 (reinicio del WCF).
    - **d.** Fase 12 (pruebas end-to-end).
19. **Multi-tenancy:** todo código nuevo (backend y frontend) debe filtrar por `IdSociedad` / `IdEmpresa` cuando la entidad lo soporte.
20. **NUNCA modificar la plantilla original:** solo se lee como referencia.

---

## Tabla de Mapeo Service References (Referencia Rápida)

| Módulo de la entidad nueva | Service References a regenerar |
|---|---|
| `Compras` / `DocumentoProveedor` | `ServiciosComprasArsys`, `ServiciosCuentaPagarArsys`, `ServiciosReporteArsys` |
| `Ventas` / `Factura` | `ServiciosVentaArsys`, `ServiciosCuentaCobrarArsys`, `ServiciosReporteArsys` |
| `Inventario` / `Stock` | `ServiciosInventarioArsys`, `ServiciosVentaArsys`, `ServiciosComprasArsys` |
| `Tercero` / `Proveedor` / `Cliente` | `ServiciosTerceroArsys` (y la mayoría) |
| `Sociedad` / `Oficina` / `CentroCosto` | Casi todos |
| `ActivoFijo` | `ServiciosActivoFijoArsys` |
| `Nomina` | `ServiciosNominaArsys` |
| `Contabilidad` | `ServiciosContabilidadArsys`, `ServiciosReporteArsys` |
| `Seguridad` | `ServiciosSeguridadArsys` |

---

## Checklist de Archivos a Generar

### Backend (mínimo 5 archivos por entidad)

- [ ] `Arsys.Dominio.Entidades\<Entidad>.cs` (autogenerado por T4 o Plan B manual)
- [ ] `Arsys.Dominio.Entidades\Extender<Entidad>.cs` (clase parcial extender)
- [ ] `Arsys.Dominio.Contratos.<Modulo>\IRepositorio<Entidad>.cs`
- [ ] `Arsys.Infraestructura.Repositorio.<Modulo>\Repositorio<Entidad>.cs`
- [ ] `Arsys.Dominio.IContrato.<Modulo>\IDominioContrato<Entidad>.cs`
- [ ] `Arsys.Dominio.Servicios.<Modulo>\Dominio<Entidad>.cs`
- [ ] **Modificación:** `Arsys.Transversal.Arsys\FabricaIoCArsys.cs` (registros Unity)
- [ ] **Modificación:** `Arsys.ServiciosDistribuidos\IServicios<Modulo>Arsys.cs` (`OperationContract`s)
- [ ] **Modificación:** `Arsys.ServiciosDistribuidos\Servicios<Modulo>Arsys.cs` (implementaciones)
- [ ] **Modificación:** `Arsys.Dominio.Entidades\ModelArsys[X].edmx` (3 secciones)
- [ ] **Modificación:** `Arsys.Dominio.Entidades\ModelArsys[X].cs` y `.Context.cs`

### Frontend (mínimo 3 archivos por formulario)

- [ ] `Arsys.Presentacion.WinForms.<Modulo>\arsFrm<Entidad>.cs`
- [ ] `Arsys.Presentacion.WinForms.<Modulo>\arsFrm<Entidad>.Designer.cs`
- [ ] `Arsys.Presentacion.WinForms.<Modulo>\arsFrm<Entidad>.resx`
- [ ] `Arsys.Presentacion.WinForms.<Modulo>.MVP\Model\M<Entidad>.cs`
- [ ] `Arsys.Presentacion.WinForms.<Modulo>.MVP\Presenter\P<Entidad>.cs`
- [ ] (Opcional) `Arsys.Presentacion.WinForms.<Modulo>.MVP\Model\M<Entidad>ORF.cs`
- [ ] **Modificación:** `Reference.cs` regenerado en cada Service Reference afectado.
- [ ] **Modificación:** `Arsys.Presentacion.Base\Librerias\Arsys.Dominio.Entidades.dll` (copiada).
- [ ] **Modificación:** archivo de configuración del menú del cliente (si aplica registro de acción).

---

## Snippets Reutilizables

### Snippet sqlcmd: Validar existencia de tabla y extraer estructura

```powershell
# Existencia
sqlcmd -S "devtes.orf.com\desarrollo" -d "ArsysMfh" -E -Q "
SELECT TABLE_SCHEMA, TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'Compra' AND TABLE_NAME = 'NuevoConcepto';"

# Columnas
sqlcmd -S "devtes.orf.com\desarrollo" -d "ArsysMfh" -E -Q "
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'Compra' AND TABLE_NAME = 'NuevoConcepto'
ORDER BY ORDINAL_POSITION;"

# PK
sqlcmd -S "devtes.orf.com\desarrollo" -d "ArsysMfh" -E -Q "
SELECT k.COLUMN_NAME
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE k
  ON tc.CONSTRAINT_NAME = k.CONSTRAINT_NAME
WHERE tc.TABLE_SCHEMA = 'Compra' AND tc.TABLE_NAME = 'NuevoConcepto'
  AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY';"

# FKs
sqlcmd -S "devtes.orf.com\desarrollo" -d "ArsysMfh" -E -Q "
SELECT fk.name AS FK, OBJECT_SCHEMA_NAME(fk.parent_object_id) AS Schema_From,
       OBJECT_NAME(fk.parent_object_id) AS Table_From,
       OBJECT_SCHEMA_NAME(fk.referenced_object_id) AS Schema_To,
       OBJECT_NAME(fk.referenced_object_id) AS Table_To
FROM sys.foreign_keys fk
WHERE fk.parent_object_id = OBJECT_ID('Compra.NuevoConcepto');"
```

### Snippet EDMX SSDL: EntityType nuevo + Association FK

```xml
<EntityType Name="NuevoConcepto">
  <Key>
    <PropertyRef Name="id" />
  </Key>
  <Property Name="id" Type="int" Nullable="false" StoreGeneratedPattern="Identity" />
  <Property Name="codigo" Type="varchar" MaxLength="20" Nullable="false" />
  <Property Name="descripcion" Type="varchar" MaxLength="200" Nullable="true" />
  <Property Name="idSociedad" Type="int" Nullable="false" />
  <Property Name="activo" Type="bit" Nullable="false" />
</EntityType>

<EntitySet Name="NuevoConcepto" EntityType="Self.NuevoConcepto" Schema="Compra" />

<Association Name="FK_NuevoConcepto_Sociedad">
  <End Type="Self.Sociedad" Multiplicity="1" Role="Sociedad" />
  <End Type="Self.NuevoConcepto" Multiplicity="*" Role="NuevoConcepto" />
  <ReferentialConstraint>
    <Principal Role="Sociedad"><PropertyRef Name="id" /></Principal>
    <Dependent Role="NuevoConcepto"><PropertyRef Name="idSociedad" /></Dependent>
  </ReferentialConstraint>
</Association>
```

### Snippet EDMX CSDL: EntityType nuevo + NavigationProperty

```xml
<EntityType Name="NuevoConcepto">
  <Key>
    <PropertyRef Name="id" />
  </Key>
  <Property Name="id" Type="Int32" Nullable="false" annotation:StoreGeneratedPattern="Identity" />
  <Property Name="codigo" Type="String" MaxLength="20" Nullable="false" />
  <Property Name="descripcion" Type="String" MaxLength="200" Nullable="true" />
  <Property Name="idSociedad" Type="Int32" Nullable="false" />
  <Property Name="activo" Type="Boolean" Nullable="false" />
  <NavigationProperty Name="Sociedad" Relationship="Self.FK_NuevoConcepto_Sociedad"
                      FromRole="NuevoConcepto" ToRole="Sociedad" />
</EntityType>
```

### Snippet EDMX MSL: EntitySetMapping nuevo

```xml
<EntitySetMapping Name="NuevoConcepto">
  <EntityTypeMapping TypeName="Arsys.Dominio.Entidades.NuevoConcepto">
    <MappingFragment StoreEntitySet="NuevoConcepto">
      <ScalarProperty Name="id" ColumnName="id" />
      <ScalarProperty Name="codigo" ColumnName="codigo" />
      <ScalarProperty Name="descripcion" ColumnName="descripcion" />
      <ScalarProperty Name="idSociedad" ColumnName="idSociedad" />
      <ScalarProperty Name="activo" ColumnName="activo" />
    </MappingFragment>
  </EntityTypeMapping>
</EntitySetMapping>
```

### Snippet IRepositorio\<Entidad\>

```csharp
using System.Collections.Generic;
using Arsys.Dominio.Entidades;
using Arsys.Infraestructura.Datos.Arsys;

namespace Arsys.Dominio.IRepositorio.Compra
{
    public interface IRepositorioNuevoConcepto : IRepositorioArsys<NuevoConcepto>
    {
        IEnumerable<NuevoConcepto> ConsultarPorSociedad(int idSociedad);
        NuevoConcepto ConsultarPorCodigo(int idSociedad, string codigo);
    }
}
```

### Snippet Repositorio\<Entidad\>

```csharp
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using Arsys.Dominio.Entidades;
using Arsys.Dominio.IRepositorio.Compra;
using Arsys.Infraestructura.Datos.Arsys;

namespace Arsys.Infraestructura.Repositorio.Compra
{
    public class RepositorioNuevoConcepto : RepositorioArsys<NuevoConcepto>, IRepositorioNuevoConcepto
    {
        public RepositorioNuevoConcepto(ArsysEntitiesContable contexto) : base(contexto) { }

        public IEnumerable<NuevoConcepto> ConsultarPorSociedad(int idSociedad)
        {
            return Contexto.Set<NuevoConcepto>()
                           .Include(x => x.Sociedad)
                           .Where(x => x.idSociedad == idSociedad && x.activo)
                           .ToList();
        }

        public NuevoConcepto ConsultarPorCodigo(int idSociedad, string codigo)
        {
            return Contexto.Set<NuevoConcepto>()
                           .Include(x => x.Sociedad)
                           .FirstOrDefault(x => x.idSociedad == idSociedad && x.codigo == codigo);
        }
    }
}
```

### Snippet IDominioContrato\<Entidad\>

```csharp
using System.Collections.Generic;
using Arsys.Dominio.Entidades;

namespace Arsys.Dominio.IContrato.Compra
{
    public interface IDominioContratoNuevoConcepto
    {
        IEnumerable<NuevoConcepto> ConsultarPorSociedad(int idSociedad);
        NuevoConcepto ConsultarPorId(int id);
        int Guardar(NuevoConcepto entidad);
        void Modificar(NuevoConcepto entidad);
        void Eliminar(int id);
    }
}
```

### Snippet Dominio\<Entidad\>

```csharp
using System.Collections.Generic;
using System.Transactions;
using Arsys.Dominio.Entidades;
using Arsys.Dominio.IContrato.Compra;
using Arsys.Dominio.IRepositorio.Compra;
using Arsys.Transversal.Arsys;

namespace Arsys.Dominio.Servicios.Compra
{
    public class DominioNuevoConcepto : IDominioContratoNuevoConcepto
    {
        private readonly IRepositorioNuevoConcepto _repositorio;

        public DominioNuevoConcepto(IRepositorioNuevoConcepto repositorio)
        {
            _repositorio = repositorio;
        }

        public IEnumerable<NuevoConcepto> ConsultarPorSociedad(int idSociedad)
        {
            return _repositorio.ConsultarPorSociedad(idSociedad);
        }

        public NuevoConcepto ConsultarPorId(int id)
        {
            return _repositorio.ConsultarPorId(id);
        }

        public int Guardar(NuevoConcepto entidad)
        {
            try
            {
                using (var ts = new TransactionScope(TransactionScopeOption.Required,
                    new TransactionOptions
                    {
                        IsolationLevel = IsolationLevel.Serializable,
                        Timeout = System.TimeSpan.FromMinutes(10)
                    }))
                {
                    _repositorio.Guardar(entidad);
                    _repositorio.GuardarCambios();
                    ts.Complete();
                    return entidad.id;
                }
            }
            catch (System.Exception ex)
            {
                AdministradorError.RegistrarError(ex);
                throw;
            }
        }

        public void Modificar(NuevoConcepto entidad)
        {
            _repositorio.Modificar(entidad);
            _repositorio.GuardarCambios();
        }

        public void Eliminar(int id)
        {
            var entidad = _repositorio.ConsultarPorId(id);
            if (entidad == null) return;
            _repositorio.Eliminar(entidad);
            _repositorio.GuardarCambios();
        }
    }
}
```

### Snippet Registro Unity (FabricaIoCArsys)

```csharp
container.RegisterType<IRepositorioNuevoConcepto, RepositorioNuevoConcepto>(
    new TransientLifetimeManager(),
    new InjectionConstructor(new ResolvedParameter<ArsysEntitiesContable>()));

container.RegisterType<IDominioContratoNuevoConcepto, DominioNuevoConcepto>(
    new TransientLifetimeManager(),
    new InjectionConstructor(new ResolvedParameter<IRepositorioNuevoConcepto>()));
```

### Snippet Comando svcutil para regeneración de Service Reference

```powershell
$svcUtilPath = "C:\Program Files (x86)\Microsoft SDKs\Windows\v10.0A\bin\NETFX 4.6.2 Tools\svcutil.exe"
$proyecto    = "C:\Arsys\ArsysPresentacion\Arsys.Presentacion.Compra"
$svcRef      = "$proyecto\Service References\ServiciosComprasArsys"
$wsdlUri     = "http://localhost:30584/servicios/ServiciosComprasArsys.svc?wsdl"

& $svcUtilPath `
    /language:cs `
    /out:"$svcRef\Reference.cs" `
    /config:"$proyecto\app.config" `
    /mergeConfig `
    /namespace:*,Arsys.Presentacion.Cloud.ServiciosComprasArsys `
    /collectionType:System.Collections.Generic.List``1 `
    /serializer:DataContractSerializer `
    /enableDataBinding `
    /reference:"C:\Arsys\ArsysPresentacion\Arsys.Presentacion.Base\Librerias\Arsys.Dominio.Entidades.dll" `
    $wsdlUri
```

### Snippet C# helper Ejecutar\<T\> (cierre WCF seguro)

```csharp
public static class WcfHelper
{
    public static T Ejecutar<T>(Func<IServiciosComprasArsys, T> accion)
    {
        var cliente = new ServiciosComprasArsysClient();
        try
        {
            var resultado = accion(cliente);
            cliente.Close();
            return resultado;
        }
        catch
        {
            cliente.Abort();
            throw;
        }
    }
}
```

---

## Tabla de Mejoras Detectables sobre Formularios Plantilla

| Síntoma en plantilla | Mejora a aplicar | Justificación |
|---|---|---|
| `client.Close()` sin `try/catch` | Patrón `try/finally` + `Abort/Close` o helper `Ejecutar<T>` | Evita leak de canal WCF al fallar |
| Misma consulta WCF llamada N veces en la misma sesión | Cache local en campo privado / `Lazy<T>` | Reduce roundtrips y latencia |
| `DateTime.Now` en timestamps | `ArsysSingleton.ObtenerInstancia.FechaServidor` | Coherencia con hora del servidor / multi-tenant |
| Operación larga en el hilo UI | `BackgroundWorker` con `RunWorkerCompleted` | Evita bloqueo de la UI |
| `ComboBoxEdit` con miles de filas | `SearchLookUpEdit` con paginación | Mejor UX y menor consumo de memoria |
| Navigation property cargada perezosamente y luego null | `.Include(x => x.Relacion)` explícito en backend | Evita nulls inesperados con lazy loading off |
| Validaciones inline duplicadas | Método privado `ValidarCampos()` reutilizable | Reduce duplicación y centraliza reglas |
| Sin filtro `IdSociedad` | `Where(x => x.IdSociedad == sociedadActual)` | Multi-tenancy seguro |
| Sin `ConsultarPermisosUsuarioAccion` | Cablear control de permisos al `Load` del form | Seguridad por acción |
| Strings hardcoded de mensajes | Mover a recursos (`.resx`) | i18n / mantenibilidad |

**Ejemplo Antes / Después — Cierre WCF:**

```csharp
// ANTES (plantilla con leak)
var cliente = new ServiciosComprasArsysClient();
var lista = cliente.ConsultarTodos();
cliente.Close();   // si falla la consulta, cliente queda en faulted

// DESPUÉS (mejora aplicada)
var lista = WcfHelper.Ejecutar<List<NuevoConcepto>>(c => c.ConsultarTodos());
```

---

## Tabla de Errores Típicos con Resolución

| # | Síntoma | Causa | Resolución |
|---|---|---|---|
| 1 | "Error al leer App.config" | Path incorrecto o archivo no existe | Detener; pedir validar `C:\Arsys\ArsysServiciosORF\Arsys.Infraestructura.Datos\App.config` |
| 2 | "No se puede parsear el connection string" | Encriptado / formato no estándar | Detener; pedir al usuario validar formato |
| 3 | Tabla declarada por usuario no existe | Schema/nombre mal escrito | Detener; sugerir validar schema y nombre exacto |
| 4 | EDMX inconsistente SSDL ↔ CSDL ↔ MSL | Faltan secciones tras edición | El designer no abre; revisar tipos y nombres en las 3 capas |
| 5 | TextTransform genera `.cs` vacío o no actualiza Context | SDK incompleto | **Plan B:** generación manual de `<Entidad>.cs` y edit del Context |
| 6 | `Reference.cs` regenerado no expone la nueva entidad | WCF no reiniciado / contrato sin operaciones públicas | Reiniciar WCF; verificar `[OperationContract]` |
| 7 | Formulario nuevo compila pero no aparece en el menú | Falta registrar la acción | Registrar acción en módulo de seguridad / configuración del cliente |
| 8 | Formulario da "el contrato no está registrado" | Falta registro Unity | Registrar `IDominioContrato<Entidad>` en `FabricaIoCArsys` |
| 9 | Plantilla usa controles obsoletos / leak WCF | Patrón viejo | **Aplicar mejoras** en el nuevo formulario, no replicar el bug |
| 10 | `tf status` reporta agregar pero `tf info` "Ningún elemento coincide" | Candidato no agregado explícitamente | `tf add` explícito |
| 11 | Compilación frontend falla con tipo ambiguo | 2 versiones de la entidad (DLL vs proxy) | Validar que ambas estén actualizadas (Fase 7 y 8) |
| 12 | Usuario cancela en checkpoint pre-formulario | Flujo abortado en PUERTA 2 | Backend queda creado, formulario pendiente; reportar estado parcial claramente |
| 13 | `Reference.cs` queda incompatible tras `svcutil` | Parámetros no coinciden con `.svcmap` previo | Leer `.svcmap` y replicar `namespace`, `collectionType`, `enableDataBinding`, `/reference` |

---

## Ejemplo de "Resumen Pre-Formulario" (Fase 10 — PUERTA 2)

> **PAUSA antes de la Fase 10. Por favor confirma explícitamente para que proceda con la generación del formulario.**
>
> ### Resumen pre-formulario
>
> - **Nuevo formulario:** `arsFrmNuevoConcepto`
> - **Módulo destino:** `Compra`
> - **Plantilla base:** `arsFrmTipoImputacion` (módulo Contabilidad)
> - **Tipo:** CRUD completo (consulta + alta + edición + eliminación)
>
> #### Archivos a crear
>
> | Pieza | Ruta absoluta |
> |---|---|
> | Vista | `C:\Arsys\ArsysPresentacion\Arsys.Presentacion.WinForms.Compra\arsFrmNuevoConcepto.cs` |
> | Designer | `C:\Arsys\ArsysPresentacion\Arsys.Presentacion.WinForms.Compra\arsFrmNuevoConcepto.Designer.cs` |
> | Recursos | `C:\Arsys\ArsysPresentacion\Arsys.Presentacion.WinForms.Compra\arsFrmNuevoConcepto.resx` |
> | Modelo | `C:\Arsys\ArsysPresentacion\Arsys.Presentacion.WinForms.Compra.MVP\Model\MNuevoConcepto.cs` |
> | Presenter | `C:\Arsys\ArsysPresentacion\Arsys.Presentacion.WinForms.Compra.MVP\Presenter\PNuevoConcepto.cs` |
>
> #### Controles DevExpress
>
> - Replicados de la plantilla: `BarManager`, `LayoutControl`, `GridControl` + `GridView`, `TextEdit codigo`, `TextEdit descripcion`, `CheckEdit activo`, `uscBarraUsuario`, `uscBarraEstado`.
> - Ajustados: `LookUpEdit lueSociedad` para filtrado multi-tenant (la plantilla no lo tenía explícito).
>
> #### Eventos / handlers a cablear
>
> - `Load` → cargar lookups y lista inicial.
> - `uscBarraUsuario_Click_Nuevo` → `LimpiarControles`.
> - `uscBarraUsuario_Click_Guardar` → validar + enviar (BackgroundWorker).
> - `uscBarraUsuario_Click_Eliminar` → confirmación + eliminar.
> - `gridView1_FocusedRowChanged` → cargar registro seleccionado.
> - `txtCodigo_EditValueChanged` → validación instantánea.
>
> #### Mejoras a aplicar respecto a la plantilla
>
> | Mejora | Justificación |
> |---|---|
> | Helper `WcfHelper.Ejecutar<T>` para todos los llamados WCF | La plantilla cierra el cliente sin `try/finally` → leak en error |
> | Cache local de la lista de Sociedades (`Lazy<>`) | La plantilla la consulta cada vez que abre el lookup |
> | `BackgroundWorker` para `Guardar` y `ConsultarTodos` | La plantilla bloquea la UI ~2s al guardar |
> | Filtro `IdSociedad = ArsysSingleton.ObtenerInstancia.IdSociedadActual` | Multi-tenancy correcto |
> | `ValidarCampos()` privado reutilizado en Guardar/Modificar | La plantilla duplica las validaciones |
>
> #### Reglas Arsys garantizadas
>
> - Hereda de `DevExpress.XtraEditors.XtraForm`.
> - Idioma español en todos los identificadores y mensajes.
> - `ArsysSingleton.ObtenerInstancia.FechaServidor` en cualquier timestamp.
> - Filtro por `IdSociedad`.
> - Patrón `try/finally` `Abort/Close` (vía `WcfHelper.Ejecutar<T>`).
> - Headers de copyright Molinos ROA y comentarios de sección estándar.
> - `ConsultarPermisosUsuarioAccion` cableado al `Load`.
>
> #### Registro en menú
>
> - Archivo a tocar: `C:\Arsys\ArsysPresentacion\Arsys.Presentacion.ClienteORF\Acciones\AccionesCompra.xml` (acción `nuevoConcepto.gestionar`).
>
> ---
>
> **¿Confirmas la generación del formulario con esta especificación?**
> Responde **"Sí" / "Aprobado" / "Continúa" / "Generar" / "Confirmo"** para proceder, o indica los cambios que deseas aplicar.

---

## Conclusión

Esta skill automatiza el **mapeo completo de una tabla EXISTENTE en ArsysMfh** y la **generación de un formulario WinForms basado en plantilla**, replicando convenciones y aplicando mejoras de rendimiento y estructura. Cubre:

1. **Validación** de existencia de tabla (sin crearla) y extracción de su estructura.
2. **EDMX** en sus 3 capas (SSDL/CSDL/MSL) más asociaciones de FK.
3. **Backend completo:** entidad, repositorio, dominio, contrato WCF, registro en Unity.
4. **Compilación en cascada** del backend.
5. **Reinicio WCF** (humano).
6. **Copia de DLL** y **regeneración de Service References** vía `svcutil`.
7. **Compilación base del frontend.**
8. **Generación del formulario** (Vista + Modelo + Presenter + Designer + .resx) replicando una plantilla y aplicando mejoras detectadas.
9. **Compilación del módulo y cliente.**
10. **Pruebas end-to-end** (humano) con verificación SQL.
11. **Registro en TFS** sin check-in.

Las **dos puertas de seguridad** (PUERTA 1 = aprobación del plan global; PUERTA 2 = confirmación específica antes del formulario) garantizan que el usuario **siempre conserva el control** y conoce exactamente qué se va a generar antes de que ocurra.
