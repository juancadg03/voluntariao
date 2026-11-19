(() => {
  const figura = document.querySelector('.caja-scroll');
  const escritorio = matchMedia('(min-width: 1360px)');
  const movimientoReducido = matchMedia('(prefers-reduced-motion: reduce)');
  let cuadro = null;

  function actualizarPose() {
    cuadro = null;
    const pagina = document.scrollingElement;
    const recorrido = pagina.scrollHeight - pagina.clientHeight;
    const progreso = escritorio.matches && !movimientoReducido.matches && recorrido > 0
      ? Math.max(0, Math.min(1, pagina.scrollTop / recorrido))
      : 0;
    const pose = String(Math.min(4, Math.floor(progreso * 4) + 1));

    if (figura.dataset.pose !== pose) figura.dataset.pose = pose;
  }

  function programar() {
    if (cuadro === null) cuadro = requestAnimationFrame(actualizarPose);
  }

  window.addEventListener('scroll', programar, { passive: true });
  window.addEventListener('resize', programar);
  movimientoReducido.addEventListener('change', programar);
  new ResizeObserver(programar).observe(document.body);
  programar();
})();
