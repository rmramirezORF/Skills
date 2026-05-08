---
name: arsys-nueva-entidad
description: Genera los archivos necesarios para agregar una nueva entidad de negocio al backend de ARSYS (contrato repositorio, repositorio, contrato dominio, dominio, registro en Unity). Úsala cuando el usuario diga "nueva entidad", "nuevo repositorio" o "agregar X a ARSYS".
argument-hint: [Entidad] [Modulo]
---

# Nueva entidad en ARSYS backend

Genera el scaffolding completo para una nueva entidad siguiendo el patrón Repository + Domain Services + Unity DI.

## Paso 1 — Cargar contexto

Lee primero (si aún no los tienes en contexto):
- `C:\DEIMAR\ARSYS\ArsysServiciosORF\ArsysServiciosORF\CLAUDE.md`
- Un ejemplo vivo del módulo destino: busca `RepositorioProducto`, `DominioProducto` y sus interfaces para copiar el estilo exacto.

## Paso 2 — Pedir datos al usuario (si no los dio)

1. **Nombre de la entidad** (PascalCase, singular) — ej. `FacturaRemision`
2. **Módulo funcional** — uno de: ActivoFijo, Auditoria, Compras, Contabilidad, CuentaBancaria, CuentaCobrar, CuentaPagar, Inventario, ListaPrecio, Mantenimiento, Nomina, Paddy, Producto, Seguridad, Sociedad, Venta, etc.
3. **¿Tabla SQL ya existe?** (si no, advertir que hay que crearla primero y regenerar el .edmx)
4. **Operaciones necesarias** — por defecto: ConsultarPorId, ConsultarTodos, Guardar, Modificar, Eliminar

## Paso 3 — Presentar plan al usuario antes de crear archivos

Muestra esta tabla con rutas EXACTAS antes de escribir nada:

| Archivo | Ruta |
|---|---|
| Interfaz repositorio | `ArsysServiciosORF/Arsys.Dominio.Contratos.{Modulo}/IRepositorio{Entidad}.cs` |
| Implementación repo | `ArsysServiciosORF/Arsys.Infraestructura.Repositorio.{Modulo}/Repositorio{Entidad}.cs` |
| Interfaz dominio | `ArsysServiciosORF/Arsys.Dominio.IContrato.{Modulo}/IDominioContrato{Entidad}.cs` |
| Implementación dominio | `ArsysServiciosORF/Arsys.Dominio.Servicios.{Modulo}/Dominio{Entidad}.cs` |
| Registro Unity | Editar `ArsysServiciosORF/Arsys.Transversal.Arsys/FabricaIoCArsys.cs` |

Confirma con el usuario, espera su OK.

## Paso 4 — Generar archivos siguiendo plantillas

### Interfaz repositorio

```csharp
using System.Collections.Generic;
using Arsys.Dominio.Core;
using Arsys.Dominio.Entidades;

namespace Arsys.Dominio.Contratos.{Modulo}
{
    public interface IRepositorio{Entidad} : IRepositorioArsys<{Entidad}>
    {
        {Entidad} Consultar{Entidad}PorId(long Id{Entidad});
        List<{Entidad}> ConsultarTodos{Entidad}(int IdSociedad);
    }
}
```

### Implementación repositorio

```csharp
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using Arsys.Dominio.Contratos.{Modulo};
using Arsys.Dominio.Entidades;
using Arsys.Infraestructura.Core;
using Arsys.Infraestructura.Datos;

namespace Arsys.Infraestructura.Repositorio.{Modulo}
{
    public class Repositorio{Entidad} : RepositorioArsys<{Entidad}>, IRepositorio{Entidad}
    {
        public Repositorio{Entidad}(IConsultableUnidadTrabajo unidadDeTrabajo) : base(unidadDeTrabajo) { }

        public {Entidad} Consultar{Entidad}PorId(long Id{Entidad})
        {
            using (ArsysEntities ctx = new ArsysEntities())
            {
                return ctx.{Entidad}
                    // .Include("NavegacionX") — lazy loading está deshabilitado, incluir manualmente
                    .FirstOrDefault(e => e.id{Entidad} == Id{Entidad});
            }
        }

        public List<{Entidad}> ConsultarTodos{Entidad}(int IdSociedad)
        {
            using (ArsysEntities ctx = new ArsysEntities())
            {
                return ctx.{Entidad}
                    .Where(e => e.idSociedad == IdSociedad)
                    .ToList();
            }
        }
    }
}
```

### Interfaz dominio

```csharp
using Arsys.Dominio.Entidades;

namespace Arsys.Dominio.IContrato.{Modulo}
{
    public interface IDominioContrato{Entidad}
    {
        string Guardar{Entidad}({Entidad} entidad);
        bool Modificar{Entidad}({Entidad} entidad);
        string Eliminar{Entidad}({Entidad} entidad);
    }
}
```

### Implementación dominio

```csharp
using System.Transactions;
using Arsys.Dominio.Contratos.{Modulo};
using Arsys.Dominio.Entidades;
using Arsys.Dominio.IContrato.{Modulo};

namespace Arsys.Dominio.Servicios.{Modulo}
{
    public class Dominio{Entidad} : IDominioContrato{Entidad}
    {
        private readonly IRepositorio{Entidad} _IRepositorio{Entidad};

        public Dominio{Entidad}(IRepositorio{Entidad} iRepositorio{Entidad})
        {
            _IRepositorio{Entidad} = iRepositorio{Entidad};
        }

        public string Guardar{Entidad}({Entidad} entidad)
        {
            using (TransactionScope tx = new TransactionScope())
            {
                try
                {
                    _IRepositorio{Entidad}.Agregar(entidad);
                    _IRepositorio{Entidad}.UnidadDeTrabajo.RealizarCambios();
                    tx.Complete();
                    return "true";
                }
                catch { return "false"; }
            }
        }

        public bool Modificar{Entidad}({Entidad} entidad) { /* ... */ return true; }
        public string Eliminar{Entidad}({Entidad} entidad) { /* ... */ return "true"; }
    }
}
```

### Registro en FabricaIoCArsys

Abrir `Arsys.Transversal.Arsys/FabricaIoCArsys.cs` y añadir en el constructor estático, en la sección correspondiente al módulo:

```csharp
_unityContainer.RegisterType<IRepositorio{Entidad}, Repositorio{Entidad}>();
_unityContainer.RegisterType<IDominioContrato{Entidad}, Dominio{Entidad}>();
```

## Paso 5 — Reportar al usuario

- Archivos creados con ruta completa
- Línea exacta donde se registró en `FabricaIoCArsys`
- Próximos pasos sugeridos:
  1. Agregar la entidad al `.edmx` si aún no está
  2. Crear operación WCF si necesita exposición a cliente (usar `/arsys-nueva-entidad-wcf` si existe)
  3. Compilar con MSBuild para validar

## Reglas innegociables

- **NUNCA** accedas a BD fuera de un repositorio.
- **SIEMPRE** `TransactionScope` en escrituras del dominio.
- **SIEMPRE** `.Include()` explícito — lazy loading deshabilitado.
- **SIEMPRE** filtrar por `idSociedad` en consultas de listado.
- **SIEMPRE** registrar en `FabricaIoCArsys` — sin eso Unity no puede resolver.
