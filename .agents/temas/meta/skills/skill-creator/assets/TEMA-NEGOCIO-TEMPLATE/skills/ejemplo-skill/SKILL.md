---
name: {nombre-skill}
description: >
  {Una frase que diga qué hace la skill dentro del dominio}.
  Trigger: SOLO se carga si el repertorio está activo (@repertorio) Y el prompt
  pertenece al tema de negocio `{nombre-tema}` (mencionado explícitamente o
  detectado en el índice). Señales adicionales: {palabras clave del dominio
  que confirman activación}.
---

## Purpose

{Qué problema concreto del negocio resuelve esta skill.}

---

## When to Use

- {Caso de uso 1}
- {Caso de uso 2}
- {Caso de uso 3}

---

## Instructions

1. {Paso 1}
2. {Paso 2}
3. {Paso 3}

---

## Input Format

```json
{
  "{campo_entrada_1}": "{tipo}",
  "{campo_entrada_2}": "{tipo}"
}
```

---

## Output Format

Return ONLY a valid JSON object:

```json
{
  "{campo_salida_1}": "{tipo}",
  "{campo_salida_2}": "{tipo}"
}
```

---

## Rules

- {Regla 1 del negocio}
- {Regla 2 del negocio}
- {Validación obligatoria}
- NO {anti-patrón a evitar}

---

## Example

**Input:**
```json
{ }
```

**Output:**
```json
{ }
```
