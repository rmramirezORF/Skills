---
nombre: CUESTIONARIO-VENTAS-ReunionInicial_v0_1
proposito: Guía de preguntas para reunión con equipo de Ventas de ORF, insumo del futuro RAG sobre Ventas.
area: Ventas (código SAL)
owner: [PENDIENTE]
entrevistados: [PENDIENTE — confirmar antes de la reunión]
entrevistador: Oscar Alvarado <oalvarado@orf.com.co>
fecha_reunion: [PENDIENTE — YYYY-MM-DD]
duracion_estimada: 90–120 minutos
version: v0_1 (borrador pre-entrevista)
alcance:
  - Proceso comercial ORF (cómo vende ORF a sus clientes)
  - Módulo de Ventas en sistema (SAL en Arsys/ERP)
  - Catálogo de productos/servicios de ORF
referencias:
  - .agents/temas/estandar-ia/skills/GOV-ENR-DocumentarArea_v1_0/SKILL.md
  - .agents/temas/estandar-ia/assets/KB-AREA-TEMPLATE.md
  - .agents/temas/estandar-ia/skills/GOV-CTX-DisenarRAG_v1_0/SKILL.md
---

# Cuestionario — Reunión inicial con equipo de Ventas de ORF

> **Propósito:** recopilar el conocimiento operativo del área de Ventas para construir, en una segunda etapa, un RAG (Retrieval-Augmented Generation) que apoye al equipo comercial.
>
> Este documento sigue las **8 fases** de la skill `GOV-ENR-DocumentarArea_v1_0`. Después de la reunión, las notas alimentarán tres documentos KB separados:
> - `KB-VENTAS-ProcesoComercial_v1_0.md`
> - `KB-VENTAS-ModuloSistema_v1_0.md`
> - `KB-VENTAS-Catalogo_v1_0.md`

---

## Instrucciones de facilitación (leer antes de empezar)

- **Regla de oro:** un documento = un área. Si una respuesta deriva a otra área (Cartera, Tesorería, Operaciones, Producción), anotarla y **abrir un documento aparte después** — no mezclarla aquí.
- **Anti-patrón a evitar:** soltar todas las preguntas a la vez al experto. Da respuestas superficiales. Ir fase por fase.
- **Capturar literal:** si el experto dice una fórmula, un SQL, un nombre de tabla, una regla — escribirlo **textual**, no parafrasear.
- **No inventar:** lo que el experto no sepa o no recuerde → marcar `[PENDIENTE — preguntar a {persona}]`.
- **Glosario primero:** aunque parezca obvio, anclar el lenguaje al inicio evita confusiones más adelante.

**Tiempos sugeridos por fase:** 5 + 15 + 10 + 10 + 30 + 15 + 10 + 10 + 15 (bloques extra) = **120 min máximo**. Ajustar según ritmo.

---

## Fase 1 — Encuadre (5 min)

> "Antes de meternos en detalle, quiero asegurar que estamos hablando del mismo alcance."

1. ¿Quién es el **dueño operativo** del área de ventas de ORF?

   _Respuesta:_

   &nbsp;

   &nbsp;

2. ¿Quiénes más, fuera de esta reunión, tienen conocimiento crítico de ventas que deberíamos entrevistar después?

   _Respuesta:_

   &nbsp;

   &nbsp;

3. ¿En qué **sistemas** se materializa el proceso de ventas hoy? (Arsys, CRM, ERP, Excel, dashboards, etc.)

   _Respuesta:_

   &nbsp;

   &nbsp;

4. ¿Existe algún **ETL, dashboard o reporte** que el equipo consulte como fuente de verdad? Si sí, ¿dónde vive?

   _Respuesta:_

   &nbsp;

   &nbsp;

---

## Fase 2 — Glosario del área (15 min)

> "Vamos a anclar el lenguaje. Necesito que me digan todos los términos que en ventas se usan con un significado específico — incluso los que parecen obvios."

### 2.1 Términos del proceso comercial

Para cada término: definición exacta en ORF (1–2 frases) y sinónimos que NO se deben usar.

| Término | Definición en ORF | Sinónimos a NO usar |
|---|---|---|
| Prospecto | | |
| Lead | | |
| Oportunidad | | |
| Propuesta | | |
| Cotización | | |
| Cierre | | |
| Postventa | | |
| Churn / Pérdida | | |
| Upsell / Cross-sell | | |
| Renovación | | |
| _(otros)_ | | |

5. ¿Hay términos que **gente fuera de ventas** usa con un significado distinto al de ustedes? ¿Cuáles?

   _Respuesta:_

   &nbsp;

   &nbsp;

### 2.2 Términos técnicos del módulo SAL (sistema)

| Término | Definición | Dónde vive (tabla/módulo/sistema) |
|---|---|---|
| | | |
| | | |
| | | |

### 2.3 Términos del catálogo

| Término | Definición |
|---|---|
| Familia de producto | |
| Línea | |
| SKU / código de producto | |
| Tipo de servicio | |
| _(otros)_ | |

6. ¿Hay **siglas internas** que solo ustedes en ventas usan? Listarlas con su significado.

   _Respuesta:_

   &nbsp;

   &nbsp;

---

## Fase 3 — IDs y códigos maestros (10 min)

> "Los nombres cambian, los IDs no. Necesito los identificadores estables que se usan en filtros y reglas."

7. ¿Qué **códigos o IDs** maneja ventas en el día a día? (cliente, producto, oportunidad, pedido, propuesta)

   _Respuesta:_

   &nbsp;

   &nbsp;

8. Si tuvieran que filtrar **todo lo de ventas** en un volcado de datos, ¿qué ID o campo usarían?

   _Respuesta:_

   &nbsp;

   &nbsp;

9. ¿Cuáles son los **estados del pipeline** y cuáles se confunden con frecuencia? (ej. "perdido" vs "no calificado" vs "frío")

   | Estado | Significado exacto | Con qué se confunde |
   |---|---|---|
   | | | |
   | | | |
   | | | |

10. ¿Qué **códigos de segmento de cliente**, **tipo de venta** o **canal** se usan?

    _Respuesta:_

    &nbsp;

    &nbsp;

---

## Fase 4 — Mapa de procesos del área (10 min)

> "Vista de pájaro: ¿cuáles son los procesos centrales de ventas? Sin entrar en detalle todavía."

11. Listemos los **5 a 10 procesos centrales** del área. Por cada uno: nombre, frecuencia, dueño operativo, sistemas que toca.

    _Pistas si se traban:_ prospección, calificación de leads, generación de propuesta, negociación, cierre, handover a facturación, renovaciones, gestión de cartera comercial, reporte de comisiones, reporte de cuota.

    | # | Proceso | Frecuencia (diario/semanal/mensual/evento) | Dueño | Sistemas que toca |
    |---|---|---|---|---|
    | 1 | | | | |
    | 2 | | | | |
    | 3 | | | | |
    | 4 | | | | |
    | 5 | | | | |
    | 6 | | | | |
    | 7 | | | | |
    | 8 | | | | |
    | 9 | | | | |
    | 10 | | | | |

---

## Fase 5 — Procesos en detalle (20–30 min)

> "Por cada proceso del mapa anterior, vamos a entrar en detalle. Si dan una fórmula o un SQL, los anoto literal."

**Repetir el siguiente bloque por cada proceso del mapa (priorizar los 3 más críticos si el tiempo aprieta).**

### 5.X — _____________________________ (nombre del proceso)

12. ¿Qué hace exactamente este proceso? (descripción funcional en 1–2 frases)

    _Respuesta:_

    &nbsp;

    &nbsp;

13. ¿Cuándo se dispara? (trigger temporal o evento)

    _Respuesta:_

    &nbsp;

14. ¿De dónde vienen los datos? (tablas, archivos, APIs, sistemas)

    _Respuesta:_

    &nbsp;

    &nbsp;

15. ¿Hay una **fórmula**, un **SQL** o un **algoritmo** detrás? (capturar **literal**)

    ```

    [espacio para fórmula/SQL textual]

    ```

16. ¿Qué **reglas críticas** rigen este proceso? (lo que SIEMPRE tiene que cumplirse)

    1. 

    2. 

    3. 

17. ¿Qué pasa si una de esas reglas se viola? (consecuencia — ayuda a entender la importancia)

    _Respuesta:_

    &nbsp;

    &nbsp;

---

_(Duplicar el bloque 5.X para cada proceso adicional)_

---

## Fase 6 — Decisiones de diseño y por qué (15 min)

> "Esta es la parte más importante: lo que un nuevo en el área NO entendería sin que se lo expliquen."

Patrón a aplicar por cada decisión: **Decisión + Motivo + Alternativa descartada**.

18. ¿Hay algo en cómo trabaja ventas que **parece raro pero hacen así por una buena razón**?

    | Decisión | Motivo | Alternativa que se descartó |
    |---|---|---|
    | | | |
    | | | |
    | | | |

19. ¿Qué **error típico** cometen los nuevos en ventas cuando entran al área?

    _Respuesta:_

    &nbsp;

    &nbsp;

20. ¿Por qué usan **X** en lugar de **Y**, si Y parece más obvio? (Pedirles ejemplos concretos)

    _Respuesta:_

    &nbsp;

    &nbsp;

---

## Fase 7 — Gotchas, casos límite y bitácora de fixes (10 min)

> "Casos raros, errores históricos que ya están corregidos pero hay que recordar. Este conocimiento es el que se pierde cuando alguien sale de vacaciones."

21. Para cada caso raro o fix histórico, capturar: síntoma / causa raíz / fix / regla derivada.

    ### Gotcha 1
    - **Síntoma observado:**
    - **Causa raíz:**
    - **Fix aplicado:**
    - **Regla derivada:**

    ### Gotcha 2
    - **Síntoma observado:**
    - **Causa raíz:**
    - **Fix aplicado:**
    - **Regla derivada:**

    ### Gotcha 3
    - **Síntoma observado:**
    - **Causa raíz:**
    - **Fix aplicado:**
    - **Regla derivada:**

---

## Fase 8 — Validaciones y referencias (10 min)

### 8.1 Validaciones obligatorias

> "¿Cómo verifican que un proceso de ventas quedó bien? ¿Qué totales tienen que cuadrar?"

| Validación | Cuándo se ejecuta | Qué verifica | Acción si falla |
|---|---|---|---|
| | | | |
| | | | |
| | | | |

Pistas: cuadre de comisiones, cumplimiento de cuota, cierre mensual, conciliación con facturación.

### 8.2 Fuentes externas

22. ¿De qué sistemas, archivos o APIs depende ventas? ¿Quién los actualiza?

    | Sistema/archivo | Tipo | Para qué se usa | Owner externo | Frecuencia |
    |---|---|---|---|---|
    | | | | | |
    | | | | | |
    | | | | | |

### 8.3 Valores de referencia (golden dataset)

> "Para que mañana alguien pueda comprobar si un proceso quedó bien, ¿hay valores conocidos para algún período?"

23. Período de referencia: _________________

    | Métrica / Concepto | Valor esperado | Notas |
    |---|---|---|
    | | | |
    | | | |
    | | | |

---

## Bloque A — Módulo SAL en sistema (15 min)

> Específico para el ángulo de "documentar el módulo de ventas en Arsys/ERP". Saltar si la conversación ya cubrió esto en fases anteriores.

24. ¿Cuáles son las **tablas principales** del módulo de ventas? (nombres exactos)

    _Respuesta:_

    &nbsp;

    &nbsp;

25. ¿Qué **vistas o queries** consulta el equipo con más frecuencia?

    _Respuesta:_

    &nbsp;

    &nbsp;

26. ¿Con qué **otros módulos** se integra ventas? (Cartera, Inventario, Tesorería, Producción, etc.) ¿Cómo es el flujo?

    _Respuesta:_

    &nbsp;

    &nbsp;

27. ¿Hay **procesos automáticos** (jobs, ETLs, triggers) que corren sobre las tablas de ventas? ¿Quién los administra?

    _Respuesta:_

    &nbsp;

    &nbsp;

---

## Bloque B — Catálogo de productos/servicios (15 min)

> Específico para el ángulo de "soporte a la fuerza comercial: qué vende ORF".

28. ¿Cuál es la **estructura jerárquica** del catálogo? (familia → línea → producto/SKU, o similar)

    _Respuesta:_

    &nbsp;

    &nbsp;

29. ¿Cuáles son los **atributos clave** que definen un producto/servicio? (precio, unidad, ficha técnica, garantía, etc.)

    _Respuesta:_

    &nbsp;

    &nbsp;

30. ¿Cuál es la **política de precios y descuentos**? ¿Hay topes de descuento por nivel del vendedor?

    _Respuesta:_

    &nbsp;

    &nbsp;

31. ¿Hay productos **retirados** que aún se mencionan? ¿Cómo se distinguen de los activos?

    _Respuesta:_

    &nbsp;

    &nbsp;

32. ¿Existe un documento o sistema "fuente de verdad" del catálogo? ¿Dónde?

    _Respuesta:_

    &nbsp;

    &nbsp;

---

## Hoja de notas libres

> Espacio para capturar lo que no encaje en ninguna pregunta: anécdotas, fórmulas dictadas literal, nombres de personas a contactar después, decisiones que el experto vaya mencionando "de pasada".

```

[espacio amplio para notas a mano]
















```

---

## Temas que derivan a OTRAS áreas (no documentar aquí)

> Si durante la reunión sale conocimiento de Cartera, Tesorería, Producción, Operaciones, etc., **anotarlo aquí brevemente** y abrir un KB separado después.

| Tema mencionado | Área a la que pertenece | Persona a entrevistar |
|---|---|---|
| | | |
| | | |
| | | |

---

## Checklist de cierre (post-reunión)

- [ ] Validar las definiciones del glosario con el experto antes de cerrar v1_0.
- [ ] Listar qué secciones quedaron como `[PENDIENTE]` y a qué persona preguntarle.
- [ ] Pasar los temas de la tabla "Temas que derivan a otras áreas" a backlog de futuras entrevistas.
- [ ] Invocar `@repertorio estandar-ia` con la skill `GOV-ENR-DocumentarArea_v1_0` para producir los tres archivos:
  - [ ] `KB-VENTAS-ProcesoComercial_v1_0.md`
  - [ ] `KB-VENTAS-ModuloSistema_v1_0.md`
  - [ ] `KB-VENTAS-Catalogo_v1_0.md`
- [ ] Una vez exista corpus → invocar `GOV-CTX-DisenarRAG_v1_0` para definir las 7 dimensiones técnicas del RAG (chunking, embedding, vector store, retrieval, re-ranking, citación, evaluación).
- [ ] Definir dataset de evaluación con ≥30 preguntas y ground truth (requisito del estándar de RAG).
