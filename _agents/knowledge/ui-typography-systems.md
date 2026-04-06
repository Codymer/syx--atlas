# UI — Sistemas tipográficos

## Por qué existe este documento

Las reglas tipográficas de `ui.md` (tablas de `line-height`, `letter-spacing`, `font-weight`, `clamp()` para fluid type) y la escala de tokens de `token.md` tienen un fundamento en teoría tipográfica y en cómo el ojo humano procesa texto en pantalla. Este documento explica ese fundamento.

---

## El problema que un sistema tipográfico resuelve

Sin un sistema, las decisiones tipográficas son arbitrarias: cada componente tiene sus propios valores de `font-size`, `line-height` y `letter-spacing` tomados por separado. El resultado es un sistema visualmente inconsistente donde la jerarquía no es legible a primera vista y el mantenimiento es costoso.

Un sistema tipográfico resuelve tres cosas:
1. **Jerarquía perceptible**: el usuario sabe de inmediato qué es un titular y qué es texto de apoyo, sin leer el contenido
2. **Ritmo vertical**: el espacio entre líneas y bloques de texto crea un patrón predecible que reduce la carga cognitiva
3. **Escalabilidad**: una escala matemática permite añadir nuevos niveles sin romper la coherencia existente

---

## Las escalas tipográficas — por qué son matemáticas

El sistema usa una escala modular basada en una razón de **1.25** (Major Third). Los valores del sistema:

```
0.75rem  (12px) — xs
0.875rem (14px) — sm
1rem     (16px) — base
1.25rem  (20px) — md     ← ×1.25 del base
1.5rem   (24px) — lg     ← ×1.5 del base
2rem     (32px) — xl     ← ×2 del base
2.5rem   (40px) — 2xl
3.25rem  (52px) — 3xl
```

**Por qué razones matemáticas y no valores arbitrarios**: la escala modular genera un contraste perceptivo consistente entre niveles. El ojo humano percibe diferencias relativas, no absolutas. La diferencia entre 16px y 20px (×1.25) se percibe con la misma "distancia visual" que la diferencia entre 20px y 25px (también ×1.25). Si los valores son arbitrarios (16px, 18px, 22px, 28px), el contraste entre niveles es inconsistente y la jerarquía se percibe como aleatoria.

**Referencia**: Tim Brown — *More Meaningful Typography* (A List Apart, 2011). Introduce el concepto de escala modular y la herramienta modularscale.com.

---

## Line-height — por qué no es un valor decorativo

`line-height` es la propiedad tipográfica más frecuentemente mal implementada en sistemas web. Las reglas del sistema:

| Rol | `line-height` |
|---|---|
| Display / hero | 1.05–1.15 |
| Heading h2–h3 | 1.2–1.3 |
| Body | 1.5–1.65 |
| UI label | 1.3–1.4 |

**Por qué los titulares tienen `line-height` bajo (1.05–1.15)**: a tamaños grandes, un `line-height` estándar de 1.5 crea demasiado espacio entre líneas — el ojo pierde el hilo al saltar de una línea a la siguiente porque la distancia es mayor que la longitud de la línea. Los titulares cortos en cuerpos grandes necesitan un interlineado ajustado para mantener la cohesión visual del bloque.

**Por qué el body necesita `line-height` 1.5–1.65**: a 16px, las líneas de texto tienen una longitud de entre 60 y 80 caracteres en un layout estándar. El ojo necesita espacio suficiente entre líneas para encontrar el inicio de la siguiente sin esfuerzo. Por debajo de 1.5, la densidad es excesiva y la lectura continua se vuelve fatigante.

**WCAG 1.4.12** (Text Spacing): establece que el contenido y la funcionalidad no deben perderse cuando el usuario ajusta `line-height` hasta 1.5× el tamaño de la fuente. El sistema lo cumple porque no usa `line-height` en `px` (que no escala) sino valores unitless.

**Fuente**: Richard Rutter — *Web Typography* (2017). El texto de referencia para tipografía en pantalla.

---

## Letter-spacing — la regla de los negativos en titulares

| Rol | `letter-spacing` |
|---|---|
| Display / hero | −0.03em a −0.05em |
| Heading h2–h3 | −0.02em a −0.03em |
| Body | 0 |
| UI label / caption | +0.01em a +0.02em |
| Overline | +0.08em a +0.12em |

**Por qué los titulares tienen `letter-spacing` negativo**: el kern óptico de las fuentes está diseñado para tamaños de texto de cuerpo. A tamaños grandes, el espacio entre caracteres parece excesivo — el set de kerning no escala linealmente con el tamaño. Un `letter-spacing: -0.03em` en un titular de 40px compensa esa percepción y hace que el bloque se lea como una unidad más cohesionada.

**Por qué las etiquetas y overlines tienen `letter-spacing` positivo**: a tamaños pequeños (10px–12px) y con `font-weight: 600–700`, los caracteres tienden a "pegarse" visualmente. El espaciado positivo, combinado con `text-transform: uppercase`, aumenta la legibilidad y da peso visual a elementos que de otro modo serían demasiado ligeros en la jerarquía.

**Fuente**: práctica estándar documentada en Material Design Typography Guidelines y Apple Human Interface Guidelines.

---

## Fluid type con `clamp()` — por qué y cuándo

El sistema exige `clamp()` para titulares N1 y N2 (editorial) y para cualquier display heading en componentes:

```scss
font-size: clamp(var(--primitive-type-xl), 4vw, var(--primitive-type-3xl));
// = clamp(2rem, 4vw, 3.25rem)
// En 320px: 4vw = 12.8px → se aplica el mínimo: 2rem (32px)
// En 800px: 4vw = 32px → entre los límites: 32px
// En 900px: 4vw = 36px → se aplica el máximo: 3.25rem (52px)
```

**Por qué no simplemente breakpoints**: con dos breakpoints (mobile / desktop), el texto salta de tamaño en un punto concreto. En los viewports intermedios — donde más tiempo pasa el usuario en tablet — el tamaño puede ser incorrecto. `clamp()` produce una curva continua, no un escalón.

**Por qué solo en N1/N2 y no en body**: el texto de cuerpo a 1rem (16px) está en el rango óptimo de legibilidad para todos los viewports comunes. Hacer el body fluido introduce variabilidad en la longitud de línea que puede perjudicar la legibilidad. La fluidez tiene más valor donde la diferencia de tamaño entre mobile y desktop es significativa — es decir, en los titulares grandes.

**Referencia**: Utopia.fyi — herramienta de referencia para fluid type y fluid space. Contextualiza el uso de `clamp()` en sistemas de diseño.

---

## Font stacks — por qué el sistema usa los que usa

### Titulares: `'Georgia', 'Times New Roman', serif`

Georgia fue diseñada específicamente para pantallas (Matthew Carter, 1993). Tiene un x-height alto, trazos robustos y un serif legible a tamaños intermedios. Es la serif de pantalla más ampliamente soportada sin necesidad de descarga.

`Times New Roman` es el fallback — menos legible en pantalla, pero universalmente disponible.

**Por qué serif para titulares editoriales**: en el contexto de prensa y editorial, la serif comunica autoridad, tradición y peso informativo. Es una señal semántica, no solo estética. Un periódico digital con titulares sans-serif parece una app, no una publicación.

### Cuerpo y UI: `system-ui, -apple-system, sans-serif`

`system-ui` usa la fuente del sistema operativo del usuario: San Francisco en macOS/iOS, Segoe UI en Windows, Roboto en Android. Ventajas:

- Cero descarga de fuente → rendimiento óptimo
- Máxima legibilidad en cada plataforma (las fuentes del sistema están hinted para esa pantalla)
- Coherencia con el OS — el usuario ya la conoce

**Por qué no una fuente web personalizada para el cuerpo**: las fuentes web añaden latencia (incluso con preload y font-display: swap). Para texto de alta densidad — listas de noticias, metadatos, UI — el coste de rendimiento no justifica la ganancia estética.

---

## Principios destilados en reglas del sistema

| Principio tipográfico | Regla generada | Dónde |
|---|---|---|
| Escala modular 1.25× | Escala de primitivos `--primitive-type-*` | `token.md`, `tokens.json` |
| Line-height por rol | Tabla de valores en Visual Design Principles | `ui.md` §2 |
| Letter-spacing negativo en titulares | Tabla de valores en Visual Design Principles | `ui.md` §2 |
| Fluid type con clamp() | Obligatorio en N1/N2 y display headings | `ui.md` §2, `token.md` |
| No line-height en px | Prohibición explícita — solo unitless o token | `ui.md` checklist |
| Serif editorial / sans UI | Font stacks en `10.0` de Atlas Rules | `atlas-rules/10-puentes/` |

---

## Fuentes

- Richard Rutter — *Web Typography* (Book Apart, 2017)
- Tim Brown — [More Meaningful Typography](https://alistapart.com/article/more-meaningful-typography/) (A List Apart, 2011)
- [Utopia.fyi](https://utopia.fyi/) — fluid type y fluid space con clamp()
- [Modularscale.com](https://www.modularscale.com/) — generador de escalas modulares
- Material Design — [Typography System](https://m3.material.io/styles/typography/overview)
- Apple HIG — [Typography](https://developer.apple.com/design/human-interface-guidelines/typography)
- WCAG 2.1 — [1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG21/Understanding/text-spacing.html)
