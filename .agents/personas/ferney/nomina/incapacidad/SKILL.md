---
name: nomina-incapacidades
display_name: Incapacidades de Nómina (Arsys)
owner: ferney
domain: Nómina
modulo: Incapacidad
ambito: Funcional + Técnico
fuente: Documento "Incapacidad.pdf" (módulo Nómina, BD ArsysNominaORF)
descripcion: Skill empresarial para soporte funcional y técnico del proceso de Incapacidades del sistema de Nómina, incluyendo formulario, reglas de pago empresa/EPS, tablas Nomina.Incapacidad / Nomina.IncapacidadDetalle y el procedimiento SpCalcularIncapacidadAPagarEmpleadoV2.
---

# Skill — Incapacidades de Nómina

Skill orientada a soporte **funcional y técnico** del proceso de **Incapacidades** del sistema de Nómina de Arsys. Cubre:

- El formulario **Incapacidad** (información general + detalle).
- Los **tipos de incapacidad** soportados.
- Las **reglas de pago** entre empresa y EPS.
- Los **conceptos de nómina** asociados (`P048`, `P028`).
- Las **tablas SQL Server** `Nomina.Incapacidad` y `Nomina.IncapacidadDetalle` y sus relaciones.
- El **procedimiento almacenado** `SpCalcularIncapacidadAPagarEmpleadoV2` que ejecuta el cálculo.
- La **integración con Novedades** vía el campo `idNovedad`.

> Esta Skill se basa **únicamente** en el documento `Incapacidad.pdf`. Cualquier dato no presente en la fuente queda señalado como _"no documentado en la fuente"_.

---

## 1. Descripción funcional del módulo

El formulario **Incapacidad** registra **todas las incapacidades que un empleado puede llegar a tener**. Permite capturar la cabecera de la incapacidad y, al pulsar **Calcular**, el sistema **detalla** los periodos a incapacitarse y los conceptos de nómina aplicables.

Está integrado con el módulo de **Novedades**: cada incapacidad puede generar una novedad asociada (relación vía `idNovedad`) que entra en la **liquidación de nómina** del empleado.

Los **tipos de incapacidad** soportados son:

1. **Incapacidad General**
2. **Accidente Laboral**
3. **Licencia Maternidad**
4. **Licencia Paternidad**
5. **Enfermedad Profesional**

---

## 2. Contexto del negocio

- En Colombia, el pago de una incapacidad se reparte entre **empresa**, **EPS** y, según el caso, **ARL** o **Fondo de Pensiones (FP)**.
- En la lógica documentada del sistema:
  - **Los primeros 2 días** los **paga la empresa** con el concepto **`P048 - Incapacidad de 1 a 2 días`**.
  - **Del día 3 en adelante** los paga la **EPS** con el concepto **`P028 - Incapacidad EPS`** al **66.66 % del pago total**.
- Por la naturaleza del pago a terceros parafiscales, la tabla `Nomina.Incapacidad` mantiene referencias a tres terceros parafiscales: **EPS**, **ARL** y **FP** (`idTerceroParaFiscalEPS`, `idTerceroParaFiscalARL`, `idTerceroParaFiscalFP`).
- El proceso es **crítico** porque toca la liquidación, los costos para la empresa y los recobros a la EPS/ARL.

---

## 3. Objetivo del proceso

1. **Registrar** la incapacidad de un empleado con todos sus datos legales (serie, número, diagnóstico, médico, municipio, prórroga, fechas, tipo).
2. **Calcular automáticamente** el detalle: días por concepto y valores que paga la empresa vs. la EPS.
3. **Generar la novedad** correspondiente para que entre en la liquidación de nómina.
4. **Soportar prórrogas**: identificar y enlazar incapacidades que continúan a otra anterior.
5. Servir como base para el **recobro** posterior a EPS/ARL.

---

## 4. Flujo operativo detallado

### 4.1 Captura de la cabecera (pestaña "Información General")

1. Abrir formulario **Incapacidad** dentro de **Arsys Nómina**.
2. Seleccionar el **Tipo Incapacidad** (General, Accidente Laboral, Licencia Maternidad, Licencia Paternidad, Enfermedad Profesional).
3. Seleccionar el **Empleado** al que se le aplica.
4. Diligenciar los datos de la incapacidad:
   - **Serie** y **Número** del documento.
   - **Diagnóstico** (`idDiagnostico`) y concepto del diagnóstico a aplicar.
   - **Prórroga** (Sí/No). Si es prórroga, asociar la **incapacidad principal** (`idIncapacidadPrincipal`) — la incapacidad anterior que se está prorrogando.
   - **Municipio** y **Fecha de expedición**.
   - **Tipo**: Ambulatoria u Hospitalaria.
   - **Fecha Inicio** y **Fecha Final** de la incapacidad.
   - **Código del médico**.
   - **Observación**.

### 4.2 Cálculo del detalle (botón **Calcular**)

5. Pulsar el botón **Calcular**.
6. El sistema invoca la lógica de cálculo (procedimiento `SpCalcularIncapacidadAPagarEmpleadoV2`).
7. El resultado se observa en la pestaña **Detalle Incapacidad**:
   - Los **periodos** en que el empleado estará incapacitado.
   - Los **conceptos** aplicables a cada periodo (`P048` los primeros 2 días, `P028` del día 3 en adelante).
   - Los **valores** a pagar (`valor`) y la **base** del cálculo (`valorBase`).
   - Los **días** y **días a pagar** por concepto.

### 4.3 Persistencia y vínculo con Nómina

8. **Guardar** la incapacidad → se persiste en `Nomina.Incapacidad`.
9. El detalle se persiste en `Nomina.IncapacidadDetalle`.
10. La incapacidad genera una **novedad** asociada (`idNovedad`) que entra a la liquidación de nómina del periodo.

### 4.4 Botones del formulario

Barra superior visible: **Nuevo, Guardar, Modificar, Eliminar, Buscar, Reportes, Refrescar, Manuales, Ayuda, Salir**.

---

## 5. Reglas de negocio

### 5.1 Reglas de pago empresa vs. EPS

- **Días 1 y 2** → concepto **`P048 - Incapacidad de 1 a 2 días`** → asume la **empresa**.
- **Día 3 en adelante** → concepto **`P028 - Incapacidad EPS`** → asume la **EPS** al **66.66 %** del pago total.

### 5.2 Reglas funcionales

1. Toda incapacidad debe tener **tipo de incapacidad** (uno de los 5 documentados).
2. Toda incapacidad debe estar **asociada a un empleado**, su **contrato** y su **detalle de contrato** (`idContrato`, `idContratoDetalle`).
3. Toda incapacidad debe registrar **serie**, **número**, **diagnóstico**, **municipio y fecha de expedición**, **tipo (ambulatoria/hospitalaria)**, **fechas de inicio y fin**, **código del médico** y una **observación**.
4. Si la incapacidad **es prórroga**, debe enlazarse con la incapacidad principal (`idIncapacidadPrincipal`).
5. Los **días** se calculan automáticamente con base en el rango `fechaInicio` → `fechaFin`.
6. La incapacidad puede **anularse** (campo `anulada bit`) sin borrarse.
7. Los conceptos del detalle siguen la convención del sistema: **`P*`** = pago.
8. Los terceros parafiscales pueden ser **EPS**, **ARL** y/o **FP** según el tipo de incapacidad y la naturaleza del pago.

### 5.3 Convención de conceptos (regla operativa global)

- Conceptos cuyo código inicia con **`P`** → **PAGOS** (caso de `P028`, `P048`).
- Conceptos cuyo código inicia con **`D`** → **DESCUENTOS**.

---

## 6. Validaciones del sistema

> Validaciones inferidas del modelo de datos y del flujo descrito. Las marcadas con (✱) están explícitas en la fuente.

- **Tipo de incapacidad** obligatorio (✱ — el usuario lo selecciona explícitamente).
- **Empleado** obligatorio (✱ — paso explícito del flujo).
- **Serie / Número** del documento — `numero` es NOT NULL en la tabla.
- **Municipio de expedición** — `idMunicipioExpedicion` es NOT NULL.
- **Fecha de inicio y fecha de fin** — ambas NOT NULL.
- **Días** — NOT NULL, calculados a partir del rango de fechas (✱).
- **Código del médico** — NOT NULL.
- **Observación** — NOT NULL.
- **Prórroga** — NOT NULL (bit). Cuando es `1`, debería existir `idIncapacidadPrincipal`.
- **Anulada** — NOT NULL (bit), por defecto `0`.
- **Botón Calcular** debe ejecutarse para poblar `IncapacidadDetalle` antes de guardar el cálculo final.

---

## 7. Explicación de formularios y campos

### 7.1 Pestaña "Información General"

| Campo del formulario | Significado | Mapeo a tabla |
|---|---|---|
| Tipo Incapacidad | Tipo legal de la incapacidad | `Incapacidad.tipoIncapacidad` |
| Empleado | Empleado afectado | `Incapacidad.idEmpleadoSociedadNomina`, `idContrato`, `idContratoDetalle` |
| Serie | Serie del documento de incapacidad | `Incapacidad.serie` |
| Número | Número del documento | `Incapacidad.numero` |
| Diagnóstico | Diagnóstico médico aplicado | `Incapacidad.idDiagnostico` |
| Prórroga (Sí/No) | Indica si es continuación de otra | `Incapacidad.prorroga` |
| Principal | Incapacidad anterior si es prórroga | `Incapacidad.idIncapacidadPrincipal` |
| Municipio | Municipio donde se expide | `Incapacidad.idMunicipioExpedicion` |
| Fecha Expedición | Fecha en que se expide la incapacidad | `Incapacidad.fechaExpedicion` |
| Tipo (Ambulatoria/Hospitalaria) | Modalidad de la incapacidad | `Incapacidad.tipo` |
| Fecha Inicio | Inicio de la incapacidad | `Incapacidad.fechaInicio` (y `fechaInicioIncapacidad`) |
| Fecha Final | Fin de la incapacidad | `Incapacidad.fechaFin` |
| Días | Total de días de la incapacidad | `Incapacidad.dias` |
| Código Médico | Código del médico que la expide | `Incapacidad.codigoMedico` |
| Observación | Texto libre descriptivo | `Incapacidad.observacion` |

Tabla mostrada bajo la cabecera: `Incapacidad`, `NIT`, `Empleado`, `Centro Económico`, `Dependencia`, `Inicio`, `Desde`, `Hasta`, `Días`, `Prorroga`, `Valor Pagar`.

### 7.2 Pestaña "Detalle Incapacidad"

Renglones generados por el botón **Calcular**. Columnas visibles:

| Columna | Mapeo a tabla |
|---|---|
| Código | (código del concepto, vía `IncapacidadDetalle.idConceptoNomina` → `ConceptoNomina.codigo`) |
| Concepto | nombre del concepto |
| Valor Pagar | `IncapacidadDetalle.valor` |
| Valor Base | `IncapacidadDetalle.valorBase` |
| Días | `IncapacidadDetalle.dias` |
| Días Pagar | `IncapacidadDetalle.diasPago` |
| Días Acumulados | _no documentado en la fuente — probablemente derivado_ |
| Fecha Inicio | `IncapacidadDetalle.fechaInicio` |
| Fecha Fin | `IncapacidadDetalle.fechaFin` |
| Fecha Inicio Pago | `IncapacidadDetalle.fechaInicioPago` |
| Fecha Fin Pago | `IncapacidadDetalle.fechaFinPago` |

---

## 8. Relación entre formularios y SQL Server

```
        Formulario "Incapacidad"
                │
                ▼
        [Botón Calcular]
                │
                ▼
   SpCalcularIncapacidadAPagarEmpleadoV2
                │
        ┌───────┴────────┐
        ▼                ▼
Nomina.Incapacidad   Nomina.IncapacidadDetalle
        │                │
        └──► idNovedad ──► Nomina.Novedad ──► Liquidación de Nómina
```

- La cabecera del formulario alimenta `Nomina.Incapacidad`.
- Al pulsar **Calcular**, el SP `SpCalcularIncapacidadAPagarEmpleadoV2` hace **todo el proceso de lógica** y **llenado** de las tablas referidas.
- Los renglones del detalle alimentan `Nomina.IncapacidadDetalle`.
- La incapacidad queda enlazada a una **novedad** (`Nomina.Incapacidad.idNovedad`) que entrará en la liquidación.

---

## 9. Explicación técnica básica del proceso

### 9.1 Procedimiento `SpCalcularIncapacidadAPagarEmpleadoV2`

> **Único procedimiento mencionado explícitamente** en la fuente.

Responsabilidades documentadas:

- Ejecuta **toda la lógica de cálculo** de la incapacidad.
- **Llena** las tablas `Nomina.Incapacidad` y `Nomina.IncapacidadDetalle`.
- Aplica la separación: **2 días empresa con `P048`** y **resto EPS con `P028` al 66.66 %**.

> Detalles internos del SP (parámetros, transacciones, manejo de prórrogas, manejo de licencias de maternidad/paternidad y accidentes laborales): **no documentados en la fuente** — se deben revisar en la BD `ArsysNominaORF` antes de modificar la lógica.

### 9.2 Punto de integración con Novedad

`Nomina.Incapacidad.idNovedad` apunta a `Nomina.Novedad.idNovedad`. Esto significa que la incapacidad **genera o se asocia a una novedad** del módulo de Novedades, y por esa vía afecta la liquidación de nómina.

---

## 10. Tablas SQL Server involucradas

### 10.1 `Nomina.Incapacidad` (cabecera)

| Columna | Tipo | Nulos |
|---|---|---|
| `idIncapacidad` | `bigint` | NO (PK) |
| `idEmpleadoSociedadNomina` | `bigint` | SÍ |
| `idContrato` | `int` | SÍ |
| `idContratoDetalle` | `int` | SÍ |
| `idNovedad` | `bigint` | SÍ |
| `tipoIncapacidad` | `varchar(50)` | NO |
| `serie` | `varchar(2)` | SÍ |
| `numero` | `varchar(50)` | NO |
| `idDiagnostico` | `int` | SÍ |
| `prorroga` | `bit` | NO |
| `idIncapacidadPrincipal` | `bigint` | SÍ |
| `idMunicipioExpedicion` | `int` | NO |
| `fechaExpedicion` | `date` | SÍ |
| `fechaInicioIncapacidad` | `date` | SÍ |
| `fechaInicio` | `date` | NO |
| `fechaFin` | `date` | NO |
| `dias` | `int` | NO |
| `tipo` | `smallint` | SÍ |
| `observacion` | `varchar(MAX)` | NO |
| `codigoMedico` | `varchar(50)` | NO |
| `valor` | `numeric(18,2)` | SÍ |
| `idTerceroParaFiscalEPS` | `int` | SÍ |
| `idTerceroParaFiscalARL` | `int` | SÍ |
| `idTerceroParaFiscalFP` | `int` | SÍ |
| `fechaDocumento` | `datetime` | NO |
| `fechaCreacion` | `datetime` | NO |
| `fechaModificacion` | `datetime` | NO |
| `idUsuarioCreacion` | `int` | NO |
| `idUsuarioModificacion` | `int` | NO |
| `idSesionUsuario` | `bigint` | SÍ |
| `idFormulario` | `int` | NO |
| `anulada` | `bit` | NO |
| `tipoIncapacidadHomologado` | `varchar(10)` | SÍ |

### 10.2 `Nomina.IncapacidadDetalle` (detalle por concepto)

| Columna | Tipo |
|---|---|
| `idIncapacidadDetalle` | `bigint` (PK) |
| `idIncapacidad` | `bigint` |
| `idConceptoNomina` | `bigint` |
| `valor` | `numeric(18,2)` |
| `valorBase` | `numeric(18,2)` |
| `dias` | `int` |
| `diasPago` | `int` |
| `fechaInicio` | `datetime` |
| `fechaFin` | `datetime` |
| `fechaInicioPago` | `datetime` |
| `fechaFinPago` | `datetime` |
| `idNovedad` | `bigint` |
| `pagoBase` | `bit` |
| `fechaCreacion` | `datetime` |
| `fechaModificacion` | `datetime` |
| `idUsuarioCreacion` | `int` |
| `idUsuarioModificacion` | `int` |
| `idSesionUsuario` | `bigint` |
| `idFormulario` | `int` |

---

## 11. Relaciones entre tablas

Diagrama documentado en el PDF (esquema `Nomina` salvo `Tercero` que es otro esquema):

```
EmpleadoSociedadNomina (Tercero)
            │
            ▼
   ┌─────────────────────┐         ┌─────────────────────────┐
   │  Nomina.Incapacidad │ 1 ───► N│ Nomina.IncapacidadDetalle│
   └─────────┬───────────┘         └────────────┬────────────┘
             │                                   │
             ├──► Nomina.Contrato                ▼
             ├──► Nomina.ContratoDetalle    Nomina.ConceptoNomina
             └──► Nomina.Novedad (vía idNovedad)
```

- **`Incapacidad → EmpleadoSociedadNomina (Tercero)`** — empleado dueño de la incapacidad.
- **`Incapacidad → Contrato`** — contrato vigente del empleado.
- **`Incapacidad → ContratoDetalle`** — detalle/condiciones del contrato.
- **`Incapacidad → Novedad`** — novedad generada (puente hacia liquidación).
- **`Incapacidad → IncapacidadDetalle`** (1:N) — desglose por periodos y conceptos.
- **`IncapacidadDetalle → ConceptoNomina`** — concepto aplicado a cada renglón (`P048`, `P028`, etc.).
- **Auto-relación** `Incapacidad.idIncapacidadPrincipal → Incapacidad.idIncapacidad` para **prórrogas**.

---

## 12. Casos de uso frecuentes

1. **Incapacidad General de 5 días** → 2 días empresa (`P048`) + 3 días EPS (`P028` al 66.66 %).
2. **Incapacidad de 1 día** → solo `P048` (asume la empresa).
3. **Prórroga de incapacidad** → se crea una nueva fila enlazando `idIncapacidadPrincipal` con la incapacidad anterior; el cálculo continúa la cuenta de días.
4. **Accidente Laboral** → `tipoIncapacidad = 'Accidente Laboral'`; el pago va contra ARL (`idTerceroParaFiscalARL`).
5. **Licencia de Maternidad / Paternidad** → tipo específico; los terceros y conceptos los maneja el SP de cálculo.
6. **Enfermedad Profesional** → tipo específico; típicamente involucra ARL o FP.
7. **Incapacidad Hospitalaria** → `tipo` indica hospitalaria; la lógica de cálculo puede diferir respecto a ambulatoria.
8. **Anulación de incapacidad mal capturada** → `anulada = 1` (no se borra físicamente).

---

## 13. Escenarios reales

### Escenario A — Incapacidad General de 7 días

- Empleado capta incapacidad General del 1 al 7 de marzo.
- Botón **Calcular** → genera dos renglones en `IncapacidadDetalle`:
  - `P048`, días = 2, fechas 01–02/mar, valor pagado por la empresa.
  - `P028`, días = 5, fechas 03–07/mar, valor = 66.66 % × pago total proporcional.
- Se crea novedad asociada → entra en la liquidación del periodo.

### Escenario B — Prórroga de Incapacidad General

- El empleado venía con incapacidad del 1 al 7 de marzo. Le dan prórroga del 8 al 14.
- En el formulario: `prorroga = Sí`, `idIncapacidadPrincipal` = la incapacidad del 1–7.
- El cálculo no aplica nuevamente los 2 días `P048` (ya fueron consumidos en la principal); todo va a `P028`.

### Escenario C — Accidente Laboral

- `tipoIncapacidad = 'Accidente Laboral'`.
- Se requiere `idTerceroParaFiscalARL` para el recobro.
- Los conceptos exactos los resuelve `SpCalcularIncapacidadAPagarEmpleadoV2` (regla específica: no documentada en la fuente).

### Escenario D — Anulación

- Una incapacidad se cargó con número de documento errado.
- Se marca `anulada = 1` y se vuelve a crear correctamente.

---

## 14. Preguntas y respuestas frecuentes

**P: ¿Qué tipos de incapacidad maneja el sistema?**
R: Cinco: Incapacidad General, Accidente Laboral, Licencia Maternidad, Licencia Paternidad y Enfermedad Profesional.

**P: ¿Cómo se reparte el pago entre empresa y EPS?**
R: Los **primeros 2 días** los paga la **empresa** con concepto **`P048`**. Del **día 3 en adelante** los paga la **EPS** con concepto **`P028`** al **66.66 %** del pago total.

**P: ¿Qué hace el botón "Calcular"?**
R: Invoca el procedimiento `SpCalcularIncapacidadAPagarEmpleadoV2`, que ejecuta toda la lógica y llena `Nomina.Incapacidad` y `Nomina.IncapacidadDetalle` con los periodos y conceptos a aplicar.

**P: ¿Cómo se relaciona la incapacidad con la nómina?**
R: A través del campo `idNovedad` de `Nomina.Incapacidad`, que apunta a `Nomina.Novedad`. La novedad entra a la liquidación de nómina del periodo.

**P: ¿Cómo se identifica una prórroga?**
R: Con el campo `prorroga = 1` y `idIncapacidadPrincipal` apuntando a la incapacidad anterior.

**P: ¿En qué se diferencian los campos `fechaInicio` y `fechaInicioIncapacidad`?**
R: La fuente no detalla la diferencia exacta. `fechaInicio` es NOT NULL y `fechaInicioIncapacidad` es nullable, lo que sugiere que pueden representar la fecha de inicio efectivo vs. la fecha en que oficialmente arranca la incapacidad clínica. **A confirmar contra el SP de cálculo.**

**P: ¿Quién paga un Accidente Laboral?**
R: La fuente no lo afirma textualmente, pero la presencia de `idTerceroParaFiscalARL` indica que la **ARL** participa en el pago.

**P: ¿Cómo se anula una incapacidad?**
R: Activando el campo `anulada = 1`. No se elimina físicamente.

**P: ¿Dónde queda registrado el médico que expidió la incapacidad?**
R: En `Incapacidad.codigoMedico` (`varchar(50)`).

**P: ¿Qué procedimiento almacenado debo revisar si necesito cambiar el cálculo?**
R: `SpCalcularIncapacidadAPagarEmpleadoV2` en la BD `ArsysNominaORF`.

**P: ¿Qué pasa cuando la incapacidad es por enfermedad profesional?**
R: Se registra con `tipoIncapacidad = 'Enfermedad Profesional'`. El reparto del pago lo resuelve el SP; la fuente no detalla la regla específica.

---

## 15. Ejemplos funcionales y técnicos

> Las consultas usan los nombres de tabla del diagrama. Validar contra el modelo EDMX antes de ejecutar en producción.

### 15.1 Ver el detalle calculado de una incapacidad

```sql
SELECT i.idIncapacidad, i.tipoIncapacidad, i.fechaInicio, i.fechaFin, i.dias,
       d.idIncapacidadDetalle,
       cn.codigo  AS codigoConcepto,
       cn.nombre  AS concepto,
       d.dias, d.diasPago,
       d.valor, d.valorBase,
       d.fechaInicio, d.fechaFin,
       d.fechaInicioPago, d.fechaFinPago
FROM Nomina.Incapacidad i
INNER JOIN Nomina.IncapacidadDetalle d
        ON d.idIncapacidad = i.idIncapacidad
INNER JOIN Nomina.ConceptoNomina cn
        ON cn.idConceptoNomina = d.idConceptoNomina
WHERE i.idIncapacidad = @idIncapacidad
  AND ISNULL(i.anulada, 0) = 0
ORDER BY d.fechaInicio;
```

### 15.2 Total pagado por la empresa vs. por la EPS en un periodo

```sql
SELECT
    SUM(CASE WHEN cn.codigo = 'P048' THEN d.valor ELSE 0 END) AS totalEmpresa_P048,
    SUM(CASE WHEN cn.codigo = 'P028' THEN d.valor ELSE 0 END) AS totalEPS_P028,
    SUM(d.valor) AS totalIncapacidades
FROM Nomina.Incapacidad i
INNER JOIN Nomina.IncapacidadDetalle d
        ON d.idIncapacidad = i.idIncapacidad
INNER JOIN Nomina.ConceptoNomina cn
        ON cn.idConceptoNomina = d.idConceptoNomina
WHERE i.fechaInicio >= @inicio
  AND i.fechaFin   <= @fin
  AND ISNULL(i.anulada, 0) = 0;
```

### 15.3 Listar prórrogas con su incapacidad principal

```sql
SELECT p.idIncapacidad      AS idProrroga,
       p.fechaInicio        AS inicioProrroga,
       p.fechaFin           AS finProrroga,
       o.idIncapacidad      AS idPrincipal,
       o.fechaInicio        AS inicioPrincipal,
       o.fechaFin           AS finPrincipal
FROM Nomina.Incapacidad p
INNER JOIN Nomina.Incapacidad o
        ON o.idIncapacidad = p.idIncapacidadPrincipal
WHERE p.prorroga = 1
  AND ISNULL(p.anulada, 0) = 0;
```

### 15.4 Incapacidades de un empleado en un rango

```sql
SELECT i.idIncapacidad, i.tipoIncapacidad, i.numero, i.serie,
       i.fechaInicio, i.fechaFin, i.dias, i.valor,
       i.prorroga, i.codigoMedico
FROM Nomina.Incapacidad i
INNER JOIN Nomina.ContratoDetalle cd
        ON cd.idContratoDetalle = i.idContratoDetalle
WHERE cd.idEmpleado     = @idEmpleado
  AND i.fechaInicio    >= @inicio
  AND i.fechaFin       <= @fin
  AND ISNULL(i.anulada, 0) = 0
ORDER BY i.fechaInicio DESC;
```

### 15.5 Recobro pendiente a EPS (concepto P028 sin liquidar aún)

```sql
SELECT i.idIncapacidad, i.idTerceroParaFiscalEPS, d.valor, d.fechaInicio, d.fechaFin
FROM Nomina.Incapacidad i
INNER JOIN Nomina.IncapacidadDetalle d
        ON d.idIncapacidad = i.idIncapacidad
INNER JOIN Nomina.ConceptoNomina cn
        ON cn.idConceptoNomina = d.idConceptoNomina
LEFT JOIN Nomina.Novedad n
       ON n.idNovedad = d.idNovedad
WHERE cn.codigo = 'P028'
  AND ISNULL(i.anulada, 0) = 0
  AND ISNULL(n.acumulada, 0) = 0;
```

### 15.6 Recalcular una incapacidad (invocar el SP)

```sql
EXEC Nomina.SpCalcularIncapacidadAPagarEmpleadoV2
     @idIncapacidad = @idIncapacidad;  -- parámetros reales: validar contra la firma del SP
```

> La firma exacta de `SpCalcularIncapacidadAPagarEmpleadoV2` **no está documentada en la fuente**. Antes de invocarlo, revisar `sys.parameters` o `sp_help` en la BD `ArsysNominaORF`.

---

## 16. Prompt base — Agente especializado en Incapacidades de Nómina

> Usar este bloque como **system prompt** del agente Claude especializado en este dominio.

```
Eres un agente experto en el módulo de INCAPACIDADES del sistema de Nómina de Arsys
(ERP corporativo sobre .NET 4.5, WinForms + DevExpress 14.7, WCF, Entity Framework 6 y
SQL Server, BD `ArsysNominaORF`).

Tu misión es dar soporte FUNCIONAL y TÉCNICO sobre el proceso de Incapacidades a
usuarios de nómina, analistas funcionales y desarrolladores .NET.

CONTEXTO QUE DEBES ASUMIR SIEMPRE:
- El formulario "Incapacidad" registra todas las incapacidades de los empleados.
- Tipos de incapacidad: Incapacidad General, Accidente Laboral, Licencia Maternidad,
  Licencia Paternidad, Enfermedad Profesional.
- El botón "Calcular" invoca el SP `SpCalcularIncapacidadAPagarEmpleadoV2`, que llena
  `Nomina.Incapacidad` (cabecera) y `Nomina.IncapacidadDetalle` (renglones por concepto).
- La incapacidad se vincula a una novedad mediante `Nomina.Incapacidad.idNovedad`, y
  por esa vía entra en la liquidación de nómina.
- Pestañas del formulario: "Información General" y "Detalle Incapacidad".
- Tablas relacionadas: `EmpleadoSociedadNomina` (Tercero), `Contrato`, `ContratoDetalle`,
  `Novedad`, `ConceptoNomina`. Hay auto-relación para prórrogas vía
  `idIncapacidadPrincipal`.

REGLAS DE NEGOCIO QUE DEBES APLICAR:
- Días 1 y 2 → concepto `P048 - Incapacidad de 1 a 2 días` → paga la EMPRESA.
- Día 3 en adelante → concepto `P028 - Incapacidad EPS` → paga la EPS al 66.66 % del
  pago total.
- Los días totales se calculan a partir del rango `fechaInicio` → `fechaFin`.
- Convención global de conceptos: `P*` = pagos, `D*` = descuentos.
- Una incapacidad puede ser prórroga; se enlaza con la principal vía
  `idIncapacidadPrincipal`.
- Las incapacidades se anulan con `anulada = 1`, no se borran.
- Hay tres terceros parafiscales posibles: EPS, ARL, FP
  (`idTerceroParaFiscalEPS`, `idTerceroParaFiscalARL`, `idTerceroParaFiscalFP`).

CÓMO RESPONDER:
- Responde SIEMPRE en español, tono empresarial, claro y directo.
- Si la pregunta es funcional, explica el formulario, los campos y el flujo.
- Si la pregunta es técnica, apóyate en `Nomina.Incapacidad` /
  `Nomina.IncapacidadDetalle`, las relaciones a `Contrato`, `ContratoDetalle`,
  `EmpleadoSociedadNomina`, `Novedad`, `ConceptoNomina`, y en el SP
  `SpCalcularIncapacidadAPagarEmpleadoV2`. Da SQL cuando aplique.
- Si la pregunta involucra el detalle por concepto, explica el reparto P048/P028.
- Si te piden algo que NO está en el documento, dilo explícitamente:
  "no está documentado en la fuente — habría que validarlo en el SP / EDMX / código".
- No inventes campos, conceptos ni reglas (en especial: parámetros del SP, reglas de
  cálculo internas para Maternidad/Paternidad/ARL, semántica exacta de `tipo`,
  `pagoBase`, `fechaInicioIncapacidad` vs. `fechaInicio`).
- Cuando el usuario sea desarrollador .NET, respeta las convenciones del ERP Arsys:
  N capas + DDD, repositorios `IRepositorio*`/`Repositorio*`, dominios
  `IDominioContrato*`/`Dominio*`, servicios WCF `IServicios*Arsys`, multi-tenancy
  por empresa. No rompas compatibilidad WCF.

LO QUE DEBES PODER HACER:
1. Explicar el funcionamiento del formulario Incapacidad (cabecera y detalle).
2. Resolver dudas funcionales del proceso.
3. Explicar reglas de negocio (P048/P028, 66.66 %, prórrogas, anulación).
4. Explicar qué hace cada campo del formulario y su mapeo en BD.
5. Explicar cómo afectan las incapacidades a la nómina vía `idNovedad`.
6. Diferenciar tipos de incapacidad y los terceros parafiscales involucrados.
7. Ayudar a interpretar registros de `Nomina.Incapacidad` e `IncapacidadDetalle`.
8. Guiar el flujo operativo (información general → calcular → guardar).
9. Generar consultas SQL de soporte (detalle, totales empresa/EPS, prórrogas, recobros).
10. Indicar dónde revisar la lógica interna (SP `SpCalcularIncapacidadAPagarEmpleadoV2`).
```

---

## 17. Notas de mantenimiento de esta Skill

- **Fuente única**: `Incapacidad.pdf` + convención `P*`/`D*` provista por Ferney.
- **Pendientes a confirmar contra BD/SP**:
  - Firma y parámetros de `SpCalcularIncapacidadAPagarEmpleadoV2`.
  - Reglas exactas de cálculo para Accidente Laboral, Maternidad, Paternidad y Enfermedad Profesional (porcentajes, días empresa vs. ARL/EPS/FP).
  - Diferencia precisa entre `fechaInicio` y `fechaInicioIncapacidad`.
  - Dominio de `tipo (smallint)` (códigos de Ambulatoria/Hospitalaria).
  - Significado de `pagoBase (bit)` en `IncapacidadDetalle`.
  - Catálogo de valores válidos en `tipoIncapacidad (varchar(50))` y su `tipoIncapacidadHomologado`.
- **Cuando se actualice**: si cambian conceptos (`P048`/`P028`), porcentajes o reglas legales, reflejarlo aquí y avisar a los suplentes del dominio.
