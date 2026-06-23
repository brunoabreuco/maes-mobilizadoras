async function carregarPerfil() {
  try {
    const data = await apiGet('/api/me');
    // Preenche os dados do perfil
    document.getElementById('nome').textContent = data.full_name || 'Usuário';
    document.getElementById('subtitulo').textContent = data.role || 'Participante';
    document.getElementById('numero_eventos_criou').textContent = data.created_events_count || 0;
    document.getElementById('numero_eventos_participou').textContent = data.participated_events_count || 0;

    // Mostra/esconde elementos baseado no role
    const isParticipante = data.role === 'participante';
    const elementosHide = document.querySelectorAll('.participante-hide');
    for (let el of elementosHide) {
      if (isParticipante) {
        el.style.display = 'none';
      } else {
        el.style.display = 'block';
      }
    }
  } catch (err) {
    console.error('Erro ao carregar perfil:', err);
    mostrar_msg_erro('Erro ao carregar perfil', '' + err);
  } finally {
    ocultarLoading();
  }
}

// 🔹 FUNÇÃO PARA OCULTAR LOADING
function ocultarLoading() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
}

// 🔹 FUNÇÃO DE LOGOUT
function logout() {
  if (confirm('Tem certeza que deseja sair?')) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = 'tela-cadastro.html';
  }
}

// 🔹 CONFIGURA OS BOTÕES DA PÁGINA (COM FALLBACK)
function configurarBotoes() {
  // Botão "Enviar Avisos"
  const botaoAvisos = document.getElementById('botao_azul');
  if (botaoAvisos) {
    botaoAvisos.addEventListener('click', function() {
      if (window.ccaeAbrirModal) {
        window.ccaeAbrirModal('criar-aviso', null);
      } else {
        console.warn('Modal ainda não disponível, tentando novamente em 500ms...');
        // Fallback: espera o modal ser carregado
        setTimeout(() => {
          if (window.ccaeAbrirModal) {
            window.ccaeAbrirModal('criar-aviso', null);
          } else {
            mostrar_msg_erro('Erro', 'Modal não disponível. Tente recarregar a página.');
          }
        }, 500);
      }
    });
  }

  // Botão "Adicionar Mobilizadora"
  const botaoMobilizadora = document.getElementById('botao_vermelho');
  if (botaoMobilizadora) {
    botaoMobilizadora.addEventListener('click', function() {
      if (window.ccaeAbrirModal) {
        window.ccaeAbrirModal('adicionar-mobilizadora', null);
      } else {
        console.warn('Modal ainda não disponível, tentando novamente em 500ms...');
        setTimeout(() => {
          if (window.ccaeAbrirModal) {
            window.ccaeAbrirModal('adicionar-mobilizadora', null);
          } else {
            mostrar_msg_erro('Erro', 'Modal não disponível. Tente recarregar a página.');
          }
        }, 500);
      }
    });
  }

  // Botão "Sair"
  const botaoSair = document.getElementById('texto_sair');
  if (botaoSair) {
    botaoSair.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }
}

// Inicialização
document.addEventListener('componentsReady', () => {
  carregarPerfil();
  configurarBotoes();
});