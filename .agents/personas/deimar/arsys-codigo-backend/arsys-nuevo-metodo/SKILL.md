---
name: arsys-nuevo-metodo
description: Agrega un método nuevo a ARSYS propagándolo por TODAS las capas según el contexto (IRepositorio, Repositorio, IDominioContrato, Dominio, IServicios, Servicios.svc, proxy cliente). Detecta el módulo y aplica patrón correcto. Úsala cuando el usuario diga "agregar método", "nuevo método", "nueva operación", "propagar método" o describa una nueva operación de negocio.
argument-hint: [NombreMetodo] [Entidad] [Modulo]
---

# Nuevo método ARSYS (propagación multi-capa)

Agrega un método de negocio y lo propaga por **todas las capas** que apliquen según el contexto.

## Paso 1 — Contexto

Lee:
- `C:\DEIMAR\ARSYS\ArsysServiciosORF\ArsysServiciosORF\CLAUDE.md`
- `C:\DEIMAR\ARSYS\ArsysPresentacion\CLAUDE.md` (solo si el método se expone a UI)
- **Un método vivo del mismo módulo** para copiar firma y convenciones.

## Paso 2 — Datos necesarios

1. **Nombre del método** — seguir verbo + entidad + criterio:
   - `Consultar<Entidad>Por<Criterio>` (ej. `ConsultarFacturaPorNumero`)
   - `ConsultarTodos<Entidad>` (listado)
   - `Listar<Entidad><Filtro>`
   - `Guardar<Entidad>` / `Modificar<Entidad>` / `Eliminar<Entidad>`
   - `Anular<Entidad>` / `Aprobar<Entidad>` (contextuales)
2. **Entidad** que maneja.
3. **Módulo** (Producto, Venta, Contabilidad, Nomina, etc.).
4. **Tipo de operación**:
   - Lectura (read-only) → NO necesita TransactionScope
   - Escritura (write) → TransactionScope obligatorio
5. **Parámetros** (firma C#) y **tipo de retorno**.
6. **¿Se expone a UI?** Si sí, también va por WCF + proxy cliente.

## Paso 3 — Plan de capas según contexto

### Caso A: Consulta interna (solo backend usa)
```
✔ IRepositorio<Modulo>        → firma
✔ Repositorio<Modulo>         → implementación con EF
✘ IDominioContrato (no aplica si es solo consulta simple pasarela)
✘ WCF (no se expone)
```

### Caso B: Consulta expuesta a cliente
```
✔ IRepositorio<Modulo>
✔ Repositorio<Modulo>
✔ IDominioContrato<Modulo>    → firma (puede delegar al repo sin lógica extra)
✔ Dominio<Modulo>              → implementación
✔ IServicios<Modulo>Arsys      → firma WCF con [OperationContract]
✔ Servicios<Modulo>Arsys.svc   → implementación WCF usando FabricaIoCArsys.Resolve<T>()
✔ Proxy cliente (regenerar Service Reference en Arsys.Presentacion.Cloud)
```

### Caso C: Operación de negocio (escritura, contabiliza, anula)
```
✔ Todas las capas de Caso B
✔ Dominio<Modulo>   → con TransactionScope
✔ Posible llamada a IDominioContratoDocumentoContable si hay impacto contable
✔ Posible llamada a IDominioContratoAuditoria para log
```

## Paso 4 — Plantillas por capa

### Firma en IRepositorio

```csharp
// Lectura
<Entidad> Consultar<Entidad>Por<Criterio>(<tipo> id<Criterio>);
List<<Entidad>> ConsultarTodos<Entidad>(int IdSociedad);

// Escritura
// (no suele haber método custom de escritura en IRepositorio, usa Agregar/Modificar/Remover de la base)
```

### Implementación en Repositorio (lectura)

```csharp
public <Entidad> Consultar<Entidad>Por<Criterio>(<tipo> id<Criterio>)
{
    using (ArsysEntities ctx = new ArsysEntities())
    {
        return ctx.<Entidad>
            // .Include("Nav1").Include("Nav2")  ← lazy loading deshabilitado
            .Where(e => e.<campo> == id<Criterio>)
            .FirstOrDefault();
    }
}

public List<<Entidad>> ConsultarTodos<Entidad>(int IdSociedad)
{
    using (ArsysEntities ctx = new ArsysEntities())
    {
        return ctx.<Entidad>
            .Where(e => e.idSociedad == IdSociedad)
            .OrderBy(e => e.<campoOrden>)
            .ToList();
    }
}
```

### Firma en IDominioContrato

```csharp
<TipoRetorno> <NombreMetodo>(<parametros>);
```

### Implementación en Dominio (escritura con TransactionScope)

```csharp
public string <NombreMetodo>(<Entidad> entidad)
{
    using (TransactionScope tx = new TransactionScope())
    {
        try
        {
            // lógica de negocio
            _IRepositorio<Entidad>.Modificar(entidad);
            _IRepositorio<Entidad>.UnidadDeTrabajo.RealizarCambios();
            tx.Complete();
            return "true";
        }
        catch (Exception ex)
        {
            AdministradorError.RegistrarError(ex);
            return "false";
        }
    }
}
```

### Firma en IServicios<Modulo>Arsys (WCF)

```csharp
[OperationContract]
<TipoRetorno> <NombreMetodo>(<parametros>);
```

### Implementación en Servicios<Modulo>Arsys.svc

```csharp
public <TipoRetorno> <NombreMetodo>(<parametros>)
{
    var dominio = FabricaIoCArsys.Resolve<IDominioContrato<Entidad>>();
    return dominio.<NombreMetodo>(<parametros>);
}
```

### Proxy cliente

Actualizar Service Reference en `Arsys.Presentacion.Cloud`:
- Abrir el servicio correspondiente → `Update Service Reference` en VS 2013.
- El proxy se regenera con la nueva operación automáticamente.

### Consumo desde Model (si aplica)

```csharp
// En M<Entidad>.cs
public <TipoRetorno> <NombreMetodo>(<parametros>)
{
    var client = new Servicios<Modulo>ArsysClient(
        Convert.ToString(EServicio.<EServicioEnum>),
        ArsysSingleton.ObtenerInstancia.getCadena(EServicio.<EServicioEnum>)
    );
    ModeloBase.asignarCabecera(client.Endpoint);
    return client.<NombreMetodo>(<parametros>);
}
```

## Paso 5 — Si el método es CONTABLE (módulo Contabilidad o impacta cuentas)

Agregar invocación a `IDominioContratoDocumentoContable` dentro del TransactionScope:

```csharp
var dominioContable = FabricaIoCArsys.Resolve<IDominioContratoDocumentoContable>();
dominioContable.GenerarDocumentoContable(entidad);
```

Y verificar que `idClaseDocumento` esté configurado.

## Paso 6 — Proceso

1. Identificar el caso (A/B/C) con el usuario.
2. Presentar el plan con lista EXACTA de archivos a tocar.
3. Esperar OK.
4. Modificar archivos uno por uno (NO tocar múltiples a la vez sin verificar).
5. Si toca registrar algo nuevo en Unity → editar `FabricaIoCArsys`.
6. Reportar: archivos modificados, líneas agregadas, próximos pasos (compilar, actualizar proxy, probar).

## Reglas innegociables

- NUNCA saltarse capas (UI llamando repositorio directo = prohibido).
- Escrituras SIEMPRE con `TransactionScope`.
- Lecturas SIEMPRE con `.Include()` explícito si requieren navegación.
- Filtrar por `idSociedad` en consultas multi-tenant.
- Registrar excepciones vía `AdministradorError.RegistrarError(ex)`.
