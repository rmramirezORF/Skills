---
name: arsys-propagar-campo-bd-frontend
description: Propaga un campo nuevo desde la BD ArsysMfh hasta un formulario WinForms del frontend Arsys, ejecutando autonomamente el ALTER TABLE remoto (con credenciales tomadas del App.config de Arsys.Infraestructura.Datos), edicion del EDMX, regeneracion de plantillas T4, copia de DLLs, regeneracion de Service References via svcutil, ajuste de Modelo/Presenter/Vista (MVP) y registro en TFS. SIEMPRE entra en modo plan antes de ejecutar y requiere aprobacion explicita del usuario. Solo necesita intervencion humana adicional para reiniciar el host WCF (Fase 5) y para validacion visual end-to-end (Fase 10). Trigger cuando el usuario pida agregar/propagar un campo desde BD hasta un formulario arsFrm*.
---

# Skill: Propagación Completa de Campo BD → Frontend en ERP Arsys

## 🔴 REGLA MAESTRA OBLIGATORIA - MODO PLAN SIEMPRE ACTIVO

**INVIOLABLE:** Antes de ejecutar cualquier acción de las 11 fases descritas en esta skill, el agente **DEBE** activar el modo plan (EnterPlanMode / ExitPlanMode) y presentar al usuario:

1. El plan completo desglosado en las fases que aplican al caso concreto.
2. Los archivos exactos que se crearán, modificarán o eliminarán (con rutas absolutas).
3. Los comandos exactos que se ejecutarán (sqlcmd, msbuild, svcutil, tf, copy, TextTransform.exe).
4. Los puntos de checkpoint humano (Fase 5 y Fase 10).
5. El connection string que será usado (leído desde App.config), enmascarando contraseña si aplica.
6. Los riesgos identificados.

**El agente NUNCA debe iniciar la ejecución sin que el usuario apruebe explícitamente el plan.** Si el usuario solicita modificaciones, el agente actualiza el plan y vuelve a presentarlo. Solo tras la aprobación expresa del usuario el agente sale del modo plan y ejecuta. Esta regla aplica incluso si el usuario invoca la skill con instrucciones aparentemente claras o completas.

---

## Trigger

La skill debe activarse cuando el usuario pida:

- "Agregar el campo X a la tabla Y y propagarlo al formulario arsFrmZ"
- "Necesito que el campo X de la tabla Y aparezca en el formulario arsFrmZ"
- "Propaga el campo X desde BD hasta el frontend"
- Variantes en español equivalentes: incluir, añadir, llevar, propagar, propagación, añadidura, etc.

---

## Inputs Esperados

Antes de iniciar, la skill debe preguntar al usuario (si no están en el prompt):

1. **Tabla y schema en ArsysMfh** (ej. `Compra.DocumentoProveedorCabecera`)
2. **Nombre del campo y tipo SQL** (ej. `idConceptoPresupuesto INT NULL`, con FK opcional)
3. **Formulario destino** (ej. `arsFrmEmpaqueCorteCompraConsignacion`)
4. **Comportamiento esperado en el formulario**: solo guardar / mostrar en grid / lookup / validación / etc.

### ⚠️ NOTA SOBRE CREDENCIALES BD

La skill **NO debe pedir credenciales al usuario.** Las cadenas de conexión están en el `App.config` del proyecto backend `Arsys.Infraestructura.Datos`. La skill debe leerlas automáticamente desde allí (ver detalle en sección "Resolución del connection string" más abajo).

---

## Resolución del Connection String (Automática, sin Intervención Humana)

La skill debe extraer el connection string de:
```
C:\Arsys\ArsysServiciosORF\Arsys.Infraestructura.Datos\App.config
```

### Procedimiento:

1. **Leer el archivo App.config** (XML).
2. **Localizar el bloque `<connectionStrings>`.**
3. **Identificar el connection string que apunta a `ArsysMfh` / `devtes.orf.com\desarrollo`.** Típicamente el `name` correspondiente al contexto del módulo (ej. `ArsysEntitiesContable` para tablas `Compra.*`).
4. **El valor del connectionString típicamente está en formato EF:** 
   ```
   metadata=res://*/...; provider=System.Data.SqlClient; provider connection string="Data Source=devtes.orf.com\desarrollo;Initial Catalog=ArsysMfh;..."
   ```
5. **Parsear el sub-string `"provider connection string"`** para extraer:
   - `Data Source` (servidor + instancia)
   - `Initial Catalog` (base de datos, debe ser `ArsysMfh`)
   - `Integrated Security` (`true`/`SSPI` = autenticación Windows) o `User ID` + `Password`
6. **Construir el comando sqlcmd** con los parámetros extraídos:
   - Si `Integrated Security=True` o `SSPI`: 
     ```
     sqlcmd -S "<DataSource>" -d "<InitialCatalog>" -E -i <script>.sql
     ```
   - Si `User ID`/`Password`: 
     ```
     sqlcmd -S "<DataSource>" -d "<InitialCatalog>" -U "<User>" -P "<Pass>" -i <script>.sql
     ```
7. **En el plan presentado al usuario, MOSTRAR:**
   - El nombre del connection string usado (ej. `ArsysEntitiesContable`)
   - El servidor y la base extraídos (ej. `Data Source=devtes.orf.com\desarrollo, Initial Catalog=ArsysMfh`)
   - El modo de autenticación (Integrated o SQL)
   - Si la autenticación es SQL, **ENMASCARAR la contraseña** (mostrar User ID en claro y Password como `*****`)

### Manejo de Errores:

- Si el archivo `App.config` no existe, no contiene el connection string esperado, o tiene un formato no parseable: **detener el flujo, reportar error claro al usuario y NO continuar.**
- Si hay múltiples connection strings que apuntan a `ArsysMfh` (uno por contexto EF), la skill elige el que corresponda al módulo / EDMX involucrado en la operación (mapping más abajo). Si hay duda, preguntar al usuario cuál usar antes de aprobar el plan.

### Mapping Connection String → EDMX → Schema:

| Connection String | EDMX | Schemas |
|---|---|---|
| `ArsysEntities` | `ModelArsys.edmx` | Tablas genéricas, Inventario, Producto |
| `ArsysEntitiesContable` | `ModelArsysContable.edmx` | `Compra.`, `CuentaPagar.`, `Contabilidad.*` |
| `ArsysEntitiesSeguridad` | `ModelArsysSeguridad.edmx` | `Sociedad.`, `Seguridad.` |
| `ArsysEntitiesCAF` | `ModelArsysCAF.edmx` | `ActivoFijo.*` |
| `ArsysEntitiesNomina` | `ModelArsysNomina.edmx` | `Nomina.*` |
| `ArsysEntitiesMtto` | `ModelArsysMtto.edmx` | `Mtto.*` |
| `ArsysEntitiesPaddy` | `ModelArsysPaddy.edmx` | `Paddy.*` |
| `ArsysEntitiesTransporte` | `ModelArsysTransporte.edmx` | `Transporte.*` |

---

## Contexto del Proyecto

**Stack:** .NET Framework 4.5, C#, WinForms, DevExpress 14.1.7, EF6 Database First (EDMX), WCF, MVP Passive View, Unity IoC, TFS.

**Soluciones:**
- **Backend:** `C:\Arsys\ArsysServiciosORF\ArsysServicios.sln` (137 proyectos)
- **Frontend:** `C:\Arsys\ArsysPresentacion\ArsysPresentacion.sln` (76 proyectos)
- **Servidor BD:** `devtes.orf.com\desarrollo`, base `ArsysMfh`
- **App.config con connection strings:** `C:\Arsys\ArsysServiciosORF\Arsys.Infraestructura.Datos\App.config`
- **DLL compartida:** `Arsys.Dominio.Entidades.dll` se versiona manualmente en `Arsys.Presentacion.Base\Librerias`
- **Endpoint WCF base:** `http://localhost:30584/servicios/Servicios[Modulo]Arsys.svc`
- **Idioma:** SIEMPRE en español (variables de negocio, comentarios, mensajes)
- **Convenciones de nombres:** `arsFrm*`, `M*`, `P*`, `IRepositorio*`, `Repositorio*`, `IDominioContrato*`, `Dominio*`, `Servicios*Arsys`
- **Singleton de fecha:** usar SIEMPRE `ArsysSingleton.ObtenerInstancia.FechaServidor`, nunca `DateTime.Now`

---

## 11 Fases de Ejecución

### Fase 1 - Base de Datos (AGENTE ejecuta SQL directamente con credenciales del App.config)

**Descripción:** Crear la columna nueva en la tabla ArsysMfh, con eventuales foreign keys e índices.

**Agente/Humano:** Agente (100% automático tras aprobación plan).

**Pasos:**

1. Resolver el connection string según la sección "Resolución del connection string" (leer App.config, parsear, elegir el correcto según el schema).
2. Generar script `Scripts<Tabla>_<campo>.sql` con:
   - `ALTER TABLE` idempotente (`IF COL_LENGTH IS NULL` o `IF NOT EXISTS`)
   - Foreign key si aplica (`ALTER TABLE ADD CONSTRAINT FK_...`)
   - Índice si aplica (`CREATE INDEX IF NOT EXISTS`)
3. Ejecutar el script contra el servidor / base extraídos del App.config usando `sqlcmd`:
   ```
   sqlcmd -S "<DataSource>" -d "<InitialCatalog>" -E -i Scripts<Tabla>_<campo>.sql
   ```
   o con PowerShell:
   ```
   Invoke-Sqlcmd -ServerInstance "<DataSource>" -Database "<InitialCatalog>" -InputFile ...
   ```
4. Validar la creación ejecutando:
   ```sql
   SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
   FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = '<schema>' AND TABLE_NAME = '<tabla>' AND COLUMN_NAME = '<campo>';
   ```
   Si hay FK, validar también con `sys.foreign_keys`.
5. **Idempotencia:** Si la columna ya existe, reportar y continuar sin error.
6. **Si falla:** Detener el flujo, reportar el error SQL al usuario, NO continuar con las fases siguientes.

**Protección de Credenciales:** NUNCA exponer la contraseña del connection string en logs / outputs / prompt al usuario. Mostrar siempre enmascarada (`*****`).

**Avance Automático:** No requiere confirmación humana intermedia; la skill avanza automáticamente a la Fase 2 si la validación SQL es exitosa (la aprobación inicial del modo plan es suficiente).

---

### Fase 2 - EDMX (Edit en 3 secciones)

**Descripción:** Insertar la propiedad nueva en las tres vistas del modelo EDMX (SSDL, CSDL, MSL) y, si es FK, agregar Association y NavigationProperty.

**Agente/Humano:** Agente (100% automático).

**Pasos:**

1. **Localizar el .edmx correcto** según el schema de la tabla (mapping en sección "Resolución del connection string").
2. **Insertar manualmente con Edit XML:**
   - **SSDL:** `<Property Name="campo" Type="<sqlType>" />` dentro del `<EntityType>` storage de la tabla.
   - **CSDL:** `<Property Name="campo" Type="<clrType>" />` dentro del `<EntityType>` conceptual.
   - **MSL:** `<ScalarProperty Name="campo" ColumnName="campo" />` dentro del `<EntitySetMapping>`.
3. **Si es FK:** Agregar también:
   - `<Association>` en SSDL/CSDL (definir relación)
   - `<NavigationProperty>` en CSDL/MSL (para acceder desde C#)
4. **Verificar coherencia** con `grep` o búsqueda local en el archivo para evitar duplicados.

**Plantilla de Inserción SSDL (Storage Layer):**
```xml
<!-- En la tabla storage correspondiente -->
<EntityType Name="DocumentoProveedorCabecera">
  ...
  <Property Name="idConceptoPresupuesto" Type="int" Nullable="true" />
</EntityType>

<!-- Si es FK -->
<Association Name="FK_DocumentoProveedorCabecera_ConceptoPresupuesto">
  <End Type="Storage.ConceptoPresupuesto" Multiplicity="0..1" Role="ConceptoPresupuesto" />
  <End Type="Storage.DocumentoProveedorCabecera" Multiplicity="*" Role="DocumentoProveedorCabecera" />
  <ReferentialConstraint>
    <Principal Role="ConceptoPresupuesto">
      <PropertyRef Name="idConceptoPresupuesto" />
    </Principal>
    <Dependent Role="DocumentoProveedorCabecera">
      <PropertyRef Name="idConceptoPresupuesto" />
    </Dependent>
  </ReferentialConstraint>
</Association>
```

**Plantilla de Inserción CSDL (Conceptual Layer):**
```xml
<EntityType Name="DocumentoProveedorCabecera">
  ...
  <Property Name="idConceptoPresupuesto" Type="Edm.Int32" Nullable="true" />
  <NavigationProperty Name="ConceptoPresupuesto" Type="Arsys.Dominio.Entidades.ConceptoPresupuesto" Multiplicity="0..1" FromRole="DocumentoProveedorCabecera" ToRole="ConceptoPresupuesto" />
</EntityType>

<EntityType Name="ConceptoPresupuesto">
  ...
  <NavigationProperty Name="DocumentoProveedorCabeceras" Type="Collection(Arsys.Dominio.Entidades.DocumentoProveedorCabecera)" FromRole="ConceptoPresupuesto" ToRole="DocumentoProveedorCabecera" />
</EntityType>

<Association Name="FK_DocumentoProveedorCabecera_ConceptoPresupuesto">
  <End Type="Arsys.Dominio.Entidades.ConceptoPresupuesto" Multiplicity="0..1" Role="ConceptoPresupuesto" />
  <End Type="Arsys.Dominio.Entidades.DocumentoProveedorCabecera" Multiplicity="*" Role="DocumentoProveedorCabecera" />
  <ReferentialConstraint>
    <Principal Role="ConceptoPresupuesto">
      <PropertyRef Name="id" />
    </Principal>
    <Dependent Role="DocumentoProveedorCabecera">
      <PropertyRef Name="idConceptoPresupuesto" />
    </Dependent>
  </ReferentialConstraint>
</Association>
```

**Plantilla de Inserción MSL (Mapping Layer):**
```xml
<EntitySetMapping Name="DocumentoProveedorCabecera">
  <EntityTypeMapping TypeName="Arsys.Dominio.Entidades.DocumentoProveedorCabecera">
    <MappingFragment StoreEntitySet="DocumentoProveedorCabecera">
      ...
      <ScalarProperty Name="idConceptoPresupuesto" ColumnName="idConceptoPresupuesto" />
    </MappingFragment>
  </EntityTypeMapping>
</EntitySetMapping>

<AssociationSetMapping Name="FK_DocumentoProveedorCabecera_ConceptoPresupuesto" TypeName="Arsys.Dominio.Entidades.FK_DocumentoProveedorCabecera_ConceptoPresupuesto">
  <EndProperty Name="ConceptoPresupuesto">
    <ScalarProperty Name="id" ColumnName="id" />
  </EndProperty>
  <EndProperty Name="DocumentoProveedorCabecera">
    <ScalarProperty Name="idConceptoPresupuesto" ColumnName="idConceptoPresupuesto" />
  </EndProperty>
</AssociationSetMapping>
```

---

### Fase 3 - Plantillas .tt (TextTransform.exe; Plan B = Edición Manual)

**Descripción:** Regenerar las clases C# autogeneradas a partir del EDMX usando las plantillas T4 de Visual Studio.

**Agente/Humano:** Agente (100% automático, con fallback a edición manual).

**Pasos:**

1. **Localizar TextTransform.exe** en la instalación de Visual Studio (cualquier versión 2013-2022):
   ```
   C:\Program Files (x86)\Microsoft Visual Studio\2019\Professional\Common7\IDE\TextTransform.exe
   o
   C:\Program Files (x86)\Microsoft Visual Studio\2022\Professional\Common7\IDE\TextTransform.exe
   ```
2. **Ejecutar sobre las plantillas** del EDMX correspondiente:
   ```
   TextTransform.exe -i "C:\Arsys\ArsysServiciosORF\Arsys.Dominio.Entidades\ModelArsys.edmx.tt" -o "C:\Arsys\ArsysServiciosORF\Arsys.Dominio.Entidades\ModelArsys.cs"
   TextTransform.exe -i "C:\Arsys\ArsysServiciosORF\Arsys.Dominio.Entidades\ModelArsys.Context.tt" -o "C:\Arsys\ArsysServiciosORF\Arsys.Dominio.Entidades\ModelArsysContext.cs"
   ```
3. **Si falla** por dependencias del SDK:
   - **Plan B (Edición Manual):** Editar manualmente el archivo `.cs` autogenerado agregando:
     ```csharp
     [DataMember]
     public Nullable<int> idConceptoPresupuesto { get; set; }
     
     [DataMember]
     public virtual ConceptoPresupuesto ConceptoPresupuesto { get; set; }
     ```
     en el bloque correspondiente (junto a propiedades similares).
4. **Limpiar propiedad transitoria** del extender (`Extender<Entidad>.cs`) si quedó duplicada.

---

### Fase 4 - Compilar Backend (msbuild en Cascada)

**Descripción:** Compilar los proyectos del backend en orden de dependencias para asegurar que la nueva propiedad está disponible en todos los niveles.

**Agente/Humano:** Agente (100% automático).

**Pasos:**

1. **Orden de compilación:**
   1. `Arsys.Dominio.Entidades`
   2. `Arsys.Infraestructura.Datos`
   3. `Arsys.Infraestructura.Repositorio.[Modulo]` (ej. `Arsys.Infraestructura.Repositorio.Compra`)
   4. `Arsys.Dominio.Servicio.[Modulo]` (ej. `Arsys.Dominio.Servicio.Compra`)
   5. `Arsys.ServiciosDistribuidos`

2. **Comandos (PowerShell con msbuild):**
   ```powershell
   $sln = "C:\Arsys\ArsysServiciosORF\ArsysServicios.sln"
   msbuild "$sln" /p:Configuration=Debug /t:Arsys_Dominio_Entidades /v:minimal
   msbuild "$sln" /p:Configuration=Debug /t:Arsys_Infraestructura_Datos /v:minimal
   msbuild "$sln" /p:Configuration=Debug /t:Arsys_Infraestructura_Repositorio_Compra /v:minimal
   msbuild "$sln" /p:Configuration=Debug /t:Arsys_Dominio_Servicio_Compra /v:minimal
   msbuild "$sln" /p:Configuration=Debug /t:Arsys_ServiciosDistribuidos /v:minimal
   ```

3. **Capturar errores** y corregir si son de código generado por la skill. Si hay errores de lógica del usuario, reportar y pedir al usuario que corrija.

---

### Fase 5 - Reiniciar Host WCF (HUMANO - Checkpoint Obligatorio)

**Descripción:** Recargar el ensamblado en el servicio WCF para que expongan las nuevas propiedades en el contrato de datos.

**Agente/Humano:** **HUMANO** (checkpoint obligatorio).

**Pasos:**

1. **Pedir al usuario que reinicie:**
   - **IIS Express** (stop + start desde VS o línea de comandos): `iisexpress /stop; iisexpress /start`
   - **O IIS:** `iisreset`
   - **O servicio Windows:** `net stop ArsysServiciosORF; net start ArsysServiciosORF` (si aplica)

2. **Mientras espera**, la skill prepara la siguiente fase (no avanza hasta confirmación).

3. **Validar que el .svc responda** haciendo:
   ```powershell
   $uri = "http://localhost:30584/servicios/Servicios<Modulo>Arsys.svc?wsdl"
   $response = Invoke-WebRequest -Uri $uri -UseBasicParsing
   if ($response.StatusCode -eq 200) { 
     Write-Host "✓ WSDL disponible" 
   } else { 
     Write-Host "✗ WSDL no disponible" 
   }
   ```

4. **Solo cuando el WSDL responda 200 OK**, la skill solicita confirmación del usuario y avanza a Fase 6.

---

### Fase 6 - Copiar DLL al Frontend (Bash/PowerShell)

**Descripción:** Actualizar la DLL `Arsys.Dominio.Entidades.dll` en la carpeta de librerías del frontend con la versión compilada en el backend.

**Agente/Humano:** Agente (100% automático).

**Pasos:**

1. **tf checkout** de `Arsys.Dominio.Entidades.dll` y `.pdb` en `Arsys.Presentacion.Base\Librerias`:
   ```
   tf checkout "C:\Arsys\ArsysPresentacion\Arsys.Presentacion.Base\Librerias\Arsys.Dominio.Entidades.dll"
   tf checkout "C:\Arsys\ArsysPresentacion\Arsys.Presentacion.Base\Librerias\Arsys.Dominio.Entidades.pdb"
   ```

2. **Copiar desde backend** a frontend:
   ```powershell
   $src = "C:\Arsys\ArsysServiciosORF\Arsys.Dominio.Entidades\bin\Debug\Arsys.Dominio.Entidades.dll"
   $dst = "C:\Arsys\ArsysPresentacion\Arsys.Presentacion.Base\Librerias\Arsys.Dominio.Entidades.dll"
   Copy-Item -Path $src -Destination $dst -Force
   
   $src_pdb = "C:\Arsys\ArsysServiciosORF\Arsys.Dominio.Entidades\bin\Debug\Arsys.Dominio.Entidades.pdb"
   $dst_pdb = "C:\Arsys\ArsysPresentacion\Arsys.Presentacion.Base\Librerias\Arsys.Dominio.Entidades.pdb"
   Copy-Item -Path $src_pdb -Destination $dst_pdb -Force
   ```

3. **Validar timestamp** con:
   ```powershell
   dir "C:\Arsys\ArsysPresentacion\Arsys.Presentacion.Base\Librerias\Arsys.Dominio.Entidades.dll" | Select-Object FullName, LastWriteTime
   ```

---

### Fase 7 - Update Service References (AGENTE regenera proxies vía línea de comandos)

**Descripción:** Regenerar los proxies WCF (Reference.cs) para que incluyan la nueva propiedad en los DataContracts.

**Agente/Humano:** Agente (100% automático, con fallback a edición manual).

**Pasos:**

1. **Identificar Service References afectados** según la tabla / módulo (ver tabla de mapeo más abajo).

2. **tf checkout previo** de los archivos a regenerar:
   ```
   tf checkout "C:\Arsys\ArsysPresentacion\[Proyecto]\Service References\Servicios<X>Arsys\Reference.cs"
   tf checkout "C:\Arsys\ArsysPresentacion\[Proyecto]\Service References\Servicios<X>Arsys\Reference.svcmap"
   tf checkout "C:\Arsys\ArsysPresentacion\[Proyecto]\Service References\Servicios<X>Arsys\configuration.svcinfo"
   tf checkout "C:\Arsys\ArsysPresentacion\[Proyecto]\Service References\Servicios<X>Arsys\configuration91.svcinfo"
   tf checkout "C:\Arsys\ArsysPresentacion\[Proyecto]\Service References\Servicios<X>Arsys\Servicios<X>Arsys.wsdl"
   tf checkout "C:\Arsys\ArsysPresentacion\[Proyecto]\Service References\Servicios<X>Arsys\*.xsd"
   ```

3. **Regenerar proxy con svcutil.exe:**
   - **Localizar la herramienta:**
     ```
     C:\Program Files (x86)\Microsoft SDKs\Windows\v10.0A\bin\NETFX 4.X Tools\svcutil.exe
     o
     C:\Program Files\Microsoft SDKs\Windows\v10.0A\bin\NETFX 4.X Tools\svcutil.exe
     ```
   - **Comando base:**
     ```
     svcutil.exe ^
       /language:cs ^
       /out:"C:\Arsys\ArsysPresentacion\[Proyecto]\Service References\Servicios<X>Arsys\Reference.cs" ^
       /config:"C:\Arsys\ArsysPresentacion\[Proyecto]\app.config" ^
       /mergeConfig ^
       /namespace:*,Arsys.Presentacion.Cloud.Servicios<X>Arsys ^
       /collectionType:System.Collections.Generic.List`1 ^
       /serializer:DataContractSerializer ^
       /enableDataBinding ^
       "http://localhost:30584/servicios/Servicios<X>Arsys.svc?wsdl"
     ```
   - **Parámetros críticos a respetar** (deben coincidir con cómo VS los configuró originalmente — leerlos del `Reference.svcmap` antes de regenerar):
     - `/namespace`
     - `/collectionType`
     - `/enableDataBinding`
     - `/serializer`
     - Reuso de tipos desde DLLs (`/reference:<path>` con el path a `Arsys.Dominio.Entidades.dll`)

4. **Actualizar manualmente Reference.svcmap** con la fecha y endpoint nuevos (es XML, se edita con Edit).

5. **Validar regeneración** con grep:
   - Confirmar que `Reference.cs` contiene la propiedad nueva.
   - Si no aparece: verificar que el WSDL del backend la expone:
     ```
     Invoke-WebRequest -Uri "http://localhost:30584/servicios/Servicios<X>Arsys.svc?wsdl" -UseBasicParsing | 
       Select-Object -ExpandProperty Content | 
       Select-String "idConceptoPresupuesto"
     ```

6. **Repetir para cada servicio afectado** según la tabla de mapeo.

7. **Plan B si la regeneración por línea de comandos falla:**
   - Si `svcutil` no está disponible o produce un `Reference.cs` incompatible, la skill puede **insertar manualmente** la propiedad nueva en el `Reference.cs` existente (Edit), respetando el patrón de los otros DataContracts.
   - Esto solo funciona para campos simples (no para operaciones nuevas).
   - Reportar al usuario que Service References se regeneraron y validar la compilación de `Arsys.Presentacion.Cloud` antes de continuar.

---

### Fase 8 - Compilar Frontend (msbuild en Cascada)

**Descripción:** Compilar los proyectos del frontend en orden de dependencias para asegurar que los proxies y la DLL actualizada están disponibles.

**Agente/Humano:** Agente (100% automático).

**Pasos:**

1. **Orden de compilación:**
   1. `Arsys.Presentacion.Base`
   2. `Arsys.Presentacion.Cloud`
   3. `Arsys.Presentacion.Controles`
   4. `Arsys.Presentacion.Controles.MVP`
   5. `Arsys.Presentacion.[Modulo].MVP` (ej. `Arsys.Presentacion.Compra.MVP`)
   6. `Arsys.Presentacion.[Modulo]` (ej. `Arsys.Presentacion.Compra`)
   7. `Arsys.Presentacion.ClienteORF`

2. **Comandos (PowerShell con msbuild):**
   ```powershell
   $sln = "C:\Arsys\ArsysPresentacion\ArsysPresentacion.sln"
   msbuild "$sln" /p:Configuration=Debug /t:Arsys_Presentacion_Base /v:minimal
   msbuild "$sln" /p:Configuration=Debug /t:Arsys_Presentacion_Cloud /v:minimal
   # ... etc
   ```

3. **Si falla** con errores tipo "ambiguous reference" o "type not found": volver a Fase 6/7 (DLL o proxies).

---

### Fase 9 - Ajustar Formulario y MVP (Read + Edit)

**Descripción:** Cablear el formulario, el presenter y el modelo para que el campo nuevo sea capturado, validado, mostrado y persistido correctamente.

**Agente/Humano:** Agente (genera plan / estructura) + **HUMANO** (validación y ajustes semánticos).

**Pasos:**

1. **Modelo (`M<Entidad>.cs`):**
   - Mapear campo nuevo en llamadas WCF.
   - Asegurar que la propiedad se asigna desde la respuesta del servicio.
   - Ejemplo:
     ```csharp
     public class MDocumentoProveedorCabecera
     {
       public int? IdConceptoPresupuesto { get; set; }
       // ...
     }
     ```

2. **Presenter (`P<Entidad>.cs`):**
   - Lógica de coordinación entre Vista y Modelo.
   - Mapear propiedad del DataContract del proxy a la propiedad del Modelo.
   - Ejemplo:
     ```csharp
     public void CargarDatos(DocumentoProveedorCabeceraContract contrato)
     {
       Vista.IdConceptoPresupuesto = contrato.IdConceptoPresupuesto;
     }
     ```

3. **Vista (`arsFrm<...>.cs`):**
   - **Asignar campo a la entidad** antes del envío al servicio:
     ```csharp
     private DocumentoProveedorCabeceraContract CrearContrato()
     {
       return new DocumentoProveedorCabeceraContract
       {
         IdConceptoPresupuesto = int.Parse(txtIdConceptoPresupuesto.Text),
         // ...
       };
     }
     ```
   - **Mostrar en grids/lookups** si aplica.
   - **Cablear handlers** (`EditValueChanged`, `Click`, etc.):
     ```csharp
     private void txtIdConceptoPresupuesto_EditValueChanged(object sender, EventArgs e)
     {
       // Validar, buscar lookup, etc.
     }
     ```
   - **Limpiar el campo** en `LimpiarControles()` y `uscBarraUsuario_Click_Nuevo()`:
     ```csharp
     private void LimpiarControles()
     {
       txtIdConceptoPresupuesto.Text = "";
       // ...
     }
     ```
   - **Restaurar valor** al cargar registros existentes:
     ```csharp
     private void CargarRegistroExistente()
     {
       // Cargar desde servicio y asignar a controles
       txtIdConceptoPresupuesto.Text = registro.IdConceptoPresupuesto.ToString();
     }
     ```

4. **Designer.cs / .resx:** Si se agregan controles visuales nuevos, actualizar el designer.

5. **ModelORF:** Si existe variante específica para ORF, ajustarla en paralelo.

---

### Fase 10 - Pruebas (HUMANO - Checkpoint Obligatorio)

**Descripción:** Validar end-to-end el flujo completo: el usuario opera el formulario, genera cambios en BD, y la skill verifica persistencia.

**Agente/Humano:** **HUMANO** ejecuta el cliente; **AGENTE** valida con queries SQL.

**Pasos:**

1. **Pedir al usuario que:**
   - Inicie el cliente ORF (`Arsys.Presentacion.ClienteORF.exe` en Debug o Build).
   - Navegue al formulario `arsFrm<...>` donde se agregó el campo.
   - Ingrese un nuevo registro (o modifique uno existente) con un valor en el campo nuevo.
   - Guarde los cambios.

2. **Mientras espera confirmación**, la skill prepara queries SQL para validar persistencia.

3. **Una vez que el usuario confirma que operó el formulario**, la skill ejecuta queries de validación:
   ```sql
   SELECT 
     idDocumentoProveedorCabecera, 
     idConceptoPresupuesto
   FROM Compra.DocumentoProveedorCabecera
   WHERE idDocumentoProveedorCabecera = <id_ingresado>
   ```
   Ejecutar via `sqlcmd` con el connection string del App.config (mismo que Fase 1).

4. **Corroborar end-to-end:**
   - Si el valor está en BD con el valor esperado: ✓ Éxito.
   - Si el valor está en BD pero es NULL o incorrecto: revisar Fase 9 (asignación en formulario).
   - Si el valor NO está en BD: revisar cadena WCF / EF SaveChanges.

---

### Fase 11 - TFS (Bash/PowerShell, sin Check-in Automático)

**Descripción:** Registrar los cambios en TFS (Team Foundation Server / Azure DevOps) sin hacer check-in automático.

**Agente/Humano:** Agente registra cambios; **HUMANO** ejecuta `tf checkin` manualmente.

**Pasos:**

1. **Detectar archivos pendientes:**
   ```
   tf status /recursive /workspace:$env:COMPUTERNAME;$env:USERNAME
   ```

2. **Distinguir add real vs candidato detectado:**
   ```
   tf info "C:\Arsys\ArsysServiciosORF\Arsys.Dominio.Entidades\ModelArsys.edmx"
   ```

3. **Hacer tf add explícito** para nuevos archivos (ej. script SQL):
   ```
   tf add "C:\Arsys\ArsysServiciosORF\Scripts\Scripts<Tabla>_<campo>.sql"
   ```

4. **Listar pendientes** al usuario:
   ```
   Modified:
   - Arsys.Dominio.Entidades\ModelArsys.edmx
   - Arsys.Dominio.Entidades\ModelArsys.cs (autogenerado)
   - Arsys.Dominio.Entidades\ModelArsysContext.cs (autogenerado)
   - ... (otros proyectos compilados)
   
   Added:
   - Scripts\Scripts<Tabla>_<campo>.sql
   ```

5. **El usuario ejecuta tf checkin manualmente** con comentario descriptivo:
   ```
   tf checkin /comment:"Agregar campo idConceptoPresupuesto a DocumentoProveedorCabecera"
   ```

---

## Reglas de Comportamiento

1. **MODO PLAN OBLIGATORIO:** Como se indicó en la REGLA MAESTRA al inicio del prompt, la skill SIEMPRE entra en modo plan antes de ejecutar cualquier fase y solo procede tras aprobación explícita del usuario. Esta regla es **inviolable**.

2. **CREDENCIALES BD DESDE APP.CONFIG:** La skill NUNCA pide credenciales al usuario; las extrae automáticamente de `C:\Arsys\ArsysServiciosORF\Arsys.Infraestructura.Datos\App.config`. Si no se pueden extraer, detener el flujo.

3. **PROTECCIÓN DE CREDENCIALES:** Nunca exponer la contraseña del connection string en logs / outputs / mensajes al usuario. Enmascarar siempre como `*****`.

4. **IDIOMA:** Español obligatorio en toda comunicación, comentarios y código generado.

5. **AUTONOMÍA AMPLIA CON SEGURIDAD:** Una vez aprobado el plan, la skill ejecuta SQL directamente contra ArsysMfh y regenera proxies WCF sin pedir confirmación intermedia, pero SIEMPRE valida cada paso antes de avanzar.

6. **DETENER EL FLUJO ANTE EL PRIMER ERROR:** Si una fase falla, detener y reportar; NO encadenar fallas.

7. **No crear documentación** (*.md, README) sin que el usuario lo pida.

8. **Manejar fallas con Plan B:**
   - `App.config` no parseable / connection string no encontrado → detener, reportar.
   - SQL falla → detener, reportar, no continuar.
   - `TextTransform.exe` falla → edición manual.
   - `svcutil` falla → edición manual del `Reference.cs`.
   - Build falla → corregir y reintentar.

9. **Nunca hacer tf checkin automático** — solo `tf add`.

10. **Nunca tocar bin, obj, .suo, .user** ni sugerir agregarlos a TFS.

11. **Usar `ArsysSingleton.ObtenerInstancia.FechaServidor`** para timestamps en código nuevo.

12. **Verificar siempre con Grep** que las inserciones EDMX, las regeneraciones de proxies y las modificaciones del frontend queden coherentes.

13. **Idempotencia:** Scripts SQL deben ser re-ejecutables; ediciones EDMX deben detectar si el campo ya existe.

14. **Único checkpoint humano obligatorio durante la ejecución:** Fase 5 (reinicio del WCF) y Fase 10 (pruebas end-to-end). Las demás fases son automáticas tras la aprobación inicial del plan.

---

## Tabla de Mapeo Service References (Referencia Rápida)

Cambio en entidad → Service References a regenerar:

| Entidad / Schema | Servicios a Regenerar |
|---|---|
| `Compra.*`, `DocumentoProveedor*`, `CuentaPagar.*` | `ServiciosComprasArsys`, `ServiciosCuentaPagarArsys`, `ServiciosReporteArsys` |
| `Ventas.*`, `Factura*`, `CuentaCobrar.*` | `ServiciosVentaArsys`, `ServiciosCuentaCobrarArsys`, `ServiciosReporteArsys` |
| `Inventario.*`, `Stock*`, `Producto*` | `ServiciosInventarioArsys`, `ServiciosVentaArsys`, `ServiciosComprasArsys` |
| `Tercero.*`, `Proveedor*`, `Cliente*`, `Socio*` | `ServiciosTerceroArsys` (y la mayoría) |
| `Sociedad.*`, `Oficina.*`, `CentroCosto.*` | Casi todos los servicios |
| `Contabilidad.*` | `ServiciosContabilidadArsys`, `ServiciosReporteArsys` |
| `Seguridad.*` | `ServiciosSeguridadArsys` |
| `ActivoFijo.*` | `ServiciosActivoFijoArsys` |
| `Nomina.*` | `ServiciosNominaArsys` |

---

## Errores Típicos a Vigilar

### 1. App.config no encontrado o sin connection strings
- **Síntoma:** "Error al leer App.config"
- **Causa:** Path incorrecto o archivo no existe.
- **Resolución:** Detener y reportar; pedir al usuario validar que el path `C:\Arsys\ArsysServiciosORF\Arsys.Infraestructura.Datos\App.config` exista.

### 2. Connection string con formato no estándar
- **Síntoma:** "No se puede parsear el connection string"
- **Causa:** Encriptado, Configuration Manager, formato EF no estándar.
- **Resolución:** Detener y pedir al usuario validar el formato del connection string.

### 3. EF ignora el campo en SaveChanges
- **Síntoma:** El campo no persiste en BD.
- **Causa:** Falta MSL en EDMX o falta en el autogenerado.
- **Resolución:** Revisar que el ScalarProperty esté en MSL; regenerar plantillas T4.

### 4. Designer del EDMX no abre
- **Síntoma:** "Error al abrir EDMX en Visual Studio"
- **Causa:** Inconsistencia SSDL ↔ CSDL ↔ MSL.
- **Resolución:** Revisar sintaxis XML; buscar duplicados o cerrados incompletos.

### 5. Reference.cs regenerado no tiene la propiedad
- **Síntoma:** "Propiedad no aparece en proxy regenerado"
- **Causa:** El WCF no se reinició o el Reference.svcmap apuntaba a un endpoint cacheado.
- **Resolución:** Forzar ?wsdl con svcutil; validar que el WCF exponga el WSDL con `curl` o `Invoke-WebRequest`.

### 6. svcutil genera Reference.cs incompatible
- **Síntoma:** "Namespaces o collectionType distintos"
- **Causa:** Parámetros de svcutil no coinciden con originales.
- **Resolución:** Leer el `.svcmap` previo y replicar parámetros exactos.

### 7. tf status reporta "agregar" pero tf info dice "Ningún elemento coincide"
- **Síntoma:** "Archivo candidato no registrado en TFS"
- **Causa:** Candidato detectado por TFS pero no agregado explícitamente.
- **Resolución:** Hacer `tf add` explícito.

### 8. Compilación frontend falla con tipo ambiguo
- **Síntoma:** "Ambiguous reference" o "type not found"
- **Causa:** 2 versiones de la entidad (DLL vs proxy); diferencia de versión en App.config.
- **Resolución:** Validar que DLL y proxies estén actualizados.

---

## Snippets Reutilizables

### Snippet SQL: Crear Columna con FK e Índice (Idempotente)

```sql
-- Verificar e insertar columna
IF COL_LENGTH('[schema].[tabla]', 'nombrecampo') IS NULL
BEGIN
    ALTER TABLE [schema].[tabla]
    ADD nombrecampo INT NULL;
    PRINT 'Columna [nombrecampo] creada.';
END
ELSE
BEGIN
    PRINT 'Columna [nombrecampo] ya existe.';
END

-- Crear FK si no existe
IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys 
    WHERE name = 'FK_tabla_relacionada'
)
BEGIN
    ALTER TABLE [schema].[tabla]
    ADD CONSTRAINT FK_tabla_relacionada
    FOREIGN KEY (nombrecampo)
    REFERENCES [schema].[tabla_relacionada](id);
    PRINT 'FK [FK_tabla_relacionada] creada.';
END
ELSE
BEGIN
    PRINT 'FK [FK_tabla_relacionada] ya existe.';
END

-- Crear índice si no existe
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes 
    WHERE name = 'IX_tabla_nombrecampo' 
    AND object_id = OBJECT_ID('[schema].[tabla]')
)
BEGIN
    CREATE INDEX IX_tabla_nombrecampo 
    ON [schema].[tabla](nombrecampo);
    PRINT 'Índice [IX_tabla_nombrecampo] creado.';
END
ELSE
BEGIN
    PRINT 'Índice [IX_tabla_nombrecampo] ya existe.';
END

-- Validar
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'schema' AND TABLE_NAME = 'tabla' AND COLUMN_NAME = 'nombrecampo';
```

### Snippet PowerShell: Ejecutar sqlcmd con Integrated Security

```powershell
$dataSource = "devtes.orf.com\desarrollo"
$database = "ArsysMfh"
$scriptPath = "C:\Arsys\Scripts\ScriptsDocumentoProveedorCabecera_idConceptoPresupuesto.sql"

try {
    sqlcmd -S $dataSource -d $database -E -i $scriptPath
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Script ejecutado exitosamente"
    } else {
        Write-Host "✗ Error ejecutando script. Código: $LASTEXITCODE"
    }
} catch {
    Write-Host "✗ Excepción: $_"
}
```

### Snippet PowerShell: Regenerar Service References con svcutil

```powershell
$svcUtilPath = "C:\Program Files (x86)\Microsoft SDKs\Windows\v10.0A\bin\NETFX 4.6.2 Tools\svcutil.exe"
$outputPath = "C:\Arsys\ArsysPresentacion\Arsys.Presentacion.Compra\Service References\ServiciosComprasArsys\Reference.cs"
$appConfigPath = "C:\Arsys\ArsysPresentacion\Arsys.Presentacion.Compra\app.config"
$wsdlUri = "http://localhost:30584/servicios/ServiciosComprasArsys.svc?wsdl"

if (Test-Path $svcUtilPath) {
    & $svcUtilPath `
        /language:cs `
        /out:$outputPath `
        /config:$appConfigPath `
        /mergeConfig `
        /namespace:*,Arsys.Presentacion.Cloud.ServiciosComprasArsys `
        /collectionType:System.Collections.Generic.List``1 `
        /serializer:DataContractSerializer `
        /enableDataBinding `
        $wsdlUri
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Service Reference regenerada"
    } else {
        Write-Host "✗ Error regenerando Service Reference"
    }
} else {
    Write-Host "✗ svcutil.exe no encontrado en $svcUtilPath"
}
```

### Snippet PowerShell: Validar WSDL

```powershell
$uri = "http://localhost:30584/servicios/ServiciosComprasArsys.svc?wsdl"

try {
    $response = Invoke-WebRequest -Uri $uri -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ WSDL disponible (HTTP 200)"
        
        # Buscar propiedad nueva en WSDL
        if ($response.Content -match "idConceptoPresupuesto") {
            Write-Host "✓ Propiedad 'idConceptoPresupuesto' encontrada en WSDL"
        } else {
            Write-Host "✗ Propiedad 'idConceptoPresupuesto' NO encontrada en WSDL"
        }
    } else {
        Write-Host "✗ WSDL no disponible (HTTP $($response.StatusCode))"
    }
} catch {
    Write-Host "✗ Error validando WSDL: $_"
}
```

### Snippet C#: Plantilla para DataContract (si edición manual en Reference.cs)

```csharp
[System.Diagnostics.DebuggerStepThroughAttribute()]
[System.CodeDom.Compiler.GeneratedCodeAttribute("System.ServiceModel", "4.0.0.0")]
[System.Runtime.Serialization.DataContractAttribute(Name="DocumentoProveedorCabeceraContract", Namespace="http://schemas.arsys.orf/2023/05")]
public partial class DocumentoProveedorCabeceraContract : object, System.ComponentModel.INotifyPropertyChanged
{
    private int idDocumentoProveedorCabeceraField;
    
    private System.Nullable<int> idConceptoPresupuestoField;
    
    [System.Runtime.Serialization.DataMemberAttribute()]
    public int IdDocumentoProveedorCabecera
    {
        get { return this.idDocumentoProveedorCabeceraField; }
        set 
        { 
            if ((this.idDocumentoProveedorCabeceraField.Equals(value) != true))
            {
                this.idDocumentoProveedorCabeceraField = value;
                this.RaisePropertyChanged("IdDocumentoProveedorCabecera");
            }
        }
    }
    
    [System.Runtime.Serialization.DataMemberAttribute()]
    public System.Nullable<int> IdConceptoPresupuesto
    {
        get { return this.idConceptoPresupuestoField; }
        set 
        { 
            if ((this.idConceptoPresupuestoField.Equals(value) != true))
            {
                this.idConceptoPresupuestoField = value;
                this.RaisePropertyChanged("IdConceptoPresupuesto");
            }
        }
    }
    
    public event System.ComponentModel.PropertyChangedEventHandler PropertyChanged;
    
    protected void RaisePropertyChanged(string propertyName)
    {
        System.ComponentModel.PropertyChangedEventHandler propertyChanged = this.PropertyChanged;
        if ((propertyChanged != null))
        {
            propertyChanged(this, new System.ComponentModel.PropertyChangedEventArgs(propertyName));
        }
    }
}
```

---

## Conclusión

Esta skill automatiza el **90% del flujo** de propagación de campos desde BD hasta frontend Arsys, con **solo 2 checkpoints humanos obligatorios** (Fase 5 y Fase 10). El agente:

1. **Lee App.config** automáticamente (sin pedir credenciales).
2. **Ejecuta SQL directamente** contra ArsysMfh.
3. **Edita EDMX** y regenera plantillas T4.
4. **Compila backend y frontend** en cascada.
5. **Regenera proxies WCF** vía svcutil.
6. **Copia DLLs** al frontend.
7. **Registra cambios en TFS** sin hacer check-in.

La **REGLA MAESTRA del modo plan** garantiza que el usuario siempre sabe exactamente qué va a pasar antes de que suceda, manteniendo el control y la seguridad en todo momento.
