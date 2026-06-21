function configurarFooter() {
    var nav = document.querySelector('.c-footer nav');
    if (!nav) {
        console.warn('Footer nav não encontrado');
        return;
    }

    var mapaIndice = {
        'tela_acoes_comunitarias.html': 0,
        'tela_calendario.html':         1,
        'tela_avisos.html':             2,
        'tela_meu_perfil.html':         3
    };

    var paginaAtual = window.location.pathname.split('/').pop();
    var indice = mapaIndice[paginaAtual];
    if (indice === undefined) {
        console.warn('Página não mapeada:', paginaAtual);
        return;
    }

    var links = nav.querySelectorAll('a');

    links.forEach(function(link, i) {
        link.classList.toggle('nav-active', i === indice);
    });

    var oldPill = nav.querySelector('.nav-pill');
    if (oldPill) oldPill.remove();

    var pill = document.createElement('div');
    pill.className = 'nav-pill';
    pill.setAttribute('aria-hidden', 'true');
    nav.insertAdjacentElement('afterbegin', pill);

    // Usa requestAnimationFrame para garantir que o layout esteja pronto
    requestAnimationFrame(function() {
        var navRect  = nav.getBoundingClientRect();
        var linkRect = links[indice].getBoundingClientRect();

        // Largura do link + 20px de folga (10px de cada lado)
        var larguraPill = linkRect.width + 20;
        var xAtual = linkRect.left - navRect.left - 10; // centraliza

        var xAnterior = parseFloat(sessionStorage.getItem('footer-pill-x'));

        pill.style.width = larguraPill + 'px';
        pill.style.transitionDuration = '0s';
        pill.style.transform = 'translateX(' + (isNaN(xAnterior) ? xAtual : xAnterior) + 'px)';

        // Força o reflow
        void pill.offsetHeight;

        requestAnimationFrame(function() {
            pill.style.transitionDuration = '';
            pill.style.transform = 'translateX(' + xAtual + 'px)';
            sessionStorage.setItem('footer-pill-x', String(xAtual));
        });
    });
}

// Executa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', configurarFooter);

// Opcional: reexecuta se a janela for redimensionada (caso o layout mude)
window.addEventListener('resize', function() {
    // Pequeno delay para evitar chamadas excessivas
    clearTimeout(window._footerResizeTimer);
    window._footerResizeTimer = setTimeout(configurarFooter, 200);
});