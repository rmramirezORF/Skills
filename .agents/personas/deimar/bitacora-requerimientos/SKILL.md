---
name: bitacora-requerimientos
description: Gestiona la bitácora diaria de requerimientos de Deimar Cuchimba en `D:\OneDrive - ORF S.A\REQUERIMIENTOS\Apps Mobile\BitacoraRequerimientos.xlsx`. Úsala cuando el usuario diga "bitácora", "bitacora", "registrar sesión", "anotar requerimiento", "agregar entrada", "actualizar bitácora", o mencione registrar horas/sesiones de trabajo. La skill conoce el esquema, calcula horas automáticamente, cierra Excel si está abierto, y preserva la información existente.
---

# Bitácora de Requerimientos — Apps Mobile

## Archivo

```
D:\OneDrive - ORF S.A\REQUERIMIENTOS\Apps Mobile\BitacoraRequerimientos.xlsx
```

Respaldo: `BitacoraRequerimientos.bak.xlsx` en la misma carpeta. **Genera respaldo antes de cada modificación destructiva** (sobrescribe el .bak).

## Esquema (hoja `Bitacora`, tabla `tblReq`, headers en fila 3)

| Col | Campo | Tipo | Notas |
|-----|-------|------|-------|
| A | ID | fórmula | `=IF(B{r}="","",ROW()-3)` |
| B | FechaContacto | fecha | `dd/mm/yyyy` |
| C | HoraContacto | hora | `h:mm AM/PM` |
| D | Usuario | texto | Catálogo: Liliana Tovar, Rodrigo Carreño, Jose Nelson, Leandro Cuellar, Deimar Cuchimba |
| E | Canal | texto | Teams / Correo / Llamada / Presencial / WhatsApp / Otro |
| F | Tipo | texto | Bug / Nuevo / Consulta / Soporte / Cambio / Mejora / Reunion |
| G | App/Modulo | texto | App Vendedor / App Mercaderista / App Cartera / App Despacho / Backend / Reporte / Otro |
| H | Descripcion | texto | |
| I | Prioridad | texto | Alta / Media / Baja |
| J | AtendidoInmediato | texto | Sí / No |
| K | EnQueEstaba | texto | Si J=No, qué estaba haciendo |
| L | HoraPrimeraResp | hora | Si atendido inmediato → igual a C |
| M | TiempoResp | fórmula | `=IF(OR(C{r}="",L{r}=""),"",L{r}-C{r})` |
| N | FechaCompromiso | fecha | opcional |
| O | Estado | texto | Pendiente / EnProceso / Pausado / Cerrado / Escalado / Cancelado |
| P | FechaCierre | fecha | |
| Q | TiempoTotal(d) | fórmula | `=IF(OR(B{r}="",P{r}=""),"",P{r}-B{r})` |
| R | DiasAbierto | fórmula | `=IF(B{r}="","",IF(OR(O{r}="Cerrado",O{r}="Cancelado"),"",TODAY()-B{r}))` |
| S | SolucionAplicada | texto | |
| T | EvidenciaLink | texto | |
| U | Observaciones | texto | |
| V | HoraFin | hora | `h:mm AM/PM` — campo CLAVE para calcular horas |
| W | HorasOcupadas | fórmula | `=IF(OR(C{r}="",V{r}=""),"",(V{r}-C{r})*24)` (horas decimales) |

**Dashboard E28** = `=IFERROR(SUM(tblReq[HorasOcupadas]),0)` — total de horas Deimar.

## Configuración del usuario (hoja `Config`)

- Nombre: Deimar Cuchimba
- Cargo: Desarrollador Backend Apps Mobile
- Email: dcuchimba@orf.com.co
- SLA Respuesta (h): Alta=2, Media=8, Baja=24
- SLA Resolución (d): Alta=1, Media=5, Baja=15

## Flujo de trabajo

### 1. Antes de escribir

Si el archivo está bloqueado (`PermissionError` al cargar con openpyxl), Excel lo tiene abierto. Cierra solo ese workbook vía COM:

```python
import win32com.client as w32, pythoncom
pythoncom.CoInitialize()
try:
    excel = w32.GetActiveObject('Excel.Application')
    for wb in list(excel.Workbooks):
        if wb.Name.lower() == 'bitacorarequerimientos.xlsx':
            wb.Save()
            wb.Close(SaveChanges=True)
            break
    if excel.Workbooks.Count == 0:
        excel.Quit()
except Exception:
    pass  # Excel no estaba abierto
```

Si `pywin32` no está: `python -m pip install --quiet pywin32`. **Nunca uses `taskkill`** — perdería trabajo de otros workbooks.

### 2. Respaldo

```python
import shutil
src = r'D:\OneDrive - ORF S.A\REQUERIMIENTOS\Apps Mobile\BitacoraRequerimientos.xlsx'
shutil.copy2(src, src.replace('.xlsx', '.bak.xlsx'))
```

### 3. Encontrar la siguiente fila vacía

La tabla `tblReq` ocupa `A3:W{N}`. La fila de datos vacía es la primera donde `B{r}` es `None`. Empieza a buscar desde la fila 4. Si toda la tabla está llena, hay que extender `tbl.ref` para incluir una fila más.

```python
def next_row():
    end_row = int(tbl.ref.split(':')[1].lstrip('ABCDEFGHIJKLMNOPQRSTUVWXYZ'))
    upper = max(end_row + 1, 50)  # también busca más allá del table ref
    r = next((i for i in range(4, upper+1) if ws.cell(row=i, column=2).value is None), None)
    if r is None:
        r = upper + 1
    if r > end_row:
        tbl.ref = f'A3:W{r}'  # extender DE INMEDIATO
    return r

# Importante: si insertas varias filas en el mismo run, llama next_row() ANTES
# de cada inserción y, después de escribir B (FechaContacto), la siguiente
# llamada encontrará la fila libre correctamente.
```

### 4. Insertar registro

```python
from datetime import datetime, time
from copy import copy

def copy_style(ws, src_row, dst_row, ncols=23):
    for c in range(1, ncols+1):
        s, d = ws.cell(row=src_row, column=c), ws.cell(row=dst_row, column=c)
        if s.has_style:
            d.font, d.fill, d.border, d.alignment = copy(s.font), copy(s.fill), copy(s.border), copy(s.alignment)
            d.number_format = s.number_format

# Copia formato de la última fila con datos para mantener look & feel
last_filled = r - 1
copy_style(ws, last_filled, r)

ws.cell(row=r, column=1).value  = f'=IF(B{r}="","",ROW()-3)'                 # ID
ws.cell(row=r, column=2).value  = datetime(yyyy, mm, dd)                     # FechaContacto
ws.cell(row=r, column=2).number_format = 'dd/mm/yyyy'
ws.cell(row=r, column=3).value  = time(hh, mm)                               # HoraContacto
ws.cell(row=r, column=3).number_format = 'h:mm AM/PM'
ws.cell(row=r, column=4).value  = 'Usuario'
ws.cell(row=r, column=5).value  = 'Teams'
ws.cell(row=r, column=6).value  = 'Tipo'
ws.cell(row=r, column=7).value  = 'App/Modulo'
ws.cell(row=r, column=8).value  = 'Descripción'
ws.cell(row=r, column=9).value  = 'Prioridad'
ws.cell(row=r, column=10).value = 'Sí'                                       # AtendidoInmediato
ws.cell(row=r, column=11).value = ''                                         # EnQueEstaba (si No)
ws.cell(row=r, column=12).value = time(hh, mm)                               # HoraPrimeraResp
ws.cell(row=r, column=12).number_format = 'h:mm AM/PM'
ws.cell(row=r, column=13).value = f'=IF(OR(C{r}="",L{r}=""),"",L{r}-C{r})'   # TiempoResp
ws.cell(row=r, column=15).value = 'Cerrado'                                  # Estado
ws.cell(row=r, column=16).value = datetime(yyyy, mm, dd)                     # FechaCierre
ws.cell(row=r, column=16).number_format = 'dd/mm/yyyy'
ws.cell(row=r, column=17).value = f'=IF(OR(B{r}="",P{r}=""),"",P{r}-B{r})'   # TiempoTotal
ws.cell(row=r, column=18).value = f'=IF(B{r}="","",IF(OR(O{r}="Cerrado",O{r}="Cancelado"),"",TODAY()-B{r}))'
ws.cell(row=r, column=19).value = 'Solución'                                 # SolucionAplicada
ws.cell(row=r, column=21).value = 'Observaciones'
ws.cell(row=r, column=22).value = time(hh, mm)                               # HoraFin
ws.cell(row=r, column=22).number_format = 'h:mm AM/PM'
ws.cell(row=r, column=23).value = f'=IF(OR(C{r}="",V{r}=""),"",(V{r}-C{r})*24)'  # HorasOcupadas

wb.save(path)
```

### 5. Recálculo de fórmulas

`scripts/recalc.py` del skill `xlsx` falla en Windows (usa `socket.AF_UNIX`). **No lo uses**: Excel recalcula automáticamente al abrir el archivo. Si el usuario lo necesita inmediato, dile que lo abra una vez.

## Reglas

1. **Nunca pierdas datos.** Antes de modificar, lee y respalda. Si dudas de un valor, pregúntale al usuario antes de sobrescribir.
2. **Hora siempre en formato 24h interno** (`time(13, 0)` no `time(1, 0)`).
3. **Fecha**: usa siempre la fecha REAL de la sesión (hoy o cuando ocurrió). Si el usuario dice "ayer/hoy", calcula la fecha absoluta antes de escribir.
4. **HorasOcupadas**: cualquier registro de tipo Reunion/Soporte/etc. donde el usuario dé hora de inicio + fin debe llevar `HoraContacto` y `HoraFin` para que la fórmula calcule. Si solo dan duración ("1 hora"), calcula el HoraFin = HoraContacto + duración.
5. **Estado por defecto** según contexto:
   - Si el usuario describe la sesión completa (start + end conocidos) → `Cerrado` con `FechaCierre` = mismo día.
   - Si solo dice que se inició → `EnProceso`.
6. **AtendidoInmediato**: por defecto `Sí`. Solo `No` si el usuario dice que estaba ocupado.
7. Después de escribir, muestra al usuario un resumen breve de lo que quedó: ID, hora, descripción, horas calculadas.
8. **Reabrir Excel** después de modificar solo si el usuario lo pide. Por defecto deja el archivo cerrado.
9. **SolucionAplicada (col S) NUNCA debe quedar vacía.** Siempre llena este campo, incluso si el ítem está EnProceso. Si todavía no hay solución concreta, escribe el alcance/avance: "Asistencia a sesión de X", "Reunión para definir Y", "Análisis enviado por email", etc. Cuando luego cierres el ítem, actualiza con la solución final.
10. **Observaciones (col U)**: complementa con detalles puntuales (bullets, tiempos, comentarios). NO duplica SolucionAplicada — son campos distintos: S=qué se hizo/resolvió, U=notas y contexto adicional.

## Catálogos (hoja `Catalogos`) — valores válidos

- **Canal**: Teams, Correo, Llamada, Presencial, WhatsApp, Otro
- **Tipo**: Bug, Nuevo, Consulta, Soporte, Cambio, Mejora, Reunion
- **App/Modulo**: App Vendedor, App Mercaderista, App Cartera, App Despacho, Backend, Reporte, Otro
- **Prioridad**: Alta, Media, Baja
- **Estado**: Pendiente, EnProceso, Pausado, Cerrado, Escalado, Cancelado
- **Sí/No**: Sí, No
- **Usuario**: Liliana Tovar, Rodrigo Carreño, Jose Nelson, Leandro Cuellar (agregar a `Catalogos!H` si aparece uno nuevo)

Si el usuario menciona un valor que no está en catálogos, primero agrégalo a la columna correspondiente de `Catalogos` (las celdas vacías hacia abajo) y luego úsalo en `Bitacora`.
