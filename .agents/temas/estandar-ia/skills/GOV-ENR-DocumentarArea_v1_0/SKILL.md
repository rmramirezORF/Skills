---
name: GOV-ENR-DocumentarArea_v1_0
description: >
  Entrevista al experto de un área de ORF con preguntas directas para extraer
  conocimiento puro listo para ingerir como base de datos del agente
  (estilo Aniro). Pregunta una cosa a la vez. No inventa.

  Trigger: SOLO se carga si el repertorio está activo (@repertorio) Y el
  prompt menciona: "documentar área", "entrevistar", "extraer conocimiento",
  "construir KB", "crear RAG de", "ingerir conocimiento del área".
  Si NO hay @repertorio, NO cargar.
---

# Entrevista para documentar un área de ORF

## Cómo se ejecuta

Conversación dirigida con el experto. **Una pregunta (o un bloque pequeño y directo) por turno.** El experto responde, la skill compila la respuesta. Al final se produce un solo archivo `.md` con todo el conocimiento estructurado, listo para ingerir.

---

## Regla única

**Un documento = un área.** Si el experto se va a otra área, se abre otro documento aparte.

---

## Preguntas (en orden)

### 1. Identificación

- ¿Quién eres? (nombre + rol)
- ¿Qué área manejas?
- ¿Cuál es tu día a día en esa área?

### 2. Términos del área

- ¿Qué palabras usas en tu día a día que alguien de afuera no entendería?
- Para cada una: definición en 1-2 frases.

### 3. Procesos

- ¿Cuáles son los procesos principales del área?
- Por cada uno: qué hace, cuándo se ejecuta, quién lo dispara.

### 4. Cálculos / fórmulas

- ¿Qué cálculos importantes se hacen?
- Si hay fórmulas, SQL o reglas matemáticas → **capturar literal**, no parafrasear.

### 5. Reglas críticas

- ¿Qué reglas siempre se respetan?
- ¿Qué pasa si una regla se rompe?

### 6. Casos especiales y errores comunes

- ¿Qué casos raros confunden a la gente?
- ¿Qué errores cometen los nuevos en el área?

### 7. Sistemas y datos

- ¿En qué sistemas, tablas o archivos vive la información del área?
- ¿Hay reportes o dashboards que ya existen?

### 8. Validaciones

- ¿Cómo verifican que un proceso terminó bien?
- ¿Hay totales que tienen que cuadrar?

---

## Output

Un único archivo `.md` con el nombre `KB-{AREA}.md` (ej. `KB-VENTAS.md`, `KB-NOMINA.md`) y estas secciones:

```
# Conocimiento del área — {NOMBRE_AREA}

## 1. Identificación
## 2. Términos
## 3. Procesos
## 4. Cálculos
## 5. Reglas críticas
## 6. Casos especiales
## 7. Sistemas y datos
## 8. Validaciones
```

---

## Reglas

- ✅ Una pregunta (o bloque chico relacionado) por turno. Esperar respuesta antes de continuar.
- ✅ Capturar fórmulas, SQL y nombres de tablas **literal**.
- ✅ Si el experto no sabe → marcar `[PENDIENTE]`. NO inventar.
- ✅ Un documento = un área. Si se desvía → abrir otro documento.
- ❌ No saturar con preguntas de varias secciones a la vez.
- ❌ No sobre-estructurar (no agregar secciones que el experto no aporte).

---

## Después de la entrevista

El archivo `KB-{AREA}.md` se entrega al usuario. Tiene 2 usos posibles:

1. **Cargarlo como contexto monolítico** del agente (estilo Aniro). Funciona si cabe en el contexto del modelo.
2. **Ingerirlo en un RAG** (chunking + vector store) cuando crezca el corpus.

En ambos casos, el contenido del documento es el mismo.
