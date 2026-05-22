# Conocimiento del área — Ventas (ORF)

> Documento de conocimiento puro extraído de entrevistas al equipo de ventas. Listo para ingerir como base de datos del agente (estilo Aniro).
>
> **Owner del documento:** Reivyng Ramírez · **Estado:** v1_0 (en construcción — extensible)
>
> ## 📌 Modelo del documento
>
> - **Secciones 1–8:** visión general del área (entrevista inicial con Reivyng Ramírez, 2026-05-08).
> - **Sección 9:** procesos específicos documentados a fondo, cada uno con su entrevistado. **Esta sección crece con cada entrevista al equipo** — añadir una subsección 9.x por cada proceso nuevo profundizado.
> - **Campos `[PENDIENTE]`** y **`⚠️` (polémicos)**: marcan información a validar/profundizar en próximas entrevistas.

---

## 1. Identificación

**Experto:** Reivyng Ramírez
**Rol:** Encargado del área de ventas en ORF.
**Función principal:** Apoyar todo el proceso comercial — desde la atención a clientes hasta el seguimiento de oportunidades y cumplimiento de metas de ventas.

**Qué es el área de ventas en ORF:**
Encargada de conectar los servicios y productos de la empresa con las necesidades de los clientes. No solo busca vender, sino también mantener buena relación con los clientes, entender sus necesidades y ayudar a que la empresa crezca comercialmente.

**Día a día de Reivyng:**
- Atención a clientes
- Seguimiento a cotizaciones
- Apoyo en procesos comerciales
- Actualización de información
- Coordinación con otras áreas
- Acompañamiento a posibles clientes

**Comunicación constante con:** clientes, equipo comercial, soporte y áreas administrativas (según necesidad).

---

## 2. Términos

### Términos claros (consenso)

| Término | Definición |
|---|---|
| **Lead** | Posible cliente que mostró interés en productos/servicios de ORF, pero todavía no se ha gestionado completamente. |
| **Prospecto** | Cliente potencial ya contactado, con posibilidades reales de compra según necesidades e interés. |
| **Oportunidad** | Venta con alta probabilidad de concretarse — el cliente solicitó información, cotización o está en negociación. |
| **Cotización** | Documento con precios, productos, cantidades y condiciones comerciales para un cliente. |
| **Cliente activo** | Cliente que actualmente realiza compras o mantiene relación comercial constante. |
| **Back office** | Equipo interno que apoya procesos administrativos y comerciales: pedidos, documentación, seguimiento, soporte al área de ventas. |
| **Cierre** | Momento en el que una negociación termina exitosamente y el cliente confirma la compra. |
| **Descuento por volumen** | Reducción de precio cuando el cliente compra grandes cantidades. |
| **Factura proforma** | Documento preliminar con valor estimado de una venta antes de emitir la factura oficial. |
| **Asesor comercial** | Persona encargada de atender clientes, ofrecer productos, hacer seguimiento y buscar oportunidades. |
| **Cotización vencida** | Cotización que superó su tiempo de validez y requiere actualización de precios/condiciones. |
| **Orden de compra** | Documento del cliente que confirma formalmente la compra de productos/servicios. |
| **Excel macro** | Archivo Excel con gran cantidad de datos sobre precios del portafolio. Genera porcentajes y aplica diferenciales entre líneas y fletes por planta. Es la herramienta central del proceso de actualización de precios. Ver §9.1. |
| **Pore (planta)** | Planta de ORF donde **NO se maneja flete**. Sirve como referencia del precio base de las líneas principales (precio sin distorsión logística). Ver §9.1. |
| **Línea principal vs línea premium** | División de productos del portafolio. Las premium aplican un diferencial sobre el precio de la línea principal. |
| **Lista de precios 1805** | Opción específica del módulo Ventas → Consultas en ARSYS para validar el cargue de listas de precios. Permite filtrar por lista, departamento, municipio y código producto. |

### Términos polémicos (interpretación variable)

| Término | Definición común | ⚠️ Confusión real |
|---|---|---|
| **Key account** | Cliente estratégico/de alto valor. | No existe documento formal. Se usa para volumen + estrategia + influencia + potencial, pero los criterios no son absolutos. Decisión final: gerencia/coordinación comercial. `[PENDIENTE — validar si existe documento formal con gerencia comercial]` |
| **Mix de productos** | Combinación de productos que compra/maneja un cliente. | Se usa para "variedad" (cuántas líneas/categorías) Y para "rentabilidad" (cuáles dejan más margen). La interpretación varía según la reunión/reporte. |
| **Tasa VIP** | Condición especial de precio/descuento para clientes importantes. | No hay regla única. Rango "esperado" 2%-7%, pero en la práctica muchos casos van por negociación individual. Depende de historial, presión comercial, margen disponible y aprobación gerencia. |

---

## 3. Procesos

### Procesos principales

| # | Proceso | Qué hace | Cuándo | Quién dispara |
|---|---|---|---|---|
| 1 | Atención a un nuevo lead | Contactar a posible cliente para conocer necesidades y validar oportunidad | Cada vez que llega un lead | Cliente, campañas, referidos |
| 2 | Generación de cotización | Preparar y enviar propuesta comercial | Cuando el cliente solicita información formal | Cliente o asesor |
| 3 | Seguimiento a cotización pendiente | Validar interés y resolver dudas sobre la propuesta enviada | Diario o varios días después de enviar | Comercial o cliente |
| 4 | Cierre de venta y confirmación de pedido | Confirmar aceptación y formalizar compra (OC o acuerdo) | Cuando el cliente aprueba la cotización | Cliente |
| 5 | Coordinación con back office | Enviar info para procesar pedidos, facturación y entrega | Después de cerrar una venta | Asesor o área de ventas |
| 6 | Gestión de clientes activos | Mantener contacto para recompra, novedades, soporte | Semanal/mensual según cliente | Comercial |
| 7 | Actualización de información del cliente | Actualizar datos comerciales, contactos, condiciones de pago | Cuando hay cambios o en revisiones periódicas | Cliente o asesor |
| 8 | ⚠️ Reporte de ventas y pipeline | Consolidar oportunidades, ventas y proyecciones | Semanal y mensual | Coordinación o gerencia |
| 9 | Gestión de clientes inactivos | Contactar clientes sin compras recientes para reactivar | Mensual o por campañas | Comercial |
| 10 | ⚠️ Validación de descuentos especiales | Revisar y aprobar solicitudes de descuento fuera de política | Cuando un cliente lo solicita | Cliente, asesor o coordinación |
| 11 | **Actualización de precios** (ver §9.1 para detalle) | Actualizar precios por arroba de líneas de producto en ARSYS, con diferenciales y fletes por planta | Cuando gerencia comercial autoriza cambio | Gerencia comercial |

---

## 4. Cálculos / Fórmulas

### Cálculos comerciales

**Descuento por volumen** — escalas según cantidad/valor:
- 5% si compra > $5.000.000
- 8% si supera $10.000.000
- 10% para clientes recurrentes con compras altas
- Variable según línea de producto.
- *Vive en:* Tabla Excel + condiciones manejadas por coordinación comercial.

**⚠️ Tasa VIP**
- Sin regla única. Generalmente 2%-7% como descuento fijo adicional.
- Asignación según volumen histórico, frecuencia, relación comercial.
- *Vive en:* acuerdos comerciales y conocimiento de coordinación/gerencia.
- `[PENDIENTE — preguntar a gerencia comercial]`

**Valor total de una cotización:**
```
Subtotal     = Σ(producto × cantidad)
Descuento    = Subtotal × % descuento
IVA          = (Subtotal − Descuento) × % IVA
Total final  = Subtotal − Descuento + IVA + costos adicionales (transporte, etc.)
```
- *Vive en:* Sistema comercial y plantillas Excel.

**⚠️ Tope de descuentos especiales** (jerárquico):
- Asesor comercial: hasta 5%
- Coordinación comercial: hasta 10%
- Gerencia: superiores o casos especiales
- Variable según producto/cliente.
- *Vive en:* política comercial interna y aprobaciones por correo/WhatsApp.

### KPIs comerciales

**Cuota cumplida:**
```
Cumplimiento = (Ventas realizadas / Meta asignada) × 100
```
*Vive en:* dashboard comercial y reportes mensuales.

**Cuota proyectada:**
```
Proyección = Σ (Oportunidad × Probabilidad de cierre)
```
Ej: Oportunidad A = $10M × 80%; Oportunidad B = $5M × 50%.
*Vive en:* CRM, Excel o dashboard.

**Ticket promedio:**
```
Ticket promedio = Total vendido / Cantidad de ventas
```
*Vive en:* reportes comerciales.

**Tasa de cierre:**
```
Tasa de cierre = (Oportunidades ganadas / Total de oportunidades) × 100
```
*Vive en:* CRM y reportes de pipeline.

**Ciclo promedio de venta:**
Promedio de días entre creación del lead y cierre de la venta.
*Vive en:* CRM o reportes históricos.

**⚠️ Forecast de ventas:**
```
Forecast = Ventas cerradas + Σ(Oportunidad × Probabilidad)
```
*Vive en:* Excel, dashboard o CRM.

**⚠️ Margen comercial:**
```
Margen = ((Precio de venta − Costo) / Precio de venta) × 100
```
*Vive en:* ERP, reportes financieros, consultas SQL.
`[PENDIENTE — validar fórmula exacta con financiera]`

### Definiciones operativas

**⚠️ Oportunidad ganada** — cuando el cliente confirma pedido / envía OC / se factura. Algunas personas la cuentan desde aprobación verbal, otras solo cuando ya está facturada.

**Cliente activo** — Cliente con compras en los últimos 3-6 meses (criterio variable: frecuencia o monto).

**Cliente inactivo** — Sin compras durante un periodo definido (>6 meses o 1 año).

**Segmentación de clientes:**
- Alto valor: compras altas (mensual/anual)
- Frecuente: compra constantemente
- Ocasional: compra esporádica
- Riesgo: baja frecuencia o caída de compras

**⚠️ Key account** — sin fórmula totalmente definida. Considera: alto volumen + relación estratégica + potencial de crecimiento + influencia comercial. A veces también margen y recurrencia. `[PENDIENTE — preguntar a dirección comercial]`

---

## 5. Reglas críticas

| # | Regla | Por qué importa | Quién la hace cumplir |
|---|---|---|---|
| 1 | Ningún descuento superior al porcentaje autorizado puede enviarse sin aprobación previa. | Evita pérdidas, conflictos internos, salirse de política. | Coordinación y gerencia. |
| 2 | No se puede confirmar fecha de entrega sin validar disponibilidad con back office o logística. | Evita incumplimientos y promesas insostenibles. | Back office, logística, asesores. |
| 3 | Toda cotización enviada debe quedar registrada en CRM o archivo comercial. | Permite seguimiento, medición y trazabilidad. | Comercial y coordinación. |
| 4 | ⚠️ No se libera pedido a cliente con cartera vencida. | Reduce riesgo financiero y evita aumentar deuda. *Hay excepciones para clientes estratégicos.* | Cartera, coordinación, gerencia. |
| 5 | Todo cliente nuevo debe tener validación básica de datos antes de generar crédito. | Previene fraudes, errores de facturación, riesgos financieros. | Comercial y cartera. |
| 6 | Nunca prometer descuentos permanentes sin aprobación formal. | Evita conflictos posteriores y afecta margen. | Coordinación y gerencia. |
| 7 | ⚠️ Si cliente VIP presenta queja grave o riesgo de cancelación, informar el mismo día. | Son estratégicos; cualquier pérdida impacta fuerte. *A veces depende del criterio del asesor.* | Asesores y coordinación. |
| 8 | Toda orden de compra debe coincidir con la cotización aprobada. | Evita errores de facturación, diferencias de precio o entrega. | Back office y comercial. |
| 9 | ⚠️ No modificar precios manualmente en el sistema sin autorización. | Genera inconsistencias financieras y afecta reportes. *Algunos usuarios tienen permisos especiales.* | Sistema, coordinación, administración. |
| 10 | Los reportes comerciales deben actualizarse dentro de las fechas definidas. | La gerencia decide con esos indicadores. | Coordinación y gerencia. |
| 11 | `[PENDIENTE]` Productos/líneas especiales solo se venden con documentación completa. | Algunas líneas requieren soporte/aprobación adicional. | Comercial, back office, jurídica/administrativa. |

---

## 6. Casos especiales

### 6.A — Errores comunes que cometen los nuevos

| # | Error | Por qué pasa | Cómo se previene |
|---|---|---|---|
| 1 | Prometer descuentos sin validar autorización | Quieren cerrar rápido o piensan que todos los clientes manejan iguales condiciones | Aprender topes autorizados y cuándo escalar |
| 2 | Confirmar fechas de entrega sin consultar disponibilidad | Asumen que el producto siempre está o que logística lo resuelve | Ninguna fecha se confirma sin validación con back office/inventario |
| 3 | No registrar la cotización en CRM/sistema | Creen que basta con correo/WhatsApp | Toda gestión comercial debe quedar trazable |
| 4 | ⚠️ Confundir cotización vencida con oportunidad perdida | No entienden que muchos clientes vuelven solo necesitan actualización | Diferenciar estados comerciales y seguimiento real al pipeline |
| 5 | Ofrecer precios antiguos / reutilizar cotizaciones viejas | Copian propuestas anteriores sin validar listas vigentes | Control de versiones, vigencia de precios, validación previa |
| 6 | No validar cartera antes de avanzar pedido | Solo enfocados en vender, no en estado financiero | Revisar cartera como paso obligatorio antes de confirmar |
| 7 | ⚠️ Pensar que VIP/key account es solo el que más compra | Desconocen el componente estratégico/político | Explicar criterios y quién decide |

### 6.B — Polémicos profundizados

**Key account** — Decisión final: gerencia comercial o coordinación. Criterios cuantitativos (volumen, recurrencia, facturación anual) **no son absolutos**. También pesan: posicionamiento del cliente, influencia en el mercado, potencial de crecimiento.
`[PENDIENTE — validar si existe documento formal de clasificación con gerencia]`

**Tasa VIP** — Rango "esperado" 2%-7%. En la práctica muchos casos por negociación individual. Depende de historial, presión comercial, margen disponible y aprobación gerencia.

**Mix de productos** — Confusión legítima:
- En reuniones de **variedad**: cuántas líneas/categorías compra el cliente.
- En reuniones de **rentabilidad**: cuáles productos dejan mejor margen.
- Ambas interpretaciones se usan, depende del contexto.

**Cartera vencida con excepciones** — Excepciones a clientes:
- Históricos / cuentas estratégicas
- Alto volumen
- Negocios grandes en curso
- Con compromiso de pago o negociación activa
- Cuando hay riesgo comercial importante si se detiene el pedido

**Modificación de precios con permisos especiales** — Permisos formales: coordinación comercial, gerencia, algunos administrativos del sistema. Adicionalmente, asesores antiguos/de confianza pueden tener accesos parciales o autorización informal.
`[PENDIENTE — validar permisos exactos con sistemas/administración]`

### 6.C — Decisiones del pasado y por qué

| Decisión | Motivo histórico |
|---|---|
| Toda cotización tiene fecha de validez limitada. | Clientes intentaban aceptar cotizaciones muy antiguas con precios cambiados → pérdidas y discusiones. |
| Cotizaciones de clientes nuevos se revisan antes de aprobar crédito o condiciones especiales. | Casos de aprobación sin validar info financiera o cupos → problemas de cartera. |
| No se prometen fechas de entrega sin confirmación de back office o logística. | Asesores confirmaban "por compromiso comercial" sin inventario/capacidad → reclamos. |
| Toda negociación importante debe quedar registrada en sistema o correo. | Acuerdos solo por llamada/WhatsApp → malentendidos sobre precios, descuentos, condiciones. |
| Los descuentos fuera de política requieren aprobación escrita. | Antes se autorizaban verbalmente y nadie asumía responsabilidad cuando afectaban margen. |

---

## 7. Sistemas y datos

### 7.A — Sistemas

| Sistema | Para qué se usa | Quién lo administra | Estado |
|---|---|---|---|
| ⚠️ CRM comercial | Leads, oportunidades, historial, pipeline, seguimiento | Comercial + apoyo TI | `[PENDIENTE — confirmar si es propio, adaptado o tercerizado]` |
| ⚠️ Arsys ERP | Clientes, cotizaciones, pedidos, facturación, cartera, inventario | TI + proveedor externo | `[PENDIENTE — validar nombres exactos de módulos]` |
| ⚠️ Dashboard comercial (Power BI) | Metas, cumplimiento, pipeline, ventas mensuales, cartera, proyecciones | BI / TI / coordinación según reporte | `[PENDIENTE — confirmar quién construyó dashboards principales]` |
| Excel comercial | Cotizaciones, listas de precios, seguimiento manual, forecast | Cada asesor + coordinación | OK |
| Correo corporativo | Cotizaciones formales, aprobaciones, negociaciones | TI o proveedor | OK |
| ⚠️ WhatsApp Business | Atención rápida, seguimiento informal | Cada asesor | **Riesgo: mucha info comercial vive aquí sin trazabilidad oficial.** |
| Archivos compartidos (Drive/red interna) | Plantillas, reportes, listas de precios, documentación | Comercial + TI | OK |

### 7.B — Tablas / archivos clave

| Tabla / Archivo | Qué tiene | Quién actualiza | Estado |
|---|---|---|---|
| `Pipeline_Comercial.xlsx` | Oportunidades, estado, probabilidad, responsable | Asesores + coordinación | OK |
| ⚠️ `MaestroPrecios_2026.xlsx` | Lista oficial, descuentos base, condiciones por línea | Coordinación / gerencia | OK |
| `Clientes_Activos.xlsx` | Clientes activos, contactos, frecuencia, segmentación básica | Comercial | OK |
| `Reporte_Cartera.xlsx` | Saldos vencidos, cupos, observaciones financieras | Cartera y financiera | OK |
| ⚠️ `Venta.Cotizacion` (ERP) | Cotizaciones, estados, fechas, asesor, valor | ERP/CRM automático | `[PENDIENTE — validar nombre exacto con TI]` |
| ⚠️ `Tercero.Cliente` (ERP) | Maestro de clientes, NIT, contactos, condiciones | ERP + administrativas | `[PENDIENTE — confirmar estructura exacta]` |
| ⚠️ `Query_Ventas_Mensuales.sql` | Consolidado de ventas por asesor/cliente/línea/periodo | BI o TI | `[PENDIENTE — solicitar query exacto a BI/TI]` |
| `Forecast_Ventas.xlsx` | Proyección comercial mensual basada en oportunidades | Coordinación + asesores | OK |

### 7.C — Reportes y dashboards principales

| Reporte | Quién lo consulta | Cada cuánto | Dónde vive |
|---|---|---|---|
| Dashboard de cumplimiento comercial | Gerencia, coordinación, asesores | Diario / semanal | Power BI |
| Pipeline de oportunidades | Comercial y coordinación | Semanal | CRM + Power BI |
| Forecast mensual de ventas | Gerencia comercial y dirección | Semanal / mensual | Excel + Power BI |
| Cartera vencida | Comercial, cartera, gerencia | Diario / semanal | ERP + Excel |
| Ventas por asesor | Coordinación y gerencia | Mensual | Power BI + ERP |
| Clientes activos vs inactivos | Comercial y coordinación | Mensual / trimestral | Excel + ERP |
| ⚠️ Rentabilidad / margen comercial | Gerencia y financiera | Mensual | ERP + Power BI |

---

## 8. Validaciones

| # | Validación | Cuándo | Qué se verifica | Acción si falla |
|---|---|---|---|---|
| 1 | Revisión de cotización antes de enviar | Antes de enviar al cliente | Precios actualizados, descuentos autorizados, IVA, datos cliente, fecha vigencia | Corregir o escalar a coordinación |
| 2 | Validación de cartera del cliente | Antes de confirmar pedidos | Estado cartera, cupo disponible, días vencidos | Pedido se detiene; escalar a cartera o gerencia |
| 3 | Confirmación de inventario y entrega | Antes de confirmar fecha al cliente | Disponibilidad de producto, tiempos logísticos, capacidad despacho | Ajustar fecha o reprogramar con cliente |
| 4 | Registro de oportunidad en CRM | Durante/después de gestión comercial | Oportunidad con estado actualizado, responsable, seguimiento | Solicitar actualización antes del cierre semanal/mensual |
| 5 | ⚠️ Cruce ventas registradas vs facturación | Cierre semanal y mensual | CRM/Power BI/Excel coincide con facturas en ERP | Revisar diferencias con back office, facturación, BI |
| 6 | Oportunidades cerradas ganadas | Antes de cerrar reportes comerciales | Tienen OC, factura o confirmación formal | La oportunidad vuelve a "en seguimiento" o "pendiente" |
| 7 | Cierre de reportes comerciales | Fin de semana / mes / cierre comercial | Cumplimiento de metas, forecast actualizado, ventas reales, oportunidades activas | Corregir cifras o solicitar actualización a asesores |
| 8 | ⚠️ Control de modificaciones manuales de precios | Cuando se detectan precios fuera de política | Quién autorizó, % aplicado, justificación | Bloquear pedido o escalar. `[PENDIENTE — validar si existe auditoría automática en ERP]` |

---

## 9. Procesos documentados en detalle

> Esta sección crece con cada entrevista al equipo. Cada proceso documentado a fondo se añade como una subsección con su entrevistado.

---

### 9.1 — Actualización de precios

**Entrevistado:** Jhonatan Mahecha Rodríguez
**Fecha entrevista:** 2026-05-08
**Rol específico:** Proceso de apoyo comercial — gestión y análisis de información, gestión oportuna de precios en plantas

#### Qué hace el rol del entrevistado

Proceso de apoyo a las áreas comerciales:

- Consultar y entregar información precisa a las diferentes áreas comerciales.
- Procesar y gestionar información y documentación del área comercial.
- Suministrar información, datos estadísticos y metodologías básicas a las distintas áreas.
- Analizar comportamiento de clientes para todas las marcas: ventas, cantidades pedidas, cantidad de pedidos, inventarios, frecuencias, geolocalización, probabilidades en indicadores.
- Gestión oportuna de precios en las diferentes plantas que maneja ORF, considerando los diferenciales de líneas principales vs premium, y validando los fletes por planta o bodega.

#### Productos / líneas involucradas

| Producto | Línea |
|---|---|
| Arroz Roa Fortiplus | Principal |
| Florhuila con Vitaminas | Principal |
| Arroz Roa Premium | Premium |
| Florhuila Platino | Premium |
| Arroz Roa Parbolizado Doña Peppa | Premium |

`[PENDIENTE — confirmar clasificación principal/premium de cada producto con gerencia comercial]`

#### Flujo del proceso (paso a paso)

1. **Gerencia Comercial** envía la actualización de precios por arroba de las diferentes líneas de productos (vía correo).
2. Se toman esos precios y se **registran en el archivo Excel macro**.
3. La macro **actualiza automáticamente los precios de las distintas presentaciones** del producto.
4. **Validar** que los precios actualizados queden alineados con los correos recibidos de gerencia comercial.
5. **Enviar la lista de precios** al área de **Sistemas (TI)** individualmente.
6. **Sistemas (TI)** realiza el **cargue masivo** de esas listas en el sistema **ARSYS**.
7. **Administración de Ventas** verifica el cargue en ARSYS:
   - Módulo: **Ventas**
   - Submódulo: **Consultas de Ventas**
   - Opción: **Consultar Lista de Precios — 1805**
   - Filtros disponibles: lista de precio, departamento, municipio, código producto.
8. **Validar** que la lista de precios haya quedado cargada exitosamente.

#### Cálculos relacionados

- La **Excel macro** genera los **porcentajes de los precios** a partir de los precios base por arroba.
- Aplica **diferenciales** entre líneas principales y líneas premium.
- Aplica **fletes** correspondientes a cada planta/bodega.
- **Pore** es la planta sin flete — sirve como referencia del precio base.

`[PENDIENTE — capturar la fórmula exacta de los porcentajes y los diferenciales (% premium sobre principal). Pedir copia controlada de la macro o documentación interna.]`

#### Reglas críticas del proceso

| # | Regla | Por qué importa |
|---|---|---|
| 1 | Validar que la información solicitada sea correcta **antes** de compartirla | Evita decisiones comerciales con datos errados |
| 2 | Los precios enviados por gerencia comercial deben **coincidir exactamente** con los listados en ARSYS | Garantiza consistencia entre la decisión gerencial y el sistema operativo |
| 3 | El precio base de las líneas principales debe ser **el mismo en la planta sin flete (Pore)** | Mantiene la coherencia del precio base sin distorsión por logística |
| 4 | La ejecución de la macro debe **coincidir con el resultado esperado** del correo de gerencia general | Validación de cuadre obligatoria antes de avanzar |

#### Errores comunes (rol de apoyo / análisis comercial)

| # | Error | Detalle |
|---|---|---|
| 1 | Falta de estudio en la información interna | Entrar al rol sin conocer las fuentes/maestros internos |
| 2 | Poca confiabilidad en la información suministrada | Compartir datos sin validarlos previamente |
| 3 | Mal manejo de bases de datos | No saber consultar, cruzar o validar BD comerciales |
| 4 | Poca comunicación con áreas transversales | Trabajar aislado de TI, gerencia comercial, administración de ventas |
| 5 | Falta de documentación de respaldo (sobre BD o proceso) | No dejar rastro de cómo se obtuvo o procesó un dato |
| 6 | Falta de conocimiento en temas ofimáticos | Limitación para manejar Excel avanzado, macros, consolidación |

#### Sistemas / herramientas específicas

| Sistema | Uso en este proceso |
|---|---|
| **Excel macro** | Archivo central. Recibe precios base, aplica diferenciales/fletes, genera listas por presentación |
| **Correo corporativo** | Canal formal donde gerencia comercial envía las actualizaciones de precios |
| **ARSYS — Módulo Ventas** | Sistema destino donde se cargan las listas de precios |
| **ARSYS — Submódulo Consultas de Ventas → Opción "Consultar Lista de Precios - 1805"** | Pantalla para verificar el cargue (filtros: lista, departamento, municipio, código producto) |

#### Áreas transversales que intervienen

| Área | Rol en el proceso |
|---|---|
| Gerencia Comercial / Gerencia General | Define y autoriza los precios por arroba |
| Soporte / Análisis Comercial (Jhonatan) | Procesa la macro, valida cargues, envía a TI |
| Sistemas / TI | Hace el cargue masivo en ARSYS |
| Administración de Ventas | Verifica que el cargue quedó correctamente en ARSYS |

#### Pendientes específicos del proceso (para profundizar)

- `[PENDIENTE]` Fórmula exacta de la macro (% diferenciales línea principal → premium).
- `[PENDIENTE]` Lista de fletes específicos por planta.
- `[PENDIENTE]` Cuántas plantas/bodegas tiene ORF y cómo se identifican.
- `[PENDIENTE]` Existencia de versionado/historial de la macro y owner técnico.
- `[PENDIENTE]` SLA del proceso (frecuencia esperada de actualización de precios).
- `[PENDIENTE]` Detalle del rol completo de Jhonatan: análisis de comportamiento de clientes (qué indicadores específicos, qué herramientas de geolocalización, qué fuentes de datos).

---

### 9.2 — _(siguiente proceso a documentar)_

`[PENDIENTE — próxima entrevista. Cada proceso nuevo se documenta aquí siguiendo la misma estructura que 9.1.]`

---

## Pendientes (resumen)

Lista consolidada de campos `[PENDIENTE]` para próximas revisiones:

1. Tasa VIP — preguntar a **gerencia comercial**
2. Key account — preguntar a **dirección comercial** (validar si existe documento formal)
3. Margen comercial — validar fórmula con **financiera**
4. Productos/líneas especiales — validar regla con **comercial / back office / jurídica**
5. CRM — confirmar si propio/adaptado/tercerizado con **TI**
6. Módulos exactos de Arsys ERP — validar con **TI**
7. Quién construyó los dashboards principales — validar con **BI / TI**
8. Permisos exactos de modificación de precios — validar con **sistemas / administración**
9. Nombre exacto de tabla `Venta.Cotizacion` — validar con **TI**
10. Estructura exacta de `Tercero.Cliente` — validar con **TI**
11. Query exacto `Query_Ventas_Mensuales.sql` — solicitar a **BI / TI**
12. Auditoría automática de modificación de precios en ERP — validar con **sistemas**

### Pendientes específicos del proceso §9.1 (Actualización de precios)

13. Clasificación principal/premium de cada producto del portafolio — validar con **gerencia comercial**
14. Fórmula exacta de la Excel macro (porcentajes y diferenciales línea principal → premium) — solicitar copia controlada o documentación
15. Lista de fletes específicos por planta — validar con **logística** y **gerencia comercial**
16. Inventario y nombres de plantas/bodegas ORF (cuántas son, cómo se identifican) — validar con **logística / TI**
17. Versionado y owner técnico de la macro de precios — validar con **TI / soporte comercial**
18. SLA del proceso de actualización de precios (frecuencia esperada) — validar con **gerencia comercial**
19. Detalle completo del rol de análisis de comportamiento de clientes (indicadores, herramientas de geolocalización, fuentes de datos) — profundizar con **Jhonatan Mahecha**

---

## Alertas (cosas que vale la pena vigilar)

- ⚠️ **WhatsApp Business** concentra mucha información comercial sin trazabilidad oficial. Riesgo si alguien sale sin transferir el conocimiento.
- ⚠️ **Tasa VIP, Key account, Mix de productos** se usan sin definición común — confusión recurrente entre áreas.
- ⚠️ **Modificación manual de precios** — falta claridad sobre quién tiene permisos formales vs informales.
- ⚠️ **Excepciones a la regla de cartera vencida** — no hay criterio único; cada caso se evalúa.
