// ...existing code...
function titleCase(s) {
  return (s || '').toLowerCase()
    .split(' ')
    .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
    .join(' ');
}

async function loadProfile() {
  if (typeof showLoading === 'function') showLoading();
  try {
    const data = await apiGet('/api/me', undefined);
    if (!data) return;

    const nomeEl = document.getElementById("nome");
    const subtEl = document.getElementById("subtitulo");
    const nCriouEl = document.getElementById("numero_eventos_criou");
    const nPartEl = document.getElementById("numero_eventos_participou");

    if (nomeEl) nomeEl.innerText = data.full_name || '';
    if (subtEl) subtEl.innerText = titleCase(data.role || '');
    if (nCriouEl) nCriouEl.innerText = String(data.created_events_count ?? '');
    if (nPartEl) nPartEl.innerText = String(data.participated_events_count ?? '');

    const botaoAviso = document.getElementById("botao_azul");
    const botaoMobilizadora = document.getElementById("botao_vermelho");

    switch (data.role) {
      case "coordenadora":
        break;
      case "organizadora":
        if (botaoMobilizadora) botaoMobilizadora.style.display = "none";
        break;
      case "participante":
        if (botaoAviso) botaoAviso.style.display = "none";
        if (botaoMobilizadora) botaoMobilizadora.style.display = "none";
        document.querySelectorAll('.participante-hide').forEach(e => { e.style.display = 'none'; });
        break;
    }
  } catch (err) {
    console.error('Erro ao carregar perfil:', err);
  } finally {
    if (typeof hideLoading === 'function') hideLoading();
  }
}

function configurarElementosPerfil() {
  const sair = document.getElementById('texto_sair');
  if (sair) {
    sair.addEventListener('click', (evt) => {
      evt.preventDefault();
      localStorage.clear();
      window.location.reload();
    });
  }

  const botaoAzul = document.getElementById('botao_azul');
  if (botaoAzul) botaoAzul.addEventListener('click', () => ccaeAbrirModal('criar-aviso'));

  const botaoVermelho = document.getElementById('botao_vermelho');
  if (botaoVermelho) botaoVermelho.addEventListener('click', () => ccaeAbrirModal('adicionar-mobilizadora'));
}

// Inicialização: esperar componentsReady (como em script-tela-acoes) para garantir header/footer/componentes no DOM
document.addEventListener('componentsReady', () => {
  configurarElementosPerfil();
  loadProfile();
});

// Fallback: se componentsReady nunca for disparado, garantir inicialização após DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // se componentsReady já ocorreu, handlers já estarão registrados; caso contrário, registra e chama
  if (!window.__componentsReadyFired) {
    // pequena espera para possíveis injeções de componentes síncronas
    setTimeout(() => {
      configurarElementosPerfil();
      loadProfile();
    }, 50);
  }
});
// ...existing code...