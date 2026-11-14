// Tokens de diseño de Calida (docs/05-diseno-de-pantallas.md §5.2 a §5.4).
//
// En el proyecto real esto irá en frontend/src/index.css, así:
//   @import "tailwindcss";
//   @theme { --color-vino: #661427; ... }
// Vite lo compila una vez. En el prototipo no hay compilación: Tailwind corre
// en el navegador y lee las etiquetas <style type="text/tailwindcss">. Este
// archivo crea esa etiqueta para que las tres páginas compartan los mismos
// tokens desde un solo lugar.
//
// Cada --color-X se vuelve clases de Tailwind: bg-X, text-X, border-X, ring-X...

const TEMA = `
@theme {
  --font-sans: "Poppins", ui-sans-serif, system-ui, sans-serif;

  /* Base: vino del logo (fill de logo3a.svg) y crema del fondo de logo3.webp */
  --color-vino: #661427;
  --color-vino-oscuro: #4A0E1C;
  --color-vino-claro: #F6DDE2;
  --color-crema: #F7F1DF;
  --color-tinta: #2B1B1F;
  --color-tinta-suave: #5C4A4E;
  --color-borde: #8C7B7F;
  --color-divisor: #E6DDD0;

  /* Estados: siempre acompañados de texto o ícono */
  --color-exito: #2E6B3A;
  --color-exito-claro: #E2F0E4;
  --color-aviso: #8A5A00;
  --color-aviso-claro: #FBEFD5;
  --color-error: #B3261E;
  --color-error-claro: #FBE4E2;
  --color-foco: #1E6FD9;

  /* Acentos del collage: SOLO decoración (no pasan contraste como texto) */
  --color-naranja: #DD7734;
  --color-azul: #4FB5FB;
  --color-amarillo: #FFD83B;
  --color-salvia: #879E87;

  /* Tintes claros de los acentos: fondos con texto oscuro (pasan AA) */
  --color-naranja-claro: #FBE3D2;
  --color-azul-claro: #DCEFFD;
  --color-amarillo-claro: #FFF3C4;
  --color-salvia-claro: #E3ECE3;
}

body {
  background-color: var(--color-crema);
  color: var(--color-tinta);
  font-family: var(--font-sans);
  line-height: 1.5;
}

/* Anillo de foco visible para quien navega con teclado (WCAG 2.4.7) */
:focus-visible {
  outline: 3px solid var(--color-foco);
  outline-offset: 2px;
  border-radius: 6px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
`;

const estilo = document.createElement('style');
estilo.setAttribute('type', 'text/tailwindcss');
estilo.textContent = TEMA;
document.head.appendChild(estilo);
