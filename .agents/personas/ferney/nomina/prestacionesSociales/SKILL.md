---
name: nomina-prestaciones-sociales
display_name: Prestaciones Sociales (Nómina Arsys)
owner: ferney
domain: Nómina
modulo: Prestaciones Sociales
ambito: Funcional + Técnico + Seguridad
fuente: Documento "PrestacionesSociales.pdf" (módulo Nómina, BD ArsysNominaORF)
descripcion: Skill empresarial para soporte funcional, técnico y de seguridad del módulo Prestaciones Sociales del sistema de Nómina (Primas, Cesantías, Intereses, Planilla Única SOI, Provisiones, Trazabilidad).
---

# Skill — Prestaciones Sociales de Nómina

Skill orientada a soporte **funcional, técnico y de seguridad** del módulo **Prestaciones Sociales** del sistema de Nómina de Arsys. Cubre el formulario y sus **7 pestañas** (Liquidación de Prima, Consulta Primas Liquidadas, Liquidación de Cesantías, Consulta de Cesantías Liquidadas, Planilla Única, Provisiones, Trazabilidad), las **6 tablas SQL Server** del modelo (`Nomina.Prima`, `Nomina.EmpleadoPrima`, `Nomina.PrimaCredito`, `Nomina.Cesantia`, `Nomina.EmpleadoCesantia`, `Nomina.CesantiasCredito`) y los **9 permisos** que controlan el acceso al módulo.

> Esta Skill se basa **únicamente** en el documento `PrestacionesSociales.pdf`. Cualquier dato no presente en la fuente queda señalado como _"Pendiente de documentar"_.

---

## 1. Descripción funcional del módulo

El formulario **Prestaciones Sociales** centraliza **todos los procesos de pago por prestaciones sociales**, en concreto:

- **Primas legales** (semestrales).
- **Cesantías** (anuales).
- **Intereses sobre cesantías**.
- **Planilla Única** de conceptos de pago para reporte a la **DIAN**.
- **Provisiones** contables de primas y cesantías.
- **Trazabilidad** de pagos históricos.

El formulario expone una barra superior con botones **Nuevo, Guardar / Buscar, Reportes, Manuales, Ayuda, Salir** y filtros de cabecera comunes a todas las pestañas: **Unidad Negocio**, **Tipo de Nómina** (ej. `0001 - ADMINISTRACION`), **Centro Económico**, **NIT** (para filtrar por empleado) y **Dependencia**.

### Pestañas del formulario

| # | Pestaña | Propósito |
|---|---|---|
| 1 | **Liquidación de Prima** | Liquidar la prima legal del semestre (1° o 2°), en borrador o definitiva, para toda la organización o por dependencias. |
| 2 | **Consulta Primas Liquidadas** | Histórico de primas ya liquidadas; filtrable por empleado para reporte. |
| 3 | **Liquidación de Cesantías** | Liquidar las cesantías anuales (definitiva o no) y los intereses respectivos. |
| 4 | **Consulta de Cesantías Liquidadas** | Histórico de cesantías ya liquidadas; informe por Oficina o por Fondo de Cesantías. |
| 5 | **Planilla Única** | Consultar conceptos de pago por empleado en un rango y generar el archivo plano para la DIAN. |
| 6 | **Provisiones** | Listado de lo provisionado por la empresa en primas y cesantías por empleado. |
| 7 | **Trazabilidad** | Histórico de pagos de primas y cesantías por tipo de nómina y por año. |

---

## 2. Contexto del negocio

- En Colombia, la **prima legal** se paga **dos veces al año**:
  - **Primer semestre**: enero–junio.
  - **Segundo semestre**: julio–diciembre.
- Las **cesantías** se liquidan **anualmente** según ley.
- Sobre las cesantías se calculan **intereses** a favor del trabajador.
- La empresa lleva **provisiones** contables por estos conceptos a lo largo del año.
- Recursos Humanos debe **reportar a la DIAN** los conceptos de pago en una **Planilla Única**, mediante **archivo plano**.
- El módulo soporta **multi-empresa / multi-nómina** (tipo de nómina, unidad de negocio, centro económico, dependencia).
- Se distingue **Régimen Laboral**: **Anterior** vs. **Nuevo** (afecta el cálculo de cesantías).
- Las prestaciones admiten **descuentos por créditos** del empleado (tablas `PrimaCredito` y `CesantiasCredito`).

---

## 3. Objetivo del proceso

1. **Liquidar la prima** legal del semestre correspondiente y dejarla en **borrador** o en **definitiva**.
2. **Liquidar las cesantías anuales** y sus **intereses** (1 % por mes trabajado relativo al salario).
3. Mantener el **histórico** de primas y cesantías liquidadas para consulta y reporte por empleado.
4. Generar la **Planilla Única** de conceptos para la **DIAN** mediante archivo plano.
5. Mostrar las **provisiones** acumuladas por la empresa.
6. Conservar la **trazabilidad** completa de los pagos hechos por tipo de nómina y por año.

---

## 4. Flujo operativo detallado

### 4.1 Flujo — Liquidación de Prima

1. Abrir formulario **Prestaciones Sociales** y elegir la pestaña **Liquidación de Prima**.
2. Diligenciar la cabecera del módulo: **Unidad Negocio**, **Tipo de Nómina**, **Centro Económico**, **Dependencia** (opcional para filtrar). El **NIT** queda vacío si se quiere liquidar a toda la organización; se diligencia para filtrar a un empleado.
3. Seleccionar **Año Disponible** y **Semestre** (`1` = enero–junio, `2` = julio–diciembre).
4. Indicar **Periodo Inicial** y **Periodo Final** y **Fecha Corte**.
5. Indicar **Definitiva**: `Sí` o `No`.
   - Si es `Sí`, el usuario debe poseer el permiso **DEFINITIVAPRIMA**.
6. Elegir **Tipo Informe**: **Resumen** o **Detallado**.
7. Ejecutar la liquidación → se calcula y se persiste en `Nomina.Prima` (cabecera) y `Nomina.EmpleadoPrima` (un renglón por empleado).
8. Revisar el listado: **NIT, Descripción Empleado, Fecha Ingreso, Días Liquidados, Días Trabajados, Días Sanciones, Sueldo Básico, Aux. Transporte, Sueldo Promedio, Valor Prima**.

### 4.2 Flujo — Consulta de Primas Liquidadas

1. Pestaña **Consulta Primas Liquidadas**.
2. Filtrar por **Tipo de Nómina** y opcionalmente por **NIT** del empleado.
3. La grilla lista cada prima liquidada: **Tipo Nómina**, **Descripción** (ej. `PRIMA LEGAL I SEMESTRE`, `PRIMA LEGAL II SEMESTRE`), **Año Vigencia**, **Semestre**, **Periodo Inicial**.
4. Si se digitó un empleado, se puede sacar el reporte de lo pagado en el periodo ya liquidado.

### 4.3 Flujo — Liquidación de Cesantías

1. Pestaña **Liquidación de Cesantías**.
2. Diligenciar cabecera (Unidad Negocio, Tipo de Nómina, Centro Económico, Dependencia, NIT opcional).
3. Seleccionar **Régimen Laboral**: **Anterior** o **Nuevo**.
4. Seleccionar **Años Disponibles**, **Periodo Inicial / Final** y **Fecha Inicio**.
5. Indicar **Definitiva**: `Sí` o `No` (definitiva exige el permiso **DEFINITIVACESANTIA**).
6. Elegir **Tipo Informe**: **Resumen** o **Detallado**.
7. Ejecutar la liquidación → se persiste en `Nomina.Cesantia` (cabecera) y `Nomina.EmpleadoCesantia` (renglón por empleado).
8. Revisar el listado: **NIT, Descripción Empleado, Fecha Ingreso, Días Liquidación, Días Trabajados, Días Sanciones, Sueldo Básico, Aux. Transporte, Sueldo Promedio, Valor Cesantía Pagar, Valor Descuentos, Valor Intereses**.

> **Cálculo de intereses**: **1 %** por mes trabajado con relación al salario.

### 4.4 Flujo — Consulta de Cesantías Liquidadas

1. Pestaña **Consulta de Cesantías Liquidadas**.
2. Seleccionar **Años Disponibles**.
3. Elegir **Tipo de Informe**: **Cesantías por Oficina** o **Por Fondo de Cesantías**.
4. La grilla lista las cesantías liquidadas; con un NIT específico se puede sacar reporte individual.

### 4.5 Flujo — Planilla Única (SOI / DIAN)

1. Pestaña **Planilla Única**.
2. Filtrar **Periodo Pago**, **Periodo Pago Hasta**, **Tipo Planilla**, **Código AFP**.
3. La grilla muestra los **conceptos de pago** de los empleados según el esquema definido para la DIAN.
4. Generar el **archivo plano** que **Recursos Humanos** carga en la **DIAN** (PILA / SOI).

### 4.6 Flujo — Provisiones

1. Pestaña **Provisiones**.
2. Elegir **Tipo Modelo**, **Periodo Inicial / Final** (mes-año, ej. `marzo de 2024`).
3. Elegir **Listado Provisiones** u **Otras Provisiones**, y modo **General** o **Mensual**.
4. La grilla lista por **NIT, Empleado, Concepto, %**.

### 4.7 Flujo — Trazabilidad

1. Pestaña **Trazabilidad**.
2. Filtrar por **Tipo Nómina** y **Año**.
3. Pestañas internas **Primas** y **Cesantías**.
4. La grilla muestra: **Descripción, Año Vigencia, Fecha Inicial, Fecha Final, Periodo Inicial, Periodo Final, Fecha Liquidación, Usuario Liquidación**.

---

## 5. Reglas de negocio

1. La **prima legal** se liquida **por semestre**:
   - **Semestre 1** = enero a junio.
   - **Semestre 2** = julio a diciembre.
2. Las **cesantías** se liquidan **anualmente** por ley.
3. Sobre las cesantías se calculan **intereses al 1 % por mes trabajado** con relación al salario.
4. Toda liquidación se hace en modo **Borrador** o **Definitiva**:
   - **Definitiva** requiere permisos específicos: **DEFINITIVAPRIMA** y **DEFINITIVACESANTIA**.
5. La liquidación puede aplicar a **toda la organización** o a **dependencias** específicas.
6. Las **prestaciones admiten descuentos por crédito**: `Nomina.PrimaCredito` y `Nomina.CesantiasCredito` registran cuánto se descontó al empleado de su prima/cesantía por créditos vigentes.
7. Las cesantías distinguen **Régimen Laboral**: **Anterior** vs. **Nuevo** (campo `regimenLaboral`).
8. La consulta histórica permite reporte por empleado solo si se digita su NIT.
9. La **Planilla Única** se reporta a la **DIAN** mediante archivo plano administrado por Recursos Humanos.
10. Las **provisiones** se manejan a nivel **General** o **Mensual** y por concepto.

---

## 6. Validaciones del sistema

> Validaciones explícitas o inferidas de la fuente. Las marcadas con (✱) están explícitas en el documento.

- **Permiso de pestaña** — el usuario solo ve la pestaña si tiene el permiso correspondiente (ver §13). (✱)
- **Permiso de Definitiva** — sin **DEFINITIVAPRIMA** no se puede liquidar prima en definitiva; sin **DEFINITIVACESANTIA** no se puede liquidar cesantías en definitiva. (✱)
- **Tipo de Nómina** obligatorio en la cabecera del formulario.
- **Año Disponible / Semestre** obligatorios al liquidar primas.
- **Año Disponible** obligatorio al liquidar cesantías.
- **Régimen Laboral** obligatorio al liquidar cesantías (Anterior o Nuevo).
- **Periodo Inicial / Final** y **Fecha Corte** o **Fecha Inicio** consistentes con el año/semestre seleccionado.
- **Tipo Informe** = `Resumen` o `Detallado`.
- En **Planilla Única**, **Periodo Pago** y **Tipo Planilla** son obligatorios para generar el archivo a la DIAN.

---

## 7. Explicación de formularios y campos

### 7.1 Cabecera común a todo el formulario

| Campo | Significado |
|---|---|
| Unidad Negocio | Unidad de negocio dentro de la empresa |
| Tipo de Nómina | Tipo de nómina (ej. `0001 - ADMINISTRACION`) |
| Centro Económico | Centro económico/contable |
| NIT | Identificación del empleado (opcional, filtra a uno) |
| Dependencia | Dependencia/área (opcional, filtra a una) |

### 7.2 Pestaña "Liquidación de Prima"

| Campo | Mapeo |
|---|---|
| Años Disponibles | `Prima.añoVigencia` |
| Fecha Corte | (parámetro de cálculo, no almacenado directamente) |
| Semestre | `Prima.semestre` |
| Periodo Inicial | `Prima.periodoInicial` |
| Periodo Final | `Prima.periodoFinal` |
| Definitiva (Sí/No) | (estado del proceso; controlado por permiso `DEFINITIVAPRIMA`) |
| Tipo Informe (Resumen/Detallado) | parámetro de presentación |

Tabla resultante: **NIT, Descripción Empleado, Fecha Ingreso, Días Liquidados, Días Trabajados, Días Sanciones, Sueldo Básico, Aux. Transporte, Sueldo Promedio, Valor Prima** → mapean a `EmpleadoPrima`.

### 7.3 Pestaña "Liquidación de Cesantías"

| Campo | Mapeo |
|---|---|
| Régimen Laboral (Anterior/Nuevo) | `EmpleadoCesantia.regimenLaboral` |
| Años Disponibles | `Cesantia.añoVigencia` |
| Fecha Inicio | (parámetro de cálculo) |
| Periodo Inicial / Final | `Cesantia.periodoInicial` / `periodoFinal` |
| Definitiva (Sí/No) | (controlado por permiso `DEFINITIVACESANTIA`) |
| Tipo Informe (Resumen/Detallado) | parámetro de presentación |

Tabla resultante: **NIT, Descripción Empleado, Fecha Ingreso, Días Liquidación, Días Trabajados, Días Sanciones, Sueldo Básico, Aux. Transporte, Sueldo Promedio, Valor Cesantía Pagar, Valor Descuentos, Valor Intereses** → mapean a `EmpleadoCesantia`.

### 7.4 Pestaña "Planilla Única"

| Campo | Significado |
|---|---|
| Periodo Pago / Periodo Pago Hasta | rango del reporte |
| Tipo Planilla | tipo definido por la DIAN |
| Código AFP | filtro AFP |

Salida: archivo plano para cargar a la DIAN.

### 7.5 Pestaña "Provisiones"

| Campo | Significado |
|---|---|
| Tipo Modelo | tipo de provisión a listar |
| Periodo Inicial / Final | rango (mes-año) |
| General / Mensual | granularidad |

Tabla: **NIT, Empleado, Concepto, %**.

### 7.6 Pestaña "Trazabilidad"

| Columna | Significado |
|---|---|
| Descripción | descripción de la liquidación |
| Año Vigencia | año al que aplica |
| Fecha Inicial / Final | fechas de la liquidación |
| Periodo Inicial / Final | periodos de nómina cubiertos |
| Fecha Liquidación | cuándo se ejecutó |
| Usuario Liquidación | quién la ejecutó |

---

## 8. Explicación de menús y opciones del sistema

### Barra superior del formulario

- **Nuevo** — inicia una nueva liquidación / consulta.
- **Guardar / Buscar** — persiste o consulta según pestaña.
- **Reportes** — genera reportes asociados a la pestaña activa.
- **Manuales** — abre la documentación.
- **Ayuda** — ayuda contextual.
- **Salir** — cierra el formulario.

### Pestañas controladas por permiso

Cada pestaña está condicionada al permiso del usuario (ver §13). Si el usuario no tiene el permiso, la pestaña simplemente no se muestra.

---

## 9. Relación entre formularios y SQL Server

```
Pestaña Liquidación de Prima
    └── Nomina.Prima (cabecera) 1 ──► N Nomina.EmpleadoPrima (renglón por empleado)
                                              │
                                              └─► Nomina.PrimaCredito (descuentos por créditos)

Pestaña Liquidación de Cesantías
    └── Nomina.Cesantia (cabecera) 1 ──► N Nomina.EmpleadoCesantia (renglón por empleado)
                                              │
                                              └─► Nomina.CesantiasCredito (descuentos por créditos)

Pestaña Planilla Única ──► consulta de conceptos por empleado → archivo plano DIAN

Pestaña Provisiones ──► consulta sobre las provisiones (tabla origen Pendiente de documentar)

Pestaña Trazabilidad ──► consulta sobre Nomina.Prima y Nomina.Cesantia con sus auditorías
```

---

## 10. Explicación técnica básica del proceso

- Cada **liquidación de prima** crea **una fila** en `Nomina.Prima` (cabecera del proceso) con su `idTipoNomina`, `descripcion`, `añoVigencia`, `semestre`, `fechaInicial`, `fechaFinal`, `periodoInicial`, `periodoFinal`. A partir de esa cabecera se generan **N filas** en `Nomina.EmpleadoPrima`, una por cada empleado liquidado.
- Cada **liquidación de cesantías** crea **una fila** en `Nomina.Cesantia` con el `añoVigencia`, fechas y periodos; y **N filas** en `Nomina.EmpleadoCesantia` con sueldo, días, valor cesantía, valor intereses, porcentaje de intereses y régimen laboral.
- Cuando un empleado tiene **créditos** que se descuentan de su prima/cesantía, se registran filas en `Nomina.PrimaCredito` o `Nomina.CesantiasCredito` que apuntan al `EmpleadoPrima` / `EmpleadoCesantia` y al `idCredito`.
- Las pestañas **Consulta** y **Trazabilidad** son **reportes** sobre estas tablas con filtros de tipo de nómina, año, semestre, NIT.
- La **Planilla Única** consume conceptos de pago de los empleados y produce un **archivo plano** para la DIAN.
- Las **Provisiones** son un listado consolidado por empleado y concepto.

> Procedimientos almacenados específicos del módulo: **Pendiente de documentar**.

---

## 11. Tablas SQL Server involucradas

### 11.1 `Nomina.Prima` (cabecera de liquidación de prima)

| Columna | Tipo |
|---|---|
| `idPrima` | `int` (PK) |
| `idTipoNomina` | `int` |
| `descripcion` | `varchar(100)` |
| `añoVigencia` | `smallint` |
| `semestre` | `smallint` |
| `fechaInicial` | `date` |
| `fechaFinal` | `date` |
| `periodoInicial` | `varchar(10)` |
| `periodoFinal` | `varchar(10)` |
| `fechaCreacion` | `datetime` |
| `fechaModificacion` | `datetime` |
| `idUsuarioCreacion` | `int` |
| `idUsuarioModificacion` | `int` |
| `idSesionUsuario` | `bigint` |
| `idFormularioCreacion` | `int` |
| `idFormulario` | `int` |

### 11.2 `Nomina.EmpleadoPrima` (renglón por empleado)

| Columna | Tipo |
|---|---|
| `idEmpleadoPrima` | (PK) |
| `idPrima` | FK → `Prima` |
| `idEmpleadoSociedadNomina` | empleado |
| `sueldoBasico` | |
| `auxilioTransporte` | |
| `salarioPromedio` | |
| `diasSanciones` | |
| `diasTrabajador` | |
| `diasPagados` | |
| `valorPrima` | |
| `fechaCreacion`, `fechaModificacion` | auditoría |
| `idUsuarioCreacion`, `idUsuarioModificacion`, `idSesionUsuario`, `idFormulario` | auditoría |

### 11.3 `Nomina.PrimaCredito` (descuentos por crédito)

| Columna |
|---|
| `idPrimaCredito` (PK) |
| `idEmpleadoPrima` (FK) |
| `idCredito` |
| `valor` |
| auditoría (`fechaCreacion`, `fechaModificacion`, `idUsuarioCreacion`, `idUsuarioModificacion`, `idSesionUsuario`, `idFormulario`) |

### 11.4 `Nomina.Cesantia` (cabecera de liquidación de cesantías)

| Columna | Tipo |
|---|---|
| `idCesantia` | `int` (PK) |
| `idTipoNomina` | `int` |
| `descripcion` | `varchar(100)` |
| `añoVigencia` | `smallint` |
| `fechaInicial` | `date` |
| `fechaFinal` | `date` |
| `periodoInicial` | `varchar(10)` |
| `periodoFinal` | `varchar(10)` |
| `fechaCreacion` | `datetime` |
| `fechaModificacion` | `datetime` |
| `idUsuarioCreacion` | `int` |
| `idUsuarioModificacion` | `int` |
| `idSesionUsuario` | `bigint` |
| `idFormularioCreacion` | `int` |
| `idFormulario` | `int` |

### 11.5 `Nomina.EmpleadoCesantia` (renglón por empleado)

| Columna |
|---|
| `idEmpleadoCesantia` (PK) |
| `idCesantia` (FK) |
| `idEmpleadoSociedadNomina` |
| `idTerceroSeguridadSocial` |
| `fechaIngreso` |
| `sueldoBasico` |
| `auxilioTransporte` |
| `salarioPromedio` |
| `diasSanciones` |
| `diasTrabajados` |
| `diasPagados` |
| `valorCesantias` |
| `valorIntereses` |
| `porcentajeIntereses` |
| `regimenLaboral` |
| auditoría (`fechaCreacion`, `fechaModificacion`, `idUsuarioCreacion`, `idUsuarioModificacion`, `idSesionUsuario`, `idFormulario`) |

### 11.6 `Nomina.CesantiasCredito` (descuentos por crédito)

| Columna |
|---|
| `idCesantiaCredito` (PK) |
| `idEmpleadoCesantia` (FK) |
| `idCredito` |
| `valor` |
| auditoría (`fechaCreacion`, `fechaModificacion`, `idUsuarioCreacion`, `idUsuarioModificacion`, `idSesionUsuario`, `idFormulario`) |

> Las tablas de soporte (Provisiones, Conceptos para Planilla Única, Crédito, Empleado/Tercero) **no aparecen detalladas** en el diagrama de la fuente.

---

## 12. Relaciones entre tablas

```
                    Nomina.Prima
                         │ 1
                         │
                         ▼ N
                  Nomina.EmpleadoPrima ──────► (idEmpleadoSociedadNomina) → Empleado
                         │ 1
                         │
                         ▼ N
                  Nomina.PrimaCredito ─────► (idCredito) → Crédito


                    Nomina.Cesantia
                         │ 1
                         │
                         ▼ N
                Nomina.EmpleadoCesantia ──────► (idEmpleadoSociedadNomina) → Empleado
                         │       └──► (idTerceroSeguridadSocial) → Fondo de Cesantías (Tercero)
                         │ 1
                         ▼ N
                Nomina.CesantiasCredito ─────► (idCredito) → Crédito
```

- **`Prima` 1 ──► N `EmpleadoPrima`** (vía `idPrima`).
- **`EmpleadoPrima` 1 ──► N `PrimaCredito`** (vía `idEmpleadoPrima`).
- **`Cesantia` 1 ──► N `EmpleadoCesantia`** (vía `idCesantia`).
- **`EmpleadoCesantia` 1 ──► N `CesantiasCredito`** (vía `idEmpleadoCesantia`).
- `EmpleadoCesantia` referencia un **tercero de seguridad social** (`idTerceroSeguridadSocial`) — el **fondo de cesantías**.

---

## 13. Seguridad y permisos del módulo

El módulo se controla mediante **9 acciones de usuario / permisos** explícitamente documentados:

| Permiso | Efecto |
|---|---|
| **LIQUIDARPRIMA** | Visualiza la pestaña **Liquidación de Prima** y permite ejecutar el proceso. |
| **CONSULTARPRIMA** | Permite consultar las primas ya liquidadas por semestre. |
| **LIQUIDARCESANTIA** | Visualiza la pestaña **Liquidación de Cesantías**; ejecuta el proceso anual. |
| **CONSULTARCESANTIA** | Permite consultar las cesantías ya liquidadas por año. |
| **PLANILLAUNICASOI** | Visualiza la pestaña **Planilla Única**; genera la planilla para la DIAN. |
| **PROVISIONES** | Visualiza la pestaña **Provisiones** y permite sacar el listado por concepto/empleado. |
| **VERTRAZABILIDADPRESTACIONSOCIAL** | Muestra/oculta la pestaña **Trazabilidad** de pagos de prima y cesantías. |
| **DEFINITIVAPRIMA** | Permiso de **validación**: sin él **no se puede liquidar la prima en definitiva**. |
| **DEFINITIVACESANTIA** | Permiso de **validación**: sin él **no se puede liquidar las cesantías en definitiva**. |

### Lógica de aplicación

- Los permisos **LIQUIDAR\***, **CONSULTAR\***, **PLANILLAUNICASOI**, **PROVISIONES**, **VERTRAZABILIDADPRESTACIONSOCIAL** controlan **qué pestañas ve el usuario**.
- Los permisos **DEFINITIVA\*** son **permisos de validación** que se chequean **al momento de marcar la liquidación como definitiva**. Sin ellos solo se permite borrador.

---

## 14. Roles de usuario involucrados

> La fuente describe permisos atómicos, no roles compuestos. A partir de los permisos, se infieren los siguientes **roles típicos** (cada empresa puede componerlos como prefiera):

- **Liquidador de prestaciones** — `LIQUIDARPRIMA`, `LIQUIDARCESANTIA`, `CONSULTARPRIMA`, `CONSULTARCESANTIA`. Ejecuta el cálculo en borrador.
- **Aprobador / Cierre** — además de los anteriores, **`DEFINITIVAPRIMA`** y **`DEFINITIVACESANTIA`** para cerrar las liquidaciones en definitiva.
- **Recursos Humanos / Reportes a la DIAN** — `PLANILLAUNICASOI` para generar el plano que se carga a la DIAN.
- **Contabilidad** — `PROVISIONES` para conciliar lo provisionado.
- **Auditoría** — `VERTRAZABILIDADPRESTACIONSOCIAL`, `CONSULTARPRIMA`, `CONSULTARCESANTIA` para consultar histórico sin modificar.

---

## 15. Casos de uso frecuentes

1. **Liquidación de prima del primer semestre en borrador** — se procesa con `Definitiva = No`. El usuario revisa los `EmpleadoPrima` y, si todo está correcto, repite con `Definitiva = Sí` (requiere `DEFINITIVAPRIMA`).
2. **Liquidación anual de cesantías por régimen** — se ejecuta una corrida por cada `regimenLaboral` (Anterior y Nuevo) si la organización tiene ambas poblaciones.
3. **Liquidación por dependencia** — se aplica filtro de Dependencia para liquidar a un grupo específico.
4. **Cesantías individuales** — se digita el NIT del empleado en cabecera para liquidar a una sola persona.
5. **Reporte de prima pagada a un empleado** — pestaña Consulta Primas Liquidadas filtrando por NIT.
6. **Generación del plano para DIAN** — pestaña Planilla Única con periodo y tipo de planilla.
7. **Conciliación contable de provisiones** — pestaña Provisiones por mes-año.
8. **Auditoría de quién liquidó qué** — pestaña Trazabilidad muestra `Fecha Liquidación` y `Usuario Liquidación`.
9. **Descuento de crédito sobre prima/cesantía** — se reflejan en `PrimaCredito` / `CesantiasCredito`.

---

## 16. Escenarios reales

### Escenario A — Cierre de prima del primer semestre

- Mes: 30 de junio.
- Tipo de Nómina: `0001 - ADMINISTRACION`.
- Año: 2024, Semestre: 1.
- Definitiva: `No` → revisión por RRHH.
- Detectan que faltan ajustes → vuelven a correr en borrador.
- Cuando todo está OK, el aprobador (con `DEFINITIVAPRIMA`) liquida en **Definitiva = Sí**.
- Queda fila en `Nomina.Prima` con `descripcion = 'PRIMA LEGAL I SEMESTRE'` y `añoVigencia = 2024`, `semestre = 1`.
- N filas en `EmpleadoPrima`, una por empleado.

### Escenario B — Cesantías anuales con régimen mixto

- Diciembre 2024.
- Se corren **dos liquidaciones**: una con `regimenLaboral = Anterior` y otra con `regimenLaboral = Nuevo`.
- En `EmpleadoCesantia` queda `valorCesantias`, `valorIntereses` (1 % por mes trabajado) y `porcentajeIntereses`.
- Si el empleado tiene crédito, queda fila en `CesantiasCredito` con el valor descontado.

### Escenario C — Generación de planilla para la DIAN

- RRHH va a la pestaña Planilla Única.
- Filtra Periodo Pago = marzo 2024.
- Tipo Planilla = (el definido por la DIAN para el cliente).
- El sistema genera el archivo plano.
- RRHH lo carga al portal SOI / DIAN.

### Escenario D — Auditoría de un pago histórico

- Pestaña Trazabilidad → pestaña interna **Cesantías** → año 2023.
- Se muestra el listado de cesantías liquidadas, fecha de liquidación y usuario que la realizó.

---

## 17. Preguntas y respuestas frecuentes

**P: ¿Cuántas pestañas tiene el módulo?**
R: Siete: Liquidación de Prima, Consulta Primas Liquidadas, Liquidación de Cesantías, Consulta de Cesantías Liquidadas, Planilla Única, Provisiones y Trazabilidad.

**P: ¿Cuándo se liquida la prima?**
R: Por **semestre**: Semestre 1 = enero–junio; Semestre 2 = julio–diciembre.

**P: ¿Cuándo se liquidan las cesantías?**
R: **Anualmente**, según ley.

**P: ¿Cómo se calculan los intereses sobre cesantías?**
R: **1 % por mes trabajado** con relación al salario.

**P: ¿Qué diferencia hay entre liquidación borrador y definitiva?**
R: Borrador permite revisar y volver a correr el proceso. Definitiva cierra la liquidación y exige permiso específico (`DEFINITIVAPRIMA` o `DEFINITIVACESANTIA`).

**P: ¿La liquidación se puede aplicar solo a un grupo?**
R: Sí. Se puede liquidar a **toda la organización**, por **dependencia** o, con el NIT, a un **empleado** específico.

**P: ¿Cómo se manejan los créditos del empleado?**
R: Se registran filas en `Nomina.PrimaCredito` o `Nomina.CesantiasCredito`, ligadas al `EmpleadoPrima` / `EmpleadoCesantia` respectivo y al `idCredito` del módulo de créditos.

**P: ¿Qué hace la pestaña Planilla Única?**
R: Consulta los conceptos de pago de los empleados en un rango y **genera un archivo plano** que **Recursos Humanos carga en la DIAN** (PILA / SOI).

**P: ¿Para qué sirve la pestaña Provisiones?**
R: Para listar todo lo que la empresa ha provisionado en primas y cesantías por empleado.

**P: ¿Qué información trae la pestaña Trazabilidad?**
R: Histórico de liquidaciones de primas y cesantías por tipo de nómina y año, con fecha de liquidación y usuario que la ejecutó.

**P: ¿Qué pasa si un usuario no tiene `DEFINITIVAPRIMA`?**
R: Puede liquidar la prima en **borrador**, pero **no podrá marcarla como definitiva**.

**P: ¿Qué columnas describen la liquidación de prima por empleado?**
R: NIT, Descripción Empleado, Fecha Ingreso, Días Liquidados, Días Trabajados, Días Sanciones, Sueldo Básico, Aux. Transporte, Sueldo Promedio, Valor Prima.

**P: ¿Qué columnas describen la liquidación de cesantías por empleado?**
R: NIT, Descripción Empleado, Fecha Ingreso, Días Liquidación, Días Trabajados, Días Sanciones, Sueldo Básico, Aux. Transporte, Sueldo Promedio, Valor Cesantía Pagar, Valor Descuentos, Valor Intereses.

**P: ¿Qué es el "Régimen Laboral"?**
R: Indica si el empleado está bajo régimen **Anterior** o **Nuevo** (`EmpleadoCesantia.regimenLaboral`). Afecta el cálculo de cesantías.

---

## 18. Ejemplos funcionales y técnicos

> Las consultas usan los nombres de tabla del diagrama del PDF. Validar contra el modelo EDMX antes de ejecutar en producción.

### 18.1 Listar primas liquidadas de un tipo de nómina

```sql
SELECT idPrima, descripcion, añoVigencia, semestre,
       periodoInicial, periodoFinal, fechaInicial, fechaFinal,
       fechaCreacion AS fechaLiquidacion,
       idUsuarioCreacion AS usuarioLiquidacion
FROM Nomina.Prima
WHERE idTipoNomina = @idTipoNomina
ORDER BY añoVigencia DESC, semestre DESC;
```

### 18.2 Liquidación de prima de un empleado en un semestre

```sql
SELECT p.añoVigencia, p.semestre, p.descripcion,
       ep.sueldoBasico, ep.auxilioTransporte, ep.salarioPromedio,
       ep.diasTrabajador, ep.diasSanciones, ep.diasPagados,
       ep.valorPrima
FROM Nomina.Prima p
INNER JOIN Nomina.EmpleadoPrima ep
        ON ep.idPrima = p.idPrima
WHERE p.añoVigencia = @anio
  AND p.semestre    = @semestre
  AND ep.idEmpleadoSociedadNomina = @idEmpleado;
```

### 18.3 Cesantías liquidadas del año con descuentos por crédito

```sql
SELECT c.añoVigencia, c.descripcion,
       ec.idEmpleadoSociedadNomina,
       ec.regimenLaboral,
       ec.valorCesantias, ec.valorIntereses, ec.porcentajeIntereses,
       ISNULL(SUM(cc.valor), 0) AS totalDescuentosCredito
FROM Nomina.Cesantia c
INNER JOIN Nomina.EmpleadoCesantia ec
        ON ec.idCesantia = c.idCesantia
LEFT  JOIN Nomina.CesantiasCredito cc
        ON cc.idEmpleadoCesantia = ec.idEmpleadoCesantia
WHERE c.añoVigencia = @anio
GROUP BY c.añoVigencia, c.descripcion,
         ec.idEmpleadoSociedadNomina, ec.regimenLaboral,
         ec.valorCesantias, ec.valorIntereses, ec.porcentajeIntereses;
```

### 18.4 Total provisionado por empresa en primas (consulta histórica)

```sql
SELECT SUM(ep.valorPrima) AS totalPrimasLiquidadas
FROM Nomina.Prima p
INNER JOIN Nomina.EmpleadoPrima ep
        ON ep.idPrima = p.idPrima
WHERE p.añoVigencia = @anio;
```

### 18.5 Trazabilidad anual de cesantías

```sql
SELECT c.descripcion,
       c.añoVigencia,
       c.fechaInicial, c.fechaFinal,
       c.periodoInicial, c.periodoFinal,
       c.fechaCreacion AS fechaLiquidacion,
       c.idUsuarioCreacion AS usuarioLiquidacion
FROM Nomina.Cesantia c
WHERE c.idTipoNomina = @idTipoNomina
  AND c.añoVigencia  = @anio
ORDER BY c.fechaCreacion;
```

### 18.6 Validación de permisos antes de ejecutar definitiva

> Pseudo-validación funcional (la implementación real va en la capa de seguridad/UI):

```
SI usuario NO tiene permiso 'DEFINITIVAPRIMA' Y Definitiva = 'Sí':
    bloquear y mostrar mensaje "Sin permiso para liquidar en definitiva".

SI usuario NO tiene permiso 'DEFINITIVACESANTIA' Y Definitiva = 'Sí':
    bloquear y mostrar mensaje "Sin permiso para liquidar cesantías en definitiva".
```

---

## 19. Prompt base — Agente especializado en Prestaciones Sociales de Nómina

> Usar este bloque como **system prompt** del agente Claude especializado en este dominio.

```
Eres un agente experto en el módulo de PRESTACIONES SOCIALES del sistema de Nómina de
Arsys (ERP corporativo sobre .NET 4.5, WinForms + DevExpress 14.7, WCF, Entity
Framework 6 y SQL Server, BD `ArsysNominaORF`).

Tu misión es dar soporte FUNCIONAL, TÉCNICO y de SEGURIDAD del módulo a usuarios de
nómina/RRHH, contabilidad, auditoría y desarrolladores .NET.

CONTEXTO QUE DEBES ASUMIR SIEMPRE:
- El módulo es un único formulario "Prestaciones Sociales" con 7 pestañas:
  1) Liquidación de Prima
  2) Consulta Primas Liquidadas
  3) Liquidación de Cesantías
  4) Consulta de Cesantías Liquidadas
  5) Planilla Única (reporte a la DIAN)
  6) Provisiones
  7) Trazabilidad
- Cabecera común: Unidad Negocio, Tipo de Nómina, Centro Económico, NIT,
  Dependencia.
- Modelo de datos:
  * `Nomina.Prima` 1─►N `Nomina.EmpleadoPrima` 1─►N `Nomina.PrimaCredito`
  * `Nomina.Cesantia` 1─►N `Nomina.EmpleadoCesantia` 1─►N `Nomina.CesantiasCredito`
- `EmpleadoCesantia` referencia un Fondo de Cesantías vía `idTerceroSeguridadSocial`.

REGLAS DE NEGOCIO QUE DEBES APLICAR:
- Prima legal por semestre: Semestre 1 = enero–junio, Semestre 2 = julio–diciembre.
- Cesantías anuales por ley.
- Intereses de cesantías = 1 % por mes trabajado relativo al salario.
- Liquidación en Borrador o Definitiva; Definitiva exige permisos
  `DEFINITIVAPRIMA` / `DEFINITIVACESANTIA`.
- Régimen laboral en cesantías: Anterior o Nuevo (campo `regimenLaboral`).
- Aplica a toda la organización, por dependencia o por empleado (NIT).
- Convención global de conceptos en Nómina: `P*` = pagos, `D*` = descuentos.

PERMISOS QUE DEBES CONOCER:
- LIQUIDARPRIMA, CONSULTARPRIMA, LIQUIDARCESANTIA, CONSULTARCESANTIA,
  PLANILLAUNICASOI, PROVISIONES, VERTRAZABILIDADPRESTACIONSOCIAL,
  DEFINITIVAPRIMA, DEFINITIVACESANTIA.
- Los permisos LIQUIDAR/CONSULTAR/PLANILLA/PROVISIONES/TRAZABILIDAD controlan la
  visibilidad de pestañas. Los permisos DEFINITIVA* son permisos de validación al
  cerrar la liquidación.

CÓMO RESPONDER:
- Responde SIEMPRE en español, tono empresarial, claro y directo.
- Si la pregunta es funcional: explica pestañas, campos, flujo y reglas.
- Si la pregunta es técnica: usa las 6 tablas del modelo, explica cardinalidades
  y muestra SQL si aplica. Advierte que los nombres deben validarse contra el
  EDMX antes de programar.
- Si la pregunta es de seguridad: lista los permisos relevantes y aclara qué hace
  cada uno.
- Si te piden algo que NO está en el documento, dilo explícitamente:
  "Pendiente de documentar — habría que validarlo en el EDMX/código".
- No inventes campos, conceptos, fórmulas o procedimientos almacenados.
- Cuando el usuario sea desarrollador .NET, respeta las convenciones de Arsys:
  N capas + DDD, repositorios `IRepositorio*`/`Repositorio*`, dominios
  `IDominioContrato*`/`Dominio*`, servicios WCF `IServicios*Arsys`, multi-tenancy
  por empresa. No rompas compatibilidad WCF.

LO QUE DEBES PODER HACER:
1. Explicar el funcionamiento del módulo y de cada pestaña.
2. Resolver dudas funcionales del proceso.
3. Explicar reglas de negocio (semestre, anualidad, intereses 1 %, definitiva,
   régimen).
4. Explicar qué hace cada campo y su mapeo a las tablas Prima / EmpleadoPrima /
   PrimaCredito / Cesantia / EmpleadoCesantia / CesantiasCredito.
5. Explicar las relaciones entre tablas y la cardinalidad 1─►N.
6. Explicar la seguridad: los 9 permisos del módulo.
7. Inferir roles típicos (Liquidador, Aprobador, RRHH/DIAN, Contabilidad,
   Auditoría) a partir de los permisos.
8. Ayudar a interpretar registros de las tablas y a generar consultas SQL de
   soporte (consulta histórica, totales por año/semestre, descuentos por
   créditos, trazabilidad).
9. Explicar la generación de la Planilla Única para la DIAN.
10. Guiar el flujo de borrador → definitiva, recordando los permisos requeridos.
```

---

## Mantenimiento y evolución de la Skill

Esta Skill fue construida inicialmente a partir de contextualización textual, conocimiento funcional del negocio y documentación funcional y técnica disponible, pero está diseñada para evolucionar continuamente.

### Reglas de mantenimiento

- La documentación inicial corresponde a la fuente original usada para crear esta Skill (`PrestacionesSociales.pdf`).
- Esta Skill puede enriquecerse posteriormente con:
  - nuevos documentos funcionales,
  - cambios del sistema,
  - nuevas reglas de negocio,
  - cambios en formularios,
  - nuevas tablas o cambios en SQL Server,
  - nuevos permisos o roles,
  - decisiones del negocio,
  - casos reales encontrados en soporte.
- Toda nueva información agregada debe:
  - mantener consistencia con la estructura actual,
  - indicar fecha de actualización,
  - indicar fuente del cambio,
  - no eliminar conocimiento previo sin validación funcional.

### Historial de actualizaciones

| Fecha | Fuente | Cambio realizado | Responsable |
| ----- | ------ | ---------------- | ----------- |
| 2026-05-08 | `PrestacionesSociales.pdf` | Creación inicial de la Skill (7 pestañas, 6 tablas del modelo Prima/Cesantia, 9 permisos, roles inferidos, prompt base). | Ferney Acosta |

### Información pendiente

Marcar como **Pendiente de documentar** cualquier información que aún no exista o no haya sido documentada. No usar la frase "no documentado en la fuente": esta Skill debe poder evolucionar con nuevas fuentes.

Pendientes actuales por validar contra BD / código de dominio:

- Tabla(s) que respaldan **Provisiones** y **Conceptos para Planilla Única** — **Pendiente de documentar**.
- Procedimientos almacenados que ejecutan los cálculos de prima y cesantías — **Pendiente de documentar**.
- Catálogo exacto de **Tipo Planilla** y **Código AFP** en Planilla Única — **Pendiente de documentar**.
- Catálogo exacto de **Tipo Modelo** en Provisiones — **Pendiente de documentar**.
- Definición exacta del **archivo plano** que se carga a la DIAN (formato, columnas, separador) — **Pendiente de documentar**.
- Cómo se marca operativamente una liquidación como **Definitiva** dentro de las tablas `Nomina.Prima` / `Nomina.Cesantia` (¿columna implícita en `descripcion` o en otra tabla?) — **Pendiente de documentar**.

> Cuando se actualice la Skill: si cambian semestres, porcentaje de intereses, permisos, columnas de las tablas o el esquema del plano DIAN, reflejarlo aquí, agregar la fila correspondiente al **Historial de actualizaciones** y avisar a los suplentes del dominio.
