# UX — Accesibilidad y WCAG

## Por qué existe este documento

Las reglas de accesibilidad en `ux.md` y los checks de `audit.md` referencian WCAG 2.1/2.2, ARIA y patrones concretos. Este documento explica la lógica detrás de esas referencias — por qué ciertos criterios son obligatorios, qué problema resuelven, y cómo se tradujeron en reglas del sistema.

---

## El problema que la accesibilidad resuelve (más allá del cumplimiento)

La accesibilidad no es una capa adicional que se añade al final. Es una propiedad estructural del diseño. Cuando se diseña accesible desde el principio:

- La jerarquía semántica del HTML es correcta (lo que mejora SEO y mantenibilidad)
- Los estados de los componentes son explícitos (lo que mejora la robustez del sistema)
- El contraste es suficiente (lo que mejora la legibilidad para todos los usuarios, no solo los que tienen baja visión)
- La navegación por teclado funciona (lo que beneficia a usuarios de power-keyboard, no solo a usuarios con discapacidad motriz)

La accesibilidad bien diseñada mejora la UX general. No la degrada.

---

## Los estándares que fundamentan las reglas

### WCAG 2.1 AA — La base obligatoria

WCAG (Web Content Accessibility Guidelines) define cuatro principios: Perceptible, Operable, Comprensible, Robusto (POUR).

Los criterios más frecuentemente violados — y que generan reglas en el sistema:

#### Contraste (1.4.3 / 1.4.11)

**Criterio**: texto normal ≥ 4.5:1, texto grande ≥ 3:1, componentes de UI ≥ 3:1.

**Por qué este ratio**: 4.5:1 garantiza legibilidad para usuarios con visión reducida equivalente a 20/80 (sin corrección). Es el umbral donde la mayoría de personas con baja visión pueden leer sin ayuda.

**Lo que el sistema añade**: la regla no es solo "verificar el contraste del texto". Es "verificar el contraste en cada estado del componente" — incluido el estado deshabilitado, el placeholder, el hint. Estos son los que más frecuentemente fallan.

**Por qué `#6b7280` es el límite en `ux.md`**: ese valor produce exactamente 4.6:1 sobre blanco `#ffffff`. Es el mínimo aceptable para texto de cuerpo normal. Por debajo de ese valor, el texto muted viola WCAG 1.4.3.

#### Uso del color (1.4.1)

**Criterio**: el color no puede ser el único medio para transmitir información.

**Por qué**: aproximadamente el 8% de los hombres y el 0.5% de las mujeres tienen alguna forma de deficiencia en la percepción del color. Un error que solo se indica en rojo es invisible para ellos.

**Regla generada**: cada estado (error, éxito, deshabilitado) requiere al menos dos señales visuales. El sistema exige: cambio de borde + icono + texto, no solo cambio de color.

#### Secuencia significativa (1.3.2)

**Criterio**: el orden de lectura del contenido debe ser correcto sin CSS.

**Regla generada**: DOM order = prioridad de contenido. Esta es la misma regla que genera el principio de progressive enhancement — pero su fundamento en WCAG la hace no negociable, no solo una preferencia técnica.

#### Tamaño de objetivo (2.5.5 en WCAG 2.1, 2.5.8 en WCAG 2.2)

**WCAG 2.1**: mínimo recomendado de 44×44px para targets táctiles.
**WCAG 2.2**: criterio más estricto — mínimo de 24×24px como requisito AA, con 44×44px como recomendación AAA.

**Por qué 44px**: es el estándar de Apple HIG (Human Interface Guidelines) y las Google Material guidelines, basado en el tamaño promedio de la yema del dedo índice (entre 10mm y 14mm). A una densidad de pantalla típica, eso equivale a ~44px en puntos CSS.

**Regla generada**: `min-width: 44px; min-height: 44px` en todos los controles interactivos. No en el elemento visual, sino en el área táctil (que puede ser mayor que el visual mediante padding).

### WCAG 2.2 — Extensiones relevantes

WCAG 2.2 (2023) añade criterios que el sistema incorpora:

**2.4.11 — Focus Appearance**: el indicador de foco debe ser visible con un mínimo de área y contraste. La regla del sistema (`@include focus-ring()`) implementa esto: 2px de outline, 2px de offset, 3:1 de contraste entre el estado enfocado y no enfocado.

**2.5.3 — Label in Name**: el nombre accesible de un componente interactivo debe contener el texto visible. Esto afecta a cómo se escriben los `aria-label` — no pueden ser completamente diferentes del texto visible.

---

## ARIA — Cuándo y por qué

ARIA (Accessible Rich Internet Applications) no es un reemplazo del HTML semántico. Es un complemento para cuando el HTML no tiene un elemento adecuado.

**Regla del sistema**: HTML semántico primero. ARIA solo cuando el HTML es insuficiente.

```html
<!-- Bien: HTML semántico, no necesita ARIA -->
<button type="button">Guardar cambios</button>

<!-- Bien: HTML insuficiente para el patrón, ARIA necesario -->
<div role="dialog" aria-labelledby="modal-title" aria-modal="true">…</div>

<!-- Mal: ARIA innecesario sobre HTML ya semántico -->
<button type="button" role="button">Guardar cambios</button>
```

### Atributos que el sistema hace obligatorios

| Atributo | Cuándo | Por qué |
|---|---|---|
| `aria-expanded` | Toggles, acordeones, dropdowns | El estado abierto/cerrado no es perceptible sin él para lectores de pantalla |
| `aria-hidden="true"` | Iconos decorativos | Evita que el lector de pantalla anuncie nombres de iconos sin contexto |
| `aria-describedby` | Campos con hint o error | Asocia el texto de ayuda al campo — no se confía en la proximidad visual |
| `aria-live` | Contenido que cambia dinámicamente | Sin esto, los cambios de contenido son silenciosos para lectores de pantalla |
| `aria-busy="true"` | Estados de carga | Indica al lector de pantalla que el contenido está siendo actualizado |
| `aria-required="true"` | Campos obligatorios | El `*` visual no es suficiente para tecnología asistiva |

### Patrones de referencia (ARIA APG)

El sistema referencia estos patrones del ARIA Authoring Practices Guide:

- **Dialog (Modal)**: focus trap al abrir, `Escape` para cerrar, restaurar foco al elemento que lo abrió
- **Disclosure (Accordion)**: `aria-expanded` en el trigger, `aria-controls` apuntando al panel
- **Tabs**: `role="tablist"`, `role="tab"`, `role="tabpanel"`, navegación con flechas
- **Combobox**: `role="combobox"`, `aria-autocomplete`, `aria-owns`

Referencia: [w3.org/WAI/ARIA/apg](https://www.w3.org/WAI/ARIA/apg/)

---

## Gestión del foco — el principio más ignorado

El foco es la "posición del cursor" para el usuario que no usa ratón. Tres reglas que el sistema aplica y que se violan frecuentemente:

**1. El foco no desaparece nunca.** Cuando un elemento interactivo desaparece (modal que se cierra, elemento eliminado), el foco debe ir a algún lugar definido. Si el modal se cierra, el foco vuelve al trigger que lo abrió.

**2. El foco no se sale del modal.** Cuando un modal está abierto, el foco no puede alcanzar elementos detrás del modal. El sistema llama a esto "focus trap".

**3. El foco visible es obligatorio.** WCAG 2.4.7 (AA) exige que el foco sea visible. El sistema implementa esto con `@include focus-ring()` y prohíbe `outline: none` sin un reemplazo visible.

---

## Lo que NO recogen las reglas actuales

- **WCAG 2.2 — 3.3.7 (Redundant Entry)**: no pedir al usuario que introduzca la misma información dos veces en el mismo flujo. No hay regla explícita en el sistema.
- **Cognitive accessibility**: WCAG 2.1/2.2 cubre principalmente accesibilidad perceptual y motriz. La accesibilidad cognitiva (para usuarios con dislexia, TDAH, deterioro cognitivo) tiene menos cobertura en el sistema.
- **Testing con tecnología asistiva**: el sistema define reglas, pero no define un protocolo de verificación con lectores de pantalla (NVDA, VoiceOver, JAWS).

---

## Fuentes

- [W3C WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Inclusive Components — Heydon Pickering](https://inclusive-components.design/) — implementaciones ARIA reales con análisis de casos límite
- [WebAIM — Contrast Checker](https://webaim.org/resources/contrastchecker/) — herramienta de referencia para verificar ratios
- Nielsen Norman Group — [Accessibility Articles](https://www.nngroup.com/topic/accessibility/)
