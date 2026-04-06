# _agents/knowledge/ — Biblioteca de referencia

## Propósito

Este directorio contiene el razonamiento de diseño detrás de las reglas del sistema.

Los archivos de modo (`_agents/modes/`) definen **cómo se comporta** Claude en cada tarea.
Este directorio explica **por qué** esas reglas existen — las fuentes, principios y teoría que las respaldan.

---

## Cómo usar estos archivos

**No se cargan automáticamente.** Ningún mode lee estos archivos durante la ejecución.

Úsalos cuando:
- Quieras entender el razonamiento detrás de una regla antes de modificarla
- Necesites justificar una decisión de diseño ante el equipo
- Estés evaluando si añadir o cambiar una regla en un mode
- Un principio nuevo del sector necesite evaluarse antes de incorporarse al sistema

---

## Archivos disponibles

| Archivo | Cubre | Modes que aplican sus reglas |
|---|---|---|
| `mobile-first.md` | Estrategia mobile-first, progressive enhancement, breakpoints, touch, checklist transversal | **Todos los modes** |
| `ux-progressive-enhancement.md` | Origen y fundamento de las reglas PE en el sistema — fuentes y principios destilados | SKETCH, UX, UI |
| `ux-accessibility-wcag.md` | WCAG 2.1/2.2, ARIA, gestión de foco, contraste | UX, AUDIT |
| `ui-typography-systems.md` | Escalas tipográficas, line-height, fluid type, font stacks | UI, TOKEN |
| `ui-motion-principles.md` | Física perceptiva del movimiento, duración, easing, reduced-motion | UI |
| `token-color-theory.md` | Teoría del color, OKLCH, 60/30/10, semántica de color, dark mode | TOKEN, THEME, AUDIT |

---

## Cómo añadir conocimiento nuevo

1. Identifica de qué tipo es el conocimiento (UX, UI, token, editorial)
2. Crea un archivo con el formato `[dominio]-[tema].md`
3. Estructura: contexto → principios destilados → reglas que genera → fuentes
4. Actualiza esta tabla
5. Si el conocimiento genera una regla nueva en un mode → edita el mode, no solo este archivo

**Regla**: si el conocimiento ya está expresado como regla en un mode, no lo dupliques aquí. Este directorio explica el origen de las reglas, no las repite.
