(function(){
  const MIN_VISIBLE_MS = 500;

  const wrapper = document.createElement('div');
  wrapper.id = 'global-loading';
  Object.assign(wrapper.style, {
    display: 'none',
    boxSizing: 'border-box',
    width: '100%',
    flexDirection: 'column',
    gap: '20px',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '10',
    color: '#00636A',
  });

  wrapper.innerHTML = ''
    + '<div class="loader">'
    + '  <div class="loader__bar"></div>'
    + '  <div class="loader__bar"></div>'
    + '  <div class="loader__bar"></div>'
    + '  <div class="loader__bar"></div>'
    + '  <div class="loader__bar"></div>'
    + '  <div class="loader__ball"></div>'
    + '</div>'
    + '<div class="text"><span>Carregando.</span><br><span>Por favor aguarde<span class="dots"></span></span></div>';

  document.body.appendChild(wrapper);

  let shownAt = 0;
  let hideTimeout = null;
  let isVisible = false;

 window.showLoading = function() {
  if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null; }
  if (isVisible) return;
  placeBetweenHeaderFooter(); // ← reposiciona antes de mostrar
  shownAt = Date.now();
  wrapper.style.display = 'flex';
  isVisible = true;
};

  window.hideLoading = function() {
    if (!isVisible) return;
    const elapsed = Date.now() - shownAt;
    const remaining = MIN_VISIBLE_MS - elapsed;
    const doHide = () => {
      wrapper.style.display = 'none';
      isVisible = false;
      hideTimeout = null;
    };
    if (remaining > 0) {
      hideTimeout = setTimeout(doHide, remaining);
    } else {
      doHide();
    }
  };

  function placeBetweenHeaderFooter() {
    const header = document.getElementById('header');
    const footer = document.getElementById('footer');

    if (header && header.parentNode) {
      if (wrapper !== header.nextSibling) {
        header.parentNode.insertBefore(wrapper, header.nextSibling);
      }
    } else if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(wrapper, footer);
    } else {
      if (!wrapper.parentNode) document.body.insertBefore(wrapper, document.body.firstChild);
    }

    adjustHeightBetweenHeaderFooter();
  }

  function adjustHeightBetweenHeaderFooter() {
    const header = document.getElementById('header');
    const footer = document.getElementById('footer');
    const headerH = header ? header.getBoundingClientRect().height : 0;
    const footerH = footer ? footer.getBoundingClientRect().height : 0;
    const available = Math.max(0, window.innerHeight - headerH - footerH);
    wrapper.style.minHeight = available + 'px';
    wrapper.style.padding = '24px 12px';
  }

  // *** CORREÇÃO PRINCIPAL: mostra o loading imediatamente ***
  showLoading();

  // Injeta o CSS
  const cssHref = './css/loading.css';
  if (!document.querySelector(`link[href="${cssHref}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssHref;
    document.head.appendChild(link);
  }

  function whenReadyPlace() {
    placeBetweenHeaderFooter();
    setTimeout(adjustHeightBetweenHeaderFooter, 50);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    whenReadyPlace();
  } else {
    document.addEventListener('DOMContentLoaded', whenReadyPlace, { once: true });
  }

  window.addEventListener('componentsReady', whenReadyPlace);
  setTimeout(whenReadyPlace, 400);
  setTimeout(whenReadyPlace, 1200);
  window.addEventListener('resize', adjustHeightBetweenHeaderFooter);

})();