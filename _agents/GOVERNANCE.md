# GOVERNANCE — Compatibilidad SYX Modes + Atlas Rules

## Naturaleza de este documento

Este documento define cómo operan juntos los dos sistemas de reglas del repositorio:

- **SYX Modes** (`_agents/modes/`) — autoridad de implementación: SCSS, tokens, componentes, temas.
- **Atlas Rules** (`_agents/atlas-rules/`) — autoridad estructural: jerarquía editorial, layout, densidad, contexto, relaciones proporcionales.

Cuando se invocan de forma conjunta, este documento es la fuente de verdad para resolver conflictos de reglas.

---

## Modelo jerárquico

```
[ATLAS]:  modelo mental — decide qué construir y por qué
             jerarquía editorial, densidad, zonas, proporciones, context-first

[SYX: MODE]:  herramienta técnica — ejecuta lo que Atlas ha decidido
             SCSS, tokens, HTML, auditoría, migración
```

Atlas no es un igual de los modes. Es la capa que los envuelve y les da contexto.
Cuando `[ATLAS]:` está activo, el mode SYX recibe las decisiones editoriales ya tomadas — no las toma él.

**Sintaxis de invocación combinada:**

```
[ATLAS]: descripción de la tarea utilizando [SYX: MODE]
```

Ejemplos:
```
[ATLAS]: Genera una portada de noticias económicas utilizando [SYX: UX]
[ATLAS]: Implementa el componente org-hero-principal utilizando [SYX: UI]
[ATLAS]: Audita portada-economia.html utilizando [SYX: AUDIT]
[ATLAS]: Define los tokens para el sistema editorial usando [SYX: TOKEN]
```

Sin `[ATLAS]:`, el mode SYX corre en modo standalone — sin contexto editorial, sin jerarquía, sin context-first de Atlas. Útil para tareas puramente técnicas donde las decisiones editoriales ya están tomadas.

---

## 1. Dominios de autoridad

Cada sistema es soberano en su dominio. Ninguno sobreescribe al otro dentro de su área.

| Dominio | Sistema autoridad | Justificación |
|---|---|---|
| Token SCSS (primitivos, semánticos, componente) | **Modes** (TOKEN, UI) | Tiene validador automatizado (`syx-validate.js`), contratos R01–R08 verificables. |
| Nomenclatura de tokens en CSS | **Modes** | El sistema de prefijos `--primitive-*`, `--semantic-*`, `--component-*` está auditado y consolidado. |
| Escala de color (formato) | **Modes** | OKLCH como estándar en primitivos. Hex solo en fallbacks o en contexto Atlas-only (POC sin compilar a SCSS). |
| Naming de clases (BEM, prefijos atom/mol/org) | **Compartido** | Ambos sistemas usan `.atom-`, `.mol-`, `.org-`. Mismo patrón. Sin conflicto. |
| Jerarquía editorial (N1/N2/N3/N4) | **Atlas Rules** | Definida en `06.1`. No existe en Modes. |
| Escala tipográfica y su traducción a niveles | **Atlas Rules** | Definida en `10.0`. Modes implementa, Atlas decide la lógica de asignación. |
| Densidad, flujo y ritmo editorial | **Atlas Rules** | `06.2`. No existe en Modes. |
| Publicidad integrada en layout | **Atlas Rules** | `06.3`. No existe en Modes. |
| Decisión de qué construir y cómo se comporta | **UX mode** | Prioridades de accesibilidad, estados, flujo de interacción. |
| Implementación SCSS del componente decidido | **UI mode** | Contratos R01–R04, mixins, `@layer`. |
| Auditoría de código | **AUDIT mode + Atlas contracts** | Ver sección 5. |

---

## 2. Orden de operación cuando [ATLAS]: está activo

Cuando el prefijo `[ATLAS]:` está presente, el orden de razonamiento es siempre:

```
1. Atlas lee atlas-rules/ y determina:
   ¿qué nivel editorial es este contenido? (N1/N2/N3/N4)
   ¿qué reglas de proporción, densidad y jerarquía aplican? (04.x, 06.x)
   ¿qué restricciones context-first son relevantes? (05.x, 12.2)

2. Atlas formula el contexto editorial como input para el mode SYX:
   nivel, zona, densidad, proporciones, restricciones mobile

3. El mode SYX especificado ejecuta con ese contexto ya resuelto:
   UX → estructura HTML + estados
   TOKEN → tokens necesarios para las decisiones de Atlas
   UI → implementación SCSS
   AUDIT → auditoría R01–R08 + contratos Atlas (ver sección 5)
   SKETCH → boceto con handoff editorial en comentario
   THEME → variante visual respetando jerarquía editorial
   MIGRATE → migración con equivalencias de naming Atlas (12.1)
```

Atlas decide en los pasos 1 y 2. El mode SYX ejecuta en el paso 3.
El mode nunca retrocede a tomar decisiones editoriales.

---

## 3. Puente de tokens — Nomenclatura

El principal punto de fricción entre sistemas es el naming de tokens semánticos. Esta tabla es la referencia de equivalencias:

### Color

| Concepto | Token Modes (autoridad) | Token Atlas 08.0 (alias) | Acción |
|---|---|---|---|
| Color de acción primaria | `--semantic-color-primary` | `--semantic-color-brand` | Atlas actualiza a `--semantic-color-primary` |
| Hover del color primario | `--semantic-color-primary-hover` | `--semantic-color-brand-hover` | Atlas actualiza |
| Fondo oscuro (cabecera/footer) | `--semantic-color-bg-inverse` | `--semantic-color-brand-dark` | Atlas actualiza |
| Fondo de página | `--semantic-color-bg-primary` | `--semantic-color-bg` | Atlas actualiza |
| Fondo de tarjeta/superficie | `--semantic-color-bg-secondary` | `--semantic-color-surface` | Atlas actualiza |
| Hover de superficie | `--semantic-color-bg-tertiary` | `--semantic-color-surface-hover` | Atlas actualiza |
| Texto principal | `--semantic-color-text-primary` | `--semantic-color-text-primary` | ✅ Idéntico |
| Texto secundario | `--semantic-color-text-secondary` | `--semantic-color-text-secondary` | ✅ Idéntico |
| Texto muted | `--semantic-color-text-tertiary` | `--semantic-color-text-muted` | Atlas actualiza |
| Borde suave | `--semantic-color-border-subtle` | `--semantic-color-border` | Atlas actualiza |
| Borde fuerte | `--semantic-color-border-strong` | `--semantic-color-border-strong` | ✅ Idéntico |

### Spacing

| Concepto | Token Modes (autoridad) | Token Atlas 08.0 (alias) |
|---|---|---|
| Padding interno (contexto inset) | `--semantic-space-inset-xs/sm/md/lg/xl` | `--semantic-space-xs/sm/md/lg/xl` |
| Separación vertical entre bloques (stack) | `--semantic-space-stack-xs…xl` | `--semantic-space-xl/2xl/3xl` |
| Separación horizontal (inline) | `--semantic-space-inline-xs…xl` | Sin equivalente directo |

**Regla**: en implementación SCSS, usar siempre el token Modes. Los tokens Atlas son referencias conceptuales para documentación y razonamiento editorial.

### Formato de color en primitivos

| Contexto | Formato autorizado |
|---|---|
| Implementación SCSS compilada (Modes) | OKLCH obligatorio |
| POC HTML/CSS de Atlas (portada, pocs/) | Hex permitido (no se compila a SCSS) |
| Documentación y tablas de contraste | Hex permitido como referencia legible |

**Regla**: ningún primitivo en hex puede migrarse a SCSS sin convertirlo a OKLCH. La conversión es responsabilidad de TOKEN mode.

---

## 4. Reconciliación de `@layer`

| Sistema | Declaración actual | Estado |
|---|---|---|
| Modes (UI) | `@layer syx.atoms, syx.molecules, syx.organisms` | Activo, en producción |
| Atlas `09.0` | `@layer reset, base, tokens, atoms, molecules, organisms, utilities` | Referencia conceptual para POCs |

**Resolución**: el stack de `@layer` de **Modes es el autorizado** para implementación SCSS. El stack de Atlas `09.0` aplica solo a páginas HTML standalone que no forman parte del sistema compilado (POCs, portadas de demo).

En POCs Atlas que eventualmente se promuevan a SCSS, el stack se adapta al de Modes en el paso UI.

---

## 5. AUDIT combinado

Cuando se invoca `[ATLAS]: ... utilizando [SYX: AUDIT]`, el modo AUDIT ejecuta dos capas de verificación:

### Capa 1 — Contratos Modes (R01–R08)
Igual que el comportamiento estándar de AUDIT mode. Sin cambios.

### Capa 2 — Contratos Atlas (cuando el archivo es editorial)

Si el archivo bajo auditoría es una página editorial (portada, sección, layout), añadir estas verificaciones adicionales:

| Contrato Atlas | Verificación |
|---|---|
| `CL-03` — `@layer` declarado | Buscar `@layer` en el CSS. Si ausente → violación. |
| `CL-04` — Sin `!important` | Ya cubierto por R02. Sin duplicación. |
| `CC-03` — Sin nth-child para layout | Buscar `nth-child` con índices concretos controlando bordes o columnas. |
| `CC-05` — Controles interactivos con JS | Verificar que botones con `cursor: pointer` tienen comportamiento JS implementado. |
| `CT-02` — Sin hex crudos en componentes | Ya cubierto por R01+R07. En contexto Atlas verificar también en CSS inline. |
| `CA-01` — Jerarquía de headings | Mapear `<hN>` del documento y verificar secuencia. |
| `CP-01` — Publicidad en el grid | Verificar que `.mol-publicidad` no usa `position: absolute/fixed` fuera del flujo. |
| `CP-02` — Publicidad etiquetada | Verificar `.mol-publicidad__label` presente. |
| `10.0` — Nivel editorial → tipografía | Verificar que el único `atom-headline--3xl` o `--xl` corresponde al elemento N1 de la página. |

### Formato de reporte combinado

```
## Capa 1 — Contratos Modes (R01–R08)
[tabla estándar de AUDIT mode]

## Capa 2 — Contratos Atlas
| Contrato | Archivo | Línea | Violación | Fix |
|---|---|---|---|---|

## Jerarquía editorial detectada
N1: [elemento encontrado]
N2: [elementos encontrados — máximo esperado: 4]
N3: [elementos encontrados]
Problemas: [si hay más de 1 N1, o si N1 usa un tamaño incorrecto]

## Verdict
PASS / FAIL / PASS WITH WARNINGS
(incluir ambas capas en el veredicto)
```

---

## 6. Comportamiento de cada mode en contexto Atlas

### SKETCH — cuando atlas-rules está activo

SKETCH es el único mode que puede usar valores hardcodeados. Esta exención **se mantiene** en contexto combinado.

**Condición**: los valores hardcoded de SKETCH deben ser de la paleta grayscale definida en `sketch.md`. No pueden usar colores editoriales de Atlas (alza/baja, paleta de categorías).

**Añadir al handoff de SKETCH en contexto Atlas:**
```html
<!-- Handoff a [ATLAS + SYX: UI]: -->
<!-- Nivel editorial identificado: N[X] -->
<!-- Token tipográfico correspondiente según 10.0: atom-headline--[variante] -->
<!-- Contratos Atlas a verificar en promoción: CL-03, CC-03, CC-05 -->
```

---

### CREATIVE — cuando atlas-rules está activo

CREATIVE está exento de R01–R08. **En contexto Atlas, esta exención es parcial:**

- Exento de: R01–R08, tokens obligatorios, @layer, mixins.
- No exento de: contratos de accesibilidad Atlas (CA-01, CA-02, CA-03, CA-04).
- No exento de: jerarquía editorial. Un CREATIVE build debe mantener un N1 claro.

**Razón**: la exención de CREATIVE es técnica (no tiene que seguir la arquitectura SCSS). No es una exención de accesibilidad ni de coherencia editorial.

---

### UX — cuando atlas-rules está activo

UX mode decide qué construir. Atlas decide la jerarquía editorial de lo que UX construye.

**Añadir al razonamiento de UX en contexto Atlas:**
1. Antes de recomendar componentes: identificar el nivel editorial del contenido (N1/N2/N3/N4 según `06.1`).
2. La clase `atom-headline` recomendada debe corresponder a la tabla de `10.0`.
3. El layout recomendado debe contemplar la proporción 2:1 para grid editorial si hay sidebar de datos.
4. Los estados a documentar incluyen los 4 niveles de densidad definidos en `04.4`.

---

### TOKEN — cuando atlas-rules está activo

TOKEN mode crea los tokens técnicos. Atlas define qué tokens conceptuales necesita el sistema editorial.

**Regla de coordinación**: si TOKEN recibe una petición que incluye conceptos editoriales (jerarquía, nivel, zona editorial), debe primero consultar `10.0` para saber qué tokens tipográficos corresponden a cada nivel, y `08.0` para no duplicar tokens ya existentes.

**Regla de formato**: los primitivos que TOKEN crea para un sistema editorial que usa Atlas **deben estar en OKLCH** para el SCSS compilado. El equivalente hex se documenta en `08.0` como referencia de contraste.

---

### UI — cuando atlas-rules está activo

UI implementa lo que UX + Atlas han especificado. No toma decisiones editoriales.

**Regla adicional en contexto Atlas**: antes de la pre-flight checklist estándar de UI, verificar:
- ¿El layout usa `fr`, `%` o `clamp()` para columnas proporcionales? (no `px` fijos en grid editorial — CL-01 de Atlas).
- ¿Los `nth-child` con índices concretos se usan para layout? Si sí → reemplazar por `:last-child` o lógica de grid (CC-03 de Atlas).

---

### MIGRATE — cuando atlas-rules está activo

MIGRATE trabaja con legacy variables. En contexto Atlas, verificar adicionalmente:

- Si la variable legacy está en una página editorial (portada, sección), el reemplazo debe usar el token Modes que corresponde según la tabla de la sección 3 de este documento.
- Si la variable legacy era un alias Atlas (`--semantic-color-brand`), el reemplazo es el token Modes equivalente (`--semantic-color-primary`).

---

## 7. Resolución de conflictos entre sistemas

Cuando una regla de Modes y una regla de Atlas parecen contradecirse, aplicar este orden:

```
1. ¿Es un conflicto técnico de implementación SCSS? → Modes prevalece.
2. ¿Es un conflicto de decisión editorial (qué nivel, qué jerarquía, qué densidad)? → Atlas prevalece.
3. ¿Es un conflicto de accesibilidad? → El estándar más estricto prevalece (generalmente UX mode, que cita WCAG).
4. ¿Es un conflicto de naming de tokens? → Modes prevalece (tabla sección 3).
5. ¿Es un conflicto de formato de color? → OKLCH para SCSS (Modes), hex para POC Atlas standalone.
```

Si el conflicto no encaja en ninguno de estos casos → escalar: no resolver de forma implícita. Señalar el conflicto y documentarlo en `11.0-arbitraje-principios.md`.

---

## 8. Qué no cambia en cada sistema

Para evitar que esta gobernanza introduzca reglas implícitas que anulen las existentes:

**Lo que NO cambia en Modes:**
- R01–R08 se aplican siempre, con o sin Atlas activo.
- Las exenciones de SKETCH (valores hardcoded) y CREATIVE (sin contratos) se mantienen en su dominio técnico.
- `syx-validate.js` es el validador autorizado para SCSS.
- THEME mode usa OKLCH. Atlas no cambia esto.

**Lo que NO cambia en Atlas Rules:**
- Los 20 principios fundacionales de `01` son invariables.
- La jerarquía de arbitraje de `11.0` se mantiene.
- Los contratos de `09.0` son la referencia para HTML editorial standalone.
- El puente tipográfico de `10.0` es obligatorio en cualquier implementación editorial.

---

## 9. Archivos de referencia por escenario

| Escenario | Invocación | Archivos a consultar |
|---|---|---|
| Diseñar una portada editorial | `[ATLAS]: ... [SYX: UX]` | `06.1`, `06.2`, `10.0`, `ux.md` |
| Implementar un componente de portada | `[ATLAS]: ... [SYX: UI]` | `token.md`, `ui.md`, `08.0` → sección 3 de este doc |
| Auditar una portada compilada | `[ATLAS]: ... [SYX: AUDIT]` | `audit.md` + sección 5 de este doc |
| Crear tokens para sistema editorial | `[ATLAS]: ... [SYX: TOKEN]` | `token.md`, `10.0`, `08.0`, sección 3 de este doc |
| Migrar variables legacy en página editorial | `[ATLAS]: ... [SYX: MIGRATE]` | `migrate.md`, sección 6 de este doc |
| Hacer sketch de idea editorial | `[ATLAS]: ... [SYX: SKETCH]` | `sketch.md`, sección 6 de este doc |
| Tarea técnica sin contexto editorial | `[SYX: MODE]:` solo | Solo los archivos del mode |
| Añadir un nuevo modo | — | `README.md` (modes), actualizar sección 6 de este doc |
| Añadir una nueva regla Atlas | — | `11.1`, verificar si afecta algún mode en sección 6 |

---

## 10. Mantenimiento de este documento

Este documento es parte del sistema de gobierno (`11-gobierno/`). Se actualiza cuando:

- Se añade un modo nuevo a `_agents/modes/`
- Se añade una sección nueva a `atlas-rules/` que interactúa con Modes
- Se detecta un conflicto no cubierto en la sección 7
- Se corrige el naming de un token en cualquiera de los dos sistemas

**Responsable de actualización**: quien modifique cualquiera de los dos sistemas es responsable de verificar si este documento necesita revisión.

**Versión**: 1.0 — alineado con atlas-rules v1.1 y modes v1.x (estado actual del repositorio).
