---
name: nomina-novedades
display_name: Novedades de Nómina (Arsys)
owner: ferney
domain: Nómina
modulo: Novedades
ambito: Funcional + Técnico
fuente: Documento "Novedades.pdf" (módulo Nómina, BD ArsysNominaORF)
descripcion: Skill empresarial para soporte funcional y técnico del módulo Novedades del sistema de Nómina (formulario individual + carga masiva por plano), su impacto en liquidación y su modelo en SQL Server.
---

# Skill — Novedades de Nómina

Skill orientada a soporte funcional y técnico del módulo **Novedades** del sistema de **Nómina** de Arsys. Cubre el formulario individual, el formulario de **Novedades Masivas por Plano**, la tabla `Nomina.Novedad` y sus relaciones en la base de datos `ArsysNominaORF`, y cómo las novedades impactan los procesos de liquidación.

> Esta Skill se basa **únicamente** en el documento `Novedades.pdf`. Cualquier dato que no esté en el documento queda marcado como _"Pendiente de documentar"_.

---

## 1. Descripción funcional del módulo

El módulo de **Novedades** es la parte funcional de Nómina con la que se **liquida la nómina de toda la organización a nivel nacional**. A través de él se registran, por empleado, los movimientos que afectan el cálculo de nómina, contratos y vacaciones.

Existen **dos formularios** que alimentan la misma tabla de novedades:

1. **Novedades** — captura individual por empleado.
2. **Novedades Masivas por Plano** — carga masiva desde un archivo plano para múltiples empleados a la vez.

Ambos formularios persisten en la **misma tabla** (`Nomina.Novedad`); la diferencia es que las cargadas por plano se marcan como tales.

### Propósito del formulario individual

Crear **Novedades de Pago Directa** al empleado, ya sea por **valor** o por **porcentaje**, considerando que la liquidación de nómina se da bajo el concepto de **pago de novedades**. Pueden registrarse tanto **pagos** como **descuentos**, por ejemplo:

- Pago por una **cuenta por pagar pendiente**.
- Pago de un **bono**.
- **Ajustes a cesantías o primas**.
- Cualquier **adicional de pago o descuento** aplicable al empleado.

### Propósito del formulario masivo

Cargar masivamente, mediante un archivo plano, todas las novedades a crear para múltiples empleados, indicando para cada línea: periodo, cédula, código de concepto, tipo (valor u hora) y el valor de la novedad.

---

## 2. Contexto del negocio

- La **liquidación de nómina** se ejecuta sobre el **concepto de pago de novedades**: cada novedad registrada está atada a un **concepto de nómina** que define si es pago o descuento, y cómo entra al cálculo.
- Las novedades influyen directamente en el **pago total de nómina** del empleado.
- Los procesos que **dependen de las novedades** son:
  - Liquidación de **nómina**.
  - Liquidación de **contrato**.
  - Liquidación de **vacaciones**.
- La operación es **nacional**: el módulo soporta la liquidación de toda la organización.

### Tipos de valor admitidos

Una novedad puede registrarse como:

- **Valor** — monto numérico, almacenado como `numeric(18,2)`.
- **Horas** — cantidad de horas asociadas a la novedad.
- **Porcentaje** — mencionado en el documento como una de las formas de capturar la novedad de pago directa.

### Equivalencia legal de horas día → horas mes

El documento define que **1 día de trabajo era normalmente 8 horas**, pero por ley se hace una **disminución gradual** hasta 7 horas. La tabla de equivalencias documentada es:

| Horas día | Total mes |
|-----------|-----------|
| 8         | 240       |
| 7.83      | 235       |
| 7.67      | 230       |
| 7.33      | 220       |
| 7         | 210       |

Esta tabla se usa para convertir horas día → horas mes cuando la novedad se carga por horas.

---

## 3. Reglas de negocio

> Las reglas siguientes están explícitas en el documento, salvo la convención `P*`/`D*` que es regla operativa confirmada por el dueño del dominio (Ferney).

### 3.1 Convención de conceptos (clave)

- Conceptos cuyo código **inicia con `P`** → representan **PAGOS**.
- Conceptos cuyo código **inicia con `D`** → representan **DESCUENTOS**.

> Ejemplos del propio plano del documento: `P016`, `P017`, `P019` → todos pagos.

### 3.2 Reglas funcionales

1. Toda novedad se asocia a **un empleado** (vía contrato) y a **un concepto de nómina**.
2. Una novedad se captura por **valor**, **horas** o **porcentaje**.
3. Si es por valor → se graba en `valor` con tipo `numeric(18,2)`.
4. Si es por horas → se graba en `valor` la cantidad de horas (interpretando con la tabla horas día/mes).
5. La novedad debe tener **fecha de creación**, **fecha inicial** y **fecha final**.
6. Una novedad puede ser un **pago** (cuenta por pagar, bono, ajuste de cesantías/primas, adicional) o un **descuento**.
7. Las novedades cargadas masivamente por plano se **marcan** como tal en la tabla, pero conviven con las individuales en la misma tabla `Nomina.Novedad`.
8. La novedad puede afectar tres liquidaciones distintas: **nómina**, **contrato** y **vacaciones**, dependiendo del concepto y de la relación con `LiquidacionDetalle`, `LiquidacionContratoDetalle` o `LiquidacionDetalleVacaciones`.

### 3.3 Reglas del archivo plano (carga masiva)

Estructura por línea (separador **`;`**), 6 columnas:

| Columna | Significado |
|---------|-------------|
| 1 | Secuencial / consecutivo de la línea |
| 2 | **Periodo** (ej. `20161001`) |
| 3 | **Cédula del empleado** |
| 4 | **Código del concepto** (ej. `P016`) |
| 5 | **V** (valor) o **H** (hora) |
| 6 | **Valor de la novedad** |

Ejemplo real del documento:

```
1;20161001;7724424;P016;H;2
1;20161001;60217368;P016;H;66
1;20161001;80397161;P016;H;116
1;20161001;94041390;P016;H;8
1;20161001;1075211478;P016;H;82
1;20161001;1130647553;P016;H;8
1;20161001;80397161;P017;H;16
1;20161001;1075211478;P017;H;5
1;20161001;60217368;P019;H;12
1;20161001;80397161;P019;H;20
1;20161001;1075211478;P019;H;9
```

> **El separador de columnas debe ser `;`** (regla explícita del documento).

---

## 4. Flujo operativo

### 4.1 Flujo — Captura individual (formulario "Novedades")

1. Abrir el formulario **Novedades** dentro de **Arsys Nómina**.
2. Seleccionar **Tipo Nómina** (ej. `0001 - ADMINISTRACION`).
3. Seleccionar **Mes** del periodo (ej. Febrero) y **Fecha Inicial / Fecha Final**.
4. Seleccionar **Trabajador** (empleado a quien se le aplica la novedad).
5. Estando en la pestaña **"Ingresar Novedad"**:
   - Elegir **Concepto Novedad** (pago `P*` o descuento `D*`).
   - Indicar **Tipo** (valor u horas; o porcentaje según el caso).
   - Capturar **Valor** y, cuando aplique, **Periodo / Observaciones**.
6. **Guardar** la novedad. Queda registrada en `Nomina.Novedad`.
7. La novedad pasa a influir en la liquidación del empleado para ese periodo.

Botones disponibles en el formulario: **Nuevo, Guardar, Buscar, PdfImage, Manuales, Acción, Salir** (según barra superior del formulario).

### 4.2 Flujo — Carga masiva (formulario "Novedades Masivas por Plano")

1. Abrir el formulario **Novedades Masivas por Plano**.
2. Seleccionar **Tipo Nómina**, **Periodo Nómina**, **Periodo Próximo**.
3. **Adjuntar archivo** plano `.txt`/`.csv` con separador `;` siguiendo la estructura de 6 columnas.
4. Revisar pestaña **"Ejemplo Plano Novedades"** si se necesita guía.
5. Validar en **"Previsualización"** los datos del plano antes de procesar.
6. Procesar la carga.
7. Las novedades quedan en `Nomina.Novedad` marcadas como cargadas por plano.
8. Revisar **"Lista de Cambios"** para ver el resultado.

Botones disponibles: **Nuevo, Manuales, Ayuda, Salir**.

---

## 5. Explicación técnica básica

### 5.1 Tabla principal — `Nomina.Novedad`

| Columna | Tipo | Nulos | Rol |
|---|---|---|---|
| `idNovedad` | `bigint` | NO | PK de la novedad |
| `idTipoNovedad` | `int` | NO | FK a `Nomina.TipoNovedad` |
| `idContrato` | `int` | SÍ | Empleado/contrato al que aplica |
| `idContratoDetalle` | `int` | NO | Detalle de contrato afectado |
| `idConceptoNomina` | `bigint` | NO | FK a `Nomina.ConceptoNomina` (define pago/descuento) |
| `idSolicitudVacaciones` | `int` | SÍ | FK a `Nomina.SolicitudVacaciones` (si la novedad nace de vacaciones) |
| `idCredito` | `bigint` | SÍ | FK a `Nomina.Credito` (si la novedad descuenta un crédito) |
| `fecha` | `date` | SÍ | Fecha de la novedad |
| `fechaInicial` | `date` | SÍ | Inicio de vigencia |
| `fechaFinal` | `date` | NO | Fin de vigencia |
| `valor` | `numeric(18,2)` | NO | Valor de la novedad (monto u horas, según `tipoValor`) |
| `valorBase` | `numeric(18,2)` | NO | Valor base usado para el cálculo |
| `tipoValor` | `int` | NO | Distingue valor / horas / porcentaje |
| `pendiente` | `smallint` | NO | Estado pendiente de aplicación |
| `descripcion` | `varchar(100)` | SÍ | Texto descriptivo / observaciones |
| `estado` | `bit` | NO | Activo/Inactivo |
| `acumulada` | `bit` | SÍ | Indica si la novedad ya fue acumulada en una liquidación |
| `fechaCreacion` | `datetime` | NO | Auditoría |
| `fechaModificacion` | `datetime` | NO | Auditoría |
| `idUsuarioCreacion` | `int` | NO | Auditoría |
| `idUsuarioModificacion` | `int` | NO | Auditoría |
| `idSesionUsuario` | `bigint` | NO | Auditoría |
| `idFormulario` | `int` | NO | Formulario origen (permite distinguir captura individual vs. masiva por plano) |

> Los nombres y tipos provienen del diagrama del PDF. El significado funcional de `tipoValor`, `pendiente`, `estado`, `acumulada` e `idFormulario` se infiere del contexto y deberá confirmarse contra los catálogos reales si se va a programar lógica nueva sobre ellos.

### 5.2 Mapeo Formulario ↔ Tabla

| Campo del formulario | Columna en `Nomina.Novedad` |
|---|---|
| Tipo Nómina | (cabecera de selección, no se almacena directamente en `Novedad`) |
| Mes / Fecha Inicial / Fecha Final | `fechaInicial`, `fechaFinal`, `fecha` |
| Trabajador | `idContrato` / `idContratoDetalle` |
| Concepto Novedad | `idConceptoNomina` |
| Tipo (V/H/%) | `tipoValor` |
| Valor / Horas | `valor` |
| Valor Base | `valorBase` |
| Observaciones | `descripcion` |
| Origen (individual o plano) | `idFormulario` |
| Auditoría (usuario/fecha) | `fechaCreacion`, `fechaModificacion`, `idUsuarioCreacion`, `idUsuarioModificacion`, `idSesionUsuario` |

---

## 6. Relación con SQL Server (`ArsysNominaORF`)

Diagrama del documento — tabla central `Nomina.Novedad` con relaciones a:

- **`Nomina.TipoNovedad`** — clasifica la novedad (vía `idTipoNovedad`).
- **`Nomina.ConceptoNomina`** — concepto de nómina al que se carga (pago `P*` o descuento `D*`) (vía `idConceptoNomina`).
- **`Nomina.ContratoDetalle`** — detalle de contrato del empleado (vía `idContratoDetalle`).
- **`Nomina.SolicitudVacaciones`** — origen cuando la novedad proviene de una solicitud de vacaciones (vía `idSolicitudVacaciones`).
- **`Nomina.Credito`** — cuando la novedad descuenta un crédito (vía `idCredito`).
- **`Nomina.Incapacidad`** — relación con incapacidades del empleado.
- **`Nomina.LiquidacionDetalle`** — detalle de liquidación de **nómina** que consume la novedad.
- **`Nomina.LiquidacionContratoDetalle`** — detalle de liquidación de **contrato** que consume la novedad.
- **`Nomina.LiquidacionDetalleVacaciones`** — detalle de liquidación de **vacaciones** que consume la novedad.

### Mapa lógico

```
            TipoNovedad ──┐
                          │
         Credito ─────────┤
                          │
SolicitudVacaciones ──────┤
                          │
   ContratoDetalle ───────┼──►  Nomina.Novedad  ◄── ConceptoNomina
                          │           │
        Incapacidad ──────┘           │
                                      ├──► LiquidacionDetalle           (Nómina)
                                      ├──► LiquidacionContratoDetalle  (Contrato)
                                      └──► LiquidacionDetalleVacaciones (Vacaciones)
```

### Procesos de liquidación afectados

Toda novedad puede llegar a uno o varios de estos detalles según su naturaleza:

1. **Liquidación de nómina** → `LiquidacionDetalle`.
2. **Liquidación de contrato** → `LiquidacionContratoDetalle`.
3. **Liquidación de vacaciones** → `LiquidacionDetalleVacaciones`.

> Las relaciones a `Incapacidad`, `Credito` y `SolicitudVacaciones` indican **orígenes** posibles de la novedad (la novedad puede nacer porque hay un crédito a descontar, una solicitud de vacaciones aprobada o una incapacidad a procesar).

---

## 7. Casos de uso frecuentes

1. **Bono extraordinario a un empleado**: capturar novedad de pago con un concepto `P*` por valor.
2. **Descuento por cuota de crédito**: novedad asociada a `idCredito` con concepto `D*`.
3. **Pago de horas extras**: novedad por horas (`tipoValor` = horas), usando la tabla de equivalencia horas día/mes.
4. **Ajuste a cesantías o primas**: novedad de pago con concepto `P*` específico de ajuste.
5. **Descuento por novedad de ausencia**: novedad de descuento `D*` ligada a la incapacidad o ausencia.
6. **Carga masiva mensual de horas extras**: archivo plano con líneas tipo `1;20161001;<cédula>;P016;H;<horas>` para múltiples empleados.
7. **Novedad originada en solicitud de vacaciones**: la novedad queda con `idSolicitudVacaciones` poblado y alimenta `LiquidacionDetalleVacaciones`.
8. **Verificación de que la novedad ya fue liquidada**: revisar el campo `acumulada`.

---

## 8. Preguntas y respuestas frecuentes

**P: ¿Dónde se almacenan las novedades creadas desde el formulario individual y desde el plano masivo?**
R: En la misma tabla `Nomina.Novedad`. Las cargadas por plano quedan **marcadas** como tal (típicamente vía `idFormulario` u otro indicador en la fila).

**P: ¿Qué diferencia un pago de un descuento?**
R: El **concepto de nómina** asociado. Por convención del sistema, los códigos que inician con `P` son pagos y los que inician con `D` son descuentos.

**P: ¿En qué formas se puede capturar el valor de una novedad?**
R: Por **valor** (monto), por **horas** o por **porcentaje**. Internamente `tipoValor` distingue el caso, y `valor` guarda el número (monto u horas).

**P: ¿Qué tipo de dato tiene el campo de valor?**
R: `numeric(18,2)` — tanto `valor` como `valorBase`.

**P: ¿Cuántas horas día se usan hoy para convertir a horas mes?**
R: La ley impone una disminución gradual de 8 a 7 horas día. La tabla documentada es: 8→240, 7.83→235, 7.67→230, 7.33→220, 7→210.

**P: ¿Qué procesos de liquidación se ven afectados por una novedad?**
R: Tres: **liquidación de nómina** (`LiquidacionDetalle`), **liquidación de contrato** (`LiquidacionContratoDetalle`) y **liquidación de vacaciones** (`LiquidacionDetalleVacaciones`).

**P: ¿Cuál es el separador del archivo plano?**
R: **Punto y coma `;`** (regla explícita del documento).

**P: ¿Qué columnas tiene el plano y en qué orden?**
R: 6 columnas: consecutivo, periodo, cédula del empleado, código del concepto, V/H, valor.

**P: ¿Cómo sé si una novedad ya entró en una liquidación?**
R: Por el campo `acumulada` en `Nomina.Novedad` (bit), y por la existencia de un registro asociado en alguno de los detalles de liquidación.

**P: ¿Una novedad puede originarse automáticamente desde otro proceso?**
R: Sí: las relaciones con `Incapacidad`, `Credito` y `SolicitudVacaciones` permiten que la novedad nazca a partir de esos procesos, no solo de captura manual.

**P: ¿Qué pasa si una novedad tiene `pendiente > 0`?**
R: Indica que aún tiene saldo o aplicaciones por procesar — interpretación a confirmar con la lógica de dominio cuando se programe sobre este campo.

---

## 9. Ejemplos de consultas y escenarios reales

> Las consultas usan los nombres de tabla que aparecen en el diagrama (`Nomina.Novedad`, `Nomina.ConceptoNomina`, `Nomina.ContratoDetalle`, etc.). Validar nombres exactos contra el modelo EDMX antes de ejecutar en producción.

### 9.1 Listar novedades de un empleado en un periodo

```sql
SELECT n.idNovedad, n.fecha, n.fechaInicial, n.fechaFinal,
       cn.codigo  AS codigoConcepto,
       cn.nombre  AS concepto,
       n.valor, n.valorBase, n.tipoValor, n.estado, n.acumulada
FROM Nomina.Novedad n
INNER JOIN Nomina.ConceptoNomina cn
        ON cn.idConceptoNomina = n.idConceptoNomina
INNER JOIN Nomina.ContratoDetalle cd
        ON cd.idContratoDetalle = n.idContratoDetalle
WHERE cd.idEmpleado = @idEmpleado
  AND n.fechaInicial >= @inicio
  AND n.fechaFinal   <= @fin
  AND n.estado = 1
ORDER BY n.fecha DESC;
```

### 9.2 Separar pagos vs. descuentos por convención `P*` / `D*`

```sql
SELECT
    SUM(CASE WHEN cn.codigo LIKE 'P%' THEN n.valor ELSE 0 END) AS totalPagos,
    SUM(CASE WHEN cn.codigo LIKE 'D%' THEN n.valor ELSE 0 END) AS totalDescuentos
FROM Nomina.Novedad n
INNER JOIN Nomina.ConceptoNomina cn
        ON cn.idConceptoNomina = n.idConceptoNomina
WHERE n.fechaInicial >= @inicio
  AND n.fechaFinal   <= @fin
  AND n.estado = 1;
```

### 9.3 Novedades aún no acumuladas en liquidación

```sql
SELECT n.idNovedad, n.idContratoDetalle, n.idConceptoNomina,
       n.valor, n.fechaInicial, n.fechaFinal
FROM Nomina.Novedad n
WHERE ISNULL(n.acumulada, 0) = 0
  AND n.estado   = 1
  AND n.pendiente > 0;
```

### 9.4 Novedades originadas por solicitud de vacaciones

```sql
SELECT n.idNovedad, sv.idSolicitudVacaciones, n.valor, n.fechaInicial, n.fechaFinal
FROM Nomina.Novedad n
INNER JOIN Nomina.SolicitudVacaciones sv
        ON sv.idSolicitudVacaciones = n.idSolicitudVacaciones
WHERE n.idSolicitudVacaciones IS NOT NULL;
```

### 9.5 Novedades que descuentan un crédito

```sql
SELECT n.idNovedad, c.idCredito, n.valor, n.fechaInicial, n.fechaFinal
FROM Nomina.Novedad n
INNER JOIN Nomina.Credito c
        ON c.idCredito = n.idCredito
WHERE n.idCredito IS NOT NULL;
```

### 9.6 Validación previa a importar el plano

Antes de procesar el archivo plano, validar por línea:

- 6 columnas separadas por `;`.
- Periodo en formato esperado (ej. `AAAAMMNN`).
- La cédula corresponde a un contrato vigente.
- El concepto existe en `Nomina.ConceptoNomina` y empieza por `P` o `D`.
- La columna 5 contiene **únicamente** `V` o `H`.
- La columna 6 es numérica y, si es horas, coherente con la tabla horas día/mes.

---

## 10. Prompt base — Agente especializado en Novedades de Nómina

> Usar este bloque como **system prompt** del agente Claude especializado en este dominio.

```
Eres un agente experto en el módulo de NOVEDADES del sistema de Nómina de Arsys (ERP corporativo
sobre .NET 4.5, WinForms + DevExpress 14.7, WCF, Entity Framework 6 y SQL Server).

Tu misión es dar soporte FUNCIONAL y TÉCNICO sobre el módulo de Novedades a usuarios de negocio,
analistas funcionales y desarrolladores .NET.

CONTEXTO QUE DEBES ASUMIR SIEMPRE:
- El módulo Novedades alimenta la liquidación de nómina nacional.
- Existen dos formularios que escriben en la MISMA tabla `Nomina.Novedad`:
  1) Formulario individual "Novedades".
  2) Formulario "Novedades Masivas por Plano" (archivo plano, separador `;`, 6 columnas:
     consecutivo, periodo, cédula, código de concepto, V/H, valor).
- Una novedad se registra por VALOR, HORAS o PORCENTAJE.
- Tabla central: `Nomina.Novedad` (PK `idNovedad`). Campos clave: `idTipoNovedad`,
  `idContrato`, `idContratoDetalle`, `idConceptoNomina`, `idSolicitudVacaciones`,
  `idCredito`, `fecha`, `fechaInicial`, `fechaFinal`, `valor numeric(18,2)`,
  `valorBase numeric(18,2)`, `tipoValor`, `pendiente`, `descripcion`, `estado`,
  `acumulada`, auditoría (`fechaCreacion`, `fechaModificacion`, `idUsuarioCreacion`,
  `idUsuarioModificacion`, `idSesionUsuario`, `idFormulario`).
- Relaciones: `TipoNovedad`, `ConceptoNomina`, `ContratoDetalle`, `SolicitudVacaciones`,
  `Credito`, `Incapacidad` (orígenes); `LiquidacionDetalle`, `LiquidacionContratoDetalle`,
  `LiquidacionDetalleVacaciones` (consumidoras).
- Procesos de liquidación afectados: nómina, contrato y vacaciones.

REGLAS DE NEGOCIO QUE DEBES APLICAR:
- Conceptos cuyo código inicia con `P` → PAGOS.
- Conceptos cuyo código inicia con `D` → DESCUENTOS.
- El separador del plano masivo es `;`.
- Tabla horas día → mes: 8→240, 7.83→235, 7.67→230, 7.33→220, 7→210.
- `valor` y `valorBase` son `numeric(18,2)`.

CÓMO RESPONDER:
- Responde SIEMPRE en español, con tono empresarial, claro y directo.
- Si la pregunta es funcional, explica qué hace el formulario, qué campo se usa y cómo
  impacta la liquidación.
- Si la pregunta es técnica, explica con la tabla `Nomina.Novedad` y sus relaciones, y
  muestra SQL cuando aplique. Usa los nombres de tabla del modelo y advierte que deben
  validarse contra el EDMX si se va a programar.
- Si la pregunta involucra el plano masivo, recuerda la estructura de 6 columnas y el
  separador `;`.
- Si te piden algo que NO está en el documento fuente, dilo explícitamente:
  "Pendiente de documentar — habría que validarlo en el EDMX/código".
- No inventes campos, conceptos ni reglas. No asumas comportamiento de columnas
  (`tipoValor`, `pendiente`, `idFormulario`, `acumulada`) si la pregunta exige
  precisión: pide confirmación contra el catálogo o el código de dominio.
- Cuando el usuario sea desarrollador, respeta las convenciones del ERP Arsys:
  arquitectura N capas + DDD, repositorios `IRepositorio*`/`Repositorio*`, dominios
  `IDominioContrato*`/`Dominio*`, servicios WCF `IServicios*Arsys`, multi-tenancy por
  empresa. No rompas compatibilidad con servicios WCF existentes.

LO QUE DEBES PODER HACER:
1. Explicar el funcionamiento del formulario Novedades y del formulario masivo.
2. Resolver dudas funcionales del usuario de nómina.
3. Explicar reglas de negocio (P/D, valor/horas/%, separador, equivalencias horas).
4. Explicar qué hace cada campo del formulario y su mapeo a `Nomina.Novedad`.
5. Explicar cómo afectan las novedades la nómina, contrato y vacaciones.
6. Diferenciar conceptos de pago y descuento.
7. Ayudar a interpretar registros de `Nomina.Novedad` y sus tablas relacionadas.
8. Guiar en el flujo operativo (captura individual y carga masiva por plano).
9. Generar consultas SQL de soporte (listar, totalizar, validar acumuladas, etc.).
10. Validar archivos planos antes de la carga.
```

---

## Mantenimiento y evolución de la Skill

Esta Skill fue construida inicialmente a partir de contextualización textual, conocimiento funcional del negocio y documentación funcional y técnica disponible, pero está diseñada para evolucionar continuamente.

### Reglas de mantenimiento

- La documentación inicial corresponde a la fuente original usada para crear esta Skill (`Novedades.pdf` + convención `P*`/`D*` provista por Ferney).
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
| 2026-05-08 | `Novedades.pdf` | Creación inicial de la Skill (formulario individual, novedades masivas por plano, tabla `Nomina.Novedad`, relaciones, prompt base). | Ferney Acosta |

### Información pendiente

Marcar como **Pendiente de documentar** cualquier información que aún no exista o no haya sido documentada. No usar la frase "no documentado en la fuente": esta Skill debe poder evolucionar con nuevas fuentes.

Pendientes actuales por validar contra EDMX / código de dominio:

- Valores exactos del catálogo de `tipoValor` (¿1 = valor, 2 = horas, 3 = %?) — **Pendiente de documentar**.
- Semántica precisa de `pendiente`, `acumulada`, `idFormulario` en `Nomina.Novedad` — **Pendiente de documentar**.
- Nombres exactos de columnas FK (por ejemplo `idEmpleado` en `ContratoDetalle`) — **Pendiente de documentar**.

> Cuando se actualice la Skill: si cambian conceptos, columnas del plano o equivalencias horas día/mes, reflejarlo aquí, agregar la fila correspondiente al **Historial de actualizaciones** y avisar a los suplentes del dominio.
