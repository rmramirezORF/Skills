# Guía para el equipo — Repertorio de Skills

Pasos básicos de git para cada persona del equipo (Deimar, Ferney, Oscar, Daniel, Reyving).

---

## 1. Descargar el proyecto

```bash
git clone https://github.com/rmramirezORF/Skills.git
cd Skills
```

---

## 2. Descargar todas las ramas

```bash
git fetch --all
```

---

## 3. Ver qué ramas hay disponibles

```bash
git branch -a
```

Verás algo así:

```
* main
  remotes/origin/Daniel
  remotes/origin/Deimar
  remotes/origin/Ferney
  remotes/origin/Oscar
  remotes/origin/Reyving
  remotes/origin/main
```

---

## 4. Entrar a tu rama

Reemplaza `{TU_NOMBRE}` por tu nombre (`Deimar`, `Ferney`, `Oscar`, `Daniel` o `Reyving`).

```bash
git checkout -b {TU_NOMBRE} origin/{TU_NOMBRE}
```

---

## 5. Antes de pushear — descargar los cambios de main a tu rama

**Siempre** hacer este paso antes de subir cambios. Trae lo último de `main` hacia tu rama (NO sube nada de tu rama a main).

```bash
# Descarga lo último de main desde GitHub a tu copia local
git fetch origin main

# Aplica esos cambios dentro de tu rama actual
git merge origin/main
```

Tus cambios siguen en tu rama. Solo se actualizan los archivos que main modificó.

---

## 6. Pushear tu trabajo a tu rama

```bash
git add .
git commit -m "<mensaje claro de lo que agregaste>"
git push origin {TU_NOMBRE}
```

Cuando termines, avisar al responsable del repo para que haga el merge a `main`.
