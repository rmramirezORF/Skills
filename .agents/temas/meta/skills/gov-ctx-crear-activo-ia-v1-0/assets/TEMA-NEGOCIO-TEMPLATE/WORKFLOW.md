---
name: {nombre-del-workflow}
description: {Descripción corta del flujo estándar de este dominio}
---

> Este WORKFLOW define una secuencia repetible de pasos para una tarea común del dominio.
> Es opcional: solo crear si hay un proceso determinista que se repite (ej. "cierre mensual",
> "liquidación de empleado", "facturación masiva").

---

## Input

```json
{
  "{parametro_1}": "{tipo}",
  "{parametro_2}": "{tipo}"
}
```

---

## Steps

1. Execute {skill-1}
   - Input: {qué se pasa}

2. Execute {skill-2}
   - Input: {qué se pasa}

3. Execute {skill-3}
   - Input: {qué se pasa}

---

## Output esperado

```json
{
  "{campo_1}": "{tipo}",
  "{campo_2}": "{tipo}"
}
```

---

## Notas

- {Particularidades del flujo}
- {Pasos opcionales o condicionales}
