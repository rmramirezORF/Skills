---
name: gov-ctx-nombrar-activo-ia-v1-0
description: >
  Genera el nombre canónico de un activo de IA siguiendo ORF-STD-IA-2026-01:
  FUENTE-TIPO-Nombre_vMAJOR_minor. Hace las preguntas necesarias al usuario
  (proceso, fuente, tipo, descripción) para construir un nombre válido y
  único.

  Trigger: SOLO se carga si el repertorio está activo (@repertorio) Y el
  prompt pertenece al tema `estandar-ia` o menciona: "nombrar activo",
  "crear activo de IA", "nombre de prompt", "código del activo",
  "FUENTE-TIPO". Si NO hay @repertorio, NO cargar.
---

# Nombrar activo de IA — Estándar ORF

## Cuándo se ejecuta

Cuando alguien va a crear un activo de IA nuevo (prompt, agente, asistente) y necesita un nombre canónico que cumpla el estándar `ORF-STD-IA-2026-01`.

---

## Proceso (5 pasos)

### Paso 1 — Recolectar el caso de uso

Pregunta al usuario:

> "¿Qué hace el activo? Descríbelo en una frase."

Con esa frase deduces los campos siguientes (y confirmas con el usuario).

### Paso 2 — Determinar el segmento ① (Proceso o Fuente)

Por defecto se prefiere **Proceso de negocio**. Si el activo es agnóstico de proceso, usar **Fuente/Dominio**.

| Tabla | Códigos disponibles |
|---|---|
| Proceso | `FIN`, `SAL`, `SCM`, `OPS`, `HR`, `CST`, `MKT`, `EXE` |
| Fuente | `ERP`, `CRM`, `CONV`, `FUSE`, `PRED`, `ALERT`, `SYS`, `GOV` |

**Si no es claro** → preguntar:
> "¿A qué proceso de negocio sirve este activo? (FIN, SAL, SCM, OPS, HR, CST, MKT, EXE) — o, si no aplica a un proceso específico, ¿qué fuente técnica usa? (ERP, CRM, CONV, FUSE, PRED, ALERT, SYS, GOV)"

Ver [referencias/dimensiones.md](../../referencias/dimensiones.md) para descripciones completas.

### Paso 3 — Determinar el segmento ② (Tipo)

| Código | Cuándo usarlo |
|---|---|
| `CTX` | Define reglas/contexto que otros prompts consumen |
| `QRY` | Genera consultas (T-SQL, etc.) sobre datos |
| `ENR` | Procesa datos no estructurados → estructura |
| `RTR` | Detecta intención y enruta |
| `SUM` | Resume/narra resultados al humano |
| `VAL` | Valida output (gatekeeper) |
| `ALS` | Alertas sobre umbrales |
| `RPT` | Reportes recurrentes estructurados |

**Si no es claro** → preguntar tipo al usuario con la tabla anterior.

### Paso 4 — Construir el nombre conceptual

Formato: `PalabraConcepto1_PalabraConcepto2`

Reglas:
- **PascalCase** dentro de cada concepto: `VencimientoCliente`, no `vencimiento_cliente` ni `vencimientocliente`
- **`_` (snake_case)** para separar conceptos: `Cartera_VencimientoCliente`
- Sin tildes, sin espacios, sin caracteres especiales
- Descriptivo pero conciso (2-4 palabras conceptuales máximo)

**Ejemplos:**
- ✅ `Cartera_VencimientoCliente`
- ✅ `PipelineSemanal`
- ✅ `ComitéMensual` _(tilde permitida si es necesario)_
- ❌ `cartera_vencimiento_cliente` (debería ser PascalCase en cada concepto)
- ❌ `cart_venc_cli` (demasiado críptico)
- ❌ `Cartera Vencimiento Cliente` (espacios)

### Paso 5 — Asignar versión inicial

Si el activo es **nuevo** → `v1_0`.

Si el activo es una **migración de uno existente sin estandarizar** → `v1_0` (el "primer release estable bajo el nuevo estándar").

### Paso 6 — Componer y validar

Resultado:
```
{Segmento①}-{Segmento②}-{Nombre}_v{MAJOR}_{minor}
```

Ejemplo final:
```
FIN-QRY-Cartera_VencimientoCliente_v1_0
```

Mostrar al usuario:
- Nombre completo propuesto
- Significado de cada segmento
- Confirmación: "¿Lo apruebo?"

---

## Output esperado

```yaml
nombre_completo: FIN-QRY-Cartera_VencimientoCliente_v1_0
segmentos:
  fuente_o_proceso: FIN  # Finance
  tipo: QRY              # Prompt de consulta
  nombre: Cartera_VencimientoCliente
  version: v1_0
significado: >
  Activo del proceso Finance, tipo prompt de consulta,
  que genera T-SQL para vencimiento de cartera por cliente.
```

---

## Reglas

- ✅ Si el usuario no provee proceso/fuente claro, **preguntar** — no asumir.
- ✅ El nombre conceptual debe ser específico (no `Cartera_Reporte`, sino `Cartera_VencimientoCliente`).
- ✅ Validar que el nombre completo no exista ya en el catálogo (en futuro: revisar contra registro centralizado).
- ❌ NO inventar códigos fuera de los 24 cerrados (8 fuente + 8 proceso + 8 tipo).
- ❌ NO empezar versiones en `v0_x` ni en `v1_1`. Las versiones nuevas siempre arrancan en `v1_0`.

---

## Anti-patrones

- ❌ Nombres genéricos: `FIN-QRY-Reporte_v1_0` (¿reporte de qué?)
- ❌ Nombres con info redundante: `FIN-QRY-FinanzasReporteFinanciero_v1_0`
- ❌ Mezclar idiomas inconsistentemente: `FIN-QRY-Sales_PipelineComercial_v1_0`
- ❌ Versiones no estándar: `v1.0.3`, `1.0`, `final`, `v_final`

---

## Ejemplo de interacción

**Usuario:** _"@repertorio estandar-ia: nombra el prompt que genera el reporte semanal de pipeline para el equipo de ventas"_

**Skill:**
> Voy a construir el nombre canónico. Detecto:
> - **Proceso:** SAL (Sales — pipeline comercial)
> - **Tipo:** RPT (reporte recurrente estructurado)
> - **Nombre conceptual:** Pipeline_Semanal
> - **Versión:** v1_0
>
> Nombre propuesto: **`SAL-RPT-Pipeline_Semanal_v1_0`**
>
> ¿Lo apruebas o quieres ajustar algún segmento?

**Usuario:** _"Sí, perfecto"_

**Skill:** _(devuelve el output YAML completo y opcionalmente sugiere crear el archivo plantilla con `estructurar-prompt`)_
