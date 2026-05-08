---
name: arsys-nuevo-wcf
description: Agrega una operación nueva a un servicio WCF existente en Arsys.ServiciosDistribuidos — actualiza interfaz IServicios{Modulo}Arsys, implementación .svc.cs, configuración si hace falta, y guía para regenerar proxy en cliente. Úsala cuando el usuario diga "nuevo WCF", "agregar operación WCF", "expone a cliente", "nuevo .svc", "nuevo endpoint".
argument-hint: [NombreMetodo] [ServicioWCF]
---

# Nuevo endpoint WCF en ARSYS

Agrega una operación a un servicio WCF existente y guía la regeneración del proxy.

## Paso 1 — Contexto

Lee:
- `C:\DEIMAR\ARSYS\ArsysServiciosORF\ArsysServiciosORF\CLAUDE.md` (sección WCF Services)
- El servicio WCF destino (`.svc` y `.svc.cs`) para ver patrón exacto.
- `Arsys.ServiciosDistribuidos/Web.config` si hay que ajustar binding.

## Paso 2 — Datos necesarios

1. **Servicio WCF destino** (ej. `ServiciosProductoArsys`, `ServiciosVentaArsys`, `ServiciosContabilidadArsys`).
   - Interfaz: `IServicios<Modulo>Arsys`
   - Implementación: `Servicios<Modulo>Arsys.svc.cs`
2. **Firma del método**: nombre, parámetros, tipo de retorno.
3. **A qué dominio llama**: `IDominioContrato<Entidad>` correspondiente.
4. **¿Es consulta o escritura?** (define si es `ServiciosXConsultaORF` vs `ServiciosXArsys`).

## Paso 3 — Archivos a modificar

| # | Archivo | Cambio |
|---|---|---|
| 1 | `Arsys.ServiciosDistribuidos\IServicios<Modulo>Arsys.cs` | Agregar `[OperationContract]` con firma |
| 2 | `Arsys.ServiciosDistribuidos\Servicios<Modulo>Arsys.svc.cs` | Implementar usando `FabricaIoCArsys.Resolve<T>()` |
| 3 | `Arsys.Presentacion.Cloud\<Servicio>.cs` (service reference) | Regenerar desde VS 2013 |

## Paso 4 — Plantillas

### En IServicios<Modulo>Arsys.cs

```csharp
[ServiceContract]
public interface IServicios<Modulo>Arsys
{
    // ... métodos existentes
    
    [OperationContract]
    <TipoRetorno> <NombreMetodo>(<parametros>);
}
```

### En Servicios<Modulo>Arsys.svc.cs

```csharp
public <TipoRetorno> <NombreMetodo>(<parametros>)
{
    try
    {
        var dominio = FabricaIoCArsys.Resolve<IDominioContrato<Entidad>>();
        return dominio.<NombreMetodo>(<parametros>);
    }
    catch (Exception ex)
    {
        AdministradorError.RegistrarError(ex);
        throw new FaultException(ex.Message);
    }
}
```

### Si retorna List<T> o tipo custom

Verificar que `<Entidad>` tenga `[DataContract]` y sus propiedades `[DataMember]`. Si no, agregar:

```csharp
[DataContract]
public partial class <Entidad>
{
    [DataMember] public long idX { get; set; }
    // ...
}
```

## Paso 5 — Configuración (si se necesita)

En `Arsys.ServiciosDistribuidos\Web.config`:
- Si el método retorna datos pesados → verificar `maxReceivedMessageSize="2147483647"` (2 GB, ya está).
- Si el método tarda → ajustar `sendTimeout` / `receiveTimeout` en el binding.
- NO agregar nuevos endpoints en `<services>` — reutilizar el existente del servicio.

## Paso 6 — Regenerar proxy cliente

Indicar al usuario estos pasos manuales en VS 2013:

1. Abrir solución `ArsysPresentacion.sln`.
2. Proyecto `Arsys.Presentacion.Cloud` → expandir `Service References`.
3. Click derecho en `Servicios<Modulo>` → **Update Service Reference**.
4. El proxy se regenera con la nueva operación.
5. Recompilar `Arsys.Presentacion.Cloud`.
6. Agregar consumo desde `M<Entidad>` (Model) si aplica.

**Alternativa manual:** editar directamente `Reference.cs` del proxy (NO recomendado — se pierde al regenerar).

## Paso 7 — Verificación

Antes de reportar "listo":
1. Compilar `ArsysServiciosORF.sln` sin errores.
2. Iniciar `Arsys.ServiciosDistribuidos` en IIS Express.
3. Abrir `http://localhost:30584/Servicios<Modulo>Arsys.svc` — debe listar la nueva operación en WSDL.
4. Desde `wcftestclient.exe` probar invocación con datos de prueba.

## Paso 8 — Reportar

- Archivos modificados (rutas completas)
- Endpoint WSDL a revisar
- Pasos manuales pendientes (regenerar proxy, recompilar cliente)
