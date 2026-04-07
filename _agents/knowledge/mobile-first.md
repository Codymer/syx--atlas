# Mobile-First — Referencia transversal

## Naturaleza de este documento

Este documento es la referencia de mobile-first para todos los modes del sistema. No es UX, ni UI, ni TOKEN — es una capa de razonamiento que todos los modes aplican en su propio dominio.

Cuando un modo tiene una regla de mobile-first (breakpoints, DOM order, context-first, clamp(), no-JS states), el fundamento de esa regla está aquí.

---

## Qué es mobile-first (y qué no es)

**Mobile-first** es una estrategia de diseño que establece que la experiencia en el escenario más restrictivo se diseña primero, y la complejidad se añade de forma progresiva hacia escenarios con más recursos.

**No es**: diseñar solo para móvil, eliminar funcionalidad en móvil, o crear dos versiones del mismo producto.

**No es lo mismo que responsive design**: responsive design es la técnica CSS (`min-width`, `max-width`, `clamp()`). Mobile-first es la filosofía que decide en qué orden se aplica esa técnica. Un sitio puede ser responsive sin ser mobile-first — si el CSS de base es para desktop y se sobrescribe para móvil con `max-width`, es responsive pero mobile-last.

---

## Los tres principios que lo componen

### 1. Worst-case first

Diseñar desde el escenario más restrictivo posible:

```
Pantalla más pequeña (320px)
+ Conexión más lenta (2G/3G)
+ Atención más fragmentada (uso en movimiento)
+ Input más impreciso (dedos, no ratón)
+ Sin JS garantizado
```

Si el diseño funciona en esas condiciones, escalar hacia condiciones mejores es trivial.
Si el diseño se diseña para las condiciones óptimas y se "adapta" hacia abajo, algo siempre se pierde.

**Cómo se aplica por dominio:**

| Mode | Aplicación de worst-case first |
|---|---|
| SKETCH | Base CSS para 320px; layout de columna única por defecto |
| UX | DOM order = prioridad de contenido; estado no-JS documentado |
| UI | Breakpoints solo con `min-width`; base styles funcionales sin media query |
| TOKEN | Tokens con `clamp()` para tipografía fluida; sin tokens dependientes de viewport |
| AUDIT | Flag en `max-width` queries; flag en contenido sin estado no-JS |

---

### 2. Progressive enhancement

El contenido y la funcionalidad se construyen en capas independientes. Cada capa debe ser funcional por sí sola:

```
┌─────────────────────────────────────────────────────┐
│  Capa 3 — Comportamiento (JavaScript)               │
│  Interactividad dinámica, estados, animaciones JS   │
├─────────────────────────────────────────────────────┤
│  Capa 2 — Presentación (CSS)                        │
│  Layout, color, tipografía, espaciado               │
├─────────────────────────────────────────────────────┤
│  Capa 1 — Contenido (HTML)                          │
│  Texto legible, navegable, con jerarquía semántica  │
└─────────────────────────────────────────────────────┘
```

**Capa 1 — HTML**: el contenido es accesible sin CSS ni JS. Los headings comunican jerarquía. Los botones son `<button>`. Los enlaces son `<a>`. Un lector de pantalla, un bot de búsqueda, o un navegador que bloquea CSS/JS puede acceder a todo el contenido.

**Capa 2 — CSS**: mejora la presentación. No esconde contenido que era accesible en Capa 1. No usa `::before`/`::after` para contenido con significado. No depende de JS para aplicarse correctamente.

**Capa 3 — JS**: añade interactividad. El componente tiene un estado funcional sin JS (documentado en comentario HTML). JS mejora la experiencia, no la hace posible.

**Regla de oro**: si quitar una capa rompe el acceso al contenido, esa capa está haciendo trabajo que debería hacer la capa anterior.

---

### 3. Content priority = DOM order

La estructura del HTML refleja la prioridad del contenido para el usuario, no la composición visual en desktop.

**Por qué**: los lectores de pantalla, la navegación por teclado, y el parser del navegador siguen el orden del DOM. Si el contenido principal está en la segunda columna pero es el cuarto elemento del DOM, los usuarios que dependen de orden de lectura (tecnología asistiva, conexión lenta que carga linealmente) lo reciben tarde.

**La regla práctica**:

```html
<!-- ✓ Correcto: contenido principal primero en el DOM -->
<div class="org-grid-editorial">
  <main class="org-grid-editorial__content">   <!-- N1 y N2 aquí -->
    …
  </main>
  <aside class="org-grid-editorial__sidebar">  <!-- datos de mercado, publicidad -->
    …
  </aside>
</div>

<!-- El sidebar aparece a la derecha en desktop con CSS:
     grid-template-columns: 2fr 1fr;
     El orden del DOM no cambia. -->
```

**Reordenado visual**: siempre con CSS (`order`, `grid-template-areas`, `flex-direction: column-reverse`). Nunca duplicando el elemento HTML.

---

## Breakpoints — la implementación CSS

### Solo `min-width`

```scss
// ✓ Mobile-first: base para móvil, overrides para pantallas mayores
.mol-card-grid {
  display: grid;
  grid-template-columns: 1fr;          // móvil: columna única

  @include breakpoint(sm) {            // 640px+
    grid-template-columns: 1fr 1fr;    // dos columnas
  }

  @include breakpoint(lg) {            // 1024px+
    grid-template-columns: repeat(3, 1fr); // tres columnas
  }
}

// ✗ Mobile-last: base para desktop, overrides para pantallas menores
.mol-card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  @media (max-width: 1024px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 640px)  { grid-template-columns: 1fr; }
}
```

**Por qué `min-width` y no `max-width`**: la especificidad en CSS opera de forma acumulativa. Con `min-width`, cada breakpoint añade reglas al contexto anterior — es aditivo. Con `max-width`, cada breakpoint sobreescribe reglas del contexto mayor — es sustractivo, y genera cascadas más difíciles de mantener.

### Breakpoints del sistema

| Nombre | `min-width` | Uso típico |
|---|---|---|
| base | — | 320px — columna única, layout de flujo |
| `sm` | 640px | Dos columnas, CTAs inline |
| `md` | 768px | Sidebar visible, formularios side-by-side |
| `lg` | 1024px | Tres columnas, layout editorial completo |
| `xl` | 1200px | Max-width del contenedor, ajustes de espaciado |

**Documentar siempre el comportamiento de cada breakpoint** en un comentario HTML cuando el componente tiene cambios de layout:

```html
<!-- RESPONSIVE:
  - base (320px): columna única, imagen arriba del texto
  - sm (640px+): dos columnas, imagen a la izquierda
  - lg (1024px+): tres columnas con sidebar de datos
-->
```

---

## Fluid values con `clamp()`

Para valores que deben escalar de forma continua entre móvil y desktop — sin salto en un breakpoint concreto — usar `clamp()`:

```css
/* font-size fluido entre 32px (mobile) y 52px (desktop) */
font-size: clamp(2rem, 4vw, 3.25rem);

/* spacing fluido */
padding: clamp(1rem, 3vw, 2.5rem);
```

**Anatomía de `clamp(min, preferred, max)`**:
- `min`: valor mínimo — se aplica cuando el viewport es muy estrecho
- `preferred`: valor relativo al viewport (vw) — se escala con el viewport
- `max`: valor máximo — se aplica cuando el viewport es muy ancho

**Cuándo usar `clamp()` y cuándo usar breakpoints**:

| Caso | Solución |
|---|---|
| Tipografía de titulares N1/N2 | `clamp()` — la escala es continua |
| Spacing entre secciones principales | `clamp()` — se beneficia de la fluidez |
| Cambio de layout (1 col → 2 col) | Breakpoint — es un cambio discreto, no gradual |
| Ancho del contenedor | `clamp()` o `min()` |
| Font-size de cuerpo | Breakpoints (o fijo) — la legibilidad óptima es estable en el rango 14px–18px |

---

## Touch — diseño para dedos

Los dispositivos táctiles son el escenario base en mobile-first. Reglas operativas:

### Target size
- Mínimo **44×44px** en el área interactiva (WCAG 2.5.5)
- El área táctil puede ser mayor que el elemento visual mediante `padding`
- Separación mínima entre targets adyacentes: **8px**

```html
<!-- El icono es pequeño, pero el botón tiene padding que amplía el área táctil -->
<button class="atom-btn atom-btn--icon" type="button"
        style="padding: 12px; line-height: 0;">
  <!-- icono 20x20px → área táctil: 44x44px -->
  <svg width="20" height="20" aria-hidden="true">…</svg>
</button>
```

### Hover no es el único estado
En dispositivos táctiles no existe el hover. Cada estado que solo existe en hover debe tener un equivalente accesible:

```scss
// ✗ Solo hover — invisible en táctil
.mol-card-noticia:hover .mol-card-noticia__cta { opacity: 1; }

// ✓ Hover + focus-visible — funciona en ratón y teclado/táctil
.mol-card-noticia:hover .mol-card-noticia__cta,
.mol-card-noticia:focus-within .mol-card-noticia__cta { opacity: 1; }
```

### Gestos (documentar, no asumir)
Si un componente usa gestos táctiles (swipe, long-press, pinch), documentar:
- El gesto y su función
- El equivalente para ratón o teclado
- El comportamiento con `prefers-reduced-motion`

---

## Imágenes en contexto mobile-first

### Rendimiento
- `loading="lazy"` en todas las imágenes excepto la primera visible (LCP — Largest Contentful Paint)
- `width` y `height` siempre declarados para evitar layout shift (CLS)
- `srcset` para proveer versiones de distintos tamaños cuando hay implementación real

### Aspect ratio
Las imágenes deben estar contenidas en wrappers con `aspect-ratio` para que el layout no dependa de la carga de la imagen:

```html
<figure style="aspect-ratio: 16/9; overflow: hidden;">
  <img src="…" alt="…" loading="lazy" width="600" height="338" />
</figure>
```

### Imágenes que deben funcionar sin imagen
Cualquier componente que muestre una imagen debe tener un estado sin imagen definido — con un color de fondo o un placeholder que mantenga el aspect ratio. En mobile-first, las imágenes fallidas o lentas son más frecuentes.

---

## Estado no-JS

Cada componente interactivo debe tener un estado funcional sin JavaScript. Documentarlo siempre en el HTML:

```html
<!-- No-JS: el menú es una lista visible y navegable -->
<!-- JS: colapsa el menú en un toggle con aria-expanded -->
<nav class="mol-menu-principal">
  <ul>
    <li><a href="/economia">Economía</a></li>
    <li><a href="/deportes">Deportes</a></li>
  </ul>
</nav>
```

**Qué significa funcional sin JS**: el usuario puede acceder al contenido y completar las tareas principales. No tiene que ser idéntico — puede ser menos elegante. Pero no puede ser inaccesible.

---

## Checklist mobile-first (transversal)

Aplicable a cualquier output de cualquier mode:

```
Layout
□ Base CSS funciona a 320px sin ninguna media query
□ Solo min-width breakpoints — ningún max-width en components
□ DOM order = prioridad de contenido (N1 primero)
□ Reordenado visual con CSS order, nunca con HTML duplicado

Tipografía
□ Titulares N1/N2 usan clamp() para escala fluida
□ Body font-size fijo o con breakpoints (no clamp)
□ line-height unitless (no px)

Interacción
□ Todos los targets interactivos ≥ 44×44px
□ Ningún estado solo en hover — equivalente en focus-visible
□ Estado no-JS documentado en componentes interactivos

Imágenes
□ loading="lazy" (excepto imagen LCP)
□ width y height declarados
□ Contenedor con aspect-ratio definido
□ Componente funcional sin imagen

Rendimiento
□ No bloquear contenido con JS no crítico
□ Fuentes con font-display: swap o system-ui
```

---

## Fuentes y referencias

| Fuente | Qué aporta |
|---|---|
| Luke Wroblewski — *Mobile First* (2011) | El texto fundacional. Define la estrategia y su justificación. |
| Brad Frost — *Atomic Design* (2016) | Aplica mobile-first a la arquitectura de componentes. |
| Aaron Gustafson — *Adaptive Web Design* (2011) | La referencia definitiva de progressive enhancement. |
| [BrowserStack — Mobile First Design](https://www.browserstack.com/guide/how-to-implement-mobile-first-design) | Proceso paso a paso desde boceto mobile hasta desktop. |
| [Webflow — A guide to mobile-first design](https://webflow.com/blog/mobile-first-design) | Principios prácticos: jerarquía de contenido, responsive layouts, rendimiento. |
| [Kontra Agency — Mobile-first approach](https://kontra.agency/mobile-first-approach-in-web-development/) | Progressive enhancement como filosofía de construcción. |
| [Casper Creative — Mobile-first vs Responsive](https://www.caspercreative.com/mobile-first-responsive-design/) | Distingue correctamente entre la técnica y la estrategia. |
| WCAG 2.1 — 1.3.2 Meaningful Sequence | DOM order debe preservar el sentido del contenido. |
| WCAG 2.1 — 2.5.5 Target Size | Mínimo 44×44px en targets táctiles. |
| [web.dev — Core Web Vitals](https://web.dev/vitals/) | CLS, LCP, FID — métricas de rendimiento directamente relacionadas con mobile-first. |
