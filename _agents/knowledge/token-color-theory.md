# TOKEN — Teoría del color

## Por qué existe este documento

El sistema SYX usa OKLCH como formato de color en primitivos, prohíbe hex en componentes, y estructura los colores semánticos con nombres de función (no de valor). Este documento explica el razonamiento detrás de esas decisiones.

---

## El problema con los modelos de color tradicionales

### HEX y RGB: precisión sin percepción

`#2563eb` y `#1d4ed8` son dos azules. En hex, no hay forma de saber cuál es más claro, más saturado, o más "cercano" al otro sin un conversor. Dos valores hex a igual "distancia numérica" pueden tener diferencias perceptivas muy distintas.

El problema práctico: cuando un diseñador quiere "un azul 10% más claro", con hex necesita convertir → ajustar → verificar. Es un flujo de trabajo indirecto para una operación conceptualmente simple.

### HSL: un paso mejor, pero con problemas

HSL (Hue, Saturation, Lightness) mejora la legibilidad: `hsl(220, 90%, 56%)` comunica directamente tono, saturación y luminosidad. Pero tiene un defecto fundamental: la luminosidad (`L`) no es perceptualmente uniforme.

`hsl(220, 90%, 56%)` (azul) y `hsl(120, 90%, 56%)` (verde) tienen el mismo valor `L: 56%` en HSL, pero el verde se percibe significativamente más brillante para el ojo humano. Esto hace que las paletas construidas en HSL tengan contraste inconsistente entre colores del mismo "nivel" de luminosidad.

**El impacto en sistemas de diseño**: si construyes una escala de colores en HSL donde todos los tonos tienen `L: 50%`, los amarillos y verdes parecerán mucho más brillantes que los azules y púrpuras. Verificar el contraste de cada combinación es impredecible.

---

## Por qué OKLCH

OKLCH (OK Lightness Chroma Hue) resuelve el problema de uniformidad perceptiva. Fue desarrollado por Björn Ottosson (2020) y está basado en investigación en psicofísica de la percepción del color.

```scss
// OKLCH(Lightness Chroma Hue)
oklch(0.55 0.22 260)
//     ↑     ↑    ↑
//     L     C    H
//     Lightness (0–1, perceptualmente uniforme)
//     Chroma (saturación, 0–0.4 aprox)
//     Hue (0–360°)
```

**Lo que "perceptualmente uniforme" significa en la práctica**: si ajustas `L` en +0.1 en cualquier color OKLCH, el resultado es perceptivamente el mismo incremento de luminosidad, independientemente del tono. Esto hace que:

- Las escalas de color (50, 100, 200, … 900) tengan intervalos perceptivos consistentes
- El contraste calculado a partir de `L` sea predecible antes de ejecutar una herramienta de contraste
- Los temas oscuros se construyan de forma sistemática invirtiendo `L`, no reescribiendo todos los valores

**Soporte**: OKLCH es CSS nativo desde 2023. Soporte en todos los navegadores modernos (Chrome 111+, Firefox 113+, Safari 15.4+). Para navegadores legacy, se provee un fallback hex en el token.

**Fuente**: Björn Ottosson — [A perceptual color space for image processing](https://bottosson.github.io/posts/oklab/) (2020). La referencia técnica del espacio de color.

---

## La distribución 60/30/10 — por qué esos porcentajes

La regla del sistema: en cualquier componente, los colores se distribuyen en 60% neutral, 30% secundario, 10% acción.

Esta proporción viene del diseño de interiores y la teoría del color clásica (Josef Albers, Johannes Itten), pero se aplica directamente a interfaces:

- **60% neutral**: el fondo y las superficies. El ojo descansa aquí. Si el 60% es color de marca, la interfaz se vuelve agresiva y fatiga la vista.
- **30% secundario**: texto secundario, bordes, elementos de apoyo. Da estructura sin competir con la acción.
- **10% acción**: botones primarios, enlaces, indicadores de foco. La escasez es lo que hace que el color de acción "funcione" — si está en todas partes, deja de señalar.

**La violación más frecuente**: usar el color de acción (primary) para decoración — fondos de secciones, badges informativos, separadores de categoría. Cuando el primario aparece en contextos no interactivos, el usuario aprende a ignorarlo. Cuando finalmente aparece en un botón, ha perdido su señal.

**Regla derivada en el sistema**: `--semantic-color-primary` solo en elementos interactivos. Cualquier uso decorativo de ese color es una violación del principio.

---

## Semántica de los tokens de color — nombres de función, no de valor

El sistema nombra los tokens semánticos por su función, no por su valor:

```scss
// ✗ Nombre de valor — frágil
--semantic-color-blue-500: oklch(0.55 0.22 260);
// Si el tema cambia a rojo, el nombre es incorrecto

// ✓ Nombre de función — estable
--semantic-color-primary: var(--primitive-color-brand-500);
// El nombre describe qué hace, no qué color es
```

**Por qué esto importa para el sistema de temas**: el token `--semantic-color-primary` puede apuntar a un azul en un tema, a un rojo en otro, y a un verde en un tercero. El nombre `primary` es invariante. Si el nombre fuera `blue`, el sistema de temas sería incoherente.

**Los cinco grupos semánticos de color y su lógica:**

| Grupo | Tokens | Función |
|---|---|---|
| Superficies | `bg-primary`, `bg-secondary`, `bg-tertiary` | Jerarquía de profundidad — primary es la más lejana del usuario, tertiary la más cercana |
| Acción | `primary`, `primary-hover` | El color de marca en su función interactiva |
| Texto | `text-primary`, `text-secondary`, `text-tertiary`, `text-inverse` | Jerarquía de énfasis tipográfico |
| Bordes | `border-subtle`, `border-default`, `border-strong` | Tres niveles de separación estructural |
| Estado | `state-success`, `state-error`, `state-warning`, `state-info` | Feedback del sistema — independientes del color de marca |

**El grupo de estado es independiente de la marca**: `--semantic-color-state-success` es siempre verde, independientemente de que la marca sea roja, azul o púrpura. El verde para éxito y el rojo para error son convenciones cognitivas universales (semáforo, señalización) — sobreescribirlos con el color de marca generaría confusión.

---

## Contraste como información estructural

El contraste entre colores no es solo un requisito WCAG — es la herramienta principal para comunicar jerarquía sin usar tamaño o posición.

**El sistema de tres niveles de contraste del sistema:**

```
Alto contraste  → elementos de mayor jerarquía (N1, acciones primarias)
Medio contraste → elementos de apoyo (N2, N3, texto secundario)
Bajo contraste  → metadatos, hints, elementos decorativos
```

Cuando todos los elementos tienen el mismo contraste, la jerarquía desaparece. El diseño se percibe plano y sin dirección.

**La regla del sistema**: `--semantic-color-text-primary` para N1–N3, `--semantic-color-text-secondary` para cuerpo y apoyo, `--semantic-color-text-tertiary` para metadatos. No invertir esta jerarquía.

---

## Temas oscuros — por qué no es invertir los colores

El error más frecuente en la implementación de dark mode es invertir los valores de luminosidad directamente. El resultado es un tema oscuro que parece una foto negativa.

**El problema**: en un tema claro, las superficies más elevadas (tarjetas, modales) son más claras que el fondo. En un tema oscuro correcto, las superficies elevadas son **más claras** que el fondo oscuro (no más oscuras). La señal de elevación es la misma — las superficies cercanas al usuario son más brillantes.

**Cómo OKLCH facilita esto**: en OKLCH, incrementar `L` en +0.05 en cada nivel de superficie produce exactamente la jerarquía de elevación correcta, de forma sistemática:

```scss
// Tema oscuro con OKLCH
--primitive-color-neutral-900: oklch(0.13 0 0);  // bg-primary (fondo base)
--primitive-color-neutral-850: oklch(0.18 0 0);  // bg-secondary (tarjetas)
--primitive-color-neutral-800: oklch(0.23 0 0);  // bg-tertiary (modales)
```

Cada incremento de `L` de 0.05 produce la misma percepción de "un paso más cercano al usuario".

**Fuente**: Refactoring UI (Adam Wathan & Steve Schoger, 2018). El capítulo sobre sistemas de color es la referencia más clara sobre cómo construir escalas de color funcionales para interfaces.

---

## Principios destilados en reglas del sistema

| Principio | Regla generada | Dónde |
|---|---|---|
| Uniformidad perceptiva | OKLCH en primitivos; hex solo como fallback | `token.md`, GOVERNANCE |
| Nombres de función | `--semantic-color-primary`, no `--semantic-color-blue` | `token.md` naming convention |
| 60/30/10 | Primario solo en interactivos; neutral para superficies | `ui.md` §3 |
| Contraste como jerarquía | text-primary/secondary/tertiary por nivel editorial | `atlas-rules/10-puentes/10.0` |
| Estado independiente de marca | `state-success/error` invariantes entre temas | `token.md` semantic categories |
| Elevación en dark mode | bg-primary más oscuro que bg-secondary/tertiary | `theme.md` |

---

## Fuentes

- Björn Ottosson — [A perceptual color space for image processing](https://bottosson.github.io/posts/oklab/) (2020)
- Adam Wathan & Steve Schoger — *Refactoring UI* (2018). Referencia práctica para sistemas de color en interfaces.
- [oklch.com](https://oklch.com/) — herramienta de referencia interactiva para OKLCH
- [Reasonable Colors](https://www.reasonable.work/colors/) — paleta accesible construida en OKLCH con contraste verificado
- Josef Albers — *Interaction of Color* (1963). La referencia clásica sobre percepción del color.
- Material Design — [Color System](https://m3.material.io/styles/color/system/overview)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
