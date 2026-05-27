---
name: {skill-name}
description: >
  {Una frase que diga qué hace la skill}.
  Trigger: SOLO se carga si el repertorio está activo (@repertorio) Y el prompt
  menciona {tema} junto con {palabras clave específicas como "...", "...", "..."}.
  Si esas condiciones no se cumplen, NO cargar.
license: Apache-2.0
---

## When to Use

Use this skill when:
- {Condition 1}
- {Condition 2}
- {Condition 3}

---

## Critical Patterns

{The MOST important rules - what AI MUST follow}

### Pattern 1: {Name}

```{language}
{code example}
```

### Pattern 2: {Name}

```{language}
{code example}
```

---

## Decision Tree

```
{Question 1}? → {Action A}
{Question 2}? → {Action B}
Otherwise    → {Default action}
```

---

## Code Examples

### Example 1: {Description}

```{language}
{minimal, focused example}
```

### Example 2: {Description}

```{language}
{minimal, focused example}
```

---

## Commands

```bash
{command 1}  # {description}
{command 2}  # {description}
{command 3}  # {description}
```

---

## Resources

- **Templates**: See [assets/](assets/) for {description of templates}
- **Documentation**: See [references/](references/) for local developer guide links

---

## Convención de description (importante para el repertorio)

El campo `description` del frontmatter es lo único que Claude lee al inicio. Debe ser preciso:

- ✅ **Sí:** "Valida que un commit cumpla conventional-commits. Trigger: SOLO con @repertorio activo + prompt menciona git/commit."
- ❌ **No:** "Skill para git." (demasiado vago, se activaría sin querer)

**Regla:** todas las skills dentro del repertorio DEBEN incluir en su description la frase
"Trigger: SOLO se carga si el repertorio está activo (@repertorio) Y ..." para evitar
sobrecontextualización.
