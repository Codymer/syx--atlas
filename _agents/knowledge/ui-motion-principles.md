# UI — Principios de movimiento

## Por qué existe este documento

Las tablas de duración, easing y distancia de `ui.md` no son valores arbitrarios. Tienen un fundamento en física perceptiva, en cómo el cerebro procesa el movimiento, y en las convenciones que los sistemas de diseño maduros han establecido. Este documento explica ese fundamento.

---

## El problema que el movimiento resuelve (y el que crea)

El movimiento en UI tiene una función específica: **comunicar relaciones espaciales y de estado**. Un dropdown que aparece desde el punto de click comunica que viene de ahí. Un modal que entra desde abajo comunica que es una capa encima del contenido. Una transición de color comunica que el estado del elemento ha cambiado.

Cuando el movimiento no tiene una función de este tipo — cuando es solo decoración — es ruido. Carga cognitiva sin información. El sistema solo usa movimiento con función.

**El problema secundario**: el movimiento puede ser físicamente molesto para usuarios con vestibular disorders (un tipo de trastorno del equilibrio que afecta a millones de personas). La animación de parallax, el zoom, y el movimiento de grandes masas de contenido pueden causar náuseas y desorientación. Por eso `@include reduced-motion { … }` es obligatorio — no opcional — en el sistema.

---

## Física perceptiva — por qué los easing no son lineales

El movimiento lineal en pantalla se percibe como mecánico y artificial. Los objetos físicos reales no se mueven a velocidad constante: aceleran y desaceleran. El cerebro humano interpreta la inercia como señal de peso y naturalidad.

### Las curvas de easing del sistema

**`ease` (`cubic-bezier(0.25, 0.1, 0.25, 1.0)`):**
Inicio rápido, final suave. Para cambios de estado simples — color, opacidad — donde el elemento no se mueve en el espacio. El ojo no necesita anticipar un destino; solo ve el resultado.

**`cubic-bezier(0.4, 0, 0.2, 1)` — "Standard easing" (Material Design):**
Inicio lento, pico en el medio, final suave. Para elementos que se mueven de un punto a otro (dropdown que se abre, accordion que se expande). El inicio lento da tiempo al ojo para anticipar el movimiento; el final suave evita el "golpe" al llegar.

**`cubic-bezier(0.34, 1.56, 0.64, 1)` — "Spring easing":**
El valor `1.56` supera el límite de 1 en el eje Y — esto produce un pequeño overshooting (el elemento va ligeramente más allá de su destino y vuelve). Simula la física de un muelle. Para entradas de elementos nuevos (modals, toasts), el overshoot señala que el elemento ha "aterrizado" y es estable. El cerebro lo lee como vivo, no como flotante.

**`ease-in`:**
Inicio lento, final rápido. Únicamente para salidas (elementos que desaparecen). La razón: cuando un elemento desaparece, el usuario ya lo ha visto llegar. No necesita tiempo para anticiparlo. La salida rápida reduce el tiempo de espera percibido.

**Fuente**: Material Design — [Motion: Easing and Duration](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs). Las curvas `cubic-bezier(0.4, 0, 0.2, 1)` y `cubic-bezier(0.34, 1.56, 0.64, 1)` son el estándar de facto del sector.

---

## Duraciones — por qué los valores concretos

| Tipo de interacción | Duración del sistema | Fundamento |
|---|---|---|
| Color / opacidad | 150ms | Por debajo del umbral de percepción de "lentitud" |
| Micro-interacción | 200ms | Dentro del "immediate response" window |
| Posición / tamaño | 250–300ms | Ventana óptima para movimiento perceptible pero no lento |
| Entrada de elemento | 300–400ms | Tiempo necesario para que el ojo procese la nueva presencia |
| Salida de elemento | 75% de la entrada | La salida siempre es más rápida que la entrada |
| Transición larga / página | 400–500ms | Máximo aceptable antes de que se perciba como lento |

**El Doherty Threshold (400ms)**: IBM Research estableció en 1982 que las respuestas del sistema por encima de 400ms interrumpen el flujo del usuario — el usuario pierde el hilo y desvía la atención. Las animaciones largas deben mantenerse por debajo de este umbral o llevar un indicador de progreso.

**Por qué las salidas son 75% de las entradas**: cuando un elemento desaparece, el usuario ya tomó la decisión de descartarlo (hizo clic, cerró). La salida lenta crea fricción donde el usuario ya ha terminado su interacción. La entrada lenta es correcta porque el usuario está procesando contenido nuevo; la salida rápida confirma que el sistema respondió.

**Fuente**: Jakob Nielsen — [Response Times: The 3 Important Limits](https://www.nngroup.com/articles/response-times-3-important-limits/) (NN/g, 1993, actualizado 2014).

---

## Las propiedades que se animan — y las que nunca se animan

### Propiedades GPU-composited (seguras para animar)

```scss
// Estas propiedades no causan layout recalculation
transform: translateX(), translateY(), scale(), rotate()
opacity
filter (con precaución)
```

El navegador puede animar estas propiedades en el compositor, sin recalcular el layout del documento. La animación es fluida incluso en dispositivos de gama baja.

### Propiedades que causan layout thrash (prohibidas en animaciones)

```scss
// Animar estas propiedades recalcula el layout en cada frame
width, height
top, right, bottom, left
margin, padding
font-size
```

Cuando estas propiedades cambian, el motor de layout recalcula las posiciones de todos los elementos afectados — potencialmente toda la página. En una animación de 60fps, eso son 60 recálculos por segundo. El resultado es jank (animación irregular) en cualquier dispositivo moderado.

**La regla del sistema**: `transform` + `opacity` para todo movimiento visual. Nunca `width`/`height`/`top`/`left` animados.

**Fuente**: Paul Lewis & Paul Irish — [High Performance Animations](https://web.dev/articles/animations-guide) (web.dev).

---

## `will-change` — por qué se usa con precaución

`will-change: transform` le dice al navegador que el elemento va a ser animado, para que lo promueva a su propio layer de composición con antelación. Esto puede mejorar el rendimiento de la animación.

El problema: cada layer tiene un coste de memoria. Si se aplica `will-change` a muchos elementos, el coste de memoria supera la ganancia de rendimiento.

**Regla del sistema**: `will-change: transform` solo en el momento de la animación (añadido con JS justo antes de comenzar, eliminado cuando termina). Nunca en el CSS base del componente.

---

## `prefers-reduced-motion` — el contrato de accesibilidad

```scss
@include reduced-motion {
  animation: none;
  transition: none;
}
```

Esta media query responde a la preferencia del usuario en el sistema operativo (Settings > Accessibility > Reduce Motion en macOS/iOS; Settings > Accessibility > Remove Animations en Android).

**Afectados**: usuarios con vestibular disorders, migrañas fotosensibles, epilepsia fotosensible, y cualquier usuario que simplemente prefiera menos movimiento.

**La regla del sistema**: todas las animaciones y transiciones deben tener un bloque `@include reduced-motion { … }` que las elimine o las reemplace por un cambio instantáneo.

**Esto no significa eliminar todos los estados**: los cambios de color, opacidad mínima, o cambios de contenido no son "motion" en el sentido que `prefers-reduced-motion` quiere evitar. Lo que se elimina son los movimientos físicos (translate, scale, rotate) y las transiciones de layout.

**Fuente**: WCAG 2.1 — 2.3.3 Animation from Interactions (AAA). Web.dev — [prefers-reduced-motion: Sometimes less movement is more](https://web.dev/articles/prefers-reduced-motion).

---

## Principios destilados en reglas del sistema

| Principio | Regla generada | Dónde |
|---|---|---|
| Física perceptiva | Tabla de easing por tipo de interacción | `ui.md` §5 |
| Doherty Threshold | Duraciones máximas por tipo | `ui.md` §5 |
| Salidas más rápidas que entradas | "Exit duration = 75% of entry" | `ui.md` §5, checklist |
| Solo transform + opacity | Prohibición de animar width/height/top | `ui.md` §5, checklist |
| No `all` en transition | Cada propiedad nombrada explícitamente | `ui.md` checklist |
| reduced-motion obligatorio | `@include reduced-motion { … }` en toda animación | `ui.md` §5, checklist |
| will-change con precaución | Solo durante la animación, nunca en base | `ui.md` §5 |

---

## Fuentes

- Material Design — [Motion: Easing and Duration](https://m3.material.io/styles/motion/easing-and-duration/tokens-specs)
- Jakob Nielsen — [Response Times: The 3 Important Limits](https://www.nngroup.com/articles/response-times-3-important-limits/)
- Paul Lewis & Paul Irish — [High Performance Animations](https://web.dev/articles/animations-guide) (web.dev)
- [web.dev — prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion)
- WCAG 2.1 — [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
- Laws of UX — [Doherty Threshold](https://lawsofux.com/doherty-threshold/)
