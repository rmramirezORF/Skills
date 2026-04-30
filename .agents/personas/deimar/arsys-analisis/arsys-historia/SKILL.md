---
name: arsys-historia
description: Analiza una historia de usuario (texto, archivo Jira, Word, etc.) y la traduce a un plan de trabajo concreto en ARSYS — módulo, capas tocadas, archivos a modificar, checklist de criterios y riesgos. Úsala cuando el usuario hable de "historia de usuario", "user story", "requerimiento" o "ticket" relacionado con ARSYS.
argument-hint: [ruta-archivo-o-texto-de-la-historia]
---

# Analizar historia de usuario para ARSYS

Convierte una historia de usuario en un plan técnico accionable.

## Paso 1 — Contexto obligatorio

Lee siempre antes de analizar:
- `C:\DEIMAR\ARSYS\ArsysPresentacion\CLAUDE.md`
- `C:\DEIMAR\ARSYS\ArsysServiciosORF\ArsysServiciosORF\CLAUDE.md`

## Paso 2 — Obtener la historia

- Si el usuario pasó una ruta → leer el archivo.
- Si pegó el texto → usarlo tal cual.
- Si no dio nada → pedir la historia o ruta.

## Paso 3 — Analizar y producir esta salida

Devuelve un informe estructurado con estas secciones exactas:

### 1. Resumen en 1 frase
Una frase que capture el "qué" de la historia.

### 2. Criterios de aceptación detectados
Lista los criterios que encuentres en el texto. Si faltan, márcalo como `⚠️ FALTA`.

### 3. Módulo(s) ARSYS afectado(s)
Elegir de: ActivoFijo, Auditoria, Compras, Contabilidad, CuentaBancaria, CuentaCobrar, CuentaPagar, GrupoEmpresarial, InstrumentoFinanciero, Inventario, ListaPrecio, Mantenimiento, Nomina, Paddy, PrestamoGeneral, Producto, Seguridad, Sociedad, Venta, Transporte.

Si toca varios → listar todos.

### 4. Capas tocadas
Una tabla con ✔ / ✘:

| Capa | ¿Toca? | Por qué |
|---|---|---|
| Base de datos (tabla nueva / campo nuevo / SP nuevo) | | |
| Repositorio (`Arsys.Infraestructura.Repositorio.{Modulo}`) | | |
| Dominio (`Arsys.Dominio.Servicios.{Modulo}`) | | |
| WCF (`Arsys.ServiciosDistribuidos`) | | |
| Proxy cliente (`Arsys.Presentacion.Cloud`) | | |
| MVP (`Arsys.Presentacion.WinForms.{Modulo}.MVP`) | | |
| UI form (`Arsys.Presentacion.WinForms.{Modulo}`) | | |
| Reporte .rdl (`ArsysReportes`) | | |
| Cliente específico (ORF / CERES / INV / TDH) | | |

### 5. Archivos propuestos a crear / modificar

Lista con ruta exacta de cada archivo:

```
[CREAR]    ArsysServiciosORF/Arsys.Infraestructura.Repositorio.Venta/RepositorioFacturaX.cs
[MODIFICAR] ArsysServiciosORF/Arsys.ServiciosDistribuidos/IServiciosVentaArsys.cs (agregar método)
...
```

### 6. Cambios de base de datos
- Tablas nuevas, columnas nuevas, SPs nuevos
- Migración SQL propuesta (script `ALTER TABLE`, `CREATE PROCEDURE`, etc.)
- ⚠️ recordar regenerar el `.edmx` afectado

### 7. Checklist de implementación (ordenado)

1. [ ] Crear/alterar objetos BD
2. [ ] Regenerar `.edmx` correspondiente
3. [ ] Crear IRepositorio + Repositorio
4. [ ] Crear IDominioContrato + Dominio
5. [ ] Registrar en `FabricaIoCArsys`
6. [ ] Agregar operación en `IServicios{Modulo}Arsys` + `Servicios{Modulo}Arsys.svc.cs`
7. [ ] Actualizar service reference en `Arsys.Presentacion.Cloud`
8. [ ] Crear/modificar Model (MVP)
9. [ ] Crear/modificar Presenter (MVP)
10. [ ] Crear/modificar `arsFrm` (UI)
11. [ ] Compilar soluciones afectadas
12. [ ] Probar flujo completo

Marca solo los pasos aplicables a esta historia.

### 8. Riesgos y consideraciones
- Multi-tenancy: ¿hay que filtrar por `idSociedad`? ¿Comportamiento distinto por cliente ORF/CERES/TDH?
- Transacciones: ¿la operación abarca varias tablas? → `TransactionScope`
- Performance: ¿consulta con joins grandes? → `.Include()` explícito, paginación
- Permisos: ¿requiere entrada en tabla de seguridad / rol?
- Auditoría: `fechaCreacion`/`fechaModificacion` se llenan solas vía `RealizarCambios()`

### 9. Preguntas para el negocio
Cosas que la historia NO responde y hay que aclarar antes de codear (ej. "¿qué pasa si el producto ya está facturado cuando el usuario intenta anularlo?").

### 10. Estimación rough
S / M / L / XL con justificación de 1 línea.

## Paso 4 — Ofrecer siguiente acción

Termina preguntando:
> ¿Quieres que empiece por la capa X, o prefieres que use `/arsys-nueva-entidad` para el scaffolding del backend?
