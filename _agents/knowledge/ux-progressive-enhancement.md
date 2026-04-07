# UX — Progressive Enhancement y Mobile-First

## Por qué existe este documento

Las reglas de mobile-first y progressive enhancement en `_agents/modes/ux.md`, `sketch.md` y `ui.md` tienen un origen concreto. Este documento explica ese origen y los principios que las sostienen — para que puedan revisarse con criterio, no solo seguirse por inercia.

---

## El problema que estas reglas resuelven

El diseño tradicional empieza por desktop y "adapta" el resultado a mobile. Esto produce tres problemas estructurales:

1. **Contenido degradado**: lo que no cabe en mobile se elimina o esconde, pero la estructura mental del diseño sigue siendo de desktop.
2. **Complejidad acumulada**: el CSS mobile se convierte en una serie de overrides del CSS de desktop. Cuanto más crece el sistema, más costoso es mantenerlo.
3. **Priorización incorrecta**: las decisiones sobre qué es esencial se toman tarde, cuando el diseño ya tiene una jerarquía implícita de desktop.

Mobile-first invierte el orden: primero lo esencial, después la complejidad. Esto no es una preferencia estética — es una forma de gestionar la complejidad y forzar la priorización temprana.

---

## Los tres principios que fundamentan las reglas

### 1. Worst-case first (no solo mobile-first)

El principio no es "diseñar para móvil". Es diseñar para el escenario más restrictivo primero:
- Pantalla pequeña
- Conexión lenta
- Atención fragmentada
- Interacción con dedos

Si el diseño funciona en esas condiciones, escalar a condiciones mejores es trivial. Al revés es estructuralmente difícil.

**Fuentes:**
- Luke Wroblewski — *Mobile First* (libro, 2011). El texto fundacional que formaliza el enfoque.
- Brad Frost — *Atomic Design*. Aplica el mismo principio a la arquitectura de componentes.
- Google — *Mobile-First Indexing* (2018). Prueba de que el sector adoptó el principio a nivel de infraestructura.

### 2. Progressive enhancement (capas independientes)

El contenido debe ser accesible en tres capas que pueden aplicarse de forma independiente:

```
HTML → legible y navegable sin CSS ni JS
CSS  → presentación visual, layout, color
JS   → comportamiento interactivo, estados dinámicos
```

La regla no es que todos los usuarios experimenten las tres capas. Es que si una capa falla — por red lenta, JS bloqueado, CSS no cargado — el usuario no pierde acceso al contenido esencial.

**Fuentes:**
- Aaron Gustafson — *Adaptive Web Design: Crafting Rich Experiences with Progressive Enhancement* (2011). La referencia clásica.
- Kontra Agency — "Mobile-first approach in web development": explica la filosofía de "progressive enhancement" como construir primero lo esencial y ampliar.
- W3C — *Understanding Progressive Enhancement*: define las tres capas y su independencia.

### 3. Content priority = DOM order

La estructura del HTML debe reflejar la prioridad del contenido para el usuario, no la composición visual en desktop. Dos razones:

**Accesibilidad**: los lectores de pantalla y la navegación por teclado siguen el orden del DOM. Si el N1 editorial está en la segunda columna pero es el cuarto elemento en el DOM, el usuario que no ve la pantalla llega a él tarde.

**Rendimiento**: el navegador renderiza y prioriza la carga según el orden del DOM. El contenido principal debe estar disponible antes.

El reordenado visual para desktop se hace con CSS (`order`, `grid-template-areas`) — nunca duplicando el HTML.

**Fuentes:**
- Webflow — "A guide to mobile-first design": explica jerarquía de contenido y responsive layouts con este principio.
- WCAG 2.1 — Criterion 1.3.2 (Meaningful Sequence): el orden del DOM debe preservar el sentido del contenido.

---

## Lo que dicen las fuentes que el usuario mencionó

**Figma Resource Library — Mobile-First Design**: enfatiza la idea base — las ventajas de empezar por pantallas pequeñas y las mejores prácticas. Útil para entender el "qué" y el "por qué estratégico".

**BrowserStack — Mobile First Design: What it is & How to implement it**: muestra el proceso paso a paso desde boceto en móvil hasta adaptación a tablet y desktop. Útil para ver la secuencia de trabajo.

**Webflow — A guide to mobile-first design**: aterriza principios prácticos: jerarquía de contenido, responsive layouts, rendimiento. Muy alineado con lo que hacen las reglas de UX mode.

**MilesWeb — Designing for Mobile-First**: aporta criterios concretos sobre comportamiento de usuarios móviles, interacción táctil, compatibilidad y optimización de imágenes.

**Casper Creative — Mobile-first, Responsive Design**: distingue correctamente entre mobile-first y responsive design. No son lo mismo: responsive es la técnica CSS; mobile-first es la estrategia de diseño. Un sistema puede ser responsive sin ser mobile-first.

**Kontra Agency — Mobile-first approach in web development**: explica la filosofía de progressive enhancement — construir primero lo esencial y luego ampliar. El vínculo más directo con las reglas de capas de UX mode.

---

## Principios destilados en reglas del sistema

| Principio | Regla generada | Dónde |
|---|---|---|
| Worst-case first | Base CSS para 320px; breakpoints solo con `min-width` | `ux.md` §5, `ui.md` §8, `sketch.md` |
| Capas independientes | Documentar estado no-JS de cada componente interactivo | `ux.md` §6 |
| DOM order = prioridad | Elementos en HTML en orden de lectura; CSS `order` para reordenar | `ux.md` §6, `sketch.md` |
| No ocultar con CSS lo accesible en HTML | Prohibición de `display:none` en content layer sin alternativa | `audit.md` checks |
| Contenido no en `::before`/`::after` | Contenido con significado solo en HTML | `audit.md` checks |
| No `max-width` queries | Señal de mobile-last; solo `min-width` en componentes | `ui.md` §8, `audit.md` |

---

## Lo que NO recogen las reglas actuales (posibles extensiones)

- **Optimización de imágenes**: mobile-first implica `srcset` y `loading="lazy"`. Las reglas de UX mode no cubren esto explícitamente.
- **Performance budget**: mobile-first incluye un presupuesto de rendimiento (tiempo de carga, tamaño de bundle). El sistema no tiene reglas de performance en AUDIT.
- **Touch gestures**: más allá del target size de 44px, los gestos táctiles (swipe, long-press, pinch) no tienen reglas documentadas para componentes interactivos complejos.

Estas podrían añadirse a los modes si el sistema crece en esa dirección.
